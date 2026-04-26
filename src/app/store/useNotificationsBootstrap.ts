import { useEffect } from 'react';

import { notificationsService } from '../services/notificationsService';
import { useAppStore } from './appStore';

/**
 * After the auth/onboarded gate flips true, schedule (or cancel) the daily
 * horoscope based on the persisted settings. Idempotent — schedules cancel
 * the previous registration before registering a new one.
 */
export function useNotificationsBootstrap(enabled: boolean) {
  const pushEnabled = useAppStore((s) => s.pushEnabled);
  const horoscopeEnabled = useAppStore((s) => s.dailyHoroscopeEnabled);

  useEffect(() => {
    if (!enabled) return;
    if (pushEnabled && horoscopeEnabled) {
      notificationsService.scheduleDailyHoroscope().catch(() => {
        /* perms denied; user will see the request prompt next time */
      });
    } else {
      notificationsService.cancelDailyHoroscope().catch(() => {});
    }
  }, [enabled, pushEnabled, horoscopeEnabled]);
}
