import React, { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicIcon, { IconName } from '../components/ui/CosmicIcon';
import Paywall from '../components/ui/Paywall';
import AstrologerAvatar from '../components/astrologer/AstrologerAvatar';
import AuraRing from '../components/cosmic/AuraRing';
import { ASTROLOGERS } from '../data/astrologers';
import { useAppStore } from '../store/appStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { useAuthStore } from '../store/authStore';
import { usePremium } from '../store/usePremium';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography, fonts } from '../theme/typography';
import { homeQuickActions } from '../data/mockInsights';
import { MainStackParamList } from '../navigation/routes';

// Quick-action keys that require Pro+ to access. Free users tapping
// these get the paywall instead of the destination.
const PREMIUM_KEYS = new Set(['video', 'compatibility']);

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const astrologerId = useOnboardingStore((s) => s.selectedAstrologerId) ?? 'veda';
  const astrologer = ASTROLOGERS.find((a) => a.id === astrologerId)!;
  const premium = usePremium();

  const greeting = getGreeting();

  const onAction = (key: string) => {
    if (PREMIUM_KEYS.has(key) && !premium.isPremium) {
      premium.showPaywall();
      return;
    }
    routeFromKey(key, navigation);
  };

  return (
    <CosmicBackground intensity="high" showZodiacWheel>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconChip}
            accessibilityLabel="Open menu"
          >
            <CosmicIcon name="menu" color={colors.white} size={18} />
          </Pressable>
          <View style={styles.welcome}>
            <Text style={styles.welcomeKicker}>Welcome to your</Text>
            <Text style={styles.welcomeTitle}>Astrologer's Chamber</Text>
            <View style={styles.welcomeOrnament}>
              <View style={styles.orLine} />
              <Text style={styles.welcomeSub}>Ask. Discover. Align.</Text>
              <View style={styles.orLine} />
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Subscription')}
            style={styles.iconChip}
            accessibilityLabel={
              premium.isPremium ? 'You have premium' : 'Upgrade to premium'
            }
          >
            <CosmicIcon
              name={premium.isMaster ? 'crown' : premium.isPremium ? 'star-filled' : 'sparkle'}
              color={colors.goldBright}
              size={16}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.greetCard}>
            <Text style={styles.greetText}>
              {greeting}, {user?.name || 'Seeker'}
            </Text>
            <Text style={styles.greetSub}>Your stars are aligned today</Text>
          </View>

          <View style={styles.heroWrap}>
            <View style={styles.heroAvatar}>
              <AuraRing size={210} active />
              <AstrologerAvatar visualKey={astrologer.visualKey} size={184} />
            </View>
            <Text style={styles.astrologerName}>{astrologer.name}</Text>
            <Text style={styles.astrologerRole}>{astrologer.specialty}</Text>
          </View>

          <View style={styles.actionsGrid}>
            {homeQuickActions.map((a, idx) => (
              <FloatingAction
                key={a.key}
                index={idx}
                icon={a.icon}
                label={a.label}
                description={a.description}
                tone={a.tone}
                locked={PREMIUM_KEYS.has(a.key) && !premium.isPremium}
                onPress={() => onAction(a.key)}
              />
            ))}
          </View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>

        <AskBar
          onSubmit={(prompt) => {
            const trimmed = prompt.trim();
            if (trimmed) useAppStore.getState().setPendingChatPrompt(trimmed);
            navigation.navigate('Chat' as any);
          }}
        />

        <Paywall
          visible={premium.paywallVisible}
          onClose={premium.hidePaywall}
        />
      </SafeAreaView>
    </CosmicBackground>
  );
}

