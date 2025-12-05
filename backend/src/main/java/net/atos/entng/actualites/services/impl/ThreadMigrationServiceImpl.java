package net.atos.entng.actualites.services.impl;

import fr.wseduc.webutils.Either;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.services.GroupService;
import net.atos.entng.actualites.services.ThreadMigrationService;
import net.atos.entng.actualites.to.Rights;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

public class ThreadMigrationServiceImpl implements ThreadMigrationService {

    private static final Logger log = LoggerFactory.getLogger(ThreadMigrationServiceImpl.class);
    private final List<String> threadAdmlRights = new ArrayList<>();
    private final GroupService groupService;

    public ThreadMigrationServiceImpl(GroupService groupService, JsonObject rights) {
        this.groupService = groupService;
        threadAdmlRights.addAll(rights.getJsonArray(Rights.THREAD_CONTRIB)
                .stream()
                .map(String.class::cast)
                .collect(Collectors.toList()));
        threadAdmlRights.addAll(rights.getJsonArray(Rights.THREAD_MANAGER)
                .stream()
                .map(String.class::cast)
                .collect(Collectors.toList()));
        threadAdmlRights.addAll(rights.getJsonArray(Rights.THREAD_PUBLISH)
                .stream()
                .map(String.class::cast)
                .collect(Collectors.toList()));
    }

    @Override
    public Future<Void> addAdminLocalToThreads() {
        Promise<Void> promise = Promise.promise();
        String query = "SELECT t.id as id, t.structure_id as structure_id " +
                            "FROM actualites.thread AS t " +
                            "WHERE t.structure_id IS NOT NULL " +
                            "      AND t.migrated = false ";

        Sql.getInstance().prepared(query, new JsonArray(), res -> {
            Either<String, JsonArray> resp = SqlResult.validResult(res);
            if (resp.isLeft()) {
                promise.fail(resp.left().getValue());
                return;
            }

            Map<String, JsonObject> structToAdminGroup = new HashMap<>();
            Map<Integer, String> threadToStructureId = new HashMap<>();
            Set<String> resolvedStructureAdminGroup = new HashSet<>();

            JsonArray rows = resp.right().getValue();
            List<Future> futures = new ArrayList<>();

            for (Object row : rows) {
                String structureId = ((JsonObject)row).getString("structure_id");
                threadToStructureId.put(((JsonObject)row).getInteger("id"), structureId);

                if(!resolvedStructureAdminGroup.contains(structureId)){
                    resolvedStructureAdminGroup.add(structureId);
                    futures.add(groupService.getAdminLocalGroup(structureId)
                            .onSuccess( g -> structToAdminGroup.put(structureId, g))
                            .onFailure(ex -> log.warn(ex.getMessage())));
                }
            }

            CompositeFuture.all(futures)
                    .onComplete(ar -> {
                if (ar.succeeded()) {
                    updateThreadAndAddShared(structToAdminGroup, threadToStructureId, promise);
                } else {
                    promise.fail(ar.cause());
                }
            });
        });
        return promise.future();
    }

    @Override
    public void addAdmlShare(String threadId) {
        Sql.getInstance().prepared("SELECT structure_id FROM actualites.thread WHERE id = ? ",
                new JsonArray().add(threadId), h -> {
            Either<String, JsonArray> resp = SqlResult.validResult(h);
            if (resp.isLeft()) {
                log.error("Unable to find thread with thread id {}", threadId);
                return;
            }
            JsonArray rows = resp.right().getValue();
            if (rows.isEmpty()) {
                log.error("Unable to find thread with thread id {}", threadId);
                return;
            }
            JsonObject thread = rows.getJsonObject(0);
            if (thread.getString("structure_id") == null) {
                return;
            }
            groupService.getAdminLocalGroup(thread.getString("structure_id"))
                    .onSuccess( g -> {
                        Map<String, JsonObject> structToAdminGroup = new HashMap<>();
                        Map<Integer, String> threadToStructureId = new HashMap<>();
                        structToAdminGroup.put(thread.getString("structure_id"), g);
                        threadToStructureId.put(Integer.parseInt(threadId),  thread.getString("structure_id"));
                        updateThreadAndAddShared(structToAdminGroup, threadToStructureId, Promise.promise());
                    })
                    .onFailure( ex ->  log.error("Unable to find ADML group", ex));
        });
    }

    private void updateThreadAndAddShared(Map<String, JsonObject> structToAdminGroup,
                                         Map<Integer, String> threadToStructureId,
                                         Promise<Void> promise) {
        SqlStatementsBuilder statementsBuilder = new SqlStatementsBuilder();

        for (Map.Entry<Integer, String> entry : threadToStructureId.entrySet()) {
            JsonArray updateValues = new JsonArray().add(entry.getKey());
            statementsBuilder.prepared("UPDATE actualites.thread SET migrated = true" +
                                                " WHERE migrated = false AND id = ? ", updateValues);
            Integer threadId = entry.getKey();
            JsonArray values = new JsonArray();
            JsonObject group = structToAdminGroup.get(entry.getValue());
            if (group != null) {
                String groupId = group.getString("id");
                statementsBuilder.prepared(" INSERT INTO actualites.groups (id, name) VALUES (?, ?) ON CONFLICT DO NOTHING",
                        new JsonArray().add(groupId).add(group.getString("name")));
                statementsBuilder.prepared(" INSERT INTO actualites.members (id, group_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
                                                   new JsonArray().add(groupId).add(groupId));

                StringBuilder query = new StringBuilder(" INSERT INTO actualites.thread_shares (member_id, action, resource_id, adml_group) VALUES ");
                for (String right : threadAdmlRights) {
                    query.append(" (?, ?, ?, true),");
                    values.add(groupId);
                    values.add(right);
                    values.add(threadId);
                }
                query.deleteCharAt(query.length() - 1);
                query.append(" ON CONFLICT DO NOTHING ");
                statementsBuilder.prepared(query.toString(), values);
            }
        }
        Sql.getInstance().transaction(statementsBuilder.build(), res -> {
            promise.complete();
        });
    }

}
