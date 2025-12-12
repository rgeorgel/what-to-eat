# CuisineType Consolidation Scripts (PostgreSQL)

This directory contains PostgreSQL scripts to consolidate your restaurant cuisine types from 250+ cuisine types down to approximately 35 main cuisine types.

## 📋 Scripts Overview

| Script | Purpose |
|--------|---------|
| `verify-cuisine-types.sql` | View current cuisine type distribution and statistics |
| `backup-cuisine-types.sql` | Create a backup of current cuisine types before consolidation |
| `consolidate-cuisine-types.sql` | Apply the cuisine type consolidation mappings |
| `rollback-cuisine-types.sql` | Restore original cuisine types from backup if needed |

## 🚀 Quick Start Guide

### Step 1: Check Current State
Run this to see your current cuisine type distribution:
```sql
-- Run: verify-cuisine-types.sql
```

This will show:
- Total number of unique cuisine types
- Cuisine type distribution by count
- Orphaned cuisine types (only 1 restaurant)
- Top cuisine types

### Step 2: Create Backup
**CRITICAL:** Always backup before making changes!
```sql
-- Run: backup-cuisine-types.sql
```

This creates a `RestaurantsCuisineTypeBackup` table with original cuisine types.

### Step 3: Apply Consolidation
Run the main consolidation script:
```sql
-- Run: consolidate-cuisine-types.sql
```

This will update all restaurant cuisine types according to the mapping rules.

### Step 4: Verify Results
Check the new cuisine type distribution:
```sql
-- Run: verify-cuisine-types.sql
```

Compare with your pre-consolidation results.

### Step 5 (Optional): Rollback
If you need to restore original cuisine types:
```sql
-- Run: rollback-cuisine-types.sql
```

**Note:** Only works if you created a backup in Step 2!

## 📊 CuisineType Consolidation Mapping

The consolidation reduces cuisine types into these main groups:

### Food & Cuisine (25 types)
- **American** ← American, Canadian (New), Southern, Comfort Food, Soul Food
- **Breakfast & Brunch** ← Breakfast & Brunch, Pancakes, Waffles
- **Burgers & Fast Food** ← Burgers, Fast Food, Hot Dogs, Chicken Shop, Chicken Wings, Cheesesteaks
- **Pizza & Italian** ← Pizza, Italian
- **Mexican & Latin American** ← Mexican, Tex-Mex, Latin American, Cuban, Peruvian, Venezuelan, etc.
- **Chinese** ← Chinese, Cantonese, Dim Sum, Hong Kong Style Cafe, Hakka, Taiwanese
- **Japanese** ← Japanese, Sushi Bars, Ramen
- **Korean** ← Korean
- **Thai** ← Thai
- **Vietnamese** ← Vietnamese, Laotian, Cambodian
- **Indian & Pakistani** ← Indian, Pakistani, Himalayan/Nepalese, Sri Lankan
- **Middle Eastern** ← Middle Eastern, Lebanese, Persian/Iranian, Syrian, Turkish, Falafel, Kebab, etc.
- **Mediterranean** ← Mediterranean, Greek, Moroccan, Spanish, Portuguese
- **Asian Fusion** ← Asian Fusion, Pan Asian, Singaporean, Malaysian, Indonesian, Filipino, etc.
- **French & European** ← French, Belgian, Modern European, Bistros, Brasseries, Austrian, German, etc.
- **Steakhouses & BBQ** ← Steakhouses, Barbeque, Smokehouse
- **Seafood** ← Seafood, Fish & Chips
- **Sandwiches & Delis** ← Sandwiches, Delis, Delicatessen, Donairs, Bagels
- **Cafes & Coffee** ← Cafes, Coffee & Tea, Tea Rooms, Bubble Tea, Coffee Roasteries, etc.
- **Bakeries & Desserts** ← Bakeries, Patisserie, Desserts, Donuts, Ice Cream, Creperies, Custom Cakes, etc.
- **Bars & Pubs** ← Bars, Pubs, Irish Pub, Gastropubs, Brewpubs, Sports Bars, etc.
- **Vegetarian & Vegan** ← Vegetarian, Vegan, Salad, Live/Raw Food, Gluten-Free
- **Street Food & Casual** ← Food Trucks, Food Stands, Food Court, Poutineries, Diners
- **International & Other** ← Ethiopian, African, Caribbean, Hawaiian, Australian, South African, etc.
- **Specialty Dining** ← Buffets, Hot Pot, Tapas, Cajun/Creole, Soup

### Bars & Nightlife (5 types)
- **Cocktail Bars & Lounges** ← Cocktail Bars, Lounges, Speakeasies, Tiki Bars
- **Wine Bars** ← Wine Bars, Wine Tasting Room, Champagne Bars, Wineries
- **Beer & Breweries** ← Beer Bar, Breweries, Cideries, Beer Tours
- **Dance Clubs & Music Venues** ← Dance Clubs, Music Venues, Jazz & Blues, Karaoke, Cabaret, DJs
- **Specialty Bars** ← Whiskey Bars, Hookah Bars, Gay Bars

