import { ViewStyle } from 'react-native';

export const shadows: Record<string, ViewStyle> = {
  none: {},
  goldGlow: {
    shadowColor: '#F6C85F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  },
  goldGlowSoft: {
    shadowColor: '#F6C85F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  purpleGlow: {
    shadowColor: '#3A1B6D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  deep: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 10,
  },
};
