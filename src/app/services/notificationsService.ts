import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { astrologyService } from './astrologyService';

const DAILY_HOROSCOPE_ID = 'cosmicself.daily-horoscope';
const DEFAULT_BODY = 'The stars have new guidance for you. Tap to read.';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensurePermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;
  if (!existing.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.status === 'granted';
}

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('cosmic-daily', {
    name: 'Daily Cosmic Insight',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: '#F6C85F',
  });
}

export const notificationsService = {
  /**
   * Schedule the daily horoscope to fire at the given local hour:minute.
   * The body uses the user's *current* strongest transit when birth data is
   * available — re-running this on app start refreshes it. (For
   * truly day-of-content the right move is a server-driven push; this is
   * a strong v1.)
   */
  async scheduleDailyHoroscope(hour = 8, minute = 0) {
    const granted = await ensurePermission();
    if (!granted) return false;
    await ensureChannel();
    await this.cancelDailyHoroscope();

    const personalized = await astrologyService
      .getDailyNotificationBlurb()
      .catch(() => null);

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_HOROSCOPE_ID,
      content: {
        title: 'Your daily cosmic insight ✦',
        body: personalized ?? DEFAULT_BODY,
        data: { route: 'DailyInsight' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as Notifications.NotificationTriggerInput,
    });
    return true;
  },

  async cancelDailyHoroscope() {
    try {
      await Notifications.cancelScheduledNotificationAsync(DAILY_HOROSCOPE_ID);
    } catch {
      /* no-op if it wasn't scheduled */
    }
  },

  async getScheduled() {
    return Notifications.getAllScheduledNotificationsAsync();
  },
};
