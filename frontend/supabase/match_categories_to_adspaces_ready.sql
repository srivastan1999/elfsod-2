-- ============================================
-- MATCH CATEGORIES TO AD SPACES - READY TO EXECUTE
-- ============================================
-- This script automatically matches categories to their first ad space
-- and sets parent_category_id to the ad space ID

-- Step 1: Drop existing foreign key constraint
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_parent_category_id_fkey;

-- Step 2: Set all parent_category_id to NULL first
UPDATE categories
SET parent_category_id = NULL;

-- Step 3: Match each category to its first ad space (by creation date)
-- This automatically finds the first ad space for each category
UPDATE categories c
SET parent_category_id = (
  SELECT a.id 
  FROM ad_spaces a 
  WHERE a.category_id = c.id 
  ORDER BY a.created_at ASC 
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 
  FROM ad_spaces a 
  WHERE a.category_id = c.id
);

-- Step 4: Create new foreign key constraint to ad_spaces
ALTER TABLE categories
ADD CONSTRAINT categories_parent_category_id_fkey 
FOREIGN KEY (parent_category_id) 
REFERENCES ad_spaces(id)
ON DELETE SET NULL;

-- ============================================
-- VERIFY THE MATCHES
-- ============================================

-- View all categories with their matched ad spaces
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.parent_category_id as ad_space_id,
  a.title as ad_space_title,
  a.description as ad_space_description
FROM categories c
LEFT JOIN ad_spaces a ON c.parent_category_id = a.id
WHERE c.parent_category_id IS NOT NULL
ORDER BY c.name;

-- Summary: Categories with ad space counts
SELECT 
  c.name as category_name,
  COUNT(DISTINCT a.id) as total_ad_spaces_in_category,
  c.parent_category_id as matched_ad_space_id,
  matched.title as matched_ad_space_title,
  CASE 
    WHEN c.parent_category_id IS NOT NULL THEN '✅ Matched'
    ELSE '❌ No match'
  END as match_status
FROM categories c
LEFT JOIN ad_spaces a ON a.category_id = c.id
LEFT JOIN ad_spaces matched ON c.parent_category_id = matched.id
GROUP BY c.id, c.name, c.parent_category_id, matched.title
ORDER BY c.name;

