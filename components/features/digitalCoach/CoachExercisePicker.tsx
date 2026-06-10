import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';
import type { MatchedExercise } from '../../../utils/digitalCoachExercises';

interface Props {
  items: MatchedExercise[];
  selectedId: string | null;
  onSelect: (item: MatchedExercise) => void;
}

export function CoachExercisePicker({ items, selectedId, onSelect }: Props) {
  return (
    <View style={styles.list}>
      {items.map((item) => {
        const supported = item.serviceName !== null;
        const selected = item.exercise.id === selectedId;
        return (
          <Pressable
            key={item.exercise.id}
            disabled={!supported}
            onPress={() => onSelect(item)}
            style={[styles.row, selected && styles.rowSelected, !supported && styles.rowDisabled]}
          >
            <Text style={[styles.name, !supported && styles.nameDisabled]}>{item.exercise.name}</Text>
            {supported ? (
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selected ? theme.colors.primary : theme.colors.muted}
              />
            ) : (
              <Text style={styles.soon}>Coming soon</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.10)',
  },
  rowDisabled: {
    opacity: 0.5,
  },
  name: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  nameDisabled: {
    color: theme.colors.muted,
  },
  soon: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
