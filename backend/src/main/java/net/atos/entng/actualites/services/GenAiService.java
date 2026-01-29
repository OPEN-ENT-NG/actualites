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

package net.atos.entng.actualites.services;

import io.vertx.core.Future;

/**
 * Service interface for GenAI operations.
 */
public interface GenAiService {

    /**
     * Apply FALC (Facile à Lire et à Comprendre) transformation to the given content.
     * This simplifies complex text using an external GenAI API.
     *
     * @param userId    The user's ID
     * @param session   The user's session ID
     * @param userAgent The user's browser user agent
     * @param content   The content to simplify
     * @return A Future containing the simplified content, or the original content if too short
     */
    Future<String> applyFalc(String userId, String session, String userAgent, String content);

    /**
     * Check if the GenAI service is properly configured and available.
     *
     * @return true if the service is configured, false otherwise
     */
    boolean isConfigured();
}
