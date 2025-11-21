# Testing Traffic Data from Google Maps

## Quick Test Steps

### 1. Verify API Key is Set
Make sure your `.env.local` file has:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 2. Restart Your Dev Server
After adding/updating the API key:
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

### 3. Test the Traffic API Endpoint

Open your browser and test with a real location:

**Test URL** (replace with your actual domain):
```
http://localhost:3000/api/places/traffic?lat=19.0760&lng=72.8777
```

This tests Mumbai coordinates. You should see JSON response with traffic data.

### 4. Test on an Ad Space Page

1. Go to any ad space detail page
2. Scroll down to see the "Traffic Insights" section
3. If no data shows, click the refresh button (🔄)
4. Check browser console for any errors

### 5. Check Browser Console

Open Developer Tools (F12) and look for:
- ✅ Success: Traffic data loaded
- ❌ Errors: Check the error message

Common errors:
- `REQUEST_DENIED` → API not enabled or key restricted
- `INVALID_REQUEST` → Check coordinates
- `API key not configured` → Check .env.local file

## Expected Response

When working correctly, you should see:
```json
{
  "average_daily_visitors": 1500,
  "peak_hours": [
    { "hour": 9, "traffic_level": "high" },
    { "hour": 10, "traffic_level": "very_high" }
  ],
  "weekly_pattern": {
    "monday": "high",
    "tuesday": "high",
    ...
  },
  "traffic_level": "high",
  "nearby_places_count": 25,
  "last_updated": "2024-01-15T10:30:00.000Z",
  "source": "google_places"
}
```

## Troubleshooting

### If you see "REQUEST_DENIED":
1. Go to Google Cloud Console
2. Check that "Places API (New)" is enabled
3. Verify API key restrictions allow Places API (New)
4. Wait 2-3 minutes after enabling (propagation delay)

### If you see "API key not configured":
1. Check `.env.local` file exists in `frontend/` directory
2. Verify variable name: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Restart dev server after adding key

### If traffic data doesn't show:
1. Check browser console for errors
2. Try clicking the refresh button
3. Verify coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)

## Manual Test in Browser Console

You can test directly in browser console:

```javascript
// Test the traffic API
fetch('/api/places/traffic?lat=19.0760&lng=72.8777')
  .then(r => r.json())
  .then(data => console.log('Traffic Data:', data))
  .catch(err => console.error('Error:', err));
```

Replace coordinates with any ad space location.

