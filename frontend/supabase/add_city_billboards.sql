-- ============================================
-- ADD CITY BILLBOARD AD SPACES
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Get or create the "Billboards" category
DO $$
DECLARE
  billboards_category_id UUID;
BEGIN
  -- Try to find existing "Billboards" category
  SELECT id INTO billboards_category_id 
  FROM categories 
  WHERE name ILIKE '%billboard%' 
  LIMIT 1;
  
  -- If not found, create it
  IF billboards_category_id IS NULL THEN
    INSERT INTO categories (name, description)
    VALUES ('Billboards', 'Billboard advertising')
    RETURNING id INTO billboards_category_id;
  END IF;
  
  -- Store the category ID for later use
  PERFORM set_config('app.billboards_category_id', billboards_category_id::text, false);
END $$;

-- Step 2: Create locations if they don't exist
INSERT INTO locations (id, city, state, country, address, latitude, longitude) VALUES
('hyd_loc_001', 'Hyderabad', 'Telangana', 'India', 'Madhapur Metro Station, Hyderabad', 17.4504, 78.3912),
('hyd_loc_002', 'Hyderabad', 'Telangana', 'India', 'Begumpet Flyover, Hyderabad', 17.4448, 78.4608),
('hyd_loc_003', 'Hyderabad', 'Telangana', 'India', 'Kukatpally Main Road, Hyderabad', 17.4948, 78.3991),
('mum_loc_001', 'Mumbai', 'Maharashtra', 'India', 'Andheri East, Mumbai', 19.1197, 72.8694),
('del_loc_001', 'Delhi', 'Delhi', 'India', 'Saket Metro, Delhi', 28.5236, 77.2193)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Insert ad spaces
DO $$
DECLARE
  billboards_category_id UUID;
BEGIN
  -- Get the Billboards category ID
  SELECT id INTO billboards_category_id 
  FROM categories 
  WHERE name ILIKE '%billboard%' 
  LIMIT 1;
  
  -- Insert ad spaces
  INSERT INTO ad_spaces (
    id,
    title,
    description,
    category_id,
    location_id,
    publisher_id,
    display_type,
    price_per_day,
    price_per_month,
    daily_impressions,
    monthly_footfall,
    target_audience,
    availability_status,
    latitude,
    longitude,
    images,
    dimensions,
    route
  ) VALUES
  (
    'hyd_billboard_001',
    'Madhapur Metro Station',
    'High-visibility static billboard in the heart of the IT Hub, Hyderabad.',
    billboards_category_id,
    'hyd_loc_001',
    NULL,
    'static_billboard',
    7500,
    220000,
    14000,
    420000,
    NULL,
    'available',
    17.4504,
    78.3912,
    '["https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/10.png"]'::jsonb,
    '{"width": 18, "height": 36}'::jsonb,
    NULL
  ),
  (
    'hyd_billboard_002',
    'Begumpet Flyover',
    'Prominent static billboard on Begumpet Flyover, Hyderabad.',
    billboards_category_id,
    'hyd_loc_002',
    NULL,
    'static_billboard',
    6000,
    180000,
    12000,
    320000,
    NULL,
    'available',
    17.4448,
    78.4608,
    '["https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/11.png"]'::jsonb,
    '{"width": 15, "height": 25}'::jsonb,
    NULL
  ),
  (
    'hyd_billboard_003',
    'Kukatpally Main Road',
    'Busy commuter spot with premium static billboard.',
    billboards_category_id,
    'hyd_loc_003',
    NULL,
    'static_billboard',
    5000,
    155000,
    10500,
    315000,
    NULL,
    'available',
    17.4948,
    78.3991,
    '["https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/12.png"]'::jsonb,
    '{"width": 14, "height": 28}'::jsonb,
    NULL
  ),
  (
    'mum_billboard_001',
    'Andheri East',
    'Strategic static billboard placement at Andheri East, Mumbai.',
    billboards_category_id,
    'mum_loc_001',
    NULL,
    'static_billboard',
    6800,
    180000,
    11600,
    348000,
    NULL,
    'available',
    19.1197,
    72.8694,
    '["https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/13.png"]'::jsonb,
    '{"width": 16, "height": 30}'::jsonb,
    NULL
  ),
  (
    'del_billboard_001',
    'Saket Metro',
    'Large format static billboard at Saket Metro, Delhi.',
    billboards_category_id,
    'del_loc_001',
    NULL,
    'static_billboard',
    7200,
    200000,
    13500,
    405000,
    NULL,
    'available',
    28.5236,
    77.2193,
    '["https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/14.png"]'::jsonb,
    '{"width": 17, "height": 32}'::jsonb,
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    location_id = EXCLUDED.location_id,
    display_type = EXCLUDED.display_type,
    price_per_day = EXCLUDED.price_per_day,
    price_per_month = EXCLUDED.price_per_month,
    daily_impressions = EXCLUDED.daily_impressions,
    monthly_footfall = EXCLUDED.monthly_footfall,
    availability_status = EXCLUDED.availability_status,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    images = EXCLUDED.images,
    dimensions = EXCLUDED.dimensions,
    updated_at = NOW();
END $$;

-- Verify the insertions
SELECT 
  a.id,
  a.title,
  a.city,
  c.name as category_name,
  l.address as location_address
FROM ad_spaces a
JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE a.id IN (
  'hyd_billboard_001',
  'hyd_billboard_002',
  'hyd_billboard_003',
  'mum_billboard_001',
  'del_billboard_001'
)
ORDER BY a.title;

