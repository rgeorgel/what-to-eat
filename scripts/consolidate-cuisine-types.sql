-- ============================================================================
-- CuisineType Consolidation Script (PostgreSQL)
-- ============================================================================
-- This script consolidates 250+ cuisine types into ~35 main cuisine types
--
-- IMPORTANT: Before running this script:
-- 1. Backup your database
-- 2. Review the consolidation mappings below
-- 3. Test on a development environment first
--
-- To see current cuisine type distribution, run the SELECT query at the bottom
-- ============================================================================

-- ============================================================================
-- FOOD & CUISINE TYPES
-- ============================================================================

-- American (Merge: American, Southern, Comfort Food, Soul Food)
UPDATE "Restaurants" SET "CuisineType" = 'American'
WHERE "CuisineType" IN ('American', 'Canadian (New)', 'Southern', 'Comfort Food', 'Soul Food');

-- Breakfast & Brunch (Keep as-is)
UPDATE "Restaurants" SET "CuisineType" = 'Breakfast & Brunch'
WHERE "CuisineType" IN ('Breakfast & Brunch', 'Pancakes', 'Waffles');

-- Burgers & Fast Food (Merge: Burgers, Fast Food, Hot Dogs, Chicken Shop, Chicken Wings, Cheesesteaks)
UPDATE "Restaurants" SET "CuisineType" = 'Burgers & Fast Food'
WHERE "CuisineType" IN ('Burgers', 'Fast Food', 'Hot Dogs', 'Chicken Shop', 'Chicken Wings', 'Cheesesteaks');

-- Pizza & Italian (Merge: Pizza, Italian)
UPDATE "Restaurants" SET "CuisineType" = 'Pizza & Italian'
WHERE "CuisineType" IN ('Pizza', 'Italian');

-- Mexican & Latin American (Merge: Mexican, Tex-Mex, Latin American, Cuban, Peruvian, Salvadoran, Argentine, Brazilian, Colombian, Nicaraguan)
UPDATE "Restaurants" SET "CuisineType" = 'Mexican & Latin American'
WHERE "CuisineType" IN ('Mexican', 'Tex-Mex', 'Latin American', 'Cuban', 'Peruvian', 'Salvadoran', 'Argentine', 'Brazilian', 'Colombian', 'Nicaraguan');

-- Chinese (Merge: Chinese, Cantonese, Dim Sum, Hong Kong Style Cafe, Hakka, Taiwanese)
UPDATE "Restaurants" SET "CuisineType" = 'Chinese'
WHERE "CuisineType" IN ('Chinese', 'Cantonese', 'Dim Sum', 'Hong Kong Style Cafe', 'Hakka', 'Taiwanese');

-- Japanese (Merge: Japanese, Sushi Bars, Ramen)
UPDATE "Restaurants" SET "CuisineType" = 'Japanese'
WHERE "CuisineType" IN ('Japanese', 'Sushi Bars', 'Ramen');

-- Korean (Keep as-is)
UPDATE "Restaurants" SET "CuisineType" = 'Korean'
WHERE "CuisineType" IN ('Korean');

-- Thai (Keep as-is)
UPDATE "Restaurants" SET "CuisineType" = 'Thai'
WHERE "CuisineType" IN ('Thai');

-- Vietnamese (Merge: Vietnamese, Laotian, Cambodian)
UPDATE "Restaurants" SET "CuisineType" = 'Vietnamese'
WHERE "CuisineType" IN ('Vietnamese', 'Laotian', 'Cambodian');

-- Indian & Pakistani (Merge: Indian, Pakistani, Himalayan/Nepalese, Sri Lankan)
UPDATE "Restaurants" SET "CuisineType" = 'Indian & Pakistani'
WHERE "CuisineType" IN ('Indian', 'Pakistani', 'Himalayan/Nepalese', 'Sri Lankan');

-- Middle Eastern (Merge: Middle Eastern, Lebanese, Persian/Iranian, Syrian, Turkish, Falafel, Egyptian, Halal, Kebab)
UPDATE "Restaurants" SET "CuisineType" = 'Middle Eastern'
WHERE "CuisineType" IN ('Middle Eastern', 'Lebanese', 'Persian/Iranian', 'Syrian', 'Turkish', 'Falafel', 'Egyptian', 'Halal', 'Kebab');

-- Mediterranean (Merge: Mediterranean, Greek, Moroccan, Spanish, Portuguese)
UPDATE "Restaurants" SET "CuisineType" = 'Mediterranean'
WHERE "CuisineType" IN ('Mediterranean', 'Greek', 'Moroccan', 'Spanish', 'Portuguese');

-- Asian Fusion (Merge: Asian Fusion, Pan Asian, Singaporean, Malaysian, Indonesian, Filipino, Mongolian)
UPDATE "Restaurants" SET "CuisineType" = 'Asian Fusion'
WHERE "CuisineType" IN ('Asian Fusion', 'Pan Asian', 'Singaporean', 'Malaysian', 'Indonesian', 'Filipino', 'Mongolian', 'Noodles', 'Dumplings', 'Poke');

