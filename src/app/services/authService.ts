import { AuthUser } from '../store/authStore';
import { features } from '../config/env';
import { getSupabase } from './supabaseClient';

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

function toUser(id: string, email: string, name?: string | null): AuthUser {
  return {
    id,
    email,
    name: name?.trim() || email.split('@')[0] || 'Seeker',
  };
}

async function loginSupabase(email: string, password: string): Promise<AuthUser> {
  const sb = getSupabase()!;
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Login failed');
  return toUser(
    data.user.id,
    data.user.email ?? email,
    (data.user.user_metadata as { name?: string } | null)?.name,
  );
}

async function signupSupabase(name: string, email: string, password: string): Promise<AuthUser> {
  const sb = getSupabase()!;
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Signup failed');
  return toUser(data.user.id, data.user.email ?? email, name);
}

async function logoutSupabase() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
}

async function restoreSupabase(): Promise<AuthUser | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  const u = data.session?.user;
  if (!u) return null;
  return toUser(
    u.id,
    u.email ?? '',
    (u.user_metadata as { name?: string } | null)?.name,
  );
}

export const authService = {
  isLive: features.supabaseAuth,

  async login(email: string, password: string): Promise<AuthUser> {
    if (features.supabaseAuth) return loginSupabase(email, password);
    await wait(500);
    return toUser('usr_demo', email);
  },

  async signup(name: string, email: string, password: string): Promise<AuthUser> {
    if (features.supabaseAuth) return signupSupabase(name, email, password);
    await wait(500);
    return toUser('usr_demo', email, name);
  },

  async logout(): Promise<void> {
    if (features.supabaseAuth) {
      await logoutSupabase();
      return;
    }
    await wait(150);
  },

  async restoreSession(): Promise<AuthUser | null> {
    if (features.supabaseAuth) return restoreSupabase();
    return null;
  },
};
