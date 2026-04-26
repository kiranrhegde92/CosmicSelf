/**
 * Central env + feature-flag layer.
 *
 * EXPO_PUBLIC_* vars are inlined by Metro at build/dev time. Anything secret
 * (API keys for paid third parties, signing keys, etc.) must NOT live here —
 * proxy those through a backend.
 */

const get = (k: string, fallback = ''): string => {
  const v = process.env[k];
  return typeof v === 'string' ? v : fallback;
};

export const env = {
  supabase: {
    url: get('EXPO_PUBLIC_SUPABASE_URL'),
    anonKey: get('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  },

  // NOTE: putting an Anthropic key directly in the app is fine for prototyping
  // but should move to a backend proxy before public release.
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
  supabaseAuth: !!(env.supabase.url && env.supabase.anonKey),
  liveChat: !!env.anthropic.apiKey,
  revenueCat: !!(env.revenuecat.iosKey || env.revenuecat.androidKey),
} as const;
