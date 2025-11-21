# Admin Portal - Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd frontend
npm install bcryptjs @types/bcryptjs
```

### 2. Run Database Schema
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste contents of `frontend/supabase/admin_schema.sql`
3. Click "Run"

### 3. Create First Admin User

**Option A: Using Script**
```bash
cd frontend
node scripts/create-admin-user.js
```

**Option B: Using API**
```bash
curl -X POST http://localhost:3000/api/admin-portal/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elfsod.com",
    "password": "admin123",
    "full_name": "Admin User",
    "role": "super_admin"
  }'
```

### 4. Access Admin Portal
1. Go to: `http://localhost:3000/admin-portal/auth/signin`
2. Sign in with your admin credentials
3. Done! 🎉

## 📍 Key URLs

- **Admin Sign In**: `/admin-portal/auth/signin`
- **Admin Dashboard**: `/admin-portal`
- **User Management**: `/admin-portal/users`
- **Ad Spaces**: `/admin-portal/ad-spaces`

## 🔑 Default Credentials

After running the setup script:
- **Email**: `admin@elfsod.com`
- **Password**: `admin123`

**⚠️ CHANGE THIS PASSWORD IN PRODUCTION!**

## 📁 Important Files

- **Schema**: `frontend/supabase/admin_schema.sql`
- **Context**: `frontend/contexts/AdminAuthContext.tsx`
- **Sign In**: `frontend/app/admin-portal/auth/signin/page.tsx`
- **Dashboard**: `frontend/app/admin-portal/page.tsx`
- **API Routes**: `frontend/app/api/admin-portal/*`

## 🔐 Authentication

- **Separate from regular users**: Uses `admin_users` table
- **Session-based**: Tokens stored in `admin_sessions` table
- **7-day expiry**: Sessions expire after 7 days
- **Secure**: Passwords hashed with bcrypt

## 🆘 Troubleshooting

**"Unauthorized" error?**
- Check if admin user exists: `SELECT * FROM admin_users;`
- Verify schema was run: Check for `admin_users` and `admin_sessions` tables

**Can't sign in?**
- Verify password is correct
- Check if user is active: `SELECT is_active FROM admin_users WHERE email = 'your@email.com';`

**Session not persisting?**
- Check browser console for errors
- Verify token in localStorage: `localStorage.getItem('elfsod-admin-token')`

## 📚 Full Documentation

See `ADMIN_PORTAL_SETUP.md` for complete documentation.

