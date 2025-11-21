# Admin Coverage Area Selector - Complete Guide

## Overview
When creating movable ad spaces (Auto Rickshaws, Bikes, Cabs, Buses) in the admin panel, you can now select the coverage area on an interactive map with adjustable radius controls.

## ✅ Features Implemented

### 1. **Interactive Map Selector**
📍 Component: `components/admin/CoverageAreaSelector.tsx`

**Features:**
- Click anywhere on the map to set coverage center
- Two colored circles:
  - **Blue solid circle**: Base coverage (included in price)
  - **Pink dashed circle**: Maximum coverage (customer can add)
- Real-time address lookup via reverse geocoding
- Auto-adjusting zoom based on coverage radius
- Legend overlay showing both coverage levels

### 2. **Smart Default Coverage by Vehicle Type**

| Vehicle Type | Base Coverage | Additional Available |
|--------------|---------------|---------------------|
| 🛺 Auto Rickshaw | 5 km | +10 km |
| 🏍️ Bike | 4 km | +8 km |
| 🚖 Cab | 8 km | +15 km |
| 🚌 Bus/Transit | 12 km | +20 km |
| 🚇 Metro/Train | 15 km | +25 km |
| 🚐 Mobile Billboard | 10 km | +18 km |

### 3. **Radius Controls**
- **Plus/Minus buttons** for quick adjustments
- **Range sliders** for precise control
- **Real-time preview** on map
- **Coverage summary**: Shows base, max, and total area (km²)

### 4. **Form Integration**
📍 File: `app/admin/page.tsx`

The coverage selector appears automatically when you select a movable display type:
- Auto Rickshaw
- Bike
- Cab
- Bus/Transit

## How to Use in Admin Panel

### Step 1: Create New Ad Space
1. Click "**Add New Ad Space**" button
2. Fill in basic details (title, category, city, etc.)
3. Select **Display Type** → Choose a movable type (e.g., Auto Rickshaw)

### Step 2: Set Coverage Area
Once you select a movable display type, the "**Coverage Area Setup 📍**" section appears:

1. **Click on the map** to set your coverage center point
   - The map will reverse-geocode to get the address
   - A red marker appears at the center
   
2. **Adjust Base Coverage**:
   - Use +/- buttons or slider
   - This is the guaranteed coverage included in base price
   - Blue circle shows the area
   
3. **Set Additional Coverage**:
   - Use +/- buttons or slider
   - Customers can purchase this extra coverage
   - Pink dashed circle shows max coverage
   
4. **Review Summary**:
   - Base Coverage: X km
   - Max Coverage: Y km
   - Coverage Area: Z km²

### Step 3: Save
- Click "**Save**" button
- The route data is saved with the ad space

## Coverage Data Structure

The coverage data is stored in the `route` JSONB field:

```json
{
  "center_location": {
    "latitude": 19.1136,
    "longitude": 72.8697,
    "address": "Andheri West, Mumbai, India"
  },
  "coverage_radius": 5,
  "base_coverage_km": 5,
  "additional_coverage_km": 10
}
```

## User Experience (Customer Side)

When customers view these ads:

1. **Cards show coverage badge**:
   ```
   🧭 5km Coverage
   +10km available
   ```

2. **Map shows pink circle** with coverage area

3. **Slider lets them adjust** coverage (0 to +10km)

4. **Price updates** based on additional coverage:
   - Formula: `base_price + (base_price * 0.15 * additional_km)`
   - 15% increase per additional kilometer

5. **Live feedback** shows:
   - "+X% reach increase"
   - "Total Coverage: Y km"
   - Updated circle on map

## Database Updates

### Run SQL Script
Execute this script to add route data to existing movable ads:

```bash
cd frontend/supabase
psql -h your-supabase-url -U postgres -d postgres -f add_route_data_to_movable_ads.sql
```

Or in Supabase SQL Editor:
1. Open `add_route_data_to_movable_ads.sql`
2. Click "**Run**"

This adds coverage data to:
- All Auto Rickshaws (5km base)
- All Bikes (4km base)
- All Cabs (8km base)
- All Buses (12km base)
- All Metro/Train ads (15km base)
- All Mobile Billboards (10km base)

## Technical Details

### Component Props
```typescript
interface CoverageAreaSelectorProps {
  initialCenter?: { 
    latitude: number; 
    longitude: number; 
    address: string 
  };
  initialBaseRadius?: number;
  initialAdditionalRadius?: number;
  displayType?: string; // Auto-sets defaults
  onChange: (data: {
    center_location: { ... };
    base_coverage_km: number;
    additional_coverage_km: number;
  }) => void;
}
```

### Dynamic Import
The component is loaded dynamically (client-side only) because it uses Leaflet maps:

```typescript
const CoverageAreaSelector = dynamic(
  () => import('@/components/admin/CoverageAreaSelector'),
  { ssr: false }
);
```

### Reverse Geocoding
Uses OpenStreetMap's Nominatim API:
```javascript
const response = await fetch(
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
);
```

## UI Components

### Map Styles
- **Base Circle**: Blue (#2196F3) with 10% opacity
- **Max Circle**: Pink (#E91E63) with 15% opacity, dashed border
- **Center Marker**: Red pin
- **Controls**: Pink and Blue themed to match circles

### Form Appearance
- Appears between "Image URL" and "Availability Status"
- Only visible for movable display types
- Bordered section with heading
- Full width within modal

## Testing Checklist

- [ ] Select Auto Rickshaw → Coverage selector appears
- [ ] Click map → Marker moves, address updates
- [ ] Adjust base radius → Blue circle changes
- [ ] Adjust additional radius → Pink circle changes
- [ ] Summary shows correct values
- [ ] Save form → Route data stored in database
- [ ] Edit existing ad → Coverage data loads correctly
- [ ] View on frontend → Circle appears on map
- [ ] Adjust slider → Circle updates in real-time

## Key Files

1. ✅ `components/admin/CoverageAreaSelector.tsx` - Map selector component
2. ✅ `app/admin/page.tsx` - Admin form integration
3. ✅ `supabase/add_route_data_to_movable_ads.sql` - Database updates
4. ✅ `components/search/MapView.tsx` - Customer-facing map with circles
5. ✅ `app/search/page.tsx` - Customer-facing slider
6. ✅ `components/common/AdSpaceCard.tsx` - Coverage badges on cards

## Benefits

### For Admins:
- ✅ Visual coverage selection
- ✅ Easy to set different coverage zones
- ✅ Default smart values by vehicle type
- ✅ See exactly what customers will see

### For Customers:
- ✅ Clear coverage visualization
- ✅ Adjust coverage to their needs
- ✅ Transparent pricing
- ✅ See reach increase percentage

## Next Steps (Future Enhancements)

1. **Upload Routes** - Allow GPX/KML file upload for exact routes
2. **Multiple Coverage Zones** - Add multiple circles for different areas
3. **Time-based Coverage** - Different areas at different times
4. **Heatmap Integration** - Show popular coverage areas
5. **Coverage Analytics** - Track which areas perform best
6. **Polygon Selection** - Draw custom coverage shapes

---

**Status**: ✅ Feature Complete and Ready to Use!

**Created**: November 19, 2025
**Last Updated**: November 19, 2025

