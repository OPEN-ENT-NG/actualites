-- Migration: Optimize thread_shares and info_shares by consolidating rights
-- Reduces cardinality by mapping old granular rights to representative rights
-- Expected reduction: ~60% fewer rows in thread_shares

-- Step 1: Create backup tables
CREATE TABLE IF NOT EXISTS actualites.thread_shares_backup_028 AS
SELECT * FROM actualites.thread_shares;

CREATE TABLE IF NOT EXISTS actualites.info_shares_backup_028 AS
SELECT * FROM actualites.info_shares;

-- Step 2: Map old thread rights to THREAD_CONTRIB_RIGHT
-- These actions represent contributor-level access (read thread + create draft/pending)
INSERT INTO actualites.thread_shares (resource_id, member_id, action)
SELECT DISTINCT resource_id, member_id, 'net-atos-entng-actualites-controllers-ThreadController|contrib'
FROM actualites.thread_shares
WHERE action IN (
    'net-atos-entng-actualites-controllers-ThreadController|getThread',
    'net-atos-entng-actualites-controllers-InfoController|createDraft',
    'net-atos-entng-actualites-controllers-InfoController|createPending',
    'net-atos-entng-actualites-controllers-InfoController|submit',
    'net-atos-entng-actualites-controllers-InfoController|unsubmit',
    'net-atos-entng-actualites-controllers-InfoController|updateDraft',
    'net-atos-entng-actualites-controllers-InfoController|updatePending',
    'net-atos-entng-actualites-controllers-InfoController|listInfosByThreadId',
    'net-atos-entng-actualites-controllers-InfoController|shareInfo',
    'net-atos-entng-actualites-controllers-InfoController|shareResourceInfo'
)
ON CONFLICT (resource_id, member_id, action) DO NOTHING;

-- Step 3: Map old thread rights to THREAD_MANAGER_RIGHT
-- These actions represent manager-level access (full thread management)
INSERT INTO actualites.thread_shares (resource_id, member_id, action)
SELECT DISTINCT resource_id, member_id, 'net-atos-entng-actualites-controllers-ThreadController|manager'
FROM actualites.thread_shares
WHERE action IN (
    'net-atos-entng-actualites-controllers-ThreadController|updateThread',
    'net-atos-entng-actualites-controllers-ThreadController|deleteThread',
    'net-atos-entng-actualites-controllers-ThreadController|shareThread',
    'net-atos-entng-actualites-controllers-ThreadController|shareResource',
    'net-atos-entng-actualites-controllers-InfoController|delete'
)
ON CONFLICT (resource_id, member_id, action) DO NOTHING;

-- Step 4: Map old thread rights to THREAD_PUBLISH_RIGHT
-- These actions represent publisher-level access (publish/unpublish infos)
INSERT INTO actualites.thread_shares (resource_id, member_id, action)
SELECT DISTINCT resource_id, member_id, 'net-atos-entng-actualites-controllers-InfoController|publish'
FROM actualites.thread_shares
WHERE action IN (
    'net-atos-entng-actualites-controllers-InfoController|publish',
    'net-atos-entng-actualites-controllers-InfoController|unpublish',
    'net-atos-entng-actualites-controllers-InfoController|createPublished',
    'net-atos-entng-actualites-controllers-InfoController|updatePublished',
    'net-atos-entng-actualites-controllers-InfoController|getInfoTimeline'
)
ON CONFLICT (resource_id, member_id, action) DO NOTHING;

-- Step 5: Map old info rights to INFO_READ_RIGHT
-- These actions represent read access to published infos
INSERT INTO actualites.info_shares (resource_id, member_id, action)
SELECT DISTINCT resource_id, member_id, 'net-atos-entng-actualites-controllers-InfoController|read'
FROM actualites.info_shares
WHERE action IN (
    'net.atos.entng.actualites.controllers.InfoController|getInfo',
    'net.atos.entng.actualites.controllers.InfoController|getSingleInfo',
    'net.atos.entng.actualites.controllers.InfoController|getInfoComments'
)
ON CONFLICT (resource_id, member_id, action) DO NOTHING;

