# Traffic Data Load Feature Guide

## Overview

The traffic data load feature allows you to fetch and save traffic insights from Google Maps for ad spaces. This data includes:
- Average daily visitors
- Peak hours
- Weekly traffic patterns
- Traffic level (low/moderate/high/very high)
- Nearby places count

## Features

### 1. Automatic Load on Ad Space View
When viewing an ad space detail page, traffic data is automatically fetched if:
- The ad space has coordinates (latitude/longitude)
- Traffic data doesn't exist or is marked as "unknown"

### 2. Manual Refresh
Users can click the refresh button (🔄) in the Traffic Insights section to:
- Fetch fresh traffic data from Google Places
- Save it to the database
- Update the display immediately

### 3. Bulk Load (Admin/API)
Load traffic data for multiple ad spaces at once using:
- API endpoint: `POST /api/ad-spaces/load-traffic`
- Node.js script: `scripts/load-traffic-data.js`

## API Endpoints

### 1. Fetch Traffic Data
```
GET /api/places/traffic?lat={latitude}&lng={longitude}
```
Fetches traffic data from Google Places API for a location.

**Response:**
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

### 2. Save Traffic Data to Ad Space
```
PUT /api/ad-spaces/{id}/traffic
Body: { "traffic_data": {...} }
```
Saves traffic data to a specific ad space.

### 3. Bulk Load Traffic Data
```
POST /api/ad-spaces/load-traffic
Body: {
  "adSpaceIds": ["id1", "id2"],  // Optional: specific IDs
  "limit": 10,                    // Optional: max number to process
  "force": false                  // Optional: reload even if data exists
}
```

**Response:**
```json
{
  "success": true,
  "message": "Processed 10 ad spaces",
  "results": {
    "total": 10,
    "processed": 10,
    "successful": 8,
    "failed": 1,
    "skipped": 1,
    "details": [...]
  }
}
```

## Using the Script

### Basic Usage
```bash
# Load traffic for first 10 ad spaces
node scripts/load-traffic-data.js

# Load traffic for 50 ad spaces
node scripts/load-traffic-data.js --limit 50

# Force reload even if data exists
node scripts/load-traffic-data.js --limit 20 --force

# Load traffic for specific ad spaces
node scripts/load-traffic-data.js --ids uuid1,uuid2,uuid3
```

### Example Output
```
🚀 Starting traffic data load...
   Limit: 10
   Force: false

✅ Traffic data load completed!

📊 Results:
   Total: 10
   Processed: 10
   ✅ Successful: 8
   ❌ Failed: 1
   ⏭️  Skipped: 1

📝 Details:
   ✅ Corporate Office Lobby Display
   ✅ Highway Billboard NH8
   ❌ Metro Station Entrance
      Error: Google API error: REQUEST_DENIED
   ⏭️  Shopping Mall Food Court
```

## Database Schema

Traffic data is stored in the `traffic_data` JSONB column of the `ad_spaces` table:

```sql
ALTER TABLE ad_spaces 
ADD COLUMN IF NOT EXISTS traffic_data JSONB DEFAULT NULL;
```

## Rate Limiting

Google Places API has rate limits:
- **Free tier**: $200 credit per month
- **Nearby Search**: ~$32 per 1,000 requests
- **Place Details**: ~$17 per 1,000 requests

The bulk load script includes a 200ms delay between requests to avoid rate limiting.

## Troubleshooting

### "REQUEST_DENIED" Error
- Check that Places API (New) is enabled
- Verify API key restrictions allow Places API (New)
- Wait 2-3 minutes after enabling (propagation delay)

### "API key not configured"
- Check `.env.local` has `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Restart dev server after adding key

### No Traffic Data Showing
- Check browser console for errors
- Verify coordinates are valid
- Try manual refresh button
- Check that traffic_data field exists in database

### Bulk Load Failing
- Check API key is set in environment
- Verify ad spaces have valid coordinates
- Check Google API quota hasn't been exceeded
- Review error messages in script output

## Best Practices

1. **Load in Batches**: Don't load all ad spaces at once. Use `--limit` to process in batches.

2. **Schedule Regular Updates**: Traffic patterns change. Consider scheduling weekly/monthly updates.

3. **Monitor API Usage**: Check Google Cloud Console for API usage and costs.

4. **Handle Errors Gracefully**: Some locations may not have enough Google Places data. This is normal.

5. **Cache Results**: Traffic data is saved to database, so it persists between page loads.

## Next Steps

1. Run the database migration to add `traffic_data` column:
   ```sql
   -- Run: frontend/supabase/add_traffic_data_field.sql
   ```

2. Test with a single ad space:
   - View an ad space detail page
   - Check if traffic data loads automatically
   - Try the refresh button

3. Load traffic for all ad spaces:
   ```bash
   node scripts/load-traffic-data.js --limit 100
   ```

4. Monitor results and adjust as needed!

