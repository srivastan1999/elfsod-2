-- ============================================
-- VERIFY CATEGORIES AND AD SPACES
-- Run this to check everything is connected properly
-- ============================================

-- 1. Show all categories with their ad space counts
SELECT 
  c.id,
  c.name,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN ad_spaces a ON a.category_id = c.id
GROUP BY c.id, c.name
ORDER BY ad_space_count DESC, c.name;

-- 2. Show Billboards specifically
SELECT 
  'Billboards Category' as info,
  COUNT(*) as total_spaces
FROM ad_spaces a
JOIN categories c ON a.category_id = c.id
WHERE c.name = 'Billboards';

-- 3. List all Billboard ad spaces
SELECT 
  a.id,
  a.title,
  a.display_type,
  a.price_per_day,
  l.city,
  l.address
FROM ad_spaces a
JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE c.name = 'Billboards'
ORDER BY a.title;

-- 4. Check for any orphaned ad spaces (no category)
SELECT 
  'Orphaned Ad Spaces (no category)' as info,
  COUNT(*) as count
FROM ad_spaces
WHERE category_id IS NULL;

-- 5. Summary
SELECT 
  'SUMMARY' as report,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM ad_spaces) as total_ad_spaces,
  (SELECT COUNT(*) FROM ad_spaces WHERE category_id IS NOT NULL) as categorized_spaces,
  (SELECT COUNT(*) FROM ad_spaces WHERE category_id IS NULL) as uncategorized_spaces;

