package net.atos.entng.actualites.utils;

import org.entcore.common.user.UserInfos;

import static org.entcore.common.user.DefaultFunctions.ADMIN_LOCAL;

public class UserUtils {

    /** Minimum number of structures to be considered a super-ADML */
    public static final int SUPER_ADML_THRESHOLD = 5;

    public static boolean isUserMultiADML(UserInfos user) {
        return user.isADML() && user.getFunctions().get(ADMIN_LOCAL).getScope().size() >= SUPER_ADML_THRESHOLD;
    }

}
