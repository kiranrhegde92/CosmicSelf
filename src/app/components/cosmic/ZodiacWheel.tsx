import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  RadialGradient,
  Stop,
  Text as SvgText,
  Path,
} from 'react-native-svg';

import { colors } from '../../theme/colors';

const SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

type Props = {
  size?: number;
  rotateSpeed?: number;
  showSigns?: boolean;
  showGlow?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  opacity?: number;
  style?: ViewStyle;
};

function ZodiacWheel({
  size = 280,
  rotateSpeed = 60000,
  showSigns = true,
  showGlow = true,
  intensity = 'medium',
  opacity = 1,
  style,
}: Props) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: rotateSpeed, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation, rotateSpeed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const radius = size / 2;
  const innerR = radius * 0.62;
  const midR = radius * 0.78;
  const outerR = radius * 0.92;

  const goldStroke =
    intensity === 'high' ? colors.goldBright : intensity === 'low' ? colors.goldDeep : colors.goldPrimary;

  return (
    <Animated.View style={[{ width: size, height: size, opacity }, animatedStyle, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.goldBright} stopOpacity={showGlow ? 0.18 : 0} />
            <Stop offset="60%" stopColor={colors.goldPrimary} stopOpacity={showGlow ? 0.06 : 0} />
            <Stop offset="100%" stopColor={colors.goldPrimary} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Circle cx={radius} cy={radius} r={radius * 0.95} fill="url(#wheelGlow)" />

        <Circle
          cx={radius}
          cy={radius}
          r={outerR}
          stroke={goldStroke}
          strokeWidth={1.4}
          strokeOpacity={0.85}
          fill="none"
        />
        <Circle
          cx={radius}
          cy={radius}
          r={midR}
          stroke={goldStroke}
          strokeWidth={1}
          strokeOpacity={0.5}
          fill="none"
        />
        <Circle
          cx={radius}
          cy={radius}
          r={innerR}
          stroke={goldStroke}
          strokeWidth={0.8}
          strokeOpacity={0.35}
          fill="none"
          strokeDasharray="4 6"
        />

        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          const rad = (angle * Math.PI) / 180;
          const x1 = radius + Math.cos(rad) * midR;
          const y1 = radius + Math.sin(rad) * midR;
          const x2 = radius + Math.cos(rad) * outerR;
          const y2 = radius + Math.sin(rad) * outerR;
          return (
            <Line
              key={`l-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={goldStroke}
              strokeWidth={0.8}
              strokeOpacity={0.6}
            />
          );
        })}

        {showSigns &&
          SIGNS.map((s, i) => {
            const angle = (i * 360) / 12 + 15;
            const rad = (angle * Math.PI) / 180;
            const r = (midR + outerR) / 2;
            const x = radius + Math.cos(rad) * r;
            const y = radius + Math.sin(rad) * r;
            return (
              <SvgText
                key={`s-${i}`}
                x={x}
                y={y + 4}
                fontSize={Math.max(10, size * 0.045)}
                fill={colors.goldBright}
                fillOpacity={0.85}
                textAnchor="middle"
              >
                {s}
              </SvgText>
            );
          })}

        <G>
          <Path
            d={starPath(radius, radius, radius * 0.18, radius * 0.07, 8)}
            fill={colors.goldPrimary}
            fillOpacity={0.85}
          />
          <Circle cx={radius} cy={radius} r={radius * 0.04} fill={colors.goldBright} />
        </G>
      </Svg>
    </Animated.View>
  );
}

export default React.memo(ZodiacWheel);

function starPath(cx: number, cy: number, outer: number, inner: number, points: number) {
  const step = Math.PI / points;
  let path = '';
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    path += `${i === 0 ? 'M' : 'L'}${x},${y} `;
  }
  return `${path}Z`;
}
