import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../constants/theme';
import type { PlanExerciseWithExercise } from '../../../utils/queryFunctions';
import type { ExerciseStatus } from '../../../hooks/useWorkoutSession';
import { getDifficultyColor, getDifficultyLabel } from '../../../utils/difficulty';
import { SetStepper } from './SetStepper';

interface Props {
  item: PlanExerciseWithExercise;
  status: ExerciseStatus;
  currentSetIndex: number;
  totalSets: number;
  completedSets: number;
  currentReps: number;
}

// Scale the exercise name down for longer titles so it stays on two lines
// without pushing the surrounding controls out of place.
function getNameFontSize(name: string): number {
  const length = name.length;
  if (length <= 14) return 28;
  if (length <= 22) return 24;
  if (length <= 30) return 20;
  return 17;
}

export function WorkoutExerciseCard({
  item,
  status,
  currentSetIndex,
  totalSets,
  completedSets,
  currentReps,
}: Props) {
  const { exercise } = item;
  const difficultyColor = getDifficultyColor(exercise.difficulty);
  const nameFontSize = getNameFontSize(exercise.name);
  const allDone = completedSets >= totalSets;
  const quantityLabel = exercise.type === 'reps' ? `${currentReps} reps` : `${currentReps} sec`;
  const setLabel = allDone
    ? `All ${totalSets} sets done`
    : `Set ${currentSetIndex + 1} of ${totalSets}`;

  return (
    <View style={styles.card}>
      <View style={[styles.badge, { borderColor: difficultyColor }]}>
        <Text style={[styles.badgeText, { color: difficultyColor }]}>
          {getDifficultyLabel(exercise.difficulty).toUpperCase()}
        </Text>
      </View>

      <Text style={[styles.name, { fontSize: nameFontSize }]} numberOfLines={2}>
        {exercise.name}
      </Text>

      <Text style={styles.setLabel}>{setLabel}</Text>
      {!allDone ? <Text style={styles.quantity}>{quantityLabel}</Text> : null}

      <SetStepper
        totalSets={totalSets}
        completedSets={completedSets}
        currentSetIndex={currentSetIndex}
      />

      {status === 'completed' ? (
        <Text style={[styles.status, styles.statusCompleted]}>✓ Completed</Text>
      ) : status === 'skipped' ? (
        <Text style={[styles.status, styles.statusSkipped]}>⤼ Skipped</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 230,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 10,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  name: {
    color: theme.colors.text,
    fontWeight: '800',
    textAlign: 'center',
  },
  setLabel: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  quantity: {
    color: theme.colors.muted,
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  statusCompleted: {
    color: theme.colors.success,
  },
  statusSkipped: {
    color: theme.colors.muted,
  },
});
