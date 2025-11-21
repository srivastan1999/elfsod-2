const SUPABASE_URL = 'https://zcqqfkuezoxumchbslqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXFma3Vlem94dW1jaGJzbHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzQzMzEsImV4cCI6MjA0ODIxMDMzMX0.uGXyKBQNvSQZ0WtJTK-oM2FgODTj1-IA8PvxqvbuVU8';

async function createAdSpaces() {
  // Sample ad spaces data
  const adSpaces = [
    // Billboards
    {
      title: 'Premium Billboard - MG Road',
      location: { city: 'Bengaluru', area: 'MG Road', address: 'Near Trinity Metro Station' },
      category_name: 'Billboards',
      price_per_day: 8000,
      daily_impressions: 50000,
      display_type: 'static',
      dimensions: { width: 20, height: 10, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      availability_status: 'available'
    },
    {
      title: 'Highway Billboard - NH8',
      location: { city: 'Delhi', area: 'Mahipalpur', address: 'NH8 Highway' },
      category_name: 'Billboards',
      price_per_day: 12000,
      daily_impressions: 80000,
      display_type: 'static',
      dimensions: { width: 30, height: 15, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800',
      availability_status: 'available'
    },
    {
      title: 'Digital Billboard - BKC',
      location: { city: 'Mumbai', area: 'Bandra Kurla Complex', address: 'BKC Main Road' },
      category_name: 'Billboards',
      price_per_day: 15000,
      daily_impressions: 100000,
      display_type: 'digital',
      dimensions: { width: 25, height: 12, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1551039899-8c89f27e9b7c?w=800',
      availability_status: 'available'
    },

    // Auto Rickshaws
    {
      title: 'Auto Rickshaw Branding - Premium Fleet',
      location: { city: 'Mumbai', area: 'Andheri', address: 'Andheri West Zone' },
      category_name: 'Auto Rickshaw Advertising',
      price_per_day: 2000,
      daily_impressions: 15000,
      display_type: 'static',
      dimensions: { width: 4, height: 3, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800',
      availability_status: 'available'
    },
    {
      title: 'Auto Rickshaw Back Panel - Tech Park Route',
      location: { city: 'Bengaluru', area: 'Whitefield', address: 'Tech Park Area' },
      category_name: 'Auto Rickshaw Advertising',
      price_per_day: 1500,
      daily_impressions: 12000,
      display_type: 'static',
      dimensions: { width: 3, height: 2, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800',
      availability_status: 'available'
    },
    {
      title: 'Auto Rickshaw Hood - Airport Route',
      location: { city: 'Delhi', area: 'Aerocity', address: 'Airport Express Route' },
      category_name: 'Auto Rickshaw Advertising',
      price_per_day: 2500,
      daily_impressions: 20000,
      display_type: 'static',
      dimensions: { width: 3, height: 2, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1595496001974-7c31881e6f6e?w=800',
      availability_status: 'available'
    },

    // Bus Shelters
    {
      title: 'Bus Shelter - Connaught Place',
      location: { city: 'Delhi', area: 'Connaught Place', address: 'CP Metro Station' },
      category_name: 'Bus Shelter Advertising',
      price_per_day: 5000,
      daily_impressions: 30000,
      display_type: 'static',
      dimensions: { width: 8, height: 6, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
      availability_status: 'available'
    },
    {
      title: 'Bus Shelter - Marine Drive',
      location: { city: 'Mumbai', area: 'Marine Drive', address: 'Near Oberoi Hotel' },
      category_name: 'Bus Shelter Advertising',
      price_per_day: 6000,
      daily_impressions: 35000,
      display_type: 'backlit',
      dimensions: { width: 10, height: 6, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1588534943359-a6c2f0d4e2f8?w=800',
      availability_status: 'available'
    },

    // Metro Stations
    {
      title: 'Metro Station Pillar - Rajiv Chowk',
      location: { city: 'Delhi', area: 'Connaught Place', address: 'Rajiv Chowk Metro Station' },
      category_name: 'Metro Advertising',
      price_per_day: 7000,
      daily_impressions: 60000,
      display_type: 'static',
      dimensions: { width: 6, height: 12, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
      availability_status: 'available'
    },
    {
      title: 'Metro Train Wrap - Blue Line',
      location: { city: 'Delhi', area: 'All Stations', address: 'Blue Line Metro' },
      category_name: 'Metro Advertising',
      price_per_day: 25000,
      daily_impressions: 150000,
      display_type: 'vinyl_wrap',
      dimensions: { width: 50, height: 8, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800',
      availability_status: 'available'
    },

    // Digital Screens
    {
      title: 'LED Screen - Shopping Mall',
      location: { city: 'Bengaluru', area: 'Indiranagar', address: 'Garuda Mall' },
      category_name: 'Digital Screens',
      price_per_day: 10000,
      daily_impressions: 45000,
      display_type: 'led',
      dimensions: { width: 15, height: 8, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      availability_status: 'available'
    },
    {
      title: 'Digital Screen - Tech Park Lobby',
      location: { city: 'Pune', area: 'Hinjewadi', address: 'Tech Park Phase 1' },
      category_name: 'Digital Screens',
      price_per_day: 8000,
      daily_impressions: 25000,
      display_type: 'digital',
      dimensions: { width: 12, height: 7, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800',
      availability_status: 'available'
    },

    // Mall Displays
    {
      title: 'Mall Atrium Display - Phoenix Market City',
      location: { city: 'Mumbai', area: 'Kurla', address: 'Phoenix Market City Mall' },
      category_name: 'Mall Advertising',
      price_per_day: 12000,
      daily_impressions: 55000,
      display_type: 'standee',
      dimensions: { width: 10, height: 8, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800',
      availability_status: 'available'
    },
    {
      title: 'Mall Escalator Branding',
      location: { city: 'Bengaluru', area: 'Koramangala', address: 'Forum Mall' },
      category_name: 'Mall Advertising',
      price_per_day: 9000,
      daily_impressions: 40000,
      display_type: 'vinyl',
      dimensions: { width: 8, height: 15, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1578736641330-3155e606cd40?w=800',
      availability_status: 'available'
    },

    // Cinema Halls
    {
      title: 'Cinema Screen Advertising - INOX',
      location: { city: 'Mumbai', area: 'Andheri', address: 'INOX R City Mall' },
      category_name: 'Cinema Advertising',
      price_per_day: 15000,
      daily_impressions: 8000,
      display_type: 'on_screen',
      dimensions: { width: 40, height: 20, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
      availability_status: 'available'
    },
    {
      title: 'Cinema Lobby Standee - PVR',
      location: { city: 'Delhi', area: 'Saket', address: 'PVR Select City Walk' },
      category_name: 'Cinema Advertising',
      price_per_day: 6000,
      daily_impressions: 12000,
      display_type: 'standee',
      dimensions: { width: 5, height: 8, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800',
      availability_status: 'available'
    },

    // Airport Advertising
    {
      title: 'Airport Terminal Display - Arrivals',
      location: { city: 'Mumbai', area: 'Andheri East', address: 'Mumbai Airport T2 Arrivals' },
      category_name: 'Airport Advertising',
      price_per_day: 20000,
      daily_impressions: 75000,
      display_type: 'digital',
      dimensions: { width: 20, height: 10, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
      availability_status: 'available'
    },
    {
      title: 'Airport Baggage Carousel Branding',
      location: { city: 'Bengaluru', area: 'Devanahalli', address: 'Kempegowda Airport' },
      category_name: 'Airport Advertising',
      price_per_day: 18000,
      daily_impressions: 60000,
      display_type: 'vinyl',
      dimensions: { width: 15, height: 5, unit: 'ft' },
      image_url: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=800',
      availability_status: 'available'
    }
  ];

  console.log('🚀 Starting to create ad spaces...\n');

  for (let i = 0; i < adSpaces.length; i++) {
    const space = adSpaces[i];
    console.log(`Creating ${i + 1}/${adSpaces.length}: ${space.title}...`);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ad_spaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(space)
      });

      if (response.ok) {
        console.log(`✅ Created: ${space.title}`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed: ${space.title} - ${error}`);
      }
    } catch (error) {
      console.log(`❌ Error creating ${space.title}:`, error.message);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✨ Done! Created ad spaces.');
}

createAdSpaces();

