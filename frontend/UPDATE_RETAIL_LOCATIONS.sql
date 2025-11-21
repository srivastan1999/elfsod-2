-- ============================================
-- UPDATE: Add Locations to Retail & Commerce Ad Spaces
-- ============================================
-- Run this SQL directly in Supabase SQL Editor
-- This bypasses RLS policies that might be blocking API updates

-- Get the location IDs for Delhi, Mumbai, and Bengaluru
WITH city_locations AS (
  SELECT 
    id,
    city,
    ROW_NUMBER() OVER (PARTITION BY city ORDER BY created_at) as rn
  FROM locations
  WHERE city IN ('Delhi', 'Mumbai', 'Bengaluru')
),
selected_locations AS (
  SELECT id, city 
  FROM city_locations 
  WHERE rn = 1
)

-- Update Mall ad spaces
UPDATE ad_spaces
SET location_id = (
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 3 = 1 THEN (SELECT id FROM selected_locations WHERE city = 'Delhi')
    WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 3 = 2 THEN (SELECT id FROM selected_locations WHERE city = 'Mumbai')
    ELSE (SELECT id FROM selected_locations WHERE city = 'Bengaluru')
  END
)
WHERE category_id = (SELECT id FROM categories WHERE name = 'Mall' LIMIT 1)
  AND location_id IS NULL;

-- Update Restaurant ad spaces
UPDATE ad_spaces
SET location_id = (
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 3 = 1 THEN (SELECT id FROM selected_locations WHERE city = 'Delhi')
    WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 3 = 2 THEN (SELECT id FROM selected_locations WHERE city = 'Mumbai')
    ELSE (SELECT id FROM selected_locations WHERE city = 'Bengaluru')
  END
)
WHERE category_id = (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1)
  AND location_id IS NULL;

-- Update Grocery Store ad spaces
UPDATE ad_spaces
SET location_id = (
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 3 = 1 THEN (SELECT id FROM selected_locations WHERE city = 'Delhi')
    WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 3 = 2 THEN (SELECT id FROM selected_locations WHERE city = 'Mumbai')
    ELSE (SELECT id FROM selected_locations WHERE city = 'Bengaluru')
  END
)
WHERE category_id = (SELECT id FROM categories WHERE name = 'Grocery Store' LIMIT 1)
  AND location_id IS NULL;

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

