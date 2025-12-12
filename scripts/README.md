# Category Consolidation Scripts (PostgreSQL)

This directory contains PostgreSQL scripts to consolidate your restaurant categories from 250+ categories down to approximately 35 main categories.

## 📋 Scripts Overview

| Script | Purpose |
|--------|---------|
| `verify-categories.sql` | View current category distribution and statistics |
| `backup-categories.sql` | Create a backup of current categories before consolidation |
| `consolidate-categories.sql` | Apply the category consolidation mappings |
| `rollback-categories.sql` | Restore original categories from backup if needed |

## 🚀 Quick Start Guide

### Step 1: Check Current State
Run this to see your current category distribution:
```sql
-- Run: verify-categories.sql
```

This will show:
- Total number of unique categories
- Category distribution by count
- Orphaned categories (only 1 restaurant)
- Top categories

### Step 2: Create Backup
**CRITICAL:** Always backup before making changes!
```sql
-- Run: backup-categories.sql
```

This creates a `RestaurantsCategoryBackup` table with original categories.

### Step 3: Apply Consolidation
Run the main consolidation script:
```sql
-- Run: consolidate-categories.sql
```

This will update all restaurant categories according to the mapping rules.

### Step 4: Verify Results
Check the new category distribution:
```sql
-- Run: verify-categories.sql
```

Compare with your pre-consolidation results.

### Step 5 (Optional): Rollback
If you need to restore original categories:
```sql
-- Run: rollback-categories.sql
```

**Note:** Only works if you created a backup in Step 2!

## 📊 Category Consolidation Mapping

The consolidation reduces categories into these main groups:

### Food & Cuisine (25 categories)
- **American** ← American, New American, Southern, Comfort Food
- **Breakfast & Brunch** ← Breakfast & Brunch, Pancakes, Waffles
- **Burgers & Fast Food** ← Burgers, Fast Food, Hot Dogs, Chicken Shop, Chicken Wings
- **Pizza & Italian** ← Pizza, Italian
- **Mexican & Latin American** ← Mexican, Tex-Mex, Latin American, Cuban, Peruvian, Venezuelan, etc.
- **Chinese** ← Chinese, Cantonese, Dim Sum, Hong Kong Style Cafe, Hakka, Taiwanese
- **Japanese** ← Japanese, Sushi Bars, Ramen
- **Korean** ← Korean
- **Thai** ← Thai
- **Vietnamese** ← Vietnamese, Laotian, Cambodian
- **Indian & Pakistani** ← Indian, Pakistani, Himalayan/Nepalese
- **Middle Eastern** ← Middle Eastern, Lebanese, Persian/Iranian, Syrian, Turkish, Falafel, etc.
- **Mediterranean** ← Mediterranean, Greek, Moroccan, Spanish, Portuguese
- **Asian Fusion** ← Asian Fusion, Pan Asian, Singaporean, Malaysian, Indonesian, Filipino, etc.
- **French & European** ← French, Belgian, Modern European, Bistros, Austrian, German, etc.
- **Steakhouses & BBQ** ← Steakhouses, Barbeque, Smokehouse
- **Seafood** ← Seafood, Fish & Chips
- **Sandwiches & Delis** ← Sandwiches, Delis, Delicatessen, Donairs, Bagels
- **Cafes & Coffee** ← Cafes, Coffee & Tea, Tea Rooms, Bubble Tea, Juice Bars, etc.
- **Bakeries & Desserts** ← Bakeries, Patisserie, Desserts, Donuts, Ice Cream, Creperies
- **Bars & Pubs** ← Bars, Pubs, Irish Pub, Gastropubs, Brewpubs, Sports Bars, etc.
- **Vegetarian & Vegan** ← Vegetarian, Vegan, Salad, Live/Raw Food, Gluten-Free
- **Street Food & Casual** ← Food Trucks, Food Stands, Food Court, Poutineries, Diners
- **International & Other** ← Ethiopian, African, Caribbean, Hawaiian, Australian, etc.
- **Specialty Dining** ← Buffets, Hot Pot, Tapas, Cajun/Creole, Soup

