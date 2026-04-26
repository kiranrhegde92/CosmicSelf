import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import CosmicBackground from './CosmicBackground';
import ZodiacWheel from './ZodiacWheel';

type Props = {
  /** When true, run the entry animation. Boot-splash cases can leave this on. */
  animate?: boolean;
};

export default function SplashView({ animate = true }: Props) {
  const wheelOpacity = useSharedValue(animate ? 0 : 1);
  const wheelScale = useSharedValue(animate ? 0.7 : 1);
  const titleOpacity = useSharedValue(animate ? 0 : 1);
  const titleY = useSharedValue(animate ? 20 : 0);
  const taglineOpacity = useSharedValue(animate ? 0 : 1);
  const wheelPulse = useSharedValue(1);

  useEffect(() => {
    if (animate) {
      wheelOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      wheelScale.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
      titleOpacity.value = withDelay(700, withTiming(1, { duration: 700 }));
      titleY.value = withDelay(700, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));
      taglineOpacity.value = withDelay(1300, withTiming(1, { duration: 700 }));
    }
    wheelPulse.value = withDelay(
      animate ? 900 : 0,
      withRepeat(withTiming(1.05, { duration: 2400, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [animate, wheelOpacity, wheelScale, titleOpacity, titleY, taglineOpacity, wheelPulse]);

  const wheelStyle = useAnimatedStyle(() => ({
    opacity: wheelOpacity.value,
    transform: [{ scale: wheelScale.value * wheelPulse.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <CosmicBackground variant="default" intensity="high">
      <View style={styles.center}>
        <Animated.View style={wheelStyle}>
          <ZodiacWheel size={300} rotateSpeed={45000} />
        </Animated.View>
        <Animated.View style={[styles.titleWrap, titleStyle]}>
          <Text style={[typography.hero, styles.title]}>CosmicSelf</Text>
        </Animated.View>
        <Animated.Text style={[typography.subtitle, styles.tagline, taglineStyle]}>
          Align with your universe
        </Animated.Text>
      </View>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    marginTop: 28,
  },
  title: {
    color: colors.goldBright,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  tagline: {
    color: colors.textSecondary,
    marginTop: 6,
    letterSpacing: 1.2,
  },
});
