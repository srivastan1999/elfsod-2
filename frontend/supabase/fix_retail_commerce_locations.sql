-- ============================================
-- FIX: Add Location Data to Retail & Commerce Ad Spaces
-- ============================================
-- Problem: Retail & Commerce ad spaces (Mall, Restaurant, Grocery Store) have no location data
-- Solution: Assign cities to these ad spaces

-- Step 1: Get all locations to reference
-- You can run: SELECT id, city FROM locations;

-- Step 2: Update Retail & Commerce ad spaces with locations
-- We'll distribute them across Delhi, Mumbai, and Bengaluru

-- Get the category IDs first
DO $$
DECLARE
  mall_cat_id UUID;
  restaurant_cat_id UUID;
  grocery_cat_id UUID;
  delhi_location_id UUID;
  mumbai_location_id UUID;
  bengaluru_location_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO mall_cat_id FROM categories WHERE name = 'Mall' LIMIT 1;
  SELECT id INTO restaurant_cat_id FROM categories WHERE name = 'Restaurant' LIMIT 1;
  SELECT id INTO grocery_cat_id FROM categories WHERE name = 'Grocery Store' LIMIT 1;
  
  -- Get or create locations for Delhi, Mumbai, Bengaluru
  -- Check if locations exist
  SELECT id INTO delhi_location_id FROM locations WHERE city = 'Delhi' LIMIT 1;
  SELECT id INTO mumbai_location_id FROM locations WHERE city = 'Mumbai' LIMIT 1;
  SELECT id INTO bengaluru_location_id FROM locations WHERE city = 'Bengaluru' LIMIT 1;
  
  -- If locations don't exist, create them
  IF delhi_location_id IS NULL THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude)
    VALUES ('Delhi', 'Delhi', 'India', 'Connaught Place, New Delhi', 28.6139, 77.2090)
    RETURNING id INTO delhi_location_id;
  END IF;
  
  IF mumbai_location_id IS NULL THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude)
    VALUES ('Mumbai', 'Maharashtra', 'India', 'Bandra West, Mumbai', 19.0596, 72.8295)
    RETURNING id INTO mumbai_location_id;
  END IF;
  
  IF bengaluru_location_id IS NULL THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude)
    VALUES ('Bengaluru', 'Karnataka', 'India', 'MG Road, Bengaluru', 12.9716, 77.5946)
    RETURNING id INTO bengaluru_location_id;
  END IF;
  
  -- Update Mall ad spaces (distribute across cities)
  WITH mall_spaces AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM ad_spaces
    WHERE category_id = mall_cat_id AND location_id IS NULL
  )
  UPDATE ad_spaces
  SET location_id = CASE 
    WHEN ms.rn % 3 = 1 THEN delhi_location_id
    WHEN ms.rn % 3 = 2 THEN mumbai_location_id
    ELSE bengaluru_location_id
  END
  FROM mall_spaces ms
  WHERE ad_spaces.id = ms.id;
  
  -- Update Restaurant ad spaces (distribute across cities)
  WITH restaurant_spaces AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM ad_spaces
    WHERE category_id = restaurant_cat_id AND location_id IS NULL
  )
  UPDATE ad_spaces
  SET location_id = CASE 
    WHEN rs.rn % 3 = 1 THEN delhi_location_id
    WHEN rs.rn % 3 = 2 THEN mumbai_location_id
    ELSE bengaluru_location_id
  END
  FROM restaurant_spaces rs
  WHERE ad_spaces.id = rs.id;
  
  -- Update Grocery Store ad spaces (distribute across cities)
  WITH grocery_spaces AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM ad_spaces
    WHERE category_id = grocery_cat_id AND location_id IS NULL
  )
  UPDATE ad_spaces
  SET location_id = CASE 
    WHEN gs.rn % 3 = 1 THEN delhi_location_id
    WHEN gs.rn % 3 = 2 THEN mumbai_location_id
    ELSE bengaluru_location_id
  END
  FROM grocery_spaces gs
  WHERE ad_spaces.id = gs.id;
  
  RAISE NOTICE 'Updated Retail & Commerce ad spaces with location data';
END $$;

-- Verify the update
SELECT 
  c.name as category,
  l.city,
  COUNT(*) as count
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.name IN ('Mall', 'Restaurant', 'Grocery Store')
GROUP BY c.name, l.city
ORDER BY c.name, l.city;

