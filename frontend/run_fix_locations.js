// Run the SQL to fix locations
const fs = require('fs');

// Read .env.local file manually
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('\n🔧 Fixing Retail & Commerce ad space locations...\n');
console.log('Using Supabase URL:', supabaseUrl.substring(0, 30) + '...');

// Use fetch API to update
async function fixLocations() {
  try {
    // Get locations
    let response = await fetch(`${supabaseUrl}/rest/v1/locations?select=id,city&limit=10`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const locations = await response.json();
    console.log('📍 Available locations:', locations.map(l => l.city));
    
    // Get categories
    response = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name&name=in.(Mall,Restaurant,Grocery Store)`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const categories = await response.json();
    console.log('📂 Categories to update:', categories.map(c => c.name));
    
    // Update ad spaces for each category
    for (const category of categories) {
      // Get ad spaces without location
      response = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?select=id,title&category_id=eq.${category.id}&location_id=is.null`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      });
      const spaces = await response.json();
      
      console.log(`\n📦 Updating ${spaces.length} ${category.name} ad spaces...`);
      
      if (spaces && spaces.length > 0) {
        for (let i = 0; i < spaces.length; i++) {
          const space = spaces[i];
          const location = locations[i % locations.length];
          
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
            console.error(`❌ Error updating "${space.title}":`, error);
          }
        }
      }
    }
    
    console.log('\n✅ Location update complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixLocations();
