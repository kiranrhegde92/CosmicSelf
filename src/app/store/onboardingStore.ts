import { create } from 'zustand';

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

export const useOnboardingStore = create<OnboardingState>((set) => ({
  birthDate: null,
  birthTime: null,
  birthLocation: null,
  selectedAstrologerId: 'veda',
  mode: 'serious',
  hasOnboarded: false,

  setBirthDate: (d) => set({ birthDate: d }),
  setBirthTime: (t) => set({ birthTime: t }),
  setBirthLocation: (loc) => set({ birthLocation: loc }),
  setAstrologer: (id) => set({ selectedAstrologerId: id }),
  setMode: (m) => set({ mode: m }),
  completeOnboarding: () => set({ hasOnboarded: true }),
  reset: () =>
    set({
      birthDate: null,
      birthTime: null,
      birthLocation: null,
      selectedAstrologerId: 'veda',
      mode: 'serious',
      hasOnboarded: false,
    }),
}));
