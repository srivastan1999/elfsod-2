# Elfsod Admin Portal

A separate, standalone Next.js application for managing the Elfsod platform. This admin portal is completely independent from the main frontend application.

## Features

- 🔐 Separate authentication system for administrators
- 📊 Dashboard with platform statistics
- 👥 User management
- 📍 Ad space management
- 📦 Booking management
- 🎨 Modern, dark-themed UI

## Prerequisites

- Node.js 18+ and npm
- Access to the same Supabase project as the main frontend
- Admin schema must be set up in Supabase

## Setup Instructions

### 1. Install Dependencies

```bash
cd admin-portal
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the `admin-portal` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:**
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Same as your main frontend
- `SUPABASE_SERVICE_ROLE_KEY`: Get this from Supabase Dashboard → Settings → API → service_role key
  - This is required for admin operations (create/update/delete ad spaces)
  - **Never expose this key in client-side code**
  - Only used in server-side API routes

**Note:** The service role key bypasses RLS policies, which is necessary since the admin portal uses separate authentication.

### 3. Set Up Database Schema

Run the SQL schema in your Supabase SQL editor:

```bash
# The schema file is located at:
supabase/admin_schema.sql
```

This will create:
- `admin_users` table
- `admin_sessions` table
- Required indexes and RLS policies

### 4. Create Your First Admin User

You can create an admin user using the API endpoint:

```bash
curl -X POST http://localhost:3001/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password",
    "full_name": "Admin User",
    "role": "super_admin"
  }'
```

**Important:** After creating your first admin, you should disable or protect this endpoint in production.

### 5. Run the Development Server

```bash
npm run dev
```

The admin portal will be available at `http://localhost:3001`

## Project Structure

```
admin-portal/
├── app/
│   ├── api/              # API routes
│   │   └── auth/         # Authentication endpoints
│   ├── auth/             # Auth pages
│   ├── dashboard/        # Dashboard page
│   └── users/            # User management pages
├── components/           # React components
├── contexts/            # React contexts
├── lib/                 # Utility libraries
│   ├── admin/           # Admin-specific utilities
│   └── supabase/        # Supabase clients
└── supabase/            # Database schemas
```

## API Routes

### Authentication

- `POST /api/auth/signin` - Sign in as admin
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/verify` - Verify admin session
- `POST /api/auth/create-admin` - Create new admin user (setup only)

### Data

- `GET /api/users` - Get all users
- `GET /api/stats` - Get dashboard statistics

## Port Configuration

The admin portal runs on port **3001** by default to avoid conflicts with the main frontend (which typically runs on port 3000).

To change the port, modify the `dev` script in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p YOUR_PORT"
  }
}
```

## Deployment

### Vercel

1. Create a new Vercel project for the admin portal
2. Set the same environment variables as your main frontend
3. Deploy from the `admin-portal` directory

### Other Platforms

The admin portal is a standard Next.js application and can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Your own server

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Admin Creation Endpoint**: Disable or protect `/api/auth/create-admin` in production
3. **Session Tokens**: Tokens are stored in localStorage and cookies
4. **HTTPS**: Always use HTTPS in production
5. **RLS Policies**: The database uses Row Level Security (RLS) policies

## Differences from Main Frontend

- **Separate Authentication**: Uses `admin_users` table instead of regular `users`
- **Different Port**: Runs on port 3001 instead of 3000
- **Focused UI**: Designed specifically for administrative tasks
- **Independent Deployment**: Can be deployed separately from main frontend

## Troubleshooting

### Cannot connect to Supabase

- Verify your `.env.local` file has the correct Supabase credentials
- Ensure the Supabase project is active
- Check that the admin schema has been run in Supabase

### Admin user creation fails

- Ensure the `admin_schema.sql` has been executed in Supabase
- Check that the `admin_users` table exists
- Verify email is unique

### Port already in use

- Change the port in `package.json` or kill the process using port 3001

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.

