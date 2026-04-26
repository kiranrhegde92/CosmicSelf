import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import ToggleMode from '../components/ui/ToggleMode';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
import AstrologerCarousel from '../components/astrologer/AstrologerCarousel';
import { ASTROLOGERS } from '../data/astrologers';
import { useOnboardingStore } from '../store/onboardingStore';
import { analytics, Events } from '../services/analyticsService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography, fonts } from '../theme/typography';
import { AuthStackParamList } from '../navigation/routes';

export default function AstrologerSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { t } = useTranslation();
  const setAstrologer = useOnboardingStore((s) => s.setAstrologer);
  const setMode = useOnboardingStore((s) => s.setMode);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const mode = useOnboardingStore((s) => s.mode);
  const initialId = useOnboardingStore((s) => s.selectedAstrologerId) ?? 'veda';

  const [selectedId, setSelectedId] = useState(initialId);
  const selected = useMemo(() => ASTROLOGERS.find((a) => a.id === selectedId)!, [selectedId]);

  const onContinue = () => {
    setAstrologer(selectedId);
    completeOnboarding();
    analytics.track(Events.OnboardingCompleted, { astrologer: selectedId, mode });
    // RootNavigator will switch to MainNavigator automatically
  };

  return (
    <CosmicBackground intensity="medium" showZodiacWheel>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title={t('astrologerSelect.title')}
          subtitle={t('astrologerSelect.subtitle')}
          showBack
          onBack={() => navigation.goBack()}
          rightIcon="info"
        />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.toggleWrap}>
            <ToggleMode
              options={[
                { key: 'serious', label: t('astrologerSelect.modeSerious'), icon: 'shield' },
                { key: 'fun', label: t('astrologerSelect.modeFun'), icon: 'sparkle' },
              ]}
              value={mode}
              onChange={(k) => setMode(k as 'serious' | 'fun')}
            />
          </View>

          <View style={{ marginTop: spacing.md }}>
            <AstrologerCarousel
              data={ASTROLOGERS}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </View>

          <GlassCard style={styles.infoCard}>
            <View style={styles.infoHead}>
              <CosmicIcon name="sparkle" color={colors.goldPrimary} size={16} />
              <Text style={styles.infoTitle}>{t('astrologerSelect.infoTitle')}</Text>
            </View>
            <Text style={styles.infoBody}>
              {t('astrologerSelect.infoLead')}{' '}
              {mode === 'fun' ? t('astrologerSelect.infoFun') : t('astrologerSelect.infoSerious')}
            </Text>
            <Text style={styles.selectedLabel}>{selected.name} · {selected.specialty}</Text>
          </GlassCard>

          <View style={{ paddingHorizontal: spacing.screenH, marginTop: spacing.lg }}>
            <CosmicButton title={t('astrologerSelect.continue')} onPress={onContinue} iconRight="arrow-right" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl,
  },
  toggleWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  infoCard: {
    marginHorizontal: spacing.screenH,
    marginTop: spacing.lg,
  },
  infoHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoTitle: {
    ...typography.bodyStrong,
    color: colors.goldBright,
  },
  infoBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  selectedLabel: {
    ...typography.caption,
    color: colors.goldPrimary,
    marginTop: spacing.sm,
    fontFamily: fonts.bodySemibold,
  },
});
