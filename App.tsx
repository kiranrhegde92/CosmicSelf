import 'react-native-gesture-handler';
import React from 'react';
import { I18nManager, Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import './src/app/i18n';
import { initSentry, wrapApp } from './src/app/services/sentryService';

// Initialize Sentry as early as possible — before the first render — so any
// crash during boot is captured. No-op when EXPO_PUBLIC_SENTRY_DSN isn't set.
initSentry();

// Allow the layout to flip when the device locale is RTL (Arabic, Hebrew,
// etc). We don't `forceRTL` — the user's device language drives direction.
// Once an RTL string bundle ships and the user's device is in that locale,
// the layout flips on next app launch.
I18nManager.allowRTL(true);

// Cap OS font scaling at 2x (200%). Above that headers and CTAs collide;
// below 2x the cosmic layouts hold together. Text scaling itself stays
// enabled (the default) so accessibility users still get larger text.
const MAX_FONT_SCALE = 2.0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Text as any).defaultProps = (Text as any).defaultProps || {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Text as any).defaultProps.maxFontSizeMultiplier = MAX_FONT_SCALE;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(TextInput as any).defaultProps.maxFontSizeMultiplier = MAX_FONT_SCALE;
import RootNavigator from './src/app/navigation/RootNavigator';
import { navigationTheme } from './src/app/theme/navigation';
import ErrorBoundary from './src/app/components/ui/ErrorBoundary';
import OfflineBanner from './src/app/components/ui/OfflineBanner';
import SplashView from './src/app/components/cosmic/SplashView';
import { useBrandFonts } from './src/app/theme/useBrandFonts';
import { analytics, Events } from './src/app/services/analyticsService';

analytics.track(Events.AppOpened);

function App() {
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

// wrapApp installs Sentry's error boundary + touch-event tracing when a DSN
// is configured. No-op when Sentry isn't enabled.
export default wrapApp(App);
