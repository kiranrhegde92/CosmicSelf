/**
 * @jest-environment node
 */

// AsyncStorage isn't available in Node — mock it for the persist middleware.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k: string) => store.get(k) ?? null),
      setItem: jest.fn(async (k: string, v: string) => {
        store.set(k, v);
      }),
      removeItem: jest.fn(async (k: string) => {
        store.delete(k);
      }),
    },
  };
});

import { useAuthStore } from './authStore';
import { useOnboardingStore, getBirthInputFromStore } from './onboardingStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('starts unauthenticated with no user', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('login sets the user and flips the flag', () => {
    useAuthStore
      .getState()
      .login({ id: 'u1', email: 'seeker@example.com', name: 'Seeker' });
    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(true);
    expect(s.user?.email).toBe('seeker@example.com');
  });

  it('logout clears the user', () => {
    useAuthStore.getState().login({ id: 'u1', email: 'a@b.com', name: 'A' });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('onboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it('reset returns the initial values', () => {
    useOnboardingStore.getState().setBirthDate('2000-01-01');
    useOnboardingStore.getState().reset();
    expect(useOnboardingStore.getState().birthDate).toBeNull();
  });

  it('getBirthInputFromStore yields a valid input only when all fields are set', () => {
    expect(getBirthInputFromStore(useOnboardingStore.getState())).toBeNull();
    useOnboardingStore.getState().setBirthDate('1995-05-20');
    useOnboardingStore.getState().setBirthTime({ hour: 8, minute: 30, ampm: 'AM' });
    useOnboardingStore.getState().setBirthLocation({
      label: 'Mumbai, India',
      lat: 19.07,
      lon: 72.87,
      tzOffsetMinutes: 330,
    });
    const input = getBirthInputFromStore(useOnboardingStore.getState());
    expect(input).not.toBeNull();
    expect(input?.isoLocal).toBe('1995-05-20T08:30:00');
    expect(input?.lat).toBeCloseTo(19.07, 2);
  });

  it('handles PM correctly when building the ISO string', () => {
    useOnboardingStore.getState().setBirthDate('1995-05-20');
    useOnboardingStore.getState().setBirthTime({ hour: 7, minute: 45, ampm: 'PM' });
    useOnboardingStore.getState().setBirthLocation({
      label: 'X',
      lat: 0,
      lon: 0,
      tzOffsetMinutes: 0,
    });
    const input = getBirthInputFromStore(useOnboardingStore.getState());
    expect(input?.isoLocal).toBe('1995-05-20T19:45:00');
  });
});
