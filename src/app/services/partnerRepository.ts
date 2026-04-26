import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';

import { features } from '../config/env';
import { useAuthStore } from '../store/authStore';
import type { Partner } from '../store/onboardingStore';
import { getDb } from './firebaseClient';

/**
 * Per-user partner record at users/{uid}/profile/partner. Single doc for now;
 * a future "multiple partners" feature would move to a subcollection.
 */

function partnerDoc() {
  const uid = useAuthStore.getState().user?.id;
  if (!uid) return null;
  const db = getDb();
  if (!db) return null;
  return doc(db, `users/${uid}/profile/partner`);
}

export const partnerRepository = {
  isLive: features.firebase,

  async load(): Promise<Partner | null> {
    if (!features.firebase) return null;
    const ref = partnerDoc();
    if (!ref) return null;
    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return snap.data() as Partner;
    } catch {
      return null;
    }
  },

  async save(p: Partner): Promise<boolean> {
    if (!features.firebase) return false;
    const ref = partnerDoc();
    if (!ref) return false;
    try {
      await setDoc(ref, p, { merge: false });
      return true;
    } catch {
      return false;
    }
  },

  async clear(): Promise<boolean> {
    if (!features.firebase) return false;
    const ref = partnerDoc();
    if (!ref) return false;
    try {
      await deleteDoc(ref);
      return true;
    } catch {
      return false;
    }
  },
};
