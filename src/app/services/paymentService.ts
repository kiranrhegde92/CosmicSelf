import { Platform } from 'react-native';

import { env, features } from '../config/env';
import { useEntitlementStore, type Tier } from '../store/entitlementStore';

/*
 * RevenueCat integration scaffold.
 *
 * `react-native-purchases` requires a custom dev build (it has native
 * modules) and won't run in plain Expo Go. To enable:
 *   1. `npx expo install react-native-purchases`
 *   2. `eas build --profile development --platform ios|android`
 *   3. Set EXPO_PUBLIC_REVENUECAT_IOS_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
 *
 * Until then, the service exposes a stable mock surface so the UI can
 * be developed and demoed without a dev build.
 */

type PurchaseResult = { ok: boolean; planId: string; entitlement?: string; tier?: Tier };

function planIdToTier(planId: string): Tier {
  if (planId === 'master') return 'master';
  if (planId === 'pro') return 'pro';
  return 'free';
}

let bootstrapped = false;

async function bootstrap() {
  if (bootstrapped || !features.revenueCat) return;
  try {
    // Lazy require so the bundler doesn't choke when the package is absent.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const Purchases = require('react-native-purchases').default;
    const apiKey =
      Platform.OS === 'ios' ? env.revenuecat.iosKey : env.revenuecat.androidKey;
    if (!apiKey) return;
    Purchases.configure({ apiKey });
    bootstrapped = true;
  } catch {
    // Module not installed (running in Expo Go) — stay on mocks.
  }
}

export const paymentService = {
  isLive: features.revenueCat,

  async startCheckout(planId: string): Promise<PurchaseResult> {
    if (features.revenueCat) {
      try {
        await bootstrap();
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const Purchases = require('react-native-purchases').default;
        const offerings = await Purchases.getOfferings();
        const pkg =
          offerings.current?.availablePackages.find(
            (p: { identifier: string }) => p.identifier.toLowerCase().includes(planId),
          ) ?? offerings.current?.availablePackages[0];
        if (!pkg) return { ok: false, planId };
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const entitlement = Object.keys(customerInfo.entitlements.active)[0];
        if (entitlement) {
          const tier = planIdToTier(planId);
          useEntitlementStore.getState().setTier(tier);
          return { ok: true, planId, entitlement, tier };
        }
        return { ok: false, planId };
      } catch {
        return { ok: false, planId };
      }
    }
    // Mock path: still flip the entitlement so dev flows can demo the
    // gated screens without a real purchase.
    await new Promise((res) => setTimeout(res, 500));
    const tier = planIdToTier(planId);
    useEntitlementStore.getState().setTier(tier);
    return { ok: true, planId, entitlement: 'mock', tier };
  },

  async restorePurchases(): Promise<PurchaseResult> {
    if (features.revenueCat) {
      try {
        await bootstrap();
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const Purchases = require('react-native-purchases').default;
        const customerInfo = await Purchases.restorePurchases();
        const entitlement = Object.keys(customerInfo.entitlements.active)[0];
        if (entitlement) {
          const tier: Tier = entitlement.toLowerCase().includes('master') ? 'master' : 'pro';
          useEntitlementStore.getState().setTier(tier);
          return { ok: true, planId: 'restored', entitlement, tier };
        }
        return { ok: false, planId: 'restored' };
      } catch {
        return { ok: false, planId: 'restored' };
      }
    }
    return { ok: true, planId: 'restored', entitlement: 'mock' };
  },

  /** Wipe local entitlement (dev tool / "downgrade to free"). */
  resetTier(): void {
    useEntitlementStore.getState().setTier('free');
  },
};
