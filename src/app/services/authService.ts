import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import { features } from '../config/env';
import { AuthUser } from '../store/authStore';
import { getFirebaseAuth } from './firebaseClient';

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

function toUser(u: User | null, fallbackName?: string, fallbackEmail?: string): AuthUser {
  return {
    id: u?.uid ?? 'usr_demo',
    email: u?.email ?? fallbackEmail ?? '',
    name:
      u?.displayName?.trim() ||
      fallbackName?.trim() ||
      (u?.email ?? fallbackEmail ?? '').split('@')[0] ||
      'Seeker',
    photoURL: u?.photoURL ?? null,
  };
}

async function loginFirebase(email: string, password: string): Promise<AuthUser> {
  const auth = getFirebaseAuth()!;
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return toUser(cred.user, undefined, email);
}

async function signupFirebase(name: string, email: string, password: string): Promise<AuthUser> {
  const auth = getFirebaseAuth()!;
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name.trim()) {
    try {
      await updateProfile(cred.user, { displayName: name.trim() });
    } catch {
      // Display name is non-critical; ignore.
    }
  }
  return toUser(cred.user, name, email);
}

async function logoutFirebase() {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

/**
 * Firebase restores its session asynchronously after `initializeAuth`. Wait
 * for the first onAuthStateChanged tick before resolving so callers don't
 * see a transient null.
 */
async function restoreFirebase(): Promise<AuthUser | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user ? toUser(user) : null);
    });
  });
}

export const authService = {
  isLive: features.firebase,

  async login(email: string, password: string): Promise<AuthUser> {
    if (features.firebase) return loginFirebase(email, password);
    await wait(500);
    return toUser(null, undefined, email);
  },

  async signup(name: string, email: string, password: string): Promise<AuthUser> {
    if (features.firebase) return signupFirebase(name, email, password);
    await wait(500);
    return toUser(null, name, email);
  },

  async logout(): Promise<void> {
    if (features.firebase) {
      await logoutFirebase();
      return;
    }
    await wait(150);
  },

  async restoreSession(): Promise<AuthUser | null> {
    if (features.firebase) return restoreFirebase();
    return null;
  },
};
