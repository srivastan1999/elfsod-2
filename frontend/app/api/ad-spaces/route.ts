import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Next.js API route to fetch ad spaces
 * GET /api/ad-spaces?city=Mumbai&categoryId=xxx&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('❌ Failed to create Supabase client:', clientError);
      // Return error but don't crash - let frontend fallback handle it
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database',
        message: 'Please check your Supabase configuration. Frontend will try direct connection.',
        fallback: true
      }, { status: 500 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const categoryId = searchParams.get('categoryId');
    const publisherId = searchParams.get('publisherId');
    const displayType = searchParams.get('displayType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minFootfall = searchParams.get('minFootfall');
    const maxFootfall = searchParams.get('maxFootfall');
    const searchQuery = searchParams.get('searchQuery');
    const limit = parseInt(searchParams.get('limit') || '100');
    const availabilityStatus = searchParams.get('availabilityStatus') || 'available';

    // Build query
    let query = supabase
      .from('ad_spaces')
      .select(`
        *,
        category:categories(id, name, icon_url, description),
        location:locations(id, city, state, country, address, latitude, longitude),
        publisher:publishers(id, name, description, verification_status)
      `);

    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (publisherId) {
      if (publisherId.includes(',')) {
        query = query.in('publisher_id', publisherId.split(','));
      } else {
        query = query.eq('publisher_id', publisherId);
      }
    }

    if (displayType) {
      query = query.eq('display_type', displayType);
    }

    if (minPrice) {
      query = query.gte('price_per_day', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price_per_day', parseFloat(maxPrice));
    }

    if (minFootfall) {
      query = query.gte('daily_impressions', parseInt(minFootfall));
    }

    if (maxFootfall) {
      query = query.lte('daily_impressions', parseInt(maxFootfall));
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    if (availabilityStatus) {
      query = query.eq('availability_status', availabilityStatus);
    }

    query = query.limit(limit).order('created_at', { ascending: false });

    let data, error;
    try {
      const result = await query;
      data = result.data;
      error = result.error;
    } catch (fetchError) {
      // Handle fetch/network errors (like SSL certificate issues)
      console.error('❌ Supabase fetch error (likely SSL/network issue):', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch ad spaces',
        message: fetchError instanceof Error ? fetchError.message : String(fetchError),
        fallback: true, // Signal frontend to use direct service
        details: 'Server-side connection failed. Frontend will use direct browser connection.'
      }, { status: 500 });
    }

    if (error) {
      console.error('❌ Supabase query error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message
      }, { status: 500 });
    }

    // Transform data
    let spaces = (data || []).map((space: any) => {
      // Parse JSON fields if they're strings
      let images = space.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch {
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
        } catch {
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
    });

    // Apply city filter after fetching (since it's a relationship)
    if (city) {
      spaces = spaces.filter((space: any) => space.location?.city === city);
    }

    return NextResponse.json({
      success: true,
      data: spaces,
      count: spaces.length
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
 * Create a new ad space
 * POST /api/ad-spaces
 * Body: {
 *   title: string,
 *   description: string,
 *   categoryId: string (UUID),
 *   locationId?: string (UUID),
 *   publisherId?: string (UUID),
 *   displayType: string,
 *   pricePerDay: number,
 *   pricePerMonth: number,
 *   dailyImpressions?: number,
 *   monthlyFootfall?: number,
 *   latitude: number,
 *   longitude: number,
 *   images?: string[],
 *   dimensions?: object,
 *   availabilityStatus?: 'available' | 'booked' | 'unavailable'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables:', {
        url: supabaseUrl ? 'Set' : 'Missing',
        key: supabaseKey ? 'Set' : 'Missing',
        env: process.env.NODE_ENV
      });
      return NextResponse.json({
        success: false,
        error: 'Database configuration error',
        message: 'Supabase environment variables are not configured. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.',
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
      console.error('❌ Failed to create Supabase client:', clientError);
      const errorMessage = clientError instanceof Error ? clientError.message : String(clientError);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database',
        message: errorMessage,
        fallback: true
      }, { status: 500 });
    }

    const body = await request.json();
    console.log('📝 Received ad space creation request:', {
      title: body.title,
      categoryId: body.categoryId,
      locationId: body.locationId || 'not provided',
      publisherId: body.publisherId || 'not provided',
      hasCoordinates: !!(body.latitude && body.longitude)
    });
    const {
      title,
      description,
      categoryId,
      locationId,
      publisherId,
      displayType,
      pricePerDay,
      pricePerMonth,
      dailyImpressions = 0,
      monthlyFootfall = 0,
      latitude,
      longitude,
      images = [],
      dimensions = {},
      availabilityStatus = 'available',
      targetAudience
    } = body;

    // Validation
    if (!title || !description) {
      return NextResponse.json({
        success: false,
        error: 'Title and description are required'
      }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 });
    }

    if (!displayType) {
      return NextResponse.json({
        success: false,
        error: 'Display type is required'
      }, { status: 400 });
    }

    if (pricePerDay === undefined || pricePerDay === null) {
      return NextResponse.json({
        success: false,
        error: 'Price per day is required'
      }, { status: 400 });
    }

    if (pricePerMonth === undefined || pricePerMonth === null) {
      return NextResponse.json({
        success: false,
        error: 'Price per month is required'
      }, { status: 400 });
    }

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Latitude and longitude are required'
      }, { status: 400 });
    }

    // Verify category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .single();

    if (categoryError || !category) {
      console.error('❌ Category validation failed:', {
        categoryId,
        error: categoryError?.message,
        code: categoryError?.code
      });
      return NextResponse.json({
        success: false,
        error: 'Invalid category ID',
        details: categoryError?.message || 'Category not found',
        categoryId: categoryId
      }, { status: 400 });
    }

    // Prepare data for insertion
    const adSpaceData: any = {
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId,
      display_type: displayType,
      price_per_day: parseFloat(pricePerDay),
      price_per_month: parseFloat(pricePerMonth),
      daily_impressions: parseInt(dailyImpressions) || 0,
      monthly_footfall: parseInt(monthlyFootfall) || 0,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      availability_status: availabilityStatus,
      images: Array.isArray(images) ? images : [],
      dimensions: typeof dimensions === 'object' ? dimensions : {}
    };

    // Optional fields
    if (locationId) {
      adSpaceData.location_id = locationId;
      console.log('✅ Setting location_id:', locationId);
    } else {
      console.warn('⚠️ No locationId provided - location_id will be null');
    }

    if (publisherId) {
      adSpaceData.publisher_id = publisherId;
      console.log('✅ Setting publisher_id:', publisherId);
    } else {
      console.log('ℹ️ No publisherId provided - publisher_id will be null (this is optional)');
    }

    if (targetAudience) {
      adSpaceData.target_audience = targetAudience;
    }

    // Insert ad space
    const { data: newAdSpace, error: insertError } = await supabase
      .from('ad_spaces')
      .insert(adSpaceData)
      .select(`
        *,
        category:categories(id, name, icon_url, description),
        location:locations(id, city, state, country, address, latitude, longitude),
        publisher:publishers(id, name, description, verification_status)
      `)
      .single();

    if (insertError) {
      console.error('❌ Error creating ad space:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
        data: adSpaceData
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to create ad space',
        details: insertError.message,
        hint: insertError.hint,
        code: insertError.code
      }, { status: 500 });
    }
    
    console.log('✅ Ad space created successfully:', newAdSpace.id);

    // Parse JSON fields
    let parsedImages = newAdSpace.images;
    if (typeof parsedImages === 'string') {
      try {
        parsedImages = JSON.parse(parsedImages);
      } catch {
        parsedImages = [];
      }
    }
    if (!Array.isArray(parsedImages)) {
      parsedImages = [];
    }

    let parsedDimensions = newAdSpace.dimensions;
    if (typeof parsedDimensions === 'string') {
      try {
        parsedDimensions = JSON.parse(parsedDimensions);
      } catch {
        parsedDimensions = {};
      }
    }
    if (!parsedDimensions || typeof parsedDimensions !== 'object') {
      parsedDimensions = {};
    }

    return NextResponse.json({
      success: true,
      data: {
        ...newAdSpace,
        images: parsedImages,
        dimensions: parsedDimensions
      },
      message: 'Ad space created successfully'
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
