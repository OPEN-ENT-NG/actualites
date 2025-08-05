package net.atos.entng.actualites.to;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum NewsStatus {
    TRASH(0),
    DRAFT(1),
    PENDING(2),
    PUBLISHED(3);

    private final int value;

    NewsStatus(int value) {
        this.value = value;
    }

    public int getValue() {
        return this.value;
    }

    private static final Map<Integer, NewsStatus> reverseLookup = Arrays.stream(NewsStatus.values()).collect(Collectors.toMap(NewsStatus::getValue, Function.identity()));

    public static NewsStatus fromOrdinal(final int value) {
        return reverseLookup.get(value);
    }
}
