package net.atos.entng.actualites.to;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class NewsThread {

    private final String title;

    private final int id;

    private final String icon;

    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String created;

    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String modified;

    private final ResourceOwner owner;

    private final Rights rights;

    public NewsThread(int id, String title, String icon, String created, String modified, ResourceOwner owner, Rights rights) {
        this.id = id;
        this.title = title;
        this.icon = icon;
        this.created = created;
        this.modified = modified;
        this.owner = owner;
        this.rights = rights;
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

    @JsonIgnore
    public Rights getRights() {
        return rights;
    }

    @JsonProperty("rights")
    public Set<String> getShareDisplayNames() {
        return rights.getShareDisplayNames();
    }

}
