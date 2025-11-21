import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API to avoid CORS issues
 * GET /api/supabase-proxy?table=categories&limit=5
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const table = searchParams.get('table') || 'ad_spaces';
    const limit = searchParams.get('limit') || '10';
    const select = searchParams.get('select') || '*';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Supabase not configured'
      }, { status: 500 });
    }

    // Build query URL
    let queryUrl = `${supabaseUrl}/rest/v1/${table}?select=${select}&limit=${limit}`;
    
    // Add filters if provided
    const availability = searchParams.get('availability_status');
    if (availability) {
      queryUrl += `&availability_status=eq.${availability}`;
    }

    // Make request to Supabase
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: 'Supabase request failed',
        status: response.status,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();

    // Return with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

