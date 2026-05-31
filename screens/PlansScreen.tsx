import { Alert, ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';
import { usePlans } from '../hooks/usePlans';
import { CreatePlanModal } from '../components/features/plans/CreatePlanModal';
import type { WorkoutPlan } from '../utils/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Plans'>;

export default function PlansScreen({ navigation }: Props) {
  const { plans, loading, error, refetch, createPlan, deletePlan } = usePlans();
  const insets = useSafeAreaInsets();
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = async (name: string, description: string) => {
    const created = await createPlan(name, description);
    if (created) {
      setShowCreate(false);
    }
  };

  const handleDelete = (plan: WorkoutPlan) => {
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete "${plan.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePlan(plan.id);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom + 18 }]}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Plans</Text>
        <Pressable style={styles.refreshButton} onPress={refetch}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.statusCenter}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.statusText}>Loading plans…</Text>
        </View>
      ) : error ? (
        <View style={styles.statusCenter}>
          <Text style={styles.statusText}>Error loading plans.</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: WorkoutPlan }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => navigation.navigate('PlanDetail', { plan: item })}
              onLongPress={() => handleDelete(item)}
            >
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.arrow}>{'›'}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.statusText}>No plans yet. Create your first one!</Text>
          }
        />
      )}

      <Pressable style={styles.createButton} onPress={() => setShowCreate(true)}>
        <Text style={styles.createButtonText}>+ Create Plan</Text>
      </Pressable>

      <CreatePlanModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreate}
        title="Create Plan"
      />
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardBody: {
    flex: 1,
  },
  cardName: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cardDescription: {
    color: theme.colors.muted,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  arrow: {
    color: theme.colors.muted,
    fontSize: 22,
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: theme.colors.accent,
    marginHorizontal: 0,
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  createButtonText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
});
