package net.atos.entng.actualites.controllers.v1;

import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.controllers.InfoController;
import net.atos.entng.actualites.filters.CreateInfoFilter;
import net.atos.entng.actualites.filters.InfoFilter;
import net.atos.entng.actualites.services.InfoService;
import net.atos.entng.actualites.services.NotificationTimelineService;
import net.atos.entng.actualites.to.NewsStatus;

import static fr.wseduc.webutils.Utils.isEmpty;
import static net.atos.entng.actualites.controllers.InfoController.*;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

import java.util.ArrayList;
import java.util.List;

import net.atos.entng.actualites.utils.Events;
import org.apache.commons.lang3.StringUtils;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;

public class InfosControllerV1 extends ControllerHelper {

	public static final int DEFAULT_PAGE_SIZE = 20;
	public static final int MAX_PAGE_SIZE = 100;

	protected InfoService infoService;
	private final NotificationTimelineService notificationTimelineService;
	private final InfoController infoController;
	private final EventHelper eventHelper;
	private static final String ROOT_RIGHT = "net.atos.entng.actualites.controllers.InfoController";

    public InfosControllerV1(InfoController infoController,NotificationTimelineService notificationTimelineService) {
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
		String statusParam = request.params().get("status");
        final NewsStatus status = !isEmpty(statusParam) ? NewsStatus.valueOf(statusParam.toUpperCase()) : NewsStatus.PUBLISHED;

		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				infoService.listPaginated(securedActions, user, page, pageSize, threadIds, status)
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

	@Get("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID)
	@ApiDoc("Retrieve : retrieve an Info in thread by thread and by id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "info.read", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|getInfo")
	public void getInfos(HttpServerRequest request) {
		infoController.getSingleInfo(request);
	}

	@Delete("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID)
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

	@Get("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID + "/timeline")
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
				String status  = resource.getString("status");
				if (StringUtils.isEmpty(status) || !(status.equals("1") || status.equals("2"))) {
					JsonObject error = new JsonObject().put("error", "Status should be in DRAFT or PENDING");
					renderJson(request, error, 400);
				}
				String events = resource.getString("status").equals("1") ? Events.DRAFT.name() : Events.CREATE_AND_PENDING.name();

				Handler<Either<String, JsonObject>> handler = eventHelper.onCreateResource(request, RESOURCE_NAME, notEmptyResponseHandler(request));
				if (events.equals("CREATE_AND_PENDING")) {
					handler = event -> {
						if (event.isRight()) {
							eventHelper.onCreateResource(request, RESOURCE_NAME);
							JsonObject info = event.right().getValue();
							String infoId = info.getLong("id").toString();
							String threadId = info.getString("thread_id");
							String title = info.getString("title");
							notificationTimelineService.notifyTimeline(request, user, threadId, infoId, title, NEWS_SUBMIT_EVENT_TYPE, pathPrefix);
							renderJson(request, event.right().getValue(), 200);
						} else {
							JsonObject error = new JsonObject().put("error", event.left().getValue());
							renderJson(request, error, 400);
						}
					};
				}
				infoService.create(resource, user, events ,handler);
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
				resource.put("status", 3); //PUBLISH
				final Handler<Either<String, JsonObject>> handler = eventHelper.onCreateResource(request, RESOURCE_NAME, notEmptyResponseHandler(request));
				infoService.create(resource, user, Events.CREATE_AND_PUBLISH.toString(), handler);
			});
		});
	}

}
