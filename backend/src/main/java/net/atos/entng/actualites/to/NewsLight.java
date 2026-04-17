package net.atos.entng.actualites.to;

/**
 * DTO for widget to display last published info. 
 * /!\ Use in V1 controller only /!\
 */
public class NewsLight {

    private final int id;

    private final NewsThreadInfo thread;
    private final String username;
    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String modifiedDate;
    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String title;
    private final String content;
    private final boolean isHeadline;

    public NewsLight(int id, NewsThreadInfo thread, String owner, String modifiedDate, String title, String content, boolean isHeadline) {
        this.id = id;
        this.thread = thread;
        this.username = owner;
        this.modifiedDate = modifiedDate;
        this.title = title;
        this.content = content;
        this.isHeadline = isHeadline;
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

    public String getContent() { return content; }

    public boolean isHeadline() {
        return isHeadline;
    }
}
