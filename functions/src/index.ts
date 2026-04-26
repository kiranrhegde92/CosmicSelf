import Anthropic from '@anthropic-ai/sdk';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

/**
 * Anthropic key as a Cloud Functions secret. Set with:
 *   firebase functions:secrets:set ANTHROPIC_API_KEY
 *
 * Never commit the value. The secret is decrypted into the function process
 * at cold start, never returned to clients.
 */
const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const DEFAULT_MODEL = 'claude-haiku-4-5';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type Payload = {
  message: string;
  systemPrompt?: string;
  history?: ChatMessage[];
  model?: string;
  maxTokens?: number;
};

const ALLOWED_MODELS = new Set([
  'claude-haiku-4-5',
  'claude-sonnet-4-6',
  'claude-opus-4-7',
]);

function sanitizeHistory(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  const cleaned: ChatMessage[] = [];
  for (const m of input) {
    if (!m || typeof m !== 'object') continue;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if ((role === 'user' || role === 'assistant') && typeof content === 'string') {
      cleaned.push({ role, content: content.slice(0, 4000) });
    }
  }
  // Cap context length on the server too, regardless of what the client sent.
  return cleaned.slice(-20);
}

export const astrologerChat = onCall(
  {
    secrets: [ANTHROPIC_API_KEY],
    timeoutSeconds: 60,
    memory: '256MiB',
    enforceAppCheck: false,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in to chat with the stars.');
    }

    const data = (request.data ?? {}) as Payload;
    const message = (data.message ?? '').toString().trim();
    if (!message) {
      throw new HttpsError('invalid-argument', 'Message is required.');
    }
    if (message.length > 4000) {
      throw new HttpsError('invalid-argument', 'Message is too long.');
    }

    const model = ALLOWED_MODELS.has(data.model ?? '') ? data.model! : DEFAULT_MODEL;
    const maxTokens = Math.min(Math.max(data.maxTokens ?? 512, 64), 1024);
    const systemPrompt = (data.systemPrompt ?? '').toString().slice(0, 8000);
    const history = sanitizeHistory(data.history);

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt || undefined,
        messages: [
          ...history,
          { role: 'user', content: message },
        ],
      });

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();

      return {
        reply: text,
        usage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
      };
    } catch (err) {
      const e = err as { status?: number; message?: string };
      if (e.status === 429) {
        throw new HttpsError('resource-exhausted', 'The stars are busy. Try again shortly.');
      }
      throw new HttpsError('internal', e.message ?? 'Chat call failed');
    }
  },
);
