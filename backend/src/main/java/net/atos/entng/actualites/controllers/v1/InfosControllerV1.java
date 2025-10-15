package net.atos.entng.actualites.controllers.v1;

import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.controllers.InfoController;
import net.atos.entng.actualites.filters.CreateInfoFilter;
import net.atos.entng.actualites.filters.InfoFilter;
import net.atos.entng.actualites.filters.UpdateInfoFilter;
import net.atos.entng.actualites.services.InfoService;
import net.atos.entng.actualites.services.NotificationTimelineService;
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

import java.util.ArrayList;
import java.util.List;

import static net.atos.entng.actualites.Actualites.INFO_RESOURCE_ID;
import static net.atos.entng.actualites.controllers.InfoController.*;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

public class InfosControllerV1 extends ControllerHelper {

	public static final int DEFAULT_PAGE_SIZE = 20;
	public static final int MAX_PAGE_SIZE = 100;

	protected InfoService infoService;

	private final NotificationTimelineService notificationTimelineService;
	private final InfoController infoController;
	private final EventHelper eventHelper;
	private static final String ROOT_RIGHT = "net.atos.entng.actualites.controllers.InfoController";
	private static final Logger LOGGER = LoggerFactory.getLogger(InfosControllerV1.class);

    public InfosControllerV1(InfoController infoController, NotificationTimelineService notificationTimelineService) {
		this.infoController = infoController;
        this.notificationTimelineService = notificationTimelineService;
        final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Actualites.class.getSimpleName());
		eventHelper = new EventHelper(eventStore);
    }

	public void setInfoService(InfoService infoService) {
        this.infoService = infoService;
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

		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				infoService.listPaginated(securedActions, user, page, pageSize, threadIds, statuses)
					.onSuccess(news -> render(request, news))
					.onFailure(ex -> renderError(request));
			} else {
				unauthorized(request);
			}
		});
	}

	@Get("/api/v1/infos/last/:" + InfoController.RESULT_SIZE_PARAMETER)
	@ApiDoc("List last infos, accept query param resultSize.")
	@SecuredAction(value = "actualites.infos.list", right = ROOT_RIGHT + "|listInfos")
	public void getLastInfos(HttpServerRequest request) {
		infoController.listLastPublishedInfos(request);
	}

	@Get("/api/v1/infos/:" + INFO_RESOURCE_ID)
	@ApiDoc("Retrieve : retrieve an Info in thread by thread and by id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "info.read", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|getInfo")
	public void getInfos(HttpServerRequest request) {
		infoController.getSingleInfo(request);
	}

	@Delete("/api/v1/infos/:" + INFO_RESOURCE_ID)
	@ApiDoc("Delete : Real delete an Info in thread by thread and by id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|delete")
	public void removeInfo(HttpServerRequest request) {
		infoController.delete(request);
	}

	@Get("/api/v1/infos/:id/shares")
	@ApiDoc("Get share info")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|shareInfo")
	public void getShareInfo(HttpServerRequest request) {
		infoController.shareInfo(request);
	}

	@Put("/api/v1/infos/:id/shares")
	@ApiDoc("Update share info")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|shareInfo")
	public void updateShareInfo(HttpServerRequest request) {
		infoController.shareResourceInfo(request);
	}

	@Get("/api/v1/infos/:" + INFO_RESOURCE_ID + "/timeline")
	@ApiDoc("Get timeline info")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.publish", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|getInfoTimeline")
	public void getInfoTimeline(HttpServerRequest request) {
		infoController.getInfoTimeline(request);
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
				}
				Events events = resource.getString("status").equals("1") ? Events.DRAFT : Events.CREATE_AND_PENDING;

				Handler<Either<String, JsonObject>> handler = eventHelper.onCreateResource(request, RESOURCE_NAME, notEmptyResponseHandler(request));
				if (events == Events.CREATE_AND_PENDING) {
					handler = event -> {
						if (event.isRight()) {
							eventHelper.onCreateResource(request, RESOURCE_NAME);
							JsonObject info = event.right().getValue();
							String infoId = info.getLong("id").toString();
							String threadId = info.getString("thread_id");
							String title = info.getString("title");
							notificationTimelineService.notifyTimeline(request, user, threadId, infoId, title, NEWS_SUBMIT_EVENT_TYPE);
							renderJson(request, event.right().getValue(), 200);
						} else {
							JsonObject error = new JsonObject().put("error", event.left().getValue());
							renderJson(request, error, 400);
						}
					};
				}
				infoService.create(resource, user, events.name() ,handler);
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
				infoService.create(resource, user, Events.CREATE_AND_PUBLISH.toString(), handler);
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

				infoService.retrieve(infoId, infoEither -> {
					if(infoEither.isLeft()) {
						notFound(request);
						return;
					}
					JsonObject actualInfo = infoEither.right().getValue();
					int actualStatus = actualInfo.getInteger("status");
					int targetStatus = resource.getInteger("status");
					String notificationFromTransition = getNotificationFromTransition(targetStatus, actualStatus);
					Events event = getEventFromTransition(targetStatus, actualStatus);
					if (notificationFromTransition != null) {
						if (resource.getString("title") == null) {
							resource.put("title", actualInfo.getString("title"));
						}
						notifyOwner(request, user, resource, infoId, actualInfo, notificationFromTransition);
					}
					if (event == Events.UPDATE || event == Events.PENDING) {
						if (!resource.containsKey("expiration_date")) {
							resource.putNull("expiration_date");
						}
						if (!resource.containsKey("publication_date")) {
							resource.putNull("publication_date");
						}
					}
					infoService.update(infoId, resource, user, event.name(), notEmptyResponseHandler(request));
				});
			});
		});
	}

	private String getNotificationFromTransition(int updatedStatus, int actualStatus) {
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
				infoService.getStats(user)
					.onSuccess(stats -> render(request, stats))
					.onFailure(ex -> renderError(request));
			} else {
				unauthorized(request);
			}
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
