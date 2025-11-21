import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get all ad spaces grouped by category using parent_category_id
 * GET /api/ad-spaces/by-category-representative
 * 
 * This automatically matches categories to ad spaces and returns all ad spaces
 * grouped by their category's representative ad space (parent_category_id)
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

    // Get all categories with their representative ad spaces (parent_category_id)
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        parent_category_id,
        representative:ad_spaces!parent_category_id(id, title, description)
      `)
      .not('parent_category_id', 'is', null);

    if (categoriesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        details: categoriesError.message
      }, { status: 500 });
    }

    // For each category, get all ad spaces in that category
    const result: Array<{
      category: any;
      representativeAdSpace: any;
      adSpaces: any[];
    }> = [];

    for (const category of categories || []) {
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

      if (!adSpacesError && adSpaces) {
        // Transform ad spaces data
        const transformedSpaces = adSpaces.map((space: any) => {
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

        result.push({
          category: {
            id: category.id,
            name: category.name,
            parent_category_id: category.parent_category_id
          },
          representativeAdSpace: category.representative || null,
          adSpaces: transformedSpaces
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      totalAdSpaces: result.reduce((sum, item) => sum + item.adSpaces.length, 0)
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

