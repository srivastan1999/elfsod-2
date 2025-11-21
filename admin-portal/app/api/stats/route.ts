import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
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

    // Fetch stats from various tables
    const [adSpacesResult, usersResult, bookingsResult] = await Promise.all([
      supabase.from('ad_spaces').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id, total_price', { count: 'exact' }),
    ]);

    const totalAdSpaces = adSpacesResult.count || 0;
    const totalUsers = usersResult.count || 0;
    const totalBookings = bookingsResult.count || 0;
    const totalRevenue = bookingsResult.data?.reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0) || 0;

    // Get active users (users who have made bookings in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsersCount } = await supabase
      .from('bookings')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    const stats = {
      totalAdSpaces,
      totalUsers,
      totalBookings,
      totalRevenue,
      activeUsers: activeUsersCount || 0,
      pendingApprovals: 0, // Add logic for pending approvals if needed
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

