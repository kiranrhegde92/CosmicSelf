import React, { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import Skeleton from '../components/ui/Skeleton';
import BirthChartPreview from '../components/astrology/BirthChartPreview';
import CosmicIcon, { IconName } from '../components/ui/CosmicIcon';
import { astrologyService, ChartCardData } from '../services/astrologyService';
import { analytics, Events } from '../services/analyticsService';
import type { NatalChart } from '../services/astroEngine';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography, fonts } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

const itemDescriptors: {
  key: keyof ChartCardData;
  icon: IconName;
  titleKey: string;
}[] = [
  { key: 'sun', icon: 'sun', titleKey: 'birthChart.card.sun' },
  { key: 'moon', icon: 'moon', titleKey: 'birthChart.card.moon' },
  { key: 'ascendant', icon: 'arrow-up', titleKey: 'birthChart.card.ascendant' },
  { key: 'dominant', icon: 'star', titleKey: 'birthChart.card.dominant' },
];

export default function BirthChartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const [chart, setChart] = useState<ChartCardData | null>(null);
  const [natal, setNatal] = useState<NatalChart | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      astrologyService.getBirthChart(),
      astrologyService.getNatalChart(),
    ]).then(([c, n]) => {
      if (!active) return;
      setChart(c);
      setNatal(n);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // No real natal chart computed = no birth data on file. Show a friendly
  // empty state with a path to onboarding's edit screen rather than the
  // misleading mock cards.
  const noBirthData = loaded && natal === null;

  if (noBirthData) {
    return (
      <CosmicBackground intensity="low" showZodiacWheel>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ScreenHeader title={t('birthChart.title')} subtitle={t('birthChart.subtitle')} />
          <View style={styles.emptyWrap}>
            <View style={styles.chartWrap}>
              <BirthChartPreview size={240} chart={null} rotate={false} />
            </View>
            <Text style={styles.emptyTitle}>{t('birthChart.empty.title')}</Text>
            <Text style={styles.emptyBody}>{t('birthChart.empty.body')}</Text>
            <CosmicButton
              title={t('birthChart.empty.cta')}
              icon="calendar"
              onPress={() => navigation.navigate('EditBirthDetails')}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        </SafeAreaView>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground intensity="low" showZodiacWheel>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title={t('birthChart.title')} subtitle={t('birthChart.subtitle')} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.chartWrap}>
            <BirthChartPreview size={300} chart={natal} />
          </View>

          <View style={styles.grid}>
            {itemDescriptors.map((it) => {
              const data = chart?.[it.key];
              return (
                <View key={it.key} style={styles.cell}>
                  <GlassCard padding={spacing.md} style={{ flex: 1 }}>
                    <View style={styles.cardHead}>
                      <View style={styles.iconWrap}>
                        <CosmicIcon name={it.icon} color={colors.goldPrimary} size={16} />
                      </View>
                      <Text style={styles.cardTitle}>{t(it.titleKey)}</Text>
                    </View>
                    {data ? (
                      <>
                        <Text style={styles.cardValue}>{data.name}</Text>
                        <Text style={styles.cardDetail}>{data.detail}</Text>
                      </>
                    ) : (
                      <View style={{ marginTop: spacing.sm, gap: 6 }}>
                        <Skeleton variant="line" width="70%" height={14} />
                        <Skeleton variant="line" width="100%" height={10} />
                        <Skeleton variant="line" width="80%" height={10} />
                      </View>
                    )}
                  </GlassCard>
                </View>
              );
            })}
          </View>

          <CosmicButton
            title={t('birthChart.askAi')}
            icon="sparkle"
            onPress={() => navigation.navigate('Chat' as any)}
            disabled={!chart}
            style={{ marginTop: spacing.lg }}
          />
          <CosmicButton
            title={t('birthChart.share')}
            icon="arrow-up"
            variant="glass"
            disabled={!chart}
            onPress={async () => {
              if (!chart) return;
              const message =
                `${t('birthChart.shareHeader')}\n` +
                `${chart.sun.name}\n${chart.moon.name}\n` +
                `${chart.ascendant.name}\n${chart.dominant.name}\n\n` +
                t('birthChart.shareFooter');
              try {
                await Share.share({ title: t('birthChart.shareTitle'), message });
                analytics.track(Events.ShareCompleted, { surface: 'birth_chart' });
              } catch {
                /* user dismissed */
              }
            }}
            style={{ marginTop: spacing.sm }}
          />
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: 120,
  },
  chartWrap: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  emptyTitle: {
    ...typography.section,
    color: colors.white,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    maxWidth: 320,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
    marginTop: spacing.md,
    justifyContent: 'space-between',
  },
  cell: {
    width: '48.5%',
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.4)',
  },
  cardTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: fonts.bodySemibold,
    letterSpacing: 0.4,
  },
  cardValue: {
    ...typography.section,
    fontSize: 16,
    color: colors.goldBright,
    marginTop: spacing.sm,
  },
  cardDetail: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
});
