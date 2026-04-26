import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import RootNavigator from './src/app/navigation/RootNavigator';
import { navigationTheme } from './src/app/theme/navigation';
import ErrorBoundary from './src/app/components/ui/ErrorBoundary';
import OfflineBanner from './src/app/components/ui/OfflineBanner';
import SplashView from './src/app/components/cosmic/SplashView';
import { useBrandFonts } from './src/app/theme/useBrandFonts';

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
