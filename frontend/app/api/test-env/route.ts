import { NextResponse } from 'next/server';

/**
 * Test environment variables - verify they're accessible in Netlify runtime
 * GET /api/test-env
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const allEnvVars = Object.keys(process.env);
  const supabaseEnvVars = allEnvVars.filter(k => k.includes('SUPABASE') || k.includes('NEXT_PUBLIC'));
  
  return NextResponse.json({
    success: true,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      netlify: process.env.NETLIFY ? 'true' : 'false',
      netlifyEnv: process.env.NETLIFY_ENV || 'not set'
    },
    supabase: {
      url: {
        set: !!supabaseUrl,
        length: supabaseUrl?.length || 0,
        preview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'not set'
      },
      key: {
        set: !!supabaseKey,
        length: supabaseKey?.length || 0,
        preview: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'not set'
      }
    },
    availableEnvVars: supabaseEnvVars,
    totalEnvVars: allEnvVars.length
  });
}

