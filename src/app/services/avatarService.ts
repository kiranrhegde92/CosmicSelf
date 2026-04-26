import { updateProfile } from 'firebase/auth';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';

import { features } from '../config/env';
import { getFirebaseAuth, getFirebaseStorage } from './firebaseClient';

/**
 * Upload a local image file (file:// URI from expo-image-picker) to
 * `users/{uid}/avatar.jpg` and return the download URL. Also writes the URL
 * to the auth user's photoURL via updateProfile so downstream surfaces (e.g.
 * AuthUser.photoURL) can read it back without an extra round trip.
 *
 * Throws if Firebase isn't configured or the user isn't signed in.
 */
export async function uploadAvatar(localUri: string): Promise<string> {
  if (!features.firebase) {
    throw new Error('Firebase is not configured');
  }
  const auth = getFirebaseAuth();
  const storage = getFirebaseStorage();
  if (!auth?.currentUser || !storage) {
    throw new Error('Sign in required to upload an avatar');
  }
  const uid = auth.currentUser.uid;

  // Pull the local file into a Blob — Firebase Storage's RN SDK accepts
  // Blob/Uint8Array but not URI strings.
  const res = await fetch(localUri);
  const blob = await res.blob();

  const storageRef = ref(storage, `users/${uid}/avatar.jpg`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  const url = await getDownloadURL(storageRef);

  await updateProfile(auth.currentUser, { photoURL: url });
  return url;
}

/** Remove the user's stored avatar (best-effort) and clear photoURL. */
export async function removeAvatar(): Promise<void> {
  if (!features.firebase) return;
  const auth = getFirebaseAuth();
  const storage = getFirebaseStorage();
  if (!auth?.currentUser || !storage) return;
  const uid = auth.currentUser.uid;
  try {
    await deleteObject(ref(storage, `users/${uid}/avatar.jpg`));
  } catch {
    /* object may not exist — ignore */
  }
  await updateProfile(auth.currentUser, { photoURL: null });
}
