import Anthropic from '@anthropic-ai/sdk';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

import {
  notificationBlurbFor,
  synthesizeDailyInsight,
} from './lib/dailyInsightEngine';
import type { BirthInput } from './lib/astroEngine';
import type { ExpoPushMessage } from 'expo-server-sdk';

import {
  type ChatMessage,
  validateChatPayload,
} from './lib/validate';
import {
  type Tier,
  isOverCap,
  normalizeTier,
  quotaErrorMessage,
} from './lib/quota';
import { ALLOWED_AUDIO_MIME, MAX_AUDIO_BYTES, extForMime } from './lib/mime';
import { isValidExpoToken, sendExpoPush } from './lib/expoPush';
import { currentLocalHour } from './lib/timeWindow';

setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

if (!admin.apps.length) admin.initializeApp();

/**
 * App Check enforcement is gated on `process.env.ENFORCE_APP_CHECK === 'true'`.
 * Set it via:
 *   firebase functions:config:set appcheck.enforce=true
 * (then redeploy) — or use Cloud Run env in v2.
 *
 * Off by default so dev/staging without an attestation provider still works.
 * Turn on for production once the client ships RNFB App Check tokens.
 */
const ENFORCE_APP_CHECK = process.env.ENFORCE_APP_CHECK === 'true';

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

/* -------------------------------------------------------------------------- */
/* Token usage logging.                                                       */
/*                                                                            */
/* Writes one rolling document per user per day at:                           */
/*   users/{uid}/usage/{YYYY-MM-DD}                                           */
/* with monotonically incremented counters. We can later sum these per user   */
/* (cost attribution), per day (rate trend), or roll into BigQuery for       */
/* dashboards. Failure here is non-fatal — we still return the chat reply.    */
/* -------------------------------------------------------------------------- */

type UsageDelta = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
  model: string;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Tier quotas.                                                               */
/*                                                                            */
/* Daily chat-call caps by tier. Read with `getDailyCap(tier)`.               */
/*                                                                            */
/* Tier source today: users/{uid}/profile/entitlement.tier (the client writes */
/* this when entitlement changes). When RevenueCat lands, swap to a Custom    */
/* Auth Claim set by the RC webhook so the tier is signed into the ID token  */
/* and clients can't lie. Until then this is best-effort — Firestore Rules    */
/* still scope every write to the owning user, so the worst case is a user   */
/* over-claiming their own tier.                                              */
/* -------------------------------------------------------------------------- */

async function getTier(uid: string): Promise<Tier> {
  try {
    const snap = await admin
      .firestore()
      .doc(`users/${uid}/profile/entitlement`)
      .get();
    return normalizeTier(snap.data()?.tier);
  } catch {
    return 'free';
  }
}

async function getTodayChatCalls(uid: string): Promise<number> {
  try {
    const snap = await admin
      .firestore()
      .doc(`users/${uid}/usage/${todayKey()}`)
      .get();
    return Number(snap.data()?.chatCalls ?? 0);
  } catch {
    return 0;
  }
}

async function enforceQuota(uid: string): Promise<void> {
  const [tier, used] = await Promise.all([getTier(uid), getTodayChatCalls(uid)]);
  if (isOverCap(tier, used)) {
    throw new HttpsError('resource-exhausted', quotaErrorMessage(tier));
  }
}

/**
 * App Check verification for onRequest endpoints. v2 onCall handles this
 * automatically via the `enforceAppCheck` field; for raw HTTP we have to
 * verify the `X-Firebase-AppCheck` header ourselves. Returns true on pass,
 * false (and writes a 401 response) on fail. No-op when enforcement is off.
 */
async function verifyAppCheckOrReject(
  req: { headers: Record<string, string | string[] | undefined> },
  res: { status: (n: number) => { json: (b: unknown) => void } },
): Promise<boolean> {
  if (!ENFORCE_APP_CHECK) return true;
  const header = req.headers['x-firebase-appcheck'];
  const token = Array.isArray(header) ? header[0] : header;
  if (!token) {
    res.status(401).json({ error: 'Missing App Check token' });
    return false;
  }
  try {
    await admin.appCheck().verifyToken(token);
    return true;
  } catch {
    res.status(401).json({ error: 'Invalid App Check token' });
    return false;
  }
}

