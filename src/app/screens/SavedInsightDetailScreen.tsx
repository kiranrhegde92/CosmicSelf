import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
import {
  SavedInsight,
  savedInsightsRepository,
} from '../services/savedInsightsRepository';
import { useAppStore } from '../store/appStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

type DetailRoute = RouteProp<MainStackParamList, 'SavedInsightDetail'>;

export default function SavedInsightDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const route = useRoute<DetailRoute>();
  const { id } = route.params;

  const [insight, setInsight] = useState<SavedInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await savedInsightsRepository.list();
    const found = list.find((it) => it.id === id) ?? null;
    setInsight(found);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onAskAstrologer = () => {
    if (!insight) return;
    useAppStore
      .getState()
      .setPendingChatPrompt(t('savedInsights.detail.askPrompt', { headline: insight.headline }));
    navigation.navigate('Chat' as any);
  };

  const onDelete = () => {
    if (!insight) return;
    Alert.alert(
      t('savedInsights.removeTitle'),
      t('savedInsights.removeBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('savedInsights.deleteCta'),
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const ok = await savedInsightsRepository.remove(insight.id);
            setDeleting(false);
            if (ok) navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title={t('savedInsights.detail.title')}
          subtitle={insight?.zodiac ?? undefined}
          showBack
          onBack={() => navigation.goBack()}
        />
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.goldPrimary} />
          </View>
        ) : !insight ? (
          <View style={styles.center}>
            <GlassCard style={styles.emptyCard}>
              <View style={styles.iconCircle}>
                <CosmicIcon name="info" color={colors.goldPrimary} size={24} />
              </View>
              <Text style={styles.emptyTitle}>{t('savedInsights.detail.missingTitle')}</Text>
              <Text style={styles.emptyBody}>{t('savedInsights.detail.missingBody')}</Text>
            </GlassCard>
            <CosmicButton
              title={t('savedInsights.detail.back')}
              variant="glass"
              onPress={() => navigation.goBack()}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.kicker}>{insight.date}</Text>
            <View style={styles.glyphWrap}>
              <Text style={styles.glyph}>{insight.zodiacGlyph}</Text>
            </View>
            <GlassCard style={styles.card}>
              <Text style={styles.headline}>{insight.headline}</Text>
              <Text style={styles.body}>{insight.body}</Text>
            </GlassCard>

            <CosmicButton
              title={t('savedInsights.detail.ask')}
              icon="chat"
              onPress={onAskAstrologer}
              style={{ marginTop: spacing.lg }}
            />
            <CosmicButton
              title={t('savedInsights.detail.remove')}
              icon="close"
              variant="danger"
              loading={deleting}
              onPress={onDelete}
              style={{ marginTop: spacing.sm }}
            />
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
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenH,
  },
  kicker: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  glyphWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  glyph: {
    fontSize: 56,
    color: colors.goldBright,
    textShadowColor: colors.goldPrimary,
    textShadowRadius: 12,
  },
  card: {
    marginTop: spacing.sm,
  },
  headline: {
    ...typography.section,
    color: colors.goldBright,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  emptyCard: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1.4,
    borderColor: 'rgba(246,200,95,0.5)',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.section,
    color: colors.white,
    textAlign: 'center',
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 22,
  },
});
