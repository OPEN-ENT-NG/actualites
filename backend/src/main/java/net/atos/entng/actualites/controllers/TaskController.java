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
import net.atos.entng.actualites.cron.SuperAdmlPreferencesCleanupCron;

public class TaskController extends BaseController {
	protected static final Logger log = LoggerFactory.getLogger(TaskController.class);

	private final PublicationCron publicationCron;
	private final ExpiredNewsCleanupCron expiredNewsCleanupCron;
	private final SuperAdmlPreferencesCleanupCron superAdmlPreferencesCleanupCron;

	public TaskController(PublicationCron publicationCron, ExpiredNewsCleanupCron expiredNewsCleanupCron, SuperAdmlPreferencesCleanupCron superAdmlPreferencesCleanupCron) {
		this.publicationCron = publicationCron;
		this.expiredNewsCleanupCron = expiredNewsCleanupCron;
        this.superAdmlPreferencesCleanupCron = superAdmlPreferencesCleanupCron;
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

	@Post("api/internal/super-adml-preferences-cleanup")
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void superAdmlPreferencesCleanup(HttpServerRequest request) {
		log.info("Triggered expired news cleanup task");
		superAdmlPreferencesCleanupCron.handle(0L);
		render(request, null, 202);
	}
}
