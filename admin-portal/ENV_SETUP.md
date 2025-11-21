# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the `admin-portal/` directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## How to Get These Values

### 1. Supabase URL and Anon Key
- Go to **Supabase Dashboard** → **Settings** → **API**
- Copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Service Role Key (REQUIRED for Admin Operations)
- Same page: **Settings** → **API**
- Copy the **service_role** key (the long one, NOT anon key)
- This is required to bypass RLS policies for admin operations

## Quick Setup

1. **Copy from frontend** (if you have it):
   ```bash
   cd admin-portal
   cp ../frontend/.env.local .env.local
   # Then add SUPABASE_SERVICE_ROLE_KEY manually
   ```

2. **Or create manually**:
   ```bash
   cd admin-portal
   nano .env.local
   # Paste the three variables above
   ```

3. **Verify setup**:
   ```bash
   node scripts/check-env.js
   ```

## Important Notes

- ⚠️ **Never commit `.env.local` to git** (it's in .gitignore)
- 🔒 **Service role key bypasses all RLS** - keep it secret!
- ✅ **Service role key is safe** because it's only used server-side

## After Setup

Restart your dev server:
```bash
npm run dev
```

Now try creating an ad space - it should work!

