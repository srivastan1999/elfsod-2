# Add 20 Billboards Per City Script

This script adds 20 billboard ad spaces for each city (Hyderabad, Mumbai, Delhi) using the Admin API.

## Prerequisites

1. **Admin Portal Running**: The admin portal should be running (default: `http://localhost:3001`)
2. **Logged In**: You should be logged in to the admin portal
3. **Billboards Category**: The "Billboards" category must exist in the database

## Usage

### Option 1: Using Admin Portal API (Recommended)

1. Start the admin portal:
   ```bash
   cd admin-portal
   npm run dev
   ```

2. Log in to the admin portal at `http://localhost:3001/auth/signin`

3. Run the script:
   ```bash
   cd frontend
   node add_20_billboards_per_city.js
   ```

The script will use the admin portal API (port 3001) and your session cookies for authentication.

### Option 2: Using Frontend API

If you want to use the frontend API instead:

```bash
USE_FRONTEND_API=true API_BASE_URL=http://localhost:3000 node add_20_billboards_per_city.js
```

### Option 3: Using Custom URLs

```bash
# Use admin portal on custom URL
ADMIN_PORTAL_URL=http://localhost:3001 node add_20_billboards_per_city.js

# Use frontend API on custom URL
FRONTEND_URL=http://localhost:3000 USE_FRONTEND_API=true node add_20_billboards_per_city.js
```

## What the Script Does

1. **Finds or creates the "Billboards" category**
2. **For each city (Hyderabad, Mumbai, Delhi):**
   - Creates 20 locations (if they don't exist)
   - Creates 20 billboard ad spaces via Admin API
   - Each billboard has realistic pricing, impressions, and dimensions

## Cities and Locations

### Hyderabad (20 locations)
- Madhapur Metro Station
- Begumpet Flyover
- Kukatpally Main Road
- Hitech City Junction
- Banjara Hills Road
- And 15 more locations...

### Mumbai (20 locations)
- Andheri East
- Bandra Kurla Complex
- Marine Drive
- Worli Sea Face
- Juhu Beach Road
- And 15 more locations...

### Delhi (20 locations)
- Saket Metro
- Connaught Place
- Aerocity
- Rajiv Chowk Metro
- Gurgaon Sector 29
- And 15 more locations...

## Output

The script will show:
- Progress for each billboard being created
- Success/failure status for each entry
- Final summary with counts per city

Example output:
```
🏙️  Processing Hyderabad (20 billboards)...
============================================================

[1/20] 📦 Processing: Madhapur Metro Station
  ✅ Created location: Madhapur Metro Station, Hyderabad (ID: ...)
  ✅ Created: Madhapur Metro Station (ID: ...)

...

📊 SUMMARY
============================================================

🏙️  Hyderabad:
  ✅ Successfully created: 20 ad spaces
  ❌ Failed: 0 ad spaces

🏙️  Mumbai:
  ✅ Successfully created: 20 ad spaces
  ❌ Failed: 0 ad spaces

🏙️  Delhi:
  ✅ Successfully created: 20 ad spaces
  ❌ Failed: 0 ad spaces

📈 TOTAL:
  ✅ Successfully created: 60 ad spaces
  ❌ Failed: 0 ad spaces
```

## Troubleshooting

### Authentication Error (401)
- Make sure you're logged in to the admin portal
- Check that the admin portal is running on the correct port
- Try logging out and logging back in

### Category Not Found
- Create the "Billboards" category in the admin portal first
- Or run the SQL script: `supabase/add_city_billboards.sql`

### Location Creation Failed
- Check that the locations API is accessible
- Verify database permissions

### Rate Limiting
- The script includes a 500ms delay between requests
- If you encounter rate limiting, increase the delay in the script

## Notes

- The script is idempotent - running it multiple times will create locations/billboards only if they don't exist
- Each billboard has realistic pricing based on location visibility
- Images use a placeholder URL - you may want to update these with actual billboard images
- Dimensions are in feet (width x height)

