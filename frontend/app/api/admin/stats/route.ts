import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!userData || userData.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Fetch dashboard statistics
    const [adSpacesResult, usersResult, bookingsResult] = await Promise.all([
      supabase.from('ad_spaces').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('total_amount', { count: 'exact' }),
    ]);

    const totalRevenue = bookingsResult.data?.reduce((sum, booking) => {
      return sum + (parseFloat(booking.total_amount?.toString() || '0'));
    }, 0) || 0;

    const stats = {
      totalAdSpaces: adSpacesResult.count || 0,
      totalUsers: usersResult.count || 0,
      totalBookings: bookingsResult.count || 0,
      totalRevenue: totalRevenue,
      activeUsers: usersResult.count || 0, // Can be enhanced with actual active user logic
      pendingApprovals: 0, // Can be enhanced with actual pending approvals
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

