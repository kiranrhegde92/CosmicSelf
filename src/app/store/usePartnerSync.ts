import { useEffect } from 'react';

import { features } from '../config/env';
import { partnerRepository } from '../services/partnerRepository';
import { useAuthStore } from './authStore';
import { useOnboardingStore } from './onboardingStore';

/**
 * Pull the partner records from Firestore once the user is signed in. The
 * local AsyncStorage copy is the cache for instant first paint; Firestore
 * is the source of truth for cross-device. We also default `activePartnerId`
 * to the first hydrated partner if nothing is selected yet.
 */
export function usePartnerSync(enabled: boolean) {
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!enabled || !features.firebase || !userId) return;
    let cancelled = false;
    (async () => {
      const remote = await partnerRepository.list();
      if (cancelled) return;
      const store = useOnboardingStore.getState();
      // Compare by id+name as a cheap fingerprint — avoids needless re-renders
      // when the local cache already matches Firestore.
      const sameLength = store.partners.length === remote.length;
      const sameSet =
        sameLength &&
        remote.every((r) =>
          store.partners.some(
            (l) =>
              l.id === r.id &&
              l.name === r.name &&
              l.birthDate === r.birthDate &&
              l.birthLocation.lat === r.birthLocation.lat &&
              l.birthLocation.lon === r.birthLocation.lon,
          ),
        );
      if (!sameSet) {
        useOnboardingStore.setState({ partners: remote });
      }
      const after = useOnboardingStore.getState();
      if (after.activePartnerId === null && after.partners.length > 0) {
        useOnboardingStore.getState().setActivePartnerId(after.partners[0].id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);
}
