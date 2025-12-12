-- ============================================================================
-- Category Backup Script (PostgreSQL)
-- ============================================================================
-- Run this BEFORE running the consolidate-categories.sql script
-- This creates a backup table with original categories
-- ============================================================================

-- Create backup table if it doesn't exist
DROP TABLE IF EXISTS "RestaurantsCategoryBackup";

-- Create backup with original categories
CREATE TABLE "RestaurantsCategoryBackup" AS
SELECT
    "Id",
    "Category" as "OriginalCategory",
    CURRENT_TIMESTAMP as "BackupDate"
FROM "Restaurants";

-- Verify backup
SELECT
    COUNT(*) as "TotalRecords",
    COUNT(DISTINCT "OriginalCategory") as "UniqueCategories"
FROM "RestaurantsCategoryBackup";

SELECT
    "OriginalCategory",
    COUNT(*) as "Count"
FROM "RestaurantsCategoryBackup"
GROUP BY "OriginalCategory"
ORDER BY "Count" DESC;

DO $$
BEGIN
    RAISE NOTICE 'Backup completed successfully!';
END $$;
