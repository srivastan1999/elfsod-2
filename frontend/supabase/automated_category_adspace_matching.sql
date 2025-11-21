-- ============================================
-- AUTOMATED CATEGORY TO AD SPACE MATCHING QUERIES
-- ============================================
-- These queries automatically match categories to ad spaces without manual ID entry

-- ============================================
-- QUERY 1: Get all ad spaces grouped by category
-- ============================================
-- Automatically processes all categories and their ad spaces
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.parent_category_id as category_representative_ad_space_id,
  rep.title as category_representative_title,
  rep.description as category_representative_description,
  a.id as ad_space_id,
  a.title as ad_space_title,
  a.description as ad_space_description,
  a.price_per_day,
  a.price_per_month,
  a.availability_status,
  a.latitude,
  a.longitude
FROM categories c
INNER JOIN ad_spaces a ON a.category_id = c.id
LEFT JOIN ad_spaces rep ON c.parent_category_id = rep.id
WHERE c.parent_category_id IS NOT NULL
ORDER BY c.name, a.title;

-- ============================================
-- QUERY 2: Get categories with their ad spaces (summary)
-- ============================================
-- Shows each category with count of ad spaces and representative ad space
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.parent_category_id as representative_ad_space_id,
  rep.title as representative_ad_space_title,
  COUNT(a.id) as total_ad_spaces,
  COUNT(CASE WHEN a.availability_status = 'available' THEN 1 END) as available_spaces,
  AVG(a.price_per_day) as avg_price_per_day
FROM categories c
LEFT JOIN ad_spaces rep ON c.parent_category_id = rep.id
LEFT JOIN ad_spaces a ON a.category_id = c.id
WHERE c.parent_category_id IS NOT NULL
GROUP BY c.id, c.name, c.parent_category_id, rep.title
ORDER BY c.name;

-- ============================================
-- QUERY 3: Filter ad spaces by category name (automated)
-- ============================================
-- Replace 'Restaurant' with any category name - no manual ID needed
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  a.price_per_month,
  a.availability_status,
  c.name as category_name,
  c.parent_category_id as category_representative_id,
  rep.title as category_representative_title
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN ad_spaces rep ON c.parent_category_id = rep.id
WHERE c.name = 'Restaurant'  -- Change category name here
ORDER BY a.title;

-- ============================================
-- QUERY 4: Get all ad spaces for categories that have parent_category_id set
-- ============================================
-- Automatically processes all categories with parent_category_id
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  a.availability_status,
  c.name as category_name,
  c.parent_category_id as category_linked_ad_space_id,
  rep.title as category_linked_ad_space_title
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN ad_spaces rep ON c.parent_category_id = rep.id
WHERE c.parent_category_id IS NOT NULL
  AND c.parent_category_id IN (SELECT id FROM ad_spaces)
ORDER BY c.name, a.title;

-- ============================================
-- QUERY 5: Find similar ad spaces (same category)
-- ============================================
-- Given an ad space ID, find all ad spaces in the same category
-- Replace 'YOUR_AD_SPACE_ID' with actual ID or use in a function
WITH target_ad_space AS (
  SELECT category_id 
  FROM ad_spaces 
  WHERE id = 'YOUR_AD_SPACE_ID'  -- Replace with actual ad space ID
)
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  a.availability_status,
  c.name as category_name,
  c.parent_category_id as category_representative_id
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
INNER JOIN target_ad_space t ON a.category_id = t.category_id
WHERE a.id != 'YOUR_AD_SPACE_ID'  -- Exclude the original ad space
ORDER BY a.title;

-- ============================================
-- QUERY 6: Get all categories with their first ad space as representative
-- ============================================
-- This shows which ad space is linked to each category via parent_category_id
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.parent_category_id as representative_ad_space_id,
  rep.id as representative_ad_space_id_full,
  rep.title as representative_ad_space_title,
  rep.description as representative_ad_space_description,
  COUNT(a.id) as total_ad_spaces_in_category
FROM categories c
LEFT JOIN ad_spaces rep ON c.parent_category_id = rep.id
LEFT JOIN ad_spaces a ON a.category_id = c.id
WHERE c.parent_category_id IS NOT NULL
GROUP BY c.id, c.name, c.parent_category_id, rep.id, rep.title, rep.description
ORDER BY c.name;

-- ============================================
-- QUERY 7: Filter by multiple categories (automated)
-- ============================================
-- Get ad spaces for multiple categories at once
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  a.availability_status,
  c.name as category_name,
  c.parent_category_id as category_representative_id
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
WHERE c.name IN ('Restaurant', 'Hotel', 'Metro')  -- Add more category names
  AND c.parent_category_id IS NOT NULL
ORDER BY c.name, a.title;

-- ============================================
-- QUERY 8: Get ad spaces by category's representative ad space
-- ============================================
-- Find all ad spaces in categories where parent_category_id matches a list of ad space IDs
-- This is useful when you have a list of representative ad spaces
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  a.availability_status,
  c.name as category_name,
  c.parent_category_id as category_representative_id,
  rep.title as category_representative_title
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN ad_spaces rep ON c.parent_category_id = rep.id
WHERE c.parent_category_id IN (
  -- List of ad space IDs (representative ad spaces)
  SELECT id FROM ad_spaces 
  WHERE title LIKE '%Billboard%'  -- Example: filter by title pattern
  -- OR use specific IDs: WHERE id IN ('id1', 'id2', 'id3')
)
ORDER BY c.name, a.title;

