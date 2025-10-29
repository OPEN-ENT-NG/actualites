package net.atos.entng.actualites.to;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum NewsState {
    EXPIRED(0),
    INCOMING(1);

    private final int value;

    NewsState(int value) {
        this.value = value;
    }

    public int getValue() {
        return this.value;
    }

    private static final Map<Integer, NewsState> reverseLookup = Arrays.stream(NewsState.values()).collect(Collectors.toMap(NewsState::getValue, Function.identity()));

    public static NewsState fromOrdinal(final int value) {
        return reverseLookup.get(value);
    }
}
