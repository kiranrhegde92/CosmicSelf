import 'react-native-gesture-handler';
import React from 'react';
import { I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import './src/app/i18n';

// Allow the layout to flip when the device locale is RTL (Arabic, Hebrew,
// etc). We don't `forceRTL` — the user's device language drives direction.
// Once an RTL string bundle ships and the user's device is in that locale,
// the layout flips on next app launch.
I18nManager.allowRTL(true);
import RootNavigator from './src/app/navigation/RootNavigator';
import { navigationTheme } from './src/app/theme/navigation';
import ErrorBoundary from './src/app/components/ui/ErrorBoundary';
import OfflineBanner from './src/app/components/ui/OfflineBanner';
import SplashView from './src/app/components/cosmic/SplashView';
import { useBrandFonts } from './src/app/theme/useBrandFonts';
import { analytics, Events } from './src/app/services/analyticsService';

analytics.track(Events.AppOpened);

export default function App() {
  const fontsReady = useBrandFonts();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#080817' }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          {!fontsReady ? (
            <SplashView animate={false} />
          ) : (
            <NavigationContainer theme={navigationTheme}>
              <StatusBar style="light" />
              <RootNavigator />
              <OfflineBanner />
            </NavigationContainer>
          )}
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
