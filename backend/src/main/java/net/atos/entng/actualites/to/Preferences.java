package net.atos.entng.actualites.to;

import java.util.List;

public class Preferences {

    private List<ThreadPreference> threads;

    public Preferences() {}

    public Preferences(List<ThreadPreference> threads) {
        this.threads = threads;
    }

    public List<ThreadPreference> getThreads() {
        return threads;
    }

}
