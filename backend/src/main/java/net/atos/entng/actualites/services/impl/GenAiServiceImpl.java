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

package net.atos.entng.actualites.services.impl;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.actualites.broker.FalcClient;
import net.atos.entng.actualites.services.GenAiService;
import net.atos.entng.actualites.to.GenAiConfig;

/**
 * Implementation of GenAiService that communicates with FALC service via NATS.
 */
public class GenAiServiceImpl implements GenAiService {

    private static final Logger log = LoggerFactory.getLogger(GenAiServiceImpl.class);

    private final GenAiConfig config;
    private final FalcClient falcClient;

    public GenAiServiceImpl(Vertx vertx, GenAiConfig config) {
        this.config = config;
        this.falcClient = new FalcClient(vertx);
    }

    @Override
    public Future<String> applyFalc(String userId, String session, String userAgent, String content) {
        if (content == null || content.length() < config.getFalcMinLength()) {
            log.debug("Content is too short for FALC transformation, returning original content");
            return Future.succeededFuture(content);
        }

        return falcClient.simplifyContent(userId, session, userAgent, content)
                .compose(simplifiedContent -> {
                    if (simplifiedContent != null) {
                        return Future.succeededFuture(simplifiedContent);
                    } else {
                        log.warn("FALC returned null, returning original content");
                        return Future.succeededFuture(content);
                    }
                })
                .recover(err -> {
                    log.error("FALC transformation failed, returning original content", err);
                    return Future.succeededFuture(content);
                });
    }
}
