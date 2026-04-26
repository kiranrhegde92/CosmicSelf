import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

type Props = {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
  padding?: number;
  borderGlow?: boolean;
  opacity?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export default function GlassCard({
  children,
  variant = 'dark',
  padding = spacing.cardPad,
  borderGlow = true,
  opacity = 1,
  radius = radii.xl,
  style,
}: Props) {
  const grad = variant === 'light' ? gradients.glassCard : gradients.glassCardSoft;

  return (
    <View
      style={[
        styles.wrap,
        {
          borderRadius: radius,
          opacity,
          borderColor: borderGlow ? colors.glassBorder : colors.glassBorderSoft,
        },
        borderGlow ? shadows.purpleGlow : shadows.card,
        style,
      ]}
    >
      <LinearGradient
        colors={grad as unknown as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
      <View style={[styles.inner, { padding, borderRadius: radius }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: colors.darkCardSoft,
  },
  inner: {
    overflow: 'hidden',
  },
});
