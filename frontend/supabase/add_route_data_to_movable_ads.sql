-- Add route/coverage data to ALL movable ad spaces
-- This enables the circular coverage area feature on the map for:
-- Auto Rickshaws, Bikes, Cabs, Buses, Transit Branding, Mobile Billboards

-- ============================================
-- SPECIFIC AD SPACES (with custom coverage)
-- ============================================

-- Update Auto Rickshaw 1 - Mumbai (Andheri)
UPDATE ad_spaces 
SET route = jsonb_build_object(
  'center_location', jsonb_build_object(
    'latitude', 19.1136,
    'longitude', 72.8697,
    'address', 'Andheri West, Mumbai'
  ),
  'coverage_radius', 5,
  'base_coverage_km', 5,
  'additional_coverage_km', 10
)
WHERE title LIKE '%Auto Rickshaw Branding - Premium Fleet%'
  OR (title LIKE '%Auto Rickshaw%' AND description LIKE '%Andheri%');

-- Update Auto Rickshaw 2 - Bengaluru (Whitefield)
UPDATE ad_spaces 
SET route = jsonb_build_object(
  'center_location', jsonb_build_object(
    'latitude', 12.9698,
    'longitude', 77.7500,
    'address', 'Whitefield Tech Park, Bengaluru'
  ),
  'coverage_radius', 8,
  'base_coverage_km', 8,
  'additional_coverage_km', 12
)
WHERE title LIKE '%Auto Rickshaw Back Panel - Tech Park Route%'
  OR (title LIKE '%Auto Rickshaw%' AND description LIKE '%Whitefield%');

-- Update Auto Rickshaw 3 - Delhi (Airport Route)
UPDATE ad_spaces 
SET route = jsonb_build_object(
  'center_location', jsonb_build_object(
    'latitude', 28.5562,
    'longitude', 77.1180,
    'address', 'Aerocity, Airport Express Route, Delhi'
  ),
  'coverage_radius', 6,
  'base_coverage_km', 6,
  'additional_coverage_km', 8
)
WHERE title LIKE '%Auto Rickshaw Hood - Airport Route%'
  OR (title LIKE '%Auto Rickshaw%' AND description LIKE '%airport%');

-- ============================================
-- ALL MOVABLE AD TYPES (default coverage)
-- ============================================

-- AUTO RICKSHAWS: 5km base, +10km additional
UPDATE ad_spaces 
SET route = jsonb_build_object(
  'center_location', jsonb_build_object(
    'latitude', latitude,
    'longitude', longitude,
    'address', COALESCE(
      (SELECT address FROM locations WHERE locations.id = ad_spaces.location_id LIMIT 1),
      'Auto Rickshaw Coverage Area'
    )
  ),
  'coverage_radius', 5,
  'base_coverage_km', 5,
  'additional_coverage_km', 10
)
WHERE display_type = 'auto_rickshaw'
  AND route IS NULL;

-- BIKES: 4km base, +8km additional (smaller coverage)
UPDATE ad_spaces 
SET route = jsonb_build_object(
  'center_location', jsonb_build_object(
    'latitude', latitude,
    'longitude', longitude,
    'address', COALESCE(
      (SELECT address FROM locations WHERE locations.id = ad_spaces.location_id LIMIT 1),
      'Bike Advertising Coverage Area'
    )
  ),
  'coverage_radius', 4,
  'base_coverage_km', 4,
  'additional_coverage_km', 8
)
WHERE display_type = 'bike'
  AND route IS NULL;

-- CABS: 8km base, +15km additional (larger coverage)
UPDATE ad_spaces 
SET route = jsonb_build_object(
  'center_location', jsonb_build_object(
    'latitude', latitude,
    'longitude', longitude,
    'address', COALESCE(
      (SELECT address FROM locations WHERE locations.id = ad_spaces.location_id LIMIT 1),
      'Cab Advertising Coverage Area'
    )
  ),
  'coverage_radius', 8,
  'base_coverage_km', 8,
  'additional_coverage_km', 15
)
WHERE display_type = 'cab'
  AND route IS NULL;

-- BUSES: 12km base, +20km additional (widest coverage)
UPDATE ad_spaces 
SET route = jsonb_build_object(
  'center_location', jsonb_build_object(
    'latitude', latitude,
    'longitude', longitude,
    'address', COALESCE(
      (SELECT address FROM locations WHERE locations.id = ad_spaces.location_id LIMIT 1),
      'Bus Advertising Coverage Area'
    )
  ),
  'coverage_radius', 12,
  'base_coverage_km', 12,
  'additional_coverage_km', 20
)
WHERE (display_type = 'transit_branding' OR title ILIKE '%bus%')
  AND route IS NULL;

-- METRO/TRAIN: 15km base, +25km additional (metro line coverage)
UPDATE ad_spaces 
SET route = jsonb_build_object(
  'center_location', jsonb_build_object(
    'latitude', latitude,
    'longitude', longitude,
    'address', COALESCE(
      (SELECT address FROM locations WHERE locations.id = ad_spaces.location_id LIMIT 1),
      'Metro/Train Line Coverage'
    )
  ),
  'coverage_radius', 15,
  'base_coverage_km', 15,
  'additional_coverage_km', 25
)
WHERE (title ILIKE '%metro%' OR title ILIKE '%train%' OR description ILIKE '%metro%')
  AND route IS NULL;

-- MOBILE BILLBOARDS/VANS: 10km base, +18km additional
UPDATE ad_spaces 
SET route = jsonb_build_object(
  'center_location', jsonb_build_object(
    'latitude', latitude,
    'longitude', longitude,
    'address', COALESCE(
      (SELECT address FROM locations WHERE locations.id = ad_spaces.location_id LIMIT 1),
      'Mobile Billboard Coverage Area'
    )
  ),
  'coverage_radius', 10,
  'base_coverage_km', 10,
  'additional_coverage_km', 18
)
WHERE (title ILIKE '%mobile%billboard%' OR title ILIKE '%van%' OR description ILIKE '%mobile%')
  AND route IS NULL;

-- Verify the updates
SELECT 
  id, 
  title, 
  display_type,
  route->>'coverage_radius' as coverage_km,
  route->'center_location'->>'address' as center_address
FROM ad_spaces 
WHERE route IS NOT NULL
ORDER BY created_at DESC;

