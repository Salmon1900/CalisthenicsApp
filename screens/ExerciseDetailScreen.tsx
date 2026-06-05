import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';
import { useDeleteExercise } from '../hooks/useDeleteExercise';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseDetail'>;

export default function ExerciseDetailScreen({ route, navigation }: Props) {
  const { exercise } = route.params;
  const { deleteExercise, loading } = useDeleteExercise();

  const handleDelete = () => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exercise.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteExercise(exercise.id);
            if (success) navigation.navigate('Exercises');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{exercise.name}</Text>

        <View style={styles.badgeWrapper}>
          <DifficultyBadge difficulty={exercise.difficulty} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>
            {exercise.description ?? 'No description available.'}
          </Text>
        </View>

        <Pressable style={styles.deleteButton} onPress={handleDelete} disabled={loading}>
          {loading
            ? <ActivityIndicator color={theme.colors.text} />
            : <Text style={styles.deleteText}>Delete Exercise</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 24,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 16,
  },
  badgeWrapper: {
    marginBottom: 28,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  description: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  deleteButton: {
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#7f1d1d',
    borderWidth: 1,
    borderColor: '#f87171',
  },
  deleteText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 16,
  },
});
