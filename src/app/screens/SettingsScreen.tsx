import React from 'react';
import {
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
import { MainStackParamList } from '../navigation/routes';

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

  const sections: Section[] = [
    {
      key: 'account',
      title: 'Account',
      items: [
        { key: 'edit', label: 'Edit Profile', icon: 'user', type: 'navigate' },
        { key: 'birth', label: 'Birth Details', icon: 'calendar', type: 'navigate' },
        { key: 'language', label: 'Language', icon: 'orbit', type: 'value', value: 'English' },
      ],
    },
    {
      key: 'notifications',
      title: 'Notifications',
      items: [
        { key: 'permPrep', label: 'How notifications work', icon: 'info', type: 'navigate' },
        { key: 'push', label: 'Push Notifications', icon: 'bell', type: 'switch' },
        { key: 'horoscope', label: 'Daily Horoscope', icon: 'sparkle', type: 'switch' },
      ],
    },
    {
      key: 'astrologer',
      title: 'Astrologer Preferences',
      items: [
        { key: 'mychan', label: 'My Astrologer', icon: 'star', type: 'navigate' },
        { key: 'mode', label: 'Mode', icon: 'sun', type: 'value', value: 'Serious' },
      ],
    },
    {
      key: 'theme',
      title: 'Theme',
      items: [
        { key: 'theme', label: 'Theme Mode', icon: 'moon', type: 'value', value: themeMode === 'glass' ? 'Glass' : 'Default' },
        { key: 'sound', label: 'Cosmic Soundscape', icon: 'magic', type: 'switch' },
      ],
    },
    {
      key: 'privacy',
      title: 'Privacy',
      items: [
        { key: 'data', label: 'Data & Permissions', icon: 'shield', type: 'navigate' },
        { key: 'export', label: 'Export My Data', icon: 'arrow-up', type: 'navigate' },
      ],
    },
    {
      key: 'subscription',
      title: 'Subscription',
      items: [
        { key: 'plan', label: 'Manage Plan', icon: 'crown', type: 'navigate', route: 'Subscription' },
      ],
    },
    {
      key: 'help',
      title: 'Help',
      items: [
        { key: 'faq', label: 'FAQ', icon: 'info', type: 'navigate' },
        { key: 'contact', label: 'Contact Support', icon: 'chat', type: 'navigate' },
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
        title: 'CosmicSelf data export',
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
        return navigation.navigate('Placeholder', {
          title: 'Language',
          subtitle: 'More tongues, more stars',
          icon: 'orbit',
          body:
            'Localization is on the roadmap. CosmicSelf currently speaks English; Hindi, Spanish, and Portuguese are queued for the next release.',
        });
      case 'theme':
        setThemeMode(themeMode === 'default' ? 'glass' : 'default');
        return;
      case 'data':
        return navigation.navigate('Placeholder', {
          title: 'Data & Permissions',
          subtitle: 'What we keep, what we don’t',
          icon: 'shield',
          body:
            'Your birth details, saved insights, and chat transcripts live in your private Firestore document, scoped by your account. Notifications are scheduled locally on this device. We never share your data with advertisers.',
        });
      case 'export':
        return exportData();
      case 'faq':
        return navigation.navigate('Placeholder', {
          title: 'FAQ',
          subtitle: 'Cosmic questions answered',
          icon: 'info',
          body:
            'Common questions are getting their own home soon. Until then, the in-app astrologer can answer most things — try asking them directly.',
        });
      case 'contact':
        return navigation.navigate('Placeholder', {
          title: 'Contact Support',
          subtitle: 'We’re listening',
          icon: 'chat',
          body:
            'Email support@cosmicself.app and we’ll respond within two business days. Include the version number from this screen for faster help.',
          action: {
            label: 'Open mail',
            href:
              'mailto:support@cosmicself.app?subject=' +
              encodeURIComponent('CosmicSelf support request') +
              '&body=' +
              encodeURIComponent('Version: 1.0.0\n\nDescribe what happened:\n\n'),
          },
        });
    }
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
                {section.items.map((item, idx) => (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.row,
                      idx === section.items.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => {
                      if (item.type === 'switch') return onToggle(item.key);
                      onRowPress(item.key, item.route);
                    }}
                    accessibilityLabel={item.label}
                  >
                    <View style={styles.iconBox}>
                      <CosmicIcon name={item.icon} color={colors.goldPrimary} size={15} />
                    </View>
                    <Text style={styles.label}>{item.label}</Text>
                    {item.type === 'switch' ? (
                      <Switch
                        value={switchValue(item.key)}
                        onValueChange={() => onToggle(item.key)}
                        thumbColor={switchValue(item.key) ? colors.goldBright : '#fff'}
                        trackColor={{ false: '#3A1B6D', true: colors.goldMuted }}
                      />
                    ) : item.type === 'value' ? (
                      <Text style={styles.value}>{item.value}</Text>
                    ) : (
                      <CosmicIcon name="chevron-right" color={colors.textMuted} size={16} />
                    )}
                  </Pressable>
                ))}
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
