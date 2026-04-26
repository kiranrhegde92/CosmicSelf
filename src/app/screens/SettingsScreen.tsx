import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicIcon, { IconName } from '../components/ui/CosmicIcon';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useEntitlementStore, type Tier } from '../store/entitlementStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { notificationsService } from '../services/notificationsService';
import { savedInsightsRepository } from '../services/savedInsightsRepository';
import { deleteAccount } from '../services/accountService';
import { MainStackParamList } from '../navigation/routes';

// Languages with shipped JSON resource bundles. Add a new entry here once
// `src/app/i18n/locales/<code>.json` exists and is registered in i18n/index.ts.
const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
] as const;

type ItemType = 'switch' | 'navigate' | 'value';

type Item = {
  key: string;
  label: string;
  icon: IconName;
  type: ItemType;
  value?: string;
  route?: keyof MainStackParamList;
};

type Section = {
  key: string;
  title: string;
  items: Item[];
};

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  const pushEnabled = useAppStore((s) => s.pushEnabled);
  const setPushEnabled = useAppStore((s) => s.setPushEnabled);
  const horoscopeEnabled = useAppStore((s) => s.dailyHoroscopeEnabled);
  const setHoroscopeEnabled = useAppStore((s) => s.setDailyHoroscopeEnabled);
  const soundscape = useAppStore((s) => s.cosmicSoundscapeEnabled);
  const setSoundscape = useAppStore((s) => s.setCosmicSoundscapeEnabled);
  const mode = useOnboardingStore((s) => s.mode);

  const togglePush = async (next: boolean) => {
    setPushEnabled(next);
    if (!next) {
      await notificationsService.cancelDailyHoroscope();
    } else if (horoscopeEnabled) {
      await notificationsService.scheduleDailyHoroscope();
    }
  };

  const toggleHoroscope = async (next: boolean) => {
    setHoroscopeEnabled(next);
    if (next && pushEnabled) {
      await notificationsService.scheduleDailyHoroscope();
    } else {
      await notificationsService.cancelDailyHoroscope();
    }
  };

  const currentLangLabel =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language)?.label ??
    SUPPORTED_LANGUAGES[0].label;

  const sections: Section[] = [
    {
      key: 'account',
      title: t('settings.section.account'),
      items: [
        { key: 'edit', label: t('settings.item.editProfile'), icon: 'user', type: 'navigate' },
        { key: 'birth', label: t('settings.item.birthDetails'), icon: 'calendar', type: 'navigate' },
        { key: 'language', label: t('settings.item.language'), icon: 'orbit', type: 'value', value: currentLangLabel },
      ],
    },
    {
      key: 'notifications',
      title: t('settings.section.notifications'),
      items: [
        { key: 'permPrep', label: t('settings.item.permPrep'), icon: 'info', type: 'navigate' },
        { key: 'push', label: t('settings.item.push'), icon: 'bell', type: 'switch' },
        { key: 'horoscope', label: t('settings.item.horoscope'), icon: 'sparkle', type: 'switch' },
      ],
    },
    {
      key: 'astrologer',
      title: t('settings.section.astrologer'),
      items: [
        { key: 'mychan', label: t('settings.item.myAstrologer'), icon: 'star', type: 'navigate' },
        { key: 'mode', label: t('settings.item.mode'), icon: 'sun', type: 'value', value: mode === 'fun' ? t('settings.value.modeFun') : t('settings.value.modeSerious') },
      ],
    },
    {
      key: 'theme',
      title: t('settings.section.theme'),
      items: [
        { key: 'theme', label: t('settings.item.themeMode'), icon: 'moon', type: 'value', value: themeMode === 'glass' ? t('settings.value.themeGlass') : t('settings.value.themeDefault') },
        { key: 'sound', label: t('settings.item.soundscape'), icon: 'magic', type: 'switch' },
      ],
    },
    {
      key: 'privacy',
      title: t('settings.section.privacy'),
      items: [
        { key: 'data', label: t('settings.item.data'), icon: 'shield', type: 'navigate' },
        { key: 'export', label: t('settings.item.export'), icon: 'arrow-up', type: 'navigate' },
      ],
    },
    {
      key: 'subscription',
      title: t('settings.section.subscription'),
      items: [
        { key: 'plan', label: t('settings.item.managePlan'), icon: 'crown', type: 'navigate', route: 'Subscription' },
      ],
    },
    {
      key: 'help',
      title: t('settings.section.help'),
      items: [
        { key: 'faq', label: t('settings.item.faq'), icon: 'info', type: 'navigate' },
        { key: 'contact', label: t('settings.item.contact'), icon: 'chat', type: 'navigate' },
      ],
    },
    {
      key: 'danger',
      title: t('settings.danger.section'),
      items: [
        { key: 'deleteAccount', label: t('settings.danger.deleteAccount'), icon: 'close', type: 'navigate' },
      ],
    },
  ];

  const switchValue = (key: string) => {
    if (key === 'push') return pushEnabled;
    if (key === 'horoscope') return horoscopeEnabled;
    if (key === 'sound') return soundscape;
    return false;
  };

  const onToggle = (key: string) => {
    if (key === 'push') return togglePush(!pushEnabled);
    if (key === 'horoscope') return toggleHoroscope(!horoscopeEnabled);
    if (key === 'sound') return setSoundscape(!soundscape);
  };

  const exportData = async () => {
    const auth = useAuthStore.getState();
    const onboarding = useOnboardingStore.getState();
    const saved = await savedInsightsRepository.list();
    const payload = {
      exportedAt: new Date().toISOString(),
      user: auth.user,
      birth: {
        date: onboarding.birthDate,
        time: onboarding.birthTime,
        location: onboarding.birthLocation,
      },
      astrologer: onboarding.selectedAstrologerId,
      mode: onboarding.mode,
      savedInsights: saved,
    };
    try {
      await Share.share({
        title: t('settings.exportTitle'),
        message: JSON.stringify(payload, null, 2),
      });
    } catch {
      /* user dismissed */
    }
  };

  const onRowPress = (key: string, route?: keyof MainStackParamList) => {
    if (route) return navigation.navigate(route as any);
    switch (key) {
      case 'permPrep':
        return navigation.navigate('PushPermissionPrePrompt');
      case 'edit':
        return navigation.navigate('EditProfile');
      case 'birth':
        return navigation.navigate('EditBirthDetails');
      case 'mychan':
        return navigation.navigate('EditAstrologer');
      case 'mode':
        return navigation.navigate('EditAstrologer');
      case 'language':
        return Alert.alert(
          t('settings.language.title'),
          t('settings.language.body'),
          [
            ...SUPPORTED_LANGUAGES.map((lang) => ({
              text: lang.label,
              onPress: () => {
                i18n.changeLanguage(lang.code).catch(() => {});
              },
            })),
            { text: t('common.cancel') as string, style: 'cancel' as const },
          ],
        );
      case 'theme':
        setThemeMode(themeMode === 'default' ? 'glass' : 'default');
        return;
      case 'data':
        return navigation.navigate('Placeholder', {
          title: t('settingsExtras.data.title'),
          subtitle: t('settingsExtras.data.subtitle'),
          icon: 'shield',
          body: t('settingsExtras.data.body'),
        });
      case 'export':
        return exportData();
      case 'faq':
        return navigation.navigate('Placeholder', {
          title: t('settingsExtras.faq.title'),
          subtitle: t('settingsExtras.faq.subtitle'),
          icon: 'info',
          body: t('settingsExtras.faq.body'),
        });
      case 'contact':
        return navigation.navigate('Placeholder', {
          title: t('settingsExtras.contact.title'),
          subtitle: t('settingsExtras.contact.subtitle'),
          icon: 'chat',
          body: t('settingsExtras.contact.body'),
          action: {
            label: t('settingsExtras.contact.cta'),
            href:
              'mailto:support@cosmicself.app?subject=' +
              encodeURIComponent(t('settingsExtras.contact.mailSubject')) +
              '&body=' +
              encodeURIComponent(t('settingsExtras.contact.mailBody')),
          },
        });
      case 'deleteAccount':
        return confirmDeleteAccount();
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      t('settings.danger.alertTitle'),
      t('settings.danger.alertBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.danger.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              // Auth state listener will flip the navigator to the auth stack
              // automatically; clear local state so the next signed-in user
              // doesn't inherit our cached onboarding/profile/etc.
              useAuthStore.getState().logout();
              useOnboardingStore.getState().reset();
              Alert.alert(
                t('settings.danger.successTitle'),
                t('settings.danger.successBody'),
              );
            } catch {
              Alert.alert(
                t('settings.danger.failureTitle'),
                t('settings.danger.failureBody'),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title={t('settings.title')}
          showBack
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <View key={section.key} style={{ marginBottom: spacing.lg }}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <GlassCard padding={0} style={styles.card}>
                {section.items.map((item, idx) => {
                  const isSwitch = item.type === 'switch';
                  const switchOn = isSwitch ? switchValue(item.key) : undefined;
                  return (
                    <Pressable
                      key={item.key}
                      style={[
                        styles.row,
                        idx === section.items.length - 1 && { borderBottomWidth: 0 },
                      ]}
                      onPress={() => {
                        if (isSwitch) return onToggle(item.key);
                        onRowPress(item.key, item.route);
                      }}
                      accessibilityRole={isSwitch ? 'switch' : 'button'}
                      accessibilityLabel={item.label}
                      accessibilityState={isSwitch ? { checked: !!switchOn } : undefined}
                      accessibilityValue={item.type === 'value' ? { text: item.value ?? '' } : undefined}
                    >
                      <View style={styles.iconBox}>
                        <CosmicIcon name={item.icon} color={colors.goldPrimary} size={15} />
                      </View>
                      <Text style={styles.label}>{item.label}</Text>
                      {isSwitch ? (
                        <Switch
                          value={switchOn}
                          onValueChange={() => onToggle(item.key)}
                          thumbColor={switchOn ? colors.goldBright : '#fff'}
                          trackColor={{ false: '#3A1B6D', true: colors.goldMuted }}
                          accessibilityLabel={item.label}
                        />
                      ) : item.type === 'value' ? (
                        <Text style={styles.value}>{item.value}</Text>
                      ) : (
                        <CosmicIcon name="chevron-right" color={colors.textMuted} size={16} />
                      )}
                    </Pressable>
                  );
                })}
              </GlassCard>
            </View>
          ))}
          {__DEV__ && <DevPanel />}
          <Text style={styles.version}>{t('settings.version')}</Text>
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.goldPrimary,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  card: {
    overflow: 'hidden',
    borderRadius: radii.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    ...typography.body,
    color: colors.white,
    fontSize: 14,
  },
  value: {
    ...typography.caption,
    color: colors.goldPrimary,
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

/* -------------------------------------------------------------------------- */
/* Dev tools — only rendered when __DEV__ is true.                            */
/* -------------------------------------------------------------------------- */

function DevPanel() {
  const tier = useEntitlementStore((s) => s.tier);
  const setTier = useEntitlementStore((s) => s.setTier);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  const tierBtn = (label: string, value: Tier) => (
    <Pressable
      key={value}
      onPress={() => setTier(value)}
      style={[devStyles.tierBtn, tier === value && devStyles.tierBtnActive]}
    >
      <Text
        style={[devStyles.tierLabel, tier === value && { color: '#1A0F33' }]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
      <Text style={devStyles.kicker}>DEV TOOLS</Text>
      <GlassCard padding={spacing.md} style={{ borderRadius: radii.xl }}>
        <Text style={devStyles.label}>Entitlement</Text>
        <View style={devStyles.tierRow}>
          {tierBtn('Free', 'free')}
          {tierBtn('Pro', 'pro')}
          {tierBtn('Master', 'master')}
        </View>

        <Pressable
          style={devStyles.actionRow}
          onPress={() => resetOnboarding()}
        >
          <CosmicIcon name="orbit" color={colors.goldPrimary} size={14} />
          <Text style={devStyles.actionLabel}>Reset onboarding (signs out flow)</Text>
        </Pressable>
        <Pressable
          style={devStyles.actionRow}
          onPress={() => {
            // Trip the ErrorBoundary on purpose for visual QA.
            throw new Error('Dev panel: triggered test error');
          }}
        >
          <CosmicIcon name="info" color={colors.error} size={14} />
          <Text style={devStyles.actionLabel}>Crash render (test ErrorBoundary)</Text>
        </Pressable>
      </GlassCard>
    </View>
  );
}

const devStyles = StyleSheet.create({
  kicker: {
    ...typography.label,
    color: colors.error,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  tierBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.35)',
  },
  tierBtnActive: {
    backgroundColor: colors.goldPrimary,
    borderColor: colors.goldBright,
  },
  tierLabel: {
    ...typography.pill,
    color: colors.textSecondary,
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
  },
  actionLabel: {
    ...typography.body,
    color: colors.white,
    fontSize: 13,
    flex: 1,
  },
});
