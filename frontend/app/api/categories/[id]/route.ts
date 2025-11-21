import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Next.js API route to fetch a single category by ID
 * GET /api/categories/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('❌ Failed to create Supabase client:', clientError);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database',
        message: 'Please check your Supabase configuration.',
        fallback: true
      }, { status: 500 });
    }

    let data, error;
    try {
      const result = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      data = result.data;
      error = result.error;
    } catch (fetchError) {
      console.error('❌ Supabase fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch category',
        message: fetchError instanceof Error ? fetchError.message : String(fetchError),
        fallback: true
      }, { status: 500 });
    }

    if (error) {
      console.error('❌ Supabase query error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message
      }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data
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

