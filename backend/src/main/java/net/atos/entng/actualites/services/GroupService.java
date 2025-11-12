package net.atos.entng.actualites.services;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

public interface GroupService {
    Future<JsonObject> getAdminLocalGroup(String structureId);
}
