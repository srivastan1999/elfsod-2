import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Next.js API route to fetch publishers
 * GET /api/publishers
 */
export async function GET() {
  try {
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('❌ Failed to create Supabase client:', clientError);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database',
        message: 'Please check your Supabase configuration. Frontend will try direct connection.',
        fallback: true
      }, { status: 500 });
    }

    let data, error;
    try {
      const result = await supabase
        .from('publishers')
        .select('*')
        .order('name', { ascending: true });
      data = result.data;
      error = result.error;
    } catch (fetchError) {
      // Handle fetch/network errors (like SSL certificate issues)
      console.error('❌ Supabase fetch error (likely SSL/network issue):', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch publishers',
        message: fetchError instanceof Error ? fetchError.message : String(fetchError),
        fallback: true, // Signal frontend to use direct service
        details: 'Server-side connection failed. Frontend will use direct browser connection.'
      }, { status: 500 });
    }

    if (error) {
      console.error('❌ Supabase query error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

