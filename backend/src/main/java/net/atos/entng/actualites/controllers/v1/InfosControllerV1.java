package net.atos.entng.actualites.controllers.v1;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.controllers.InfoController;
import net.atos.entng.actualites.filters.InfoFilter;
import net.atos.entng.actualites.services.InfoService;
import net.atos.entng.actualites.services.ThreadService;
import net.atos.entng.actualites.services.impl.ThreadServiceSqlImpl;
import net.atos.entng.actualites.to.NewsStatus;

import static fr.wseduc.webutils.Utils.isEmpty;

import java.util.ArrayList;
import java.util.List;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import fr.wseduc.rs.Get;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;

public class InfosControllerV1 extends ControllerHelper {

	public static final int DEFAULT_PAGE_SIZE = 20;
	public static final int MAX_PAGE_SIZE = 100;

	protected InfoService infoService;
	private final InfoController infoContoller;
	private static final String ROOT_RIGHT = "net.atos.entng.actualites.controllers.InfoController";

    public InfosControllerV1(InfoController infoController) {
		this.infoContoller = infoController;
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

	@Get("/api/v1/infos/last")
	@ApiDoc("List last infos, accept query param resultSize.")
	@SecuredAction(value = "actualites.infos.list", right = ROOT_RIGHT + "|listInfos")
	public void getLastInfos(HttpServerRequest request) {
		infoContoller.listLastPublishedInfos(request);
	}

	@Get("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID)
	@ApiDoc("Retrieve : retrieve an Info in thread by thread and by id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "info.read", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|getInfo")
	public void getInfos(HttpServerRequest request) {
		infoContoller.getSingleInfo(request);
	}

	@Delete("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID)
	@ApiDoc("Delete : Real delete an Info in thread by thread and by id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|delete")
	public void removeInfo(HttpServerRequest request) {
		infoContoller.delete(request);
	}

	@Get("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID + "/shares")
	@ApiDoc("Get share info")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|shareInfo")
	public void getShareInfo(HttpServerRequest request) {
		infoContoller.shareInfo(request);
	}

	@Put("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID)
	@ApiDoc("Update share info")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|shareInfo")
	public void updateShareInfo(HttpServerRequest request) {
		infoContoller.shareInfoSubmit(request);
	}

	@Get("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID + "/timeline")
	@ApiDoc("Get share info")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "thread.publish", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|getInfoTimeline")
	public void getInfoTimeline(HttpServerRequest request) {
		infoContoller.getInfoTimeline(request);
	}

}
