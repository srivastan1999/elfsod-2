import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Create or find a location
 * POST /api/locations
 * Body: {
 *   city: string,
 *   area?: string,
 *   address?: string,
 *   state?: string,
 *   country?: string,
 *   latitude?: number,
 *   longitude?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('❌ Failed to create Supabase client:', clientError);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database',
        message: 'Please check your Supabase configuration.',
      }, { status: 500 });
    }

    const body = await request.json();
    const { city, area, address, state, country, latitude, longitude } = body;

    // Validation - check required fields based on schema
    if (!city || !city.trim()) {
      return NextResponse.json({
        success: false,
        error: 'City is required'
      }, { status: 400 });
    }

    if (!address || !address.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Address is required'
      }, { status: 400 });
    }

    if (!state || !state.trim()) {
      return NextResponse.json({
        success: false,
        error: 'State is required'
      }, { status: 400 });
    }

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Latitude and longitude are required'
      }, { status: 400 });
    }

    // Try to find existing location first (from public.locations table)
    // Supabase client automatically queries from public schema
    let query = supabase
      .from('locations')
      .select('*')
      .eq('city', city.trim())
      .eq('address', address.trim());

    const { data: existingLocations, error: findError } = await query;

    // If location exists, return it
    if (existingLocations && existingLocations.length > 0) {
      console.log('✅ Found existing location:', existingLocations[0].id);
      return NextResponse.json({
        success: true,
        data: existingLocations[0],
        message: 'Location found'
      }, { status: 200 });
    }

    // Create new location in public.locations table
    const locationData: any = {
      city: city.trim(),
      state: state.trim(),
      country: country?.trim() || 'India',
      address: address.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    // Add optional fields if provided
    if (area && area.trim()) {
      // Note: 'area' might not be in schema, but we'll include it if the column exists
      // If it causes an error, we'll handle it
    }

    const { data: newLocation, error: insertError } = await supabase
      .from('locations')
      .insert(locationData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating location:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create location',
        details: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: newLocation,
      message: 'Location created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * Get all locations
 * GET /api/locations?city=Mumbai
 */
export async function GET(request: NextRequest) {
  try {
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('❌ Failed to create Supabase client:', clientError);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database',
        message: 'Please check your Supabase configuration.',
      }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');

    let query = supabase.from('locations').select('*');

    if (city) {
      query = query.eq('city', city);
    }

    const { data: locations, error } = await query.order('city', { ascending: true });

    if (error) {
      console.error('❌ Error fetching locations:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch locations',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: locations || [],
      count: locations?.length || 0
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

