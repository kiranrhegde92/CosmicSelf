import React, { useMemo } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
import { computeNatalChart, ZODIAC_GLYPHS } from '../services/astroEngine';
import { partnerRepository } from '../services/partnerRepository';
import {
  partnerToBirthInput,
  useOnboardingStore,
  type Partner,
} from '../store/onboardingStore';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { fonts } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

export default function PartnersListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const partners = useOnboardingStore((s) => s.partners);
  const activePartnerId = useOnboardingStore((s) => s.activePartnerId);
  const setActivePartnerId = useOnboardingStore((s) => s.setActivePartnerId);
  const removePartner = useOnboardingStore((s) => s.removePartner);

  const onAdd = () => navigation.navigate('EditPartner', {});

  const onSelect = (id: string) => {
    setActivePartnerId(id);
    navigation.goBack();
  };

  const onLongPress = (p: Partner) => {
    Alert.alert(p.name || t('partners.fallbackName'), t('partners.actionsBody'), [
      {
        text: t('partners.edit'),
        onPress: () => navigation.navigate('EditPartner', { id: p.id }),
      },
      {
        text: t('partners.remove'),
        style: 'destructive',
        onPress: () => {
          removePartner(p.id);
          partnerRepository.remove(p.id);
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title={t('partners.title')}
          subtitle={t('partners.subtitle')}
          showBack
          onBack={() => navigation.goBack()}
          rightIcon="plus"
          rightLabel={t('partners.addPartner')}
          onRightPress={onAdd}
        />
        {partners.length === 0 ? (
          <Empty onAdd={onAdd} />
        ) : (
          <FlatList
            data={partners}
            keyExtractor={(p) => p.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <PartnerRow
                partner={item}
                active={item.id === activePartnerId}
                onPress={() => onSelect(item.id)}
                onLongPress={() => onLongPress(item)}
              />
            )}
          />
        )}
      </SafeAreaView>
    </CosmicBackground>
  );
}

function PartnerRow({
  partner,
  active,
  onPress,
  onLongPress,
}: {
  partner: Partner;
  active: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { t } = useTranslation();
  const glyph = useMemo(() => {
    try {
      const chart = computeNatalChart(partnerToBirthInput(partner));
      return ZODIAC_GLYPHS[chart.sun.sign] ?? '✦';
    } catch {
      return '✦';
    }
  }, [partner]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      accessibilityLabel={t('partners.selectPartner', { name: partner.name })}
    >
      <GlassCard style={styles.card}>
        <View style={styles.row}>
          <View style={styles.glyphWrap}>
            <Text style={styles.glyph}>{glyph}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {partner.name || t('partners.fallbackName')}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {partner.birthDate}
            </Text>
          </View>
          <View
            style={[styles.radio, active && styles.radioActive]}
            accessibilityLabel={active ? t('partners.activePartner') : t('partners.tapToSetActive')}
          >
            {active && <View style={styles.radioDot} />}
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

function Empty({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <CosmicIcon name="heart" color={colors.goldPrimary} size={28} />
      </View>
      <Text style={styles.emptyTitle}>{t('partners.emptyTitle')}</Text>
      <Text style={styles.emptyBody}>{t('partners.emptyBody')}</Text>
      <CosmicButton
        title={t('partners.addPartner')}
        icon="plus"
        onPress={onAdd}
        style={{ marginTop: spacing.lg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  card: {
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  glyphWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.45)',
  },
  glyph: {
    fontSize: 28,
    color: colors.goldBright,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.white,
    fontFamily: fonts.bodySemibold,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.4,
    borderColor: 'rgba(246,200,95,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.goldPrimary,
    backgroundColor: 'rgba(246,200,95,0.15)',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.goldPrimary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1.4,
    borderColor: 'rgba(246,200,95,0.5)',
  },
  emptyTitle: {
    ...typography.section,
    color: colors.white,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
