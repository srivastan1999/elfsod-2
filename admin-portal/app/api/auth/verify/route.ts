import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = await createClient();

    // Verify session token
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('*, admin_users(*)')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Update last accessed time
    await supabase
      .from('admin_sessions')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', session.id);

    // Return admin user (without password hash)
    const adminUser = session.admin_users as any;
    const { password_hash, ...adminUserWithoutPassword } = adminUser;

    return NextResponse.json({
      adminUser: adminUserWithoutPassword,
    });
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

