# Admin Portal - Separate Application Setup

The admin portal has been successfully separated into its own standalone Next.js application located in the `admin-portal/` directory.

## Quick Start

### 1. Navigate to Admin Portal Directory

```bash
cd admin-portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the `admin-portal/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Use the same Supabase credentials as your main frontend application.

### 4. Run Database Schema

Execute the SQL schema in your Supabase SQL editor:

```sql
-- File location: admin-portal/supabase/admin_schema.sql
```

This creates the `admin_users` and `admin_sessions` tables.

### 5. Create First Admin User

After starting the server, create your first admin:

```bash
# Start the server first
npm run dev

# Then in another terminal, create admin:
curl -X POST http://localhost:3001/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure-password-here",
    "full_name": "Admin User",
    "role": "super_admin"
  }'
```

### 6. Access the Portal

Open your browser and navigate to:
```
http://localhost:3001
```

Sign in with the admin credentials you just created.

## Key Differences

### Port
- **Main Frontend**: Port 3000
- **Admin Portal**: Port 3001

### Authentication
- **Main Frontend**: Uses `users` table (regular user auth)
- **Admin Portal**: Uses `admin_users` table (separate admin auth)

### Deployment
- Can be deployed completely independently
- Uses the same Supabase database
- Separate Vercel/production deployment

## Project Structure

```
Elfsod/
├── frontend/              # Main frontend application
│   └── app/
│       └── admin-portal/ # (Can be removed if desired)
└── admin-portal/         # NEW: Separate admin portal
    ├── app/
    ├── components/
    ├── contexts/
    ├── lib/
    └── supabase/
```

## Benefits of Separation

1. **Independent Deployment**: Deploy admin portal separately from main app
2. **Security**: Admin portal can be on a different domain/subdomain
3. **Performance**: Smaller bundle size for main frontend
4. **Maintenance**: Easier to maintain and update separately
5. **Access Control**: Can restrict admin portal access at infrastructure level

## Next Steps

1. ✅ Admin portal is ready to use
2. Optionally remove admin portal routes from main frontend (`frontend/app/admin-portal/`)
3. Deploy admin portal to a separate domain (e.g., `admin.elfsod.com`)
4. Set up proper access controls and monitoring

## Troubleshooting

See the detailed README in `admin-portal/README.md` for more information.

