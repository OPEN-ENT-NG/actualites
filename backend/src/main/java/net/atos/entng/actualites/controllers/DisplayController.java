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

import java.util.Map;

import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.SuperAdminFilter;
import org.vertx.java.core.http.RouteMatcher;

import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.BaseController;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.filters.InfoFilter;

public class DisplayController extends BaseController {

	private EventStore eventStore;
	private enum ActualitesEvent { ACCESS }

	@Override
	public void init(Vertx vertx, JsonObject config, RouteMatcher rm, Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
		super.init(vertx, config, rm, securedActions);
		eventStore = EventStoreFactory.getFactory().getEventStore(Actualites.class.getSimpleName());
	}

	/**
	 * Main HTML rendering endpoint for /actualites (without trailing slash).
	 * This separate method is required because the regex in the main view() method
	 * cannot match an empty string in our custom routing system.
	 * Secured by an access right named `actualites.view`
	 */
	@Get("")
	@SecuredAction("actualites.view")
	public void viewRoot(final HttpServerRequest request) {
		renderView(request, new JsonObject(), "index.html", null);

		// Create event "access to application Actualites" and store it in MongoDB, for module "statistics"
		eventStore.createAndStoreEvent(ActualitesEvent.ACCESS.name(), request);
	}

	/**
	 * Main HTML rendering endpoint for sub-routes.
	 * Secured by an access right named `actualites.view`
	 *
	 * Example of valid URLs that should render the frontend HTML :
	 *
	 *  /actualites/                                 (redirect to /threads)
	 *  /actualites/threads                          (list all news with status filter)
	 *  /actualites/threads/:threadId                (view thread with status filter)
	 *  /actualites/infos/:infoId                    (view info with status filter and comments)
	 *  /actualites/infos/:infoId/edit               (edit info without threadId)
	 *  /actualites/create/info                      (create new info)
	 *  /actualites/create/info/:infoId              (edit info details during creation)
	 *  /actualites/create/info/:infoId/rights       (manage info rights)
	 *  /actualites/print/:infoId                    (print info)
	 *  /actualites/admin/threads                    (manage threads)
	 *
	 * Note: Query parameters (?status=...) and hash fragments (#infos-..., #comments-...)
	 * are handled by the frontend router and not part of this regex.
	 */
	@Get(value = "(?:/?(?:threads(?:/[^/\\\\s]+)?|infos/[^/\\\\s]+(?:/edit)?|create/info(?:/[^/\\\\s]+(?:/rights)?)?|print/[^/\\\\s]+|admin/threads/?)?)?", regex = true)
	@SecuredAction("actualites.view")
	public void view(final HttpServerRequest request) {
		renderView(request, new JsonObject(), "index.html", null);

		// Create event "access to application Actualites" and store it in MongoDB, for module "statistics"
		eventStore.createAndStoreEvent(ActualitesEvent.ACCESS.name(), request);
	}

	@Get("/config")
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	@ResourceFilter(SuperAdminFilter.class)
	public void getConfig(final HttpServerRequest request) {
		renderJson(request, config);
	}

	/** Render react frontend in old-format */
	@Get("/oldformat/:"+Actualites.THREAD_RESOURCE_ID+"/:"+Actualites.INFO_RESOURCE_ID)
    @SecuredAction(value = "info.read", type = ActionType.RESOURCE)
    @ResourceFilter(InfoFilter.class)
	public void viewOldInfoById(HttpServerRequest request) {
		renderView(request, new JsonObject(), "index.html", null);
	}
}
