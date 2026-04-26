import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { features } from '../config/env';
import { getDb, getFirebaseAuth } from './firebaseClient';
import type { Tier } from '../store/entitlementStore';

/**
 * Mirrors the user's tier into Firestore at:
 *   users/{uid}/profile/entitlement
 * so server-side quota enforcement can read it.
 *
 * Source of truth today: the local entitlement store (which RevenueCat will
 * eventually write to). Until RC + a webhook are in place this mirror is the
 * stop-gap that lets the Cloud Function know what tier to bill against.
 *
 * Mock-safe: if Firebase isn't configured we silently no-op.
 */
export async function syncTierToFirestore(tier: Tier): Promise<void> {
  if (!features.firebase) return;
  const db = getDb();
  const auth = getFirebaseAuth();
  if (!db || !auth?.currentUser) return;
  const ref = doc(db, `users/${auth.currentUser.uid}/profile/entitlement`);
  try {
    await setDoc(
      ref,
      {
        tier,
        updatedAt: serverTimestamp(),
        // Source helps debugging — once RC writes via webhook we can stop
        // trusting client-pushed values.
        source: 'client',
      },
      { merge: true },
    );
  } catch {
    /* mirror failure is non-fatal — gating still works locally */
  }
}
