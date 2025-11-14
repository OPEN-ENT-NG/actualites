package net.atos.entng.actualites.services.impl;

import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.services.GroupService;

public class GroupServiceImpl implements GroupService {

    private final EventBus eb;

    public GroupServiceImpl(EventBus eb) {
        this.eb = eb;
    }


    @Override
    public Future<JsonObject> getAdminLocalGroup(String structureId) {
        Promise<JsonObject> promise = Promise.promise();
        Future<JsonObject> future = promise.future();
        getFunctionGroupOfStructure(structureId, ar -> {
            if (ar.succeeded() && ar.result().body().getString("status", "").equals("ok")) {
                JsonObject group = filterAdminLocalGroup(ar.result().body().getJsonArray("result"));
                promise.complete(group);
            } else {
                promise.fail(ar.cause());
            }
        });
        return future;
    }

    private void getFunctionGroupOfStructure(String structureId, Handler<AsyncResult<Message<JsonObject>>> handler) {
        JsonObject m = new JsonObject()
                .put("action", "list-groups")
                .put("structureId", structureId)
                .put("type", "FunctionGroup");

        eb.request("directory", m, handler);
    }

    private JsonObject filterAdminLocalGroup(JsonArray rows) {
        for(Object row : rows) {
            if (row instanceof JsonObject) {
                JsonObject group = (JsonObject)row;
                if (group.getString("filter", "").equals("AdminLocal")) {
                    return group;
                }
            }
        }
        return null;
    }
}