async function logUsage(uid: string, delta: UsageDelta): Promise<void> {
  try {
    const db = admin.firestore();
    const ref = db.doc(`users/${uid}/usage/${todayKey()}`);
    await ref.set(
      {
        date: todayKey(),
        chatCalls: admin.firestore.FieldValue.increment(1),
        inputTokens: admin.firestore.FieldValue.increment(delta.inputTokens),
        outputTokens: admin.firestore.FieldValue.increment(delta.outputTokens),
        cacheReadTokens: admin.firestore.FieldValue.increment(delta.cacheReadTokens ?? 0),
        cacheCreationTokens: admin.firestore.FieldValue.increment(
          delta.cacheCreationTokens ?? 0,
        ),
        lastModel: delta.model,
        lastAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    // Logging is best-effort; never fail the chat because of it.
    console.warn('logUsage failed', { uid, err });
  }
}

/* -------------------------------------------------------------------------- */
/* Prompt caching.                                                            */
/*                                                                            */
/* Anthropic returns a 90% input-token discount for cached blocks. We mark    */
/* the system prompt as cacheable (the largest stable block per astrologer)   */
/* and, when the history is long enough to be worth caching, we stamp a       */
/* cache_control on the last assistant turn so the chat continuation reuses   */
/* the prior context cheaply. Without explicit markers, the SDK only marks    */
/* tools — not what we want here.                                             */
/* -------------------------------------------------------------------------- */

function buildSystemBlocks(systemPrompt: string): Anthropic.TextBlockParam[] | undefined {
  if (!systemPrompt) return undefined;
  return [
    {
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' },
    },
  ];
}

const HISTORY_CACHE_MIN_TURNS = 4;

function buildMessages(
  history: ChatMessage[],
  message: string,
): Anthropic.MessageParam[] {
  const out: Anthropic.MessageParam[] = history.map((m, idx) => {
    const isLast = idx === history.length - 1;
    if (isLast && history.length >= HISTORY_CACHE_MIN_TURNS) {
      return {
        role: m.role,
        content: [
          {
            type: 'text',
            text: m.content,
            cache_control: { type: 'ephemeral' },
          },
        ],
      };
    }
    return { role: m.role, content: m.content };
  });
  out.push({ role: 'user', content: message });
  return out;
}

function validatePayload(raw: unknown): {
  message: string;
  systemPrompt: string;
  history: ChatMessage[];
  model: string;
  maxTokens: number;
} {
  return validateChatPayload(raw);
}

/* -------------------------------------------------------------------------- */
/* Non-streaming callable — kept for clients that don't speak SSE.            */
/* -------------------------------------------------------------------------- */

export const astrologerChat = onCall(
  {
    secrets: [ANTHROPIC_API_KEY],
    timeoutSeconds: 60,
    memory: '256MiB',
    enforceAppCheck: ENFORCE_APP_CHECK,
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
    const uid = request.auth.uid;

    await enforceQuota(uid);

    try {
      const response = await client.messages.create({
        model: parsed.model,
        max_tokens: parsed.maxTokens,
        system: buildSystemBlocks(parsed.systemPrompt),
        messages: buildMessages(parsed.history, parsed.message),
      });

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();

      const usage = response.usage as Anthropic.Usage & {
        cache_read_input_tokens?: number | null;
        cache_creation_input_tokens?: number | null;
      };

      await logUsage(uid, {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        cacheReadTokens: usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
        model: parsed.model,
      });

      return {
        reply: text,
        usage: {
          input: usage.input_tokens,
          output: usage.output_tokens,
          cacheRead: usage.cache_read_input_tokens ?? 0,
          cacheCreation: usage.cache_creation_input_tokens ?? 0,
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

    if (!(await verifyAppCheckOrReject(req, res))) return;

    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;
    if (!token) {
      res.status(401).json({ error: 'Missing bearer token' });
      return;
    }

    let uid: string;
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      uid = decoded.uid;
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

    try {
      await enforceQuota(uid);
    } catch (err) {
      const e = err as HttpsError & { code?: string };
      // Pre-stream quota errors are returned as JSON so the client doesn't
      // have to parse SSE just to learn it's rate-limited.
      res.status(429).json({
        error: e.message ?? 'Daily limit reached.',
        code: 'rate_limited',
      });
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
        system: buildSystemBlocks(parsed.systemPrompt),
        messages: buildMessages(parsed.history, parsed.message),
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
      const usage = final.usage as Anthropic.Usage & {
        cache_read_input_tokens?: number | null;
        cache_creation_input_tokens?: number | null;
      };
      await logUsage(uid, {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        cacheReadTokens: usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
        model: parsed.model,
      });
      send('done', {
        reply: fullText,
        usage: {
          input: usage.input_tokens,
          output: usage.output_tokens,
          cacheRead: usage.cache_read_input_tokens ?? 0,
          cacheCreation: usage.cache_creation_input_tokens ?? 0,
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

    if (!(await verifyAppCheckOrReject(req, res))) return;

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
    if (!ALLOWED_AUDIO_MIME.has(mimeType)) {
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
      const file = await toFile(buffer, body.filename ?? `audio.${extForMime(mimeType)}`, {
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


/* -------------------------------------------------------------------------- */
/* Account deletion — GDPR / App Store compliance.                            */
/*                                                                            */
/* Removes everything tied to the signed-in user, in this order:              */
/*   1. Storage: users/{uid}/* (avatar + anything we add later)               */
/*   2. Firestore: users/{uid} subtree (recursive)                            */
/*   3. Auth: Firebase Auth user record                                       */
/*                                                                            */
/* Steps run sequentially so a failure mid-flight leaves the Auth user        */
/* intact — they can sign in and retry. Storage + Firestore failures are      */
/* logged and surfaced; an Auth deletion failure rolls forward (data is gone, */
/* user can request deletion again from a fresh session).                     */
/* -------------------------------------------------------------------------- */

async function deleteUserStorage(uid: string): Promise<void> {
  const bucket = admin.storage().bucket();
  await bucket.deleteFiles({ prefix: `users/${uid}/` });
}

async function deleteUserFirestore(uid: string): Promise<void> {
  const db = admin.firestore();
  // recursiveDelete handles all subcollections (threads, savedInsights,
  // partners, profile, etc.) without us enumerating them by hand.
  await db.recursiveDelete(db.doc(`users/${uid}`));
}

export const deleteAccount = onCall(
  {
    timeoutSeconds: 120,
    memory: '256MiB',
    enforceAppCheck: ENFORCE_APP_CHECK,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in to delete your account.');
    }
    const uid = request.auth.uid;

    try {
      await deleteUserStorage(uid);
    } catch (err) {
      console.error('deleteAccount: storage cleanup failed', { uid, err });
      throw new HttpsError('internal', 'Could not clear stored files. Try again.');
    }

    try {
      await deleteUserFirestore(uid);
    } catch (err) {
      console.error('deleteAccount: firestore cleanup failed', { uid, err });
      throw new HttpsError('internal', 'Could not clear your data. Try again.');
    }

    try {
      await admin.auth().deleteUser(uid);
    } catch (err) {
      // Data is gone — log and let the client treat this as success-with-warning.
      console.error('deleteAccount: auth deletion failed (data was removed)', { uid, err });
      return { ok: true, authRemoved: false as const };
    }

    return { ok: true, authRemoved: true as const };
  },
);

/* -------------------------------------------------------------------------- */
/* Push notifications.                                                        */
/*                                                                            */
/* The client registers an Expo push token at:                                */
/*   users/{uid}/profile/push.expoPushToken                                   */
/* This callable sends a single test push to that token so we can verify the */
/* end-to-end pipe (client registration → Firestore → Function → Expo →     */
/* device) without waiting for the daily scheduled job to fire.              */
/* -------------------------------------------------------------------------- */

export const sendTestNotification = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
    enforceAppCheck: ENFORCE_APP_CHECK,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in to send a test push.');
    }
    const uid = request.auth.uid;

    const snap = await admin
      .firestore()
      .doc(`users/${uid}/profile/push`)
      .get();
    const token = snap.data()?.expoPushToken;
    if (!isValidExpoToken(token)) {
      throw new HttpsError(
        'failed-precondition',
        'No Expo push token registered for this account. Enable push in Settings first.',
      );
    }

    const tickets = await sendExpoPush([
      {
        to: token,
        title: 'CosmicSelf ✦',
        body: 'Test push received. The cosmic pipeline is humming.',
        data: { route: 'DailyInsight', test: true },
        sound: 'default',
      },
    ]);

    const ticket = tickets[0];
    if (ticket?.status === 'error') {
      // Log + clear DeviceNotRegistered tokens so we don't keep retrying.
      const detailsCode =
        ticket.details && typeof ticket.details === 'object'
          ? (ticket.details as { error?: string }).error
          : undefined;
      if (detailsCode === 'DeviceNotRegistered') {
        try {
          await admin
            .firestore()
            .doc(`users/${uid}/profile/push`)
            .update({
              expoPushToken: admin.firestore.FieldValue.delete(),
              tokenInvalidatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        } catch {
          /* best-effort cleanup */
        }
        throw new HttpsError(
          'failed-precondition',
          'Push token is no longer valid. Re-enable push in Settings.',
        );
      }
      throw new HttpsError('internal', ticket.message || 'Push delivery failed.');
    }

    return { ok: true, ticketId: ticket?.status === 'ok' ? ticket.id : null };
  },
);

/* -------------------------------------------------------------------------- */
/* Scheduled daily push notification.                                         */
/*                                                                            */
/* Runs every UTC hour. Per-user push doc carries the user's local-time       */
/* preference (hour + tzOffsetMinutes), so each invocation finds the cohort   */
/* whose local clock is currently at their chosen send time and pushes them   */
/* a personalized headline based on today's transits + their natal chart.    */
/*                                                                            */
/* Why hourly instead of daily-at-08:00-UTC: users live across 24 timezones; */
/* a single global slot would deliver "morning" pushes at midnight for half  */
/* the world. Hourly cron + per-user filter = each user gets their headline  */
/* near their own breakfast.                                                  */
/*                                                                            */
/* Failure modes:                                                             */
/*   - missing birth → skip                                                  */
/*   - missing token → skip                                                  */
/*   - dailyHoroscope === false → skip                                       */
/*   - push delivery error 'DeviceNotRegistered' → clear the token doc      */
/*                                                                            */
/* Idempotent within an hour (the cohort filter only matches once per user). */
/* -------------------------------------------------------------------------- */

type PushDoc = {
  expoPushToken?: string;
  dailyHoroscope?: boolean;
  localHour?: number;
  tzOffsetMinutes?: number;
};

type BirthDoc = {
  isoLocal?: string;
  lat?: number;
  lon?: number;
  tzOffsetMinutes?: number;
};

export const dailyHoroscopePush = onSchedule(
  {
    // Every hour on the hour, UTC.
    schedule: '0 * * * *',
    timeZone: 'UTC',
    timeoutSeconds: 540,
    memory: '512MiB',
    retryCount: 1,
  },
  async () => {
    const db = admin.firestore();
    const now = new Date();

    // Collection-group query gathers every user's push doc in one read.
    const pushSnap = await db.collectionGroup('profile')
      .where('expoPushToken', '!=', null)
      .get();

    const pending: Array<{ uid: string; message: ExpoPushMessage }> = [];

    for (const docSnap of pushSnap.docs) {
      // Only the document literally named "push" is ours; the same
      // collection-group query also reaches profile/birth and
      // profile/entitlement which carry no token. Filter defensively.
      if (docSnap.id !== 'push') continue;

      const push = docSnap.data() as PushDoc;
      if (push.dailyHoroscope === false) continue;
      const token = push.expoPushToken;
      if (!isValidExpoToken(token)) continue;

      const wantHour = typeof push.localHour === 'number' ? push.localHour : 8;
      const tzOffset = typeof push.tzOffsetMinutes === 'number'
        ? push.tzOffsetMinutes
        : 0;
      if (currentLocalHour(tzOffset, now) !== wantHour) continue;

      // uid is the second-to-last segment of users/{uid}/profile/push
      const uid = docSnap.ref.parent.parent?.id;
      if (!uid) continue;

      // Fetch birth alongside; without it, fall back to a generic blurb.
      let birth: BirthInput | null = null;
      try {
        const birthSnap = await db
          .doc(`users/${uid}/profile/birth`)
          .get();
        const data = birthSnap.data() as BirthDoc | undefined;
        if (
          data?.isoLocal &&
          typeof data.lat === 'number' &&
          typeof data.lon === 'number'
        ) {
          birth = {
            isoLocal: data.isoLocal,
            lat: data.lat,
            lon: data.lon,
            tzOffsetMinutes: data.tzOffsetMinutes ?? 0,
          };
        }
      } catch {
        /* fall through to generic body */
      }

      const body = birth
        ? notificationBlurbFor(synthesizeDailyInsight(birth, now))
        : 'The stars have new guidance for you. Tap to read.';

      pending.push({
        uid,
        message: {
          to: token,
          title: 'Your daily cosmic insight ✦',
          body,
          data: { route: 'DailyInsight' },
          sound: 'default',
        },
      });
    }

    if (pending.length === 0) {
      console.log('dailyHoroscopePush: no recipients this hour');
      return;
    }

    const tickets = await sendExpoPush(pending.map((p) => p.message));

    // Walk tickets in lockstep with `pending` to attribute errors back to
    // a uid. Clear DeviceNotRegistered tokens so we stop billing for them.
    for (let i = 0; i < tickets.length; i += 1) {
      const ticket = tickets[i];
      const { uid } = pending[i];
      if (ticket.status !== 'error') continue;
      const detailsCode =
        ticket.details && typeof ticket.details === 'object'
          ? (ticket.details as { error?: string }).error
          : undefined;
      if (detailsCode === 'DeviceNotRegistered') {
        try {
          await db.doc(`users/${uid}/profile/push`).update({
            expoPushToken: admin.firestore.FieldValue.delete(),
            tokenInvalidatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch {
          /* best-effort cleanup */
        }
      } else {
        console.warn('dailyHoroscopePush: delivery error', { uid, ticket });
      }
    }

    console.log(`dailyHoroscopePush: sent ${pending.length}, errors ${tickets.filter((t) => t.status === 'error').length}`);
  },
);
