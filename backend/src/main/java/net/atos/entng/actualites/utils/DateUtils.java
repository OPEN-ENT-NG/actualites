package net.atos.entng.actualites.utils;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;

public final class DateUtils {

    // Formatter that handles both:
    // - ISO 8601 from frontend: 2026-01-22T14:00:00.000Z
    // - PostgreSQL native format: 2026-01-22 16:39:36.7+01
    private static final DateTimeFormatter formatter = new DateTimeFormatterBuilder()
            .appendPattern("yyyy-MM-dd")
            .optionalStart().appendLiteral('T').optionalEnd()
            .optionalStart().appendLiteral(' ').optionalEnd()
            .appendPattern("HH:mm:ss")
            .optionalStart().appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true).optionalEnd()
            .optionalStart().appendOffset("+HH:mm", "Z").optionalEnd()
            .optionalStart().appendOffset("+HH", "Z").optionalEnd()
            .toFormatter()
            .withZone(ZoneId.of("UTC"));

    public static Instant utcFromString(String date) {
        return Instant.from(formatter.parse(date));
    }

}
