package net.atos.entng.actualites.to;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class NewsThread {

    private final int id;
    private final String title;
    private final String icon;

    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String created;

    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String modified;

    private final String structure_id;
    private final ResourceOwner owner;
    private Rights sharedRights;
    private Structure structure;
    private boolean visible;

    public NewsThread(int id,
                      String title,
                      String icon,
                      String created,
                      String modified,
                      String structure_id,
                      ResourceOwner owner,
                      Rights sharedRights,
                      boolean visible) {
        this.id = id;
        this.title = title;
        this.icon = icon;
        this.created = created;
        this.modified = modified;
        this.structure_id = structure_id;
        this.owner = owner;
        this.sharedRights = sharedRights;
        this.visible = visible;
    }

    public String getTitle() {
        return title;
    }

    public int getId() {
        return id;
    }

    public ResourceOwner getOwner() {
        return owner;
    }

    public String getIcon() {
        return icon;
    }

    public String getCreated() {
        return created;
    }

    public String getModified() {
        return modified;
    }

    public String getStructureId() {
        return structure_id;
    }

    @JsonIgnore
    public Rights getSharedRights() {
        return sharedRights;
    }

    public void setSharedRights(Rights rights) {
        this.sharedRights = rights;
    }

    @JsonProperty("sharedRights")
    public Set<String> getShareDisplayNames() {
        return sharedRights.getShareDisplayNames();
    }

    public Structure getStructure() {
        return structure;
    }

    public void setStructure(Structure structure) {
        this.structure = structure;
    }

    public boolean isVisible() {
        return visible;
    }

    public NewsThread setVisible(boolean visible) {
        this.visible = visible;
        return this;
    }
}
