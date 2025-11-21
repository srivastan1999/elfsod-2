# Debug: Cards Not Loading

## Current Status
- ✅ Supabase URL: `https://vavubezjuqnkrvndtowt.supabase.co`
- ✅ Anon Key: Set
- ✅ Data exists in Supabase
- ❌ Cards not showing on home page

## Debugging Steps

### 1. Check Browser Console

Open browser console (F12) and look for:

**Success indicators:**
- `✅ Fetched X ad spaces via API`
- `✅ Fetched X categories via API`

**Error indicators:**
- `❌ Error fetching ad spaces`
- `⚠️ API route failed, trying direct service`
- `Failed to fetch`

### 2. Check Network Tab

1. Open DevTools → Network tab
2. Refresh the page
3. Look for:
   - `/api/ad-spaces` request
   - Check its status (200 = success, 500 = error)
   - Check the response

### 3. Test API Directly

Visit in browser:
```
http://localhost:3001/api/ad-spaces?limit=5
```

**Expected**: JSON with `success: true` and `data` array

**If error**: Check the error message

### 4. Check What's Happening

The code flow:
1. Home page loads → calls `fetchAdSpaces()`
2. Tries `/api/ad-spaces` first (bypasses CORS)
3. If API fails → falls back to direct `getAdSpaces()` service
4. Sets `adSpaces` state
5. Renders cards if `filteredAdSpaces.length > 0`

### 5. Common Issues

#### Issue: API returns error
**Check**: Server logs in terminal
**Solution**: Fix server-side connection to Supabase

#### Issue: API works but cards don't show
**Check**: 
- Is `filteredAdSpaces.length > 0`?
- Check browser console for state values
- Check if `AdSpaceCard` component is rendering

#### Issue: "Failed to fetch" in browser
**Check**: 
- Is dev server running?
- Is API route accessible?
- Check CORS headers

### 6. Quick Test

Run in browser console:
```javascript
// Test API
fetch('/api/ad-spaces?limit=5')
  .then(r => r.json())
  .then(data => {
    console.log('API Response:', data);
    console.log('Success:', data.success);
    console.log('Count:', data.count);
    console.log('Data:', data.data);
  })
  .catch(err => console.error('Error:', err));
```

### 7. Check State

In browser console:
```javascript
// This won't work directly, but check React DevTools
// Or add console.log in the component
```

## Next Steps

1. **Check browser console** - What errors do you see?
2. **Test API directly** - Does `/api/ad-spaces` return data?
3. **Check Network tab** - What's the actual HTTP response?
4. **Verify data in Supabase** - Run `SELECT COUNT(*) FROM ad_spaces;`

Once we know what error you're seeing, we can fix it!

