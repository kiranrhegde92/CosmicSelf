import { httpsCallable } from 'firebase/functions';

import { features } from '../config/env';
import { getFns } from './firebaseClient';

/**
 * Hard-deletes the signed-in user's data + Auth record. The Cloud Function
 * removes Storage files and the Firestore subtree first, then the Auth user.
 *
 * If Firebase isn't configured, this is a local no-op that returns ok so
 * dev / mock builds can still wire the UI without crashing.
 */
export async function deleteAccount(): Promise<{ ok: boolean; authRemoved: boolean }> {
  if (!features.firebase) {
    return { ok: true, authRemoved: true };
  }
  const fns = getFns();
  if (!fns) throw new Error('Firebase Functions not initialized.');
  const call = httpsCallable<unknown, { ok: boolean; authRemoved: boolean }>(
    fns,
    'deleteAccount',
  );
  const result = await call({});
  return result.data;
}

/**
 * Trigger a server-driven test push to the calling user's registered Expo
 * push token. Useful for verifying the daily-insight pipeline end-to-end
 * before the scheduled job fires.
 *
 * Throws when Firebase isn't configured (so the dev panel can show a clear
 * "no backend" state) or when the user has no token registered yet.
 */
export async function sendTestNotification(): Promise<{ ok: boolean; ticketId: string | null }> {
  if (!features.firebase) throw new Error('Firebase is not configured.');
  const fns = getFns();
  if (!fns) throw new Error('Firebase Functions not initialized.');
  const call = httpsCallable<unknown, { ok: boolean; ticketId: string | null }>(
    fns,
    'sendTestNotification',
  );
  const result = await call({});
  return result.data;
}
