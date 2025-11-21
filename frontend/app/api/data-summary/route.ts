import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Data Summary API - Shows what data is available
 * Uses official Supabase client
 * GET /api/data-summary
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

    // Get all data using Supabase client
    const [
      { data: categories, error: categoriesError },
      { data: locations, error: locationsError },
      { data: publishers, error: publishersError },
      { data: adSpaces, error: adSpacesError },
      { data: availableAdSpaces, error: availableError }
    ] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('locations').select('*'),
      supabase.from('publishers').select('*'),
      supabase.from('ad_spaces').select('*'),
      supabase.from('ad_spaces').select('*').eq('availability_status', 'available')
    ]);

    // Get sample ad spaces with relationships
    const { data: sampleAdSpaces, error: sampleError } = await supabase
      .from('ad_spaces')
      .select(`
        id,
        title,
        availability_status,
        location:locations(city, address),
        category:categories(name)
      `)
      .limit(5);

    // Get ad spaces by city
    const { data: adSpacesByCity, error: cityError } = await supabase
      .from('ad_spaces')
      .select('location:locations(city)')
      .eq('availability_status', 'available');

    // Check for errors
    if (categoriesError || locationsError || publishersError || adSpacesError) {
      return NextResponse.json({
        success: false,
        error: 'Database query errors',
        details: {
          categories: categoriesError?.message,
          locations: locationsError?.message,
          publishers: publishersError?.message,
          adSpaces: adSpacesError?.message
        }
      }, { status: 500 });
    }

    const cityCounts: Record<string, number> = {};
    adSpacesByCity?.forEach((space: any) => {
      const city = space.location?.city;
      if (city) {
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      summary: {
        categories: categories?.length || 0,
        locations: locations?.length || 0,
        publishers: publishers?.length || 0,
        totalAdSpaces: adSpaces?.length || 0,
        availableAdSpaces: availableAdSpaces?.length || 0
      },
      byCity: cityCounts,
      sampleAdSpaces: sampleAdSpaces || [],
      status: {
        databaseConnected: true,
        hasData: (adSpaces?.length || 0) > 0,
        ready: (categories?.length || 0) > 0 && (locations?.length || 0) > 0 && (adSpaces?.length || 0) > 0
      }
    });

  } catch (error) {
    console.error('Data summary error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      status: {
        databaseConnected: false,
        hasData: false,
        ready: false
      }
    }, { status: 500 });
  }
}
