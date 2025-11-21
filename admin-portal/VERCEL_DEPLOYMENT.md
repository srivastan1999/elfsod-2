# Vercel Deployment Guide for Admin Portal

## Setting Up Environment Variables on Vercel

The admin portal requires environment variables to be set in Vercel's dashboard. Without these, you'll get a "Database configuration error" (500 error).

### Step 1: Go to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create a new one for the admin portal)
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Required Environment Variables

Add these three environment variables:

#### 1. `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Your Supabase project URL
- **Example**: `https://your-project.supabase.co`
- **Environments**: Production, Preview, Development (select all)

#### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon/public key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Environments**: Production, Preview, Development (select all)

#### 3. `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your Supabase service_role key (the secret one)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Environments**: Production, Preview, Development (select all)
- **⚠️ Important**: This is a secret key - never expose it publicly

### Step 3: Where to Find These Values

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

### Step 5: Verify Deployment

1. Check the deployment logs for any errors
2. Try accessing: `https://your-app.vercel.app/auth/signin`
3. Check browser console (F12) for any errors
4. Check Vercel function logs for detailed error messages

## Troubleshooting

### "Database configuration error" (500 error)

**Cause**: Environment variables not set in Vercel

**Solution**:
1. Verify all 3 environment variables are set in Vercel dashboard
2. Make sure they're enabled for the correct environments (Production/Preview/Development)
3. Redeploy after adding variables

### "Invalid email or password"

**Cause**: Admin user doesn't exist in database

**Solution**:
1. Create an admin user using the create-admin script locally
2. Or use the API endpoint: `POST /api/auth/create-admin` (only works if endpoint is accessible)

### Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → **Functions** tab
2. Click on a function (e.g., `/api/auth/signin`)
3. Check the **Logs** tab for detailed error messages

### Common Issues

1. **Environment variables not applied**: Redeploy after adding them
2. **Wrong environment**: Make sure variables are set for Production environment
3. **Typo in variable name**: Double-check spelling (case-sensitive)
4. **Missing service role key**: This is required for admin operations

## Quick Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel
- [ ] All variables enabled for Production environment
- [ ] Redeployed after adding variables
- [ ] Admin user exists in database
- [ ] Checked Vercel function logs for errors

## Security Notes

- ✅ `NEXT_PUBLIC_*` variables are safe to expose (they're public)
- 🔒 `SUPABASE_SERVICE_ROLE_KEY` is secret - only used server-side
- ⚠️ Never commit `.env.local` to git (it's in .gitignore)
- 🔐 Service role key bypasses RLS - keep it secure!

