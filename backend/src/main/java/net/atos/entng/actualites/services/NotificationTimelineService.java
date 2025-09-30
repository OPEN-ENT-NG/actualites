package net.atos.entng.actualites.services;

import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.user.UserInfos;

public interface NotificationTimelineService {

    /**
     * Notify timeline on info event, assume that the owner is the user connected
     *
     * @param request
     * @param user
     * @param threadId
     * @param infoId
     * @param title
     * @param eventType
     */
    void notifyTimeline(final HttpServerRequest request, final UserInfos user, final String threadId, final String infoId, final String title,
                        final String eventType, final String pathPrefix);


    /**
     * Notify timeline on info event
     *
     * @param request
     * @param user
     * @param owner
     * @param threadId
     * @param infoId
     * @param title
     * @param eventType
     */
    void notifyTimeline(final HttpServerRequest request, final UserInfos user, final UserInfos owner, final String threadId,
                        final String infoId, final String title, final String eventType,
                        final String pathPrefix);
}
