package net.atos.entng.actualites.to;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.security.acl.Owner;
import java.util.Set;

public class NewsThreadInfo {

    private final int id;
    public int getId() {
        return id;
    }

    private final String title;
    public String getTitle() {
        return title;
    }

    private final String icon;
    public String getIcon() {
        return icon;
    }

    public ResourceOwner getOwner() {
        return owner;
    }

    private final ResourceOwner owner;

    private final Rights sharedRights;
    @JsonIgnore
    public Rights getSharedRights() {
        return sharedRights;
    }
    @JsonProperty("sharedRights")
    public Set<String> getShareDisplayNames() {
        return sharedRights.getShareDisplayNames();
    }



    public NewsThreadInfo(int id, String title, String icon, ResourceOwner owner, Rights sharedRights) {
        this.id = id;
        this.title = title;
        this.icon = icon;
        this.owner = owner;
        this.sharedRights = sharedRights;
    }
}
