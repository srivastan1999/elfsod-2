import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper functions (same as in /api/places/traffic)
function generatePeakHours(placeTypes: string[], openingHours?: any): Array<{ hour: number; traffic_level: string }> {
  const peakHours: Array<{ hour: number; traffic_level: string }> = [];
  
  const isTransit = placeTypes.some(t => t.includes('station') || t.includes('transit'));
  const isShopping = placeTypes.some(t => t.includes('shopping') || t.includes('store'));
  const isRestaurant = placeTypes.some(t => t.includes('restaurant') || t.includes('food') || t.includes('cafe'));
  const isOffice = placeTypes.some(t => t.includes('office') || t.includes('business'));
  
  if (isTransit) {
    for (let hour = 7; hour <= 9; hour++) peakHours.push({ hour, traffic_level: 'very_high' });
    for (let hour = 17; hour <= 19; hour++) peakHours.push({ hour, traffic_level: 'very_high' });
    for (let hour = 10; hour <= 16; hour++) peakHours.push({ hour, traffic_level: 'high' });
  } else if (isShopping) {
    for (let hour = 11; hour <= 20; hour++) {
      peakHours.push({ hour, traffic_level: hour >= 14 && hour <= 18 ? 'very_high' : 'high' });
    }
  } else if (isRestaurant) {
    for (let hour = 12; hour <= 14; hour++) peakHours.push({ hour, traffic_level: 'very_high' });
    for (let hour = 19; hour <= 21; hour++) peakHours.push({ hour, traffic_level: 'very_high' });
  } else if (isOffice) {
    for (let hour = 9; hour <= 17; hour++) {
      peakHours.push({ hour, traffic_level: hour >= 10 && hour <= 15 ? 'very_high' : 'high' });
    }
  } else {
    for (let hour = 9; hour <= 18; hour++) {
      peakHours.push({ hour, traffic_level: 'moderate' });
    }
  }
  
  return peakHours;
}

function generateWeeklyPattern(placeTypes: string[]): any {
  const isShopping = placeTypes.some(t => t.includes('shopping') || t.includes('store'));
  const isRestaurant = placeTypes.some(t => t.includes('restaurant') || t.includes('food'));
  const isTransit = placeTypes.some(t => t.includes('station') || t.includes('transit'));
  
  const pattern: Record<string, string> = {};
  
  if (isShopping) {
    pattern.monday = 'moderate'; pattern.tuesday = 'moderate'; pattern.wednesday = 'moderate';
    pattern.thursday = 'moderate'; pattern.friday = 'high'; pattern.saturday = 'very_high'; pattern.sunday = 'very_high';
  } else if (isRestaurant) {
    pattern.monday = 'low'; pattern.tuesday = 'low'; pattern.wednesday = 'moderate';
    pattern.thursday = 'moderate'; pattern.friday = 'high'; pattern.saturday = 'very_high'; pattern.sunday = 'high';
  } else if (isTransit) {
    pattern.monday = 'very_high'; pattern.tuesday = 'very_high'; pattern.wednesday = 'very_high';
    pattern.thursday = 'very_high'; pattern.friday = 'very_high'; pattern.saturday = 'moderate'; pattern.sunday = 'low';
  } else {
    pattern.monday = 'moderate'; pattern.tuesday = 'moderate'; pattern.wednesday = 'moderate';
    pattern.thursday = 'moderate'; pattern.friday = 'moderate'; pattern.saturday = 'moderate'; pattern.sunday = 'moderate';
  }
  
  return pattern;
}

