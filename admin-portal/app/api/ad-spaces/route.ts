import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-server';
import { verifyAdminSession } from '@/lib/admin/auth';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Fetch all ad spaces with related data
    const { data: adSpaces, error } = await supabase
      .from('ad_spaces')
      .select(`
        *,
        category:categories(id, name),
        location:locations(id, city, state, country)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ad spaces:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ad spaces' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, adSpaces });
  } catch (error) {
    console.error('Error in admin portal ad spaces API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
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
      targetAudience,
      route // Route data for movable spaces
    } = body;
    
    // Check if display type is movable
    const isMovableSpace = ['auto_rickshaw', 'bus', 'bike', 'cab', 'truck', 'transit_branding'].includes(displayType);

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    if (!displayType) {
      return NextResponse.json(
        { error: 'Display type is required' },
        { status: 400 }
      );
    }

    if (pricePerDay === undefined || pricePerMonth === undefined) {
      return NextResponse.json(
        { error: 'Price per day and price per month are required' },
        { status: 400 }
      );
    }

    // For movable spaces, location and coordinates are optional
    if (!isMovableSpace) {
      if (latitude === undefined || longitude === undefined) {
        return NextResponse.json(
          { error: 'Latitude and longitude are required for static spaces' },
          { status: 400 }
        );
      }

      if (!locationId) {
        return NextResponse.json(
          { error: 'Location ID is required for static spaces' },
          { status: 400 }
        );
      }
    }

    // Use admin client (service role) to bypass RLS for admin operations
    let supabase;
    try {
      supabase = createAdminClient();
    } catch (clientError) {
      console.error('Error creating admin client:', clientError);
      return NextResponse.json(
        { 
          error: 'Database configuration error',
          details: clientError instanceof Error ? clientError.message : 'Failed to create database client',
          hint: 'Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local'
        },
        { status: 500 }
      );
    }

    // Verify category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

        // Verify location exists (only if locationId is provided)
        if (locationId) {
          const { data: location, error: locationError } = await supabase
            .from('locations')
            .select('id, city')
            .eq('id', locationId)
            .single();

          if (locationError || !location) {
            return NextResponse.json(
              { error: 'Invalid location ID' },
              { status: 400 }
            );
          }
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
      latitude: latitude !== undefined ? parseFloat(latitude) : 0,
      longitude: longitude !== undefined ? parseFloat(longitude) : 0,
      availability_status: availabilityStatus,
      images: Array.isArray(images) ? images : [],
      dimensions: typeof dimensions === 'object' ? dimensions : {},
    };
    
    // Add location_id only if provided
    if (locationId) {
      adSpaceData.location_id = locationId;
    }

    if (publisherId) {
      adSpaceData.publisher_id = publisherId;
    }

    if (targetAudience) {
      adSpaceData.target_audience = targetAudience;
    }
    
    // Add route data for movable spaces
    if (isMovableSpace && route) {
      adSpaceData.route = route;
    }

    // Insert ad space
    const { data: newAdSpace, error: insertError } = await supabase
      .from('ad_spaces')
      .insert(adSpaceData)
      .select(`
        *,
        category:categories(id, name),
        location:locations(id, city, state, country)
      `)
      .single();

    if (insertError) {
      console.error('Error creating ad space:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
        data: adSpaceData
      });
      return NextResponse.json(
        { 
          error: 'Failed to create ad space', 
          details: insertError.message,
          hint: insertError.hint || 'This might be due to RLS policies. Check if admin can insert ad spaces.',
          code: insertError.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      adSpace: newAdSpace,
      message: 'Ad space created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in create ad space API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        hint: 'Check server logs for more details',
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}

