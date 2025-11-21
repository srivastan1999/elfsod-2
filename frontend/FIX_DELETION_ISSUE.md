# Fix Ad Space Deletion Issue

## Problem
Deletion of ad spaces from the admin dashboard is not working properly.

## Root Cause
The most common cause is **Row Level Security (RLS) policies** in Supabase blocking the DELETE operation. When RLS is enabled on the `ad_spaces` table, you need explicit policies to allow deletion.

## Solutions

### Solution 1: Use Service Role Key (Recommended for Admin Operations)

The DELETE endpoint now automatically tries to use the service role key (which bypasses RLS) if available.

**Steps:**

1. **Get your Service Role Key:**
   - Go to Supabase Dashboard → Settings → API
   - Copy the **service_role** key (NOT the anon key)
   - ⚠️ **Keep this secret!** Never expose it to the client-side code

2. **Add to Environment Variables:**
   
   **For Local Development** (`.env.local` in `frontend/`):
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   **For Vercel Deployment:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `SUPABASE_SERVICE_ROLE_KEY` with your service role key
   - Make sure it's set for **Production**, **Preview**, and **Development** environments

3. **Restart/Redeploy:**
   - Local: Restart your dev server
   - Vercel: The deployment will automatically pick up the new environment variable

### Solution 2: Create RLS Policies (Alternative)

If you prefer to use RLS policies instead of the service role key:

1. **Go to Supabase SQL Editor**

2. **Run the SQL script:**
   ```sql
   -- Allow authenticated users to delete ad spaces
   CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete ad spaces"
   ON ad_spaces
   FOR DELETE
   TO authenticated
   USING (true);
   ```

   Or if you want to allow anon role (less secure):
   ```sql
   CREATE POLICY IF NOT EXISTS "Allow anon to delete ad spaces"
   ON ad_spaces
   FOR DELETE
   TO anon
   USING (true);
   ```

3. **Or use the provided SQL file:**
   - Run `frontend/supabase/fix_rls_for_deletion.sql` in Supabase SQL Editor

### Solution 3: Disable RLS (NOT RECOMMENDED)

Only for testing/development:

```sql
ALTER TABLE ad_spaces DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning:** This removes all security. Only use in development.

## Verification

After applying a solution:

1. **Try deleting an ad space** from the admin dashboard
2. **Check the browser console** for any error messages
3. **Check the server logs** (Vercel logs or local terminal) for detailed error information

## Error Messages

The DELETE endpoint now provides detailed error messages:

- **"Permission denied"** → RLS policy is blocking deletion (use Solution 1 or 2)
- **"Cannot delete ad space - has active bookings"** → Cancel bookings first
- **"Ad space not found"** → The ad space doesn't exist or was already deleted

## Files Changed

1. `frontend/lib/supabase/server.ts` - Added `createAdminClient()` function
2. `frontend/app/api/ad-spaces/[id]/route.ts` - Updated DELETE endpoint to use admin client
3. `frontend/supabase/fix_rls_for_deletion.sql` - SQL script to create RLS policies

## Next Steps

1. Add `SUPABASE_SERVICE_ROLE_KEY` to your environment variables (Solution 1)
2. Or create RLS policies (Solution 2)
3. Test deletion from admin dashboard
4. If still not working, check the error message in the browser console or server logs

