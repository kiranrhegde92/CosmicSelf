import { create } from 'zustand';

type AppState = {
  themeMode: 'default' | 'glass';
  activeTab: string;
  setThemeMode: (m: 'default' | 'glass') => void;
  setActiveTab: (t: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  themeMode: 'default',
  activeTab: 'Home',
  setThemeMode: (themeMode) => set({ themeMode }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));
