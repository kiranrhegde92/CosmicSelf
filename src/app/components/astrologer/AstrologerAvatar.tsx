import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { colors } from '../../theme/colors';

export type AstrologerVisualKey =
  | 'veda'
  | 'luna'
  | 'chen'
  | 'aria'
  | 'stella'
  | 'orion';

type Props = {
  visualKey: AstrologerVisualKey;
  size?: number;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
};

const PALETTES: Record<
  AstrologerVisualKey,
  {
    robe: string;
    robe2: string;
    skin: string;
    hair: string;
    accent: string;
    halo: string;
    bg: string;
  }
> = {
  veda: {
    robe: '#E26B1F',
    robe2: '#9A3D0B',
    skin: '#F1C8A2',
    hair: '#E8E4D8',
    accent: '#F6C85F',
    halo: '#F6C85F',
    bg: '#1F0F3D',
  },
  luna: {
    robe: '#3B2D80',
    robe2: '#1B1448',
    skin: '#F4D2BB',
    hair: '#C8C4DB',
    accent: '#B69CFF',
    halo: '#B69CFF',
    bg: '#160F38',
  },
  chen: {
    robe: '#1F8D6B',
    robe2: '#0E4A38',
    skin: '#F0CFA0',
    hair: '#1A1325',
    accent: '#F6C85F',
    halo: '#5BE3B5',
    bg: '#0F2A2E',
  },
  aria: {
    robe: '#7C2BBE',
    robe2: '#3A1262',
    skin: '#ECC2A5',
    hair: '#3B0F4A',
    accent: '#F87BD0',
    halo: '#FF8FE6',
    bg: '#1D0E36',
  },
  stella: {
    robe: '#A04E83',
    robe2: '#5B2348',
    skin: '#F0CDB1',
    hair: '#E5DDD0',
    accent: '#F6C85F',
    halo: '#F8B3CC',
    bg: '#211236',
  },
  orion: {
    robe: '#1A3FB0',
    robe2: '#0A1F60',
    skin: '#7AC0FF',
    hair: '#9CD8FF',
    accent: '#7AA9FF',
    halo: '#7AC0FF',
    bg: '#0A1338',
  },
};

