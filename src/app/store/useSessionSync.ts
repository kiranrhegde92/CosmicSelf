import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { features } from '../config/env';
import { authService } from '../services/authService';
import { getFirebaseAuth } from '../services/firebaseClient';
import { syncTierToFirestore } from '../services/entitlementService';
import { startBirthMirror } from '../services/birthService';
import { setSentryUser } from '../services/sentryService';
import { useAuthStore } from './authStore';
import { useEntitlementStore } from './entitlementStore';

/**
 * Mirrors Firebase auth state into the local Zustand auth store. Runs once
 * after stores are hydrated. Falls back silently when Firebase isn't
 * configured (mock auth flows still work).
 */
export function useSessionSync(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !features.firebase) return;
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

    const auth = getFirebaseAuth();
    let stopBirthMirror: (() => void) | null = null;
    const unsub = auth
      ? onAuthStateChanged(auth, (user) => {
          const { login, logout } = useAuthStore.getState();
          if (!user) {
            logout();
            setSentryUser(null);
            stopBirthMirror?.();
            stopBirthMirror = null;
            return;
          }
          setSentryUser({ id: user.uid });
          login({
            id: user.uid,
            email: user.email ?? '',
            name:
              user.displayName?.trim() ||
              user.email?.split('@')[0] ||
              'Seeker',
            photoURL: user.photoURL ?? null,
          });
          // Mirror locally-known tier into Firestore so the chat Function
          // can apply the correct quota immediately on first call.
          syncTierToFirestore(useEntitlementStore.getState().tier);
          // Start mirroring birth details so server-side jobs (daily insight
          // push, etc.) can read them. Re-subscribes per session to avoid
          // leaking the listener across sign-out.
          stopBirthMirror?.();
          stopBirthMirror = startBirthMirror();
        })
      : null;

    return () => {
      cancelled = true;
      if (unsub) unsub();
      stopBirthMirror?.();
    };
  }, [enabled]);
}
