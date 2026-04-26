import React, { useEffect, useRef, useState } from 'react';
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
import Skeleton, { SkeletonParagraph } from '../components/ui/Skeleton';
import { astrologyService } from '../services/astrologyService';
import { aiChatService, type StreamHandle } from '../services/aiChatService';
import { synthesizeCompatibility, type CompatibilityReport } from '../services/compatibilityEngine';
import {
  getActivePartner,
  getBirthInputFromStore,
  partnerToBirthInput,
  useOnboardingStore,
} from '../store/onboardingStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

const SYSTEM_PROMPT =
  "You are a senior synastry astrologer writing a thoughtful, personalized compatibility report. " +
  "Use plain language. Avoid clichés. Quote the specific aspects you're given. Format the response in three short sections " +
  "with markdown-style headings (##): 'The Pull', 'The Friction', and 'The Long Game'. Each section is 2-3 sentences. " +
  "Never claim to be an AI. Never give medical / legal / financial advice.";

function buildUserMessage(report: CompatibilityReport): string {
  const aspects = report.topAspects
    .map(
      (a, i) =>
        `${i + 1}. ${a.bodyA} ${a.aspect} ${a.bodyB} (orb ${a.orb.toFixed(1)}°, signed strength ${a.signedStrength.toFixed(2)})`,
    )
    .join('\n');
  return [
    `Synastry score: ${report.score}/100 (${report.label}).`,
    `Partner A: ${report.partnerA.label}, Sun in ${report.partnerA.sign}.`,
    `Partner B: ${report.partnerB.label}, Sun in ${report.partnerB.sign}.`,
    `Top aspects:\n${aspects || '(none in tight orb)'}`,
    'Write the deep report now, in three short sections.',
  ].join('\n');
}

export default function FullReportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const userBirth = useOnboardingStore((s) => getBirthInputFromStore(s));
  const partner = useOnboardingStore((s) => getActivePartner(s));

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<StreamHandle | null>(null);

  useEffect(() => {
    if (!userBirth || !partner) {
      setError(t('fullReport.errorMissing'));
      setLoading(false);
      return;
    }

    const partnerBirth = partnerToBirthInput(partner);
    const report = synthesizeCompatibility(
      userBirth,
      partnerBirth,
      'You',
      partner.name || 'Them',
    );

    let active = true;
    let started = false;

    (async () => {
      streamRef.current?.cancel();
      streamRef.current = await aiChatService.streamSend(
        buildUserMessage(report),
        {
          history: [],
          // We bypass per-astrologer flavor here — the report needs a
          // neutral, technical voice.
        },
        {
          onDelta: (chunk) => {
            if (!active) return;
            if (!started) {
              started = true;
              setLoading(false);
            }
            setText((prev) => prev + chunk);
          },
          onDone: (final) => {
            if (!active) return;
            setLoading(false);
            setText(final);
          },
          onError: (msg) => {
            if (!active) return;
            setLoading(false);
            setError(msg);
          },
        },
      );
    })();

    return () => {
      active = false;
      streamRef.current?.cancel();
    };
    // We deliberately depend only on the stable identities; userBirth /
    // partner re-derive from the store and would re-fire endlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner?.name, partner?.birthDate, userBirth?.isoLocal]);

  const onAskAstrologer = () => navigation.navigate('Chat' as any);

  // Astrology background isn't needed for a long-form text screen;
  // keep the cosmic gradient but ditch particles.
  return (
    <CosmicBackground intensity="low" showParticles={false}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title={t('fullReport.title')}
          subtitle={partner?.name ? t('fullReport.subtitlePair', { name: partner.name }) : t('fullReport.subtitleDefault')}
          showBack
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard>
            {error ? (
              <View style={styles.errorWrap}>
                <CosmicIcon name="info" color={colors.error} size={20} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : loading && !text ? (
              <View style={{ gap: spacing.sm }}>
                <Skeleton variant="line" width="60%" height={18} />
                <SkeletonParagraph lines={3} />
                <View style={{ height: spacing.md }} />
                <Skeleton variant="line" width="55%" height={18} />
                <SkeletonParagraph lines={3} />
                <View style={{ height: spacing.md }} />
                <Skeleton variant="line" width="65%" height={18} />
                <SkeletonParagraph lines={3} />
              </View>
            ) : (
              <RenderedReport text={text} />
            )}
          </GlassCard>

          {!loading && !error && (
            <CosmicButton
              title={t('fullReport.askCta')}
              icon="chat"
              onPress={onAskAstrologer}
              style={{ marginTop: spacing.lg }}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

/** Tiny markdown-ish renderer: lines that start with `##` become headings. */
function RenderedReport({ text }: { text: string }) {
  const blocks: { kind: 'heading' | 'para'; content: string }[] = [];
  let buffer: string[] = [];
  const flush = () => {
    if (buffer.length === 0) return;
    blocks.push({ kind: 'para', content: buffer.join(' ').trim() });
    buffer = [];
  };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith('## ')) {
      flush();
      blocks.push({ kind: 'heading', content: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith('# ')) {
      flush();
      blocks.push({ kind: 'heading', content: line.slice(2).trim() });
      continue;
    }
    buffer.push(line);
  }
  flush();

  return (
    <View style={{ gap: spacing.sm }}>
      {blocks.map((b, i) =>
        b.kind === 'heading' ? (
          <Text key={i} style={styles.heading}>
            {b.content}
          </Text>
        ) : (
          <Text key={i} style={styles.para}>
            {b.content}
          </Text>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.xl,
  },
  heading: {
    ...typography.section,
    color: colors.goldBright,
    fontSize: 18,
    marginTop: spacing.sm,
  },
  para: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    flex: 1,
  },
});
