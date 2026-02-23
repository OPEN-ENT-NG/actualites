package net.atos.entng.actualites.services;


import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;

import java.util.Map;

public interface ThreadMigrationService {

    /**
     * Add adml group to thread's share
     * @param threadId the thread id
     */
    void addAdmlShare(String threadId);

}
