import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AppState = {
  themeMode: 'default' | 'glass';
  activeTab: string;
  setThemeMode: (m: 'default' | 'glass') => void;
  setActiveTab: (t: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode: 'default',
      activeTab: 'Home',
      setThemeMode: (themeMode) => set({ themeMode }),
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'cosmicself.app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
      version: 1,
    },
  ),
);
