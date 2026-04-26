import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import BirthChartPreview from '../components/astrology/BirthChartPreview';
import CosmicIcon, { IconName } from '../components/ui/CosmicIcon';
import { birthChart } from '../data/mockInsights';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

const items: {
  key: keyof typeof birthChart;
  icon: IconName;
  title: string;
}[] = [
  { key: 'sun', icon: 'sun', title: 'Sun Sign' },
  { key: 'moon', icon: 'moon', title: 'Moon Sign' },
  { key: 'ascendant', icon: 'arrow-up', title: 'Ascendant' },
  { key: 'dominant', icon: 'star', title: 'Dominant Planet' },
];

export default function BirthChartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <CosmicBackground intensity="low" showZodiacWheel>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="My Cosmic Chart"
          subtitle="Your planetary blueprint"
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.chartWrap}>
            <BirthChartPreview size={300} />
          </View>

          <View style={styles.grid}>
            {items.map((it) => {
              const data = birthChart[it.key];
              return (
                <View key={it.key} style={styles.cell}>
                  <GlassCard padding={spacing.md} style={{ flex: 1 }}>
                    <View style={styles.cardHead}>
                      <View style={styles.iconWrap}>
                        <CosmicIcon name={it.icon} color={colors.goldPrimary} size={16} />
                      </View>
                      <Text style={styles.cardTitle}>{it.title}</Text>
                    </View>
                    <Text style={styles.cardValue}>{data.name}</Text>
                    <Text style={styles.cardDetail}>{data.detail}</Text>
                  </GlassCard>
                </View>
              );
            })}
          </View>

          <CosmicButton
            title="Ask AI to Explain My Chart"
            icon="sparkle"
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
  chartWrap: {
    alignItems: 'center',
    marginVertical: spacing.md,
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
    fontWeight: '600',
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
