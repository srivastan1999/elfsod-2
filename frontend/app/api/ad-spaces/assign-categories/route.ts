import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Helper function to preview category match
 */
function getPreviewMatch(title: string, description: string): string {
  const combined = `${title.toLowerCase()} ${description.toLowerCase()}`;
  
  if (combined.includes('metro') || combined.includes('subway') || combined.includes('train')) return 'Metro';
  if (combined.includes('mall') || combined.includes('shopping')) return 'Mall';
  if (combined.includes('restaurant') || combined.includes('cafe') || combined.includes('food')) return 'Restaurant';
  if (combined.includes('corporate') || combined.includes('office') || combined.includes('tower')) return 'Corporate/Office Tower';
  if (combined.includes('hotel') || combined.includes('resort')) return 'Hotel';
  if (combined.includes('event') || combined.includes('venue')) return 'Event Venue';
  if (combined.includes('grocery') || combined.includes('store') || combined.includes('shop')) return 'Grocery Store';
  
  return 'No match found';
}

/**
 * Auto-assign categories to all ad spaces based on title/description keywords
 * POST /api/ad-spaces/assign-categories
 * 
 * Optional query params:
 * - onlyUnmatched=true (only assign to ad spaces without categories)
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

    const searchParams = request.nextUrl.searchParams;
    const onlyUnmatched = searchParams.get('onlyUnmatched') === 'true';

    // Get all categories first
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError || !categories || categories.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No categories found',
        details: 'Please create categories first'
      }, { status: 400 });
    }

    // Create a map of category names to IDs
    const categoryMap: Record<string, string> = {};
    categories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
      // Also add with exact name for debugging
      categoryMap[cat.name] = cat.id;
    });
    
    console.log('📋 Available categories:', Object.keys(categoryMap));

    // Get all ad spaces
    let query = supabase
      .from('ad_spaces')
      .select('id, title, description, category_id');

    if (onlyUnmatched) {
      query = query.is('category_id', null);
    }

    const { data: adSpaces, error: adSpacesError } = await query;

    if (adSpacesError) {
      console.error('❌ Error fetching ad spaces:', adSpacesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch ad spaces',
        details: adSpacesError.message
      }, { status: 500 });
    }

    if (!adSpaces || adSpaces.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No ad spaces found to update',
        matched: 0,
        skipped: 0
      });
    }

    // Function to determine category based on title/description
    // Matches to actual categories in database
    const getCategoryId = (title: string, description: string): string | null => {
      const titleLower = title?.toLowerCase() || '';
      const descLower = description?.toLowerCase() || '';
      const combined = `${titleLower} ${descLower}`;

      // Billboard (check first as it's very specific)
      // Match: billboard, outdoor billboard, large format, hoarding
      if (combined.includes('billboard') || combined.includes('hoarding') ||
          combined.includes('large format') || titleLower.includes('billboard')) {
        return categoryMap['billboard'] || null;
      }

      // Metro (check first as it's more specific)
      // Match: metro, subway, train, railway, transit, station, commuter
      if (combined.includes('metro') || combined.includes('subway') || 
          combined.includes('train') || combined.includes('railway') ||
          combined.includes('transit') || combined.includes('station') ||
          combined.includes('commuter') || titleLower.includes('metro')) {
        return categoryMap['metro'] || null;
      }

      // Mall (check before grocery store as it's more specific)
      // Match: mall, shopping center, shopping mall, retail complex
      if (combined.includes('mall') || combined.includes('shopping center') || 
          combined.includes('shopping mall') || combined.includes('retail complex') ||
          titleLower.includes('mall')) {
        return categoryMap['mall'] || null;
      }

      // Event Venue (check before other venues)
      // Match: event, venue, cinema, theater, hall, conference, exhibition, cinema hall
      if (combined.includes('event') || combined.includes('venue') || 
          combined.includes('conference') || combined.includes('exhibition') ||
          combined.includes('cinema') || combined.includes('theater') ||
          combined.includes('cinema hall') || combined.includes('movie') ||
          combined.includes('hall') || titleLower.includes('cinema')) {
        return categoryMap['event venue'] || null;
      }

      // Restaurant
      // Match: restaurant, cafe, food, dining, eatery, bistro
      if (combined.includes('restaurant') || combined.includes('cafe') || 
          combined.includes('food') || combined.includes('dining') ||
          combined.includes('eatery') || combined.includes('bistro') ||
          titleLower.includes('restaurant') || titleLower.includes('cafe')) {
        return categoryMap['restaurant'] || null;
      }

      // Office Tower (check before Corporate as it's more specific)
      // Match: tower, office tower, office building, it park, tech park, business park
      if (combined.includes('tower') || combined.includes('office tower') ||
          combined.includes('office building') || combined.includes('it park') ||
          combined.includes('tech park') || combined.includes('business park') ||
          titleLower.includes('tower') || titleLower.includes('it park') ||
          titleLower.includes('tech park')) {
        return categoryMap['office tower'] || null;
      }

      // Corporate
      // Match: corporate, office, business, bkc (business district), commercial
      if (combined.includes('corporate') || combined.includes('office') || 
          combined.includes('business') || combined.includes('bkc') ||
          combined.includes('commercial') || combined.includes('business district') ||
          titleLower.includes('corporate') || titleLower.includes('bkc')) {
        return categoryMap['corporate'] || null;
      }

      // Hotel
      // Match: hotel, resort, hospitality, lodging
      if (combined.includes('hotel') || combined.includes('resort') || 
          combined.includes('hospitality') || combined.includes('lodging') ||
          titleLower.includes('hotel')) {
        return categoryMap['hotel'] || null;
      }

      // Grocery Store (check after mall to avoid false matches)
      // Match: grocery, supermarket, grocery store, market (but not shopping mall)
      if ((combined.includes('grocery') || combined.includes('supermarket') || 
           combined.includes('grocery store')) && 
          !combined.includes('shopping mall') && !combined.includes('mall')) {
        return categoryMap['grocery store'] || null;
      }

      // Market (if not already matched, could be grocery store)
      if (combined.includes('market') && !combined.includes('shopping') &&
          !combined.includes('mall') && !combined.includes('retail complex')) {
        return categoryMap['grocery store'] || null;
      }

      return null;
    };

    // Get default category (Corporate) for unmatched ad spaces
    const defaultCategoryId = categoryMap['corporate'] || categories[0]?.id || null;
    
    // Process each ad space
    const updates: Array<{ id: string; categoryId: string | null; title: string }> = [];
    let matched = 0;
    let skipped = 0;
    let defaultAssigned = 0;

    for (const adSpace of adSpaces) {
      // If ad space already has a category and we're only processing unmatched, skip
      if (onlyUnmatched && adSpace.category_id) {
        continue;
      }
      
      let categoryId = getCategoryId(adSpace.title, adSpace.description || '');
      
      // If no match found, assign default category (Corporate)
      if (!categoryId && defaultCategoryId) {
        categoryId = defaultCategoryId;
        defaultAssigned++;
        console.log(`📌 Default assigned: "${adSpace.title}" -> Corporate (default)`);
      }
      
      // Always update if we have a categoryId and it's different from current
      // This allows re-matching ad spaces with better logic
      if (categoryId && categoryId !== adSpace.category_id) {
        updates.push({
          id: adSpace.id,
          categoryId: categoryId,
          title: adSpace.title
        });
        matched++;
        const categoryName = categories.find(c => c.id === categoryId)?.name || 'Unknown';
        console.log(`✅ Will match: "${adSpace.title}" -> ${categoryName} (ID: ${categoryId})`);
      } else if (!categoryId) {
        skipped++;
        console.log(`⏭️  Skipped: "${adSpace.title}" - No category match found and no default available`);
      }
    }
    
    console.log(`📊 Summary: ${matched} matched, ${skipped} skipped, ${updates.length} to update`);

    // Batch update ad spaces
    let updated = 0;
    const errors: string[] = [];
    const updatedItems: Array<{ id: string; title: string; categoryId: string }> = [];

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('ad_spaces')
        .update({ category_id: update.categoryId })
        .eq('id', update.id);

      if (updateError) {
        errors.push(`${update.title}: ${updateError.message}`);
        console.error(`❌ Failed to update "${update.title}":`, updateError.message);
      } else {
        updated++;
        updatedItems.push({
          id: update.id,
          title: update.title,
          categoryId: update.categoryId as string
        });
        console.log(`✅ Updated: "${update.title}" with category ${update.categoryId}`);
      }
    }
    
    // Verify updates by fetching a few updated items
    if (updatedItems.length > 0) {
      const verifyIds = updatedItems.slice(0, 3).map(item => item.id);
      const { data: verified } = await supabase
        .from('ad_spaces')
        .select('id, title, category_id')
        .in('id', verifyIds);
      console.log('🔍 Verification:', verified);
    }

    // Get final statistics
    const { count: totalCount } = await supabase
      .from('ad_spaces')
      .select('*', { count: 'exact', head: true });

    const { count: matchedCount } = await supabase
      .from('ad_spaces')
      .select('*', { count: 'exact', head: true })
      .not('category_id', 'is', null);

    const breakdown = await getCategoryBreakdown(supabase);
    
    return NextResponse.json({
      success: true,
      message: 'Category assignment completed',
      statistics: {
        total: totalCount || 0,
        matched: matchedCount || 0,
        updated: updated,
        skipped: skipped,
        defaultAssigned: defaultAssigned,
        errors: errors.length
      },
      categoryBreakdown: breakdown,
      sampleUpdates: updatedItems.slice(0, 5), // Show first 5 updated items
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Show first 10 errors
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
 * Get breakdown of ad spaces by category
 */
