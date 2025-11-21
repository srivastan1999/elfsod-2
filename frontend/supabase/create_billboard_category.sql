-- ============================================
-- CREATE BILLBOARD CATEGORY
-- ============================================
-- This script creates the Billboard category if it doesn't exist

-- Option 1: Insert if not exists (PostgreSQL 9.5+)
INSERT INTO categories (name, description, icon_url)
VALUES (
  'Billboard',
  'Traditional outdoor advertising billboards and large format displays',
  NULL
)
ON CONFLICT (name) DO NOTHING
RETURNING *;

-- If the above doesn't work (no unique constraint on name), use this:
-- INSERT INTO categories (name, description)
-- SELECT 'Billboard', 'Traditional outdoor advertising billboards and large format displays'
-- WHERE NOT EXISTS (
--   SELECT 1 FROM categories WHERE name = 'Billboard'
-- )
-- RETURNING *;

-- Verify the category was created
SELECT 
  id,
  name,
  description,
  created_at
FROM categories
WHERE name = 'Billboard';

-- ============================================
-- ALTERNATIVE: Create with explicit UUID (if needed)
-- ============================================
-- INSERT INTO categories (id, name, description)
-- VALUES (
--   '332999ec-5e01-424f-9c80-fa674fc48781',  -- Use this UUID or generate new one
--   'Billboard',
--   'Traditional outdoor advertising billboards and large format displays'
-- )
-- ON CONFLICT (id) DO NOTHING
-- RETURNING *;

