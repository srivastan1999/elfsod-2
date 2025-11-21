/**
 * Script to add 20 billboard ad spaces per city using Admin API
 * Run: node add_20_billboards_per_city.js
 * 
 * Configuration:
 * - Set ADMIN_PORTAL_URL to use admin portal API (default: http://localhost:3001)
 * - Set FRONTEND_URL to use frontend API (default: http://localhost:3000)
 * - Set ADMIN_TOKEN if using token-based auth
 * 
 * Note: Admin portal uses session-based auth (cookies), so you may need to:
 * 1. Log in to admin portal first (http://localhost:3001/auth/signin)
 * 2. Copy the session cookie from browser
 * 3. Or use the frontend API if it supports admin operations
 */

// Use admin portal API by default (runs on port 3001)
const ADMIN_PORTAL_URL = process.env.ADMIN_PORTAL_URL || 'http://localhost:3001';
// Fallback to frontend API
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
// Use admin portal by default, set USE_FRONTEND_API=true to use frontend
const USE_FRONTEND_API = process.env.USE_FRONTEND_API === 'true';
const API_BASE_URL = USE_FRONTEND_API ? FRONTEND_URL : ADMIN_PORTAL_URL;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null;

// Helper function to generate target audience description
function getTargetAudience(city, locationType) {
  const baseAudience = `Targeting professionals, commuters, and residents in ${city}. Ideal for brands looking to reach a diverse demographic including working professionals, students, families, and local businesses. High visibility ensures maximum brand recall and engagement.`;
  
  const locationSpecific = {
    'Metro Station': 'Perfect for reaching daily commuters, office-goers, and students. High footfall during peak hours (7-10 AM, 5-8 PM). Demographics: 25-45 years, middle to upper-middle class, tech-savvy professionals.',
    'Flyover': 'Excellent for capturing highway traffic and long-distance commuters. Reaches vehicle owners, business travelers, and inter-city travelers. Demographics: 30-55 years, upper-middle to high-income groups.',
    'Main Road': 'Ideal for local residents, shop owners, and daily commuters. High visibility throughout the day. Demographics: 20-50 years, diverse income groups, local business owners.',
    'Junction': 'Strategic location capturing traffic from multiple directions. Reaches commuters, local residents, and visitors. Demographics: 25-50 years, mixed income groups.',
    'Railway Station': 'Perfect for reaching travelers, daily commuters, and visitors. High footfall throughout the day. Demographics: 18-60 years, diverse income and age groups.',
    'Airport Road': 'Premium location for reaching business travelers, tourists, and high-income professionals. Demographics: 30-60 years, upper-middle to high-income groups.',
    'Area': 'Local landmark location with high tourist and local footfall. Reaches visitors, residents, and businesses. Demographics: 18-55 years, diverse groups.'
  };
  
  for (const [key, desc] of Object.entries(locationSpecific)) {
    if (locationType.includes(key)) {
      return `${baseAudience} ${desc}`;
    }
  }
  
  return baseAudience;
}

