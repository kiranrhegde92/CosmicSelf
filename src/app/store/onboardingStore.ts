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
  /** Last partner the user ran a compatibility report against. */
  partner: Partner | null;

  setBirthDate: (d: string) => void;
  setBirthTime: (t: { hour: number; minute: number; ampm: 'AM' | 'PM' }) => void;
  setBirthLocation: (loc: BirthLocation) => void;
  setAstrologer: (id: string) => void;
  setMode: (m: Mode) => void;
  completeOnboarding: () => void;
  setPartner: (p: Partner | null) => void;
  reset: () => void;
};

const initialState = {
  birthDate: null,
  birthTime: null,
  birthLocation: null,
  selectedAstrologerId: 'veda' as string | null,
  mode: 'serious' as Mode,
  hasOnboarded: false,
  partner: null as Partner | null,
};

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
      setPartner: (p) => set({ partner: p }),
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
        partner: state.partner,
      }),
      version: 3,
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
