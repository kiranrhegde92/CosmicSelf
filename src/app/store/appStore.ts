import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AppState = {
  themeMode: 'default' | 'glass';
  activeTab: string;
  pushEnabled: boolean;
  dailyHoroscopeEnabled: boolean;
  cosmicSoundscapeEnabled: boolean;
  /** Set by HomeScreen's AskBar; consumed + cleared by ChatScreen on mount. */
  pendingChatPrompt: string | null;
  setThemeMode: (m: 'default' | 'glass') => void;
  setActiveTab: (t: string) => void;
  setPushEnabled: (v: boolean) => void;
  setDailyHoroscopeEnabled: (v: boolean) => void;
  setCosmicSoundscapeEnabled: (v: boolean) => void;
  setPendingChatPrompt: (p: string | null) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode: 'default',
      activeTab: 'Home',
      pushEnabled: true,
      dailyHoroscopeEnabled: true,
      cosmicSoundscapeEnabled: true,
      pendingChatPrompt: null,
      setThemeMode: (themeMode) => set({ themeMode }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setPushEnabled: (pushEnabled) => set({ pushEnabled }),
      setDailyHoroscopeEnabled: (dailyHoroscopeEnabled) => set({ dailyHoroscopeEnabled }),
      setCosmicSoundscapeEnabled: (cosmicSoundscapeEnabled) => set({ cosmicSoundscapeEnabled }),
      setPendingChatPrompt: (pendingChatPrompt) => set({ pendingChatPrompt }),
    }),
    {
      name: 'cosmicself.app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        pushEnabled: state.pushEnabled,
        dailyHoroscopeEnabled: state.dailyHoroscopeEnabled,
        cosmicSoundscapeEnabled: state.cosmicSoundscapeEnabled,
      }),
      version: 2,
    },
  ),
);
