# Supabase Setup Guide for Elfsod

## Step 1: Run the Schema

1. Go to your Supabase project dashboard
2. Click on the **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the contents of `supabase/updated_schema.sql`
5. Click **Run** to execute

This will create all the necessary tables:
- categories
- locations
- publishers
- ad_spaces
- quote_requests
- cart_items
- bookings

## Step 2: Seed the Data

1. In the SQL Editor, create another new query
2. Copy and paste the contents of `supabase/seed_data.sql`
3. Click **Run** to execute

This will populate your database with:
- 6 Categories (Billboard, Digital Screen, etc.)
- 7 Publishers (Times OOH, JCDecaux, etc.)
- 14 Locations across Mumbai, Bengaluru, and Delhi
- 15 Ad Spaces with realistic data

## Step 3: Verify the Data

Run these queries to verify:

```sql
-- Check categories
SELECT COUNT(*) FROM categories;
-- Should return 6

-- Check locations
SELECT COUNT(*) FROM locations;
-- Should return 14

-- Check publishers
SELECT COUNT(*) FROM publishers;
-- Should return 7

-- Check ad spaces with full details
SELECT 
  a.id,
  a.title,
  c.name as category,
  l.city,
  p.name as publisher,
  a.price_per_day,
  a.availability_status
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
LEFT JOIN publishers p ON a.publisher_id = p.id
ORDER BY a.created_at DESC;
-- Should return 15 ad spaces
```

## Step 4: Test the API

Your application should now fetch data from Supabase instead of using static data.

### Test Queries:

```sql
-- Get all available ad spaces in Mumbai
SELECT 
  a.*,
  l.city,
  l.address,
  c.name as category_name,
  p.name as publisher_name
FROM ad_spaces a
JOIN locations l ON a.location_id = l.id
JOIN categories c ON a.category_id = c.id
JOIN publishers p ON a.publisher_id = p.id
WHERE l.city = 'Mumbai'
AND a.availability_status = 'available';

-- Get ad spaces by price range
SELECT title, price_per_day, price_per_month
FROM ad_spaces
WHERE price_per_day BETWEEN 40000 AND 80000
ORDER BY price_per_day ASC;

-- Get all quote requests
SELECT 
  quote_request_id,
  user_email,
  total,
  status,
  created_at
FROM quote_requests
ORDER BY created_at DESC;
```

## Step 5: Environment Variables

Make sure your `.env.local` has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### Issue: Tables already exist
**Solution**: Drop existing tables first (be careful - this deletes all data):
```sql
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS quote_requests CASCADE;
DROP TABLE IF EXISTS ad_spaces CASCADE;
DROP TABLE IF EXISTS publishers CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
```

### Issue: Foreign key constraints
**Solution**: Make sure you run the schema script before the seed data script.

### Issue: RLS policies preventing access
**Solution**: The policies are set to allow public access for reading. If you still have issues:
```sql
-- Temporarily disable RLS for testing
ALTER TABLE ad_spaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE publishers DISABLE ROW LEVEL SECURITY;
```

## Next Steps

After setup:
1. Restart your Next.js development server
2. Visit the home page - it should now show ad spaces from Supabase
3. Test filtering by location and category
4. Test requesting a quote - it should save to the database
5. Check the `quote_requests` table in Supabase to verify

## Adding More Data

To add more ad spaces, locations, or publishers, use INSERT statements:

```sql
-- Add a new location
INSERT INTO locations (id, city, state, address, latitude, longitude) VALUES
('loc-pune-fc', 'Pune', 'Maharashtra', 'FC Road, Pune', 18.5204, 73.8567);

-- Add a new ad space
INSERT INTO ad_spaces (
  id, title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
) VALUES (
  '16',
  'Pune FC Road Display',
  'Popular shopping street in Pune',
  'd7e9f1a2-3c4b-5d6e-7f8g-9h0i1j2k3l4m',
  'loc-pune-fc',
  'a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p',
  'digital_screen',
  45000,
  1350000,
  6000,
  180000,
  'Young Shoppers',
  'available',
  18.5204,
  73.8567,
  '["https://example.com/image.jpg"]',
  '{"width": 1920, "height": 1080}'
);
```

