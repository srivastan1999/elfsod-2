# Quick Fix: Infinite Recursion & Internal Server Error

## Immediate Solution

### Step 1: Add Service Role Key

1. **Get Service Role Key:**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy the **service_role** key (the long one, NOT anon key)

2. **Add to `.env.local`:**
   ```bash
   cd admin-portal
   ```
   
   Create or edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Restart Server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Step 2: Fix RLS Policies (Run in Supabase SQL Editor)

Copy and paste this SQL into Supabase SQL Editor:

```sql
-- Remove all problematic policies
DROP POLICY IF EXISTS "Admins can insert ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Admins can update ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Admins can delete ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Publishers can insert own ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Publishers can update own ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Publishers can delete own ad spaces" ON ad_spaces;

-- Create simple policies that don't cause recursion
CREATE POLICY "Allow inserts on ad spaces" ON ad_spaces
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updates on ad spaces" ON ad_spaces
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow deletes on ad spaces" ON ad_spaces
  FOR DELETE USING (true);
```

## Why This Works

1. **Service Role Key**: Bypasses ALL RLS policies (no recursion possible)
2. **Simple RLS Policies**: If you don't use service role key, these policies don't check `auth.uid()` so no recursion

## Test

After both steps, try creating an ad space again. It should work!

## Still Getting Errors?

Check the browser console and terminal for the detailed error message. The improved error handling will show you exactly what's wrong.

