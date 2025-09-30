package net.atos.entng.actualites.services;

import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.user.UserInfos;

public interface NotificationTimelineService {

    /**
     * Notify timeline on info event, assume that the owner is the user connected
     *
     * @param request http request
     * @param user userInfo of the user that create / modify a resource, will be considered as the owner
     * @param threadId id of the thread
     * @param infoId id of the info
     * @param title title of the info
     * @param eventType type of event to select the right notification
     * @param pathPrefix root of the actualites application for timeline link
     */
    void notifyTimeline(final HttpServerRequest request, final UserInfos user, final String threadId, final String infoId, final String title,
                        final String eventType, final String pathPrefix);


    /**
     * Notify timeline on info event
     *
     * @param request http request
     * @param user userInfo of the user that create / modify a resource
     * @param owner the userInfo of the owner of the resource
     * @param threadId id of the thread
     * @param infoId id of the info
     * @param title title of the info
     * @param eventType type of event to select the right notification
     * @param pathPrefix root of the actualites application for timeline link
     */
    void notifyTimeline(final HttpServerRequest request, final UserInfos user, final UserInfos owner, final String threadId,
                        final String infoId, final String title, final String eventType,
                        final String pathPrefix);
}
