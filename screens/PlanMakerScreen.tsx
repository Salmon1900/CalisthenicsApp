import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';
import { useExercises } from '../hooks/useExercises';
import { useGeneratePlan } from '../hooks/useGeneratePlan';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanMaker'>;

export default function PlanMakerScreen({ navigation }: Props) {
  const [goals, setGoals] = useState('');
  const [injuries, setInjuries] = useState('');
  const { exercises } = useExercises();
  const { generatePlan, isPending, error } = useGeneratePlan();

  const canGenerate = goals.trim().length > 0 && exercises.length > 0 && !isPending;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    try {
      const plan = await generatePlan({ goals: goals.trim(), injuries: injuries.trim(), exercises });
      navigation.replace('PlanDetail', { plan });
    } catch {
      // error is exposed via the hook
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={88}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>
            Describe your goals and any limitations — Claude will build you a personalized plan.
          </Text>

          <Text style={styles.label}>Goals *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. build upper body strength, improve flexibility"
            placeholderTextColor={theme.colors.muted}
            value={goals}
            onChangeText={setGoals}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isPending}
          />

          <Text style={styles.label}>Injuries or limitations</Text>
          <TextInput
            style={[styles.input, styles.inputShort]}
            placeholder="e.g. bad knees, shoulder injury  (optional)"
            placeholderTextColor={theme.colors.muted}
            value={injuries}
            onChangeText={setInjuries}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isPending}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error.message}</Text>
            </View>
          ) : null}

          {exercises.length === 0 && !isPending ? (
            <Text style={styles.warningText}>
              No exercises found in the database. Add some exercises first.
            </Text>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.generateButton, !canGenerate && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={!canGenerate}
          >
            {isPending ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={theme.colors.text} size="small" />
                <Text style={styles.generateButtonText}>Generating…</Text>
              </View>
            ) : (
              <Text style={styles.generateButtonText}>Generate Plan</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 8,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    color: theme.colors.text,
    fontSize: 15,
    padding: 14,
    minHeight: 100,
    marginBottom: 20,
  },
  inputShort: {
    minHeight: 80,
  },
  errorBox: {
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
  },
  warningText: {
    color: theme.colors.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  generateButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  generateButtonDisabled: {
    opacity: 0.45,
  },
  generateButtonText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
