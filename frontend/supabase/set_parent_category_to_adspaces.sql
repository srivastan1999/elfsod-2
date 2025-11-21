-- ============================================
-- SET PARENT_CATEGORY_ID AS FOREIGN KEY TO AD_SPACES.ID
-- ============================================
-- This allows filtering ad spaces by category through the parent_category_id
-- Each category will be linked to a representative ad space

-- Step 1: Drop existing foreign key constraint (if it references categories)
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_parent_category_id_fkey;

-- Step 2: Set all parent_category_id to NULL first
UPDATE categories
SET parent_category_id = NULL;

-- Step 3: Match each category to its first ad space (by creation date)
-- This creates a link from category to a representative ad space
-- Only updates categories that have ad spaces
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

-- Verify the matches before creating constraint
-- This query shows what will be matched
SELECT 
  c.id as category_id,
  c.name as category_name,
  (
    SELECT a.id 
    FROM ad_spaces a 
    WHERE a.category_id = c.id 
    ORDER BY a.created_at ASC 
    LIMIT 1
  ) as will_be_matched_to_ad_space_id,
  (
    SELECT a.title 
    FROM ad_spaces a 
    WHERE a.category_id = c.id 
    ORDER BY a.created_at ASC 
    LIMIT 1
  ) as will_be_matched_to_ad_space_title
FROM categories c
WHERE EXISTS (
  SELECT 1 
  FROM ad_spaces a 
  WHERE a.category_id = c.id
)
ORDER BY c.name;

-- Step 4: Create new foreign key constraint to ad_spaces
ALTER TABLE categories
ADD CONSTRAINT categories_parent_category_id_fkey 
FOREIGN KEY (parent_category_id) 
REFERENCES ad_spaces(id)
ON DELETE SET NULL;

-- ============================================
-- VERIFY THE SETUP
-- ============================================

-- View categories with their matched ad spaces
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.parent_category_id as ad_space_id,
  a.title as ad_space_title,
  a.description as ad_space_description
FROM categories c
LEFT JOIN ad_spaces a ON c.parent_category_id = a.id
ORDER BY c.name;

-- View categories with ad space counts and their matched ad space
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

-- ============================================
-- AUTOMATED FILTERING QUERIES
-- ============================================

-- Query 1: Get all ad spaces grouped by category (automated - no manual ID needed)
-- This shows all ad spaces with their category's representative ad space
SELECT 
  c.name as category_name,
  c.parent_category_id as category_representative_ad_space_id,
  rep.title as category_representative_title,
  a.id as ad_space_id,
  a.title as ad_space_title,
  a.description as ad_space_description,
  a.price_per_day,
  a.availability_status
FROM categories c
INNER JOIN ad_spaces a ON a.category_id = c.id
LEFT JOIN ad_spaces rep ON c.parent_category_id = rep.id
WHERE c.parent_category_id IS NOT NULL
ORDER BY c.name, a.title;

-- Query 2: Filter ad spaces by matching category's parent_category_id to any ad space
-- This automatically finds all ad spaces in categories that have parent_category_id set
-- (No manual ID entry needed - processes all categories)
SELECT 
  c.name as category_name,
  c.parent_category_id as category_linked_ad_space_id,
  rep.title as category_linked_ad_space_title,
  a.id as ad_space_id,
  a.title as ad_space_title,
  a.description,
  a.price_per_day,
  a.availability_status
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN ad_spaces rep ON c.parent_category_id = rep.id
WHERE c.parent_category_id IS NOT NULL
  AND c.parent_category_id IN (SELECT id FROM ad_spaces)
ORDER BY c.name, a.title;

-- Query 3: Get all ad spaces for a specific category (by category name - automated)
-- Replace 'Restaurant' with any category name
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
WHERE c.name = 'Restaurant'  -- Change this to any category name
ORDER BY a.title;

-- Query 4: Get all ad spaces that match categories with parent_category_id
-- This automatically processes all categories and their ad spaces
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.parent_category_id as representative_ad_space_id,
  rep.title as representative_ad_space_title,
  COUNT(a.id) as total_ad_spaces_in_category,
  STRING_AGG(a.title, ', ' ORDER BY a.title) as ad_space_titles
FROM categories c
LEFT JOIN ad_spaces rep ON c.parent_category_id = rep.id
LEFT JOIN ad_spaces a ON a.category_id = c.id
WHERE c.parent_category_id IS NOT NULL
GROUP BY c.id, c.name, c.parent_category_id, rep.title
ORDER BY c.name;

-- Query 5: Find all ad spaces in the same category as a given ad space (automated lookup)
-- This finds the category of an ad space, then returns all ad spaces in that category
-- Replace 'YOUR_AD_SPACE_ID_HERE' with actual ad space ID, or use in a function
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  c.name as category_name,
  c.parent_category_id as category_representative_id
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
WHERE c.id = (
  SELECT category_id 
  FROM ad_spaces 
  WHERE id = 'YOUR_AD_SPACE_ID_HERE'  -- Replace with actual ID or use in API
)
ORDER BY a.title;

-- Query 6: Get all categories with their matched ad spaces (summary view)
SELECT 
  c.name as category_name,
  COUNT(a.id) as total_ad_spaces,
  c.parent_category_id as representative_ad_space_id,
  rep.title as representative_ad_space_title,
  rep.id as representative_ad_space_id_full
FROM categories c
LEFT JOIN ad_spaces a ON a.category_id = c.id
LEFT JOIN ad_spaces rep ON c.parent_category_id = rep.id
WHERE c.parent_category_id IS NOT NULL
GROUP BY c.id, c.name, c.parent_category_id, rep.title, rep.id
ORDER BY c.name;

