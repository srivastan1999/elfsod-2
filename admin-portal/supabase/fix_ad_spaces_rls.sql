-- Fix RLS Policies for Admin Portal to Insert/Update/Delete Ad Spaces
-- The admin portal uses a separate authentication system (admin_users table)
-- So we need to allow inserts/updates/deletes for admin portal operations

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Allow admin portal to insert ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Allow admin portal to update ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Allow admin portal to delete ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Allow inserts on ad_spaces" ON ad_spaces;

-- Allow inserts for ad_spaces (admin portal uses service role or bypasses RLS)
-- Since admin portal uses separate auth, we allow inserts for now
-- In production, you might want to restrict this further
CREATE POLICY "Allow admin portal to insert ad spaces" ON ad_spaces
  FOR INSERT
  WITH CHECK (true);

-- Allow updates for ad_spaces
CREATE POLICY "Allow admin portal to update ad spaces" ON ad_spaces
  FOR UPDATE
  USING (true);

-- Allow deletes for ad_spaces
CREATE POLICY "Allow admin portal to delete ad spaces" ON ad_spaces
  FOR DELETE
  USING (true);

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'ad_spaces'
ORDER BY policyname;

