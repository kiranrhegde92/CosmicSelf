import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

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
import { getActivePartner, useOnboardingStore } from '../store/onboardingStore';
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
  const { t } = useTranslation();
  const partner = useOnboardingStore((s) => getActivePartner(s));
  const partnersCount = useOnboardingStore((s) => s.partners.length);
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

  const onOpenPartners = () => navigation.navigate('Partners');
  const onAddPartner = () => navigation.navigate('EditPartner', {});

  return (
    <CosmicBackground intensity="medium">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title={t('compatibility.title')}
          subtitle={t('compatibility.subtitle')}
          showBack
          onBack={() => navigation.goBack()}
          rightIcon="settings"
          onRightPress={onOpenPartners}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {state.kind === 'live' ? (
            <LiveReport
              report={state.report}
              onEditPartner={onOpenPartners}
              onFullReport={() => navigation.navigate('FullReport')}
            />
          ) : (
            <Placeholder
              hasUserChart={!!userBirthDate}
              onAddPartner={onAddPartner}
            />
          )}
          {partnersCount === 0 && state.kind === 'live' && (
            <CosmicButton
              title={t('compatibility.addPartner')}
              icon="plus"
              onPress={onAddPartner}
              style={{ marginTop: spacing.lg }}
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
          feature={t('compatibility.feature')}
          bullets={[
            t('compatibility.paywall.bullet1'),
            t('compatibility.paywall.bullet2'),
            t('compatibility.paywall.bullet3'),
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
    <Pressable
      onPress={onPress}
      style={styles.partner}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label} — ${sign}`}
    >
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
  const { t } = useTranslation();

  // Heart-pulse on connection — the merge glyph beats twice when the live
  // report first renders, signaling "the link is made". Reduce-motion users
  // get a static glyph.
  const pulse = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = 1;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 320, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 320, easing: Easing.in(Easing.quad) }),
      ),
      2,
      false,
    );
  }, [pulse, reduceMotion, report.partnerA.label, report.partnerB.label]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <>
      <View style={styles.duo}>
        <PartnerSlot
          glyph={report.partnerA.glyph}
          label={report.partnerA.label}
          sign={report.partnerA.sign}
        />
        <Animated.View style={[styles.merge, pulseStyle]}>
          <Text style={styles.mergeText}>×</Text>
        </Animated.View>
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
        <Text style={styles.tipTitle}>{t('compatibility.tipTitle')}</Text>
        <Text style={styles.tipBody}>{tipFor(report)}</Text>
      </GlassCard>

      <CosmicButton
        title={t('compatibility.fullReport')}
        icon="book"
        onPress={onFullReport}
        style={{ marginTop: spacing.lg }}
      />
      <CosmicButton
        title={t('compatibility.share')}
        icon="arrow-up"
        variant="glass"
        onPress={async () => {
          const { partnerA, partnerB, score, label, cards } = report;
          const message =
            `${t('compatibility.shareHeader')} — ${score}% / ${label}\n` +
            `${partnerA.label} (${partnerA.sign}) × ${partnerB.label} (${partnerB.sign})\n` +
            `${cards.map((c) => `${c.title}: ${c.value}`).join(' · ')}\n\n` +
            t('compatibility.shareFooter');
          try {
            await Share.share({ title: t('compatibility.shareTitle'), message });
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
  const { t } = useTranslation();
  return (
    <View style={styles.placeholder}>
      <View style={styles.placeholderIcon}>
        <CosmicIcon name="heart" color={colors.goldPrimary} size={28} />
      </View>
      <Text style={styles.placeholderTitle}>{t('compatibility.placeholder.title')}</Text>
      <Text style={styles.placeholderBody}>
        {hasUserChart
          ? t('compatibility.placeholder.withChart')
          : t('compatibility.placeholder.withoutChart')}
      </Text>
      <CosmicButton
        title={hasUserChart ? t('compatibility.addPartner') : t('compatibility.setBirthDetails')}
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
