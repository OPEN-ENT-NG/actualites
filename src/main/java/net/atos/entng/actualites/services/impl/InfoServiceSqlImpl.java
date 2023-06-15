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

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.to.*;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import fr.wseduc.webutils.Either;
import net.atos.entng.actualites.services.InfoService;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.utils.StopWatch;

import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;

public class InfoServiceSqlImpl implements InfoService {

	protected static final Logger log = LoggerFactory.getLogger(Renders.class);
	private static final String THREAD_PUBLISH = "net-atos-entng-actualites-controllers-InfoController|publish";
	private static final String RESOURCE_SHARED = "net-atos-entng-actualites-controllers-InfoController|getInfo";
	private final String threadsTable = "actualites.thread";
	private final String threadsSharesTable = "actualites.thread_shares";
	private final String infosTable = "actualites.info";
	private final String infosSharesTable = "actualites.info_shares";
	private final String usersTable = "actualites.users";
	private static final String THREAD_PUBLISH_RIGHT = "net-atos-entng-actualites-controllers-InfoController|publish";
	private final QueryHelperSql helperSql = new QueryHelperSql();
	/**
	 * Format object to create a new revision
	 * @param id info id
	 * @param data object containing info
	 * @return new object containing revision values
	 */
	private JsonObject mapRevision(Long id, JsonObject data) {
		JsonObject o = data.copy();
		o.remove("id");
		o.remove("status");
		o.remove("thread_id");
		if (o.containsKey("expiration_date")) o.remove("expiration_date");
		if (o.containsKey("publication_date")) o.remove("publication_date");
		if (o.containsKey("is_headline")) o.remove("is_headline");
		o.put("info_id", id);
		return o;
	}


