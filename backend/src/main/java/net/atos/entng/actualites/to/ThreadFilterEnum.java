package net.atos.entng.actualites.to;

import org.entcore.common.utils.StringUtils;

public enum ThreadFilterEnum {

    DEFAULT,
    ALL,
    MANAGEABLE;

    public static ThreadFilterEnum fromString(String value) {
        if(StringUtils.isEmpty(value)) {
            return DEFAULT;
        }
        return valueOf(value.toUpperCase());
    }
}
