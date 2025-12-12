-- ============================================================================
-- Category Rollback Script
-- ============================================================================
-- Run this to restore original categories from backup
-- IMPORTANT: Only run this if you have run backup-categories.sql first
-- ============================================================================

-- Check if backup table exists
IF OBJECT_ID('RestaurantsCategoryBackup', 'U') IS NULL
BEGIN
    PRINT 'ERROR: Backup table does not exist! Run backup-categories.sql first.';
    RETURN;
END

-- Show current state before rollback
PRINT 'Categories BEFORE rollback:';
SELECT Category, COUNT(*) as Count
FROM Restaurants
GROUP BY Category
ORDER BY Category;

-- Restore original categories from backup
UPDATE r
SET r.Category = b.OriginalCategory
FROM Restaurants r
INNER JOIN RestaurantsCategoryBackup b ON r.Id = b.Id;

-- Verify rollback
PRINT 'Categories AFTER rollback:';
SELECT Category, COUNT(*) as Count
FROM Restaurants
GROUP BY Category
ORDER BY Category;

PRINT 'Rollback completed successfully!';
