package net.atos.entng.actualites.controllers.v1;

import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.filters.CreateInfoFilter;
import net.atos.entng.actualites.filters.InfoFilter;
import net.atos.entng.actualites.filters.UpdateInfoFilter;
import net.atos.entng.actualites.services.InfoService;
import net.atos.entng.actualites.services.NotificationTimelineService;
import net.atos.entng.actualites.to.NewsState;
import net.atos.entng.actualites.to.NewsStatus;
import net.atos.entng.actualites.utils.Events;
import org.apache.commons.lang3.StringUtils;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import io.vertx.core.Promise;
import net.atos.entng.actualites.services.TimelineMongo;
import org.entcore.common.notification.NotificationUtils;

import static net.atos.entng.actualites.Actualites.INFO_RESOURCE_ID;
import static org.entcore.common.http.response.DefaultResponseHandler.*;
import static org.entcore.common.user.UserUtils.getUserInfos;

public class InfosControllerV1 extends ControllerHelper {

	public static final int DEFAULT_PAGE_SIZE = 20;
	public static final int MAX_PAGE_SIZE = 100;

	private static final String INFO_ID_PARAMETER = "id";
    public static final String RESULT_SIZE_PARAMETER = "resultSize";

    public static final String SCHEMA_INFO_CREATE = "createInfo";
    public static final String SCHEMA_INFO_UPDATE = "updateInfo";

    public static final String RESOURCE_NAME = "info";
    private static final String EVENT_TYPE = "NEWS";
    public static final String NEWS_SUBMIT_EVENT_TYPE = EVENT_TYPE + "_SUBMIT";
    public static final String NEWS_UNSUBMIT_EVENT_TYPE = EVENT_TYPE + "_UNSUBMIT";
    public static final String NEWS_PUBLISH_EVENT_TYPE = EVENT_TYPE + "_PUBLISH";
    public static final String NEWS_UNPUBLISH_EVENT_TYPE = EVENT_TYPE + "_UNPUBLISH";
    public static final String NEWS_UPDATE_EVENT_TYPE = EVENT_TYPE + "_UPDATE";

	protected InfoService infoService;
	protected TimelineMongo timelineMongo;

	private JsonObject rights;
	private final NotificationTimelineService notificationTimelineService;
	private final EventHelper eventHelper;
	private static final String ROOT_RIGHT = "net.atos.entng.actualites.controllers.InfoController";
	private static final Logger LOGGER = LoggerFactory.getLogger(InfosControllerV1.class);


