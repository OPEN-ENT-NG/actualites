package net.atos.entng.actualites.services.impl;

import com.mongodb.QueryBuilder;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.actualites.constants.Field;
import net.atos.entng.actualites.services.TimelineMongo;
import org.entcore.common.service.impl.MongoDbCrudService;

import java.util.Date;

import static org.entcore.common.mongodb.MongoDbResult.validResultHandler;

public class TimelineMongoImpl extends MongoDbCrudService implements TimelineMongo {

    private final String collection;
    private final MongoDb mongo;
    private static final Logger log = LoggerFactory.getLogger(TimelineMongoImpl.class);

    public TimelineMongoImpl(final String collection, MongoDb mongo) {
        super(collection);
        this.collection = collection;
        this.mongo = mongo;
    }

    public Future<JsonObject> getNotification(String threadId, String infoId) {
        Promise<JsonObject> promise = Promise.promise();
        QueryBuilder builder = QueryBuilder.start(Field.PARAMS + "." + Field.RESOURCE_URI).is("/actualites#/view/thread/" + threadId + "/info/" + infoId);
        mongo.findOne(collection,  MongoQueryBuilder.build(builder), null, validResultHandler(res -> {
            if (res.isLeft()) {
                String message = String.format("[ACTUALITES@%s::getNotification] Failed to fetch notification : %s",
                        this.getClass().getSimpleName(), res.left().getValue());
                log.error(message);
                promise.fail(res.left().getValue());
            } else {
                JsonObject result = res.right().getValue();
                promise.complete(result);
            }
        }));
        return promise.future();
    }

    public Future<JsonObject> deleteNotification(JsonObject notification) {
        Promise<JsonObject> promise = Promise.promise();
        QueryBuilder builder = QueryBuilder.start(Field.MONGO_ID).is(notification.getString(Field.MONGO_ID));
        mongo.delete(collection, MongoQueryBuilder.build(builder), validResultHandler(res -> {
            if (res.isLeft()) {
                String message = String.format("[ACTUALITES@%s::deleteNotification] Failed to delete notification : %s",
                        this.getClass().getSimpleName(), res.left().getValue());
                log.error(message);
                promise.fail(res.left().getValue());
            } else {
                promise.complete(notification);
            }
        }));
        return promise.future();
    }
}
