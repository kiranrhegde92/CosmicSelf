import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import CosmicIcon, { IconName } from './CosmicIcon';

export type ModeOption = {
  key: string;
  label: string;
  icon?: IconName;
};

type Props = {
  options: [ModeOption, ModeOption];
  value: string;
  onChange: (key: string) => void;
};

export default function ToggleMode({ options, value, onChange }: Props) {
  const idx = options.findIndex((o) => o.key === value);
  const offset = useSharedValue(idx);

  React.useEffect(() => {
    offset.value = withTiming(idx, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [idx, offset]);

  const indicator = useAnimatedStyle(() => ({
    left: offset.value === 0 ? '2%' : '50%',
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.indicator, indicator]}>
        <LinearGradient
          colors={['#3A1B6D', '#251047']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={styles.btn}
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: active }}
          >
            {opt.icon && (
              <CosmicIcon
                name={opt.icon}
                size={14}
                color={active ? colors.goldBright : colors.textMuted}
              />
            )}
            <Text
              style={[
                styles.label,
                {
                  color: active ? colors.white : colors.textMuted,
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20,18,41,0.85)',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.25)',
    padding: 4,
    height: 44,
    alignSelf: 'center',
    minWidth: 240,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '48%',
    borderRadius: radii.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.35)',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
  },
  label: {
    ...typography.button,
    fontSize: 14,
  },
});