    public InfosControllerV1(NotificationTimelineService notificationTimelineService, JsonObject rights) {
        this.notificationTimelineService = notificationTimelineService;
        final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Actualites.class.getSimpleName());
		eventHelper = new EventHelper(eventStore);
		this.rights = rights;
    }

	@Override
    protected boolean shouldNormalizedRights() {
        return true;
    }

    @Override
    protected Function<JsonObject, Optional<String>> jsonToOwnerId() {
        return json -> Optional.of(json.getString("owner"));
    }

	public void setInfoService(InfoService infoService) {
        this.infoService = infoService;
    }

	public void setTimelineMongo(TimelineMongo timelineMongo) {
		this.timelineMongo = timelineMongo;
	}

	@Get("/api/v1/infos")
	@SecuredAction(value = "actualites.infos.list", right = ROOT_RIGHT + "|listInfos")
	public void infos(final HttpServerRequest request) {
		// page argument
		int pageParsed;
		String pageParam = request.params().get("page");
		try {
			pageParsed = pageParam == null ? 0 : Integer.parseInt(pageParam);
		} catch (NumberFormatException e) {
			pageParsed = 0;
		}
		final int page = pageParsed;

		// pageSize argument
		int pageSizeParsed;
		String pageSizeParam = request.params().get("pageSize");
		try {
			pageSizeParsed = pageSizeParam == null ? DEFAULT_PAGE_SIZE : Integer.parseInt(pageSizeParam);
		} catch (NumberFormatException e) {
			pageSizeParsed = DEFAULT_PAGE_SIZE;
		}
		final int pageSize = pageSizeParsed > MAX_PAGE_SIZE ? DEFAULT_PAGE_SIZE : pageSizeParsed;

		// threadIds argument
		final List<Integer> threadIds = new ArrayList<>();
		final List<String> threadIdsParam = request.params().getAll("threadIds");
		if (threadIdsParam != null && !threadIdsParam.isEmpty()) {
			for (String threadId : threadIdsParam) {
				try {
					threadIds.add(Integer.parseInt(threadId));
				} catch (NumberFormatException e) {
					// Pas une valeur numérique, on skip !
				}
			}
		}

		// status argument
		final List<NewsStatus> statuses = new ArrayList<>();
		List<String> statusParams = request.params().getAll("status");
		if (statusParams != null && !statusParams.isEmpty()) {
			for (String statusParam : statusParams) {
				try {
					statuses.add(NewsStatus.valueOf(statusParam.toUpperCase()));
				} catch (IllegalArgumentException e) {
					// Pas un statut valide, on skip !
				}
			}
		}
		if (statuses.isEmpty()) {
			statuses.add(NewsStatus.PUBLISHED);
		}

		// state argument
		final List<NewsState> states = new ArrayList<>();
		List<String> stateParams = request.params().getAll("state");
		if (stateParams != null && !stateParams.isEmpty()) {
			for (String stateParam : stateParams) {
				try {
					states.add(NewsState.valueOf(stateParam.toUpperCase()));
				} catch (IllegalArgumentException e) {
					// Pas un état valide, on skip !
				}
			}
		}

		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				infoService.listPaginated(securedActions, user, page, pageSize, threadIds, statuses, states)
					.onSuccess(news -> render(request, news))
					.onFailure(ex -> renderError(request));
			} else {
				unauthorized(request);
			}
		});
	}

	@Get("/api/v1/infos/preview/last/:" + RESULT_SIZE_PARAMETER)
	@ApiDoc("List last infos, accept query param resultSize.")
	@SecuredAction(value = "actualites.infos.list", right = ROOT_RIGHT + "|listInfos")
	public void getLastInfos(HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
            String resultSize = request.params().get(RESULT_SIZE_PARAMETER);
            int size;
            if (resultSize == null || resultSize.trim().isEmpty()) {
                badRequest(request);
                return;
            }
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
            infoService.listLastPublishedInfos(user, size)
					.onSuccess( newsLight -> render(request, newsLight))
					.onFailure( ex -> renderError(request));
        });
	}

	@Get("/api/v1/infos/:" + INFO_RESOURCE_ID)
	@ApiDoc("Retrieve : retrieve an Info in thread by thread and by id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "info.read", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|getInfo")
	public void getInfos(final HttpServerRequest request) {
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

	@Delete("/api/v1/infos/:" + INFO_RESOURCE_ID)
	@ApiDoc("Delete : Real delete an Info in thread by thread and by id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|delete")
	public void removeInfo(final HttpServerRequest request) {
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
				String message = String.format("[ACTUALITES@%s::deleteInfo] Failed to delete info : %s",
						this.getClass().getSimpleName(), failure.getMessage());
				LOGGER.error(message);
				badRequest(request);
			});
	}

	@Get("/api/v1/infos/:id/shares")
	@ApiDoc("Get share info")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|shareInfo")
	public void getShareInfo(final HttpServerRequest request) {
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

	@Put("/api/v1/infos/:id/shares")
	@ApiDoc("Update share info")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|shareInfo")
	public void updateShareInfo(final HttpServerRequest request) {
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
												Date publicationDate = dfm.parse(date);
												Date timeNow=new Date(System.currentTimeMillis());
												if(publicationDate.after(timeNow)){
													params.put("timeline-publish-date", publicationDate.getTime());
												}
											} catch (ParseException e) {
												LOGGER.error("An error occured when sharing an info : " + e.getMessage());
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

	@Get("/api/v1/infos/:" + INFO_RESOURCE_ID + "/timeline")
	@ApiDoc("Get timeline info")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.publish", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|getInfoTimeline")
	public void getInfoTimeline(final HttpServerRequest request) {
		final String id = request.params().get(Actualites.INFO_RESOURCE_ID);
		if (id == null || id.trim().isEmpty()) {
			badRequest(request);
			return;
		}
		try {
			infoService.getRevisions(Long.parseLong(id), arrayResponseHandler(request));
		} catch (NumberFormatException e) {
			LOGGER.error("Error : id info must be a long object");
			badRequest(request);
		}
	}

	@Post("/api/v1/infos")
	@ApiDoc("Create an info in pending or draft")
	@ResourceFilter(CreateInfoFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|createDraft")
	public void createInfo(HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_INFO_CREATE, resource -> {
				LOGGER.info(String.format("User %s create an info", user.getUserId()));

				String status  = resource.getString("status");
				if (StringUtils.isEmpty(status) || !(status.equals("1") || status.equals("2"))) {
					JsonObject error = new JsonObject().put("error", "Status should be in DRAFT or PENDING");
					renderJson(request, error, 400);
					return;
				}
				Events events = resource.getString("status").equals("1") ? Events.DRAFT : Events.CREATE_AND_PENDING;

				Handler<Either<String, JsonObject>> handler = eventHelper.onCreateResource(request, RESOURCE_NAME, notEmptyResponseHandler(request));
				if (events == Events.CREATE_AND_PENDING) {
					handler = event -> {
						if (event.isRight()) {
							eventHelper.onCreateResource(request, RESOURCE_NAME);
							JsonObject info = event.right().getValue();
							String infoId = info.getLong("id").toString();
							String threadId = resource.getString("thread_id");
							String title = resource.getString("title");
							notificationTimelineService.notifyTimeline(request, user, threadId, infoId, title, NEWS_SUBMIT_EVENT_TYPE);
							renderJson(request, event.right().getValue(), 200);
						} else {
							JsonObject error = new JsonObject().put("error", event.left().getValue());
							renderJson(request, error, 400);
						}
					};
				}
				infoService.create(resource, user, events.name(), request, handler);
			});
		});
	}


	@Post("/api/v1/infos/published")
	@ApiDoc("Create a published info")
	@ResourceFilter(CreateInfoFilter.class)
	@SecuredAction(value = "thread.publish", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|publish")
	public void createPublishedInfo(HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_INFO_CREATE, resource -> {
				LOGGER.info(String.format("User %s create a published info", user.getUserId()));
				resource.put("status", 3); //PUBLISH
				final Handler<Either<String, JsonObject>> handler = eventHelper.onCreateResource(request, RESOURCE_NAME, notEmptyResponseHandler(request));
				infoService.create(resource, user, Events.CREATE_AND_PUBLISH.toString(), request, handler);
			});
		});
	}

	@Put("/api/v1/infos/:" + INFO_RESOURCE_ID)
	@ApiDoc("Update an info in any states")
	@ResourceFilter(UpdateInfoFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|createDraft")
	public void updateInfo(HttpServerRequest request) {
		final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, user -> {
			RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_INFO_UPDATE, resource -> {
				LOGGER.info(String.format("User %s update info %s", user.getUserId(), infoId));

				infoService.retrieve(infoId, false, infoEither -> {
					if(infoEither.isLeft()) {
						notFound(request);
						return;
					}
					JsonObject actualInfo = infoEither.right().getValue();
					int actualStatus = actualInfo.getInteger("status");
					int targetStatus = resource.getInteger("status");
					Events event = getEventFromTransition(targetStatus, actualStatus);

					if (event == Events.UPDATE || event == Events.PENDING) {
						if (!resource.containsKey("expiration_date")) {
							resource.putNull("expiration_date");
						}
						if (!resource.containsKey("publication_date")) {
							resource.putNull("publication_date");
						}
					}
					infoService.update(infoId, resource, user, event.name(), request, h -> {
						notEmptyResponseHandler(request).handle(h);
						String notificationFromTransition = getNotificationFromTransition(targetStatus, actualStatus);
						if (notificationFromTransition != null) {
							if (resource.getString("title") == null) {
								resource.put("title", actualInfo.getString("title"));
							}
							if (notificationFromTransition.equals(NEWS_UPDATE_EVENT_TYPE)) {
								notifyOwner(request, user, resource, infoId, actualInfo, notificationFromTransition);
							} else {
								UserInfos owner = new UserInfos();
								owner.setUserId(actualInfo.getString("owner"));
								notificationTimelineService.notifyTimeline(request, user, owner, actualInfo.getString("thread_id"),
										infoId, resource.getString("title"), notificationFromTransition);
							}
						}
					});
				});
			});
		});
	}

	private String getNotificationFromTransition(int updatedStatus, int actualStatus) {
		if (actualStatus == 1 && updatedStatus == 2) {
			return NEWS_SUBMIT_EVENT_TYPE;
		}
		if (actualStatus == 2 && updatedStatus == 3) {
			return NEWS_PUBLISH_EVENT_TYPE;
		}
		if (actualStatus == 3 && updatedStatus == 2) {
			return NEWS_UNPUBLISH_EVENT_TYPE;
		}
		//notify owner except he unsubmits
		if (!(actualStatus == 2 && updatedStatus == 1)) {
			return NEWS_UPDATE_EVENT_TYPE;
		}
		return null;
	}

	private Events getEventFromTransition(int updatedStatus, int actualStatus) {
		if(actualStatus == 1 && updatedStatus == 1 ||
				actualStatus == 3 && updatedStatus == 3) {
			return Events.UPDATE;
		}
		if(actualStatus == 2 && updatedStatus == 2) {
			return Events.PENDING;
		}
		if(actualStatus == 1 && updatedStatus == 2) {
			return Events.SUBMIT;
		}
		if(actualStatus == 2 && updatedStatus == 1 ||
		   actualStatus == 3 && updatedStatus == 2) {
			return Events.UNPUBLISH;
		}
		if(actualStatus == 2 && updatedStatus == 3) {
			return Events.PUBLISH;
		}
		return Events.UPDATE;
	}


	@Get("/api/v1/infos/stats")
	@ApiDoc("Get statistics about threads and infos grouped by status")
	@SecuredAction(value = "actualites.infos.list", right = ROOT_RIGHT + "|listInfos")
	public void getStats(HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				boolean viewHidden = Boolean.parseBoolean(request.getParam("viewHidden", "false"));
				infoService.getStats(user, viewHidden)
					.onSuccess(stats -> render(request, stats))
					.onFailure(ex -> renderError(request));
			} else {
				unauthorized(request);
			}
		});
	}

	@Get("/api/v1/rights/sharing")
	@SecuredAction(type = ActionType.AUTHENTICATED, value = "")
	public void getSharedActions(HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			renderJson(request, rights);
        });
	}

	private void notifyOwner(final HttpServerRequest request, final UserInfos user, final JsonObject updatedInfo,
							 final String infoId, final JsonObject actualInfo, final String eventType) {
		String ownerId = actualInfo.getString("owner");
		if (!ownerId.equals(user.getUserId())) {
			UserInfos owner = new UserInfos();
			owner.setUserId(ownerId);
			notificationTimelineService.notifyTimeline(request,  user, owner, actualInfo.getString("thread_id"),
					infoId, updatedInfo.getString("title"), eventType);
		}
	}
}
