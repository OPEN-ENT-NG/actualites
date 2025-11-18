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

package net.atos.entng.actualites.filters;

import fr.wseduc.webutils.http.Binding;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.StringUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

/**
 * Filter for comment update operations.
 * Only the owner of the comment is authorized to update it.
 */
public class UpdateCommentFilter extends InfoFilter {

    private static final Logger log = LoggerFactory.getLogger(UpdateCommentFilter.class);

    @Override
    public void authorize(final HttpServerRequest request, final Binding binding, final UserInfos user, final Handler<Boolean> handler) {
        super.authorize(request, binding, user, authorized -> {
            request.pause();
            String commentId = request.params().get("id");
            String infoId = request.params().get("infoid");

            if(StringUtils.isEmpty(commentId) || StringUtils.isEmpty(infoId)) {
                log.error("Comment id or info id is null or empty. Impossible to update comment.");
                handler.handle(false);
                request.resume();
            } else {
                // Only the owner of the comment can update it
                StringBuilder query = new StringBuilder();
                JsonArray values = new JsonArray();

                query.append("SELECT count(*)")
                        .append(" FROM actualites.comment AS c")
                        .append(" WHERE c.owner = ? ")
                        .append(" AND c.id = ? ")
                        .append(" AND c.info_id = ? ");
                values.add(user.getUserId())
                      .add(Sql.parseId(commentId))
                      .add(Sql.parseId(infoId));

                // Execute
                Sql.getInstance().prepared(query.toString(), values, message -> {
                    request.resume();
                    Long count = SqlResult.countResult(message);
                    handler.handle(count != null && count > 0);
                });
            }
        });
    }
}
