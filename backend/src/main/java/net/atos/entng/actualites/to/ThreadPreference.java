package net.atos.entng.actualites.to;

public class ThreadPreference {

    private int threadId;
    private boolean visible;

    public ThreadPreference(){}

    public ThreadPreference(int threadId, boolean visible) {
        this.threadId = threadId;
        this.visible = visible;
    }

    public int getThreadId() {
        return threadId;
    }

    public boolean isVisible() {
        return visible;
    }
}
