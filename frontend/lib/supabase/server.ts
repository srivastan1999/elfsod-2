import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import https from 'https'

export async function createClient() {
  // Check environment variables first
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    // Log available env vars for debugging
    const availableEnvVars = Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('NEXT_PUBLIC'));
    console.error('❌ Missing Supabase environment variables:', missing);
    console.error('Available env vars:', availableEnvVars);
    
    throw new Error(`Supabase environment variables not configured. Missing: ${missing.join(', ')}. Please check your Netlify environment variables are set for production context.`);
  }
  
  // Log that env vars are present (without exposing values)
  console.log('✅ Supabase env vars configured:', {
    urlSet: !!supabaseUrl,
    keySet: !!supabaseKey,
    urlLength: supabaseUrl?.length || 0
  });

  try {
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch (cookieError) {
      // In some serverless environments, cookies() might fail
      // We'll create a client without cookie support for read-only operations
      console.warn('⚠️ Could not access cookies, creating read-only Supabase client:', cookieError);
      
      // Create a minimal client for read operations
      return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            getAll() {
              return [];
            },
            setAll() {
              // No-op for read-only operations
            },
          },
        }
      );
    }

    return createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create Supabase client: ${errorMessage}`);
  }
}

