import { NextRequest, NextResponse } from 'next/server';

/**
 * Fetch traffic/popular times data from Google Places API
 * This uses Place Details API to get information about nearby places
 * and estimates traffic based on location popularity
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '500'; // Default 500m radius

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
    // Step 1: Use Nearby Search to find places near the location
    const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${GOOGLE_API_KEY}`;
    
    const nearbyResponse = await fetch(nearbySearchUrl);
    
    if (!nearbyResponse.ok) {
      throw new Error(`Nearby Search API request failed: ${nearbyResponse.status}`);
    }

    const nearbyData = await nearbyResponse.json();

    if (nearbyData.status !== 'OK' && nearbyData.status !== 'ZERO_RESULTS') {
      console.error('Google Nearby Search API error:', {
        status: nearbyData.status,
        error_message: nearbyData.error_message,
        coordinates: { lat, lng }
      });
      
      // Return default traffic data if API fails
      return NextResponse.json({
        average_daily_visitors: null,
        peak_hours: [],
        weekly_pattern: null,
        traffic_level: 'unknown',
        last_updated: new Date().toISOString(),
        source: 'google_places',
        note: 'Unable to fetch traffic data from Google Places API'
      });
    }

    // Step 2: Get details for the most relevant place (first result)
    let trafficData = {
      average_daily_visitors: null as number | null,
      peak_hours: [] as Array<{ hour: number; traffic_level: string }>,
      weekly_pattern: null as any,
      traffic_level: 'moderate' as 'low' | 'moderate' | 'high' | 'very_high' | 'unknown',
      last_updated: new Date().toISOString(),
      source: 'google_places',
      nearby_places_count: nearbyData.results?.length || 0
    };

    if (nearbyData.results && nearbyData.results.length > 0) {
      // Get details for the first (most relevant) place
      const placeId = nearbyData.results[0].place_id;
      const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,types,opening_hours&key=${GOOGLE_API_KEY}`;
      
      const detailsResponse = await fetch(placeDetailsUrl);
      
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        
        if (detailsData.status === 'OK' && detailsData.result) {
          const place = detailsData.result;
          
          // Estimate traffic based on ratings and place type
          const rating = place.rating || 0;
          const ratingCount = place.user_ratings_total || 0;
          const placeTypes = place.types || [];
          
          // Calculate traffic level based on multiple factors
          let trafficScore = 0;
          
          // Factor 1: Rating count (more reviews = more visitors)
          if (ratingCount > 1000) trafficScore += 3;
          else if (ratingCount > 500) trafficScore += 2;
          else if (ratingCount > 100) trafficScore += 1;
          
          // Factor 2: Place type (some types are inherently high traffic)
          const highTrafficTypes = ['shopping_mall', 'transit_station', 'airport', 'train_station', 'subway_station', 'bus_station', 'restaurant', 'cafe', 'store'];
          const hasHighTrafficType = placeTypes.some((type: string) => highTrafficTypes.includes(type));
          if (hasHighTrafficType) trafficScore += 2;
          
          // Factor 3: Number of nearby places (more places = more footfall)
          if (nearbyData.results.length > 20) trafficScore += 2;
          else if (nearbyData.results.length > 10) trafficScore += 1;
          
          // Determine traffic level
          if (trafficScore >= 6) trafficData.traffic_level = 'very_high';
          else if (trafficScore >= 4) trafficData.traffic_level = 'high';
          else if (trafficScore >= 2) trafficData.traffic_level = 'moderate';
          else trafficData.traffic_level = 'low';
          
          // Estimate daily visitors based on rating count
          // Rough estimate: 1 review per 50-100 visitors (conservative)
          if (ratingCount > 0) {
            trafficData.average_daily_visitors = Math.round(ratingCount * 0.02); // 2% of total reviews = daily visitors
          }
          
          // Generate peak hours based on place type
          const peakHours = generatePeakHours(placeTypes, place.opening_hours);
          trafficData.peak_hours = peakHours;
          
          // Generate weekly pattern
          trafficData.weekly_pattern = generateWeeklyPattern(placeTypes);
        }
      }
    }

    return NextResponse.json(trafficData);
  } catch (error) {
    console.error('Error fetching traffic data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch traffic data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * Generate peak hours based on place type
 */
