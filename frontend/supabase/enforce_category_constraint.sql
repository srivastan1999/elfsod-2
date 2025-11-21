-- ============================================
-- ENFORCE MANDATORY CATEGORY CONSTRAINT
-- ============================================
-- Run this AFTER all ad spaces have been assigned categories
-- This makes category_id mandatory (NOT NULL) and enforces referential integrity

-- Step 1: Verify all ad spaces have categories (should return 0)
SELECT 
  COUNT(*) as ad_spaces_without_category
FROM ad_spaces
WHERE category_id IS NULL;

-- If the above returns > 0, run the API endpoint first:
-- POST /api/ad-spaces/assign-categories?onlyUnmatched=true

-- Step 2: Drop existing foreign key constraint (if it exists)
ALTER TABLE ad_spaces
DROP CONSTRAINT IF EXISTS ad_spaces_category_id_fkey;

-- Step 3: Make category_id NOT NULL (mandatory)
ALTER TABLE ad_spaces
ALTER COLUMN category_id SET NOT NULL;

-- Step 4: Recreate foreign key constraint with ON DELETE RESTRICT
-- This ensures:
-- - Only valid categories from categories table can be used
-- - Categories with ad spaces cannot be deleted
ALTER TABLE ad_spaces
ADD CONSTRAINT ad_spaces_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id)
ON DELETE RESTRICT;

-- Step 5: Verify the constraint
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  CASE 
    WHEN c.is_nullable = 'NO' THEN 'NOT NULL ✓'
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

-- Step 6: Final verification (should return 0)
SELECT 
  COUNT(*) as null_category_count
FROM ad_spaces
WHERE category_id IS NULL;

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ category_id is now mandatory (NOT NULL)
-- ✅ Foreign key constraint enforces only valid categories
-- ✅ ON DELETE RESTRICT prevents deleting categories with ad spaces
-- ✅ Database structure ensures data integrity

