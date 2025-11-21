-- ============================================
-- MATCH CATEGORIES TO AD SPACES
-- Auto-match and assign categories based on keywords
-- ============================================

-- ============================================
-- 1. CHECK CURRENT MATCHING STATUS
-- ============================================

-- See which ad spaces are matched and which are not
SELECT 
  CASE 
    WHEN a.category_id IS NULL THEN '❌ Not Matched'
    ELSE '✅ Matched'
  END as match_status,
  COUNT(*) as count
FROM ad_spaces a
GROUP BY 
  CASE 
    WHEN a.category_id IS NULL THEN '❌ Not Matched'
    ELSE '✅ Matched'
  END;

-- See unmatched ad spaces with suggested categories
SELECT 
  a.id,
  a.title,
  a.description,
  CASE
    WHEN a.title ILIKE '%billboard%' OR a.description ILIKE '%billboard%' THEN 'Billboard'
    WHEN a.title ILIKE '%digital%' OR a.description ILIKE '%digital%' OR a.title ILIKE '%screen%' OR a.description ILIKE '%screen%' THEN 'Digital Screen'
    WHEN a.title ILIKE '%bus%' OR a.description ILIKE '%bus%' THEN 'Bus Station'
    WHEN a.title ILIKE '%cinema%' OR a.description ILIKE '%cinema%' OR a.title ILIKE '%film%' OR a.description ILIKE '%film%' THEN 'Cinema'
    WHEN a.title ILIKE '%pos%' OR a.description ILIKE '%pos%' OR a.title ILIKE '%point of sale%' OR a.description ILIKE '%point of sale%' OR a.title ILIKE '%retail%' THEN 'Point of Sale'
    WHEN a.title ILIKE '%transit%' OR a.description ILIKE '%transit%' OR a.title ILIKE '%metro%' OR a.description ILIKE '%metro%' OR a.title ILIKE '%train%' THEN 'Transit'
    WHEN a.title ILIKE '%airport%' OR a.description ILIKE '%airport%' THEN 'Airport'
    WHEN a.title ILIKE '%corporate%' OR a.description ILIKE '%corporate%' OR a.title ILIKE '%office%' THEN 'Corporate'
    WHEN a.title ILIKE '%cafe%' OR a.description ILIKE '%cafe%' OR a.title ILIKE '%restaurant%' THEN 'Restaurant'
    WHEN a.title ILIKE '%auto%' OR a.description ILIKE '%auto%' OR a.title ILIKE '%rickshaw%' THEN 'Auto Rickshaw'
    WHEN a.title ILIKE '%mall%' OR a.description ILIKE '%mall%' THEN 'Mall'
    ELSE '❓ No Match Found'
  END as suggested_category,
  a.price_per_day,
  l.city
FROM ad_spaces a
LEFT JOIN locations l ON a.location_id = l.id
WHERE a.category_id IS NULL
ORDER BY suggested_category, a.title;

-- ============================================
-- 2. AUTO-MATCH CATEGORIES TO AD SPACES
-- ============================================

