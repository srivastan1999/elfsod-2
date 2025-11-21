// Test Supabase join directly
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

async function testJoin() {
  console.log('\n🧪 Testing Supabase location join...\n');
  
  // Get categories first
  const catResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name&name=eq.Mall`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const categories = await catResponse.json();
  const mallCatId = categories[0]?.id;
  
  console.log(`Mall category ID: ${mallCatId}\n`);
  
  // Test 1: Get Mall ad spaces WITH location join
  console.log('Test 1: Ad spaces WITH location join');
  const response1 = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?select=id,title,location:locations(city)&category_id=eq.${mallCatId}&limit=3`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const spaces1 = await response1.json();
  console.log(JSON.stringify(spaces1, null, 2));
  
  // Test 2: Get Mall ad spaces WITHOUT location join  
  console.log('\n\nTest 2: Ad spaces WITHOUT location join (just location_id)');
  const response2 = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?select=id,title,location_id&category_id=eq.${mallCatId}&limit=3`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const spaces2 = await response2.json();
  console.log(JSON.stringify(spaces2, null, 2));
}

testJoin();
