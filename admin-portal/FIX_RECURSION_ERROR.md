# Fix: Infinite Recursion Detected in Policy

## Problem
When creating ad spaces, you get: **"infinite recursion detected in policy"**

This happens because RLS policies are checking `auth.uid()` which doesn't exist for admin portal users (they use custom authentication).

## Solution: Use Service Role Key

The admin portal now uses the **service role key** which completely bypasses RLS policies. This is the recommended approach for admin operations.

### Step 1: Get Your Service Role Key

1. Go to **Supabase Dashboard**
2. Navigate to **Settings** → **API**
3. Find the **service_role** key (NOT the anon key)
4. Copy it

### Step 2: Add to Environment Variables

Add this to `admin-portal/.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Restart Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Verify It's Working

Try creating an ad space again. It should work now.

## Alternative: Fix RLS Policies (If Service Role Key Doesn't Work)

If you prefer to fix the RLS policies instead, run this SQL in Supabase:

```sql
-- File: admin-portal/supabase/fix_rls_recursion.sql
```

This removes all problematic policies and creates simple ones that don't cause recursion.

## Why This Happens

The RLS policies check `auth.uid()` which:
- Works for Supabase Auth users
- Doesn't exist for admin portal users (custom auth)
- Causes infinite recursion when policies reference each other

The service role key bypasses ALL RLS policies, which is safe for admin operations since:
- ✅ Only used server-side
- ✅ Protected by admin session verification
- ✅ Never exposed to client

