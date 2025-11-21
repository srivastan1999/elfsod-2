-- ============================================
-- READY-TO-USE QUERIES - MAP AD SPACES WITH CATEGORIES
-- No placeholders - just copy and run!
-- ============================================

-- ============================================
-- 1. VIEW ALL CATEGORY IDs AND NAMES
-- ============================================
-- Run this first to see all available categories
SELECT id, name, description FROM categories ORDER BY name;

-- ============================================
-- 2. MAP ALL AD SPACES WITH THEIR CATEGORIES
-- ============================================
SELECT 
  a.id as ad_space_id,
  a.title,
  a.price_per_day,
  a.price_per_month,
  a.availability_status,
  c.name as category_name,
  c.icon_url as category_icon,
  l.city,
  l.state
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
ORDER BY c.name, a.title;

-- ============================================
-- 3. CATEGORIES WITH AD SPACE COUNTS
-- ============================================
SELECT 
  c.name as category_name,
  COUNT(a.id) as total_ad_spaces,
  COUNT(CASE WHEN a.availability_status = 'available' THEN 1 END) as available_spaces,
  COUNT(CASE WHEN a.availability_status = 'booked' THEN 1 END) as booked_spaces
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.id, c.name
ORDER BY total_ad_spaces DESC;

-- ============================================
-- 4. AD SPACES BY CATEGORY NAME (EASY!)
-- ============================================
-- Just change 'Billboard' to any category name you want

-- Billboard category
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  a.price_per_month,
  a.availability_status,
  l.city,
  l.state
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.name = 'Billboard'
ORDER BY a.price_per_day;

-- Digital Screen category
SELECT 
  a.id,
  a.title,
  a.price_per_day,
  a.availability_status,
  l.city
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.name = 'Digital Screen'
ORDER BY a.price_per_day;

-- Bus Station category
SELECT 
  a.id,
  a.title,
  a.price_per_day,
  a.availability_status,
  l.city
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.name = 'Bus Station'
ORDER BY a.price_per_day;

-- Cinema category
SELECT 
  a.id,
  a.title,
  a.price_per_day,
  a.availability_status,
  l.city
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.name = 'Cinema'
ORDER BY a.price_per_day;

-- Point of Sale category
SELECT 
  a.id,
  a.title,
  a.price_per_day,
  a.availability_status,
  l.city
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.name = 'Point of Sale'
ORDER BY a.price_per_day;

-- Transit category
SELECT 
  a.id,
  a.title,
  a.price_per_day,
  a.availability_status,
  l.city
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.name = 'Transit'
ORDER BY a.price_per_day;

-- ============================================
-- 5. AVAILABLE AD SPACES BY CATEGORY
-- ============================================
SELECT 
  c.name as category_name,
  COUNT(a.id) as available_count,
  ROUND(AVG(a.price_per_day), 2) as avg_price_per_day,
  MIN(a.price_per_day) as min_price,
  MAX(a.price_per_day) as max_price
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id AND a.availability_status = 'available'
GROUP BY c.id, c.name
HAVING COUNT(a.id) > 0
ORDER BY available_count DESC;

-- ============================================
-- 6. FIND AD SPACES WITHOUT CATEGORIES
-- ============================================
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  l.city,
  l.state
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.id IS NULL
ORDER BY a.title;

-- ============================================
-- 7. FIND CATEGORIES WITH NO AD SPACES
-- ============================================
SELECT 
  c.id,
  c.name,
  c.description
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
WHERE a.id IS NULL
ORDER BY c.name;

-- ============================================
-- 8. AUTO-ASSIGN CATEGORIES TO AD SPACES
-- ============================================
-- This will automatically assign categories based on title/description keywords
-- Safe to run - only updates ad spaces that don't have a category

UPDATE ad_spaces
SET category_id = CASE
  WHEN (title ILIKE '%billboard%' OR description ILIKE '%billboard%')
    THEN (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1)
  WHEN (title ILIKE '%digital%' OR description ILIKE '%digital%' OR title ILIKE '%screen%' OR description ILIKE '%screen%')
    THEN (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1)
  WHEN (title ILIKE '%bus%' OR description ILIKE '%bus%')
    THEN (SELECT id FROM categories WHERE name = 'Bus Station' LIMIT 1)
  WHEN (title ILIKE '%cinema%' OR description ILIKE '%cinema%' OR title ILIKE '%film%' OR description ILIKE '%film%')
    THEN (SELECT id FROM categories WHERE name = 'Cinema' LIMIT 1)
  WHEN (title ILIKE '%pos%' OR description ILIKE '%pos%' OR title ILIKE '%point of sale%' OR description ILIKE '%point of sale%')
    THEN (SELECT id FROM categories WHERE name = 'Point of Sale' LIMIT 1)
  WHEN (title ILIKE '%transit%' OR description ILIKE '%transit%' OR title ILIKE '%metro%' OR description ILIKE '%metro%')
    THEN (SELECT id FROM categories WHERE name = 'Transit' LIMIT 1)
  ELSE category_id  -- Keep existing category
END
WHERE category_id IS NULL
RETURNING id, title, category_id;

-- ============================================
-- 9. VERIFY MAPPING STATUS
-- ============================================
SELECT 
  'Total Categories' as metric,
  COUNT(*)::text as value
FROM categories
UNION ALL
SELECT 
  'Total Ad Spaces',
  COUNT(*)::text
FROM ad_spaces
UNION ALL
SELECT 
  'Ad Spaces with Categories',
  COUNT(*)::text
FROM ad_spaces
WHERE category_id IS NOT NULL
UNION ALL
SELECT 
  'Ad Spaces without Categories',
  COUNT(*)::text
FROM ad_spaces
WHERE category_id IS NULL;

-- ============================================
-- 10. COMPLETE MAPPING WITH ALL DETAILS
-- ============================================
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  a.price_per_month,
  a.daily_impressions,
  a.monthly_footfall,
  a.availability_status,
  a.display_type,
  -- Category
  c.id as category_id,
  c.name as category_name,
  c.icon_url as category_icon,
  -- Location
  l.city,
  l.state,
  l.address,
  -- Publisher
  p.name as publisher_name
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
LEFT JOIN publishers p ON a.publisher_id = p.id
ORDER BY c.name, a.title
LIMIT 100;  -- Adjust limit as needed

-- ============================================
-- END - All queries are ready to use!
-- ============================================

