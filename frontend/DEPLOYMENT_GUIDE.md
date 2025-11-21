# Deployment Guide

## ⚠️ Pre-Deployment Checklist

**Before deploying, ensure these are working:**

- [ ] ✅ Supabase connection working locally
- [ ] ✅ Cards loading on home page
- [ ] ✅ All features functional (search, filters, cart, etc.)
- [ ] ✅ No console errors
- [ ] ✅ Environment variables configured

## 🚀 Deploy to Vercel (Recommended for Next.js)

### Step 1: Prepare Your Code

1. **Ensure all changes are committed:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)**
   - Sign up/Login with GitHub

2. **Import Your Project:**
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

3. **Configure Environment Variables:**
   Add these in Vercel dashboard → Settings → Environment Variables:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://vavubezjuqnkrvndtowt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
   EMAIL_FROM=your-email@example.com
   RESEND_API_KEY=your-resend-key (or BREVO_API_KEY)
   QUOTE_EMAIL_RECIPIENT=bureau@elfsod.com
   ```

4. **Configure Build Settings:**
   - Framework Preset: **Next.js**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

### Step 3: Post-Deployment

1. **Test Your Deployment:**
   - Visit your Vercel URL
   - Check if cards load
   - Test all features

2. **Update Supabase CORS (if needed):**
   - Go to Supabase Dashboard → Settings → API
   - Add your Vercel domain to allowed origins (if CORS errors occur)

3. **Set Up Custom Domain (Optional):**
   - Vercel → Settings → Domains
   - Add your custom domain

## 🔧 Alternative: Deploy to Other Platforms

### Netlify

1. **Connect GitHub repository**
2. **Build settings:**
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/.next`
3. **Add environment variables** (same as Vercel)

### Railway

1. **Connect GitHub repository**
2. **Set root directory to `frontend`**
3. **Add environment variables**
4. **Deploy**

### Self-Hosted (VPS)

1. **Build the app:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "elfsod" -- start
   ```

## ⚠️ Important Notes

### Environment Variables

- **All `NEXT_PUBLIC_*` variables** must be set in your deployment platform
- **Server-side variables** (like `RESEND_API_KEY`) should also be set
- **Never commit `.env.local`** to Git

### Supabase Configuration

- **CORS**: Supabase should allow your production domain
- **RLS Policies**: Ensure Row Level Security policies allow public read access for ad spaces
- **Project Status**: Make sure your Supabase project is active (not paused)

### Google Maps API

- **Restrictions**: Update Google Maps API key restrictions to allow your production domain
- **Billing**: Ensure billing is enabled if you exceed free tier

## 🐛 Troubleshooting Deployment

### Cards Not Loading

1. **Check environment variables** are set correctly
2. **Check Supabase connection** in browser console
3. **Verify Supabase project** is active
4. **Check CORS settings** in Supabase dashboard

### Build Errors

1. **Check build logs** in deployment platform
2. **Verify all dependencies** are in `package.json`
3. **Check TypeScript errors**: `npm run build` locally first

### API Route Errors

- API routes run server-side in production
- SSL certificate issues should be resolved in production (Vercel handles this)
- If issues persist, check Supabase connection from server

## 📊 Monitoring

After deployment:

1. **Monitor error logs** in Vercel dashboard
2. **Set up error tracking** (Sentry, LogRocket, etc.)
3. **Monitor Supabase usage** in dashboard
4. **Check Google Maps API usage**

## ✅ Success Checklist

- [ ] App loads without errors
- [ ] Cards display correctly
- [ ] Search and filters work
- [ ] Cart functionality works
- [ ] Email sending works (test quote request)
- [ ] Map displays correctly
- [ ] No console errors

---

**⚠️ Current Status**: Fix local Supabase connection issues before deploying!

