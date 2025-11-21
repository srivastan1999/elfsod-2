// Fix ALL Retail & Commerce ad spaces that don't have locations
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

async function fixAllRetailLocations() {
  console.log('\n🔧 Fixing ALL Retail & Commerce ad spaces without locations...\n');
  
  // Get location IDs
  const locResponse = await fetch(`${supabaseUrl}/rest/v1/locations?select=id,city&limit=100`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const locations = await locResponse.json();
  
  console.log(`📍 Found ${locations.length} locations in database\n`);
  
  // Group locations by city
  const cityLocations = {};
  locations.forEach(loc => {
    if (!cityLocations[loc.city]) {
      cityLocations[loc.city] = [];
    }
    cityLocations[loc.city].push(loc);
  });
  
  console.log('📍 Cities available:', Object.keys(cityLocations).join(', '));
  
  // Use first location from each city
  const delhiLoc = cityLocations['Delhi']?.[0];
  const mumbaiLoc = cityLocations['Mumbai']?.[0];
  const bengaluruLoc = cityLocations['Bengaluru']?.[0];
  
  if (!delhiLoc || !mumbaiLoc || !bengaluruLoc) {
    console.error('❌ Missing required cities');
    return;
  }
  
  console.log('\n📍 Using locations:');
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
  
  const cityList = [delhiLoc, mumbaiLoc, bengaluruLoc];
  
  // For each category, get ALL spaces without location and assign them
  for (const category of categories) {
    const spacesResponse = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?select=id,title,location_id&category_id=eq.${category.id}&location_id=is.null`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const spaces = await spacesResponse.json();
    
    console.log(`\n📦 Found ${spaces.length} ${category.name} ad spaces without location`);
    
    if (spaces.length > 0) {
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
  }
  
  console.log('\n✅ All Retail & Commerce ad spaces now have locations!\n');
}

fixAllRetailLocations();
