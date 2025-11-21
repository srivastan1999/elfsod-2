# Understanding the Parent Category SQL Query

## The Query

```sql
SELECT a.* FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
INNER JOIN categories p ON c.parent_category_id = p.id
WHERE p.name = 'Retail & Commerce';
```

## How It Works - Step by Step

### Step 1: Start with Ad Spaces
```sql
SELECT a.* FROM ad_spaces a
```
- `a` = alias for `ad_spaces` table
- Selects all columns from ad_spaces

### Step 2: Join with Categories (Child Categories)
```sql
INNER JOIN categories c ON a.category_id = c.id
```
- `c` = alias for `categories` table (represents child categories)
- Joins ad_spaces with categories where `ad_spaces.category_id = categories.id`
- This gives us the category information for each ad space

**Example:**
- Ad Space "Restaurant Entrance Banner" has `category_id = 'restaurant-id'`
- Join finds category where `id = 'restaurant-id'`
- Result: Ad space + its category (Restaurant)

### Step 3: Join with Parent Categories
```sql
INNER JOIN categories p ON c.parent_category_id = p.id
```
- `p` = alias for `categories` table again (represents parent categories)
- Joins the child category (`c`) with its parent category (`p`)
- Where `child_category.parent_category_id = parent_category.id`

**Example:**
- Category "Restaurant" has `parent_category_id = 'retail-commerce-id'`
- Join finds parent category where `id = 'retail-commerce-id'`
- Result: Ad space + child category + parent category

### Step 4: Filter by Parent Category Name
```sql
WHERE p.name = 'Retail & Commerce'
```
- Filters to only include ad spaces whose category's parent is "Retail & Commerce"

## Visual Representation

```
ad_spaces (a)
    │
    │ category_id
    │
    ▼
categories (c) ── child categories
    │
    │ parent_category_id
    │
    ▼
categories (p) ── parent categories
    │
    │ WHERE p.name = 'Retail & Commerce'
    │
    ▼
Result: All ad spaces in child categories of "Retail & Commerce"
```

## Category Hierarchy Example

```
Retail & Commerce (parent category)
    │
    ├── Mall (child category)
    │   ├── Ad Space: "Mall Food Court Banner"
    │   ├── Ad Space: "Mall Atrium Digital Display"
    │   └── Ad Space: "Mall Entrance Display"
    │
    ├── Grocery Store (child category)
    │   ├── Ad Space: "Grocery Aisle Banner"
    │   ├── Ad Space: "Supermarket Entrance Display"
    │   └── Ad Space: "Checkout Counter Display"
    │
    └── Restaurant (child category)
        ├── Ad Space: "Restaurant Entrance Banner"
        ├── Ad Space: "Restaurant Table Top Display"
        └── Ad Space: "Restaurant Menu Board"
```

## What the Query Returns

When you run:
```sql
SELECT a.* FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
INNER JOIN categories p ON c.parent_category_id = p.id
WHERE p.name = 'Retail & Commerce';
```

**Result:** All 9 ad spaces from:
- Mall (3 spaces)
- Grocery Store (3 spaces)
- Restaurant (3 spaces)

## Why This Query is Useful

1. **Filter by Parent Category**: Get all ad spaces in a parent category without knowing child category names
2. **Hierarchical Filtering**: Automatically includes all child categories
3. **Scalable**: If you add new child categories, they're automatically included
4. **Efficient**: Single query gets all related ad spaces

## Database Structure

### Categories Table
```
id          | name                | parent_category_id
------------|---------------------|-------------------
retail-id   | Retail & Commerce   | NULL (parent)
mall-id     | Mall                | retail-id (child)
grocery-id  | Grocery Store       | retail-id (child)
restaurant-id| Restaurant          | retail-id (child)
```

### Ad Spaces Table
```
id          | title                      | category_id
------------|----------------------------|-------------
space-1     | Mall Food Court Banner     | mall-id
space-2     | Restaurant Entrance Banner | restaurant-id
space-3     | Grocery Aisle Banner       | grocery-id
```

## How the Join Works

1. **First Join** (`ad_spaces` → `categories`):
   - `space-1.category_id = mall-id` → finds "Mall" category
   - `space-2.category_id = restaurant-id` → finds "Restaurant" category

2. **Second Join** (`categories` → `categories`):
   - `Mall.parent_category_id = retail-id` → finds "Retail & Commerce" parent
   - `Restaurant.parent_category_id = retail-id` → finds "Retail & Commerce" parent

3. **Filter**:
   - Only keeps rows where parent category name = "Retail & Commerce"

## API Implementation

The filter API uses this query logic:

```typescript
// Get parent category ID
const parentCategory = await supabase
  .from('categories')
  .select('id')
  .eq('name', 'Retail & Commerce')
  .is('parent_category_id', null)
  .single();

// Get all child categories
const childCategories = await supabase
  .from('categories')
  .select('id')
  .eq('parent_category_id', parentCategory.id);

// Filter ad spaces by parent + all child category IDs
const categoryIds = [parentCategory.id, ...childCategories.map(c => c.id)];
const adSpaces = await supabase
  .from('ad_spaces')
  .select('*')
  .in('category_id', categoryIds);
```

## Summary

This query:
- ✅ Gets all ad spaces in child categories of "Retail & Commerce"
- ✅ Automatically includes all child categories (Mall, Grocery Store, Restaurant)
- ✅ Works with the hierarchical category structure
- ✅ Is efficient and scalable

**Key Point:** The query uses **two joins** to traverse from ad_spaces → child category → parent category, then filters by the parent category name.

