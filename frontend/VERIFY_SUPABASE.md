# Verify Supabase Configuration

## Your Supabase URL
```
https://vavubezjuqnkrvndtowt.supabase.co
```

## Steps to Verify

### 1. Check .env.local File

Make sure your `.env.local` file in `frontend/` directory has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vavubezjuqnkrvndtowt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Get Your Anon Key

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **anon/public** key (long string starting with `eyJ...`)
5. Add it to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Restart Dev Server

**CRITICAL**: After updating `.env.local`:

```bash
# Stop server (Ctrl+C)
cd frontend
npm run dev
```

### 4. Test Connection

Visit in browser:
```
http://localhost:3001/api/test-connection
```

Should return:
```json
{
  "success": true,
  "message": "Successfully connected to Supabase"
}
```

### 5. Test Ad Spaces API

Visit:
```
http://localhost:3001/api/ad-spaces?limit=5
```

Should return ad spaces data.

### 6. Check Home Page

After restarting, visit:
```
http://localhost:3001
```

Cards should appear!

## Common Issues

### Issue: Still getting "fetch failed"
**Solution**: 
1. Double-check the anon key is correct
2. Make sure project is "Active" in Supabase dashboard
3. Verify no typos in `.env.local`

### Issue: "Invalid API key"
**Solution**: Make sure you're using the **anon/public** key, not service_role key

### Issue: Cards still not showing
**Solution**: 
1. Check browser console for errors
2. Check Network tab to see API calls
3. Verify seed data is loaded in Supabase

