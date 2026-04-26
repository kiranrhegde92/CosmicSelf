import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import AstrologerAvatar from './AstrologerAvatar';
import PersonaBadge from './PersonaBadge';
import { Astrologer } from '../../data/astrologers';

type Props = {
  astrologer: Astrologer;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
};

export default function AstrologerCard({ astrologer, selected, onPress, compact }: Props) {
  const scale = useSharedValue(selected ? 1 : 0.86);
  const opacity = useSharedValue(selected ? 1 : 0.7);

  useEffect(() => {
    scale.value = withTiming(selected ? 1 : 0.84, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(selected ? 1 : 0.7, { duration: 280 });
  }, [selected, scale, opacity]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const cardWidth = compact ? 110 : 200;
  const cardHeight = compact ? 170 : 320;
  const avatarSize = compact ? 76 : 150;

  return (
    <Animated.View style={[{ width: cardWidth }, animated]}>
      <Pressable
        accessibilityLabel={astrologer.name}
        accessibilityState={{ selected }}
        onPress={onPress}
        style={[
          styles.card,
          {
            height: cardHeight,
            borderColor: selected ? colors.goldPrimary : 'rgba(246,200,95,0.18)',
          },
          selected && shadows.goldGlow,
        ]}
      >
        <LinearGradient
          colors={
            selected
              ? ['rgba(58,27,109,0.6)', 'rgba(20,18,41,0.95)']
              : ['rgba(20,18,41,0.85)', 'rgba(8,8,23,0.95)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {selected && (
          <View style={styles.selectedTag}>
            <Text style={styles.selectedTagText}>SELECTED</Text>
          </View>
        )}

        <View style={styles.avatarWrap}>
          <AstrologerAvatar
            visualKey={astrologer.visualKey}
            size={avatarSize}
            glow={selected}
          />
        </View>

        <View style={styles.body}>
          <Text style={[typography.section, styles.name]} numberOfLines={1}>
            {astrologer.name}
          </Text>
          <Text style={[typography.caption, styles.specialty]} numberOfLines={2}>
            {astrologer.specialty}
          </Text>
          {!compact && (
            <View style={styles.badgeWrap}>
              <PersonaBadge label={astrologer.personalityTag} tone={astrologer.tone} />
            </View>
          )}
        </View>

        {/* base glow */}
        {selected && <View style={styles.baseGlow} />}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1.4,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  selectedTag: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: colors.goldPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    zIndex: 5,
  },
  selectedTagText: {
    ...typography.pill,
    fontSize: 10,
    color: '#1A0F33',
    letterSpacing: 1.2,
  },
  avatarWrap: {
    marginTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: 4,
  },
  name: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
  },
  specialty: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  badgeWrap: {
    marginTop: spacing.sm,
  },
  baseGlow: {
    position: 'absolute',
    bottom: -10,
    left: 30,
    right: 30,
    height: 18,
    backgroundColor: colors.goldPrimary,
    opacity: 0.35,
    borderRadius: 999,
    transform: [{ scaleY: 0.4 }],
  },
});
