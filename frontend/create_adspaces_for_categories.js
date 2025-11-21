// Script to create ad spaces for categories using the API
// Run with: node create_adspaces_for_categories.js

const API_URL = 'http://localhost:3000/api';

// Category IDs (update these with actual IDs from your database)
const CATEGORIES = {
  'Corporate': '6e072404-2a07-4d98-b6d1-a39165d66b24',
  'Event Venue': '2a34951b-9013-447e-bb4e-9d07d2154ee1',
  'Grocery Store': '65e1bc98-81d4-4b8c-9e67-a61bf7603841',
  'Hotel': '513eeaff-187d-4989-a356-3abfb41f2de7',
  'Mall': '80abc0d6-5795-4a8a-bd95-0062bb63180f',
  'Metro': '5fd03776-02c4-4130-b6ed-2b259925b43c',
  'Office Tower': 'c49e9875-66c9-4816-a71c-d6a3f97e9cfc',
  'Restaurant': '4619bb27-fe8c-4356-a050-9cd28d250176'
};

// Sample locations (Mumbai, Bengaluru, Delhi)
const LOCATIONS = [
  { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { city: 'Delhi', lat: 28.6139, lng: 77.2090 }
];

// Publisher ID (get from API)
const PUBLISHER_ID = '31ca678d-93ac-4aef-b1f2-454ea012fde3';

// Ad space templates for each category
const AD_SPACE_TEMPLATES = {
  'Corporate': [
    {
      title: 'Corporate Office Lobby Display',
      description: 'Premium digital display in corporate office lobby. Perfect for B2B campaigns targeting professionals.',
      displayType: 'digital_screen',
      pricePerDay: 45000,
      pricePerMonth: 1350000,
      dailyImpressions: 3000,
      monthlyFootfall: 90000
    },
    {
      title: 'Tech Park Entrance Billboard',
      description: 'High visibility billboard at tech park entrance. Ideal for IT and corporate brands.',
      displayType: 'static_billboard',
      pricePerDay: 55000,
      pricePerMonth: 1650000,
      dailyImpressions: 5000,
      monthlyFootfall: 150000
    }
  ],
  'Event Venue': [
    {
      title: 'Convention Center Main Hall',
      description: 'Large format display in convention center main hall. Perfect for event sponsorships.',
      displayType: 'led_display',
      pricePerDay: 75000,
      pricePerMonth: 2250000,
      dailyImpressions: 8000,
      monthlyFootfall: 240000
    },
    {
      title: 'Exhibition Hall Entrance',
      description: 'Premium location at exhibition hall entrance. High footfall during events.',
      displayType: 'digital_screen',
      pricePerDay: 65000,
      pricePerMonth: 1950000,
      dailyImpressions: 7000,
      monthlyFootfall: 210000
    }
  ],
  'Grocery Store': [
    {
      title: 'Supermarket Entrance Display',
      description: 'Digital screen at supermarket entrance. Perfect for FMCG and retail brands.',
      displayType: 'digital_screen',
      pricePerDay: 35000,
      pricePerMonth: 1050000,
      dailyImpressions: 6000,
      monthlyFootfall: 180000
    },
    {
      title: 'Grocery Store Checkout Counter',
      description: 'Point of sale display at checkout. High visibility for impulse purchases.',
      displayType: 'backlit_panel',
      pricePerDay: 25000,
      pricePerMonth: 750000,
      dailyImpressions: 4000,
      monthlyFootfall: 120000
    }
  ],
  'Hotel': [
    {
      title: 'Hotel Lobby Premium Display',
      description: 'Elegant digital display in hotel lobby. Targets affluent travelers and business guests.',
      displayType: 'digital_screen',
      pricePerDay: 60000,
      pricePerMonth: 1800000,
      dailyImpressions: 4500,
      monthlyFootfall: 135000
    },
    {
      title: 'Hotel Restaurant Entrance',
      description: 'Display at hotel restaurant entrance. Perfect for luxury and lifestyle brands.',
      displayType: 'backlit_panel',
      pricePerDay: 40000,
      pricePerMonth: 1200000,
      dailyImpressions: 3500,
      monthlyFootfall: 105000
    }
  ],
  'Mall': [
    {
      title: 'Shopping Mall Food Court',
      description: 'High-traffic digital screen in mall food court. Excellent for food and beverage brands.',
      displayType: 'digital_screen',
      pricePerDay: 70000,
      pricePerMonth: 2100000,
      dailyImpressions: 12000,
      monthlyFootfall: 360000
    },
    {
      title: 'Mall Entrance Billboard',
      description: 'Premium billboard at main mall entrance. Maximum visibility for retail campaigns.',
      displayType: 'static_billboard',
      pricePerDay: 80000,
      pricePerMonth: 2400000,
      dailyImpressions: 15000,
      monthlyFootfall: 450000
    }
  ],
  'Metro': [
    {
      title: 'Metro Station Platform Display',
      description: 'Digital display on metro platform. High visibility for commuters.',
      displayType: 'led_display',
      pricePerDay: 55000,
      pricePerMonth: 1650000,
      dailyImpressions: 20000,
      monthlyFootfall: 600000
    },
    {
      title: 'Metro Station Entrance',
      description: 'Billboard at metro station entrance. Perfect for mass-market campaigns.',
      displayType: 'static_billboard',
      pricePerDay: 50000,
      pricePerMonth: 1500000,
      dailyImpressions: 18000,
      monthlyFootfall: 540000
    }
  ],
  'Office Tower': [
    {
      title: 'Office Building Elevator Display',
      description: 'Digital screen in office building elevators. Targets working professionals daily.',
      displayType: 'digital_screen',
      pricePerDay: 40000,
      pricePerMonth: 1200000,
      dailyImpressions: 5000,
      monthlyFootfall: 150000
    },
    {
      title: 'Business District Office Tower',
      description: 'Premium location in business district. Ideal for corporate and B2B advertising.',
      displayType: 'static_billboard',
      pricePerDay: 60000,
      pricePerMonth: 1800000,
      dailyImpressions: 8000,
      monthlyFootfall: 240000
    }
  ],
  'Restaurant': [
    {
      title: 'Fine Dining Restaurant Display',
      description: 'Elegant display in fine dining restaurant. Perfect for premium brands.',
      displayType: 'backlit_panel',
      pricePerDay: 30000,
      pricePerMonth: 900000,
      dailyImpressions: 2500,
      monthlyFootfall: 75000
    },
    {
      title: 'Cafe Counter Display',
      description: 'Digital screen at cafe counter. Great for food and beverage advertising.',
      displayType: 'digital_screen',
      pricePerDay: 25000,
      pricePerMonth: 750000,
      dailyImpressions: 3000,
      monthlyFootfall: 90000
    }
  ]
};

async function createAdSpace(adSpaceData) {
  try {
    const response = await fetch(`${API_URL}/ad-spaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adSpaceData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating ad space:', error);
    return { success: false, error: error.message };
  }
}

async function createAdSpacesForAllCategories() {
  console.log('🚀 Starting to create ad spaces for all categories...\n');

  let totalCreated = 0;
  let totalErrors = 0;

  for (const [categoryName, categoryId] of Object.entries(CATEGORIES)) {
    console.log(`\n📋 Creating ad spaces for: ${categoryName}`);
    
    const templates = AD_SPACE_TEMPLATES[categoryName] || [];
    
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const location = LOCATIONS[i % LOCATIONS.length];
      
      const adSpaceData = {
        title: template.title,
        description: template.description,
        categoryId: categoryId,
        publisherId: PUBLISHER_ID,
        displayType: template.displayType,
        pricePerDay: template.pricePerDay,
        pricePerMonth: template.pricePerMonth,
        dailyImpressions: template.dailyImpressions,
        monthlyFootfall: template.monthlyFootfall,
        latitude: location.lat,
        longitude: location.lng,
        images: [],
        dimensions: { width: 1920, height: 1080 },
        availabilityStatus: 'available'
      };

      const result = await createAdSpace(adSpaceData);
      
      if (result.success) {
        console.log(`  ✅ Created: ${template.title}`);
        totalCreated++;
      } else {
        console.log(`  ❌ Failed: ${template.title} - ${result.error}`);
        totalErrors++;
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log(`\n\n📊 Summary:`);
  console.log(`  ✅ Created: ${totalCreated} ad spaces`);
  console.log(`  ❌ Errors: ${totalErrors}`);
  console.log(`\n✨ Done!`);
}

// Run the script
createAdSpacesForAllCategories().catch(console.error);