-- Match and assign categories automatically (SAFE - only updates unmatched)
UPDATE ad_spaces
SET category_id = CASE
  -- Billboard matching
  WHEN (title ILIKE '%billboard%' OR description ILIKE '%billboard%')
    THEN (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1)
  
  -- Digital Screen matching
  WHEN (title ILIKE '%digital%' OR description ILIKE '%digital%' 
        OR title ILIKE '%screen%' OR description ILIKE '%screen%'
        OR title ILIKE '%led%' OR description ILIKE '%led%'
        OR title ILIKE '%lcd%' OR description ILIKE '%lcd%')
    THEN (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1)
  
  -- Bus Station matching
  WHEN (title ILIKE '%bus%' OR description ILIKE '%bus%'
        OR title ILIKE '%bus station%' OR description ILIKE '%bus station%'
        OR title ILIKE '%bus stop%' OR description ILIKE '%bus stop%')
    THEN (SELECT id FROM categories WHERE name = 'Bus Station' LIMIT 1)
  
  -- Cinema matching
  WHEN (title ILIKE '%cinema%' OR description ILIKE '%cinema%'
        OR title ILIKE '%film%' OR description ILIKE '%film%'
        OR title ILIKE '%movie%' OR description ILIKE '%movie%'
        OR title ILIKE '%theater%' OR description ILIKE '%theater%')
    THEN (SELECT id FROM categories WHERE name = 'Cinema' LIMIT 1)
  
  -- Point of Sale matching
  WHEN (title ILIKE '%pos%' OR description ILIKE '%pos%'
        OR title ILIKE '%point of sale%' OR description ILIKE '%point of sale%'
        OR title ILIKE '%retail%' OR description ILIKE '%retail%'
        OR title ILIKE '%shop%' OR description ILIKE '%shop%'
        OR title ILIKE '%store%' OR description ILIKE '%store%')
    THEN (SELECT id FROM categories WHERE name = 'Point of Sale' LIMIT 1)
  
  -- Transit matching
  WHEN (title ILIKE '%transit%' OR description ILIKE '%transit%'
        OR title ILIKE '%metro%' OR description ILIKE '%metro%'
        OR title ILIKE '%train%' OR description ILIKE '%train%'
        OR title ILIKE '%railway%' OR description ILIKE '%railway%'
        OR title ILIKE '%subway%' OR description ILIKE '%subway%')
    THEN (SELECT id FROM categories WHERE name = 'Transit' LIMIT 1)
  
  -- Airport matching
  WHEN (title ILIKE '%airport%' OR description ILIKE '%airport%'
        OR title ILIKE '%terminal%' OR description ILIKE '%terminal%')
    THEN (SELECT id FROM categories WHERE name = 'Airport' LIMIT 1)
  
  -- Corporate matching
  WHEN (title ILIKE '%corporate%' OR description ILIKE '%corporate%'
        OR title ILIKE '%office%' OR description ILIKE '%office%'
        OR title ILIKE '%business%' OR description ILIKE '%business%')
    THEN (SELECT id FROM categories WHERE name = 'Corporate' LIMIT 1)
  
  -- Restaurant/Cafe matching
  WHEN (title ILIKE '%cafe%' OR description ILIKE '%cafe%'
        OR title ILIKE '%restaurant%' OR description ILIKE '%restaurant%'
        OR title ILIKE '%food%' OR description ILIKE '%food%')
    THEN (SELECT id FROM categories WHERE name = 'Restaurant' LIMIT 1)
  
  -- Auto Rickshaw matching
  WHEN (title ILIKE '%auto%' OR description ILIKE '%auto%'
        OR title ILIKE '%rickshaw%' OR description ILIKE '%rickshaw%'
        OR title ILIKE '%three wheeler%' OR description ILIKE '%three wheeler%')
    THEN (SELECT id FROM categories WHERE name = 'Auto Rickshaw' LIMIT 1)
  
  -- Mall matching
  WHEN (title ILIKE '%mall%' OR description ILIKE '%mall%'
        OR title ILIKE '%shopping center%' OR description ILIKE '%shopping center%')
    THEN (SELECT id FROM categories WHERE name = 'Mall' LIMIT 1)
  
  -- Keep existing category if already assigned
  ELSE category_id
END
WHERE category_id IS NULL  -- Only update unmatched ad spaces
RETURNING 
  id, 
  title, 
  category_id,
  (SELECT name FROM categories WHERE id = ad_spaces.category_id) as matched_category;

-- ============================================
-- 3. VERIFY MATCHING RESULTS
-- ============================================

-- Check matching results after auto-assignment
SELECT 
  c.name as category_name,
  COUNT(a.id) as matched_count,
  COUNT(CASE WHEN a.availability_status = 'available' THEN 1 END) as available_count
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.id, c.name
ORDER BY matched_count DESC;

-- See which ad spaces still need manual matching
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  l.city,
  'Needs Manual Review' as status
FROM ad_spaces a
LEFT JOIN locations l ON a.location_id = l.id
WHERE a.category_id IS NULL
ORDER BY a.title;

-- ============================================
-- 4. MANUAL MATCHING QUERIES
-- ============================================

-- Manually assign a specific category to an ad space by ID
-- Replace 'AD_SPACE_ID' with actual ad space ID and 'Category Name' with category name
UPDATE ad_spaces
SET category_id = (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1)
WHERE id = (SELECT id FROM ad_spaces WHERE title ILIKE '%your search term%' LIMIT 1)
RETURNING id, title, category_id;

