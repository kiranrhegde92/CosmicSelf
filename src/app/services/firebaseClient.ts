import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  // @ts-expect-error - getReactNativePersistence is exposed at runtime for RN
  // but isn't included in the firebase/auth public types. Pinning the import
  // here keeps the rest of the file fully typed.
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Functions, getFunctions } from 'firebase/functions';

import { env, features } from '../config/env';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let fns: Functions | null = null;

function getApp(): FirebaseApp | null {
  if (!features.firebase) return null;
  if (app) return app;
  app = getApps()[0] ?? initializeApp({
    apiKey: env.firebase.apiKey,
    authDomain: env.firebase.authDomain,
    projectId: env.firebase.projectId,
    storageBucket: env.firebase.storageBucket,
    messagingSenderId: env.firebase.messagingSenderId,
    appId: env.firebase.appId,
  });
  return app;
}

/** Auth instance with React Native persistence backed by AsyncStorage. */
export function getFirebaseAuth(): Auth | null {
  const a = getApp();
  if (!a) return null;
  if (!auth) {
    auth = initializeAuth(a, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  return auth;
}

/** Firestore instance — Security Rules enforce per-user access. */
export function getDb(): Firestore | null {
  const a = getApp();
  if (!a) return null;
  if (!db) db = getFirestore(a);
  return db;
}

/** Callable Cloud Functions in the configured region. */
export function getFns(): Functions | null {
  const a = getApp();
  if (!a) return null;
  if (!fns) fns = getFunctions(a, env.firebase.region);
  return fns;
}
