import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Setup category hierarchy - assign parent categories
 * POST /api/categories/setup-hierarchy
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

    // First, ensure parent categories exist
    const parentCategories = [
      { name: 'Outdoor Advertising', description: 'All outdoor and street-level advertising spaces' },
      { name: 'Transit Advertising', description: 'All transportation and transit-related advertising spaces' },
      { name: 'Retail & Commerce', description: 'All retail, shopping, and commercial advertising spaces' },
      { name: 'Corporate & Business', description: 'All corporate office and business district advertising spaces' },
      { name: 'Hospitality', description: 'All hotel and hospitality-related advertising spaces' },
      { name: 'Entertainment', description: 'All entertainment and event venue advertising spaces' }
    ];

    const createdParents: Record<string, string> = {};

    // Create parent categories if they don't exist
    for (const parent of parentCategories) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id, name')
        .eq('name', parent.name)
        .maybeSingle();

      if (existing) {
        createdParents[parent.name] = existing.id;
        console.log(`✅ Parent category exists: ${parent.name}`);
      } else {
        const { data: newParent, error } = await supabase
          .from('categories')
          .insert({
            name: parent.name,
            description: parent.description
          })
          .select()
          .single();

        if (error) {
          console.error(`❌ Error creating parent category ${parent.name}:`, error);
        } else if (newParent) {
          createdParents[parent.name] = newParent.id;
          console.log(`✅ Created parent category: ${parent.name}`);
        }
      }
    }

    // Define category hierarchy mapping
    const hierarchy: Record<string, string> = {
      'Billboard': 'Outdoor Advertising',
      'Metro': 'Transit Advertising',
      'Mall': 'Retail & Commerce',
      'Grocery Store': 'Retail & Commerce',
      'Restaurant': 'Retail & Commerce',
      'Corporate': 'Corporate & Business',
      'Office Tower': 'Corporate & Business',
      'Hotel': 'Hospitality',
      'Event Venue': 'Entertainment'
    };

    const updates: Array<{ categoryName: string; parentName: string; success: boolean }> = [];

    // Update each category with its parent
    for (const [categoryName, parentName] of Object.entries(hierarchy)) {
      const parentId = createdParents[parentName];
      
      if (!parentId) {
        console.error(`❌ Parent category not found: ${parentName}`);
        updates.push({ categoryName, parentName, success: false });
        continue;
      }

      const { error: updateError } = await supabase
        .from('categories')
        .update({ parent_category_id: parentId })
        .eq('name', categoryName);

      if (updateError) {
        console.error(`❌ Error updating ${categoryName}:`, updateError);
        updates.push({ categoryName, parentName, success: false });
      } else {
        console.log(`✅ Updated ${categoryName} -> ${parentName}`);
        updates.push({ categoryName, parentName, success: true });
      }
    }

    // Get final hierarchy
    const { data: allCategories, error: fetchError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        parent_category_id,
        parent:categories!parent_category_id(id, name)
      `)
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching categories:', fetchError);
    }

    const successful = updates.filter(u => u.success).length;
    const failed = updates.filter(u => !u.success).length;

    return NextResponse.json({
      success: true,
      message: 'Category hierarchy setup completed',
      statistics: {
        parentCategoriesCreated: Object.keys(createdParents).length,
        categoriesUpdated: successful,
        categoriesFailed: failed
      },
      updates: updates,
      hierarchy: allCategories?.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        parent_id: cat.parent_category_id,
        parent_name: cat.parent?.name || null
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

