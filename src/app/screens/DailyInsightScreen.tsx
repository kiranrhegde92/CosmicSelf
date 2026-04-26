import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import DailyInsightCard from '../components/astrology/DailyInsightCard';
import ZodiacWheel from '../components/cosmic/ZodiacWheel';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { dailyInsight as mockDailyInsight } from '../data/mockInsights';
import { astrologyService } from '../services/astrologyService';
import { MainStackParamList } from '../navigation/routes';

export default function DailyInsightScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [insight, setInsight] = useState(mockDailyInsight);

  useEffect(() => {
    let active = true;
    astrologyService.getDailyInsight().then((d) => {
      if (active) setInsight(d);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <CosmicBackground intensity="medium">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Today's Cosmic Insight" subtitle={insight.date} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.zodiacWrap}>
            <ZodiacWheel size={200} rotateSpeed={70000} />
            <View style={styles.zodiacGlyph}>
              <Text style={styles.glyph}>{insight.zodiacGlyph}</Text>
              <Text style={styles.zodiacName}>{insight.zodiac}</Text>
            </View>
          </View>

          <GlassCard style={styles.mainCard}>
            <Text style={styles.headline}>{insight.headline}</Text>
            <Text style={styles.body}>{insight.body}</Text>
          </GlassCard>

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

          <CosmicButton
            title="Ask Astrologer About Today"
            icon="chat"
            onPress={() => navigation.navigate('Chat' as any)}
            style={{ marginTop: spacing.lg }}
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
