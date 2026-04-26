import { useEffect } from 'react';

import { features } from '../config/env';
import { partnerRepository } from '../services/partnerRepository';
import { useAuthStore } from './authStore';
import { useOnboardingStore } from './onboardingStore';

/**
 * Pull the partner record from Firestore once the user is signed in. The
 * local AsyncStorage copy is the cache for instant first paint; Firestore
 * is the source of truth for cross-device.
 */
export function usePartnerSync(enabled: boolean) {
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!enabled || !features.firebase || !userId) return;
    let cancelled = false;
    (async () => {
      const remote = await partnerRepository.load();
      if (cancelled || !remote) return;
      // Only overwrite the local cache if it differs — avoids a needless
      // re-render when the two are already in sync.
      const local = useOnboardingStore.getState().partner;
      const same =
        local &&
        local.name === remote.name &&
        local.birthDate === remote.birthDate &&
        local.birthLocation.lat === remote.birthLocation.lat &&
        local.birthLocation.lon === remote.birthLocation.lon;
      if (!same) useOnboardingStore.getState().setPartner(remote);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);
}
