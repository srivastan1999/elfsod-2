# Supabase Connection Troubleshooting

## Error: "Failed to fetch"

This error means your application cannot connect to Supabase. Follow these steps:

### Step 1: Check Environment Variables

1. **Check if `.env.local` exists** in the `frontend/` directory:
   ```bash
   cd frontend
   ls -la .env.local
   ```

2. **If it doesn't exist, create it**:
   ```bash
   touch .env.local
   ```

3. **Add your Supabase credentials**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Get your credentials from Supabase**:
   - Go to https://app.supabase.com
   - Select your project
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Verify Environment Variables

1. **Check the values are correct**:
   ```bash
   cd frontend
   cat .env.local
   ```

2. **Make sure there are NO spaces or quotes**:
   ```env
   # ✅ CORRECT
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # ❌ WRONG (has quotes)
   NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
   
   # ❌ WRONG (has spaces)
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   ```

### Step 3: Restart Development Server

**IMPORTANT**: After changing `.env.local`, you MUST restart your dev server:

1. **Stop the server** (Ctrl+C or Cmd+C)
2. **Start it again**:
   ```bash
   cd frontend
   npm run dev
   ```

Environment variables are only loaded when the server starts!

### Step 4: Verify Supabase Project is Active

1. Go to https://app.supabase.com
2. Check your project status
3. Make sure it says "Active" (not "Paused" or "Inactive")

### Step 5: Test Connection Directly

Open browser console and run:
```javascript
fetch('https://your-project-id.supabase.co/rest/v1/ad_spaces?select=count', {
  headers: {
    'apikey': 'your-anon-key',
    'Authorization': 'Bearer your-anon-key'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Replace `your-project-id` and `your-anon-key` with your actual values.

### Step 6: Check Browser Console

Look for these specific errors:

1. **"Failed to fetch"** → Network/CORS issue
   - Check if Supabase URL is correct
   - Check if project is active
   - Check browser network tab for blocked requests

2. **"Invalid API key"** → Wrong anon key
   - Double-check the key in `.env.local`
   - Make sure you're using the **anon/public** key, not the service_role key

3. **"Project not found"** → Wrong project URL
   - Verify the URL in Supabase dashboard
   - Make sure it includes `https://` and ends with `.supabase.co`

### Step 7: Common Issues

#### Issue: Variables not loading
**Solution**: Restart dev server after changing `.env.local`

#### Issue: Wrong file location
**Solution**: `.env.local` must be in `frontend/` directory, not root

#### Issue: Typo in variable names
**Solution**: Must be exactly:
- `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not `SUPABASE_KEY`)

#### Issue: Using service_role key
**Solution**: Use `anon/public` key for client-side, never service_role

### Step 8: Verify Setup

Run this in your browser console (on your app):
```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

If both show values, environment variables are loaded.

### Still Not Working?

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. **Check Supabase dashboard** for any service issues
3. **Verify RLS policies** are set correctly (see SUPABASE_SETUP_GUIDE.md)
4. **Check network tab** in browser DevTools for actual error response

### Quick Checklist

- [ ] `.env.local` exists in `frontend/` directory
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- [ ] No quotes or spaces around values
- [ ] Dev server restarted after adding variables
- [ ] Supabase project is active
- [ ] Using anon/public key (not service_role)

If all checked and still failing, check the browser Network tab for the actual HTTP error code and message.

