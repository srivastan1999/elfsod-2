import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-server';
import { verifyAdminSession } from '@/lib/admin/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
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

    // Delete the ad space
    const { error } = await supabase
      .from('ad_spaces')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting ad space:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { 
          error: 'Failed to delete ad space',
          details: error.message,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Ad space deleted successfully' });
  } catch (error) {
    console.error('Error in delete ad space API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        hint: 'Check server logs for more details'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      locationId,
      publisherId,
      displayType,
      pricePerDay,
      pricePerMonth,
      dailyImpressions,
      monthlyFootfall,
      latitude,
      longitude,
      images,
      dimensions,
      availabilityStatus,
      targetAudience,
      route // Route data for movable spaces
    } = body;
    
    // Check if display type is movable
    const isMovableSpace = ['auto_rickshaw', 'bus', 'bike', 'cab', 'truck', 'transit_branding'].includes(displayType);

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

    // If locationId is being updated, verify it exists (only if provided)
    if (locationId !== undefined && locationId) {
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
    
    // For movable spaces, location and coordinates are optional
    if (!isMovableSpace && locationId === undefined) {
      // If not movable and locationId is being removed, that's an error
      // But we only validate if it's explicitly set to null/empty
      if (locationId === null || locationId === '') {
        return NextResponse.json(
          { error: 'Location ID is required for static spaces' },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updateData: any = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (categoryId !== undefined) updateData.category_id = categoryId;
    if (locationId !== undefined) {
      // For movable spaces, location is optional
      if (!isMovableSpace && !locationId) {
        return NextResponse.json(
          { error: 'Location ID is required for static spaces' },
          { status: 400 }
        );
      }
      updateData.location_id = locationId || null;
    }
    if (publisherId !== undefined) updateData.publisher_id = publisherId || null;
    if (displayType !== undefined) updateData.display_type = displayType;
    if (pricePerDay !== undefined) updateData.price_per_day = parseFloat(pricePerDay);
    if (pricePerMonth !== undefined) updateData.price_per_month = parseFloat(pricePerMonth);
    if (dailyImpressions !== undefined) updateData.daily_impressions = parseInt(dailyImpressions) || 0;
    if (monthlyFootfall !== undefined) updateData.monthly_footfall = parseInt(monthlyFootfall) || 0;
    if (latitude !== undefined) {
      // For movable spaces, coordinates are optional
      if (!isMovableSpace && (latitude === null || latitude === undefined)) {
        return NextResponse.json(
          { error: 'Latitude is required for static spaces' },
          { status: 400 }
        );
      }
      updateData.latitude = latitude !== null && latitude !== undefined ? parseFloat(latitude) : 0;
    }
    if (longitude !== undefined) {
      // For movable spaces, coordinates are optional
      if (!isMovableSpace && (longitude === null || longitude === undefined)) {
        return NextResponse.json(
          { error: 'Longitude is required for static spaces' },
          { status: 400 }
        );
      }
      updateData.longitude = longitude !== null && longitude !== undefined ? parseFloat(longitude) : 0;
    }
    if (images !== undefined) updateData.images = Array.isArray(images) ? images : [];
    if (dimensions !== undefined) updateData.dimensions = typeof dimensions === 'object' ? dimensions : {};
    if (availabilityStatus !== undefined) updateData.availability_status = availabilityStatus;
    if (targetAudience !== undefined) updateData.target_audience = targetAudience || null;
    
    // Add route data for movable spaces
    if (isMovableSpace && route !== undefined) {
      updateData.route = route;
    }

    // Update the ad space
    const { data: updatedAdSpace, error: updateError } = await supabase
      .from('ad_spaces')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name),
        location:locations(id, city, state, country)
      `)
      .single();

    if (updateError) {
      console.error('Error updating ad space:', updateError);
      return NextResponse.json(
        { error: 'Failed to update ad space', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      adSpace: updatedAdSpace,
      message: 'Ad space updated successfully'
    });
  } catch (error) {
    console.error('Error in update ad space API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        hint: 'Check server logs for more details'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
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

    // Fetch the ad space with related data
    const { data: adSpace, error } = await supabase
      .from('ad_spaces')
      .select(`
        *,
        category:categories(id, name, icon_url, description),
        location:locations(id, city, state, country, address, latitude, longitude),
        publisher:publishers(id, name, description)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching ad space:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        id: id
      });
      
      // Check if it's a "not found" error
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        return NextResponse.json(
          { 
            error: 'Ad space not found',
            details: `No ad space found with ID: ${id}`,
            hint: 'The ad space may have been deleted or the ID is incorrect'
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch ad space',
          details: error.message,
          hint: error.hint || 'Check if the ad space exists and you have permission to view it',
          code: error.code
        },
        { status: 500 }
      );
    }

    if (!adSpace) {
      return NextResponse.json(
        { 
          error: 'Ad space not found',
          details: `No ad space found with ID: ${id}`,
          hint: 'The ad space may have been deleted'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, adSpace });
  } catch (error) {
    console.error('Error in get ad space API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        hint: 'Check server logs for more details'
      },
      { status: 500 }
    );
  }
}

