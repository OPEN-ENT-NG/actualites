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

package net.atos.entng.actualites.services.impl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.actualites.to.NewsStatus;
import net.atos.entng.actualites.to.ResourceOwner;
import net.atos.entng.actualites.to.Rights;

import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;

import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.security.SecuredAction;
import net.atos.entng.actualites.services.ThreadService;
import net.atos.entng.actualites.to.NewsThread;

import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;

import static org.entcore.common.user.DefaultFunctions.ADMIN_LOCAL;

import static java.util.stream.Collectors.toList;

import io.vertx.core.eventbus.EventBus;


public class ThreadServiceSqlImpl implements ThreadService {

	private static final Logger log = LoggerFactory.getLogger(ThreadServiceSqlImpl.class);

	private final String threadsTable = "actualites.thread";
	private final String threadsSharesTable = "actualites.thread_shares";
	private final String infosTable = "actualites.info";
	private final String infosSharesTable = "actualites.info_shares";
	private final String usersTable = "actualites.users";

	private EventBus eb;

	public ThreadServiceSqlImpl() {
	}

	public ThreadServiceSqlImpl setEventBus(EventBus eb) {
		this.eb = eb;
		return this;
	}	

	@Override
	public void retrieve(String id, Handler<Either<String, JsonObject>> handler) {
		String query;
		JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		if (id != null) {
			query = "SELECT t.id as _id, t.title, t.icon, t.mode, t.created, t.modified, t.owner, u.username" +
				", json_agg(row_to_json(row(ts.member_id, ts.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM actualites.thread AS t" +
				" LEFT JOIN actualites.users AS u ON t.owner = u.id" +
				" LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN actualites.members AS m ON (ts.member_id = m.id AND m.group_id IS NOT NULL)" +
				" WHERE t.id = ? " +
				" GROUP BY t.id, u.username" +
				" ORDER BY t.modified DESC";
			values.add(Sql.parseId(id));
			Sql.getInstance().prepared(query, values, SqlResult.parseSharedUnique(handler));
		}
	}
	
