package net.atos.entng.actualites.to;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Set;

public class NewsComplete {

    private final int id;
    private final NewsThreadInfo thread;
    private final String content;

    private final NewsStatus status;
    private final ResourceOwner owner;

    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String created;
    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String modified;
    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String publicationDate;
    // Caution: String is used to store ISO date because we won't manipulate data in most cases
    private final String expirationDate;
    private final boolean isHeadline;
    private final int numberOfComments;
    private final Rights rights;
    private final String title;

    public NewsComplete(int id, NewsThreadInfo thread, String title, String content, NewsStatus status, ResourceOwner owner, String created, String modified, String publicationDate, String expirationDate, boolean isHeadline, int numberOfComments, Rights rights) {
        this.id = id;
        this.thread = thread;
        this.content = content;
        this.status = status;
        this.owner = owner;
        this.created = created;
        this.modified = modified;
        this.publicationDate = publicationDate;
        this.expirationDate = expirationDate;
        this.isHeadline = isHeadline;
        this.numberOfComments = numberOfComments;
        this.rights = rights;
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    @JsonIgnore
    public Rights getRights() {
        return rights;
    }

    @JsonProperty("rights")
    public Set<String> getShareDisplayNames() {
        return rights.getShareDisplayNames();
    }

    public int getId() {
        return id;
    }

    public NewsThreadInfo getThread() {
        return thread;
    }

    public String getContent() {
        return content;
    }

    public NewsStatus getStatus() {
        return status;
    }

    public ResourceOwner getOwner() {
        return owner;
    }

    public String getCreated() {
        return created;
    }

    public String getModified() {
        return modified;
    }

    public String getPublicationDate() {
        return publicationDate;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public boolean isHeadline() {
        return isHeadline;
    }

    public int getNumberOfComments() {
        return numberOfComments;
    }
}
