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

  // Two-shadow stack: the outer wrapper carries a wide purple bloom (the
  // ambient cosmic glow) and the inner wrapper carries a tight black drop
  // shadow (crisp depth). RN can't combine multiple shadows on one View —
  // this is the standard wrap-with-two-Views workaround.
  return (
    <View style={[shadows.purpleGlow, { borderRadius: radius, opacity }, style]}>
      <View
        style={[
          styles.wrap,
          {
            borderRadius: radius,
            borderColor: borderGlow ? colors.glassBorder : colors.glassBorderSoft,
          },
          shadows.card,
        ]}
      >
        {/* Glass-tinted body gradient (top-down lighting). */}
        <LinearGradient
          colors={grad as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
        {/* Top-edge gold gloss — short vertical fade so the upper inner edge
            picks up a subtle highlight, like top-lit glass. */}
        <LinearGradient
          colors={
            gradients.topGloss as unknown as readonly [string, string, ...string[]]
          }
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.gloss, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]}
          pointerEvents="none"
        />
        {/* Bottom-inner shade so cards feel grounded, not floating. */}
        <LinearGradient
          colors={
            gradients.bottomShade as unknown as readonly [string, string, ...string[]]
          }
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.shade, { borderBottomLeftRadius: radius, borderBottomRightRadius: radius }]}
          pointerEvents="none"
        />
        <View style={[styles.inner, { padding, borderRadius: radius }]}>{children}</View>
      </View>
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
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
  },
  shade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '32%',
  },
});
