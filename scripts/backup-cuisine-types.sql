-- ============================================================================
-- CuisineType Backup Script (PostgreSQL)
-- ============================================================================
-- Run this BEFORE running the consolidate-cuisine-types.sql script
-- This creates a backup table with original cuisine types
-- ============================================================================

-- Create backup table if it doesn't exist
DROP TABLE IF EXISTS "RestaurantsCuisineTypeBackup";

-- Create backup with original cuisine types
CREATE TABLE "RestaurantsCuisineTypeBackup" AS
SELECT
    "Id",
    "CuisineType" as "OriginalCuisineType",
    CURRENT_TIMESTAMP as "BackupDate"
FROM "Restaurants";

-- Verify backup
SELECT
    COUNT(*) as "TotalRecords",
    COUNT(DISTINCT "OriginalCuisineType") as "UniqueCuisineTypes"
FROM "RestaurantsCuisineTypeBackup";

SELECT
    "OriginalCuisineType",
    COUNT(*) as "Count"
FROM "RestaurantsCuisineTypeBackup"
GROUP BY "OriginalCuisineType"
ORDER BY "Count" DESC;

DO $$
BEGIN
    RAISE NOTICE 'CuisineType backup completed successfully!';
END $$;
