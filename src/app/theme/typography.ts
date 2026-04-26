import { TextStyle } from 'react-native';

/**
 * Font family keys must match the names passed to `useFonts` in App.tsx.
 * Both come from the `@expo-google-fonts/*` packages, which bundle the TTF
 * files inside their npm package (so there's no asset folder to manage).
 */
export const fonts = {
  serif: 'PlayfairDisplay_400Regular',
  serifMedium: 'PlayfairDisplay_500Medium',
  serifSemibold: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
};

export const typography: Record<string, TextStyle> = {
  hero: {
    fontFamily: fonts.serifSemibold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.serifSemibold,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: 0.4,
  },
  titleSm: {
    fontFamily: fonts.serifSemibold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 0.3,
  },
  section: {
    fontFamily: fonts.serifSemibold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  button: {
    fontFamily: fonts.bodySemibold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.4,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  pill: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
};
