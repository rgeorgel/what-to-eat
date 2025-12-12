-- ============================================================================
-- Category Consolidation Script
-- ============================================================================
-- This script consolidates 250+ categories into ~35 main categories
--
-- IMPORTANT: Before running this script:
-- 1. Backup your database
-- 2. Review the consolidation mappings below
-- 3. Test on a development environment first
--
-- To see current category distribution, run the SELECT query at the bottom
-- ============================================================================

-- ============================================================================
-- FOOD & CUISINE CATEGORIES
-- ============================================================================

-- American (Merge: American, New American, Southern, Comfort Food)
UPDATE Restaurants SET Category = 'American'
WHERE Category IN ('American', 'New American', 'Southern', 'Comfort Food');

-- Breakfast & Brunch (Keep as-is)
UPDATE Restaurants SET Category = 'Breakfast & Brunch'
WHERE Category IN ('Breakfast & Brunch', 'Pancakes', 'Waffles');

-- Burgers & Fast Food (Merge: Burgers, Fast Food, Hot Dogs, Chicken Shop, Chicken Wings)
UPDATE Restaurants SET Category = 'Burgers & Fast Food'
WHERE Category IN ('Burgers', 'Fast Food', 'Hot Dogs', 'Chicken Shop', 'Chicken Wings');

-- Pizza & Italian (Merge: Pizza, Italian)
UPDATE Restaurants SET Category = 'Pizza & Italian'
WHERE Category IN ('Pizza', 'Italian');

-- Mexican & Latin American (Merge: Mexican, Tex-Mex, Latin American, Cuban, Peruvian, Venezuelan, Salvadoran, Argentine)
UPDATE Restaurants SET Category = 'Mexican & Latin American'
WHERE Category IN ('Mexican', 'Tex-Mex', 'Latin American', 'Cuban', 'Peruvian', 'Venezuelan', 'Salvadoran', 'Argentine', 'Brazilian');

-- Chinese (Merge: Chinese, Cantonese, Dim Sum, Hong Kong Style Cafe, Hakka)
UPDATE Restaurants SET Category = 'Chinese'
WHERE Category IN ('Chinese', 'Cantonese', 'Dim Sum', 'Hong Kong Style Cafe', 'Hakka', 'Taiwanese');

-- Japanese (Merge: Japanese, Sushi Bars, Ramen, Noodles)
UPDATE Restaurants SET Category = 'Japanese'
WHERE Category IN ('Japanese', 'Sushi Bars', 'Ramen');

-- Korean (Keep as-is)
UPDATE Restaurants SET Category = 'Korean'
WHERE Category IN ('Korean');

-- Thai (Keep as-is)
UPDATE Restaurants SET Category = 'Thai'
WHERE Category IN ('Thai');

-- Vietnamese (Merge: Vietnamese, Laotian, Cambodian)
UPDATE Restaurants SET Category = 'Vietnamese'
WHERE Category IN ('Vietnamese', 'Laotian', 'Cambodian');

-- Indian & Pakistani (Merge: Indian, Pakistani, Himalayan/Nepalese)
UPDATE Restaurants SET Category = 'Indian & Pakistani'
WHERE Category IN ('Indian', 'Pakistani', 'Himalayan/Nepalese');

-- Middle Eastern (Merge: Middle Eastern, Lebanese, Persian/Iranian, Syrian, Turkish, Falafel, Egyptian, Arabic, Halal)
UPDATE Restaurants SET Category = 'Middle Eastern'
WHERE Category IN ('Middle Eastern', 'Lebanese', 'Persian/Iranian', 'Syrian', 'Turkish', 'Falafel', 'Egyptian', 'Arabic', 'Halal');

-- Mediterranean (Merge: Mediterranean, Greek, Moroccan, Spanish, Portuguese)
UPDATE Restaurants SET Category = 'Mediterranean'
WHERE Category IN ('Mediterranean', 'Greek', 'Moroccan', 'Spanish', 'Portuguese');

-- Asian Fusion (Merge: Asian Fusion, Pan Asian, Singaporean, Malaysian, Indonesian, Filipino, Burmese, Mongolian)
UPDATE Restaurants SET Category = 'Asian Fusion'
WHERE Category IN ('Asian Fusion', 'Pan Asian', 'Singaporean', 'Malaysian', 'Indonesian', 'Filipino', 'Burmese', 'Mongolian', 'Noodles', 'Dumplings', 'Poke');

