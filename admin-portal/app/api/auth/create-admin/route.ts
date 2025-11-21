import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

/**
 * API endpoint to create the first admin user
 * This should be protected or removed after initial setup
 * 
 * POST /api/auth/create-admin
 * Body: { email, password, full_name, role? }
 */
export async function POST(request: Request) {
  try {
    // In production, you might want to add additional security here
    // For example, only allow this if no admin users exist yet
    
    const { email, password, full_name, role = 'admin' } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full_name are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name,
        role: role === 'super_admin' ? 'super_admin' : 'admin',
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating admin user:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to create admin user. Make sure admin_schema.sql has been run.',
          details: insertError.message || 'Unknown error',
          hint: 'You may need to add an INSERT policy for admin_users table. See fix_admin_insert.sql'
        },
        { status: 500 }
      );
    }

    const { password_hash, ...adminUserWithoutPassword } = newAdmin;

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      adminUser: adminUserWithoutPassword,
    });
  } catch (error) {
    console.error('Error in create admin API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

