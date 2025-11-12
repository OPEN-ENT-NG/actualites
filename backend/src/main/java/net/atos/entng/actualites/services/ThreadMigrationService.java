package net.atos.entng.actualites.services;


import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;

import java.util.Map;

public interface ThreadMigrationService {
    Future<Void> addAdminLocalToThreads();

    void addAdmlShare(String threadId, Promise<Void> promise);

}
