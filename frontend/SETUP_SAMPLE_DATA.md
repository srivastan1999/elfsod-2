# Setup Sample Data for Elfsod

Follow these steps in order to populate your database with sample data.

## Step 1: Create Categories

Categories must be created first before ad spaces.

1. Open **Supabase Dashboard** → **SQL Editor**
2. Run the file: `supabase/create_categories.sql`

This will create 12 categories:
- 📢 Billboards
- 🛺 Auto Rickshaw Advertising
- 🚌 Bus Shelter Advertising
- 🚇 Metro Advertising
- 📺 Digital Screens
- 🏬 Mall Advertising
- 🎬 Cinema Advertising
- ✈️ Airport Advertising
- 🚂 Transit Advertising
- 🏢 Corporate Advertising
- 🛒 Retail Advertising
- 🎪 Event Venue Advertising

## Step 2: Create Sample Ad Spaces

After categories are created, create ad spaces.

1. In **Supabase SQL Editor**
2. Run the file: `supabase/create_sample_adspaces.sql`

This will create:
- 18 locations across Mumbai, Delhi, Bengaluru, Pune
- 1 publisher (Elfsod Admin)
- 18 ad spaces across all categories

## Step 3: Verify Data

Check that everything was created successfully:

```sql
-- Check categories
SELECT COUNT(*) as category_count FROM categories;

-- Check locations
SELECT COUNT(*) as location_count FROM locations;

-- Check ad spaces
SELECT COUNT(*) as adspace_count FROM ad_spaces;

-- View ad spaces with details
SELECT 
  a.title,
  l.city,
  c.name as category,
  a.price_per_day,
  a.availability_status
FROM ad_spaces a
LEFT JOIN locations l ON a.location_id = l.id
LEFT JOIN categories c ON a.category_id = c.id
ORDER BY a.created_at DESC;
```

## Step 4: Test the Website

1. Go to `http://localhost:3000`
2. You should see:
   - Categories grid with emojis and counts
   - Click categories to filter ad spaces
   - 18 ad space cards displayed

## Step 5: Test Admin Dashboard

1. Go to `http://localhost:3000/admin`
2. You should see:
   - Stats dashboard with counts
   - Table with all 18 ad spaces
   - Search and filter functionality
   - Create/Edit/Delete buttons

## Troubleshooting

### Categories not showing up?
- Check browser console for errors
- Verify categories exist: `SELECT * FROM categories;`
- Check API route: `http://localhost:3000/api/categories`

### Ad spaces not showing up?
- Verify foreign keys are correct
- Check that `category_id` and `location_id` match existing records
- Run: `SELECT * FROM ad_spaces WHERE category_id IS NULL;` (should return nothing)

### Images not loading?
- The sample data uses Unsplash URLs
- If images don't load, update `image_url` in ad_spaces table

## Sample Data Summary

**Total Records Created:**
- 12 Categories
- 18 Locations
- 1 Publisher
- 18 Ad Spaces

**Categories Coverage:**
- 3 Billboards
- 3 Auto Rickshaw
- 2 Bus Shelter
- 2 Metro
- 2 Digital Screens
- 2 Mall
- 2 Cinema
- 2 Airport

**Cities Covered:**
- Mumbai (7 locations)
- Delhi (7 locations)
- Bengaluru (3 locations)
- Pune (1 location)

## Next Steps

After verifying sample data:
1. Test filtering by category
2. Test filtering by location
3. Test search functionality
4. Test admin CRUD operations
5. Add more ad spaces using admin dashboard

