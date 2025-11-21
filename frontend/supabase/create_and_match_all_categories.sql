-- ============================================
-- CREATE ALL CATEGORIES AND MATCH TO AD SPACES
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- STEP 1: Create all categories
-- ============================================
DO $$
BEGIN
  -- Billboards
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Billboards') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Billboards', 'Traditional and digital billboard advertising', NULL);
  END IF;
  
  -- Auto Rickshaw
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Auto Rickshaw Advertising') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Auto Rickshaw Advertising', 'Mobile advertising on auto rickshaws', NULL);
  END IF;
  
  -- Bus Shelter
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Bus Shelter Advertising') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Bus Shelter Advertising', 'Advertising at bus stops and shelters', NULL);
  END IF;
  
  -- Metro/Transit
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Metro Advertising') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Metro Advertising', 'Metro station and train advertising', NULL);
  END IF;
  
  -- Digital Screens
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Digital Screens') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Digital Screens', 'LED and digital display advertising', NULL);
  END IF;
  
  -- Mall
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Mall Advertising') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Mall Advertising', 'Shopping mall and retail advertising', NULL);
  END IF;
  
  -- Cinema
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Cinema Advertising') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Cinema Advertising', 'Movie theater and cinema advertising', NULL);
  END IF;
  
  -- Airport
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Airport Advertising') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Airport Advertising', 'Airport terminal advertising', NULL);
  END IF;
  
  -- Transit (general)
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Transit Advertising') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Transit Advertising', 'Public transportation advertising', NULL);
  END IF;
  
  -- Corporate
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Corporate Advertising') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Corporate Advertising', 'Corporate office and tech park advertising', NULL);
  END IF;
  
  -- Retail
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Retail Advertising') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Retail Advertising', 'Point-of-sale and retail advertising', NULL);
  END IF;
  
  -- Event Venue
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Event Venue Advertising') THEN
    INSERT INTO categories (name, description, icon_url) 
    VALUES ('Event Venue Advertising', 'Event space advertising', NULL);
  END IF;
END $$;

-- STEP 2: Match ad spaces to categories
-- ============================================

-- 1. Billboards (already done, but included for completeness)
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Billboards' LIMIT 1)
WHERE (
  title ILIKE '%billboard%'
  OR description ILIKE '%billboard%'
  OR display_type IN ('static_billboard', 'digital_billboard')
)
AND category_id IS NULL;

-- 2. Auto Rickshaw
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Auto Rickshaw Advertising' LIMIT 1)
WHERE (
  title ILIKE '%auto%rickshaw%'
  OR title ILIKE '%rickshaw%'
  OR title ILIKE '%auto%'
  OR description ILIKE '%auto%rickshaw%'
  OR description ILIKE '%rickshaw%'
)
AND category_id IS NULL;

-- 3. Bus Shelter
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Bus Shelter Advertising' LIMIT 1)
WHERE (
  title ILIKE '%bus%shelter%'
  OR title ILIKE '%bus%stop%'
  OR description ILIKE '%bus%shelter%'
)
AND category_id IS NULL;

-- 4. Metro/Train
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Metro Advertising' LIMIT 1)
WHERE (
  title ILIKE '%metro%'
  OR title ILIKE '%train%'
  OR title ILIKE '%subway%'
  OR description ILIKE '%metro%'
  OR description ILIKE '%train%'
)
AND category_id IS NULL;

-- 5. Digital Screens
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Digital Screens' LIMIT 1)
WHERE (
  title ILIKE '%digital%screen%'
  OR title ILIKE '%LED%screen%'
  OR title ILIKE '%LED%'
  OR display_type IN ('digital_screen', 'led_display')
  OR description ILIKE '%digital%display%'
  OR description ILIKE '%LED%'
)
AND category_id IS NULL;

-- 6. Mall
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Mall Advertising' LIMIT 1)
WHERE (
  title ILIKE '%mall%'
  OR title ILIKE '%shopping%center%'
  OR description ILIKE '%mall%'
  OR description ILIKE '%shopping%'
)
AND category_id IS NULL;

-- 7. Cinema
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Cinema Advertising' LIMIT 1)
WHERE (
  title ILIKE '%cinema%'
  OR title ILIKE '%movie%'
  OR title ILIKE '%theater%'
  OR title ILIKE '%PVR%'
  OR title ILIKE '%INOX%'
  OR title ILIKE '%multiplex%'
  OR description ILIKE '%cinema%'
  OR description ILIKE '%movie%'
)
AND category_id IS NULL;

-- 8. Airport
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Airport Advertising' LIMIT 1)
WHERE (
  title ILIKE '%airport%'
  OR title ILIKE '%terminal%'
  OR title ILIKE '%baggage%'
  OR description ILIKE '%airport%'
)
AND category_id IS NULL;

-- 9. Transit (catch remaining transit-related)
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Transit Advertising' LIMIT 1)
WHERE (
  display_type = 'transit_branding'
  OR title ILIKE '%transit%'
  OR description ILIKE '%transit%'
  OR description ILIKE '%transport%'
)
AND category_id IS NULL;

-- 10. Corporate
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Corporate Advertising' LIMIT 1)
WHERE (
  title ILIKE '%corporate%'
  OR title ILIKE '%office%'
  OR title ILIKE '%tech%park%'
  OR title ILIKE '%business%park%'
  OR description ILIKE '%corporate%'
  OR description ILIKE '%office%'
)
AND category_id IS NULL;

-- 11. Retail
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Retail Advertising' LIMIT 1)
WHERE (
  title ILIKE '%retail%'
  OR title ILIKE '%store%'
  OR title ILIKE '%shop%'
  OR title ILIKE '%POS%'
  OR title ILIKE '%point%of%sale%'
  OR description ILIKE '%retail%'
)
AND category_id IS NULL;

-- STEP 3: Show results
-- ============================================

-- Summary of all categories with counts
SELECT 
  '=== CATEGORY SUMMARY ===' as report;

SELECT 
  c.name as category,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN ad_spaces a ON a.category_id = c.id
GROUP BY c.id, c.name
ORDER BY ad_space_count DESC, c.name;

-- Show any unmapped ad spaces
SELECT 
  '=== UNMAPPED AD SPACES ===' as report;

SELECT 
  id,
  title,
  display_type,
  SUBSTRING(description, 1, 50) as description_preview
FROM ad_spaces
WHERE category_id IS NULL
LIMIT 20;

-- Overall summary
SELECT 
  '=== OVERALL SUMMARY ===' as report;

SELECT 
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM ad_spaces) as total_ad_spaces,
  (SELECT COUNT(*) FROM ad_spaces WHERE category_id IS NOT NULL) as categorized,
  (SELECT COUNT(*) FROM ad_spaces WHERE category_id IS NULL) as uncategorized;

-- Detailed view of all categorized ad spaces
SELECT 
  '=== CATEGORIZED AD SPACES ===' as report;

SELECT 
  c.name as category,
  a.title,
  a.display_type,
  l.city
FROM ad_spaces a
JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
ORDER BY c.name, a.title;

