// Update the specific ad space IDs
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

const adSpaceIds = [
  '3235836b-60ce-4a41-8316-3ad86f6fa290', // Mall Food Court Banner
  'f6669711-d825-4c24-80c8-469bdb85818c', // Mall Atrium Digital Display
  'c7faf3d1-cb80-4ee6-8e7e-96dac3b25513', // Mall Atrium Digital Display
  '903b4839-32a9-41a3-8eb2-b7b3b8b3f8e4', // Grocery Aisle Banner
  'c2d1d641-3e1c-4bfe-8f73-4e0a1c0b6e5e', // Supermarket Entrance Display
  '566f5898-d4c3-4f3e-9f7e-8f0e1c0b6e5e', // Supermarket Entrance Display
  '8e0c4d4b-c1a5-4f3e-9f7e-8f0e1c0b6e5e', // Restaurant Entrance Banner
  'fe85fabb-c1a5-4f3e-9f7e-8f0e1c0b6e5e', // Restaurant Table Top Display
  'f7bcc718-c1a5-4f3e-9f7e-8f0e1c0b6e5e', // Restaurant Table Top Display
];

async function updateIds() {
  console.log('\n🔧 Updating specific ad space IDs...\n');
  
  // Get locations
  const locResponse = await fetch(`${supabaseUrl}/rest/v1/locations?select=id,city&city=in.(Delhi,Mumbai,Bengaluru)`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const locations = await locResponse.json();
  
  const delhiLoc = locations.find(l => l.city === 'Delhi');
  const mumbaiLoc = locations.find(l => l.city === 'Mumbai');
  const bengaluruLoc = locations.find(l => l.city === 'Bengaluru');
  
  const cityList = [delhiLoc, mumbaiLoc, bengaluruLoc];
  
  console.log('📍 Using locations:');
  console.log(`  Delhi: ${delhiLoc.id}`);
  console.log(`  Mumbai: ${mumbaiLoc.id}`);
  console.log(`  Bengaluru: ${bengaluruLoc.id}\n`);
  
  // Update each ad space
  for (let i = 0; i < adSpaceIds.length; i++) {
    const id = adSpaceIds[i];
    const location = cityList[i % cityList.length];
    
    const response = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ location_id: location.id })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Updated ${id.substring(0, 8)}... to ${location.city}`);
    } else {
      const error = await response.text();
      console.error(`❌ Error updating ${id.substring(0, 8)}...: ${error}`);
    }
  }
  
  console.log('\n✅ Update complete!\n');
}

updateIds();
