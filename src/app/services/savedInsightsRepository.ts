import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import { features } from '../config/env';
import { useAuthStore } from '../store/authStore';
import { getDb } from './firebaseClient';

export type SavedInsight = {
  id: string;
  date: string;
  zodiac: string;
  zodiacGlyph: string;
  headline: string;
  body: string;
  /** ms since epoch */
  savedAt: number;
};

type Raw = Omit<SavedInsight, 'id' | 'savedAt'> & { savedAt: Timestamp | null };

function userId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function colPath() {
  const uid = userId();
  if (!uid) return null;
  return `users/${uid}/savedInsights`;
}

export const savedInsightsRepository = {
  isLive: features.firebase,

  async list(pageSize = 50): Promise<SavedInsight[]> {
    if (!features.firebase) return [];
    const db = getDb();
    const path = colPath();
    if (!db || !path) return [];
    try {
      const snap = await getDocs(
        query(collection(db, path), orderBy('savedAt', 'desc'), limit(pageSize)),
      );
      return snap.docs.map((d) => {
        const data = d.data() as Raw;
        return {
          id: d.id,
          date: data.date,
          zodiac: data.zodiac,
          zodiacGlyph: data.zodiacGlyph,
          headline: data.headline,
          body: data.body,
          savedAt: data.savedAt?.toMillis() ?? Date.now(),
        };
      });
    } catch {
      return [];
    }
  },

  async save(insight: Omit<SavedInsight, 'id' | 'savedAt'>): Promise<string | null> {
    if (!features.firebase) return null;
    const db = getDb();
    const path = colPath();
    if (!db || !path) return null;
    try {
      const ref = await addDoc(collection(db, path), {
        ...insight,
        savedAt: serverTimestamp(),
      });
      return ref.id;
    } catch {
      return null;
    }
  },

  async remove(id: string): Promise<boolean> {
    if (!features.firebase) return false;
    const db = getDb();
    const uid = userId();
    if (!db || !uid) return false;
    try {
      await deleteDoc(doc(db, `users/${uid}/savedInsights`, id));
      return true;
    } catch {
      return false;
    }
  },
};
