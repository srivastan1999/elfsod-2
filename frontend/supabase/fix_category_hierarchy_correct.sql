-- ============================================
-- FIX CATEGORY HIERARCHY - CORRECT APPROACH
-- ============================================
-- Categories are for organizing ad_spaces
-- parent_category_id should create category hierarchy (parent categories), NOT link to ad_spaces
-- 
-- Structure:
--   ad_spaces.category_id → categories.id (each ad space belongs to a category)
--   categories.parent_category_id → categories.id (categories can have parent categories)

-- Step 1: Drop any incorrect foreign key constraint
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_parent_category_id_fkey;

-- Step 2: Set all parent_category_id to NULL first (clear any incorrect references)
UPDATE categories
SET parent_category_id = NULL;

-- Step 3: Create proper category hierarchy using existing categories as parents
-- Use broader categories as parents of more specific ones

-- Corporate & Business as parent
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Corporate & Business' LIMIT 1
)
WHERE name IN ('Corporate', 'Office Tower')
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Corporate & Business');

-- Retail & Commerce as parent
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Retail & Commerce' LIMIT 1
)
WHERE name IN ('Mall', 'Grocery Store', 'Restaurant')
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Retail & Commerce');

-- Outdoor Advertising as parent
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Outdoor Advertising' LIMIT 1
)
WHERE name = 'Billboard'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Outdoor Advertising');

-- Transit Advertising as parent
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Transit Advertising' LIMIT 1
)
WHERE name = 'Metro'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Transit Advertising');

-- Hospitality as parent
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Hospitality' LIMIT 1
)
WHERE name = 'Hotel'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Hospitality');

-- Entertainment as parent
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1
)
WHERE name = 'Event Venue'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Entertainment');

-- Step 4: Recreate the correct foreign key constraint (categories → categories)
ALTER TABLE categories
ADD CONSTRAINT categories_parent_category_id_fkey 
FOREIGN KEY (parent_category_id) 
REFERENCES categories(id)
ON DELETE SET NULL;

-- ============================================
-- VERIFY THE CORRECT STRUCTURE
-- ============================================

-- View categories with their parent categories (correct hierarchy)
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.parent_category_id,
  p.name as parent_category_name,
  CASE 
    WHEN c.parent_category_id IS NULL THEN 'Parent Category'
    ELSE 'Child Category'
  END as category_type
FROM categories c
LEFT JOIN categories p ON c.parent_category_id = p.id
ORDER BY p.name NULLS FIRST, c.name;

-- View ad spaces with their categories (correct relationship)
SELECT 
  a.id as ad_space_id,
  a.title as ad_space_title,
  a.category_id,
  c.name as category_name,
  c.parent_category_id as category_parent_id,
  p.name as category_parent_name
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN categories p ON c.parent_category_id = p.id
ORDER BY c.name, a.title
LIMIT 20;

-- Summary: Categories with their ad space counts
SELECT 
  c.name as category_name,
  COUNT(a.id) as ad_space_count,
  p.name as parent_category
FROM categories c
LEFT JOIN ad_spaces a ON a.category_id = c.id
LEFT JOIN categories p ON c.parent_category_id = p.id
GROUP BY c.id, c.name, p.name
ORDER BY p.name NULLS FIRST, c.name;

