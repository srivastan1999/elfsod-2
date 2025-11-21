# Create Ad Space API - Documentation

## Endpoint
**POST** `/api/ad-spaces`

## Description
Create a new ad space card and link it with a category.

## Request Body

### Required Fields
- `title` (string): Title of the ad space
- `description` (string): Description of the ad space
- `categoryId` (string, UUID): ID of the category to link
- `displayType` (string): Type of display (static_billboard, digital_screen, led_display, backlit_panel, vinyl_banner, transit_branding)
- `pricePerDay` (number): Price per day in rupees
- `pricePerMonth` (number): Price per month in rupees
- `latitude` (number): Latitude coordinate
- `longitude` (number): Longitude coordinate

### Optional Fields
- `locationId` (string, UUID): ID of the location
- `publisherId` (string, UUID): ID of the publisher
- `dailyImpressions` (number): Daily impressions count (default: 0)
- `monthlyFootfall` (number): Monthly footfall count (default: 0)
- `images` (string[]): Array of image URLs
- `dimensions` (object): Dimensions object (e.g., {width: 1920, height: 1080})
- `availabilityStatus` (string): 'available' | 'booked' | 'unavailable' (default: 'available')
- `targetAudience` (string): Target audience description

## Example Request

### Using JavaScript/Fetch
```javascript
const response = await fetch('/api/ad-spaces', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Premium Billboard at MG Road',
    description: 'High visibility billboard in prime location. Perfect for brand campaigns.',
    categoryId: 'your-category-uuid-here', // Get from /api/categories
    displayType: 'static_billboard',
    pricePerDay: 50000,
    pricePerMonth: 1500000,
    dailyImpressions: 5000,
    monthlyFootfall: 150000,
    latitude: 12.9716,
    longitude: 77.5946,
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ],
    dimensions: {
      width: 1920,
      height: 1080
    },
    availabilityStatus: 'available',
    targetAudience: 'Urban Professionals'
  })
});

const result = await response.json();
console.log(result);
```

### Using cURL
```bash
curl -X POST http://localhost:3000/api/ad-spaces \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Billboard at MG Road",
    "description": "High visibility billboard in prime location",
    "categoryId": "your-category-uuid-here",
    "displayType": "static_billboard",
    "pricePerDay": 50000,
    "pricePerMonth": 1500000,
    "dailyImpressions": 5000,
    "monthlyFootfall": 150000,
    "latitude": 12.9716,
    "longitude": 77.5946,
    "images": ["https://example.com/image1.jpg"],
    "dimensions": {"width": 1920, "height": 1080},
    "availabilityStatus": "available"
  }'
```

## Response

### Success (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "Premium Billboard at MG Road",
    "description": "High visibility billboard...",
    "category": {
      "id": "category-uuid",
      "name": "Billboard",
      "icon_url": null,
      "description": "..."
    },
    "price_per_day": 50000,
    "price_per_month": 1500000,
    "availability_status": "available",
    ...
  },
  "message": "Ad space created successfully"
}
```

### Error (400 Bad Request)
```json
{
  "success": false,
  "error": "Category ID is required"
}
```

### Error (400 Bad Request - Invalid Category)
```json
{
  "success": false,
  "error": "Invalid category ID",
  "details": "Category not found"
}
```

## Get Category IDs First

Before creating an ad space, get available categories:

```javascript
// Get all categories
const categoriesResponse = await fetch('/api/categories');
const categoriesData = await categoriesResponse.json();
console.log(categoriesData.data); // Array of categories with IDs
```

## Display Types

Valid display types:
- `static_billboard`
- `digital_screen`
- `led_display`
- `backlit_panel`
- `vinyl_banner`
- `transit_branding`

## Complete Example with Category Selection

```javascript
// Step 1: Get categories
const categoriesRes = await fetch('/api/categories');
const { data: categories } = await categoriesRes.json();

// Step 2: Find the category you want (e.g., "Billboard")
const billboardCategory = categories.find(cat => cat.name === 'Billboard');

// Step 3: Create ad space with that category
const createAdSpace = async () => {
  const response = await fetch('/api/ad-spaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'My New Billboard',
      description: 'Description here',
      categoryId: billboardCategory.id, // Use the category ID
      displayType: 'static_billboard',
      pricePerDay: 50000,
      pricePerMonth: 1500000,
      latitude: 19.0596,
      longitude: 72.8295,
      images: [],
      dimensions: {}
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('✅ Ad space created!', result.data);
  } else {
    console.error('❌ Error:', result.error);
  }
};

createAdSpace();
```

## Notes

1. **Category is Required**: You must provide a valid `categoryId` that exists in the categories table
2. **Category Validation**: The API verifies that the category exists before creating the ad space
3. **Automatic Linking**: The ad space is automatically linked to the category via `category_id` foreign key
4. **Response Includes Category**: The response includes the full category object with name, icon, etc.

