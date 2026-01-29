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
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpClient;
import io.vertx.core.http.HttpClientOptions;
import io.vertx.core.http.HttpClientRequest;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.actualites.services.GenAiService;
import net.atos.entng.actualites.to.GenAiConfig;

import java.net.MalformedURLException;
import java.net.URL;

/**
 * Implementation of GenAiService that communicates with an external GenAI API.
 */
public class GenAiServiceImpl implements GenAiService {

    private static final Logger log = LoggerFactory.getLogger(GenAiServiceImpl.class);
    private static final String API_PATH = "/api/v1/process";
    private static final String FALC_OPTION = "FALC";

    private final GenAiConfig config;
    private final HttpClient httpClient;
    private final String host;
    private final int port;
    private final boolean ssl;

    public GenAiServiceImpl(Vertx vertx, GenAiConfig config) {
        this.config = config;

        String host = "";
        int port = 443;
        boolean ssl = true;

        if (config.isConfigured()) {
            try {
                URL url = new URL(config.getUri());
                host = url.getHost();
                port = url.getPort() != -1 ? url.getPort() : (url.getProtocol().equals("https") ? 443 : 80);
                ssl = url.getProtocol().equals("https");
            } catch (MalformedURLException e) {
                log.error("Invalid GenAI URI: " + config.getUri(), e);
            }
        }

        this.host = host;
        this.port = port;
        this.ssl = ssl;

        HttpClientOptions options = new HttpClientOptions()
                .setDefaultHost(host)
                .setDefaultPort(port)
                .setSsl(ssl)
                .setConnectTimeout(config.getFalcTimeoutMs())
                .setIdleTimeout(config.getFalcTimeoutMs() / 1000);

        this.httpClient = vertx.createHttpClient(options);
    }

    @Override
    public Future<String> applyFalc(String userId, String session, String userAgent, String content) {
        Promise<String> promise = Promise.promise();

        if (!isConfigured()) {
            log.warn("GenAI service is not configured");
            promise.fail("GenAI service is not configured");
            return promise.future();
        }

        if (content == null || content.length() < config.getFalcMinLength()) {
            log.debug("Content is too short for FALC transformation, returning original content");
            promise.complete(content);
            return promise.future();
        }

        JsonObject requestBody = new JsonObject()
                .put("user_id", userId)
                .put("session", session)
                .put("browser", userAgent)
                .put("options", FALC_OPTION)
                .put("content", content);

        httpClient.request(HttpMethod.POST, port, host, API_PATH)
                .onSuccess(request -> {
                    request.putHeader("Content-Type", "application/json");
                    request.putHeader("Authorization", "Bearer " + config.getToken());
                    request.setTimeout(config.getFalcTimeoutMs());

                    request.send(Buffer.buffer(requestBody.encode()))
                            .onSuccess(response -> {
                                if (response.statusCode() == 200) {
                                    response.body().onSuccess(body -> {
                                        try {
                                            JsonObject jsonResponse = new JsonObject(body.toString());
                                            String simplifiedContent = jsonResponse.getString("content", content);
                                            promise.complete(simplifiedContent);
                                        } catch (Exception e) {
                                            log.error("Error parsing GenAI response", e);
                                            promise.fail("Error parsing GenAI response: " + e.getMessage());
                                        }
                                    }).onFailure(err -> {
                                        log.error("Error reading GenAI response body", err);
                                        promise.fail("Error reading GenAI response: " + err.getMessage());
                                    });
                                } else {
                                    log.error("GenAI API returned error status: " + response.statusCode());
                                    response.body().onSuccess(body -> {
                                        log.error("GenAI API error body: " + body.toString());
                                    });
                                    promise.fail("GenAI API returned status: " + response.statusCode());
                                }
                            })
                            .onFailure(err -> {
                                log.error("Error sending request to GenAI API", err);
                                promise.fail("Error sending request to GenAI API: " + err.getMessage());
                            });
                })
                .onFailure(err -> {
                    log.error("Error creating request to GenAI API", err);
                    promise.fail("Error creating request to GenAI API: " + err.getMessage());
                });

        return promise.future();
    }

    @Override
    public boolean isConfigured() {
        return config.isConfigured();
    }
}
