package net.atos.entng.actualites.services.impl;

import com.google.common.collect.Lists;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.Server;
import io.vertx.core.*;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.services.InfoService;
import net.atos.entng.actualites.services.NotificationTimelineService;
import net.atos.entng.actualites.services.ThreadService;
import org.entcore.common.notification.NotificationUtils;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

import static net.atos.entng.actualites.controllers.InfoController.*;

public class NotificationTimelineServiceImpl implements NotificationTimelineService {

    private final TimelineHelper notification;
    private final InfoService infoService;
    private final ThreadService threadService;
    private final EventBus eventBus;
    private final String pathPrefix;

    public NotificationTimelineServiceImpl(InfoService infoService, ThreadService threadService, Vertx vertx,
                                           EventBus eb, JsonObject config) {
        this.infoService = infoService;
        this.threadService = threadService;
        this.notification = new TimelineHelper(vertx, eb, config);
        this.eventBus = eb;
        this.pathPrefix = Server.getPathPrefix(config);

    }


    @Override
    public void notifyTimeline(HttpServerRequest request, UserInfos user, String threadId, String infoId, String title,
                               String eventType) {
        // the news owner is behind the action
        UserInfos owner = user;
        notifyTimeline(request, user, owner, threadId, infoId, title, eventType, false);
    }

    @Override
    public void notifyTimeline(HttpServerRequest request, UserInfos user, UserInfos owner, String threadId, String infoId,
                               String title, String eventType, boolean ignoreFlood) {
        if (eventType.equals(NEWS_SUBMIT_EVENT_TYPE)) {
            threadService.getPublishSharedWithIds(threadId, true, user, event -> {
                if (event.isRight()) {
                    // get all ids
                    JsonArray shared = event.right().getValue();
                    extractUserIds(request, shared, user, owner, threadId, infoId, title, "news.news-submitted", ignoreFlood);
                }
            });
        } else if(eventType.equals(NEWS_UNSUBMIT_EVENT_TYPE)){
            threadService.getPublishSharedWithIds(threadId, true, user, event -> {
                if (event.isRight()) {
                    // get all ids
                    JsonArray shared = event.right().getValue();
                    extractUserIds(request, shared, user, owner, threadId, infoId, title, "news.news-unsubmitted", ignoreFlood);
                }
            });
        } else if(eventType.equals(NEWS_PUBLISH_EVENT_TYPE)){
            infoService.getSharedWithIds(infoId, true, event -> {
                if (event.isRight()) {
                    // get all ids
                    JsonArray shared = event.right().getValue();
                    extractUserIds(request, shared, user, owner, threadId, infoId, title, "news.news-published", ignoreFlood);
                }
            });
        } else if(eventType.equals(NEWS_UNPUBLISH_EVENT_TYPE)){
            infoService.getSharedWithIds(infoId, true, event -> {
                if (event.isRight()) {
                    // get all ids
                    JsonArray shared = event.right().getValue();
                    extractUserIds(request, shared, user, owner, threadId, infoId, title, "news.news-unpublished", ignoreFlood);
                }
            });
        } else if (eventType.equals(NEWS_UPDATE_EVENT_TYPE)) {
            ArrayList<String> ids = new ArrayList<>();
            ids.add(owner.getUserId());
            sendNotify(request, ids, user, threadId, infoId, title, "news.news-update", ignoreFlood);
        }
    }



    private void extractUserIds(final HttpServerRequest request, final JsonArray shared, final UserInfos user, final UserInfos owner,
                                final String threadId, final String infoId, final String title, final String notificationName,
                                final boolean ignoreFlood){
        final Set<String> ids = new HashSet<>();
        if (!shared.isEmpty()) {
            List<Future<?>> futures = new ArrayList<>();
            for(int i=0; i<shared.size(); i++){
                JsonObject jo = shared.getJsonObject(i);
                if(jo.containsKey("userId")){
                    String id = jo.getString("userId");
                    if(!(user.getUserId().equals(id)) && !(owner.getUserId().equals(id))){
                        ids.add(id);
                    }
                } else {
                    if(jo.containsKey("groupId")){
                        String groupId = jo.getString("groupId");
                        if (groupId != null) {
                            Promise<?> promise = Promise.promise();
                            UserUtils.findUsersInProfilsGroups(groupId, eventBus, user.getUserId(), false, event -> {
                                if (event != null) {
                                    for (Object o : event) {
                                        if (!(o instanceof JsonObject)) continue;
                                        String userId = ((JsonObject) o).getString("id");
                                        if(!(user.getUserId().equals(userId)) && !(owner.getUserId().equals(userId))){
                                            ids.add(userId);
                                        }
                                    }
                                }
                                promise.complete();
                            });
                            futures.add(promise.future());
                        }
                    }
                }
            }
            //synchronous (no group in shared)
            if (futures.isEmpty()) {
                sendNotify(request, Lists.newArrayList(ids), owner, threadId, infoId, title, notificationName, ignoreFlood);
            } else {
                Future.any(futures).onComplete(h ->
                        sendNotify(request, Lists.newArrayList(ids), owner, threadId, infoId, title, notificationName, ignoreFlood)
                        );
            }
        }
    }

    private void sendNotify(final HttpServerRequest request, final List<String> ids, final UserInfos owner,
                            final String threadId, final String infoId, final String title, final String notificationName, final boolean ignoreFlood){
        if (infoId != null && !infoId.isEmpty() && threadId != null && !threadId.isEmpty() && owner != null) {
            JsonObject params = new JsonObject()
                    .put("profilUri", "/userbook/annuaire#" + owner.getUserId() + "#" + (owner.getType() != null ? owner.getType() : ""))
                    .put("username", owner.getUsername())
                    .put("info", title)
                    .put("disableAntiFlood", ignoreFlood)
                    .put("resourceUri", pathPrefix + "#/view/thread/" + threadId + "/info/" + infoId);
            if("news.news-published".equals(notificationName)) {
                params.put("pushNotif", new JsonObject().put("title", "push.notif.actu.info.published").put("body", owner.getUsername()+ " : "+ title));
                infoService.retrieve(infoId, false, actu -> {
                    JsonObject preview = null;
                    if (actu.isRight()) {
                        preview = NotificationUtils.htmlContentToPreview(
                                actu.right().getValue().getString("content"));
                    }
                    notification.notifyTimeline(request, notificationName, owner, ids, infoId,
                            null, params, false, preview);
                });
            } else {
                notification.notifyTimeline(request, notificationName, owner, ids, infoId, params);
            }
        }
    }
}
