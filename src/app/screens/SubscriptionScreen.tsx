import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
import GlassCard from '../components/ui/GlassCard';
import ZodiacWheel from '../components/cosmic/ZodiacWheel';
import { SUBSCRIPTION_PLANS } from '../data/subscriptionPlans';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { paymentService } from '../services/paymentService';
import { MainStackParamList } from '../navigation/routes';

export default function SubscriptionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [selected, setSelected] = useState('pro');
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    setLoading(true);
    try {
      await paymentService.startCheckout(selected);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CosmicBackground intensity="medium" showZodiacWheel>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="Unlock Deeper Insights"
          subtitle="Choose a plan that aligns with your cosmic journey"
          showBack
          onBack={() => navigation.goBack()}
          rightLabel="Restore"
          rightIcon="orbit"
          onRightPress={async () => {
            await paymentService.restorePurchases();
          }}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroWheel}>
            <ZodiacWheel size={240} rotateSpeed={90000} intensity="medium" />
          </View>

          <View style={styles.plans}>
            {SUBSCRIPTION_PLANS.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={selected === p.id}
                onPress={() => setSelected(p.id)}
              />
            ))}
          </View>

          <GlassCard style={styles.secureCard}>
            <View style={styles.secureRow}>
              <CosmicIcon name="shield" color={colors.goldPrimary} size={16} />
              <Text style={styles.secureText}>Secure Payment</Text>
              <Text style={styles.secureDot}>·</Text>
              <Text style={styles.secureSub}>Cancel anytime. No hidden charges.</Text>
            </View>
          </GlassCard>

          <View style={styles.statsRow}>
            <Stat label="Trusted by" value="500K+" sub="Cosmic Seekers" icon="user" />
            <Stat label="App Store Rating" value="4.9/5" sub="★★★★★" icon="star-filled" />
          </View>

          <CosmicButton
            title={selected === 'free' ? 'Continue with Free' : 'Continue'}
            onPress={onContinue}
            loading={loading}
            style={{ marginTop: spacing.lg }}
          />

          <View style={styles.legalRow}>
            <Text style={styles.legalText}>Terms of Use</Text>
            <Text style={styles.legalDot}>·</Text>
            <Text style={styles.legalText}>Privacy Policy</Text>
            <Text style={styles.legalDot}>·</Text>
            <Text style={styles.legalText}>Restore Purchases</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

function PlanCard({
  plan,
  selected,
  onPress,
}: {
  plan: typeof SUBSCRIPTION_PLANS[number];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.planCard, selected && styles.planCardSelected]}>
      {plan.recommended && (
        <View style={styles.popular}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      <LinearGradient
        colors={
          selected
            ? ['rgba(246,200,95,0.2)', 'rgba(20,18,41,0.95)']
            : ['rgba(20,18,41,0.85)', 'rgba(8,8,23,0.95)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.iconCircle}>
        <CosmicIcon
          name={plan.iconKey === 'free' ? 'moon' : plan.iconKey === 'pro' ? 'sparkle' : 'crown'}
          color={colors.goldBright}
          size={18}
        />
      </View>
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planTagline}>{plan.tagline}</Text>
      <Text style={styles.planPrice}>
        {plan.price}
        <Text style={styles.cadence}> /month</Text>
      </Text>
      <Text style={styles.cadenceMeta}>{plan.cadence}</Text>
      <View style={styles.featureList}>
        {plan.features.slice(0, 6).map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <View
              style={[
                styles.featureDot,
                { backgroundColor: f.included ? colors.goldPrimary : 'rgba(255,255,255,0.15)' },
              ]}
            >
              {f.included && <CosmicIcon name="check" color="#1A0F33" size={9} strokeWidth={3} />}
            </View>
            <Text
              style={[
                styles.featureText,
                !f.included && { color: colors.textMuted, textDecorationLine: 'line-through' },
              ]}
              numberOfLines={1}
            >
              {f.label}
            </Text>
          </View>
        ))}
      </View>
      <View style={[styles.cta, selected && styles.ctaSelected]}>
        <Text
          style={[
            styles.ctaText,
            selected && { color: '#1A0F33' },
          ]}
        >
          {plan.ctaLabel}
        </Text>
      </View>
    </Pressable>
  );
}

function Stat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: import('../components/ui/CosmicIcon').IconName;
}) {
  return (
    <GlassCard padding={spacing.md} style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <CosmicIcon name={icon} color={colors.goldPrimary} size={14} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.xl,
  },
  heroWheel: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  plans: {
    flexDirection: 'row',
    gap: 10,
  },
  planCard: {
    flex: 1,
    borderRadius: radii.xl,
    borderWidth: 1.2,
    borderColor: 'rgba(246,200,95,0.18)',
    overflow: 'hidden',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  planCardSelected: {
    borderColor: colors.goldPrimary,
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  popular: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    backgroundColor: colors.goldPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    zIndex: 5,
  },
  popularText: {
    ...typography.pill,
    fontSize: 9,
    color: '#1A0F33',
    letterSpacing: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.4)',
    backgroundColor: 'rgba(246,200,95,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  planName: {
    ...typography.section,
    color: colors.white,
    fontSize: 16,
    marginTop: spacing.xs,
  },
  planTagline: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  planPrice: {
    ...typography.title,
    fontSize: 22,
    color: colors.goldBright,
    marginTop: spacing.sm,
  },
  cadence: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cadenceMeta: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  featureList: {
    marginTop: spacing.md,
    width: '100%',
    gap: 6,
    paddingHorizontal: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 11,
    flexShrink: 1,
  },
  cta: {
    marginTop: spacing.md,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.45)',
    width: '100%',
    alignItems: 'center',
  },
  ctaSelected: {
    backgroundColor: colors.goldPrimary,
    borderColor: colors.goldBright,
  },
  ctaText: {
    ...typography.pill,
    color: colors.goldBright,
    fontSize: 12,
  },
  secureCard: {
    marginTop: spacing.lg,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  secureText: {
    ...typography.bodyStrong,
    color: colors.goldBright,
  },
  secureSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  secureDot: {
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  statValue: {
    ...typography.section,
    color: colors.goldBright,
    fontSize: 18,
    marginTop: 4,
  },
  statSub: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  legalText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  legalDot: {
    color: colors.textMuted,
  },
});
