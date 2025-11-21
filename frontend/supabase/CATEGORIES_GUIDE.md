# Categories Table - Quick Reference Guide

## Table Structure

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon_url VARCHAR(255),
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Columns:
- **id**: Unique identifier (UUID)
- **name**: Category name (required, max 100 chars)
- **icon_url**: URL to category icon (optional)
- **parent_category_id**: Reference to parent category for hierarchical structure (optional)
- **description**: Category description (optional)
- **created_at**: Timestamp when category was created

---

## Most Common Queries

### 1. View All Categories
```sql
SELECT * FROM categories ORDER BY name;
```

### 2. View Categories with Ad Space Counts
```sql
SELECT 
  c.id,
  c.name,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
GROUP BY c.id, c.name
ORDER BY ad_space_count DESC;
```

### 3. Add a New Category
```sql
INSERT INTO categories (name, description)
VALUES ('New Category', 'Category description here')
RETURNING *;
```

### 4. Update a Category
```sql
UPDATE categories
SET name = 'Updated Name',
    description = 'Updated description'
WHERE id = 'YOUR_CATEGORY_ID'
RETURNING *;
```

### 5. Delete a Category (if no ad spaces use it)
```sql
DELETE FROM categories
WHERE id = 'YOUR_CATEGORY_ID'
  AND NOT EXISTS (
    SELECT 1 FROM ad_spaces WHERE category_id = 'YOUR_CATEGORY_ID'
  );
```

### 6. Find Category by Name
```sql
SELECT * FROM categories WHERE name = 'Billboard';
```

### 7. Get Category ID by Name (useful for inserts)
```sql
SELECT id FROM categories WHERE name = 'Billboard' LIMIT 1;
```

---

## Current Categories in Database

Based on seed data, these categories exist:
1. **Billboard** - Traditional outdoor advertising billboards
2. **Digital Screen** - Modern digital advertising screens
3. **Bus Station** - Bus station advertising spaces
4. **Cinema** - Cinema and theater advertising
5. **Point of Sale** - Retail point of sale displays
6. **Transit** - Public transport advertising

---

## How to Use in Supabase

1. **Open Supabase Dashboard** → Your Project → SQL Editor
2. **Copy and paste** any query from `categories_queries.sql`
3. **Replace placeholders** like `'YOUR_CATEGORY_ID_HERE'` with actual values
4. **Run the query**

---

## Quick Actions

### Add Multiple Categories
```sql
INSERT INTO categories (name, description) VALUES
  ('Airport', 'Airport terminal advertising'),
  ('Metro', 'Metro station advertising'),
  ('Mall', 'Shopping mall advertising')
RETURNING *;
```

### Update All Categories to Add Icons
```sql
UPDATE categories
SET icon_url = CASE
  WHEN name = 'Billboard' THEN 'https://example.com/icons/billboard.svg'
  WHEN name = 'Digital Screen' THEN 'https://example.com/icons/digital.svg'
  WHEN name = 'Bus Station' THEN 'https://example.com/icons/bus.svg'
  WHEN name = 'Cinema' THEN 'https://example.com/icons/cinema.svg'
  WHEN name = 'Point of Sale' THEN 'https://example.com/icons/pos.svg'
  WHEN name = 'Transit' THEN 'https://example.com/icons/transit.svg'
  ELSE icon_url
END
RETURNING *;
```

### Find Categories with No Ad Spaces
```sql
SELECT c.*
FROM categories c
LEFT JOIN ad_spaces a ON c.id = a.category_id
WHERE a.id IS NULL;
```

---

## For More Queries

See the complete `categories_queries.sql` file for:
- Advanced filtering
- Parent-child relationships
- Statistics and analytics
- Bulk operations
- Data validation
- And much more!

