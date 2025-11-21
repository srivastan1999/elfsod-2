# Quick Guide: Create Ad Spaces for Categories

## Option 1: Run SQL Script (Recommended - Fastest)

1. Open **Supabase Dashboard** → Your Project → **SQL Editor**
2. Copy the entire contents of `supabase/fix_rls_and_create_adspaces.sql`
3. Paste and click **Run**
4. Done! ✅

This will:
- Fix RLS policy to allow inserts
- Create 2 ad spaces for each category (16 total)
- Show verification results

## Option 2: Use API (After fixing RLS)

After running the SQL script once, you can use the API:

```bash
# The API endpoint is ready at:
POST /api/ad-spaces
```

## What Gets Created

- **Corporate**: 2 ad spaces
- **Event Venue**: 2 ad spaces  
- **Grocery Store**: 2 ad spaces
- **Hotel**: 2 ad spaces
- **Mall**: 2 ad spaces
- **Metro**: 2 ad spaces
- **Office Tower**: 2 ad spaces
- **Restaurant**: 2 ad spaces

**Total: 16 new ad spaces**

## After Running

Your categories will show:
- Corporate: 2 spaces
- Event Venue: 2 spaces
- Grocery Store: 2 spaces
- Hotel: 2 spaces
- Mall: 2 spaces
- Metro: 2 spaces
- Office Tower: 2 spaces
- Restaurant: 2 spaces

