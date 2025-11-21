# Admin Portal Authentication Troubleshooting

## Common Issues and Solutions

### 1. "Database configuration error"

**Problem:** Missing or incorrect environment variables.

**Solution:**
1. Create `.env.local` file in the `admin-portal/` directory
2. Add these variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
3. Restart the dev server: `npm run dev`

### 2. "Invalid email or password"

**Possible causes:**
- Admin user doesn't exist
- Wrong password
- Admin user is inactive

**Solution:**
1. Check if admin user exists:
   - Run the create-admin script: `node scripts/create-admin.js`
   - Or use the API: `POST /api/auth/create-admin`

2. Verify admin user is active:
   ```sql
   SELECT email, is_active FROM admin_users WHERE email = 'your-email@example.com';
   ```

3. Reset password (if needed):
   ```sql
   -- Generate new password hash using bcrypt
   -- Then update:
   UPDATE admin_users 
   SET password_hash = 'new_hash_here' 
   WHERE email = 'your-email@example.com';
   ```

### 3. "Database error" or RLS Policy Issues

**Problem:** Row Level Security policies blocking access.

**Solution:**
1. Run the admin schema SQL:
   ```bash
   # In Supabase SQL Editor, run:
   admin-portal/supabase/admin_schema.sql
   ```

2. Verify RLS policies:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename IN ('admin_users', 'admin_sessions');
   ```

3. Policies should allow:
   - `SELECT` on `admin_users` with `USING (true)`
   - `INSERT` on `admin_users` with `WITH CHECK (true)`
   - `SELECT` on `admin_sessions` with `USING (true)`
   - `INSERT` on `admin_sessions` with `WITH CHECK (true)`

### 4. "Failed to create session"

**Problem:** Cannot insert into `admin_sessions` table.

**Solution:**
1. Check if `admin_sessions` table exists
2. Verify RLS policy allows INSERT:
   ```sql
   CREATE POLICY "Admin sessions can be inserted by owner" ON public.admin_sessions
     FOR INSERT
     WITH CHECK (true);
   ```

### 5. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab:** Look for error messages
- **Network tab:** Check the `/api/auth/signin` request:
  - Status code
  - Response body
  - Request payload

### 6. Check Server Logs

In the terminal where you're running `npm run dev`, look for:
- Error messages
- Database connection errors
- RLS policy errors

## Quick Test

1. **Verify environment variables:**
   ```bash
   cd admin-portal
   npm run check-env
   ```

2. **Create an admin user:**
   ```bash
   node scripts/create-admin.js
   ```

3. **Try signing in:**
   - Go to `http://localhost:3001/auth/signin`
   - Use the email and password you created

## Still Having Issues?

1. Check the browser console (F12) for detailed error messages
2. Check server terminal for API errors
3. Verify Supabase connection:
   - Go to Supabase Dashboard
   - Check if tables exist: `admin_users`, `admin_sessions`
   - Verify RLS is enabled and policies are correct

