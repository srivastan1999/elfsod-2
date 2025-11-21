# ✅ Category Structure - Fixed and Correct

## Correct Data Model

### 1. Ad Spaces → Categories (For Filtering) ✅
```
ad_spaces.category_id → categories.id
```
- **Purpose**: Filter ad spaces by category
- **Status**: ✅ Already correct in schema
- **Usage**: `SELECT * FROM ad_spaces WHERE category_id = 'category_id'`

### 2. Categories → Categories (For Hierarchy) ✅
```
categories.parent_category_id → categories.id
```
- **Purpose**: Create category hierarchy (parent/child relationships)
- **Status**: ✅ Fixed - now references categories.id (NOT ad_spaces.id)
- **Usage**: Organize categories into parent/child groups

## Current Structure

### Parent Categories
- Corporate & Business
- Entertainment
- Hospitality
- Indoor Advertising
- Outdoor Advertising
- Retail & Commerce
- Transit Advertising

### Child Categories (with parents)
- **Corporate** → Corporate & Business
- **Office Tower** → Corporate & Business
- **Mall** → Retail & Commerce
- **Grocery Store** → Retail & Commerce
- **Restaurant** → Retail & Commerce
- **Billboard** → Outdoor Advertising
- **Metro** → Transit Advertising
- **Hotel** → Hospitality
- **Event Venue** → Entertainment

## How to Use

### Filter Ad Spaces by Category
```sql
-- Get all restaurant ad spaces
SELECT a.* 
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
WHERE c.name = 'Restaurant';
```

### Filter Ad Spaces by Parent Category
```sql
-- Get all ad spaces in Retail & Commerce (includes Mall, Grocery Store, Restaurant)
SELECT a.* 
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
INNER JOIN categories p ON c.parent_category_id = p.id
WHERE p.name = 'Retail & Commerce';
```

### View Category Hierarchy
```sql
SELECT 
  c.name as category_name,
  p.name as parent_category_name,
  COUNT(a.id) as ad_space_count
FROM categories c
LEFT JOIN categories p ON c.parent_category_id = p.id
LEFT JOIN ad_spaces a ON a.category_id = c.id
GROUP BY c.id, c.name, p.name
ORDER BY p.name NULLS FIRST, c.name;
```

## API Endpoints

### Setup Correct Hierarchy
```bash
POST /api/categories/setup-correct-hierarchy
```
Sets up parent/child relationships between categories.

### Associate Similar Ad Spaces
```bash
POST /api/categories/associate-similar-adspaces
Body: { "categoryName": "Restaurant" }
```
Associates ad spaces with similar names to a category (uses `category_id` for filtering).

## Summary

✅ **ad_spaces.category_id** → **categories.id** (for filtering ad spaces)
✅ **categories.parent_category_id** → **categories.id** (for category hierarchy)
❌ **NOT**: categories.parent_category_id → ad_spaces.id

---

**Status**: ✅ Structure is correct and fixed!

