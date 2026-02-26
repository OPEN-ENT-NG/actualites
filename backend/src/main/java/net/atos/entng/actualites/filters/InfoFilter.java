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

import static net.atos.entng.actualites.filters.RightConstants.*;

import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.controllers.InfoController;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.sql.Sql.parseId;

public class InfoFilter implements ResourcesProvider {

	@Override
	public void authorize(final HttpServerRequest request, final Binding binding, final UserInfos user, final Handler<Boolean> handler) {
		SqlConf conf = SqlConfs.getConf(InfoController.class.getName());
		String id = null;
		if (isInfoShare(binding)) {
			id = request.params().get("id");
		} else {
			id = request.params().get(conf.getResourceIdLabel());
		}
		if (id != null && !id.trim().isEmpty() && (parseId(id) instanceof Integer)) {
			request.pause();

			// Detect right type
			boolean isReadRight    = isInfoReadAction(binding);
			boolean isCommentRight = isInfoCommentAction(binding);
			boolean isContribRight = isInfoContribAction(binding);
			boolean isPublishRight = isInfoPublishAction(binding);

			// Map to consolidated right used in DB
			String sqlInfoRight   = isReadRight ? INFO_READ_RIGHT : (isCommentRight ? INFO_COMMENT_RIGHT : null);
			String sqlThreadRight = resolveThreadRight(isContribRight, isPublishRight);

			// Groups and users
			final List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}

			// Query
			StringBuilder query = new StringBuilder();
			JsonArray values = new JsonArray();

			query.append("WITH user_groups AS MATERIALIZED (")
				 .append("  SELECT id::varchar FROM (")
				 .append("    SELECT ? AS id UNION ALL ")
				 .append("    SELECT id FROM actualites.groups WHERE id in").append(Sql.listPrepared(groupsAndUserIds))
				 .append("  ) as u_groups) ");
			groupsAndUserIds.forEach(values::add);
			values.add(user.getUserId());

			query.append("SELECT count(*)")
				.append(" FROM actualites.info AS i")
				.append(" LEFT JOIN actualites.info_shares AS ios ON i.id = ios.resource_id ");

			if (sqlInfoRight != null) {
				query.append(" AND ios.action = ? ");
				values.add(sqlInfoRight);
			}

			query.append(" LEFT JOIN actualites.thread AS t ON i.thread_id = t.id")
				.append(" LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id")
				.append(" WHERE i.id = ? ");
			values.add(Sql.parseId(id));

			query.append(" AND (");
			if (!isPublishRight) {
				if(isContribRight) {
					query.append("((i.owner = ? AND i.status != 3) ");
				}
				else {
					query.append("(i.owner = ? ");
				}
				values.add(user.getUserId());

				if(isReadRight || isCommentRight) {
					query.append(" OR (ios.member_id IN (SELECT id FROM user_groups)")
							.append(" AND i.status > 2)");
				}
				query.append(") OR (");
			}

			query.append("(t.owner = ?");
			values.add(user.getUserId());

			query.append(" OR (ts.member_id IN (SELECT id FROM user_groups)");

			if(isPublishRight || isReadRight || isCommentRight){
				query.append(" AND ts.action = ?");
				values.add(THREAD_PUBLISH_RIGHT);
			} else if (isContribRight) {
				query.append(" AND ((ts.action = ? AND i.status != 3)");
				values.add(sqlThreadRight);
				query.append(" OR ts.action = ?)");
				values.add(THREAD_PUBLISH_RIGHT);
			} else {
				query.append(" AND ts.action = ?");
				values.add(sqlThreadRight);
			}

			query.append(")) AND (i.status > 1"); // do not authorize actions on draft by managers/publishers
			query.append(" OR i.owner = ?))"); // unless it's theirs
			values.add(user.getUserId());

			if (!isPublishRight) {
				query.append(")");
			}
    		// Execute
			Sql.getInstance().prepared(query.toString(), values, new Handler<Message<JsonObject>>() {
				@Override
				public void handle(Message<JsonObject> message) {
					request.resume();
					Long count = SqlResult.countResult(message);
					handler.handle(count != null && count > 0);
				}
			});
		} else {
			handler.handle(false);
		}
	}

	// Read access
	private boolean isInfoReadAction(final Binding binding) {
		return INFO_READ_ANNOTATION.equals(binding.getRight());
	}

	// Comment access
	private boolean isInfoCommentAction(final Binding binding) {
		return INFO_COMMENT_ANNOTATION.equals(binding.getRight());
	}

	// Contrib access (including share endpoints)
	private boolean isInfoContribAction(final Binding binding) {
		String right = binding.getRight();
		return THREAD_CONTRIB_ANNOTATION.equals(right) || INFO_SHARE_ANNOTATION.equals(right);
	}

	// Publish access
	private boolean isInfoPublishAction(final Binding binding) {
		return THREAD_PUBLISH_ANNOTATION.equals(binding.getRight());
	}

	// Share endpoints use a different id param
	private boolean isInfoShare(final Binding binding) {
		return INFO_SHARE_ANNOTATION.equals(binding.getRight());
	}

	// Map to consolidated thread_shares right
	private String resolveThreadRight(boolean isContribRight, boolean isPublishRight) {
		if (isContribRight)  return THREAD_CONTRIB_RIGHT;
		if (isPublishRight)  return THREAD_PUBLISH_RIGHT;
		return THREAD_MANAGER_RIGHT; // delete
	}
}
