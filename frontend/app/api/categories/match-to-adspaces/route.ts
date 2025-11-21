import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Match categories to ad spaces - set parent_category_id to ad_space IDs
 * POST /api/categories/match-to-adspaces
 * 
 * This matches each category to a representative ad space and sets
 * parent_category_id to that ad space's ID
 */
export async function POST() {
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

    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (categoriesError || !categories) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        details: categoriesError?.message
      }, { status: 500 });
    }

    // Get all ad spaces with their categories
    const { data: adSpaces, error: adSpacesError } = await supabase
      .from('ad_spaces')
      .select('id, title, category_id')
      .order('created_at', { ascending: true });

    if (adSpacesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch ad spaces',
        details: adSpacesError.message
      }, { status: 500 });
    }

    const updates: Array<{ categoryName: string; categoryId: string; adSpaceId: string | null; adSpaceTitle: string | null; success: boolean; error?: string }> = [];

    // For each category, find the first ad space that belongs to it
    for (const category of categories) {
      // Find ad spaces that belong to this category
      const matchingAdSpaces = (adSpaces || []).filter(space => space.category_id === category.id);
      
      if (matchingAdSpaces.length > 0) {
        // Use the first ad space as the "parent" ad space for this category
        const parentAdSpace = matchingAdSpaces[0];
        
        // Note: We need to update the schema first to allow parent_category_id to reference ad_spaces
        // For now, we'll store the ad space ID, but the foreign key constraint might prevent this
        // If the constraint exists, we'll need to drop it first or modify the schema
        
        const { error: updateError } = await supabase
          .from('categories')
          .update({ parent_category_id: parentAdSpace.id as any }) // Cast to any to bypass type check
          .eq('id', category.id);

        if (updateError) {
          console.error(`❌ Error updating ${category.name}:`, updateError);
          updates.push({
            categoryName: category.name,
            categoryId: category.id,
            adSpaceId: null,
            adSpaceTitle: null,
            success: false,
            error: updateError.message
          });
        } else {
          console.log(`✅ Updated ${category.name} -> Ad Space: ${parentAdSpace.title} (${parentAdSpace.id})`);
          updates.push({
            categoryName: category.name,
            categoryId: category.id,
            adSpaceId: parentAdSpace.id,
            adSpaceTitle: parentAdSpace.title,
            success: true
          });
        }
      } else {
        // No ad spaces found for this category
        updates.push({
          categoryName: category.name,
          categoryId: category.id,
          adSpaceId: null,
          adSpaceTitle: null,
          success: false,
          error: 'No ad spaces found for this category'
        });
      }
    }

    // Get final state
    const { data: finalCategories, error: finalError } = await supabase
      .from('categories')
      .select('id, name, parent_category_id')
      .order('name');

    if (finalError) {
      console.error('❌ Error fetching final categories:', finalError);
    }

    const successful = updates.filter(u => u.success).length;
    const failed = updates.filter(u => !u.success).length;

    return NextResponse.json({
      success: true,
      message: 'Categories matched to ad spaces',
      statistics: {
        totalCategories: categories.length,
        categoriesMatched: successful,
        categoriesFailed: failed
      },
      updates: updates,
      finalState: finalCategories?.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        parent_category_id: cat.parent_category_id
      })) || []
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

