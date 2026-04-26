import Anthropic from '@anthropic-ai/sdk';

import { env, features } from '../config/env';
import { ASTROLOGERS } from '../data/astrologers';
import { computeNatalChart, ZODIAC_GLYPHS } from './astroEngine';
import {
  getBirthInputFromStore,
  useOnboardingStore,
} from '../store/onboardingStore';

/*
 * SECURITY NOTE
 * -------------
 * Calling the Anthropic API directly from the app embeds the key in the bundle.
 * That's fine for prototyping, but BEFORE A PUBLIC RELEASE move this call to a
 * tiny backend proxy:
 *
 *   1. Stand up an endpoint (Cloudflare Worker / Vercel / Supabase Edge Fn) that
 *      keeps ANTHROPIC_API_KEY in its env, and forwards { astrologerId, mode,
 *      messages } to /v1/messages.
 *   2. Replace the SDK call below with a fetch to that endpoint, authenticated
 *      with the user's Supabase JWT.
 *
 * Until then, the key is read from EXPO_PUBLIC_ANTHROPIC_API_KEY and the chat
 * service falls back to a curated mock if the key isn't configured.
 */

let client: Anthropic | null = null;

function getClient() {
  if (!features.liveChat) return null;
  if (!client) {
    client = new Anthropic({
      apiKey: env.anthropic.apiKey,
      // RN runtimes set window/navigator and the SDK refuses to run otherwise.
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
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

  // Personalize with the user's chart if available.
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

async function liveSend(
  message: string,
  history: ChatMessage[],
  astrologerId?: string,
  mode?: 'serious' | 'fun',
): Promise<string> {
  const a = getClient();
  if (!a) throw new Error('Live chat is not configured');

  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    ...history.slice(-10),
    { role: 'user', content: message },
  ];

  const response = await a.messages.create({
    model: env.anthropic.model || 'claude-haiku-4-5',
    max_tokens: 512,
    system: buildSystemPrompt(astrologerId, mode),
    messages,
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
  isLive: features.liveChat,

  async send(
    message: string,
    options: {
      astrologerId?: string;
      mode?: 'serious' | 'fun';
      history?: ChatMessage[];
    } = {},
  ): Promise<string> {
    if (features.liveChat) {
      try {
        return await liveSend(message, options.history ?? [], options.astrologerId, options.mode);
      } catch (e) {
        // Surface a graceful fallback rather than a bare error message in the UI.
        return mockSend(options.astrologerId);
      }
    }
    return mockSend(options.astrologerId);
  },
};
