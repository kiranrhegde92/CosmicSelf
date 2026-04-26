/**
 * Thin wrapper around `expo-speech` so the call sites don't need to know
 * about platform quirks or option shapes.
 *
 *   - `speak(text, opts?)` stops anything currently speaking, then starts a
 *     new utterance with our calm-default tuning (pitch 1.0, rate 0.9).
 *   - `stop()` halts whatever is playing.
 *   - `isSpeaking()` answers the async "is something playing" question.
 *
 * Web is intentionally a no-op — `expo-speech` *does* work on web through
 * the Web Speech API, but voices vary wildly per browser and we don't want
 * to surprise users. The native paths are where the feature ships.
 */

import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

type SpeakOpts = {
  onDone?: () => void;
  onError?: () => void;
};

const PITCH = 1.0;
const RATE = 0.9;
const LANGUAGE = 'en-US';

/** Pick a calm English voice if the platform exposes one; otherwise let
 *  the OS pick its default by leaving `voice` undefined. We cache the
 *  resolved id so we don't query the system on every utterance. */
let cachedVoiceId: string | null | undefined;

async function resolveVoice(): Promise<string | undefined> {
  if (cachedVoiceId !== undefined) return cachedVoiceId ?? undefined;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Prefer enhanced/premium English voices when the OS surfaces them,
    // then any en-* voice, otherwise fall back to the system default.
    const enVoices = voices.filter((v) => v.language?.toLowerCase().startsWith('en'));
    const enhanced = enVoices.find((v) =>
      /enhanced|premium|natural/i.test(v.name ?? v.identifier ?? ''),
    );
    cachedVoiceId = enhanced?.identifier ?? enVoices[0]?.identifier ?? null;
  } catch {
    cachedVoiceId = null;
  }
  return cachedVoiceId ?? undefined;
}

export const ttsService = {
  async speak(text: string, opts?: SpeakOpts): Promise<void> {
    if (Platform.OS === 'web') return;
    if (!text) return;
    try {
      // Stop any in-flight utterance so toggling between bubbles feels
      // immediate rather than queueing.
      await Speech.stop();
    } catch {
      /* nothing to stop */
    }
    const voice = await resolveVoice();
    Speech.speak(text, {
      language: LANGUAGE,
      pitch: PITCH,
      rate: RATE,
      voice,
      onDone: () => opts?.onDone?.(),
      onStopped: () => opts?.onDone?.(),
      onError: () => opts?.onError?.(),
    });
  },

  async stop(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Speech.stop();
    } catch {
      /* ignore */
    }
  },

  async isSpeaking(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      return await Speech.isSpeakingAsync();
    } catch {
      return false;
    }
  },
};
