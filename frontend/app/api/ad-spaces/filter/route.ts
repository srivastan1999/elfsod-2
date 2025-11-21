import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Filter ad spaces by category using SQL queries
 * GET /api/ad-spaces/filter?categoryName=Restaurant&parentCategoryName=Retail & Commerce
 * 
 * This API implements the SQL queries:
 * 1. Filter by category name: WHERE category_id = (SELECT id FROM categories WHERE name = 'CategoryName')
 * 2. Filter by parent category: JOIN with parent categories to get all child categories
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
    const categoryName = searchParams.get('categoryName'); // Filter by category name
    const parentCategoryName = searchParams.get('parentCategoryName'); // Filter by parent category
    const categoryIds = searchParams.get('categoryIds'); // Comma-separated category IDs
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minFootfall = searchParams.get('minFootfall');
    const maxFootfall = searchParams.get('maxFootfall');
    const displayType = searchParams.get('displayType');
    const publisherId = searchParams.get('publisherId');
    const searchQuery = searchParams.get('searchQuery');
    const availabilityStatus = searchParams.get('availabilityStatus') || 'available';
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log('📊 Filter API called with params:', {
      categoryName,
      parentCategoryName,
      categoryIds,
      city,
      availabilityStatus,
      limit
    });

    // Build base query with proper joins
    // For city filtering, we need to join with locations table
    let query = supabase
      .from('ad_spaces')
      .select(`
        *,
        category:categories(id, name, icon_url, description, parent_category_id),
        location:locations(id, city, state, country, address, latitude, longitude),
        publisher:publishers(id, name, description, verification_status)
      `);
    
    // Apply city filter early if provided (filter on the join)
    // This is more efficient than filtering after fetch
    if (city) {
      // We'll filter by location.city after fetching, but we can also try to filter via the relationship
      // Note: Supabase PostgREST doesn't support filtering on nested relationships directly in the query
      // So we'll filter after fetching, but ensure location is loaded
    }

    // Priority: categoryIds > parentCategoryName > categoryName
    // Filter by multiple category IDs (comma-separated) - highest priority for multiple selection
    if (categoryIds) {
      const ids = categoryIds.split(',').map(id => id.trim()).filter(id => id);
      if (ids.length > 0) {
        // Get all categories to check for parent-child relationships
        const { data: allCategories } = await supabase
          .from('categories')
          .select('id, parent_category_id');
        
        const allCategoryIds: string[] = [];
        ids.forEach((id: string) => {
          // Add the selected category ID
          if (!allCategoryIds.includes(id)) {
            allCategoryIds.push(id);
          }
          
          // If this is a parent category, also include all its child categories
          const children = (allCategories || []).filter((c: any) => c.parent_category_id === id);
          children.forEach((child: any) => {
            if (!allCategoryIds.includes(child.id)) {
              allCategoryIds.push(child.id);
            }
          });
        });
        
        console.log(`🔍 Filtering by ${ids.length} selected category IDs (${allCategoryIds.length} total including children):`, allCategoryIds);
        query = query.in('category_id', allCategoryIds);
      }
    }
    // Filter by parent category name (only if categoryIds not provided)
    else if (parentCategoryName) {
      // Get the parent category ID
      const { data: parentCategoryData, error: parentError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', parentCategoryName.trim()) // Exact match first
        .is('parent_category_id', null)
        .maybeSingle();
      
      let parentId = parentCategoryData?.id;
      
      if (parentError || !parentId) {
        // Try case-insensitive
        const { data: parentCategoryDataCI, error: parentErrorCI } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', parentCategoryName.trim())
          .is('parent_category_id', null)
          .maybeSingle();
        
        if (parentErrorCI || !parentCategoryDataCI) {
          return NextResponse.json({
            success: false,
            error: 'Parent category not found',
            details: `No parent category found with name: ${parentCategoryName}`
          }, { status: 404 });
        }
        
        parentId = parentCategoryDataCI.id;
      }
      
      // Get all child categories of this parent (categories where parent_category_id = parentId)
      const { data: childCategories, error: childError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('parent_category_id', parentId);
      
      if (childError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to find child categories',
          details: childError.message
        }, { status: 500 });
      }
      
      console.log(`📂 Parent category "${parentCategoryName}" (ID: ${parentId}) has ${childCategories?.length || 0} child categories:`, childCategories?.map((c: any) => c.name));
      
      // Filter ad spaces by parent category + all child category IDs
      const categoryIdsToFilter = [parentId, ...(childCategories || []).map((c: any) => c.id)];
      console.log(`🔍 Filtering by category IDs:`, categoryIdsToFilter);
      query = query.in('category_id', categoryIdsToFilter);
    }
    // Filter by single category name (only if categoryIds and parentCategoryName not provided)
    else if (categoryName) {
      // First, get the category ID using exact name match
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName.trim()) // Use exact match, not ilike
        .maybeSingle();
      
      if (categoryError || !categoryData) {
        // Try case-insensitive if exact match fails
        const { data: categoryDataCI, error: categoryErrorCI } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', categoryName.trim())
          .maybeSingle();
        
        if (categoryErrorCI || !categoryDataCI) {
          return NextResponse.json({
            success: false,
            error: 'Category not found',
            details: `No category found with name: ${categoryName}`
          }, { status: 404 });
        }
        
        query = query.eq('category_id', categoryDataCI.id);
      } else {
        query = query.eq('category_id', categoryData.id);
      }
    }

    // Additional filters
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

    if (displayType) {
      query = query.eq('display_type', displayType);
    }

    if (publisherId) {
      if (publisherId.includes(',')) {
        query = query.in('publisher_id', publisherId.split(','));
      } else {
        query = query.eq('publisher_id', publisherId);
      }
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    if (availabilityStatus) {
      query = query.eq('availability_status', availabilityStatus);
    }

    query = query.limit(limit).order('created_at', { ascending: false });

    // Execute query
    let data, error;
    try {
      const result = await query;
      data = result.data;
      error = result.error;
    } catch (fetchError) {
      console.error('❌ Supabase fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch ad spaces',
        message: fetchError instanceof Error ? fetchError.message : String(fetchError),
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
      };
    });

    console.log(`✅ Query returned ${spaces.length} ad spaces before city filter`);
    
    // Apply city filter after fetching (since it's a relationship)
    // This implements filtering by location.city
    if (city) {
      const cityLower = city.toLowerCase().trim();
      console.log(`📍 Applying city filter for "${city}" (normalized: "${cityLower}")`);
      console.log(`📍 Sample space cities:`, spaces.slice(0, 3).map((s: any) => ({ title: s.title, city: s.location?.city })));
      
      spaces = spaces.filter((space: any) => {
        const spaceCity = space.location?.city;
        if (!spaceCity) {
          console.log(`⚠️  Space "${space.title}" has no city`);
          return false;
        }
        const spaceCityLower = spaceCity.toLowerCase().trim();
        const matches = spaceCityLower === cityLower;
        if (!matches) {
          console.log(`❌ Space "${space.title}" city "${spaceCity}" doesn't match "${city}"`);
        }
        return matches;
      });
      console.log(`📍 After city filter: ${spaces.length} ad spaces found in "${city}"`);
    }

    return NextResponse.json({
      success: true,
      data: spaces,
      count: spaces.length,
      filters: {
        categoryName: categoryName || null,
        parentCategoryName: parentCategoryName || null,
        categoryIds: categoryIds || null,
        city: city || null
      }
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

