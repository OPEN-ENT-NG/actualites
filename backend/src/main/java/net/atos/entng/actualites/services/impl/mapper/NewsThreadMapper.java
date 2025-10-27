package net.atos.entng.actualites.services.impl.mapper;

import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.to.NewsThread;
import net.atos.entng.actualites.to.ResourceOwner;
import net.atos.entng.actualites.to.Rights;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.Map;

public class NewsThreadMapper {

    public static NewsThread map(JsonObject row, UserInfos user, Map<String, SecuredAction> securedActions) {
        final boolean isOwner = user.getUserId().equals(row.getString("owner"));
        final ResourceOwner owner = new ResourceOwner(
                row.getString("owner"),
                row.getString("owner_name"),
                row.getBoolean("owner_deleted")
        );
        final List<String> rawRights = SqlResult.sqlArrayToList(row.getJsonArray("rights"), String.class);
        return new NewsThread(
                row.getInteger("id"),
                row.getString("title"),
                row.getString("icon"),
                row.getString("created"),
                row.getString("modified"),
                row.getString("structure_id"),
                owner,
                Rights.fromRawRights(securedActions, rawRights, isOwner, Rights.ResourceType.THREAD)
        );
    }


}
