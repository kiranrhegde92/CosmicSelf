import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import CosmicIcon from '../components/ui/CosmicIcon';
import AstrologerAvatar from '../components/astrologer/AstrologerAvatar';
import { ASTROLOGERS } from '../data/astrologers';
import { sampleMessages } from '../data/mockInsights';
import { useAuthStore } from '../store/authStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { aiChatService, ChatMessage, StreamHandle } from '../services/aiChatService';
import { analytics, Events } from '../services/analyticsService';
import { chatRepository } from '../services/chatRepository';
import { haptics } from '../services/hapticsService';
import { voiceService } from '../services/voiceService';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

type Message = { id: string; from: 'user' | 'ai'; text: string };

export default function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const astrologerId = useOnboardingStore((s) => s.selectedAstrologerId) ?? 'veda';
  const mode = useOnboardingStore((s) => s.mode);
  const astrologer = ASTROLOGERS.find((a) => a.id === astrologerId)!;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const listRef = useRef<FlatList<Message>>(null);
  const streamHandleRef = useRef<StreamHandle | null>(null);

  // Cancel any in-flight stream / recording when the screen unmounts.
  useEffect(() => {
    return () => {
      streamHandleRef.current?.cancel();
      voiceService.cancel().catch(() => {});
    };
  }, []);

  const onMicPress = async () => {
    if (voiceState === 'recording') {
      setVoiceState('transcribing');
      haptics.tap();
      try {
        const transcribed = await voiceService.stopAndTranscribe();
        if (transcribed) {
          setText((prev) => (prev.trim() ? `${prev.trim()} ${transcribed}` : transcribed));
        }
      } catch {
        // Errors land in the chat as a calm message rather than an alert.
        setMessages((m) => [
          ...m,
          {
            id: `verr-${Date.now()}`,
            from: 'ai',
            text: 'I couldn\'t hear that. Please try again.',
          },
        ]);
      } finally {
        setVoiceState('idle');
      }
      return;
    }
    if (voiceState !== 'idle') return;
    try {
      await voiceService.start();
      setVoiceState('recording');
      haptics.thump();
      analytics.track(Events.ChatVoiceUsed, { astrologer: astrologerId });
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `vmic-${Date.now()}`,
          from: 'ai',
          text: 'Voice input needs microphone access — enable it in Settings to speak with me.',
        },
      ]);
    }
  };

  const scrollDown = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(scrollDown, [messages.length, typing]);

  // Load persisted history per astrologer thread.
  useEffect(() => {
    let active = true;
    setHydrated(false);
    (async () => {
      const stored = await chatRepository.loadHistory(astrologerId);
      if (!active) return;
      if (stored && stored.length > 0) {
        setMessages(stored.map((m) => ({ id: m.id, from: m.from, text: m.text })));
      } else {
        // First time on this thread (or no Firestore configured): show seeded
        // sample exchange so the UI isn't empty.
        setMessages(sampleMessages);
      }
      setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, [astrologerId, isAuthenticated]);

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: `u-${Date.now()}`, from: 'user', text: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setText('');
    setTyping(true);

    chatRepository.appendMessage(astrologerId, { from: 'user', text: trimmed });
    analytics.track(Events.ChatMessageSent, {
      astrologer: astrologerId,
      mode,
      length: trimmed.length,
    });

    const history: ChatMessage[] = nextMessages.map((m) => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    // We don't render an empty AI bubble up front — typing dots cover the
    // wait. The bubble appears the moment the first delta arrives.
    const aiId = `a-${Date.now()}`;
    let started = false;

    streamHandleRef.current?.cancel();
    streamHandleRef.current = await aiChatService.streamSend(
      trimmed,
      { astrologerId, mode, history },
      {
        onDelta: (chunk) => {
          if (!started) {
            started = true;
            setTyping(false);
            setMessages((m) => [...m, { id: aiId, from: 'ai', text: chunk }]);
          } else {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === aiId ? { ...msg, text: msg.text + chunk } : msg,
              ),
            );
          }
        },
        onDone: (finalText) => {
          setTyping(false);
          setMessages((m) => {
            const exists = m.some((msg) => msg.id === aiId);
            if (exists) {
              return m.map((msg) =>
                msg.id === aiId ? { ...msg, text: finalText } : msg,
              );
            }
            // No deltas arrived (e.g. provider returned in one shot via mock).
            return [...m, { id: aiId, from: 'ai', text: finalText }];
          });
          chatRepository.appendMessage(astrologerId, {
            from: 'ai',
            text: finalText,
          });
          streamHandleRef.current = null;
        },
        onError: (errMessage) => {
          setTyping(false);
          setMessages((m) =>
            m
              .filter((msg) => msg.id !== aiId)
              .concat({
                id: `err-${Date.now()}`,
                from: 'ai',
                text: `The cosmos hiccupped: ${errMessage}`,
              }),
          );
          streamHandleRef.current = null;
        },
      },
    );
  };

  // Suppress the unused-variable lint for hydrated; reserved for the
  // upcoming "Loading conversation…" skeleton.
  void hydrated;

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.iconChip}
            accessibilityLabel="Back"
          >
            <CosmicIcon name="arrow-left" color={colors.white} size={18} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.headerAvatar}>
              <AstrologerAvatar visualKey={astrologer.visualKey} size={40} glow={false} />
            </View>
            <View>
              <Text style={styles.headerName}>{astrologer.name}</Text>
              <View style={styles.statusRow}>
                <View style={styles.dotOnline} />
                <Text style={styles.statusText}>Online</Text>
              </View>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate('VideoCall')}
            style={styles.iconChip}
            accessibilityLabel="Start video call"
          >
            <CosmicIcon name="video" color={colors.goldPrimary} size={18} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <Bubble msg={item} />}
            ListFooterComponent={typing ? <TypingBubble /> : null}
            onContentSizeChange={scrollDown}
          />

          <View style={styles.inputBar}>
            <View style={styles.inputWrap}>
              <CosmicIcon name="sparkle" color={colors.goldPrimary} size={16} />
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Ask anything..."
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                multiline
                onSubmitEditing={onSend}
              />
            </View>
            <Pressable
              style={[
                styles.iconBtn,
                voiceState === 'recording' && styles.iconBtnRecording,
              ]}
              accessibilityLabel={
                voiceState === 'recording' ? 'Stop recording' : 'Voice input'
              }
              onPress={onMicPress}
              disabled={voiceState === 'transcribing'}
            >
              <CosmicIcon
                name={voiceState === 'recording' ? 'mic-off' : 'mic'}
                color={
                  voiceState === 'recording'
                    ? '#FF6B6B'
                    : voiceState === 'transcribing'
                      ? colors.goldPrimary
                      : colors.textSecondary
                }
                size={20}
              />
            </Pressable>
            <Pressable style={styles.sendBtn} onPress={onSend} accessibilityLabel="Send">
              <LinearGradient
                colors={['#FFD98A', '#F6C85F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <CosmicIcon name="send" color="#1A0F33" size={18} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.from === 'user';
  return (
    <Animated.View entering={FadeInUp.duration(300)} style={[styles.bubbleRow, isUser && { justifyContent: 'flex-end' }]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAi,
        ]}
      >
        {!isUser && (
          <LinearGradient
            colors={['rgba(246,200,95,0.18)', 'rgba(58,27,109,0.5)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {isUser && (
          <LinearGradient
            colors={['#3A1B6D', '#251047']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        <Text style={[styles.bubbleText, isUser ? { color: colors.white } : { color: colors.white }]}>
          {msg.text}
        </Text>
      </View>
    </Animated.View>
  );
}

function TypingBubble() {
  return (
    <View style={styles.bubbleRow}>
      <View style={[styles.bubble, styles.bubbleAi, { paddingVertical: 14 }]}>
        <LinearGradient
          colors={['rgba(246,200,95,0.18)', 'rgba(58,27,109,0.5)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <Dot key={i} delay={i * 220} />
          ))}
        </View>
      </View>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) }),
        withTiming(0.3, { duration: 350 }),
      ),
      -1,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 350 }),
        withTiming(0.8, { duration: 350 }),
      ),
      -1,
    );
  }, [opacity, scale]);

  const s = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.goldBright,
        },
        s,
      ]}
    />
  );
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.sm,
    gap: spacing.sm,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: colors.goldPrimary,
  },
  headerName: {
    ...typography.bodyStrong,
    color: colors.white,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotOnline: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  list: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  bubbleAi: {
    borderColor: 'rgba(246,200,95,0.45)',
    borderBottomLeftRadius: 6,
  },
  bubbleUser: {
    borderColor: 'rgba(184,138,255,0.5)',
    borderBottomRightRadius: 6,
  },
  bubbleText: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(246,200,95,0.18)',
    backgroundColor: 'rgba(8,8,23,0.95)',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    minHeight: 46,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(20,18,41,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.25)',
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    paddingVertical: 8,
    maxHeight: 100,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,18,41,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.25)',
  },
  iconBtnRecording: {
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