-- French & European (Merge: French, Belgian, Modern European, Bistros, Austrian, German, British, Irish, Hungarian, Polish, Russian, Ukrainian)
UPDATE Restaurants SET Category = 'French & European'
WHERE Category IN ('French', 'Belgian', 'Modern European', 'Bistros', 'Austrian', 'German', 'British', 'Irish', 'Hungarian', 'Polish', 'Russian', 'Ukrainian');

-- Steakhouses & BBQ (Merge: Steakhouses, Barbeque, Smokehouse)
UPDATE Restaurants SET Category = 'Steakhouses & BBQ'
WHERE Category IN ('Steakhouses', 'Barbeque', 'Smokehouse');

-- Seafood (Keep as-is)
UPDATE Restaurants SET Category = 'Seafood'
WHERE Category IN ('Seafood', 'Fish & Chips');

-- Sandwiches & Delis (Merge: Sandwiches, Delis, Delicatessen, Donairs, Bagels)
UPDATE Restaurants SET Category = 'Sandwiches & Delis'
WHERE Category IN ('Sandwiches', 'Delis', 'Delicatessen', 'Donairs', 'Bagels');

-- Cafes & Coffee (Merge: Cafes, Coffee & Tea, Tea Rooms, Themed Cafes, Juice Bars & Smoothies, Bubble Tea)
UPDATE Restaurants SET Category = 'Cafes & Coffee'
WHERE Category IN ('Cafes', 'Coffee & Tea', 'Tea Rooms', 'Themed Cafes', 'Juice Bars & Smoothies', 'Bubble Tea');

-- Bakeries & Desserts (Merge: Bakeries, Patisserie/Cake Shop, Desserts, Donuts, Ice Cream & Frozen Yogurt, Creperies)
UPDATE Restaurants SET Category = 'Bakeries & Desserts'
WHERE Category IN ('Bakeries', 'Patisserie/Cake Shop', 'Desserts', 'Donuts', 'Ice Cream & Frozen Yogurt', 'Creperies');

-- Bars & Pubs (Merge: Bars, Pubs, Irish Pub, Gastropubs, Brewpubs, Sports Bars, Dive Bars)
UPDATE Restaurants SET Category = 'Bars & Pubs'
WHERE Category IN ('Bars', 'Pubs', 'Irish Pub', 'Gastropubs', 'Brewpubs', 'Sports Bars', 'Dive Bars', 'Pool Halls');

-- Vegetarian & Vegan (Merge: Vegetarian, Vegan, Salad, Live/Raw Food, Gluten-Free, Organic Stores)
UPDATE Restaurants SET Category = 'Vegetarian & Vegan'
WHERE Category IN ('Vegetarian', 'Vegan', 'Salad', 'Live/Raw Food', 'Gluten-Free');

-- Street Food & Casual (Merge: Food Trucks, Food Stands, Food Court, Poutineries, Diners)
UPDATE Restaurants SET Category = 'Street Food & Casual'
WHERE Category IN ('Food Trucks', 'Food Stands', 'Food Court', 'Poutineries', 'Diners', 'Do-It-Yourself Food');

-- International & Other (Merge: International, Ethiopian, African, Caribbean, Hawaiian, Australian, Canadian, Afghan, Kosher)
UPDATE Restaurants SET Category = 'International & Other'
WHERE Category IN ('International', 'Ethiopian', 'African', 'Caribbean', 'Hawaiian', 'Australian', 'Canadian (New)', 'Afghan', 'Kosher');

-- Specialty Dining (Merge: Buffets, Hot Pot, Dumplings, Tapas, Fondue)
UPDATE Restaurants SET Category = 'Specialty Dining'
WHERE Category IN ('Buffets', 'Hot Pot', 'Tapas Bars', 'Tapas/Small Plates', 'Cajun/Creole', 'Soup');

-- ============================================================================
-- BARS & NIGHTLIFE CATEGORIES
-- ============================================================================

