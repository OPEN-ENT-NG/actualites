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

package net.atos.entng.actualites.services;

import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import net.atos.entng.actualites.to.News;
import net.atos.entng.actualites.to.NewsComplete;
import net.atos.entng.actualites.to.NewsStatus;

import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.Map;

public interface InfoService {

	/**
	 * Create new info in database and create a new revision.
	 * @param data new info
	 * @param user user creating info
	 * @param eventStatus revision event name
	 * @param handler result handler
	 */
	public void create(JsonObject data, UserInfos user, String eventStatus, final Handler<Either<String, JsonObject>> handler);

	/**
	 * Update info in database and create a new revision.
	 * @param id info id
	 * @param data info values
	 * @param user user updating info
	 * @param eventStatus revision event name
	 * @param handler result handler
	 */
	public void update(String id, JsonObject data, UserInfos user, String eventStatus, Handler<Either<String, JsonObject>> handler);

	/**
	 * Update a news content with a transformed content. The content version will be set to 1. This
	 * method immediately return and error is not propagated as this doesn't concern the caller
	 * @param newsComplete
	 */
	void transformerUpdateQuietly(News newsComplete);

	public void retrieve(String id, Handler<Either<String, JsonObject>> handler);
	
	public void retrieve(String id, UserInfos user, boolean originalContent, Handler<Either<String, JsonObject>> handler);

	public void list(UserInfos user, boolean optimized, Handler<Either<String, JsonArray>> handler);

	public void listComments(Long infoId, Handler<Either<String, JsonArray>> handler);

	public void listShared(Long infoId, Handler<Either<String, JsonArray>> handler);

	public void listByThreadId(String id, UserInfos user, Handler<Either<String, JsonArray>> handler);

	public void listLastPublishedInfos(UserInfos user, int resultSize, boolean optimized, Handler<Either<String, JsonArray>> handler);

	public void listForLinker(UserInfos user, Handler<Either<String, JsonArray>> handler);

	public void getSharedWithIds(String infoId, Handler<Either<String, JsonArray>> handler);

	/**
	 * Get revisions filtered on infoId.
	 * @param infoId info id.
	 * @param handler result handler.
	 */
	public void getRevisions(Long infoId, Handler<Either<String, JsonArray>> handler);

	public void getOwnerInfo(String infoId, Handler<Either<String, JsonObject>> handler);

	public Future<List<News>> listPaginated(Map<String, SecuredAction> securedActions, UserInfos user, int page, int pageSize, Integer threadId);

	public Future<List<News>> listPaginated(Map<String, SecuredAction> securedActions, UserInfos user, int page, int pageSize, List<Integer> threadIds, List<NewsStatus> statuses);

	public Future<NewsComplete> getFromId(Map<String, SecuredAction> securedActions, UserInfos user, int infoId, boolean originalContent);

	/**
	 * Get statistics about threads and infos grouped by status
	 * @param user user requesting stats
	 * @return Future containing stats with threads array including id, infosCount and status breakdown
	 */
	public Future<JsonObject> getStats(UserInfos user);

}
