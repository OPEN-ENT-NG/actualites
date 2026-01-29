package net.atos.entng.actualites.services.impl;

import io.vertx.core.Future;
import net.atos.entng.actualites.services.InfoRightsChecker;
import org.entcore.common.audience.to.AudienceCheckRightRequestMessage;

public class InfoRightsCheckerImpl implements InfoRightsChecker {

    private final QueryHelperSql helperSql = new QueryHelperSql();

    @Override
    public Future<Boolean> apply(AudienceCheckRightRequestMessage audienceCheckRightRequestMessage) {
        return helperSql.checkRights(audienceCheckRightRequestMessage.getUserId(),
                                audienceCheckRightRequestMessage.getUserGroups(),
                                audienceCheckRightRequestMessage.getResourceIds());
    }
}
