import { theme } from './theme';
import type { Severity } from '../types/digitalCoach';

// Single source of truth for the DigitalCoach service base URL.
// Read from env (EXPO_PUBLIC_DIGITALCOACH_URL) so the dev tunnel -> prod URL swap
// is a config change, never a code change. No string literals elsewhere.
export const BASE_URL = process.env.EXPO_PUBLIC_DIGITALCOACH_URL || '';

export const API_PREFIX = '/api/v1';

// The analyze call runs synchronously inside the request and can take tens of
// seconds, so we give it a generous timeout.
export const REQUEST_TIMEOUT_MS = 120_000;

// The service rejects videos longer than this (HTTP 413). We enforce it client-side.
export const MAX_VIDEO_SECONDS = 120;

// pose_detected_ratio below this is worth a soft "tracking was partial" note.
export const LOW_POSE_RATIO = 0.8;

// Remark severity -> color, per the API doc UI hints.
export const SEVERITY_COLORS: Record<Severity, string> = {
  info: theme.colors.muted,
  warning: '#f59e0b',
  critical: '#ef4444',
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  info: 'Note',
  warning: 'Watch',
  critical: 'Fix',
};

// Guidance shown before the user records/picks a clip.
export const FILMING_INSTRUCTIONS = [
  'Film from the side, at a slight angle — not straight on.',
  'Keep your whole body in frame for the entire movement.',
  'Use bright, even lighting and a clean, uncluttered background.',
  'After picking the video, trim it to only the relevant movement — cut out walking in, resting, and walking away.',
  'Keep the clip under 2 minutes.',
] as const;