async function getCategoryBreakdown(supabase: any) {
  const { data, error } = await supabase
    .from('ad_spaces')
    .select(`
      category_id,
      categories(name)
    `)
    .not('category_id', 'is', null);

  if (error) {
    console.error('Error getting category breakdown:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const breakdown: Record<string, number> = {};
  data.forEach((item: any) => {
    const categoryName = item.categories?.name || 'Uncategorized';
    breakdown[categoryName] = (breakdown[categoryName] || 0) + 1;
  });

  return Object.entries(breakdown).map(([name, count]) => ({ name, count }));
}

/**
 * GET - Check status before assigning
 * GET /api/ad-spaces/assign-categories
 */
export async function GET() {
  try {
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database'
      }, { status: 500 });
    }

    // Get statistics
    const { count: total } = await supabase
      .from('ad_spaces')
      .select('*', { count: 'exact', head: true });

    const { count: matched } = await supabase
      .from('ad_spaces')
      .select('*', { count: 'exact', head: true })
      .not('category_id', 'is', null);

    const { count: unmatched } = await supabase
      .from('ad_spaces')
      .select('*', { count: 'exact', head: true })
      .is('category_id', null);

    // Get category breakdown
    const breakdown = await getCategoryBreakdown(supabase);

    // Preview what will be matched
    const { data: preview } = await supabase
      .from('ad_spaces')
      .select('id, title, description, category_id')
      .is('category_id', null)
      .limit(10);

    return NextResponse.json({
      success: true,
      statistics: {
        total: total || 0,
        matched: matched || 0,
        unmatched: unmatched || 0,
        matchPercentage: total ? Math.round(((matched || 0) / total) * 100) : 0
      },
      categoryBreakdown: breakdown,
      preview: preview?.map(item => ({
        id: item.id,
        title: item.title,
        willMatch: getPreviewMatch(item.title, item.description || '')
      }))
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

