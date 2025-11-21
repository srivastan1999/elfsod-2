const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zcqqfkuezoxumchbslqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXFma3Vlem94dW1jaGJzbHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzQzMzEsImV4cCI6MjA0ODIxMDMzMX0.uGXyKBQNvSQZ0WtJTK-oM2FgODTj1-IA8PvxqvbuVU8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabase() {
  console.log('🔍 Checking Supabase connection...\n');

  // Check categories
  console.log('1️⃣ Checking categories table:');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*');
  
  if (catError) {
    console.log('❌ Error fetching categories:', catError.message);
  } else {
    console.log(`✅ Found ${categories.length} categories`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });
  }

  console.log('\n2️⃣ Checking locations table:');
  const { data: locations, error: locError } = await supabase
    .from('locations')
    .select('*');
  
  if (locError) {
    console.log('❌ Error fetching locations:', locError.message);
  } else {
    console.log(`✅ Found ${locations.length} locations`);
  }

  console.log('\n3️⃣ Checking publishers table:');
  const { data: publishers, error: pubError } = await supabase
    .from('publishers')
    .select('*');
  
  if (pubError) {
    console.log('❌ Error fetching publishers:', pubError.message);
  } else {
    console.log(`✅ Found ${publishers.length} publishers`);
  }

  console.log('\n4️⃣ Checking ad_spaces table:');
  const { data: adSpaces, error: adError } = await supabase
    .from('ad_spaces')
    .select('*');
  
  if (adError) {
    console.log('❌ Error fetching ad_spaces:', adError.message);
  } else {
    console.log(`✅ Found ${adSpaces.length} ad spaces`);
  }

  console.log('\n📊 Summary:');
  console.log(`   Categories: ${categories?.length || 0}`);
  console.log(`   Locations: ${locations?.length || 0}`);
  console.log(`   Publishers: ${publishers?.length || 0}`);
  console.log(`   Ad Spaces: ${adSpaces?.length || 0}`);

  if (categories?.length === 0) {
    console.log('\n⚠️  WARNING: No categories found!');
    console.log('   Please run: frontend/supabase/create_categories.sql in Supabase SQL Editor');
  }

  if (adSpaces?.length === 0) {
    console.log('\n⚠️  WARNING: No ad spaces found!');
    console.log('   Please run: frontend/supabase/create_sample_adspaces.sql in Supabase SQL Editor');
  }
}

checkDatabase();

