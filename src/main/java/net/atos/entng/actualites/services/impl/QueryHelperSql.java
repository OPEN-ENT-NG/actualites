package net.atos.entng.actualites.services.impl;

import fr.wseduc.webutils.Either;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.StopWatch;

import java.util.*;
import java.util.stream.Collectors;

public class QueryHelperSql {
    private static Logger log = LoggerFactory.getLogger(QueryHelperSql.class);
    private static final String THREAD_PUBLISH = "net-atos-entng-actualites-controllers-InfoController|publish";

    public void fetchInfos(final UserInfos user, final boolean optimized, final Handler<Either<String, JsonArray>> handler){
        if(optimized){
            fetchInfosOptimzed(user, handler);
        } else{
            fetchInfosNotOptimzed(user, handler);
        }
    }

    private Future<Set<Long>> getInfoIds(final UserInfos user){
        //union have the same query time ....
        final List<String> groupsAndUserIds = new ArrayList<>();
        groupsAndUserIds.add(user.getUserId());
        if (user.getGroupsIds() != null) {
            groupsAndUserIds.addAll(user.getGroupsIds());
        }
        final String memberIds = Sql.listPrepared(groupsAndUserIds.toArray());
        final Future<Set<Long>> futureOwner = Future.future();
        final Future<Set<Long>> futureInfoShare = Future.future();
        {
            final StringBuilder queryIds = new StringBuilder();
            queryIds.append("SELECT id FROM actualites.info WHERE info.owner = ? ");
            final JsonArray values = new JsonArray().add(user.getUserId());
            Sql.getInstance().prepared(queryIds.toString(), values, SqlResult.validResultHandler(resIds -> {
                try{
                    if(resIds.isLeft()){
                        futureOwner.fail(resIds.left().getValue());
                    }else{
                        final JsonArray res = resIds.right().getValue();
                        final Set<Long> ids = res.stream().map(e-> ((JsonObject)e).getLong("id")).collect(Collectors.toSet());
                        futureOwner.complete(ids);
                    }
                }catch (Exception e){
                    futureOwner.fail(e);
                }
            }));
        }
        {
            final StringBuilder queryIds = new StringBuilder();
            queryIds.append("SELECT id FROM actualites.info_shares ");
            queryIds.append("INNER JOIN actualites.info ON (info.id = info_shares.resource_id) ");
            queryIds.append("WHERE info_shares.member_id IN ").append(memberIds);
            queryIds.append(" AND info.status > 2 ");
            queryIds.append(" AND (info.publication_date <= LOCALTIMESTAMP OR info.publication_date IS NULL)");
            queryIds.append(" AND (info.expiration_date > LOCALTIMESTAMP OR info.expiration_date IS NULL) ");
            final JsonArray values = new JsonArray().addAll(new JsonArray(groupsAndUserIds));
            Sql.getInstance().prepared(queryIds.toString(), values, SqlResult.validResultHandler(resIds -> {
                try{
                    if(resIds.isLeft()){
                        futureInfoShare.fail(resIds.left().getValue());
                    }else{
                        final JsonArray res = resIds.right().getValue();
                        final Set<Long> ids = res.stream().map(e-> ((JsonObject)e).getLong("id")).collect(Collectors.toSet());
                        futureInfoShare.complete(ids);
                    }
                }catch (Exception e){
                    futureInfoShare.fail(e);
                }
            }));
        }
        final StringBuilder queryIds = new StringBuilder();
        queryIds.append("SELECT info.id as id FROM actualites.thread_shares ");
        queryIds.append("INNER JOIN actualites.thread ON (thread.id = thread_shares.resource_id) ");
        queryIds.append("INNER JOIN actualites.info ON (info.thread_id = thread.id) ");
        queryIds.append("WHERE thread.owner = ? ");
        queryIds.append(" OR ( thread_shares.member_id IN ").append(memberIds);
        queryIds.append("      AND thread_shares.action = '" + THREAD_PUBLISH + "'");
        queryIds.append("    )  AND info.status > 1 ");
        final JsonArray values = new JsonArray().add(user.getUserId()).addAll(new JsonArray(groupsAndUserIds));
        final Future<Set<Long>> future = Future.future();
        Sql.getInstance().prepared(queryIds.toString(), values, SqlResult.validResultHandler(resIds -> {
            try{
                if(resIds.isLeft()){
                    future.fail(resIds.left().getValue());
                }else{
                    CompositeFuture.all(futureOwner, futureInfoShare).setHandler(r->{
                        if(r.failed()){
                            future.fail(r.cause());
                            return;
                        }
                        final JsonArray res = resIds.right().getValue();
                        final Set<Long> ids = res.stream().map(e-> ((JsonObject)e).getLong("id")).collect(Collectors.toSet());
                        ids.addAll(futureOwner.result());
                        ids.addAll(futureInfoShare.result());
                        future.complete(ids);
                    });
                }
            }catch (Exception e){
                futureInfoShare.fail(e);
            }
        }));
        return future;
    }

