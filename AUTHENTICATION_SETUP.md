# Authentication System Setup Guide

## Overview

This guide explains the complete authentication system implemented in Elfsod, including user sign-in, sign-up, role-based access control, and admin dashboard.

## Features Implemented

### 1. User Authentication
- ✅ Sign In page (`/auth/signin`)
- ✅ Sign Up page (`/auth/signup`)
- ✅ User profile management
- ✅ Session management with Supabase Auth
- ✅ Protected routes middleware

### 2. User Roles
- **Advertiser**: Default role, can browse and book ad spaces
- **Publisher**: Can list and manage their own ad spaces
- **Admin**: Full access to manage users, ad spaces, categories, etc.

### 3. Admin Dashboard
- ✅ Dashboard overview (`/admin`)
- ✅ User management (`/admin/users`)
- ✅ Ad space management (`/admin/ad-spaces`)
- ✅ Statistics and analytics
- ✅ Role-based access control

---

## Setup Instructions

### Step 1: Run Database Schema

1. Go to your Supabase Dashboard → SQL Editor
2. Run the authentication schema:

```bash
# The file is located at:
frontend/supabase/auth_schema.sql
```

This will:
- Create the `users` table linked to Supabase Auth
- Set up Row Level Security (RLS) policies
- Create triggers for automatic user profile creation
- Add admin-specific policies

### Step 2: Create Initial Admin User

1. In Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Email: `admin@elfsod.com` (or your preferred email)
4. Password: (choose a strong password)
5. Click "Create user"
6. Copy the user ID from the users list
7. Go to SQL Editor and run:

```sql
INSERT INTO public.users (id, email, full_name, user_type)
VALUES ('YOUR_USER_ID_HERE', 'admin@elfsod.com', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE SET user_type = 'admin';
```

### Step 3: Update Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Restart Development Server

```bash
cd frontend
npm run dev
```

---

## How to Access

### Sign Up
1. Navigate to: `http://localhost:3000/auth/signup`
2. Or click "Sign Up" button in the TopBar
3. Fill in the form:
   - Choose user type (Advertiser or Publisher)
   - Enter full name, email, phone
   - Set password
4. Click "Create Account"

### Sign In
1. Navigate to: `http://localhost:3000/auth/signin`
2. Or click "Sign In" button in the TopBar
3. Enter your email and password
4. Click "Sign In"

### Admin Dashboard
1. Sign in with admin account
2. Click your profile icon in TopBar
3. Click "Admin Dashboard"
4. Or navigate directly to: `http://localhost:3000/admin`

---

## Authentication Flow

### For Regular Users (Advertisers/Publishers)

1. **Unauthenticated User**:
   - Can browse ad spaces
   - Can view details
   - Cannot add to cart
   - Cannot make bookings
   - Redirected to `/auth/signin` when trying to access protected features

2. **Authenticated User**:
   - Can add items to cart
   - Can make bookings
   - Can view their bookings
   - Can manage their profile
   - Publishers can manage their ad spaces

### For Admin Users

1. **Admin Access**:
   - Full access to admin dashboard
   - Can manage all users
   - Can manage all ad spaces
   - Can manage categories and locations
   - Can view all bookings and statistics

---

## Protected Routes

### Automatically Protected Routes:
- `/admin/*` - Admin only
- `/profile/*` - Authenticated users only
- `/bookings/*` - Authenticated users only
- `/campaigns/*` - Authenticated users only
- `/cart/checkout` - Authenticated users only

### Middleware Logic:
- Checks user authentication via Supabase
- Verifies user role for admin routes
- Redirects to sign-in with return URL
- Prevents authenticated users from accessing auth pages

---

## Components Overview

### 1. AuthContext (`contexts/AuthContext.tsx`)
- Manages global authentication state
- Provides `useAuth()` hook
- Methods: `signIn()`, `signUp()`, `signOut()`
- Properties: `user`, `isAdmin`, `isPublisher`, `isAdvertiser`

### 2. TopBar (`components/layout/TopBar.tsx`)
- Shows "Sign In" / "Sign Up" buttons when logged out
- Shows user profile dropdown when logged in
- Admin users see "Admin Dashboard" link
- Includes sign out functionality

