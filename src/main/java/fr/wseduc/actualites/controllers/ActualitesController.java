package fr.wseduc.actualites.controllers;


import java.util.Map;

import org.entcore.common.http.filter.ResourceFilter;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.http.RouteMatcher;
import org.vertx.java.platform.Container;

import fr.wseduc.actualites.controllers.helpers.InfoControllerHelper;
import fr.wseduc.actualites.controllers.helpers.StateControllerHelper;
import fr.wseduc.actualites.controllers.helpers.ThreadControllerHelper;
import fr.wseduc.actualites.filters.DeleteInfoFilter;
import fr.wseduc.actualites.filters.PublishFilter;
import fr.wseduc.actualites.filters.StateDraftFilter;
import fr.wseduc.actualites.filters.StatePendingFilter;
import fr.wseduc.actualites.filters.StatePublishedFilter;
import fr.wseduc.actualites.filters.StateTrashFilter;
import fr.wseduc.actualites.services.InfoService;
import fr.wseduc.actualites.services.ThreadService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.BaseController;

public class ActualitesController extends BaseController {

	private final ThreadControllerHelper threadHelper;
	private final InfoControllerHelper infoHelper;
	private final StateControllerHelper stateHelper;

	public ActualitesController(final String collection, final ThreadService threadService, final InfoService infoService) {
		this.threadHelper = new ThreadControllerHelper(collection, threadService);
		this.infoHelper = new InfoControllerHelper(infoService);
		this.stateHelper = new StateControllerHelper(infoService, threadService);
	}

	@Override
	public void init(Vertx vertx, Container container, RouteMatcher rm, Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
		super.init(vertx, container, rm, securedActions);
		this.threadHelper.init(vertx, container, rm, securedActions);
		this.infoHelper.init(vertx, container, rm, securedActions);
		this.stateHelper.init(vertx, container, rm, securedActions);
	}

	@Get("")
	@SecuredAction("actualites.view")
	public void view(final HttpServerRequest request) {
		renderView(request);
	}

	@Get("/threads")
	@ApiDoc("Get Thread by id.")
	@SecuredAction("actualites.threads.list")
	public void listThreads(final HttpServerRequest request) {
		threadHelper.listThreads(request);
	}

	@Post("/threads")
	@ApiDoc("Create a new Thread.")
	@SecuredAction("actualites.create")
	public void createThread(final HttpServerRequest request) {
		threadHelper.createThread(request);
	}

	@Get("/thread/:id")
	@ApiDoc("Get Thread by id.")
	@SecuredAction(value = "thread.read", type = ActionType.RESOURCE)
	public void getThread(final HttpServerRequest request) {
		threadHelper.retrieveThread(request);
	}

	@Put("/thread/:id")
	@ApiDoc("Update thread by id.")
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void updateThread(final HttpServerRequest request) {
		threadHelper.updateThread(request);
	}

	@Delete("/thread/:id")
	@ApiDoc("Delete thread by id.")
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void deleteThread(final HttpServerRequest request) {
		threadHelper.deleteThread(request);
	}


	@Get("/share/json/:id")
	@ApiDoc("Share thread by id.")
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void shareThread(final HttpServerRequest request) {
		threadHelper.shareThread(request);
	}

	@Put("/share/json/:id")
	@ApiDoc("Share thread by id.")
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void shareThreadSubmit(final HttpServerRequest request) {
		threadHelper.shareThreadSubmit(request);
	}

	@Put("/share/remove/:id")
	@ApiDoc("Remove Share by id.")
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void shareThreadRemove(final HttpServerRequest request) {
		threadHelper.shareThreadRemove(request);
	}


	@Get("/infos")
	@ApiDoc("Get infos in thread by status and by thread id.")
	@SecuredAction("actualites.infos.list")
	public void listInfos(final HttpServerRequest request) {
		// TODO IMPROVE : Security on Infos visibles by statuses / dates is not enforced
		infoHelper.listInfos(request);
	}

	@Get("/linker/infos")
	@ApiDoc("List infos without their content. Used by linker")
	@SecuredAction("actualites.infos.list")
	public void listInfosForLinker(final HttpServerRequest request) {
		// TODO IMPROVE : Security on Infos visibles by statuses / dates is not enforced
		infoHelper.listInfosForLinker(request);
	}


	@Get("/thread/:id/infos")
	@ApiDoc("Get infos in thread by thread id.")
	@SecuredAction(value = "thread.read", type = ActionType.RESOURCE)
	public void listThreadInfos(final HttpServerRequest request) {
		// TODO IMPROVE : Security on Infos visibles by statuses / dates is not enforced
		infoHelper.listThreadInfos(request);
	}


