# 🔐 Unified Authentication System

## Overview

The application now uses a **single authentication token** across all parts of the application:
- ✅ Client-side components
- ✅ Server-side API routes  
- ✅ Middleware
- ✅ Server components

## How It Works

### Token Storage & Sync

1. **Client Side (Browser)**
   - Session stored in `localStorage` (key: `elfsod-auth-token`)
   - Managed by `createBrowserClient` from `@supabase/ssr`
   - Used by all client components via `AuthContext`

2. **Server Side (Middleware & API Routes)**
   - Session read from **cookies**
   - Managed by `createServerClient` from `@supabase/ssr`
   - Automatically synced from localStorage by Supabase SSR

3. **Automatic Sync**
   - When user signs in → Session stored in localStorage
   - Supabase SSR automatically writes session to cookies
   - Middleware and API routes read from cookies
   - **Same token everywhere!**

## Architecture

```
┌─────────────────────────────────────────────────┐
│           User Signs In                         │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  AuthContext (Client)                           │
│  - Stores in localStorage                       │
│  - Key: 'elfsod-auth-token'                     │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Supabase SSR Auto-Sync                        │
│  - localStorage → cookies                       │
│  - Happens automatically                        │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐   ┌──────────────────┐
│ Middleware   │   │  API Routes      │
│ (cookies)    │   │  (cookies)       │
└──────────────┘   └──────────────────┘
```

## Usage Examples

### Client Component
```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, loading } = useAuth();
  // Uses localStorage session
}
```

### API Route
```tsx
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Uses cookie session (same token!)
}
```

### Middleware
```tsx
// Automatically uses cookie session
const { data: { user } } = await supabase.auth.getUser();
```

## Key Files

- **`lib/supabase/client.ts`** - Browser client (localStorage)
- **`lib/supabase/server.ts`** - Server client (cookies)  
- **`contexts/AuthContext.tsx`** - Global auth state
- **`middleware.ts`** - Route protection
- **`lib/auth/getAuthUser.ts`** - Unified utilities

## Verification

To verify the same token is used:

1. **Sign in** → Check localStorage: `elfsod-auth-token`
2. **Check cookies** → Should see Supabase auth cookies
3. **API request** → Uses same token from cookies
4. **Middleware** → Uses same token from cookies

All use the **SAME session token**! 🎯

