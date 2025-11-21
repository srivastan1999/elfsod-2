# Application Architecture

## Overview

This is a **single Next.js application** that handles both frontend and backend logic.

## Structure

```
frontend/
├── app/
│   ├── api/                    # Backend API routes (server-side)
│   │   ├── ad-spaces/
│   │   │   └── route.ts        # GET /api/ad-spaces
│   │   ├── categories/
│   │   │   └── route.ts        # GET /api/categories
│   │   ├── publishers/
│   │   │   └── route.ts        # GET /api/publishers
│   │   ├── quote/
│   │   │   └── route.ts        # POST /api/quote (email sending)
│   │   └── ...
│   ├── page.tsx                # Home page
│   ├── search/
│   │   └── page.tsx            # Search page
│   └── ...
├── components/                 # React components
├── lib/
│   └── supabase/
│       ├── client.ts           # Browser-side Supabase client
│       ├── server.ts           # Server-side Supabase client
│       └── services/            # Service layer (optional, for direct calls)
└── store/                      # Zustand state management
```

## How It Works

### API Routes (Backend Logic)

All backend logic is in `app/api/` routes:
- **Server-side execution**: Runs on the Next.js server
- **No CORS issues**: Same origin, no CORS needed
- **Supabase integration**: Uses server-side Supabase client
- **Direct database access**: Queries Supabase directly

### Frontend Pages

Frontend pages call API routes:
```typescript
// In a component
const response = await fetch('/api/ad-spaces?city=Mumbai');
const result = await response.json();
```

### Fallback Strategy

If API routes fail, frontend falls back to direct Supabase calls:
```typescript
try {
  // Try API route first
  const response = await fetch('/api/ad-spaces');
  // ...
} catch {
  // Fallback to direct Supabase service
  const spaces = await getAdSpaces();
}
```

## Benefits

1. **Single Application**: Everything in one Next.js app
2. **No Separate Backend**: No need to run separate Node.js server
3. **No CORS Issues**: API routes are same-origin
4. **Easy Deployment**: Deploy as single Next.js app
5. **Type Safety**: Shared TypeScript types
6. **Better Performance**: Server-side rendering and API routes

## API Endpoints

- `GET /api/ad-spaces` - Get ad spaces (with filters)
- `GET /api/categories` - Get all categories
- `GET /api/publishers` - Get all publishers
- `POST /api/quote` - Send quote request email

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Running the Application

```bash
cd frontend
npm run dev
```

That's it! No separate backend server needed.

