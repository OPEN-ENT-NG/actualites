package net.atos.entng.actualites.to;

public class ResourceOwner {
    private final String id;
    private final String displayName;
    private final boolean deleted;

    public ResourceOwner(String id, String displayName, boolean deleted) {
        this.id = id;
        this.displayName = displayName;
        this.deleted = deleted;
    }

    public String getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isDeleted() {
        return deleted;
    }
}
