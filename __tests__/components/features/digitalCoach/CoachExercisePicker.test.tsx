import { fireEvent, render } from '@testing-library/react-native';
import { CoachExercisePicker } from '../../../../components/features/digitalCoach/CoachExercisePicker';
import type { MatchedExercise } from '../../../../utils/digitalCoachExercises';
import type { Exercise } from '../../../../utils/supabase';

function makeExercise(id: string, name: string): Exercise {
  return {
    id,
    name,
    description: null,
    difficulty: 1,
    type: 'reps',
    category: 'strength',
    phase: 'pre',
    created_at: '2026-01-01T00:00:00Z',
  };
}

const items: MatchedExercise[] = [
  { exercise: makeExercise('1', 'Push-up'), serviceName: 'Push-up' },
  { exercise: makeExercise('2', 'Muscle-up'), serviceName: null },
];

describe('CoachExercisePicker', () => {
  it('flags unsupported exercises as coming soon', () => {
    const { getByText } = render(
      <CoachExercisePicker items={items} selectedId={null} onSelect={jest.fn()} />,
    );
    expect(getByText('Coming soon')).toBeTruthy();
  });

  it('selects a supported exercise on press', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <CoachExercisePicker items={items} selectedId={null} onSelect={onSelect} />,
    );
    fireEvent.press(getByText('Push-up'));
    expect(onSelect).toHaveBeenCalledWith(items[0]);
  });

  it('does not select a disabled, unsupported exercise', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <CoachExercisePicker items={items} selectedId={null} onSelect={onSelect} />,
    );
    fireEvent.press(getByText('Muscle-up'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
