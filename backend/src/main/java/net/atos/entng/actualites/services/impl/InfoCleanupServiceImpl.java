package net.atos.entng.actualites.services.impl;

import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.services.InfoCleanupService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;

/**
 * Implementation of InfoCleanupService
 * Deletes news and their related comments based on publication date or modified date if publication date is not set.
 */
public class InfoCleanupServiceImpl implements InfoCleanupService {

    private static final Logger log = LoggerFactory.getLogger(InfoCleanupServiceImpl.class);
    private final Sql sql;

    public InfoCleanupServiceImpl() {
        this.sql = Sql.getInstance();
    }

    @Override
    public void deleteOldNews(int monthsAfterPublication, int batchSize, Handler<JsonObject> handler) {
        deleteBatch(monthsAfterPublication, batchSize, 0, handler);
    }

    private void deleteBatch(int monthsAfterPublication, int batchSize, int totalDeleted, Handler<JsonObject> handler) {
        // Query to delete news published more than X months ago in batches
        // Uses publication_date if available, otherwise falls back to modified date
        // Comments, shares and revisions will be automatically deleted due to ON DELETE CASCADE constraint
        String query = "DELETE FROM " + Actualites.NEWS_SCHEMA + "." + Actualites.INFO_TABLE +
                       " WHERE id IN (" +
                       "  SELECT id FROM " + Actualites.NEWS_SCHEMA + "." + Actualites.INFO_TABLE +
                       "  WHERE COALESCE(publication_date, modified) < (NOW() - INTERVAL '" + monthsAfterPublication + " months')" +
                       "  LIMIT " + batchSize +
                       ")";

        sql.raw(query, SqlResult.validUniqueResultHandler(event -> {
            if (event.isRight()) {
                int batchDeleted = event.right().getValue().getInteger("rows", 0);
                int newTotal = totalDeleted + batchDeleted;

                if (batchDeleted > 0 && batchDeleted == batchSize) {
                    log.info("[Actualites@InfoCleanupService::deleteOldNews] Batch completed: " + batchDeleted + " news deleted (total so far: " + newTotal + ")");
                    deleteBatch(monthsAfterPublication, batchSize, newTotal, handler);
                } else {
                    JsonObject result = new JsonObject()
                        .put("status", "ok")
                        .put("deleted", newTotal);
                    if (newTotal > 0) {
                        log.info("[Actualites@InfoCleanupService::deleteOldNews] Cleanup completed: TOTAL " + newTotal + " news deleted (comments, shares and revisions cascade deleted)");
                    } else {
                        log.info("[Actualites@InfoCleanupService::deleteOldNews] Cleanup completed: No news to delete (already up to date)");
                    }
                    handler.handle(result);
                }
            } else {
                JsonObject result = new JsonObject()
                    .put("status", "error")
                    .put("message", event.left().getValue())
                    .put("deleted", totalDeleted);
                log.error("[Actualites@InfoCleanupService::deleteOldNews] Failed to delete batch after " + totalDeleted + " deletions: " + event.left().getValue());
                handler.handle(result);
            }
        }));
    }
}
