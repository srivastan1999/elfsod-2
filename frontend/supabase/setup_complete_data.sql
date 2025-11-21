-- ============================================
-- COMPLETE SETUP: Categories + Ad Spaces Mapping
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- PART 1: Create Categories
-- ============================================
-- First check if categories already exist, if not insert them
DO $$
BEGIN
  -- Billboards
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Billboards') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Billboards', 'Traditional and digital billboard advertising', NULL);
  END IF;
  
  -- Auto Rickshaw
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Auto Rickshaw Advertising') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Auto Rickshaw Advertising', 'Mobile advertising on auto rickshaws', NULL);
  END IF;
  
  -- Bus Shelter
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Bus Shelter Advertising') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Bus Shelter Advertising', 'Advertising at bus stops and shelters', NULL);
  END IF;
  
  -- Metro
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Metro Advertising') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Metro Advertising', 'Advertising in metro stations and trains', NULL);
  END IF;
  
  -- Digital Screens
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Digital Screens') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Digital Screens', 'LED and digital display advertising', NULL);
  END IF;
  
  -- Mall
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Mall Advertising') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Mall Advertising', 'Advertising in shopping malls and retail spaces', NULL);
  END IF;
  
  -- Cinema
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Cinema Advertising') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Cinema Advertising', 'Advertising in movie theaters and cinemas', NULL);
  END IF;
  
  -- Airport
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Airport Advertising') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Airport Advertising', 'Advertising at airports and terminals', NULL);
  END IF;
  
  -- Transit
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Transit Advertising') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Transit Advertising', 'General transit and transportation advertising', NULL);
  END IF;
  
  -- Corporate
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Corporate Advertising') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Corporate Advertising', 'Advertising in corporate offices and tech parks', NULL);
  END IF;
  
  -- Retail
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Retail Advertising') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Retail Advertising', 'Point-of-sale and retail space advertising', NULL);
  END IF;
  
  -- Event Venue
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Event Venue Advertising') THEN
    INSERT INTO categories (name, description, icon_url) VALUES ('Event Venue Advertising', 'Advertising at event spaces and venues', NULL);
  END IF;
END $$;

-- Verify categories created
SELECT 'Categories created:' as step, COUNT(*) as count FROM categories;

-- PART 2: Check existing ad_spaces
-- ============================================
SELECT 'Existing ad spaces:' as step, COUNT(*) as count FROM ad_spaces;

-- PART 3: Update existing ad_spaces to link with categories
-- ============================================
-- This will map any existing ad_spaces that have category_name to proper category_id

-- Update Billboards
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Billboards' LIMIT 1)
WHERE (
  category_name ILIKE '%billboard%' 
  OR title ILIKE '%billboard%'
  OR description ILIKE '%billboard%'
)
AND category_id IS NULL;

-- Update Auto Rickshaw
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Auto Rickshaw Advertising' LIMIT 1)
WHERE (
  category_name ILIKE '%auto%' 
  OR category_name ILIKE '%rickshaw%'
  OR title ILIKE '%auto%rickshaw%'
  OR title ILIKE '%rickshaw%'
)
AND category_id IS NULL;

-- Update Bus Shelter
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Bus Shelter Advertising' LIMIT 1)
WHERE (
  category_name ILIKE '%bus%shelter%' 
  OR title ILIKE '%bus%shelter%'
)
AND category_id IS NULL;

-- Update Metro/Transit
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Metro Advertising' LIMIT 1)
WHERE (
  category_name ILIKE '%metro%' 
  OR category_name ILIKE '%train%'
  OR title ILIKE '%metro%'
)
AND category_id IS NULL;

-- Update Digital Screens
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Digital Screens' LIMIT 1)
WHERE (
  category_name ILIKE '%digital%screen%' 
  OR category_name ILIKE '%LED%'
  OR title ILIKE '%digital%screen%'
  OR title ILIKE '%LED%'
  OR display_type = 'led_display'
  OR display_type = 'digital_screen'
)
AND category_id IS NULL;

-- Update Mall
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Mall Advertising' LIMIT 1)
WHERE (
  category_name ILIKE '%mall%' 
  OR title ILIKE '%mall%'
)
AND category_id IS NULL;

-- Update Cinema
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Cinema Advertising' LIMIT 1)
WHERE (
  category_name ILIKE '%cinema%' 
  OR category_name ILIKE '%movie%'
  OR title ILIKE '%cinema%'
  OR title ILIKE '%PVR%'
  OR title ILIKE '%INOX%'
)
AND category_id IS NULL;

