import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
import Paywall from '../components/ui/Paywall';
import CompatibilityMeter from '../components/astrology/CompatibilityMeter';
import DailyInsightCard from '../components/astrology/DailyInsightCard';
import ZodiacWheel from '../components/cosmic/ZodiacWheel';
import { astrologyService } from '../services/astrologyService';
import { analytics, Events } from '../services/analyticsService';
import { tipFor, type CompatibilityReport } from '../services/compatibilityEngine';
import { useOnboardingStore } from '../store/onboardingStore';
import { usePremium } from '../store/usePremium';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

type LiveOrMock =
  | { kind: 'live'; report: CompatibilityReport }
  | { kind: 'placeholder' };

export default function CompatibilityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const partner = useOnboardingStore((s) => s.partner);
  const userBirthDate = useOnboardingStore((s) => s.birthDate);
  const premium = usePremium();

  const [state, setState] = useState<LiveOrMock>({ kind: 'placeholder' });

  // Anyone landing here without entitlement gets the paywall on first paint.
  const isPremium = premium.isPremium;
  const showPaywall = premium.showPaywall;
  useFocusEffect(
    useCallback(() => {
      if (!isPremium) showPaywall();
    }, [isPremium, showPaywall]),
  );

  const refresh = useCallback(async () => {
    if (!userBirthDate || !partner) {
      setState({ kind: 'placeholder' });
      return;
    }
    const result = await astrologyService.getCompatibility();
    if ('cards' in result && 'partnerA' in result && Array.isArray(result.cards)) {
      // Both shapes have these; we narrow to the live one when score is a
      // computed number (the mock uses a literal too — both work).
      setState({ kind: 'live', report: result as CompatibilityReport });
    } else {
      setState({ kind: 'placeholder' });
    }
  }, [partner, userBirthDate]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onEditPartner = () => navigation.navigate('EditPartner');

  return (
    <CosmicBackground intensity="medium">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="Cosmic Compatibility"
          subtitle="See how your energies align"
          showBack
          onBack={() => navigation.goBack()}
          rightIcon={partner ? 'settings' : undefined}
          onRightPress={onEditPartner}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {state.kind === 'live' ? (
            <LiveReport
              report={state.report}
              onEditPartner={onEditPartner}
              onFullReport={() => navigation.navigate('FullReport')}
            />
          ) : (
            <Placeholder
              hasUserChart={!!userBirthDate}
              onAddPartner={onEditPartner}
            />
          )}
        </ScrollView>

        <Paywall
          visible={premium.paywallVisible}
          onClose={() => {
            premium.hidePaywall();
            // Free users that close the paywall on this gated screen go back
            // home — staying here would just re-trigger the gate.
            if (!premium.isPremium) navigation.goBack();
          }}
          feature="Cosmic Compatibility"
          bullets={[
            'Real synastry score from actual aspect angles',
            'Emotional, communication, long-term, and challenges cards',
            'Save partner charts and revisit anytime',
          ]}
        />
      </SafeAreaView>
    </CosmicBackground>
  );
}

function PartnerSlot({
  glyph,
  label,
  sign,
  tint,
  onPress,
}: {
  glyph: string;
  label: string;
  sign: string;
  tint?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.partner} disabled={!onPress}>
      <View style={styles.wheelMini}>
        <ZodiacWheel size={120} rotateSpeed={90000} showSigns={false} intensity="low" />
        <Text style={[styles.miniGlyph, tint ? { color: tint } : null]}>{glyph}</Text>
      </View>
      <Text style={styles.partnerName} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.partnerSign}>{sign}</Text>
    </Pressable>
  );
}

