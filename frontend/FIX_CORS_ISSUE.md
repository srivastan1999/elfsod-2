# Fixing CORS Issues with Supabase

## The Problem
"Failed to fetch" errors are often caused by CORS (Cross-Origin Resource Sharing) policies blocking requests from your browser to Supabase.

## Solution 1: Configure CORS in Supabase Dashboard

1. **Go to Supabase Dashboard**:
   - Visit https://app.supabase.com
   - Select your project

2. **Go to Settings → API**:
   - Scroll down to **"CORS Configuration"** or **"Allowed Origins"**
   - Add your development URL:
     - `http://localhost:3000`
     - `http://localhost:3001`
     - `http://localhost:3002` (if using different port)
   - For production, add your domain:
     - `https://yourdomain.com`

3. **Save Changes**

## Solution 2: Use Next.js API Routes as Proxy

Since we're already using API routes for some things, we can proxy all Supabase requests through Next.js API routes to avoid CORS issues.

## Solution 3: Check Supabase Project Settings

1. **Verify Project is Active**:
   - Dashboard should show "Active" status
   - If paused, resume it

2. **Check API Settings**:
   - Settings → API
   - Verify Project URL is correct
   - Verify anon key is correct

3. **Check RLS (Row Level Security)**:
   - Settings → Database → Policies
   - Make sure public read access is allowed

## Solution 4: Test Direct Connection

Open browser console and test:

```javascript
// Test direct Supabase connection
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_KEY = 'your-anon-key';

fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&limit=1`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

If this fails with CORS error, you'll see:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

## Quick Fix: Add CORS Headers in Next.js

If Supabase CORS can't be configured, we can add CORS headers in our API routes.

## Most Common Issue

**Supabase automatically allows CORS for client-side requests** if:
- You're using the official Supabase client library
- The request includes proper headers (apikey, Authorization)

The "fetch failed" error might actually be:
- Wrong Supabase URL
- Wrong API key
- Network/firewall blocking
- Supabase project paused

## Verify Your Setup

1. Check `.env.local` has correct values
2. Restart dev server after changing `.env.local`
3. Check browser console for actual CORS error message
4. Check Network tab in DevTools to see the failed request

## Next Steps

1. First, verify Supabase URL and key are correct
2. Check Supabase dashboard for CORS settings
3. Test direct connection in browser console
4. Check browser Network tab for actual error

