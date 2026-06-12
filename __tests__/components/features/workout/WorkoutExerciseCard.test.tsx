import { render } from '@testing-library/react-native';
import { WorkoutExerciseCard } from '../../../../components/features/workout/WorkoutExerciseCard';
import type { PlanExerciseWithExercise } from '../../../../utils/queryFunctions';

function makeItem(type: 'reps' | 'timed' = 'reps'): PlanExerciseWithExercise {
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
      type,
      category: 'strength',
      phase: 'pre',
      created_at: '2026-01-01T00:00:00Z',
    },
  };
}

describe('WorkoutExerciseCard', () => {
  it('shows the current set position and reps', () => {
    const { getByText } = render(
      <WorkoutExerciseCard
        item={makeItem()}
        status="in-progress"
        currentSetIndex={1}
        totalSets={3}
        completedSets={1}
        currentReps={10}
      />,
    );
    expect(getByText('Set 2 of 3')).toBeTruthy();
    expect(getByText('10 reps')).toBeTruthy();
  });

  it('labels timed exercises in seconds', () => {
    const { getByText } = render(
      <WorkoutExerciseCard
        item={makeItem('timed')}
        status="pending"
        currentSetIndex={0}
        totalSets={3}
        completedSets={0}
        currentReps={30}
      />,
    );
    expect(getByText('30 sec')).toBeTruthy();
  });

  it('shows a done label once all sets are complete', () => {
    const { getByText } = render(
      <WorkoutExerciseCard
        item={makeItem()}
        status="completed"
        currentSetIndex={2}
        totalSets={3}
        completedSets={3}
        currentReps={10}
      />,
    );
    expect(getByText('All 3 sets done')).toBeTruthy();
  });
});
