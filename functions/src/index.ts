import Anthropic from '@anthropic-ai/sdk';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

if (!admin.apps.length) admin.initializeApp();

/**
 * Anthropic key as a Cloud Functions secret. Set with:
 *   firebase functions:secrets:set ANTHROPIC_API_KEY
 *
 * Never commit the value. The secret is decrypted into the function process
 * at cold start, never returned to clients.
 */
const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
/** Used by the transcribeAudio function (OpenAI Whisper). Optional —
 * if absent, the voice button on the client falls back to mock transcription. */
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');
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
  return cleaned.slice(-20);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(Math.max(n, lo), hi);
}

function validatePayload(raw: unknown): {
  message: string;
  systemPrompt: string;
  history: ChatMessage[];
  model: string;
  maxTokens: number;
} {
  const data = (raw ?? {}) as Payload;
  const message = (data.message ?? '').toString().trim();
  if (!message) throw new Error('Message is required.');
  if (message.length > 4000) throw new Error('Message is too long.');
  return {
    message,
    systemPrompt: (data.systemPrompt ?? '').toString().slice(0, 8000),
    history: sanitizeHistory(data.history),
    model: ALLOWED_MODELS.has(data.model ?? '') ? data.model! : DEFAULT_MODEL,
    maxTokens: clamp(data.maxTokens ?? 512, 64, 1024),
  };
}

/* -------------------------------------------------------------------------- */
/* Non-streaming callable — kept for clients that don't speak SSE.            */
/* -------------------------------------------------------------------------- */

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

    let parsed;
    try {
      parsed = validatePayload(request.data);
    } catch (err) {
      throw new HttpsError('invalid-argument', (err as Error).message);
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

    try {
      const response = await client.messages.create({
        model: parsed.model,
        max_tokens: parsed.maxTokens,
        system: parsed.systemPrompt || undefined,
        messages: [...parsed.history, { role: 'user', content: parsed.message }],
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

/* -------------------------------------------------------------------------- */
/* Streaming HTTP endpoint — Server-Sent Events.                              */
/*                                                                            */
/* Why HTTP instead of callable: firebase-functions v6 supports streaming    */
/* callable, but the client SDK at firebase ^10.14 doesn't yet expose the    */
/* matching `httpsCallable.stream()`. SSE-over-HTTP works in every browser,  */
/* in Node, and (with `react-native-sse`) in React Native — so the client    */
/* picks this path whenever it can.                                           */
/*                                                                            */
/* Auth: the client passes a Firebase ID token in the `Authorization` header.*/
/* CORS is on so a future web build can hit the same endpoint.                */
/* -------------------------------------------------------------------------- */

export const astrologerChatStream = onRequest(
  {
    secrets: [ANTHROPIC_API_KEY],
    timeoutSeconds: 120,
    memory: '256MiB',
    cors: true,
  },
  async (req, res): Promise<void> => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;
    if (!token) {
      res.status(401).json({ error: 'Missing bearer token' });
      return;
    }

    try {
      await admin.auth().verifyIdToken(token);
    } catch {
      res.status(401).json({ error: 'Invalid auth token' });
      return;
    }

    let parsed;
    try {
      parsed = validatePayload(req.body);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable any proxy buffering
    res.flushHeaders?.();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

    try {
      const stream = client.messages.stream({
        model: parsed.model,
        max_tokens: parsed.maxTokens,
        system: parsed.systemPrompt || undefined,
        messages: [...parsed.history, { role: 'user', content: parsed.message }],
      });

      let fullText = '';
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          fullText += event.delta.text;
          send('delta', { text: event.delta.text });
        }
      }

      const final = await stream.finalMessage();
      send('done', {
        reply: fullText,
        usage: {
          input: final.usage.input_tokens,
          output: final.usage.output_tokens,
        },
      });
    } catch (err) {
      const e = err as { status?: number; message?: string };
      send('error', {
        code: e.status === 429 ? 'rate_limited' : 'internal',
        message:
          e.status === 429
            ? 'The stars are busy. Try again shortly.'
            : e.message ?? 'Chat stream failed',
      });
    } finally {
      res.end();
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Voice transcription — Whisper proxy.                                       */
/*                                                                            */
/* Client uploads a base64-encoded audio blob; we forward to OpenAI's         */
/* whisper-1. Auth is required (Firebase ID token in `Authorization`).        */
/* The OpenAI key lives only in this function's secrets — never on device.    */
/* If the secret isn't set, the function returns a clear 503 so the client    */
/* can fall back to its mock transcription path.                              */
/* -------------------------------------------------------------------------- */

const ALLOWED_MIME = new Set([
  'audio/m4a',
  'audio/mp4',
  'audio/x-m4a',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
]);

const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // 8 MB raw

export const transcribeAudio = onRequest(
  {
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 60,
    memory: '512MiB',
    cors: true,
  },
  async (req, res): Promise<void> => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const auth = req.headers.authorization ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
    if (!token) {
      res.status(401).json({ error: 'Missing bearer token' });
      return;
    }
    try {
      await admin.auth().verifyIdToken(token);
    } catch {
      res.status(401).json({ error: 'Invalid auth token' });
      return;
    }

    const apiKey = OPENAI_API_KEY.value();
    if (!apiKey) {
      res.status(503).json({
        error:
          'Whisper API key is not configured. Set OPENAI_API_KEY via `firebase functions:secrets:set`.',
      });
      return;
    }

    const body = (req.body ?? {}) as {
      audioBase64?: string;
      mimeType?: string;
      filename?: string;
      language?: string;
    };

    const mimeType = body.mimeType ?? 'audio/m4a';
    if (!ALLOWED_MIME.has(mimeType)) {
      res.status(400).json({ error: `Unsupported mime type: ${mimeType}` });
      return;
    }
    if (!body.audioBase64) {
      res.status(400).json({ error: 'Missing audioBase64' });
      return;
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(body.audioBase64, 'base64');
    } catch {
      res.status(400).json({ error: 'Invalid base64 payload' });
      return;
    }
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_AUDIO_BYTES) {
      res.status(400).json({
        error: `Audio must be 1 byte to ${MAX_AUDIO_BYTES} bytes (got ${buffer.byteLength}).`,
      });
      return;
    }

    try {
      const client = new OpenAI({ apiKey });
      const file = await toFile(buffer, body.filename ?? `audio.${extFor(mimeType)}`, {
        type: mimeType,
      });
      const transcription = await client.audio.transcriptions.create({
        model: 'whisper-1',
        file,
        language: body.language || 'en',
        response_format: 'json',
      });
      res.json({ text: transcription.text });
    } catch (err) {
      const e = err as { status?: number; message?: string };
      if (e.status === 429) {
        res.status(429).json({ error: 'Whisper is rate-limited. Try again shortly.' });
        return;
      }
      res.status(500).json({ error: e.message ?? 'Transcription failed' });
    }
  },
);

function extFor(mime: string): string {
  if (mime.includes('m4a') || mime.includes('mp4')) return 'm4a';
  if (mime.includes('mp3') || mime.includes('mpeg')) return 'mp3';
  if (mime.includes('wav')) return 'wav';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  return 'bin';
}
