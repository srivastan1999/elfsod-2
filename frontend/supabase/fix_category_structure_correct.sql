-- ============================================
-- FIX CATEGORY STRUCTURE - CORRECT RELATIONSHIPS
-- ============================================
-- 
-- CORRECT STRUCTURE:
-- 1. ad_spaces.category_id → categories.id (for filtering ad spaces by category)
-- 2. categories.parent_category_id → categories.id (for category hierarchy)
--
-- This script:
-- 1. Ensures ad_spaces.category_id correctly references categories.id
-- 2. Sets up categories.parent_category_id to reference categories.id (parent categories)
-- 3. Creates proper category hierarchy

-- ============================================
-- STEP 1: Ensure ad_spaces.category_id references categories.id
-- ============================================
-- This should already exist, but let's verify and fix if needed

-- Check if foreign key exists
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'ad_spaces'
  AND kcu.column_name = 'category_id';

-- If it doesn't exist, create it:
-- ALTER TABLE ad_spaces
-- ADD CONSTRAINT ad_spaces_category_id_fkey 
-- FOREIGN KEY (category_id) 
-- REFERENCES categories(id)
-- ON DELETE SET NULL;

-- ============================================
-- STEP 2: Fix categories.parent_category_id to reference categories.id
-- ============================================

-- Drop any incorrect foreign key constraint (if it references ad_spaces)
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_parent_category_id_fkey;

-- Set all parent_category_id to NULL first
UPDATE categories
SET parent_category_id = NULL;

-- ============================================
-- STEP 3: Set up category hierarchy (parent categories)
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
-- STEP 4: Create correct foreign key constraint
-- ============================================
-- categories.parent_category_id → categories.id (NOT ad_spaces.id)

ALTER TABLE categories
ADD CONSTRAINT categories_parent_category_id_fkey 
FOREIGN KEY (parent_category_id) 
REFERENCES categories(id)
ON DELETE SET NULL;

-- ============================================
-- VERIFY THE STRUCTURE
-- ============================================

-- Verify ad_spaces.category_id → categories.id (for filtering)
SELECT 
  'ad_spaces.category_id → categories.id' as relationship,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'ad_spaces'
  AND kcu.column_name = 'category_id';

-- Verify categories.parent_category_id → categories.id (for hierarchy)
SELECT 
  'categories.parent_category_id → categories.id' as relationship,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'categories'
  AND kcu.column_name = 'parent_category_id';

-- View category hierarchy
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

-- View ad spaces with their categories (for filtering)
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

-- Summary: Ad spaces by category (for filtering)
SELECT 
  c.name as category_name,
  COUNT(a.id) as total_ad_spaces,
  COUNT(CASE WHEN a.availability_status = 'available' THEN 1 END) as available_spaces,
  p.name as parent_category
FROM categories c
LEFT JOIN ad_spaces a ON a.category_id = c.id
LEFT JOIN categories p ON c.parent_category_id = p.id
GROUP BY c.id, c.name, p.name
ORDER BY p.name NULLS FIRST, c.name;

