import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, deleteField, serverTimestamp, setDoc } from 'firebase/firestore';

import { features } from '../config/env';
import { astrologyService } from './astrologyService';
import { getDb, getFirebaseAuth } from './firebaseClient';

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

  /**
   * Register an Expo push token with Firestore at:
   *   users/{uid}/profile/push
   * so server-side jobs can deliver pushes when the app is killed.
   *
   * Safe to call multiple times — Expo returns a stable token per device,
   * and we re-write only when it changes. Returns the token (or null on
   * failure / simulator / no Firebase / no permission).
   */
  async registerPushToken(): Promise<string | null> {
    if (!Device.isDevice) return null; // simulator can't get a real token
    const granted = await ensurePermission();
    if (!granted) return null;
    await ensureChannel();

    let token: string;
    try {
      // projectId comes from app.config / Expo project; required for the
      // managed-workflow push token API.
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        // Fallback for older Constants shape.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Constants as any).easConfig?.projectId;
      const result = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      token = result.data;
    } catch {
      return null;
    }

    if (!features.firebase) return token;
    const db = getDb();
    const auth = getFirebaseAuth();
    if (!db || !auth?.currentUser) return token;

    // Read the user's current preferences so the server scheduler honors
    // the same toggles the local schedule uses.
    let dailyHoroscope = true;
    try {
      const { useAppStore } = await import('../store/appStore');
      dailyHoroscope = useAppStore.getState().dailyHoroscopeEnabled;
    } catch {
      /* default to true if the store isn't available (shouldn't happen) */
    }

    try {
      await setDoc(
        doc(db, `users/${auth.currentUser.uid}/profile/push`),
        {
          expoPushToken: token,
          platform: Platform.OS,
          dailyHoroscope,
          // Local-time preference for when the user wants their daily push.
          // The scheduled Function fires once per UTC slot and only delivers
          // to users whose local hour matches; the client picks 8:00 by
          // default but Settings can refine this later.
          localHour: 8,
          tzOffsetMinutes: -new Date().getTimezoneOffset(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch {
      /* mirror failure is non-fatal */
    }
    return token;
  },

  /**
   * Update just the dailyHoroscope flag on the server-side push doc, without
   * fetching a new token. Used when the user flips the Daily Horoscope
   * toggle in Settings.
   */
  async setServerDailyHoroscope(enabled: boolean): Promise<void> {
    if (!features.firebase) return;
    const db = getDb();
    const auth = getFirebaseAuth();
    if (!db || !auth?.currentUser) return;
    try {
      await setDoc(
        doc(db, `users/${auth.currentUser.uid}/profile/push`),
        { dailyHoroscope: enabled, updatedAt: serverTimestamp() },
        { merge: true },
      );
    } catch {
      /* no-op */
    }
  },

  /**
   * Clear the Firestore push token (on sign-out, etc.) so the scheduled
   * Function stops sending pushes for this user. Local schedule is left
   * intact — that's a separate user setting.
   */
  async unregisterPushToken(): Promise<void> {
    if (!features.firebase) return;
    const db = getDb();
    const auth = getFirebaseAuth();
    if (!db || !auth?.currentUser) return;
    try {
      await setDoc(
        doc(db, `users/${auth.currentUser.uid}/profile/push`),
        {
          expoPushToken: deleteField(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch {
      /* no-op */
    }
  },
};
