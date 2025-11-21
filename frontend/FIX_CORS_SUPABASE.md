# Fix CORS Issues with Supabase

## 🔍 Problem: "Failed to fetch" Error

If you're seeing "Failed to fetch" errors, it's likely a **CORS (Cross-Origin Resource Sharing)** issue.

## ✅ Solution 1: Check Supabase Project Status

1. **Go to [Supabase Dashboard](https://app.supabase.com)**
2. **Select your project**
3. **Check if project is ACTIVE** (not paused)
   - If paused, click "Resume" or "Restore"
   - Paused projects block all API requests

## ✅ Solution 2: Verify Supabase URL and Key

1. **Check your `.env.local` file:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://vavubezjuqnkrvndtowt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Verify in Supabase Dashboard:**
   - Go to **Settings → API**
   - Copy the **Project URL** (should match your env var)
   - Copy the **anon/public key** (should match your env var)

3. **Restart your dev server** after changing env vars:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## ✅ Solution 3: Test Direct Connection

Open browser console and run:

```javascript
const SUPABASE_URL = 'https://vavubezjuqnkrvndtowt.supabase.co';
const SUPABASE_KEY = 'your-anon-key-here';

fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&limit=1`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**If this fails:**
- Check browser console for CORS error message
- Check Network tab → see if request is blocked
- Check if error shows "Access-Control-Allow-Origin"

## ✅ Solution 4: Check Browser Console

1. **Open browser console (F12)**
2. **Go to Network tab**
3. **Try to load the page**
4. **Look for the failed request:**
   - Click on it
   - Check **Headers** tab
   - Look for CORS-related headers
   - Check **Response** tab for error message

## ✅ Solution 5: Supabase RLS (Row Level Security)

1. **Go to Supabase Dashboard → Authentication → Policies**
2. **Check if RLS is enabled** for `categories` and `ad_spaces` tables
3. **If RLS is enabled, create policies:**
   ```sql
   -- Allow public read access to categories
   CREATE POLICY "Allow public read access" ON categories
   FOR SELECT USING (true);
   
   -- Allow public read access to ad_spaces
   CREATE POLICY "Allow public read access" ON ad_spaces
   FOR SELECT USING (true);
   ```

## ✅ Solution 6: Network/Firewall Issues

1. **Check if you're behind a corporate firewall**
2. **Try a different network** (mobile hotspot)
3. **Check if VPN is blocking requests**
4. **Disable browser extensions** that might block requests

## ✅ Solution 7: Use Next.js API Routes (Workaround)

If CORS can't be fixed, the app should automatically fall back to using Next.js API routes, which run server-side and bypass CORS. However, if both are failing, there's a deeper issue.

## 🔍 Debugging Steps

1. **Check Supabase project status:**
   - Dashboard should show "Active"
   - No warnings about paused project

2. **Verify environment variables:**
   ```bash
   # In your terminal
   cd frontend
   node -e "console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)"
   ```
   (Note: This won't work in browser, only server-side)

3. **Test in browser console:**
   ```javascript
   // Check if env vars are available
   console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
   console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20));
   ```

4. **Check Network tab:**
   - Look for requests to `*.supabase.co`
   - Check status code (should be 200, not blocked)
   - Check response headers for CORS headers

## 🚨 Most Common Issues

1. **Project is paused** → Resume it in dashboard
2. **Wrong URL/key** → Check Settings → API in dashboard
3. **RLS blocking** → Create public read policies
4. **Network blocking** → Try different network
5. **Browser extension** → Disable ad blockers/privacy extensions

## 📞 Still Not Working?

1. **Share the exact error message** from browser console
2. **Share Network tab details** (screenshot if possible)
3. **Check Supabase status page**: https://status.supabase.com
4. **Verify project is not paused** in dashboard

---

**Next Step**: Check your Supabase dashboard to ensure the project is active!

