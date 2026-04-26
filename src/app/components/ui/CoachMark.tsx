import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAppStore } from '../../store/appStore';
import CosmicIcon, { IconName } from './CosmicIcon';

type Props = {
  /** Stable key — once dismissed, the coach won't appear again. */
  storageKey: string;
  /** Whether the coach can render (e.g. wait for hydration). */
  enabled?: boolean;
  title: string;
  body: string;
  icon?: IconName;
  /** Direction the cosmic finger points. Default: bottom-center. */
  arrow?: 'top' | 'bottom' | 'left' | 'right';
};

/**
 * One-time, dismissable coach-mark. Renders a glassy card with a glowing
 * sparkle, a single Got it CTA, and a backdrop. Once dismissed, the
 * `storageKey` is recorded in `appStore.coachMarksSeen` and the coach
 * never shows again. Pure additive — drop into any screen.
 */
export default function CoachMark({
  storageKey,
  enabled = true,
  title,
  body,
  icon = 'sparkle',
}: Props) {
  const seen = useAppStore((s) => s.coachMarksSeen);
  const markSeen = useAppStore((s) => s.markCoachSeen);
  const visible = enabled && !seen.includes(storageKey);

  const pulse = useSharedValue(1);
  useEffect(() => {
    if (!visible) return;
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [visible, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const onDismiss = () => {
    markSeen(storageKey);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.cardWrap} onPress={() => undefined}>
          <Animated.View style={[styles.iconBubble, pulseStyle]}>
            <CosmicIcon name={icon} color="#1A0F33" size={20} />
          </Animated.View>
          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
            <Pressable onPress={onDismiss} style={styles.cta} accessibilityLabel="Got it">
              <Text style={styles.ctaText}>Got it</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,8,23,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  cardWrap: {
    alignItems: 'center',
    maxWidth: 360,
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -22, // overlap the card
    zIndex: 5,
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(20,18,41,0.97)',
    borderRadius: radii.xl,
    borderWidth: 1.4,
    borderColor: 'rgba(246,200,95,0.5)',
    paddingTop: spacing.xl + 6,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    ...typography.section,
    fontSize: 18,
    color: colors.goldBright,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  cta: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.goldPrimary,
  },
  ctaText: {
    ...typography.button,
    color: '#1A0F33',
  },
});
