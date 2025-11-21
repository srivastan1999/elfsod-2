-- ============================================
-- ENFORCE MANDATORY CATEGORY FOR AD SPACES
-- ============================================
-- This script ensures that:
-- 1. category_id is NOT NULL (mandatory)
-- 2. Foreign key constraint is properly enforced
-- 3. Only valid categories from categories table can be used

-- Step 1: Check current state
-- See if there are any ad spaces without categories
SELECT 
  COUNT(*) as ad_spaces_without_category
FROM ad_spaces
WHERE category_id IS NULL;

-- Step 2: If there are ad spaces without categories, you need to assign them first
-- (This query is for reference - don't run if you have NULL category_ids)

-- Step 3: Drop the existing foreign key constraint if it exists
-- (We'll recreate it with NOT NULL)
ALTER TABLE ad_spaces
DROP CONSTRAINT IF EXISTS ad_spaces_category_id_fkey;

-- Step 4: Make category_id NOT NULL
-- This will fail if there are any NULL values, so assign categories first if needed
ALTER TABLE ad_spaces
ALTER COLUMN category_id SET NOT NULL;

-- Step 5: Recreate the foreign key constraint with proper referential integrity
ALTER TABLE ad_spaces
ADD CONSTRAINT ad_spaces_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id)
ON DELETE RESTRICT;  -- Prevent deleting categories that have ad spaces

-- Step 6: Verify the constraint
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'ad_spaces'
  AND kcu.column_name = 'category_id';

-- Step 7: Verify no NULL category_ids exist
SELECT 
  COUNT(*) as null_category_count
FROM ad_spaces
WHERE category_id IS NULL;
-- Should return 0

-- ============================================
-- ADDITIONAL SAFETY: Check constraint to ensure category exists
-- ============================================
-- This is already enforced by the foreign key, but we can add a check for extra safety
-- (Optional - foreign key already does this)

-- ============================================
-- SUMMARY
-- ============================================
-- After running this script:
-- ✅ category_id is mandatory (NOT NULL)
-- ✅ Only valid categories from categories table can be used
-- ✅ Deleting a category that has ad spaces will be prevented (ON DELETE RESTRICT)
-- ✅ Database enforces referential integrity at the schema level

