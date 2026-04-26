import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicIcon, { IconName } from '../components/ui/CosmicIcon';
import AstrologerAvatar from '../components/astrologer/AstrologerAvatar';
import ZodiacWheel from '../components/cosmic/ZodiacWheel';
import { ASTROLOGERS } from '../data/astrologers';
import { useOnboardingStore } from '../store/onboardingStore';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

const MENU: { key: string; label: string; icon: IconName; route?: keyof MainStackParamList }[] = [
  { key: 'chart', label: 'My Birth Chart', icon: 'chart', route: 'BirthChart' as any },
  { key: 'saved', label: 'Saved Insights', icon: 'star' },
  { key: 'astrologer', label: 'My Astrologer', icon: 'sparkle' },
  { key: 'subscription', label: 'Subscription', icon: 'crown', route: 'Subscription' },
  { key: 'settings', label: 'Settings', icon: 'settings', route: 'Settings' },
  { key: 'privacy', label: 'Privacy', icon: 'shield' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const reset = useOnboardingStore((s) => s.reset);

  const astrologerId = useOnboardingStore((s) => s.selectedAstrologerId) ?? 'veda';
  const birthDate = useOnboardingStore((s) => s.birthDate);
  const birthLocation = useOnboardingStore((s) => s.birthLocation);

  const astrologer = ASTROLOGERS.find((a) => a.id === astrologerId)!;

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="My Profile" rightIcon="settings" onRightPress={() => navigation.navigate('Settings')} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHero}>
            <View style={styles.avatarStack}>
              <View style={styles.wheelLayer}>
                <ZodiacWheel size={210} rotateSpeed={70000} showSigns={false} />
              </View>
              <View style={styles.avatarFrame}>
                <AstrologerAvatar visualKey={astrologer.visualKey} size={140} glow />
              </View>
            </View>
            <Text style={styles.name}>{user?.name || 'Cosmic Seeker'}</Text>
            <Text style={styles.email}>{user?.email || 'seeker@cosmic.self'}</Text>
          </View>

          <GlassCard style={styles.summary}>
            <Text style={styles.summaryTitle}>Birth Details</Text>
            <Row icon="calendar" label="Date" value={birthDate || '—'} />
            <Row icon="map-pin" label="Location" value={birthLocation || '—'} />
            <Row icon="sparkle" label="Astrologer" value={astrologer.name} />
          </GlassCard>

          <View style={styles.menuWrap}>
            {MENU.map((m) => (
              <Pressable
                key={m.key}
                style={styles.menuRow}
                onPress={() => m.route && navigation.navigate(m.route as any)}
                accessibilityLabel={m.label}
              >
                <View style={styles.menuIcon}>
                  <CosmicIcon name={m.icon} color={colors.goldPrimary} size={16} />
                </View>
                <Text style={styles.menuLabel}>{m.label}</Text>
                <CosmicIcon name="chevron-right" color={colors.textMuted} size={16} />
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.logout}
            onPress={() => {
              logout();
              reset();
            }}
            accessibilityLabel="Log out"
          >
            <Text style={styles.logoutText}>Log out</Text>
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
