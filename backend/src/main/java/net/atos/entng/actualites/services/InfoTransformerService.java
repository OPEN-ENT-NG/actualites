package net.atos.entng.actualites.services;

import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.to.News;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.Map;

public interface InfoTransformerService {
    void create(JsonObject data, UserInfos user, String eventStatus, Handler<Either<String, JsonObject>> handler);

    void update(String id, JsonObject data, UserInfos user, String eventStatus, Handler<Either<String, JsonObject>> handler);

    void transformerUpdate(News news);

    Future<List<News>> listPaginated(Map<String, SecuredAction> securedActions, UserInfos user, int page, int pageSize, Integer threadId);
}
