package net.atos.entng.actualites.service;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import net.atos.entng.actualites.constants.Field;
import net.atos.entng.actualites.services.impl.TimelineMongoImpl;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.mockito.Mockito;
import org.entcore.common.user.UserInfos;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.mockito.Mockito.mock;

@RunWith(VertxUnitRunner.class)
public class TimelineMongoImplTest {

    MongoDb mongo = mock(MongoDb.class);
    private TimelineMongoImpl timelineMongo;
    private static final String THREAD_ID = "100";
    private static final String INFO_ID = "123";


    @Before
    public void setUp(TestContext context) {
        this.timelineMongo = new TimelineMongoImpl(Field.TIMELINE_COLLECTION, mongo);
    }

    @Test
    public void testGetNotification(TestContext context) {
        Async async = context.async();

        // Expected data
        String expectedCollection = "timeline";
        JsonObject expectedQuery = new JsonObject("{\"params\":{\"resourceUri\":\"/actualites#/view/thread/100/info/123\"}}");

        Mockito.doAnswer(invocation -> {
            String collection = invocation.getArgument(0);
            JsonObject query = invocation.getArgument(1);
            context.assertEquals(collection, expectedCollection);
            context.assertEquals(query, expectedQuery);
            async.complete();
            return null;
        }).when(mongo).findOne(Mockito.anyString(), Mockito.any(JsonObject.class), Mockito.any(Handler.class));

        timelineMongo.getNotification("100", "123");
    }

    @Test
    public void testDeleteNotification(TestContext context) {
        Async async = context.async();

        // Expected data
        String expectedCollection = "timeline";
        JsonObject expectedQuery = new JsonObject("{\"_id\":\"123\"}");

        Mockito.doAnswer(invocation -> {
            String collection = invocation.getArgument(0);
            JsonObject query = invocation.getArgument(1);
            context.assertEquals(collection, expectedCollection);
            context.assertEquals(query, expectedQuery);
            async.complete();
            return null;
        }).when(mongo).delete(Mockito.anyString(), Mockito.any(), Mockito.any());

        // get notification ID ?
        timelineMongo.deleteNotification(new JsonObject("{\"_id\":\"123\"}"));
    }
}
