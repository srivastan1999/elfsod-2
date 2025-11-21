-- ============================================
-- MAP AD SPACES WITH CATEGORIES - QUERIES
-- ============================================

-- ============================================
-- 1. BASIC MAPPING - Ad Spaces with Categories
-- ============================================

-- Get all ad spaces with their category information
SELECT 
  a.id as ad_space_id,
  a.title,
  a.description,
  a.price_per_day,
  a.price_per_month,
  a.availability_status,
  c.id as category_id,
  c.name as category_name,
  c.description as category_description,
  c.icon_url as category_icon
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
ORDER BY c.name, a.title;

-- ============================================
-- 2. GROUPED BY CATEGORY - Categories with Ad Spaces
-- ============================================

-- Get categories with their ad spaces (grouped)
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.description as category_description,
  COUNT(a.id) as total_ad_spaces,
  COUNT(CASE WHEN a.availability_status = 'available' THEN 1 END) as available_spaces,
  COUNT(CASE WHEN a.availability_status = 'booked' THEN 1 END) as booked_spaces,
  AVG(a.price_per_day) as avg_price_per_day,
  AVG(a.price_per_month) as avg_price_per_month,
  MIN(a.price_per_day) as min_price_per_day,
  MAX(a.price_per_day) as max_price_per_day
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.id, c.name, c.description
ORDER BY total_ad_spaces DESC, c.name;

-- ============================================
-- 3. DETAILED MAPPING - Full Ad Space Details with Category
-- ============================================

-- Get complete ad space information with category and location
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
  a.images,
  a.dimensions,
  -- Category information
  c.id as category_id,
  c.name as category_name,
  c.description as category_description,
  c.icon_url as category_icon,
  -- Location information
  l.id as location_id,
  l.city,
  l.state,
  l.address,
  l.latitude,
  l.longitude,
  -- Publisher information
  p.id as publisher_id,
  p.name as publisher_name,
  p.verification_status as publisher_status
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
LEFT JOIN publishers p ON a.publisher_id = p.id
ORDER BY c.name, a.title;

-- ============================================
-- 4. CATEGORY-WISE LISTING - Ad Spaces Grouped by Category
-- ============================================

-- Get ad spaces grouped by category (useful for displaying)
SELECT 
  c.name as category_name,
  c.icon_url as category_icon,
  json_agg(
    json_build_object(
      'id', a.id,
      'title', a.title,
      'price_per_day', a.price_per_day,
      'price_per_month', a.price_per_month,
      'availability_status', a.availability_status,
      'city', l.city,
      'state', l.state
    ) ORDER BY a.title
  ) as ad_spaces
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
LEFT JOIN locations l ON a.location_id = l.id
GROUP BY c.id, c.name, c.icon_url
HAVING COUNT(a.id) > 0
ORDER BY c.name;

-- ============================================
-- 5. FILTER BY CATEGORY - Ad Spaces in Specific Category
-- ============================================

-- Get all ad spaces for a specific category
SELECT 
  a.*,
  c.name as category_name,
  c.icon_url as category_icon,
  l.city,
  l.state
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.name = 'Billboard'  -- Change category name here
  AND a.availability_status = 'available'
ORDER BY a.price_per_day;

-- Get ad spaces by category ID (use the query below first to get category IDs)
-- First, get all category IDs:
-- SELECT id, name FROM categories ORDER BY name;

-- Then use one of the IDs in the query below:
SELECT 
  a.*,
  c.name as category_name,
  l.city,
  l.state
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.id = (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1)  -- Change category name
ORDER BY a.title;

-- OR get category ID first, then use it:
-- Step 1: Get category ID
-- SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1;
-- Step 2: Copy the ID and use it below (replace the UUID)
-- WHERE c.id = 'paste-category-id-here'

-- ============================================
-- 6. CATEGORY STATISTICS - Summary by Category
-- ============================================

-- Get statistics for each category
SELECT 
  c.id,
  c.name as category_name,
  c.icon_url,
  COUNT(DISTINCT a.id) as total_ad_spaces,
  COUNT(DISTINCT CASE WHEN a.availability_status = 'available' THEN a.id END) as available_count,
  COUNT(DISTINCT CASE WHEN a.availability_status = 'booked' THEN a.id END) as booked_count,
  COUNT(DISTINCT l.city) as cities_count,
  COUNT(DISTINCT p.id) as publishers_count,
  ROUND(AVG(a.price_per_day), 2) as avg_daily_price,
  ROUND(AVG(a.price_per_month), 2) as avg_monthly_price,
  ROUND(AVG(a.daily_impressions), 0) as avg_daily_impressions,
  ROUND(SUM(a.daily_impressions), 0) as total_daily_impressions
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
LEFT JOIN locations l ON a.location_id = l.id
LEFT JOIN publishers p ON a.publisher_id = p.id
GROUP BY c.id, c.name, c.icon_url
ORDER BY total_ad_spaces DESC;

-- ============================================
-- 7. CATEGORIES WITH NO AD SPACES
-- ============================================

-- Find categories that don't have any ad spaces
SELECT 
  c.id,
  c.name,
  c.description,
  c.icon_url
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
WHERE a.id IS NULL
ORDER BY c.name;

-- ============================================
-- 8. AD SPACES WITHOUT CATEGORIES
-- ============================================

-- Find ad spaces that don't have a category assigned
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  a.availability_status,
  l.city,
  l.state
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.id IS NULL
ORDER BY a.title;

-- ============================================
-- 9. MAP BY CITY AND CATEGORY
-- ============================================

