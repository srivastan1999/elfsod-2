// Test if we can even READ the ad spaces
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

const testId = 'c7faf3d1-cb80-4ee6-8e7e-96dac3b25513';

async function test() {
  console.log('\n🧪 Testing read/write...\n');
  
  // Read
  console.log('1. Reading ad space...');
  const readResponse = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?id=eq.${testId}`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const readResult = await readResponse.json();
  console.log(`Found ${readResult.length} records`);
  if (readResult.length > 0) {
    console.log(`Title: ${readResult[0].title}`);
    console.log(`Current location_id: ${readResult[0].location_id || 'NULL'}`);
  }
  
  // Try update
  console.log('\n2. Trying to update...');
  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?id=eq.${testId}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ location_id: 'd2fb529b-69ae-473b-96ab-dc676d991eb7' }) // Delhi
  });
  
  console.log(`Response status: ${updateResponse.status}`);
  const updateResult = await updateResponse.json();
  console.log(`Result:`, updateResult);
  
  // Read again
  console.log('\n3. Reading again...');
  const readResponse2 = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?id=eq.${testId}`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const readResult2 = await readResponse2.json();
  if (readResult2.length > 0) {
    console.log(`location_id after update: ${readResult2[0].location_id || 'STILL NULL'}`);
  }
}

test();
