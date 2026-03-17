package net.atos.entng.actualites.cron;

import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.actualites.services.UserPreferenceService;
import net.atos.entng.actualites.utils.UserUtils;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Removes preferences for users who are no longer super-ADML.
 * Threshold defined in UserUtils#SUPER_ADML_THRESHOLD.
 */
public class SuperAdmlPreferencesCleanupCron implements Handler<Long> {

    private static final Logger log = LoggerFactory.getLogger(SuperAdmlPreferencesCleanupCron.class);

    private final UserPreferenceService userPreferenceService;

    public SuperAdmlPreferencesCleanupCron(UserPreferenceService userPreferenceService) {
        this.userPreferenceService = userPreferenceService;
    }

    @Override
    public void handle(Long event) {
        log.info("[Actualites@SuperAdmlPreferencesCleanupCron] Starting super-ADML preferences cleanup");

        userPreferenceService.getUsersWithPreferences()
            .compose(userIds -> {
                if (userIds.isEmpty()) {
                    log.info("[Actualites@SuperAdmlPreferencesCleanupCron] No users with preferences, skipping");
                    return Future.succeededFuture(Collections.emptyList());
                }
                log.info("[Actualites@SuperAdmlPreferencesCleanupCron] Checking " + userIds.size() + " users");
                return findUsersToClean(userIds);
            })
            .compose(toClean -> {
                if (toClean.isEmpty()) {
                    log.info("[Actualites@SuperAdmlPreferencesCleanupCron] All users with preferences are still super-ADML");
                    return Future.succeededFuture();
                }
                log.info("[Actualites@SuperAdmlPreferencesCleanupCron] Removing preferences for " + toClean.size() + " user(s)");
                return userPreferenceService.deletePreferencesForUsers(toClean);
            })
            .onSuccess(v -> log.info("[Actualites@SuperAdmlPreferencesCleanupCron] Cleanup completed successfully"))
            .onFailure(err -> log.error("[Actualites@SuperAdmlPreferencesCleanupCron] Cleanup failed: " + err.getMessage(), err));
    }

    /**
     * Returns the subset of userIds that should have their preferences deleted.
     * Strategy: ask Neo4j which users ARE still super-ADML, then return the difference.
     * This also covers deleted users (absent from Neo4j) whose preferences should be cleaned up.
     */
    private Future<List<String>> findUsersToClean(List<String> userIds) {
        Promise<List<String>> promise = Promise.promise();

        String query =
            "MATCH (u:User) WHERE u.id IN {userIds} " +
            "OPTIONAL MATCH (u)-[:IN]->(:FunctionGroup {filter:'AdminLocal'})-[:DEPENDS]->(s:Structure) " +
            "WITH u, count(s) AS admlCount " +
            "WHERE admlCount >= {minStructures} " +
            "RETURN u.id AS id";

        JsonObject params = new JsonObject()
            .put("userIds", new JsonArray(userIds))
            .put("minStructures", UserUtils.SUPER_ADML_THRESHOLD);

        Neo4j.getInstance().execute(query, params, Neo4jResult.validResultHandler(result -> {
            if (result.isRight()) {
                Set<String> stillSuperAdml = result.right().getValue()
                    .stream()
                    .filter(o -> o instanceof JsonObject)
                    .map(JsonObject.class::cast)
                    .map(row -> row.getString("id"))
                    .filter(id -> id != null && !id.isEmpty())
                    .collect(Collectors.toCollection(HashSet::new));

                List<String> toClean = userIds.stream()
                    .filter(id -> !stillSuperAdml.contains(id))
                    .collect(Collectors.toList());

                promise.complete(toClean);
            } else {
                promise.fail(result.left().getValue());
            }
        }));

        return promise.future();
    }
}
