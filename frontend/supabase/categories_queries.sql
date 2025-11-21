-- ============================================
-- CATEGORIES TABLE - COMPREHENSIVE QUERIES
-- ============================================

-- ============================================
-- 1. VIEW ALL CATEGORIES
-- ============================================
-- Get all categories with their details
SELECT 
  id,
  name,
  icon_url,
  parent_category_id,
  description,
  created_at
FROM categories
ORDER BY name ASC;

-- Get categories with count of ad spaces
SELECT 
  c.id,
  c.name,
  c.icon_url,
  c.description,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.id, c.name, c.icon_url, c.description
ORDER BY ad_space_count DESC, c.name ASC;

-- Get categories with parent-child relationships
SELECT 
  parent.id as parent_id,
  parent.name as parent_name,
  child.id as child_id,
  child.name as child_name
FROM categories parent
LEFT JOIN categories child ON parent.id = child.parent_category_id
ORDER BY parent.name, child.name;

-- ============================================
-- 2. ADD NEW CATEGORIES
-- ============================================

-- Insert a single category
INSERT INTO categories (name, description, icon_url)
VALUES ('Transit', 'Transit advertising spaces including metro, bus, and train stations', 'https://example.com/icons/transit.svg')
RETURNING *;

-- Insert multiple categories at once
INSERT INTO categories (name, description, icon_url) VALUES
  ('Billboard', 'Static and digital billboard advertising spaces', 'https://example.com/icons/billboard.svg'),
  ('Bus Station', 'Advertising spaces at bus stations and terminals', 'https://example.com/icons/bus-station.svg'),
  ('Cinema', 'Cinema screen advertising spaces', 'https://example.com/icons/cinema.svg'),
  ('Digital Screen', 'Digital LED and LCD screen advertising', 'https://example.com/icons/digital-screen.svg'),
  ('Point of Sale', 'Retail and point of sale advertising spaces', 'https://example.com/icons/pos.svg'),
  ('Transit', 'Transit advertising including metro and trains', 'https://example.com/icons/transit.svg')
RETURNING *;

-- ============================================
-- 3. UPDATE EXISTING CATEGORIES
-- ============================================

-- Update a category by ID
UPDATE categories
SET 
  name = 'Updated Category Name',
  description = 'Updated description',
  icon_url = 'https://example.com/icons/updated.svg'
WHERE id = 'YOUR_CATEGORY_ID_HERE'
RETURNING *;

-- Update category name only
UPDATE categories
SET name = 'New Category Name'
WHERE id = 'YOUR_CATEGORY_ID_HERE'
RETURNING *;

-- Update category description only
UPDATE categories
SET description = 'New description text'
WHERE id = 'YOUR_CATEGORY_ID_HERE'
RETURNING *;

-- Update icon URL for a category
UPDATE categories
SET icon_url = 'https://example.com/icons/new-icon.svg'
WHERE id = 'YOUR_CATEGORY_ID_HERE'
RETURNING *;

-- Update multiple categories at once
UPDATE categories
SET description = CASE
  WHEN name = 'Billboard' THEN 'Large format outdoor advertising displays'
  WHEN name = 'Digital Screen' THEN 'Digital LED/LCD advertising displays'
  WHEN name = 'Cinema' THEN 'Cinema screen advertising spaces'
  ELSE description
END
WHERE name IN ('Billboard', 'Digital Screen', 'Cinema')
RETURNING *;

-- ============================================
-- 4. DELETE CATEGORIES
-- ============================================

-- Delete a category (only if no ad spaces reference it)
DELETE FROM categories
WHERE id = 'YOUR_CATEGORY_ID_HERE'
  AND NOT EXISTS (
    SELECT 1 FROM ad_spaces WHERE category_id = 'YOUR_CATEGORY_ID_HERE'
  )
RETURNING *;

-- Delete category and update ad spaces to NULL (if you want to keep ad spaces)
-- First, update ad spaces to remove category reference
UPDATE ad_spaces
SET category_id = NULL
WHERE category_id = 'YOUR_CATEGORY_ID_HERE';

-- Then delete the category
DELETE FROM categories
WHERE id = 'YOUR_CATEGORY_ID_HERE'
RETURNING *;

-- ============================================
-- 5. SEARCH AND FILTER CATEGORIES
-- ============================================

-- Search categories by name
SELECT * FROM categories
WHERE name ILIKE '%billboard%'
ORDER BY name;

-- Get categories with no ad spaces
SELECT 
  c.id,
  c.name,
  c.description,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.id, c.name, c.description
HAVING COUNT(a.id) = 0
ORDER BY c.name;

-- Get categories with most ad spaces
SELECT 
  c.id,
  c.name,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.id, c.name
ORDER BY ad_space_count DESC
LIMIT 10;

-- Get categories created in the last 30 days
SELECT * FROM categories
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- ============================================
-- 6. CATEGORY STATISTICS
-- ============================================

-- Get total count of categories
SELECT COUNT(*) as total_categories FROM categories;

