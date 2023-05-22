package net.atos.entng.actualites.to;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

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

    private final Rights rights;
    @JsonIgnore
    public Rights getRights() {
        return rights;
    }
    @JsonProperty("rights")
    public Set<String> getShareDisplayNames() {
        return rights.getShareDisplayNames();
    }



    public NewsThreadInfo(int id, String title, String icon, Rights rights) {
        this.id = id;
        this.title = title;
        this.icon = icon;
        this.rights = rights;
    }
}
