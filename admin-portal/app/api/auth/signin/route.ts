import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('Error creating Supabase client:', clientError);
      const isVercel = process.env.VERCEL === '1';
      const hint = isVercel 
        ? 'Set environment variables in Vercel Dashboard → Settings → Environment Variables. See VERCEL_DEPLOYMENT.md'
        : 'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local';
      
      return NextResponse.json(
        { 
          error: 'Database configuration error',
          details: clientError instanceof Error ? clientError.message : 'Failed to create database client',
          hint: hint,
          ...(isVercel && { 
            vercel: true,
            requiredVars: [
              'NEXT_PUBLIC_SUPABASE_URL',
              'NEXT_PUBLIC_SUPABASE_ANON_KEY',
              'SUPABASE_SERVICE_ROLE_KEY'
            ]
          })
        },
        { status: 500 }
      );
    }

    // Fetch admin user from admin_users table
    const { data: adminUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (fetchError) {
      console.error('Error fetching admin user:', {
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        code: fetchError.code,
        email: email.toLowerCase()
      });
      
      // Check if it's a "not found" error
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Database error',
          details: fetchError.message,
          hint: 'Check if admin_users table exists and RLS policies are configured'
        },
        { status: 500 }
      );
    }

    if (!adminUser) {
      console.log('Admin user not found:', email.toLowerCase());
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (!adminUser.password_hash) {
      console.error('Admin user has no password hash:', adminUser.id);
      return NextResponse.json(
        { error: 'Account configuration error' },
        { status: 500 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
    if (!isValidPassword) {
      console.log('Invalid password for admin user:', email.toLowerCase());
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate session token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create session
    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        admin_user_id: adminUser.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      console.error('Error creating admin session:', {
        message: sessionError.message,
        details: sessionError.details,
        hint: sessionError.hint,
        code: sessionError.code
      });
      return NextResponse.json(
        { 
          error: 'Failed to create session',
          details: sessionError.message,
          hint: 'Check if admin_sessions table exists and RLS policies allow INSERT'
        },
        { status: 500 }
      );
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    // Return token and admin user (without password hash)
    const { password_hash, ...adminUserWithoutPassword } = adminUser;

    return NextResponse.json({
      token,
      adminUser: adminUserWithoutPassword,
    });
  } catch (error) {
    console.error('Error in admin sign in:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}

