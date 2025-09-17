package net.atos.entng.actualites.controllers.v1;

import net.atos.entng.actualites.Actualites;
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

public class ThreadControllerV1 extends ControllerHelper {

	public static final int DEFAULT_PAGE_SIZE = 20;

    protected final ThreadService threadService;
    protected final EventHelper eventHelper;

    public ThreadControllerV1(EventBus eb) {
        this.threadService = new ThreadServiceSqlImpl().setEventBus(eb);
        final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Actualites.class.getSimpleName());
        eventHelper = new EventHelper(eventStore);
    }

    @Get("/api/v1/infos")
	@SecuredAction("actualites.threads.listthreads")
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
		final int pageSize = pageSizeParsed;
		
		// threadsIds argument
		final List<Integer> threadsIds = new ArrayList<>();
		final String threadsIdsParam = request.params().get("threadsIds");
		if (!isEmpty(threadsIdsParam)) {
			for (String threadId : threadsIdsParam.split(",")) {
				try {
					threadsIds.add(Integer.parseInt(threadId));
				} catch (NumberFormatException e) {
					// Pas une valeur numérique, on skip !
				}
			}
		}

		// status argument
        final NewsStatus status = NewsStatus.valueOf(request.params().get("status").toUpperCase());

		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				threadService.list(securedActions, user, page, pageSize, threadsIds, status)
					.onSuccess(threads -> render(request, threads))
					.onFailure(ex -> renderError(request));
			} else {
				unauthorized(request);
			}
		});
	}

}
