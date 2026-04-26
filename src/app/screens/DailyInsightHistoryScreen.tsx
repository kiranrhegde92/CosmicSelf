import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
import DailyInsightCard from '../components/astrology/DailyInsightCard';
import {
  getBirthInputFromStore,
  useOnboardingStore,
} from '../store/onboardingStore';
import {
  DailyInsight,
  synthesizeDailyInsight,
} from '../services/dailyInsightEngine';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

type Row = { date: Date; insight: DailyInsight; label: string };

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function labelFor(d: Date, offset: number): string {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Yesterday';
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

/**
 * Decision: rows expand inline (single chosen row at a time) rather than
 * navigating to a per-day detail screen — keeps the history one tap away
 * and avoids a second nav layer for what's already a chronological list.
 */
export default function DailyInsightHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const birthInput = useOnboardingStore((s) => getBirthInputFromStore(s));
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const rows = useMemo<Row[] | null>(() => {
    if (!birthInput) return null;
    const today = new Date();
    const out: Row[] = [];
    for (let n = 0; n < 14; n += 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - n);
      const insight = synthesizeDailyInsight(birthInput, day);
      out.push({ date: day, insight, label: labelFor(day, n) });
    }
    return out;
  }, [birthInput]);

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="Insight History"
          subtitle="Your last 14 days, retraced"
          showBack
          onBack={() => navigation.goBack()}
        />
        {!birthInput || !rows ? (
          <View style={styles.center}>
            <View style={styles.iconCircle}>
              <CosmicIcon name="calendar" color={colors.goldPrimary} size={26} />
            </View>
            <Text style={styles.emptyTitle}>Add your birth details to see your history</Text>
            <Text style={styles.emptyBody}>
              We synthesize each day's reading from your natal chart. Add your details and the past two weeks light up here.
            </Text>
            <CosmicButton
              title="Add birth details"
              variant="outline"
              onPress={() => navigation.navigate('EditBirthDetails')}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {rows.map((row) => {
              const key = row.date.toISOString().slice(0, 10);
              const expanded = expandedKey === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setExpandedKey(expanded ? null : key)}
                  accessibilityLabel={`${row.label} insight`}
                >
                  <GlassCard style={styles.card}>
                    <View style={styles.headRow}>
                      <View style={styles.glyphWrap}>
                        <Text style={styles.glyph}>{row.insight.zodiacGlyph}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dateLabel}>{row.label}</Text>
                        <Text style={styles.headline} numberOfLines={1}>
                          {row.insight.headline}
                        </Text>
                      </View>
                      <CosmicIcon
                        name={expanded ? 'chevron-down' : 'chevron-right'}
                        color={colors.textMuted}
                        size={16}
                      />
                    </View>
                    {expanded && (
                      <View style={styles.expanded}>
                        <Text style={styles.body}>{row.insight.body}</Text>
                        <View style={styles.grid}>
                          {row.insight.sections.map((s) => (
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
                      </View>
                    )}
                  </GlassCard>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenH,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1.4,
    borderColor: 'rgba(246,200,95,0.5)',
  },
  emptyTitle: {
    ...typography.section,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    marginVertical: 6,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  glyphWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.4)',
  },
  glyph: {
    fontSize: 22,
    color: colors.goldBright,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  headline: {
    ...typography.bodyStrong,
    color: colors.white,
  },
  expanded: {
    marginTop: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: 'space-between',
  },
  cell: {
    width: '48.5%',
  },
});
