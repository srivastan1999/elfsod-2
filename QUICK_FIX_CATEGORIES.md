# Quick Fix: Categories Not Showing

Your website shows "No categories available" because the database is empty.

## ✅ Solution: Run SQL Files in Supabase

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Sign in
3. Open your project: **zcqqfkuezoxumchbslqw**

### Step 2: Open SQL Editor

1. Click on "SQL Editor" in the left sidebar
2. Click "New Query"

### Step 3: Create Categories

1. Open the file: `frontend/supabase/create_categories.sql`
2. Copy ALL the content
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl/Cmd + Enter)

You should see: **"Success. 12 rows"**

### Step 4: Create Ad Spaces

1. Open the file: `frontend/supabase/create_sample_adspaces.sql`
2. Copy ALL the content
3. Paste into Supabase SQL Editor  
4. Click **"Run"**

You should see: **"Success"**

### Step 5: Verify

Run this in SQL Editor to verify:

```sql
-- Check categories
SELECT COUNT(*) as total FROM categories;

-- Check ad spaces
SELECT COUNT(*) as total FROM ad_spaces;

-- View categories
SELECT * FROM categories ORDER BY name;
```

You should see:
- 12 categories
- 18 ad spaces

### Step 6: Refresh Your Website

1. Go back to http://localhost:3000
2. Press **Ctrl+Shift+R** (hard refresh)
3. You should now see:
   - 12 category cards with emojis
   - Ad space counts
   - 18 ad space cards

## 🎯 The files you need to run:

1. **First:** `frontend/supabase/create_categories.sql`
2. **Second:** `frontend/supabase/create_sample_adspaces.sql`

## ❓ Still not working?

Check browser console (F12) for errors and share the error message.

## 📝 Note

The categories MUST be created in Supabase (the cloud database), not locally. The SQL files need to be run in the Supabase SQL Editor web interface.