-- French & European (Merge: French, Belgian, Modern European, Bistros, Brasseries, Austrian, German, British, Scottish, Irish, Hungarian, Polish, Russian, Ukrainian)
UPDATE "Restaurants" SET "CuisineType" = 'French & European'
WHERE "CuisineType" IN ('French', 'Belgian', 'Modern European', 'Bistros', 'Brasseries', 'Austrian', 'German', 'British', 'Scottish', 'Irish', 'Hungarian', 'Polish', 'Russian', 'Ukrainian');

-- Steakhouses & BBQ (Keep as-is)
UPDATE "Restaurants" SET "CuisineType" = 'Steakhouses & BBQ'
WHERE "CuisineType" IN ('Steakhouses', 'Barbeque', 'Smokehouse');

-- Seafood (Keep as-is)
UPDATE "Restaurants" SET "CuisineType" = 'Seafood'
WHERE "CuisineType" IN ('Seafood', 'Fish & Chips');

-- Sandwiches & Delis (Merge: Sandwiches, Delis, Delicatessen, Donairs, Bagels)
UPDATE "Restaurants" SET "CuisineType" = 'Sandwiches & Delis'
WHERE "CuisineType" IN ('Sandwiches', 'Delis', 'Delicatessen', 'Donairs', 'Bagels');

-- Cafes & Coffee (Merge: Cafes, Coffee & Tea, Tea Rooms, Themed Cafes, Juice Bars & Smoothies, Bubble Tea, Coffee Roasteries)
UPDATE "Restaurants" SET "CuisineType" = 'Cafes & Coffee'
WHERE "CuisineType" IN ('Cafes', 'Coffee & Tea', 'Tea Rooms', 'Themed Cafes', 'Juice Bars & Smoothies', 'Bubble Tea', 'Coffee Roasteries');

-- Bakeries & Desserts (Merge: Bakeries, Patisserie/Cake Shop, Desserts, Donuts, Ice Cream & Frozen Yogurt, Creperies, Custom Cakes, Macarons, Pretzels)
UPDATE "Restaurants" SET "CuisineType" = 'Bakeries & Desserts'
WHERE "CuisineType" IN ('Bakeries', 'Patisserie/Cake Shop', 'Desserts', 'Donuts', 'Ice Cream & Frozen Yogurt', 'Creperies', 'Custom Cakes', 'Macarons', 'Pretzels');

-- Bars & Pubs (Merge: Bars, Pubs, Irish Pub, Gastropubs, Brewpubs, Sports Bars, Dive Bars, Pool Halls)
UPDATE "Restaurants" SET "CuisineType" = 'Bars & Pubs'
WHERE "CuisineType" IN ('Bars', 'Pubs', 'Irish Pub', 'Gastropubs', 'Brewpubs', 'Sports Bars', 'Dive Bars', 'Pool Halls');

-- Vegetarian & Vegan (Merge: Vegetarian, Vegan, Salad, Live/Raw Food, Gluten-Free)
UPDATE "Restaurants" SET "CuisineType" = 'Vegetarian & Vegan'
WHERE "CuisineType" IN ('Vegetarian', 'Vegan', 'Salad', 'Live/Raw Food', 'Gluten-Free');

-- Street Food & Casual (Merge: Food Trucks, Food Stands, Food Court, Poutineries, Diners)
UPDATE "Restaurants" SET "CuisineType" = 'Street Food & Casual'
WHERE "CuisineType" IN ('Food Trucks', 'Food Stands', 'Food Court', 'Poutineries', 'Diners');

-- International & Other (Merge: International, Ethiopian, African, Caribbean, Hawaiian, Australian, Afghan, Kosher, South African)
UPDATE "Restaurants" SET "CuisineType" = 'International & Other'
WHERE "CuisineType" IN ('International', 'Ethiopian', 'African', 'Caribbean', 'Hawaiian', 'Australian', 'Afghan', 'Kosher', 'South African');

-- Specialty Dining (Merge: Buffets, Hot Pot, Tapas, Cajun/Creole, Soup)
UPDATE "Restaurants" SET "CuisineType" = 'Specialty Dining'
WHERE "CuisineType" IN ('Buffets', 'Hot Pot', 'Tapas Bars', 'Tapas/Small Plates', 'Cajun/Creole', 'Soup');

-- ============================================================================
-- BARS & NIGHTLIFE TYPES
-- ============================================================================

-- Cocktail Bars & Lounges (Merge: Cocktail Bars, Lounges, Speakeasies, Tiki Bars)
UPDATE "Restaurants" SET "CuisineType" = 'Cocktail Bars & Lounges'
WHERE "CuisineType" IN ('Cocktail Bars', 'Lounges', 'Speakeasies', 'Tiki Bars');

