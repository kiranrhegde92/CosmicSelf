import { ViewStyle } from 'react-native';

export const shadows: Record<string, ViewStyle> = {
  none: {},
  goldGlow: {
    shadowColor: '#F6C85F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 22,
    elevation: 12,
  },
  goldGlowSoft: {
    shadowColor: '#F6C85F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  // Wider, deeper purple bloom — the primary "ambient cosmic glow" beneath
  // cards and the active astrologer avatar.
  purpleGlow: {
    shadowColor: '#5A2A9F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 10,
  },
  // Tight black shadow for crisp card depth (stack with purpleGlow).
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  deep: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 14,
  },
};
