// Verify that locations are actually set
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

async function verify() {
  console.log('\n✅ Verifying locations are set...\n');
  
  // Get categories
  const catResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name&name=in.(Mall,Restaurant,Grocery Store)`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const categories = await catResponse.json();
  
  for (const cat of categories) {
    const spacesResponse = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?select=id,title,location:locations(city)&category_id=eq.${cat.id}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const spaces = await spacesResponse.json();
    
    console.log(`${cat.name}:`);
    spaces.forEach(space => {
      console.log(`  - "${space.title}" -> ${space.location?.city || 'NO CITY'}`);
    });
    console.log('');
  }
}

verify();
