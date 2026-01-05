package net.atos.entng.actualites.cron;

import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.actualites.services.InfoCleanupService;

/**
 * Cron task to clean up old news based on publication date
 * Deletes news published more than X months ago (default: 24 months)
 * Also deletes related comments through CASCADE constraint
 */
public class ExpiredNewsCleanupCron implements Handler<Long> {

    private static final Logger log = LoggerFactory.getLogger(ExpiredNewsCleanupCron.class);
    private static final int DEFAULT_MONTHS_THRESHOLD = 24;
    private static final int DEFAULT_BATCH_SIZE = 100;

    private final InfoCleanupService cleanupService;
    private final int monthsThreshold;
    private final int batchSize;

    public ExpiredNewsCleanupCron(InfoCleanupService cleanupService, JsonObject config) {
        this.cleanupService = cleanupService;

        int configuredThreshold = config.getInteger("newsCleanupMonthsThreshold", DEFAULT_MONTHS_THRESHOLD);
        if (configuredThreshold < DEFAULT_MONTHS_THRESHOLD) {
            log.warn("[Actualites@ExpiredNewsCleanupCron] Configured threshold (" + configuredThreshold + " months) is below minimum (" + DEFAULT_MONTHS_THRESHOLD + " months). Using minimum value.");
        }
        this.monthsThreshold = Math.max(configuredThreshold, DEFAULT_MONTHS_THRESHOLD);
        this.batchSize = config.getInteger("newsCleanupBatchSize", DEFAULT_BATCH_SIZE);
    }

    @Override
    public void handle(Long event) {
        log.info("[Actualites@ExpiredNewsCleanupCron::handle] Starting news cleanup task (threshold: " + monthsThreshold + " months, batch size: " + batchSize + ")");

        cleanupService.deleteOldNews(monthsThreshold, batchSize, result -> {
            if ("ok".equals(result.getString("status"))) {
                log.info("[Actualites@ExpiredNewsCleanupCron::handle] Cleanup completed successfully: " + result.getInteger("deleted", 0) + " news deleted (published more than " + monthsThreshold + " months ago)");
            } else {
                log.error("[Actualites@ExpiredNewsCleanupCron::handle] Cleanup failed: " + result.getString("message", "Unknown error"));
            }
        });
    }
}
