package net.atos.entng.actualites.controllers;

import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.BaseController;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.actualites.cron.ExpiredNewsCleanupCron;
import net.atos.entng.actualites.cron.PublicationCron;

public class TaskController extends BaseController {
	protected static final Logger log = LoggerFactory.getLogger(TaskController.class);

	final PublicationCron publicationCron;

	final ExpiredNewsCleanupCron expiredNewsCleanupCron;

	public TaskController(PublicationCron publicationCron, ExpiredNewsCleanupCron expiredNewsCleanupCron) {
		this.publicationCron = publicationCron;
		this.expiredNewsCleanupCron = expiredNewsCleanupCron;
	}

	@Post("api/internal/publish-news")
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void publishNews(HttpServerRequest request) {
		log.info("Triggered news publication task");
		publicationCron.handle(0L);
		render(request, null, 202);
	}

	@Post("api/internal/cleanup-expired-news")
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void cleanupExpiredNews(HttpServerRequest request) {
		log.info("Triggered expired news cleanup task");
		expiredNewsCleanupCron.handle(0L);
		render(request, null, 202);
	}
}
