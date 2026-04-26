import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicIcon, { IconName } from '../components/ui/CosmicIcon';
import TierBadge from '../components/ui/TierBadge';
import AstrologerAvatar from '../components/astrologer/AstrologerAvatar';
import ZodiacWheel from '../components/cosmic/ZodiacWheel';
import { useEntitlementStore } from '../store/entitlementStore';
import { ASTROLOGERS } from '../data/astrologers';
import { useOnboardingStore } from '../store/onboardingStore';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

const MENU: { key: string; labelKey: string; icon: IconName; route?: keyof MainStackParamList }[] = [
  { key: 'chart', labelKey: 'profile.menu.chart', icon: 'chart', route: 'BirthChart' as any },
  { key: 'saved', labelKey: 'profile.menu.saved', icon: 'star', route: 'SavedInsights' },
  { key: 'astrologer', labelKey: 'profile.menu.astrologer', icon: 'sparkle', route: 'EditAstrologer' },
  { key: 'partners', labelKey: 'profile.menu.partners', icon: 'heart', route: 'Partners' },
  { key: 'subscription', labelKey: 'profile.menu.subscription', icon: 'crown', route: 'Subscription' },
  { key: 'settings', labelKey: 'profile.menu.settings', icon: 'settings', route: 'Settings' },
  { key: 'privacy', labelKey: 'profile.menu.privacy', icon: 'shield', route: 'Placeholder' as any },
];

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const reset = useOnboardingStore((s) => s.reset);
  const tier = useEntitlementStore((s) => s.tier);

  const astrologerId = useOnboardingStore((s) => s.selectedAstrologerId) ?? 'veda';
  const birthDate = useOnboardingStore((s) => s.birthDate);
  const birthLocation = useOnboardingStore((s) => s.birthLocation);

  const astrologer = ASTROLOGERS.find((a) => a.id === astrologerId)!;

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title={t('profile.title')} rightIcon="settings" onRightPress={() => navigation.navigate('Settings')} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={styles.profileHero}
            onPress={() => navigation.navigate('EditProfile')}
            accessibilityLabel={t('editProfile.avatar.edit')}
            accessibilityRole="button"
          >
            <View style={styles.avatarStack}>
              <View style={styles.wheelLayer}>
                <ZodiacWheel size={210} rotateSpeed={70000} showSigns={false} />
              </View>
              <View style={styles.avatarFrame}>
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
                ) : (
                  <AstrologerAvatar visualKey={astrologer.visualKey} size={140} glow />
                )}
              </View>
            </View>
            <Text style={styles.name}>{user?.name || t('profile.fallbackName')}</Text>
            <Text style={styles.email}>{user?.email || t('profile.fallbackEmail')}</Text>
            <TierBadge tier={tier} size="md" style={{ marginTop: spacing.sm }} />
          </Pressable>

          <GlassCard style={styles.summary}>
            <Text style={styles.summaryTitle}>{t('profile.birthDetails')}</Text>
            <Row icon="calendar" label={t('profile.row.date')} value={birthDate || '—'} />
            <Row icon="map-pin" label={t('profile.row.location')} value={birthLocation?.label || '—'} />
            <Row icon="sparkle" label={t('profile.row.astrologer')} value={astrologer.name} />
          </GlassCard>

          <View style={styles.menuWrap}>
            {MENU.map((m) => {
              const label = t(m.labelKey);
              return (
                <Pressable
                  key={m.key}
                  style={styles.menuRow}
                  onPress={() => {
                    if (!m.route) return;
                    if (m.key === 'privacy') {
                      navigation.navigate('Placeholder', {
                        title: 'Privacy',
                        subtitle: 'Your data, your stars',
                        icon: 'shield',
                        body:
                          'CosmicSelf stores only what you tell it: your birth details, saved insights, and chats with your astrologer. Everything is scoped to your account by Firestore Rules and never shared with third parties.',
                      });
                      return;
                    }
                    navigation.navigate(m.route as any);
                  }}
                  accessibilityLabel={label}
                >
                  <View style={styles.menuIcon}>
                    <CosmicIcon name={m.icon} color={colors.goldPrimary} size={16} />
                  </View>
                  <Text style={styles.menuLabel}>{label}</Text>
                  <CosmicIcon name="chevron-right" color={colors.textMuted} size={16} />
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.logout}
            onPress={() => {
              logout();
              reset();
            }}
            accessibilityLabel={t('profile.logout')}
          >
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

function Row({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <CosmicIcon name={icon} color={colors.goldPrimary} size={14} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: 120,
  },
  profileHero: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  avatarStack: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelLayer: {
    position: 'absolute',
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFrame: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 1.6,
    borderColor: colors.goldPrimary,
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarImg: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  name: {
    ...typography.section,
    color: colors.white,
    marginTop: spacing.sm,
  },
  email: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summary: {
    marginTop: spacing.lg,
  },
  summaryTitle: {
    ...typography.label,
    color: colors.goldPrimary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    gap: spacing.sm,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  rowValue: {
    ...typography.body,
    color: colors.white,
    fontSize: 14,
  },
  menuWrap: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(20,18,41,0.55)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.18)',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    ...typography.body,
    color: colors.white,
    flex: 1,
  },
  logout: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
  },
});
