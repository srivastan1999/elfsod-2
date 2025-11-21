import { createClient } from '../client';

export interface Location {
  id: string;
  city: string;
  state: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  postal_code?: string;
  created_at: string;
}

/**
 * Fetch all locations
 */
export async function getLocations(): Promise<Location[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('city', { ascending: true });

    if (error) {
      console.error('Error fetching locations:', error.message || String(error));
      throw error;
    }

    return (data || []) as Location[];
  } catch (error) {
    console.error('Error in getLocations:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Fetch locations by city
 */
export async function getLocationsByCity(city: string): Promise<Location[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('city', city)
      .order('address', { ascending: true });

    if (error) {
      console.error('Error fetching locations by city:', error.message || String(error));
      throw error;
    }

    return (data || []) as Location[];
  } catch (error) {
    console.error('Error in getLocationsByCity:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Get unique cities from locations
 */
export async function getCities(): Promise<string[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('city')
      .order('city', { ascending: true });

    if (error) {
      console.error('Error fetching cities:', error.message || String(error));
      throw error;
    }

    // Get unique cities
    const uniqueCities = Array.from(new Set((data || []).map((loc: any) => loc.city)));
    return uniqueCities as string[];
  } catch (error) {
    console.error('Error in getCities:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

