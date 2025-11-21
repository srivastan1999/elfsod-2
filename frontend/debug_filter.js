// Quick debug script to test the filter API
const testFilter = async () => {
  console.log('\n🧪 Testing Filter API...\n');
  
  // Test 1: Get all ad spaces
  console.log('Test 1: Get all ad spaces');
  let response = await fetch('http://localhost:3000/api/ad-spaces/filter?limit=100');
  let result = await response.json();
  console.log(`  ✅ Found ${result.count} total ad spaces\n`);
  
  // Show categories
  const categoryCounts = {};
  result.data.forEach(space => {
    const catName = space.category?.name || 'Unknown';
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
  });
  console.log('  📊 Ad spaces by category:');
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`    - ${cat}: ${count} spaces`);
  });
  
  // Show cities
  const cityCounts = {};
  result.data.forEach(space => {
    const city = space.location?.city || 'No city';
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });
  console.log('\n  📍 Ad spaces by city:');
  Object.entries(cityCounts).forEach(([city, count]) => {
    console.log(`    - ${city}: ${count} spaces`);
  });
  
  // Test 2: Filter by parent category
  console.log('\n\nTest 2: Filter by parent category "Retail & Commerce"');
  response = await fetch('http://localhost:3000/api/ad-spaces/filter?parentCategoryName=Retail%20%26%20Commerce');
  result = await response.json();
  console.log(`  ✅ Found ${result.count} ad spaces\n`);
  
  // Test 3: Filter by parent category + city
  console.log('Test 3: Filter by "Retail & Commerce" + city "Delhi"');
  response = await fetch('http://localhost:3000/api/ad-spaces/filter?parentCategoryName=Retail%20%26%20Commerce&city=Delhi');
  result = await response.json();
  console.log(`  ${result.count > 0 ? '✅' : '❌'} Found ${result.count} ad spaces in Delhi`);
  
  if (result.count === 0 && result.data) {
    console.log('  ℹ️  Checking why no results...');
  }
  console.log('');
};

testFilter().catch(console.error);
