package net.atos.entng.actualites.services.impl;

import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;
import org.entcore.common.share.ShareInfosQuery;
import org.entcore.common.share.impl.SqlShareService;
import org.entcore.common.user.UserUtils;
import org.entcore.common.validation.StringValidation;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class OptimizedShareService  extends SqlShareService {

    public OptimizedShareService(EventBus eb, Map<String, SecuredAction> securedActions, Map<String, List<String>> groupedActions) {
        super(eb, securedActions, groupedActions);
    }

    public OptimizedShareService(String schema, String shareTable, EventBus eb, Map<String, SecuredAction> securedActions, Map<String, List<String>> groupedActions) {
        super(schema, shareTable, eb, securedActions, groupedActions);
    }

    @Override
    protected void getShareInfos(String userId, JsonArray actions, JsonObject groupCheckedActions, JsonObject userCheckedActions, String acceptLanguage, ShareInfosQuery query, Handler<JsonObject> handler) {
        JsonArray usersIds = new JsonArray(new ArrayList(userCheckedActions.fieldNames()));
        JsonObject groupParams = (new JsonObject()).put("groupIds", new JsonArray(new ArrayList(groupCheckedActions.fieldNames())));
        JsonObject userParams = (new JsonObject()).put("userIds", usersIds);
        String search = query.getSearch();
        if (search != null && search.trim().isEmpty()) {
            Neo4j neo4j = Neo4j.getInstance();
            neo4j.execute("MATCH (g:Group) WHERE g.id in {groupIds} RETURN distinct g.id as id, g.name as name, g.groupDisplayName as groupDisplayName, g.structureName as structureName, labels(g) as labels ORDER BY name ", groupParams, Neo4jResult.validResultHandler((sg) -> {
                JsonArray visibleGroups;
                if (sg.isRight()) {
                    visibleGroups = (JsonArray)sg.right().getValue();
                } else {
                    visibleGroups = new JsonArray();
                }

                JsonObject groups = new JsonObject();
                groups.put("visibles", visibleGroups);
                groups.put("checked", groupCheckedActions);

                for(Object u : visibleGroups) {
                    if (u instanceof JsonObject) {
                        JsonObject group = (JsonObject)u;
                        UserUtils.groupDisplayName(group, acceptLanguage);
                    }
                }

                neo4j.execute("MATCH (u:User) WHERE u.id in {userIds} RETURN distinct u.id as id, u.login as login, u.displayName as username, u.lastName as lastName, u.firstName as firstName, u.profiles[0] as profile  ORDER BY username ", userParams, Neo4jResult.validResultHandler((event) -> {
                    JsonArray visibleUsers;
                    if (event.isRight()) {
                        visibleUsers = (JsonArray)event.right().getValue();
                    } else {
                        visibleUsers = new JsonArray();
                    }

                    JsonObject users = new JsonObject();
                    users.put("visibles", visibleUsers);
                    users.put("checked", userCheckedActions);
                    JsonObject share = (new JsonObject()).put("actions", actions).put("groups", groups).put("users", users);
                    handler.handle(share);
                }));
            }));
            return;
        }
        String sanitizedSearch;
        if (search != null) {
            sanitizedSearch = StringValidation.sanitize(search);
            groupParams.put("search", sanitizedSearch);
            userParams.put("search", sanitizedSearch);
        } else {
            sanitizedSearch = null;
        }

        UserUtils.findVisibleProfilsGroups(this.eb, userId, null, "RETURN distinct profileGroup.id as id, profileGroup.name as name, profileGroup.groupDisplayName as groupDisplayName, profileGroup.structureName as structureName, labels(profileGroup) as labels ORDER BY name UNION MATCH (g:Group) WHERE g.id in {groupIds} RETURN distinct g.id as id, g.name as name, g.groupDisplayName as groupDisplayName, g.structureName as structureName, labels(g) as labels ORDER BY name ", groupParams, (visibleGroups) -> {
            JsonObject groups = new JsonObject();
            groups.put("visibles", visibleGroups);
            groups.put("checked", groupCheckedActions);

            for(Object u : visibleGroups) {
                if (u instanceof JsonObject) {
                    JsonObject group = (JsonObject)u;
                    UserUtils.groupDisplayName(group, acceptLanguage);
                }
            }
            UserUtils.findVisibleUsersForShare(this.eb, userId, sanitizedSearch, usersIds, (visibleUsers) -> {
                JsonObject users = new JsonObject();
                users.put("visibles", visibleUsers);
                users.put("checked", userCheckedActions);
                JsonObject share = (new JsonObject()).put("actions", actions).put("groups", groups).put("users", users);
                handler.handle(share);
            });
        });
    }
}
