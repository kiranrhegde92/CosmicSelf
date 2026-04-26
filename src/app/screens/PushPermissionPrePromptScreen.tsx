import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
import { notificationsService } from '../services/notificationsService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

export default function PushPermissionPrePromptScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const [enabling, setEnabling] = useState(false);

  const onEnable = async () => {
    if (enabling) return;
    setEnabling(true);
    try {
      await notificationsService.scheduleDailyHoroscope();
    } finally {
      setEnabling(false);
      navigation.goBack();
    }
  };

  return (
    <CosmicBackground intensity="medium">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title={t('pushPrePrompt.title')}
          showBack
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bellWrap}>
            <View style={styles.bellCircle}>
              <CosmicIcon name="bell" color={colors.goldPrimary} size={36} />
            </View>
          </View>

          <GlassCard style={styles.card}>
            <Text style={styles.headline}>{t('pushPrePrompt.headline')}</Text>
            <Text style={styles.body}>{t('pushPrePrompt.lead')}</Text>
            <Text style={[styles.body, { marginTop: spacing.sm }]}>{t('pushPrePrompt.body')}</Text>
          </GlassCard>

          <CosmicButton
            title={t('pushPrePrompt.enable')}
            icon="bell"
            onPress={onEnable}
            loading={enabling}
            style={{ marginTop: spacing.lg }}
          />
          <CosmicButton
            title={t('pushPrePrompt.later')}
            variant="glass"
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.sm }}
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
  bellWrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  bellCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1.4,
    borderColor: 'rgba(246,200,95,0.5)',
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
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
    textAlign: 'center',
  },
});
