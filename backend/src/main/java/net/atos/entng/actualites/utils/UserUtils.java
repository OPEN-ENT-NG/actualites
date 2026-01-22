package net.atos.entng.actualites.utils;

import org.entcore.common.user.UserInfos;

import static org.entcore.common.user.DefaultFunctions.ADMIN_LOCAL;

public class UserUtils {

    public static boolean isUserMultiADML(UserInfos user) {
        return user.isADML() && user.getFunctions().get(ADMIN_LOCAL).getScope().size() > 1;
    }

}
