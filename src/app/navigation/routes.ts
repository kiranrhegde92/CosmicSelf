export const AUTH_ROUTES = {
  Splash: 'Splash',
  Login: 'Login',
  Signup: 'Signup',
  BirthDetails: 'BirthDetails',
  AstrologerSelection: 'AstrologerSelection',
} as const;

export const MAIN_ROUTES = {
  Tabs: 'Tabs',
  Home: 'Home',
  Chat: 'Chat',
  VideoCall: 'VideoCall',
  BirthChart: 'BirthChart',
  DailyInsight: 'DailyInsight',
  Compatibility: 'Compatibility',
  Subscription: 'Subscription',
  Profile: 'Profile',
  Settings: 'Settings',
  EditProfile: 'EditProfile',
  EditBirthDetails: 'EditBirthDetails',
  EditAstrologer: 'EditAstrologer',
  EditPartner: 'EditPartner',
  SavedInsights: 'SavedInsights',
  FullReport: 'FullReport',
  Placeholder: 'Placeholder',
} as const;

import type { IconName } from '../components/ui/CosmicIcon';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  BirthDetails: undefined;
  AstrologerSelection: undefined;
};

export type PlaceholderParams = {
  title: string;
  subtitle?: string;
  body?: string;
  icon?: IconName;
  /** Optional CTA inside the card (mailto / tel / https). */
  action?: { label: string; href: string };
};

export type MainStackParamList = {
  Tabs: undefined;
  Chat: undefined;
  VideoCall: undefined;
  BirthChart: undefined;
  DailyInsight: undefined;
  Compatibility: undefined;
  Subscription: undefined;
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  EditBirthDetails: undefined;
  EditAstrologer: undefined;
  EditPartner: undefined;
  SavedInsights: undefined;
  FullReport: undefined;
  Placeholder: PlaceholderParams;
};

export type TabParamList = {
  Home: undefined;
  Chat: undefined;
  BirthChart: undefined;
  DailyInsight: undefined;
  Profile: undefined;
};
