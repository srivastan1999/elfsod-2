'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing admin session on mount
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const token = localStorage.getItem('elfsod-admin-token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Verify token with API
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.adminUser);
        } else {
          // Invalid token, remove it
          localStorage.removeItem('elfsod-admin-token');
          setAdminUser(null);
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
        localStorage.removeItem('elfsod-admin-token');
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || 'Sign in failed';
        if (data.details) {
          errorMessage += `: ${data.details}`;
        }
        if (data.hint) {
          errorMessage += ` (${data.hint})`;
        }
        console.error('Sign in API error:', {
          status: response.status,
          error: data
        });
        return { error: new Error(errorMessage) };
      }

      if (!data.token || !data.adminUser) {
        console.error('Sign in response missing token or adminUser:', data);
        return { error: new Error('Invalid response from server') };
      }

      // Store token in localStorage and set cookie
      localStorage.setItem('elfsod-admin-token', data.token);
      // Also set cookie for server-side access
      document.cookie = `elfsod-admin-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      setAdminUser(data.adminUser);

      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('elfsod-admin-token');
      if (token) {
        // Call API to invalidate session
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      localStorage.removeItem('elfsod-admin-token');
      // Remove cookie
      document.cookie = 'elfsod-admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setAdminUser(null);
    }
  };

  const value: AdminAuthContextType = {
    adminUser,
    loading,
    signIn,
    signOut,
    isSuperAdmin: adminUser?.role === 'super_admin',
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

