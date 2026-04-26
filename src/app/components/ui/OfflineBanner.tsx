import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import CosmicIcon from './CosmicIcon';

/**
 * Renders a small "You're offline" pill at the top of the screen whenever
 * NetInfo reports no network. Floats above any navigator without taking
 * layout space. Mount once, near the root.
 */
export default function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);
  const ty = useSharedValue(-60);

  useEffect(() => {
    const handle = (state: NetInfoState) => {
      const isOffline = state.isConnected === false || state.isInternetReachable === false;
      setOffline(isOffline);
    };
    const unsub = NetInfo.addEventListener(handle);
    NetInfo.fetch().then(handle);
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    ty.value = withTiming(offline ? 0 : -60, { duration: 280 });
  }, [offline, ty]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { paddingTop: insets.top + 6 },
        animatedStyle,
      ]}
    >
      <View style={styles.pill}>
        <CosmicIcon name="orbit" color={colors.goldBright} size={14} />
        <Text style={styles.text}>
          You're offline — the stars are still listening, but updates may lag.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    paddingHorizontal: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20,18,41,0.95)',
    borderColor: colors.goldPrimary,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    ...typography.caption,
    color: colors.white,
    fontSize: 12,
  },
});
