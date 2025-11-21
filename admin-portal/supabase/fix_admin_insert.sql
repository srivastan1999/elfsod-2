-- Fix: Add INSERT policy for admin_users table
-- Run this SQL in your Supabase SQL Editor if you're getting insert errors

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admin users can be inserted" ON public.admin_users;

-- Create INSERT policy
CREATE POLICY "Admin users can be inserted" ON public.admin_users
  FOR INSERT
  WITH CHECK (true); -- API will handle authentication

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Admin users can be inserted';

