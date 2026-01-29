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

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.services.GenAiService;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserUtils;

/**
 * Controller for FALC (Facile à Lire et à Comprendre) transformation endpoint.
 */
public class FalcController extends ControllerHelper {

    private final GenAiService genAiService;

    public FalcController(GenAiService genAiService) {
        this.genAiService = genAiService;
    }

    @Post("/falc")
    @ApiDoc("Apply FALC transformation to simplify content")
    @SecuredAction(value = "actualites.genai.falc", type = ActionType.AUTHENTICATED)
    public void applyFalc(final HttpServerRequest request) {
        if (!genAiService.isConfigured()) {
            Renders.badRequest(request, "genai.not.configured");
            return;
        }

        UserUtils.getUserInfos(eb, request, user -> {
            if (user == null) {
                Renders.unauthorized(request);
                return;
            }

            RequestUtils.bodyToJson(request, pathPrefix + "falc", body -> {
                String content = body.getString("content");
                String userId = user.getUserId();
                String session = request.headers().get("Cookie");
                String userAgent = request.headers().get("User-Agent");

                genAiService.applyFalc(userId, session, userAgent, content)
                        .onSuccess(simplifiedContent -> {
                            JsonObject response = new JsonObject().put("content", simplifiedContent);
                            Renders.renderJson(request, response);
                        })
                        .onFailure(err -> {
                            log.error("Error applying FALC transformation", err);
                            Renders.renderError(request, new JsonObject().put("error", err.getMessage()));
                        });
            });
        });
    }
}
