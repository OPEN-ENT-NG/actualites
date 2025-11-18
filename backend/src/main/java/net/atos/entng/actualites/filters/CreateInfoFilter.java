package net.atos.entng.actualites.filters;

import fr.wseduc.webutils.http.Binding;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static net.atos.entng.actualites.filters.RightConstants.CREATE_RIGHT_DRAFT;
import static net.atos.entng.actualites.filters.RightConstants.RIGHT_PUBLISH;
import static org.entcore.common.sql.Sql.parseId;
import static org.entcore.common.user.DefaultFunctions.ADMIN_LOCAL;

public class CreateInfoFilter implements ResourcesProvider {

    @Override
    public void authorize(final HttpServerRequest request, final Binding binding, final UserInfos user, final Handler<Boolean> handler) {
        RequestUtils.bodyToJson(request, h -> {
            String id = h.getString("thread_id");
            String sStatus = h.getString("status");

            // Determine if this is a publish action based on status or URL
            Integer status = null;
            if (!StringUtils.isEmpty(sStatus) && (parseId(sStatus) instanceof Integer)) {
                status = (Integer) parseId(sStatus);
            } else if (request.path().contains("/published")) {
                // For /api/v1/infos/published endpoint, status is set by the controller
                status = 3;
            }

            if (!StringUtils.isEmpty(id) && (parseId(id) instanceof Integer) && status != null) {
                // Method
                String sharedMethod = status == 3 ? RIGHT_PUBLISH : CREATE_RIGHT_DRAFT;

                // Groups and users
                final List<String> groupsAndUserIds = new ArrayList<>();
                groupsAndUserIds.add(user.getUserId());
                if (user.getGroupsIds() != null) {
                    groupsAndUserIds.addAll(user.getGroupsIds());
                }
                // Structures which the user is an ADML of.
                final List<String> admlStructuresIds = user.isADML()
                        ? user.getFunctions().get(ADMIN_LOCAL).getScope()
                        : Collections.EMPTY_LIST;
                // Query
                StringBuilder query = new StringBuilder();
                JsonArray values = new JsonArray();
                query.append("SELECT count(*)")
                        .append(" FROM actualites.thread AS t")
                        .append(" LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id")
                        .append(" WHERE t.id = ? ")
                        .append(" AND (")
                        .append("   (ts.member_id IN " + Sql.listPrepared(groupsAndUserIds) + " AND ts.action = ?)")
                        .append("   OR t.owner = ?");
                if (!admlStructuresIds.isEmpty()) {
                    query.append("   OR t.structure_id IN " + Sql.listPrepared(admlStructuresIds));
                }
                query.append(" )");
                values.add(Sql.parseId(id));
                for (String value : groupsAndUserIds) {
                    values.add(value);
                }
                values.add(sharedMethod);
                values.add(user.getUserId());
                for (String value : admlStructuresIds) {
                    values.add(value);
                }

                // Execute
                Sql.getInstance().prepared(query.toString(), values, message -> {
                    Long count = SqlResult.countResult(message);
                    handler.handle(count != null && count > 0);
                });
            } else {
                handler.handle(false);
            }
        });
    }
}
