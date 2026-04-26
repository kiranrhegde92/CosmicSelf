/**
 * Central env + feature-flag layer.
 *
 * EXPO_PUBLIC_* vars are inlined by Metro at build/dev time. Anything secret
 * (API keys for paid third parties, signing keys, etc.) must NOT live here —
 * proxy those through Cloud Functions or another backend.
 *
 * Firebase config values are public by design (they identify the project, not
 * grant access to it). Access control belongs in Firestore Security Rules.
 */

const get = (k: string, fallback = ''): string => {
  const v = process.env[k];
  return typeof v === 'string' ? v : fallback;
};

export const env = {
  firebase: {
    apiKey: get('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: get('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: get('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: get('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: get('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: get('EXPO_PUBLIC_FIREBASE_APP_ID'),
    region: get('EXPO_PUBLIC_FIREBASE_REGION', 'us-central1'),
  },

  // Optional: still supported as a development override. In production the
  // app should call Cloud Functions instead of hitting Anthropic directly.
  anthropic: {
    apiKey: get('EXPO_PUBLIC_ANTHROPIC_API_KEY'),
    model: get('EXPO_PUBLIC_ANTHROPIC_MODEL', 'claude-haiku-4-5'),
  },

  revenuecat: {
    iosKey: get('EXPO_PUBLIC_REVENUECAT_IOS_KEY'),
    androidKey: get('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY'),
  },

  geocoding: {
    // Open-Meteo geocoding API — free, no key required.
    endpoint: 'https://geocoding-api.open-meteo.com/v1/search',
  },

  // Google OAuth client IDs come from Firebase Console -> Authentication ->
  // Sign-in method -> Google (which creates the OAuth credentials in GCP).
  // Web client ID is enough to make Expo Go work; iOS/Android client IDs
  // unlock native EAS dev/prod builds.
  appCheck: {
    /**
     * Optional debug token for App Check during dev. Get one from Firebase
     * Console → Project Settings → App Check → Debug tokens. Setting this
     * EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN env var registers it with
     * the JS SDK so the dev build mints debug attestations the Functions
     * accept once enforcement is enabled.
     */
    debugToken: get('EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN'),
  },

  google: {
    webClientId: get('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
    iosClientId: get('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'),
    androidClientId: get('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'),
  },
} as const;

const firebaseReady = !!(env.firebase.apiKey && env.firebase.projectId && env.firebase.appId);

export const features = {
  firebase: firebaseReady,
  liveChatViaFunctions: firebaseReady,
  liveChatDirect: !!env.anthropic.apiKey, // dev-only fallback
  revenueCat: !!(env.revenuecat.iosKey || env.revenuecat.androidKey),
  /** True when Firebase + at least one Google client ID are configured. */
  googleSignIn: firebaseReady && !!env.google.webClientId,
  /**
   * Apple Sign-In is wired wherever Firebase is configured; the actual
   * runtime gate (iOS 13+ on a signed-in device) is checked by
   * `AppleAuthentication.isAvailableAsync()` inside useSocialAuth.
   */
  appleSignIn: firebaseReady,
} as const;
