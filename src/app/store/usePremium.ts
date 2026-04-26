import { useCallback, useState } from 'react';

import { isMaster, isPremium, useEntitlementStore } from './entitlementStore';

/**
 * Tiny gating helper. Returns the current tier plus a `gate()` function
 * for actions that must be premium — `gate(fn)` runs `fn` if premium,
 * otherwise opens the paywall.
 *
 * Pattern:
 *   const { isPremium, gate, paywallVisible, hidePaywall } = usePremium();
 *   <CosmicButton onPress={() => gate(() => navigation.navigate('VideoCall'))} />
 *   <Paywall visible={paywallVisible} onClose={hidePaywall} />
 */
export function usePremium() {
  const tier = useEntitlementStore((s) => s.tier);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const showPaywall = useCallback(() => setPaywallVisible(true), []);
  const hidePaywall = useCallback(() => setPaywallVisible(false), []);

  const premium = isPremium(tier);

  const gate = useCallback(
    (action: () => void) => {
      if (premium) action();
      else setPaywallVisible(true);
    },
    [premium],
  );

  return {
    tier,
    isPremium: premium,
    isMaster: isMaster(tier),
    paywallVisible,
    showPaywall,
    hidePaywall,
    gate,
  };
}
