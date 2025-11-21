# Supabase Backend Setup Guide - Step by Step

This guide will walk you through setting up the complete Supabase backend for the Elfsod application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Your Supabase project created

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Fill in the project details:
   - **Name**: `elfsod` (or any name you prefer)
   - **Database Password**: Create a strong password (save it securely)
   - **Region**: Choose closest to your users (e.g., `Southeast Asia (Mumbai)`)
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

---

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

4. Copy these values - you'll need them for your `.env.local` file

---

## Step 3: Set Up Environment Variables

1. In your project root (`frontend/` directory), create or edit `.env.local`:

```bash
cd frontend
nano .env.local  # or use your preferred editor
```

2. Add these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace:
   - `your-project-id` with your actual project ID
   - `your-anon-key-here` with your actual anon key

4. Save the file

---

## Step 4: Run the Database Schema

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **"New query"** button (top right)
3. Open the file `frontend/supabase/updated_schema.sql` in your code editor
4. Copy **ALL** the contents of `updated_schema.sql`
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

**Expected Result**: You should see "Success. No rows returned" or similar success message.

**What this does**: Creates all the database tables:
- `categories` - Ad space categories
- `locations` - Geographic locations
- `publishers` - Advertising publishers
- `ad_spaces` - Main ad space inventory
- `quote_requests` - Quote request tracking
- `cart_items` - Shopping cart items
- `bookings` - Booking records

---

## Step 5: Verify Tables Were Created

1. In Supabase dashboard, click on **Table Editor** in the left sidebar
2. You should see all the tables listed:
   - categories
   - locations
   - publishers
   - ad_spaces
   - quote_requests
   - cart_items
   - bookings

If you see all tables, proceed to Step 6. If not, go back to Step 4 and check for errors.

---

## Step 6: Seed the Database with Sample Data

1. In Supabase dashboard, go back to **SQL Editor**
2. Click **"New query"** again
3. Open the file `frontend/supabase/seed_data.sql` in your code editor
4. Copy **ALL** the contents of `seed_data.sql`
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** button

**Expected Result**: You should see success messages for each INSERT statement.

**What this does**: Populates your database with:
- 6 Categories (Billboard, Digital Screen, Bus Station, etc.)
- 7 Publishers (Times OOH, JCDecaux, Clear Channel, etc.)
- 14 Locations (Mumbai, Bengaluru, Delhi)
- 15 Ad Spaces with realistic data

---

## Step 7: Verify the Data Was Inserted

Run these verification queries in the SQL Editor:

### Check Categories
```sql
SELECT COUNT(*) as category_count FROM categories;
```
**Expected**: Should return `6`

### Check Publishers
```sql
SELECT COUNT(*) as publisher_count FROM publishers;
```
**Expected**: Should return `7`

### Check Locations
```sql
SELECT COUNT(*) as location_count FROM locations;
```
**Expected**: Should return `14`

### Check Ad Spaces
```sql
SELECT COUNT(*) as ad_space_count FROM ad_spaces;
```
**Expected**: Should return `15`

### View Sample Ad Spaces
```sql
SELECT 
  a.id,
  a.title,
  c.name as category,
  l.city,
  l.address,
  p.name as publisher,
  a.price_per_day,
  a.availability_status
FROM ad_spaces a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN locations l ON a.location_id = l.id
LEFT JOIN publishers p ON a.publisher_id = p.id
ORDER BY a.created_at DESC
LIMIT 5;
```

This should show 5 ad spaces with all their related data.

---

## Step 8: Configure Row Level Security (RLS)

By default, Supabase enables RLS. For this application, we'll allow public read access to most tables.

### Enable Public Read Access

Run these queries in the SQL Editor:

