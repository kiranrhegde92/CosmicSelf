import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
};

type Props = {
  count?: number;
  intensity?: 'low' | 'medium' | 'high';
  style?: ViewStyle;
};

const palette = [colors.goldBright, colors.goldPrimary, '#E0CDFF', colors.white];

const Particle = React.memo(function Particle({ star }: { star: Star }) {
  const opacity = useSharedValue(0.2);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    opacity.value = withDelay(
      star.delay,
      withRepeat(
        withTiming(1, { duration: star.duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
    scale.value = withDelay(
      star.delay,
      withRepeat(
        withTiming(1, { duration: star.duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, [opacity, scale, star.delay, star.duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dot,
        {
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: star.color,
          shadowColor: star.color,
        },
        animatedStyle,
      ]}
    />
  );
});

export default function StarParticles({ count, intensity = 'medium', style }: Props) {
  const total = count ?? (intensity === 'high' ? 60 : intensity === 'low' ? 18 : 36);

  const stars = useMemo<Star[]>(() => {
    const arr: Star[] = [];
    for (let i = 0; i < total; i += 1) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1.2 + Math.random() * 2.4,
        duration: 1600 + Math.random() * 2400,
        delay: Math.random() * 1500,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }
    return arr;
  }, [total]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {stars.map((s) => (
        <Particle key={s.id} star={s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
