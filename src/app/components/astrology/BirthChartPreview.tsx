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
import type { NatalChart } from '../../services/astroEngine';

const SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

type RenderedPlanet = {
  glyph: string;
  /** Ecliptic longitude in degrees [0, 360). 0° = Aries point. */
  longitude: number;
  color: string;
  label: string;
};

const FALLBACK_PLANETS: RenderedPlanet[] = [
  { glyph: '☉', longitude: 30, color: '#FFD98A', label: 'Sun' },
  { glyph: '☽', longitude: 110, color: '#E0CDFF', label: 'Moon' },
  { glyph: '☿', longitude: 165, color: '#9AE2FF', label: 'Mercury' },
  { glyph: '♀', longitude: 215, color: '#FFAFD7', label: 'Venus' },
  { glyph: '♂', longitude: 275, color: '#FF8A6B', label: 'Mars' },
  { glyph: '♃', longitude: 330, color: '#F6C85F', label: 'Jupiter' },
];

function chartToPlanets(chart: NatalChart): RenderedPlanet[] {
  // Map the natal chart's known points to the SVG planets. Ascendant gets a
  // tiny upward arrow glyph since it isn't a planet.
  return [
    { glyph: '☉', longitude: chart.sun.longitude, color: '#FFD98A', label: 'Sun' },
    { glyph: '☽', longitude: chart.moon.longitude, color: '#E0CDFF', label: 'Moon' },
    {
      glyph: '↑',
      longitude: chart.ascendant.longitude,
      color: '#7AC0FF',
      label: 'Ascendant',
    },
  ];
}

type Props = {
  size?: number;
  rotate?: boolean;
  /**
   * Optional natal chart. When provided, the planet markers move to the
   * actual ecliptic longitudes for Sun / Moon / Ascendant. Without it, a
   * decorative six-planet layout is rendered instead.
   */
  chart?: NatalChart | null;
  style?: StyleProp<ViewStyle>;
};

function BirthChartPreview({ size = 300, rotate = true, chart, style }: Props) {
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

  const planets = chart ? chartToPlanets(chart) : FALLBACK_PLANETS;

  // Build aspect lines between every pair of rendered planets that sit
  // within 8° of a major aspect (only for the live path — the decorative
  // fallback uses the static lines below for visual interest).
  const aspectLines = chart ? buildAspectLines(planets, innerR, r) : null;

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
            {aspectLines ??
              [
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
          {planets.map((p, i) => {
            // Astrology convention: 0° is to the LEFT (east) and rotation is
            // counter-clockwise. SVG's atan2 gives 0° to the right going
            // clockwise, so we flip with (180 - lon).
            const a = ((180 - p.longitude) * Math.PI) / 180;
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

const ASPECT_TARGETS = [0, 60, 90, 120, 180];
const ASPECT_ORB = 8;

function buildAspectLines(
  planets: RenderedPlanet[],
  innerR: number,
  r: number,
): React.ReactElement[] {
  const lines: React.ReactElement[] = [];
  for (let i = 0; i < planets.length; i += 1) {
    for (let j = i + 1; j < planets.length; j += 1) {
      const a = planets[i].longitude;
      const b = planets[j].longitude;
      const sep = Math.abs(((a - b) % 360 + 540) % 360 - 180);
      const within = ASPECT_TARGETS.find((t) => Math.abs(sep - t) <= ASPECT_ORB);
      if (within === undefined) continue;
      const ra = ((180 - a) * Math.PI) / 180;
      const rb = ((180 - b) * Math.PI) / 180;
      lines.push(
        <Line
          key={`aspect-${i}-${j}`}
          x1={r + Math.cos(ra) * innerR}
          y1={r + Math.sin(ra) * innerR}
          x2={r + Math.cos(rb) * innerR}
          y2={r + Math.sin(rb) * innerR}
          strokeOpacity={0.6}
        />,
      );
    }
  }
  return lines;
}

export default React.memo(BirthChartPreview);
