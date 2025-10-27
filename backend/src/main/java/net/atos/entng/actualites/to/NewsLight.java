package net.atos.entng.actualites.to;

public class NewsLight {

    private final int id;

    private final NewsThreadInfo thread;
    private final String username;
    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String modifiedDate;
    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String title;

    public NewsLight(int id, NewsThreadInfo thread, String owner, String modifiedDate, String title) {
        this.id = id;
        this.thread = thread;
        this.username = owner;
        this.modifiedDate = modifiedDate;
        this.title = title;
    }

    public int getId() {
        return id;
    }

    public NewsThreadInfo getThread() {
        return thread;
    }

    public String getUsername() {
        return username;
    }

    public String getModifiedDate() {
        return modifiedDate;
    }

    public String getTitle() {
        return title;
    }
}
