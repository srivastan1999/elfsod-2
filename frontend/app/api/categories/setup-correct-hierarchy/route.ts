import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Setup correct category hierarchy
 * POST /api/categories/setup-correct-hierarchy
 * 
 * This ensures:
 * 1. ad_spaces.category_id → categories.id (for filtering) ✅ Already correct
 * 2. categories.parent_category_id → categories.id (for hierarchy) ✅ Fixes this
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
    const { data: allCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (categoriesError || !allCategories) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        details: categoriesError?.message
      }, { status: 500 });
    }

    // Create a map of category names to IDs
    const categoryMap: Record<string, string> = {};
    allCategories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
      categoryMap[cat.name] = cat.id;
    });

    // Define hierarchy: child categories → parent categories
    const hierarchy: Record<string, string> = {
      'Corporate': 'Corporate & Business',
      'Office Tower': 'Corporate & Business',
      'Mall': 'Retail & Commerce',
      'Grocery Store': 'Retail & Commerce',
      'Restaurant': 'Retail & Commerce',
      'Billboard': 'Outdoor Advertising',
      'Metro': 'Transit Advertising',
      'Hotel': 'Hospitality',
      'Event Venue': 'Entertainment'
    };

    // First, set all parent_category_id to NULL
    const { error: nullError } = await supabase
      .from('categories')
      .update({ parent_category_id: null });

    if (nullError) {
      console.error('❌ Error setting parent_category_id to NULL:', nullError);
    }

    const updates: Array<{ categoryName: string; parentName: string; success: boolean; error?: string }> = [];

    // Update each category with its parent (category ID, not ad space ID)
    for (const [categoryName, parentName] of Object.entries(hierarchy)) {
      const categoryId = categoryMap[categoryName.toLowerCase()] || categoryMap[categoryName];
      const parentId = categoryMap[parentName.toLowerCase()] || categoryMap[parentName];
      
      if (!categoryId) {
        updates.push({ categoryName, parentName, success: false, error: 'Category not found' });
        continue;
      }
      
      if (!parentId) {
        updates.push({ categoryName, parentName, success: false, error: 'Parent category not found' });
        continue;
      }

      // Don't set a category as its own parent
      if (categoryId === parentId) {
        updates.push({ categoryName, parentName, success: false, error: 'Cannot be own parent' });
        continue;
      }

      const { error: updateError } = await supabase
        .from('categories')
        .update({ parent_category_id: parentId })
        .eq('id', categoryId);

      if (updateError) {
        console.error(`❌ Error updating ${categoryName}:`, updateError);
        updates.push({ categoryName, parentName, success: false, error: updateError.message });
      } else {
        console.log(`✅ Updated ${categoryName} -> ${parentName} (category ID: ${parentId})`);
        updates.push({ categoryName, parentName, success: true });
      }
    }

    // Get final hierarchy
    const { data: finalCategories, error: finalError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        parent_category_id,
        parent:categories!parent_category_id(id, name)
      `)
      .order('name');

    if (finalError) {
      console.error('❌ Error fetching final categories:', finalError);
    }

    const successful = updates.filter(u => u.success).length;
    const failed = updates.filter(u => !u.success).length;

    return NextResponse.json({
      success: true,
      message: 'Category hierarchy setup completed correctly',
      note: 'categories.parent_category_id now references categories.id (for hierarchy)',
      statistics: {
        totalCategories: allCategories.length,
        categoriesUpdated: successful,
        categoriesFailed: failed
      },
      updates: updates,
      hierarchy: finalCategories?.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        parent_id: cat.parent_category_id,
        parent_name: cat.parent?.name || null,
        is_parent: cat.parent_category_id === null
      })) || [],
      relationships: {
        'ad_spaces.category_id': '→ categories.id (for filtering ad spaces) ✅',
        'categories.parent_category_id': '→ categories.id (for category hierarchy) ✅'
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

