import type { ComponentType } from 'react';
import * as Sentry from '@sentry/react-native';

import { env, features } from '../config/env';

let initialized = false;

/**
 * Initializes Sentry if a DSN is configured. Safe to call multiple times.
 * No-op when no DSN — local/dev builds don't need to spin up Sentry.
 *
 * Call once at app boot, before the first render. Subsequent crashes route
 * through the React error boundary; transient errors flow through
 * `captureError(...)` from feature code.
 */
export function initSentry(): void {
  if (initialized) return;
  if (!features.sentry) return;
  Sentry.init({
    dsn: env.sentry.dsn,
    environment: env.sentry.environment,
    // Default sample rates — keep traces light until we see real volume.
    tracesSampleRate: 0.1,
    // Don't send default PII (IPs, cookies). User context is set explicitly
    // from the auth bridge below if/when a user is signed in.
    sendDefaultPii: false,
    // Don't auto-enable replays — they ship a lot of bytes and need explicit
    // privacy review for an astrology app that handles birth details.
    enableAutoSessionTracking: true,
  });
  initialized = true;
}

/** Tag the active Sentry user. Call after login + on logout (with null). */
export function setSentryUser(user: { id: string; email?: string } | null): void {
  if (!features.sentry) return;
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  // Email kept off by default — if you need it for support, set
  // sendDefaultPii=true above and add { email: user.email } here.
  Sentry.setUser({ id: user.id });
}

/** Manually report a non-fatal error. Adds a "handled" tag for filtering. */
export function captureError(err: unknown, context?: Record<string, unknown>): void {
  if (!features.sentry) {
    // In dev / when Sentry's off, log so we still see the error locally.
    // eslint-disable-next-line no-console
    console.error('[captureError]', err, context);
    return;
  }
  Sentry.withScope((scope) => {
    scope.setTag('handled', 'true');
    if (context) scope.setContext('extra', context);
    Sentry.captureException(err);
  });
}

/** Wrap your root component with this so unhandled JS crashes flow to Sentry. */
export function wrapApp<T extends ComponentType<unknown>>(Component: T): T {
  if (!features.sentry) return Component;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Sentry.wrap(Component as any) as unknown as T;
}
