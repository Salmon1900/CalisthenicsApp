import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseDetail'>;

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#f87171',
};

export default function ExerciseDetailScreen({ route }: Props) {
  const { exercise } = route.params;
  const difficultyColor = DIFFICULTY_COLORS[exercise.difficulty] ?? theme.colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{exercise.name}</Text>

        <View style={[styles.badge, { backgroundColor: difficultyColor + '22', borderColor: difficultyColor }]}>
          <Text style={[styles.badgeText, { color: difficultyColor }]}>
            {exercise.difficulty.toUpperCase()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>
            {exercise.description ?? 'No description available.'}
          </Text>
        </View>
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
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginBottom: 28,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
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
});
