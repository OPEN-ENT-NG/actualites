/*
 * Copyright © Région Nord Pas de Calais-Picardie,  Département 91, Région Aquitaine-Limousin-Poitou-Charentes, 2016.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package net.atos.entng.actualites.controllers;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.request.RequestUtils;
import io.micrometer.common.util.StringUtils;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.constants.Field;
import net.atos.entng.actualites.filters.InfoFilter;
import net.atos.entng.actualites.filters.ThreadFilter;
import net.atos.entng.actualites.services.*;
import net.atos.entng.actualites.services.impl.ThreadServiceSqlImpl;
import net.atos.entng.actualites.services.impl.TimelineMongoImpl;
import net.atos.entng.actualites.utils.Events;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.notification.NotificationUtils;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;

import static org.entcore.common.http.response.DefaultResponseHandler.*;
import static org.entcore.common.user.UserUtils.getUserInfos;

public class InfoController extends ControllerHelper {

    private static final String INFO_ID_PARAMETER = "id";
    public static final String RESULT_SIZE_PARAMETER = "resultSize";

    public static final String SCHEMA_INFO_CREATE = "createInfo";
    private static final String SCHEMA_INFO_UPDATE = "updateInfo";

    public static final String RESOURCE_NAME = "info";
    private static final String EVENT_TYPE = "NEWS";
    public static final String NEWS_SUBMIT_EVENT_TYPE = EVENT_TYPE + "_SUBMIT";
    public static final String NEWS_UNSUBMIT_EVENT_TYPE = EVENT_TYPE + "_UNSUBMIT";
    public static final String NEWS_PUBLISH_EVENT_TYPE = EVENT_TYPE + "_PUBLISH";
    public static final String NEWS_UNPUBLISH_EVENT_TYPE = EVENT_TYPE + "_UNPUBLISH";
    public static final String NEWS_UPDATE_EVENT_TYPE = EVENT_TYPE + "_UPDATE";


    // TODO : refactor code to use enums or constants for statuses
    // TRASH: 0; DRAFT: 1; PENDING: 2; PUBLISHED: 3
    private static final List<Integer> status_list = new ArrayList<Integer>(Arrays.asList(0, 1, 2, 3));
    private final NotificationTimelineService notificationTimelineService;

    protected InfoService infoService;
    protected final ThreadService threadService;
    protected final TimelineMongo timelineMongo;
    protected final EventHelper eventHelper;
    protected final boolean optimized;

    public InfoController(final JsonObject config, final NotificationTimelineService notificationTimelineService){
        this.threadService = new ThreadServiceSqlImpl();
        this.timelineMongo = new TimelineMongoImpl(Field.TIMELINE_COLLECTION, MongoDb.getInstance());
        this.notificationTimelineService = notificationTimelineService;
        final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Actualites.class.getSimpleName());
        eventHelper = new EventHelper(eventStore);
        optimized = config.getBoolean("optimized-query", true);
        
    }

    @Override
    protected boolean shouldNormalizedRights() {
        return true;
    }

    @Override
    protected Function<JsonObject, Optional<String>> jsonToOwnerId() {
        return json -> Optional.of(json.getString("owner"));
    }

    @Get("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/:"+Actualites.INFO_RESOURCE_ID)
    @ApiDoc("Retrieve : retrieve an Info in thread by thread and by id")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "info.read", type = ActionType.RESOURCE)
    public void getInfo(final HttpServerRequest request) {
        // TODO IMPROVE @SecuredAction : Security on Info as a resource
        final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
        boolean originalContent = Boolean.parseBoolean(request.getParam("originalContent", "false"));

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                infoService.retrieve(infoId, user, originalContent, notEmptyResponseHandler(request));
            }
        });
    }

    @Get("/infos")
    @ApiDoc("Get infos.")
    @SecuredAction("actualites.infos.list")
    public void listInfos(final HttpServerRequest request) {
        // TODO IMPROVE : Security on Infos visibles by statuses / dates is not enforced
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {
                if(request.params().contains("optimized")){
                    final boolean notOptimized = "false".equals(request.params().get("optimized"));
                    infoService.list(user, !notOptimized, arrayResponseHandler(request));
                }else{
                    infoService.list(user, optimized, arrayResponseHandler(request));
                }
            }
        });
    }

    @Get("/infos/:"+Actualites.INFO_RESOURCE_ID+"/comments")
    @ApiDoc("Get infos comments.")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "info.read", type = ActionType.RESOURCE)
    public void getInfoComments(final HttpServerRequest request) {
        final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
        Long id;
        try {
            id = Long.parseLong(infoId);
        } catch (NumberFormatException nfe) {
            badRequest(request);
            return;
        }
        infoService.listComments(id, arrayResponseHandler(request));
    }

    @Get("/infos/:"+Actualites.INFO_RESOURCE_ID+"/shared")
    @ApiDoc("Get infos shared.")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "info.read", type = ActionType.RESOURCE)
    public void getInfoShared(final HttpServerRequest request) {
        final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
        Long id;
        try {
            id = Long.parseLong(infoId);
        } catch (NumberFormatException nfe) {
            badRequest(request);
            return;
        }
        infoService.listShared(id, arrayResponseHandler(request));
    }

    @Get("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/infos")
    @ApiDoc("Get infos in thread by thread id.")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
    public void listInfosByThreadId(final HttpServerRequest request) {
        // TODO IMPROVE : Security on Infos visibles by statuses / dates is not enforced
        final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {
                infoService.listByThreadId(threadId, user, arrayResponseHandler(request));
            }
        });
    }

    @Get("/linker/infos")
    @ApiDoc("List infos without their content. Used by linker")
    @SecuredAction("actualites.infos.list")
    public void listInfosForLinker(final HttpServerRequest request) {
        // TODO IMPROVE : Security on Infos visibles by statuses / dates is not enforced
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {
                if(request.params().contains("optimized")){
                    final boolean notOptimized = "false".equals(request.params().get("optimized"));
                    infoService.list(user, !notOptimized,arrayResponseHandler(request));
                }else{
                    infoService.list(user, optimized, arrayResponseHandler(request));
                }
            }
        });
    }

    @Get("/infos/last/:"+RESULT_SIZE_PARAMETER)
    @ApiDoc("Get infos in thread by status and by thread id.")
    @SecuredAction("actualites.infos.list")
    public void listLastPublishedInfos(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {
                String resultSize = request.params().get(RESULT_SIZE_PARAMETER);
                int size;
                if (resultSize == null || resultSize.trim().isEmpty()) {
                    badRequest(request);
                    return;
                }
                else {
                    try {
                        size = Integer.parseInt(resultSize);
                    } catch (NumberFormatException e) {
                        badRequest(request, "actualites.widget.bad.request.size.must.be.an.integer");
                        return;
                    }
                    if(size <=0 || size > 20) {
                        badRequest(request, "actualites.widget.bad.request.invalid.size");
                        return;
                    }
                }
                infoService.listLastPublishedInfos(user, size, optimized, arrayResponseHandler(request));
            }
        });
    }

	@Post("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info")
	@ApiDoc("Add a new Info with draft status")
	@ResourceFilter(ThreadFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
	public void createDraft(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_INFO_CREATE, new Handler<JsonObject>() {
					@Override
					public void handle(JsonObject resource) {
						resource.put("status", status_list.get(1));
                        final Handler<Either<String, JsonObject>> handler = eventHelper.onCreateResource(request, RESOURCE_NAME, notEmptyResponseHandler(request));
                        infoService.create(resource, user, Events.DRAFT.toString(),handler);
					}
				});
			}
		});
	}

    @Post("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/pending")
    @ApiDoc("Add a new Info with pending status")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
    public void createPending(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_INFO_CREATE, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        resource.put("status", status_list.get(2));
                        final String threadId = resource.getLong("thread_id").toString();
                        final String title = resource.getString("title");
                        infoService.create(resource, user, Events.CREATE_AND_PENDING.toString(),
                                new Handler<Either<String, JsonObject>>() {
                                    @Override
                                    public void handle(Either<String, JsonObject> event) {
                                        if (event.isRight()) {
                                            eventHelper.onCreateResource(request, RESOURCE_NAME);
                                            JsonObject info = event.right().getValue();
                                            String infoId = info.getLong("id").toString();
                                            notificationTimelineService.notifyTimeline(request, user, threadId, infoId, title, NEWS_SUBMIT_EVENT_TYPE);
                                            renderJson(request, event.right().getValue(), 200);
                                        } else {
                                            JsonObject error = new JsonObject().put("error", event.left().getValue());
                                            renderJson(request, error, 400);
                                        }
                                    }
                                }
                        );
                    }
                });
            }
        });
    }

	@Post("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/published")
	@ApiDoc("Add a new Info published status")
	@ResourceFilter(ThreadFilter.class)
	@SecuredAction(value = "thread.publish", type = ActionType.RESOURCE)
	public void createPublished(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_INFO_CREATE, new Handler<JsonObject>() {
					@Override
					public void handle(JsonObject resource) {
						resource.put("status", status_list.get(3));
						final Handler<Either<String, JsonObject>> handler = eventHelper.onCreateResource(request, RESOURCE_NAME, notEmptyResponseHandler(request));
                        infoService.create(resource, user, Events.CREATE_AND_PUBLISH.toString(), handler);
					}
				});
			}
		});
	}

    @Put("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/:"+Actualites.INFO_RESOURCE_ID+"/draft")
    @ApiDoc("Update : update an Info in Draft state in thread by thread and by id")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
    public void updateDraft(final HttpServerRequest request) {
        final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_INFO_UPDATE, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        resource.put("status", status_list.get(1));
                        if(!resource.containsKey("expiration_date")){
                            resource.putNull("expiration_date");
                        }
                        if(!resource.containsKey("publication_date")){
                            resource.putNull("publication_date");
                        }
                        notifyOwner(request, user, resource, infoId, NEWS_UPDATE_EVENT_TYPE);
                        infoService.update(infoId, resource, user, Events.UPDATE.toString(), notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Put("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/:"+Actualites.INFO_RESOURCE_ID+"/pending")
    @ApiDoc("Update : update an Info in Draft state in thread by thread and by id")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "thread.publish", type = ActionType.RESOURCE)
    public void updatePending(final HttpServerRequest request) {
        final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_INFO_UPDATE, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        resource.put("status", status_list.get(2));
                        if(!resource.containsKey("expiration_date")){
                            resource.putNull("expiration_date");
                        }
                        if(!resource.containsKey("publication_date")){
                            resource.putNull("publication_date");
                        }
                        notifyOwner(request, user, resource, infoId, NEWS_UPDATE_EVENT_TYPE);
                        infoService.update(infoId, resource, user, Events.PENDING.toString(), notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Put("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/:"+Actualites.INFO_RESOURCE_ID+"/published")
    @ApiDoc("Update : update an Info in Draft state in thread by thread and by id")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "thread.publish", type = ActionType.RESOURCE)
    public void updatePublished(final HttpServerRequest request) {
        final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_INFO_UPDATE, new Handler<JsonObject>() {
                    @Override
                    public void handle(JsonObject resource) {
                        resource.put("status", status_list.get(3));
                        if(!resource.containsKey("expiration_date")){
                            resource.putNull("expiration_date");
                        }
                        if(!resource.containsKey("publication_date")){
                            resource.putNull("publication_date");
                        }
                        notifyOwner(request, user, resource, infoId, NEWS_UPDATE_EVENT_TYPE);
                        infoService.update(infoId, resource, user, Events.UPDATE.toString(),
                                notEmptyResponseHandler(request));
                    }
                });
            }
        });
    }

    @Override
    @Delete("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/:"+Actualites.INFO_RESOURCE_ID)
    @ApiDoc("Delete : Real delete an Info in thread by thread and by id")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
    public void delete(final HttpServerRequest request) {
        final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
        final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
        UserUtils.getAuthenticatedUserInfos(eb, request)
            .compose(user -> {
                Promise<Void> promise = Promise.promise();
                crudService.delete(infoId, user, event -> {
                    if (event.isLeft()) {
                       promise.fail(event.left().getValue());
                    }
                    promise.complete();
                });
                return promise.future();
            })
            .compose(result -> timelineMongo.getNotification(threadId, infoId))
            .compose(timelineMongo::deleteNotification)
            .onSuccess(success -> ok(request))
            .onFailure(failure -> {
                String message = String.format("[ACTUALITES@%s::delete] Failed to delete info : %s",
                        this.getClass().getSimpleName(), failure.getMessage());
                log.error(message);
                badRequest(request);
            });
    }

	@Put("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/:"+Actualites.INFO_RESOURCE_ID+"/submit")
	@ApiDoc("Submit : Change an Info to Pending state in thread by thread and by id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
	public void submit(final HttpServerRequest request) {
		final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
		final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
					@Override
					public void handle(JsonObject body) {
						final String title = body.getString("title");
						Handler<Either<String, JsonObject>> handler = event -> {
                            if (event.isRight()) {
                                notificationTimelineService.notifyTimeline(request, user, threadId, infoId, title, NEWS_SUBMIT_EVENT_TYPE);
                                renderJson(request, event.right().getValue(), 200);
                            } else {
                                JsonObject error = new JsonObject().put("error", event.left().getValue());
                                renderJson(request, error, 400);
                            }
						};
						JsonObject resource = new JsonObject();
						resource.put("status", status_list.get(2));
                        infoService.update(infoId, resource, user, Events.SUBMIT.toString(),handler);
					}
				});
			}
		});
	}

	@Put("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/:"+Actualites.INFO_RESOURCE_ID+"/unsubmit")
	@ApiDoc("Cancel Submit : Change an Info to Draft state in thread by thread and by id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
	public void unsubmit(final HttpServerRequest request) {
		final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
		final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
					@Override
					public void handle(JsonObject body) {
						final String title = body.getString("title");
						Handler<Either<String, JsonObject>> handler = event -> {
                            if (event.isRight()) {
                                // notifyTimeline(request, user, threadId, infoId, title, NEWS_UNSUBMIT_EVENT_TYPE);
                                renderJson(request, event.right().getValue(), 200);
                            } else {
                                JsonObject error = new JsonObject().put("error", event.left().getValue());
                                renderJson(request, error, 400);
                            }
						};
						JsonObject resource = new JsonObject();
						resource.put("status", status_list.get(1));
                        infoService.update(infoId, resource, user, Events.UNPUBLISH.toString(), handler);
					}
				});
			}
		});
	}

	@Put("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/:"+Actualites.INFO_RESOURCE_ID+"/publish")
	@ApiDoc("Publish : Change an Info to Published state in thread by thread and by id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.publish", type = ActionType.RESOURCE)
	public void publish(final HttpServerRequest request) {
		final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
		final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
					@Override
					public void handle(JsonObject body) {
						final String title = body.getString("title");
						final UserInfos owner = new UserInfos();
						owner.setUserId(body.getString("owner"));
						owner.setUsername(body.getString("username"));
						Handler<Either<String, JsonObject>> handler = event -> {
                            if (event.isRight()) {
                                notificationTimelineService.notifyTimeline(request, user, owner, threadId, infoId, title, NEWS_PUBLISH_EVENT_TYPE);
                                renderJson(request, event.right().getValue(), 200);
                            } else {
                                JsonObject error = new JsonObject().put("error", event.left().getValue());
                                renderJson(request, error, 400);
                            }
                        };
						JsonObject resource = new JsonObject();
						resource.put("status", status_list.get(3));
                        infoService.update(infoId, resource, user, Events.PUBLISH.toString(), handler);
					}
				});
			}
		});
	}

	@Put("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/:"+Actualites.INFO_RESOURCE_ID+"/unpublish")
	@ApiDoc("Unpublish : Change an Info to Draft state in thread by thread and by id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.publish", type = ActionType.RESOURCE)
	public void unpublish(final HttpServerRequest request) {
		final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
		final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
					@Override
					public void handle(JsonObject body) {
						final String title = body.getString("title");
						final UserInfos owner = new UserInfos();
						owner.setUserId(body.getString("owner"));
						owner.setUsername(body.getString("username"));
						Handler<Either<String, JsonObject>> handler = new Handler<Either<String, JsonObject>>() {
							@Override
							public void handle(Either<String, JsonObject> event) {
								if (event.isRight()) {
                                    notificationTimelineService.notifyTimeline(request, user, owner, threadId, infoId, title, NEWS_UNPUBLISH_EVENT_TYPE);
									renderJson(request, event.right().getValue(), 200);
								} else {
									JsonObject error = new JsonObject().put("error", event.left().getValue());
									renderJson(request, error, 400);
								}
							}
						};
						JsonObject resource = new JsonObject();
						resource.put("status", status_list.get(2));
                        infoService.update(infoId, resource, user, Events.UNPUBLISH.toString(), notEmptyResponseHandler(request));
			}
		});
	}
});

	}

    @Get("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/share/json/:"+INFO_ID_PARAMETER)
    @ApiDoc("Get shared info by id.")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
    public void shareInfo(final HttpServerRequest request) {
        final String id = request.params().get(INFO_ID_PARAMETER);
        if (id == null || id.trim().isEmpty()) {
            badRequest(request);
            return;
        }
        getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    shareService.shareInfos(user.getUserId(), id, I18n.acceptLanguage(request), request.params().get("search"), new Handler<Either<String, JsonObject>>() {
                        @Override
                        public void handle(Either<String, JsonObject> event) {
                            final Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);
                            if(event.isRight()){
                                JsonObject result = event.right().getValue();
                                if(result.containsKey("actions")){
                                    JsonArray actions = result.getJsonArray("actions");
                                    JsonArray newActions = new JsonArray();
                                    for(Object action : actions){
                                        if(((JsonObject) action).containsKey("displayName")){
                                            String displayName = ((JsonObject) action).getString("displayName");
                                            if(displayName.contains(".")){
                                                String resource = displayName.split("\\.")[0];
                                                if(resource.equals(RESOURCE_NAME)){
                                                    newActions.add(action);
                                                }
                                            }
                                        }
                                    }
                                    result.put("actions", newActions);
                                }
                                infoService.getOwnerInfo(id, h -> {
                                    if(h.isRight()) {
                                        result.put("owner", h.right().getValue().getString("owner"));
                                        addNormalizedRights(result);
                                        handler.handle(new Either.Right<String, JsonObject>(result));
                                    } else {
                                        handler.handle(new Either.Left<String, JsonObject>("Error finding owner of the resource."));
                                    }
                                });
                            } else {
                                handler.handle(new Either.Left<String, JsonObject>("Error finding shared resource."));
                            }
                        }
                    });

                } else {
                    unauthorized(request);
                }
            }
        });
    }

    @Put("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/share/json/:"+INFO_ID_PARAMETER)
    @ApiDoc("Share info by id.")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
    public void shareInfoSubmit(final HttpServerRequest request) {
        final String infoId = request.params().get(INFO_ID_PARAMETER);
        if(StringUtils.isEmpty(infoId)) {
            badRequest(request);
            return;
        }
        request.pause();
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    infoService.retrieve(infoId, user, false, new Handler<Either<String, JsonObject>>() {
                        @Override
                        public void handle(Either<String, JsonObject> event) {
                            request.resume();
                            if(event.right() != null){
                                JsonObject info = event.right().getValue();
                                if(info != null && info.containsKey("status")){
                                    if(info.getInteger("status") > 2){
                                        JsonObject params = new JsonObject()
                                                .put("profilUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
                                                .put("username", user.getUsername())
                                                .put("resourceUri", pathPrefix + "#/view/thread/" + info.getString("thread_id") + "/info/" + infoId)
                                                .put("disableAntiFlood", true)
                                                .put("pushNotif", new JsonObject().put("title", "push.notif.actu.info.published").put("body", user.getUsername()+ " : "+ info.getString("title")));
										params.put("preview", NotificationUtils.htmlContentToPreview(
												info.getString("content")));

                                        DateFormat dfm = new SimpleDateFormat("yyyy-MM-dd");
                                        String date = info.getString("publication_date");
                                        if(date != null && !date.trim().isEmpty()){
                                            try {
                                                Date publication_date = dfm.parse(date);
                                                Date timeNow=new Date(System.currentTimeMillis());
                                                if(publication_date.after(timeNow)){
                                                    params.put("timeline-publish-date", publication_date.getTime());
                                                }
                                            } catch (ParseException e) {
                                                log.error("An error occured when sharing an info : " + e.getMessage());
                                            }
                                        }
                                        shareJsonSubmit(request, "news.info-shared", false, params, "title");
                                    } else {
                                        shareJsonSubmit(request, null, false, null, null);
                                    }
                                }
                            }
                        }
                    });
                } else {
                    unauthorized(request);
                }
            }
        });
    }

    @Put("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/share/remove/:"+INFO_ID_PARAMETER)
    @ApiDoc("Remove Share by id.")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
    public void shareInfoRemove(final HttpServerRequest request) {
        removeShare(request, false);
    }

    private void notifyOwner(final HttpServerRequest request, final UserInfos user, final JsonObject resource, final String infoId, final String eventType) {
        infoService.getOwnerInfo(infoId, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                    String ownerId = event.right().getValue().getString("owner");
                    if (!ownerId.equals(user.getUserId()) && resource.containsKey("thread_id") && resource.containsKey("title")) {
                        UserInfos owner = new UserInfos();
                        owner.setUserId(ownerId);
                        notificationTimelineService.notifyTimeline(request,  user, owner, resource.getLong("thread_id").toString(),
                                infoId, resource.getString("title"), eventType);
                    }
                } else {
                    log.error("Unable to create notification : GetOwnerInfo failed");
                }
            }
        });
//            notifyTimeline(request, user, resource.getString("thread_id"), infoId, resource.getString("title"), NEWS_UPDATE_EVENT_TYPE);
    }

    @Get("/info/:"+ Actualites.INFO_RESOURCE_ID +"/timeline")
    @ApiDoc("Get info timeline by id")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "thread.publish", type = ActionType.RESOURCE)
    public void getInfoTimeline (final HttpServerRequest request) {
        final String id = request.params().get(Actualites.INFO_RESOURCE_ID);
        if (id == null || id.trim().isEmpty()) {
            badRequest(request);
            return;
        }
        try {
            infoService.getRevisions(Long.parseLong(id), arrayResponseHandler(request));
        } catch (NumberFormatException e) {
            log.error("Error : id info must be a long object");
            badRequest(request);
        }
    }

	@Put("/thread/:"+Actualites.THREAD_RESOURCE_ID+"/info/share/resource/:"+INFO_ID_PARAMETER)
	@ApiDoc("Share info by id.")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
	public void shareResourceInfo(final HttpServerRequest request) {
		final String infoId = request.params().get(INFO_ID_PARAMETER);
		if(StringUtils.isEmpty(infoId)) {
			badRequest(request);
			return;
		}
		request.pause();
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					infoService.retrieve(infoId, user, false, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							request.resume();
							if(event.right() != null){
								JsonObject info = event.right().getValue();
								if(info != null && info.containsKey("status")){
									if(info.getInteger("status") > 2){
										JsonObject params = new JsonObject()
												.put("profilUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
												.put("username", user.getUsername())
												.put("resourceUri", pathPrefix + "#/view/thread/" + info.getString("thread_id") + "/info/" + infoId)
												.put("disableAntiFlood", true)
												.put("pushNotif", new JsonObject().put("title", "push.notif.actu.info.published").put("body", user.getUsername()+ " : "+ info.getString("title")));
										params.put("preview", NotificationUtils.htmlContentToPreview(
												info.getString("content")));

										DateFormat dfm = new SimpleDateFormat("yyyy-MM-dd");
										String date = info.getString("publication_date");
										if(date != null && !date.trim().isEmpty()){
											try {
												Date publication_date = dfm.parse(date);
												Date timeNow=new Date(System.currentTimeMillis());
												if(publication_date.after(timeNow)){
													params.put("timeline-publish-date", publication_date.getTime());
												}
											} catch (ParseException e) {
												log.error("An error occured when sharing an info : " + e.getMessage());
											}
										}
										shareResource(request, "news.info-shared", false, params, "title");
									} else {
										shareResource(request, null, false, null, null);
									}
								}
							}
						}
					});
				} else {
					unauthorized(request);
				}
			}
		});
	}

    @Get("/config/share")
    @ApiDoc("Get the sharing configuration (for example: default actions to check in share panel.")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void getConfigShare(final HttpServerRequest request) {
        JsonObject shareConfig = ConfigService.getInstance().getShareConfig();
        if (shareConfig != null) {
            renderJson(request, ConfigService.getInstance().getShareConfig(), 200);
        } else {
            notFound(request, "No platform sharing configuration found");
        }
    }

    private static final int LIST_MAX_PAGE_SIZE = 50;
    private static final int LIST_DEFAULT_PAGE_SIZE = 20;

    @Get("/list")
    @ApiDoc("List infos with pagination. Accept custom page size. Params threadId can be used to restrict the list to this thread.")
    @SecuredAction("actualites.infos.list.page")
    public void listInfosPagined(final HttpServerRequest request) {
        // TODO IMPROVE : Security on Infos visibles by statuses / dates is not enforced
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {

                // 1. Parse args

                int page = 0;
                int pageSize = LIST_DEFAULT_PAGE_SIZE;
                Integer threadId = null;

                try {
                    if (request.params().contains("page")) {
                        page = Integer.parseInt(request.params().get("page"));
                        if (page < 0) throw new IllegalArgumentException("page number must be positive");
                    }
                    if (request.params().contains("pageSize")) {
                        pageSize = Integer.parseInt(request.params().get("pageSize"));
                        if (pageSize <= 0) throw new IllegalArgumentException("page size must be positive non-zero");
                        if (pageSize > LIST_MAX_PAGE_SIZE) throw new IllegalArgumentException("page size maximum exceeded");
                    }
                    if (request.params().contains("threadId")) {
                        threadId = new Integer(request.params().get("threadId"));
                    }

                } catch (IllegalArgumentException e) {
                    badRequest(request);
                    return;
                }

                // 2. Call service

                infoService.listPaginated(securedActions, user, page, pageSize, threadId)
                        .onSuccess(news -> render(request, news))
                        .onFailure(ex -> renderError(request));
            } else {
                unauthorized(request);
            }
        });
    }

    @Get("/info/:"+Actualites.INFO_RESOURCE_ID)
    @ApiDoc("Get info from its id.")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "info.read", type = ActionType.RESOURCE)
    public void getSingleInfo(final HttpServerRequest request) {
        // TODO IMPROVE : Security on Infos visibles by statuses / dates is not enforced
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                // 1. Parse args
                final int infoId = Integer.parseInt(request.params().get(Actualites.INFO_RESOURCE_ID));
                boolean originalContent = Boolean.parseBoolean(request.getParam("originalContent", "false"));

                // 2. Call service
                infoService.getFromId(securedActions, user, infoId, originalContent)
                        .onSuccess(news -> render(request, news))
                        .onFailure(ex -> renderError(request));

            } else {
                unauthorized(request);
            }
        });
    }

    public void setInfoService(InfoService infoService) {
        this.infoService = infoService;
    }

}
