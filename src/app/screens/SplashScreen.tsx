import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SplashView from '../components/cosmic/SplashView';
import { AuthStackParamList } from '../navigation/routes';

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Login'), 2600);
    return () => clearTimeout(t);
  }, [navigation]);

  return <SplashView />;
}
