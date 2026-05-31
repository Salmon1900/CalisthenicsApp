import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';
import { useExercises } from '../hooks/useExercises';
import type { Exercise } from '../utils/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Exercises'>;

export default function ExercisesScreen({ navigation }: Props) {
  const { exercises, loading, error, refetch } = useExercises();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom + 18 }]}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Exercises</Text>
        <Pressable style={styles.refreshButton} onPress={refetch}>
          <Text style={styles.refreshText}>Refresh</Text>
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
          renderItem={({ item }: { item: Exercise }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
            >
              <Text style={styles.rowText}>{item.name}</Text>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.statusText}>No exercises found yet.</Text>}
        />
      )}

      <Pressable style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  refreshButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
  },
  refreshText: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
  statusCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
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
    paddingBottom: 24,
  },
  row: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
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
  rowText: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  arrow: {
    color: theme.colors.muted,
    fontSize: 22,
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: theme.colors.accent,
    marginHorizontal: 18,
    marginBottom: 24,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
});