### Retail & Services (3 types)
- **Grocery & Markets** ← Grocery, International Grocery, Seafood Markets, Farmers Market, etc.
- **Specialty Food Shops** ← Specialty Food, Beer Wine & Spirits, Brewing Supplies, Caterers
- **Retail & Stores** ← Gift Shops, Hobby Shops, Tobacco Shops, Vinyl Records, etc.

### Entertainment & Activities (4 types)
- **Arts & Culture** ← Museums, Landmarks & Historical Buildings, Historical Tours, Art Classes
- **Entertainment** ← Arcades, Bowling, Golf, Escape Games, Tabletop Games
- **Parks & Recreation** ← Parks, Beaches, Aquariums
- **Events & Venues** ← Venues & Event Spaces, Festivals, Local Flavor

## 🎯 Expected Results

**Before Consolidation:**
- ~250+ unique cuisine types
- Many cuisine types with only 1-2 restaurants
- Inconsistent naming

**After Consolidation:**
- ~37 unique cuisine types
- More consistent groupings
- Better user experience in filters
- Easier to maintain

## ⚠️ Important Notes

1. **Always backup first!** Run `backup-cuisine-types.sql` before consolidation
2. **Test on development environment** before running on production
3. **Review the mappings** in `consolidate-cuisine-types.sql` - you may want to adjust some groupings
4. **Existing restaurants keep their data** - only the cuisine type field is updated
5. **New Yelp imports** will still use original Yelp cuisine types - you may want to update the Yelp service to map to consolidated cuisine types

## 🔧 Database Connection

To run these scripts, connect to your PostgreSQL database using:

### Option 1: psql Command Line
```bash
psql -h localhost -U your-username -d WhatToEat -f scripts/verify-cuisine-types.sql
psql -h localhost -U your-username -d WhatToEat -f scripts/backup-cuisine-types.sql
psql -h localhost -U your-username -d WhatToEat -f scripts/consolidate-cuisine-types.sql
psql -h localhost -U your-username -d WhatToEat -f scripts/verify-cuisine-types.sql
```

### Option 2: pgAdmin
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Navigate to your database
4. Open the Query Tool (Tools → Query Tool)
5. Open the script file (File → Open)
6. Click Execute/Run (F5)

### Option 3: DBeaver / DataGrip
1. Open your database IDE
2. Connect to your PostgreSQL database
3. Open the SQL script file
4. Execute the script

## 🔍 Customizing the Consolidation

If you want to adjust the cuisine type groupings:

1. Open `consolidate-cuisine-types.sql`
2. Find the UPDATE statement for the cuisine type you want to change
3. Modify the cuisine type name or the list of cuisine types being merged
4. Save and re-run the script

Example:
```sql
-- Change this:
UPDATE "Restaurants" SET "CuisineType" = 'Pizza & Italian'
WHERE "CuisineType" IN ('Pizza', 'Italian');

-- To keep them separate:
UPDATE "Restaurants" SET "CuisineType" = 'Pizza'
WHERE "CuisineType" IN ('Pizza');

UPDATE "Restaurants" SET "CuisineType" = 'Italian'
WHERE "CuisineType" IN ('Italian');
```

## 📞 Need Help?

If you encounter issues:
1. Check that you're connected to the correct PostgreSQL database
2. Verify you have UPDATE permissions on the "Restaurants" table
3. Ensure your user has necessary privileges: `GRANT UPDATE ON "Restaurants" TO your_username;`
4. Review the error message carefully
5. If needed, run the rollback script to restore original cuisine types

## 📝 Running Both Category and CuisineType Consolidation

If you want to consolidate both Category and CuisineType fields:

```bash
# 1. Verify current state of both
psql -h localhost -U your-username -d WhatToEat -f scripts/verify-categories.sql
psql -h localhost -U your-username -d WhatToEat -f scripts/verify-cuisine-types.sql

# 2. Backup both
psql -h localhost -U your-username -d WhatToEat -f scripts/backup-categories.sql
psql -h localhost -U your-username -d WhatToEat -f scripts/backup-cuisine-types.sql

# 3. Consolidate both
psql -h localhost -U your-username -d WhatToEat -f scripts/consolidate-categories.sql
psql -h localhost -U your-username -d WhatToEat -f scripts/consolidate-cuisine-types.sql

# 4. Verify both
psql -h localhost -U your-username -d WhatToEat -f scripts/verify-categories.sql
psql -h localhost -U your-username -d WhatToEat -f scripts/verify-cuisine-types.sql
```

## 📝 Next Steps

After consolidation, you may want to:
1. Update the Yelp service to map incoming cuisine types to your consolidated list
2. Update your frontend filters to show the new cuisine type structure
3. Add cuisine type icons or colors for better UX
4. Consider if you need both Category and CuisineType fields or if they should be merged