	@Override
	public void retrieve(String id, UserInfos user, Handler<Either<String, JsonObject>> handler) {
		String query;
		JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		if (id != null && user != null) {
			List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}
			// Structures which the user is an ADML of.
			final List<String> admlStructuresIds = user.isADML() 
				? user.getFunctions().get(ADMIN_LOCAL).getScope() 
				: Collections.EMPTY_LIST;
			query = "SELECT t.id as _id, t.title, t.icon, t.mode, t.created, t.modified, t.structure_id, t.owner, u.username" +
				", json_agg(row_to_json(row(ts.member_id, ts.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM actualites.thread AS t" +
				" LEFT JOIN actualites.users AS u ON t.owner = u.id" +
				" LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN actualites.members AS m ON (ts.member_id = m.id AND m.group_id IS NOT NULL)" +
				" WHERE t.id = ? " +
				" AND (ts.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) +
				( admlStructuresIds.isEmpty() ? "" : " OR t.structure_id IN "+ Sql.listPrepared(admlStructuresIds)) +
				" OR t.owner = ?) " +
				" GROUP BY t.id, u.username" +
				" ORDER BY t.modified DESC";
			values.add(Sql.parseId(id));
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			for(String value : admlStructuresIds){
				values.add(value);
			}
			values.add(user.getUserId());
			Sql.getInstance().prepared(query.toString(), values, SqlResult.parseSharedUnique(handler));
		}
	}

	@Override
	public void list(UserInfos user, Handler<Either<String, JsonArray>> handler) {
		if (user != null) {
			String query;
			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			List<String> gu = new ArrayList<>();
			gu.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				gu.addAll(user.getGroupsIds());
			}
			// Structures which the user is an ADML of.
			final List<String> admlStructuresIds = user.isADML() 
				? user.getFunctions().get(ADMIN_LOCAL).getScope() 
				: Collections.EMPTY_LIST;
			final Object[] groupsAndUserIds = gu.toArray();
			query = "SELECT t.id as _id, t.title, t.icon, t.mode, t.created, t.modified, t.structure_id, t.owner, u.username" +
				", json_agg(row_to_json(row(ts.member_id, ts.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM actualites.thread AS t" +
				" LEFT JOIN actualites.users AS u ON t.owner = u.id" +
				" LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN actualites.members AS m ON (ts.member_id = m.id AND m.group_id IS NOT NULL)" +
				" WHERE ts.member_id IN " + Sql.listPrepared(groupsAndUserIds) +
				" OR t.owner = ? " +
				( admlStructuresIds.isEmpty() ? "" : " OR t.structure_id IN "+ Sql.listPrepared(admlStructuresIds)) +
				" GROUP BY t.id, u.username" +
				" ORDER BY t.modified DESC";
			values = new fr.wseduc.webutils.collections.JsonArray(gu).add(user.getUserId());
			for(String value : admlStructuresIds){
				values.add(value);
			}
			Sql.getInstance().prepared(query, values, SqlResult.parseShared(handler));
		}
	}

	@Override
	public void getPublishSharedWithIds(String threadId, final Handler<Either<String, JsonArray>> handler) {
		this.retrieve(threadId, new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {
				JsonArray sharedWithIds = new fr.wseduc.webutils.collections.JsonArray();
				if (event.isRight()) {
					try {
						JsonObject thread = event.right().getValue();
						if (thread.containsKey("owner")) {
							JsonObject owner = new JsonObject();
							owner.put("userId", thread.getString("owner"));
							sharedWithIds.add(owner);
						}
						if (thread.containsKey("shared")) {
							JsonArray shared = thread.getJsonArray("shared");
							for(Object jo : shared){
								if(((JsonObject) jo).containsKey("net-atos-entng-actualites-controllers-InfoController|publish")){
									sharedWithIds.add(jo);
								}
							}
							handler.handle(new Either.Right<String, JsonArray>(sharedWithIds));
						}
						else {
							handler.handle(new Either.Right<String, JsonArray>(new fr.wseduc.webutils.collections.JsonArray()));
						}
					}
					catch (Exception e) {
						handler.handle(new Either.Left<String, JsonArray>("Malformed response : " + e.getClass().getName() + " : " + e.getMessage()));
					}
				}
				else {
					handler.handle(new Either.Left<String, JsonArray>(event.left().getValue()));
				}
			}
		});
	}


	/**
	 * List threads visible by the given user. It includes :
	 * - threads created by the user
	 * - threads shared to the user or with one of its groups
	 * - threads containing news that are shared to the user or one of its groups
	 * @param user info about the user (needed for groups)
	 * @return the list of the threads visible by the user
	 */
	@Override
	public Future<List<NewsThread>> list(Map<String, SecuredAction> securedActions, UserInfos user) {
		final Promise<List<NewsThread>> promise = Promise.promise();
		if (user == null) {
			promise.fail("user not provided");
		} else {
			// 1. Get all ids corresponding to the user

			List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}

			// 2. Prepare SQL request

			final String ids = Sql.listPrepared(groupsAndUserIds.toArray());
			String query =
					"WITH thread_with_info_for_user AS ( " +
					"    SELECT DISTINCT i.thread_id AS id " +
					"    FROM " + infosTable + " AS i " +
					"        LEFT JOIN " + infosSharesTable + " AS ish ON i.id = ish.resource_id " +
					"    WHERE " +
					"		 ( " +
					"			 ish.member_id IN " + ids + " " +
					"			 OR " +
					"			 i.owner = ? " +
					"		 ) " +
					"		 AND " +
					"		 (i.publication_date <= LOCALTIMESTAMP OR i.publication_date IS NULL) " + // Publish date crossed
					"		 AND " +
					"		 (i.expiration_date > LOCALTIMESTAMP OR i.expiration_date IS NULL) " + // Expiration date not crossed
					"		 AND " +
					"		 (i.status = " + NewsStatus.PUBLISHED.ordinal() + ") " + // PUBLISHED
					"), thread_for_user AS ( " +
					"    SELECT t.id, array_agg(DISTINCT tsh.action) AS rights " +
					"    FROM " + threadsTable + " AS t " +
					"        INNER JOIN " + threadsSharesTable + " AS tsh ON t.id = tsh.resource_id " +
					"    WHERE tsh.member_id IN " + ids + " " +
					"    GROUP BY t.id, tsh.member_id " +
					") SELECT t.id, t.owner, u.username AS owner_name, u.deleted as owner_deleted, t.title, t.icon," +
					"    t.created, t.modified, t.structure_id, max(thread_for_user.rights) as rights " + // note : we can use max() here only because the rights are inclusive of each other
					"    FROM " + threadsTable + " AS t " +
					"        LEFT JOIN thread_for_user ON thread_for_user.id = t.id " +
					"        LEFT JOIN " + usersTable + " AS u ON t.owner = u.id " +
					"    WHERE t.owner = ? " +
					"       OR t.id IN (SELECT id from thread_with_info_for_user) " +
					"       OR t.id IN (SELECT id from thread_for_user) " +
					"	 GROUP BY t.id, t.owner, owner_name, owner_deleted, t.title, t.icon, t.created, t.modified, t.structure_id " +
					"    ORDER BY t.title";
			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(user.getUserId());
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(user.getUserId());

			// 3. Retrieve & parse data

			Sql.getInstance().prepared(query, values, (sqlResult) -> {
				final Either<String, JsonArray> result = SqlResult.validResult(sqlResult);
				if (result.isLeft()) {
					promise.fail(result.left().getValue());
				} else {
					try {
						List<NewsThread> pojo = result.right().getValue().stream().filter(row -> row instanceof JsonObject).map(o -> {
							final JsonObject row = (JsonObject)o;
							final ResourceOwner owner = new ResourceOwner(
									row.getString("owner"),
									row.getString("owner_name"),
									row.getBoolean("owner_deleted")
							);
							final List<String> rawRights = SqlResult.sqlArrayToList(row.getJsonArray("rights"), String.class);
							return new NewsThread(
										row.getInteger("id"),
										row.getString("title"),
										row.getString("icon"),
										row.getString("created"),
										row.getString("modified"),
										row.getString("structure_id"),
										owner,
										Rights.fromRawRights(securedActions, rawRights)
									);
						}).collect(toList());
						promise.complete(pojo);
					} catch (Exception e) {
						log.error("Failed to parse JsonObject", e);
						promise.fail(e);
					}
				}
			});
		}
		return promise.future();
	}

    public Future<Void> attachThreadsWithNullStructureToDefault() {
		// 1. Get IDs of owner of threads without a structure.
		return getIdsOfOwnersForNullStructure()
		// 2. Get structure infos of threads owners.
		.compose(ids -> getDefaultStructureOfUsers(ids))
		// 3. Assign a default structure to eligible threads.
		.compose(map -> assignDefaultOwnerStructure(map));
	}

	/** Get IDs of owner of threads without a structure. */
    private Future<List<String>> getIdsOfOwnersForNullStructure() {
		final Promise<List<String>> promise = Promise.promise();
		String query =
			" SELECT DISTINCT t.owner AS id " +
			" FROM " + threadsTable + " AS t " +
			" WHERE t.owner IS NOT NULL AND t.structure_id IS NULL ";
		Sql.getInstance().prepared(query, new fr.wseduc.webutils.collections.JsonArray(), (sqlResult) -> {
			final Either<String, JsonArray> result = SqlResult.validResult(sqlResult);
			if (result.isLeft()) {
				promise.fail(result.left().getValue());
			} else {
				try {
					final List<String> ids = result.right().getValue()
						.stream()
						.filter(row -> row instanceof JsonObject)
						.map(JsonObject.class::cast)
						.map(row -> row.getString("id"))
						.collect(toList());
					promise.complete(ids);
				} catch (Exception e) {
					promise.fail(e);
				}
			}
		});
		return promise.future();
	}

	/** Retrieve the default structure of users. */
	private Future<Map<String, String>> getDefaultStructureOfUsers(final List<String> ids) {
		return loadUsersDetails(ids)
			.map( results -> {
				final Map<String, String> map = new HashMap<>(results.size());
				results.stream()
					.filter(row -> row instanceof JsonObject)
					.map(JsonObject.class::cast)
					.forEach(result -> {
						// TODO debug
						map.put(result.getString("id"), result.getString("sturcture"));
					});
				return map;
			});
	}

    /**
     * Loads additional details about users.
     * @param eb the event bus
     * @param userIndex the user index
     * @return a Future representing the completion of the operation
     */
    private Future<JsonArray> loadUsersDetails(final List<String> ids) {
		Promise<JsonArray> promise = Promise.promise();
		JsonObject action = new JsonObject()
			.put("action", "list-users")
			.put("userIds", new JsonArray(ids))
			//.put("itself", Boolean.FALSE)
			//.put("excludeUserId", userId)
		;
		eb.request("directory", action, handlerToAsyncHandler(event -> {
			JsonArray res = event.body().getJsonArray("result", new JsonArray());
			if ("ok".equals(event.body().getString("status")) && res != null) {
				promise.complete(res);
			} else {
				promise.fail(event.body().getString("message"));
			}
		}));
		return promise.future();
    }

	/** Set the structure ID of threads with their owner's default one. */
	private Future<Void> assignDefaultOwnerStructure(final Map<String, String> defaultOwnerStructures) {
		final Promise<Void> promise = Promise.promise();
		promise.fail("TODO");
		return promise.future();
	}
}
