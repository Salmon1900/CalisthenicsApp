import {
  formatSetSummary,
  hasSetOverrides,
  reconcileSetReps,
  repsForSet,
  totalSetsForItems,
} from '../../utils/sets';
import type { PlanExerciseWithExercise } from '../../utils/queryFunctions';

function makeItem(overrides: Partial<PlanExerciseWithExercise> = {}): PlanExerciseWithExercise {
  return {
    id: 'pe1',
    workout_plan_id: 'plan1',
    exercise_id: 'ex1',
    order_index: 0,
    quantity: 10,
    sets: 3,
    set_reps: null,
    rest_seconds: 60,
    created_at: '2026-01-01T00:00:00Z',
    exercise: {
      id: 'ex1',
      name: 'Push-ups',
      description: null,
      difficulty: 2,
      type: 'reps',
      category: 'strength',
      phase: 'pre',
      created_at: '2026-01-01T00:00:00Z',
    },
    ...overrides,
  };
}

describe('repsForSet', () => {
  it('returns quantity for every set when there is no override', () => {
    const item = makeItem({ quantity: 12, set_reps: null });
    expect(repsForSet(item, 0)).toBe(12);
    expect(repsForSet(item, 2)).toBe(12);
  });

  it('returns the override for the given set index', () => {
    const item = makeItem({ quantity: 10, set_reps: [12, 10, 8] });
    expect(repsForSet(item, 0)).toBe(12);
    expect(repsForSet(item, 1)).toBe(10);
    expect(repsForSet(item, 2)).toBe(8);
  });

  it('falls back to quantity when override is missing an index', () => {
    const item = makeItem({ quantity: 5, set_reps: [12] });
    expect(repsForSet(item, 1)).toBe(5);
  });
});

describe('totalSetsForItems', () => {
  it('sums sets across exercises', () => {
    expect(totalSetsForItems([makeItem({ sets: 3 }), makeItem({ sets: 4 })])).toBe(7);
  });

  it('is 0 for an empty plan', () => {
    expect(totalSetsForItems([])).toBe(0);
  });
});

describe('hasSetOverrides', () => {
  it('is false for null and empty arrays', () => {
    expect(hasSetOverrides(makeItem({ set_reps: null }))).toBe(false);
    expect(hasSetOverrides(makeItem({ set_reps: [] }))).toBe(false);
  });

  it('is true when an override list exists', () => {
    expect(hasSetOverrides(makeItem({ set_reps: [10, 8] }))).toBe(true);
  });
});

describe('reconcileSetReps', () => {
  it('pads new sets with the base value', () => {
    expect(reconcileSetReps([12, 10], 4, 9)).toEqual([12, 10, 9, 9]);
  });

  it('truncates extra sets', () => {
    expect(reconcileSetReps([12, 10, 8], 2, 9)).toEqual([12, 10]);
  });

  it('fills from base when there is no current list', () => {
    expect(reconcileSetReps(null, 3, 7)).toEqual([7, 7, 7]);
  });
});

describe('formatSetSummary', () => {
  it('formats uniform reps', () => {
    expect(formatSetSummary(makeItem({ sets: 3, quantity: 10 }))).toBe('3 × 10 reps');
  });

  it('uses sec for timed exercises', () => {
    const item = makeItem({
      sets: 3,
      quantity: 30,
      exercise: { ...makeItem().exercise, type: 'timed' },
    });
    expect(formatSetSummary(item)).toBe('3 × 30 sec');
  });

  it('lists per-set values when overridden', () => {
    expect(formatSetSummary(makeItem({ set_reps: [12, 10, 8] }))).toBe('12/10/8 reps');
  });
});
