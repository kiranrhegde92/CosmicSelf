import React from 'react';

import SplashView from '../components/cosmic/SplashView';
import { useAuthStore } from '../store/authStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { useHydration } from '../store/useHydration';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function RootNavigator() {
  const hydrated = useHydration();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);

  if (!hydrated) {
    return <SplashView animate={false} />;
  }

  if (isAuthenticated && hasOnboarded) {
    return <MainNavigator />;
  }

  if (isAuthenticated && !hasOnboarded) {
    return <AuthNavigator initialRouteName="BirthDetails" />;
  }

  return <AuthNavigator initialRouteName="Splash" />;
}
