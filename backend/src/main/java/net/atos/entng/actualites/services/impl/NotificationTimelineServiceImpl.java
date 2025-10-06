package net.atos.entng.actualites.services.impl;

import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.Server;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
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
import java.util.List;
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
        notifyTimeline(request, user, owner, threadId, infoId, title, eventType);
    }

    @Override
    public void notifyTimeline(HttpServerRequest request, UserInfos user, UserInfos owner, String threadId, String infoId,
                               String title, String eventType) {
        if (eventType.equals(NEWS_SUBMIT_EVENT_TYPE)) {
            threadService.getPublishSharedWithIds(threadId, event -> {
                if (event.isRight()) {
                    // get all ids
                    JsonArray shared = event.right().getValue();
                    extractUserIds(request, shared, user, owner, threadId, infoId, title, "news.news-submitted");
                }
            });
        } else if(eventType.equals(NEWS_UNSUBMIT_EVENT_TYPE)){
            threadService.getPublishSharedWithIds(threadId, event -> {
                if (event.isRight()) {
                    // get all ids
                    JsonArray shared = event.right().getValue();
                    extractUserIds(request, shared, user, owner, threadId, infoId, title, "news.news-unsubmitted");
                }
            });
        } else if(eventType.equals(NEWS_PUBLISH_EVENT_TYPE)){
            infoService.getSharedWithIds(infoId, event -> {
                if (event.isRight()) {
                    // get all ids
                    JsonArray shared = event.right().getValue();
                    extractUserIds(request, shared, user, owner, threadId, infoId, title, "news.news-published");
                }
            });
        } else if(eventType.equals(NEWS_UNPUBLISH_EVENT_TYPE)){
            infoService.getSharedWithIds(infoId, event -> {
                if (event.isRight()) {
                    // get all ids
                    JsonArray shared = event.right().getValue();
                    extractUserIds(request, shared, user, owner, threadId, infoId, title, "news.news-unpublished");
                }
            });
        } else if (eventType.equals(NEWS_UPDATE_EVENT_TYPE)) {
            ArrayList<String> ids = new ArrayList<>();
            ids.add(owner.getUserId());
            sendNotify(request, ids, user, threadId, infoId, title, "news.news-update");
        }
    }



    private void extractUserIds(final HttpServerRequest request, final JsonArray shared, final UserInfos user, final UserInfos owner,
                                final String threadId, final String infoId, final String title, final String notificationName){
        final List<String> ids = new ArrayList<String>();
        if (shared.size() > 0) {
            JsonObject jo = null;
            String groupId = null;
            String id = null;
            final AtomicInteger remaining = new AtomicInteger(shared.size());
            // Extract shared with
            for(int i=0; i<shared.size(); i++){
                jo = shared.getJsonObject(i);
                if(jo.containsKey("userId")){
                    id = jo.getString("userId");
                    if(!ids.contains(id) && !(user.getUserId().equals(id)) && !(owner.getUserId().equals(id))){
                        ids.add(id);
                    }
                    remaining.getAndDecrement();
                }
                else{
                    if(jo.containsKey("groupId")){
                        groupId = jo.getString("groupId");
                        if (groupId != null) {
                            UserUtils.findUsersInProfilsGroups(groupId, eventBus, user.getUserId(), false, new Handler<JsonArray>() {
                                @Override
                                public void handle(JsonArray event) {
                                    if (event != null) {
                                        String userId = null;
                                        for (Object o : event) {
                                            if (!(o instanceof JsonObject)) continue;
                                            userId = ((JsonObject) o).getString("id");
                                            if(!ids.contains(userId) && !(user.getUserId().equals(userId)) && !(owner.getUserId().equals(userId))){
                                                ids.add(userId);
                                            }
                                        }
                                    }
                                    if (remaining.decrementAndGet() < 1) {
                                        sendNotify(request, ids, owner, threadId, infoId, title, notificationName);
                                    }
                                }
                            });
                        }
                    }
                }
            }
            if (remaining.get() < 1) {
                sendNotify(request, ids, owner, threadId, infoId, title, notificationName);
            }
        }
    }

    private void sendNotify(final HttpServerRequest request, final List<String> ids, final UserInfos owner, final String threadId,
                            final String infoId, final String title, final String notificationName ){
        if (infoId != null && !infoId.isEmpty() && threadId != null && !threadId.isEmpty() && owner != null) {
            JsonObject params = new JsonObject()
                    .put("profilUri", "/userbook/annuaire#" + owner.getUserId() + "#" + (owner.getType() != null ? owner.getType() : ""))
                    .put("username", owner.getUsername())
                    .put("info", title)
                    .put("actuUri", pathPrefix + "#/view/thread/" + threadId + "/info/" + infoId);
            params.put("resourceUri", params.getString("actuUri"));
            if("news.news-published".equals(notificationName)) {
                params.put("pushNotif", new JsonObject().put("title", "push.notif.actu.info.published").put("body", owner.getUsername()+ " : "+ title));
                infoService.retrieve(infoId, actu -> {
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
