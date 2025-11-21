import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Test Supabase connection - uses official Supabase client
 * GET /api/test-supabase
 */
export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables not configured',
        details: {
          url: supabaseUrl ? 'Set' : 'Missing',
          key: supabaseKey ? 'Set' : 'Missing'
        }
      }, { status: 500 });
    }

    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('Failed to create Supabase client:', clientError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create Supabase client',
        message: clientError instanceof Error ? clientError.message : String(clientError)
      }, { status: 500 });
    }

    // Test 1: Check categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);

    // Test 2: Check locations
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .limit(5);

    // Test 3: Check publishers
    const { data: publishers, error: publishersError } = await supabase
      .from('publishers')
      .select('*')
      .limit(5);

    // Test 4: Check ad_spaces
    const { data: adSpaces, error: adSpacesError } = await supabase
      .from('ad_spaces')
      .select(`
        *,
        category:categories(id, name),
        location:locations(id, city, address),
        publisher:publishers(id, name)
      `)
      .eq('availability_status', 'available')
      .limit(5);

    // Compile results
    const results = {
      success: true,
      environment: {
        supabaseUrl: supabaseUrl.replace(/https:\/\/([^.]+)\.supabase\.co/, 'https://***.supabase.co'),
        supabaseKeySet: supabaseKey ? true : false,
      },
      tests: {
        categories: {
          success: !categoriesError,
          count: categories?.length || 0,
          error: categoriesError?.message,
          sample: categories?.[0] || null
        },
        locations: {
          success: !locationsError,
          count: locations?.length || 0,
          error: locationsError?.message,
          sample: locations?.[0] || null
        },
        publishers: {
          success: !publishersError,
          count: publishers?.length || 0,
          error: publishersError?.message,
          sample: publishers?.[0] || null
        },
        adSpaces: {
          success: !adSpacesError,
          count: adSpaces?.length || 0,
          error: adSpacesError?.message,
          sample: adSpaces?.[0] ? {
            id: adSpaces[0].id,
            title: adSpaces[0].title,
            category: adSpaces[0].category?.name,
            location: adSpaces[0].location?.city
          } : null
        }
      },
      summary: {
        allTestsPassed: !categoriesError && !locationsError && !publishersError && !adSpacesError,
        totalRecords: (categories?.length || 0) + (locations?.length || 0) + (publishers?.length || 0) + (adSpaces?.length || 0)
      }
    };

    return NextResponse.json(results);

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
