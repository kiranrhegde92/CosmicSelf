import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography, fonts } from '../../theme/typography';
import GlassCard from '../ui/GlassCard';
import CosmicIcon, { IconName } from '../ui/CosmicIcon';

type Props = {
  icon: IconName;
  title: string;
  value: string;
  description?: string;
  tone?: 'gold' | 'rose' | 'mint' | 'blue';
};

export default function DailyInsightCard({ icon, title, value, description, tone = 'gold' }: Props) {
  const tint = toneColor(tone);
  return (
    <GlassCard padding={spacing.md} style={{ flex: 1 }}>
      <View style={styles.head}>
        <View style={[styles.iconWrap, { borderColor: tint, backgroundColor: `${tint}22` }]}>
          <CosmicIcon name={icon} color={tint} size={16} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={[styles.value, { color: tint }]}>{value}</Text>
      {description && <Text style={styles.desc}>{description}</Text>}
    </GlassCard>
  );
}

function toneColor(t: Props['tone']) {
  switch (t) {
    case 'rose':
      return '#FFAFD7';
    case 'mint':
      return '#9DEDCB';
    case 'blue':
      return '#9AC8FF';
    default:
      return colors.goldPrimary;
  }
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: fonts.bodySemibold,
    letterSpacing: 0.4,
  },
  value: {
    ...typography.section,
    fontSize: 18,
    marginTop: spacing.xs,
  },
  desc: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
});
