ALTER TABLE actualites.thread
    ADD COLUMN migrated boolean default false;

ALTER TABLE actualites.thread_shares
    ADD COLUMN adml_group boolean default false;