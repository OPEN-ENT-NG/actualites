package net.atos.entng.actualites.services;


import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;

import java.util.Map;

public interface ThreadMigrationService {

    /**
     * Lauchn task to share threads to their admin local group
     * @return future for completion
     */
    Future<Void> addAdminLocalToThreads();

    /**
     * Add adml group to thread's share
     * @param threadId the thread id
     */
    void addAdmlShare(String threadId);

}
