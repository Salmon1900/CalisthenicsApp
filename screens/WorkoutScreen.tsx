import { useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';
import { formatElapsed } from '../utils/formatTime';
import { usePlanExercises } from '../hooks/usePlanExercises';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { useSaveWorkout } from '../hooks/useSaveWorkout';
import { useDeviceUserId } from '../hooks/useDeviceUserId';
import { WorkoutTimer } from '../components/features/workout/WorkoutTimer';
import { WorkoutExerciseCard } from '../components/features/workout/WorkoutExerciseCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Workout'>;

export default function WorkoutScreen({ route, navigation }: Props) {
  const { plan } = route.params;
  const insets = useSafeAreaInsets();

  const { planExercises, loading, error, refetch } = usePlanExercises();
  const { elapsedSeconds, isRunning, pause, resume } = useWorkoutTimer();
  const session = useWorkoutSession(planExercises);
  const { saveWorkout, saving } = useSaveWorkout();
  const userId = useDeviceUserId();

  useEffect(() => {
    refetch(plan.id);
  }, [plan.id]);

  const handleToggleTimer = () => {
    if (isRunning) pause();
    else resume();
  };

  const handleCancel = () => {
    Alert.alert('Cancel workout?', "Your progress won't be saved.", [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const handleFinish = async () => {
    const ok = await saveWorkout({
      workout_plan_id: plan.id,
      user_id: userId,
      duration_seconds: elapsedSeconds,
      completion_percentage: session.completionPercentage,
    });
    if (ok) {
      Alert.alert(
        'Workout complete',
        `Time: ${formatElapsed(elapsedSeconds)}\nCompleted: ${session.completionPercentage}%`,
        [{ text: 'Done', onPress: () => navigation.goBack() }],
      );
    } else {
      Alert.alert('Could not save', 'Something went wrong saving your workout. Please try again.');
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.statusCenter}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.statusText}>Loading workout…</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.statusCenter}>
          <Text style={styles.statusText}>Error loading workout.</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      );
    }
    if (session.total === 0 || !session.current) {
      return (
        <View style={styles.statusCenter}>
          <Text style={styles.statusText}>No exercises in this plan.</Text>
        </View>
      );
    }

    return (
      <View style={styles.body}>
        <WorkoutTimer elapsedSeconds={elapsedSeconds} isRunning={isRunning} onToggle={handleToggleTimer} />

        <Text style={styles.progress}>
          Exercise {session.currentIndex + 1} of {session.total}
        </Text>

        <WorkoutExerciseCard item={session.current} status={session.currentStatus} />

        <View style={styles.navRow}>
          <Pressable
            style={[styles.navButton, session.currentIndex === 0 && styles.navButtonDisabled]}
            onPress={session.goPrev}
            disabled={session.currentIndex === 0}
          >
            <Text style={styles.navButtonText}>‹ Prev</Text>
          </Pressable>
          <Pressable
            style={[
              styles.navButton,
              session.currentIndex >= session.total - 1 && styles.navButtonDisabled,
            ]}
            onPress={session.goNext}
            disabled={session.currentIndex >= session.total - 1}
          >
            <Text style={styles.navButtonText}>Next ›</Text>
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={[styles.actionButton, styles.skipButton]} onPress={session.markSkipped}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.completeButton]}
            onPress={session.markCompleted}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}
      edges={['top', 'bottom']}
    >
      <Text style={styles.planName} numberOfLines={1}>
        {plan.name}
      </Text>

      {renderBody()}

      <View style={styles.footer}>
        <Pressable style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.finishButton, saving && styles.finishButtonDisabled]}
          onPress={handleFinish}
          disabled={saving}
        >
          <Text style={styles.finishButtonText}>{saving ? 'Saving…' : 'Finish'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
  },
  planName: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  progress: {
    color: theme.colors.muted,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  skipButtonText: {
    color: theme.colors.muted,
    fontWeight: '700',
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: theme.colors.success,
  },
  completeButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 16,
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
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cancelButtonText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 16,
  },
  finishButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  finishButtonDisabled: {
    opacity: 0.6,
  },
  finishButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 16,
  },
});
