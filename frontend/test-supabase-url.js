// Quick test script to verify Supabase URL
// Run: node test-supabase-url.js

const SUPABASE_URL = 'https://vavubezjuqnkrvndtowt.supabase.co';

console.log('Testing Supabase URL:', SUPABASE_URL);
console.log('\n1. Testing if URL is reachable...');

fetch(`${SUPABASE_URL}/rest/v1/`, {
  method: 'GET',
  headers: {
    'apikey': 'test-key',
    'Authorization': 'Bearer test-key'
  }
})
.then(response => {
  console.log('✅ URL is reachable');
  console.log('Status:', response.status);
  return response.text();
})
.then(text => {
  console.log('Response:', text.substring(0, 100));
})
.catch(error => {
  console.log('❌ Error:', error.message);
  if (error.message.includes('CORS')) {
    console.log('⚠️ CORS issue detected - this is normal, the API routes will handle it');
  } else {
    console.log('⚠️ Connection issue - check:');
    console.log('  - Is the Supabase project active?');
    console.log('  - Is the URL correct?');
    console.log('  - Network/firewall blocking?');
  }
});

