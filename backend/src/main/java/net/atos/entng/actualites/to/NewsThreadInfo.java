package net.atos.entng.actualites.to;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.Sets;

import java.util.Set;

public class NewsThreadInfo {

    private final int id;
    private final ResourceOwner owner;
    private final Rights sharedRights;
    private final String title;
    private final String icon;

    public NewsThreadInfo(Integer threadId, String threadTitle, String threadIcon) {
        this(threadId, threadTitle, threadIcon, null, null);
    }

    public NewsThreadInfo(int id, String title, String icon, ResourceOwner owner, Rights sharedRights) {
        this.id = id;
        this.title = title;
        this.icon = icon;
        this.owner = owner;
        this.sharedRights = sharedRights;
    }

    public int getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getIcon() {
        return icon;
    }
    public ResourceOwner getOwner() {
        return owner;
    }
    @JsonIgnore
    public Rights getSharedRights() {
        return sharedRights;
    }

    @JsonProperty("sharedRights")
    public Set<String> getShareDisplayNames() {
        return sharedRights != null ? sharedRights.getShareDisplayNames() : Sets.newHashSet();
    }


}