// 20 locations and billboards for Hyderabad
const hyderabadData = [
  { title: 'Madhapur Metro Station', address: 'Madhapur Metro Station, Hyderabad', lat: 17.4504, lng: 78.3912, priceDay: 7500, priceMonth: 220000, impressions: 14000, footfall: 420000, width: 18, height: 36, audience: getTargetAudience('Hyderabad', 'Metro Station') },
  { title: 'Begumpet Flyover', address: 'Begumpet Flyover, Hyderabad', lat: 17.4448, lng: 78.4608, priceDay: 6000, priceMonth: 180000, impressions: 12000, footfall: 320000, width: 15, height: 25, audience: getTargetAudience('Hyderabad', 'Flyover') },
  { title: 'Kukatpally Main Road', address: 'Kukatpally Main Road, Hyderabad', lat: 17.4948, lng: 78.3991, priceDay: 5000, priceMonth: 155000, impressions: 10500, footfall: 315000, width: 14, height: 28, audience: getTargetAudience('Hyderabad', 'Main Road') },
  { title: 'Hitech City Junction', address: 'Hitech City Junction, Hyderabad', lat: 17.4486, lng: 78.3908, priceDay: 8000, priceMonth: 240000, impressions: 15000, footfall: 450000, width: 20, height: 40, audience: getTargetAudience('Hyderabad', 'Junction') },
  { title: 'Banjara Hills Road', address: 'Banjara Hills Road, Hyderabad', lat: 17.4239, lng: 78.4318, priceDay: 7200, priceMonth: 210000, impressions: 13500, footfall: 405000, width: 18, height: 35, audience: getTargetAudience('Hyderabad', 'Main Road') },
  { title: 'Jubilee Hills Checkpost', address: 'Jubilee Hills Checkpost, Hyderabad', lat: 17.4250, lng: 78.4083, priceDay: 6800, priceMonth: 200000, impressions: 12800, footfall: 384000, width: 17, height: 33, audience: getTargetAudience('Hyderabad', 'Junction') },
  { title: 'Gachibowli Main Road', address: 'Gachibowli Main Road, Hyderabad', lat: 17.4340, lng: 78.3490, priceDay: 6500, priceMonth: 195000, impressions: 12200, footfall: 366000, width: 16, height: 32, audience: getTargetAudience('Hyderabad', 'Main Road') },
  { title: 'Secunderabad Railway Station', address: 'Secunderabad Railway Station, Hyderabad', lat: 17.4399, lng: 78.4983, priceDay: 7800, priceMonth: 230000, impressions: 14500, footfall: 435000, width: 19, height: 38, audience: getTargetAudience('Hyderabad', 'Railway Station') },
  { title: 'Abids Circle', address: 'Abids Circle, Hyderabad', lat: 17.3850, lng: 78.4867, priceDay: 7000, priceMonth: 205000, impressions: 13200, footfall: 396000, width: 17, height: 34, audience: getTargetAudience('Hyderabad', 'Junction') },
  { title: 'Panjagutta Junction', address: 'Panjagutta Junction, Hyderabad', lat: 17.4283, lng: 78.4492, priceDay: 6600, priceMonth: 190000, impressions: 12400, footfall: 372000, width: 16, height: 31, audience: getTargetAudience('Hyderabad', 'Junction') },
  { title: 'Kondapur Main Road', address: 'Kondapur Main Road, Hyderabad', lat: 17.4842, lng: 78.3894, priceDay: 5800, priceMonth: 170000, impressions: 11000, footfall: 330000, width: 15, height: 29, audience: getTargetAudience('Hyderabad', 'Main Road') },
  { title: 'Ameerpet Metro Station', address: 'Ameerpet Metro Station, Hyderabad', lat: 17.4326, lng: 78.4481, priceDay: 6400, priceMonth: 188000, impressions: 12000, footfall: 360000, width: 16, height: 30, audience: getTargetAudience('Hyderabad', 'Metro Station') },
  { title: 'Tarnaka Junction', address: 'Tarnaka Junction, Hyderabad', lat: 17.4156, lng: 78.5283, priceDay: 5500, priceMonth: 160000, impressions: 10300, footfall: 309000, width: 14, height: 27, audience: getTargetAudience('Hyderabad', 'Junction') },
  { title: 'LB Nagar Metro Station', address: 'LB Nagar Metro Station, Hyderabad', lat: 17.3476, lng: 78.5575, priceDay: 5200, priceMonth: 150000, impressions: 9800, footfall: 294000, width: 13, height: 26, audience: getTargetAudience('Hyderabad', 'Metro Station') },
  { title: 'Dilsukhnagar Main Road', address: 'Dilsukhnagar Main Road, Hyderabad', lat: 17.3650, lng: 78.5267, priceDay: 5400, priceMonth: 158000, impressions: 10100, footfall: 303000, width: 14, height: 27, audience: getTargetAudience('Hyderabad', 'Main Road') },
  { title: 'Mehdipatnam Circle', address: 'Mehdipatnam Circle, Hyderabad', lat: 17.3844, lng: 78.4481, priceDay: 6200, priceMonth: 182000, impressions: 11600, footfall: 348000, width: 15, height: 30, audience: getTargetAudience('Hyderabad', 'Junction') },
  { title: 'Malakpet Junction', address: 'Malakpet Junction, Hyderabad', lat: 17.3714, lng: 78.5081, priceDay: 5100, priceMonth: 148000, impressions: 9600, footfall: 288000, width: 13, height: 25, audience: getTargetAudience('Hyderabad', 'Junction') },
  { title: 'Nampally Station Road', address: 'Nampally Station Road, Hyderabad', lat: 17.3850, lng: 78.4733, priceDay: 6900, priceMonth: 202000, impressions: 13000, footfall: 390000, width: 17, height: 34, audience: getTargetAudience('Hyderabad', 'Railway Station') },
  { title: 'Charminar Area', address: 'Charminar Area, Hyderabad', lat: 17.3616, lng: 78.4747, priceDay: 7100, priceMonth: 208000, impressions: 13300, footfall: 399000, width: 18, height: 35, audience: getTargetAudience('Hyderabad', 'Area') },
  { title: 'Rajiv Gandhi International Airport Road', address: 'Rajiv Gandhi International Airport Road, Hyderabad', lat: 17.2403, lng: 78.4294, priceDay: 8500, priceMonth: 250000, impressions: 16000, footfall: 480000, width: 21, height: 42, audience: getTargetAudience('Hyderabad', 'Airport Road') }
];

