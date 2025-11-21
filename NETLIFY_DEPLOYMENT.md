# Netlify Deployment Guide for Elfsod

This guide will help you deploy your Elfsod application to Netlify.

## Prerequisites

1. A Netlify account (sign up at [netlify.com](https://netlify.com))
2. GitHub repository connected (already done: https://github.com/garvitj26-oss/Elfsod)
3. Environment variables ready (see below)

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select repository: `garvitj26-oss/Elfsod`

2. **Configure Build Settings**
   - **Base directory**: `frontend` (IMPORTANT: Set this to `frontend`)
   - **Build command**: `npm run build` (auto-detected from netlify.toml)
   - **Publish directory**: `.next` (auto-detected)
   - Netlify will automatically detect `netlify.toml` in the frontend folder

3. **Add Environment Variables**
   Click "Environment variables" and add the following:

   **Required:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://zcqqfkuezoxumchbslqw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXFma3Vlem94dW1jaGJzbHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzQzMzEsImV4cCI6MjA0ODIxMDMzMX0.uGXyKBQNvSQZ0WtJTK-oM2FgODTj1-IA8PvxqvbuVU8
   ```

   **Optional but Recommended:**
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   GROQ_API_KEY=your-groq-api-key
   ```

   **Email Service (Optional - choose one):**
   ```
   EMAIL_SERVICE=brevo
   BREVO_API_KEY=your-brevo-api-key
   EMAIL_FROM=noreply@elfsod.com
   QUOTE_EMAIL_RECIPIENT=bureau@elfsod.com
   ```
   
   OR
   
   ```
   EMAIL_SERVICE=resend
   RESEND_API_KEY=your-resend-api-key
   EMAIL_FROM=onboarding@resend.dev
   QUOTE_EMAIL_RECIPIENT=bureau@elfsod.com
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete
   - Your app will be live at `https://your-site-name.netlify.app`

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Navigate to frontend folder**
   ```bash
   cd frontend
   ```

4. **Initialize and Deploy**
   ```bash
   netlify init
   ```
   
   When prompted:
   - Create & configure a new site
   - Team: Select your team
   - Site name: (leave blank for random name or enter custom)
   - Build command: `npm run build` (or press enter to use default)
   - Directory to deploy: `.next` (or press enter to use default)

5. **Add Environment Variables**
   ```bash
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://zcqqfkuezoxumchbslqw.supabase.co"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-anon-key-here"
   ```

6. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | `eyJhbGci...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key for location features | None (features will be disabled) |
| `GROQ_API_KEY` | Groq API key for AI planner features | None (falls back to rule-based) |
| `EMAIL_SERVICE` | Email service provider (`brevo` or `resend`) | `brevo` |
| `BREVO_API_KEY` | Brevo API key (if using Brevo) | None |
| `RESEND_API_KEY` | Resend API key (if using Resend) | None |
| `EMAIL_FROM` | Sender email address | `noreply@elfsod.com` |
| `QUOTE_EMAIL_RECIPIENT` | Email address to receive quote requests | `bureau@elfsod.com` |

## Post-Deployment Checklist

- [ ] Verify the site is accessible
- [ ] Test Supabase connection (check `/api/test-supabase`)
- [ ] Test Google Maps (if API key is set)
- [ ] Test AI planner functionality
- [ ] Test quote request email functionality
- [ ] Update Google Maps API key restrictions to allow your Netlify domain
- [ ] Set up custom domain (optional)

## Troubleshooting

### Build Fails
- Check that **Base directory** is set to `frontend`
- Verify all environment variables are set correctly
- Check build logs in Netlify dashboard
- Ensure `netlify.toml` is in the `frontend` directory

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase RLS (Row Level Security) policies
- Test connection at `/api/test-supabase`

### Google Maps Not Working
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- Update Google Cloud Console to allow your Netlify domain
- Check browser console for API errors

### Email Not Sending
- Verify email service API key is set
- Check `EMAIL_FROM` and `QUOTE_EMAIL_RECIPIENT` are correct
- Check Netlify function logs for email errors

## Custom Domain Setup

1. Go to your site in Netlify dashboard
2. Click "Domain settings"
3. Click "Add custom domain"
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

## Continuous Deployment

Netlify automatically deploys when you push to:
- `main` branch → Production
- Other branches → Deploy previews

Each push creates a new preview URL for testing.

## Support

For issues:
1. Check Netlify deployment logs
2. Check function logs for API routes
3. Verify environment variables
4. Test locally first with same environment variables

