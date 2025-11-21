-- ============================================
-- SETUP CATEGORY HIERARCHY (PARENT-CHILD RELATIONSHIPS)
-- ============================================
-- This script sets up a logical parent-child structure for categories

-- First, let's see current categories
SELECT id, name, parent_category_id FROM categories ORDER BY name;

-- ============================================
-- OPTION 1: Create Main Categories and Subcategories
-- ============================================

-- Step 1: Create main parent categories (if they don't exist)
-- These are top-level categories

-- Step 2: Set up hierarchy
-- We'll organize categories into logical groups:

-- OUTDOOR ADVERTISING (Parent)
--   - Billboard (child)
--   - Digital Screen (if exists, child)

-- RETAIL & COMMERCE (Parent)  
--   - Mall (child)
--   - Grocery Store (child)
--   - Restaurant (child)

-- CORPORATE & BUSINESS (Parent)
--   - Corporate (child)
--   - Office Tower (child)

-- HOSPITALITY (Parent)
--   - Hotel (child)

-- TRANSPORTATION (Parent)
--   - Metro (child)

-- ENTERTAINMENT (Parent)
--   - Event Venue (child)

-- ============================================
-- OPTION 2: Simple Two-Level Hierarchy
-- ============================================
-- Keep existing categories as children, create parent categories

-- Create parent categories first
INSERT INTO categories (name, description) VALUES
  ('Outdoor Advertising', 'All outdoor and street-level advertising spaces'),
  ('Indoor Advertising', 'All indoor advertising spaces'),
  ('Transit Advertising', 'All transportation and transit-related advertising')
ON CONFLICT DO NOTHING
RETURNING *;

-- Get parent category IDs (you'll need to replace these with actual IDs from above)
-- SELECT id FROM categories WHERE name = 'Outdoor Advertising';
-- SELECT id FROM categories WHERE name = 'Indoor Advertising';
-- SELECT id FROM categories WHERE name = 'Transit Advertising';

-- ============================================
-- OPTION 3: Flat Structure with Logical Grouping
-- ============================================
-- Update existing categories to have parent categories

-- Billboard -> Outdoor Advertising
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Outdoor Advertising' LIMIT 1
)
WHERE name = 'Billboard'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Outdoor Advertising');

-- Metro -> Transit Advertising
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Transit Advertising' LIMIT 1
)
WHERE name = 'Metro'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Transit Advertising');

-- Mall, Grocery Store, Restaurant -> Indoor Advertising
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Indoor Advertising' LIMIT 1
)
WHERE name IN ('Mall', 'Grocery Store', 'Restaurant')
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Indoor Advertising');

-- Corporate, Office Tower -> Indoor Advertising (or create Business category)
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Indoor Advertising' LIMIT 1
)
WHERE name IN ('Corporate', 'Office Tower')
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Indoor Advertising');

-- Hotel -> Indoor Advertising
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Indoor Advertising' LIMIT 1
)
WHERE name = 'Hotel'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Indoor Advertising');

-- Event Venue -> Indoor Advertising
UPDATE categories
SET parent_category_id = (
  SELECT id FROM categories WHERE name = 'Indoor Advertising' LIMIT 1
)
WHERE name = 'Event Venue'
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Indoor Advertising');

-- ============================================
-- VERIFY THE HIERARCHY
-- ============================================

-- View categories with their parents
SELECT 
  c.id,
  c.name,
  c.parent_category_id,
  p.name as parent_name
FROM categories c
LEFT JOIN categories p ON c.parent_category_id = p.id
ORDER BY p.name NULLS FIRST, c.name;

-- View parent categories (categories with no parent)
SELECT * FROM categories WHERE parent_category_id IS NULL ORDER BY name;

-- View child categories grouped by parent
SELECT 
  p.name as parent_category,
  COUNT(c.id) as child_count,
  STRING_AGG(c.name, ', ') as children
FROM categories p
LEFT JOIN categories c ON c.parent_category_id = p.id
WHERE p.parent_category_id IS NULL
GROUP BY p.id, p.name
ORDER BY p.name;

