ALTER TABLE actualites.info_shares DROP CONSTRAINT info_share;
ALTER TABLE actualites.thread_shares DROP CONSTRAINT thread_share;

ALTER TABLE actualites.info_shares ADD PRIMARY KEY (resource_id, member_id, action);
ALTER TABLE actualites.thread_shares ADD PRIMARY KEY (resource_id, member_id, action);
