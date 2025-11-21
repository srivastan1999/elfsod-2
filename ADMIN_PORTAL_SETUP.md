# Admin Portal Setup Guide

This guide explains how to set up the separate admin portal with its own authentication system.

## Overview

The admin portal is completely separate from the regular user authentication:
- **Separate Table**: `admin_users` table (not linked to Supabase Auth)
- **Separate Authentication**: Custom session-based authentication
- **Separate Routes**: `/admin-portal/*` (separate from `/admin/*`)
- **Separate Context**: `AdminAuthContext` (separate from `AuthContext`)

## Setup Instructions

### Step 1: Run Database Schema

1. Go to your Supabase Dashboard → SQL Editor
2. Run the admin schema:

```sql
-- The file is located at:
frontend/supabase/admin_schema.sql
```

This will create:
- `admin_users` table for admin accounts
- `admin_sessions` table for managing admin sessions
- Required indexes and triggers

### Step 2: Install Dependencies

```bash
cd frontend
npm install bcryptjs @types/bcryptjs
```

### Step 3: Create First Admin User

You have two options:

#### Option A: Using the Script (Recommended)

```bash
cd frontend
node scripts/create-admin-user.js
```

Or set environment variables in `.env.local`:
```env
ADMIN_EMAIL=admin@elfsod.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Admin User
ADMIN_ROLE=super_admin
```

#### Option B: Using the API Endpoint

```bash
curl -X POST http://localhost:3000/api/admin-portal/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elfsod.com",
    "password": "your-secure-password",
    "full_name": "Admin User",
    "role": "super_admin"
  }'
```

#### Option C: Manual SQL (Not Recommended)

```sql
-- Hash password using bcrypt in Node.js first:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your-password', 10);

INSERT INTO public.admin_users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@elfsod.com',
  '$2b$10$YOUR_HASHED_PASSWORD_HERE',
  'Admin User',
  'super_admin',
  true
);
```

### Step 4: Access Admin Portal

1. Navigate to: `http://localhost:3000/admin-portal/auth/signin`
2. Sign in with your admin credentials
3. You'll be redirected to the admin dashboard

## File Structure

```
frontend/
├── app/
│   ├── admin-portal/              # Admin portal routes
│   │   ├── auth/
│   │   │   └── signin/            # Admin sign-in page
│   │   ├── layout.tsx             # Admin portal layout
│   │   ├── page.tsx               # Admin dashboard
│   │   ├── users/                 # User management
│   │   └── ...
│   └── api/
│       └── admin-portal/          # Admin portal API routes
│           ├── auth/
│           │   ├── signin/         # Admin sign-in API
│           │   ├── signout/        # Admin sign-out API
│           │   ├── verify/        # Session verification
│           │   └── create-admin/  # Create admin user
│           ├── stats/              # Dashboard statistics
│           └── users/              # User management API
├── contexts/
│   └── AdminAuthContext.tsx       # Admin authentication context
├── components/
│   └── admin/
│       └── AdminSidebar.tsx        # Admin sidebar navigation
├── lib/
│   └── admin/
│       └── auth.ts                # Admin auth utilities
└── supabase/
    └── admin_schema.sql           # Admin database schema
```

## Authentication Flow

### Admin Sign In

1. Admin enters email/password on `/admin-portal/auth/signin`
2. API verifies credentials against `admin_users` table
3. If valid, creates session in `admin_sessions` table
4. Returns token to client
5. Token stored in `localStorage` and cookies
6. Admin redirected to dashboard

### Session Management

- Sessions expire after 7 days
- Token stored in:
  - `localStorage` (client-side access)
  - Cookies (server-side access via middleware)
- Middleware automatically verifies session on each request
- Expired sessions redirect to sign-in

### API Authentication

All admin API routes require:
```
Authorization: Bearer <token>
```

The token is verified against `admin_sessions` table.

## Admin Roles

- **admin**: Standard admin access
- **super_admin**: Full access (can manage other admins)

## Security Notes

1. **Change Default Password**: Always change the default admin password in production
2. **HTTPS Only**: Use HTTPS in production to protect session tokens
3. **Session Expiry**: Sessions expire after 7 days (configurable in code)
4. **Password Hashing**: Passwords are hashed using bcrypt (10 rounds)
5. **RLS Policies**: Row Level Security is enabled on admin tables

## Troubleshooting

### "Unauthorized" Error

- Check if admin user exists in `admin_users` table
- Verify password is correct
- Check if session token is valid and not expired
- Ensure `admin_schema.sql` has been run

### "Table does not exist" Error

- Run `frontend/supabase/admin_schema.sql` in Supabase SQL Editor
- Verify table names: `admin_users`, `admin_sessions`

### Session Not Persisting

- Check browser localStorage for `elfsod-admin-token`
- Check cookies for `elfsod-admin-token`
- Verify middleware is checking both localStorage and cookies

### Cannot Access Admin Portal

- Ensure you're using `/admin-portal/*` routes (not `/admin/*`)
- Check middleware is not blocking the route
- Verify admin session token is valid

## Differences from Regular Auth

| Feature | Regular Users | Admin Portal |
|---------|--------------|--------------|
| Authentication | Supabase Auth | Custom Session |
| Table | `users` (linked to `auth.users`) | `admin_users` (standalone) |
| Routes | `/auth/*`, `/profile/*` | `/admin-portal/*` |
| Context | `AuthContext` | `AdminAuthContext` |
| Session | Supabase session | Custom token in `admin_sessions` |

## Next Steps

1. Create additional admin users as needed
2. Customize admin dashboard pages
3. Add more admin management features
4. Set up admin activity logging (optional)
5. Configure email notifications for admin actions (optional)