// 20 locations and billboards for Mumbai
const mumbaiData = [
  { title: 'Andheri East', address: 'Andheri East, Mumbai', lat: 19.1197, lng: 72.8694, priceDay: 6800, priceMonth: 180000, impressions: 11600, footfall: 348000, width: 16, height: 30, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Bandra Kurla Complex', address: 'Bandra Kurla Complex, Mumbai', lat: 19.0760, lng: 72.8777, priceDay: 9000, priceMonth: 270000, impressions: 17000, footfall: 510000, width: 22, height: 44, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Marine Drive', address: 'Marine Drive, Mumbai', lat: 18.9432, lng: 72.8236, priceDay: 8500, priceMonth: 255000, impressions: 16000, footfall: 480000, width: 20, height: 40, audience: getTargetAudience('Mumbai', 'Main Road') },
  { title: 'Worli Sea Face', address: 'Worli Sea Face, Mumbai', lat: 19.0000, lng: 72.8167, priceDay: 8200, priceMonth: 245000, impressions: 15400, footfall: 462000, width: 20, height: 39, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Juhu Beach Road', address: 'Juhu Beach Road, Mumbai', lat: 19.0974, lng: 72.8262, priceDay: 7800, priceMonth: 230000, impressions: 14600, footfall: 438000, width: 19, height: 38, audience: getTargetAudience('Mumbai', 'Main Road') },
  { title: 'Powai Lake Area', address: 'Powai Lake Area, Mumbai', lat: 19.1200, lng: 72.9100, priceDay: 7200, priceMonth: 215000, impressions: 13500, footfall: 405000, width: 18, height: 36, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Kurla Station', address: 'Kurla Station, Mumbai', lat: 19.0883, lng: 72.8895, priceDay: 7000, priceMonth: 210000, impressions: 13200, footfall: 396000, width: 17, height: 34, audience: getTargetAudience('Mumbai', 'Railway Station') },
  { title: 'Vashi Bridge', address: 'Vashi Bridge, Mumbai', lat: 19.0800, lng: 72.9983, priceDay: 7500, priceMonth: 225000, impressions: 14100, footfall: 423000, width: 18, height: 37, audience: getTargetAudience('Mumbai', 'Flyover') },
  { title: 'Bandra West', address: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295, priceDay: 8800, priceMonth: 264000, impressions: 16500, footfall: 495000, width: 21, height: 42, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Lower Parel', address: 'Lower Parel, Mumbai', lat: 19.0169, lng: 72.8331, priceDay: 8000, priceMonth: 240000, impressions: 15000, footfall: 450000, width: 20, height: 40, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Santacruz East', address: 'Santacruz East, Mumbai', lat: 19.0819, lng: 72.8567, priceDay: 7400, priceMonth: 222000, impressions: 13900, footfall: 417000, width: 18, height: 36, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Goregaon East', address: 'Goregaon East, Mumbai', lat: 19.1525, lng: 72.8575, priceDay: 6600, priceMonth: 198000, impressions: 12400, footfall: 372000, width: 16, height: 32, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Malad West', address: 'Malad West, Mumbai', lat: 19.1861, lng: 72.8486, priceDay: 6400, priceMonth: 192000, impressions: 12000, footfall: 360000, width: 16, height: 31, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Borivali East', address: 'Borivali East, Mumbai', lat: 19.2306, lng: 72.8606, priceDay: 6200, priceMonth: 186000, impressions: 11600, footfall: 348000, width: 15, height: 30, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Dadar Station', address: 'Dadar Station, Mumbai', lat: 19.0176, lng: 72.8562, priceDay: 7600, priceMonth: 228000, impressions: 14300, footfall: 429000, width: 19, height: 38, audience: getTargetAudience('Mumbai', 'Railway Station') },
  { title: 'Churchgate', address: 'Churchgate, Mumbai', lat: 18.9400, lng: 72.8250, priceDay: 8700, priceMonth: 261000, impressions: 16300, footfall: 489000, width: 21, height: 41, audience: getTargetAudience('Mumbai', 'Railway Station') },
  { title: 'Colaba Causeway', address: 'Colaba Causeway, Mumbai', lat: 18.9150, lng: 72.8325, priceDay: 8400, priceMonth: 252000, impressions: 15800, footfall: 474000, width: 20, height: 40, audience: getTargetAudience('Mumbai', 'Main Road') },
  { title: 'Andheri West', address: 'Andheri West, Mumbai', lat: 19.1136, lng: 72.8697, priceDay: 7100, priceMonth: 213000, impressions: 13350, footfall: 400500, width: 18, height: 35, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Vile Parle East', address: 'Vile Parle East, Mumbai', lat: 19.0992, lng: 72.8433, priceDay: 7300, priceMonth: 219000, impressions: 13700, footfall: 411000, width: 18, height: 36, audience: getTargetAudience('Mumbai', 'Area') },
  { title: 'Chembur', address: 'Chembur, Mumbai', lat: 19.0519, lng: 72.9000, priceDay: 6800, priceMonth: 204000, impressions: 12800, footfall: 384000, width: 16, height: 32, audience: getTargetAudience('Mumbai', 'Area') }
];

// 20 locations and billboards for Delhi
const delhiData = [
  { title: 'Saket Metro', address: 'Saket Metro, Delhi', lat: 28.5236, lng: 77.2193, priceDay: 7200, priceMonth: 200000, impressions: 13500, footfall: 405000, width: 17, height: 32, audience: getTargetAudience('Delhi', 'Metro Station') },
  { title: 'Connaught Place', address: 'Connaught Place, Delhi', lat: 28.6315, lng: 77.2167, priceDay: 9500, priceMonth: 285000, impressions: 17800, footfall: 534000, width: 23, height: 46, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Aerocity', address: 'Aerocity, Delhi', lat: 28.5562, lng: 77.1180, priceDay: 8800, priceMonth: 264000, impressions: 16500, footfall: 495000, width: 21, height: 42, audience: getTargetAudience('Delhi', 'Airport Road') },
  { title: 'Rajiv Chowk Metro', address: 'Rajiv Chowk Metro, Delhi', lat: 28.6328, lng: 77.2197, priceDay: 9200, priceMonth: 276000, impressions: 17300, footfall: 519000, width: 22, height: 44, audience: getTargetAudience('Delhi', 'Metro Station') },
  { title: 'Gurgaon Sector 29', address: 'Gurgaon Sector 29, Delhi', lat: 28.4595, lng: 77.0266, priceDay: 8000, priceMonth: 240000, impressions: 15000, footfall: 450000, width: 20, height: 40, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Dwarka Sector 21', address: 'Dwarka Sector 21, Delhi', lat: 28.5925, lng: 77.0475, priceDay: 7500, priceMonth: 225000, impressions: 14100, footfall: 423000, width: 18, height: 37, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Rohini Sector 18', address: 'Rohini Sector 18, Delhi', lat: 28.7431, lng: 77.0864, priceDay: 7000, priceMonth: 210000, impressions: 13200, footfall: 396000, width: 17, height: 34, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Pitampura', address: 'Pitampura, Delhi', lat: 28.6964, lng: 77.1331, priceDay: 6800, priceMonth: 204000, impressions: 12800, footfall: 384000, width: 16, height: 32, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Karol Bagh', address: 'Karol Bagh, Delhi', lat: 28.6514, lng: 77.1903, priceDay: 7400, priceMonth: 222000, impressions: 13900, footfall: 417000, width: 18, height: 36, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Lajpat Nagar', address: 'Lajpat Nagar, Delhi', lat: 28.5675, lng: 77.2431, priceDay: 7200, priceMonth: 216000, impressions: 13500, footfall: 405000, width: 17, height: 34, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Greater Kailash', address: 'Greater Kailash, Delhi', lat: 28.5500, lng: 77.2500, priceDay: 7800, priceMonth: 234000, impressions: 14600, footfall: 438000, width: 19, height: 38, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Vasant Kunj', address: 'Vasant Kunj, Delhi', lat: 28.5236, lng: 77.1528, priceDay: 7600, priceMonth: 228000, impressions: 14300, footfall: 429000, width: 18, height: 37, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Janakpuri', address: 'Janakpuri, Delhi', lat: 28.6250, lng: 77.0819, priceDay: 7100, priceMonth: 213000, impressions: 13350, footfall: 400500, width: 17, height: 35, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Noida Sector 18', address: 'Noida Sector 18, Delhi', lat: 28.5700, lng: 77.3200, priceDay: 7500, priceMonth: 225000, impressions: 14100, footfall: 423000, width: 18, height: 36, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Indirapuram', address: 'Indirapuram, Delhi', lat: 28.6417, lng: 77.3714, priceDay: 7300, priceMonth: 219000, impressions: 13700, footfall: 411000, width: 18, height: 35, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Vaishali', address: 'Vaishali, Delhi', lat: 28.6500, lng: 77.3500, priceDay: 7000, priceMonth: 210000, impressions: 13200, footfall: 396000, width: 17, height: 34, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Rajouri Garden', address: 'Rajouri Garden, Delhi', lat: 28.6500, lng: 77.1167, priceDay: 7400, priceMonth: 222000, impressions: 13900, footfall: 417000, width: 18, height: 36, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Paschim Vihar', address: 'Paschim Vihar, Delhi', lat: 28.6833, lng: 77.0833, priceDay: 6900, priceMonth: 207000, impressions: 12950, footfall: 388500, width: 17, height: 33, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Rohini Sector 3', address: 'Rohini Sector 3, Delhi', lat: 28.7333, lng: 77.0833, priceDay: 6700, priceMonth: 201000, impressions: 12600, footfall: 378000, width: 16, height: 32, audience: getTargetAudience('Delhi', 'Area') },
  { title: 'Shahdara', address: 'Shahdara, Delhi', lat: 28.6667, lng: 77.2833, priceDay: 6500, priceMonth: 195000, impressions: 12200, footfall: 366000, width: 16, height: 31, audience: getTargetAudience('Delhi', 'Area') }
];

async function findOrCreateCategory(categoryName) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (ADMIN_TOKEN) {
      headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      headers: headers
    });
    const result = await response.json();
    
    // Admin portal returns { success: true, categories: [...] }
    // Frontend API returns { success: true, data: [...] }
    const categories = result.categories || result.data || [];
    
    if (result.success && categories.length > 0) {
      const existing = categories.find(cat => 
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

async function findOrCreateLocation(locationData, city, state, token) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Try to find existing location using admin portal API
    // First check if admin portal has locations endpoint, if not use direct Supabase
    try {
      // Try admin portal locations API
      const adminLocationsResponse = await fetch(`${API_BASE_URL}/api/locations?city=${encodeURIComponent(city)}`, {
        headers: headers
      });
      
      if (adminLocationsResponse.ok) {
        const adminResult = await adminLocationsResponse.json();
        const locations = adminResult.data || adminResult.locations || [];
        if (locations.length > 0) {
          const existing = locations.find(loc => 
            loc.address === locationData.address || 
            (Math.abs(loc.latitude - locationData.lat) < 0.001 && Math.abs(loc.longitude - locationData.lng) < 0.001)
          );
          if (existing) {
            console.log(`  ✅ Location found: ${locationData.address} (ID: ${existing.id})`);
            return existing.id;
          }
        }
      }
    } catch (e) {
      // Admin portal might not have locations endpoint, continue
    }
    
    // For now, skip location creation and create ad space without location_id
    // The admin API should handle this for static billboards
    console.log(`  ⚠️  Location not found, will create ad space without location_id`);
    return null; // Return null to indicate no location, but we'll still try to create ad space
  } catch (error) {
    console.error(`  ❌ Error with location: ${error.message}`);
    return null;
  }
}

async function createAdSpaceViaAdminAPI(adSpaceData, categoryId, locationId, token) {
  try {
    const payload = {
      title: adSpaceData.title,
      description: `Premium static billboard at ${adSpaceData.title}. High visibility location with excellent footfall.`,
      categoryId: categoryId,
      displayType: 'static_billboard',
      pricePerDay: adSpaceData.priceDay,
      pricePerMonth: adSpaceData.priceMonth,
      dailyImpressions: adSpaceData.impressions,
      monthlyFootfall: adSpaceData.footfall,
      latitude: adSpaceData.lat,
      longitude: adSpaceData.lng,
      images: [`https://vavubezjuqnkrvndtowt.supabase.co/storage/v1/object/public/City_icons/10.png`],
      dimensions: {
        width: adSpaceData.width,
        height: adSpaceData.height
      },
      availabilityStatus: 'available',
      targetAudience: adSpaceData.audience || null
    };
    
    // Only add locationId if we have one
    if (locationId) {
      payload.locationId = locationId;
    }
    
    // Use admin API endpoint
    const adminEndpoint = `${API_BASE_URL}/api/ad-spaces`;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Admin portal uses session-based auth (cookies), but we can try token if provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(adminEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      credentials: 'include' // Important: Include cookies for session-based auth
    });
    
    const result = await response.json();
    
    if (result.success || result.adSpace) {
      return result.adSpace || result.data;
    } else {
      // Provide helpful error message
      const errorMsg = result.error || result.details || 'Failed to create ad space';
      if (response.status === 401) {
        throw new Error(`${errorMsg} - Authentication required. Make sure you're logged in to admin portal or provide ADMIN_TOKEN.`);
      }
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error(`  ❌ Error creating ad space "${adSpaceData.title}":`, error.message);
    throw error;
  }
}

async function processCity(cityName, state, cityData, categoryId, token) {
  console.log(`\n🏙️  Processing ${cityName} (${cityData.length} billboards)...`);
  console.log('=' .repeat(60));
  
  let created = 0;
  let failed = 0;
  
  for (let i = 0; i < cityData.length; i++) {
    const data = cityData[i];
    try {
      console.log(`\n[${i + 1}/${cityData.length}] 📦 Processing: ${data.title}`);
      
      // Find or create location (optional - ad space can be created without location)
      const locationId = await findOrCreateLocation(data, cityName, state, token);
      
      // Create ad space via admin API (locationId is optional for static billboards)
      const createdSpace = await createAdSpaceViaAdminAPI(data, categoryId, locationId, token);
      console.log(`  ✅ Created: ${createdSpace.title || data.title} (ID: ${createdSpace.id || 'N/A'})`);
      created++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      failed++;
    }
  }
  
  return { created, failed };
}

async function main() {
  console.log('🚀 Starting to add 20 billboard ad spaces per city via Admin API...\n');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log(`📋 Using: ${USE_FRONTEND_API ? 'Frontend API' : 'Admin Portal API'}\n`);
  
  if (!ADMIN_TOKEN) {
    console.log('⚠️  ADMIN_TOKEN not set.');
    if (!USE_FRONTEND_API) {
      console.log('   Admin Portal uses session-based auth (cookies).');
      console.log('   Make sure you are logged in to the admin portal first.');
      console.log('   Or set ADMIN_TOKEN environment variable if using token-based auth.\n');
    } else {
      console.log('   Set ADMIN_TOKEN environment variable or update the script with your token.\n');
    }
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
  
  const results = {
    hyderabad: { created: 0, failed: 0 },
    mumbai: { created: 0, failed: 0 },
    delhi: { created: 0, failed: 0 }
  };
  
  // Process Hyderabad
  const hydResult = await processCity('Hyderabad', 'Telangana', hyderabadData, categoryId, ADMIN_TOKEN);
  results.hyderabad = hydResult;
  
  // Process Mumbai
  const mumResult = await processCity('Mumbai', 'Maharashtra', mumbaiData, categoryId, ADMIN_TOKEN);
  results.mumbai = mumResult;
  
  // Process Delhi
  const delResult = await processCity('Delhi', 'Delhi', delhiData, categoryId, ADMIN_TOKEN);
  results.delhi = delResult;
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n🏙️  Hyderabad:`);
  console.log(`  ✅ Successfully created: ${results.hyderabad.created} ad spaces`);
  console.log(`  ❌ Failed: ${results.hyderabad.failed} ad spaces`);
  
  console.log(`\n🏙️  Mumbai:`);
  console.log(`  ✅ Successfully created: ${results.mumbai.created} ad spaces`);
  console.log(`  ❌ Failed: ${results.mumbai.failed} ad spaces`);
  
  console.log(`\n🏙️  Delhi:`);
  console.log(`  ✅ Successfully created: ${results.delhi.created} ad spaces`);
  console.log(`  ❌ Failed: ${results.delhi.failed} ad spaces`);
  
  const totalCreated = results.hyderabad.created + results.mumbai.created + results.delhi.created;
  const totalFailed = results.hyderabad.failed + results.mumbai.failed + results.delhi.failed;
  
  console.log(`\n📈 TOTAL:`);
  console.log(`  ✅ Successfully created: ${totalCreated} ad spaces`);
  console.log(`  ❌ Failed: ${totalFailed} ad spaces`);
  console.log(`\n✨ Done!`);
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

