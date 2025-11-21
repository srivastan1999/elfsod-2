# Google Places Nearby Search Setup Guide

## Quick Answer: How to Get Nearby Search API

**There is NO separate "Nearby Search API"** - it's included in the **Places API (New)**!

When you enable **Places API (New)**, you automatically get access to:
- ✅ Nearby Search
- ✅ Place Details  
- ✅ Place Autocomplete
- ✅ Place Photos
- ✅ And other Places features

## Step-by-Step Setup

### Step 1: Enable Places API (New)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for **"Places API (New)"**
5. Click on it and click **Enable**

**Direct Link**: https://console.cloud.google.com/apis/library/places-backend.googleapis.com

### Step 2: Verify It's Enabled

1. Go to **APIs & Services** > **Enabled APIs**
2. You should see **"Places API (New)"** in the list
3. That's it! Nearby Search is now available

### Step 3: Use Nearby Search

Once Places API (New) is enabled, you can use Nearby Search in your code:

```typescript
// Example API call
const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&key=${GOOGLE_API_KEY}`;
```

## What's Included in Places API (New)?

The Places API (New) includes these endpoints:

1. **Nearby Search** - Find places near a location
   - Endpoint: `place/nearbysearch/json`
   - Used in: `/api/places/traffic` route

2. **Place Details** - Get detailed info about a place
   - Endpoint: `place/details/json`
   - Used in: `/api/places/traffic` route

3. **Place Autocomplete** - Get place suggestions
   - Endpoint: `place/autocomplete/json`
   - Used in: `/api/places/autocomplete` route

4. **Place Photos** - Get photos of places
   - Endpoint: `place/photo`

5. **Text Search** - Search for places by text
   - Endpoint: `place/textsearch/json`

## Pricing

**Free Tier (Monthly)**:
- Places API (New): $200 free credit per month
- Nearby Search: ~$32 per 1,000 requests (after free tier)
- Place Details: ~$17 per 1,000 requests (after free tier)

**Note**: The $200 free credit typically covers:
- ~6,250 Nearby Search requests
- ~11,700 Place Details requests
- Or a combination of both

## Common Issues

### Issue: "This API project is not authorized to use this API"

**Solution**: Make sure you've enabled "Places API (New)" not the old "Places API"

### Issue: "REQUEST_DENIED" error

**Solution**: 
1. Check that Places API (New) is enabled
2. Verify your API key is correct
3. Check API key restrictions allow Places API (New)

### Issue: "INVALID_REQUEST" error

**Solution**: 
1. Check that your coordinates are valid
2. Ensure radius is between 1-50,000 meters
3. Verify API key has proper permissions

## Testing Your Setup

You can test if Nearby Search is working by calling:

```bash
curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=19.0760,72.8777&radius=500&key=YOUR_API_KEY"
```

Replace `YOUR_API_KEY` with your actual API key.

If it works, you'll get a JSON response with nearby places.

## Summary

✅ **Enable "Places API (New)"** → You get Nearby Search automatically  
✅ **No separate API needed** → Everything is included  
✅ **One API key** → Works for all Places features  

That's it! Once Places API (New) is enabled, Nearby Search is ready to use.