	@Post("/thread/:id/info")
	@ApiDoc("Add a new Info")
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
	public void createDraft(final HttpServerRequest request) {
		infoHelper.create(request);
	}

	@Put("/thread/:id/info/:infoid/draft")
	@ApiDoc("Update : update an Info in Draft state in thread by thread and by id")
	@ResourceFilter(StateDraftFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
	public void updateDraft(final HttpServerRequest request) {
		infoHelper.update(request);
	}

	@Put("/thread/:id/info/:infoid/pending")
	@ApiDoc("Update : update an Info in Draft state in thread by thread and by id")
	@ResourceFilter(StatePendingFilter.class)
	@SecuredAction(value = "thread.publish", type = ActionType.RESOURCE)
	public void updatePending(final HttpServerRequest request) {
		infoHelper.update(request);
	}

	@Put("/thread/:id/info/:infoid/published")
	@ApiDoc("Update : update an Info in Draft state in thread by thread and by id")
	@ResourceFilter(StatePublishedFilter.class)
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void updatePublished(final HttpServerRequest request) {
		infoHelper.update(request);
	}

	@Get("/thread/:id/info/:infoid")
	@ApiDoc("Retrieve : retrieve an Info in thread by thread and by id")
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
	public void getInfo(final HttpServerRequest request) {
		infoHelper.retrieve(request);
	}

	@Delete("/thread/:id/info/:infoid")
	@ApiDoc("Delete : Real delete an Info in thread by thread and by id")
	@ResourceFilter(DeleteInfoFilter.class)
	@SecuredAction(value = "thread.manager", type = ActionType.RESOURCE)
	public void delete(final HttpServerRequest request) {
		infoHelper.delete(request);
	}


	@Put("/thread/:id/info/:infoid/submit")
	@ApiDoc("Submit : Change an Info to Pending state in thread by thread and by id")
	@ResourceFilter(StateDraftFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
	public void submit(final HttpServerRequest request) {
		stateHelper.submit(request);
	}

	@Put("/thread/:id/info/:infoid/unsubmit")
	@ApiDoc("Cancel Submit : Change an Info to Draft state in thread by thread and by id")
	@ResourceFilter(StatePendingFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
	public void unsubmit(final HttpServerRequest request) {
		stateHelper.unsubmit(request);
	}

	@Put("/thread/:id/info/:infoid/publish")
	@ApiDoc("Publish : Change an Info to Published state in thread by thread and by id")
	@ResourceFilter(PublishFilter.class)
	@SecuredAction(value = "thread.publish", type = ActionType.RESOURCE)
	public void publish(final HttpServerRequest request) {
		stateHelper.publish(request);
	}

	@Put("/thread/:id/info/:infoid/unpublish")
	@ApiDoc("Unpublish : Change an Info to Draft state in thread by thread and by id")
	@ResourceFilter(StatePublishedFilter.class)
	@SecuredAction(value = "thread.publish", type = ActionType.RESOURCE)
	public void unpublish(final HttpServerRequest request) {
		stateHelper.unpublish(request);
	}

	@Put("/thread/:id/info/:infoid/thrash")
	@ApiDoc("Trash : Change an Info to Trash state in thread by thread and by id")
	@ResourceFilter(StateDraftFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
	public void trash(final HttpServerRequest request) {
		stateHelper.trash(request);
	}

	@Put("/thread/:id/info/:infoid/restore")
	@ApiDoc("Cancel Trash : Change an Info to Draft state in thread by thread and by id")
	@ResourceFilter(StateTrashFilter.class)
	@SecuredAction(value = "thread.contrib", type = ActionType.RESOURCE)
	public void restore(final HttpServerRequest request) {
		stateHelper.restore(request);
	}

	@Put("/thread/:id/info/:infoid/comment")
	@ApiDoc("Comment : Add a comment to an Info in thread by thread and by id")
	@SecuredAction(value = "thread.comment", type = ActionType.RESOURCE)
	public void comment(final HttpServerRequest request) {
		infoHelper.comment(request);
	}

	@Delete("/thread/:id/info/:infoid/comment/:commentid")
	@ApiDoc("Comment : delete a comment by thread id, info id and comment id ")
	@SecuredAction(value = "thread.comment", type = ActionType.RESOURCE)
	public void deleteComment(final HttpServerRequest request) {
		infoHelper.deleteComment(request);
	}
}
