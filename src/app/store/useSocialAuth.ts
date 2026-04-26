import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

import { env, features } from '../config/env';
import { getFirebaseAuth } from '../services/firebaseClient';

// Required so the OAuth in-app browser closes correctly after a redirect.
WebBrowser.maybeCompleteAuthSession();

export type SocialError = {
  code: 'unavailable' | 'cancelled' | 'failed';
  message: string;
};

type State = {
  loading: 'google' | 'apple' | null;
  error: SocialError | null;
};

/**
 * Single hook that exposes Google + Apple sign-in. Wraps both providers'
 * id-token / OAuth-credential flow into Firebase Auth. Each provider returns
 * a consistent { error } shape; consumers don't need to think about
 * cancellations vs failures unless they care to.
 *
 * Pass `onSuccess` to be notified when Firebase has accepted the credential
 * (typically used to navigate forward — onAuthStateChanged updates the
 * Zustand store, but the navigator needs a nudge).
 */
export function useSocialAuth(options?: { onSuccess?: () => void }) {
  const [state, setState] = useState<State>({ loading: null, error: null });
  const [appleAvailable, setAppleAvailable] = useState(false);
  const onSuccess = options?.onSuccess;

  const [, googleResponse, promptGoogle] = Google.useIdTokenAuthRequest({
    clientId: env.google.webClientId || undefined,
    iosClientId: env.google.iosClientId || undefined,
    androidClientId: env.google.androidClientId || undefined,
  });

  // Probe Apple availability once. Returns false on Android, on iOS
  // simulators without a signed-in Apple ID, and on iOS < 13.
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  // Exchange the Google id_token for a Firebase credential when the in-app
  // OAuth flow returns. Errors are kept on the hook state for the UI to
  // surface; success flips Firebase auth state via onAuthStateChanged in
  // useSessionSync, which already updates the Zustand store.
  useEffect(() => {
    if (!googleResponse) return;
    if (googleResponse.type === 'cancel' || googleResponse.type === 'dismiss') {
      setState({ loading: null, error: null });
      return;
    }
    if (googleResponse.type !== 'success') {
      setState({
        loading: null,
        error: { code: 'failed', message: 'Google sign-in failed.' },
      });
      return;
    }
    const idToken = googleResponse.params.id_token;
    if (!idToken) {
      setState({
        loading: null,
        error: { code: 'failed', message: 'Google did not return an id token.' },
      });
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setState({
        loading: null,
        error: { code: 'unavailable', message: 'Firebase isn\'t configured.' },
      });
      return;
    }
    const credential = GoogleAuthProvider.credential(idToken);
    signInWithCredential(auth, credential)
      .then(() => {
        setState({ loading: null, error: null });
        onSuccess?.();
      })
      .catch((err: { message?: string }) =>
        setState({
          loading: null,
          error: { code: 'failed', message: err.message ?? 'Firebase rejected the credential.' },
        }),
      );
  }, [googleResponse, onSuccess]);

  const onGoogle = useCallback(async () => {
    if (!features.googleSignIn) {
      setState({
        loading: null,
        error: { code: 'unavailable', message: 'Google sign-in isn\'t configured yet.' },
      });
      return;
    }
    setState({ loading: 'google', error: null });
    try {
      await promptGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setState({ loading: null, error: { code: 'failed', message: msg } });
    }
  }, [promptGoogle]);

  const onApple = useCallback(async () => {
    if (!features.appleSignIn) {
      setState({
        loading: null,
        error: { code: 'unavailable', message: 'Apple sign-in isn\'t configured yet.' },
      });
      return;
    }
    if (!appleAvailable) {
      setState({
        loading: null,
        error: { code: 'unavailable', message: 'Apple sign-in is not available on this device.' },
      });
      return;
    }
    setState({ loading: 'apple', error: null });
    try {
      // Apple/Firebase require a nonce: the SHA-256 hash is sent to Apple,
      // the raw value is sent to Firebase so it can verify them out-of-band.
      const rawNonce = generateNonce();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      if (!credential.identityToken) {
        throw new Error('Apple did not return an identity token.');
      }
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase isn\'t configured.');
      const provider = new OAuthProvider('apple.com');
      const fbCredential = provider.credential({
        idToken: credential.identityToken,
        rawNonce,
      });
      await signInWithCredential(auth, fbCredential);
      setState({ loading: null, error: null });
      onSuccess?.();
    } catch (err) {
      const e = err as { code?: string; message?: string };
      // Apple uses ERR_REQUEST_CANCELED for user cancellations.
      if (e.code === 'ERR_REQUEST_CANCELED') {
        setState({ loading: null, error: null });
        return;
      }
      setState({
        loading: null,
        error: { code: 'failed', message: e.message ?? 'Apple sign-in failed.' },
      });
    }
  }, [appleAvailable, onSuccess]);

  return {
    googleAvailable: features.googleSignIn,
    appleAvailable: features.appleSignIn && appleAvailable,
    loading: state.loading,
    error: state.error,
    onGoogle,
    onApple,
    clearError: () => setState((s) => ({ ...s, error: null })),
  };
}

function generateNonce(length = 32): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return out;
}
