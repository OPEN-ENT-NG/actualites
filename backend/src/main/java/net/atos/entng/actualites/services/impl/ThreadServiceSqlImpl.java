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

import com.google.common.collect.Lists;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.actualites.filters.RightConstants;
import net.atos.entng.actualites.services.ThreadService;
import net.atos.entng.actualites.services.impl.mapper.NewsThreadMapper;
import net.atos.entng.actualites.to.NewsStatus;
import net.atos.entng.actualites.to.NewsThread;
import net.atos.entng.actualites.to.Rights;
import net.atos.entng.actualites.to.Structure;
import net.atos.entng.actualites.utils.UserUtils;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;

import java.util.*;
import java.util.function.Function;

import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;
import static fr.wseduc.webutils.Utils.isNotEmpty;
import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;
import static org.entcore.common.user.DefaultFunctions.ADMIN_LOCAL;


public class ThreadServiceSqlImpl implements ThreadService {

	private static final Logger log = LoggerFactory.getLogger(ThreadServiceSqlImpl.class);

	private final String threadsTable = "actualites.thread";
	private final String threadsSharesTable = "actualites.thread_shares";
	private final String infosTable = "actualites.info";
	private final String infosSharesTable = "actualites.info_shares";
	private final String usersTable = "actualites.users";
	private final String membersTable = "actualites.members";
	private final String groupsTable = "actualites.groups";
	private EventBus eb;

	public ThreadServiceSqlImpl setEventBus(EventBus eb) {
		this.eb = eb;
		return this;
	}	

	@Override
	public void retrieve(String id, Boolean filterAdmlGroup, UserInfos user, Handler<Either<String, JsonObject>> handler) {
		String query;
		JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		if (id != null) {
			String filterAdml = "";
			if(filterAdmlGroup) {
				filterAdml = " AND (ts.adml_group IS NULL OR ts.adml_group = false) ";
			}
			query = "SELECT t.id as _id, t.title, t.icon, t.mode, t.created::text, t.modified::text, t.owner, u.username" +
				", json_agg(row_to_json(row(ts.member_id, ts.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM actualites.thread AS t" +
				" LEFT JOIN actualites.users AS u ON t.owner = u.id" +
				" LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN actualites.members AS m ON (ts.member_id = m.id AND m.group_id IS NOT NULL)" +
				" WHERE t.id = ? " + filterAdml +
				" GROUP BY t.id, u.username" +
				" ORDER BY t.modified DESC";
			values.add(Sql.parseId(id));
			Sql.getInstance().prepared(query, values, SqlResult.parseSharedUnique(handler));
		}
	}
	
