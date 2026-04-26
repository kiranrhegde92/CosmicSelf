import { Audio } from 'expo-av';
// SDK 55 split expo-file-system into a "next" API + a /legacy subpath that
// keeps EncodingType / readAsStringAsync / deleteAsync. We use the legacy
// API here because the new one is async-iterator-shaped and would need a
// full rewrite for no functional gain.
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import { env, features } from '../config/env';
import { getFirebaseAuth } from './firebaseClient';

let recording: Audio.Recording | null = null;

const MOCK_PHRASES = [
  'Tell me about my Venus today.',
  'What does my chart say about love this week?',
  'Should I trust the offer that just landed?',
  'I keep dreaming about water — what does it mean?',
];

function transcribeUrl(): string {
  const region = env.firebase.region || 'us-central1';
  const projectId = env.firebase.projectId;
  return `https://${region}-${projectId}.cloudfunctions.net/transcribeAudio`;
}

async function ensurePermission(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== 'granted') return false;
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  return true;
}

export const voiceService = {
  /** True when the recording is currently capturing audio. */
  get isRecording(): boolean {
    return recording !== null;
  },

  /**
   * Begin recording. Throws if mic permission is denied or another
   * recording is already in progress.
   */
  async start(): Promise<void> {
    if (recording) throw new Error('Already recording');
    const granted = await ensurePermission();
    if (!granted) throw new Error('Microphone permission denied');
    const r = new Audio.Recording();
    await r.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await r.startAsync();
    recording = r;
  },

  /**
   * Stop recording and return the transcribed text. Returns a curated
   * mock phrase when neither the cloud function nor a key is configured —
   * lets the UX flow be demonstrated in plain Expo Go without a deploy.
   */
  async stopAndTranscribe(): Promise<string> {
    if (!recording) throw new Error('Not recording');
    const r = recording;
    recording = null;
    await r.stopAndUnloadAsync();
    const uri = r.getURI();
    if (!uri) throw new Error('No audio captured');

    if (!features.firebase) {
      // Drop the local recording, return a mock phrase so the UI shows
      // something believable.
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        /* best effort */
      }
      await new Promise((res) => setTimeout(res, 600));
      return MOCK_PHRASES[Math.floor(Math.random() * MOCK_PHRASES.length)];
    }

    const auth = getFirebaseAuth();
    const user = auth?.currentUser;
    if (!user) throw new Error('Not signed in');
    const token = await user.getIdToken();

    const audioBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    try {
      const res = await fetch(transcribeUrl(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64,
          mimeType: Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4',
          language: 'en',
        }),
      });
      if (!res.ok) {
        // 503 = key not set yet; fall back to mock so the demo path works.
        if (res.status === 503) {
          return MOCK_PHRASES[Math.floor(Math.random() * MOCK_PHRASES.length)];
        }
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? `Transcription failed (${res.status})`);
      }
      const json = (await res.json()) as { text?: string };
      return (json.text ?? '').trim();
    } finally {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        /* best effort */
      }
    }
  },

  /** Cancel an in-flight recording without uploading. */
  async cancel(): Promise<void> {
    if (!recording) return;
    const r = recording;
    recording = null;
    try {
      await r.stopAndUnloadAsync();
      const uri = r.getURI();
      if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      /* best effort */
    }
  },
};
