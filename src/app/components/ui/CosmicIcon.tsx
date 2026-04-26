import React from 'react';
import Svg, { Circle, G, Line, Path, Polyline, Rect, Polygon } from 'react-native-svg';

import { colors } from '../../theme/colors';

export type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'check'
  | 'chevron-down'
  | 'chevron-right'
  | 'close'
  | 'eye'
  | 'eye-off'
  | 'mail'
  | 'phone'
  | 'lock'
  | 'user'
  | 'calendar'
  | 'clock'
  | 'map-pin'
  | 'send'
  | 'mic'
  | 'mic-off'
  | 'video'
  | 'video-off'
  | 'phone-end'
  | 'flip'
  | 'home'
  | 'chat'
  | 'star'
  | 'star-filled'
  | 'sparkle'
  | 'profile'
  | 'chart'
  | 'compass'
  | 'heart'
  | 'crown'
  | 'shield'
  | 'bell'
  | 'settings'
  | 'menu'
  | 'info'
  | 'plus'
  | 'sun'
  | 'moon'
  | 'orbit'
  | 'apple'
  | 'google'
  | 'book'
  | 'magic';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export default function CosmicIcon({
  name,
  size = 22,
  color = colors.goldPrimary,
  strokeWidth = 1.6,
}: Props) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {render(name, color, common)}
    </Svg>
  );
}

