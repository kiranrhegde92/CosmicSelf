import { Theme } from '@react-navigation/native';
import { colors } from './colors';

export const navigationTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.goldPrimary,
    background: colors.bgPrimary,
    card: colors.bgSecondary,
    text: colors.white,
    border: 'transparent',
    notification: colors.goldPrimary,
  },
};
