import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../constants/theme';
import type { Exercise } from '../../../utils/supabase';
import type { PlanExerciseWithExercise } from '../../../utils/queryFunctions';
import type { ExerciseStatus } from '../../../hooks/useWorkoutSession';

interface Props {
  item: PlanExerciseWithExercise;
  status: ExerciseStatus;
}

const difficultyColors: Record<Exercise['difficulty'], string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#f87171',
};

export function WorkoutExerciseCard({ item, status }: Props) {
  const { exercise } = item;
  const difficultyColor = difficultyColors[exercise.difficulty];
  const quantityLabel =
    exercise.type === 'reps' ? `${item.quantity} reps` : `${item.quantity} sec`;

  return (
    <View style={styles.card}>
      <View style={[styles.badge, { borderColor: difficultyColor }]}>
        <Text style={[styles.badgeText, { color: difficultyColor }]}>
          {exercise.difficulty.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {exercise.name}
      </Text>

      <Text style={styles.quantity}>{quantityLabel}</Text>

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
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 12,
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
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
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
