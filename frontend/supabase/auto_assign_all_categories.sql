-- ============================================
-- AUTO-ASSIGN CATEGORIES TO ALL EXISTING AD SPACES
-- This will match all ad spaces to categories based on keywords
-- ============================================

-- Step 1: Check current status (how many need categories)
SELECT 
  'Total Ad Spaces' as metric,
  COUNT(*)::text as value
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

-- Step 2: Preview what will be matched (see before running)
SELECT 
  a.id,
  a.title,
  a.description,
  CASE
    WHEN a.title ILIKE '%billboard%' OR a.description ILIKE '%billboard%' THEN 'Billboard'
    WHEN (a.title ILIKE '%digital%' OR a.description ILIKE '%digital%' 
          OR a.title ILIKE '%screen%' OR a.description ILIKE '%screen%'
          OR a.title ILIKE '%led%' OR a.description ILIKE '%led%'
          OR a.title ILIKE '%lcd%' OR a.description ILIKE '%lcd%') THEN 'Digital Screen'
    WHEN (a.title ILIKE '%bus%' OR a.description ILIKE '%bus%'
          OR a.title ILIKE '%bus station%' OR a.description ILIKE '%bus station%'
          OR a.title ILIKE '%bus stop%' OR a.description ILIKE '%bus stop%') THEN 'Bus Station'
    WHEN (a.title ILIKE '%cinema%' OR a.description ILIKE '%cinema%'
          OR a.title ILIKE '%film%' OR a.description ILIKE '%film%'
          OR a.title ILIKE '%movie%' OR a.description ILIKE '%movie%'
          OR a.title ILIKE '%theater%' OR a.description ILIKE '%theater%') THEN 'Cinema'
    WHEN (a.title ILIKE '%pos%' OR a.description ILIKE '%pos%'
          OR a.title ILIKE '%point of sale%' OR a.description ILIKE '%point of sale%'
          OR a.title ILIKE '%retail%' OR a.description ILIKE '%retail%'
          OR a.title ILIKE '%shop%' OR a.description ILIKE '%shop%'
          OR a.title ILIKE '%store%' OR a.description ILIKE '%store%') THEN 'Point of Sale'
    WHEN (a.title ILIKE '%transit%' OR a.description ILIKE '%transit%'
          OR a.title ILIKE '%metro%' OR a.description ILIKE '%metro%'
          OR a.title ILIKE '%train%' OR a.description ILIKE '%train%'
          OR a.title ILIKE '%railway%' OR a.description ILIKE '%railway%'
          OR a.title ILIKE '%subway%' OR a.description ILIKE '%subway%') THEN 'Transit'
    WHEN (a.title ILIKE '%airport%' OR a.description ILIKE '%airport%'
          OR a.title ILIKE '%terminal%' OR a.description ILIKE '%terminal%') THEN 'Airport'
    WHEN (a.title ILIKE '%corporate%' OR a.description ILIKE '%corporate%'
          OR a.title ILIKE '%office%' OR a.description ILIKE '%office%'
          OR a.title ILIKE '%business%' OR a.description ILIKE '%business%') THEN 'Corporate'
    WHEN (a.title ILIKE '%cafe%' OR a.description ILIKE '%cafe%'
          OR a.title ILIKE '%restaurant%' OR a.description ILIKE '%restaurant%'
          OR a.title ILIKE '%food%' OR a.description ILIKE '%food%') THEN 'Restaurant'
    WHEN (a.title ILIKE '%auto%' OR a.description ILIKE '%auto%'
          OR a.title ILIKE '%rickshaw%' OR a.description ILIKE '%rickshaw%'
          OR a.title ILIKE '%three wheeler%' OR a.description ILIKE '%three wheeler%') THEN 'Auto Rickshaw'
    WHEN (a.title ILIKE '%mall%' OR a.description ILIKE '%mall%'
          OR a.title ILIKE '%shopping center%' OR a.description ILIKE '%shopping center%') THEN 'Mall'
    ELSE '❓ No Match Found'
  END as will_match_to_category
FROM ad_spaces a
WHERE a.category_id IS NULL
ORDER BY will_match_to_category, a.title;

