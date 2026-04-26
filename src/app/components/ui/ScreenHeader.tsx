import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import CosmicIcon, { IconName } from './CosmicIcon';

type Props = {
  title?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
  rightLabel?: string;
  ornament?: boolean;
};

export default function ScreenHeader({
  title,
  subtitle,
  align = 'center',
  showBack,
  onBack,
  rightIcon,
  onRightPress,
  rightLabel,
  ornament = true,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.side}>
          {showBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBack}
              hitSlop={10}
              style={styles.iconBtn}
            >
              <CosmicIcon name="arrow-left" color={colors.white} size={20} />
            </Pressable>
          )}
        </View>
        <View style={[styles.center, align === 'left' && styles.left]}>
          {ornament && align === 'center' && (
            <View style={styles.ornament}>
              <CosmicIcon name="sparkle" color={colors.goldPrimary} size={14} />
            </View>
          )}
          {title && (
            <Text style={[typography.titleSm, styles.title, align === 'left' && { textAlign: 'left' }]}>
              {title}
            </Text>
          )}
          {ornament && align === 'center' && (
            <View style={styles.ornament}>
              <View style={styles.ornamentLine} />
              <CosmicIcon name="sparkle" color={colors.goldPrimary} size={10} />
              <View style={styles.ornamentLine} />
            </View>
          )}
        </View>
        <View style={[styles.side, { alignItems: 'flex-end' }]}>
          {rightIcon && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={rightLabel || 'action'}
              onPress={onRightPress}
              hitSlop={10}
              style={styles.iconBtn}
            >
              <CosmicIcon name={rightIcon} color={colors.white} size={18} />
            </Pressable>
          )}
        </View>
      </View>
      {subtitle && (
        <Text
          style={[
            typography.subtitle,
            { color: colors.textSecondary, textAlign: align, marginTop: spacing.xs },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  left: {
    alignItems: 'flex-start',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.18)',
  },
  title: {
    color: colors.white,
    textAlign: 'center',
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  ornamentLine: {
    width: 28,
    height: 1,
    backgroundColor: 'rgba(246,200,95,0.45)',
  },
});
