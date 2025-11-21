import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Update traffic data for an ad space
 * PUT /api/ad-spaces/:id/traffic
 * Body: { traffic_data: {...} }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { traffic_data } = body;

    if (!traffic_data) {
      return NextResponse.json(
        { error: 'traffic_data is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if ad space exists
    const { data: existingSpace, error: checkError } = await supabase
      .from('ad_spaces')
      .select('id, title')
      .eq('id', id)
      .single();

    if (checkError || !existingSpace) {
      return NextResponse.json(
        { error: 'Ad space not found' },
        { status: 404 }
      );
    }

    // Update traffic data
    const { data: updatedSpace, error: updateError } = await supabase
      .from('ad_spaces')
      .update({ 
        traffic_data: traffic_data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, traffic_data')
      .single();

    if (updateError) {
      console.error('Error updating traffic data:', updateError);
      return NextResponse.json(
        { error: 'Failed to update traffic data', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ Traffic data saved for ad space:', id);

    return NextResponse.json({
      success: true,
      message: 'Traffic data updated successfully',
      data: updatedSpace
    });
  } catch (error) {
    console.error('Error in traffic update API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

