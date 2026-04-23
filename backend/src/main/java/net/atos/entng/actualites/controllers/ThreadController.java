/*
 * Copyright © Région Nord Pas de Calais-Picardie,  Département 91, Région Aquitaine-Limousin-Poitou-Charentes, 2016.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package net.atos.entng.actualites.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;
import static org.entcore.common.user.UserUtils.getUserInfos;
import static net.atos.entng.actualites.filters.RightConstants.*;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import fr.wseduc.webutils.http.Renders;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.filters.ThreadFilter;
import net.atos.entng.actualites.services.ThreadMigrationService;
import net.atos.entng.actualites.services.ThreadService;
import net.atos.entng.actualites.services.impl.ThreadServiceSqlImpl;

import net.atos.entng.actualites.to.ThreadInclude;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.eventbus.EventBus;

public class ThreadController extends ControllerHelper {

	private static final String THREAD_ID_PARAMETER = "id";
	private static final String SCHEMA_THREAD_CREATE = "createThread";
	private static final String SCHEMA_THREAD_UPDATE = "updateThread";

	private static final String RESOURCE_NAME = "thread";
	public static final String ROOT_RIGHT = "net.atos.entng.actualites.controllers.ThreadController";

	protected final ThreadService threadService;
	protected final ThreadMigrationService threadMigrationService;
	protected final EventHelper eventHelper;

	public ThreadController(EventBus eb, ThreadMigrationService threadMigrationService){
		this.threadService = new ThreadServiceSqlImpl().setEventBus(eb);
		this.threadMigrationService = threadMigrationService;
		final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Actualites.class.getSimpleName());
		eventHelper = new EventHelper(eventStore);
	}

	@Override
	protected boolean shouldNormalizedRights() {
		return true;
	}

	@Override
	protected Function<JsonObject, Optional<String>> jsonToOwnerId() {
		return json -> Optional.of(json.getString("owner"));
	}

	@Deprecated
	@Get("/threads/list")
	@ApiDoc("Get threads visible from the current user." +
			"This includes" +
			" - Threads created by the user" +
			" - Threads shared to the user or one of its groups" +
			" - Threads containing news that are shared to the user or one of its groups" +
			"The ensemble of threads returned by this method contain every visible news to the user." +
			"DEPRECATED - Used by mobile app only.")
	@SecuredAction("actualites.threads.listthreads")
	public void listThreadsV2(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			if (user != null) {
				Boolean viewHidden = Boolean.parseBoolean(request.getParam("viewHidden", "false"));
				threadService.list(securedActions, user, ThreadInclude.DEFAULT)
					.onSuccess(threads -> render(request, threads))
					.onFailure(ex -> renderError(request));
			} else {
				unauthorized(request);
			}
		});
	}

}
