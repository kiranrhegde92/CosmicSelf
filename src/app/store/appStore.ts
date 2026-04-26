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
  /**
   * Each first-run coach-mark gets a key. We store completed keys so a coach
   * is never shown twice. Use `markCoachSeen(key)` after dismissing.
   */
  coachMarksSeen: string[];
  setThemeMode: (m: 'default' | 'glass') => void;
  setActiveTab: (t: string) => void;
  setPushEnabled: (v: boolean) => void;
  setDailyHoroscopeEnabled: (v: boolean) => void;
  setCosmicSoundscapeEnabled: (v: boolean) => void;
  setPendingChatPrompt: (p: string | null) => void;
  markCoachSeen: (key: string) => void;
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
      coachMarksSeen: [],
      setThemeMode: (themeMode) => set({ themeMode }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setPushEnabled: (pushEnabled) => set({ pushEnabled }),
      setDailyHoroscopeEnabled: (dailyHoroscopeEnabled) => set({ dailyHoroscopeEnabled }),
      setCosmicSoundscapeEnabled: (cosmicSoundscapeEnabled) => set({ cosmicSoundscapeEnabled }),
      setPendingChatPrompt: (pendingChatPrompt) => set({ pendingChatPrompt }),
      markCoachSeen: (key) =>
        set((s) =>
          s.coachMarksSeen.includes(key)
            ? s
            : { coachMarksSeen: [...s.coachMarksSeen, key] },
        ),
    }),
    {
      name: 'cosmicself.app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        pushEnabled: state.pushEnabled,
        dailyHoroscopeEnabled: state.dailyHoroscopeEnabled,
        cosmicSoundscapeEnabled: state.cosmicSoundscapeEnabled,
        coachMarksSeen: state.coachMarksSeen,
      }),
      version: 3,
    },
  ),
);
