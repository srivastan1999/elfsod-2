-- ============================================
-- MIGRATION: ENFORCE MANDATORY CATEGORY FOR AD SPACES
-- ============================================
-- This script:
-- 1. Auto-assigns categories to ad spaces that don't have one
-- 2. Makes category_id NOT NULL (mandatory)
-- 3. Enforces foreign key constraint properly

-- ============================================
-- STEP 1: Auto-assign categories to ad spaces without categories
-- ============================================

-- First, let's see how many ad spaces need categories
SELECT 
  COUNT(*) as ad_spaces_without_category
FROM ad_spaces
WHERE category_id IS NULL;

-- Auto-assign categories based on title/description keywords
UPDATE ad_spaces
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Metro' 
  LIMIT 1
)
WHERE category_id IS NULL
  AND (
    LOWER(title) LIKE '%metro%' 
    OR LOWER(description) LIKE '%metro%'
    OR LOWER(title) LIKE '%train%'
    OR LOWER(description) LIKE '%train%'
    OR LOWER(title) LIKE '%station%'
    OR LOWER(description) LIKE '%station%'
  );

UPDATE ad_spaces
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Mall' 
  LIMIT 1
)
WHERE category_id IS NULL
  AND (
    LOWER(title) LIKE '%mall%' 
    OR LOWER(description) LIKE '%mall%'
    OR LOWER(title) LIKE '%shopping%'
    OR LOWER(description) LIKE '%shopping%'
  );

UPDATE ad_spaces
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Restaurant' 
  LIMIT 1
)
WHERE category_id IS NULL
  AND (
    LOWER(title) LIKE '%restaurant%' 
    OR LOWER(description) LIKE '%restaurant%'
    OR LOWER(title) LIKE '%cafe%'
    OR LOWER(description) LIKE '%cafe%'
    OR LOWER(title) LIKE '%food%'
    OR LOWER(description) LIKE '%food%'
  );

UPDATE ad_spaces
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Hotel' 
  LIMIT 1
)
WHERE category_id IS NULL
  AND (
    LOWER(title) LIKE '%hotel%' 
    OR LOWER(description) LIKE '%hotel%'
  );

UPDATE ad_spaces
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Corporate' 
  LIMIT 1
)
WHERE category_id IS NULL
  AND (
    LOWER(title) LIKE '%corporate%' 
    OR LOWER(description) LIKE '%corporate%'
    OR LOWER(title) LIKE '%office%'
    OR LOWER(description) LIKE '%office%'
    OR LOWER(title) LIKE '%business%'
    OR LOWER(description) LIKE '%business%'
  );

UPDATE ad_spaces
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Office Tower' 
  LIMIT 1
)
WHERE category_id IS NULL
  AND (
    LOWER(title) LIKE '%tower%' 
    OR LOWER(description) LIKE '%tower%'
    OR LOWER(title) LIKE '%building%'
    OR LOWER(description) LIKE '%building%'
  );

UPDATE ad_spaces
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Event Venue' 
  LIMIT 1
)
WHERE category_id IS NULL
  AND (
    LOWER(title) LIKE '%event%' 
    OR LOWER(description) LIKE '%event%'
    OR LOWER(title) LIKE '%venue%'
    OR LOWER(description) LIKE '%venue%'
    OR LOWER(title) LIKE '%cinema%'
    OR LOWER(description) LIKE '%cinema%'
  );

UPDATE ad_spaces
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Grocery Store' 
  LIMIT 1
)
WHERE category_id IS NULL
  AND (
    LOWER(title) LIKE '%grocery%' 
    OR LOWER(description) LIKE '%grocery%'
    OR LOWER(title) LIKE '%supermarket%'
    OR LOWER(description) LIKE '%supermarket%'
    OR LOWER(title) LIKE '%store%'
    OR LOWER(description) LIKE '%store%'
  );

-- Assign a default category (Corporate) to any remaining ad spaces without categories
UPDATE ad_spaces
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Corporate' 
  LIMIT 1
)
WHERE category_id IS NULL;

-- Verify all ad spaces now have categories
SELECT 
  COUNT(*) as remaining_null_categories
FROM ad_spaces
WHERE category_id IS NULL;
-- Should return 0

-- ============================================
-- STEP 2: Enforce NOT NULL constraint
-- ============================================

-- Drop existing foreign key constraint
ALTER TABLE ad_spaces
DROP CONSTRAINT IF EXISTS ad_spaces_category_id_fkey;

-- Make category_id NOT NULL
ALTER TABLE ad_spaces
ALTER COLUMN category_id SET NOT NULL;

-- Recreate foreign key constraint with ON DELETE RESTRICT
-- This prevents deleting categories that have ad spaces
ALTER TABLE ad_spaces
ADD CONSTRAINT ad_spaces_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id)
ON DELETE RESTRICT;

-- ============================================
-- STEP 3: Verify the constraint
-- ============================================

-- Check the constraint exists and is correct
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  CASE 
    WHEN kcu.column_name IS NOT NULL AND c.is_nullable = 'NO' THEN 'NOT NULL ✓'
    ELSE 'NULLABLE ✗'
  END as nullability
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
JOIN information_schema.columns AS c
  ON c.table_name = tc.table_name 
  AND c.column_name = kcu.column_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'ad_spaces'
  AND kcu.column_name = 'category_id';

-- Final verification: Should return 0
SELECT 
  COUNT(*) as null_category_count
FROM ad_spaces
WHERE category_id IS NULL;

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ All ad spaces now have categories assigned
-- ✅ category_id is mandatory (NOT NULL)
-- ✅ Foreign key constraint enforces only valid categories
-- ✅ ON DELETE RESTRICT prevents deleting categories with ad spaces
-- ✅ Database structure ensures data integrity

