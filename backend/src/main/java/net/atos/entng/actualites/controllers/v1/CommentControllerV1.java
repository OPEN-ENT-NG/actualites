package net.atos.entng.actualites.controllers.v1;

import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.filters.CommentFilter;
import net.atos.entng.actualites.filters.InfoFilter;
import net.atos.entng.actualites.filters.UpdateCommentFilter;
import net.atos.entng.actualites.services.InfoService;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

public class CommentControllerV1 extends ControllerHelper {

	private static final String COMMENT_ID_PARAMETER = "id";
	private static final String SCHEMA_COMMENT_CREATE = "createComment";
	private static final String SCHEMA_COMMENT_UPDATE = "updateComment";
	private static final String EVENT_TYPE = "NEWS";
	private static final String NEWS_COMMENT_EVENT_TYPE = EVENT_TYPE + "_COMMENT";
	private static final int OVERVIEW_LENGTH = 50;
	private static final String FIELD_INFO_ID = "info_id";
	private static final String FIELD_COMMENT = "comment";
	private static final String FIELD_TITLE = "title";
	private static final String FIELD_OWNER = "owner";

	protected InfoService infoService;
    public static final String ROOT_RIGHT = "net.atos.entng.actualites.controllers.CommentController";

	@Override
	protected boolean shouldNormalizedRights() {
		return true;
	}

	@Override
	protected Function<JsonObject, Optional<String>> jsonToOwnerId() {
		return json -> Optional.of(json.getString(FIELD_OWNER));
	}

	public void setInfoService(InfoService infoService) {
		this.infoService = infoService;
	}

    @Get("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID + "/comments")
    @ApiDoc("Comment : Get info's comments")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "info.read", type = ActionType.RESOURCE, right = InfosControllerV1.ROOT_RIGHT + "|getInfoComments")
    public void getInfoComments(final HttpServerRequest request) {
		final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
		Long id;
		try {
			id = Long.parseLong(infoId);
		} catch (NumberFormatException nfe) {
			badRequest(request);
			return;
		}
		infoService.listComments(id, arrayResponseHandler(request));
	}

    @Post("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID + "/comments")
    @ApiDoc("Comment : Add a comment to an Info by info id")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "info.comment", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|comment")
    public void createComment(final HttpServerRequest request) {
		final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, user -> {
			RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_COMMENT_CREATE, resource -> {
				final int infoIdFromBody = resource.getInteger(FIELD_INFO_ID, -1);
				if(infoIdFromBody == Integer.parseInt(infoId)) {
					final String commentText = resource.getString(FIELD_COMMENT);
					resource.remove(FIELD_TITLE);
					infoService.retrieve(infoId, false,  infoResult -> {
						Handler<Either<String, JsonObject>> handler = event -> {
							if (event.isRight()) {
								JsonObject comment = event.right().getValue();
								JsonObject info = infoResult.right().getValue();
								String commentId = comment.getLong("id").toString();
								notifyTimeline(request, user, infoId, commentId, info.getString("title"), commentText, NEWS_COMMENT_EVENT_TYPE);
								renderJson(request, event.right().getValue(), 200);
							} else {
								JsonObject error = new JsonObject().put("error", event.left().getValue());
								renderJson(request, error, 400);
							}
						};
						crudService.create(resource, user, handler);
					});
				} else {
					log.warn(String.format("User %s tried to post a comment for info %s by using a different id %s", user.getLogin(), infoIdFromBody, infoId));
					forbidden(request);
				}
			});
		});
	}

    @Put("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID + "/comments/:id")
    @ApiDoc("Comment : modify a comment of an Info by info and comment id")
    @ResourceFilter(UpdateCommentFilter.class)
    @SecuredAction(value = "info.comment", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|updateComment")
    public void updateComment(final HttpServerRequest request) {
		final String commentId = request.params().get(COMMENT_ID_PARAMETER);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_COMMENT_UPDATE, new Handler<JsonObject>() {
					@Override
					public void handle(JsonObject resource) {
						final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
						final int infoIdFromBody = resource.getInteger(FIELD_INFO_ID, -1);
						if(infoIdFromBody == Integer.parseInt(infoId)) {
							crudService.update(commentId, resource, user, notEmptyResponseHandler(request));
						} else {
							log.warn(String.format("User %s tried to post a comment for info %s by using a different id %s", user.getLogin(), infoIdFromBody, infoId));
							forbidden(request);
						}
					}
				});
			}
		});
	}

    @Delete("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID + "/comments/:id")
    @ApiDoc("Comment : delete a comment by comment id ")
    @ResourceFilter(CommentFilter.class)
    @SecuredAction(value = "info.comment", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|deleteComment")
    public void deleteComment(final HttpServerRequest request) {
		final String commentId = request.params().get(COMMENT_ID_PARAMETER);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				crudService.delete(commentId, user, notEmptyResponseHandler(request));
			}
		});
	}

	private void notifyTimeline(final HttpServerRequest request, final UserInfos user, final String infoId, final String commentId, final String title, final String commentText, final String eventType){
		if (eventType.equals(NEWS_COMMENT_EVENT_TYPE)) {
			infoService.retrieve(infoId, true, event -> {
				if (event.isRight()) {
					// get all ids
					JsonObject info = event.right().getValue();
					String infoOwner = info.getString(FIELD_OWNER);
					if (infoOwner != null) {
						sendNotify(request, Collections.singletonList(infoOwner), user, infoId, commentId, title, commentText, "news.news-comment");
					}
				}
			});
		}
	}

	private void sendNotify(final HttpServerRequest request, final List<String> ids, final UserInfos user, final String infoId, final String commentId, final String title, String commentText, final String notificationName){
		if (infoId != null && !infoId.isEmpty() && commentId != null && !commentId.isEmpty() && user != null && !commentText.isEmpty()) {
			String overview = commentText.replace("<br>", "");
			if(overview.length() > OVERVIEW_LENGTH){
				overview = overview.substring(0, OVERVIEW_LENGTH);
			}
			JsonObject params = new JsonObject()
				.put("profilUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
				.put("username", user.getUsername())
				.put("info", title)
				.put("resourceUri", pathPrefix + "#/view/info/" + infoId + "/comment/" + commentId)
				.put("overview", overview);

			notification.notifyTimeline(request, notificationName, user, ids, infoId, params);
		}
	}

}
