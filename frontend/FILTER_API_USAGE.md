# ✅ Filter API for Ad Spaces

## Overview

A dedicated API endpoint for filtering ad spaces by categories using SQL queries. This API implements:
1. **Filter by category name**: `WHERE category_id = (SELECT id FROM categories WHERE name = 'CategoryName')`
2. **Filter by parent category**: Gets all child categories and filters ad spaces

## API Endpoint

```
GET /api/ad-spaces/filter
```

## Query Parameters

### Category Filtering
- `categoryName` - Filter by exact category name (e.g., "Restaurant")
- `parentCategoryName` - Filter by parent category name (includes all child categories)
- `categoryIds` - Comma-separated category IDs (includes child categories automatically)

### Other Filters
- `city` - Filter by city name
- `minPrice` / `maxPrice` - Price range filter
- `minFootfall` / `maxFootfall` - Footfall range filter
- `displayType` - Filter by display type
- `publisherId` - Filter by publisher ID (comma-separated for multiple)
- `searchQuery` - Search in title/description
- `availabilityStatus` - Filter by availability (default: 'available')
- `limit` - Maximum results (default: 100)

## Usage Examples

### Filter by Category Name
```bash
GET /api/ad-spaces/filter?categoryName=Restaurant&city=Mumbai
```

### Filter by Parent Category
```bash
GET /api/ad-spaces/filter?parentCategoryName=Retail & Commerce
```
This will return ad spaces from:
- Retail & Commerce (parent)
- Mall (child)
- Grocery Store (child)
- Restaurant (child)

### Filter by Multiple Category IDs
```bash
GET /api/ad-spaces/filter?categoryIds=id1,id2,id3
```
Automatically includes all child categories for each parent category ID.

### Combined Filters
```bash
GET /api/ad-spaces/filter?categoryName=Restaurant&city=Mumbai&minPrice=1000&maxPrice=50000
```

## Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "...",
      "category": {
        "id": "...",
        "name": "Restaurant",
        "parent_category_id": "..."
      },
      ...
    }
  ],
  "count": 10,
  "filters": {
    "categoryName": "Restaurant",
    "parentCategoryName": null,
    "categoryIds": null,
    "city": "Mumbai"
  }
}
```

## Integration

### Home Page
When a category is clicked, it uses the filter API:
```typescript
const handleCategoryClick = async (categoryId: string, categoryName?: string) => {
  const params = new URLSearchParams();
  if (categoryName) {
    params.append('categoryName', categoryName);
  }
  const response = await fetch(`/api/ad-spaces/filter?${params.toString()}`);
  // Update ad spaces list
};
```

### Search Page
The search page uses the filter API when location categories are selected:
```typescript
if (appliedFilters.locationCategories && appliedFilters.locationCategories.length > 0) {
  filters.categoryIds = appliedFilters.locationCategories.join(',');
  // Use /api/ad-spaces/filter endpoint
}
```

### Filter Panel
The location section in FilterPanel shows parent categories from the database:
- Fetches categories from `/api/categories`
- Shows parent categories with their ad space counts
- When selected, uses the filter API to get ad spaces

## SQL Queries Implemented

### Filter by Category Name
```sql
SELECT * FROM ad_spaces 
WHERE category_id = (SELECT id FROM categories WHERE name = 'Restaurant');
```

### Filter by Parent Category
```sql
SELECT a.* FROM ad_spaces a
INNER JOIN categories c ON a.category_id = c.id
INNER JOIN categories p ON c.parent_category_id = p.id
WHERE p.name = 'Retail & Commerce';
```

## Benefits

1. **Single API**: One endpoint for all category filtering
2. **SQL-based**: Uses efficient SQL queries
3. **Parent/Child Support**: Automatically includes child categories
4. **Flexible**: Supports multiple filter combinations
5. **Consistent**: Same filtering logic across home page and search page

---

**Status**: ✅ Ready to use - Filter API is integrated in home page and search page

