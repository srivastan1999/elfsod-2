import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build/prerender, environment variables might not be available
  // Check if we're in a build context (SSR/prerender)
  const isBuildTime = typeof window === 'undefined';
  
  if (!supabaseUrl || !supabaseKey) {
    if (isBuildTime) {
      // During build/prerender, log warning but don't throw
      // This allows the build to complete even if env vars are missing
      console.warn('⚠️ Supabase environment variables not configured during build/prerender.');
      // Return a client with placeholder values - it will fail at runtime but allows build to succeed
      return createBrowserClient(
        'https://placeholder.supabase.co',
        'placeholder-key',
        {
          auth: {
            storage: undefined, // No storage during SSR
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
            storageKey: 'elfsod-auth-token',
          },
        }
      );
    }
    
    // At runtime in browser, throw error if env vars are missing
    console.error('❌ Supabase environment variables not configured!');
    throw new Error('Supabase environment variables are missing. Please check .env.local file.');
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'elfsod-auth-token',
      },
    });
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    throw error;
  }
}

