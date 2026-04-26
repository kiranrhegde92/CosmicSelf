import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ZodiacWheel from '../components/cosmic/ZodiacWheel';
import AstrologerAvatar from '../components/astrologer/AstrologerAvatar';
import AuraRing from '../components/cosmic/AuraRing';
import GlassCard from '../components/ui/GlassCard';
import CosmicIcon from '../components/ui/CosmicIcon';
import Paywall from '../components/ui/Paywall';
import { ASTROLOGERS } from '../data/astrologers';
import { useOnboardingStore } from '../store/onboardingStore';
import { usePremium } from '../store/usePremium';
import { haptics } from '../services/hapticsService';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography, fonts } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

const STATES = [
  'Listening to your aura',
  'Analyzing your energy',
  'Insight is forming',
  'Speaking the wisdom',
];

export default function VideoCallScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const astrologerId = useOnboardingStore((s) => s.selectedAstrologerId) ?? 'veda';
  const astrologer = ASTROLOGERS.find((a) => a.id === astrologerId)!;
  const premium = usePremium();

  const [muted, setMuted] = useState(false);
  const [video, setVideo] = useState(true);
  const [stateIdx, setStateIdx] = useState(0);

  const isPremium = premium.isPremium;
  const showPaywall = premium.showPaywall;
  useFocusEffect(
    useCallback(() => {
      if (!isPremium) showPaywall();
    }, [isPremium, showPaywall]),
  );

  // Pause the cycling status labels while the user has muted themselves —
  // it would feel weird for the astrologer to keep "listening" when you're
  // not talking. Resume from where we left off when un-muted.
  useEffect(() => {
    if (muted) return;
    const t = setInterval(() => {
      setStateIdx((i) => (i + 1) % STATES.length);
    }, 3500);
    return () => clearInterval(t);
  }, [muted]);

  const onToggleMic = () => {
    haptics.tap();
    setMuted((m) => !m);
  };

  const onToggleVideo = () => {
    haptics.tap();
    setVideo((v) => !v);
  };

  const onEndCall = () => {
    Alert.alert(
      'End the session?',
      "Your astrologer will stop reading your energy. You can come back anytime.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: () => {
            haptics.thump();
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <CosmicBackground variant="chamber" intensity="medium">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.iconChip}
          >
            <CosmicIcon name="arrow-left" color={colors.white} size={18} />
          </Pressable>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.headerName}>{astrologer.name}</Text>
            <View style={styles.statusRow}>
              <View style={styles.dotOnline} />
              <Text style={styles.connected}>Connected to Cosmos</Text>
            </View>
          </View>
          <Pressable style={styles.iconChip}>
            <CosmicIcon name="info" color={colors.white} size={18} />
          </Pressable>
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.tagsRow}>
            <SideTag icon="orbit" label="Zodiac Wheel" value="Active" />
            <SideTag icon="sparkle" label="Cosmic Energy" value="Balanced" align="right" />
          </View>

          <View style={styles.avatarStack}>
            <View style={StyleSheet.absoluteFillObject as any} pointerEvents="none">
              <View style={styles.wheelCenter}>
                <ZodiacWheel size={300} rotateSpeed={45000} intensity="high" />
              </View>
            </View>
            <AuraRing size={250} active={!muted} intensity={muted ? 'soft' : 'strong'} />
            <View style={[styles.avatarFrame, !video && styles.avatarFrameOff]}>
              <AstrologerAvatar visualKey={astrologer.visualKey} size={210} />
              {!video && (
                <View style={styles.cameraOffOverlay}>
                  <CosmicIcon name="video-off" color={colors.goldBright} size={22} />
                  <Text style={styles.cameraOffLabel}>Camera paused</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.tagsRowBottom}>
            <SideTag icon="moon" label="Planetary Flow" value="Favorable" />
            <SideTag icon="sun" label="Intuition Level" value="High" align="right" />
          </View>
        </View>

        <GlassCard style={styles.statusCard}>
          <View style={styles.statusInner}>
            <View style={styles.audioWaveWrap}>
              <CosmicIcon
                name={muted ? 'mic-off' : 'sparkle'}
                color={muted ? colors.textMuted : colors.goldBright}
                size={18}
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.statusTitle}>
                {muted ? 'You\'re muted' : `${STATES[stateIdx]}…`}
              </Text>
              <Text style={styles.statusSub}>
                {muted ? 'Tap the mic to resume' : 'Reading your cosmic patterns'}
              </Text>
            </View>
            {!muted && <AudioWave />}
          </View>
        </GlassCard>

        <View style={styles.controls}>
          <CallButton
            icon={video ? 'video' : 'video-off'}
            label={video ? 'Camera On' : 'Camera Off'}
            onPress={onToggleVideo}
            active={video}
          />
          <CallButton
            icon="phone-end"
            danger
            big
            label="End Call"
            onPress={onEndCall}
          />
          <CallButton
            icon={muted ? 'mic-off' : 'mic'}
            label={muted ? 'Muted' : 'Live'}
            onPress={onToggleMic}
            active={!muted}
          />
        </View>

        <View style={styles.askBarWrap}>
          <Pressable style={styles.askBar} onPress={() => navigation.navigate('Chat' as any)}>
            <LinearGradient
              colors={['rgba(58,27,109,0.6)', 'rgba(20,18,41,0.85)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.askPlaceholder}>Ask anything...</Text>
            <View style={styles.askButton}>
              <CosmicIcon name="sparkle" color="#1A0F33" size={16} />
            </View>
          </Pressable>
        </View>

        <Paywall
          visible={premium.paywallVisible}
          onClose={() => {
            premium.hidePaywall();
            if (!premium.isPremium) navigation.goBack();
          }}
          feature="AI Video Call"
          bullets={[
            'Live video sessions with your astrologer',
            'Personalized voice + visual readings',
            'Unlimited weekly sessions on Cosmic Master',
          ]}
        />
      </SafeAreaView>
    </CosmicBackground>
  );
}

