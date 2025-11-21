-- ============================================
-- CREATE SAMPLE AD SPACES FOR ELFSOD
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create locations
INSERT INTO locations (city, state, country, address, latitude, longitude) VALUES
('Bengaluru', 'Karnataka', 'India', 'MG Road, Near Trinity Metro Station', 12.9716, 77.5946),
('Delhi', 'Delhi', 'India', 'Mahipalpur, NH8 Highway', 28.6139, 77.2090),
('Mumbai', 'Maharashtra', 'India', 'Bandra Kurla Complex, BKC Main Road', 19.0760, 72.8777),
('Mumbai', 'Maharashtra', 'India', 'Andheri West Zone', 19.1136, 72.8697),
('Bengaluru', 'Karnataka', 'India', 'Whitefield, Tech Park Area', 12.9698, 77.7499),
('Delhi', 'Delhi', 'India', 'Aerocity, Airport Express Route', 28.5562, 77.1180),
('Delhi', 'Delhi', 'India', 'Connaught Place, CP Metro Station', 28.6315, 77.2167),
('Mumbai', 'Maharashtra', 'India', 'Marine Drive, Near Oberoi Hotel', 18.9432, 72.8236),
('Delhi', 'Delhi', 'India', 'Connaught Place, Rajiv Chowk Metro', 28.6328, 77.2197),
('Delhi', 'Delhi', 'India', 'Blue Line Metro - All Stations', 28.6692, 77.2143),
('Bengaluru', 'Karnataka', 'India', 'Indiranagar, Garuda Mall', 12.9784, 77.6408),
('Pune', 'Maharashtra', 'India', 'Hinjewadi, Tech Park Phase 1', 18.5912, 73.7340),
('Mumbai', 'Maharashtra', 'India', 'Kurla, Phoenix Market City Mall', 19.0883, 72.8895),
('Bengaluru', 'Karnataka', 'India', 'Koramangala, Forum Mall', 12.9346, 77.6119),
('Mumbai', 'Maharashtra', 'India', 'Andheri, INOX R City Mall', 19.1072, 72.8707),
('Delhi', 'Delhi', 'India', 'Saket, PVR Select City Walk', 28.5244, 77.2066),
('Mumbai', 'Maharashtra', 'India', 'Andheri East, Mumbai Airport T2', 19.0896, 72.8656),
('Bengaluru', 'Karnataka', 'India', 'Devanahalli, Kempegowda Airport', 13.1986, 77.7066);

-- Step 2: Create publisher if doesn't exist
INSERT INTO publishers (name, contact_email, contact_phone, verification_status)
VALUES ('Elfsod Admin', 'admin@elfsod.com', '+91-9876543210', 'verified')
ON CONFLICT DO NOTHING;