function generatePeakHours(placeTypes: string[], openingHours?: any): Array<{ hour: number; traffic_level: string }> {
  const peakHours: Array<{ hour: number; traffic_level: string }> = [];
  
  // Default peak hours for different place types
  const isTransit = placeTypes.some(t => t.includes('station') || t.includes('transit'));
  const isShopping = placeTypes.some(t => t.includes('shopping') || t.includes('store'));
  const isRestaurant = placeTypes.some(t => t.includes('restaurant') || t.includes('food') || t.includes('cafe'));
  const isOffice = placeTypes.some(t => t.includes('office') || t.includes('business'));
  
  if (isTransit) {
    // Transit stations: Peak at 7-9 AM and 5-7 PM
    for (let hour = 7; hour <= 9; hour++) {
      peakHours.push({ hour, traffic_level: 'very_high' });
    }
    for (let hour = 17; hour <= 19; hour++) {
      peakHours.push({ hour, traffic_level: 'very_high' });
    }
    for (let hour = 10; hour <= 16; hour++) {
      peakHours.push({ hour, traffic_level: 'high' });
    }
  } else if (isShopping) {
    // Shopping: Peak at 11 AM - 8 PM
    for (let hour = 11; hour <= 20; hour++) {
      peakHours.push({ hour, traffic_level: hour >= 14 && hour <= 18 ? 'very_high' : 'high' });
    }
  } else if (isRestaurant) {
    // Restaurants: Peak at 12-2 PM and 7-9 PM
    for (let hour = 12; hour <= 14; hour++) {
      peakHours.push({ hour, traffic_level: 'very_high' });
    }
    for (let hour = 19; hour <= 21; hour++) {
      peakHours.push({ hour, traffic_level: 'very_high' });
    }
  } else if (isOffice) {
    // Offices: Peak at 9 AM - 5 PM
    for (let hour = 9; hour <= 17; hour++) {
      peakHours.push({ hour, traffic_level: hour >= 10 && hour <= 15 ? 'very_high' : 'high' });
    }
  } else {
    // Default: Moderate traffic throughout day
    for (let hour = 9; hour <= 18; hour++) {
      peakHours.push({ hour, traffic_level: 'moderate' });
    }
  }
  
  return peakHours;
}

/**
 * Generate weekly traffic pattern
 */
function generateWeeklyPattern(placeTypes: string[]): any {
  const isShopping = placeTypes.some(t => t.includes('shopping') || t.includes('store'));
  const isRestaurant = placeTypes.some(t => t.includes('restaurant') || t.includes('food'));
  const isTransit = placeTypes.some(t => t.includes('station') || t.includes('transit'));
  
  const pattern: Record<string, string> = {};
  
  if (isShopping) {
    // Shopping: Busiest on weekends
    pattern.monday = 'moderate';
    pattern.tuesday = 'moderate';
    pattern.wednesday = 'moderate';
    pattern.thursday = 'moderate';
    pattern.friday = 'high';
    pattern.saturday = 'very_high';
    pattern.sunday = 'very_high';
  } else if (isRestaurant) {
    // Restaurants: Busy on weekends and Friday
    pattern.monday = 'low';
    pattern.tuesday = 'low';
    pattern.wednesday = 'moderate';
    pattern.thursday = 'moderate';
    pattern.friday = 'high';
    pattern.saturday = 'very_high';
    pattern.sunday = 'high';
  } else if (isTransit) {
    // Transit: Busy on weekdays
    pattern.monday = 'very_high';
    pattern.tuesday = 'very_high';
    pattern.wednesday = 'very_high';
    pattern.thursday = 'very_high';
    pattern.friday = 'very_high';
    pattern.saturday = 'moderate';
    pattern.sunday = 'low';
  } else {
    // Default: Moderate throughout week
    pattern.monday = 'moderate';
    pattern.tuesday = 'moderate';
    pattern.wednesday = 'moderate';
    pattern.thursday = 'moderate';
    pattern.friday = 'moderate';
    pattern.saturday = 'moderate';
    pattern.sunday = 'moderate';
  }
  
  return pattern;
}

