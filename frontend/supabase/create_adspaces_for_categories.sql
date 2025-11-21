-- ============================================
-- CREATE AD SPACES FOR ALL CATEGORIES
-- Run this in Supabase SQL Editor
-- ============================================

-- Get category IDs (verify these match your database)
-- SELECT id, name FROM categories ORDER BY name;

-- Get a publisher ID (use existing one)
-- SELECT id FROM publishers LIMIT 1;

-- Get a location ID (use existing one)
-- SELECT id FROM locations LIMIT 1;

-- ============================================
-- CORPORATE - 2 ad spaces
-- ============================================
INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Corporate Office Lobby Display',
  'Premium digital display in corporate office lobby. Perfect for B2B campaigns targeting professionals.',
  (SELECT id FROM categories WHERE name = 'Corporate' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'digital_screen',
  45000,
  1350000,
  3000,
  90000,
  19.0760,
  72.8777,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Corporate');

INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Tech Park Entrance Billboard',
  'High visibility billboard at tech park entrance. Ideal for IT and corporate brands.',
  (SELECT id FROM categories WHERE name = 'Corporate' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'static_billboard',
  55000,
  1650000,
  5000,
  150000,
  12.9716,
  77.5946,
  '[]'::jsonb,
  '{"width": 2400, "height": 1200}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Corporate');

-- ============================================
-- EVENT VENUE - 2 ad spaces
-- ============================================
INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Convention Center Main Hall',
  'Large format display in convention center main hall. Perfect for event sponsorships.',
  (SELECT id FROM categories WHERE name = 'Event Venue' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'led_display',
  75000,
  2250000,
  8000,
  240000,
  28.6139,
  77.2090,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Event Venue');

INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Exhibition Hall Entrance',
  'Premium location at exhibition hall entrance. High footfall during events.',
  (SELECT id FROM categories WHERE name = 'Event Venue' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'digital_screen',
  65000,
  1950000,
  7000,
  210000,
  19.0760,
  72.8777,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Event Venue');

-- ============================================
-- GROCERY STORE - 2 ad spaces
-- ============================================
INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Supermarket Entrance Display',
  'Digital screen at supermarket entrance. Perfect for FMCG and retail brands.',
  (SELECT id FROM categories WHERE name = 'Grocery Store' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'digital_screen',
  35000,
  1050000,
  6000,
  180000,
  12.9716,
  77.5946,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Grocery Store');

INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Grocery Store Checkout Counter',
  'Point of sale display at checkout. High visibility for impulse purchases.',
  (SELECT id FROM categories WHERE name = 'Grocery Store' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'backlit_panel',
  25000,
  750000,
  4000,
  120000,
  19.0760,
  72.8777,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Grocery Store');

-- ============================================
-- HOTEL - 2 ad spaces
-- ============================================
INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Hotel Lobby Premium Display',
  'Elegant digital display in hotel lobby. Targets affluent travelers and business guests.',
  (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'digital_screen',
  60000,
  1800000,
  4500,
  135000,
  19.0760,
  72.8777,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Hotel');

INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Hotel Restaurant Entrance',
  'Display at hotel restaurant entrance. Perfect for luxury and lifestyle brands.',
  (SELECT id FROM categories WHERE name = 'Hotel' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'backlit_panel',
  40000,
  1200000,
  3500,
  105000,
  28.6139,
  77.2090,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Hotel');

-- ============================================
-- MALL - 2 ad spaces
-- ============================================
INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Shopping Mall Food Court',
  'High-traffic digital screen in mall food court. Excellent for food and beverage brands.',
  (SELECT id FROM categories WHERE name = 'Mall' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'digital_screen',
  70000,
  2100000,
  12000,
  360000,
  12.9716,
  77.5946,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Mall');

INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Mall Entrance Billboard',
  'Premium billboard at main mall entrance. Maximum visibility for retail campaigns.',
  (SELECT id FROM categories WHERE name = 'Mall' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'static_billboard',
  80000,
  2400000,
  15000,
  450000,
  19.0760,
  72.8777,
  '[]'::jsonb,
  '{"width": 2400, "height": 1200}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Mall');

-- ============================================
-- METRO - 2 ad spaces
-- ============================================
INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Metro Station Platform Display',
  'Digital display on metro platform. High visibility for commuters.',
  (SELECT id FROM categories WHERE name = 'Metro' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'led_display',
  55000,
  1650000,
  20000,
  600000,
  28.6139,
  77.2090,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Metro');

INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Metro Station Entrance',
  'Billboard at metro station entrance. Perfect for mass-market campaigns.',
  (SELECT id FROM categories WHERE name = 'Metro' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'static_billboard',
  50000,
  1500000,
  18000,
  540000,
  19.0760,
  72.8777,
  '[]'::jsonb,
  '{"width": 2400, "height": 1200}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Metro');

-- ============================================
-- OFFICE TOWER - 2 ad spaces
-- ============================================
INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Office Building Elevator Display',
  'Digital screen in office building elevators. Targets working professionals daily.',
  (SELECT id FROM categories WHERE name = 'Office Tower' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'digital_screen',
  40000,
  1200000,
  5000,
  150000,
  19.0760,
  72.8777,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Office Tower');

INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Business District Office Tower',
  'Premium location in business district. Ideal for corporate and B2B advertising.',
  (SELECT id FROM categories WHERE name = 'Office Tower' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'static_billboard',
  60000,
  1800000,
  8000,
  240000,
  12.9716,
  77.5946,
  '[]'::jsonb,
  '{"width": 2400, "height": 1200}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Office Tower');

-- ============================================
-- RESTAURANT - 2 ad spaces
-- ============================================
INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Fine Dining Restaurant Display',
  'Elegant display in fine dining restaurant. Perfect for premium brands.',
  (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'backlit_panel',
  30000,
  900000,
  2500,
  75000,
  12.9716,
  77.5946,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Restaurant');

INSERT INTO ad_spaces (
  title, description, category_id, publisher_id,
  display_type, price_per_day, price_per_month, 
  daily_impressions, monthly_footfall,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Cafe Counter Display',
  'Digital screen at cafe counter. Great for food and beverage advertising.',
  (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1),
  (SELECT id FROM publishers LIMIT 1),
  'digital_screen',
  25000,
  750000,
  3000,
  90000,
  19.0760,
  72.8777,
  '[]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb,
  'available'
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Restaurant');

-- ============================================
-- VERIFY CREATED AD SPACES
-- ============================================
SELECT 
  c.name as category_name,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
WHERE c.name IN ('Corporate', 'Event Venue', 'Grocery Store', 'Hotel', 'Mall', 'Metro', 'Office Tower', 'Restaurant')
GROUP BY c.id, c.name
ORDER BY c.name;

