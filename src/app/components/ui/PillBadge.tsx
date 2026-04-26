import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import CosmicIcon, { IconName } from './CosmicIcon';

type Props = {
  label: string;
  icon?: IconName;
  variant?: 'gold' | 'purple' | 'subtle';
  style?: StyleProp<ViewStyle>;
};

export default function PillBadge({ label, icon, variant = 'subtle', style }: Props) {
  return (
    <View style={[styles.wrap, variantStyle(variant), style]}>
      {icon && (
        <CosmicIcon
          name={icon}
          size={11}
          color={variant === 'gold' ? colors.goldBright : colors.textSecondary}
        />
      )}
      <Text style={[styles.text, variantText(variant)]}>{label}</Text>
    </View>
  );
}

function variantStyle(v: Props['variant']): ViewStyle {
  switch (v) {
    case 'gold':
      return {
        backgroundColor: 'rgba(246,200,95,0.12)',
        borderColor: 'rgba(246,200,95,0.45)',
      };
    case 'purple':
      return {
        backgroundColor: 'rgba(58,27,109,0.45)',
        borderColor: 'rgba(126,80,200,0.55)',
      };
    default:
      return {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.12)',
      };
  }
}

function variantText(v: Props['variant']) {
  switch (v) {
    case 'gold':
      return { color: colors.goldBright };
    case 'purple':
      return { color: '#D6C7FF' };
    default:
      return { color: colors.textSecondary };
  }
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.pill,
    fontSize: 11,
  },
});
