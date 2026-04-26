import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Mode = 'serious' | 'fun';

export type BirthLocation = {
  label: string;
  lat: number;
  lon: number;
  timezone?: string;
  tzOffsetMinutes?: number;
};

export type Partner = {
  /** Stable id used as Firestore doc id and React keys. */
  id: string;
  /** Display name like "Alex" or "Mom". */
  name: string;
  /** ISO date YYYY-MM-DD */
  birthDate: string;
  birthTime: { hour: number; minute: number; ampm: 'AM' | 'PM' };
  birthLocation: BirthLocation;
};

type OnboardingState = {
  /** ISO date YYYY-MM-DD */
  birthDate: string | null;
  birthTime: { hour: number; minute: number; ampm: 'AM' | 'PM' } | null;
  birthLocation: BirthLocation | null;
  selectedAstrologerId: string | null;
  mode: Mode;
  hasOnboarded: boolean;
  /** All partners the user has saved for compatibility reports. */
  partners: Partner[];
  /** Currently active partner id, or null when none are selected. */
  activePartnerId: string | null;

  setBirthDate: (d: string) => void;
  setBirthTime: (t: { hour: number; minute: number; ampm: 'AM' | 'PM' }) => void;
  setBirthLocation: (loc: BirthLocation) => void;
  setAstrologer: (id: string) => void;
  setMode: (m: Mode) => void;
  completeOnboarding: () => void;
  addPartner: (p: Partner) => void;
  updatePartner: (id: string, patch: Partial<Omit<Partner, 'id'>>) => void;
  removePartner: (id: string) => void;
  setActivePartnerId: (id: string | null) => void;
  reset: () => void;
};

const initialState = {
  birthDate: null,
  birthTime: null,
  birthLocation: null,
  selectedAstrologerId: 'veda' as string | null,
  mode: 'serious' as Mode,
  hasOnboarded: false,
  partners: [] as Partner[],
  activePartnerId: null as string | null,
};

/**
 * Generate a stable id for a new partner. Uses crypto.randomUUID when
 * available (Hermes 0.74+, web) and falls back to a Date+Math seeded
 * id otherwise.
 */
export function newPartnerId(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) {
    try {
      return g.crypto.randomUUID();
    } catch {
      // fall through
    }
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setBirthDate: (d) => set({ birthDate: d }),
      setBirthTime: (t) => set({ birthTime: t }),
      setBirthLocation: (loc) => set({ birthLocation: loc }),
      setAstrologer: (id) => set({ selectedAstrologerId: id }),
      setMode: (m) => set({ mode: m }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      addPartner: (p) =>
        set((state) => ({
          partners: [...state.partners, p],
          activePartnerId: state.activePartnerId ?? p.id,
        })),
      updatePartner: (id, patch) =>
        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === id ? { ...p, ...patch, id: p.id } : p,
          ),
        })),
      removePartner: (id) =>
        set((state) => {
          const partners = state.partners.filter((p) => p.id !== id);
          const activePartnerId =
            state.activePartnerId === id
              ? partners[0]?.id ?? null
              : state.activePartnerId;
          return { partners, activePartnerId };
        }),
      setActivePartnerId: (id) => set({ activePartnerId: id }),
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'cosmicself.onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        birthDate: state.birthDate,
        birthTime: state.birthTime,
        birthLocation: state.birthLocation,
        selectedAstrologerId: state.selectedAstrologerId,
        mode: state.mode,
        hasOnboarded: state.hasOnboarded,
        partners: state.partners,
        activePartnerId: state.activePartnerId,
      }),
      version: 4,
      migrate: (persistedState, fromVersion) => {
        // Pre-v4 schema kept a single `partner` field. Promote it to the
        // `partners` array and mark it active.
        const s = (persistedState ?? {}) as Record<string, unknown>;
        if (fromVersion < 4) {
          const legacy = s.partner as Partner | null | undefined;
          if (legacy && typeof legacy === 'object') {
            const id =
              typeof (legacy as Partner).id === 'string' && (legacy as Partner).id
                ? (legacy as Partner).id
                : newPartnerId();
            const promoted: Partner = { ...(legacy as Partner), id };
            s.partners = [promoted];
            s.activePartnerId = id;
          } else {
            s.partners = [];
            s.activePartnerId = null;
          }
          delete s.partner;
        }
        return s as OnboardingState;
      },
    },
  ),
);

function timeToHours(t: { hour: number; minute: number; ampm: 'AM' | 'PM' }): {
  hh: string;
  mm: string;
} {
  let h = t.hour % 12;
  if (t.ampm === 'PM') h += 12;
  return {
    hh: h.toString().padStart(2, '0'),
    mm: t.minute.toString().padStart(2, '0'),
  };
}

/** Build an ISO local datetime string + tz offset from persisted onboarding. */
export function getBirthInputFromStore(state: OnboardingState) {
  if (!state.birthDate || !state.birthTime || !state.birthLocation) return null;
  const { hh, mm } = timeToHours(state.birthTime);
  return {
    isoLocal: `${state.birthDate}T${hh}:${mm}:00`,
    lat: state.birthLocation.lat,
    lon: state.birthLocation.lon,
    tzOffsetMinutes: state.birthLocation.tzOffsetMinutes ?? 0,
  };
}

/** Build an ISO local datetime string + tz offset from a Partner record. */
export function partnerToBirthInput(p: Partner) {
  const { hh, mm } = timeToHours(p.birthTime);
  return {
    isoLocal: `${p.birthDate}T${hh}:${mm}:00`,
    lat: p.birthLocation.lat,
    lon: p.birthLocation.lon,
    tzOffsetMinutes: p.birthLocation.tzOffsetMinutes ?? 0,
  };
}

/**
 * Back-compat helper: returns the active Partner (or null). Replaces the
 * old `state.partner` accessor everywhere now that the store holds many.
 */
export function getActivePartner(state: OnboardingState): Partner | null {
  if (!state.activePartnerId) return null;
  return state.partners.find((p) => p.id === state.activePartnerId) ?? null;
}
