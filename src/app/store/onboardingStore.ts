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

type OnboardingState = {
  /** ISO date YYYY-MM-DD */
  birthDate: string | null;
  birthTime: { hour: number; minute: number; ampm: 'AM' | 'PM' } | null;
  birthLocation: BirthLocation | null;
  selectedAstrologerId: string | null;
  mode: Mode;
  hasOnboarded: boolean;

  setBirthDate: (d: string) => void;
  setBirthTime: (t: { hour: number; minute: number; ampm: 'AM' | 'PM' }) => void;
  setBirthLocation: (loc: BirthLocation) => void;
  setAstrologer: (id: string) => void;
  setMode: (m: Mode) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

const initialState = {
  birthDate: null,
  birthTime: null,
  birthLocation: null,
  selectedAstrologerId: 'veda' as string | null,
  mode: 'serious' as Mode,
  hasOnboarded: false,
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
      }),
      version: 2,
    },
  ),
);

/** Build an ISO local datetime string + tz offset from persisted onboarding. */
export function getBirthInputFromStore(state: OnboardingState) {
  if (!state.birthDate || !state.birthTime || !state.birthLocation) return null;
  let h = state.birthTime.hour % 12;
  if (state.birthTime.ampm === 'PM') h += 12;
  const hh = h.toString().padStart(2, '0');
  const mm = state.birthTime.minute.toString().padStart(2, '0');
  return {
    isoLocal: `${state.birthDate}T${hh}:${mm}:00`,
    lat: state.birthLocation.lat,
    lon: state.birthLocation.lon,
    tzOffsetMinutes: state.birthLocation.tzOffsetMinutes ?? 0,
  };
}
