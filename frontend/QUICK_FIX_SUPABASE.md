# Quick Fix: Supabase Connection

## Your Supabase URL is Set ✅
```
https://vavubezjuqnkrvndtowt.supabase.co
```

## Next Steps

### 1. Verify Anon Key is Set

Check your `.env.local` file has BOTH:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vavubezjuqnkrvndtowt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get your anon key:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy the **anon/public** key (starts with `eyJ...`)

### 2. Restart Dev Server

**IMPORTANT**: After checking/updating `.env.local`:

```bash
# Stop server (Ctrl+C or Cmd+C)
cd frontend
npm run dev
```

### 3. Test the Connection

Visit in browser:
```
http://localhost:3001/api/test-connection
```

### 4. Check Browser Console

Open browser console (F12) and look for:
- `✅ Fetched X ad spaces via API` - Success!
- `❌ Error fetching ad spaces` - Still has issues

### 5. Verify Data is Loaded

In Supabase SQL Editor, run:
```sql
SELECT COUNT(*) FROM ad_spaces;
-- Should return 28
```

If it returns 0, run the seed data:
```sql
-- Copy and run: frontend/supabase/seed_data.sql
```

## If Still Not Working

1. **Check Supabase Dashboard**:
   - Is project status "Active"?
   - Are tables created?
   - Is seed data loaded?

2. **Check Browser Network Tab**:
   - Look for `/api/ad-spaces` request
   - Check the response/error

3. **Check Server Logs**:
   - Look in terminal where `npm run dev` is running
   - Check for error messages

## The API Routes Are Ready

I've set up:
- ✅ `/api/ad-spaces` - Fetches ad spaces (bypasses CORS)
- ✅ `/api/categories` - Fetches categories
- ✅ Home page uses API routes
- ✅ Search page uses API routes

Once Supabase connection works, cards will appear automatically!

