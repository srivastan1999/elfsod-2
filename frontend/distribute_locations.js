// Distribute Retail & Commerce ad spaces across cities
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

async function distributeLocations() {
  console.log('\n🔄 Redistributing Retail & Commerce ad spaces across cities...\n');
  
  // Get location IDs for each city
  const response = await fetch(`${supabaseUrl}/rest/v1/locations?select=id,city`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const locations = await response.json();
  
  const delhiLoc = locations.find(l => l.city === 'Delhi');
  const mumbaiLoc = locations.find(l => l.city === 'Mumbai');
  const bengaluruLoc = locations.find(l => l.city === 'Bengaluru');
  
  console.log('📍 Using locations:');
  console.log(`  Delhi: ${delhiLoc.id}`);
  console.log(`  Mumbai: ${mumbaiLoc.id}`);
  console.log(`  Bengaluru: ${bengaluruLoc.id}\n`);
  
  // Get categories
  const catResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name&name=in.(Mall,Restaurant,Grocery Store)`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const categories = await catResponse.json();
  
  // Redistribute: 3 spaces per category, 1 in each city
  const cityList = [delhiLoc, mumbaiLoc, bengaluruLoc];
  
  for (const category of categories) {
    // Get all spaces for this category
    const spacesResponse = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?select=id,title&category_id=eq.${category.id}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const spaces = await spacesResponse.json();
    
    console.log(`\n📦 Distributing ${spaces.length} ${category.name} ad spaces...`);
    
    for (let i = 0; i < spaces.length; i++) {
      const space = spaces[i];
      const location = cityList[i % cityList.length];
      
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?id=eq.${space.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ location_id: location.id })
      });
      
      if (updateResponse.ok) {
        console.log(`✅ Updated "${space.title}" -> ${location.city}`);
      } else {
        const error = await updateResponse.text();
        console.error(`❌ Error: ${error}`);
      }
    }
  }
  
  console.log('\n✅ Distribution complete!\n');
}

distributeLocations();