-- Get ad spaces grouped by city and category
SELECT 
  l.city,
  c.name as category_name,
  COUNT(a.id) as ad_space_count,
  AVG(a.price_per_day) as avg_price_per_day,
  SUM(a.daily_impressions) as total_impressions
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
INNER JOIN locations l ON a.location_id = l.id
WHERE a.availability_status = 'available'
GROUP BY l.city, c.name
ORDER BY l.city, ad_space_count DESC;

-- ============================================
-- 10. SEARCH WITH CATEGORY FILTER
-- ============================================

-- Search ad spaces by category and other filters
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  a.price_per_month,
  a.availability_status,
  c.name as category_name,
  c.icon_url as category_icon,
  l.city,
  l.state,
  l.address
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
INNER JOIN locations l ON a.location_id = l.id
WHERE 
  c.name = 'Billboard'  -- Category filter
  AND l.city = 'Mumbai'  -- City filter (optional)
  AND a.availability_status = 'available'  -- Status filter
  AND a.price_per_day BETWEEN 1000 AND 50000  -- Price range (optional)
ORDER BY a.price_per_day;

-- ============================================
-- 11. CATEGORY HIERARCHY (if using parent categories)
-- ============================================

-- Get categories with parent-child relationships and their ad spaces
SELECT 
  parent.id as parent_category_id,
  parent.name as parent_category_name,
  child.id as child_category_id,
  child.name as child_category_name,
  COUNT(a.id) as ad_space_count
FROM categories parent
LEFT JOIN categories child ON parent.id = child.parent_category_id
LEFT JOIN ad_spaces a ON child.id = a.category_id
WHERE parent.parent_category_id IS NULL
GROUP BY parent.id, parent.name, child.id, child.name
ORDER BY parent.name, child.name;

-- ============================================
-- 12. MOST POPULAR CATEGORIES
-- ============================================

-- Get categories ordered by number of ad spaces
SELECT 
  c.id,
  c.name,
  c.icon_url,
  COUNT(a.id) as ad_space_count,
  COUNT(CASE WHEN a.availability_status = 'available' THEN 1 END) as available_count
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.id, c.name, c.icon_url
ORDER BY ad_space_count DESC
LIMIT 10;

-- ============================================
-- 13. CATEGORY PRICE RANGES
-- ============================================

-- Get price ranges for each category
SELECT 
  c.name as category_name,
  MIN(a.price_per_day) as min_price_per_day,
  MAX(a.price_per_day) as max_price_per_day,
  ROUND(AVG(a.price_per_day), 2) as avg_price_per_day,
  MIN(a.price_per_month) as min_price_per_month,
  MAX(a.price_per_month) as max_price_per_month,
  ROUND(AVG(a.price_per_month), 2) as avg_price_per_month
FROM categories c
INNER JOIN ad_spaces a ON c.id = a.category_id
WHERE a.availability_status = 'available'
GROUP BY c.id, c.name
ORDER BY avg_price_per_day DESC;

-- ============================================
-- 14. UPDATE AD SPACES TO MAP WITH CATEGORIES
-- ============================================

-- Update ad spaces to assign categories based on title/description
-- Example: Assign "Billboard" category to ad spaces with "billboard" in title
UPDATE ad_spaces
SET category_id = (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1)
WHERE (title ILIKE '%billboard%' OR description ILIKE '%billboard%')
  AND category_id IS NULL;

-- Update ad spaces to assign "Digital Screen" category
UPDATE ad_spaces
SET category_id = (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1)
WHERE (title ILIKE '%digital%' OR description ILIKE '%digital%' OR title ILIKE '%screen%' OR description ILIKE '%screen%')
  AND category_id IS NULL;

-- Update ad spaces to assign "Bus Station" category
UPDATE ad_spaces
SET category_id = (SELECT id FROM categories WHERE name = 'Bus Station' LIMIT 1)
WHERE (title ILIKE '%bus%' OR description ILIKE '%bus%')
  AND category_id IS NULL;

-- ============================================
-- 15. BULK MAP AD SPACES TO CATEGORIES
-- ============================================

-- Map all ad spaces to categories based on keywords
UPDATE ad_spaces
SET category_id = CASE
  WHEN title ILIKE '%billboard%' OR description ILIKE '%billboard%' 
    THEN (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1)
  WHEN title ILIKE '%digital%' OR description ILIKE '%digital%' OR title ILIKE '%screen%' OR description ILIKE '%screen%'
    THEN (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1)
  WHEN title ILIKE '%bus%' OR description ILIKE '%bus%'
    THEN (SELECT id FROM categories WHERE name = 'Bus Station' LIMIT 1)
  WHEN title ILIKE '%cinema%' OR description ILIKE '%cinema%' OR title ILIKE '%film%' OR description ILIKE '%film%'
    THEN (SELECT id FROM categories WHERE name = 'Cinema' LIMIT 1)
  WHEN title ILIKE '%pos%' OR description ILIKE '%pos%' OR title ILIKE '%point of sale%' OR description ILIKE '%point of sale%'
    THEN (SELECT id FROM categories WHERE name = 'Point of Sale' LIMIT 1)
  WHEN title ILIKE '%transit%' OR description ILIKE '%transit%' OR title ILIKE '%metro%' OR description ILIKE '%metro%'
    THEN (SELECT id FROM categories WHERE name = 'Transit' LIMIT 1)
  ELSE category_id  -- Keep existing category if no match
END
WHERE category_id IS NULL
RETURNING id, title, category_id;

-- ============================================
-- 16. VERIFY MAPPING
-- ============================================

-- Check mapping completeness
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
WHERE category_id IS NULL
UNION ALL
SELECT 
  'Categories with Ad Spaces',
  COUNT(DISTINCT category_id)::text
FROM ad_spaces
WHERE category_id IS NOT NULL;

-- ============================================
-- END OF QUERIES
-- ============================================

