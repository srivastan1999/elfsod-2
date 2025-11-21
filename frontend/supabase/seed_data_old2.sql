-- Seed Data for Elfsod Database (Fixed UUIDs)

-- Insert Categories (using valid hex-only UUIDs)
INSERT INTO categories (id, name, description) VALUES
('d7e9f1a2-3c4b-5d6e-7f8a-9a0a1a2a3a4a', 'Billboard', 'Traditional outdoor advertising billboards'),
('e8f0a2b3-4d5c-6e7f-8a9a-0a1a2a3a4a5a', 'Digital Screen', 'Modern digital advertising screens'),
('f9a1a3c4-5e6d-7f8a-9a0a-1a2a3a4a5a6a', 'Bus Station', 'Bus station advertising spaces'),
('a0a2a4d5-6f7e-8a9a-0a1a-2a3a4a5a6a7a', 'Cinema', 'Cinema and theater advertising'),
('a1a3a5e6-7a8f-9a0a-1a2a-3a4a5a6a7a8a', 'Point of Sale', 'Retail point of sale displays'),
('a2a4a6f7-8a9a-0a1a-2a3a-4a5a6a7a8a9a', 'Transit', 'Public transport advertising')
ON CONFLICT (id) DO NOTHING;

-- Insert Publishers (using valid hex-only UUIDs)
INSERT INTO publishers (id, name, description, verification_status) VALUES
('a1b2c3d4-e5f6-7a8a-9a0a-1a2a3a4a5a6a', 'Times OOH', 'Leading outdoor advertising company in India', 'verified'),
('b2c3d4e5-f6a7-8a9a-0a1a-2a3a4a5a6a7a', 'JCDecaux', 'Global leader in outdoor advertising', 'verified'),
('c3d4e5f6-a7a8-9a0a-1a2a-3a4a5a6a7a8a', 'Clear Channel', 'International outdoor advertising company', 'verified'),
('d4e5f6a7-a8a9-0a1a-2a3a-4a5a6a7a8a9a', 'Laqshya Media', 'Premium outdoor and transit media', 'verified'),
('e5f6a7a8-a9a0-1a2a-3a4a-5a6a7a8a9a0a', 'Selvel One', 'Digital outdoor advertising solutions', 'verified'),
('f6a7a8a9-a0a1-2a3a-4a5a-6a7a8a9a0a1a', 'Milestone Brandcom', 'Complete advertising solutions provider', 'verified'),
('a7a8a9a0-a1a2-3a4a-5a6a-7a8a9a0a1a2a', 'Jagran Engage', 'Multi-platform advertising services', 'verified')
ON CONFLICT (id) DO NOTHING;

-- Insert Locations for Mumbai (using valid UUIDs)
INSERT INTO locations (id, city, state, address, latitude, longitude) VALUES
('11111111-1111-1111-1111-111111111111', 'Mumbai', 'Maharashtra', 'Bandra Kurla Complex, Mumbai', 19.0596, 72.8295),
('22222222-2222-2222-2222-222222222222', 'Mumbai', 'Maharashtra', 'Andheri West, Mumbai', 19.1136, 72.8697),
('33333333-3333-3333-3333-333333333333', 'Mumbai', 'Maharashtra', 'Powai, Mumbai', 19.1176, 72.9060),
('44444444-4444-4444-4444-444444444444', 'Mumbai', 'Maharashtra', 'Worli Sea Link, Mumbai', 19.0176, 72.8119),
('55555555-5555-5555-5555-555555555555', 'Mumbai', 'Maharashtra', 'Dadar, Mumbai', 19.0178, 72.8478)
ON CONFLICT (id) DO NOTHING;

-- Insert Locations for Bengaluru (using valid UUIDs)
INSERT INTO locations (id, city, state, address, latitude, longitude) VALUES
('66666666-6666-6666-6666-666666666666', 'Bengaluru', 'Karnataka', 'MG Road, Bengaluru', 12.9716, 77.5946),
('77777777-7777-7777-7777-777777777777', 'Bengaluru', 'Karnataka', 'Brigade Road, Bengaluru', 12.9719, 77.6081),
('88888888-8888-8888-8888-888888888888', 'Bengaluru', 'Karnataka', 'Indiranagar, Bengaluru', 12.9716, 77.6412),
('99999999-9999-9999-9999-999999999999', 'Bengaluru', 'Karnataka', 'Whitefield, Bengaluru', 12.9698, 77.7500),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bengaluru', 'Karnataka', 'Koramangala, Bengaluru', 12.9352, 77.6245)
ON CONFLICT (id) DO NOTHING;

-- Insert Locations for Delhi (using valid UUIDs)
INSERT INTO locations (id, city, state, address, latitude, longitude) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Delhi', 'Delhi', 'Connaught Place, New Delhi', 28.6315, 77.2167),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Delhi', 'Delhi', 'Chandni Chowk, Delhi', 28.6506, 77.2303),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Delhi', 'Delhi', 'Saket, Delhi', 28.5244, 77.2066),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Delhi', 'Delhi', 'Rajouri Garden, Delhi', 28.6410, 77.1214)
ON CONFLICT (id) DO NOTHING;

