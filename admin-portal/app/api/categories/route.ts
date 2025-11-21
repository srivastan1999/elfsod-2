import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/admin/auth';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Fetch all categories with ad space counts
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        *,
        ad_spaces(count)
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Transform the data to include ad_space_count
    const categoriesWithCounts = categories?.map(cat => ({
      ...cat,
      ad_space_count: Array.isArray(cat.ad_spaces) ? cat.ad_spaces.length : 0,
      ad_spaces: undefined // Remove the nested array
    })) || [];

    return NextResponse.json({ success: true, categories: categoriesWithCounts });
  } catch (error) {
    console.error('Error in admin portal categories API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

