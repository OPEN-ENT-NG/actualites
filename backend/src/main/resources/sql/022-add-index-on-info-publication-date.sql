CREATE INDEX IF NOT EXISTS idx_info_status_publication
    ON actualites.info (thread_id, owner, publication_date, expiration_date)
    WHERE status = 3;

CREATE INDEX IF NOT EXISTS idx_info_owner
    ON actualites.info (owner);

CREATE INDEX IF NOT EXISTS idx_info_shares_action_resource_id
    ON actualites.info_shares (action, resource_id);

CREATE INDEX IF NOT EXISTS idx_thread_owner ON actualites.thread(owner);
CREATE INDEX IF NOT EXISTS idx_info_thread_id ON actualites.info(thread_id);
