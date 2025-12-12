-- ============================================================================
-- Category Backup Script
-- ============================================================================
-- Run this BEFORE running the consolidate-categories.sql script
-- This creates a backup table with original categories
-- ============================================================================

-- Create backup table if it doesn't exist
IF OBJECT_ID('RestaurantsCategoryBackup', 'U') IS NOT NULL
    DROP TABLE RestaurantsCategoryBackup;

-- Create backup with original categories
SELECT
    Id,
    Category as OriginalCategory,
    GETDATE() as BackupDate
INTO RestaurantsCategoryBackup
FROM Restaurants;

-- Verify backup
SELECT
    COUNT(*) as TotalRecords,
    COUNT(DISTINCT OriginalCategory) as UniqueCategories
FROM RestaurantsCategoryBackup;

SELECT
    OriginalCategory,
    COUNT(*) as Count
FROM RestaurantsCategoryBackup
GROUP BY OriginalCategory
ORDER BY Count DESC;

PRINT 'Backup completed successfully!';
