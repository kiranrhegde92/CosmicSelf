import { Platform, TextStyle } from 'react-native';

export const fonts = {
  serif: Platform.select({
    ios: 'Didot',
    android: 'serif',
    default: 'serif',
  }) as string,
  serifBold: Platform.select({
    ios: 'Didot-Bold',
    android: 'serif',
    default: 'serif',
  }) as string,
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }) as string,
  bodyMedium: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }) as string,
};

export const typography: Record<string, TextStyle> = {
  hero: {
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  titleSm: {
    fontFamily: fonts.serif,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  section: {
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyStrong: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  button: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  pill: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
};
