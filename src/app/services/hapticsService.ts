import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Thin wrapper over expo-haptics that no-ops on web + handles errors
 * silently (some Android devices throw when the haptics service is busy).
 * Each call is fire-and-forget — never await.
 */

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

function safe(fn: () => Promise<unknown>) {
  if (!enabled) return;
  fn().catch(() => {
    /* no-op */
  });
}

export const haptics = {
  /** Light tap — generic press feedback. */
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /** Medium tap — confirming a primary action. */
  press: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /** Heavy tap — major event (e.g. start/end of recording). */
  thump: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),

  /** Success notification — green-flow events (saved, sent, subscribed). */
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /** Warning notification — caution moments (paywall, gate). */
  warning: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),

  /** Error notification — failures the user should notice. */
  error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),

  /** Tiny tick — picker / slider increments. */
  selection: () => safe(() => Haptics.selectionAsync()),
};