-- Update Airport
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Airport Advertising' LIMIT 1)
WHERE (
  category_name ILIKE '%airport%' 
  OR title ILIKE '%airport%'
)
AND category_id IS NULL;

-- Update Transit (general)
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Transit Advertising' LIMIT 1)
WHERE (
  category_name ILIKE '%transit%' 
  OR display_type = 'transit_branding'
)
AND category_id IS NULL;

-- Update Corporate
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Corporate Advertising' LIMIT 1)
WHERE (
  category_name ILIKE '%corporate%' 
  OR category_name ILIKE '%office%'
  OR title ILIKE '%corporate%'
  OR title ILIKE '%tech%park%'
)
AND category_id IS NULL;

-- Update Retail
UPDATE ad_spaces 
SET category_id = (SELECT id FROM categories WHERE name = 'Retail Advertising' LIMIT 1)
WHERE (
  category_name ILIKE '%retail%' 
  OR category_name ILIKE '%pos%'
  OR title ILIKE '%retail%'
)
AND category_id IS NULL;

-- PART 4: Create locations if they don't exist
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Mumbai' AND address = 'Bandra Kurla Complex') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Mumbai', 'Maharashtra', 'India', 'Bandra Kurla Complex', 19.0760, 72.8777, '400051');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Mumbai' AND address = 'Andheri West') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Mumbai', 'Maharashtra', 'India', 'Andheri West', 19.1136, 72.8697, '400053');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Mumbai' AND address = 'Marine Drive') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Mumbai', 'Maharashtra', 'India', 'Marine Drive', 18.9432, 72.8236, '400020');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Mumbai' AND address = 'Kurla') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Mumbai', 'Maharashtra', 'India', 'Kurla', 19.0883, 72.8895, '400070');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Delhi' AND address = 'Connaught Place') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Delhi', 'Delhi', 'India', 'Connaught Place', 28.6315, 77.2167, '110001');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Delhi' AND address = 'Aerocity') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Delhi', 'Delhi', 'India', 'Aerocity', 28.5562, 77.1180, '110037');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Delhi' AND address = 'Mahipalpur') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Delhi', 'Delhi', 'India', 'Mahipalpur', 28.6139, 77.2090, '110037');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Delhi' AND address = 'Saket') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Delhi', 'Delhi', 'India', 'Saket', 28.5244, 77.2066, '110017');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Bengaluru' AND address = 'MG Road') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Bengaluru', 'Karnataka', 'India', 'MG Road', 12.9716, 77.5946, '560001');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Bengaluru' AND address = 'Whitefield') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Bengaluru', 'Karnataka', 'India', 'Whitefield', 12.9698, 77.7499, '560066');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Bengaluru' AND address = 'Indiranagar') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Bengaluru', 'Karnataka', 'India', 'Indiranagar', 12.9784, 77.6408, '560038');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Bengaluru' AND address = 'Koramangala') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Bengaluru', 'Karnataka', 'India', 'Koramangala', 12.9346, 77.6119, '560034');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Pune' AND address = 'Hinjewadi') THEN
    INSERT INTO locations (city, state, country, address, latitude, longitude, postal_code) 
    VALUES ('Pune', 'Maharashtra', 'India', 'Hinjewadi', 18.5912, 73.7340, '411057');
  END IF;
END $$;

-- PART 5: Create publisher if doesn't exist
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM publishers WHERE name = 'Elfsod Media') THEN
    INSERT INTO publishers (name, contact_email, contact_phone, verification_status)
    VALUES ('Elfsod Media', 'media@elfsod.com', '+91-9876543210', 'verified');
  END IF;
END $$;

-- PART 6: Verify the mapping
-- ============================================
SELECT 
  'Final Summary:' as report,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM ad_spaces) as total_ad_spaces,
  (SELECT COUNT(*) FROM ad_spaces WHERE category_id IS NOT NULL) as mapped_ad_spaces,
  (SELECT COUNT(*) FROM ad_spaces WHERE category_id IS NULL) as unmapped_ad_spaces;

-- Show ad spaces with their categories
SELECT 
  a.id,
  a.title,
  c.name as category,
  a.display_type,
  a.price_per_day
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
ORDER BY c.name, a.title
LIMIT 50;

-- Show category counts
SELECT 
  c.name as category,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN ad_spaces a ON a.category_id = c.id
GROUP BY c.id, c.name
ORDER BY ad_space_count DESC, c.name;

