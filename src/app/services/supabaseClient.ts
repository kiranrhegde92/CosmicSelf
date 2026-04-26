import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { env, features } from '../config/env';

let client: SupabaseClient | null = null;

/**
 * Returns the singleton Supabase client when EXPO_PUBLIC_SUPABASE_URL +
 * EXPO_PUBLIC_SUPABASE_ANON_KEY are set, otherwise null. Callers must handle
 * the null case (used by services to fall back to mocks during development).
 */
export function getSupabase(): SupabaseClient | null {
  if (!features.supabaseAuth) return null;
  if (!client) {
    client = createClient(env.supabase.url, env.supabase.anonKey, {
      auth: {
        storage: AsyncStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
