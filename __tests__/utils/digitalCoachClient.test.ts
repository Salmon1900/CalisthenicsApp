import { mapError } from '../../utils/digitalCoachClient';

describe('mapError', () => {
  it('maps 413 to a video_too_long error, preferring the server detail', () => {
    const err = mapError(413, { detail: 'Video must be 120s or less.' });
    expect(err.kind).toBe('video_too_long');
    expect(err.message).toBe('Video must be 120s or less.');
  });

  it('maps 422 with a supported list to unsupported_exercise', () => {
    const err = mapError(422, { detail: 'Unsupported exercise.', supported: ['Push-up', 'Pull-up'] });
    expect(err.kind).toBe('unsupported_exercise');
    expect(err.supported).toEqual(['Push-up', 'Pull-up']);
  });

  it('maps a pose-related 422 to pose_not_detected', () => {
    const err = mapError(422, { detail: 'No pose detected — keep your full body visible.' });
    expect(err.kind).toBe('pose_not_detected');
    expect(err.message).toContain('full body');
  });

  it('maps a generic 422 to invalid_video', () => {
    const err = mapError(422, { detail: 'Could not decode the file.' });
    expect(err.kind).toBe('invalid_video');
  });

  it('maps 500 to a server error', () => {
    const err = mapError(500, null);
    expect(err.kind).toBe('server');
    expect(err.message).toMatch(/try again/i);
  });

  it('falls back to friendly copy when no detail is provided', () => {
    const err = mapError(413, null);
    expect(err.message).toMatch(/2 minutes/i);
  });
});
