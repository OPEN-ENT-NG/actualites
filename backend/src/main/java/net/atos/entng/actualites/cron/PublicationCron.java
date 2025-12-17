package net.atos.entng.actualites.cron;


import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.services.NotificationTimelineService;
import org.entcore.common.http.request.JsonHttpServerRequest;
import org.entcore.common.sql.Sql;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import static net.atos.entng.actualites.controllers.v1.InfosControllerV1.NEWS_PUBLISH_EVENT_TYPE;
import static org.entcore.common.sql.SqlResult.*;

public class PublicationCron implements Handler<Long> {

    private static final Logger LOGGER = Logger.getLogger(PublicationCron.class.getSimpleName());
    private final NotificationTimelineService notificationTimelineService;

    public PublicationCron(NotificationTimelineService notificationTimelineService) {
        this.notificationTimelineService = notificationTimelineService;
    }

    @Override
    public void handle(Long event) {
        LOGGER.info("[publication-cron] start publishing news");
        Sql.getInstance().prepared(
                "SELECT id, publisher_id, owner, thread_id, title FROM actualites.info as i " +
                      " WHERE i.published = false AND i.status = 3 AND " +
                      " (i.publication_date IS NOT NULL AND i.publication_date <  now() at time zone 'utc') ", new JsonArray(), validResultHandler( this::publishNews));
    }

    private void publishNews(Either<String, JsonArray> result) {
        if (result.isLeft()) {
           LOGGER.severe("[publication-cron] publishing news failed");
           return;
        }
        // Add header for tip tap transformer event push in case of mail publication. Without header we can have exception
        // Several bug with this problem was identified in the past
        JsonObject defaultRequest = new JsonObject()
                .put("method", "POST")
                .put("headers", new JsonObject().put("X-Forwarded-For", "127.0.0.1"));
        HttpServerRequest request = new JsonHttpServerRequest(defaultRequest);
        JsonArray rows = result.right().getValue();
        int rowsCount = rows.size();
        int actualRowCount = 0;

        List<Long> publishIds = new ArrayList<>();
        while (actualRowCount < rowsCount) {
            for (; actualRowCount < actualRowCount + 1000 && actualRowCount < rowsCount; actualRowCount++) {
                JsonObject row = rows.getJsonObject(actualRowCount);

                UserInfos owner = new UserInfos();
                owner.setUserId(row.getString("owner"));
                UserInfos user = new UserInfos();
                user.setUserId(row.getString("publisher_id"));

                notificationTimelineService.notifyTimeline(request, user, owner, row.getString("thread_id"),
                        row.getString("id"), row.getString("title"), NEWS_PUBLISH_EVENT_TYPE, true);
                publishIds.add(row.getLong("id"));
            }

            if (!publishIds.isEmpty()) {
               Sql.getInstance().prepared("UPDATE actualites.info SET published = true WHERE published = false AND id IN " + Sql.listPrepared(publishIds),
                       new JsonArray(publishIds),
                       h -> {
                            if(result.isLeft()) {
                                LOGGER.severe("[publication-cron] update published news failed " + result.left().getValue());
                            }
                       });
            }
            publishIds.clear();
        }
        LOGGER.info("[publication-cron] end publishing news : " + actualRowCount + " news published");
    }

}
