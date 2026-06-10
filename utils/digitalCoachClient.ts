// Isolated network layer for the DigitalCoach service. UI never touches fetch,
// base URLs, or status codes — only typed results and DigitalCoachError.
// Keeping this self-contained means a future async/job-queue + auth backend is a
// change here only (API doc §6).

import { BASE_URL, API_PREFIX, REQUEST_TIMEOUT_MS } from '../constants/digitalCoach';
import {
  DigitalCoachError,
  type AnalysisResponse,
  type ExercisesResponse,
} from '../types/digitalCoach';

interface ErrorBody {
  detail?: string;
  supported?: string[];
}

/**
 * Turn a non-2xx response (status + parsed JSON body) into a typed, display-ready
 * error. Prefers the server's friendly `detail` string (API doc §4) over invented copy.
 */
export function mapError(status: number, body: ErrorBody | null): DigitalCoachError {
  const detail = body?.detail?.trim();

  if (status === 413) {
    return new DigitalCoachError(
      'video_too_long',
      detail || 'That video is too long. Trim it to 2 minutes or less and try again.',
    );
  }

  if (status === 422) {
    if (body?.supported && body.supported.length > 0) {
      return new DigitalCoachError(
        'unsupported_exercise',
        detail || 'That exercise is not supported yet.',
        body.supported,
      );
    }
    if (detail && /pose|body|visible|lighting/i.test(detail)) {
      return new DigitalCoachError('pose_not_detected', detail);
    }
    return new DigitalCoachError(
      'invalid_video',
      detail || "We couldn't read that video. Re-record or pick a different file.",
    );
  }

  return new DigitalCoachError(
    'server',
    detail || 'Something went wrong on our end. Please try again.',
  );
}

function buildUrl(path: string): string {
  if (!BASE_URL) {
    throw new DigitalCoachError(
      'network',
      'Digital Coach is not configured. Set EXPO_PUBLIC_DIGITALCOACH_URL.',
    );
  }
  return `${BASE_URL}${path}`;
}

async function parseJsonSafe(response: Response): Promise<ErrorBody | null> {
  try {
    return (await response.json()) as ErrorBody;
  } catch {
    return null;
  }
}

/**
 * Live list of exercises the service can analyze right now. Display names are sent
 * back verbatim in {@link analyze}, so never slugify them on the client.
 */
export async function getExercises(): Promise<string[]> {
  let response: Response;
  try {
    response = await fetch(buildUrl(`${API_PREFIX}/exercises`));
  } catch {
    throw new DigitalCoachError('network', 'Could not reach Digital Coach. Check your connection.');
  }
  if (!response.ok) {
    throw mapError(response.status, await parseJsonSafe(response));
  }
  const data = (await response.json()) as ExercisesResponse;
  return data.exercises ?? [];
}

/**
 * Analyze one exercise video. Synchronous on the server (can take tens of seconds),
 * so we set a generous request timeout.
 *
 * Uploads via XMLHttpRequest rather than `fetch`: Expo replaces the global `fetch`
 * with its winter (WinterCG) implementation, whose FormData serializer rejects the
 * React Native `{ uri, name, type }` file part ("Unsupported FormDataPart
 * implementation"). RN's XHR uses native networking, accepts that file shape, and
 * streams the clip from disk instead of buffering it in JS memory.
 *
 * @param exerciseName exact service display name (e.g. "Pike Push-up"), sent verbatim
 * @param videoUri     file:// URI of the trimmed clip
 */
export function analyze(exerciseName: string, videoUri: string): Promise<AnalysisResponse> {
  const url = buildUrl(`${API_PREFIX}/analyze`);

  const form = new FormData();
  form.append('exercise', exerciseName);
  // React Native FormData file shape — an object, not a Blob. Do NOT set
  // Content-Type manually; the native layer adds the multipart boundary.
  form.append('video', { uri: videoUri, name: 'workout.mp4', type: 'video/mp4' } as unknown as Blob);

  return new Promise<AnalysisResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.timeout = REQUEST_TIMEOUT_MS;

    xhr.onload = () => {
      let body: ErrorBody | AnalysisResponse | null = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        body = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as AnalysisResponse);
      } else {
        reject(mapError(xhr.status, body as ErrorBody | null));
      }
    };
    xhr.onerror = () => {
      reject(new DigitalCoachError('network', 'Could not reach Digital Coach. Check your connection.'));
    };
    xhr.ontimeout = () => {
      reject(new DigitalCoachError('timeout', 'Analysis took too long. Please try again.'));
    };

    xhr.send(form);
  });
}