```sql
-- Allow public read access to categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

-- Allow public read access to locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to locations"
  ON locations FOR SELECT
  USING (true);

-- Allow public read access to publishers
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to publishers"
  ON publishers FOR SELECT
  USING (true);

-- Allow public read access to ad_spaces
ALTER TABLE ad_spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to ad_spaces"
  ON ad_spaces FOR SELECT
  USING (true);

-- Allow public insert to quote_requests
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to quote_requests"
  ON quote_requests FOR INSERT
  WITH CHECK (true);

-- Allow public read/write to cart_items (for now)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to cart_items"
  ON cart_items FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Note**: In production, you should restrict access based on user authentication. This setup allows public access for development.

---

## Step 9: Test the Connection

1. Make sure your `.env.local` file has the correct credentials
2. Restart your Next.js development server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Visit `http://localhost:3000`
4. You should see ad spaces loading from your Supabase database

### Troubleshooting

If you see errors:

1. **Check environment variables**:
   ```bash
   # In frontend directory
   cat .env.local
   ```
   Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly.

2. **Check browser console**:
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Look for Supabase connection errors

3. **Verify Supabase project is active**:
   - Go to Supabase dashboard
   - Make sure project status is "Active"

4. **Test direct query**:
   In Supabase SQL Editor, run:
   ```sql
   SELECT * FROM ad_spaces LIMIT 1;
   ```
   If this works, the database is fine. The issue is likely with environment variables.

---

## Step 10: Verify Everything Works

### Test Home Page
1. Visit `http://localhost:3000`
2. You should see ad spaces from the database
3. Categories should load from database

### Test Search Page
1. Visit `http://localhost:3000/search`
2. Search should work
3. Filters should work
4. Map should show ad spaces

### Test Ad Space Detail
1. Click on any ad space card
2. Detail page should load with data from database

### Test Quote Request
1. Add items to cart
2. Go to cart page
3. Click "Request Quote"
4. Check Supabase dashboard → Table Editor → `quote_requests`
5. You should see a new row with your quote request

---

## Database Structure Overview

### Tables and Their Purpose

1. **categories**
   - Stores ad space categories (Billboard, Digital Screen, etc.)
   - Used for filtering and categorization

2. **locations**
   - Stores geographic locations (cities, addresses, coordinates)
   - Used for location-based filtering and map display

3. **publishers**
   - Stores advertising publishers/companies
   - Used for publisher filtering

4. **ad_spaces**
   - Main table storing all ad space inventory
   - Links to categories, locations, and publishers
   - Contains pricing, impressions, availability

5. **quote_requests**
   - Stores quote requests from users
   - Contains cart items, totals, status

6. **cart_items**
   - Stores shopping cart items
   - Links to ad spaces and quote requests

7. **bookings**
   - Stores confirmed bookings (for future use)

---

## Common Issues and Solutions

### Issue: "Failed to fetch" errors
**Solution**: Check your `.env.local` file has correct Supabase URL and key

### Issue: "No rows returned" when querying
**Solution**: Make sure you ran the seed data script (Step 6)

### Issue: "Permission denied" errors
**Solution**: Make sure you ran the RLS policies (Step 8)

### Issue: Tables not showing in Table Editor
**Solution**: Refresh the page, or check SQL Editor for errors from Step 4

### Issue: UUID errors in seed data
**Solution**: Make sure you're using `seed_data.sql` (not `seed_data_fixed.sql` or old versions)

---

## Next Steps

Once everything is set up:

1. **Add more data**: You can add more ad spaces, locations, etc. through the Supabase dashboard
2. **Set up authentication**: Add user authentication for better security
3. **Configure email**: Set up email service for quote notifications
4. **Monitor usage**: Use Supabase dashboard to monitor database usage and performance

---

## Quick Reference

### Important Files
- `frontend/supabase/updated_schema.sql` - Database schema
- `frontend/supabase/seed_data.sql` - Sample data
- `frontend/.env.local` - Environment variables

### Important URLs
- Supabase Dashboard: `https://app.supabase.com`
- SQL Editor: Dashboard → SQL Editor
- Table Editor: Dashboard → Table Editor
- API Settings: Dashboard → Settings → API

### Environment Variables Needed
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Support

If you encounter issues:
1. Check the Supabase dashboard for error logs
2. Check browser console for client-side errors
3. Verify all steps were completed correctly
4. Check that environment variables are set correctly

Your Supabase backend is now fully set up! 🎉

