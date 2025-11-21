# Google Maps API Setup Guide

## Required APIs

Your Google Cloud project needs to have the following APIs enabled:

### 1. **Geocoding API**
   - Used for: Converting GPS coordinates to city names (reverse geocoding)
   - Enable at: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com

### 2. **Places API (New)**
   - Used for: 
     - City autocomplete suggestions when typing
     - **Nearby Search** - Finding places near ad space locations
     - **Place Details** - Getting detailed information about places
     - **Traffic Insights** - Estimating visitor traffic and peak hours
   - Enable at: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
   - **Note**: Make sure to enable "Places API (New)" not the old "Places API"
   - **Important**: The Places API (New) includes Nearby Search, Place Details, and Autocomplete - you don't need separate APIs

## Step-by-Step Setup

### Step 1: Enable APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for and enable:
   - **Geocoding API**
   - **Places API (New)** ⭐ (This includes Nearby Search, Place Details, and Autocomplete)

**Note**: There is NO separate "Nearby Search API". Nearby Search is a feature included in the **Places API (New)**. When you enable Places API (New), you automatically get access to:
- Nearby Search
- Place Details
- Place Autocomplete
- Place Photos
- And other Places features

### Step 2: Create API Key
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **API key**
3. Copy your API key

### Step 3: Restrict API Key (Recommended)
1. Click on your API key to edit it
2. Under **API restrictions**, select **Restrict key**
3. Check only:
   - **Geocoding API**
   - **Places API (New)** ⭐ (This enables Nearby Search automatically)
4. Under **Application restrictions**:
   - For development: Select **None** (or **HTTP referrers** with your localhost)
   - For production: Select **HTTP referrers** and add your domain
5. Click **Save**

**Important**: You only need to enable "Places API (New)" - Nearby Search is included in it!

### Step 4: Enable Billing
⚠️ **Important**: Google Maps APIs require billing to be enabled (even for free tier)

1. Go to **Billing** in Google Cloud Console
2. Link a billing account (credit card required)
3. Don't worry - Google provides $200 free credit per month for Maps APIs
4. Most small applications stay within the free tier

### Step 5: Add API Key to Project
Add your API key to `frontend/.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Free Tier Limits (Monthly)

- **Geocoding API**: 
  - First 40,000 requests: Free
  - Additional: $5.00 per 1,000 requests

- **Places API (New) - Autocomplete**:
  - First 17,500 requests: Free
  - Additional: $2.83 per 1,000 requests

## Common Issues

### Error: "REQUEST_DENIED"
**Causes:**
1. API not enabled in Google Cloud Console
2. API key restrictions blocking the request
3. Billing not enabled
4. Wrong API key

**Solutions:**
1. Check that both **Geocoding API** and **Places API (New)** are enabled
2. Verify API key restrictions allow the APIs
3. Ensure billing is enabled
4. Verify the API key in `.env.local` matches the one in Google Cloud Console

### Error: "This API project is not authorized to use this API"
- Enable the required APIs in Google Cloud Console
- Wait a few minutes after enabling for changes to propagate

### Error: "You must enable Billing on the Google Cloud Project"
- Link a billing account to your project
- Google provides $200 free credit monthly

## Testing Your Setup

1. Restart your Next.js dev server after adding the API key
2. Open browser console and look for: `✅ Google Maps API key loaded`
3. Try "Detect my location" - should get actual city name
4. Type in city search - should show Google Places suggestions

## Security Best Practices

1. **Restrict API Key**: Always restrict your API key to specific APIs
2. **HTTP Referrers**: For production, restrict to your domain
3. **Monitor Usage**: Set up billing alerts in Google Cloud Console
4. **Rotate Keys**: Regularly rotate API keys if compromised

## Environment Variables

Make sure your `.env.local` file is in the `frontend/` directory:
```
frontend/
  .env.local  ← API key goes here
```

The variable name must be exactly:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

**Note**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose it to the browser.

