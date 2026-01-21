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

import static org.entcore.common.sql.Sql.parseId;
import static org.entcore.common.user.DefaultFunctions.ADMIN_LOCAL;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import net.atos.entng.actualites.controllers.ThreadController;

import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import fr.wseduc.webutils.http.Binding;

/**
 * Filter that give access for users that own or have rights (publish, contrib, manage) on a thread
 */
public class ThreadFilter implements ResourcesProvider {

	@Override
	public void authorize(final HttpServerRequest request, final Binding binding, final UserInfos user, final Handler<Boolean> handler) {
		SqlConf conf = SqlConfs.getConf(ThreadController.class.getName());
		String id = null;
		if(isThreadShare(binding)){
			id = request.params().get("id");
		} else {
			id = request.params().get(conf.getResourceIdLabel());
		}
		if (id != null && !id.trim().isEmpty() && (parseId(id) instanceof Integer)) {
			request.pause();
			// Method
			String sharedMethod = binding.getRight().replaceAll("\\.", "-");

			// Groups and users
			final List<String> groupsAndUserIds = new ArrayList<>();
			groupsAndUserIds.add(user.getUserId());
			if (user.getGroupsIds() != null) {
				groupsAndUserIds.addAll(user.getGroupsIds());
			}

			// Query
			StringBuilder query = new StringBuilder();
			JsonArray values = new JsonArray();

			query.append("WITH user_groups AS MATERIALIZED ( ")
				.append("   SELECT id::varchar FROM ( ")
				.append("   SELECT ? as id UNION ALL ")
				.append("   SELECT id FROM actualites.groups WHERE id in ").append(Sql.listPrepared(groupsAndUserIds))
				.append(" ) as u_groups )")
				.append("SELECT count(*)")
				.append(" FROM actualites.thread AS t")
				.append(" LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id")
				.append(" WHERE t.id = ? ")
				.append(" AND (")
				.append("   (ts.member_id IN (SELECT id FROM user_groups) AND ts.action = ?)")
				.append("   OR t.owner = ?");

			query.append(" )");
			values.add(user.getUserId());
			groupsAndUserIds.forEach(values::add);
			values.add(Sql.parseId(id));
			values.add(sharedMethod);
			values.add(user.getUserId());

			// Execute
			Sql.getInstance().prepared(query.toString(), values, message -> {
                request.resume();
                Long count = SqlResult.countResult(message);
                handler.handle(count != null && count > 0);
            });
		} else {
			handler.handle(false);
		}
	}

	private boolean isThreadShare(final Binding binding) {
		return ("net.atos.entng.actualites.controllers.ThreadController|shareThread".equals(binding.getRight()) ||
				 "net.atos.entng.actualites.controllers.ThreadController|shareThreadSubmit".equals(binding.getRight()) ||
				 "net.atos.entng.actualites.controllers.ThreadController|shareThreadRemove".equals(binding.getRight()) ||
				"net.atos.entng.actualites.controllers.ThreadController|shareResource".equals(binding.getRight())
				);
	}

}
