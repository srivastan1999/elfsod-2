const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local if it exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables!');
  console.error('Please make sure .env.local exists with:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  // Get user input from command line arguments
  const email = process.argv[2];
  const password = process.argv[3];
  const fullName = process.argv[4] || 'Admin User';
  const role = process.argv[5] || 'admin';

  if (!email || !password) {
    console.error('❌ Error: Email and password are required!');
    console.error('\nUsage:');
    console.error('  node scripts/create-admin.js <email> <password> [full_name] [role]');
    console.error('\nExample:');
    console.error('  node scripts/create-admin.js admin@example.com mypassword123 "Admin User" super_admin');
    process.exit(1);
  }

  try {
    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingAdmin) {
      console.error(`❌ Error: Admin user with email ${email} already exists!`);
      process.exit(1);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    console.log('👤 Creating admin user...');
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
        role: role === 'super_admin' ? 'super_admin' : 'admin',
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating admin user:', insertError.message);
      console.error('\nMake sure:');
      console.error('  1. The admin_schema.sql has been run in Supabase');
      console.error('  2. The admin_users table exists');
      console.error('  3. Your Supabase credentials are correct');
      process.exit(1);
    }

    const { password_hash, ...adminUserWithoutPassword } = newAdmin;

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 User Details:');
    console.log(`   Email: ${adminUserWithoutPassword.email}`);
    console.log(`   Name: ${adminUserWithoutPassword.full_name}`);
    console.log(`   Role: ${adminUserWithoutPassword.role}`);
    console.log(`   ID: ${adminUserWithoutPassword.id}`);
    console.log('\n🔑 You can now sign in at: http://localhost:3001/auth/signin');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Keep your password secure!');
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

createAdminUser();