    private Future<Set<Long>> getInfosIdsByUnion(final UserInfos user){
        final List<String> groupsAndUserIds = new ArrayList<>();
        groupsAndUserIds.add(user.getUserId());
        if (user.getGroupsIds() != null) {
            groupsAndUserIds.addAll(user.getGroupsIds());
        }
        final String memberIds = Sql.listPrepared(groupsAndUserIds.toArray());
        //get infos ids
        final StringBuilder queryIds = new StringBuilder();
        queryIds.append("SELECT id FROM actualites.info WHERE info.owner = ? ");
        queryIds.append("UNION ");
        queryIds.append("SELECT id FROM actualites.info_shares ");
        queryIds.append("INNER JOIN actualites.info ON (info.id = info_shares.resource_id) ");
        queryIds.append("WHERE info_shares.member_id IN ").append(memberIds);
        queryIds.append(" AND info.status > 2 ");
        queryIds.append(" AND (info.publication_date <= LOCALTIMESTAMP OR info.publication_date IS NULL)");
        queryIds.append(" AND (info.expiration_date > LOCALTIMESTAMP OR info.expiration_date IS NULL) ");
        queryIds.append("UNION ");
        queryIds.append("SELECT info.id as id FROM actualites.thread_shares ");
        queryIds.append("INNER JOIN actualites.thread ON (thread.id = thread_shares.resource_id) ");
        queryIds.append("INNER JOIN actualites.info ON (info.thread_id = thread.id) ");
        queryIds.append("WHERE thread.owner = ? ");
        queryIds.append(" OR ( thread_shares.member_id IN ").append(memberIds);
        queryIds.append("      AND thread_shares.action = '" + THREAD_PUBLISH + "'");
        queryIds.append("    )  AND info.status > 1 ");
        final JsonArray values = new JsonArray()
                .add(user.getUserId())
                .addAll(new JsonArray(groupsAndUserIds))
                .add(user.getUserId())
                .addAll(new JsonArray(groupsAndUserIds));
        final Future<Set<Long>> future = Future.future();
        Sql.getInstance().prepared(queryIds.toString(), values, SqlResult.validResultHandler(resIds -> {
            if(resIds.isLeft()){
                future.fail(resIds.left().getValue());
            }else{
                final JsonArray resultIds = resIds.right().getValue();
                final Set<Long> ids = resultIds.stream().map(e-> ((JsonObject)e).getLong("id")).collect(Collectors.toSet());
                future.complete(ids);
            }
        }));
        return future;
    }

