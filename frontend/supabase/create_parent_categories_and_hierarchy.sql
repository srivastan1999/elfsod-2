-- ============================================
-- CREATE PARENT CATEGORIES AND SET UP HIERARCHY
-- ============================================
-- This script creates parent categories and assigns existing categories as children

-- Step 1: Create parent categories
INSERT INTO categories (name, description) VALUES
  ('Outdoor Advertising', 'All outdoor and street-level advertising spaces including billboards, hoardings, and large format displays'),
  ('Transit Advertising', 'All transportation and transit-related advertising spaces'),
  ('Retail & Commerce', 'All retail, shopping, and commercial advertising spaces'),
  ('Corporate & Business', 'All corporate office and business district advertising spaces'),
  ('Hospitality', 'All hotel and hospitality-related advertising spaces'),
  ('Entertainment', 'All entertainment and event venue advertising spaces')
ON CONFLICT DO NOTHING
RETURNING *;

-- Step 2: Assign Billboard to Outdoor Advertising
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Outdoor Advertising' LIMIT 1
)
WHERE name = 'Billboard'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Outdoor Advertising');

-- Step 3: Assign Metro to Transit Advertising
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Transit Advertising' LIMIT 1
)
WHERE name = 'Metro'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Transit Advertising');

-- Step 4: Assign Mall, Grocery Store, Restaurant to Retail & Commerce
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Retail & Commerce' LIMIT 1
)
WHERE name IN ('Mall', 'Grocery Store', 'Restaurant')
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Retail & Commerce');

-- Step 5: Assign Corporate and Office Tower to Corporate & Business
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Corporate & Business' LIMIT 1
)
WHERE name IN ('Corporate', 'Office Tower')
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Corporate & Business');

-- Step 6: Assign Hotel to Hospitality
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Hospitality' LIMIT 1
)
WHERE name = 'Hotel'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Hospitality');

-- Step 7: Assign Event Venue to Entertainment
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1
)
WHERE name = 'Event Venue'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Entertainment');

-- ============================================
-- VERIFY THE HIERARCHY
-- ============================================

-- View all categories with their parent relationships
SELECT 
  c.id,
  c.name as category_name,
  c.parent_category_id,
  p.name as parent_category_name,
  CASE 
    WHEN c.parent_category_id IS NULL THEN 'Parent Category'
    ELSE 'Child Category'
  END as category_type
FROM categories c
LEFT JOIN categories p ON c.parent_category_id = p.id
ORDER BY 
  CASE WHEN c.parent_category_id IS NULL THEN 0 ELSE 1 END,
  p.name NULLS FIRST,
  c.name;

-- View parent categories with their children
SELECT 
  p.name as parent_category,
  COUNT(c.id) as number_of_children,
  STRING_AGG(c.name, ', ' ORDER BY c.name) as children
FROM categories p
LEFT JOIN categories c ON c.parent_category_id = p.id
WHERE p.parent_category_id IS NULL
GROUP BY p.id, p.name
ORDER BY p.name;

-- View only parent categories (top-level)
SELECT id, name, description 
FROM categories 
WHERE parent_category_id IS NULL 
ORDER BY name;

-- View only child categories with their parents
SELECT 
  c.id,
  c.name as child_category,
  p.name as parent_category
FROM categories c
INNER JOIN categories p ON c.parent_category_id = p.id
ORDER BY p.name, c.name;

