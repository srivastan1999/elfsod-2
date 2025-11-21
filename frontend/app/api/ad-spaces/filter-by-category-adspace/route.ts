import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Filter ad spaces by category using parent_category_id (ad space ID)
 * GET /api/ad-spaces/filter-by-category-adspace?categoryAdSpaceId=xxx
 * 
 * This allows filtering ad spaces by finding the category linked to a specific ad space
 * and returning all ad spaces in that category
 */
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const categoryAdSpaceId = searchParams.get('categoryAdSpaceId');

    if (!categoryAdSpaceId) {
      return NextResponse.json({
        success: false,
        error: 'categoryAdSpaceId parameter is required'
      }, { status: 400 });
    }

    // Find the category that has this ad space as its parent_category_id
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('parent_category_id', categoryAdSpaceId)
      .maybeSingle();

    if (categoryError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to find category',
        details: categoryError.message
      }, { status: 500 });
    }

    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'No category found for this ad space ID',
        message: 'The ad space ID does not match any category\'s parent_category_id'
      }, { status: 404 });
    }

    // Get all ad spaces in this category
    const { data: adSpaces, error: adSpacesError } = await supabase
      .from('ad_spaces')
      .select(`
        *,
        category:categories(id, name, icon_url, description),
        location:locations(id, city, state, country, address, latitude, longitude),
        publisher:publishers(id, name, description, verification_status)
      `)
      .eq('category_id', category.id)
      .order('created_at', { ascending: false });

    if (adSpacesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch ad spaces',
        details: adSpacesError.message
      }, { status: 500 });
    }

    // Transform data
    const spaces = (adSpaces || []).map((space: any) => {
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
        dimensions
      };
    });

    return NextResponse.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        linkedAdSpaceId: categoryAdSpaceId
      },
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

