import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const path = request.nextUrl.pathname;

  // Check if Supabase environment variables are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // If env vars are missing, allow request to proceed without auth checks
    // This prevents middleware from crashing during deployment
    console.warn('⚠️ Supabase environment variables not configured in middleware. Skipping auth checks.');
    return response;
  }

  let user = null;
  let supabase = null;

  try {
    supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                sameSite: 'lax',
                path: '/',
              });
            });
          },
        },
      }
    );

    // Get user - this uses the same token from cookies
    // The session is synced from localStorage to cookies by Supabase SSR
    try {
      const {
        data: { user: userData },
        error: userError,
      } = await supabase.auth.getUser();
      
      if (!userError && userData) {
        user = userData;
      }
    } catch (authError) {
      // If auth check fails, continue without user (allow public access)
      console.warn('⚠️ Failed to get user in middleware:', authError);
    }
  } catch (error) {
    // If Supabase client creation fails, log and continue without auth
    console.error('❌ Middleware Supabase error:', error);
    // Return response to allow request to proceed
    return response;
  }
  
  // Session is automatically managed by Supabase SSR middleware
  // No need to manually refresh as cookies are kept in sync

  // Public paths that don't require authentication (browsing allowed)
  const publicPaths = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/',              // Home - browsing allowed
    '/search',        // Search - browsing allowed
    '/ad-space',      // Ad space details - browsing allowed
    '/cart',          // Cart - browsing allowed (guests can view cart)
    '/ai-planner',    // AI Planner - browsing allowed (no sign-in required)
  ];

  // Paths that require authentication
  const protectedPaths = [
    '/checkout',      // Checkout requires auth
    '/profile',       // Profile requires auth
    '/bookings',      // Bookings requires auth
    '/campaigns',     // Campaigns requires auth
    '/design',        // Design requires auth
    '/admin',         // Admin requires auth
  ];

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(protectedPath => path.startsWith(protectedPath));

  // Check if current path is public (auth pages)
  const isAuthPath = path.startsWith('/auth/');

  // If user is authenticated and trying to access auth pages, redirect to home
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is NOT authenticated and trying to access protected pages, redirect to signin
  if (!user && isProtectedPath) {
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin portal routes - authentication handled by AdminPortalLayout component
  // No middleware redirects - let the component handle auth checks

  // Legacy admin routes - requires admin role from users table
  if (user && supabase && path.startsWith('/admin') && !path.startsWith('/admin-portal')) {
    try {
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (dbError || !userData || userData.user_type !== 'admin') {
        // Redirect to home if not admin or if query fails
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // If admin check fails, redirect to home for safety
      console.error('❌ Middleware admin check error:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
};

