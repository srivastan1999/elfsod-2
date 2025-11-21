import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Setup category hierarchy using EXISTING categories as parents
 * POST /api/categories/setup-hierarchy-existing
 * 
 * This uses existing categories as parents instead of creating new ones
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

    // Get all existing categories
    const { data: allCategories, error: fetchError } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (fetchError || !allCategories) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        details: fetchError?.message
      }, { status: 500 });
    }

    // Create a map of category names to IDs
    const categoryMap: Record<string, string> = {};
    allCategories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
      categoryMap[cat.name] = cat.id;
    });

    console.log('📋 Available categories:', Object.keys(categoryMap));

    // Define hierarchy using EXISTING categories as parents
    // Use broader categories as parents of more specific ones
    const hierarchy: Record<string, string> = {
      // Corporate & Business as parent
      'Corporate': 'Corporate & Business',
      'Office Tower': 'Corporate & Business',
      
      // Retail & Commerce as parent
      'Mall': 'Retail & Commerce',
      'Grocery Store': 'Retail & Commerce',
      'Restaurant': 'Retail & Commerce',
      
      // Outdoor Advertising as parent
      'Billboard': 'Outdoor Advertising',
      
      // Transit Advertising as parent
      'Metro': 'Transit Advertising',
      
      // Hospitality as parent
      'Hotel': 'Hospitality',
      
      // Entertainment as parent
      'Event Venue': 'Entertainment'
    };

    const updates: Array<{ categoryName: string; parentName: string; parentId: string; success: boolean; error?: string }> = [];

    // Update each category with its parent (using existing category IDs)
    for (const [categoryName, parentName] of Object.entries(hierarchy)) {
      const categoryId = categoryMap[categoryName.toLowerCase()] || categoryMap[categoryName];
      const parentId = categoryMap[parentName.toLowerCase()] || categoryMap[parentName];
      
      if (!categoryId) {
        console.error(`❌ Category not found: ${categoryName}`);
        updates.push({ categoryName, parentName, parentId: '', success: false, error: 'Category not found' });
        continue;
      }
      
      if (!parentId) {
        console.error(`❌ Parent category not found: ${parentName}`);
        updates.push({ categoryName, parentName, parentId: '', success: false, error: 'Parent category not found' });
        continue;
      }

      // Don't set a category as its own parent
      if (categoryId === parentId) {
        console.warn(`⚠️ Skipping: ${categoryName} cannot be its own parent`);
        updates.push({ categoryName, parentName, parentId, success: false, error: 'Cannot be own parent' });
        continue;
      }

      const { error: updateError } = await supabase
        .from('categories')
        .update({ parent_category_id: parentId })
        .eq('id', categoryId);

      if (updateError) {
        console.error(`❌ Error updating ${categoryName}:`, updateError);
        updates.push({ categoryName, parentName, parentId, success: false, error: updateError.message });
      } else {
        console.log(`✅ Updated ${categoryName} -> ${parentName} (${parentId})`);
        updates.push({ categoryName, parentName, parentId, success: true });
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
      message: 'Category hierarchy setup completed using existing categories',
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

