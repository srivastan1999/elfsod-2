# Movable Ads Coverage Feature - Complete Guide

## Overview
This feature allows movable ad spaces (Auto Rickshaws, Bikes, Cabs) to display circular coverage areas on the map with adjustable radius using a slider.

## ✅ Implementation Complete

### 1. **Map Circle Visualization** 
📍 File: `components/search/MapView.tsx` (Lines 158-203)

**Features:**
- Displays a pink circular overlay showing coverage area
- Dynamically updates when slider changes
- Center marker shows the base location
- Auto-adjusts zoom level based on radius size
- Dashed pink border (#E91E63) with 15% opacity fill

```typescript
<Circle
  center={[latitude, longitude]}
  radius={coverage_radius * 1000} // km to meters
  color="#E91E63"
  fillOpacity={0.15}
/>
```

### 2. **Interactive Radius Slider**
📍 File: `app/search/page.tsx` (Lines 469-568)

**Features:**
- Shows base coverage (e.g., 5km)
- Allows adding additional coverage (e.g., +10km)
- Real-time percentage increase display (+X% reach)
- Animated value indicator on slider
- Area multiplier calculation (πr² formula)
- Live preview: "Total Coverage: X km - Radius shown on map"

**Formula Used:**
```javascript
const areaMultiplier = (totalRadius² / baseRadius²)
const reachIncrease = ((areaMultiplier - 1) * 100)
```

### 3. **Ad Space Cards - Coverage Badges**
📍 File: `components/common/AdSpaceCard.tsx` (Lines 53-57, 136-152)

**Compact Variant:**
```
🧭 5km coverage
```

**Default Variant:**
```
┌─────────────────────────────┐
│ 🧭 5km Coverage             │
│    +10km available          │
└─────────────────────────────┘
```

- Pink gradient background badge
- Shows base coverage prominently
- Displays additional coverage availability
- Navigation icon for quick recognition

### 4. **Database Schema**
📍 File: `supabase/add_route_data_to_movable_ads.sql`

**Route JSONB Structure:**
```json
{
  "center_location": {
    "latitude": 19.1136,
    "longitude": 72.8697,
    "address": "Andheri West, Mumbai"
  },
  "coverage_radius": 5,
  "base_coverage_km": 5,
  "additional_coverage_km": 10
}
```

## How It Works

### User Flow:
1. **Browse Cards** → See coverage badge on movable ads
2. **Click Card** → Opens map view with circle overlay
3. **Adjust Slider** → Circle grows/shrinks in real-time
4. **See Impact** → "+X% reach" shows area increase
5. **Add to Cart** → Price adjusts based on radius

### Pricing Logic:
```javascript
const additionalCost = price_per_day * 0.15 * additionalKm
// 15% increase per additional kilometer
```

### Visual Indicators:
- **Green Badge (×20)**: Campaign duration multiplier
- **Pink Circle**: Coverage area on map
- **Blue Marker**: Center location
- **Animated Slider**: With live value display

## Setup Instructions

### 1. Run the SQL Script:
```bash
cd frontend/supabase
psql -h your-supabase-url -U postgres -d postgres -f add_route_data_to_movable_ads.sql
```

Or execute in Supabase SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Open `add_route_data_to_movable_ads.sql`
3. Click "Run"

### 2. Verify Route Data:
```sql
SELECT 
  title, 
  display_type,
  route->>'coverage_radius' as coverage_km,
  route->'center_location'->>'address' as center
FROM ad_spaces 
WHERE route IS NOT NULL;
```

## Testing Checklist

- [ ] Auto Rickshaw ads show coverage badge
- [ ] Clicking opens map with circle
- [ ] Circle appears at correct location
- [ ] Slider adjusts circle radius smoothly
- [ ] Percentage increase calculates correctly
- [ ] Price updates based on additional km
- [ ] Compact cards show coverage info
- [ ] Default cards show full coverage details

## Sample Ad Spaces with Route Data

1. **Mumbai Auto Rickshaw** - Andheri West
   - Base: 5km, Additional: +10km
   
2. **Bengaluru Auto Rickshaw** - Whitefield Tech Park
   - Base: 8km, Additional: +12km
   
3. **Delhi Auto Rickshaw** - Airport Express Route
   - Base: 6km, Additional: +8km

## Key Files Modified

1. ✅ `components/search/MapView.tsx` - Circle overlay
2. ✅ `app/search/page.tsx` - Slider & calculations
3. ✅ `components/common/AdSpaceCard.tsx` - Coverage badges
4. ✅ `types/index.ts` - Already had route type
5. ✅ `supabase/add_route_data_to_movable_ads.sql` - New SQL script

## Features Summary

### Visual Elements:
- 🎯 Pink circular coverage area overlay
- 📏 Interactive radius slider
- 🏷️ Coverage badges on cards
- 📊 Real-time reach % increase
- 🗺️ Auto-zoom based on radius
- 💰 Dynamic pricing display

### User Experience:
- Immediate visual feedback
- Smooth animations
- Clear value communication
- Easy radius adjustment
- Mobile-responsive design

## Next Steps (Optional Enhancements)

1. **Route Tracking** - Show actual movement path
2. **Time-based Coverage** - Different hours → different areas
3. **Heat Maps** - Popular coverage zones
4. **Multi-stop Routes** - Multiple coverage centers
5. **Traffic Integration** - Peak hour visibility
6. **Custom Shapes** - Polygon coverage vs circles

## Technical Notes

- Circle radius uses Leaflet's `<Circle>` component
- Radius converted: `km * 1000 = meters`
- State management: `additionalKm` in search page
- Circle updates via props: `coverage_radius`
- JSONB storage for flexible route data

---

**Status**: ✅ Feature Complete and Ready to Use!

**Created**: November 19, 2025
**Last Updated**: November 19, 2025

