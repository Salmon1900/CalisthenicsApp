import { StyleSheet, Text, View, Pressable } from 'react-native';
import { theme } from '../../../constants/theme';
import type { PlanExerciseWithExercise } from '../../../utils/queryFunctions';
import { formatSetSummary } from '../../../utils/sets';

interface Props {
  item: PlanExerciseWithExercise;
  isFirst: boolean;
  isLast: boolean;
  onRemove: (id: string) => void;
  onEdit: (item: PlanExerciseWithExercise) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export function PlanExerciseRow({ item, isFirst, isLast, onRemove, onEdit, onMoveUp, onMoveDown }: Props) {
  const summary = `${formatSetSummary(item)} · ${item.rest_seconds}s rest`;

  return (
    <View style={styles.row}>
      <View style={styles.orderButtons}>
        <Pressable
          onPress={() => onMoveUp(item.id)}
          disabled={isFirst}
          style={[styles.arrowButton, isFirst && styles.arrowDisabled]}
        >
          <Text style={[styles.arrowText, isFirst && styles.arrowTextDisabled]}>{'▲'}</Text>
        </Pressable>
        <Pressable
          onPress={() => onMoveDown(item.id)}
          disabled={isLast}
          style={[styles.arrowButton, isLast && styles.arrowDisabled]}
        >
          <Text style={[styles.arrowText, isLast && styles.arrowTextDisabled]}>{'▼'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.info} onPress={() => onEdit(item)}>
        <Text style={styles.name} numberOfLines={1}>{item.exercise.name}</Text>
        <Text style={styles.summary} numberOfLines={1}>{summary}</Text>
      </Pressable>

      <Pressable onPress={() => onEdit(item)} style={styles.editButton}>
        <Text style={styles.editText}>Edit</Text>
      </Pressable>

      <Pressable onPress={() => onRemove(item.id)} style={styles.removeButton}>
        <Text style={styles.removeText}>{'×'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  orderButtons: {
    flexDirection: 'column',
    gap: 2,
  },
  arrowButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  arrowDisabled: {
    opacity: 0.2,
  },
  arrowText: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 13,
  },
  arrowTextDisabled: {
    color: theme.colors.muted,
  },
  info: {
    flex: 1,
  },
  name: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  summary: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  editText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  removeButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  removeText: {
    color: '#f87171',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '700',
  },
});