export default function AstrologerAvatar({
  visualKey,
  size = 200,
  glow = true,
  style,
}: Props) {
  const p = PALETTES[visualKey];
  const gid = `g-${visualKey}`;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: p.bg,
        },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <RadialGradient id={`bg-${gid}`} cx="50%" cy="40%" r="70%">
            <Stop offset="0%" stopColor={p.halo} stopOpacity={0.45} />
            <Stop offset="55%" stopColor={p.bg} stopOpacity={1} />
            <Stop offset="100%" stopColor={colors.bgPrimary} stopOpacity={1} />
          </RadialGradient>
          <LinearGradient id={`robe-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={p.robe} />
            <Stop offset="100%" stopColor={p.robe2} />
          </LinearGradient>
          <LinearGradient id={`hair-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={p.hair} stopOpacity={1} />
            <Stop offset="100%" stopColor={p.hair} stopOpacity={0.7} />
          </LinearGradient>
          <RadialGradient id={`halo-${gid}`} cx="50%" cy="35%" r="40%">
            <Stop offset="0%" stopColor={p.halo} stopOpacity={glow ? 0.65 : 0} />
            <Stop offset="100%" stopColor={p.halo} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Circle cx={100} cy={100} r={100} fill={`url(#bg-${gid})`} />

        {/* faint stars */}
        <Circle cx={30} cy={40} r={1} fill="#FFFFFF" fillOpacity={0.7} />
        <Circle cx={170} cy={50} r={0.8} fill={p.accent} fillOpacity={0.85} />
        <Circle cx={45} cy={150} r={0.8} fill="#FFFFFF" fillOpacity={0.6} />
        <Circle cx={160} cy={130} r={1} fill={p.accent} fillOpacity={0.75} />
        <Circle cx={20} cy={90} r={0.7} fill="#FFFFFF" fillOpacity={0.5} />

        {/* halo */}
        <Circle cx={100} cy={70} r={70} fill={`url(#halo-${gid})`} />

        {/* shoulders / robe */}
        <Path
          d="M30 200 C30 145, 50 120, 100 120 C150 120, 170 145, 170 200 Z"
          fill={`url(#robe-${gid})`}
        />
        {/* robe inner v */}
        <Path
          d="M85 130 L100 165 L115 130 Z"
          fill={p.robe2}
          fillOpacity={0.6}
        />

        {/* neck */}
        <Path d="M90 110 L110 110 L113 130 L87 130 Z" fill={p.skin} />

        {/* hair back */}
        {visualKey !== 'orion' && (
          <Path
            d="M55 95 C55 65, 75 45, 100 45 C125 45, 145 65, 145 95 L145 115 L55 115 Z"
            fill={`url(#hair-${gid})`}
          />
        )}

        {/* face */}
        <Ellipse cx={100} cy={88} rx={28} ry={32} fill={p.skin} />

        {/* eyes */}
        <Circle cx={90} cy={88} r={1.8} fill="#1A1325" />
        <Circle cx={110} cy={88} r={1.8} fill="#1A1325" />
        {/* cheek glow */}
        <Circle cx={86} cy={96} r={3} fill={p.accent} fillOpacity={0.18} />
        <Circle cx={114} cy={96} r={3} fill={p.accent} fillOpacity={0.18} />
        {/* mouth */}
        <Path
          d="M92 102 Q100 106 108 102"
          stroke="#3D2A1B"
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />

        {/* character-specific layers */}
        {visualKey === 'veda' && (
          <G>
            {/* long beard */}
            <Path
              d="M75 100 C75 130, 85 145, 100 150 C115 145, 125 130, 125 100 Q115 118, 100 120 Q85 118, 75 100 Z"
              fill="#E8E4D8"
            />
            {/* tilak */}
            <Path d="M100 70 L97 82 L103 82 Z" fill="#C2371A" />
            {/* mala beads */}
            <Path
              d="M70 130 Q100 158 130 130"
              stroke={p.accent}
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="2 3"
            />
          </G>
        )}

        {visualKey === 'luna' && (
          <G>
            {/* crescent moon pendant */}
            <Path
              d="M100 145 a8 8 0 1 0 5 -14 a6 6 0 1 1 -5 14z"
              fill={p.accent}
            />
            {/* hair side strands */}
            <Path
              d="M68 100 Q60 130 72 150"
              stroke={p.hair}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M132 100 Q140 130 128 150"
              stroke={p.hair}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
          </G>
        )}

        {visualKey === 'chen' && (
          <G>
            {/* topknot */}
            <Circle cx={100} cy={50} r={8} fill="#1A1325" />
            {/* compass medallion */}
            <Circle cx={100} cy={150} r={11} fill={p.accent} fillOpacity={0.95} />
            <Path
              d="M100 142 L102 150 L100 158 L98 150 Z"
              fill={p.robe2}
            />
            <Path
              d="M92 150 L100 148 L108 150 L100 152 Z"
              fill={p.robe2}
            />
          </G>
        )}

        {visualKey === 'aria' && (
          <G>
            {/* hood */}
            <Path
              d="M55 90 C55 55, 80 38, 100 38 C120 38, 145 55, 145 90 L145 105 L55 105 Z"
              fill={p.robe}
            />
            {/* tarot card */}
            <Path
              d="M90 142 L110 142 L110 165 L90 165 Z"
              fill={p.accent}
              fillOpacity={0.9}
            />
            <Circle cx={100} cy={153} r={4} fill={p.robe2} />
          </G>
        )}

        {visualKey === 'stella' && (
          <G>
            {/* shawl */}
            <Path
              d="M40 200 C40 150, 60 130, 100 130 C140 130, 160 150, 160 200 Z"
              fill={p.robe}
              fillOpacity={0.85}
            />
            {/* glasses */}
            <Circle cx={90} cy={88} r={5} stroke="#3D2A1B" strokeWidth={1} fill="none" />
            <Circle cx={110} cy={88} r={5} stroke="#3D2A1B" strokeWidth={1} fill="none" />
            <Path d="M95 88 L105 88" stroke="#3D2A1B" strokeWidth={1} />
          </G>
        )}

        {visualKey === 'orion' && (
          <G>
            {/* constellation lines on body */}
            <Path
              d="M70 130 L90 145 L100 130 L115 150 L130 130"
              stroke={p.accent}
              strokeWidth={1}
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx={70} cy={130} r={2} fill={p.accent} />
            <Circle cx={90} cy={145} r={2} fill={p.accent} />
            <Circle cx={100} cy={130} r={2} fill={p.accent} />
            <Circle cx={115} cy={150} r={2} fill={p.accent} />
            <Circle cx={130} cy={130} r={2} fill={p.accent} />
            {/* glow body */}
            <Path
              d="M30 200 C30 145, 50 120, 100 120 C150 120, 170 145, 170 200 Z"
              fill={p.accent}
              fillOpacity={0.15}
            />
          </G>
        )}
      </Svg>
    </View>
  );
}
