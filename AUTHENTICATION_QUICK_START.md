# Authentication Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Run the Auth Schema (2 minutes)

1. Open Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"New query"**
5. Copy and paste the entire content from: `frontend/supabase/auth_schema.sql`
6. Click **"Run"** (or press Ctrl+Enter)
7. Wait for "Success" message

### Step 2: Access the Pages (1 minute)

Now you can access:

✅ **Sign Up**: http://localhost:3000/auth/signup
✅ **Sign In**: http://localhost:3000/auth/signin
✅ **Admin Dashboard**: http://localhost:3000/admin (after creating admin user)

### Step 3: Create Your First User (1 minute)

**Option A: Via Sign Up Page**
1. Go to http://localhost:3000/auth/signup
2. Fill in the form
3. Click "Create Account"
4. You're automatically logged in!

**Option B: Via Supabase Dashboard**
1. Supabase → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. Click "Create user"

### Step 4: Create Admin User (1 minute)

1. Create a user (via Option A or B above)
2. Copy the user's ID from Supabase Dashboard → Authentication → Users
3. Go to Supabase → SQL Editor
4. Run this query:

```sql
UPDATE users 
SET user_type = 'admin' 
WHERE email = 'your-email@example.com';
```

5. Sign in with that account
6. You'll see "Admin Dashboard" in your profile menu!

---

## 📍 Where to Find Everything

### Pages Created:
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/ad-spaces` - Ad space management

### Files Created:
- `contexts/AuthContext.tsx` - Authentication state
- `middleware.ts` - Route protection
- `supabase/auth_schema.sql` - Database schema
- `app/api/admin/*` - Admin API routes

### Updated Files:
- `app/layout.tsx` - Added AuthProvider
- `components/layout/TopBar.tsx` - Shows user profile
- `app/cart/page.tsx` - Requires authentication

---

## 🔐 How Authentication Works

### When Logged Out:
- TopBar shows: **"Sign In"** and **"Sign Up"** buttons
- Can browse ad spaces
- Cannot access cart, bookings, or admin
- Redirected to sign-in when accessing protected pages

### When Logged In:
- TopBar shows: **Profile picture** with name
- Can add to cart and make bookings
- Access to profile and bookings
- Admins see "Admin Dashboard" option

### Protected Routes:
- `/cart` - Requires login
- `/admin/*` - Requires admin role
- `/profile` - Requires login
- `/bookings` - Requires login

---

## 🎯 Quick Tests

### Test 1: Sign Up
```
1. Go to: http://localhost:3000/auth/signup
2. Fill in form (choose Advertiser)
3. Submit
4. ✓ Should be logged in and see profile in TopBar
```

### Test 2: Sign In
```
1. Sign out (click profile → Sign Out)
2. Go to: http://localhost:3000/auth/signin
3. Enter credentials
4. Submit
5. ✓ Should be logged in and redirected
```

### Test 3: Protected Route
```
1. Sign out
2. Try to access: http://localhost:3000/cart
3. ✓ Should redirect to sign-in
4. Sign in
5. ✓ Should redirect back to cart
```

### Test 4: Admin Access
```
1. Sign in with admin account
2. Click profile dropdown
3. ✓ Should see "Admin Dashboard"
4. Click it
5. ✓ Should open admin dashboard
```

---

## 🛠️ Troubleshooting

### "Sign In button not showing in TopBar"
**Fix**: Restart your development server
```bash
cd frontend
# Stop server (Ctrl+C)
npm run dev
```

### "Redirected to home when accessing /admin"
**Fix**: Make sure your user is an admin
```sql
-- Check user type
SELECT email, user_type FROM users WHERE email = 'your-email@example.com';

-- Make user admin
UPDATE users SET user_type = 'admin' WHERE email = 'your-email@example.com';
```

### "Can't see auth pages"
**Fix**: The pages are at:
- http://localhost:3000/auth/signin (not /signin)
- http://localhost:3000/auth/signup (not /signup)

### "User created but no profile in database"
**Fix**: The trigger should create it automatically. If not:
```sql
-- Manually insert profile
INSERT INTO users (id, email, full_name, user_type)
VALUES ('user-id-from-auth', 'email@example.com', 'Full Name', 'advertiser');
```

---

## 📝 User Roles

### Advertiser (Default)
- Browse ad spaces
- Add to cart
- Make bookings
- View own bookings

### Publisher
- All advertiser features
- List own ad spaces
- Manage own ad spaces

### Admin
- All features
- Manage all users
- Manage all ad spaces
- View all bookings
- Access admin dashboard

---

## 🎨 UI Components

### Sign In Page Features:
- ✅ Email and password fields
- ✅ Form validation
- ✅ Error messages
- ✅ "Forgot password" link
- ✅ Link to sign up
- ✅ Redirect after login

### Sign Up Page Features:
- ✅ User type selection (Advertiser/Publisher)
- ✅ Full name, email, phone
- ✅ Company name (optional)
- ✅ Password with confirmation
- ✅ Form validation
- ✅ Success message
- ✅ Auto login after signup

### TopBar Features:
- ✅ Shows sign in/up when logged out
- ✅ Shows profile when logged in
- ✅ Profile dropdown with:
  - User name and email
  - User type badge
  - Admin dashboard (if admin)
  - Profile settings
  - Sign out

### Admin Dashboard Features:
- ✅ Statistics cards
- ✅ Quick action buttons
- ✅ User management table
- ✅ Ad space management table
- ✅ Role-based access control

---

## 🔄 Next Steps

After authentication is working:

1. **Test thoroughly**: Try all user flows
2. **Add password reset**: Implement forgot password
3. **Add email verification**: Verify email addresses
4. **Enhance admin**: Add more management features
5. **Add profile page**: Let users edit their profile
6. **Add user activity**: Track user actions

---

## 📞 Need Help?

1. Check `/AUTHENTICATION_SETUP.md` for detailed docs
2. Check browser console for errors
3. Check Supabase logs in dashboard
4. Verify `.env.local` has correct credentials
5. Make sure you've restarted the server

---

**Everything is set up and ready to use! 🎉**

Just follow Steps 1-4 above and you'll have authentication working in 5 minutes.

