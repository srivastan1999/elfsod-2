import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client with service role key for admin operations
 * This bypasses RLS policies since admin portal uses separate authentication
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required for admin operations!');
    console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
    console.error('   Add it to: admin-portal/.env.local');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Add it to .env.local');
  }

  // Use service role key to bypass RLS for admin operations
  // This is safe because:
  // 1. Only used in server-side API routes
  // 2. Protected by admin session verification
  // 3. Never exposed to client
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });
}

