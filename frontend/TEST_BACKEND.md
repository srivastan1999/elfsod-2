# Testing Backend APIs and Data Fetching

## Quick Test: Supabase Connection

### Option 1: Use Test API Endpoint

1. **Start your dev server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Visit the test endpoint**:
   ```
   http://localhost:3000/api/test-supabase
   ```

3. **Check the response** - You should see:
   ```json
   {
     "success": true,
     "environment": {
       "supabaseUrl": "Configured",
       "supabaseKey": "Configured"
     },
     "tests": {
       "categories": {
         "success": true,
         "count": 6,
         "error": null
       },
       "locations": {
         "success": true,
         "count": 14,
         "error": null
       },
       "publishers": {
         "success": true,
         "count": 7,
         "error": null
       },
       "adSpaces": {
         "success": true,
         "count": 5,
         "error": null
       }
     }
   }
   ```

### Option 2: Test in Browser Console

Open browser console on your app and run:

```javascript
// Test 1: Check if Supabase client works
const testSupabase = async () => {
  try {
    const response = await fetch('/api/test-supabase');
    const data = await response.json();
    console.log('✅ Backend Test Results:', data);
    return data;
  } catch (error) {
    console.error('❌ Backend Test Failed:', error);
  }
};

testSupabase();
```

### Option 3: Direct Supabase Query Test

In browser console:

```javascript
// This will use the client-side Supabase
const { createClient } = await import('/lib/supabase/client.js');
const supabase = createClient();

// Test query
const { data, error } = await supabase
  .from('ad_spaces')
  .select('*')
  .limit(5);

console.log('Data:', data);
console.log('Error:', error);
```

## Expected Results

### ✅ Success Indicators:
- `success: true` in test API response
- `count > 0` for all tables
- No errors in any test
- Sample data returned

### ❌ Failure Indicators:
- `success: false`
- `count: 0` for tables (means seed data not run)
- Error messages in any test
- "Failed to fetch" errors

## Troubleshooting

### If categories count is 0:
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM categories;
-- Should return 6
```

### If locations count is 0:
```sql
SELECT COUNT(*) FROM locations;
-- Should return 14
```

### If ad_spaces count is 0:
```sql
SELECT COUNT(*) FROM ad_spaces;
-- Should return 28
```

### If you get "Failed to fetch":
1. Check `.env.local` has correct values
2. Restart dev server
3. Check Supabase project is active
4. Verify RLS policies allow public read

## Testing Individual Services

### Test Ad Spaces Service
```javascript
import { getAdSpaces } from '@/lib/supabase/services';

const test = async () => {
  const spaces = await getAdSpaces();
  console.log('Ad Spaces:', spaces.length, spaces);
};
test();
```

### Test Categories Service
```javascript
import { getCategories } from '@/lib/supabase/services';

const test = async () => {
  const cats = await getCategories();
  console.log('Categories:', cats.length, cats);
};
test();
```

### Test Publishers Service
```javascript
import { getPublishers } from '@/lib/supabase/services';

const test = async () => {
  const pubs = await getPublishers();
  console.log('Publishers:', pubs.length, pubs);
};
test();
```

## API Endpoints Available

1. **GET /api/test-supabase** - Test Supabase connection
2. **POST /api/quote** - Submit quote request
3. **GET /api/places/autocomplete** - Google Places autocomplete
4. **GET /api/geocode** - Google Geocoding

## Next Steps

After confirming backend works:
1. Check home page shows ad space cards
2. Check search page loads data
3. Test filters work
4. Test quote request submission