-- Step 6: Map old comment rights to INFO_COMMENT_RIGHT
-- These actions represent comment access on infos
INSERT INTO actualites.info_shares (resource_id, member_id, action)
SELECT DISTINCT resource_id, member_id, 'net-atos-entng-actualites-controllers-CommentController|comment'
FROM actualites.info_shares
WHERE action IN (
    'net.atos.entng.actualites.controllers.CommentController|comment',
    'net.atos.entng.actualites.controllers.CommentController|updateComment',
    'net.atos.entng.actualites.controllers.CommentController|deleteComment'
)
ON CONFLICT (resource_id, member_id, action) DO NOTHING;

-- Step 7: Delete old granular rights from thread_shares
DELETE FROM actualites.thread_shares
WHERE action IN (
    'net-atos-entng-actualites-controllers-ThreadController|getThread',
    'net-atos-entng-actualites-controllers-InfoController|createDraft',
    'net-atos-entng-actualites-controllers-InfoController|createPending',
    'net-atos-entng-actualites-controllers-InfoController|submit',
    'net-atos-entng-actualites-controllers-InfoController|unsubmit',
    'net-atos-entng-actualites-controllers-InfoController|updateDraft',
    'net-atos-entng-actualites-controllers-InfoController|updatePending',
    'net-atos-entng-actualites-controllers-InfoController|listInfosByThreadId',
    'net-atos-entng-actualites-controllers-InfoController|shareInfo',
    'net-atos-entng-actualites-controllers-InfoController|shareResourceInfo',
    'net-atos-entng-actualites-controllers-ThreadController|updateThread',
    'net-atos-entng-actualites-controllers-ThreadController|deleteThread',
    'net-atos-entng-actualites-controllers-ThreadController|shareThread',
    'net-atos-entng-actualites-controllers-ThreadController|shareResource',
    'net-atos-entng-actualites-controllers-InfoController|publish',
    'net-atos-entng-actualites-controllers-InfoController|unpublish',
    'net-atos-entng-actualites-controllers-InfoController|createPublished',
    'net-atos-entng-actualites-controllers-InfoController|updatePublished',
    'net-atos-entng-actualites-controllers-InfoController|delete',
    'net-atos-entng-actualites-controllers-InfoController|getInfoTimeline'
);

-- Step 8: Delete old granular rights from info_shares
DELETE FROM actualites.info_shares
WHERE action IN (
    'net.atos.entng.actualites.controllers.InfoController|getInfo',
    'net.atos.entng.actualites.controllers.InfoController|getSingleInfo',
    'net.atos.entng.actualites.controllers.InfoController|getInfoComments',
    'net.atos.entng.actualites.controllers.CommentController|comment',
    'net.atos.entng.actualites.controllers.CommentController|updateComment',
    'net.atos.entng.actualites.controllers.CommentController|deleteComment'
);

-- Step 9: Display migration statistics
DO $$
DECLARE
    old_thread_count INTEGER;
    new_thread_count INTEGER;
    old_info_count INTEGER;
    new_info_count INTEGER;
    reduction_pct NUMERIC;
BEGIN
    SELECT COUNT(*) INTO old_thread_count FROM actualites.thread_shares_backup_028;
    SELECT COUNT(*) INTO new_thread_count FROM actualites.thread_shares;
    SELECT COUNT(*) INTO old_info_count FROM actualites.info_shares_backup_028;
    SELECT COUNT(*) INTO new_info_count FROM actualites.info_shares;
    
    reduction_pct := ROUND(((old_thread_count + old_info_count - new_thread_count - new_info_count)::NUMERIC / (old_thread_count + old_info_count)::NUMERIC * 100), 2);
    
    RAISE NOTICE '=== Migration 028 Statistics ===';
    RAISE NOTICE 'thread_shares: % -> % rows', old_thread_count, new_thread_count;
    RAISE NOTICE 'info_shares: % -> % rows', old_info_count, new_info_count;
    RAISE NOTICE 'Total reduction: % percent', reduction_pct;
END $$;
