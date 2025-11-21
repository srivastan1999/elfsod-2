const fs = require('fs');
const path = require('path');

console.log('🔍 Checking environment variables...\n');

const envPath = path.join(process.cwd(), '.env.local');
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('\n📝 Create .env.local file with:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('\n💡 See .env.local.example for template');
  process.exit(1);
}

// Load .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

let allGood = true;

requiredVars.forEach(varName => {
  if (!envVars[varName] || envVars[varName].length === 0) {
    console.error(`❌ ${varName} is missing or empty`);
    allGood = false;
  } else {
    const maskedValue = varName.includes('KEY') 
      ? `${envVars[varName].substring(0, 10)}...${envVars[varName].substring(envVars[varName].length - 5)}`
      : envVars[varName];
    console.log(`✅ ${varName}=${maskedValue}`);
  }
});

if (allGood) {
  console.log('\n✅ All required environment variables are set!');
  console.log('   You can now run: npm run dev');
} else {
  console.log('\n❌ Missing required environment variables!');
  console.log('   Get them from: Supabase Dashboard → Settings → API');
  process.exit(1);
}

