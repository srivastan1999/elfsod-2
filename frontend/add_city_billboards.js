/**
 * Script to add city billboard ad spaces
 * Run: node add_city_billboards.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const adSpaces = [
  {
    "id": "hyd_billboard_001",
    "title": "Madhapur Metro Station",
    "description": "High-visibility static billboard in the heart of the IT Hub, Hyderabad.",
    "category_id": "city_billboards_001",
    "location_id": "hyd_loc_001",
    "publisher_id": null,
    "display_type": "static_billboard",
    "price_per_day": 7500,
    "price_per_month": 220000,
    "daily_impressions": 14000,
    "monthly_footfall": 420000,
    "target_audience": null,
    "availability_status": "available",
    "latitude": 17.4504,
    "longitude": 78.3912,
    "images": [
      "https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/10.png"
    ],
    "dimensions": {
      "width": 18,
      "height": 36
    },
    "route": null,
    "location": {
      "id": "hyd_loc_001",
      "city": "Hyderabad",
      "state": "Telangana",
      "address": "Madhapur Metro Station, Hyderabad",
      "country": "India",
      "latitude": 17.4504,
      "longitude": 78.3912
    }
  },
  {
    "id": "hyd_billboard_002",
    "title": "Begumpet Flyover",
    "description": "Prominent static billboard on Begumpet Flyover, Hyderabad.",
    "category_id": "city_billboards_001",
    "location_id": "hyd_loc_002",
    "publisher_id": null,
    "display_type": "static_billboard",
    "price_per_day": 6000,
    "price_per_month": 180000,
    "daily_impressions": 12000,
    "monthly_footfall": 320000,
    "target_audience": null,
    "availability_status": "available",
    "latitude": 17.4448,
    "longitude": 78.4608,
    "images": [
      "https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/11.png"
    ],
    "dimensions": {
      "width": 15,
      "height": 25
    },
    "route": null,
    "location": {
      "id": "hyd_loc_002",
      "city": "Hyderabad",
      "state": "Telangana",
      "address": "Begumpet Flyover, Hyderabad",
      "country": "India",
      "latitude": 17.4448,
      "longitude": 78.4608
    }
  },
  {
    "id": "hyd_billboard_003",
    "title": "Kukatpally Main Road",
    "description": "Busy commuter spot with premium static billboard.",
    "category_id": "city_billboards_001",
    "location_id": "hyd_loc_003",
    "publisher_id": null,
    "display_type": "static_billboard",
    "price_per_day": 5000,
    "price_per_month": 155000,
    "daily_impressions": 10500,
    "monthly_footfall": 315000,
    "target_audience": null,
    "availability_status": "available",
    "latitude": 17.4948,
    "longitude": 78.3991,
    "images": [
      "https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/12.png"
    ],
    "dimensions": {
      "width": 14,
      "height": 28
    },
    "route": null,
    "location": {
      "id": "hyd_loc_003",
      "city": "Hyderabad",
      "state": "Telangana",
      "address": "Kukatpally Main Road, Hyderabad",
      "country": "India",
      "latitude": 17.4948,
      "longitude": 78.3991
    }
  },
  {
    "id": "mum_billboard_001",
    "title": "Andheri East",
    "description": "Strategic static billboard placement at Andheri East, Mumbai.",
    "category_id": "city_billboards_001",
    "location_id": "mum_loc_001",
    "publisher_id": null,
    "display_type": "static_billboard",
    "price_per_day": 6800,
    "price_per_month": 180000,
    "daily_impressions": 11600,
    "monthly_footfall": 348000,
    "target_audience": null,
    "availability_status": "available",
    "latitude": 19.1197,
    "longitude": 72.8694,
    "images": [
      "https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/13.png"
    ],
    "dimensions": {
      "width": 16,
      "height": 30
    },
    "route": null,
    "location": {
      "id": "mum_loc_001",
      "city": "Mumbai",
      "state": "Maharashtra",
      "address": "Andheri East, Mumbai",
      "country": "India",
      "latitude": 19.1197,
      "longitude": 72.8694
    }
  },
  {
    "id": "del_billboard_001",
    "title": "Saket Metro",
    "description": "Large format static billboard at Saket Metro, Delhi.",
    "category_id": "city_billboards_001",
    "location_id": "del_loc_001",
    "publisher_id": null,
    "display_type": "static_billboard",
    "price_per_day": 7200,
    "price_per_month": 200000,
    "daily_impressions": 13500,
    "monthly_footfall": 405000,
    "target_audience": null,
    "availability_status": "available",
    "latitude": 28.5236,
    "longitude": 77.2193,
    "images": [
      "https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/14.png"
    ],
    "dimensions": {
      "width": 17,
      "height": 32
    },
    "route": null,
    "location": {
      "id": "del_loc_001",
      "city": "Delhi",
      "state": "Delhi",
      "address": "Saket Metro, Delhi",
      "country": "India",
      "latitude": 28.5236,
      "longitude": 77.2193
    }
  }
];

async function findOrCreateCategory(categoryName, categoryId) {
  try {
    // First try to find existing category
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    const result = await response.json();
    
    if (result.success && result.data) {
      const existing = result.data.find(cat => 
        cat.id === categoryId || cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (existing) {
        console.log(`✅ Category found: ${categoryName} (ID: ${existing.id})`);
        return existing.id;
      }
    }
    
    // If not found, try to find "Billboards" category
    const billboards = result.data?.find(cat => 
      cat.name.toLowerCase().includes('billboard')
    );
    if (billboards) {
      console.log(`✅ Using existing Billboards category (ID: ${billboards.id})`);
      return billboards.id;
    }
    
    console.log(`⚠️  Category "${categoryName}" not found. You may need to create it first.`);
    return null;
  } catch (error) {
    console.error('❌ Error finding category:', error);
    return null;
  }
}

async function findOrCreateLocation(locationData) {
  try {
    // Try to find existing location
    const response = await fetch(`${API_BASE_URL}/api/locations`);
    const result = await response.json();
    
    if (result.success && result.data) {
      const existing = result.data.find(loc => 
        loc.id === locationData.id || 
        (loc.city === locationData.city && loc.address === locationData.address)
      );
      if (existing) {
        console.log(`✅ Location found: ${locationData.address} (ID: ${existing.id})`);
        return existing.id;
      }
    }
    
    // Create new location
    const createResponse = await fetch(`${API_BASE_URL}/api/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: locationData.city,
        state: locationData.state,
        country: locationData.country,
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
    
    console.log(`⚠️  Could not create location: ${locationData.address}`);
    return null;
  } catch (error) {
    console.error('❌ Error with location:', error);
    return null;
  }
}

async function createAdSpace(adSpaceData, categoryId, locationId) {
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
      availabilityStatus: adSpaceData.availability_status || 'available',
      targetAudience: adSpaceData.target_audience || null
    };
    
    const response = await fetch(`${API_BASE_URL}/api/ad-spaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || result.details || 'Failed to create ad space');
    }
  } catch (error) {
    console.error(`❌ Error creating ad space "${adSpaceData.title}":`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting to add city billboard ad spaces...\n');
  console.log(`📡 API Base URL: ${API_BASE_URL}\n`);
  
  // Find or get category ID
  console.log('📋 Finding/creating category...');
  const categoryId = await findOrCreateCategory('Billboards', 'city_billboards_001');
  
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
      const locationId = await findOrCreateLocation(adSpace.location);
      
      if (!locationId) {
        console.log(`  ⚠️  Skipping - could not find/create location`);
        failed++;
        continue;
      }
      
      // Create ad space
      const createdSpace = await createAdSpace(adSpace, categoryId, locationId);
      console.log(`  ✅ Created: ${createdSpace.title} (ID: ${createdSpace.id})`);
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

