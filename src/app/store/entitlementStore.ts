import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Tier = 'free' | 'pro' | 'master';

type EntitlementState = {
  tier: Tier;
  /** Last verified at (ms). Updated on every refresh from RevenueCat. */
  verifiedAt: number | null;
  setTier: (t: Tier) => void;
};

/**
 * Held separately from authStore so the entitlement can be persisted +
 * read by gating code without dragging the auth surface in. RevenueCat,
 * Firebase custom claims, or any other backend can be the source — call
 * `setTier()` whenever it changes and the rest of the app reacts.
 */
export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set) => ({
      tier: 'free',
      verifiedAt: null,
      setTier: (tier) => set({ tier, verifiedAt: Date.now() }),
    }),
    {
      name: 'cosmicself.entitlement',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tier: state.tier, verifiedAt: state.verifiedAt }),
      version: 1,
    },
  ),
);

export function isPremium(tier: Tier): boolean {
  return tier === 'pro' || tier === 'master';
}

export function isMaster(tier: Tier): boolean {
  return tier === 'master';
}