-- Get categories with their ad space statistics
SELECT 
  c.name,
  COUNT(a.id) as total_spaces,
  COUNT(CASE WHEN a.availability_status = 'available' THEN 1 END) as available_spaces,
  COUNT(CASE WHEN a.availability_status = 'booked' THEN 1 END) as booked_spaces,
  AVG(a.price_per_day) as avg_price_per_day,
  AVG(a.price_per_month) as avg_price_per_month
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.id, c.name
ORDER BY total_spaces DESC;

-- ============================================
-- 7. PARENT-CHILD CATEGORY RELATIONSHIPS
-- ============================================

-- Create a parent category
INSERT INTO categories (name, description)
VALUES ('Outdoor Advertising', 'All outdoor advertising categories')
RETURNING *;

-- Create child categories (use the parent ID from above)
INSERT INTO categories (name, description, parent_category_id)
VALUES 
  ('Billboard', 'Large format billboards', 'PARENT_CATEGORY_ID_HERE'),
  ('Digital Screen', 'Digital outdoor screens', 'PARENT_CATEGORY_ID_HERE')
RETURNING *;

-- Get all parent categories
SELECT * FROM categories
WHERE parent_category_id IS NULL
ORDER BY name;

-- Get all child categories with their parent
SELECT 
  child.id,
  child.name as child_name,
  parent.name as parent_name,
  parent.id as parent_id
FROM categories child
INNER JOIN categories parent ON child.parent_category_id = parent.id
ORDER BY parent.name, child.name;

-- Get category tree (all categories with their hierarchy level)
WITH RECURSIVE category_tree AS (
  -- Base case: parent categories
  SELECT 
    id,
    name,
    parent_category_id,
    0 as level,
    name as path
  FROM categories
  WHERE parent_category_id IS NULL
  
  UNION ALL
  
  -- Recursive case: child categories
  SELECT 
    c.id,
    c.name,
    c.parent_category_id,
    ct.level + 1,
    ct.path || ' > ' || c.name
  FROM categories c
  INNER JOIN category_tree ct ON c.parent_category_id = ct.id
)
SELECT * FROM category_tree
ORDER BY path;

-- ============================================
-- 8. BULK OPERATIONS
-- ============================================

-- Update all categories to add a prefix
UPDATE categories
SET name = 'Ad: ' || name
WHERE name NOT LIKE 'Ad: %'
RETURNING *;

-- Remove prefix from all categories
UPDATE categories
SET name = REPLACE(name, 'Ad: ', '')
WHERE name LIKE 'Ad: %'
RETURNING *;

-- Set default icon URL for categories without icons
UPDATE categories
SET icon_url = 'https://example.com/icons/default.svg'
WHERE icon_url IS NULL OR icon_url = ''
RETURNING *;

-- ============================================
-- 9. DATA VALIDATION QUERIES
-- ============================================

-- Find duplicate category names
SELECT name, COUNT(*) as count
FROM categories
GROUP BY name
HAVING COUNT(*) > 1;

-- Find categories with missing descriptions
SELECT * FROM categories
WHERE description IS NULL OR description = '';

-- Find categories with invalid parent references
SELECT * FROM categories
WHERE parent_category_id IS NOT NULL
  AND parent_category_id NOT IN (SELECT id FROM categories);

-- Find orphaned ad spaces (ad spaces with invalid category_id)
SELECT a.id, a.title, a.category_id
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
WHERE a.category_id IS NOT NULL AND c.id IS NULL;

-- ============================================
-- 10. USEFUL HELPER QUERIES
-- ============================================

-- Get category by name
SELECT * FROM categories
WHERE name = 'Billboard'
LIMIT 1;

-- Get category ID by name (useful for inserts)
SELECT id FROM categories
WHERE name = 'Billboard'
LIMIT 1;

-- Check if category exists
SELECT EXISTS(
  SELECT 1 FROM categories WHERE name = 'Billboard'
) as category_exists;

-- Get categories with their first ad space example
SELECT 
  c.id,
  c.name,
  c.description,
  a.id as example_ad_space_id,
  a.title as example_ad_space_title
FROM categories c
LEFT JOIN LATERAL (
  SELECT id, title
  FROM ad_spaces
  WHERE category_id = c.id
  LIMIT 1
) a ON true
ORDER BY c.name;

-- ============================================
-- 11. RESET/REFRESH CATEGORIES
-- ============================================

-- Clear all categories (WARNING: Only if no ad spaces reference them)
-- DELETE FROM categories;

-- Reset categories to default set
-- First, update ad spaces to remove category references
-- UPDATE ad_spaces SET category_id = NULL;

-- Then delete all categories
-- DELETE FROM categories;

-- Then insert default categories
-- INSERT INTO categories (name, description) VALUES
--   ('Billboard', 'Static and digital billboard advertising'),
--   ('Bus Station', 'Bus station advertising spaces'),
--   ('Cinema', 'Cinema screen advertising'),
--   ('Digital Screen', 'Digital LED/LCD advertising displays'),
--   ('Point of Sale', 'Retail and point of sale advertising'),
--   ('Transit', 'Transit advertising including metro and trains');

-- ============================================
-- END OF QUERIES
-- ============================================

