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
} as const;

export const features = {
  firebase: !!(env.firebase.apiKey && env.firebase.projectId && env.firebase.appId),
  liveChatViaFunctions: !!(env.firebase.apiKey && env.firebase.projectId && env.firebase.appId),
  liveChatDirect: !!env.anthropic.apiKey, // dev-only fallback
  revenueCat: !!(env.revenuecat.iosKey || env.revenuecat.androidKey),
} as const;