function routeFromKey(key: string, nav: NativeStackNavigationProp<MainStackParamList>) {
  switch (key) {
    case 'chat':
      return nav.navigate('Chat' as any);
    case 'video':
      return nav.navigate('VideoCall');
    case 'chart':
      return nav.navigate('BirthChart' as any);
    case 'daily':
      return nav.navigate('DailyInsight' as any);
    case 'compatibility':
      return nav.navigate('Compatibility');
    default:
      return;
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function FloatingAction({
  index,
  icon,
  label,
  description,
  tone,
  locked,
  onPress,
}: {
  index: number;
  icon: IconName;
  label: string;
  description: string;
  tone: 'gold' | 'rose' | 'mint' | 'blue' | 'purple';
  locked?: boolean;
  onPress: () => void;
}) {
  const y = useSharedValue(0);

  useEffect(() => {
    const delay = index * 200;
    const t = setTimeout(() => {
      y.value = withRepeat(
        withTiming(-6, { duration: 2200 + index * 200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }, delay);
    return () => clearTimeout(t);
  }, [index, y]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  const tint = tintColor(tone);

  return (
    <Animated.View style={[styles.actionCell, animated]}>
      <Pressable
        onPress={onPress}
        accessibilityLabel={locked ? `${label} — premium` : label}
      >
        <View style={[styles.actionWrap, { borderColor: `${tint}66`, shadowColor: tint }]}>
          <LinearGradient
            colors={[`${tint}33`, 'rgba(20,18,41,0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <CosmicIcon name={icon} color={tint} size={22} />
          {locked && (
            <View style={styles.lockBadge}>
              <CosmicIcon name="lock" color="#1A0F33" size={10} strokeWidth={2.5} />
            </View>
          )}
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionDesc} numberOfLines={1}>{description}</Text>
      </Pressable>
    </Animated.View>
  );
}

function tintColor(t: 'gold' | 'rose' | 'mint' | 'blue' | 'purple') {
  switch (t) {
    case 'rose':
      return '#FFAFD7';
    case 'mint':
      return '#9DEDCB';
    case 'blue':
      return '#9AC8FF';
    case 'purple':
      return '#C4A7FF';
    default:
      return colors.goldPrimary;
  }
}

function AskBar({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = React.useState('');

  const submit = () => {
    onSubmit(value);
    setValue('');
  };

  return (
    <View style={styles.askBarWrap}>
      <View style={styles.askBar}>
        <LinearGradient
          colors={['rgba(58,27,109,0.6)', 'rgba(20,18,41,0.85)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Ask the stars..."
          placeholderTextColor={colors.textSecondary}
          style={styles.askInput}
          returnKeyType="send"
          blurOnSubmit
          onSubmitEditing={submit}
        />
        <Pressable
          onPress={submit}
          accessibilityLabel="Send to chat"
          style={styles.askButton}
        >
          <CosmicIcon name="sparkle" color="#1A0F33" size={16} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,18,41,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.25)',
  },
  welcome: {
    flex: 1,
    alignItems: 'center',
  },
  welcomeKicker: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 1.4,
  },
  welcomeTitle: {
    ...typography.titleSm,
    color: colors.goldBright,
    fontSize: 22,
    textAlign: 'center',
  },
  welcomeOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  orLine: {
    width: 22,
    height: 1,
    backgroundColor: 'rgba(246,200,95,0.4)',
  },
  welcomeSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  scroll: {
    paddingBottom: 110,
    paddingHorizontal: spacing.screenH,
  },
  greetCard: {
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  greetText: {
    ...typography.section,
    color: colors.white,
    fontSize: 18,
  },
  greetSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heroWrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  heroAvatar: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  astrologerName: {
    ...typography.section,
    color: colors.goldBright,
    marginTop: spacing.md,
  },
  astrologerRole: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
    rowGap: spacing.md,
    justifyContent: 'space-between',
  },
  actionCell: {
    width: '31%',
    alignItems: 'center',
  },
  actionWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    borderWidth: 1.2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  lockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...typography.caption,
    color: colors.white,
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.bodySemibold,
    textAlign: 'center',
  },
  actionDesc: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  askBarWrap: {
    position: 'absolute',
    left: spacing.screenH,
    right: spacing.screenH,
    bottom: 90,
  },
  askBar: {
    height: 56,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.5)',
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  askPlaceholder: {
    flex: 1,
    color: colors.textSecondary,
    ...typography.body,
  },
  askInput: {
    flex: 1,
    color: colors.white,
    ...typography.body,
    paddingVertical: 0,
    fontSize: 15,
  },
  askButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
