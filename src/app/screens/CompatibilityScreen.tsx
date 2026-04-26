import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import CompatibilityMeter from '../components/astrology/CompatibilityMeter';
import DailyInsightCard from '../components/astrology/DailyInsightCard';
import ZodiacWheel from '../components/cosmic/ZodiacWheel';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { compatibility } from '../data/mockInsights';
import { MainStackParamList } from '../navigation/routes';

export default function CompatibilityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <CosmicBackground intensity="medium">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="Cosmic Compatibility"
          subtitle="See how your energies align"
          showBack
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.duo}>
            <View style={styles.partner}>
              <View style={styles.wheelMini}>
                <ZodiacWheel size={120} rotateSpeed={90000} showSigns={false} intensity="low" />
                <Text style={styles.miniGlyph}>{compatibility.partnerA.glyph}</Text>
              </View>
              <Text style={styles.partnerName}>{compatibility.partnerA.label}</Text>
              <Text style={styles.partnerSign}>{compatibility.partnerA.sign}</Text>
            </View>

            <View style={styles.merge}>
              <Text style={styles.mergeText}>×</Text>
            </View>

            <View style={styles.partner}>
              <View style={styles.wheelMini}>
                <ZodiacWheel size={120} rotateSpeed={90000} showSigns={false} intensity="low" />
                <Text style={[styles.miniGlyph, { color: '#C4A7FF' }]}>
                  {compatibility.partnerB.glyph}
                </Text>
              </View>
              <Text style={styles.partnerName}>{compatibility.partnerB.label}</Text>
              <Text style={styles.partnerSign}>{compatibility.partnerB.sign}</Text>
            </View>
          </View>

          <View style={styles.meterWrap}>
            <CompatibilityMeter score={compatibility.score} label={compatibility.label} />
          </View>

          <View style={styles.grid}>
            {compatibility.cards.map((c) => (
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
            <Text style={styles.tipBody}>
              You ground each other in opposite ways. Cherish the differences — they are the
              poetry of this connection.
            </Text>
          </GlassCard>

          <CosmicButton
            title="View Full Report"
            icon="book"
            onPress={() => {}}
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
});
