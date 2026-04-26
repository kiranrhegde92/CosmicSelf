import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import GlassCard from './GlassCard';
import CosmicIcon from './CosmicIcon';
import CosmicButton from './CosmicButton';
import { analytics, Events } from '../../services/analyticsService';
import { haptics } from '../../services/hapticsService';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MainStackParamList } from '../../navigation/routes';

type Props = {
  visible: boolean;
  onClose: () => void;
  feature?: string;
  bullets?: string[];
};

export default function Paywall({
  visible,
  onClose,
  feature,
  bullets,
}: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const resolvedBullets = bullets ?? [
    t('paywall.default.bullet1'),
    t('paywall.default.bullet2'),
    t('paywall.default.bullet3'),
    t('paywall.default.bullet4'),
  ];

  React.useEffect(() => {
    if (visible) {
      analytics.track(Events.PaywallShown, { feature: feature ?? 'general' });
      haptics.warning();
    }
  }, [visible, feature]);

  const onUpgrade = () => {
    onClose();
    navigation.navigate('Subscription');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.cardWrap} onPress={() => undefined /* swallow */}>
          <GlassCard borderGlow style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('paywall.close')}
              hitSlop={10}
              onPress={onClose}
              style={styles.close}
            >
              <CosmicIcon name="close" color={colors.textMuted} size={18} />
            </Pressable>

            <View style={styles.crownWrap}>
              <LinearGradient
                colors={['#FFD98A', '#F6C85F', '#B98A3A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <CosmicIcon name="crown" color="#1A0F33" size={26} />
            </View>

            <Text style={styles.kicker}>{t('paywall.kicker')}</Text>
            <Text style={styles.title}>
              {feature ? t('paywall.titleFeature', { feature }) : t('paywall.titleDefault')}
            </Text>
            <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>

            <View style={styles.bulletList}>
              {resolvedBullets.map((b) => (
                <View key={b} style={styles.bulletRow}>
                  <View style={styles.bulletDot}>
                    <CosmicIcon
                      name="check"
                      color="#1A0F33"
                      size={11}
                      strokeWidth={3}
                    />
                  </View>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>

            <CosmicButton title={t('paywall.cta')} iconRight="arrow-right" onPress={onUpgrade} />
            <Pressable onPress={onClose} style={styles.notNow} accessibilityRole="button" accessibilityLabel={t('paywall.later')}>
              <Text style={styles.notNowText}>{t('paywall.later')}</Text>
            </Pressable>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,8,23,0.78)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  close: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  crownWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  kicker: {
    ...typography.label,
    color: colors.goldPrimary,
    marginTop: spacing.md,
  },
  title: {
    ...typography.section,
    color: colors.white,
    fontSize: 22,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  bulletList: {
    width: '100%',
    gap: 10,
    marginBottom: spacing.lg,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bulletDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldPrimary,
  },
  bulletText: {
    ...typography.body,
    color: colors.white,
    flex: 1,
    fontSize: 14,
  },
  notNow: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  notNowText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
