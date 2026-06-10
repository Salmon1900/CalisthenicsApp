import { normalize, matchAppExercises } from '../../utils/digitalCoachExercises';
import type { Exercise } from '../../utils/supabase';

function makeExercise(name: string): Exercise {
  return {
    id: name,
    name,
    description: null,
    difficulty: 1,
    type: 'reps',
    created_at: '2026-01-01T00:00:00Z',
  };
}

describe('normalize', () => {
  it('lowercases and strips spaces and hyphens', () => {
    expect(normalize('Pike Push-up')).toBe('pikepushup');
    expect(normalize('pike pushup')).toBe('pikepushup');
  });
});

describe('matchAppExercises', () => {
  const serviceNames = ['Handstand', 'Pike Push-up', 'Pull-up', 'Push-up'];

  it('matches app exercises to the exact service display name regardless of formatting', () => {
    const result = matchAppExercises([makeExercise('Pike Pushup')], serviceNames);
    expect(result[0].serviceName).toBe('Pike Push-up');
  });

  it('returns null serviceName for unsupported exercises', () => {
    const result = matchAppExercises([makeExercise('Muscle-up')], serviceNames);
    expect(result[0].serviceName).toBeNull();
  });

  it('preserves the original app exercise on each match', () => {
    const exercise = makeExercise('Push-up');
    const result = matchAppExercises([exercise], serviceNames);
    expect(result[0].exercise).toBe(exercise);
    expect(result[0].serviceName).toBe('Push-up');
  });

  it('orders supported exercises before unsupported ones, keeping group order', () => {
    const result = matchAppExercises(
      [makeExercise('Muscle-up'), makeExercise('Push-up'), makeExercise('Plank'), makeExercise('Pull-up')],
      serviceNames,
    );
    expect(result.map((m) => m.exercise.name)).toEqual(['Push-up', 'Pull-up', 'Muscle-up', 'Plank']);
  });
});
