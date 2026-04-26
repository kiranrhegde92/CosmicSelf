import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import { features } from '../config/env';
import { useAuthStore } from '../store/authStore';
import { getDb } from './firebaseClient';

export type StoredMessage = {
  id: string;
  from: 'user' | 'ai';
  text: string;
  createdAt: number; // ms since epoch
};

type Raw = {
  from: 'user' | 'ai';
  text: string;
  createdAt: Timestamp | null;
};

function userId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function colPath(astrologerId: string) {
  const uid = userId();
  if (!uid) return null;
  return `users/${uid}/threads/${astrologerId}/messages`;
}

export const chatRepository = {
  isLive: features.firebase,

  /**
   * Returns the trailing `pageSize` messages for the given astrologer thread,
   * oldest first. Returns null when not configured / not signed in (the UI
   * keeps the seeded sample messages in that case).
   */
  async loadHistory(astrologerId: string, pageSize = 50): Promise<StoredMessage[] | null> {
    if (!features.firebase) return null;
    const db = getDb();
    const path = colPath(astrologerId);
    if (!db || !path) return null;
    try {
      const snap = await getDocs(
        query(collection(db, path), orderBy('createdAt', 'desc'), limit(pageSize)),
      );
      const items: StoredMessage[] = snap.docs.map((d) => {
        const data = d.data() as Raw;
        return {
          id: d.id,
          from: data.from,
          text: data.text,
          createdAt: data.createdAt?.toMillis() ?? Date.now(),
        };
      });
      return items.reverse();
    } catch {
      return null;
    }
  },

  /**
   * Append a single message to the thread. Returns the new doc id (or null
   * if persistence isn't available; callers should fall back to local state).
   */
  async appendMessage(
    astrologerId: string,
    msg: { from: 'user' | 'ai'; text: string },
  ): Promise<string | null> {
    if (!features.firebase) return null;
    const db = getDb();
    const path = colPath(astrologerId);
    if (!db || !path) return null;
    try {
      const ref = await addDoc(collection(db, path), {
        ...msg,
        createdAt: serverTimestamp(),
      });
      return ref.id;
    } catch {
      return null;
    }
  },
};
