package net.atos.entng.actualites.filters;

import static net.atos.entng.actualites.filters.RightConstants.RIGHT_PUBLISH;
import static org.entcore.common.sql.Sql.parseId;
import static org.entcore.common.user.DefaultFunctions.ADMIN_LOCAL;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.StringUtils;

import fr.wseduc.webutils.http.Binding;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.Actualites;

/**
 * Filter resource for info update (PUT)
 */
public class UpdateInfoFilter implements ResourcesProvider {

    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user, Handler<Boolean> handler) {
        RequestUtils.bodyToJson(request, modifiedInfo -> {
            String sStatus = modifiedInfo.getString("status");
            String id = request.getParam(Actualites.INFO_RESOURCE_ID);

            if(StringUtils.isEmpty(sStatus) || !(parseId(sStatus) instanceof Integer)) {
                handler.handle(false);
                return;
            }
            if(StringUtils.isEmpty(id) || !(parseId(id) instanceof Integer)) {
                handler.handle(false);
                return;
            }

            // retreive
            Integer status = (Integer) parseId(sStatus);
            StringBuilder query = new StringBuilder();
            int idInfo = (int) Sql.parseId(id);
            JsonArray values = new JsonArray();
            values.add(idInfo);

            query.append("SELECT i.status AS status ")
                    .append(" FROM actualites.info AS i")
                    .append(" WHERE i.id = ? ");
            // Execute
            Sql.getInstance().prepared(query.toString(), values, SqlResult.validUniqueResultHandler(res -> {
                if(res.isLeft()) {
                    handler.handle(false);
                } else {
                    validStatusMutation(res.right().getValue(), modifiedInfo, user, idInfo, handler);
                }
            }));
        });
    }


    private void validStatusMutation(JsonObject actualInfo, JsonObject modifiedInfo, UserInfos user, int idInfo, Handler<Boolean> handler) {

        int targetStatus = modifiedInfo.getInteger("status");
        int actualStatus = actualInfo.getInteger("status");
        final List<String> groupsAndUserIds = new ArrayList<>();
        groupsAndUserIds.add(user.getUserId());
        if (user.getGroupsIds() != null) {
            groupsAndUserIds.addAll(user.getGroupsIds());
        }

        StringBuilder query = new StringBuilder(
                "SELECT count(*) FROM actualites.info AS i \n" +
                "    LEFT JOIN actualites.info_shares AS ios ON i.id = ios.resource_id \n" +
                "    LEFT JOIN actualites.thread AS t ON i.thread_id = t.id \n" +
                "    LEFT JOIN actualites.thread_shares AS ts ON t.id = ts.resource_id \n" +
                "    WHERE i.id = ?  AND ");
        JsonArray values = new JsonArray();
        values.add(idInfo);

        if(targetStatus == 3) { //publish actu
            /**
             * Either owner of the thread or in shared groups publish on a draft owned info or a pending info
             */
            query.append("(\n")
                    .append(" (\n")
                    .append("   t.owner = ? \n")
                    .append("   OR ts.member_id IN ").append(Sql.listPrepared(groupsAndUserIds.toArray()))
                    .append("   AND ts.action = '" + RIGHT_PUBLISH + "' \n")
                    .append(" ) \n")
                    .append(" AND (i.status > 1 or i.owner = ?) \n")
                    .append(")\n");
            values.add(user.getUserId());
            groupsAndUserIds.forEach(values::add);
            values.add(user.getUserId());

        } else if(targetStatus == 2) { //unpublish an info or submit a pending info or update a pending info
            /**
             * Either owner of the info or in shared groups publisher on a published info
             * or owner of the thread or in shared groups publisher on an owned info or in status (pending or publish)
             */
            query.append(" (\n")
                    .append(" ( \n")
                    .append("   i.owner = ? \n")
                    .append("  ) OR ( \n")
                    .append("      ( \n")
                    .append("        t.owner = ? \n")
                    .append("        OR (ts.member_id IN ").append(Sql.listPrepared(groupsAndUserIds.toArray()))
                    .append("            AND ts.action = '" + RIGHT_PUBLISH + "') \n")
                    .append("       ) AND i.status > 1 \n")
                    .append("  )\n")
                .append("   )\n");
            values.add(user.getUserId());
            values.add(user.getUserId());
            groupsAndUserIds.forEach(values::add);
        } else { // to draft or update draft or submit a draft
            /**
             * Either owner of the info or in shared groups contributor on a published info
             * or owner of the thread or in shared groups contributor on an owned info or in status (pending or publish)
             */
            query.append(" (\n")
                    .append(" ( \n")
                    .append("   i.owner = ? ")
                    .append("  ) OR ( \n")
                    .append("      ( \n")
                    .append("        t.owner = ? AND i.status > 1 \n")
                    .append("        OR (ts.member_id IN ").append(Sql.listPrepared(groupsAndUserIds.toArray()))
                    .append("           AND ( ts.action = '" + RIGHT_PUBLISH + "' AND i.status = 3 ) )\n")
                    .append("       )\n")
                    .append("  )\n")
                    .append("   )\n");
            values.add(user.getUserId());
            values.add(user.getUserId());
            groupsAndUserIds.forEach(values::add);
        }
        // Execute
        Sql.getInstance().prepared(query.toString(), values, SqlResult.validUniqueResultHandler(res -> {
             handler.handle(res.isRight() && !res.right().getValue().getString("count").equals("0"));
        }));
    }


}
