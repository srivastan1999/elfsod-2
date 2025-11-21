import { NextResponse } from 'next/server';

/**
 * Simple connection test - doesn't use Supabase client
 * GET /api/test-connection
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Environment variables missing',
        env: {
          url: supabaseUrl ? 'Set' : 'Missing',
          key: supabaseKey ? 'Set' : 'Missing'
        }
      }, { status: 500 });
    }

    // Test direct fetch to Supabase REST API
    const testUrl = `${supabaseUrl}/rest/v1/categories?select=count&limit=1`;
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({
          success: false,
          error: 'Supabase API request failed',
          status: response.status,
          statusText: response.statusText,
          errorDetails: errorText,
          testUrl: testUrl.replace(supabaseKey, 'HIDDEN')
        }, { status: response.status });
      }

      const data = await response.json();

      return NextResponse.json({
        success: true,
        message: 'Successfully connected to Supabase',
        supabaseUrl: supabaseUrl.replace(/https:\/\/([^.]+)\.supabase\.co/, 'https://***.supabase.co'),
        testResult: {
          status: response.status,
          dataReceived: Array.isArray(data),
          recordCount: Array.isArray(data) ? data.length : 'N/A'
        }
      });

    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('cors') || errorMessage.includes('Access-Control');
      
      return NextResponse.json({
        success: false,
        error: isCorsError ? 'CORS error' : 'Network error connecting to Supabase',
        message: errorMessage,
        isCorsIssue: isCorsError,
        troubleshooting: {
          checkUrl: 'Verify NEXT_PUBLIC_SUPABASE_URL is correct',
          checkKey: 'Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct',
          checkNetwork: 'Check if Supabase project is accessible',
          checkCORS: isCorsError ? 'CORS is blocking requests. Configure in Supabase dashboard or use proxy API.' : 'Verify CORS settings in Supabase dashboard',
          useProxy: isCorsError ? 'Try using /api/supabase-proxy instead' : null
        }
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