function render(
  name: IconName,
  color: string,
  c: { stroke: string; strokeWidth: number; strokeLinecap: 'round'; strokeLinejoin: 'round'; fill: string },
) {
  switch (name) {
    case 'arrow-left':
      return (
        <G {...c}>
          <Line x1={20} y1={12} x2={4} y2={12} />
          <Polyline points="10 18 4 12 10 6" />
        </G>
      );
    case 'arrow-right':
      return (
        <G {...c}>
          <Line x1={4} y1={12} x2={20} y2={12} />
          <Polyline points="14 6 20 12 14 18" />
        </G>
      );
    case 'arrow-up':
      return (
        <G {...c}>
          <Line x1={12} y1={20} x2={12} y2={4} />
          <Polyline points="6 10 12 4 18 10" />
        </G>
      );
    case 'check':
      return (
        <G {...c}>
          <Polyline points="5 12 10 17 19 7" />
        </G>
      );
    case 'close':
      return (
        <G {...c}>
          <Line x1={6} y1={6} x2={18} y2={18} />
          <Line x1={18} y1={6} x2={6} y2={18} />
        </G>
      );
    case 'chevron-down':
      return (
        <G {...c}>
          <Polyline points="6 9 12 15 18 9" />
        </G>
      );
    case 'chevron-right':
      return (
        <G {...c}>
          <Polyline points="9 6 15 12 9 18" />
        </G>
      );
    case 'eye':
      return (
        <G {...c}>
          <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <Circle cx={12} cy={12} r={3} />
        </G>
      );
    case 'eye-off':
      return (
        <G {...c}>
          <Path d="M3 3l18 18" />
          <Path d="M10.6 6.1A10.4 10.4 0 0 1 12 6c6.5 0 10 6 10 6a17.7 17.7 0 0 1-3.2 4.1" />
          <Path d="M6.6 7.6A17.7 17.7 0 0 0 2 12s3.5 7 10 7c1.6 0 3-.3 4.2-.8" />
        </G>
      );
    case 'mail':
      return (
        <G {...c}>
          <Rect x={3} y={5} width={18} height={14} rx={2} />
          <Polyline points="3 7 12 13 21 7" />
        </G>
      );
    case 'phone':
      return (
        <G {...c}>
          <Path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.9 9.8a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
        </G>
      );
    case 'lock':
      return (
        <G {...c}>
          <Rect x={4} y={11} width={16} height={10} rx={2} />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </G>
      );
    case 'user':
      return (
        <G {...c}>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx={12} cy={7} r={4} />
        </G>
      );
    case 'calendar':
      return (
        <G {...c}>
          <Rect x={3} y={5} width={18} height={16} rx={2} />
          <Line x1={3} y1={10} x2={21} y2={10} />
          <Line x1={8} y1={3} x2={8} y2={7} />
          <Line x1={16} y1={3} x2={16} y2={7} />
        </G>
      );
    case 'clock':
      return (
        <G {...c}>
          <Circle cx={12} cy={12} r={9} />
          <Polyline points="12 7 12 12 15.5 14" />
        </G>
      );
    case 'map-pin':
      return (
        <G {...c}>
          <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
          <Circle cx={12} cy={10} r={3} />
        </G>
      );
    case 'send':
      return (
        <G {...c}>
          <Path d="M21 3l-9 18-2-8-8-2z" />
          <Line x1={21} y1={3} x2={10} y2={13} />
        </G>
      );
    case 'mic':
      return (
        <G {...c}>
          <Rect x={9} y={3} width={6} height={12} rx={3} />
          <Path d="M19 11a7 7 0 0 1-14 0" />
          <Line x1={12} y1={18} x2={12} y2={22} />
        </G>
      );
    case 'mic-off':
      return (
        <G {...c}>
          <Line x1={3} y1={3} x2={21} y2={21} />
          <Path d="M15 9V6a3 3 0 0 0-6 0v.5" />
          <Path d="M9 12v0a3 3 0 0 0 4.7 2.5" />
          <Path d="M19 11a7 7 0 0 1-1 3.6" />
          <Path d="M5 11a7 7 0 0 0 11.7 5" />
          <Line x1={12} y1={18} x2={12} y2={22} />
        </G>
      );
    case 'video':
      return (
        <G {...c}>
          <Rect x={2} y={6} width={14} height={12} rx={2} />
          <Polyline points="22 8 16 12 22 16" />
        </G>
      );
    case 'video-off':
      return (
        <G {...c}>
          <Line x1={3} y1={3} x2={21} y2={21} />
          <Rect x={2} y={6} width={14} height={12} rx={2} />
        </G>
      );
    case 'phone-end':
      return (
        <G {...c}>
          <Path d="M3 12c5-4 13-4 18 0l-2 2-3-1-1-2c-1-.3-3-.5-4-.5s-3 .2-4 .5l-1 2-3 1z" />
          <Line x1={3} y1={20} x2={21} y2={20} />
        </G>
      );
    case 'flip':
      return (
        <G {...c}>
          <Rect x={3} y={6} width={18} height={12} rx={2} />
          <Circle cx={12} cy={12} r={3} />
          <Path d="M9 6L7.5 4h9L15 6" />
        </G>
      );
    case 'home':
      return (
        <G {...c}>
          <Path d="M3 11l9-8 9 8" />
          <Path d="M5 10v10h14V10" />
        </G>
      );
    case 'chat':
      return (
        <G {...c}>
          <Path d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </G>
      );
    case 'star':
      return (
        <G {...c}>
          <Polygon points="12 3 14.7 9.3 21.5 9.9 16.4 14.4 18 21 12 17.5 6 21 7.6 14.4 2.5 9.9 9.3 9.3" />
        </G>
      );
    case 'star-filled':
      return (
        <G stroke={color} strokeWidth={c.strokeWidth} fill={color}>
          <Polygon points="12 3 14.7 9.3 21.5 9.9 16.4 14.4 18 21 12 17.5 6 21 7.6 14.4 2.5 9.9 9.3 9.3" />
        </G>
      );
    case 'sparkle':
      return (
        <G {...c}>
          <Path d="M12 3l1.6 5L19 9.6 13.6 11 12 16l-1.6-5L5 9.6 10.4 8z" />
          <Path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
        </G>
      );
    case 'profile':
      return (
        <G {...c}>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4 21a8 8 0 0 1 16 0" />
        </G>
      );
    case 'chart':
      return (
        <G {...c}>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M12 3v18M3 12h18" />
          <Circle cx={12} cy={12} r={4} />
        </G>
      );
    case 'compass':
      return (
        <G {...c}>
          <Circle cx={12} cy={12} r={9} />
          <Polygon points="14.5 9.5 10 14 9.5 14.5 14 10" />
        </G>
      );
    case 'heart':
      return (
        <G {...c}>
          <Path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7A5 5 0 0 0 3.2 13.7L12 22l8.8-8.3a5 5 0 0 0 0-7.1z" />
        </G>
      );
    case 'crown':
      return (
        <G {...c}>
          <Path d="M3 7l4 5 5-7 5 7 4-5-1 12H4z" />
          <Line x1={4} y1={20} x2={20} y2={20} />
        </G>
      );
    case 'shield':
      return (
        <G {...c}>
          <Path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
        </G>
      );
    case 'bell':
      return (
        <G {...c}>
          <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9z" />
          <Path d="M10 21a2 2 0 0 0 4 0" />
        </G>
      );
    case 'settings':
      return (
        <G {...c}>
          <Circle cx={12} cy={12} r={3} />
          <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </G>
      );
    case 'menu':
      return (
        <G {...c}>
          <Line x1={4} y1={7} x2={20} y2={7} />
          <Line x1={4} y1={12} x2={20} y2={12} />
          <Line x1={4} y1={17} x2={20} y2={17} />
        </G>
      );
    case 'info':
      return (
        <G {...c}>
          <Circle cx={12} cy={12} r={9} />
          <Line x1={12} y1={11} x2={12} y2={16} />
          <Circle cx={12} cy={8} r={0.6} fill={color} />
        </G>
      );
    case 'plus':
      return (
        <G {...c}>
          <Line x1={12} y1={5} x2={12} y2={19} />
          <Line x1={5} y1={12} x2={19} y2={12} />
        </G>
      );
    case 'sun':
      return (
        <G {...c}>
          <Circle cx={12} cy={12} r={4} />
          <Line x1={12} y1={2} x2={12} y2={5} />
          <Line x1={12} y1={19} x2={12} y2={22} />
          <Line x1={2} y1={12} x2={5} y2={12} />
          <Line x1={19} y1={12} x2={22} y2={12} />
          <Line x1={4.9} y1={4.9} x2={6.9} y2={6.9} />
          <Line x1={17.1} y1={17.1} x2={19.1} y2={19.1} />
          <Line x1={4.9} y1={19.1} x2={6.9} y2={17.1} />
          <Line x1={17.1} y1={6.9} x2={19.1} y2={4.9} />
        </G>
      );
    case 'moon':
      return (
        <G {...c}>
          <Path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </G>
      );
    case 'orbit':
      return (
        <G {...c}>
          <Circle cx={12} cy={12} r={3} />
          <Path d="M3.5 12c0-3 3.8-5 8.5-5s8.5 2 8.5 5-3.8 5-8.5 5-8.5-2-8.5-5z" />
        </G>
      );
    case 'apple':
      return (
        <G stroke={color} strokeWidth={c.strokeWidth} fill={color}>
          <Path d="M16.4 12.6c0-2.4 2-3.5 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.2-2.8.9-3.6.9-.7 0-1.9-.9-3.1-.8-1.6 0-3 .9-3.8 2.4-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 3 2.3 1.2 0 1.6-.8 3.1-.8 1.4 0 1.9.8 3.1.8 1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.4-2.7-.1 0-2.7-1-2.8-3.8z" />
          <Path d="M14 5.7c.7-.8 1.1-2 1-3.1-1 .1-2.2.7-2.9 1.6-.6.7-1.1 1.9-1 3 1.1.1 2.2-.6 2.9-1.5z" />
        </G>
      );
    case 'google':
      return (
        <G stroke={color} strokeWidth={c.strokeWidth} fill="none">
          <Path d="M12 11h9.5c.1.6.2 1.3.2 2 0 5.2-3.5 9-9.7 9a10 10 0 1 1 0-20 9.6 9.6 0 0 1 6.8 2.6l-2.8 2.8A6 6 0 0 0 12 6a6 6 0 1 0 0 12 5.2 5.2 0 0 0 5.4-4H12z" />
        </G>
      );
    case 'book':
      return (
        <G {...c}>
          <Path d="M4 4h7v16H4z" />
          <Path d="M13 4h7v16h-7z" />
          <Line x1={4} y1={8} x2={11} y2={8} />
          <Line x1={13} y1={8} x2={20} y2={8} />
        </G>
      );
    case 'magic':
      return (
        <G {...c}>
          <Path d="M3 21l11-11" />
          <Path d="M14 4l1.5 3 3 1.5-3 1.5L14 13l-1.5-3-3-1.5 3-1.5z" />
          <Path d="M19 14l.7 1.5 1.6.6-1.6.6L19 18l-.7-1.3-1.6-.6 1.6-.6z" />
        </G>
      );
    default:
      return null;
  }
}
