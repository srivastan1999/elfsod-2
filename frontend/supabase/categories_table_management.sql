-- ============================================
-- CATEGORIES TABLE MANAGEMENT - SAFE OPERATIONS
-- ============================================

-- ============================================
-- OPTION 1: DELETE CATEGORIES TABLE (CASCADE)
-- ============================================
-- WARNING: This will delete the table AND all dependent objects
-- Use only if you want to completely remove everything

-- Step 1: Check what depends on categories table
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'categories';

-- Step 2: Drop the table with CASCADE (removes all dependencies)
-- ⚠️ WARNING: This will delete the foreign key constraint from ad_spaces table
DROP TABLE IF EXISTS categories CASCADE;

-- Step 3: Recreate the categories table if needed
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon_url VARCHAR(255),
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Recreate the foreign key constraint on ad_spaces
ALTER TABLE ad_spaces
ADD CONSTRAINT ad_spaces_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id);

-- ============================================
-- OPTION 2: SAFELY DELETE CATEGORIES TABLE (RECOMMENDED)
-- ============================================
-- This preserves ad_spaces but removes category references

-- Step 1: Remove category references from ad_spaces
UPDATE ad_spaces
SET category_id = NULL
WHERE category_id IS NOT NULL;

-- Step 2: Drop the foreign key constraint
ALTER TABLE ad_spaces
DROP CONSTRAINT IF EXISTS ad_spaces_category_id_fkey;

-- Step 3: Now you can safely drop the categories table
DROP TABLE IF EXISTS categories;

-- Step 4: Recreate categories table if needed
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon_url VARCHAR(255),
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Recreate the foreign key constraint
ALTER TABLE ad_spaces
ADD CONSTRAINT ad_spaces_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id);

-- ============================================
-- OPTION 3: TRUNCATE CATEGORIES (KEEP TABLE STRUCTURE)
-- ============================================
-- This removes all data but keeps the table structure

-- Step 1: Remove category references from ad_spaces
UPDATE ad_spaces
SET category_id = NULL
WHERE category_id IS NOT NULL;

-- Step 2: Truncate categories table (removes all rows)
TRUNCATE TABLE categories CASCADE;

-- Step 3: Reset the sequence if using serial IDs (not needed for UUID)
-- For UUID, you don't need to reset anything

-- ============================================
-- OPTION 4: DELETE SPECIFIC CATEGORIES (SAFE)
-- ============================================
-- Delete individual categories without affecting the table structure

-- Step 1: Check which ad spaces use a specific category
SELECT 
  c.id as category_id,
  c.name as category_name,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
WHERE c.name = 'Category Name Here'
GROUP BY c.id, c.name;

-- Step 2: Remove category references from ad_spaces for that category
UPDATE ad_spaces
SET category_id = NULL
WHERE category_id = (
  SELECT id FROM categories WHERE name = 'Category Name Here'
);

-- Step 3: Delete the category
DELETE FROM categories
WHERE name = 'Category Name Here'
RETURNING *;

-- ============================================
-- OPTION 5: DROP AND RECREATE WITH NEW STRUCTURE
-- ============================================
-- If you want to modify the table structure

-- Step 1: Backup current data (optional)
CREATE TABLE categories_backup AS 
SELECT * FROM categories;

-- Step 2: Remove foreign key constraint
ALTER TABLE ad_spaces
DROP CONSTRAINT IF EXISTS ad_spaces_category_id_fkey;

-- Step 3: Drop categories table
DROP TABLE IF EXISTS categories CASCADE;

-- Step 4: Create new categories table with modified structure
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,  -- Added UNIQUE constraint
  icon_url VARCHAR(255),
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  slug VARCHAR(100),  -- Added new column
  is_active BOOLEAN DEFAULT true,  -- Added new column
  display_order INTEGER DEFAULT 0,  -- Added new column
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Restore data from backup (if needed)
-- INSERT INTO categories (id, name, icon_url, parent_category_id, description, created_at)
-- SELECT id, name, icon_url, parent_category_id, description, created_at
-- FROM categories_backup;

-- Step 6: Recreate foreign key constraint
ALTER TABLE ad_spaces
ADD CONSTRAINT ad_spaces_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id)
ON DELETE SET NULL;  -- Set to NULL if category is deleted

-- Step 7: Drop backup table
DROP TABLE IF EXISTS categories_backup;

-- ============================================
-- CHECK CONSTRAINTS AND DEPENDENCIES
-- ============================================

-- View all foreign key constraints on categories
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (ccu.table_name = 'categories' OR tc.table_name = 'categories');

-- View all constraints on categories table
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'categories';

-- ============================================
-- SAFE DELETE WITH FOREIGN KEY HANDLING
-- ============================================

-- Function to safely delete a category
CREATE OR REPLACE FUNCTION safe_delete_category(category_id_to_delete UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update ad_spaces to set category_id to NULL
  UPDATE ad_spaces
  SET category_id = NULL
  WHERE category_id = category_id_to_delete;
  
  -- Delete child categories first (if any)
  UPDATE categories
  SET parent_category_id = NULL
  WHERE parent_category_id = category_id_to_delete;
  
  -- Delete the category
  DELETE FROM categories
  WHERE id = category_id_to_delete;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Use the function to safely delete a category
SELECT safe_delete_category('YOUR_CATEGORY_ID_HERE');

-- ============================================
-- RECOMMENDED APPROACH FOR YOUR CASE
-- ============================================

-- If you want to completely reset categories table:

-- 1. First, see what's referencing it
SELECT 
  'ad_spaces' as table_name,
  COUNT(*) as records_with_category
FROM ad_spaces
WHERE category_id IS NOT NULL;

-- 2. Remove references (set to NULL)
UPDATE ad_spaces
SET category_id = NULL;

-- 3. Drop the foreign key constraint
ALTER TABLE ad_spaces
DROP CONSTRAINT IF EXISTS ad_spaces_category_id_fkey;

-- 4. Now you can drop the table
DROP TABLE IF EXISTS categories;

-- 5. Recreate it
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon_url VARCHAR(255),
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Recreate the foreign key (with ON DELETE SET NULL for safety)
ALTER TABLE ad_spaces
ADD CONSTRAINT ad_spaces_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id)
ON DELETE SET NULL;

-- 7. Re-insert your categories
INSERT INTO categories (name, description) VALUES
  ('Billboard', 'Traditional outdoor advertising billboards'),
  ('Digital Screen', 'Modern digital advertising screens'),
  ('Bus Station', 'Bus station advertising spaces'),
  ('Cinema', 'Cinema and theater advertising'),
  ('Point of Sale', 'Retail point of sale displays'),
  ('Transit', 'Public transport advertising')
RETURNING *;

