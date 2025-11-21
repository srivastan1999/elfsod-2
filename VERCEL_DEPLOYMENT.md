# Vercel Deployment Guide for Elfsod

This guide will help you deploy your Elfsod application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. GitHub repository connected (already done: https://github.com/garvitj26-oss/Elfsod)
3. Environment variables ready (see below)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository: `garvitj26-oss/Elfsod`

2. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend` (IMPORTANT: Set this to `frontend`)
   - Vercel will automatically detect `vercel.json` in the frontend folder
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

3. **Add Environment Variables**
   Click "Environment Variables" and add the following:

   **Required:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://zcqqfkuezoxumchbslqw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXFma3Vlem94dW1jaGJzbHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzQzMzEsImV4cCI6MjA0ODIxMDMzMX0.uGXyKBQNvSQZ0WtJTK-oM2FgODTj1-IA8PvxqvbuVU8
   ```

   **Optional but Recommended:**
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
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
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to frontend folder**
   ```bash
   cd /Users/srivastand/Desktop/practiseProjects/Elfsod/frontend
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   
   When prompted:
   - Confirm it's a Next.js project
   - Add environment variables (or add them later in dashboard)

5. **For production deployment**
   ```bash
   vercel --prod
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
| `EMAIL_SERVICE` | Email service provider (`brevo` or `resend`) | `brevo` |
| `BREVO_API_KEY` | Brevo API key (if using Brevo) | None |
| `RESEND_API_KEY` | Resend API key (if using Resend) | None |
| `EMAIL_FROM` | Sender email address | `noreply@elfsod.com` |
| `QUOTE_EMAIL_RECIPIENT` | Email address to receive quote requests | `bureau@elfsod.com` |

## Post-Deployment Checklist

- [ ] Verify the site is accessible
- [ ] Test Supabase connection (check `/api/test-supabase`)
- [ ] Test Google Maps (if API key is set)
- [ ] Test quote request email functionality
- [ ] Update Google Maps API key restrictions to allow your Vercel domain
- [ ] Set up custom domain (optional)

## Troubleshooting

### Build Fails
- Check that `Root Directory` is set to `frontend`
- Verify all environment variables are set correctly
- Check build logs in Vercel dashboard

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase RLS (Row Level Security) policies
- Test connection at `/api/test-supabase`

### Google Maps Not Working
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- Update Google Cloud Console to allow your Vercel domain
- Check browser console for API errors

### Email Not Sending
- Verify email service API key is set
- Check `EMAIL_FROM` and `QUOTE_EMAIL_RECIPIENT` are correct
- Check Vercel function logs for email errors

## Custom Domain Setup

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

## Continuous Deployment

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

Each push creates a new preview URL for testing.

## Support

For issues:
1. Check Vercel deployment logs
2. Check function logs for API routes
3. Verify environment variables
4. Test locally first with same environment variables

