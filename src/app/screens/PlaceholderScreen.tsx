import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

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
  /**
   * Optional action button shown beneath the body. `mailto`, `tel:` and
   * https links open via Linking; in-app routes are handled by the screen
   * via the `route` field.
   */
  action?: { label: string; href: string };
};

export default function PlaceholderScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<{ Placeholder: Params }, 'Placeholder'>>();
  const fallbackTitle = t('placeholder.fallbackTitle');
  const { title, subtitle, body, icon = 'sparkle', action } = route.params ?? {
    title: fallbackTitle,
  };

  const onAction = async () => {
    if (!action) return;
    try {
      const can = await Linking.canOpenURL(action.href);
      if (can) await Linking.openURL(action.href);
    } catch {
      /* device doesn't have a handler — silently no-op */
    }
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
              {body ?? t('placeholder.fallbackBody')}
            </Text>
            {action && (
              <Pressable
                onPress={onAction}
                style={styles.actionRow}
                accessibilityLabel={action.label}
              >
                <CosmicIcon name="arrow-right" color={colors.goldPrimary} size={14} />
                <Text style={styles.actionText}>{action.label}</Text>
              </Pressable>
            )}
          </GlassCard>
          <CosmicButton title={t('placeholder.gotIt')} onPress={() => navigation.goBack()} variant="glass" />
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  actionText: {
    ...typography.body,
    color: colors.goldPrimary,
    fontSize: 14,
  },
});