	@Override
	public Future<NewsThread> retrieve(String id, UserInfos user, Map<String, SecuredAction> securedActions) {
		String query;
		final Promise<NewsThread> promise = Promise.promise();
		JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		if (id != null && user != null) {
			List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}
			query = "WITH user_groups AS MATERIALIZED ( " +
					"  SELECT id::varchar from ( "	+
					"    SELECT ? as id UNION ALL " +
					"    SELECT id FROM " + groupsTable + " WHERE id IN " + 	Sql.listPrepared(groupsAndUserIds.toArray()) +
					" ) as u_groups )" +
					" SELECT t.id as id, t.title, t.icon, t.mode, t.created::text, t.modified::text, t.structure_id, t.owner, u.username,  u.deleted as owner_deleted," +
					"	     json_agg(row_to_json(row(ts.member_id, ts.action)::actualites.share_tuple)) as shared," +
					"	     array_to_json(array_agg(group_id)) as groups" +
					" FROM " + threadsTable + " AS t" +
					" LEFT JOIN " + usersTable + " AS u ON t.owner = u.id" +
					" LEFT JOIN " + threadsSharesTable + " AS ts ON t.id = ts.resource_id" +
					" LEFT JOIN " + membersTable + " AS m ON (ts.member_id = m.id AND m.group_id IS NOT NULL)" +
					" WHERE t.id = ? " +
					" 		AND (ts.member_id IN (SELECT id FROM user_groups)" +
					" 		OR t.owner = ?) " +
					" GROUP BY t.id, u.username, owner_deleted" +
					" ORDER BY t.modified DESC";
			values.add(user.getUserId());
			groupsAndUserIds.forEach(values::add);
			values.add(Sql.parseId(id));
			values.add(user.getUserId());
			Sql.getInstance().prepared(query, values,  (sqlResult) -> {
				final Either<String, JsonObject> result = SqlResult.validUniqueResult(sqlResult);
				if (result.isLeft()) {
					promise.fail("internal server error");
				} else {
					try {
						NewsThread newsThread = NewsThreadMapper.map(result.right().getValue(), user, securedActions);
						if(newsThread.getStructureId() == null) {
							promise.complete(newsThread);
							return;
						}
						getStructureFromIds(Lists.newArrayList(newsThread.getStructureId()))
								.onSuccess(h -> {
									newsThread.setStructure(h.get(0));
									promise.complete(newsThread);
								})
								.onFailure(promise::fail);
					} catch (Exception e) {
						log.error("Failed to parse JsonObject", e);
						promise.fail(e.getMessage());
					}
				}
			});
		}
		return promise.future();
	}

	@Override
	public Future<String> getStructureId(String threadId) {
		final Promise<String> promise = Promise.promise();
		JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		String query = " SELECT t.structure_id " +
				" FROM " + threadsTable + " AS t" +
				" WHERE t.id = ? ";
		values.add(Sql.parseId(threadId));
		Sql.getInstance().prepared(query, values,  (sqlResult) -> {
			final Either<String, JsonObject> result = SqlResult.validUniqueResult(sqlResult);
			if (result.isLeft()) {
				promise.fail("internal server error");
			} else {
				promise.complete(result.right().getValue().getString("structure_id"));
			}
		});
		return promise.future();
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
				: emptyList();
			final Object[] groupsAndUserIds = gu.toArray();
			query = "SELECT t.id as _id, t.title, t.icon, t.mode, t.created::text, t.modified::text, t.structure_id, t.owner, u.username" +
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
	public void getPublishSharedWithIds(String threadId, Boolean filterShared, UserInfos user, final Handler<Either<String, JsonArray>> handler) {
		this.retrieve(threadId, filterShared, user, event -> {
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
                            if(((JsonObject) jo).containsKey(RightConstants.RIGHT_PUBLISH)){
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
        });
	}


	/**
	 * List threads visible by the given user. It includes :
	 * - threads created by the user
	 * - threads shared to the user or with one of its groups
	 * - threads containing news that are shared to the user or one of its groups
	 * @param viewHidden show hidden thread (hidden by default for adml group automatically added)
	 * @param user info about the user (needed for groups)
	 * @return the list of the threads visible by the user
	 */
	@Override
	public Future<List<NewsThread>> list(Map<String, SecuredAction> securedActions, UserInfos user, Boolean viewHidden) {
		final Promise<List<NewsThread>> promise = Promise.promise();
		if (user == null) {
			promise.fail("user not provided");
		} else {
			boolean filterMultiAdmlActivated = UserUtils.isUserMultiADML(user);
			String filterAdml = "";
			if(filterMultiAdmlActivated && !viewHidden) {
				filterAdml = " AND tsh.adml_group = false ";
			}

			// 1. Get all ids corresponding to the user

			List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}

			// 2. Prepare SQL request

			final String ids = Sql.listPrepared(groupsAndUserIds.toArray());
			String query =
					"WITH user_groups AS MATERIALIZED (" +
					" SELECT id::varchar FROM ( " +
					"    SELECT ? as id " +
					"    UNION ALL " +
					"    SELECT id FROM " + groupsTable +
					"        WHERE id IN " + ids +
					" ) as u_groups ), " +
					"thread_with_info_for_user AS ( " +
					"    SELECT DISTINCT i.thread_id AS id " +
					"    FROM " + infosTable + " AS i " +
					"        LEFT JOIN " + infosSharesTable + " AS ish ON i.id = ish.resource_id " +
					"    WHERE " +
					"		 ( " +
					"			 ish.member_id IN   (SELECT id FROM user_groups) " +
					"		 ) " +
					"		 AND " +
					"		 (i.publication_date <= NOW() OR i.publication_date IS NULL) " + // Publish date crossed
					"		 AND " +
					"		 (i.expiration_date > NOW() OR i.expiration_date IS NULL) " + // Expiration date not crossed
					"		 AND " +
					"		 (i.status = " + NewsStatus.PUBLISHED.ordinal() + ") " + // PUBLISHED
					"    UNION ALL " +
					"    SELECT DISTINCT i.thread_id AS id " +
					"    FROM " + infosTable + " AS i " +
					"        LEFT JOIN " + infosSharesTable + " AS ish ON i.id = ish.resource_id " +
					"    WHERE " +
					"		 ( " +
					"			 i.owner = ? " +
					"		 ) " +
					"		 AND " +
					"		 (i.publication_date <= NOW() OR i.publication_date IS NULL) " + // Publish date crossed
					"		 AND " +
					"		 (i.expiration_date > NOW() OR i.expiration_date IS NULL) " + // Expiration date not crossed
					"		 AND " +
					"		 (i.status = " + NewsStatus.PUBLISHED.ordinal() + ") " + // PUBLISHED
					"), thread_for_user AS ( " +
					"    SELECT t.id, array_agg(DISTINCT tsh.action) AS rights " +
					"    FROM " + threadsTable + " AS t " +
					"        INNER JOIN " + threadsSharesTable + " AS tsh ON t.id = tsh.resource_id " +
					"    WHERE tsh.member_id IN  (SELECT id FROM user_groups) " + filterAdml +
					"    GROUP BY t.id, tsh.member_id " +
					") SELECT t.id, t.owner, u.username AS owner_name, u.deleted as owner_deleted, t.title, t.icon," +
					"    t.created::text, t.modified::text, t.structure_id, max(thread_for_user.rights) as rights " + // note : we can use max() here only because the rights are inclusive of each other
					"    FROM " + threadsTable + " AS t " +
					"        LEFT JOIN thread_for_user ON thread_for_user.id = t.id " +
					"        LEFT JOIN " + usersTable + " AS u ON t.owner = u.id " +
					"    WHERE t.owner = ? " +
					"       OR t.id IN (SELECT id from thread_with_info_for_user) " +
					"       OR t.id IN (SELECT id from thread_for_user) " +
					"	 GROUP BY t.id, t.owner, owner_name, owner_deleted, t.title, t.icon, t.created, t.modified, t.structure_id " +
					"    ORDER BY t.title";
			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			values.add(user.getUserId());

			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(user.getUserId());
			values.add(user.getUserId());

			// 3. Retrieve & parse data

			Sql.getInstance().prepared(query, values, (sqlResult) -> {
				final Either<String, JsonArray> result = SqlResult.validResult(sqlResult);
				if (result.isLeft()) {
					promise.fail(result.left().getValue());
				} else {
					try {
						List<NewsThread> pojo = result.right().getValue().stream()
																		.filter(row -> row instanceof JsonObject)
																		.map(JsonObject.class::cast)
																		.map( row -> NewsThreadMapper.map(row, user, securedActions))
																		.collect(toList());
						getStructureFromIds(pojo.stream().map(NewsThread::getStructureId).collect(toList()))
								.onSuccess( h -> {
									pojo.forEach(thread -> h.stream().filter(s -> s.getId().equals(thread.getStructureId()))
                                            .findFirst()
                                            .ifPresent(thread::setStructure));
									// for multi adml we ignore adml share group for testing vsiibility but if finally the thread is still visible, we need
									// to set the proper rights => query a second tim to verify the presences of an adml share on visibles threads
									if(!filterMultiAdmlActivated) {
										promise.complete(pojo);
									} else {
										handleMultiAdmlThreadRights(pojo, user, securedActions)
												.onComplete(promise)
												.onFailure( t -> promise.fail(t.getMessage()));
									}
								})
								.onFailure(promise::fail);
					} catch (Exception e) {
						log.error("Failed to parse JsonObject", e);
						promise.fail(e);
					}
				}
			});
		}
		return promise.future();
	}

	private Future<List<NewsThread>> handleMultiAdmlThreadRights(List<NewsThread> threads,
											 UserInfos user, Map<String, SecuredAction> securedActions) {

		Promise<List<NewsThread>> promise = Promise.promise();
		Map<Integer, NewsThread> threadIdToThread = threads.stream().collect(toMap(NewsThread::getId, Function.identity()));

		Rights adminRights = Rights.fromRawRights(securedActions, emptyList(), true, Rights.ResourceType.THREAD);

		String query = " SELECT DISTINCT tsh.resource_id as id, tsh.member_id as group_id FROM " + threadsSharesTable + " as tsh " +
					   "    WHERE tsh.resource_id IN " + Sql.listPrepared(Lists.newArrayList(threadIdToThread.keySet())) +
					   "        AND tsh.action = '" + RightConstants.RIGHT_PUBLISH + "' " +
	    			   "        AND tsh.adml_group = true ";
		JsonArray values = new JsonArray();
		threadIdToThread.keySet().forEach(values::add);
		Sql.getInstance().prepared(query, values, (sqlResult) -> {
			final Either<String, JsonArray> result = SqlResult.validResult(sqlResult);
			if (result.isLeft()) {
				promise.fail(result.left().getValue());
			} else {
				result.right().getValue().stream()
						.filter(row -> row instanceof JsonObject)
						.map(JsonObject.class::cast)
						.filter( row -> threadIdToThread.containsKey(Integer.parseInt(row.getString("id"))) &&
													user.getGroupsIds().contains(row.getString("group_id")))
						.forEach(row -> threadIdToThread.get(Integer.parseInt(row.getString("id"))).setSharedRights(adminRights));
				promise.complete(threads);
			}
		});
		return promise.future();
	}

	@Override
    public Future<Void> attachThreadsWithNullStructureToDefault() {
		// 1. Get IDs of owner of threads without a structure.
		return getIdsOfOwnersForNullStructure()
		// 2. Get structure infos of threads owners.
		.compose(this::getDefaultStructureOfUsers)
		// 3. Assign a default structure to eligible threads.
		.compose(this::assignDefaultOwnerStructure);
	}

	@Override
	public void getOwnerInfo(String threadId, Handler<Either<String, JsonObject>> handler) {
		if (threadId != null && !threadId.isEmpty()) {
			String query = "SELECT thread.owner FROM " + threadsTable + " WHERE id = ?";
			Sql.getInstance().prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(Long.parseLong(threadId)),
					SqlResult.validUniqueResultHandler(handler));
		}
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

	/** 
	 * Retrieve the one and only structure that some users are attached to.
	 * Users with no (or many) structures will have no mapping in the resulting Map.
	 * @return a future Map of <User ID, Structure ID>
	 */
	private Future<Map<String, String>> getDefaultStructureOfUsers(final List<String> ids) {
		return getUsersStructures(ids)
			.map( results -> {
				final Map<String, String> map = new HashMap<>(results.size());
				results.stream()
					.filter(row -> row instanceof JsonObject)
					.map(JsonObject.class::cast)
					.forEach(result -> {
						final String userId = result.getString("userId");
						final JsonArray structures = result.getJsonArray("structures");
						if(userId!=null && structures!=null && structures.size()==1) {
							map.put(userId, structures.getJsonObject(0).getString("id"));
						}
					});
				return map;
			});
	}

    /**
     * Get structure details for a list of users.
     * @param ids a list of user IDs
     * @return a Future array of JsonObjects such as { userId: "ID of the user", structures: [{id: "ID of the structure"}] }
     */
    private Future<JsonArray> getUsersStructures(final List<String> ids) {
		Promise<JsonArray> promise = Promise.promise();
		if(ids==null || ids.isEmpty()) {
			promise.complete(new JsonArray());
		} else {
			JsonObject action = new JsonObject()
				.put("action", "getUsersStructures")
				.put("userIds", new JsonArray(ids));
			eb.request("directory", action, handlerToAsyncHandler(event -> {
				JsonArray res = event.body().getJsonArray("result", new JsonArray());
				if ("ok".equals(event.body().getString("status")) && res != null) {
					promise.complete(res);
				} else {
					promise.fail(event.body().getString("message"));
				}
			}));
		}
		return promise.future();
    }

	private Future<List<Structure>> getStructureFromIds(List<String> ids) {
		Promise<List<Structure>> promise = Promise.promise();
		if(ids==null || ids.isEmpty()) {
			promise.complete(emptyList());
		} else {
			JsonObject action = new JsonObject()
					.put("action", "list-structures")
					.put("structureIds", new JsonArray(ids));
			eb.request("directory", action, handlerToAsyncHandler(event -> {
				JsonArray res = event.body().getJsonArray("result", new JsonArray());
				if ("ok".equals(event.body().getString("status")) && res != null) {
					List<Structure> structures = new ArrayList<>();
					for (Object oRow : res.getList()) {
						JsonObject row =  (JsonObject) oRow;
						structures.add(new Structure(row.getString("id"), row.getString("name")));
					}
					promise.complete(structures);
				} else {
					promise.fail(event.body().getString("message"));
				}
			}));
		}
		return promise.future();
	}

	/** Set the structure ID of threads with their owner's default one. */
	private Future<Void> assignDefaultOwnerStructure(final Map<String, String> defaultOwnerStructures) {
		final JsonArray userIds = new fr.wseduc.webutils.collections.JsonArray();
		final JsonArray structureIds = new fr.wseduc.webutils.collections.JsonArray();
		if(defaultOwnerStructures!=null && !defaultOwnerStructures.isEmpty()) {
			defaultOwnerStructures.entrySet().forEach(set -> {
				final String key = set.getKey();
				final String value = set.getValue();
				if(isNotEmpty(key) && isNotEmpty(value)) {
					userIds.add(key);
					structureIds.add(value);
				}
			});
		}
		if(!userIds.isEmpty() && !structureIds.isEmpty()) {
			final Promise<Void> promise = Promise.promise();
			SqlStatementsBuilder builder = new SqlStatementsBuilder();
			String query =
				"UPDATE " + threadsTable + " SET structure_id = mapped.s_id " +
				"FROM (SELECT unnest"+Sql.arrayPrepared(userIds)+" AS u_id, unnest"+Sql.arrayPrepared(structureIds)+" AS s_id) AS mapped " +
				"WHERE owner = mapped.u_id AND structure_id IS NULL ";
			
			final JsonArray values = new fr.wseduc.webutils.collections.JsonArray()
				.addAll(userIds)
				.addAll(structureIds);
			builder.prepared(query, values);

			Sql.getInstance().transaction(builder.build(), SqlResult.validUniqueResultHandler(0, res -> {
				if(res.isLeft()){
					promise.tryFail(res.left().getValue());
				} else {
					promise.complete();
				}
			}));
			return promise.future();
		}
		return Future.succeededFuture();
	}
}
