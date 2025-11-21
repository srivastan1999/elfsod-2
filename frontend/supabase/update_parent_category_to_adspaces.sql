-- ============================================
-- UPDATE PARENT_CATEGORY_ID TO REFERENCE AD_SPACES
-- ============================================
-- This script updates parent_category_id to reference ad_spaces.id instead of categories.id
-- NOTE: This requires modifying the foreign key constraint first

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_parent_category_id_fkey;

-- Step 2: Update parent_category_id to reference ad_spaces instead
-- Match each category to the first ad space that belongs to it
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

-- Step 3: Create new foreign key constraint to ad_spaces
-- NOTE: This will only work if you want parent_category_id to reference ad_spaces
-- If the schema should still reference categories, skip this step
ALTER TABLE categories
ADD CONSTRAINT categories_parent_category_id_fkey 
FOREIGN KEY (parent_category_id) 
REFERENCES ad_spaces(id)
ON DELETE SET NULL;

-- ============================================
-- VERIFY THE UPDATES
-- ============================================

-- View categories with their matched ad spaces
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.parent_category_id as ad_space_id,
  a.title as ad_space_title
FROM categories c
LEFT JOIN ad_spaces a ON c.parent_category_id = a.id
ORDER BY c.name;

-- View categories that were matched
SELECT 
  c.name as category_name,
  COUNT(a.id) as total_ad_spaces,
  c.parent_category_id as matched_ad_space_id
FROM categories c
LEFT JOIN ad_spaces a ON a.category_id = c.id
WHERE c.parent_category_id IS NOT NULL
GROUP BY c.id, c.name, c.parent_category_id
ORDER BY c.name;

-- ============================================
-- ALTERNATIVE: If you want to keep the constraint to categories
-- but still store ad_space IDs, you would need to:
-- 1. Add a new column like "representative_ad_space_id"
-- 2. Or use a different approach
-- ============================================

