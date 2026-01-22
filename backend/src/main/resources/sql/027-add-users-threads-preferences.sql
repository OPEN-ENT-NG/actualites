CREATE TABLE actualites.thread_user_preferences (
        user_id VARCHAR(36) NOT NULL,
        thread_id BIGINT NOT NULL,
        visible boolean NOT NULL default false,
        CONSTRAINT user_pref_fk FOREIGN KEY(user_id) REFERENCES actualites.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT thread_user_pref_fk FOREIGN KEY(thread_id) REFERENCES actualites.thread(id) ON UPDATE CASCADE ON DELETE CASCADE,
        PRIMARY KEY (user_id, thread_id)
);