    private void fetchInfosOptimzed(final UserInfos user, final Handler<Either<String, JsonArray>> handler){
        final StopWatch watch1 = new StopWatch();
        log.debug("Starting optimized query...");
        getInfosIdsByUnion(user).setHandler(resIds -> {
            log.debug("Infos IDS query..."+watch1.elapsedTimeSeconds());
            if(resIds.failed()){
                handler.handle(new Either.Left<>(resIds.cause().getMessage()));
            }else{
                final Set<Long> ids = resIds.result();
                if(ids.isEmpty()){
                    handler.handle(new Either.Right<>(new JsonArray()));
                    return;
                }
                final JsonArray jsonIds = new JsonArray(new ArrayList(ids));
                final String infoIds = Sql.listPrepared(ids.toArray());
                final Future<Map<Long, String>> futureComments = Future.future();
                final Future<Map<Long, JsonArray>> futureShared = Future.future();
                //subquery comments
                {
                    final StringBuilder subquery = new StringBuilder();
                    subquery.append("SELECT cr.info_id as info_id, json_agg(cr.*) as comments  FROM (");
                    subquery.append("  SELECT comment.id as _id, comment.comment, comment.owner, comment.created, comment.modified, users.username, comment.info_id");
                    subquery.append("  FROM actualites.comment INNER JOIN actualites.users ON comment.owner = users.id ");
                    subquery.append("  WHERE comment.info_id IN ").append(infoIds).append(" ORDER BY comment.modified ASC");
                    subquery.append(") cr GROUP BY cr.info_id;");
                    final JsonArray subValues = new JsonArray().addAll(jsonIds);
                    final StopWatch watch2 = new StopWatch();
                    Sql.getInstance().prepared(subquery.toString(), subValues, SqlResult.validResultHandler(rComments->{
                        log.debug("Infos COMMENTS query..."+watch2.elapsedTimeSeconds());
                        try{
                            if(rComments.isLeft()){
                                futureComments.fail(rComments.left().getValue());
                            }else{
                                final Map<Long, String> mapping = new HashMap<>();
                                final JsonArray comments = rComments.right().getValue();
                                for(int i = 0; i < comments.size(); i++){
                                    final JsonObject row = comments.getJsonObject(i);
                                    mapping.put(row.getLong("info_id"), row.getString("comments"));
                                }
                                futureComments.complete(mapping);
                            }
                        }catch (Exception e){
                            futureComments.fail(e);
                        }
                    }));
                }
                //subquery shared and groups
                {
                    final StringBuilder subquery = new StringBuilder();
                    subquery.append("SELECT info_shares.resource_id as info_id, ");
                    subquery.append("  CASE WHEN array_to_json(array_agg(group_id)) IS NULL THEN '[]'::json ELSE array_to_json(array_agg(group_id)) END as groups, ");
                    subquery.append("  json_agg(row_to_json(row(info_shares.member_id, info_shares.action)::actualites.share_tuple)) as shared ");
                    subquery.append("FROM actualites.info_shares ");
                    subquery.append("INNER JOIN actualites.members ON (info_shares.member_id = members.group_id) ");
                    subquery.append("WHERE info_shares.resource_id IN ").append(infoIds).append(" ");
                    subquery.append("GROUP BY info_shares.resource_id;");
                    final JsonArray subValues = new JsonArray().addAll(jsonIds);
                    final StopWatch watch2 = new StopWatch();
                    Sql.getInstance().prepared(subquery.toString(), subValues, SqlResult.parseShared(rShared->{
                        log.debug("Infos SHARED query..."+watch2.elapsedTimeSeconds());
                        try{
                            if(rShared.isLeft()){
                                futureShared.fail(rShared.left().getValue());
                            }else{
                                final Map<Long, JsonArray> mapping = new HashMap<>();
                                final JsonArray shared = rShared.right().getValue();
                                for(int i = 0; i < shared.size(); i++){
                                    final JsonObject row = shared.getJsonObject(i);
                                    mapping.put(row.getLong("info_id"), row.getJsonArray("shared"));
                                }
                                futureShared.complete(mapping);
                            }
                        }catch (Exception e){
                            futureShared.fail(e);
                        }
                    }));
                }
                //subquery infos
                {
                    final StringBuilder subquery = new StringBuilder();
                    subquery.append("SELECT info.id as _id, info.title, info.content, info.status, info.publication_date, info.expiration_date, info.is_headline, ");
                    subquery.append("  info.thread_id, info.created, info.modified, info.owner, users.username, thread.title AS thread_title, thread.icon AS thread_icon ");
                    subquery.append("FROM actualites.info ");
                    subquery.append("INNER JOIN actualites.thread ON (info.thread_id = thread.id) ");
                    subquery.append("INNER JOIN actualites.users ON (info.owner = users.id) ");
                    subquery.append("WHERE info.id IN ").append(infoIds).append(" ");
                    subquery.append("GROUP BY info.id, users.username, thread.id ORDER BY info.modified DESC;");
                    final JsonArray subValues = new JsonArray().addAll(jsonIds);
                    final StopWatch watch2 = new StopWatch();
                    Sql.getInstance().prepared(subquery.toString(), subValues, SqlResult.validResultHandler(rInfos->{
                        log.debug("Infos FINAL query..."+watch2.elapsedTimeSeconds());
                        try{
                            if(rInfos.isLeft()){
                                handler.handle(rInfos);
                            }else{
                                CompositeFuture.all(futureComments, futureShared).setHandler(rAll->{
                                    try{
                                        final Map<Long, String> comments = futureComments.result();
                                        final Map<Long, JsonArray> shared = futureShared.result();
                                        final JsonArray infos = rInfos.right().getValue();
                                        for(int i = 0; i < infos.size(); i++){
                                            final JsonObject row = infos.getJsonObject(i);
                                            final Long _id = row.getLong("_id");
                                            row.put("shared", shared.getOrDefault(_id, new JsonArray()));
                                            row.put("comments", comments.getOrDefault(_id, "[]"));
                                        }
                                        handler.handle(new Either.Right<>(infos));
                                    }catch (Exception e){
                                        handler.handle(new Either.Left<>(e.getMessage()));
                                    }
                                });
                            }
                        }catch (Exception e){
                            handler.handle(new Either.Left<>(e.getMessage()));
                        }
                    }));
                }
            }
        });
    }

