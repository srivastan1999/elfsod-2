-- Seed Data for Elfsod Database (Using Postgres-generated UUIDs)

-- Insert Categories (let Postgres generate UUIDs)
INSERT INTO categories (name, description) VALUES
('Billboard', 'Traditional outdoor advertising billboards'),
('Digital Screen', 'Modern digital advertising screens'),
('Bus Station', 'Bus station advertising spaces'),
('Cinema', 'Cinema and theater advertising'),
('Point of Sale', 'Retail point of sale displays'),
('Transit', 'Public transport advertising')
RETURNING id, name;

-- Insert Publishers (let Postgres generate UUIDs)
INSERT INTO publishers (name, description, verification_status) VALUES
('Times OOH', 'Leading outdoor advertising company in India', 'verified'),
('JCDecaux', 'Global leader in outdoor advertising', 'verified'),
('Clear Channel', 'International outdoor advertising company', 'verified'),
('Laqshya Media', 'Premium outdoor and transit media', 'verified'),
('Selvel One', 'Digital outdoor advertising solutions', 'verified'),
('Milestone Brandcom', 'Complete advertising solutions provider', 'verified'),
('Jagran Engage', 'Multi-platform advertising services', 'verified')
RETURNING id, name;

-- Insert Locations for Mumbai (let Postgres generate UUIDs)
INSERT INTO locations (city, state, address, latitude, longitude) VALUES
('Mumbai', 'Maharashtra', 'Bandra Kurla Complex, Mumbai', 19.0596, 72.8295),
('Mumbai', 'Maharashtra', 'Andheri West, Mumbai', 19.1136, 72.8697),
('Mumbai', 'Maharashtra', 'Powai, Mumbai', 19.1176, 72.9060),
('Mumbai', 'Maharashtra', 'Worli Sea Link, Mumbai', 19.0176, 72.8119),
('Mumbai', 'Maharashtra', 'Dadar, Mumbai', 19.0178, 72.8478)
RETURNING id, city, address;

-- Insert Locations for Bengaluru (let Postgres generate UUIDs)
INSERT INTO locations (city, state, address, latitude, longitude) VALUES
('Bengaluru', 'Karnataka', 'MG Road, Bengaluru', 12.9716, 77.5946),
('Bengaluru', 'Karnataka', 'Brigade Road, Bengaluru', 12.9719, 77.6081),
('Bengaluru', 'Karnataka', 'Indiranagar, Bengaluru', 12.9716, 77.6412),
('Bengaluru', 'Karnataka', 'Whitefield, Bengaluru', 12.9698, 77.7500),
('Bengaluru', 'Karnataka', 'Koramangala, Bengaluru', 12.9352, 77.6245)
RETURNING id, city, address;

-- Insert Locations for Delhi (let Postgres generate UUIDs)
INSERT INTO locations (city, state, address, latitude, longitude) VALUES
('Delhi', 'Delhi', 'Connaught Place, New Delhi', 28.6315, 77.2167),
('Delhi', 'Delhi', 'Chandni Chowk, Delhi', 28.6506, 77.2303),
('Delhi', 'Delhi', 'Saket, Delhi', 28.5244, 77.2066),
('Delhi', 'Delhi', 'Rajouri Garden, Delhi', 28.6410, 77.1214)
RETURNING id, city, address;

-- Insert Ad Spaces using subqueries to get generated IDs
-- Mumbai Ad Spaces
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Digital Screen at BKC',
  'High-end digital billboard in Mumbai''s business district. Perfect for corporate campaigns targeting professionals.',
  (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Bandra Kurla Complex, Mumbai' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Times OOH' LIMIT 1),
  'digital_screen',
  83333,
  2500000,
  5000,
  150000,
  'Corporate Professionals',
  'available',
  19.0596,
  72.8295,
  '["https://images.pexels.com/photos/1268975/pexels-photo-1268975.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb;

-- Bengaluru Ad Spaces
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'MG Road Billboard',
  'Prime location billboard on MG Road. High visibility during peak hours with excellent footfall.',
  (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'MG Road, Bengaluru' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'JCDecaux' LIMIT 1),
  'static_billboard',
  60000,
  1800000,
  8000,
  240000,
  'General Public',
  'available',
  12.9716,
  77.5946,
  '["https://images.pexels.com/photos/3566187/pexels-photo-3566187.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 3000, "height": 1500}'::jsonb;

INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Brigade Road Billboard',
  'Strategic billboard location in Brigade Road shopping district. Ideal for retail and lifestyle brands.',
  (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Brigade Road, Bengaluru' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'JCDecaux' LIMIT 1),
  'static_billboard',
  40000,
  1200000,
  6000,
  180000,
  'Shoppers',
  'available',
  12.9719,
  77.6081,
  '["https://images.pexels.com/photos/2240763/pexels-photo-2240763.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 2400, "height": 1200}'::jsonb;

INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Indiranagar Digital Display',
  'Modern digital display in trendy Indiranagar locality. Perfect for lifestyle and food brands.',
  (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Indiranagar, Bengaluru' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Selvel One' LIMIT 1),
  'digital_screen',
  55000,
  1650000,
  7000,
  210000,
  'Young Professionals',
  'available',
  12.9716,
  77.6412,
  '["https://images.pexels.com/photos/1484801/pexels-photo-1484801.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb;

-- Delhi Ad Spaces
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Connaught Place Premium Display',
  'Iconic location in heart of Delhi. Maximum visibility for national campaigns.',
  (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Connaught Place, New Delhi' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Clear Channel' LIMIT 1),
  'led_display',
  120000,
  3600000,
  12000,
  360000,
  'Mixed Audience',
  'available',
  28.6315,
  77.2167,
  '["https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 2560, "height": 1440}'::jsonb;

INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Saket Mall Entrance',
  'High-footfall mall entrance display. Perfect for retail and entertainment brands.',
  (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Saket, Delhi' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Laqshya Media' LIMIT 1),
  'backlit_panel',
  45000,
  1350000,
  5500,
  165000,
  'Shoppers',
  'available',
  28.5244,
  77.2066,
  '["https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 2000, "height": 1000}'::jsonb;

-- More Mumbai
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Andheri Station Billboard',
  'High-traffic railway station billboard. Excellent reach for mass-market products.',
  (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Andheri West, Mumbai' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Times OOH' LIMIT 1),
  'static_billboard',
  50000,
  1500000,
  10000,
  300000,
  'Commuters',
  'available',
  19.1136,
  72.8697,
  '["https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 2500, "height": 1250}'::jsonb;

INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Worli Sea Link View',
  'Premium location with stunning sea link view. Perfect for luxury brands.',
  (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Worli Sea Link, Mumbai' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Clear Channel' LIMIT 1),
  'digital_screen',
  95000,
  2850000,
  8000,
  240000,
  'Affluent Commuters',
  'available',
  19.0176,
  72.8119,
  '["https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb;

-- Whitefield Tech Parks
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Whitefield Tech Park Display',
  'Located in IT corridor. Ideal for B2B and tech product campaigns.',
  (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Whitefield, Bengaluru' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Selvel One' LIMIT 1),
  'led_display',
  65000,
  1950000,
  6500,
  195000,
  'IT Professionals',
  'available',
  12.9698,
  77.7500,
  '["https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb;

-- Koramangala
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Koramangala Startup District Billboard',
  'Young, tech-savvy audience. Perfect for new-age brands and startups.',
  (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Koramangala, Bengaluru' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Milestone Brandcom' LIMIT 1),
  'static_billboard',
  48000,
  1440000,
  5800,
  174000,
  'Millennials & Gen Z',
  'available',
  12.9352,
  77.6245,
  '["https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 2200, "height": 1100}'::jsonb;

-- More ad spaces (11-15)
INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Chandni Chowk Heritage Display',
  'Historic market area with massive footfall. Ideal for FMCG and lifestyle products.',
  (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Chandni Chowk, Delhi' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Jagran Engage' LIMIT 1),
  'vinyl_banner',
  35000,
  1050000,
  9000,
  270000,
  'Traditional Shoppers',
  'available',
  28.6506,
  77.2303,
  '["https://images.pexels.com/photos/2253879/pexels-photo-2253879.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 2000, "height": 1500}'::jsonb;

INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Rajouri Garden Metro Station',
  'Metro station with high daily commuter traffic. Perfect for consumer products.',
  (SELECT id FROM categories WHERE name = 'Bus Station' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Rajouri Garden, Delhi' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Laqshya Media' LIMIT 1),
  'backlit_panel',
  42000,
  1260000,
  11000,
  330000,
  'Daily Commuters',
  'available',
  28.6410,
  77.1214,
  '["https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 1800, "height": 900}'::jsonb;

INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Powai Lake View Billboard',
  'Scenic location near Powai Lake. Great for lifestyle and real estate brands.',
  (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Powai, Mumbai' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Times OOH' LIMIT 1),
  'static_billboard',
  52000,
  1560000,
  6200,
  186000,
  'Residential Community',
  'available',
  19.1176,
  72.9060,
  '["https://images.pexels.com/photos/3989821/pexels-photo-3989821.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 2400, "height": 1200}'::jsonb;

INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Dadar Junction Premium',
  'Busiest railway junction in Mumbai. Massive reach for mass-market campaigns.',
  (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Dadar, Mumbai' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'JCDecaux' LIMIT 1),
  'led_display',
  75000,
  2250000,
  15000,
  450000,
  'Mass Market',
  'available',
  19.0178,
  72.8478,
  '["https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 2560, "height": 1440}'::jsonb;

INSERT INTO ad_spaces (
  title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
)
SELECT 
  'Bengaluru Airport Road LED',
  'Airport corridor with affluent traveler audience. Premium brand positioning.',
  (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1),
  (SELECT id FROM locations WHERE address = 'Whitefield, Bengaluru' LIMIT 1),
  (SELECT id FROM publishers WHERE name = 'Selvel One' LIMIT 1),
  'led_display',
  85000,
  2550000,
  7500,
  225000,
  'Business Travelers',
  'available',
  13.1986,
  77.7066,
  '["https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
  '{"width": 1920, "height": 1080}'::jsonb;

