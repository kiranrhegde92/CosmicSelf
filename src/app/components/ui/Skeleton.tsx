import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

type Variant = 'block' | 'line' | 'circle' | 'card';

type Props = {
  variant?: Variant;
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Faint shimmering placeholder block. Designed for in-app loading states —
 * matches the dark cosmic palette so it never looks like a "missing image"
 * grey rectangle. Pure Reanimated, no skia / linear-gradient deps.
 */
export default function Skeleton({
  variant = 'block',
  width,
  height,
  radius,
  style,
}: Props) {
  const opacity = useSharedValue(0.28);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.55, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const dims = sizeFor(variant, width, height, radius);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.base,
        dims,
        animated,
        style,
      ]}
    />
  );
}

function sizeFor(
  variant: Variant,
  width?: number | `${number}%`,
  height?: number,
  radius?: number,
): ViewStyle {
  switch (variant) {
    case 'line':
      return {
        width: width ?? '60%',
        height: height ?? 12,
        borderRadius: radius ?? 6,
      };
    case 'circle': {
      const s = (typeof width === 'number' ? width : undefined) ?? height ?? 48;
      return { width: s, height: s, borderRadius: s / 2 };
    }
    case 'card':
      return {
        width: width ?? '100%',
        height: height ?? 120,
        borderRadius: radius ?? radii.xl,
      };
    case 'block':
    default:
      return {
        width: width ?? '100%',
        height: height ?? 80,
        borderRadius: radius ?? radii.md,
      };
  }
}

/** Convenience composition: a stack of N skeleton lines for paragraph copy. */
export function SkeletonParagraph({
  lines = 3,
  lastLineWidth = '70%',
  spacing: gap = spacing.xs,
}: {
  lines?: number;
  lastLineWidth?: number | `${number}%`;
  spacing?: number;
}) {
  const arr = Array.from({ length: lines });
  return (
    <View style={{ gap }}>
      {arr.map((_, i) => (
        <Skeleton
          key={i}
          variant="line"
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
  },
});
