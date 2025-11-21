import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Associate ad spaces with similar names to a category
 * POST /api/categories/associate-similar-adspaces
 * 
 * Body: {
 *   categoryName: string,  // e.g., "Restaurant", "Metro", "Hotel"
 *   similarityThreshold?: number  // Optional: minimum similarity (0-1)
 * }
 * 
 * This endpoint:
 * 1. Finds the category by name
 * 2. Searches for ad spaces with similar names/titles
 * 3. Associates those ad spaces to the category
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
    const { categoryName, similarityThreshold = 0.3 } = body;

    if (!categoryName || !categoryName.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 });
    }

    // Step 1: Find the category
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', categoryName.trim())
      .maybeSingle();

    if (categoryError || !category) {
      return NextResponse.json({
        success: false,
        error: 'Category not found',
        details: `No category found matching "${categoryName}"`
      }, { status: 404 });
    }

    console.log(`✅ Found category: ${category.name} (ID: ${category.id})`);

    // Step 2: Find ad spaces with similar names
    // Search for ad spaces where title or description contains category name keywords
    const categoryNameLower = categoryName.toLowerCase();
    const keywords = categoryNameLower.split(' ').filter((k: string) => k.length > 2);

    // Build search pattern - look for category name in title or description
    let query = supabase
      .from('ad_spaces')
      .select('id, title, description, category_id');

    // Use OR condition to search in both title and description
    const searchPatterns = keywords.map((k: string) => `%${k}%`).join('|');
    
    // Get all ad spaces first, then filter in JavaScript for better matching
    const { data: allAdSpaces, error: adSpacesError } = await supabase
      .from('ad_spaces')
      .select('id, title, description, category_id');

    if (adSpacesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch ad spaces',
        details: adSpacesError.message
      }, { status: 500 });
    }

    // Filter ad spaces that match the category name
    const matchingAdSpaces = (allAdSpaces || []).filter(space => {
      const titleLower = (space.title || '').toLowerCase();
      const descLower = (space.description || '').toLowerCase();
      const combined = `${titleLower} ${descLower}`;

      // Check if category name or keywords appear in title/description
      if (titleLower.includes(categoryNameLower) || descLower.includes(categoryNameLower)) {
        return true;
      }

      // Check if any keyword appears
      for (const keyword of keywords) {
        if (combined.includes(keyword)) {
          return true;
        }
      }

      return false;
    });

    console.log(`📋 Found ${matchingAdSpaces.length} ad spaces matching "${categoryName}"`);

    // Step 3: Update matching ad spaces to this category
    const updates: Array<{ adSpaceId: string; adSpaceTitle: string; success: boolean; error?: string }> = [];
    let updatedCount = 0;

    for (const adSpace of matchingAdSpaces) {
      // Skip if already assigned to this category
      if (adSpace.category_id === category.id) {
        updates.push({
          adSpaceId: adSpace.id,
          adSpaceTitle: adSpace.title,
          success: true
        });
        continue;
      }

      const { error: updateError } = await supabase
        .from('ad_spaces')
        .update({ category_id: category.id })
        .eq('id', adSpace.id);

      if (updateError) {
        console.error(`❌ Error updating "${adSpace.title}":`, updateError);
        updates.push({
          adSpaceId: adSpace.id,
          adSpaceTitle: adSpace.title,
          success: false,
          error: updateError.message
        });
      } else {
        updatedCount++;
        console.log(`✅ Updated "${adSpace.title}" -> ${category.name}`);
        updates.push({
          adSpaceId: adSpace.id,
          adSpaceTitle: adSpace.title,
          success: true
        });
      }
    }

    // Step 4: Get final count of ad spaces in this category
    const { count: finalCount } = await supabase
      .from('ad_spaces')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id);

    const successful = updates.filter(u => u.success).length;
    const failed = updates.filter(u => !u.success).length;

    return NextResponse.json({
      success: true,
      message: `Associated ad spaces with similar names to "${category.name}"`,
      category: {
        id: category.id,
        name: category.name
      },
      statistics: {
        totalMatchingAdSpaces: matchingAdSpaces.length,
        successfullyAssociated: successful,
        failed: failed,
        newlyUpdated: updatedCount,
        alreadyInCategory: successful - updatedCount,
        totalAdSpacesInCategory: finalCount || 0
      },
      matchedAdSpaces: updates.map(u => ({
        id: u.adSpaceId,
        title: u.adSpaceTitle,
        success: u.success,
        error: u.error
      }))
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

