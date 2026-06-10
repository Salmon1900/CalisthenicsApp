// Thin wrapper around react-native-video-trim's editor UI. Opens the in-app
// trimmer for a source clip and resolves with the trimmed file (or null if the
// user cancels). Subscribes to the native events before opening and always
// cleans them up. Requires a native build — not available in Expo Go.

import { NativeEventEmitter, NativeModules } from 'react-native';
import VideoTrim, { showEditor } from 'react-native-video-trim';
import { MAX_VIDEO_SECONDS } from '../constants/digitalCoach';
import { theme } from '../constants/theme';

export interface TrimmedClip {
  uri: string;
  durationSeconds: number;
}

interface FinishPayload {
  outputPath: string;
  duration: number; // milliseconds
}

interface Subscription {
  remove: () => void;
}

// FFmpeg returns an absolute path; fetch/FormData and expo-video want a file:// URI.
function toFileUri(path: string): string {
  if (path.startsWith('file://') || path.startsWith('content://')) return path;
  return `file://${path}`;
}

// New architecture exposes typed EventEmitter methods on the module; old
// architecture needs a NativeEventEmitter. Support both.
function subscribe(
  handlers: { onFinish: (e: FinishPayload) => void; onCancel: () => void; onError: (e: { message: string }) => void },
): Subscription[] {
  const moduleAny = VideoTrim as unknown as Record<string, (cb: (e: never) => void) => Subscription>;
  if (typeof moduleAny.onFinishTrimming === 'function') {
    return [
      moduleAny.onFinishTrimming(handlers.onFinish as (e: never) => void),
      moduleAny.onCancel(handlers.onCancel as (e: never) => void),
      moduleAny.onError(handlers.onError as (e: never) => void),
    ];
  }
  const emitter = new NativeEventEmitter(NativeModules.VideoTrim);
  return [
    emitter.addListener('onFinishTrimming', handlers.onFinish),
    emitter.addListener('onCancel', handlers.onCancel),
    emitter.addListener('onError', handlers.onError),
  ];
}

/**
 * Open the trim editor for `sourceUri`. Resolves with the trimmed clip, or null
 * if the user cancels. Rejects on a native trimming error.
 */
export function openTrimEditor(sourceUri: string): Promise<TrimmedClip | null> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let subs: Subscription[] = [];
    const cleanup = () => subs.forEach((s) => s.remove());
    const settle = (run: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      run();
    };

    subs = subscribe({
      onFinish: (e) =>
        settle(() => resolve({ uri: toFileUri(e.outputPath), durationSeconds: e.duration / 1000 })),
      onCancel: () => settle(() => resolve(null)),
      onError: (e) => settle(() => reject(new Error(e.message || 'Could not trim the video.'))),
    });

    showEditor(sourceUri, {
      maxDuration: MAX_VIDEO_SECONDS * 1000,
      saveToPhoto: false,
      enableEditTools: false,
      enableSaveDialog: false,
      enableCancelDialog: false,
      closeWhenFinish: true,
      headerText: 'Trim to the movement',
      saveButtonText: 'Use clip',
      theme: 'dark',
      trimmerColor: theme.colors.primary,
    });
  });
}
