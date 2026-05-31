import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { theme } from '../../../constants/theme';
import { useExercises } from '../../../hooks/useExercises';
import type { Exercise } from '../../../utils/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#f87171',
};

export function ExercisePickerModal({ visible, onClose, onSelect }: Props) {
  const { exercises, loading, error } = useExercises();

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pick an Exercise</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.statusCenter}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.statusText}>Loading exercises…</Text>
          </View>
        ) : error ? (
          <View style={styles.statusCenter}>
            <Text style={styles.statusText}>Error loading exercises.</Text>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        ) : (
          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }: { item: Exercise }) => {
              const isReps = item.type === 'reps';
              const diffColor = DIFFICULTY_COLORS[item.difficulty] ?? theme.colors.primary;
              return (
                <Pressable
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.rowName}>{item.name}</Text>
                  <View style={styles.badges}>
                    <View style={[styles.typeBadge, isReps ? styles.typeBadgeReps : styles.typeBadgeTimed]}>
                      <Text style={[styles.typeBadgeText, isReps ? styles.typeTextReps : styles.typeTextTimed]}>
                        {isReps ? 'REPS' : 'TIMED'}
                      </Text>
                    </View>
                    <View style={[styles.diffBadge, { backgroundColor: diffColor + '22', borderColor: diffColor }]}>
                      <Text style={[styles.diffBadgeText, { color: diffColor }]}>
                        {item.difficulty.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={<Text style={styles.statusText}>No exercises found.</Text>}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  closeText: {
    color: theme.colors.muted,
    fontWeight: '600',
    fontSize: 14,
  },
  statusCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: theme.colors.muted,
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#f87171',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  typeBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  typeBadgeReps: {
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderColor: theme.colors.primary,
  },
  typeBadgeTimed: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderColor: theme.colors.accent,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  typeTextReps: {
    color: theme.colors.primary,
  },
  typeTextTimed: {
    color: theme.colors.accent,
  },
  diffBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
