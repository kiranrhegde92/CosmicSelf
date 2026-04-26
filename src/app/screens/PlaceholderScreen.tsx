import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
import type { IconName } from '../components/ui/CosmicIcon';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

type Params = {
  title: string;
  subtitle?: string;
  body?: string;
  icon?: IconName;
};

export default function PlaceholderScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<{ Placeholder: Params }, 'Placeholder'>>();
  const { title, subtitle, body, icon = 'sparkle' } = route.params ?? {
    title: 'Coming soon',
  };

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title={title} subtitle={subtitle} showBack onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <View style={styles.iconCircle}>
            <CosmicIcon name={icon} color={colors.goldPrimary} size={28} />
          </View>
          <GlassCard style={styles.card}>
            <Text style={styles.heading}>{title}</Text>
            <Text style={styles.body}>
              {body ??
                'This corner of the cosmos is still under construction. Check back after the next celestial alignment.'}
            </Text>
          </GlassCard>
          <CosmicButton title="Got it" onPress={() => navigation.goBack()} variant="glass" />
        </View>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    paddingHorizontal: spacing.screenH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1.4,
    borderColor: 'rgba(246,200,95,0.5)',
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  card: {
    width: '100%',
  },
  heading: {
    ...typography.section,
    color: colors.goldBright,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
