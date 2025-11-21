/**
 * Script to load traffic data for all ad spaces
 * 
 * Usage:
 *   node scripts/load-traffic-data.js [options]
 * 
 * Options:
 *   --limit N        Load traffic for first N ad spaces (default: 10)
 *   --force          Force reload even if traffic data exists
 *   --ids id1,id2    Load traffic for specific ad space IDs
 * 
 * Example:
 *   node scripts/load-traffic-data.js --limit 50
 *   node scripts/load-traffic-data.js --ids uuid1,uuid2,uuid3
 */

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function loadTrafficData(options = {}) {
  const { limit = 10, force = false, ids = null } = options;

  console.log('🚀 Starting traffic data load...');
  console.log(`   Limit: ${limit}`);
  console.log(`   Force: ${force}`);
  if (ids) console.log(`   IDs: ${ids.join(', ')}`);

  try {
    const response = await fetch(`${API_URL}/api/ad-spaces/load-traffic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: parseInt(limit),
        force: force,
        adSpaceIds: ids ? ids.split(',') : undefined
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result = await response.json();

    console.log('\n✅ Traffic data load completed!');
    console.log(`\n📊 Results:`);
    console.log(`   Total: ${result.results.total}`);
    console.log(`   Processed: ${result.results.processed}`);
    console.log(`   ✅ Successful: ${result.results.successful}`);
    console.log(`   ❌ Failed: ${result.results.failed}`);
    console.log(`   ⏭️  Skipped: ${result.results.skipped}`);

    if (result.results.details && result.results.details.length > 0) {
      console.log('\n📝 Details:');
      result.results.details.forEach((detail, index) => {
        const icon = detail.status === 'success' ? '✅' : detail.status === 'failed' ? '❌' : '⏭️';
        console.log(`   ${icon} ${detail.title || detail.id}`);
        if (detail.error) {
          console.log(`      Error: ${detail.error}`);
        }
      });
    }

    return result;
  } catch (error) {
    console.error('\n❌ Error loading traffic data:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--limit' && args[i + 1]) {
    options.limit = args[i + 1];
    i++;
  } else if (args[i] === '--force') {
    options.force = true;
  } else if (args[i] === '--ids' && args[i + 1]) {
    options.ids = args[i + 1];
    i++;
  }
}

// Run the script
loadTrafficData(options);