	@Override
	public void create(final JsonObject data, final UserInfos user, final String eventStatus, final Handler<Either<String, JsonObject>> handler) {
		String queryNewInfoId = "SELECT nextval('actualites.info_id_seq') as id";
		Sql.getInstance().raw(queryNewInfoId, SqlResult.validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {
				if (event.isRight()) {
					final Long infoId = event.right().getValue().getLong("id");
					SqlStatementsBuilder s = new SqlStatementsBuilder();

					String userQuery = "SELECT "+ Actualites.NEWS_SCHEMA + ".merge_users(?,?)";
					s.prepared(userQuery, new fr.wseduc.webutils.collections.JsonArray().add(user.getUserId()).add(user.getUsername()));

					data.put("owner", user.getUserId()).put("id", infoId);
					s.insert(Actualites.NEWS_SCHEMA + "." + Actualites.INFO_TABLE, data, "id");

					JsonObject revision = mapRevision(infoId, data);
					revision.put("event", eventStatus);
					s.insert(Actualites.NEWS_SCHEMA + "." + Actualites.INFO_REVISION_TABLE, revision, null);

					Sql.getInstance().transaction(s.build(), validUniqueResultHandler(1, handler));
				} else {
					log.error("Failure to call nextval('"+ Actualites.NEWS_SCHEMA +".info_id_seq') sequence");
					handler.handle(new Either.Left<String, JsonObject>("An error occured when creating new info"));
				}
			}
		}));
	}

	/**
	 * Check if the date format is correct for PostgresSQL
	 * @param date	The date to check
	 * @return	True is the date match the format, false otherwise.
	 */
	private boolean isDateFormatOK(String date) {
		if (date == null)
			return true;
		try {
			SimpleDateFormat simpleDateFormat = new SimpleDateFormat("YYYY-MM-DD'T'HH:mm:ss.SSS");
			simpleDateFormat.parse(date);
		} catch (ParseException e) {
			return false;
		}
		return true;
	}

	@Override
	public void update(String id, JsonObject data, UserInfos user, String eventStatus, Handler<Either<String, JsonObject>> handler) {
		SqlStatementsBuilder s = new SqlStatementsBuilder();

		String userQuery = "SELECT "+ Actualites.NEWS_SCHEMA + ".merge_users(?,?)";
		s.prepared(userQuery, new fr.wseduc.webutils.collections.JsonArray().add(user.getUserId()).add(user.getUsername()));

		StringBuilder sb = new StringBuilder();
		JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		for (String attr : data.fieldNames()) {
			sb.append(attr);
			if (Boolean.TRUE.equals(attr.contains("date"))) {
				if (Boolean.TRUE.equals(isDateFormatOK(data.getString(attr)))) {
					sb.append("= to_timestamp(?, 'YYYY-MM-DDThh24:mi:ss'),");
				} else {
					String error = "[Actualites@%s::update] Error in date format";
					log.error(String.format(error, this.getClass().getSimpleName()));
					handler.handle(new Either.Left<>("error.date.format"));
					return;
				}
			} else {
				sb.append(" = ?, ");
			}
			values.add(data.getValue(attr));
		}
		String query = "UPDATE " + Actualites.NEWS_SCHEMA + "." + Actualites.INFO_TABLE +
						" SET " + sb.toString() + "modified = NOW() " +
						"WHERE id = ? " +
						"RETURNING id";

		s.prepared(query, values.add(Integer.parseInt(id)));

		JsonObject revision = mapRevision(Long.parseLong(id), data);
		revision.put("owner", user.getUserId());
		revision.put("event", eventStatus);
		s.insert(Actualites.NEWS_SCHEMA + "." + Actualites.INFO_REVISION_TABLE, revision, null);

		Sql.getInstance().transaction(s.build(), SqlResult.validUniqueResultHandler(1, handler));
	}

	@Override
	public void retrieve(String id, Handler<Either<String, JsonObject>> handler) {
			String query;
			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			query = "SELECT i.id as _id, i.title, i.content, i.status, i.publication_date, i.expiration_date, i.is_headline, i.thread_id, i.created, i.modified" +
				", i.owner, u.username, t.title AS thread_title, t.icon AS thread_icon" +
				", (SELECT json_agg(cr.*) FROM (" +
					"SELECT c.id as _id, c.comment, c.owner, c.created, c.modified, au.username" +
					" FROM actualites.comment AS c" +
					" LEFT JOIN actualites.users AS au ON c.owner = au.id" +
					" WHERE i.id = c.info_id" +
					" ORDER BY c.modified ASC) cr)" +
					" AS comments" +
				", json_agg(row_to_json(row(ios.member_id, ios.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM actualites.info AS i" +
				" LEFT JOIN actualites.thread AS t ON i.thread_id = t.id" +
				" LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN actualites.users AS u ON i.owner = u.id" +
				" LEFT JOIN actualites.info_shares AS ios ON i.id = ios.resource_id" +
				" LEFT JOIN actualites.members AS m ON ((ts.member_id = m.id OR ios.member_id = m.id) AND m.group_id IS NOT NULL)" +
				" WHERE i.id = ? " +
				" GROUP BY i.id, u.username, t.id" +
				" ORDER BY i.modified DESC";
			values.add(Sql.parseId(id));
			Sql.getInstance().prepared(query.toString(), values, SqlResult.parseSharedUnique(handler));
	}
	
	@Override
	public void retrieve(String id, UserInfos user, Handler<Either<String, JsonObject>> handler) {
		if (user != null) {
			String query;
			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}
			query = "SELECT i.id as _id, i.title, i.content, i.status, i.publication_date, i.expiration_date, i.is_headline, i.thread_id, i.created, i.modified" +
				", i.owner, u.username, t.title AS thread_title, t.icon AS thread_icon" +
				", (SELECT json_agg(cr.*) FROM (" +
					"SELECT c.id as _id, c.comment, c.owner, c.created, c.modified, au.username" +
					" FROM actualites.comment AS c" +
					" LEFT JOIN actualites.users AS au ON c.owner = au.id" +
					" WHERE i.id = c.info_id" +
					" ORDER BY c.modified ASC) cr)" +
					" AS comments" +
				", json_agg(row_to_json(row(ios.member_id, ios.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM actualites.info AS i" +
				" LEFT JOIN actualites.thread AS t ON i.thread_id = t.id" +
				" LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN actualites.users AS u ON i.owner = u.id" +
				" LEFT JOIN actualites.info_shares AS ios ON i.id = ios.resource_id" +
				" LEFT JOIN actualites.members AS m ON ((ts.member_id = m.id OR ios.member_id = m.id) AND m.group_id IS NOT NULL)" +
				" WHERE i.id = ? " +
				" AND ((i.owner = ? OR (ios.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) + " AND i.status > 2))" +
				" OR ((t.owner = ? OR (ts.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) + " AND ts.action = ?)) AND i.status > 1))" +
				" GROUP BY i.id, u.username, t.id" +
				" ORDER BY i.modified DESC";
			values.add(Sql.parseId(id));
			values.add(user.getUserId());
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(user.getUserId());
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(THREAD_PUBLISH);
			Sql.getInstance().prepared(query.toString(), values, SqlResult.parseSharedUnique(handler));
		}
	}

	@Override
	public void list(UserInfos user, boolean optimized, Handler<Either<String, JsonArray>> handler) {
		if (user != null) {
			helperSql.fetchInfos(user, optimized, handler);
		}else{
			handler.handle(new Either.Left<>("not authenticated"));
		}
	}

	@Override
	public void listComments(Long infoId, Handler<Either<String, JsonArray>> handler) {
		helperSql.fetchComments(infoId, handler);
	}

	@Override
	public void listShared(Long infoId, Handler<Either<String, JsonArray>> handler) {
		helperSql.fetchShared(infoId, handler);
	}

	@Override
	public void listByThreadId(String id, UserInfos user, Handler<Either<String, JsonArray>> handler) {
		if (user != null) {
			String query;
			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}
			query = "SELECT i.id as _id, i.title, i.content, i.status, i.publication_date, i.expiration_date, i.is_headline, i.thread_id, i.created, i.modified" +
				", i.owner, u.username, t.title AS thread_title, t.icon AS thread_icon" +
				", (SELECT json_agg(cr.*) FROM (" +
					"SELECT c.id as _id, c.comment, c.owner, c.created, c.modified, au.username" +
					" FROM actualites.comment AS c" +
					" LEFT JOIN actualites.users AS au ON c.owner = au.id" +
					" WHERE i.id = c.info_id" +
					" ORDER BY c.modified ASC) cr)" +
					" AS comments" +
				", json_agg(row_to_json(row(ios.member_id, ios.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM actualites.info AS i" +
				" LEFT JOIN actualites.thread AS t ON i.thread_id = t.id" +
				" LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN actualites.users AS u ON i.owner = u.id" +
				" LEFT JOIN actualites.info_shares AS ios ON i.id = ios.resource_id" +
				" LEFT JOIN actualites.members AS m ON ((ts.member_id = m.id OR ios.member_id = m.id) AND m.group_id IS NOT NULL)" +
				" WHERE t.id = ? " +
				" AND ((i.owner = ? OR (ios.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) + " AND i.status > 2))" +
				" OR ((t.owner = ? OR (ts.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) + " AND ts.action = ?)) AND i.status > 1))" +
				" GROUP BY t.id, i.id, u.username" +
				" ORDER BY i.modified DESC";
			values.add(Sql.parseId(id));
			values.add(user.getUserId());
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(user.getUserId());
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(THREAD_PUBLISH);
			Sql.getInstance().prepared(query.toString(), values, SqlResult.parseShared(handler));
		}
	}

	@Override
	public void listLastPublishedInfos(UserInfos user, int resultSize, boolean optimized, Handler<Either<String, JsonArray>> handler) {
		if (optimized) {
			listLastPublishedInfosOptimized(user, resultSize, handler);
		} else {
			listLastPublishedInfosNotOptimized(user, resultSize, handler);
		}
	}

	private void listLastPublishedInfosNotOptimized(UserInfos user, int resultSize, Handler<Either<String, JsonArray>> handler) {
		if (user != null) {
			String query;
			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}
			query = "SELECT i.id as _id, i.title, u.username, t.id AS thread_id, t.title AS thread_title , t.icon AS thread_icon, " +
				" CASE WHEN i.publication_date > i.modified" +
					" THEN i.publication_date" +
					" ELSE i.modified" +
					" END as date" +
				", json_agg(row_to_json(row(ios.member_id, ios.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM actualites.info AS i" +
				" LEFT JOIN actualites.thread AS t ON i.thread_id = t.id" +
				" LEFT JOIN actualites.users AS u ON i.owner = u.id" +
				" LEFT JOIN actualites.info_shares AS ios ON i.id = ios.resource_id" +
				" LEFT JOIN actualites.members AS m ON (ios.member_id = m.id AND m.group_id IS NOT NULL)" +
				" WHERE ((ios.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) + "AND ios.action = ?) OR i.owner = ?)" +
				" AND i.status = 3" +
					" AND (i.publication_date <= LOCALTIMESTAMP OR i.publication_date IS NULL) AND (i.expiration_date > LOCALTIMESTAMP OR i.expiration_date IS NULL)" +
				" GROUP BY i.id, u.username, t.id" +
				" ORDER BY date DESC" +
				" LIMIT ?";

			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(RESOURCE_SHARED);
			values.add(user.getUserId());
			values.add(resultSize);
			Sql.getInstance().prepared(query.toString(), values, SqlResult.parseShared(handler));
		}
	}

	private void listLastPublishedInfosOptimized(UserInfos user, int resultSize, Handler<Either<String, JsonArray>> handler) {
		final StopWatch watch1 = new StopWatch();
		log.debug("Starting optimized query...");
		helperSql.getInfosIdsByUnion(user, resultSize).setHandler(resIds -> {
			log.debug("Infos IDS query..." + watch1.elapsedTimeSeconds());
			if (resIds.failed()) {
				handler.handle(new Either.Left<>(resIds.cause().getMessage()));
			} else {
				final Set<Long> ids = resIds.result();
				if (ids.isEmpty()) {
					handler.handle(new Either.Right<>(new JsonArray()));
					return;
				}
				final JsonArray jsonIds = new JsonArray(new ArrayList(ids));
				final String infoIds = Sql.listPrepared(ids.toArray());

				//subquery infos
				{
					final StringBuilder subquery = new StringBuilder();
					subquery.append("SELECT info.id as _id, info.title, users.username, thread.id AS thread_id, thread.title AS thread_title, ");
					subquery.append("thread.icon AS thread_icon, CASE WHEN info.publication_date > info.modified THEN info.publication_date ");
					subquery.append("ELSE info.modified END AS date ");
					subquery.append("FROM actualites.info ");
					subquery.append("INNER JOIN actualites.thread ON (info.thread_id = thread.id) ");
					subquery.append("INNER JOIN actualites.users ON (info.owner = users.id) ");
					subquery.append("WHERE info.id IN ").append(infoIds).append(" ");
					subquery.append("AND info.status = 3 ");
					subquery.append("AND (info.publication_date <= LOCALTIMESTAMP OR info.publication_date IS NULL) ");
					subquery.append("AND (info.expiration_date > LOCALTIMESTAMP OR info.expiration_date IS NULL) ");
					subquery.append("GROUP BY info.id, users.username, thread.id ORDER BY date DESC;");

					final JsonArray subValues = new JsonArray().addAll(jsonIds);
					final StopWatch watch3 = new StopWatch();
					Sql.getInstance().prepared(subquery.toString(), subValues, SqlResult.validResultHandler(rInfos -> {
						log.debug("Infos FINAL query..." + watch3.elapsedTimeSeconds());
						if (rInfos.isLeft()) {
							handler.handle(rInfos);
						} else {
							handler.handle(new Either.Right<>(rInfos.right().getValue()));
						}
					}));
				}
			}
		});
	}

	@Override
	public void listForLinker(UserInfos user, Handler<Either<String, JsonArray>> handler) {
		if (user != null) {
			String query;
			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}
			query = "SELECT i.id as _id, i.title, i.thread_id, i.owner, u.username, t.title AS thread_title, t.icon AS thread_icon" +
				", json_agg(row_to_json(row(ios.member_id, ios.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM actualites.info AS i" +
				" LEFT JOIN actualites.thread AS t ON i.thread_id = t.id" +
				" LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN actualites.users AS u ON i.owner = u.id" +
				" LEFT JOIN actualites.info_shares AS ios ON i.id = ios.resource_id" +
				" LEFT JOIN actualites.members AS m ON ((ts.member_id = m.id OR ios.member_id = m.id) AND m.group_id IS NOT NULL)" +
				" WHERE (ios.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) + " OR i.owner = ?" +
					" OR (ts.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) + " AND ts.action = ?) OR t.owner = ?)" +
				" AND (i.status = 3" +
					" AND ((i.publication_date IS NULL OR i.publication_date <= NOW()) AND (i.expiration_date IS NULL OR i.expiration_date + interval '1 days' >= NOW())))" +
				" GROUP BY i.id, u.username, t.id" +
				" ORDER BY i.title";
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(user.getUserId());
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(THREAD_PUBLISH);
			values.add(user.getUserId());
			Sql.getInstance().prepared(query.toString(), values, SqlResult.parseShared(handler));
		}
	}

	@Override
	public void getSharedWithIds(String infoId, final Handler<Either<String, JsonArray>> handler) {
		this.retrieve(infoId, new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {
				JsonArray sharedWithIds = new fr.wseduc.webutils.collections.JsonArray();
				if (event.isRight()) {
					try {
						JsonObject info = event.right().getValue();
						if (info.containsKey("owner")) {
							JsonObject owner = new JsonObject();
							owner.put("userId", info.getString("owner"));
							sharedWithIds.add(owner);
						}
						if (info.containsKey("shared")) {
							JsonArray shared = info.getJsonArray("shared");
							for(Object jo : shared){
								sharedWithIds.add(jo);
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

	@Override
	public void getOwnerInfo(String infoId, Handler<Either<String, JsonObject>> handler) {
		if (infoId != null && !infoId.isEmpty()) {
			String query = "SELECT info.owner FROM actualites." + Actualites.INFO_TABLE + " WHERE" +
					" id = ?;";

			Sql.getInstance().prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(Long.parseLong(infoId)),
					SqlResult.validUniqueResultHandler(handler));
		}
	}

    @Override
    public void getRevisions(Long infoId, Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT info_revision.id as _id, created, title, content, owner as " +
                "user_id, event as eventName, username " +
                "FROM "+ Actualites.NEWS_SCHEMA +".info_revision " +
                "INNER JOIN "+ Actualites.NEWS_SCHEMA +".users on (info_revision.owner = users.id) " +
                "WHERE info_id = ? " +
                "ORDER BY created DESC;";
        Sql.getInstance().prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(infoId),
                SqlResult.validResultHandler(handler));
    }

	@Override
	public Future<List<News>> listPaginated(Map<String, SecuredAction> securedActions, UserInfos user, int page, int pageSize, Integer threadId) {
		final Promise<List<News>> promise = Promise.promise();
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
			String whereClause =
					"(i.publication_date <= LOCALTIMESTAMP OR i.publication_date IS NULL) " + // Publish date crossed
					"AND " +
					"(i.expiration_date > LOCALTIMESTAMP OR i.expiration_date IS NULL) " + // Expiration date not crossed
					"AND " +
					"(i.status = " + NewsStatus.PUBLISHED.ordinal() + ") " + // PUBLISHED
					"AND ( " +
					"	 i.owner = ? " + // user is owner of info
					"	 OR " +
					"	 i.id IN (SELECT id from info_for_user) " + // info is shared to the user
					" 	 OR " +
					"    t.owner = ?" + // user is owner of thread
					"    OR " +
					"    t.id IN (SELECT id FROM thread_for_user) " + // thread is shared to the user with publish rights
					") ";
			if (threadId != null) {
				whereClause = "i.thread_id = ? AND ( " + whereClause + ") ";
			}
			String query =
					"WITH " +
					"	 info_for_user AS ( " + // Every info owned of shared to the user
					"		 SELECT i.id, array_agg(DISTINCT ish.action) AS rights " +
					"    	 FROM " + infosTable + " AS i " +
					"        	 JOIN " + infosSharesTable + " AS ish ON i.id = ish.resource_id " +
					"    	 WHERE " +
					"        	 ish.member_id IN " + ids + " " +
					"    	 GROUP BY i.id " +
					"	 ), " +
					"	 thread_for_user AS ( " + // Every thread owned of shared to the user with publish rights
					"	 	 SELECT t.id " +
					"    	 FROM " + threadsTable + " AS t " +
					"        	 INNER JOIN " + threadsSharesTable + " AS tsh ON t.id = tsh.resource_id " +
					"    	 WHERE tsh.member_id IN " + ids + " " +
					"		 	AND tsh.action = '" + THREAD_PUBLISH_RIGHT + "' " +
					"    	 GROUP BY t.id, tsh.member_id " +
					"	 ) " +
					"SELECT i.id, i.thread_id, i.title, i.content, i.status, i.owner, u.username AS owner_name, " +
					"        u.deleted as owner_deleted, i.created, i.modified, i.publication_date, " +
					"        i.expiration_date, i.is_headline, i.number_of_comments, max(info_for_user.rights) as rights " +
					"    FROM " + infosTable + " AS i " +
					"        LEFT JOIN info_for_user ON info_for_user.id = i.id " +
					" 		 LEFT JOIN thread_for_user ON thread_for_user.id = i.thread_id " +
					"        LEFT JOIN " + usersTable + " AS u ON i.owner = u.id " +
					" 		 LEFT JOIN " + threadsTable + " AS t ON t.id = i.thread_id " +
					"    WHERE " + whereClause +
					"    GROUP BY i.id, i.thread_id, i.title, i.content, i.status, i.owner, owner_name, owner_deleted, " +
					"        i.created, i.modified, i.publication_date, i.expiration_date, i.is_headline, " +
					"        i.number_of_comments " +
					"    ORDER BY i.modified DESC " +
					"    OFFSET ? " +
					"    LIMIT ? ";
			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			for(String value : groupsAndUserIds){
				values.add(value); // for info_for_user
			}
			for(String value : groupsAndUserIds){
				values.add(value); // for thread_for_user
			}
			if (threadId != null) {
				values.add(threadId.intValue()); // for thread filtering
			}
			values.add(user.getUserId()); // for info owning clause
			values.add(user.getUserId()); // for thread owning clause
			values.add(page * pageSize); // offset clause
			values.add(pageSize); // limit clause

			// 3. Retrieve & parse data

			Sql.getInstance().prepared(query, values, (sqlResult) -> {
				final Either<String, JsonArray> result = SqlResult.validResult(sqlResult);
				if (result.isLeft()) {
					promise.fail(result.left().getValue());
				} else {
					try {

						List<News> pojo = result.right().getValue().stream().filter(row -> row instanceof JsonObject).map(o -> {
							final JsonObject row = (JsonObject)o;
							final ResourceOwner owner = new ResourceOwner(
									row.getString("owner"),
									row.getString("owner_name"),
									row.getBoolean("owner_deleted")
							);
							final List<String> rawRights = SqlResult.sqlArrayToList(row.getJsonArray("rights"), String.class);
							return new News(
									row.getInteger("id"),
									row.getInteger("thread_id"),
									row.getString("title"),
									row.getString("content"),
									NewsStatus.fromOrdinal(row.getInteger("status")),
									owner,
									row.getString("created"),
									row.getString("modified"),
									row.getString("publication_date"),
									row.getString("expiration_date"),
									row.getBoolean("is_headline"),
									row.getInteger("number_of_comments"),
									Rights.fromRawRights(securedActions, rawRights)
							);
						}).collect(Collectors.toList());
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

	public Future<NewsComplete> getFromId(Map<String, SecuredAction> securedActions, UserInfos user, int infoId) {
		final Promise<NewsComplete> promise = Promise.promise();
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
					"WITH " +
					"	 info_for_user AS ( " + // Every info owned of shared to the user
					"		 SELECT i.id, array_agg(DISTINCT ish.action) AS rights " +
					"    	 FROM " + infosTable + " AS i " +
					"        	 JOIN " + infosSharesTable + " AS ish ON i.id = ish.resource_id " +
					"    	 WHERE " +
					"        	 ish.member_id IN " + ids + " " +
					"    	 GROUP BY i.id " +
					"	 ), " +
					"	 thread_for_user AS ( " + // Every thread owned of shared to the user with publish rights
					"	 	 SELECT t.id, array_agg(DISTINCT tsh.action) AS rights" +
					"    	 FROM " + threadsTable + " AS t " +
					"        	 INNER JOIN " + threadsSharesTable + " AS tsh ON t.id = tsh.resource_id " +
					"    	 WHERE tsh.member_id IN " + ids + " " +
					"    	 GROUP BY t.id, tsh.member_id " +
					"	 ) " +
					"SELECT i.id, i.title, i.content, i.created, i.modified, i.is_headline, i.number_of_comments, " + // info data
					"        i.status, i.publication_date, i.expiration_date, " + // info publication data
					"		 i.owner, u.username AS owner_name, u.deleted AS owner_deleted, " + // info owner data
					"		 i.thread_id, t.title AS thread_title, t.icon AS thread_icon, " +
					"		 t.owner AS thread_owner, ut.username AS thread_owner_name, ut.deleted AS thread_owner_deleted, " + // thread owner data
					"		 max(info_for_user.rights) AS rights, " + // info rights
					"		 max(thread_for_user.rights) AS thread_rights " + // thread rights
					"    FROM " + infosTable + " AS i " +
					"        LEFT JOIN info_for_user ON info_for_user.id = i.id " +
					" 		 LEFT JOIN thread_for_user ON thread_for_user.id = i.thread_id " +
					"        LEFT JOIN " + usersTable + " AS u ON i.owner = u.id " +
					" 		 LEFT JOIN " + threadsTable + " AS t ON t.id = i.thread_id " +
					"        LEFT JOIN " + usersTable + " AS ut ON t.owner = ut.id " +
					"    WHERE " +
					"		 i.id = ? " + // get info from id
					"    GROUP BY i.id, i.title, i.content, i.created, i.modified, i.is_headline, i.number_of_comments, " +
					"        i.status, i.publication_date, i.expiration_date, " +
					"        i.owner, owner_name, owner_deleted, " +
					" 		 i.thread_id, thread_title, thread_icon, " +
					"		 thread_owner, thread_owner_name, thread_owner_deleted";

			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(infoId);

			// 3. Retrieve & parse data

			Sql.getInstance().prepared(query, values, (sqlResult) -> {
				final Either<String, JsonArray> result = SqlResult.validResult(sqlResult);
				if (result.isLeft()) {
					promise.fail(result.left().getValue());
				} else {
					try {

						NewsComplete pojo = result.right().getValue().stream().filter(row -> row instanceof JsonObject).map(o -> {
							final JsonObject row = (JsonObject)o;
							final ResourceOwner owner = new ResourceOwner(
									row.getString("owner"),
									row.getString("owner_name"),
									row.getBoolean("owner_deleted")
							);
							final List<String> rawRights = SqlResult.sqlArrayToList(row.getJsonArray("rights"), String.class);
							final List<String> rawThreadRights = SqlResult.sqlArrayToList(row.getJsonArray("thread_rights"), String.class);
							final ResourceOwner threadOwner = new ResourceOwner(
									row.getString("thread_owner"),
									row.getString("thread_owner_name"),
									row.getBoolean("thread_owner_deleted")
							);
							final NewsThreadInfo thread = new NewsThreadInfo(
									row.getInteger("thread_id"),
									row.getString("thread_title"),
									row.getString("thread_icon"),
									threadOwner,
									Rights.fromRawRights(securedActions, rawThreadRights)
							);
							return new NewsComplete(
									row.getInteger("id"),
									thread,
									row.getString("title"),
									row.getString("content"),
									NewsStatus.fromOrdinal(row.getInteger("status")),
									owner,
									row.getString("created"),
									row.getString("modified"),
									row.getString("publication_date"),
									row.getString("expiration_date"),
									row.getBoolean("is_headline"),
									row.getInteger("number_of_comments"),
									Rights.fromRawRights(securedActions, rawRights)
							);
						}).collect(Collectors.toList()).get(0);
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


}
