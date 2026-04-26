import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { features } from '../config/env';
import { useAuthStore } from '../store/authStore';
import type { Partner } from '../store/onboardingStore';
import { getDb } from './firebaseClient';

/**
 * Per-user partner records at users/{uid}/partners/{partnerId}. Each
 * Partner is its own document keyed by its stable id, so the user can
 * keep many side-by-side and cycle the "active" one client-side.
 */

function partnersCollectionPath(): string | null {
  const uid = useAuthStore.getState().user?.id;
  if (!uid) return null;
  return `users/${uid}/partners`;
}

function partnerDocRef(id: string) {
  const path = partnersCollectionPath();
  if (!path) return null;
  const db = getDb();
  if (!db) return null;
  return doc(db, path, id);
}

export const partnerRepository = {
  isLive: features.firebase,

  async list(): Promise<Partner[]> {
    if (!features.firebase) return [];
    const path = partnersCollectionPath();
    const db = getDb();
    if (!path || !db) return [];
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map((d) => {
        const data = d.data() as Partner;
        // Doc id is the source of truth; older writes may not have stamped
        // an `id` field on the document body itself.
        return { ...data, id: d.id };
      });
    } catch {
      return [];
    }
  },

  async save(p: Partner): Promise<boolean> {
    if (!features.firebase) return false;
    const ref = partnerDocRef(p.id);
    if (!ref) return false;
    try {
      await setDoc(ref, p, { merge: false });
      return true;
    } catch {
      return false;
    }
  },

  async remove(id: string): Promise<boolean> {
    if (!features.firebase) return false;
    const ref = partnerDocRef(id);
    if (!ref) return false;
    try {
      await deleteDoc(ref);
      return true;
    } catch {
      return false;
    }
  },
};
