# ✅ Correct Category Structure

## Data Model

### 1. Ad Spaces → Categories (For Filtering)
```
ad_spaces.category_id → categories.id
```
- **Purpose**: Filter ad spaces by category
- **Example**: Get all restaurant ad spaces by filtering `WHERE category_id = 'Restaurant category ID'`
- **Already correct** in schema ✅

### 2. Categories → Categories (For Hierarchy)
```
categories.parent_category_id → categories.id
```
- **Purpose**: Create category hierarchy (parent/child categories)
- **Example**: "Corporate" and "Office Tower" are children of "Corporate & Business"
- **Needs to be fixed** - currently might reference ad_spaces.id (WRONG)

## Correct Structure

```
📁 Categories (for organizing ad spaces)
  ├─ 📁 Corporate & Business (parent)
  │   ├─ 📂 Corporate (child)
  │   │   └─ 🏢 Ad Spaces: category_id → Corporate category
  │   └─ 📂 Office Tower (child)
  │       └─ 🏢 Ad Spaces: category_id → Office Tower category
  │
  ├─ 📁 Retail & Commerce (parent)
  │   ├─ 📂 Mall (child)
  │   ├─ 📂 Grocery Store (child)
  │   └─ 📂 Restaurant (child)
  │
  └─ ... (other categories)

🏢 Ad Spaces (filtered by category_id)
  - Each ad space has: category_id → points to a category
  - Filter ad spaces: WHERE category_id = 'category_id'
```

## Database Relationships

### ad_spaces Table
```sql
ad_spaces (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  category_id UUID REFERENCES categories(id),  -- ✅ For filtering
  ...
)
```

### categories Table
```sql
categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  parent_category_id UUID REFERENCES categories(id),  -- ✅ For hierarchy
  ...
)
```

## How to Filter Ad Spaces

### Filter by Category Name
```sql
SELECT a.* 
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
WHERE c.name = 'Restaurant';
```

### Filter by Parent Category
```sql
SELECT a.* 
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
INNER JOIN categories p ON c.parent_category_id = p.id
WHERE p.name = 'Retail & Commerce';
```

## SQL Script to Fix

**File**: `frontend/supabase/fix_correct_category_structure.sql`

This script:
1. ✅ Fixes `categories.parent_category_id` to reference `categories.id` (not ad_spaces.id)
2. ✅ Sets up proper category hierarchy
3. ✅ Creates correct foreign key constraint

## Summary

- ✅ **ad_spaces.category_id** → **categories.id** (for filtering ad spaces)
- ✅ **categories.parent_category_id** → **categories.id** (for category hierarchy)
- ❌ **NOT**: categories.parent_category_id → ad_spaces.id

---

**Status**: ✅ Structure clarified - Run the SQL script to fix the relationships

