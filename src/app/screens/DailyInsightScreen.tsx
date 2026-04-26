import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import Skeleton, { SkeletonParagraph } from '../components/ui/Skeleton';
import DailyInsightCard from '../components/astrology/DailyInsightCard';
import ZodiacWheel from '../components/cosmic/ZodiacWheel';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { astrologyService } from '../services/astrologyService';
import { analytics, Events } from '../services/analyticsService';
import type { DailyInsight } from '../services/dailyInsightEngine';
import { haptics } from '../services/hapticsService';
import { savedInsightsRepository } from '../services/savedInsightsRepository';
import { MainStackParamList } from '../navigation/routes';

export default function DailyInsightScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Re-fetch on every focus — the date / strongest transit moves through
  // the day so the saved-state shouldn't go stale across long sessions.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      astrologyService.getDailyInsight().then((d) => {
        if (active) setInsight(d as DailyInsight);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const onShare = async () => {
    if (!insight) return;
    // ScreenHeader only supports a single rightIcon — adding a second header
    // affordance would force every screen to learn a new contract. Footer
    // glass button instead. `arrow-up` matches the export icon convention
    // used on Settings (a `share` glyph isn't in the IconName union).
    const message =
      `✦ ${insight.headline}\n${insight.body}\n\n` +
      `— ${insight.date}, ${t('daily.shareFooter')}`;
    try {
      await Share.share({ title: t('daily.shareTitle'), message });
      analytics.track(Events.ShareCompleted, { surface: 'daily' });
    } catch {
      /* user dismissed */
    }
  };

  const onSave = async () => {
    if (!insight || saved || saving) return;
    setSaving(true);
    const id = await savedInsightsRepository.save({
      date: insight.date,
      zodiac: insight.zodiac,
      zodiacGlyph: insight.zodiacGlyph,
      headline: insight.headline,
      body: insight.body,
    });
    setSaving(false);
    if (id) {
      setSaved(true);
      haptics.success();
      analytics.track(Events.InsightSaved, { zodiac: insight?.zodiac ?? null });
    } else if (!savedInsightsRepository.isLive) {
      Alert.alert(
        t('daily.errors.signInTitle'),
        t('daily.errors.signInBody'),
      );
    } else {
      Alert.alert(t('daily.errors.saveFailedTitle'), t('daily.errors.saveFailedBody'));
    }
  };

  return (
    <CosmicBackground intensity="medium">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title={t('daily.title')}
          subtitle={insight?.date}
          rightIcon="book"
          rightLabel={t('daily.history')}
          onRightPress={() => navigation.navigate('DailyInsightHistory')}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.zodiacWrap}>
            <ZodiacWheel size={200} rotateSpeed={70000} />
            <View style={styles.zodiacGlyph}>
              <Text style={styles.glyph}>{insight?.zodiacGlyph ?? '✦'}</Text>
              <Text style={styles.zodiacName}>{insight?.zodiac ?? t('daily.fallbackZodiac')}</Text>
            </View>
          </View>

          {insight ? (
            <GlassCard style={styles.mainCard}>
              <Text style={styles.headline}>{insight.headline}</Text>
              <Text style={styles.body}>{insight.body}</Text>
            </GlassCard>
          ) : (
            <GlassCard style={styles.mainCard}>
              <Skeleton variant="line" width="80%" height={20} />
              <View style={{ height: spacing.sm }} />
              <SkeletonParagraph lines={4} />
            </GlassCard>
          )}

          {insight ? (
            <View style={styles.grid}>
              {insight.sections.map((s) => (
                <View key={s.key} style={styles.cell}>
                  <DailyInsightCard
                    icon={s.icon}
                    title={s.title}
                    value={s.value}
                    description={s.description}
                    tone={s.tone}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.grid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.cell}>
                  <Skeleton variant="card" height={104} />
                </View>
              ))}
            </View>
          )}

          <CosmicButton
            title={t('daily.ask')}
            icon="chat"
            onPress={() => navigation.navigate('Chat' as any)}
            disabled={!insight}
            style={{ marginTop: spacing.lg }}
          />
          <CosmicButton
            title={saved ? t('daily.savedAck') : t('daily.save')}
            icon={saved ? 'check' : 'star'}
            variant="glass"
            loading={saving}
            disabled={!insight || saved}
            onPress={onSave}
            style={{ marginTop: spacing.sm }}
          />
          <CosmicButton
            title={t('daily.share')}
            icon="arrow-up"
            variant="glass"
            disabled={!insight}
            onPress={onShare}
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
  zodiacWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
    height: 220,
    justifyContent: 'center',
  },
  zodiacGlyph: {
    position: 'absolute',
    alignItems: 'center',
  },
  glyph: {
    fontSize: 56,
    color: colors.goldBright,
    textShadowColor: colors.goldPrimary,
    textShadowRadius: 12,
  },
  zodiacName: {
    ...typography.section,
    color: colors.white,
    marginTop: 4,
    fontSize: 16,
  },
  mainCard: {
    marginTop: spacing.md,
  },
  headline: {
    ...typography.section,
    color: colors.goldBright,
    fontSize: 20,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
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
});
