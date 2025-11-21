# Elfsod Setup Guide

## Quick Start

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be created (takes 1-2 minutes)
3. Go to **SQL Editor** in the Supabase dashboard
4. Copy and paste the entire contents of `frontend/supabase/schema.sql`
5. Click **Run** to execute the schema
6. Go to **Settings > API** and copy:
   - Project URL
   - `anon` `public` key

### 2. Environment Variables

Create `.env.local` in the `frontend` directory:

```bash
cd frontend
touch .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install and Run

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Color Codes Verification

All colors match the documentation:

- ✅ Primary Red: `#E91E63` - Used for buttons, highlights
- ✅ Primary Pink: `#F50057` - Used for selected states
- ✅ Primary Blue: `#1976D2` / `#2196F3` - Used in AI Planner, links
- ✅ Success Green: `#4CAF50` - Used for availability badges
- ✅ Grey: `#757575` - Used for text, borders
- ✅ Black: `#000000` - Headers, primary text
- ✅ White: `#FFFFFF` - Backgrounds

## Features Implemented

### ✅ Home Screen
- Location picker with dropdown
- Category selector (horizontal scroll)
- Promotional banner
- Recommended ad spaces grid

### ✅ Search Screen
- Real-time search bar
- Interactive map with Leaflet
- Billboard markers (red pins)
- Selected marker highlighting (blue)
- Pop-up cards on marker click
- List/Map view toggle

### ✅ AI Planner
- 6-step wizard with progress bar
- Step 1: Campaign goal selection
- Step 2: Product description
- Step 4: Budget selection
- Navigation buttons (Back/Continue)

### ✅ Design Page
- Coming Soon placeholder
- Centered design with icon

### ✅ Cart Page
- Cart items display
- Date selection
- Booking summary
- Total calculation
- Empty cart state

### ✅ Ad Space Detail
- Full ad space information
- Audience & Reach metrics
- Pricing table
- Date selection
- Book Now button

## Database Tables Created

- `users` - User accounts
- `categories` - Ad space categories
- `locations` - Geographic locations
- `publishers` - Ad space publishers
- `ad_spaces` - Advertising spaces
- `campaigns` - AI Planner campaigns
- `cart_items` - Shopping cart
- `bookings` - Completed bookings

## Next Steps

1. **Add Sample Data**: Insert some test ad spaces into Supabase
2. **Authentication**: Implement user login/register
3. **Payment**: Add Razorpay integration
4. **AI Recommendations**: Complete the recommendation engine
5. **Advanced Filters**: Implement the full filter panel

## Testing the Application

1. Start the dev server: `npm run dev`
2. Navigate to home page - should see location picker
3. Click on Search - should see map (may need to zoom/pan)
4. Click on AI Planner - should see step 1
5. Click on Cart - should see empty cart message
6. Click on Design - should see "Coming Soon"

## Troubleshooting

### Map not showing?
- Check browser console for errors
- Ensure Leaflet CSS is loaded
- Try refreshing the page

### Supabase connection issues?
- Verify `.env.local` has correct values
- Check Supabase project is active
- Ensure RLS policies allow public read access

### Colors not matching?
- Check `app/globals.css` has correct color variables
- Clear browser cache
- Restart dev server

## Project Structure

```
frontend/
├── app/                    # Pages
│   ├── page.tsx           # Home
│   ├── search/            # Search with map
│   ├── ai-planner/        # AI Planner
│   ├── design/            # Coming Soon
│   ├── cart/              # Cart
│   └── ad-space/[id]/     # Detail page
├── components/             # React components
├── lib/supabase/          # Supabase clients
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── supabase/schema.sql    # Database schema
```

## Support

For issues or questions, refer to:
- `ELFSOD_COMPLETE_PROJECT_DOCUMENTATION.md` - Full documentation
- `frontend/README.md` - Frontend-specific docs
- Supabase docs: https://supabase.com/docs

