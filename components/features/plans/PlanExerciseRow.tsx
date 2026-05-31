import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { theme } from '../../../constants/theme';
import type { Exercise, WorkoutPlanExercise } from '../../../utils/supabase';

interface Props {
  item: WorkoutPlanExercise & { exercise: Exercise };
  isFirst: boolean;
  isLast: boolean;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export function PlanExerciseRow({ item, isFirst, isLast, onRemove, onQuantityChange, onMoveUp, onMoveDown }: Props) {
  const [quantityText, setQuantityText] = useState(String(item.quantity));

  useEffect(() => {
    setQuantityText(String(item.quantity));
  }, [item.id]);

  const isReps = item.exercise.type === 'reps';
  const badgeStyle = isReps ? styles.badgeReps : styles.badgeTimed;
  const badgeTextStyle = isReps ? styles.badgeTextReps : styles.badgeTextTimed;
  const badgeLabel = isReps ? 'REPS' : 'SECS';

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

      <Text style={styles.name} numberOfLines={1}>{item.exercise.name}</Text>

      <View style={[styles.badge, badgeStyle]}>
        <Text style={[styles.badgeText, badgeTextStyle]}>{badgeLabel}</Text>
      </View>

      <TextInput
        style={styles.quantityInput}
        value={quantityText}
        onChangeText={setQuantityText}
        onBlur={() => {
          const parsed = parseInt(quantityText, 10);
          if (!isNaN(parsed) && parsed > 0) {
            onQuantityChange(item.id, parsed);
          } else {
            setQuantityText(String(item.quantity));
          }
        }}
        keyboardType="numeric"
        selectTextOnFocus
      />

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
  name: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeReps: {
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderColor: theme.colors.primary,
  },
  badgeTimed: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderColor: theme.colors.accent,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextReps: {
    color: theme.colors.primary,
  },
  badgeTextTimed: {
    color: theme.colors.accent,
  },
  quantityInput: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 52,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
