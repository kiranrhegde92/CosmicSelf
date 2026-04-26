import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { colors, gradients } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { typography } from '../../theme/typography';
import { haptics } from '../../services/hapticsService';
import CosmicIcon, { IconName } from './CosmicIcon';

type Variant = 'primary' | 'secondary' | 'glass' | 'outline' | 'danger';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  shimmer?: boolean;
};

export default function CosmicButton({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  iconRight,
  fullWidth = true,
  size = 'md',
  style,
  shimmer = true,
}: Props) {
  const press = useSharedValue(0);
  const shimmerX = useSharedValue(-1);

  useEffect(() => {
    if (variant === 'primary' && shimmer && !disabled) {
      shimmerX.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1800, easing: Easing.linear }),
          withTiming(-1, { duration: 0 }),
        ),
        -1,
        false,
      );
    }
  }, [variant, shimmer, disabled, shimmerX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.03 }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value * 220 }],
    opacity: 0.4,
  }));

  const heights: Record<string, number> = { sm: 44, md: 54, lg: 60 };
  const height = heights[size];

  const isDisabled = disabled || loading;
  const textColor = getTextColor(variant);

  return (
    <Animated.View style={[fullWidth && { alignSelf: 'stretch' }, animatedStyle, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: !!isDisabled }}
        onPress={
          isDisabled
            ? undefined
            : () => {
                if (variant === 'primary') haptics.press();
                else haptics.tap();
                onPress?.();
              }
        }
        onPressIn={() => (press.value = withTiming(1, { duration: 90 }))}
        onPressOut={() => (press.value = withTiming(0, { duration: 120 }))}
        style={[
          styles.base,
          {
            height,
            borderRadius: radii.lg,
            opacity: isDisabled ? 0.55 : 1,
          },
          variant === 'primary' && shadows.goldGlowSoft,
        ]}
      >
        {variant === 'primary' && (
          <LinearGradient
            colors={gradients.goldButton as unknown as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {variant === 'secondary' && (
          <LinearGradient
            colors={['rgba(58,27,109,0.85)', 'rgba(20,18,41,0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {variant === 'glass' && (
          <View style={[StyleSheet.absoluteFill, styles.glassBg]} />
        )}
        {variant === 'outline' && (
          <View style={[StyleSheet.absoluteFill, styles.outlineBg]} />
        )}
        {variant === 'danger' && (
          <LinearGradient
            colors={['#FF6B6B', '#B43A3A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        {variant === 'primary' && shimmer && !disabled && (
          <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]} />
        )}

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color={textColor} />
          ) : (
            <>
              {icon && (
                <View style={{ marginRight: spacing.xs }}>
                  <CosmicIcon name={icon} color={textColor} size={20} />
                </View>
              )}
              <Text style={[typography.button, { color: textColor }]} numberOfLines={1}>
                {title}
              </Text>
              {iconRight && (
                <View style={{ marginLeft: spacing.xs }}>
                  <CosmicIcon name={iconRight} color={textColor} size={20} />
                </View>
              )}
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function getTextColor(variant: Variant) {
  switch (variant) {
    case 'primary':
      return '#1A0F33';
    case 'outline':
      return colors.goldPrimary;
    case 'danger':
      return colors.white;
    default:
      return colors.white;
  }
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  glassBg: {
    backgroundColor: colors.glassSurface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.lg,
  },
  outlineBg: {
    backgroundColor: 'transparent',
    borderWidth: 1.4,
    borderColor: colors.goldPrimary,
    borderRadius: radii.lg,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.6)',
    transform: [{ skewX: '-20deg' }],
  },
});
