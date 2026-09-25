import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);
const VALID_ROLES = ['artisan', 'customer'];

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tracks which user's profile we last fetched, so onAuthStateChange
  // doesn't re-fetch the same profile it just loaded during initialization.
  const lastFetchedUserId = useRef(null);

  // Fetches the profile row (role, full_name, shop_name...) for the current user
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    lastFetchedUserId.current = userId;

    if (error) {
      console.error('Error fetching profile:', error.message);
      setProfile(null);
    } else {
      setProfile(data);
    }
  }

  useEffect(() => {
    let isMounted = true;

    // Load the current session (if the user already logged in before) and,
    // importantly, WAIT for the profile to load too before marking loading
    // as false. Otherwise ProtectedRoute can briefly see "no profile yet"
    // and wrongly redirect an artisan away from /dashboard.
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      if (isMounted) setLoading(false);
    }
    init();

    // Keep session in sync when the user logs in/out in this tab
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        // Skip re-fetching if we already have this user's profile loaded
        if (newSession.user.id !== lastFetchedUserId.current) {
          fetchProfile(newSession.user.id);
        }
      } else {
        setProfile(null);
        lastFetchedUserId.current = null;
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signUp({ email, password, fullName, role, shopName }) {
    // Guard against anything other than the two valid roles reaching the
    // database, regardless of what called signUp().
    if (!VALID_ROLES.includes(role)) {
      return { error: { message: 'Invalid account type selected.' } };
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };

    if (!data.user) {
      // Happens if email confirmation is enabled in Supabase - the auth
      // user exists but there's no session yet to create the profile with.
      return {
        error: {
          message: 'Account created. Please check your email to confirm it before logging in.',
        },
      };
    }

    // Create the matching profile row. Requires the user to be logged in,
    // which signUp() does automatically when email confirmation is disabled.
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      full_name: fullName,
      shop_name: role === 'artisan' ? shopName : null,
    });

    if (profileError) {
      console.error('Profile creation failed:', profileError.message);
      // Don't leave an authenticated user with no profile row - sign them
      // out so they land back in a clean, unauthenticated state and can
      // retry, rather than being stuck in limbo.
      await supabase.auth.signOut();
      return {
        error: {
          message: 'Your account was created but we could not set up your profile. Please try signing up again.',
        },
      };
    }

    return { data };
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
