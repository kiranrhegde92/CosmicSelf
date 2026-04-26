import React, { useEffect } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
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
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { colors } from '../../theme/colors';

const SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const PLANETS: { glyph: string; angle: number; r: number; color: string; label: string }[] = [
  { glyph: '☉', angle: 30, r: 0.55, color: '#FFD98A', label: 'Sun' },
  { glyph: '☽', angle: 110, r: 0.6, color: '#E0CDFF', label: 'Moon' },
  { glyph: '☿', angle: 165, r: 0.5, color: '#9AE2FF', label: 'Mercury' },
  { glyph: '♀', angle: 215, r: 0.62, color: '#FFAFD7', label: 'Venus' },
  { glyph: '♂', angle: 275, r: 0.5, color: '#FF8A6B', label: 'Mars' },
  { glyph: '♃', angle: 330, r: 0.58, color: '#F6C85F', label: 'Jupiter' },
];

type Props = {
  size?: number;
  rotate?: boolean;
  style?: StyleProp<ViewStyle>;
};

function BirthChartPreview({ size = 300, rotate = true, style }: Props) {
  const r = size / 2;
  const outerR = r * 0.92;
  const midR = r * 0.78;
  const innerR = r * 0.5;
  const planetR = r * 0.68;

  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!rotate) return;
    rotation.value = withRepeat(
      withTiming(360, { duration: 80000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotate, rotation]);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Animated.View style={[{ width: size, height: size }, wheelStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.goldBright} stopOpacity={0.18} />
              <Stop offset="100%" stopColor={colors.goldPrimary} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          <Circle cx={r} cy={r} r={outerR} fill="url(#glow)" />

          <Circle cx={r} cy={r} r={outerR} stroke={colors.goldPrimary} strokeWidth={1.4} fill="none" />
          <Circle cx={r} cy={r} r={midR} stroke={colors.goldMuted} strokeWidth={1} strokeOpacity={0.6} fill="none" />
          <Circle
            cx={r}
            cy={r}
            r={innerR}
            stroke={colors.goldMuted}
            strokeWidth={0.8}
            strokeOpacity={0.45}
            strokeDasharray="3 5"
            fill="none"
          />

          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            const x1 = r + Math.cos(a) * midR;
            const y1 = r + Math.sin(a) * midR;
            const x2 = r + Math.cos(a) * outerR;
            const y2 = r + Math.sin(a) * outerR;
            return (
              <Line
                key={`tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={colors.goldPrimary}
                strokeWidth={0.8}
                strokeOpacity={0.7}
              />
            );
          })}

          {SIGNS.map((s, i) => {
            const a = ((i * 30 + 15) * Math.PI) / 180;
            const rr = (midR + outerR) / 2;
            return (
              <SvgText
                key={`sign-${i}`}
                x={r + Math.cos(a) * rr}
                y={r + Math.sin(a) * rr + 4}
                fontSize={12}
                fill={colors.goldBright}
                fillOpacity={0.85}
                textAnchor="middle"
              >
                {s}
              </SvgText>
            );
          })}

          {/* aspect lines */}
          <G stroke={colors.goldMuted} strokeWidth={0.7} strokeOpacity={0.5}>
            {[
              [30, 215],
              [110, 275],
              [165, 330],
              [30, 110],
              [215, 330],
            ].map(([a1, a2], i) => {
              const r1 = (a1 * Math.PI) / 180;
              const r2 = (a2 * Math.PI) / 180;
              return (
                <Line
                  key={`aspect-${i}`}
                  x1={r + Math.cos(r1) * innerR}
                  y1={r + Math.sin(r1) * innerR}
                  x2={r + Math.cos(r2) * innerR}
                  y2={r + Math.sin(r2) * innerR}
                />
              );
            })}
          </G>

          {/* planets */}
          {PLANETS.map((p, i) => {
            const a = (p.angle * Math.PI) / 180;
            const x = r + Math.cos(a) * planetR;
            const y = r + Math.sin(a) * planetR;
            return (
              <G key={`planet-${i}`}>
                <Circle cx={x} cy={y} r={9} fill="rgba(20,18,41,0.95)" stroke={p.color} strokeWidth={1.2} />
                <SvgText x={x} y={y + 4} fontSize={11} fill={p.color} textAnchor="middle">
                  {p.glyph}
                </SvgText>
              </G>
            );
          })}

          {/* center star */}
          <Circle cx={r} cy={r} r={4} fill={colors.goldBright} />
          <Path
            d={`M${r} ${r - 14} L${r + 4} ${r - 4} L${r + 14} ${r} L${r + 4} ${r + 4} L${r} ${r + 14} L${r - 4} ${r + 4} L${r - 14} ${r} L${r - 4} ${r - 4} Z`}
            fill={colors.goldPrimary}
            fillOpacity={0.7}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

export default React.memo(BirthChartPreview);