-- Assign category to multiple ad spaces by title pattern
UPDATE ad_spaces
SET category_id = (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1)
WHERE title ILIKE '%digital%'
  AND category_id IS NULL
RETURNING id, title, category_id;

-- ============================================
-- 5. MATCHING STATISTICS
-- ============================================

-- Overall matching statistics
SELECT 
  'Total Ad Spaces' as metric,
  COUNT(*)::text as value
FROM ad_spaces
UNION ALL
SELECT 
  'Matched Ad Spaces',
  COUNT(*)::text
FROM ad_spaces
WHERE category_id IS NOT NULL
UNION ALL
SELECT 
  'Unmatched Ad Spaces',
  COUNT(*)::text
FROM ad_spaces
WHERE category_id IS NULL
UNION ALL
SELECT 
  'Match Percentage',
  ROUND((COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)::text || '%'
FROM ad_spaces;

-- Matching by category
SELECT 
  c.name as category_name,
  COUNT(a.id) as total_matched,
  ROUND(AVG(a.price_per_day), 2) as avg_price
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.id, c.name
ORDER BY total_matched DESC;

-- ============================================
-- 6. FIX MISMATCHED CATEGORIES
-- ============================================

-- Find ad spaces that might be in wrong category
-- Example: Billboard in Digital Screen category
SELECT 
  a.id,
  a.title,
  a.description,
  c.name as current_category,
  CASE
    WHEN a.title ILIKE '%billboard%' AND c.name != 'Billboard' THEN 'Should be Billboard'
    WHEN a.title ILIKE '%digital%' AND c.name != 'Digital Screen' THEN 'Should be Digital Screen'
    WHEN a.title ILIKE '%bus%' AND c.name != 'Bus Station' THEN 'Should be Bus Station'
    ELSE 'Check manually'
  END as suggested_fix
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
WHERE (
  (a.title ILIKE '%billboard%' AND c.name != 'Billboard')
  OR (a.title ILIKE '%digital%' AND c.name != 'Digital Screen')
  OR (a.title ILIKE '%bus%' AND c.name != 'Bus Station')
)
LIMIT 20;

-- ============================================
-- 7. COMPLETE MATCHING REPORT
-- ============================================

-- Full report of all ad spaces and their category matches
SELECT 
  a.id,
  a.title,
  a.price_per_day,
  a.availability_status,
  COALESCE(c.name, '❌ Not Matched') as category_name,
  COALESCE(c.icon_url, '') as category_icon,
  l.city,
  l.state,
  CASE 
    WHEN a.category_id IS NULL THEN '⚠️ Needs Matching'
    ELSE '✅ Matched'
  END as match_status
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
ORDER BY 
  CASE WHEN a.category_id IS NULL THEN 0 ELSE 1 END,  -- Unmatched first
  c.name,
  a.title;

-- ============================================
-- QUICK START - RUN THESE IN ORDER
-- ============================================

-- Step 1: Check current status
SELECT 
  COUNT(*) FILTER (WHERE category_id IS NULL) as unmatched,
  COUNT(*) FILTER (WHERE category_id IS NOT NULL) as matched,
  COUNT(*) as total
FROM ad_spaces;

-- Step 2: See what will be matched (preview)
SELECT 
  a.title,
  CASE
    WHEN a.title ILIKE '%billboard%' THEN 'Billboard'
    WHEN a.title ILIKE '%digital%' OR a.title ILIKE '%screen%' THEN 'Digital Screen'
    WHEN a.title ILIKE '%bus%' THEN 'Bus Station'
    WHEN a.title ILIKE '%cinema%' THEN 'Cinema'
    WHEN a.title ILIKE '%pos%' OR a.title ILIKE '%retail%' THEN 'Point of Sale'
    WHEN a.title ILIKE '%transit%' OR a.title ILIKE '%metro%' THEN 'Transit'
    ELSE 'No Match'
  END as will_match_to
FROM ad_spaces a
WHERE a.category_id IS NULL
LIMIT 20;

-- Step 3: Run the auto-match (Section 2 above)
-- This will assign categories automatically

-- Step 4: Verify results
SELECT 
  c.name,
  COUNT(a.id) as count
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.name
ORDER BY count DESC;

-- ============================================
-- END
-- ============================================

