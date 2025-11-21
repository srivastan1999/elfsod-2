# Elfsod - Frontend Application

Next.js application for the Elfsod advertising inventory aggregator platform with Supabase backend.

## Features

- ✅ Home screen with location picker
- ✅ Ad space listing with categories
- ✅ Search screen with interactive map
- ✅ AI Planner (6-step wizard)
- ✅ Design section (Coming Soon)
- ✅ Cart with booking summary
- ✅ Supabase integration for backend and database

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Maps**: React Leaflet
- **Icons**: Lucide React

## Color Palette

The application uses the exact color codes from the documentation:

- **Primary Red/Pink**: #E91E63 / #F50057
- **Primary Blue**: #1976D2 / #2196F3
- **Success Green**: #4CAF50
- **Grey**: #757575
- **Black**: #000000
- **White**: #FFFFFF

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key (optional)
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── search/            # Search page
│   ├── ai-planner/        # AI Planner wizard
│   ├── design/            # Design (Coming Soon)
│   ├── cart/              # Cart page
│   └── ad-space/[id]/     # Ad space detail page
├── components/
│   ├── common/            # Shared components
│   └── search/           # Search-specific components
├── lib/
│   └── supabase/         # Supabase client setup
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── supabase/
    └── schema.sql         # Database schema
```

## Database Schema

The database schema is defined in `supabase/schema.sql`. Key tables:

- `users` - User accounts
- `ad_spaces` - Advertising spaces
- `categories` - Ad space categories
- `locations` - Geographic locations
- `campaigns` - AI Planner campaigns
- `cart_items` - Shopping cart items
- `bookings` - Completed bookings

## Features Implementation

### Home Screen
- Location picker with city selection
- Category selector (horizontal scroll)
- Promotional banner
- Recommended ad spaces grid

### Search Screen
- Real-time search
- Map view with billboard markers
- List view toggle
- Filter panel (UI ready)

### AI Planner
- 6-step wizard
- Campaign goal selection
- Product description input
- Budget selection
- Date selection

### Cart
- Item management
- Date selection per item
- Booking summary
- Total calculation

## Development

### Adding New Features

1. Create components in `components/` directory
2. Add pages in `app/` directory
3. Update types in `types/index.ts`
4. Add store logic in `store/` if needed

### Styling

All colors are defined in `app/globals.css` using CSS variables. Use Tailwind classes with the color names:

- `text-[#E91E63]` for primary red
- `bg-[#2196F3]` for primary blue
- `border-[#E0E0E0]` for borders

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Next Steps

- [ ] Implement authentication
- [ ] Add payment integration (Razorpay)
- [ ] Complete AI recommendation engine
- [ ] Add advanced filtering
- [ ] Implement design upload (when ready)

## License

Proprietary - All rights reserved
