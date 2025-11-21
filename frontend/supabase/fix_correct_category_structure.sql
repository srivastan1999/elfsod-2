-- ============================================
-- FIX CATEGORY STRUCTURE - CORRECT RELATIONSHIPS
-- ============================================
-- 
-- CORRECT STRUCTURE:
-- 1. ad_spaces.category_id → categories.id (for filtering ad spaces by category) ✅
-- 2. categories.parent_category_id → categories.id (for category hierarchy) ✅
--
-- This script fixes the structure to match the correct relationships

-- ============================================
-- STEP 1: Fix categories.parent_category_id
-- ============================================
-- Currently parent_category_id might reference ad_spaces.id (WRONG)
-- We need it to reference categories.id (CORRECT - for parent categories)

-- Drop any incorrect foreign key constraint
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_parent_category_id_fkey;

-- Set all parent_category_id to NULL first
UPDATE categories
SET parent_category_id = NULL;

-- ============================================
-- STEP 2: Set up proper category hierarchy
-- ============================================
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

-- ============================================
-- STEP 3: Create correct foreign key constraint
-- ============================================
-- categories.parent_category_id → categories.id (for category hierarchy)

ALTER TABLE categories
ADD CONSTRAINT categories_parent_category_id_fkey 
FOREIGN KEY (parent_category_id) 
REFERENCES categories(id)
ON DELETE SET NULL;

-- ============================================
-- VERIFY THE CORRECT STRUCTURE
-- ============================================

-- Verify ad_spaces.category_id → categories.id (for filtering ad spaces)
SELECT 
  '✅ ad_spaces.category_id → categories.id' as relationship,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'ad_spaces'
  AND kcu.column_name = 'category_id';

-- Verify categories.parent_category_id → categories.id (for category hierarchy)
SELECT 
  '✅ categories.parent_category_id → categories.id' as relationship,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'categories'
  AND kcu.column_name = 'parent_category_id';

-- ============================================
-- EXAMPLE: Filter ad spaces by category
-- ============================================
-- This is how you filter ad spaces using category_id

-- Get all ad spaces in a specific category
SELECT 
  a.id,
  a.title,
  a.description,
  a.price_per_day,
  c.name as category_name,
  p.name as parent_category_name
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN categories p ON c.parent_category_id = p.id
WHERE c.name = 'Restaurant'  -- Filter by category name
ORDER BY a.title;

-- Get all ad spaces in categories under a parent category
SELECT 
  a.id,
  a.title,
  a.description,
  c.name as category_name,
  p.name as parent_category_name
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
INNER JOIN categories p ON c.parent_category_id = p.id
WHERE p.name = 'Retail & Commerce'  -- Filter by parent category
ORDER BY c.name, a.title;

-- ============================================
-- VIEW CATEGORY HIERARCHY
-- ============================================

-- View parent categories with their children
SELECT 
  p.name as parent_category,
  COUNT(c.id) as child_categories_count,
  STRING_AGG(c.name, ', ' ORDER BY c.name) as child_categories
FROM categories p
LEFT JOIN categories c ON c.parent_category_id = p.id
WHERE p.parent_category_id IS NULL
GROUP BY p.id, p.name
ORDER BY p.name;

-- View all categories with their hierarchy
SELECT 
  c.id,
  c.name as category_name,
  c.parent_category_id,
  p.name as parent_category_name,
  CASE 
    WHEN c.parent_category_id IS NULL THEN 'Parent Category'
    ELSE 'Child Category'
  END as category_type,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN categories p ON c.parent_category_id = p.id
LEFT JOIN ad_spaces a ON a.category_id = c.id
GROUP BY c.id, c.name, c.parent_category_id, p.name
ORDER BY p.name NULLS FIRST, c.name;