-- Step 3: Insert ad spaces
-- Billboard 1 - MG Road, Bengaluru
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Premium Billboard - MG Road',
  'High-visibility billboard on MG Road, Bengaluru. Perfect for brand awareness campaigns.',
  (SELECT id FROM categories WHERE name ILIKE '%billboard%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Bengaluru' AND address LIKE '%MG Road%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'static_billboard',
  8000,
  240000,
  50000,
  12.9716,
  77.5946,
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'::jsonb,
  '{"width": 20, "height": 10, "unit": "ft"}'::jsonb,
  'available';

-- Billboard 2 - NH8, Delhi
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Highway Billboard - NH8',
  'Prime highway billboard on NH8, Delhi. Massive reach for highway traffic.',
  (SELECT id FROM categories WHERE name ILIKE '%billboard%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Delhi' AND address LIKE '%NH8%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'static_billboard',
  12000,
  360000,
  80000,
  28.6139,
  77.2090,
  '["https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800"]'::jsonb,
  '{"width": 30, "height": 15, "unit": "ft"}'::jsonb,
  'available';

-- Billboard 3 - BKC, Mumbai
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Digital Billboard - BKC',
  'Premium digital billboard at Bandra Kurla Complex. High footfall business district.',
  (SELECT id FROM categories WHERE name ILIKE '%billboard%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Mumbai' AND address LIKE '%BKC%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'digital_screen',
  15000,
  450000,
  100000,
  19.0760,
  72.8777,
  '["https://images.unsplash.com/photo-1551039899-8c89f27e9b7c?w=800"]'::jsonb,
  '{"width": 25, "height": 12, "unit": "ft"}'::jsonb,
  'available';

-- Auto Rickshaw 1 - Mumbai
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Auto Rickshaw Branding - Premium Fleet',
  'Full auto rickshaw branding in Andheri, Mumbai. Premium fleet with high visibility.',
  (SELECT id FROM categories WHERE name ILIKE '%auto%rickshaw%' OR name ILIKE '%transit%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Mumbai' AND address LIKE '%Andheri%West%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'transit_branding',
  2000,
  60000,
  15000,
  19.1136,
  72.8697,
  '["https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800"]'::jsonb,
  '{"width": 4, "height": 3, "unit": "ft"}'::jsonb,
  'available';

-- Auto Rickshaw 2 - Bengaluru
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Auto Rickshaw Back Panel - Tech Park Route',
  'Back panel advertising on auto rickshaws serving tech park areas in Whitefield.',
  (SELECT id FROM categories WHERE name ILIKE '%auto%rickshaw%' OR name ILIKE '%transit%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Bengaluru' AND address LIKE '%Whitefield%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'transit_branding',
  1500,
  45000,
  12000,
  12.9698,
  77.7499,
  '["https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800"]'::jsonb,
  '{"width": 3, "height": 2, "unit": "ft"}'::jsonb,
  'available';

-- Auto Rickshaw 3 - Delhi Airport Route
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Auto Rickshaw Hood - Airport Route',
  'Hood branding on autos plying airport express route. Premium visibility.',
  (SELECT id FROM categories WHERE name ILIKE '%auto%rickshaw%' OR name ILIKE '%transit%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Delhi' AND address LIKE '%Aerocity%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'transit_branding',
  2500,
  75000,
  20000,
  28.5562,
  77.1180,
  '["https://images.unsplash.com/photo-1595496001974-7c31881e6f6e?w=800"]'::jsonb,
  '{"width": 3, "height": 2, "unit": "ft"}'::jsonb,
  'available';

-- Bus Shelter 1 - Connaught Place
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Bus Shelter - Connaught Place',
  'Prime bus shelter advertising at Connaught Place, Delhi. High footfall area.',
  (SELECT id FROM categories WHERE name ILIKE '%bus%' OR name ILIKE '%shelter%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Delhi' AND address LIKE '%CP%Metro%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'backlit_panel',
  5000,
  150000,
  30000,
  28.6315,
  77.2167,
  '["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"]'::jsonb,
  '{"width": 8, "height": 6, "unit": "ft"}'::jsonb,
  'available';

-- Bus Shelter 2 - Marine Drive
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Bus Shelter - Marine Drive',
  'Premium backlit bus shelter at Marine Drive, Mumbai. Tourist hotspot.',
  (SELECT id FROM categories WHERE name ILIKE '%bus%' OR name ILIKE '%shelter%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Mumbai' AND address LIKE '%Marine Drive%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'backlit_panel',
  6000,
  180000,
  35000,
  18.9432,
  72.8236,
  '["https://images.unsplash.com/photo-1588534943359-a6c2f0d4e2f8?w=800"]'::jsonb,
  '{"width": 10, "height": 6, "unit": "ft"}'::jsonb,
  'available';

-- Metro Station 1 - Rajiv Chowk
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Metro Station Pillar - Rajiv Chowk',
  'Metro station pillar advertising at Rajiv Chowk. Maximum footfall metro station.',
  (SELECT id FROM categories WHERE name ILIKE '%metro%' OR name ILIKE '%transit%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Delhi' AND address LIKE '%Rajiv Chowk%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'static_billboard',
  7000,
  210000,
  60000,
  28.6328,
  77.2197,
  '["https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800"]'::jsonb,
  '{"width": 6, "height": 12, "unit": "ft"}'::jsonb,
  'available';

-- Metro Train Wrap - Blue Line
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Metro Train Wrap - Blue Line',
  'Full train wrap on Delhi Metro Blue Line. Maximum brand visibility.',
  (SELECT id FROM categories WHERE name ILIKE '%metro%' OR name ILIKE '%transit%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Delhi' AND address LIKE '%Blue Line%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'vinyl_banner',
  25000,
  750000,
  150000,
  28.6692,
  77.2143,
  '["https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800"]'::jsonb,
  '{"width": 50, "height": 8, "unit": "ft"}'::jsonb,
  'available';

-- LED Screen - Shopping Mall
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'LED Screen - Shopping Mall',
  'Large LED screen at Garuda Mall, Indiranagar. Premium shopping audience.',
  (SELECT id FROM categories WHERE name ILIKE '%digital%' OR name ILIKE '%screen%' OR name ILIKE '%mall%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Bengaluru' AND address LIKE '%Garuda Mall%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'led_display',
  10000,
  300000,
  45000,
  12.9784,
  77.6408,
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'::jsonb,
  '{"width": 15, "height": 8, "unit": "ft"}'::jsonb,
  'available';

-- Digital Screen - Tech Park
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Digital Screen - Tech Park Lobby',
  'Digital display in tech park lobby, Hinjewadi. IT professional audience.',
  (SELECT id FROM categories WHERE name ILIKE '%digital%' OR name ILIKE '%screen%' OR name ILIKE '%corporate%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Pune' AND address LIKE '%Hinjewadi%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'digital_screen',
  8000,
  240000,
  25000,
  18.5912,
  73.7340,
  '["https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800"]'::jsonb,
  '{"width": 12, "height": 7, "unit": "ft"}'::jsonb,
  'available';

-- Mall Display - Phoenix Market City
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Mall Atrium Display - Phoenix Market City',
  'Premium atrium display at Phoenix Market City, Mumbai. High-end shopping crowd.',
  (SELECT id FROM categories WHERE name ILIKE '%mall%' OR name ILIKE '%retail%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Mumbai' AND address LIKE '%Phoenix%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'static_billboard',
  12000,
  360000,
  55000,
  19.0883,
  72.8895,
  '["https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800"]'::jsonb,
  '{"width": 10, "height": 8, "unit": "ft"}'::jsonb,
  'available';

-- Mall Escalator Branding
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Mall Escalator Branding',
  'Escalator vinyl branding at Forum Mall, Koramangala. Premium retail audience.',
  (SELECT id FROM categories WHERE name ILIKE '%mall%' OR name ILIKE '%retail%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Bengaluru' AND address LIKE '%Forum Mall%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'vinyl_banner',
  9000,
  270000,
  40000,
  12.9346,
  77.6119,
  '["https://images.unsplash.com/photo-1578736641330-3155e606cd40?w=800"]'::jsonb,
  '{"width": 8, "height": 15, "unit": "ft"}'::jsonb,
  'available';

-- Cinema Screen - INOX
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Cinema Screen Advertising - INOX',
  'On-screen advertising at INOX R City Mall. Captive audience during movie intervals.',
  (SELECT id FROM categories WHERE name ILIKE '%cinema%' OR name ILIKE '%entertainment%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Mumbai' AND address LIKE '%INOX%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'digital_screen',
  15000,
  450000,
  8000,
  19.1072,
  72.8707,
  '["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"]'::jsonb,
  '{"width": 40, "height": 20, "unit": "ft"}'::jsonb,
  'available';

-- Cinema Lobby - PVR
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Cinema Lobby Standee - PVR',
  'Premium standee placement in PVR lobby at Select City Walk. High footfall.',
  (SELECT id FROM categories WHERE name ILIKE '%cinema%' OR name ILIKE '%entertainment%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Delhi' AND address LIKE '%PVR%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'static_billboard',
  6000,
  180000,
  12000,
  28.5244,
  77.2066,
  '["https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800"]'::jsonb,
  '{"width": 5, "height": 8, "unit": "ft"}'::jsonb,
  'available';

-- Airport Terminal Display
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Airport Terminal Display - Arrivals',
  'Premium digital display at Mumbai Airport T2 arrivals. Premium traveler audience.',
  (SELECT id FROM categories WHERE name ILIKE '%airport%' OR name ILIKE '%transit%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Mumbai' AND address LIKE '%Airport T2%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'digital_screen',
  20000,
  600000,
  75000,
  19.0896,
  72.8656,
  '["https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800"]'::jsonb,
  '{"width": 20, "height": 10, "unit": "ft"}'::jsonb,
  'available';

-- Airport Baggage Carousel
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions,
  latitude, longitude, images, dimensions, availability_status
)
SELECT 
  'Airport Baggage Carousel Branding',
  'Baggage carousel vinyl branding at Bengaluru Airport. High dwell time.',
  (SELECT id FROM categories WHERE name ILIKE '%airport%' OR name ILIKE '%transit%' LIMIT 1),
  (SELECT id FROM locations WHERE city = 'Bengaluru' AND address LIKE '%Airport%' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Elfsod Admin' LIMIT 1),
  'vinyl_banner',
  18000,
  540000,
  60000,
  13.1986,
  77.7066,
  '["https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=800"]'::jsonb,
  '{"width": 15, "height": 5, "unit": "ft"}'::jsonb,
  'available';

-- Verify the created ad spaces
SELECT 
  a.id,
  a.title,
  l.city,
  c.name as category,
  a.price_per_day,
  a.availability_status
FROM ad_spaces a
LEFT JOIN locations l ON a.location_id = l.id
LEFT JOIN categories c ON a.category_id = c.id
ORDER BY a.created_at DESC
LIMIT 20;