    private void fetchInfosNotOptimzed(final UserInfos user, final Handler<Either<String, JsonArray>> handler){
        log.debug("Starting NOT optimized query...");
        final List<String> groupsAndUserIds = new ArrayList<>();
        groupsAndUserIds.add(user.getUserId());
        if (user.getGroupsIds() != null) {
            groupsAndUserIds.addAll(user.getGroupsIds());
        }
        final String query = "WITH news AS (" +
                "SELECT id " +
                "FROM actualites.info " +
                "WHERE info.owner = ? " +
                "UNION " +
                "SELECT id " +
                "FROM actualites.info_shares " +
                "INNER JOIN actualites.info ON (info.id = info_shares.resource_id) " +
                "WHERE info_shares.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) +
                " AND info.status > 2 " +
                "AND (info.publication_date <= LOCALTIMESTAMP OR info.publication_date IS NULL) " +
                "AND (info.expiration_date > LOCALTIMESTAMP OR info.expiration_date IS NULL) " +
                "UNION " +
                "SELECT info.id as id " +
                "FROM actualites.thread_shares " +
                "INNER JOIN actualites.thread ON (thread.id = thread_shares.resource_id) " +
                "INNER JOIN actualites.info ON (info.thread_id = thread.id) " +
                "WHERE thread.owner = ? " +
                "OR (thread_shares.member_id IN " + Sql.listPrepared(groupsAndUserIds.toArray()) +
                " AND thread_shares.action = '" + THREAD_PUBLISH + "') AND info.status > 1) " +
                "SELECT info.id as _id, info.title, info.content, info.status, info.publication_date, info.expiration_date, info.is_headline, info.thread_id, info.created, info.modified, " +
                "info.owner, users.username, thread.title AS thread_title, thread.icon AS thread_icon, ( " +
                "SELECT json_agg(cr.*) " +
                "FROM ( " +
                "SELECT comment.id as _id, comment.comment, comment.owner, comment.created, comment.modified, users.username " +
                "FROM actualites.comment INNER JOIN actualites.users ON comment.owner = users.id " +
                "WHERE info.id = comment.info_id ORDER BY comment.modified ASC) cr) " +
                "AS comments, json_agg(row_to_json(row(info_shares.member_id, info_shares.action)::actualites.share_tuple)) as shared, " +
                "(SELECT CASE WHEN array_to_json(array_agg(group_id)) IS NULL THEN '[]'::json ELSE array_to_json(array_agg(group_id)) END " +
                "FROM actualites.info_shares " +
                "INNER JOIN news ON (news.id = info_shares.resource_id) " +
                "INNER JOIN actualites.members ON (info_shares.member_id = members.group_id) " +
                "WHERE news.id = info.id) as groups " +
                "FROM actualites.info " +
                "INNER JOIN news ON (info.id = news.id) " +
                "INNER JOIN actualites.thread ON (info.thread_id = thread.id) " +
                "INNER JOIN actualites.users ON (info.owner = users.id) " +
                "LEFT JOIN actualites.info_shares ON (info.id = info_shares.resource_id) " +
                "GROUP BY info.id, users.username, thread.id ORDER BY info.modified DESC;";
        final JsonArray values = new JsonArray()
                .add(user.getUserId())
                .addAll(new JsonArray(groupsAndUserIds))
                .add(user.getUserId())
                .addAll(new JsonArray(groupsAndUserIds));
        Sql.getInstance().prepared(query, values, SqlResult.parseShared(handler));
    }
}
