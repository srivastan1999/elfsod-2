-- ============================================
-- CLEAR ALL PARENT_CATEGORY_ID IN CATEGORIES TABLE
-- ============================================
-- This sets all parent_category_id to NULL

-- Simple query to set all parent_category_id to NULL
UPDATE categories
SET parent_category_id = NULL;

-- Verify the update
SELECT 
  id,
  name,
  parent_category_id
FROM categories
ORDER BY name;

-- Count how many have NULL vs non-NULL
SELECT 
  COUNT(*) as total_categories,
  COUNT(parent_category_id) as categories_with_parent,
  COUNT(*) - COUNT(parent_category_id) as categories_without_parent
FROM categories;

