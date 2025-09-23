package net.atos.entng.actualites.controllers.v1;

import net.atos.entng.actualites.Actualites;
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
import org.entcore.common.user.UserUtils;

import fr.wseduc.rs.Get;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;

public class InfosControllerV1 extends ControllerHelper {

	public static final int DEFAULT_PAGE_SIZE = 20;
	public static final int MAX_PAGE_SIZE = 100;

    protected final ThreadService threadService;
    protected final EventHelper eventHelper;
	protected InfoService infoService;

    public InfosControllerV1(EventBus eb) {
        this.threadService = new ThreadServiceSqlImpl().setEventBus(eb);
        final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Actualites.class.getSimpleName());
        eventHelper = new EventHelper(eventStore);
    }

	public void setInfoService(InfoService infoService) {
        this.infoService = infoService;
    }

    @Get("/api/v1/infos")
	@SecuredAction("actualites.infos.list.page")
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

}