function SideTag({
  icon,
  label,
  value,
  align = 'left',
}: {
  icon: import('../components/ui/CosmicIcon').IconName;
  label: string;
  value: string;
  align?: 'left' | 'right';
}) {
  return (
    <View
      style={[
        styles.sideTag,
        { alignItems: align === 'left' ? 'flex-start' : 'flex-end' },
      ]}
    >
      <View style={styles.sideTagIcon}>
        <CosmicIcon name={icon} color={colors.goldPrimary} size={14} />
      </View>
      <Text style={styles.sideTagLabel}>{label}</Text>
      <Text style={styles.sideTagValue}>{value}</Text>
    </View>
  );
}

function CallButton({
  icon,
  label,
  onPress,
  big,
  danger,
  active,
}: {
  icon: import('../components/ui/CosmicIcon').IconName;
  label: string;
  onPress: () => void;
  big?: boolean;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Pressable
        onPress={onPress}
        style={[
          styles.callBtn,
          big && styles.callBtnBig,
          danger && styles.callBtnDanger,
          !big && active && styles.callBtnActive,
        ]}
        accessibilityLabel={label}
      >
        <CosmicIcon
          name={icon}
          size={big ? 26 : 22}
          color={danger ? colors.white : active ? colors.goldBright : colors.white}
        />
      </Pressable>
      <Text style={styles.callLabel}>{label}</Text>
    </View>
  );
}

function AudioWave() {
  return (
    <View style={styles.wave}>
      {Array.from({ length: 14 }).map((_, i) => (
        <Bar key={i} delay={i * 80} />
      ))}
    </View>
  );
}

function Bar({ delay }: { delay: number }) {
  const h = useSharedValue(6);
  useEffect(() => {
    const t = setTimeout(() => {
      h.value = withRepeat(
        withSequence(
          withTiming(18 + Math.random() * 10, { duration: 380, easing: Easing.out(Easing.quad) }),
          withTiming(6, { duration: 380 }),
        ),
        -1,
      );
    }, delay);
    return () => clearTimeout(t);
  }, [delay, h]);

  const s = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[styles.bar, s]} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.sm,
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
  headerName: {
    ...typography.section,
    color: colors.goldBright,
    fontSize: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dotOnline: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  connected: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  heroWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenH,
  },
  tagsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginTop: -spacing.lg,
  },
  tagsRowBottom: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginTop: -spacing.lg,
  },
  sideTag: {
    width: 100,
    paddingHorizontal: 6,
  },
  sideTagIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(20,18,41,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sideTagLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'left',
  },
  sideTagValue: {
    ...typography.caption,
    color: colors.goldBright,
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
  },
  avatarStack: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFrame: {
    borderRadius: 200,
    borderWidth: 2,
    borderColor: colors.goldPrimary,
    overflow: 'hidden',
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.6,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarFrameOff: {
    opacity: 0.45,
    borderColor: colors.textMuted,
    shadowOpacity: 0.15,
  },
  cameraOffOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(8,8,23,0.5)',
  },
  cameraOffLabel: {
    ...typography.caption,
    color: colors.goldBright,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  statusCard: {
    marginHorizontal: spacing.screenH,
    marginTop: spacing.md,
  },
  statusInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioWaveWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,200,95,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.45)',
  },
  statusTitle: {
    ...typography.bodyStrong,
    color: colors.white,
    fontSize: 14,
  },
  statusSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 28,
    width: 90,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.goldBright,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  callBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,18,41,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.35)',
  },
  callBtnActive: {
    borderColor: colors.goldBright,
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  callBtnBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  callBtnDanger: {
    backgroundColor: '#D63B3B',
    borderColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  callLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  askBarWrap: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
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
  },
  askPlaceholder: {
    flex: 1,
    color: colors.textSecondary,
    ...typography.body,
  },
  askButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
