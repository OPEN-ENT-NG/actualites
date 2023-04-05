package net.atos.entng.actualites.to;

public class NewsThread {

    private final String title;

    private final int id;

    private final String icon;

    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String created;

    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String modified;

    private final NewsThreadOwner owner;

    public NewsThread(int id, String title, String icon, String created, String modified, NewsThreadOwner owner) {
        this.id = id;
        this.title = title;
        this.icon = icon;
        this.created = created;
        this.modified = modified;
        this.owner = owner;
    }

    public String getTitle() {
        return title;
    }

    public int getId() {
        return id;
    }

    public NewsThreadOwner getOwner() {
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
}
