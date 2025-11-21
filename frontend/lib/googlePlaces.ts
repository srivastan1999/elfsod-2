// Google Places API utilities for location detection and autocomplete

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Helper function to check API key (client-side only)
export function checkApiKey(): boolean {
  if (typeof window === 'undefined') return false;
  const hasKey = !!GOOGLE_API_KEY;
  if (process.env.NODE_ENV === 'development') {
    if (hasKey) {
      console.log('✅ Google Maps API key loaded');
    } else {
      console.warn('⚠️ Google Maps API key not found. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local');
    }
  }
  return hasKey;
}

/**
 * Reverse geocoding: Get city name from coordinates using Google Geocoding API
 */
export async function getCityFromCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    // Use Next.js API route to avoid CORS issues
    const response = await fetch(
      `/api/geocode?lat=${lat}&lng=${lng}`
    );

    if (!response.ok) {
      throw new Error('Geocoding API request failed');
    }

    const data = await response.json() as {
      status: string;
      results?: Array<{
        address_components: Array<{
          types: string[];
          long_name: string;
        }>;
        formatted_address: string;
      }>;
      error_message?: string;
    };

    // Handle API errors
    if (data.status === 'REQUEST_DENIED') {
      console.error('Google Geocoding API error:', data.error_message || 'API key invalid or request denied');
      return null;
    }

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      // Find the city name from address components
      // Priority: locality > administrative_area_level_2 > administrative_area_level_1
      for (const result of data.results) {
        for (const component of result.address_components) {
          // Prefer locality (city) first
          if (component.types.includes('locality')) {
            return component.long_name;
          }
        }
      }
      
      // If no locality found, try administrative_area_level_2 (district)
      for (const result of data.results) {
        for (const component of result.address_components) {
          if (component.types.includes('administrative_area_level_2')) {
            return component.long_name;
          }
        }
      }
      
      // Last resort: use administrative_area_level_1 (state) or formatted address
      for (const result of data.results) {
        for (const component of result.address_components) {
          if (component.types.includes('administrative_area_level_1')) {
            return component.long_name;
          }
        }
      }
      
      // Final fallback: use the first formatted address
      return data.results[0].formatted_address.split(',')[0];
    }

    // Handle other statuses
    if (data.status === 'ZERO_RESULTS') {
      console.warn('No results found for coordinates:', lat, lng);
      return null;
    }

    console.warn('Google Geocoding API status:', data.status, data.error_message || 'Unknown error');
    return null;
  } catch (error) {
    console.error('Error in Google Geocoding:', error);
    return null;
  }
}

/**
 * Get city suggestions from Google Places Autocomplete API
 */
export async function getCitySuggestions(
  query: string
): Promise<Array<{ name: string; placeId: string; description: string }>> {
  if (query.length < 2) {
    return [];
  }

  try {
    // Use Next.js API route to avoid CORS issues
    const url = `/api/places/autocomplete?query=${encodeURIComponent(query)}`;
    
    console.log('Fetching suggestions for:', query); // Debug log
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Places Autocomplete API request failed');
    }

    const data = await response.json() as {
      status: string;
      predictions?: Array<{
        place_id: string;
        description: string;
        structured_formatting?: {
          main_text: string;
        };
      }>;
      error_message?: string;
    };

    // Handle API errors
    if (data.status === 'REQUEST_DENIED') {
      console.error('Google Places API error:', data.error_message || 'API key invalid or request denied');
      console.error('Full API response:', data);
      return [];
    }

    if (data.status === 'INVALID_REQUEST') {
      console.error('Google Places API invalid request:', data.error_message);
      return [];
    }

    if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
      const suggestions = data.predictions.map((prediction) => ({
        name: prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
        placeId: prediction.place_id,
        description: prediction.description,
      }));
      console.log('Found suggestions:', suggestions.length); // Debug log
      return suggestions;
    }

    // Handle other statuses (ZERO_RESULTS, etc.)
    if (data.status === 'ZERO_RESULTS') {
      console.log('No results found for:', query);
      return [];
    }

    console.warn('Google Places API status:', data.status, data.error_message || 'Unknown error');
    console.warn('Full API response:', data);
    return [];
  } catch (error) {
    console.error('Error in Google Places Autocomplete:', error);
    return [];
  }
}

/**
 * Get place details from place ID
 */
export async function getPlaceDetails(
  placeId: string
): Promise<{ city: string; coordinates: { lat: number; lng: number } } | null> {
  if (!GOOGLE_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry&key=${GOOGLE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Place Details API request failed');
    }

    const data = await response.json();

    // Handle API errors
    if (data.status === 'REQUEST_DENIED') {
      console.error('Google Place Details API error:', data.error_message);
      return null;
    }

    if (data.status === 'OK' && data.result) {
      const result = data.result;
      return {
        city: result.name,
        coordinates: {
          lat: result.geometry?.location?.lat || 0,
          lng: result.geometry?.location?.lng || 0,
        },
      };
    }

    console.warn('Google Place Details API status:', data.status, data.error_message);
    return null;
  } catch (error) {
    console.error('Error in Google Place Details:', error);
    return null;
  }
}

