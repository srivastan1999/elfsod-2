// Check if location exists
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

async function checkLocation() {
  const locationId = 'd2fb529b-69ae-473b-96ab-dc676d991eb7';
  
  console.log(`\n🔍 Checking if location ${locationId} exists...\n`);
  
  const response = await fetch(`${supabaseUrl}/rest/v1/locations?id=eq.${locationId}`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  
  const result = await response.json();
  console.log(`Found ${result.length} locations`);
  if (result.length > 0) {
    console.log('Location:', result[0]);
  } else {
    console.log('❌ Location NOT FOUND!');
    
    // Show some actual locations
    const locResponse = await fetch(`${supabaseUrl}/rest/v1/locations?select=id,city&limit=5`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const locs = await locResponse.json();
    console.log('\nActual locations in database:');
    locs.forEach(loc => {
      console.log(`  ${loc.city}: ${loc.id}`);
    });
  }
}

checkLocation();
