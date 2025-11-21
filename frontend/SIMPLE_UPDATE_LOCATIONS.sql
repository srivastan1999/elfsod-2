-- ============================================
-- SIMPLE UPDATE: Add Locations to Retail & Commerce Ad Spaces
-- ============================================
-- Run this SQL directly in Supabase SQL Editor
-- This assigns Delhi, Mumbai, and Bengaluru locations to Retail & Commerce ad spaces

-- Step 1: Update Mall ad spaces (one by one to avoid ROW_NUMBER in UPDATE)
DO $$
DECLARE
  mall_cat_id UUID;
  restaurant_cat_id UUID;
  grocery_cat_id UUID;
  delhi_loc_id UUID;
  mumbai_loc_id UUID;
  bengaluru_loc_id UUID;
  space_record RECORD;
  counter INT := 0;
BEGIN
  -- Get category IDs
  SELECT id INTO mall_cat_id FROM categories WHERE name = 'Mall' LIMIT 1;
  SELECT id INTO restaurant_cat_id FROM categories WHERE name = 'Restaurant' LIMIT 1;
  SELECT id INTO grocery_cat_id FROM categories WHERE name = 'Grocery Store' LIMIT 1;
  
  -- Get location IDs
  SELECT id INTO delhi_loc_id FROM locations WHERE city = 'Delhi' LIMIT 1;
  SELECT id INTO mumbai_loc_id FROM locations WHERE city = 'Mumbai' LIMIT 1;
  SELECT id INTO bengaluru_loc_id FROM locations WHERE city = 'Bengaluru' LIMIT 1;
  
  RAISE NOTICE 'Category IDs: Mall=%, Restaurant=%, Grocery=%', mall_cat_id, restaurant_cat_id, grocery_cat_id;
  RAISE NOTICE 'Location IDs: Delhi=%, Mumbai=%, Bengaluru=%', delhi_loc_id, mumbai_loc_id, bengaluru_loc_id;
  
  -- Update Mall ad spaces
  counter := 0;
  FOR space_record IN 
    SELECT id FROM ad_spaces 
    WHERE category_id = mall_cat_id 
    ORDER BY created_at
  LOOP
    UPDATE ad_spaces
    SET location_id = CASE
      WHEN counter % 3 = 0 THEN delhi_loc_id
      WHEN counter % 3 = 1 THEN mumbai_loc_id
      ELSE bengaluru_loc_id
    END
    WHERE id = space_record.id;
    
    counter := counter + 1;
  END LOOP;
  RAISE NOTICE 'Updated % Mall ad spaces', counter;
  
  -- Update Restaurant ad spaces
  counter := 0;
  FOR space_record IN 
    SELECT id FROM ad_spaces 
    WHERE category_id = restaurant_cat_id 
    ORDER BY created_at
  LOOP
    UPDATE ad_spaces
    SET location_id = CASE
      WHEN counter % 3 = 0 THEN delhi_loc_id
      WHEN counter % 3 = 1 THEN mumbai_loc_id
      ELSE bengaluru_loc_id
    END
    WHERE id = space_record.id;
    
    counter := counter + 1;
  END LOOP;
  RAISE NOTICE 'Updated % Restaurant ad spaces', counter;
  
  -- Update Grocery Store ad spaces
  counter := 0;
  FOR space_record IN 
    SELECT id FROM ad_spaces 
    WHERE category_id = grocery_cat_id 
    ORDER BY created_at
  LOOP
    UPDATE ad_spaces
    SET location_id = CASE
      WHEN counter % 3 = 0 THEN delhi_loc_id
      WHEN counter % 3 = 1 THEN mumbai_loc_id
      ELSE bengaluru_loc_id
    END
    WHERE id = space_record.id;
    
    counter := counter + 1;
  END LOOP;
  RAISE NOTICE 'Updated % Grocery Store ad spaces', counter;
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