-- Insert Ad Spaces
INSERT INTO ad_spaces (
  id, title, description, category_id, location_id, publisher_id,
  display_type, price_per_day, price_per_month, daily_impressions, monthly_footfall,
  target_audience, availability_status, latitude, longitude, images, dimensions
) VALUES
-- Mumbai Ad Spaces
(
  '10000000-0000-0000-0000-000000000001', 
  'Digital Screen at BKC',
  'High-end digital billboard in Mumbai''s business district. Perfect for corporate campaigns targeting professionals.',
  'e8f0a2b3-4d5c-6e7f-8a9a-0a1a2a3a4a5a',
  '11111111-1111-1111-1111-111111111111',
  'a1b2c3d4-e5f6-7a8a-9a0a-1a2a3a4a5a6a',
  'digital_screen',
  83333,
  2500000,
  5000,
  150000,
  'Corporate Professionals',
  'available',
  19.0596,
  72.8295,
  '["https://images.pexels.com/photos/1268975/pexels-photo-1268975.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 1920, "height": 1080}'
),
-- Bengaluru Ad Spaces
(
  '20000000-0000-0000-0000-000000000002',
  'MG Road Billboard',
  'Prime location billboard on MG Road. High visibility during peak hours with excellent footfall.',
  'd7e9f1a2-3c4b-5d6e-7f8a-9a0a1a2a3a4a',
  '66666666-6666-6666-6666-666666666666',
  'b2c3d4e5-f6a7-8a9a-0a1a-2a3a4a5a6a7a',
  'static_billboard',
  60000,
  1800000,
  8000,
  240000,
  'General Public',
  'available',
  12.9716,
  77.5946,
  '["https://images.pexels.com/photos/3566187/pexels-photo-3566187.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 3000, "height": 1500}'
),
(
  '30000000-0000-0000-0000-000000000003',
  'Brigade Road Billboard',
  'Strategic billboard location in Brigade Road shopping district. Ideal for retail and lifestyle brands.',
  'd7e9f1a2-3c4b-5d6e-7f8a-9a0a1a2a3a4a',
  '77777777-7777-7777-7777-777777777777',
  'b2c3d4e5-f6a7-8a9a-0a1a-2a3a4a5a6a7a',
  'static_billboard',
  40000,
  1200000,
  6000,
  180000,
  'Shoppers',
  'available',
  12.9719,
  77.6081,
  '["https://images.pexels.com/photos/2240763/pexels-photo-2240763.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 2400, "height": 1200}'
),
-- More Bengaluru
(
  '40000000-0000-0000-0000-000000000004',
  'Indiranagar Digital Display',
  'Modern digital display in trendy Indiranagar locality. Perfect for lifestyle and food brands.',
  'e8f0a2b3-4d5c-6e7f-8a9a-0a1a2a3a4a5a',
  '88888888-8888-8888-8888-888888888888',
  'e5f6a7a8-a9a0-1a2a-3a4a-5a6a7a8a9a0a',
  'digital_screen',
  55000,
  1650000,
  7000,
  210000,
  'Young Professionals',
  'available',
  12.9716,
  77.6412,
  '["https://images.pexels.com/photos/1484801/pexels-photo-1484801.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 1920, "height": 1080}'
),
-- Delhi Ad Spaces
(
  '50000000-0000-0000-0000-000000000005',
  'Connaught Place Premium Display',
  'Iconic location in heart of Delhi. Maximum visibility for national campaigns.',
  'e8f0a2b3-4d5c-6e7f-8a9a-0a1a2a3a4a5a',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'c3d4e5f6-a7a8-9a0a-1a2a-3a4a5a6a7a8a',
  'led_display',
  120000,
  3600000,
  12000,
  360000,
  'Mixed Audience',
  'available',
  28.6315,
  77.2167,
  '["https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 2560, "height": 1440}'
),
(
  '60000000-0000-0000-0000-000000000006',
  'Saket Mall Entrance',
  'High-footfall mall entrance display. Perfect for retail and entertainment brands.',
  'd7e9f1a2-3c4b-5d6e-7f8a-9a0a1a2a3a4a',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'd4e5f6a7-a8a9-0a1a-2a3a-4a5a6a7a8a9a',
  'backlit_panel',
  45000,
  1350000,
  5500,
  165000,
  'Shoppers',
  'available',
  28.5244,
  77.2066,
  '["https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 2000, "height": 1000}'
),
-- More Mumbai
(
  '70000000-0000-0000-0000-000000000007',
  'Andheri Station Billboard',
  'High-traffic railway station billboard. Excellent reach for mass-market products.',
  'd7e9f1a2-3c4b-5d6e-7f8a-9a0a1a2a3a4a',
  '22222222-2222-2222-2222-222222222222',
  'a1b2c3d4-e5f6-7a8a-9a0a-1a2a3a4a5a6a',
  'static_billboard',
  50000,
  1500000,
  10000,
  300000,
  'Commuters',
  'available',
  19.1136,
  72.8697,
  '["https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 2500, "height": 1250}'
),
(
  '80000000-0000-0000-0000-000000000008',
  'Worli Sea Link View',
  'Premium location with stunning sea link view. Perfect for luxury brands.',
  'e8f0a2b3-4d5c-6e7f-8a9a-0a1a2a3a4a5a',
  '44444444-4444-4444-4444-444444444444',
  'c3d4e5f6-a7a8-9a0a-1a2a-3a4a5a6a7a8a',
  'digital_screen',
  95000,
  2850000,
  8000,
  240000,
  'Affluent Commuters',
  'available',
  19.0176,
  72.8119,
  '["https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 1920, "height": 1080}'
),
-- Whitefield Tech Parks
(
  '90000000-0000-0000-0000-000000000009',
  'Whitefield Tech Park Display',
  'Located in IT corridor. Ideal for B2B and tech product campaigns.',
  'e8f0a2b3-4d5c-6e7f-8a9a-0a1a2a3a4a5a',
  '99999999-9999-9999-9999-999999999999',
  'e5f6a7a8-a9a0-1a2a-3a4a-5a6a7a8a9a0a',
  'led_display',
  65000,
  1950000,
  6500,
  195000,
  'IT Professionals',
  'available',
  12.9698,
  77.7500,
  '["https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 1920, "height": 1080}'
),
-- Koramangala
(
  'a0000000-0000-0000-0000-00000000000a',
  'Koramangala Startup District Billboard',
  'Young, tech-savvy audience. Perfect for new-age brands and startups.',
  'd7e9f1a2-3c4b-5d6e-7f8a-9a0a1a2a3a4a',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'f6a7a8a9-a0a1-2a3a-4a5a-6a7a8a9a0a1a',
  'static_billboard',
  48000,
  1440000,
  5800,
  174000,
  'Millennials & Gen Z',
  'available',
  12.9352,
  77.6245,
  '["https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 2200, "height": 1100}'
),
-- More ad spaces (11-15)
(
  'b0000000-0000-0000-0000-00000000000b',
  'Chandni Chowk Heritage Display',
  'Historic market area with massive footfall. Ideal for FMCG and lifestyle products.',
  'd7e9f1a2-3c4b-5d6e-7f8a-9a0a1a2a3a4a',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'a7a8a9a0-a1a2-3a4a-5a6a-7a8a9a0a1a2a',
  'vinyl_banner',
  35000,
  1050000,
  9000,
  270000,
  'Traditional Shoppers',
  'available',
  28.6506,
  77.2303,
  '["https://images.pexels.com/photos/2253879/pexels-photo-2253879.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 2000, "height": 1500}'
),
(
  'c0000000-0000-0000-0000-00000000000c',
  'Rajouri Garden Metro Station',
  'Metro station with high daily commuter traffic. Perfect for consumer products.',
  'f9a1a3c4-5e6d-7f8a-9a0a-1a2a3a4a5a6a',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'd4e5f6a7-a8a9-0a1a-2a3a-4a5a6a7a8a9a',
  'backlit_panel',
  42000,
  1260000,
  11000,
  330000,
  'Daily Commuters',
  'available',
  28.6410,
  77.1214,
  '["https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 1800, "height": 900}'
),
(
  'd0000000-0000-0000-0000-00000000000d',
  'Powai Lake View Billboard',
  'Scenic location near Powai Lake. Great for lifestyle and real estate brands.',
  'd7e9f1a2-3c4b-5d6e-7f8a-9a0a1a2a3a4a',
  '33333333-3333-3333-3333-333333333333',
  'a1b2c3d4-e5f6-7a8a-9a0a-1a2a3a4a5a6a',
  'static_billboard',
  52000,
  1560000,
  6200,
  186000,
  'Residential Community',
  'available',
  19.1176,
  72.9060,
  '["https://images.pexels.com/photos/3989821/pexels-photo-3989821.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 2400, "height": 1200}'
),
(
  'e0000000-0000-0000-0000-00000000000e',
  'Dadar Junction Premium',
  'Busiest railway junction in Mumbai. Massive reach for mass-market campaigns.',
  'd7e9f1a2-3c4b-5d6e-7f8a-9a0a1a2a3a4a',
  '55555555-5555-5555-5555-555555555555',
  'b2c3d4e5-f6a7-8a9a-0a1a-2a3a4a5a6a7a',
  'led_display',
  75000,
  2250000,
  15000,
  450000,
  'Mass Market',
  'available',
  19.0178,
  72.8478,
  '["https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 2560, "height": 1440}'
),
(
  'f0000000-0000-0000-0000-00000000000f',
  'Bengaluru Airport Road LED',
  'Airport corridor with affluent traveler audience. Premium brand positioning.',
  'e8f0a2b3-4d5c-6e7f-8a9a-0a1a2a3a4a5a',
  '99999999-9999-9999-9999-999999999999',
  'e5f6a7a8-a9a0-1a2a-3a4a-5a6a7a8a9a0a',
  'led_display',
  85000,
  2550000,
  7500,
  225000,
  'Business Travelers',
  'available',
  13.1986,
  77.7066,
  '["https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  '{"width": 1920, "height": 1080}'
)
ON CONFLICT (id) DO NOTHING;