### Bars & Nightlife (5 categories)
- **Cocktail Bars & Lounges** ← Cocktail Bars, Lounges, Speakeasies, Tiki Bars
- **Wine Bars** ← Wine Bars, Wine Tasting Room, Champagne Bars, Wineries
- **Beer & Breweries** ← Beer Bar, Breweries, Cideries
- **Dance Clubs & Music Venues** ← Dance Clubs, Music Venues, Jazz & Blues
- **Specialty Bars** ← Whiskey Bars, Hookah Bars, Gay Bars

### Retail & Services (3 categories)
- **Grocery & Markets** ← Grocery, International Grocery, Seafood Markets, Butcher, etc.
- **Specialty Food Shops** ← Specialty Food, Beer Wine & Spirits, Brewing Supplies
- **Retail & Stores** ← Bookstores, Candle Stores, Video Game Stores

### Entertainment & Activities (4 categories)
- **Arts & Culture** ← Museums, Art Galleries, Landmarks & Historical Buildings
- **Entertainment** ← Arcades, Bowling, Golf
- **Parks & Recreation** ← Parks, Dog Parks, Aquariums
- **Events & Venues** ← Venues & Event Spaces, Festivals, Hotels, Team Building

## 🎯 Expected Results

**Before Consolidation:**
- ~250+ unique categories
- Many categories with only 1-2 restaurants
- Inconsistent naming (e.g., "Mexican" vs "Tacos")

**After Consolidation:**
- ~37 unique categories
- More consistent groupings
- Better user experience in filters
- Easier to maintain

## ⚠️ Important Notes

1. **Always backup first!** Run `backup-categories.sql` before consolidation
2. **Test on development environment** before running on production
3. **Review the mappings** in `consolidate-categories.sql` - you may want to adjust some groupings
4. **Existing restaurants keep their data** - only the category field is updated
5. **New Yelp imports** will still use original Yelp categories - you may want to update the Yelp service to map to consolidated categories

## 🔧 Database Connection

To run these scripts, connect to your PostgreSQL database using:

### Option 1: psql Command Line
```bash
psql -h localhost -U your-username -d WhatToEat -f scripts/verify-categories.sql
psql -h localhost -U your-username -d WhatToEat -f scripts/backup-categories.sql
psql -h localhost -U your-username -d WhatToEat -f scripts/consolidate-categories.sql
psql -h localhost -U your-username -d WhatToEat -f scripts/verify-categories.sql
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

If you want to adjust the category groupings:

1. Open `consolidate-categories.sql`
2. Find the UPDATE statement for the category you want to change
3. Modify the category name or the list of categories being merged
4. Save and re-run the script

Example:
```sql
-- Change this:
UPDATE "Restaurants" SET "Category" = 'Pizza & Italian'
WHERE "Category" IN ('Pizza', 'Italian');

-- To keep them separate:
UPDATE "Restaurants" SET "Category" = 'Pizza'
WHERE "Category" IN ('Pizza');

UPDATE "Restaurants" SET "Category" = 'Italian'
WHERE "Category" IN ('Italian');
```

## 📞 Need Help?

If you encounter issues:
1. Check that you're connected to the correct PostgreSQL database
2. Verify you have UPDATE permissions on the "Restaurants" table
3. Ensure your user has necessary privileges: `GRANT UPDATE ON "Restaurants" TO your_username;`
4. Review the error message carefully
5. If needed, run the rollback script to restore original categories

## 📝 Next Steps

After consolidation, you may want to:
1. Update the Yelp service to map incoming categories to your consolidated list
2. Update your frontend filters to show the new category structure
3. Add category icons or colors for better UX
4. Create a category hierarchy system for subcategories
