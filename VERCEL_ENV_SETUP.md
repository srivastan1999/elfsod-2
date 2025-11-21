# Vercel Environment Variables Setup

## Issue
If ad space creation works locally but not in deployment, it's likely because environment variables are not configured in Vercel.

## Solution

### Step 1: Get Your Supabase Credentials
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** (this is `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Step 2: Add Environment Variables in Vercel
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (`frontend`)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - Environment: Select all (Production, Preview, Development)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon/public key
   - Environment: Select all (Production, Preview, Development)

### Step 3: Redeploy
After adding the environment variables:
1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger automatic deployment

### Step 4: Verify
After redeployment, try creating an ad space again. The error messages should now be more detailed if there are still issues.

## Additional Environment Variables (if needed)

If you're using other services, you may also need:
- `GOOGLE_MAPS_API_KEY` (for location features)
- `BREVO_API_KEY` (for email sending)
- `EMAIL_FROM` (for email sending)

## Troubleshooting

### Check Vercel Logs
1. Go to your deployment in Vercel
2. Click on the deployment
3. Go to **Functions** tab
4. Check the logs for `/api/ad-spaces` route
5. Look for error messages that indicate missing environment variables

### Test Environment Variables
You can create a test API route to check if variables are set:
```typescript
// app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // Don't expose actual values in production!
  });
}
```

Then visit: `https://your-domain.vercel.app/api/test-env`

