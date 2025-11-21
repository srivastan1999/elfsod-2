import { createClient } from '@/lib/supabase/server';

export interface AdminSession {
  id: string;
  admin_user_id: string;
  token: string;
  expires_at: string;
  admin_users: {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'super_admin';
    is_active: boolean;
  };
}

/**
 * Verify admin session from request
 * Returns the session if valid, null otherwise
 */
export async function verifyAdminSession(request: Request): Promise<AdminSession | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const supabase = await createClient();

    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('*, admin_users(*)')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      return null;
    }

    // Check if admin user is active
    const adminUser = session.admin_users as any;
    if (!adminUser || !adminUser.is_active) {
      return null;
    }

    return session as AdminSession;
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return null;
  }
}

/**
 * Get admin user from request
 * Returns the admin user if session is valid, null otherwise
 */
export async function getAdminUser(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return null;
  }

  const adminUser = session.admin_users as any;
  const { password_hash, ...adminUserWithoutPassword } = adminUser;
  
  return adminUserWithoutPassword;
}

