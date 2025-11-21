// Check which cities the Retail & Commerce ad spaces are in
const checkCities = async () => {
  console.log('\n🔍 Checking Retail & Commerce ad spaces...\n');
  
  const response = await fetch('http://localhost:3000/api/ad-spaces/filter?parentCategoryName=Retail%20%26%20Commerce');
  const result = await response.json();
  
  console.log(`Found ${result.count} Retail & Commerce ad spaces:\n`);
  result.data.forEach((space, i) => {
    console.log(`${i + 1}. "${space.title}"`);
    console.log(`   Category: ${space.category?.name || 'Unknown'}`);
    console.log(`   City: ${space.location?.city || 'NO CITY'}`);
    console.log(`   Address: ${space.location?.address || 'No address'}\n`);
  });
};

checkCities().catch(console.error);
