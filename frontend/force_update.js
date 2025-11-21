// Force update using correct Supabase syntax
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

const updates = [
  // Mall
  { id: 'c7faf3d1-cb80-4ee6-8e7e-96dac3b25513', title: 'Mall Atrium', city: 'Bengaluru' },
  { id: '3235836b-60ce-4a41-8316-3ad86f6fa290', title: 'Mall Food Court', city: 'Delhi' },
  { id: 'f6669711-d825-4c24-80c8-469bdb85818c', title: 'Mall Atrium', city: 'Mumbai' },
  // Grocery
  { id: '903b4839-32a9-41a3-8eb2-b7b3b8b3f8e4', title: 'Grocery Aisle', city: 'Delhi' },
  { id: 'c2d1d641-3e1c-4bfe-8f73-4e0a1c0b6e5e', title: 'Supermarket', city: 'Mumbai' },
  { id: '566f5898-d4c3-4f3e-9f7e-8f0e1c0b6e5e', title: 'Supermarket', city: 'Bengaluru' },
  // Restaurant
  { id: '8e0c4d4b-c1a5-4f3e-9f7e-8f0e1c0b6e5e', title: 'Restaurant Entrance', city: 'Delhi' },
  { id: 'fe85fabb-c1a5-4f3e-9f7e-8f0e1c0b6e5e', title: 'Restaurant Table', city: 'Mumbai' },
  { id: 'f7bcc718-c1a5-4f3e-9f7e-8f0e1c0b6e5e', title: 'Restaurant Table', city: 'Bengaluru' },
];

async function forceUpdate() {
  console.log('\n🔧 Force updating ad spaces with locations...\n');
  
  // Get locations
  const locResponse = await fetch(`${supabaseUrl}/rest/v1/locations?select=id,city&city=in.(Delhi,Mumbai,Bengaluru)`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const locations = await locResponse.json();
  
  const locationMap = {};
  locations.forEach(loc => {
    locationMap[loc.city] = loc.id;
  });
  
  console.log('📍 Location IDs:');
  Object.entries(locationMap).forEach(([city, id]) => {
    console.log(`  ${city}: ${id}`);
  });
  console.log('');
  
  // Update each ad space using the correct filter syntax
  for (const update of updates) {
    const locationId = locationMap[update.city];
    
    // Try using question mark for filter
    const url = `${supabaseUrl}/rest/v1/ad_spaces?id=eq.${update.id}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ location_id: locationId })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.length > 0) {
        console.log(`✅ ${update.title} -> ${update.city} (location_id: ${result[0].location_id ? '✓' : 'STILL NULL!'})`);
      } else {
        console.log(`⚠️  ${update.title} -> No rows returned (might not have been updated)`);
      }
    } else {
      const error = await response.text();
      console.error(`❌ ${update.title}: ${error.substring(0, 100)}`);
    }
  }
  
  console.log('\n✅ Update attempt complete!\n');
}

forceUpdate();
