ALTER TABLE actualites.info
    ADD COLUMN published boolean default true;

ALTER TABLE actualites.info
    ADD COLUMN publisher_id varchar default null;