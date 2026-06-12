import { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';
import type { Exercise, WorkoutPlan, WorkoutPlanExercise } from '../utils/supabase';
import { usePlanExercises } from '../hooks/usePlanExercises';
import { usePlans } from '../hooks/usePlans';
import { CreatePlanModal } from '../components/features/plans/CreatePlanModal';
import { ExercisePickerModal } from '../components/features/plans/ExercisePickerModal';
import { PlanExerciseEditorModal } from '../components/features/plans/PlanExerciseEditorModal';
import { PlanExerciseRow } from '../components/features/plans/PlanExerciseRow';
import type { PlanExerciseConfig } from '../utils/queryFunctions';

type PlanExerciseWithExercise = WorkoutPlanExercise & { exercise: Exercise };
type Props = NativeStackScreenProps<RootStackParamList, 'PlanDetail'>;

export default function PlanDetailScreen({ route, navigation }: Props) {
  const { plan: initialPlan, locked = false } = route.params;
  const [plan, setPlan] = useState<WorkoutPlan>(initialPlan);
  const [showEdit, setShowEdit] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [editingExercise, setEditingExercise] = useState<PlanExerciseWithExercise | null>(null);
  const insets = useSafeAreaInsets();

  const { planExercises, loading, error, refetch, addExercise, removeExercise, reorderExercises, updateConfig } =
    usePlanExercises();
  const { updatePlan, deletePlan } = usePlans();

  useEffect(() => {
    refetch(plan.id);
  }, [plan.id]);

  const handleDelete = () => {
    Alert.alert('Delete Plan', `Delete "${plan.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePlan(plan.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleEditSave = async (name: string, description: string) => {
    const success = await updatePlan(plan.id, { name, description: description || null });
    if (success) {
      setPlan((prev) => ({ ...prev, name, description: description || null }));
      navigation.setOptions({ title: name });
    }
    setShowEdit(false);
  };

  const handlePickExercise = async (exercise: Exercise) => {
    const defaultQty = exercise.type === 'reps' ? 10 : 30;
    const added = await addExercise(plan.id, exercise.id, defaultQty);
    if (added) await refetch(plan.id);
  };

  const handleRemove = async (id: string) => {
    await removeExercise(id);
    await refetch(plan.id);
  };

  const handleEditConfig = async (config: PlanExerciseConfig) => {
    if (!editingExercise) return;
    await updateConfig(editingExercise.id, config);
    setEditingExercise(null);
    await refetch(plan.id);
  };

  const handleMoveUp = async (id: string) => {
    const index = planExercises.findIndex((pe) => pe.id === id);
    if (index <= 0) return;
    const above = planExercises[index - 1];
    const current = planExercises[index];
    await reorderExercises([
      { id: current.id, order_index: above.order_index },
      { id: above.id, order_index: current.order_index },
    ]);
    await refetch(plan.id);
  };

  const handleMoveDown = async (id: string) => {
    const index = planExercises.findIndex((pe) => pe.id === id);
    if (index >= planExercises.length - 1) return;
    const below = planExercises[index + 1];
    const current = planExercises[index];
    await reorderExercises([
      { id: current.id, order_index: below.order_index },
      { id: below.id, order_index: current.order_index },
    ]);
    await refetch(plan.id);
  };

  const renderItem = ({ item, index }: { item: PlanExerciseWithExercise; index: number }) => (
    <PlanExerciseRow
      item={item}
      isFirst={index === 0}
      isLast={index === planExercises.length - 1}
      onRemove={handleRemove}
      onEdit={setEditingExercise}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom + 16 }]} edges={['bottom']}>
      <View style={styles.planHeader}>
        <View style={styles.planTitleBlock}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.description ? (
            <Text style={styles.planDescription} numberOfLines={2}>
              {plan.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.editButton} onPress={() => setShowEdit(true)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
          <Pressable style={[styles.editButton, styles.deleteButton]} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
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
          data={planExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No exercises yet. Add your first one below!</Text>
          }
        />
      )}

      {planExercises.length > 0 ? (
        locked ? (
          <View style={styles.lockedBanner}>
            <Text style={styles.lockedText}>Complete all previous levels to unlock this workout</Text>
          </View>
        ) : (
          <Pressable
            style={styles.startButton}
            onPress={() => navigation.navigate('Workout', { plan })}
          >
            <Text style={styles.startButtonText}>▶ Start Workout</Text>
          </Pressable>
        )
      ) : null}

      <Pressable style={styles.addButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.addButtonText}>+ Add Exercise</Text>
      </Pressable>

      <CreatePlanModal
        visible={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={handleEditSave}
        initialName={plan.name}
        initialDescription={plan.description ?? ''}
        title="Edit Plan"
      />

      <ExercisePickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handlePickExercise}
      />

      <PlanExerciseEditorModal
        visible={editingExercise !== null}
        item={editingExercise}
        onClose={() => setEditingExercise(null)}
        onSave={handleEditConfig}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planTitleBlock: {
    flex: 1,
    marginRight: 12,
  },
  planName: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  planDescription: {
    color: theme.colors.muted,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  editButtonText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  deleteButton: {
    borderColor: 'rgba(248,113,113,0.25)',
  },
  deleteButtonText: {
    color: '#f87171',
    fontWeight: '700',
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
    paddingBottom: 16,
  },
  emptyText: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 32,
    fontSize: 15,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  startButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 16,
  },
  lockedBanner: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  lockedText: {
    color: theme.colors.muted,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  addButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  addButtonText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
});
