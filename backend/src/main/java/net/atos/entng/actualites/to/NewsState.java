package net.atos.entng.actualites.to;

public enum NewsState {
    EXPIRED,
    INCOMING;

    public static NewsState fromOrdinal(final int value) {
        switch(value) {
            case 0:
                return EXPIRED;
            case 1:
                return INCOMING;
            default:
                return null;
        }
    }
}