-- ============================================
-- Step 3: AUTO-ASSIGN CATEGORIES TO ALL AD SPACES
-- ============================================
-- This will match ALL ad spaces (even those with categories will be re-matched)
-- If you only want to match unmatched ones, change WHERE clause to: WHERE category_id IS NULL

UPDATE ad_spaces
SET category_id = CASE
  -- Billboard matching (highest priority - check first)
  WHEN (title ILIKE '%billboard%' OR description ILIKE '%billboard%')
    THEN (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1)
  
  -- Digital Screen matching
  WHEN (title ILIKE '%digital%' OR description ILIKE '%digital%' 
        OR title ILIKE '%screen%' OR description ILIKE '%screen%'
        OR title ILIKE '%led%' OR description ILIKE '%led%'
        OR title ILIKE '%lcd%' OR description ILIKE '%lcd%'
        OR title ILIKE '%display%' OR description ILIKE '%display%')
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
  
  -- Keep existing category if no match found
  ELSE category_id
END
RETURNING 
  id, 
  title, 
  category_id,
  (SELECT name FROM categories WHERE id = ad_spaces.category_id) as matched_category;

-- ============================================
-- Step 4: VERIFY RESULTS
-- ============================================

-- Check how many were matched
SELECT 
  c.name as category_name,
  COUNT(a.id) as total_ad_spaces,
  COUNT(CASE WHEN a.availability_status = 'available' THEN 1 END) as available_count
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.id, c.name
ORDER BY total_ad_spaces DESC;

-- Check if any ad spaces still don't have categories
SELECT 
  COUNT(*) as unmatched_count,
  'Ad spaces still without categories' as status
FROM ad_spaces
WHERE category_id IS NULL;

-- Show unmatched ad spaces (if any)
SELECT 
  id,
  title,
  description
FROM ad_spaces
WHERE category_id IS NULL
ORDER BY title;

-- ============================================
-- ALTERNATIVE: Only assign to unmatched ad spaces
-- ============================================
-- If you want to ONLY assign categories to ad spaces that don't have one yet,
-- use this version instead (adds WHERE category_id IS NULL):

/*
UPDATE ad_spaces
SET category_id = CASE
  WHEN (title ILIKE '%billboard%' OR description ILIKE '%billboard%')
    THEN (SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1)
  WHEN (title ILIKE '%digital%' OR description ILIKE '%digital%' 
        OR title ILIKE '%screen%' OR description ILIKE '%screen%')
    THEN (SELECT id FROM categories WHERE name = 'Digital Screen' LIMIT 1)
  WHEN (title ILIKE '%bus%' OR description ILIKE '%bus%')
    THEN (SELECT id FROM categories WHERE name = 'Bus Station' LIMIT 1)
  WHEN (title ILIKE '%cinema%' OR description ILIKE '%cinema%')
    THEN (SELECT id FROM categories WHERE name = 'Cinema' LIMIT 1)
  WHEN (title ILIKE '%pos%' OR description ILIKE '%pos%' 
        OR title ILIKE '%retail%' OR description ILIKE '%retail%')
    THEN (SELECT id FROM categories WHERE name = 'Point of Sale' LIMIT 1)
  WHEN (title ILIKE '%transit%' OR description ILIKE '%transit%' 
        OR title ILIKE '%metro%' OR description ILIKE '%metro%')
    THEN (SELECT id FROM categories WHERE name = 'Transit' LIMIT 1)
  ELSE category_id
END
WHERE category_id IS NULL  -- Only update unmatched ones
RETURNING id, title, category_id;
*/

-- ============================================
-- FINAL STATUS CHECK
-- ============================================

SELECT 
  '✅ Total Ad Spaces' as metric,
  COUNT(*)::text as value
FROM ad_spaces
UNION ALL
SELECT 
  '✅ Matched Ad Spaces',
  COUNT(*)::text
FROM ad_spaces
WHERE category_id IS NOT NULL
UNION ALL
SELECT 
  '⚠️ Unmatched Ad Spaces',
  COUNT(*)::text
FROM ad_spaces
WHERE category_id IS NULL
UNION ALL
SELECT 
  '📊 Match Percentage',
  ROUND((COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)::text || '%'
FROM ad_spaces;

