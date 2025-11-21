-- ============================================
-- MATCH CATEGORIES TO AD SPACES - WITH ACTUAL IDs
-- ============================================
-- This script matches each category to its first ad space using actual IDs from your database

-- Step 1: Drop existing foreign key constraint
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_parent_category_id_fkey;

-- Step 2: Set all parent_category_id to NULL first
UPDATE categories
SET parent_category_id = NULL;

-- Step 3: Update each category with its first ad space ID
-- Event Venue
UPDATE categories
SET parent_category_id = 'aaa8c1c7-36c7-498b-8ca9-5c2c3a69943c' -- Event Hall Entrance Banner
WHERE id = '2a34951b-9013-447e-bb4e-9d07d2154ee1'; -- Event Venue

-- Restaurant
UPDATE categories
SET parent_category_id = 'f7bcc718-921e-4fb2-b039-917caa08d7dc' -- Restaurant Table Top Display
WHERE id = '4619bb27-fe8c-4356-a050-9cd28d250176'; -- Restaurant

-- Hotel
UPDATE categories
SET parent_category_id = '15268115-69bf-4197-8315-db7d23a91208' -- Hotel Lobby Digital Screen
WHERE id = '513eeaff-187d-4989-a356-3abfb41f2de7'; -- Hotel

-- Metro
UPDATE categories
SET parent_category_id = 'f1f4cd92-6b79-4f24-a343-6a1155cdb253' -- Metro Station Platform Display
WHERE id = '5fd03776-02c4-4130-b6ed-2b259925b43c'; -- Metro

-- Grocery Store
UPDATE categories
SET parent_category_id = '566f5898-db29-4da4-9921-45027b9c3b93' -- Supermarket Entrance Display
WHERE id = '65e1bc98-81d4-4b8c-9e67-a61bf7603841'; -- Grocery Store

-- Corporate
UPDATE categories
SET parent_category_id = '51a8a64f-668e-4d5b-aaed-59942aeaa6cd' -- Corporate Lobby Digital Display
WHERE id = '6e072404-2a07-4d98-b6d1-a39165d66b24'; -- Corporate

-- Mall
UPDATE categories
SET parent_category_id = 'c7faf3d1-cb80-4ee6-8e7e-96dac3b25513' -- Mall Atrium Digital Display
WHERE id = '80abc0d6-5795-4a8a-bd95-0062bb63180f'; -- Mall

-- Office Tower
UPDATE categories
SET parent_category_id = '5071feac-ac3b-4b8d-9651-30494d412f7d' -- Office Tower Lobby Display
WHERE id = 'c49e9875-66c9-4816-a71c-d6a3f97e9cfc'; -- Office Tower

-- Step 4: Create new foreign key constraint to ad_spaces
ALTER TABLE categories
ADD CONSTRAINT categories_parent_category_id_fkey
FOREIGN KEY (parent_category_id)
REFERENCES ad_spaces(id)
ON DELETE SET NULL;

-- ============================================
-- VERIFY THE MATCHES
-- ============================================

-- View all categories with their matched ad spaces
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.parent_category_id as ad_space_id,
  a.title as ad_space_title,
  a.description as ad_space_description
FROM categories c
LEFT JOIN ad_spaces a ON c.parent_category_id = a.id
WHERE c.parent_category_id IS NOT NULL
ORDER BY c.name;

-- Summary: Categories with ad space counts and matches
SELECT 
  c.name as category_name,
  COUNT(DISTINCT a.id) as total_ad_spaces_in_category,
  c.parent_category_id as matched_ad_space_id,
  matched.title as matched_ad_space_title,
  CASE 
    WHEN c.parent_category_id IS NOT NULL THEN '✅ Matched'
    ELSE '❌ No match'
  END as match_status
FROM categories c
LEFT JOIN ad_spaces a ON a.category_id = c.id
LEFT JOIN ad_spaces matched ON c.parent_category_id = matched.id
GROUP BY c.id, c.name, c.parent_category_id, matched.title
ORDER BY c.name;