/**
 * Bulk load traffic data for all ad spaces (or specific ones)
 * POST /api/ad-spaces/load-traffic
 * Body: { adSpaceIds?: string[], limit?: number, force?: boolean }
 * 
 * This endpoint:
 * 1. Fetches ad spaces (optionally filtered by IDs)
 * 2. For each ad space, fetches traffic data from Google Places
 * 3. Saves traffic data to database
 * 4. Returns summary of results
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adSpaceIds, limit = 10, force = false } = body;

    const supabase = await createClient();

    // Build query to get ad spaces
    let query = supabase
      .from('ad_spaces')
      .select('id, title, latitude, longitude, traffic_data')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Filter by specific IDs if provided
    if (adSpaceIds && Array.isArray(adSpaceIds) && adSpaceIds.length > 0) {
      query = query.in('id', adSpaceIds);
    }

    // Limit results
    query = query.limit(limit);

    const { data: adSpaces, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch ad spaces', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!adSpaces || adSpaces.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No ad spaces found to process',
        results: {
          total: 0,
          processed: 0,
          successful: 0,
          failed: 0,
          skipped: 0
        }
      });
    }

    const results = {
      total: adSpaces.length,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{
        id: string;
        title: string;
        status: 'success' | 'failed' | 'skipped';
        error?: string;
      }>
    };

    // Process each ad space
    for (const adSpace of adSpaces) {
      try {
        // Skip if traffic data exists and force is false
        if (!force && adSpace.traffic_data && adSpace.traffic_data.traffic_level !== 'unknown') {
          results.skipped++;
          results.details.push({
            id: adSpace.id,
            title: adSpace.title || 'Unknown',
            status: 'skipped'
          });
          continue;
        }

        // Fetch traffic data from Google Places (use internal API call)
        const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!GOOGLE_API_KEY) {
          throw new Error('Google Maps API key not configured');
        }

        // Call Google Places API directly
        const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${adSpace.latitude},${adSpace.longitude}&radius=500&key=${GOOGLE_API_KEY}`;
        const nearbyResponse = await fetch(nearbySearchUrl);
        
        if (!nearbyResponse.ok) {
          throw new Error(`Nearby Search API failed: ${nearbyResponse.status}`);
        }

        const nearbyData = await nearbyResponse.json();
        
        if (nearbyData.status !== 'OK' && nearbyData.status !== 'ZERO_RESULTS') {
          throw new Error(`Google API error: ${nearbyData.status} - ${nearbyData.error_message || 'Unknown error'}`);
        }

        // Process traffic data (same logic as /api/places/traffic)
        let trafficData: any = {
          average_daily_visitors: null,
          peak_hours: [],
          weekly_pattern: null,
          traffic_level: 'moderate' as 'low' | 'moderate' | 'high' | 'very_high' | 'unknown',
          last_updated: new Date().toISOString(),
          source: 'google_places',
          nearby_places_count: nearbyData.results?.length || 0
        };

        if (nearbyData.results && nearbyData.results.length > 0) {
          const placeId = nearbyData.results[0].place_id;
          const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,types,opening_hours&key=${GOOGLE_API_KEY}`;
          
          const detailsResponse = await fetch(placeDetailsUrl);
          
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            
            if (detailsData.status === 'OK' && detailsData.result) {
              const place = detailsData.result;
              const ratingCount = place.user_ratings_total || 0;
              const placeTypes = place.types || [];
              
              // Calculate traffic level
              let trafficScore = 0;
              if (ratingCount > 1000) trafficScore += 3;
              else if (ratingCount > 500) trafficScore += 2;
              else if (ratingCount > 100) trafficScore += 1;
              
              const highTrafficTypes = ['shopping_mall', 'transit_station', 'airport', 'train_station', 'subway_station', 'bus_station', 'restaurant', 'cafe', 'store'];
              if (placeTypes.some((type: string) => highTrafficTypes.includes(type))) trafficScore += 2;
              
              if (nearbyData.results.length > 20) trafficScore += 2;
              else if (nearbyData.results.length > 10) trafficScore += 1;
              
              if (trafficScore >= 6) trafficData.traffic_level = 'very_high';
              else if (trafficScore >= 4) trafficData.traffic_level = 'high';
              else if (trafficScore >= 2) trafficData.traffic_level = 'moderate';
              else trafficData.traffic_level = 'low';
              
              if (ratingCount > 0) {
                trafficData.average_daily_visitors = Math.round(ratingCount * 0.02);
              }
              
              // Generate peak hours and weekly pattern
              trafficData.peak_hours = generatePeakHours(placeTypes, place.opening_hours);
              trafficData.weekly_pattern = generateWeeklyPattern(placeTypes);
            }
          }
        }

        // Only save if we got valid data
        // trafficData is already defined above and populated from Google Places API
        if (trafficData && trafficData.traffic_level && trafficData.traffic_level !== 'unknown') {
          // Save to database
          const { error: updateError } = await supabase
            .from('ad_spaces')
            .update({
              traffic_data: trafficData,
              updated_at: new Date().toISOString()
            })
            .eq('id', adSpace.id);

          if (updateError) {
            throw new Error(`Database update failed: ${updateError.message}`);
          }

          results.successful++;
          results.details.push({
            id: adSpace.id,
            title: adSpace.title || 'Unknown',
            status: 'success'
          });
        } else {
          throw new Error('Invalid traffic data received');
        }

        results.processed++;

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        results.failed++;
        results.processed++;
        results.details.push({
          id: adSpace.id,
          title: adSpace.title || 'Unknown',
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        });
        console.error(`Error processing ad space ${adSpace.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} ad spaces`,
      results
    });
  } catch (error) {
    console.error('Error in bulk traffic load:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

