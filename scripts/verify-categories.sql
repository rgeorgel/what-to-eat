-- ============================================================================
-- Category Verification Script
-- ============================================================================
-- Use this to check the current state of categories in your database
-- Run this BEFORE and AFTER the consolidation to compare results
-- ============================================================================

PRINT '========================================';
PRINT 'CATEGORY DISTRIBUTION REPORT';
PRINT '========================================';
PRINT '';

-- Total number of unique categories
PRINT 'Total Unique Categories:';
SELECT COUNT(DISTINCT Category) as TotalCategories FROM Restaurants;
PRINT '';

-- Total number of restaurants
PRINT 'Total Restaurants:';
SELECT COUNT(*) as TotalRestaurants FROM Restaurants;
PRINT '';

-- Category distribution (sorted by count)
PRINT 'Category Distribution (by count):';
SELECT
    Category,
    COUNT(*) as RestaurantCount,
    CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Restaurants) AS DECIMAL(5,2)) as Percentage
FROM Restaurants
GROUP BY Category
ORDER BY RestaurantCount DESC;
PRINT '';

-- Category distribution (alphabetical)
PRINT 'Category Distribution (alphabetical):';
SELECT
    Category,
    COUNT(*) as RestaurantCount
FROM Restaurants
GROUP BY Category
ORDER BY Category;
PRINT '';

-- Categories with only one restaurant (orphaned)
PRINT 'Categories with only 1 restaurant:';
SELECT
    Category,
    COUNT(*) as RestaurantCount
FROM Restaurants
GROUP BY Category
HAVING COUNT(*) = 1
ORDER BY Category;
PRINT '';

-- Top 10 categories by restaurant count
PRINT 'Top 10 Categories:';
SELECT TOP 10
    Category,
    COUNT(*) as RestaurantCount
FROM Restaurants
GROUP BY Category
ORDER BY RestaurantCount DESC;
PRINT '';

PRINT '========================================';
PRINT 'END OF REPORT';
PRINT '========================================';
