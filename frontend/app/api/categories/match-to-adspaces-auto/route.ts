import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Automatically match categories to ad spaces and set parent_category_id
 * POST /api/categories/match-to-adspaces-auto
 * 
 * This endpoint:
 * 1. Gets all categories and their ad spaces
 * 2. Matches each category to its first ad space
 * 3. Sets parent_category_id to the ad space ID
 * 4. Creates the foreign key constraint
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

    // Step 1: Set all parent_category_id to NULL first
    // Note: Foreign key constraint drop needs to be done manually in SQL Editor first
    const { error: nullError } = await supabase
      .from('categories')
      .update({ parent_category_id: null });

    if (nullError) {
      console.error('❌ Error setting parent_category_id to NULL:', nullError);
    }

    // Step 3: Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError || !categories) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        details: categoriesError?.message
      }, { status: 500 });
    }

    // Step 4: For each category, find its first ad space and update
    const updates: Array<{ categoryName: string; categoryId: string; adSpaceId: string | null; adSpaceTitle: string | null; success: boolean; error?: string }> = [];

    for (const category of categories) {
      // Get first ad space for this category (by created_at)
      const { data: adSpaces, error: adSpacesError } = await supabase
        .from('ad_spaces')
        .select('id, title, created_at')
        .eq('category_id', category.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (adSpacesError) {
        updates.push({
          categoryName: category.name,
          categoryId: category.id,
          adSpaceId: null,
          adSpaceTitle: null,
          success: false,
          error: adSpacesError.message
        });
        continue;
      }

      if (adSpaces && adSpaces.length > 0) {
        const firstAdSpace = adSpaces[0];
        
        // Update category with ad space ID
        const { error: updateError } = await supabase
          .from('categories')
          .update({ parent_category_id: firstAdSpace.id })
          .eq('id', category.id);

        if (updateError) {
          console.error(`❌ Error updating ${category.name}:`, updateError);
          updates.push({
            categoryName: category.name,
            categoryId: category.id,
            adSpaceId: firstAdSpace.id,
            adSpaceTitle: firstAdSpace.title,
            success: false,
            error: updateError.message
          });
        } else {
          console.log(`✅ Updated ${category.name} -> ${firstAdSpace.title} (${firstAdSpace.id})`);
          updates.push({
            categoryName: category.name,
            categoryId: category.id,
            adSpaceId: firstAdSpace.id,
            adSpaceTitle: firstAdSpace.title,
            success: true
          });
        }
      } else {
        // No ad spaces for this category
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

    // Step 5: Get final state
    const { data: finalCategories, error: finalError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        parent_category_id,
        representative:ad_spaces!parent_category_id(id, title)
      `)
      .order('name');

    if (finalError) {
      console.error('❌ Error fetching final categories:', finalError);
    }

    const successful = updates.filter(u => u.success).length;
    const failed = updates.filter(u => !u.success).length;

    return NextResponse.json({
      success: true,
      message: 'Categories matched to ad spaces automatically',
      statistics: {
        totalCategories: categories.length,
        categoriesMatched: successful,
        categoriesFailed: failed
      },
      updates: updates,
      finalState: finalCategories?.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        parent_category_id: cat.parent_category_id,
        representative_ad_space: cat.representative
      })) || [],
      note: 'Foreign key constraint needs to be created manually in Supabase SQL Editor'
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

