# Category Mandatory Enforcement

## Overview
This document explains how categories are enforced as mandatory for ad spaces in the database structure.

## Database Structure

### Schema Changes
The `ad_spaces` table now enforces that `category_id` is **mandatory**:

```sql
category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT
```

### Key Constraints:
1. **NOT NULL**: `category_id` cannot be NULL - every ad space MUST have a category
2. **Foreign Key**: Only valid category IDs from the `categories` table can be used
3. **ON DELETE RESTRICT**: Prevents deleting categories that have associated ad spaces

## Migration Steps

### For Existing Databases
If you have an existing database with ad spaces that don't have categories:

1. **Run the migration script**:
   ```sql
   -- Execute: migrate_enforce_mandatory_category.sql
   ```
   
   This script will:
   - Auto-assign categories to ad spaces without categories (based on keywords)
   - Make `category_id` NOT NULL
   - Enforce the foreign key constraint with ON DELETE RESTRICT

2. **Or use the API endpoint**:
   ```bash
   POST /api/ad-spaces/assign-categories
   ```
   This will auto-assign categories based on title/description matching.

### For New Databases
Simply use the updated `schema.sql` which already includes the NOT NULL constraint.

## API Validation

The API already enforces category validation at the application level:

### POST /api/ad-spaces
- **Validates** that `categoryId` is provided
- **Verifies** that the category exists in the database
- **Returns error** if category is missing or invalid

Example validation:
```typescript
if (!categoryId) {
  return NextResponse.json({
    success: false,
    error: 'Category ID is required'
  }, { status: 400 });
}

// Verify category exists
const { data: category, error: categoryError } = await supabase
  .from('categories')
  .select('id, name')
  .eq('id', categoryId)
  .single();

if (categoryError || !category) {
  return NextResponse.json({
    success: false,
    error: 'Invalid category ID',
    details: categoryError?.message
  }, { status: 400 });
}
```

## Benefits

1. **Data Integrity**: Ensures every ad space is properly categorized
2. **Referential Integrity**: Database enforces that only valid categories can be used
3. **Prevents Orphaned Data**: ON DELETE RESTRICT prevents accidental category deletion
4. **Better Filtering**: Categories can be reliably used for filtering and grouping
5. **Consistent UI**: Frontend can always display category information

## Verification

### Check if constraint is enforced:
```sql
-- Should return constraint details
SELECT 
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'ad_spaces'
  AND kcu.column_name = 'category_id';
```

### Verify no NULL categories:
```sql
-- Should return 0
SELECT COUNT(*) FROM ad_spaces WHERE category_id IS NULL;
```

## Files

- **schema.sql**: Updated schema with NOT NULL constraint
- **migrate_enforce_mandatory_category.sql**: Migration script for existing databases
- **enforce_category_mandatory.sql**: Alternative enforcement script
- **app/api/ad-spaces/route.ts**: API validation for category

## Notes

- Before running the migration, ensure all ad spaces have categories assigned
- The migration script includes auto-assignment logic based on keywords
- After migration, creating ad spaces without categories will fail at the database level

