/**
 * Tiny analytics surface. Three reasons it isn't `firebase/analytics`:
 *
 *   1. The Firebase Web SDK's analytics module doesn't work in React
 *      Native — it expects a browser DOM. The native paths
 *      (@react-native-firebase/analytics, react-native-mixpanel,
 *      posthog-react-native) all need a custom dev build.
 *   2. Most products end up wanting to fan events to multiple sinks
 *      (Mixpanel + Sentry breadcrumbs + an internal Firestore log).
 *   3. The product code shouldn't care. It calls `analytics.track(...)`
 *      and the registered adapters do the work.
 *
 * Default adapter prints to the dev console. To wire a real provider:
 *
 *   import { analytics } from '...';
 *   analytics.use({
 *     track: (name, props) => Mixpanel.track(name, props),
 *     screen: (name) => Mixpanel.track('Screen', { name }),
 *     identify: (id, traits) => Mixpanel.identify(id),
 *   });
 *
 * That's it — no call sites change.
 */

export type EventProps = Record<string, string | number | boolean | null | undefined>;

export type AnalyticsAdapter = {
  track?: (name: string, props?: EventProps) => void;
  screen?: (name: string, props?: EventProps) => void;
  identify?: (userId: string, traits?: EventProps) => void;
};

const consoleAdapter: AnalyticsAdapter = {
  track: (name, props) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[analytics] ${name}`, props ?? '');
    }
  },
  screen: (name, props) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[analytics:screen] ${name}`, props ?? '');
    }
  },
  identify: (userId, traits) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[analytics:identify] ${userId}`, traits ?? '');
    }
  },
};

let adapters: AnalyticsAdapter[] = [consoleAdapter];

export const analytics = {
  /** Replace the adapter list. Pass [] to silence analytics entirely. */
  use(...next: AnalyticsAdapter[]) {
    adapters = next.length > 0 ? next : [consoleAdapter];
  },

  track(name: string, props?: EventProps) {
    for (const a of adapters) a.track?.(name, props);
  },

  screen(name: string, props?: EventProps) {
    for (const a of adapters) a.screen?.(name, props);
  },

  identify(userId: string, traits?: EventProps) {
    for (const a of adapters) a.identify?.(userId, traits);
  },
};

/** Canonical event names — keeps the call sites typo-proof. */
export const Events = {
  AppOpened: 'app_opened',
  Signup: 'signup_completed',
  Login: 'login_completed',
  OnboardingCompleted: 'onboarding_completed',
  ChatMessageSent: 'chat_message_sent',
  ChatVoiceUsed: 'chat_voice_used',
  InsightSaved: 'insight_saved',
  PaywallShown: 'paywall_shown',
  SubscriptionStarted: 'subscription_started',
  PartnerAdded: 'partner_added',
  ShareCompleted: 'share_completed',
  ChatTtsPlayed: 'chat_tts_played',
} as const;
