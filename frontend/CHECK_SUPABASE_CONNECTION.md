# Supabase Connection Issue - Cards Not Showing

## Problem
The API test shows: **"TypeError: fetch failed"** - This means the server cannot connect to Supabase.

## Why Cards Aren't Showing
- Data fetch is failing → No ad spaces loaded → No cards displayed
- Error: "Failed to fetch" in browser console
- API endpoints return connection errors

## Quick Fix Steps

### 1. Verify Environment Variables

Check your `.env.local` file in `frontend/` directory:

```bash
cd frontend
cat .env.local
```

Should have:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Get Correct Values from Supabase

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (should look like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 3. Update .env.local

```bash
cd frontend
nano .env.local  # or use your editor
```

Make sure:
- ✅ No quotes around values
- ✅ No spaces around `=`
- ✅ Values are on separate lines
- ✅ File is saved

### 4. Restart Dev Server

**CRITICAL**: After changing `.env.local`, you MUST restart:

```bash
# Stop server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

### 5. Test Connection

Visit in browser:
```
http://localhost:3001/api/test-connection
```

Should return:
```json
{
  "success": true,
  "message": "Successfully connected to Supabase"
}
```

## Common Issues

### Issue: "fetch failed"
**Cause**: Wrong URL or key, or project not accessible
**Fix**: 
1. Double-check URL and key from Supabase dashboard
2. Verify project is "Active" (not paused)
3. Check network/firewall isn't blocking

### Issue: "Environment variables missing"
**Cause**: `.env.local` not in `frontend/` directory or variables not set
**Fix**: Create/update `.env.local` in `frontend/` directory

### Issue: Still not working after restart
**Cause**: Cached environment or wrong file location
**Fix**:
1. Stop server completely
2. Delete `.next` folder: `rm -rf .next`
3. Restart: `npm run dev`

## Verify It's Working

1. **Test API**: Visit `http://localhost:3001/api/test-connection`
2. **Check Console**: Open browser console, should see:
   - `🔍 Fetching ad spaces with filters:`
   - `✅ Fetched X ad spaces:`
3. **Check Home Page**: Should show ad space cards

## Still Not Working?

1. Check Supabase dashboard - is project active?
2. Check browser Network tab - what's the actual error?
3. Check server logs - any errors in terminal?
4. Verify you're using the **anon/public** key, not service_role

Once connection works, cards will appear automatically!

