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

import fr.wseduc.security.ActionType;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.filters.InfoFilter;

import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.SuperAdminFilter;
import org.vertx.java.core.http.RouteMatcher;


import fr.wseduc.rs.Get;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.BaseController;

public class DisplayController extends BaseController {

	private EventStore eventStore;
	private enum ActualitesEvent { ACCESS }

	@Override
	public void init(Vertx vertx, JsonObject config, RouteMatcher rm, Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
		super.init(vertx, config, rm, securedActions);
		eventStore = EventStoreFactory.getFactory().getEventStore(Actualites.class.getSimpleName());
	}

	@Get("")
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
	@Get("/oldformat/:"+Actualites.INFO_RESOURCE_ID)
    @SecuredAction(value = "info.read", type = ActionType.RESOURCE)
    @ResourceFilter(InfoFilter.class)
	public void viewOldInfoById(HttpServerRequest request) {
		renderView(request, new JsonObject(), "index.html", null);
	}
}
