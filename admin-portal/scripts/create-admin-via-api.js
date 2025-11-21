const bcrypt = require('bcryptjs');

// Simple script to create admin via API
// Make sure the dev server is running first: npm run dev

async function createAdminViaAPI() {
  const email = process.argv[2] || 'vastan@gmail.com';
  const password = process.argv[3] || 'vastan@12345';
  const fullName = process.argv[4] || 'Vastan Admin';
  const role = process.argv[5] || 'super_admin';

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  console.log('📝 Admin User Details:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Name: ${fullName}`);
  console.log(`   Role: ${role}`);
  console.log(`\n🔐 Password Hash: ${passwordHash}`);
  console.log('\n📋 SQL to run in Supabase SQL Editor:');
  console.log('─'.repeat(60));
  console.log(`
INSERT INTO public.admin_users (email, password_hash, full_name, role, is_active)
VALUES (
  '${email.toLowerCase()}',
  '${passwordHash}',
  '${fullName}',
  '${role}',
  true
)
ON CONFLICT (email) DO NOTHING;
  `.trim());
  console.log('─'.repeat(60));
  console.log('\n✅ Copy the SQL above and run it in your Supabase SQL Editor');
  console.log('   Then you can sign in at: http://localhost:3001/auth/signin');
}

createAdminViaAPI().catch(console.error);