### 3. Middleware (`middleware.ts`)
- Protects routes at server level
- Checks authentication and authorization
- Redirects unauthorized users
- Handles role-based access

---

## API Routes

### Authentication APIs
These are handled by Supabase Auth automatically:
- Sign Up: `supabase.auth.signUp()`
- Sign In: `supabase.auth.signInWithPassword()`
- Sign Out: `supabase.auth.signOut()`
- Get User: `supabase.auth.getUser()`

### Admin APIs

#### Get Dashboard Stats
```
GET /api/admin/stats
Response: { stats: { totalAdSpaces, totalUsers, totalBookings, totalRevenue } }
```

#### Get All Users
```
GET /api/admin/users
Response: { users: [...] }
```

#### Update User Role
```
PATCH /api/admin/users/:id
Body: { user_type: 'admin' | 'publisher' | 'advertiser' }
Response: { user: {...} }
```

---

## Usage Examples

### Check if User is Authenticated
```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return <div>Hello {user.full_name}!</div>;
}
```

### Check if User is Admin
```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminFeature() {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return <div>Admin-only content</div>;
}
```

### Protect a Client Component
```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?redirect=/protected-page');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected Content</div>;
}
```

---

## Testing the Authentication

### Test Sign Up
1. Go to `/auth/signup`
2. Fill in all fields
3. Choose "Advertiser" or "Publisher"
4. Submit form
5. You should be automatically logged in and redirected to home

### Test Sign In
1. Go to `/auth/signin`
2. Enter email and password
3. Submit form
4. You should be redirected to home page
5. Your profile should appear in TopBar

### Test Admin Access
1. Sign in with admin account
2. Click profile dropdown in TopBar
3. Click "Admin Dashboard"
4. Verify you can access admin pages
5. Try signing in with non-admin account - should redirect to home

### Test Protected Routes
1. Sign out (click profile → Sign Out)
2. Try to access `/admin` - should redirect to sign in
3. Try to access `/profile` - should redirect to sign in
4. Sign in - should redirect back to intended page

---

## Database Tables

### users table
```sql
- id (UUID, PK, references auth.users)
- email (VARCHAR, unique)
- full_name (VARCHAR)
- phone (VARCHAR)
- company_name (VARCHAR)
- user_type (ENUM: advertiser, publisher, admin)
- profile_image_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Row Level Security (RLS)
- Users can view/update their own profile
- Admins can view/update all profiles
- Anyone can create a profile during signup
- Cart items are user-specific
- Bookings are user-specific
- Admins can manage all data

---

## Troubleshooting

### "Sign In" button not appearing
- Make sure server is restarted after adding AuthProvider
- Check browser console for errors
- Verify environment variables are set

### Redirected to home when accessing admin
- Make sure user's `user_type` is set to 'admin' in database
- Check Supabase SQL Editor: `SELECT * FROM users WHERE email = 'your-email';`
- Update user type: `UPDATE users SET user_type = 'admin' WHERE id = 'your-user-id';`

### Authentication not persisting
- Check Supabase project is active
- Verify anon key is correct
- Clear browser cookies and try again
- Check browser console for auth errors

### Can't create first admin user
1. Create user via Supabase Dashboard → Authentication
2. Get the user ID
3. Insert into users table manually with admin role
4. Sign in with that account

---

## Security Considerations

1. **Row Level Security (RLS)**: All tables have RLS policies
2. **Server-Side Validation**: Middleware checks auth on server
3. **JWT Tokens**: Supabase uses secure JWT tokens
4. **HTTPS Only**: Production should use HTTPS
5. **Role Verification**: Admin routes verify user role in database

---

## Next Steps

### Enhance Authentication
- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Add social login (Google, Facebook)
- [ ] Add two-factor authentication
- [ ] Add user profile editing page

### Enhance Admin Dashboard
- [ ] Add detailed analytics
- [ ] Add booking management
- [ ] Add category management UI
- [ ] Add location management UI
- [ ] Add publisher management
- [ ] Add reports and exports

### Enhance User Experience
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications
- [ ] Add user onboarding
- [ ] Add user activity logs

---

## Support

For issues or questions:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify database schema is correct
4. Check RLS policies are active

---

**Last Updated**: November 2025
**Version**: 1.0.0

