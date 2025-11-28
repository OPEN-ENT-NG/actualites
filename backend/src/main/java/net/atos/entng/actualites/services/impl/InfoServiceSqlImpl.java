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
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.services.InfoService;
import net.atos.entng.actualites.to.*;
import net.atos.entng.actualites.utils.Events;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.StopWatch;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;
import static fr.wseduc.webutils.Utils.isEmpty;
import static net.atos.entng.actualites.Actualites.*;

public class InfoServiceSqlImpl implements InfoService {

	protected static final Logger log = LoggerFactory.getLogger(Renders.class);
	private static final String THREAD_PUBLISH_RIGHT = "net-atos-entng-actualites-controllers-InfoController|publish";
	private static final String RESOURCE_SHARED_RIGHT = "net-atos-entng-actualites-controllers-InfoController|getInfo";
	private static final String NEWS_THREAD_TABLE = NEWS_SCHEMA + "." + THREAD_TABLE;
	private static final String NEWS_THREAD_SHARE_TABLE = NEWS_SCHEMA + "." + THREAD_SHARE_TABLE;
	private static final String NEWS_INFO_TABLE = NEWS_SCHEMA + "." + INFO_TABLE;
	private static final String NEWS_INFO_SHARE_TABLE = NEWS_SCHEMA + "." + INFO_SHARE_TABLE;
	private static final String NEWS_USER_TABLE = NEWS_SCHEMA + "." + USER_TABLE;
	private static final String NEWS_COMMENT_TABLE = NEWS_SCHEMA + "." + COMMENT_TABLE;
	private static final String NEWS_MEMBER_TABLE = NEWS_SCHEMA + "." + MEMBER_TABLE;
	private static final String NEWS_INFO_REVISION_TABLE = NEWS_SCHEMA + "." + INFO_REVISION_TABLE;
	private static final String GROUPS_TABLE = NEWS_SCHEMA + "." + GROUP_TABLE;
	private final QueryHelperSql helperSql = new QueryHelperSql();
	// we select the current content if its not tranformed, or we search it in the revision table
	private static final String CONTENT_FIELD_QUERY =
			"CASE WHEN i.content_version = 0 THEN i.content " +
			"  WHEN i.content_version = 1 THEN " +
			"  COALESCE((select _inf.content from "+NEWS_INFO_REVISION_TABLE+" _inf where _inf.info_id = i.id and _inf.content_version = 0 order by _inf.id DESC limit 1 )," +
			" i.content) " +
			" END ";
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
	public void create(final JsonObject data, final UserInfos user, final String eventStatus, HttpServerRequest request, final Handler<Either<String, JsonObject>> handler) {
		String queryNewInfoId = "SELECT nextval('actualites.info_id_seq') as id";
		Sql.getInstance().raw(queryNewInfoId, SqlResult.validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
			@Override
			public void handle(Either<String, JsonObject> event) {
				if (event.isRight()) {
					final Long infoId = event.right().getValue().getLong("id");
					SqlStatementsBuilder s = new SqlStatementsBuilder();

					String userQuery = "SELECT "+ NEWS_SCHEMA + ".merge_users(?,?)";
					s.prepared(userQuery, new fr.wseduc.webutils.collections.JsonArray().add(user.getUserId()).add(user.getUsername()));

					data.put("owner", user.getUserId())
						.put("id", infoId)
						.put("content_version", 1);
					s.insert(NEWS_INFO_TABLE, data, "id");

					JsonObject revision = mapRevision(infoId, data);
					revision.put("event", eventStatus);
					s.insert(NEWS_INFO_REVISION_TABLE, revision, null);

					Sql.getInstance().transaction(s.build(), validUniqueResultHandler(1, handler));
				} else {
					log.error("Failure to call nextval('"+ NEWS_SCHEMA +".info_id_seq') sequence");
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
	public void update(String id, JsonObject data, UserInfos user, String eventStatus, HttpServerRequest request, Handler<Either<String, JsonObject>> handler) {
		SqlStatementsBuilder s = new SqlStatementsBuilder();

		String userQuery = "SELECT "+ NEWS_SCHEMA + ".merge_users(?,?)";
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
		String query = "UPDATE " + NEWS_INFO_TABLE +
						" SET " + sb.toString() + "modified = NOW() " +
						" WHERE id = ? " +
						" RETURNING id";

		s.prepared(query, values.add(Integer.parseInt(id)));

		JsonObject revision = mapRevision(Long.parseLong(id), data);
		revision.put("owner", user.getUserId());
		revision.put("event", eventStatus);
		s.insert(NEWS_INFO_REVISION_TABLE, revision, null);

		Sql.getInstance().transaction(s.build(), SqlResult.validUniqueResultHandler(1, handler));
	}

	@Override
	public void transformerUpdateQuietly(News news) {
		SqlStatementsBuilder s = new SqlStatementsBuilder();

		String query = "WITH content_update AS (" +
				" UPDATE " + NEWS_INFO_TABLE +
				" SET content = ?, content_version = 1, modified = NOW() " +
				" WHERE id = ? AND content_version = 0 " +
				" RETURNING id, title, content, owner, '"+ Events.UPDATE +"', content_version) " +
				" INSERT INTO " + NEWS_INFO_REVISION_TABLE +
				" (info_id, title, content, owner, event, content_version) " +
				" SELECT * FROM content_update ";

		JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
		values.add(news.getContent());
		values.add(news.getId());

		s.prepared(query, values);

		Sql.getInstance().transaction(s.build(), r -> {
			if (!"ok".equals(r.body().getString("status"))) {
				log.error(String.format("[Actualites@%s::update] Error while persisting transformer update", this.getClass().getSimpleName()));
			}
		});
	}

	@Override
	public void retrieve(String id, boolean filterAdmlGroup, Handler<Either<String, JsonObject>> handler) {
			String query;
			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			String admlFilter = filterAdmlGroup ? " AND (ts.adml_group = false OR ts.adml_group IS NULL) " : "";
			query = "SELECT i.id as _id, i.title, i.content, i.status, i.publication_date, i.expiration_date, i.is_headline, i.thread_id, i.created, i.modified" +
				", i.owner, i.content_version, u.username, t.title AS thread_title, t.icon AS thread_icon" +
				", (SELECT json_agg(cr.*) FROM (" +
					"SELECT c.id as _id, c.comment, c.owner, c.created, c.modified, au.username, au.deleted" +
					" FROM "+NEWS_COMMENT_TABLE+" AS c" +
					" LEFT JOIN "+NEWS_USER_TABLE+" AS au ON c.owner = au.id" +
					" WHERE i.id = c.info_id" +
					" ORDER BY c.modified ASC) cr)" +
					" AS comments" +
				", json_agg(row_to_json(row(ios.member_id, ios.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM "+NEWS_INFO_TABLE+" AS i" +
				" LEFT JOIN "+NEWS_THREAD_TABLE+" AS t ON i.thread_id = t.id" +
				" LEFT JOIN "+NEWS_THREAD_SHARE_TABLE+" AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN "+NEWS_USER_TABLE+" AS u ON i.owner = u.id" +
				" LEFT JOIN "+NEWS_INFO_SHARE_TABLE+" AS ios ON i.id = ios.resource_id" +
				" LEFT JOIN "+NEWS_MEMBER_TABLE+" AS m ON ((ts.member_id = m.id OR ios.member_id = m.id) AND m.group_id IS NOT NULL)" +
				" WHERE i.id = ? " + admlFilter +
				" GROUP BY i.id, u.username, t.id" +
				" ORDER BY i.modified DESC";
			values.add(Sql.parseId(id));
			Sql.getInstance().prepared(query.toString(), values, SqlResult.parseSharedUnique(handler));
	}
	
	@Override
	public void retrieve(String id, UserInfos user, boolean originalContent, Handler<Either<String, JsonObject>> handler) {
		if (user != null) {
			String query;
			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}
			query = "SELECT i.id as _id, i.title, " + getContentFieldQuery(originalContent) + " as content, i.status, i.publication_date, i.expiration_date, i.is_headline, i.thread_id, i.created, i.modified" +
				", i.owner, i.content_version, u.username, t.title AS thread_title, t.icon AS thread_icon" +
				", (SELECT json_agg(cr.*) FROM (" +
					"SELECT c.id as _id, c.comment, c.owner, c.created, c.modified, au.username, au.deleted" +
					" FROM "+NEWS_COMMENT_TABLE+" AS c" +
					" LEFT JOIN "+NEWS_USER_TABLE+" AS au ON c.owner = au.id" +
					" WHERE i.id = c.info_id" +
					" ORDER BY c.modified ASC) cr)" +
					" AS comments" +
				", json_agg(row_to_json(row(ios.member_id, ios.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM "+NEWS_INFO_TABLE+" AS i" +
				" LEFT JOIN "+NEWS_THREAD_TABLE+" AS t ON i.thread_id = t.id" +
				" LEFT JOIN "+NEWS_THREAD_SHARE_TABLE+" AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN "+NEWS_USER_TABLE+" AS u ON i.owner = u.id" +
				" LEFT JOIN "+NEWS_INFO_SHARE_TABLE+" AS ios ON i.id = ios.resource_id" +
				" LEFT JOIN "+NEWS_MEMBER_TABLE+" AS m ON ((ts.member_id = m.id OR ios.member_id = m.id) AND m.group_id IS NOT NULL)" +
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
			values.add(THREAD_PUBLISH_RIGHT);
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
				", i.owner, i.content_version, u.username, t.title AS thread_title, t.icon AS thread_icon" +
				", (SELECT json_agg(cr.*) FROM (" +
					"SELECT c.id as _id, c.comment, c.owner, c.created, c.modified, au.username, au.deleted" +
					" FROM "+NEWS_COMMENT_TABLE+" AS c" +
					" LEFT JOIN "+NEWS_USER_TABLE+" AS au ON c.owner = au.id" +
					" WHERE i.id = c.info_id" +
					" ORDER BY c.modified ASC) cr)" +
					" AS comments" +
				", json_agg(row_to_json(row(ios.member_id, ios.action)::actualites.share_tuple)) as shared" +
				", array_to_json(array_agg(group_id)) as groups" +
				" FROM "+NEWS_INFO_TABLE+" AS i" +
				" LEFT JOIN "+NEWS_THREAD_TABLE+" AS t ON i.thread_id = t.id" +
				" LEFT JOIN "+NEWS_THREAD_SHARE_TABLE+" AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN "+NEWS_USER_TABLE+" AS u ON i.owner = u.id" +
				" LEFT JOIN "+NEWS_INFO_SHARE_TABLE+" AS ios ON i.id = ios.resource_id" +
				" LEFT JOIN "+NEWS_MEMBER_TABLE+" AS m ON ((ts.member_id = m.id OR ios.member_id = m.id) AND m.group_id IS NOT NULL)" +
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
			values.add(THREAD_PUBLISH_RIGHT);
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

	@Override
	public Future<List<NewsLight>> listLastPublishedInfos(UserInfos user, int resultSize) {
		Promise<List<NewsLight>> promise = Promise.promise();
		listLastPublishedInfosOptimized(user, resultSize, h -> {
			//filter necessary line
			List<NewsLight> pojo = h.right().getValue().stream()
					.filter(row -> row instanceof JsonObject)
					.map(JsonObject.class::cast)
					.map(row -> {
						final NewsThreadInfo thread = new NewsThreadInfo(
								row.getInteger("thread_id"),
								row.getString("thread_title"),
								row.getString("thread_icon")
						);
						return new NewsLight(
								row.getInteger("_id"),
								thread,
								row.getString("username"),
								row.getString("date"),
								row.getString("title")
								);
					})
					.collect(Collectors.toList());
			promise.complete(pojo);
		});
		return promise.future();
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
				" FROM "+NEWS_INFO_TABLE+" AS i" +
				" LEFT JOIN "+NEWS_THREAD_TABLE+" AS t ON i.thread_id = t.id" +
				" LEFT JOIN "+NEWS_USER_TABLE+" AS u ON i.owner = u.id" +
				" LEFT JOIN "+NEWS_INFO_SHARE_TABLE+" AS ios ON i.id = ios.resource_id" +
				" LEFT JOIN "+NEWS_MEMBER_TABLE+" AS m ON (ios.member_id = m.id AND m.group_id IS NOT NULL)" +
				" WHERE ((ios.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) + "AND ios.action = ?) OR i.owner = ?)" +
				" AND i.status = 3" +
					" AND (i.publication_date <= LOCALTIMESTAMP OR i.publication_date IS NULL) AND (i.expiration_date > LOCALTIMESTAMP OR i.expiration_date IS NULL)" +
				" GROUP BY i.id, u.username, t.id" +
				" ORDER BY date DESC" +
				" LIMIT ?";

			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(RESOURCE_SHARED_RIGHT);
			values.add(user.getUserId());
			values.add(resultSize);
			Sql.getInstance().prepared(query.toString(), values, SqlResult.parseShared(handler));
		}
	}

	private void listLastPublishedInfosOptimized(UserInfos user, int resultSize, Handler<Either<String, JsonArray>> handler) {
		final StopWatch watch1 = new StopWatch();
		log.debug("Starting optimized query...");
		helperSql.getInfosIdsByUnion(user, resultSize, 0, Lists.newArrayList(NewsStatus.PUBLISHED), null, null).onComplete(resIds -> {
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
					subquery.append("FROM "+NEWS_INFO_TABLE+" ");
					subquery.append("INNER JOIN "+NEWS_THREAD_TABLE+" ON (info.thread_id = thread.id) ");
					subquery.append("INNER JOIN "+NEWS_USER_TABLE+" ON (info.owner = users.id) ");
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
				" FROM "+NEWS_INFO_TABLE+" AS i" +
				" LEFT JOIN "+NEWS_THREAD_TABLE+" AS t ON i.thread_id = t.id" +
				" LEFT JOIN "+NEWS_THREAD_SHARE_TABLE+" AS ts ON t.id = ts.resource_id" +
				" LEFT JOIN "+NEWS_USER_TABLE+" AS u ON i.owner = u.id" +
				" LEFT JOIN "+NEWS_INFO_SHARE_TABLE+" AS ios ON i.id = ios.resource_id" +
				" LEFT JOIN "+NEWS_MEMBER_TABLE+" AS m ON ((ts.member_id = m.id OR ios.member_id = m.id) AND m.group_id IS NOT NULL)" +
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
			values.add(THREAD_PUBLISH_RIGHT);
			values.add(user.getUserId());
			Sql.getInstance().prepared(query.toString(), values, SqlResult.parseShared(handler));
		}
	}

	@Override
	public void getSharedWithIds(String infoId, Boolean filterAdmlGroup, final Handler<Either<String, JsonArray>> handler) {
		this.retrieve(infoId, filterAdmlGroup, event -> {
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
        });
	}

	@Override
	public void getOwnerInfo(String infoId, Handler<Either<String, JsonObject>> handler) {
		if (infoId != null && !infoId.isEmpty()) {
			String query = "SELECT info.owner FROM " + NEWS_INFO_TABLE + " WHERE" +
					" id = ?;";

			Sql.getInstance().prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(Long.parseLong(infoId)),
					SqlResult.validUniqueResultHandler(handler));
		}
	}

    @Override
    public void getRevisions(Long infoId, Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT r.id as _id, created, title, content, owner as user_id, " +
                " event as eventName, username, content_version as contentVersion " +
                "FROM "+ NEWS_INFO_REVISION_TABLE +" AS r " +
                "INNER JOIN "+ NEWS_USER_TABLE +" AS u ON (r.owner = u.id) " +
                "WHERE info_id = ? " +
                "ORDER BY created DESC;";
        Sql.getInstance().prepared(query, new fr.wseduc.webutils.collections.JsonArray().add(infoId),
                SqlResult.validResultHandler(handler));
    }

	@Override
	public Future<List<News>> listPaginated(Map<String, SecuredAction> securedActions, UserInfos user, int page, int pageSize, Integer threadId) {
		List<Integer> threadIds = new ArrayList<>();
		if (threadId != null) threadIds.add(threadId);

		return listPaginated(securedActions, user, page, pageSize, threadIds, Arrays.asList(NewsStatus.PUBLISHED), Collections.emptyList());
	}

	@Override
	public Future<List<News>> listPaginated(Map<String, SecuredAction> securedActions, UserInfos user, int page, int pageSize, List<Integer> threadIds, List<NewsStatus> statuses) {
		return listPaginated(securedActions, user, page, pageSize, threadIds, statuses, Collections.emptyList());
	}

	@Override
	public Future<List<News>> listPaginated(Map<String, SecuredAction> securedActions, UserInfos user, int page, int pageSize, List<Integer> threadIds, List<NewsStatus> statuses, List<NewsState> states) {
		final Promise<List<News>> promise = Promise.promise();
		if (user == null) {
			promise.fail("user not provided");
			return promise.future();
		}
		List<String> groupsAndUserIds = new ArrayList<>();
		groupsAndUserIds.add(user.getUserId());
		if (user.getGroupsIds() != null) {
			groupsAndUserIds.addAll(user.getGroupsIds());
		}
		helperSql.getInfosIdsByUnion(user, pageSize,page * pageSize, statuses, threadIds, states)
				.onSuccess( ids -> {
					if (ids.isEmpty()) {
						promise.complete(Collections.emptyList());
						return;
					}
					String query = "WITH " +
									"    user_groups AS MATERIALIZED ( " +
									"        SELECT id::varchar from ( "	+
									"        SELECT ? as id UNION ALL " +
									"        SELECT id FROM " + GROUPS_TABLE + " WHERE id IN " + 	Sql.listPrepared(groupsAndUserIds.toArray()) +
									"    	) as u_groups )" +
									"    SELECT i.id, i.thread_id, i.title, i.content, i.status, i.owner, u.username AS owner_name, " +
									"        u.deleted as owner_deleted, i.created, i.modified, i.publication_date, i.expiration_date, " +
									"        i.is_headline, i.number_of_comments," +
									"        (SELECT array_agg(DISTINCT ish.action) " +
									"            FROM actualites.info_shares AS ish  " +
									"            WHERE ish.resource_id = i.id " +
									"            AND ish.member_id IN (select id from user_groups)) as rights," +
									"		 i.content_version, " +
									"        COALESCE(( " +
									"         SELECT MAX(_inf.content_version) FROM " + NEWS_INFO_REVISION_TABLE + " _inf " +
									"         WHERE _inf.info_id = i.id AND _inf.content_version < i.content_version " +
									"        ), 1) as previous_content_version " +
									"    FROM " + NEWS_INFO_TABLE + " AS i " +
									"        LEFT JOIN " + NEWS_USER_TABLE + " AS u ON i.owner = u.id " +
									"    WHERE i.id IN " +  Sql.listPrepared(ids.toArray(new Object[0])) +
									"    ORDER BY i.modified DESC ";

					JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
					values.add(user.getUserId());
					groupsAndUserIds.forEach(values::add);

					ids.forEach(values::add);

					// Retrieve & parse data
					SqlStatementsBuilder builder = new SqlStatementsBuilder();
					//for optimization deactivate jit has it trigger, it take time to execute and give nothing in term of optimisation
					builder.prepared("set jit = off", new JsonArray());
					builder.prepared(query, values);
					builder.prepared("set jit = on", new JsonArray());

			Sql.getInstance().transaction(builder.build(), (sqlResult) -> {
				final Either<String, JsonArray> result = SqlResult.validResults(sqlResult);
				if (result.isLeft()) {
					promise.fail(result.left().getValue());
				} else {
					try {
						//filter necessary line
						JsonArray results = result.right().getValue().getJsonArray(1);
						List<News> pojo = results.stream()
							.filter(row -> row instanceof JsonObject)
							.map(JsonObject.class::cast)
							.map(row -> {
								final ResourceOwner owner = new ResourceOwner(
										row.getString("owner"),
										row.getString("owner_name"),
										row.getBoolean("owner_deleted")
								);
                                final boolean isOwner = user.getUserId().equals(row.getString("owner"));
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
										Rights.fromRawRights(securedActions, rawRights, isOwner, Rights.ResourceType.INFO),
										row.getInteger("content_version"),
										row.getInteger("previous_content_version")
								);
							})
							.collect(Collectors.toList());
						promise.complete(pojo);
					} catch (Exception e) {
						log.error("Failed to parse JsonObject", e);
						promise.fail(e);
					}
				}
			});
		}).onFailure( h->	promise.fail(h.getMessage()));
		return promise.future();
	}

	public Future<NewsComplete> getFromId(Map<String, SecuredAction> securedActions, UserInfos user, int infoId, boolean originalContent) {
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
					"    user_groups AS MATERIALIZED ( " +
					"        SELECT id::varchar from ( "	+
					"        SELECT ? as id UNION ALL " +
					"        SELECT id FROM " + GROUPS_TABLE + " WHERE id IN " + ids +
					"    	) as u_groups )," +
					"	 info_for_user AS ( " + // Every info owned of shared to the user
					"		 SELECT i.id, array_agg(DISTINCT ish.action) AS rights " +
					"    	 FROM " + NEWS_INFO_TABLE + " AS i " +
					"        	 JOIN " + NEWS_INFO_SHARE_TABLE + " AS ish ON i.id = ish.resource_id " +
					"    	 WHERE " +
					"        	 ish.member_id IN (SELECT id FROM user_groups) " +
					"    	 GROUP BY i.id " +
					"	 ), " +
					"	 thread_for_user AS ( " + // Every thread owned of shared to the user with publish rights
					"	 	 SELECT t.id, array_agg(DISTINCT tsh.action) AS rights" +
					"    	 FROM " + NEWS_THREAD_TABLE + " AS t " +
					"        	 INNER JOIN " + NEWS_THREAD_SHARE_TABLE + " AS tsh ON t.id = tsh.resource_id " +
					"    	 WHERE tsh.member_id IN (SELECT id FROM user_groups) " +
					"    	 GROUP BY t.id, tsh.member_id " +
					"	 ) " +
					"SELECT i.id, i.title, " + getContentFieldQuery(originalContent) + " as content , i.created, i.modified, i.is_headline, i.number_of_comments, " + // info data
					"        i.status, i.publication_date, i.expiration_date, " + // info publication data
					"		 i.owner, u.username AS owner_name, u.deleted AS owner_deleted, " + // info owner data
					"		 i.thread_id, i.content_version as content_version, t.title AS thread_title, t.icon AS thread_icon, " +
					"		 t.owner AS thread_owner, ut.username AS thread_owner_name, ut.deleted AS thread_owner_deleted, " + // thread owner data
					"		 max(info_for_user.rights) AS rights, " + // info rights
					"		 max(thread_for_user.rights) AS thread_rights " + // thread rights
					"    FROM " + NEWS_INFO_TABLE + " AS i " +
					"        LEFT JOIN info_for_user ON info_for_user.id = i.id " +
					" 		 LEFT JOIN thread_for_user ON thread_for_user.id = i.thread_id " +
					"        LEFT JOIN " + NEWS_USER_TABLE + " AS u ON i.owner = u.id " +
					" 		 LEFT JOIN " + NEWS_THREAD_TABLE + " AS t ON t.id = i.thread_id " +
					"        LEFT JOIN " + NEWS_USER_TABLE + " AS ut ON t.owner = ut.id " +
					"    WHERE " +
					"		 i.id = ? " + // get info from id
					"    GROUP BY i.id, i.title, content, i.created, i.modified, i.is_headline, i.number_of_comments, " +
					"        i.status, i.publication_date, i.expiration_date, " +
					"        i.owner, owner_name, owner_deleted, " +
					" 		 i.thread_id, i.content_version, thread_title, thread_icon, " +
					"		 thread_owner, thread_owner_name, thread_owner_deleted";

			JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
			values.add(user.getUserId());
			for(String value : groupsAndUserIds){
				values.add(value);
			}
			values.add(infoId);

			// 3. Retrieve & parse data
			SqlStatementsBuilder builder = new SqlStatementsBuilder();
			//for optimization deactivate jit has it trigger, it take time to execute and give nothing in term of otpimisation
			builder.prepared("set jit = off", new JsonArray());
			builder.prepared(query, values);
			builder.prepared("set jit = on", new JsonArray());
			Sql.getInstance().transaction(builder.build(), (sqlResult) -> {
				final Either<String, JsonArray> result = SqlResult.validResults(sqlResult);
				if (result.isLeft()) {
					promise.fail(result.left().getValue());
				} else {
					try {
						//filter unecessary line
						JsonArray results = result.right().getValue().getJsonArray(1);
						NewsComplete pojo = results.stream().filter(row -> row instanceof JsonObject).map(o -> {
							final JsonObject row = (JsonObject)o;
							final ResourceOwner owner = new ResourceOwner(
									row.getString("owner"),
									row.getString("owner_name"),
									row.getBoolean("owner_deleted")
							);
							final List<String> rawRights = SqlResult.sqlArrayToList(row.getJsonArray("rights"), String.class);
							final List<String> rawThreadRights = SqlResult.sqlArrayToList(row.getJsonArray("thread_rights"), String.class);
							final boolean isInfoOwner = user.getUserId().equals(row.getString("owner"));
							final boolean isThreadOwner = user.getUserId().equals(row.getString("thread_owner"));
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
									Rights.fromRawRights(securedActions, rawThreadRights, isThreadOwner, Rights.ResourceType.THREAD)
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
									Rights.fromRawRights(securedActions, rawRights, isInfoOwner, Rights.ResourceType.INFO),
									row.getInteger("content_version")
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

	private String getContentFieldQuery(boolean originalContent) {
		if(!originalContent)  {
			return "i.content";
		}
		return CONTENT_FIELD_QUERY;
	}

	@Override
	public Future<JsonObject> getStats(UserInfos user, Boolean viewHidden) {
		final Promise<JsonObject> promise = Promise.promise();
		if (user == null) {
			promise.fail("User's infos not provided");
		} else {
			List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}

			// Filter for multi-ADML users to hide automatically shared threads
			boolean filterMultiAdmlActivated = user.isADML() && user.getStructures().size() > 1;
			String filterAdml = "";
			if (filterMultiAdmlActivated && !viewHidden) {
				filterAdml = " AND tsh.adml_group = false ";
			}

			final String ids = Sql.listPrepared(groupsAndUserIds.toArray());

			StringBuilder statusAggregation = new StringBuilder("jsonb_build_object(");
			NewsStatus[] statuses = NewsStatus.values();
			for (int i = 0; i < statuses.length; i++) {
				if (i > 0) {
					statusAggregation.append(", ");
				}
				statusAggregation.append("'").append(statuses[i].name()).append("', ");
				if (statuses[i] == NewsStatus.PUBLISHED) {
					statusAggregation.append("COUNT(*) FILTER (WHERE i.status = ").append(statuses[i].getValue())
						.append(" AND (i.publication_date <= LOCALTIMESTAMP OR i.publication_date IS NULL) AND (i.expiration_date > LOCALTIMESTAMP OR i.expiration_date IS NULL))");
				} else {
					statusAggregation.append("COUNT(*) FILTER (WHERE i.status = ").append(statuses[i].getValue()).append(")");
				}
			}
			statusAggregation.append(")");

			String query =
					"WITH " +
					"    user_groups AS MATERIALIZED ( " +
					"        SELECT id::varchar from ( "	+
					"        SELECT ? as id UNION ALL " +
					"        SELECT id FROM " + GROUPS_TABLE + " WHERE id IN " + 	ids +
					"    	) as u_groups )," +
					"	 info_for_user AS ( " +
					"		 SELECT ish.resource_id AS id " +
					"    	 FROM " + NEWS_INFO_SHARE_TABLE + " AS ish  " +
					"    	 WHERE ish.member_id IN (SELECT id FROM user_groups) " +
					"    	 GROUP BY ish.resource_id " +
					"	 ), " +
					"	 thread_for_user AS ( " +
					"	 	 SELECT tsh.resource_id AS id" +
					"    	 FROM " + NEWS_THREAD_SHARE_TABLE + " AS tsh " +
					"    	 WHERE tsh.member_id IN (SELECT id FROM user_groups)" +
					"              AND tsh.action = 'net-atos-entng-actualites-controllers-InfoController|publish' " + filterAdml +
					"    	 GROUP BY tsh.resource_id " +
					"	 ) " +
					"SELECT t.id, " +
					"       COUNT(i.id) AS infos_count, " +
					"       " + statusAggregation + "::text AS status, " +
					"       COUNT(*) FILTER (WHERE i.status = " + NewsStatus.PUBLISHED.getValue() + " AND i.expiration_date < LOCALTIMESTAMP) AS expired_count, " +
					"       COUNT(*) FILTER (WHERE i.status = " + NewsStatus.PUBLISHED.getValue() + " AND i.publication_date > LOCALTIMESTAMP) AS incoming_count " +
					"FROM " + NEWS_THREAD_TABLE + " AS t " +
					"    LEFT JOIN " + NEWS_INFO_TABLE + " AS i ON t.id = i.thread_id " +
					"    LEFT JOIN info_for_user ON info_for_user.id = i.id " +
					" 	 LEFT JOIN thread_for_user ON thread_for_user.id = i.thread_id " +
					"WHERE (t.owner = ?  AND i.status >= 2  " +
					"      OR t.id IN ( SELECT id  FROM thread_for_user ) AND i.status >= 2  " +
					"      OR i.id IN ( SELECT id FROM info_for_user ) AND i.status >= 3" +
					"      OR i.owner = ?) " +
					"GROUP BY t.id " +
					"ORDER BY t.id";

			JsonArray params = new JsonArray();
			params.add(user.getUserId());	// user groups => owner
			groupsAndUserIds.forEach(params::add);	// user groups => clause in
			params.add(user.getUserId());			// t.owner
			params.add(user.getUserId());			// info owner

			Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(result -> {
				if (result.isLeft()) {
					log.error("Failed to get stats: " + result.left().getValue());
					promise.fail(result.left().getValue());
				} else {
					JsonArray rows = result.right().getValue();
					JsonArray threads = new JsonArray();

					for (int i = 0; i < rows.size(); i++) {
						JsonObject row = rows.getJsonObject(i);
						JsonObject thread = new JsonObject();
						thread.put("id", row.getInteger("id"));
						thread.put("infosCount", row.getInteger("infos_count", 0));

						JsonObject statusObj;
						String statusStr = row.getString("status");
						if (!isEmpty(statusStr)) {
							statusObj = new JsonObject(statusStr);
						} else {
							statusObj = new JsonObject();
						}
						thread.put("status", statusObj);
					thread.put("expiredCount", row.getInteger("expired_count", 0));
					thread.put("incomingCount", row.getInteger("incoming_count", 0));

						threads.add(thread);
					}

					JsonObject response = new JsonObject();
					response.put("threads", threads);
					promise.complete(response);
				}
			}));
		}
		return promise.future();
	}

}
