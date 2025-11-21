/**
 * Script to create ad spaces for categories using the API
 * Run: node create_adspaces_via_api.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Categories to create ad spaces for
const TARGET_CATEGORIES = [
  'Corporate',
  'Event Venue',
  'Grocery Store',
  'Hotel',
  'Mall',
  'Metro',
  'Office Tower',
  'Restaurant'
];

// Sample ad space data templates for each category
const AD_SPACE_TEMPLATES = {
  'Corporate': [
    {
      title: 'Corporate Lobby Digital Display',
      description: 'Premium digital display in corporate building lobby. High footfall during business hours. Perfect for B2B and professional services.',
      displayType: 'digital_screen',
      pricePerDay: 5000,
      pricePerMonth: 150000,
      dailyImpressions: 2000,
      monthlyFootfall: 60000,
      latitude: 12.9716,
      longitude: 77.5946
    },
    {
      title: 'Corporate Elevator Display',
      description: 'Digital screen inside corporate building elevators. Captive audience with high engagement rates.',
      displayType: 'digital_screen',
      pricePerDay: 3500,
      pricePerMonth: 105000,
      dailyImpressions: 1500,
      monthlyFootfall: 45000,
      latitude: 12.9352,
      longitude: 77.6245
    }
  ],
  'Event Venue': [
    {
      title: 'Event Hall Entrance Banner',
      description: 'Large format banner at event venue entrance. High visibility for event attendees.',
      displayType: 'vinyl_banner',
      pricePerDay: 8000,
      pricePerMonth: 240000,
      dailyImpressions: 3000,
      monthlyFootfall: 90000,
      latitude: 12.9716,
      longitude: 77.5946
    },
    {
      title: 'Event Stage Backdrop',
      description: 'Premium backdrop display behind event stage. Maximum visibility for all attendees.',
      displayType: 'led_display',
      pricePerDay: 12000,
      pricePerMonth: 360000,
      dailyImpressions: 5000,
      monthlyFootfall: 150000,
      latitude: 12.9352,
      longitude: 77.6245
    }
  ],
  'Grocery Store': [
    {
      title: 'Supermarket Entrance Display',
      description: 'Digital screen at supermarket entrance. Perfect for FMCG and retail brands.',
      displayType: 'digital_screen',
      pricePerDay: 3500,
      pricePerMonth: 105000,
      dailyImpressions: 6000,
      monthlyFootfall: 180000,
      latitude: 12.9716,
      longitude: 77.5946
    },
    {
      title: 'Grocery Aisle Banner',
      description: 'Strategic banner placement in high-traffic grocery aisles. Point-of-purchase advertising.',
      displayType: 'vinyl_banner',
      pricePerDay: 2500,
      pricePerMonth: 75000,
      dailyImpressions: 8000,
      monthlyFootfall: 240000,
      latitude: 12.9352,
      longitude: 77.6245
    }
  ],
  'Hotel': [
    {
      title: 'Hotel Lobby Digital Screen',
      description: 'Premium digital display in hotel lobby. Targets affluent travelers and business guests.',
      displayType: 'digital_screen',
      pricePerDay: 6000,
      pricePerMonth: 180000,
      dailyImpressions: 2500,
      monthlyFootfall: 75000,
      latitude: 12.9716,
      longitude: 77.5946
    },
    {
      title: 'Hotel Elevator Display',
      description: 'Digital screen in hotel elevators. Captive audience with high dwell time.',
      displayType: 'digital_screen',
      pricePerDay: 4000,
      pricePerMonth: 120000,
      dailyImpressions: 2000,
      monthlyFootfall: 60000,
      latitude: 12.9352,
      longitude: 77.6245
    }
  ],
  'Mall': [
    {
      title: 'Mall Atrium Digital Display',
      description: 'Large format digital screen in shopping mall atrium. Maximum visibility for shoppers.',
      displayType: 'digital_screen',
      pricePerDay: 10000,
      pricePerMonth: 300000,
      dailyImpressions: 15000,
      monthlyFootfall: 450000,
      latitude: 12.9716,
      longitude: 77.5946
    },
    {
      title: 'Mall Food Court Banner',
      description: 'Strategic banner placement in mall food court. High footfall area with extended dwell time.',
      displayType: 'vinyl_banner',
      pricePerDay: 7000,
      pricePerMonth: 210000,
      dailyImpressions: 12000,
      monthlyFootfall: 360000,
      latitude: 12.9352,
      longitude: 77.6245
    }
  ],
  'Metro': [
    {
      title: 'Metro Station Platform Display',
      description: 'Digital display on metro station platform. High visibility for commuters.',
      displayType: 'digital_screen',
      pricePerDay: 15000,
      pricePerMonth: 450000,
      dailyImpressions: 20000,
      monthlyFootfall: 600000,
      latitude: 12.9716,
      longitude: 77.5946
    },
    {
      title: 'Metro Train Interior Display',
      description: 'Digital screen inside metro trains. Captive audience during commute.',
      displayType: 'digital_screen',
      pricePerDay: 12000,
      pricePerMonth: 360000,
      dailyImpressions: 18000,
      monthlyFootfall: 540000,
      latitude: 12.9352,
      longitude: 77.6245
    }
  ],
  'Office Tower': [
    {
      title: 'Office Tower Lobby Display',
      description: 'Premium digital display in office tower lobby. Targets working professionals.',
      displayType: 'digital_screen',
      pricePerDay: 5500,
      pricePerMonth: 165000,
      dailyImpressions: 3000,
      monthlyFootfall: 90000,
      latitude: 12.9716,
      longitude: 77.5946
    },
    {
      title: 'Office Building Elevator Display',
      description: 'Digital screen in office building elevators. High frequency exposure for employees.',
      displayType: 'digital_screen',
      pricePerDay: 3800,
      pricePerMonth: 114000,
      dailyImpressions: 2500,
      monthlyFootfall: 75000,
      latitude: 12.9352,
      longitude: 77.6245
    }
  ],
  'Restaurant': [
    {
      title: 'Restaurant Table Top Display',
      description: 'Digital display on restaurant tables. High engagement during dining experience.',
      displayType: 'digital_screen',
      pricePerDay: 3000,
      pricePerMonth: 90000,
      dailyImpressions: 2000,
      monthlyFootfall: 60000,
      latitude: 12.9716,
      longitude: 77.5946
    },
    {
      title: 'Restaurant Entrance Banner',
      description: 'Banner display at restaurant entrance. First impression for diners.',
      displayType: 'vinyl_banner',
      pricePerDay: 2000,
      pricePerMonth: 60000,
      dailyImpressions: 1500,
      monthlyFootfall: 45000,
      latitude: 12.9352,
      longitude: 77.6245
    }
  ]
};

async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch categories');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('❌ Error fetching categories:', error.message);
    throw error;
  }
}

async function createAdSpace(adSpaceData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ad-spaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adSpaceData)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || result.details || 'Failed to create ad space');
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Error creating ad space:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting ad space creation via API...\n');
  console.log(`📡 API Base URL: ${API_BASE_URL}\n`);
  
  // Fetch all categories
  console.log('📋 Fetching categories...');
  const allCategories = await fetchCategories();
  console.log(`✅ Found ${allCategories.length} categories\n`);
  
  // Filter target categories
  const targetCategoryMap = {};
  for (const categoryName of TARGET_CATEGORIES) {
    const category = allCategories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    if (category) {
      targetCategoryMap[categoryName] = category;
      console.log(`✅ Found category: ${categoryName} (ID: ${category.id})`);
    } else {
      console.log(`⚠️  Category not found: ${categoryName}`);
    }
  }
  
  console.log(`\n📊 Creating ad spaces for ${Object.keys(targetCategoryMap).length} categories...\n`);
  
  let totalCreated = 0;
  let totalFailed = 0;
  
  // Create ad spaces for each category
  for (const [categoryName, category] of Object.entries(targetCategoryMap)) {
    const templates = AD_SPACE_TEMPLATES[categoryName] || [];
    
    console.log(`\n📦 Creating ad spaces for: ${categoryName}`);
    
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const adSpaceData = {
        ...template,
        categoryId: category.id,
        images: [],
        dimensions: { width: 1920, height: 1080 },
        availabilityStatus: 'available'
      };
      
      try {
        const created = await createAdSpace(adSpaceData);
        console.log(`  ✅ Created: ${created.title}`);
        totalCreated++;
      } catch (error) {
        console.log(`  ❌ Failed: ${template.title} - ${error.message}`);
        totalFailed++;
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`\n\n📊 Summary:`);
  console.log(`  ✅ Successfully created: ${totalCreated} ad spaces`);
  console.log(`  ❌ Failed: ${totalFailed} ad spaces`);
  console.log(`\n✨ Done!`);
}

// Run the script
main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

