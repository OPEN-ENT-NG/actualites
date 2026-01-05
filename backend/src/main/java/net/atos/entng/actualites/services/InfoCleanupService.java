package net.atos.entng.actualites.services;

import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;

/**
 * Service for cleaning up old news based on publication date
 */
public interface InfoCleanupService {

    /**
     * Delete news published more than X months ago, processing in batches
     * This will also cascade delete all related comments...
     *
     * @param monthsAfterPublication Number of months after publication date
     * @param batchSize Number of news to delete per batch
     * @param handler Handler with result containing status and number of deleted news
     */
    void deleteOldNews(int monthsAfterPublication, int batchSize, Handler<JsonObject> handler);
}
