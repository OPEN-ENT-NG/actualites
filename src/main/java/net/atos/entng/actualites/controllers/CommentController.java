/*
 * Copyright © Région Nord Pas de Calais-Picardie,  Département 91, Région Aquitaine-Limousin-Poitou-Charentes, 2016.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package net.atos.entng.actualites.controllers;


import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

import java.util.List;
import java.util.Collections;

import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.filters.CommentFilter;
import net.atos.entng.actualites.filters.InfoFilter;
import net.atos.entng.actualites.services.InfoService;
import net.atos.entng.actualites.services.ThreadService;
import net.atos.entng.actualites.services.impl.InfoServiceSqlImpl;

import net.atos.entng.actualites.services.impl.ThreadServiceSqlImpl;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;

public class CommentController extends ControllerHelper {

	private static final String COMMENT_ID_PARAMETER = "id";

	private static final String SCHEMA_COMMENT_CREATE = "createComment";
	private static final String SCHEMA_COMMENT_UPDATE = "updateComment";

	private static final String EVENT_TYPE = "NEWS";
	private static final String NEWS_COMMENT_EVENT_TYPE = EVENT_TYPE + "_COMMENT";
	private static final int OVERVIEW_LENGTH = 50;

	protected final InfoService infoService;
	protected final ThreadService threadService;

	public CommentController(){
		this.infoService = new InfoServiceSqlImpl();
		this.threadService = new ThreadServiceSqlImpl();
	}

	@Put("/info/:"+Actualites.INFO_RESOURCE_ID+"/comment")
	@ApiDoc("Comment : Add a comment to an Info by info id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "info.comment", type = ActionType.RESOURCE)
	public void comment(final HttpServerRequest request) {
		final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_COMMENT_CREATE, new Handler<JsonObject>() {
					@Override
					public void handle(JsonObject resource) {
						final int infoIdFromBody = resource.getInteger("info_id", -1);
						if(infoIdFromBody == Integer.parseInt(infoId)) {
							final String commentText = resource.getString("comment");
							final String title = resource.getString("title");
							resource.remove("title");
							Handler<Either<String, JsonObject>> handler = new Handler<Either<String, JsonObject>>() {
								@Override
								public void handle(Either<String, JsonObject> event) {
									if (event.isRight()) {
										JsonObject comment = event.right().getValue();
										String commentId = comment.getLong("id").toString();
										notifyTimeline(request, user, infoId, commentId, title, commentText, NEWS_COMMENT_EVENT_TYPE);
										renderJson(request, event.right().getValue(), 200);
									} else {
										JsonObject error = new JsonObject().put("error", event.left().getValue());
										renderJson(request, error, 400);
									}
								}
							};
							crudService.create(resource, user, handler);
						} else {
							log.warn("User {0} tried to post a comment for info {1} by using a different id {2}",
								user.getLogin(), infoIdFromBody, infoId);
							forbidden(request);
						}
					}
				});
			}
		});
	}

	@Put("/info/:"+Actualites.INFO_RESOURCE_ID+"/comment/:"+COMMENT_ID_PARAMETER)
	@ApiDoc("Comment : modify a comment of an Info by info and comment id")
	@ResourceFilter(InfoFilter.class)
	@SecuredAction(value = "info.comment", type = ActionType.RESOURCE)
	public void updateComment(final HttpServerRequest request) {
		final String commentId = request.params().get(COMMENT_ID_PARAMETER);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
							RequestUtils.bodyToJson(request, pathPrefix + SCHEMA_COMMENT_UPDATE, new Handler<JsonObject>() {
							@Override
							public void handle(JsonObject resource) {
								final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
								final int infoIdFromBody = resource.getInteger("info_id", -1);
								if(infoIdFromBody == Integer.parseInt(infoId)) {
									crudService.update(commentId, resource, user, notEmptyResponseHandler(request));
								} else {
									log.warn("User {0} tried to post a comment for info {1} by using a different id {2}",
										user.getLogin(), infoIdFromBody, infoId);
									forbidden(request);
								}
							}
						});
					}
				});
			}

	@Delete("/info/:"+Actualites.INFO_RESOURCE_ID+"/comment/:"+COMMENT_ID_PARAMETER)
	@ApiDoc("Comment : delete a comment by comment id ")
	@ResourceFilter(CommentFilter.class)
	@SecuredAction(value = "info.comment", type = ActionType.RESOURCE)
	public void deleteComment(final HttpServerRequest request) {
		final String commentId = request.params().get(COMMENT_ID_PARAMETER);
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				crudService.delete(commentId, user,notEmptyResponseHandler(request));
			}
		});
	}

	private void notifyTimeline(final HttpServerRequest request, final UserInfos user, final String infoId, final String commentId, final String title, final String commentText, final String eventType){
		if (eventType.equals(NEWS_COMMENT_EVENT_TYPE)) {
			infoService.retrieve(infoId, new Handler<Either<String, JsonObject>>() {
				@Override
				public void handle(Either<String, JsonObject> event) {
					if (event.isRight()) {
						// get all ids
						JsonObject info = event.right().getValue();
						String infoOwner = info.getString("owner");
						if (infoOwner != null) {
							sendNotify(request, Collections.singletonList(infoOwner), user, infoId, commentId, title, commentText, "news.news-comment");
						}
					}
				}
			});
		}
	}

	private void sendNotify(final HttpServerRequest request, final List<String> ids, final UserInfos user, final String infoId, final String commentId, final String title, String commentText, final String notificationName){
		if (infoId != null && !infoId.isEmpty() && commentId != null && !commentId.isEmpty() && user != null && !commentText.isEmpty()) {
			String overview = commentText.replaceAll("<br>", "");
			if(overview.length() > OVERVIEW_LENGTH){
				overview = overview.substring(0, OVERVIEW_LENGTH);
			}
			JsonObject params = new JsonObject()
				.put("profilUri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
				.put("username", user.getUsername())
				.put("info", title)
				.put("actuUri", pathPrefix + "#/view/info/" + infoId + "/comment/" + commentId)
				.put("overview", overview);
			params.put("resourceUri", params.getString("actuUri"));

			notification.notifyTimeline(request, notificationName, user, ids, infoId, params);
		}
	}

}
