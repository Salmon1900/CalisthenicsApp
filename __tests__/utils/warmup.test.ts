import {
  DEFAULT_TIMED_SECONDS,
  DEFAULT_WARMUP_REPS,
  buildSectionItems,
  defaultDosage,
  orderByCuratedNames,
  sectionLabel,
  toSessionItem,
} from '../../utils/warmup';
import type { Exercise } from '../../utils/supabase';

function makeExercise(name: string, type: 'reps' | 'timed' = 'reps'): Exercise {
  return {
    id: `id-${name}`,
    name,
    description: null,
    difficulty: 1,
    type,
    category: 'warmup',
    phase: 'pre',
    created_at: '2026-01-01T00:00:00Z',
  };
}

describe('defaultDosage', () => {
  it('uses seconds for timed exercises and reps otherwise', () => {
    expect(defaultDosage(makeExercise('Plank', 'timed'))).toBe(DEFAULT_TIMED_SECONDS);
    expect(defaultDosage(makeExercise('Squat', 'reps'))).toBe(DEFAULT_WARMUP_REPS);
  });
});

describe('sectionLabel', () => {
  it('returns friendly labels', () => {
    expect(sectionLabel('warmup')).toBe('Warm-up');
    expect(sectionLabel('cooldown')).toBe('Cooldown');
    expect(sectionLabel('main')).toBe('Main set');
  });
});

describe('toSessionItem', () => {
  it('wraps an exercise as a single-set synthetic plan item with a prefixed id', () => {
    const item = toSessionItem(makeExercise('Arm Circles'), 'warmup', 2);
    expect(item.id).toBe('warmup-id-Arm Circles');
    expect(item.sets).toBe(1);
    expect(item.set_reps).toBeNull();
    expect(item.quantity).toBe(DEFAULT_WARMUP_REPS);
    expect(item.order_index).toBe(2);
    expect(item.exercise.name).toBe('Arm Circles');
  });

  it('namespaces ids per section so warmup and cooldown never collide', () => {
    const ex = makeExercise('Deep Squat Hold', 'timed');
    expect(toSessionItem(ex, 'warmup', 0).id).not.toBe(toSessionItem(ex, 'cooldown', 0).id);
  });
});

describe('orderByCuratedNames', () => {
  it('orders matches by the curated list and drops names that are missing', () => {
    const pool = [makeExercise('B'), makeExercise('A'), makeExercise('C')];
    const result = orderByCuratedNames(pool, ['A', 'Missing', 'C']);
    expect(result.map((e) => e.name)).toEqual(['A', 'C']);
  });
});

describe('buildSectionItems', () => {
  it('produces ordered single-set items for the matched curated names', () => {
    const pool = [makeExercise('Two'), makeExercise('One'), makeExercise('Three')];
    const items = buildSectionItems(pool, ['One', 'Two'], 'cooldown');
    expect(items.map((i) => i.exercise.name)).toEqual(['One', 'Two']);
    expect(items.every((i) => i.sets === 1)).toBe(true);
    expect(items.every((i) => i.id.startsWith('cooldown-'))).toBe(true);
  });

  it('returns an empty list when nothing matches', () => {
    expect(buildSectionItems([makeExercise('X')], ['Y'], 'warmup')).toEqual([]);
  });
});
