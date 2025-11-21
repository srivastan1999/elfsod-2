# Railway Deployment Guide for Elfsod

Railway is a simple, powerful platform for deploying applications.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. GitHub repository connected
3. Environment variables ready

## Deployment Steps

### Step 1: Create New Project

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose repository: `garvitj26-oss/Elfsod`

### Step 2: Configure Service

1. **Set Root Directory**
   - Click on the service
   - Go to "Settings" → "Source"
   - Set **Root Directory** to: `frontend`

2. **Configure Build Settings**
   - Railway auto-detects Next.js
   - Build command: `npm run build` (auto-detected)
   - Start command: `npm start` (auto-detected)

### Step 3: Add Environment Variables

Go to "Variables" tab and add:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://zcqqfkuezoxumchbslqw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXFma3Vlem94dW1jaGJzbHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzQzMzEsImV4cCI6MjA0ODIxMDMzMX0.uGXyKBQNvSQZ0WtJTK-oM2FgODTj1-IA8PvxqvbuVU8
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

1. Railway will automatically start building
2. Once deployed, click "Settings" → "Generate Domain"
3. Your app will be live at `https://your-app.up.railway.app`

## Railway CLI (Alternative)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

## Pricing

- **Free tier**: $5 credit/month
- **Hobby**: $5/month
- **Pro**: $20/month

## Advantages

- ✅ Simple setup
- ✅ Automatic HTTPS
- ✅ Environment variable management
- ✅ Built-in monitoring
- ✅ Easy scaling

