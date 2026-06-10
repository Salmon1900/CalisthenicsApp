// Wire contract for the DigitalCoach analysis service.
// Mirrors docs/DIGITALCOACH_API.md §3 exactly (snake_case preserved from the API).

export type Severity = 'info' | 'warning' | 'critical';

export interface Remark {
  timestamp_seconds: number;
  severity: Severity;
  area: string;
  message: string;
}

export interface Analysis {
  score: number; // 0–100
  remarks: Remark[];
  tips: string[];
}

export interface AnalysisMeta {
  analyzed_frames: number;
  sample_fps: number;
  pose_detected_ratio: number; // 0–1
  warnings: string[];
}

export interface AnalysisResponse {
  session_id: string;
  exercise: string;
  exercise_slug: string;
  video_duration_seconds: number;
  rep_count: number | null;
  hold_seconds: number | null;
  analysis: Analysis;
  meta: AnalysisMeta;
}

export interface ExercisesResponse {
  exercises: string[];
}

// Typed, display-ready error surfaced by the client (API doc §4). `message` is
// user-facing — it prefers the server's friendly `detail` string when present.
export type DigitalCoachErrorKind =
  | 'video_too_long'
  | 'unsupported_exercise'
  | 'invalid_video'
  | 'pose_not_detected'
  | 'server'
  | 'network'
  | 'timeout';

export class DigitalCoachError extends Error {
  readonly kind: DigitalCoachErrorKind;
  readonly supported?: string[];

  constructor(kind: DigitalCoachErrorKind, message: string, supported?: string[]) {
    super(message);
    this.name = 'DigitalCoachError';
    this.kind = kind;
    this.supported = supported;
  }
}
