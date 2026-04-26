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
import { FirebaseStorage, getStorage as getFbStorage } from 'firebase/storage';

import { env, features } from '../config/env';

/**
 * App Check setup. The Firebase JS SDK ships ReCaptcha providers that work
 * in browsers; full native attestation on iOS (App Attest) / Android (Play
 * Integrity) requires `@react-native-firebase/app-check` which in turn
 * requires an EAS prebuild (no Expo Go support).
 *
 * Today this module wires the **debug-token path** so dev builds can mint
 * attestations the Cloud Functions will accept once enforcement is enabled.
 *
 * Production setup (when you're ready):
 *   1. `npx expo install @react-native-firebase/app-check @react-native-firebase/app`
 *   2. EAS prebuild + add the App Attest entitlement (iOS) and Play
 *      Integrity API setup (Android)
 *   3. Replace this `setupAppCheck` body with the RNFB initializer
 *   4. Set Cloud Functions env: `firebase functions:config:set appcheck.enforce=true`
 *   5. Redeploy Functions — `enforceAppCheck` flips on
 */
function setupAppCheck(): void {
  if (!features.firebase) return;
  const token = env.appCheck.debugToken;
  if (!token) return;
  // The Firebase JS SDK reads this global to mint debug tokens. Equivalent
  // to enabling debug mode in the browser console for web. Safe in dev
  // because Functions enforcement isn't on yet; never ship this token.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN = token;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let fns: Functions | null = null;
let storage: FirebaseStorage | null = null;

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
  // Once the app is up, register any debug App Check token so dev requests
  // are accepted by the Functions even when enforcement is on.
  setupAppCheck();
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

/** Firebase Storage instance — used for user avatars (see storage.rules). */
export function getFirebaseStorage(): FirebaseStorage | null {
  const a = getApp();
  if (!a) return null;
  if (!storage) storage = getFbStorage(a);
  return storage;
}
