package net.atos.entng.actualites.services;

import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;

import fr.wseduc.webutils.Either;

public interface UserService {

	public void getUsers(JsonArray userIds, JsonArray groupIds,
			Handler<Either<String, JsonArray>> handler);

}
