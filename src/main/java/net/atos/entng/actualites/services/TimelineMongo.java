package net.atos.entng.actualites.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

public interface TimelineMongo {
    /**
     * Get notification in timeline
     * @param threadId thread id
     * @param infoId info id
     */
    public Future<JsonObject> getNotification(String threadId, String infoId);

    /**
     * Delete notification in timeline
     * @param notification notification to delete
     */
    public Future<JsonObject> deleteNotification(JsonObject notification);
}
