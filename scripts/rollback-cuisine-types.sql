-- ============================================================================
-- CuisineType Rollback Script (PostgreSQL)
-- ============================================================================
-- Run this to restore original cuisine types from backup
-- IMPORTANT: Only run this if you have run backup-cuisine-types.sql first
-- ============================================================================

-- Check if backup table exists and perform rollback
DO $$
BEGIN
    -- Check if backup table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'RestaurantsCuisineTypeBackup'
    ) THEN
        RAISE EXCEPTION 'ERROR: Backup table does not exist! Run backup-cuisine-types.sql first.';
    END IF;

    RAISE NOTICE 'Backup table found. Starting rollback...';
END $$;

-- Show current state before rollback
SELECT 'CuisineTypes BEFORE rollback:' as "Status";
SELECT "CuisineType", COUNT(*) as "Count"
FROM "Restaurants"
GROUP BY "CuisineType"
ORDER BY "CuisineType";

-- Restore original cuisine types from backup
UPDATE "Restaurants" r
SET "CuisineType" = b."OriginalCuisineType"
FROM "RestaurantsCuisineTypeBackup" b
WHERE r."Id" = b."Id";

-- Verify rollback
SELECT 'CuisineTypes AFTER rollback:' as "Status";
SELECT "CuisineType", COUNT(*) as "Count"
FROM "Restaurants"
GROUP BY "CuisineType"
ORDER BY "CuisineType";

DO $$
BEGIN
    RAISE NOTICE 'CuisineType rollback completed successfully!';
END $$;
