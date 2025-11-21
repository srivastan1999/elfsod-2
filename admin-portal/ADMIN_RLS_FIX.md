# Fix RLS Policies for Admin Portal

## Problem
The admin portal uses a separate authentication system (`admin_users` table) and doesn't use Supabase Auth. However, the `ad_spaces` table has Row Level Security (RLS) enabled, which checks for `auth.uid()` that doesn't exist for admin portal users.

## Solution
We're using the **Service Role Key** for admin operations, which bypasses RLS policies. This is the recommended approach for admin operations.

## Setup

### 1. Add Service Role Key to Environment Variables

Add this to your `.env.local` file in the `admin-portal` directory:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ Important:** 
- The service role key bypasses all RLS policies
- Never expose this key in client-side code
- Only use it in server-side API routes
- Keep it secure and never commit it to version control

### 2. Get Your Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)
4. Add it to your `.env.local` file

### 3. Alternative: Fix RLS Policies (If you prefer)

If you don't want to use the service role key, you can run this SQL in Supabase:

```sql
-- File: admin-portal/supabase/fix_ad_spaces_rls.sql
-- This allows inserts/updates/deletes for admin portal
```

However, using the service role key is the recommended approach for admin operations.

## How It Works

- **Regular operations**: Use `createClient()` with anon key (respects RLS)
- **Admin operations**: Use `createAdminClient()` with service role key (bypasses RLS)

The admin portal API routes now use `createAdminClient()` for:
- Creating ad spaces
- Updating ad spaces  
- Deleting ad spaces

This ensures admin operations work regardless of RLS policies.

## Security Note

The service role key is only used in:
- Server-side API routes (`/app/api/**`)
- Never exposed to the client
- Protected by admin authentication (admin session verification)

Even though it bypasses RLS, it's still protected by:
1. Admin session verification (`verifyAdminSession`)
2. Server-side only execution
3. Admin authentication required

