package net.atos.entng.actualites.utils;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public final class DateUtils {

    private static final DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("yyyy-MM-dd['T'][' ']HH:mm:ss[.SSS][X]").withZone(ZoneId.of("UTC"));

    public static Instant utcFromString(String date) {
        return Instant.from(formatter.parse(date));
    }

}
