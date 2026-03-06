package net.atos.entng.actualites.services.impl;

import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.services.ThreadService;
import net.atos.entng.actualites.services.UserPreferenceService;
import net.atos.entng.actualites.to.Preferences;
import net.atos.entng.actualites.to.ThreadInclude;
import net.atos.entng.actualites.to.ThreadPreference;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static fr.wseduc.webutils.Utils.isNotEmpty;
import static net.atos.entng.actualites.Actualites.NEWS_SCHEMA;

public class UserPreferenceServiceImpl implements UserPreferenceService {

    private static final String PREFERENCE_TABLE = "actualites.thread_user_preferences";
    private final ThreadService threadService;

    public UserPreferenceServiceImpl(ThreadService threadService) {
        this.threadService = threadService;
    }

    @Override
    public void updateUserPreference(Preferences preferences, UserInfos user, Map<String, SecuredAction> securedActions,
                                     Handler<Either<String, Void>> handler) {
        //filter thread visible by the user
        threadService.list(securedActions, user, ThreadInclude.ALL)
                .onSuccess(threads -> {
                    SqlStatementsBuilder stbuilder = new SqlStatementsBuilder();

                    String userQuery = "SELECT " + NEWS_SCHEMA + ".merge_users(?,?)";
                    stbuilder.prepared(userQuery, new JsonArray().add(user.getUserId()).add(user.getUsername()));

                    StringBuilder builder = new StringBuilder();
                    builder.append(" INSERT INTO " + PREFERENCE_TABLE + " (user_id, thread_id, visible) VALUES ");
                    JsonArray params = new JsonArray();

                    boolean containThread = false;

                    for (ThreadPreference preference : preferences.getThreads()) {
                        if(threads.stream().anyMatch(t -> t.getId() == preference.getThreadId())) {
                            containThread = true;
                            builder.append(" ( ?, ?, ? ),");
                            params.add(user.getUserId()).add(preference.getThreadId()).add(preference.isVisible());
                        }
                    }
                    if(!containThread) {
                        handler.handle(new Either.Right<>(null));
                        return;
                    }
                    builder.deleteCharAt(builder.length() - 1);
                    builder.append(" ON CONFLICT (user_id, thread_id) DO UPDATE SET visible = EXCLUDED.visible ");

                    stbuilder.prepared(builder.toString(), params);

                    Sql.getInstance().transaction(stbuilder.build(), result -> {
                        if ("ok".equals(result.body().getString("status"))) {
                            handler.handle(new Either.Right<>(null));
                        } else {
                            handler.handle(new Either.Left<>(result.body().getString("message")));
                        }
                    });
                })
                .onFailure(throwable -> {
                    handler.handle(new Either.Left<>(throwable.getMessage()));
                });
    }

    @Override
    public Future<Boolean> hasThreadPreference(UserInfos userInfo) {
        Promise<Boolean> promise = Promise.promise();
        Sql.getInstance().prepared("SELECT count(*) as count FROM " + PREFERENCE_TABLE + " WHERE user_id = ?", new JsonArray().add(userInfo.getUserId()), result -> {
            if ("ok".equals(result.body().getString("status"))) {
                promise.complete(result.body().getJsonArray("results").getJsonArray(0).getLong(0) > 0 );
            } else {
                promise.fail(result.body().getString("message"));
            }
        });
        return promise.future();
    }

    @Override
    public Future<List<String>> removeUsersNotSeeingThread(final String threadId, List<String> ids) {
        Promise<List<String>> promise = Promise.promise();
        // Look for users who do not want to see this thread
        Sql.getInstance().prepared(
            "SELECT user_id FROM " + PREFERENCE_TABLE + " WHERE thread_id = ? AND visible IS NOT TRUE",
            new JsonArray().add(threadId), 
            result -> {
                if ("ok".equals(result.body().getString("status"))) {
                    final List<String> unwantedIds = result.body().getJsonArray("results")
                        .stream()
                        .filter(o -> o instanceof JsonObject)
                        .map(JsonObject.class::cast)
                        .map( row -> row.getString("user_id"))
                        .filter(id->isNotEmpty(id))
                        .collect(Collectors.toList());

                    promise.complete( ids.stream().filter(id -> !unwantedIds.contains(id)).collect(Collectors.toList()) );
                } else {
                    promise.fail(result.body().getString("message"));
                }
            }
        );
        return promise.future();
    }
}
