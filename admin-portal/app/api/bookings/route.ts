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

    // Fetch all bookings with related data
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        user:users(id, full_name, email),
        ad_space:ad_spaces(
          id,
          title,
          location:locations(city, state, country)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Transform the data structure
    const transformedBookings = bookings?.map(booking => ({
      ...booking,
      user: Array.isArray(booking.user) ? booking.user[0] : booking.user,
      ad_space: Array.isArray(booking.ad_space) ? booking.ad_space[0] : booking.ad_space,
    })) || [];

    return NextResponse.json({ success: true, bookings: transformedBookings });
  } catch (error) {
    console.error('Error in admin portal bookings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

