import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { Tier } from '../../store/entitlementStore';
import CosmicIcon, { IconName } from './CosmicIcon';

type Props = {
  tier: Tier;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

const META: Record<Tier, { label: string; icon: IconName; tint: string; tintBg: string }> = {
  free: {
    label: 'Free',
    icon: 'moon',
    tint: colors.textSecondary,
    tintBg: 'rgba(255,255,255,0.05)',
  },
  pro: {
    label: 'Pro Seeker',
    icon: 'sparkle',
    tint: colors.goldBright,
    tintBg: 'rgba(246,200,95,0.15)',
  },
  master: {
    label: 'Cosmic Master',
    icon: 'crown',
    tint: colors.goldBright,
    tintBg: 'rgba(246,200,95,0.22)',
  },
};

/**
 * Small pill that shows the current entitlement tier. Used on Profile,
 * the Home top bar, and the Subscription "current plan" indicator.
 */
export default function TierBadge({ tier, size = 'sm', style }: Props) {
  const meta = META[tier];
  const px = size === 'sm' ? spacing.sm : spacing.md;
  const py = size === 'sm' ? 4 : 6;
  const fs = size === 'sm' ? 10 : 11;

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingHorizontal: px,
          paddingVertical: py,
          backgroundColor: meta.tintBg,
          borderColor: tier === 'free' ? 'rgba(255,255,255,0.18)' : meta.tint,
        },
        style,
      ]}
    >
      <CosmicIcon name={meta.icon} color={meta.tint} size={fs} />
      <Text style={[styles.label, { color: meta.tint, fontSize: fs }]}>
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.pill,
    letterSpacing: 0.5,
  },
});
