import { createClient } from '../client';
import { AdSpace } from '@/types';

export interface AdSpaceFilters {
  city?: string;
  categoryId?: string;
  publisherId?: string | string[];
  displayType?: string;
  minPrice?: number;
  maxPrice?: number;
  minFootfall?: number;
  maxFootfall?: number;
  searchQuery?: string;
  availabilityStatus?: string;
}

/**
 * Fetch all ad spaces with optional filters
 */
export async function getAdSpaces(filters?: AdSpaceFilters): Promise<AdSpace[]> {
  try {
    const supabase = createClient();
    
    // Check if Supabase is configured (client-side check)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase environment variables not configured!');
      console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
      throw new Error('Supabase environment variables are missing');
    }
  
    let query = supabase
      .from('ad_spaces')
      .select(`
        *,
        category:categories(id, name, icon_url, description),
        location:locations(id, city, state, country, address, latitude, longitude),
        publisher:publishers(id, name, description, verification_status)
      `);

    // Apply filters
    // Note: City filter needs to be applied via location relationship
    // We'll filter after fetching if city is specified
    let cityFilter = filters?.city;

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.publisherId) {
      // Support both single publisher ID and array
      if (Array.isArray(filters.publisherId)) {
        query = query.in('publisher_id', filters.publisherId);
      } else {
        query = query.eq('publisher_id', filters.publisherId);
      }
    }

    if (filters?.displayType) {
      query = query.eq('display_type', filters.displayType);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price_per_day', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price_per_day', filters.maxPrice);
    }

    if (filters?.minFootfall !== undefined) {
      query = query.gte('daily_impressions', filters.minFootfall);
    }

    if (filters?.maxFootfall !== undefined) {
      query = query.lte('daily_impressions', filters.maxFootfall);
    }

    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    if (filters?.availabilityStatus) {
      query = query.eq('availability_status', filters.availabilityStatus);
    } else {
      // Default to available only
      query = query.eq('availability_status', 'available');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase query error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('📊 Raw data from Supabase:', data?.length || 0, 'records');
    if (data && data.length > 0) {
      console.log('📋 Sample record:', JSON.stringify(data[0], null, 2));
    }

    // Transform data to match AdSpace type
    let spaces = (data || []).map((space: any) => {
      // Ensure location object exists
      if (!space.location) {
        console.warn('⚠️ Ad space missing location:', space.id, space.title);
      }
      
      // Parse JSON fields if they're strings
      let images = space.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          console.warn('Failed to parse images JSON:', e);
          images = [];
        }
      }
      if (!Array.isArray(images)) {
        images = [];
      }
      
      let dimensions = space.dimensions;
      if (typeof dimensions === 'string') {
        try {
          dimensions = JSON.parse(dimensions);
        } catch (e) {
          console.warn('Failed to parse dimensions JSON:', e);
          dimensions = {};
        }
      }
      if (!dimensions || typeof dimensions !== 'object') {
        dimensions = {};
      }
      
      return {
        ...space,
        images,
        dimensions,
        route: space.route || null,
      };
    }) as AdSpace[];

    console.log('🔄 Transformed spaces:', spaces.length);

    // Apply city filter after fetching (since it's a relationship)
    if (cityFilter) {
      const beforeFilter = spaces.length;
      spaces = spaces.filter(space => {
        const matches = space.location?.city === cityFilter;
        if (!matches && space.location) {
          console.log(`🚫 Filtered out: ${space.title} (${space.location.city} !== ${cityFilter})`);
        }
        return matches;
      });
      console.log(`📍 City filter "${cityFilter}": ${beforeFilter} → ${spaces.length} spaces`);
    }

    console.log('✅ Returning', spaces.length, 'ad spaces');
    return spaces;
  } catch (error) {
    console.error('❌ Error in getAdSpaces:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Check if it's a network error
    if (error && typeof error === 'object' && 'message' in error && String(error.message).includes('Failed to fetch')) {
      console.error('🔴 Network Error: Cannot connect to Supabase');
      console.error('Please check:');
      console.error('1. NEXT_PUBLIC_SUPABASE_URL is correct');
      console.error('2. NEXT_PUBLIC_SUPABASE_ANON_KEY is correct');
      console.error('3. Supabase project is active');
      console.error('4. No CORS issues');
    }
    return [];
  }
}

/**
 * Fetch a single ad space by ID
 */
export async function getAdSpaceById(id: string): Promise<AdSpace | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('ad_spaces')
      .select(`
        *,
        category:categories(*),
        location:locations(*),
        publisher:publishers(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching ad space:', error.message || String(error));
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      images: Array.isArray(data.images) ? data.images : [],
      dimensions: data.dimensions || {},
      route: data.route || null,
    } as AdSpace;
  } catch (error) {
    console.error('Error in getAdSpaceById:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Fetch ad spaces by location (city)
 */
export async function getAdSpacesByCity(city: string): Promise<AdSpace[]> {
  return getAdSpaces({ city, availabilityStatus: 'available' });
}

/**
 * Fetch ad spaces by category
 */
export async function getAdSpacesByCategory(categoryId: string): Promise<AdSpace[]> {
  return getAdSpaces({ categoryId, availabilityStatus: 'available' });
}

/**
 * Search ad spaces by query
 */
export async function searchAdSpaces(query: string): Promise<AdSpace[]> {
  return getAdSpaces({ searchQuery: query, availabilityStatus: 'available' });
}

