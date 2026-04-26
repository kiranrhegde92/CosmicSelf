import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { features } from '../config/env';
import { authService } from '../services/authService';
import { getFirebaseAuth } from '../services/firebaseClient';
import { syncTierToFirestore } from '../services/entitlementService';
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
    const unsub = auth
      ? onAuthStateChanged(auth, (user) => {
          const { login, logout } = useAuthStore.getState();
          if (!user) {
            logout();
            return;
          }
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
        })
      : null;

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [enabled]);
}
