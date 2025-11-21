// Check database directly
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    env[key.trim()] = values.join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkDB() {
  console.log('\n🔍 Checking database directly...\n');
  
  // Get Retail & Commerce ad spaces with locations
  const response = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?select=id,title,category:categories(name),location:locations(city)&category.name=in.(Mall,Restaurant,Grocery Store)`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  
  const spaces = await response.json();
  
  console.log(`Found ${spaces.length} Retail & Commerce ad spaces:\n`);
  spaces.forEach((space, i) => {
    console.log(`${i + 1}. "${space.title}"`);
    console.log(`   Category: ${space.category?.name || 'Unknown'}`);
    console.log(`   City: ${space.location?.city || 'NO CITY'}\n`);
  });
}

checkDB();
