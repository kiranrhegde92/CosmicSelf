import { useEffect } from 'react';

import { features } from '../config/env';
import { authService } from '../services/authService';
import { getSupabase } from '../services/supabaseClient';
import { useAuthStore } from './authStore';

/**
 * Mirrors Supabase auth state into the local Zustand auth store. Runs once
 * after stores are hydrated. Falls back silently when Supabase isn't
 * configured (mock auth flows still work).
 */
export function useSessionSync(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !features.supabaseAuth) return;
    let cancelled = false;

    (async () => {
      try {
        const restored = await authService.restoreSession();
        if (cancelled) return;
        const { isAuthenticated, login, logout } = useAuthStore.getState();
        if (restored) {
          login(restored);
        } else if (isAuthenticated) {
          logout();
        }
      } catch {
        /* leave persisted local state alone if remote check fails */
      }
    })();

    const sb = getSupabase();
    const sub = sb?.auth.onAuthStateChange((event, session) => {
      const { login, logout } = useAuthStore.getState();
      if (event === 'SIGNED_OUT' || !session) {
        logout();
        return;
      }
      const u = session.user;
      login({
        id: u.id,
        email: u.email ?? '',
        name:
          (u.user_metadata as { name?: string } | null)?.name?.trim() ||
          u.email?.split('@')[0] ||
          'Seeker',
      });
    });

    return () => {
      cancelled = true;
      sub?.data.subscription.unsubscribe();
    };
  }, [enabled]);
}
