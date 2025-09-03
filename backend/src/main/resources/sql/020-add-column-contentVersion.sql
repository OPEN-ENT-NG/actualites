-- COCO-4501

ALTER TABLE actualites.info
	ADD COLUMN content_version smallint NOT NULL DEFAULT 0;

ALTER TABLE actualites.info_revision
    ADD COLUMN content_version smallint NOT NULL DEFAULT 0;
