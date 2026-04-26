import { useEffect, useState } from 'react';

import { useAppStore } from './appStore';
import { useAuthStore } from './authStore';
import { useOnboardingStore } from './onboardingStore';

/**
 * Resolves to true once every persisted Zustand store has finished
 * rehydrating from AsyncStorage. Used by RootNavigator to keep the boot
 * splash on screen until persisted state is ready.
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(() =>
    Boolean(
      useAuthStore.persist.hasHydrated() &&
        useOnboardingStore.persist.hasHydrated() &&
        useAppStore.persist.hasHydrated(),
    ),
  );

  useEffect(() => {
    if (hydrated) return;

    const recheck = () => {
      if (
        useAuthStore.persist.hasHydrated() &&
        useOnboardingStore.persist.hasHydrated() &&
        useAppStore.persist.hasHydrated()
      ) {
        setHydrated(true);
      }
    };

    const unsubAuth = useAuthStore.persist.onFinishHydration(recheck);
    const unsubOnboarding = useOnboardingStore.persist.onFinishHydration(recheck);
    const unsubApp = useAppStore.persist.onFinishHydration(recheck);
    recheck();

    return () => {
      unsubAuth();
      unsubOnboarding();
      unsubApp();
    };
  }, [hydrated]);

  return hydrated;
}
