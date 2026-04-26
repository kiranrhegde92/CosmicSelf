import React from 'react';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useAuthStore } from '../store/authStore';
import { useOnboardingStore } from '../store/onboardingStore';

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);

  if (isAuthenticated && hasOnboarded) {
    return <MainNavigator />;
  }
  return <AuthNavigator />;
}
