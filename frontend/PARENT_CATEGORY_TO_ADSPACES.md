# ✅ Parent Category ID as Foreign Key to Ad Spaces

## What This Does

Sets `parent_category_id` in the `categories` table to reference `ad_spaces.id` instead of `categories.id`. This allows you to:

1. **Link each category to a representative ad space**
2. **Filter ad spaces by category** using the parent_category_id
3. **Find all ad spaces in a category** by looking up the category linked to an ad space

## Database Structure

```sql
categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  parent_category_id UUID REFERENCES ad_spaces(id),  -- ✅ Now references ad_spaces
  ...
)

ad_spaces (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id),  -- ✅ Ad space belongs to category
  ...
)
```

## How It Works

1. Each category's `parent_category_id` points to the **first ad space** in that category (by creation date)
2. This creates a link: **Category → Representative Ad Space**
3. You can filter ad spaces by finding the category linked to a specific ad space ID

## SQL Script

File: `frontend/supabase/set_parent_category_to_adspaces.sql`

This script:
1. Drops the existing foreign key constraint
2. Sets all `parent_category_id` to NULL
3. Matches each category to its first ad space
4. Creates new foreign key constraint to `ad_spaces`

## Usage Examples

### 1. Filter Ad Spaces by Category Ad Space ID

```bash
GET /api/ad-spaces/filter-by-category-adspace?categoryAdSpaceId=8e0c4d4b-4786-49a2-8e6a-0f9e3fe42db1
```

This will:
- Find the category that has this ad space ID as its `parent_category_id`
- Return all ad spaces in that category

### 2. SQL Query to Filter

```sql
-- Get all ad spaces in the same category as a specific ad space
SELECT 
  a.id,
  a.title,
  a.description,
  c.name as category_name
FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
WHERE c.id = (
  SELECT category_id 
  FROM ad_spaces 
  WHERE id = 'YOUR_AD_SPACE_ID_HERE'
)
ORDER BY a.title;
```

### 3. Find Category by Ad Space ID

```sql
-- Find which category is linked to a specific ad space
SELECT 
  c.id,
  c.name,
  c.parent_category_id as linked_ad_space_id,
  a.title as linked_ad_space_title
FROM categories c
LEFT JOIN ad_spaces a ON c.parent_category_id = a.id
WHERE c.parent_category_id = 'YOUR_AD_SPACE_ID_HERE';
```

## Benefits

1. **Easy Filtering**: Filter ad spaces by finding the category linked to an ad space
2. **Representative Ad Space**: Each category has a representative ad space for display
3. **Category Navigation**: Click on a category's representative ad space to see all ad spaces in that category

## Example Flow

1. User clicks on "Restaurant Entrance Banner" (ad space)
2. System finds category where `parent_category_id = '8e0c4d4b-4786-49a2-8e6a-0f9e3fe42db1'`
3. Finds category: "Restaurant"
4. Returns all ad spaces where `category_id = 'Restaurant category ID'`
5. Shows all restaurant ad spaces

---

**Status**: ✅ Ready to use - Run the SQL script to set up the relationship

