package net.atos.entng.actualites.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;
import static org.entcore.common.user.UserUtils.getUserInfos;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.filters.ThreadFilter;
import net.atos.entng.actualites.services.ThreadService;
import net.atos.entng.actualites.services.impl.ThreadServiceSqlImpl;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.request.RequestUtils;

public class ThreadController extends ControllerHelper {

	private static final String THREAD_ID_PARAMETER = "id";
	private static final String SCHEMA_THREAD_CREATE = "createThread";
	private static final String SCHEMA_THREAD_UPDATE = "updateThread";

	private static final String EVENT_TYPE = "NEWS";
	private static final String RESOURCE_NAME = "thread";

	protected final ThreadService threadService;

	public ThreadController(){
		this.threadService = new ThreadServiceSqlImpl();
	}

	@Get("/threads")
	@ApiDoc("Get Thread by id.")
	@SecuredAction("thread.list")
	public void listThreads(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				threadService.list(user, arrayResponseHandler(request));
			}
		});
	}

	@Post("/thread")
	@ApiDoc("Create a new Thread.")
	@SecuredAction("thread.create")
	public void createThread(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_THREAD_CREATE, new Handler<JsonObject>() {
					@Override
					public void handle(JsonObject resource) {
						crudService.create(resource, user, notEmptyResponseHandler(request));
					}
				});
			}
		});
	}

	@Get("/thread/:" + Actualites.THREAD_RESOURCE_ID)
	@ApiDoc("Get Thread by id.")
	@ResourceFilter(ThreadFilter.class)
	@SecuredAction(value = "thread.read", type = ActionType.RESOURCE)
	public void getThread(final HttpServerRequest request) {
		final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				threadService.retrieve(threadId, user, notEmptyResponseHandler(request));
			}
		});
	}

	@Put("/thread/:" + Actualites.THREAD_RESOURCE_ID)
	@ApiDoc("Update thread by id.")
	@ResourceFilter(ThreadFilter.class)
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void updateThread(final HttpServerRequest request) {
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

	@Delete("/thread/:"+Actualites.THREAD_RESOURCE_ID)
	@ApiDoc("Delete thread by id.")
	@ResourceFilter(ThreadFilter.class)
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void deleteThread(final HttpServerRequest request) {
		final String threadId = request.params().get(Actualites.THREAD_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				crudService.delete(threadId, user, notEmptyResponseHandler(request));
			}
		});
	}


	@Get("/thread/share/json/:"+THREAD_ID_PARAMETER)
	@ApiDoc("Share thread by id.")
	@ResourceFilter(ThreadFilter.class)
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void shareThread(final HttpServerRequest request) {
		final String id = request.params().get(THREAD_ID_PARAMETER);
		if (id == null || id.trim().isEmpty()) {
			badRequest(request);
			return;
		}
		getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					shareService.shareInfos(user.getUserId(), id, I18n.acceptLanguage(request), new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							final Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);
							if(event.isRight()){
								JsonObject result = event.right().getValue();
								if(result.containsField("actions")){
									JsonArray actions = result.getArray("actions");
									JsonArray newActions = new JsonArray();
									for(Object action : actions){
										if(((JsonObject) action).containsField("displayName")){
											String displayName = ((JsonObject) action).getString("displayName");
											if(displayName.contains(".")){
												String resource = displayName.split("\\.")[0];
												if(resource.equals(RESOURCE_NAME)){
													newActions.add(action);
												}
											}
										}
									}
									result.putArray("actions", newActions);
								}
								handler.handle(new Either.Right<String, JsonObject>(result));
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

	@Put("/thread/share/json/:"+THREAD_ID_PARAMETER)
	@ApiDoc("Share thread by id.")
	@ResourceFilter(ThreadFilter.class)
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void shareThreadSubmit(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					final String threadId = request.params().get(THREAD_ID_PARAMETER);
					if(threadId == null || threadId.trim().isEmpty()) {
			            badRequest(request);
			            return;
			        }
					setTimelineEventType(EVENT_TYPE);
					JsonObject params = new JsonObject()
						.putString("profilUri", container.config().getString("host") +
								"/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
						.putString("username", user.getUsername())
						.putString("resourceUri", container.config().getString("host") + pathPrefix +
								"#/view/thread/" + threadId);
					shareJsonSubmit(request, "notify-thread-shared.html", false, params, "title");
				} else {
					unauthorized(request);
				}
			}
		});
	}

	@Put("/thread/share/remove/:"+THREAD_ID_PARAMETER)
	@ApiDoc("Remove Share by id.")
	@ResourceFilter(ThreadFilter.class)
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void shareThreadRemove(final HttpServerRequest request) {
		removeShare(request, false);
	}
}
