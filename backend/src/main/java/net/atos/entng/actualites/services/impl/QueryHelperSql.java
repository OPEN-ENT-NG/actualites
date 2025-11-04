package net.atos.entng.actualites.services.impl;

import com.google.common.collect.Lists;
import fr.wseduc.webutils.Either;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.actualites.to.NewsState;
import net.atos.entng.actualites.to.NewsStatus;
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
        final Promise<Set<Long>> promiseOwner = Promise.promise();
        final Promise<Set<Long>> promiseInfoShare = Promise.promise();
        {
            final StringBuilder queryIds = new StringBuilder();
            queryIds.append("SELECT id FROM actualites.info WHERE info.owner = ? ");
            final JsonArray values = new JsonArray().add(user.getUserId());
            Sql.getInstance().prepared(queryIds.toString(), values, SqlResult.validResultHandler(resIds -> {
                try{
                    if(resIds.isLeft()){
                        promiseOwner.fail(resIds.left().getValue());
                    }else{
                        final JsonArray res = resIds.right().getValue();
                        final Set<Long> ids = res.stream().map(e-> ((JsonObject)e).getLong("id")).collect(Collectors.toSet());
                        promiseOwner.complete(ids);
                    }
                }catch (Exception e){
                    promiseOwner.fail(e);
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
                        promiseInfoShare.fail(resIds.left().getValue());
                    }else{
                        final JsonArray res = resIds.right().getValue();
                        final Set<Long> ids = res.stream().map(e-> ((JsonObject)e).getLong("id")).collect(Collectors.toSet());
                        promiseInfoShare.complete(ids);
                    }
                }catch (Exception e){
                    promiseInfoShare.fail(e);
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
        final Promise<Set<Long>> promiseInfoIds = Promise.promise();
        Sql.getInstance().prepared(queryIds.toString(), values, SqlResult.validResultHandler(resIds -> {
            try{
                if(resIds.isLeft()){
                    promiseInfoIds.fail(resIds.left().getValue());
                }else{
                    CompositeFuture.all(promiseOwner.future(), promiseInfoShare.future()).onComplete(r->{
                        if(r.failed()){
                            promiseInfoIds.fail(r.cause());
                            return;
                        }
                        final JsonArray res = resIds.right().getValue();
                        final Set<Long> ids = res.stream().map(e-> ((JsonObject)e).getLong("id")).collect(Collectors.toSet());
                        ids.addAll(promiseOwner.future().result());
                        ids.addAll(promiseInfoShare.future().result());
                        promiseInfoIds.complete(ids);
                    });
                }
            }catch (Exception e){
                promiseInfoShare.fail(e);
            }
        }));
        return promiseInfoIds.future();
    }

    public Future<Set<Long>> getInfosIdsByUnion(final UserInfos user, final Integer limit, final int offset,
                                                final List<NewsStatus> status, final List<Integer> threadIds, final List<NewsState> states){
        final List<String> groupsAndUserIds = new ArrayList<>();

        groupsAndUserIds.add(user.getUserId());
        if (user.getGroupsIds() != null) {
            groupsAndUserIds.addAll(user.getGroupsIds());
        }
        final String memberIds = Sql.listPrepared(groupsAndUserIds.toArray());

        String dateFilter = null;
        if (states != null && !states.isEmpty()) {
            List<String> stateConditions = new ArrayList<>();
            for (NewsState state : states) {
                switch (state) {
                    case EXPIRED:
                        stateConditions.add("(i.expiration_date < LOCALTIMESTAMP)");
                        break;
                    case INCOMING:
                        stateConditions.add("(i.publication_date > LOCALTIMESTAMP)");
                        break;
                    default:
                        log.warn("Unknown NewsState: " + state);
                        break;
                }
            }
            if (!stateConditions.isEmpty()) {
                dateFilter = String.join(" OR ", stateConditions);
            }
        }

        if (states == null || states.isEmpty()) {
            dateFilter = "(i.publication_date <= LOCALTIMESTAMP OR i.publication_date IS NULL) " +
                    "AND (i.expiration_date > LOCALTIMESTAMP OR i.expiration_date IS NULL)";
        }

        String threadFilter = "";
        boolean addThreadFilter = false;
        if (threadIds != null && !threadIds.isEmpty()) {
            addThreadFilter = true;
            String threadIdsSql = Sql.listPrepared(threadIds.toArray());
            threadFilter = " i.thread_id IN " + threadIdsSql + " ";
        }

        // Build status filter
        List<Integer> statusValues = status.stream().map(NewsStatus::ordinal).collect(Collectors.toList());
        String statusFilter = "i.status IN " + Sql.listPrepared(statusValues.toArray());

        //get infos ids
        final StringBuilder queryIds = new StringBuilder();
        queryIds.append("WITH user_groups AS MATERIALIZED ( ");
        queryIds.append("  SELECT id::varchar FROM ( ");
        queryIds.append("    SELECT ? as id UNION ");
        queryIds.append("    SELECT id FROM actualites.groups WHERE id IN ").append(memberIds);
        queryIds.append("  ) as u_groups) ");
        queryIds.append("(SELECT i.id, (CASE WHEN i.publication_date > i.modified THEN i.publication_date ELSE i.modified END) as date ");
        queryIds.append("  FROM actualites.info AS i WHERE i.owner = ? AND ");
        if (!threadFilter.isEmpty()) {
            queryIds.append(threadFilter).append(" AND ");
        }
        queryIds.append(        statusFilter ).append(" AND ");
        queryIds.append("       (i.status <> 3 OR ( " + dateFilter + " ) ) )");
        queryIds.append("UNION ");
        queryIds.append("  (SELECT i.id, (CASE WHEN i.publication_date > i.modified THEN i.publication_date ELSE i.modified END) as date ");
        queryIds.append("    FROM actualites.info_shares ");
        queryIds.append("    INNER JOIN actualites.info AS i ON i.id = info_shares.resource_id AND i.status = 3  ");
        queryIds.append("    WHERE info_shares.member_id IN (SELECT id FROM user_groups)");
        if (!threadFilter.isEmpty()) {
            queryIds.append("    AND " + threadFilter + " ");
        }
        queryIds.append("    AND " + statusFilter);
        queryIds.append("    AND ( " + dateFilter + " ) )");
        queryIds.append("UNION ");
        queryIds.append("  (SELECT i.id as id, (CASE WHEN i.publication_date > i.modified THEN i.publication_date ELSE i.modified END) as date ");
        queryIds.append("    FROM actualites.thread ");
        queryIds.append("    INNER JOIN actualites.info AS i ON (i.thread_id = thread.id) ");
        queryIds.append("    WHERE thread.owner = ? ");
        if (!threadFilter.isEmpty()) {
            queryIds.append("    AND " + threadFilter + " ");
        }
        queryIds.append("    AND " + statusFilter);
        queryIds.append("    AND (i.status <> 3 OR ( " + dateFilter + " ) ) )");
        queryIds.append("UNION ");
        queryIds.append("  (SELECT i.id as id, (CASE WHEN i.publication_date > i.modified THEN i.publication_date ELSE i.modified END) as date ");
        queryIds.append("    FROM actualites.thread_shares ");
        queryIds.append("    INNER JOIN actualites.thread ON (thread.id = thread_shares.resource_id) ");
        queryIds.append("    INNER JOIN actualites.info AS i ON (i.thread_id = thread.id) ");
        queryIds.append("    WHERE (thread_shares.member_id IN (SELECT id FROM user_groups)");
        queryIds.append("    AND thread_shares.action = '" + THREAD_PUBLISH + "' ");
        queryIds.append("    AND i.status > 1) AND ");
        if (!threadFilter.isEmpty()) {
            queryIds.append(threadFilter + " AND ");
        }
        queryIds.append(     statusFilter + " AND ");
        queryIds.append("    (i.status <> 3 OR ( " + dateFilter + " ) ) )");
        queryIds.append("ORDER BY date DESC ");
        if (limit != null) {
            queryIds.append("LIMIT ?");
        }
        queryIds.append(" OFFSET ? ");
        final JsonArray values = new JsonArray()
                .add(user.getUserId())
                .addAll(new JsonArray(groupsAndUserIds))
                .add(user.getUserId());
        if (addThreadFilter) {
            threadIds.forEach(values::add);
        }
        statusValues.forEach(values::add);
        if (addThreadFilter) {
            threadIds.forEach(values::add);
        }
        statusValues.forEach(values::add);
        values.add(user.getUserId());
        if (addThreadFilter) {
           threadIds.forEach(values::add);
        }
        statusValues.forEach(values::add);
        if (addThreadFilter) {
            threadIds.forEach(values::add);
        }
        statusValues.forEach(values::add);

        if (limit != null) {
            values.add(limit);
        }
        values.add(offset);
        final Promise<Set<Long>> promise = Promise.promise();
        Sql.getInstance().prepared(queryIds.toString(), values, SqlResult.validResultHandler(resIds -> {
            if(resIds.isLeft()){
                promise.fail(resIds.left().getValue());
            }else{
                final JsonArray resultIds = resIds.right().getValue();
                final Set<Long> ids = resultIds.stream().map(e-> ((JsonObject)e).getLong("id")).collect(Collectors.toSet());
                promise.complete(ids);
            }
        }));
        return promise.future();
    }

    private void fetchInfosOptimzed(final UserInfos user, final Handler<Either<String, JsonArray>> handler){
        getInfosIdsByUnion(user, null, 0, Lists.newArrayList(NewsStatus.PUBLISHED), null, null).onComplete(resIds -> {
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
                //subquery infos
                {
                    final StringBuilder subquery = new StringBuilder();
                    subquery.append("SELECT info.id as _id, info.title, info.content, info.status, info.publication_date, info.expiration_date, info.is_headline, info.number_of_comments, ");
                    subquery.append("  info.thread_id, info.created, info.modified, info.owner, users.username, thread.title AS thread_title, thread.icon AS thread_icon ");
                    subquery.append("FROM actualites.info ");
                    subquery.append("INNER JOIN actualites.thread ON (info.thread_id = thread.id) ");
                    subquery.append("INNER JOIN actualites.users ON (info.owner = users.id) ");
                    subquery.append("WHERE info.id IN ").append(infoIds).append(" ");
                    subquery.append("GROUP BY info.id, users.username, thread.id ORDER BY info.modified DESC;");
                    final JsonArray subValues = new JsonArray().addAll(jsonIds);
                    Sql.getInstance().prepared(subquery.toString(), subValues, SqlResult.validResultHandler(handler));
                }
            }
        });
    }

    public void fetchComments(final Long infoId, final Handler<Either<String, JsonArray>> handler) {
        final StringBuilder subquery = new StringBuilder();
        subquery.append("SELECT comment.id as _id, comment.comment, comment.owner, comment.created, comment.modified, users.username, comment.info_id ");
        subquery.append("FROM actualites.comment INNER JOIN actualites.users ON comment.owner = users.id ");
        subquery.append("WHERE comment.info_id = ? ORDER BY comment.created ASC");
        final JsonArray values = new JsonArray().add(infoId);
        Sql.getInstance().prepared(subquery.toString(), values, SqlResult.validResultHandler(handler));
    }

    public void fetchShared(final Long infoId, final Handler<Either<String, JsonArray>> handler) {
        final StringBuilder subquery = new StringBuilder();
        subquery.append("SELECT COALESCE(array_to_json(array_agg(group_id)), '[]'::JSON) as groups, ");
        subquery.append("COALESCE(json_agg(row_to_json(row(info_shares.member_id, info_shares.action)::actualites.share_tuple)), '[]'::JSON) as shared ");
        subquery.append("FROM actualites.info_shares ");
        subquery.append("LEFT JOIN actualites.members ON (info_shares.member_id = members.group_id) ");
        subquery.append("WHERE info_shares.resource_id = ? ");
        final JsonArray values = new JsonArray().add(infoId);
        Sql.getInstance().prepared(subquery.toString(), values, SqlResult.parseShared(parsed -> {
            if (parsed.isRight()) {
                try {
                    handler.handle(new Either.Right<>(parsed.right().getValue().getJsonObject(0).getJsonArray("shared")));
                } catch (Exception e) {
                    handler.handle(new Either.Left<>(e.getMessage()));
                }
            } else {
                handler.handle(parsed);
            }
        }));
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
