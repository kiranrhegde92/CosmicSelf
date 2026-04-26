import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { haptics } from '../../services/hapticsService';

type Props = {
  hour: number;
  minute: number;
  ampm: 'AM' | 'PM';
  onChange: (hour: number, minute: number) => void;
  onAmpmChange: (a: 'AM' | 'PM') => void;
};

const SIZE = 240;
const CENTER = SIZE / 2;

export default function TimeDialPicker({ hour, minute, ampm, onChange, onAmpmChange }: Props) {
  const angle = useSharedValue(toAngle(hour, minute));

  useEffect(() => {
    angle.value = withTiming(toAngle(hour, minute), {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [hour, minute, angle]);

  const updateFromAngle = (deg: number) => {
    const total = (((deg % 360) + 360) % 360) / 360;
    const minutesOfDay = Math.round(total * 12 * 60);
    const h = Math.floor(minutesOfDay / 60) % 12 || 12;
    const m = Math.round((minutesOfDay % 60) / 5) * 5 % 60;
    onChange(h, m);
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const dx = e.x - CENTER;
      const dy = e.y - CENTER;
      const rad = Math.atan2(dy, dx);
      const deg = (rad * 180) / Math.PI + 90;
      angle.value = deg;
      runOnJS(updateFromAngle)(deg);
    })
    .onEnd(() => {
      // snap to nearest 5 minutes
    });

  const handStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}deg` }],
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>
          {pad(hour)}:{pad(minute)}
        </Text>
        <View style={styles.ampmGroup}>
          {(['AM', 'PM'] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => {
                haptics.selection();
                onAmpmChange(p);
              }}
              style={[styles.ampmBtn, ampm === p && styles.ampmActive]}
            >
              <Text style={[styles.ampmText, ampm === p && styles.ampmTextActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <GestureDetector gesture={pan}>
        <View style={{ width: SIZE, height: SIZE }}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={CENTER - 4}
              stroke="rgba(246,200,95,0.25)"
              strokeWidth={1}
              fill="rgba(20,18,41,0.6)"
            />
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={CENTER - 22}
              stroke="rgba(246,200,95,0.15)"
              strokeWidth={1}
              fill="none"
              strokeDasharray="3 5"
            />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = ((i * 30 - 90) * Math.PI) / 180;
              const r1 = CENTER - 14;
              const r2 = CENTER - 6;
              return (
                <Line
                  key={`tick-${i}`}
                  x1={CENTER + Math.cos(a) * r1}
                  y1={CENTER + Math.sin(a) * r1}
                  x2={CENTER + Math.cos(a) * r2}
                  y2={CENTER + Math.sin(a) * r2}
                  stroke={colors.goldMuted}
                  strokeWidth={1.4}
                />
              );
            })}
            {[12, 3, 6, 9].map((n) => {
              const idx = n === 12 ? 0 : n;
              const a = ((idx * 30 - 90) * Math.PI) / 180;
              const r = CENTER - 32;
              return (
                <SvgText
                  key={`num-${n}`}
                  x={CENTER + Math.cos(a) * r}
                  y={CENTER + Math.sin(a) * r + 5}
                  fontSize={14}
                  fill={colors.goldBright}
                  textAnchor="middle"
                >
                  {n}
                </SvgText>
              );
            })}
            <Circle cx={CENTER} cy={CENTER} r={5} fill={colors.goldPrimary} />
          </Svg>
          <Animated.View style={[styles.handWrap, handStyle]}>
            <View style={styles.hand} />
            <View style={styles.handTip} />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function toAngle(h: number, m: number) {
  const totalMins = ((h % 12) * 60 + m) % (12 * 60);
  return (totalMins / (12 * 60)) * 360;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeText: {
    ...typography.title,
    color: colors.white,
    fontSize: 36,
  },
  ampmGroup: {
    flexDirection: 'column',
    gap: 4,
  },
  ampmBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.25)',
  },
  ampmActive: {
    backgroundColor: colors.goldPrimary,
    borderColor: colors.goldBright,
  },
  ampmText: {
    ...typography.pill,
    color: colors.textSecondary,
    fontSize: 11,
  },
  ampmTextActive: {
    color: '#1A0F33',
  },
  handWrap: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  hand: {
    position: 'absolute',
    top: 24,
    width: 2,
    height: SIZE / 2 - 24,
    backgroundColor: colors.goldBright,
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  handTip: {
    position: 'absolute',
    top: 18,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.goldBright,
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.85,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
