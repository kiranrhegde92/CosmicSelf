import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Mode = 'serious' | 'fun';

type OnboardingState = {
  birthDate: string | null;
  birthTime: { hour: number; minute: number; ampm: 'AM' | 'PM' } | null;
  birthLocation: string | null;
  selectedAstrologerId: string | null;
  mode: Mode;
  hasOnboarded: boolean;

  setBirthDate: (d: string) => void;
  setBirthTime: (t: { hour: number; minute: number; ampm: 'AM' | 'PM' }) => void;
  setBirthLocation: (loc: string) => void;
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
      version: 1,
    },
  ),
);
