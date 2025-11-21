import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Use reverse geocoding with proper result types and language
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&result_type=locality|administrative_area_level_2|administrative_area_level_1&language=en&region=in`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geocoding API HTTP error:', response.status, errorText);
      throw new Error(`Geocoding API request failed: ${response.status}`);
    }

    const data = await response.json();

    // Log errors for debugging
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Geocoding API error:', {
        status: data.status,
        error_message: data.error_message,
        coordinates: { lat, lng }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Geocoding API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to geocode coordinates', 
        status: 'ERROR',
        error_message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

