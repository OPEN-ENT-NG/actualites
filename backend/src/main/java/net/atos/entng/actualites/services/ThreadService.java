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
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.to.NewsThread;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.Map;

public interface ThreadService {

	Future<String> getStructureId(String threadId);

	public void list(UserInfos user, Handler<Either<String, JsonArray>> handler);

	public void retrieve(String id, Boolean filterAdmlGroup, UserInfos user, Handler<Either<String, JsonObject>> handler);
	
	public Future<NewsThread> retrieve(String id, UserInfos user, Map<String, SecuredAction> securedActions);

	public void getPublishSharedWithIds(String threadId, Boolean filterAdmlGroup, UserInfos user, Handler<Either<String, JsonArray>> handler);

	Future<List<NewsThread>> list(Map<String, SecuredAction> securedActions, UserInfos user, Boolean viewHidden);

	/** Utility method to attach threads without a structure to their owner's structure, when a single one exists. */
	Future<Void> attachThreadsWithNullStructureToDefault();

	/**
	 * Retreive owner of the thread
	 * @param threadId
	 * @param handler
	 */
	public void getOwnerInfo(String threadId, Handler<Either<String, JsonObject>> handler);

}
