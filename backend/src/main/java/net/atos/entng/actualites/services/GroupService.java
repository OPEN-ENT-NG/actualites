package net.atos.entng.actualites.services;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

public interface GroupService {

    /**
     * Retreive the admin group of the structure
     * @param structureId id of the structure
     * @return JsonObject that contain group data
     */
    Future<JsonObject> getAdminLocalGroup(String structureId);

}
