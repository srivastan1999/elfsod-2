# Render Deployment Guide for Elfsod

Render is a cloud platform that makes it easy to deploy applications.

## Prerequisites

1. A Render account (sign up at [render.com](https://render.com))
2. GitHub repository connected
3. Environment variables ready

## Deployment Steps

### Step 1: Create New Web Service

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select repository: `garvitj26-oss/Elfsod`

### Step 2: Configure Service

**Basic Settings:**
- **Name**: `elfsod` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build Settings:**
- **Root Directory**: `frontend` (IMPORTANT)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Auto-Deploy**: `Yes` (deploys on every push)

### Step 3: Add Environment Variables

Click "Environment" tab and add:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://zcqqfkuezoxumchbslqw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXFma3Vlem94dW1jaGJzbHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzQzMzEsImV4cCI6MjA0ODIxMDMzMX0.uGXyKBQNvSQZ0WtJTK-oM2FgODTj1-IA8PvxqvbuVU8
NODE_ENV=production
```

**Optional:**
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
GROQ_API_KEY=your-key
EMAIL_SERVICE=brevo
BREVO_API_KEY=your-key
EMAIL_FROM=noreply@elfsod.com
QUOTE_EMAIL_RECIPIENT=bureau@elfsod.com
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will start building automatically
3. Once deployed, your app will be live at `https://your-app.onrender.com`

## Pricing

- **Free tier**: Available (with limitations)
- **Starter**: $7/month
- **Standard**: $25/month

## Advantages

- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ Auto-deploy from GitHub
- ✅ Built-in monitoring

## Notes

- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading for production use

