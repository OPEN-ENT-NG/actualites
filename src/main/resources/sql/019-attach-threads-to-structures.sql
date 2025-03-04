-- WB-1402

-- Allow NULL values for column thread.user_id and modify FK constraint => ON DELETE SET NULL
-- *** Opération potentiellement longue ***
-- ALTER TABLE actualites.thread 
-- 	ALTER COLUMN owner DROP NOT NULL,
-- 	DROP CONSTRAINT type_owner_fk,
-- 	ADD CONSTRAINT type_owner_fk FOREIGN KEY(owner) REFERENCES actualites.users(id) 
-- 		ON UPDATE CASCADE
-- 		ON DELETE SET NULL;

-- Attach threads to a structure
ALTER TABLE actualites.thread 
	ADD COLUMN structure_id VARCHAR(36) NULL;
