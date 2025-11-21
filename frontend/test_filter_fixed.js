// Test the filter API after fixing locations
const testFilter = async () => {
  console.log('\n🧪 Testing Filter API after location fix...\n');
  
  // Test 1: Filter by parent category "Retail & Commerce"
  console.log('Test 1: Filter by "Retail & Commerce"');
  let response = await fetch('http://localhost:3000/api/ad-spaces/filter?parentCategoryName=Retail%20%26%20Commerce');
  let result = await response.json();
  console.log(`  ✅ Found ${result.count} ad spaces\n`);
  
  // Show distribution
  const cityCounts = {};
  result.data.forEach(space => {
    const city = space.location?.city || 'No city';
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });
  console.log('  📍 Distribution by city:');
  Object.entries(cityCounts).forEach(([city, count]) => {
    console.log(`    - ${city}: ${count} spaces`);
  });
  
  // Test 2: Filter by parent category + Delhi
  console.log('\n\nTest 2: Filter by "Retail & Commerce" + "Delhi"');
  response = await fetch('http://localhost:3000/api/ad-spaces/filter?parentCategoryName=Retail%20%26%20Commerce&city=Delhi');
  result = await response.json();
  console.log(`  ${result.count > 0 ? '✅' : '❌'} Found ${result.count} ad spaces in Delhi`);
  
  if (result.count > 0) {
    console.log('\n  📦 Ad spaces found:');
    result.data.forEach((space, i) => {
      console.log(`    ${i + 1}. "${space.title}" (${space.category?.name})`);
    });
  }
  
  // Test 3: Filter by parent category + Mumbai
  console.log('\n\nTest 3: Filter by "Retail & Commerce" + "Mumbai"');
  response = await fetch('http://localhost:3000/api/ad-spaces/filter?parentCategoryName=Retail%20%26%20Commerce&city=Mumbai');
  result = await response.json();
  console.log(`  ${result.count > 0 ? '✅' : '❌'} Found ${result.count} ad spaces in Mumbai\n`);
  
  // Test 4: Filter by Office Tower (to compare)
  console.log('Test 4: Filter by "Office Tower" + "Delhi"');
  response = await fetch('http://localhost:3000/api/ad-spaces/filter?categoryName=Office%20Tower&city=Delhi');
  result = await response.json();
  console.log(`  ${result.count > 0 ? '✅' : '❌'} Found ${result.count} ad spaces in Delhi\n`);
};

testFilter().catch(console.error);
