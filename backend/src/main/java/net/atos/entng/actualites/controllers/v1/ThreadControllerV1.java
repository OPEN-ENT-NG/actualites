package net.atos.entng.actualites.controllers.v1;

import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.cron.PublicationCron;
import net.atos.entng.actualites.filters.ThreadFilter;
import net.atos.entng.actualites.services.ThreadMigrationService;
import net.atos.entng.actualites.services.ThreadService;
import net.atos.entng.actualites.to.ThreadInclude;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.SuperAdminFilter;
import org.entcore.common.user.UserUtils;

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
    private static final String TASK_PUBLISH = "publishNews";

	protected ThreadService threadService;
	protected ThreadMigrationService threadMigrationService;
    private PublicationCron publicationCron;

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

    public void setPublicationCron(PublicationCron publicationCron) {
        this.publicationCron = publicationCron;
    }

    @Get("/api/v1/threads")
    @ApiDoc("Get all threads ")
    @SecuredAction(value = "actualites.threads.list", right = ROOT_RIGHT + "|listThreads")
    public void getThreads(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				String include = request.getParam("include", "");
				threadService.list(securedActions, user, ThreadInclude.fromString(include))
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
    public void getThreadById(final HttpServerRequest request) {
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
    public void createThread(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request,user -> RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_THREAD_CREATE,
				resource -> {
					final Handler<Either<String,JsonObject>> handler = notEmptyResponseHandler(request);
                    String structureId = resource.getJsonObject("structure").getString("id");
                    if (!user.getStructures().contains(structureId)) {
                        Renders.renderJson(request, new JsonObject().put("error", "User must be attached to the structure") , 400);
                        return;
                    }
                    resource.remove("structure");
                    resource.put("structure_id",  structureId);
					crudService.create(resource, user, h -> {
						if(h.isRight()) {
							threadMigrationService.addAdmlShare(h.right().getValue().getString("id"));
							eventHelper.onCreateResource(request, RESOURCE_NAME, handler).handle(h);
						}
					});
				}));
	}

    @Put("/api/v1/threads/:" + THREAD_RESOURCE_ID)
    @ApiDoc("Update thread by id")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|updateThread", type = ActionType.RESOURCE)
    public void updateThread(final HttpServerRequest request) {
		final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_THREAD_UPDATE,
				resource -> {
                    threadService.getStructureId(threadId)
                            .onSuccess( prevStructureId -> {
                                if (resource.getJsonObject("structure") != null && resource.getJsonObject("structure").getString("id") != null) {
                                    String structureId = resource.getJsonObject("structure").getString("id");
                                    if (!user.getStructures().contains(structureId) && !structureId.equals(prevStructureId)) {
                                        Renders.renderJson(request, new JsonObject().put("error", "User must be attach to the structure") , 400);
                                        return;
                                    }
                                    resource.remove("structure");
                                    resource.put("structure_id", structureId);
                                    resource.put("migrated", false);

                                    crudService.update(threadId, resource, user, res -> {
                                        threadMigrationService.addAdmlShare(threadId);
                                        notEmptyResponseHandler(request).handle(res);
                                    });
                                } else {
                                    crudService.update(threadId, resource, user, notEmptyResponseHandler(request));
                                }
                            })
                            .onFailure(ex -> renderError(request));
                }));
	}

    @Delete("/api/v1/threads/:" + THREAD_RESOURCE_ID)
    @ApiDoc("Delete thread by id")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|deleteThread", type = ActionType.RESOURCE)
    public void deleteThread(final HttpServerRequest request) {
		final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, user -> crudService.delete(threadId, user, notEmptyResponseHandler(request)));
	}

    @Get("/api/v1/threads/:id/shares")
    @ApiDoc("Get thread's shares")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|shareThread", type = ActionType.RESOURCE)
    public void getThreadShares(final HttpServerRequest request) {
		final String id = request.params().get(THREAD_ID_PARAMETER);
		if (id == null || id.trim().isEmpty()) {
			badRequest(request);
			return;
		}
		getUserInfos(eb, request, user -> {
            if (user != null) {
                shareService.shareInfos(user.getUserId(), id, I18n.acceptLanguage(request), request.params().get("search"), event -> {
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
                });

            } else {
                unauthorized(request);
            }
        });
	}

    @Put("/api/v1/threads/:id/shares")
    @ApiDoc("Update thread's shares")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|shareResource", type = ActionType.RESOURCE)
    public void updateThreadShares(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
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
        });
	}

    @Post("/api/v1/threads/tasks")
    @ApiDoc("Launch a maintenance task")
    @ResourceFilter(SuperAdminFilter.class)
    @SecuredAction(value = "", right = ROOT_RIGHT + "|admcTask", type = ActionType.RESOURCE)
    public void launchTask(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, pathPrefix + ADMC_TASK, (JsonObject resource) -> {
			switch(resource.getString("task")) {
                case TASK_ATTACH :
                    this.threadService.attachThreadsWithNullStructureToDefault()
                        .onSuccess(Void -> ok(request))
                        .onFailure(throwable -> {
                            renderError(request, null, 500, throwable.getMessage());
                        });
                    break;
                case TASK_PUBLISH :
                    publicationCron.handle(1L);
                    ok(request);
                    break;
                default:
				    badRequest(request);
			}
        });
	}
}