-- Cocktail Bars & Lounges (Merge: Cocktail Bars, Lounges, Speakeasies, Tiki Bars)
UPDATE Restaurants SET Category = 'Cocktail Bars & Lounges'
WHERE Category IN ('Cocktail Bars', 'Lounges', 'Speakeasies', 'Tiki Bars');

-- Wine Bars (Merge: Wine Bars, Wine Tasting Room, Champagne Bars, Wineries)
UPDATE Restaurants SET Category = 'Wine Bars'
WHERE Category IN ('Wine Bars', 'Wine Tasting Room', 'Champagne Bars', 'Wineries', 'Wine Tours');

-- Beer & Breweries (Merge: Beer Bar, Breweries, Brewpubs, Cideries)
UPDATE Restaurants SET Category = 'Beer & Breweries'
WHERE Category IN ('Beer Bar', 'Breweries', 'Cideries');

-- Dance Clubs & Music Venues (Merge: Dance Clubs, Music Venues, Jazz & Blues)
UPDATE Restaurants SET Category = 'Dance Clubs & Music Venues'
WHERE Category IN ('Dance Clubs', 'Music Venues', 'Jazz & Blues', 'Musicians', 'Social Clubs');

-- Specialty Bars (Merge: Whiskey Bars, Hookah Bars, Gay Bars)
UPDATE Restaurants SET Category = 'Specialty Bars'
WHERE Category IN ('Whiskey Bars', 'Hookah Bars', 'Gay Bars');

-- ============================================================================
-- RETAIL & SERVICES CATEGORIES
-- ============================================================================

-- Grocery & Markets (Merge: Grocery, International Grocery, Seafood Markets, Cheese Shops, Butcher, Meat Shops, Fruits & Veggies)
UPDATE Restaurants SET Category = 'Grocery & Markets'
WHERE Category IN ('Grocery', 'International Grocery', 'Seafood Markets', 'Cheese Shops', 'Butcher', 'Meat Shops', 'Fruits & Veggies');

-- Specialty Food Shops (Merge: Specialty Food, Beer Wine & Spirits, Brewing Supplies)
UPDATE Restaurants SET Category = 'Specialty Food Shops'
WHERE Category IN ('Specialty Food', 'Beer, Wine & Spirits', 'Brewing Supplies', 'Food Delivery Services');

-- Retail & Stores (Merge: Bookstores, Candle Stores, Video Game Stores)
UPDATE Restaurants SET Category = 'Retail & Stores'
WHERE Category IN ('Bookstores', 'Candle Stores', 'Video Game Stores');

-- ============================================================================
-- ENTERTAINMENT & ACTIVITIES CATEGORIES
-- ============================================================================

-- Arts & Culture (Merge: Museums, Art Galleries, Landmarks & Historical Buildings)
UPDATE Restaurants SET Category = 'Arts & Culture'
WHERE Category IN ('Museums', 'Art Galleries', 'Landmarks & Historical Buildings');

-- Entertainment (Merge: Arcades, Bowling, Pool Halls, Golf)
UPDATE Restaurants SET Category = 'Entertainment'
WHERE Category IN ('Arcades', 'Bowling', 'Golf');

-- Parks & Recreation (Merge: Parks, Dog Parks, Aquariums)
UPDATE Restaurants SET Category = 'Parks & Recreation'
WHERE Category IN ('Parks', 'Dog Parks', 'Aquariums');

-- Events & Venues (Merge: Venues & Event Spaces, Festivals, Hotels, Team Building Activities, Child Care)
UPDATE Restaurants SET Category = 'Events & Venues'
WHERE Category IN ('Venues & Event Spaces', 'Festivals', 'Hotels', 'Team Building Activities', 'Child Care & Day Care');

-- Generic Restaurants (Catch-all for unmapped categories)
UPDATE Restaurants SET Category = 'Restaurants'
WHERE Category IN ('Restaurants');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run this BEFORE the update to see current distribution:
-- SELECT Category, COUNT(*) as Count
-- FROM Restaurants
-- GROUP BY Category
-- ORDER BY Count DESC;

-- Run this AFTER the update to verify consolidation:
-- SELECT Category, COUNT(*) as Count
-- FROM Restaurants
-- GROUP BY Category
-- ORDER BY Category;

-- Count total categories before and after:
-- SELECT COUNT(DISTINCT Category) as TotalCategories FROM Restaurants;
