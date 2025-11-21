// Check available locations
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

async function checkLocations() {
  const response = await fetch(`${supabaseUrl}/rest/v1/locations?select=id,city&limit=100`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const locations = await response.json();
  
  // Group by city
  const cityCounts = {};
  locations.forEach(loc => {
    cityCounts[loc.city] = (cityCounts[loc.city] || 0) + 1;
  });
  
  console.log('\n📍 Available locations by city:');
  Object.entries(cityCounts).forEach(([city, count]) => {
    console.log(`  ${city}: ${count} locations`);
  });
  
  // Get one location ID for each city
  const cityLocations = {};
  locations.forEach(loc => {
    if (!cityLocations[loc.city]) {
      cityLocations[loc.city] = loc.id;
    }
  });
  
  console.log('\n📍 Sample location IDs by city:');
  Object.entries(cityLocations).forEach(([city, id]) => {
    console.log(`  ${city}: ${id}`);
  });
}

checkLocations();
