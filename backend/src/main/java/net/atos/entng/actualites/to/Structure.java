package net.atos.entng.actualites.to;

public class Structure {

    private String id;
    private String name;

    public Structure(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public Structure() {
       //default
    }

    public String getName() {
        return name;
    }

    public Structure setName(String name) {
        this.name = name;
        return this;
    }

    public String getId() {
        return id;
    }

    public Structure setId(String id) {
        this.id = id;
        return this;
    }
}
