'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseAuthUser, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseAuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string, userType?: 'advertiser' | 'publisher') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isPublisher: boolean;
  isAdvertiser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseAuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch user profile from public.users table
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Only log error if it's not a "not found" error
        if (error.code !== 'PGRST116') {
          console.warn('⚠️ Unable to fetch user profile. If this is the first time setting up auth, run supabase/auth_schema.sql');
          console.warn('Error details:', error.message);
        } else {
          console.warn('ℹ️ No profile found for user yet. Will create one.');
        }
        return null;
      }

      return data as User;
    } catch (error) {
      console.warn('⚠️ Could not fetch user profile. This is normal if not signed in.');
      return null;
    }
  };

  const buildProfileFromSupabaseUser = (authUser: SupabaseAuthUser): User => {
    const fallbackName =
      authUser.user_metadata?.full_name ||
      authUser.email?.split('@')[0] ||
      'User';

    const fallbackType =
      (authUser.user_metadata?.user_type as User['user_type']) || 'advertiser';

    return {
      id: authUser.id,
      email: authUser.email || '',
      full_name: fallbackName,
      phone: authUser.user_metadata?.phone || '',
      company_name: authUser.user_metadata?.company_name || '',
      user_type: fallbackType,
      profile_image_url: authUser.user_metadata?.profile_image_url || '',
      created_at: authUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const ensureUserProfile = async (authUser: SupabaseAuthUser): Promise<User> => {
    const fallbackProfile = buildProfileFromSupabaseUser(authUser);

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            id: authUser.id,
            email: fallbackProfile.email,
            full_name: fallbackProfile.full_name,
            phone: fallbackProfile.phone,
            company_name: fallbackProfile.company_name || null,
            user_type: fallbackProfile.user_type,
            profile_image_url: fallbackProfile.profile_image_url || null,
          },
          { onConflict: 'id' }
        )
        .select('*')
        .single();

      if (error) {
        console.warn('⚠️ Could not upsert user profile, using fallback', error.message);
        return fallbackProfile;
      }

      return data as User;
    } catch (error) {
      console.error('❌ Failed to ensure user profile exists. Using fallback profile.', error);
      return fallbackProfile;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session from localStorage
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        }
        
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          let profile = await fetchUserProfile(currentSession.user.id);

          if (!profile) {
            profile = await ensureUserProfile(currentSession.user);
          }

          setUser(profile);
        }

        setLoading(false);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            setSession(newSession);
            setSupabaseUser(newSession?.user ?? null);

            if (newSession?.user) {
              const profile = await fetchUserProfile(newSession.user.id);
              setUser(profile);
            } else {
              setUser(null);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user && data.session) {
        setSession(data.session);
        setSupabaseUser(data.user);
        
        let profile = await fetchUserProfile(data.user.id);
        if (!profile) {
          profile = await ensureUserProfile(data.user);
        }
        setUser(profile);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    userType: 'advertiser' | 'publisher' = 'advertiser'
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
            phone: phone || '',
          },
        },
      });

      if (error) {
        return { error };
      }

      // Set session and user immediately
      if (data.user && data.session) {
        setSession(data.session);
        setSupabaseUser(data.user);

        // Profile will be created automatically by the database trigger
        // Fetch it after a short delay
        setTimeout(async () => {
          let profile = await fetchUserProfile(data.user!.id);
          if (!profile) {
            profile = await ensureUserProfile(data.user!);
          }
          setUser(profile);
        }, 1500);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: user?.user_type === 'admin',
    isPublisher: user?.user_type === 'publisher',
    isAdvertiser: user?.user_type === 'advertiser',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

