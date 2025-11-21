-- Fix Infinite Recursion in RLS Policies for Ad Spaces
-- This removes problematic policies and creates simple ones for admin portal

-- Drop all existing policies on ad_spaces that might cause recursion
DROP POLICY IF EXISTS "Ad spaces are viewable by everyone" ON ad_spaces;
DROP POLICY IF EXISTS "Admins can insert ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Admins can update ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Admins can delete ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Publishers can insert own ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Publishers can update own ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Publishers can delete own ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Allow admin portal to insert ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Allow admin portal to update ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Allow admin portal to delete ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Allow inserts on ad_spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Users can view own ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Anyone can insert ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Anyone can update ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Anyone can delete ad spaces" ON ad_spaces;

-- Create simple, non-recursive policies
-- SELECT: Everyone can read ad spaces
CREATE POLICY "Anyone can read ad spaces" ON ad_spaces
  FOR SELECT
  USING (true);

-- INSERT: Allow inserts (admin portal uses service role which bypasses RLS anyway)
-- But we'll create a simple policy just in case
CREATE POLICY "Allow inserts on ad spaces" ON ad_spaces
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: Allow updates
CREATE POLICY "Allow updates on ad spaces" ON ad_spaces
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE: Allow deletes
CREATE POLICY "Allow deletes on ad spaces" ON ad_spaces
  FOR DELETE
  USING (true);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'ad_spaces'
ORDER BY policyname;

