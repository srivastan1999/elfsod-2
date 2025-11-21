// Check the actual IDs of Mall ad spaces
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

async function checkIDs() {
  // Get Mall category
  const catResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name&name=in.(Mall,Restaurant,Grocery Store)`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const categories = await catResponse.json();
  
  console.log('\n📊 All Retail & Commerce ad spaces:\n');
  
  for (const cat of categories) {
    const spacesResponse = await fetch(`${supabaseUrl}/rest/v1/ad_spaces?select=id,title,location_id,created_at&category_id=eq.${cat.id}&order=created_at.desc`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const spaces = await spacesResponse.json();
    
    console.log(`\n${cat.name} (${spaces.length} spaces):`);
    spaces.forEach((space, i) => {
      console.log(`  ${i + 1}. ${space.id.substring(0, 8)}... "${space.title}"`);
      console.log(`     location_id: ${space.location_id ? space.location_id.substring(0, 8) + '...' : 'NULL'}`);
      console.log(`     created_at: ${space.created_at}`);
    });
  }
}

checkIDs();
