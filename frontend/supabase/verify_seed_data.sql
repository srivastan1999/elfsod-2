-- Verification Queries for Seed Data
-- Run these after running seed_data.sql to verify everything is correct

-- 1. Check total ad spaces
SELECT COUNT(*) as total_ad_spaces FROM ad_spaces;
-- Expected: 28

-- 2. Check ad spaces by city
SELECT 
  l.city, 
  COUNT(a.id) as ad_space_count
FROM locations l
LEFT JOIN ad_spaces a ON a.location_id = l.id
GROUP BY l.city
ORDER BY l.city;
-- Expected: 
-- Bengaluru: 10
-- Delhi: 8
-- Mumbai: 10

-- 3. Check ad spaces by location (detailed)
SELECT 
  l.city,
  l.address,
  COUNT(a.id) as ad_space_count,
  STRING_AGG(a.title, ', ') as ad_space_titles
FROM locations l
LEFT JOIN ad_spaces a ON a.location_id = l.id
GROUP BY l.id, l.city, l.address
ORDER BY l.city, l.address;
-- Each location should have 2 ad spaces

-- 4. Check categories are populated
SELECT COUNT(*) as category_count FROM categories;
-- Expected: 6

-- 5. Check publishers are populated
SELECT COUNT(*) as publisher_count FROM publishers;
-- Expected: 7

-- 6. Check locations are populated
SELECT COUNT(*) as location_count FROM locations;
-- Expected: 14

-- 7. Check ad spaces with full details
SELECT 
  a.id,
  a.title,
  c.name as category,
  l.city,
  l.address,
  p.name as publisher,
  a.price_per_day,
  a.availability_status
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
LEFT JOIN publishers p ON a.publisher_id = p.id
ORDER BY l.city, a.title
LIMIT 10;

-- 8. Check for any locations without ad spaces (should return 0 rows)
SELECT 
  l.city,
  l.address
FROM locations l
LEFT JOIN ad_spaces a ON a.location_id = l.id
WHERE a.id IS NULL;
-- Expected: 0 rows (all locations should have ad spaces)

-- 9. Check ad spaces by category
SELECT 
  c.name as category,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN ad_spaces a ON a.category_id = c.id
GROUP BY c.name
ORDER BY c.name;

-- 10. Check ad spaces by publisher
SELECT 
  p.name as publisher,
  COUNT(a.id) as ad_space_count
FROM publishers p
LEFT JOIN ad_spaces a ON a.publisher_id = p.id
GROUP BY p.name
ORDER BY p.name;