function LiveReport({
  onFullReport,
  report,
  onEditPartner,
}: {
  report: CompatibilityReport;
  onEditPartner: () => void;
  onFullReport: () => void;
}) {
  return (
    <>
      <View style={styles.duo}>
        <PartnerSlot
          glyph={report.partnerA.glyph}
          label={report.partnerA.label}
          sign={report.partnerA.sign}
        />
        <View style={styles.merge}>
          <Text style={styles.mergeText}>×</Text>
        </View>
        <PartnerSlot
          glyph={report.partnerB.glyph}
          label={report.partnerB.label}
          sign={report.partnerB.sign}
          tint="#C4A7FF"
          onPress={onEditPartner}
        />
      </View>

      <View style={styles.meterWrap}>
        <CompatibilityMeter score={report.score} label={report.label} />
      </View>

      <View style={styles.grid}>
        {report.cards.map((c) => (
          <View key={c.key} style={styles.cell}>
            <DailyInsightCard
              icon={c.icon}
              title={c.title}
              value={c.value}
              description={c.description}
              tone={c.tone}
            />
          </View>
        ))}
      </View>

      <GlassCard style={styles.tipCard}>
        <Text style={styles.tipTitle}>Cosmic Tip</Text>
        <Text style={styles.tipBody}>{tipFor(report)}</Text>
      </GlassCard>

      <CosmicButton
        title="View Full Report"
        icon="book"
        onPress={onFullReport}
        style={{ marginTop: spacing.lg }}
      />
      <CosmicButton
        title="Share this match"
        icon="arrow-up"
        variant="glass"
        onPress={async () => {
          const { partnerA, partnerB, score, label, cards } = report;
          const message =
            `✦ Cosmic Compatibility — ${score}% / ${label}\n` +
            `${partnerA.label} (${partnerA.sign}) × ${partnerB.label} (${partnerB.sign})\n` +
            `${cards.map((c) => `${c.title}: ${c.value}`).join(' · ')}\n\n` +
            `Generated by CosmicSelf`;
          try {
            await Share.share({ title: 'Cosmic compatibility', message });
            analytics.track(Events.ShareCompleted, { surface: 'compatibility' });
          } catch {
            /* user dismissed */
          }
        }}
        style={{ marginTop: spacing.sm }}
      />
    </>
  );
}

function Placeholder({
  hasUserChart,
  onAddPartner,
}: {
  hasUserChart: boolean;
  onAddPartner: () => void;
}) {
  return (
    <View style={styles.placeholder}>
      <View style={styles.placeholderIcon}>
        <CosmicIcon name="heart" color={colors.goldPrimary} size={28} />
      </View>
      <Text style={styles.placeholderTitle}>Add a partner to see real synastry</Text>
      <Text style={styles.placeholderBody}>
        {hasUserChart
          ? 'Your chart is ready. Add the other person\'s birth date, time, and city — the score below comes from real aspect angles between your two charts, not zodiac stereotypes.'
          : 'Finish your own birth details first, then add a partner to compare charts.'}
      </Text>
      <CosmicButton
        title={hasUserChart ? 'Add Partner' : 'Set Birth Details'}
        icon="plus"
        onPress={onAddPartner}
        style={{ marginTop: spacing.lg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.xl,
  },
  duo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  partner: {
    alignItems: 'center',
    flex: 1,
  },
  wheelMini: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniGlyph: {
    position: 'absolute',
    fontSize: 36,
    color: colors.goldBright,
  },
  partnerName: {
    ...typography.bodyStrong,
    color: colors.white,
    marginTop: spacing.xs,
  },
  partnerSign: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  merge: {
    width: 30,
    alignItems: 'center',
  },
  mergeText: {
    ...typography.title,
    color: colors.goldPrimary,
    fontSize: 30,
  },
  meterWrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
    marginTop: spacing.lg,
    justifyContent: 'space-between',
  },
  cell: {
    width: '48.5%',
  },
  tipCard: {
    marginTop: spacing.lg,
  },
  tipTitle: {
    ...typography.label,
    color: colors.goldPrimary,
  },
  tipBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 22,
  },
  placeholder: {
    paddingTop: spacing.xl,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  placeholderIcon: {
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
  placeholderTitle: {
    ...typography.section,
    color: colors.white,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  placeholderBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
