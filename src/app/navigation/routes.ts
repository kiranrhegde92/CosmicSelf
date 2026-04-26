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
} as const;

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  BirthDetails: undefined;
  AstrologerSelection: undefined;
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
};

export type TabParamList = {
  Home: undefined;
  Chat: undefined;
  BirthChart: undefined;
  DailyInsight: undefined;
  Profile: undefined;
};
