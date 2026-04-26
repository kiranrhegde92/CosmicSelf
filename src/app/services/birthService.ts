import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { features } from '../config/env';
import { getBirthInputFromStore, useOnboardingStore } from '../store/onboardingStore';
import { getDb, getFirebaseAuth } from './firebaseClient';

/**
 * Mirrors the user's birth details into Firestore at:
 *   users/{uid}/profile/birth
 * so server-side jobs (daily insight push, etc.) can compute the chart
 * without a round-trip back to the client.
 *
 * Mock-safe: silently no-ops when Firebase isn't configured or the user
 * isn't signed in. Failure to mirror is non-fatal — local state still works.
 *
 * Source of truth stays the local onboarding store; the server doc is a
 * read-only mirror that the client overwrites on every change.
 */
export async function syncBirthToFirestore(): Promise<void> {
  if (!features.firebase) return;
  const db = getDb();
  const auth = getFirebaseAuth();
  if (!db || !auth?.currentUser) return;

  const state = useOnboardingStore.getState();
  const input = getBirthInputFromStore(state);
  if (!input) return; // not enough birth data yet — skip

  const ref = doc(db, `users/${auth.currentUser.uid}/profile/birth`);
  try {
    await setDoc(
      ref,
      {
        birthDate: state.birthDate,
        birthTime: state.birthTime,
        birthLocation: state.birthLocation,
        // Pre-computed convenience fields the server can use directly:
        isoLocal: input.isoLocal,
        lat: input.lat,
        lon: input.lon,
        tzOffsetMinutes: input.tzOffsetMinutes,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    /* mirror failure is non-fatal */
  }
}

/**
 * Subscribe to the onboarding store and mirror birth changes to Firestore.
 * Returns an unsubscribe. Call once at app boot from useSessionSync so the
 * subscription only runs while the user is signed in.
 *
 * Debounced via a short trailing timer so the typical "set date, then time,
 * then location" sequence collapses into a single Firestore write.
 */
export function startBirthMirror(): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      syncBirthToFirestore();
    }, 800);
  };

  // Mirror once on subscribe so a freshly-signed-in user with persisted
  // birth data gets it pushed without any extra interaction.
  schedule();

  const unsub = useOnboardingStore.subscribe((state, prev) => {
    if (
      state.birthDate !== prev.birthDate ||
      state.birthTime !== prev.birthTime ||
      state.birthLocation !== prev.birthLocation
    ) {
      schedule();
    }
  });

  return () => {
    if (timer) clearTimeout(timer);
    unsub();
  };
}
