-- ============================================================================
-- CuisineType Verification Script (PostgreSQL)
-- ============================================================================
-- Use this to check the current state of cuisine types in your database
-- Run this BEFORE and AFTER the consolidation to compare results
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CUISINE TYPE DISTRIBUTION REPORT';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- Total number of unique cuisine types
SELECT 'Total Unique Cuisine Types:' as "Report Section";
SELECT COUNT(DISTINCT "CuisineType") as "TotalCuisineTypes" FROM "Restaurants";

SELECT '' as ""; -- Empty line

-- Total number of restaurants
SELECT 'Total Restaurants:' as "Report Section";
SELECT COUNT(*) as "TotalRestaurants" FROM "Restaurants";

SELECT '' as ""; -- Empty line

-- Cuisine type distribution (sorted by count)
SELECT 'Cuisine Type Distribution (by count):' as "Report Section";
SELECT
    "CuisineType",
    COUNT(*) as "RestaurantCount",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Restaurants"), 2) as "Percentage"
FROM "Restaurants"
GROUP BY "CuisineType"
ORDER BY "RestaurantCount" DESC;

SELECT '' as ""; -- Empty line

-- Cuisine type distribution (alphabetical)
SELECT 'Cuisine Type Distribution (alphabetical):' as "Report Section";
SELECT
    "CuisineType",
    COUNT(*) as "RestaurantCount"
FROM "Restaurants"
GROUP BY "CuisineType"
ORDER BY "CuisineType";

SELECT '' as ""; -- Empty line

-- Cuisine types with only one restaurant (orphaned)
SELECT 'Cuisine Types with only 1 restaurant:' as "Report Section";
SELECT
    "CuisineType",
    COUNT(*) as "RestaurantCount"
FROM "Restaurants"
GROUP BY "CuisineType"
HAVING COUNT(*) = 1
ORDER BY "CuisineType";

SELECT '' as ""; -- Empty line

-- Top 10 cuisine types by restaurant count
SELECT 'Top 10 Cuisine Types:' as "Report Section";
SELECT
    "CuisineType",
    COUNT(*) as "RestaurantCount"
FROM "Restaurants"
GROUP BY "CuisineType"
ORDER BY "RestaurantCount" DESC
LIMIT 10;

SELECT '' as ""; -- Empty line

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'END OF REPORT';
    RAISE NOTICE '========================================';
END $$;
