// Check if location_ids are actually set (without join)
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

async function checkLocationIds() {
  console.log('\n🔍 Checking location_ids WITHOUT join...\n');
  
  // Get Mall ad spaces
  const response = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?select=id,title,location_id&category_id=eq.(SELECT id FROM categories WHERE name='Mall')`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  
  // Try simpler query
  const catResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id&name=eq.Mall&limit=1`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const mallCat = await catResponse.json();
  
  const spacesResponse = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?select=id,title,location_id&category_id=eq.${mallCat[0].id}`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const spaces = await spacesResponse.json();
  
  console.log('Mall ad spaces:');
  spaces.forEach(space => {
    console.log(`  - "${space.title}"`);
    console.log(`    ID: ${space.id}`);
    console.log(`    location_id: ${space.location_id || 'NULL'}\n`);
  });
  
  // Now verify those location IDs exist in locations table
  if (spaces.length > 0 && spaces[0].location_id) {
    console.log('\n🔍 Checking if location IDs exist...\n');
    for (const space of spaces) {
      if (space.location_id) {
        const locResponse = await fetch(`${supabaseUrl}/rest/v1/locations?select=city&id=eq.${space.location_id}`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          }
        });
        const locs = await locResponse.json();
        console.log(`Location ID ${space.location_id.substring(0, 8)}... -> ${locs[0]?.city || 'NOT FOUND'}`);
      }
    }
  }
}

checkLocationIds();
