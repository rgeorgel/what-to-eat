-- ============================================================================
-- Category Rollback Script (PostgreSQL)
-- ============================================================================
-- Run this to restore original categories from backup
-- IMPORTANT: Only run this if you have run backup-categories.sql first
-- ============================================================================

-- Check if backup table exists and perform rollback
DO $$
BEGIN
    -- Check if backup table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'RestaurantsCategoryBackup'
    ) THEN
        RAISE EXCEPTION 'ERROR: Backup table does not exist! Run backup-categories.sql first.';
    END IF;

    RAISE NOTICE 'Backup table found. Starting rollback...';
END $$;

-- Show current state before rollback
SELECT 'Categories BEFORE rollback:' as "Status";
SELECT "Category", COUNT(*) as "Count"
FROM "Restaurants"
GROUP BY "Category"
ORDER BY "Category";

-- Restore original categories from backup
UPDATE "Restaurants" r
SET "Category" = b."OriginalCategory"
FROM "RestaurantsCategoryBackup" b
WHERE r."Id" = b."Id";

-- Verify rollback
SELECT 'Categories AFTER rollback:' as "Status";
SELECT "Category", COUNT(*) as "Count"
FROM "Restaurants"
GROUP BY "Category"
ORDER BY "Category";

DO $$
BEGIN
    RAISE NOTICE 'Rollback completed successfully!';
END $$;
