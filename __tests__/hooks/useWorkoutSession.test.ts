import { act, renderHook } from '@testing-library/react-native';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';
import type { PlanExerciseWithExercise } from '../../utils/queryFunctions';

function makeItem(id: string, sets: number, quantity = 10): PlanExerciseWithExercise {
  return {
    id,
    workout_plan_id: 'plan1',
    exercise_id: `ex-${id}`,
    order_index: 0,
    quantity,
    sets,
    set_reps: null,
    rest_seconds: 60,
    created_at: '2026-01-01T00:00:00Z',
    exercise: {
      id: `ex-${id}`,
      name: `Exercise ${id}`,
      description: null,
      difficulty: 2,
      type: 'reps',
      category: 'strength',
      phase: 'pre',
      created_at: '2026-01-01T00:00:00Z',
    },
  };
}

describe('useWorkoutSession', () => {
  it('completes sets within the same exercise without advancing', () => {
    const items = [makeItem('a', 3), makeItem('b', 3)];
    const { result } = renderHook(() => useWorkoutSession(items));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentSetIndex).toBe(0);
    expect(result.current.allSetsDone).toBe(false);

    act(() => result.current.markSetCompleted());
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.completedSets).toBe(1);
    expect(result.current.currentSetIndex).toBe(1);
    expect(result.current.currentStatus).toBe('in-progress');
  });

  it('flags allSetsDone once every set is complete', () => {
    const items = [makeItem('a', 2)];
    const { result } = renderHook(() => useWorkoutSession(items));

    act(() => result.current.markSetCompleted());
    act(() => result.current.markSetCompleted());

    expect(result.current.allSetsDone).toBe(true);
    expect(result.current.currentStatus).toBe('completed');
    // Does not over-count beyond total sets.
    act(() => result.current.markSetCompleted());
    expect(result.current.completedSets).toBe(2);
  });

  it('advances exercises with goNext', () => {
    const items = [makeItem('a', 2), makeItem('b', 2)];
    const { result } = renderHook(() => useWorkoutSession(items));

    act(() => result.current.goNext());
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.current?.id).toBe('b');
  });

  it('skips the whole exercise and advances', () => {
    const items = [makeItem('a', 3), makeItem('b', 3)];
    const { result } = renderHook(() => useWorkoutSession(items));

    act(() => result.current.markSkipped());
    expect(result.current.currentIndex).toBe(1);
  });

  it('computes completion over total sets', () => {
    const items = [makeItem('a', 2), makeItem('b', 2)]; // 4 sets total
    const { result } = renderHook(() => useWorkoutSession(items));

    act(() => result.current.markSetCompleted()); // 1/4
    expect(result.current.completionPercentage).toBe(25);

    act(() => result.current.markSetCompleted()); // 2/4
    expect(result.current.completionPercentage).toBe(50);
  });

  it('uses per-set reps when an override is present', () => {
    const item = makeItem('a', 3);
    item.set_reps = [12, 10, 8];
    const { result } = renderHook(() => useWorkoutSession([item]));

    expect(result.current.currentReps).toBe(12);
    act(() => result.current.markSetCompleted());
    expect(result.current.currentReps).toBe(10);
  });
});