-- Wine Bars (Merge: Wine Bars, Wine Tasting Room, Champagne Bars, Wineries)
UPDATE "Restaurants" SET "CuisineType" = 'Wine Bars'
WHERE "CuisineType" IN ('Wine Bars', 'Wine Tasting Room', 'Champagne Bars', 'Wineries');

-- Beer & Breweries (Merge: Beer Bar, Breweries, Cideries, Beer Tours)
UPDATE "Restaurants" SET "CuisineType" = 'Beer & Breweries'
WHERE "CuisineType" IN ('Beer Bar', 'Breweries', 'Cideries', 'Beer Tours');

-- Dance Clubs & Music Venues (Merge: Dance Clubs, Music Venues, Jazz & Blues, Karaoke, Cabaret, DJs)
UPDATE "Restaurants" SET "CuisineType" = 'Dance Clubs & Music Venues'
WHERE "CuisineType" IN ('Dance Clubs', 'Music Venues', 'Jazz & Blues', 'Karaoke', 'Cabaret', 'DJs', 'Social Clubs', 'Sports Clubs');

-- Specialty Bars (Merge: Whiskey Bars, Hookah Bars, Gay Bars)
UPDATE "Restaurants" SET "CuisineType" = 'Specialty Bars'
WHERE "CuisineType" IN ('Whiskey Bars', 'Hookah Bars', 'Gay Bars');

-- ============================================================================
-- RETAIL & SERVICES TYPES
-- ============================================================================

-- Grocery & Markets (Merge: Grocery, International Grocery, Seafood Markets, Cheese Shops, Meat Shops, Farmers Market, Imported Food, Convenience Stores)
UPDATE "Restaurants" SET "CuisineType" = 'Grocery & Markets'
WHERE "CuisineType" IN ('Grocery', 'International Grocery', 'Seafood Markets', 'Cheese Shops', 'Meat Shops', 'Farmers Market', 'Imported Food', 'Convenience Stores');

-- Specialty Food Shops (Merge: Specialty Food, Beer Wine & Spirits, Brewing Supplies, Caterers, Food Delivery Services)
UPDATE "Restaurants" SET "CuisineType" = 'Specialty Food Shops'
WHERE "CuisineType" IN ('Specialty Food', 'Beer, Wine & Spirits', 'Brewing Supplies', 'Caterers', 'Food Delivery Services');

-- Retail & Stores (Merge: Gift Shops, Hobby Shops, Tobacco Shops, Head Shops, Sunglasses, Vinyl Records, Pop-up Shops)
UPDATE "Restaurants" SET "CuisineType" = 'Retail & Stores'
WHERE "CuisineType" IN ('Gift Shops', 'Hobby Shops', 'Tobacco Shops', 'Head Shops', 'Sunglasses', 'Vinyl Records', 'Pop-up Shops');

-- ============================================================================
-- ENTERTAINMENT & ACTIVITIES TYPES
-- ============================================================================

-- Arts & Culture (Merge: Museums, Landmarks & Historical Buildings, Historical Tours, Art Classes)
UPDATE "Restaurants" SET "CuisineType" = 'Arts & Culture'
WHERE "CuisineType" IN ('Museums', 'Landmarks & Historical Buildings', 'Historical Tours', 'Art Classes');

-- Entertainment (Merge: Arcades, Bowling, Golf, Escape Games, Tabletop Games)
UPDATE "Restaurants" SET "CuisineType" = 'Entertainment'
WHERE "CuisineType" IN ('Arcades', 'Bowling', 'Golf', 'Escape Games', 'Tabletop Games');

-- Parks & Recreation (Merge: Parks, Beaches, Aquariums)
UPDATE "Restaurants" SET "CuisineType" = 'Parks & Recreation'
WHERE "CuisineType" IN ('Parks', 'Beaches', 'Aquariums');

-- Events & Venues (Merge: Venues & Event Spaces, Festivals, Local Flavor)
UPDATE "Restaurants" SET "CuisineType" = 'Events & Venues'
WHERE "CuisineType" IN ('Venues & Event Spaces', 'Festivals', 'Local Flavor');

-- Generic Restaurants (Catch-all for unmapped cuisine types)
UPDATE "Restaurants" SET "CuisineType" = 'Restaurants'
WHERE "CuisineType" IN ('Restaurants');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run this BEFORE the update to see current distribution:
-- SELECT "CuisineType", COUNT(*) as "Count"
-- FROM "Restaurants"
-- GROUP BY "CuisineType"
-- ORDER BY "Count" DESC;

-- Run this AFTER the update to verify consolidation:
-- SELECT "CuisineType", COUNT(*) as "Count"
-- FROM "Restaurants"
-- GROUP BY "CuisineType"
-- ORDER BY "CuisineType";

-- Count total cuisine types before and after:
-- SELECT COUNT(DISTINCT "CuisineType") as "TotalCuisineTypes" FROM "Restaurants";
