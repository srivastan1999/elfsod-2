import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { directSupabaseQuery } from '@/lib/supabase/direct-client';

/**
 * Next.js API route to fetch categories
 * GET /api/categories?city=Mumbai
 */
export async function GET(request: NextRequest) {
  try {
    // Get city parameter from query string
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('❌ Failed to create Supabase client:', clientError);
      
      // Better error message handling
      let errorMessage = 'Failed to create Supabase client';
      if (clientError instanceof Error) {
        errorMessage = clientError.message;
      } else if (typeof clientError === 'object' && clientError !== null) {
        errorMessage = JSON.stringify(clientError, Object.getOwnPropertyNames(clientError));
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database',
        message: errorMessage,
        fallback: true,
        details: 'Please check your Supabase configuration in Netlify environment variables. Frontend will try direct connection.'
      }, { status: 500 });
    }

    let data, error;
    try {
      // First, try to fetch all categories using Supabase client
      let categoriesResult;
      try {
        categoriesResult = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (categoriesResult.error) {
          throw categoriesResult.error;
        }
      } catch (clientError) {
        // If Supabase client fails (fetch error), try direct HTTP
        console.warn('⚠️ Supabase client failed, trying direct HTTP:', clientError);
        const directResult = await directSupabaseQuery<any>('categories', {
          orderBy: { column: 'name', ascending: true }
        });
        
        if (directResult.error) {
          throw new Error(directResult.error.message);
        }
        
        categoriesResult = { data: directResult.data || [], error: null };
      }
      
      const categories = categoriesResult.data || [];
      
      // Count ad spaces per category, filtered by location if city is provided
      // Logic: category + location = count of cards that will show
      const countsMap: Record<string, number> = {};
      
      for (const cat of categories) {
        // Build query with category filter
        let query = supabase
          .from('ad_spaces')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id)
          .eq('availability_status', 'available');
        
        // If city is provided, filter by location
        if (city) {
          // Join with locations table to filter by city
          // We need to use a different approach since Supabase doesn't support joins in count queries
          // Instead, we'll fetch location_ids for the city first, then count
          let locations;
          try {
            const locationsResult = await supabase
              .from('locations')
              .select('id')
              .eq('city', city);
            
            if (locationsResult.error) {
              throw locationsResult.error;
            }
            locations = locationsResult.data;
          } catch (locationError) {
            // Fallback to direct HTTP
            console.warn('⚠️ Locations query failed, trying direct HTTP:', locationError);
            const directResult = await directSupabaseQuery<{ id: string }>('locations', {
              filter: { city },
              select: 'id'
            });
            locations = directResult.data;
          }
          
          if (locations && locations.length > 0) {
            const locationIds = locations.map(loc => loc.id);
            query = query.in('location_id', locationIds);
          } else {
            // No locations found for this city, count is 0
            countsMap[cat.id] = 0;
            continue;
          }
        }
        
        const { count, error: countError } = await query;
        
        if (!countError) {
          countsMap[cat.id] = count || 0;
        } else {
          countsMap[cat.id] = 0;
        }
      }
      
      // For parent categories, also count child category ad spaces
      // This implements: Filter by parent category (gets all child categories)
      const parentCountsMap: Record<string, number> = {};
      categories.forEach((cat: any) => {
        if (cat.parent_category_id === null) {
          // This is a parent category - count all child categories' ad spaces
          const childCategories = categories.filter((c: any) => c.parent_category_id === cat.id);
          let totalCount = countsMap[cat.id] || 0;
          childCategories.forEach((child: any) => {
            totalCount += countsMap[child.id] || 0;
          });
          parentCountsMap[cat.id] = totalCount;
        }
      });
      
      // Add counts to categories
      // Parent categories show sum of their children + their own
      // Child categories show only their own count
      data = categories.map((cat: any) => ({
        ...cat,
        ad_space_count: cat.parent_category_id === null 
          ? (parentCountsMap[cat.id] || countsMap[cat.id] || 0)
          : (countsMap[cat.id] || 0)
      }));
      
      error = null;
    } catch (fetchError) {
      // Handle fetch/network errors (like SSL certificate issues)
      console.error('❌ Supabase fetch error (likely SSL/network issue):', fetchError);
      
      // Better error message handling
      let errorMessage = 'Unknown error';
      if (fetchError instanceof Error) {
        errorMessage = fetchError.message;
      } else if (typeof fetchError === 'object' && fetchError !== null) {
        errorMessage = JSON.stringify(fetchError, Object.getOwnPropertyNames(fetchError));
      } else {
        errorMessage = String(fetchError);
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        message: errorMessage,
        fallback: true, // Signal frontend to use direct service
        details: 'Server-side connection failed. Frontend will use direct browser connection.'
      }, { status: 500 });
    }

    if (error) {
      console.error('❌ Supabase query error:', error);
      const errorMessage = (error as any)?.message || String(error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: errorMessage
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
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

/**
 * Create a new category
 * POST /api/categories
 * Body: {
 *   name: string,
 *   description?: string,
 *   icon_url?: string
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
    const { name, description, icon_url } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 });
    }

    // Check if category already exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', name.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Category already exists',
        data: existing
      }, { status: 400 });
    }

    // Create category
    const { data: newCategory, error: insertError } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        icon_url: icon_url || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating category:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create category',
        details: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
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
