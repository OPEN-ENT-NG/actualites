package net.atos.entng.actualites.to;

import org.entcore.common.utils.StringUtils;

public enum ThreadInclude {

    DEFAULT,
    ALL,
    MANAGEABLE;

    public static ThreadInclude fromString(String value) {
        if(StringUtils.isEmpty(value)) {
            return DEFAULT;
        }
        return valueOf(value.toUpperCase());
    }
}
