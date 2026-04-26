import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import BirthDetailsScreen from '../screens/BirthDetailsScreen';
import AstrologerSelectionScreen from '../screens/AstrologerSelectionScreen';
import { AuthStackParamList } from './routes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#080817' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="BirthDetails" component={BirthDetailsScreen} />
      <Stack.Screen name="AstrologerSelection" component={AstrologerSelectionScreen} />
    </Stack.Navigator>
  );
}
