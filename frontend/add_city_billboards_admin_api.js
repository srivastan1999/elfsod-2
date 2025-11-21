/**
 * Script to add city billboard ad spaces using Admin API
 * Run: node add_city_billboards_admin_api.js
 * 
 * Make sure you're logged in as admin and have the admin token in localStorage
 * Or set ADMIN_TOKEN environment variable
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null; // Set this or get from browser localStorage

const adSpaces = [
  {
    "title": "Madhapur Metro Station",
    "description": "High-visibility static billboard in the heart of the IT Hub, Hyderabad.",
    "location": {
      "city": "Hyderabad",
      "state": "Telangana",
      "address": "Madhapur Metro Station, Hyderabad",
      "latitude": 17.4504,
      "longitude": 78.3912
    },
    "display_type": "static_billboard",
    "price_per_day": 7500,
    "price_per_month": 220000,
    "daily_impressions": 14000,
    "monthly_footfall": 420000,
    "latitude": 17.4504,
    "longitude": 78.3912,
    "images": [
      "https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/10.png"
    ],
    "dimensions": {
      "width": 18,
      "height": 36
    }
  },
  {
    "title": "Begumpet Flyover",
    "description": "Prominent static billboard on Begumpet Flyover, Hyderabad.",
    "location": {
      "city": "Hyderabad",
      "state": "Telangana",
      "address": "Begumpet Flyover, Hyderabad",
      "latitude": 17.4448,
      "longitude": 78.4608
    },
    "display_type": "static_billboard",
    "price_per_day": 6000,
    "price_per_month": 180000,
    "daily_impressions": 12000,
    "monthly_footfall": 320000,
    "latitude": 17.4448,
    "longitude": 78.4608,
    "images": [
      "https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/11.png"
    ],
    "dimensions": {
      "width": 15,
      "height": 25
    }
  },
  {
    "title": "Kukatpally Main Road",
    "description": "Busy commuter spot with premium static billboard.",
    "location": {
      "city": "Hyderabad",
      "state": "Telangana",
      "address": "Kukatpally Main Road, Hyderabad",
      "latitude": 17.4948,
      "longitude": 78.3991
    },
    "display_type": "static_billboard",
    "price_per_day": 5000,
    "price_per_month": 155000,
    "daily_impressions": 10500,
    "monthly_footfall": 315000,
    "latitude": 17.4948,
    "longitude": 78.3991,
    "images": [
      "https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/12.png"
    ],
    "dimensions": {
      "width": 14,
      "height": 28
    }
  },
  {
    "title": "Andheri East",
    "description": "Strategic static billboard placement at Andheri East, Mumbai.",
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "address": "Andheri East, Mumbai",
      "latitude": 19.1197,
      "longitude": 72.8694
    },
    "display_type": "static_billboard",
    "price_per_day": 6800,
    "price_per_month": 180000,
    "daily_impressions": 11600,
    "monthly_footfall": 348000,
    "latitude": 19.1197,
    "longitude": 72.8694,
    "images": [
      "https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/13.png"
    ],
    "dimensions": {
      "width": 16,
      "height": 30
    }
  },
  {
    "title": "Saket Metro",
    "description": "Large format static billboard at Saket Metro, Delhi.",
    "location": {
      "city": "Delhi",
      "state": "Delhi",
      "address": "Saket Metro, Delhi",
      "latitude": 28.5236,
      "longitude": 77.2193
    },
    "display_type": "static_billboard",
    "price_per_day": 7200,
    "price_per_month": 200000,
    "daily_impressions": 13500,
    "monthly_footfall": 405000,
    "latitude": 28.5236,
    "longitude": 77.2193,
    "images": [
      "https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/14.png"
    ],
    "dimensions": {
      "width": 17,
      "height": 32
    }
  }
];

async function findOrCreateCategory(categoryName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    const result = await response.json();
    
    if (result.success && result.data) {
      const existing = result.data.find(cat => 
        cat.name.toLowerCase().includes('billboard')
      );
      if (existing) {
        console.log(`✅ Category found: ${existing.name} (ID: ${existing.id})`);
        return existing.id;
      }
    }
    
    console.log(`⚠️  Category "${categoryName}" not found. Please create it first in admin portal.`);
    return null;
  } catch (error) {
    console.error('❌ Error finding category:', error);
    return null;
  }
}

async function findOrCreateLocation(locationData, token) {
  try {
    // First try to find existing location
    const searchResponse = await fetch(`${API_BASE_URL}/api/locations?city=${encodeURIComponent(locationData.city)}`);
    const searchResult = await searchResponse.json();
    
    if (searchResult.success && searchResult.data) {
      const existing = searchResult.data.find(loc => 
        loc.address === locationData.address || 
        (loc.city === locationData.city && loc.latitude === locationData.latitude)
      );
      if (existing) {
        console.log(`✅ Location found: ${locationData.address} (ID: ${existing.id})`);
        return existing.id;
      }
    }
    
    // Create new location using admin API or regular API
    const createResponse = await fetch(`${API_BASE_URL}/api/locations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        city: locationData.city,
        state: locationData.state,
        country: 'India',
        address: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      })
    });
    
    const createResult = await createResponse.json();
    if (createResult.success && createResult.data) {
      console.log(`✅ Created location: ${locationData.address} (ID: ${createResult.data.id})`);
      return createResult.data.id;
    }
    
    console.log(`⚠️  Could not create location: ${locationData.address} - ${createResult.error || 'Unknown error'}`);
    return null;
  } catch (error) {
    console.error('❌ Error with location:', error);
    return null;
  }
}

async function createAdSpaceViaAdminAPI(adSpaceData, categoryId, locationId, token) {
  try {
    const payload = {
      title: adSpaceData.title,
      description: adSpaceData.description,
      categoryId: categoryId,
      locationId: locationId,
      displayType: adSpaceData.display_type,
      pricePerDay: adSpaceData.price_per_day,
      pricePerMonth: adSpaceData.price_per_month,
      dailyImpressions: adSpaceData.daily_impressions,
      monthlyFootfall: adSpaceData.monthly_footfall,
      latitude: adSpaceData.latitude,
      longitude: adSpaceData.longitude,
      images: adSpaceData.images || [],
      dimensions: adSpaceData.dimensions || {},
      availabilityStatus: 'available'
    };
    
    // Use admin API endpoint (admin-portal uses /api/ad-spaces with admin session)
    // Note: This requires admin authentication via verifyAdminSession
    const adminEndpoint = `${API_BASE_URL}/api/ad-spaces`;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization if token is provided
    // Admin portal uses 'elfsod-admin-token' in localStorage, but API expects session cookie
    // For script usage, you may need to set up proper admin session first
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(adminEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      credentials: 'include' // Include cookies for session-based auth
    });
    
    const result = await response.json();
    
    if (result.success || result.adSpace) {
      return result.adSpace || result.data;
    } else {
      throw new Error(result.error || result.details || 'Failed to create ad space');
    }
  } catch (error) {
    console.error(`❌ Error creating ad space "${adSpaceData.title}":`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting to add city billboard ad spaces via Admin API...\n');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  
  if (!ADMIN_TOKEN) {
    console.log('⚠️  ADMIN_TOKEN not set. Some operations may require authentication.');
    console.log('   Set ADMIN_TOKEN environment variable or update the script with your token.\n');
  } else {
    console.log('✅ Admin token found\n');
  }
  
  // Find category
  console.log('📋 Finding category...');
  const categoryId = await findOrCreateCategory('Billboards');
  
  if (!categoryId) {
    console.error('❌ Cannot proceed without category. Please create "Billboards" category first.');
    process.exit(1);
  }
  
  console.log(`\n📊 Processing ${adSpaces.length} ad spaces...\n`);
  
  let created = 0;
  let failed = 0;
  
  for (const adSpace of adSpaces) {
    try {
      console.log(`\n📦 Processing: ${adSpace.title}`);
      
      // Find or create location
      const locationId = await findOrCreateLocation(adSpace.location, ADMIN_TOKEN);
      
      if (!locationId) {
        console.log(`  ⚠️  Skipping - could not find/create location`);
        failed++;
        continue;
      }
      
      // Create ad space via admin API
      const createdSpace = await createAdSpaceViaAdminAPI(adSpace, categoryId, locationId, ADMIN_TOKEN);
      console.log(`  ✅ Created: ${createdSpace.title} (ID: ${createdSpace.id || 'N/A'})`);
      created++;
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n\n📊 Summary:`);
  console.log(`  ✅ Successfully created: ${created} ad spaces`);
  console.log(`  ❌ Failed: ${failed} ad spaces`);
  console.log(`\n✨ Done!`);
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

