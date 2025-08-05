ALTER TABLE actualites.info ADD number_of_comments INT NOT NULL DEFAULT(0);

UPDATE actualites.info AS info
SET number_of_comments = subquery.count_comment
FROM
    ( SELECT COUNT(id) AS count_comment, info_id
    FROM actualites.comment GROUP BY info_id
    ) AS subquery
WHERE subquery.info_id = info.id;

CREATE OR REPLACE FUNCTION actualites.insert_or_delete_comment() RETURNS TRIGGER AS $body$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE actualites.info SET number_of_comments = number_of_comments + 1 WHERE id = NEW.info_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE actualites.info SET number_of_comments = number_of_comments - 1 WHERE id = OLD.info_id;
        RETURN OLD;
    END IF;
EXCEPTION
    WHEN data_exception THEN
        RAISE WARNING '[ACTUALITES.INSERT_DELETE_COMMENT] - UDF ERROR [DATA EXCEPTION] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
        RETURN NULL;
    WHEN unique_violation THEN
        RAISE WARNING '[ACTUALITES.INSERT_DELETE_COMMENT] - UDF ERROR [UNIQUE] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
        RETURN NULL;
    WHEN OTHERS THEN
        RAISE WARNING '[ACTUALITES.INSERT_DELETE_COMMENT] - UDF ERROR [OTHER] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
        RETURN NULL;
END;
$body$
LANGUAGE 'plpgsql';

CREATE TRIGGER actualites_insert_delete_trg AFTER INSERT OR DELETE ON actualites.comment FOR EACH ROW EXECUTE PROCEDURE actualites.insert_or_delete_comment();