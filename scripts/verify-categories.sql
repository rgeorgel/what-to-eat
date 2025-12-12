-- ============================================================================
-- Category Verification Script (PostgreSQL)
-- ============================================================================
-- Use this to check the current state of categories in your database
-- Run this BEFORE and AFTER the consolidation to compare results
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CATEGORY DISTRIBUTION REPORT';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- Total number of unique categories
SELECT 'Total Unique Categories:' as "Report Section";
SELECT COUNT(DISTINCT "Category") as "TotalCategories" FROM "Restaurants";

SELECT '' as ""; -- Empty line

-- Total number of restaurants
SELECT 'Total Restaurants:' as "Report Section";
SELECT COUNT(*) as "TotalRestaurants" FROM "Restaurants";

SELECT '' as ""; -- Empty line

-- Category distribution (sorted by count)
SELECT 'Category Distribution (by count):' as "Report Section";
SELECT
    "Category",
    COUNT(*) as "RestaurantCount",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Restaurants"), 2) as "Percentage"
FROM "Restaurants"
GROUP BY "Category"
ORDER BY "RestaurantCount" DESC;

SELECT '' as ""; -- Empty line

-- Category distribution (alphabetical)
SELECT 'Category Distribution (alphabetical):' as "Report Section";
SELECT
    "Category",
    COUNT(*) as "RestaurantCount"
FROM "Restaurants"
GROUP BY "Category"
ORDER BY "Category";

SELECT '' as ""; -- Empty line

-- Categories with only one restaurant (orphaned)
SELECT 'Categories with only 1 restaurant:' as "Report Section";
SELECT
    "Category",
    COUNT(*) as "RestaurantCount"
FROM "Restaurants"
GROUP BY "Category"
HAVING COUNT(*) = 1
ORDER BY "Category";

SELECT '' as ""; -- Empty line

-- Top 10 categories by restaurant count
SELECT 'Top 10 Categories:' as "Report Section";
SELECT
    "Category",
    COUNT(*) as "RestaurantCount"
FROM "Restaurants"
GROUP BY "Category"
ORDER BY "RestaurantCount" DESC
LIMIT 10;

SELECT '' as ""; -- Empty line

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'END OF REPORT';
    RAISE NOTICE '========================================';
END $$;
