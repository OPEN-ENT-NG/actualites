package net.atos.entng.actualites.controllers.v1;

import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.filters.ThreadFilter;
import net.atos.entng.actualites.services.ThreadMigrationService;
import net.atos.entng.actualites.services.ThreadService;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.SuperAdminFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import static org.entcore.common.http.response.DefaultResponseHandler.*;
import static org.entcore.common.user.UserUtils.getUserInfos;

import static net.atos.entng.actualites.Actualites.THREAD_RESOURCE_ID;

public class ThreadControllerV1 extends ControllerHelper {

	private static final String THREAD_ID_PARAMETER = "id";
	private static final String SCHEMA_THREAD_CREATE = "createThread";
	private static final String SCHEMA_THREAD_UPDATE = "updateThread";
	private static final String RESOURCE_NAME = "thread";
	private static final String ADMC_TASK = "admcTask";
	private static final String TASK_ATTACH = "autoAttachToStructures";

	protected ThreadService threadService;
	protected ThreadMigrationService threadMigrationService;
	protected EventHelper eventHelper;
    public static final String ROOT_RIGHT = "net.atos.entng.actualites.controllers.ThreadController";

	@Override
	protected boolean shouldNormalizedRights() {
		return true;
	}

	@Override
	protected Function<JsonObject, Optional<String>> jsonToOwnerId() {
		return json -> Optional.of(json.getString("owner"));
	}

	public void setThreadService(ThreadService threadService) {
		this.threadService = threadService;
	}

	public void setThreadMigrationService(ThreadMigrationService threadMigrationService) {
		this.threadMigrationService = threadMigrationService;
	}

	public void setEventHelper(EventHelper eventHelper) {
		this.eventHelper = eventHelper;
	}

    @Get("/api/v1/threads")
    @ApiDoc("Get all threads ")
    @SecuredAction(value = "actualites.threads.list", right = ROOT_RIGHT + "|listThreads")
    public void getThreads(HttpServerRequest request) {
        listThreadsV2(request);
    }

	private void listThreadsV2(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				Boolean viewHidden = Boolean.parseBoolean(request.getParam("viewHidden", "false"));
				threadService.list(securedActions, user, viewHidden)
					.onSuccess(threads -> render(request, threads))
					.onFailure(ex -> renderError(request));
			} else {
				unauthorized(request);
			}
		});
	}

    @Get("/api/v1/threads/:" + THREAD_RESOURCE_ID)
    @ApiDoc("Get a thread by Id")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.contrib", right = ROOT_RIGHT + "|getThread", type = ActionType.RESOURCE)
    public void getThreadById(HttpServerRequest request) {
        getThread(request);
    }

	private void getThread(final HttpServerRequest request) {
		final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, user ->
				threadService.retrieve(threadId, user, securedActions)
						.onSuccess(thread -> render(request, thread))
						.onFailure(ex -> {
							JsonObject error = (new JsonObject()).put("error", ex.getMessage());
							Renders.renderJson(request, error, 400);
						}));
	}

    @Post("/api/v1/threads")
    @ApiDoc("Create a new thread")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "actualites.create", right = ROOT_RIGHT + "|createThread")
    public void createThread(HttpServerRequest request) {
        createThreadInternal(request);
    }

	private void createThreadInternal(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_THREAD_CREATE, resource -> {
                    // WB-1402 auto-attach the thread to this user's structure, iif only one exists.
                    final List<String> structures = user.getStructures();
                    if(structures!=null && structures.size() == 1) {
                        String structure_id = structures.get(0);
                        if(structure_id!=null && structure_id.length()>0) {
                            resource.put("structure_id", structure_id);
                        }
                    }
                    final Handler<Either<String,JsonObject>> handler = notEmptyResponseHandler(request);
                    crudService.create(resource, user, h -> {
                        if(h.isRight()) {
                            Promise<Void> promise = Promise.promise();
                            threadMigrationService.addAdmlShare(h.right().getValue().getString("id"), promise);
                            promise.future().onSuccess( migr ->
                                eventHelper.onCreateResource(request, RESOURCE_NAME, handler).handle(h));
                        }
                    });
                });
			}
		});
	}

    @Put("/api/v1/threads/:" + THREAD_RESOURCE_ID)
    @ApiDoc("Update thread by id")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|updateThread", type = ActionType.RESOURCE)
    public void updateThread(HttpServerRequest request) {
        updateThreadInternal(request);
    }

	private void updateThreadInternal(final HttpServerRequest request) {
		final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_THREAD_UPDATE, new Handler<JsonObject>() {
					@Override
					public void handle(JsonObject resource) {
						crudService.update(threadId, resource, user, notEmptyResponseHandler(request));
					}
				});
			}
		});
	}

    @Delete("/api/v1/threads/:" + THREAD_RESOURCE_ID)
    @ApiDoc("Delete thread by id")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|deleteThread", type = ActionType.RESOURCE)
    public void deleteThread(HttpServerRequest request) {
        deleteThreadInternal(request);
    }

	private void deleteThreadInternal(final HttpServerRequest request) {
		final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				crudService.delete(threadId, user, notEmptyResponseHandler(request));
			}
		});
	}

    @Get("/api/v1/threads/:id/shares")
    @ApiDoc("Get thread's shares")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|shareThread", type = ActionType.RESOURCE)
    public void getThreadShares(HttpServerRequest request) {
        shareThread(request);
    }

	private void shareThread(final HttpServerRequest request) {
		final String id = request.params().get(THREAD_ID_PARAMETER);
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
								threadService.getOwnerInfo(id, h -> {
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

    @Put("/api/v1/threads/:id/shares")
    @ApiDoc("Update thread's shares")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|shareResource", type = ActionType.RESOURCE)
    public void updateThreadShares(HttpServerRequest request) {
        shareResourceThread(request);
    }

	private void shareResourceThread(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					final String id = request.params().get("id");
					if(id == null || id.trim().isEmpty()) {
						badRequest(request, "invalid.id");
						return;
					}

					JsonObject params = new JsonObject()
							.put("profilUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
							.put("username", user.getUsername())
							.put("resourceUri", pathPrefix + "#/default");

					shareResource(request, "news.thread-shared", false, params, "title");
				} else {
					unauthorized(request);
				}
			}
		});
	}

    @Post("/api/v1/threads/tasks")
    @ApiDoc("Launch a maintenance task")
    @ResourceFilter(SuperAdminFilter.class)
    @SecuredAction(value = "", right = ROOT_RIGHT + "|admcTask", type = ActionType.RESOURCE)
    public void linkThread(HttpServerRequest request) {
        admcTask(request);
    }

	private void admcTask(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, pathPrefix + ADMC_TASK, (JsonObject resource) -> {
			switch(resource.getString("task")) {
				case TASK_ATTACH: {
					this.threadService.attachThreadsWithNullStructureToDefault()
					.onSuccess(Void -> ok(request))
					.onFailure(throwable -> {
						renderError(request, null, 500, throwable.getMessage());
					});
					return;
				}

				default: break;
			}
			badRequest(request);
        });
	}
}
