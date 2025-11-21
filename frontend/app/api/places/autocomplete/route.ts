import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
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
    // Use the correct Places Autocomplete API format
    // types parameter: (cities) for cities only - needs to be properly encoded
    // Also add language and region for better results in India
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const params = new URLSearchParams({
      input: query,
      types: '(cities)', // This will be properly encoded by URLSearchParams
      key: GOOGLE_API_KEY,
      components: 'country:in',
      language: 'en',
      region: 'in'
    });
    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Places Autocomplete API HTTP error:', response.status, errorText);
      throw new Error(`Places Autocomplete API request failed: ${response.status}`);
    }

    const data = await response.json();

    // Log errors for debugging
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places Autocomplete API error:', {
        status: data.status,
        error_message: data.error_message,
        query: query
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Places Autocomplete API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch suggestions', 
        status: 'ERROR',
        error_message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

