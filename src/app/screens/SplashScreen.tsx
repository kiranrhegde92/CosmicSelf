import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ZodiacWheel from '../components/cosmic/ZodiacWheel';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { AuthStackParamList } from '../navigation/routes';

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const wheelOpacity = useSharedValue(0);
  const wheelScale = useSharedValue(0.7);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const wheelPulse = useSharedValue(1);

  useEffect(() => {
    wheelOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    wheelScale.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
    titleOpacity.value = withDelay(700, withTiming(1, { duration: 700 }));
    titleY.value = withDelay(700, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));
    taglineOpacity.value = withDelay(1300, withTiming(1, { duration: 700 }));
    wheelPulse.value = withDelay(
      900,
      withRepeat(withTiming(1.05, { duration: 2400, easing: Easing.inOut(Easing.ease) }), -1, true),
    );

    const t = setTimeout(() => navigation.replace('Login'), 2600);
    return () => clearTimeout(t);
  }, [navigation, wheelOpacity, wheelScale, titleOpacity, titleY, taglineOpacity, wheelPulse]);

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
