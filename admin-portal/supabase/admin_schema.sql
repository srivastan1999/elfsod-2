-- Admin Portal Schema - Separate Authentication System
-- This creates a completely separate admin authentication system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create admin_users table (separate from regular users)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users(is_active);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users table
-- Only admins can view other admins (we'll handle auth via API)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can view all admins" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update own profile" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can be inserted" ON public.admin_users;

-- Policy: Admin users can view all admins (for admin management)
-- Note: This will be checked via API authentication
CREATE POLICY "Admin users can view all admins" ON public.admin_users
  FOR SELECT
  USING (true); -- API will handle authentication

-- Policy: Admin users can be inserted (for initial setup)
-- Note: In production, you may want to restrict this further
CREATE POLICY "Admin users can be inserted" ON public.admin_users
  FOR INSERT
  WITH CHECK (true); -- API will handle authentication

-- Policy: Admin users can update their own profile
CREATE POLICY "Admin users can update own profile" ON public.admin_users
  FOR UPDATE
  USING (true); -- API will handle authentication via session

-- Function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on admin_users table
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Create admin_sessions table for managing admin sessions
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user_id ON public.admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);

-- Enable Row Level Security
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_sessions
DROP POLICY IF EXISTS "Admin sessions are viewable by owner" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admin sessions can be inserted by owner" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admin sessions can be deleted by owner" ON public.admin_sessions;

CREATE POLICY "Admin sessions are viewable by owner" ON public.admin_sessions
  FOR SELECT
  USING (true); -- API will handle authentication

CREATE POLICY "Admin sessions can be inserted by owner" ON public.admin_sessions
  FOR INSERT
  WITH CHECK (true); -- API will handle authentication

CREATE POLICY "Admin sessions can be deleted by owner" ON public.admin_sessions
  FOR DELETE
  USING (true); -- API will handle authentication

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

