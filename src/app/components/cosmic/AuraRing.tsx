import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';

type Props = {
  size: number;
  active?: boolean;
  color?: string;
  thickness?: number;
  style?: ViewStyle;
  intensity?: 'soft' | 'medium' | 'strong';
};

export default function AuraRing({
  size,
  active = true,
  color = colors.goldPrimary,
  thickness = 2,
  style,
  intensity = 'medium',
}: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      pulse.value = withTiming(0, { duration: 400 });
    }
  }, [active, pulse]);

  const baseScale = intensity === 'strong' ? 1.18 : intensity === 'soft' ? 1.06 : 1.12;

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * (baseScale - 1) }],
    opacity: 0.15 + pulse.value * 0.45,
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.06 }],
    opacity: 0.6 + pulse.value * 0.35,
  }));

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            borderWidth: thickness * 2,
            shadowColor: color,
          },
          outerStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: (size * 0.9) / 2,
            borderColor: color,
            borderWidth: thickness,
            shadowColor: color,
          },
          innerStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
});
