import Anthropic from '@anthropic-ai/sdk';
import { httpsCallable } from 'firebase/functions';

import { env, features } from '../config/env';
import { ASTROLOGERS } from '../data/astrologers';
import { computeNatalChart, ZODIAC_GLYPHS } from './astroEngine';
import { getFns } from './firebaseClient';
import { withRetry } from './retry';
import {
  getBirthInputFromStore,
  useOnboardingStore,
} from '../store/onboardingStore';

/*
 * Chat service has three modes, picked at runtime in this order:
 *
 *   1. PRODUCTION — call the `astrologerChat` Cloud Function. The
 *      ANTHROPIC_API_KEY is held server-side as a Functions secret.
 *      Active when EXPO_PUBLIC_FIREBASE_* + EXPO_PUBLIC_FIREBASE_PROJECT_ID
 *      are set AND no EXPO_PUBLIC_ANTHROPIC_API_KEY is present.
 *
 *   2. DIRECT (DEV ONLY) — call Anthropic directly using a key in the
 *      bundle. Convenient when iterating without redeploying Functions.
 *      Active when EXPO_PUBLIC_ANTHROPIC_API_KEY is set; logs a warning.
 *
 *   3. MOCK — neither configured. Returns curated replies so the UI
 *      keeps working in plain Expo Go without any backend.
 */

let directClient: Anthropic | null = null;

function getDirectClient() {
  if (!features.liveChatDirect) return null;
  if (!directClient) {
    directClient = new Anthropic({
      apiKey: env.anthropic.apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return directClient;
}

const FALLBACK_REPLIES = [
  'The stars are listening. Let me consult the cosmic wheel...',
  'Mars and Venus are weaving a path for you. Trust your timing.',
  'The moon suggests rest before action. Pause for two breaths.',
  'Your seventh house is illuminated. A meaningful conversation is near.',
  'Saturn rewards patience. Hold steady — the gate opens within seven days.',
];

function moodPrefix(astrologerId?: string) {
  if (astrologerId === 'aria') return 'Ooh, the cards are spilling — ';
  if (astrologerId === 'orion') return 'Synthesizing... ';
  return '';
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

function buildSystemPrompt(astrologerId?: string, mode?: 'serious' | 'fun') {
  const a = ASTROLOGERS.find((x) => x.id === astrologerId) ?? ASTROLOGERS[0];

  const tone =
    mode === 'fun'
      ? 'Keep replies light, witty, and under 80 words. A touch of playful banter is welcome.'
      : 'Keep replies grounded, precise, and under 100 words. Lean traditional and reflective.';

  const state = useOnboardingStore.getState();
  const input = getBirthInputFromStore(state);
  let chartSummary = '';
  if (input) {
    try {
      const chart = computeNatalChart(input);
      chartSummary = `User's natal placements: Sun in ${chart.sun.sign} ${ZODIAC_GLYPHS[chart.sun.sign] ?? ''}, Moon in ${chart.moon.sign}, ${chart.ascendant.sign} Rising, dominant planet ${chart.dominant.name}. Use these where relevant; do not invent new placements.`;
    } catch {
      chartSummary = '';
    }
  }

  return [
    `You are ${a.name}, an astrologer in the CosmicSelf app. Specialty: ${a.specialty}. Personality: ${a.personalityTag}.`,
    a.greeting,
    tone,
    chartSummary,
    'Never claim to be an AI. Never produce medical, legal, or financial advice. If asked to predict death, harm, or dates of disasters, decline gracefully and pivot to gentle reflection.',
  ]
    .filter(Boolean)
    .join(' ');
}

type CallableInput = {
  message: string;
  systemPrompt: string;
  history: ChatMessage[];
  model?: string;
  maxTokens?: number;
};

type CallableOutput = {
  reply: string;
  usage?: { input: number; output: number };
};

async function sendViaFunctions(
  message: string,
  history: ChatMessage[],
  systemPrompt: string,
): Promise<string> {
  const fns = getFns();
  if (!fns) throw new Error('Firebase Functions client unavailable');
  const callable = httpsCallable<CallableInput, CallableOutput>(fns, 'astrologerChat');
  const res = await withRetry(() =>
    callable({
      message,
      systemPrompt,
      history: history.slice(-10),
      model: env.anthropic.model,
      maxTokens: 512,
    }),
  );
  return res.data.reply || FALLBACK_REPLIES[0];
}

async function sendDirect(
  message: string,
  history: ChatMessage[],
  systemPrompt: string,
): Promise<string> {
  const a = getDirectClient();
  if (!a) throw new Error('Direct Anthropic client unavailable');
  const response = await a.messages.create({
    model: env.anthropic.model || 'claude-haiku-4-5',
    max_tokens: 512,
    system: systemPrompt,
    messages: [...history.slice(-10), { role: 'user', content: message }],
  });
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  return text || FALLBACK_REPLIES[0];
}

async function mockSend(astrologerId?: string): Promise<string> {
  await new Promise((res) => setTimeout(res, 700 + Math.random() * 700));
  const idx = Math.floor(Math.random() * FALLBACK_REPLIES.length);
  return `${moodPrefix(astrologerId)}${FALLBACK_REPLIES[idx]}`;
}

export const aiChatService = {
  /** "live" means a real model is reachable through *some* path. */
  isLive: features.liveChatViaFunctions || features.liveChatDirect,

  async send(
    message: string,
    options: {
      astrologerId?: string;
      mode?: 'serious' | 'fun';
      history?: ChatMessage[];
    } = {},
  ): Promise<string> {
    const systemPrompt = buildSystemPrompt(options.astrologerId, options.mode);
    const history = options.history ?? [];

    // Prefer the Functions-backed path: server-side key, signed-in user,
    // shared rate-limiting, etc. Direct mode is a dev shortcut.
    if (features.liveChatViaFunctions) {
      try {
        return await sendViaFunctions(message, history, systemPrompt);
      } catch (e) {
        // If Functions isn't deployed yet but a direct key is available, fall
        // through to that path; otherwise serve a graceful mock reply.
        if (features.liveChatDirect) {
          try {
            return await sendDirect(message, history, systemPrompt);
          } catch {
            return mockSend(options.astrologerId);
          }
        }
        return mockSend(options.astrologerId);
      }
    }

    if (features.liveChatDirect) {
      try {
        return await sendDirect(message, history, systemPrompt);
      } catch {
        return mockSend(options.astrologerId);
      }
    }

    return mockSend(options.astrologerId);
  },
};
