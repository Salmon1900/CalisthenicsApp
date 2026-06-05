import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../../constants/theme';
import { useAddExercise } from '../../hooks/useAddExercise';
import type { Exercise } from '../../utils/supabase';
import { DifficultySlider } from '../ui/DifficultySlider';

type ExerciseType = Exercise['type'];

const TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'reps', label: 'Reps' },
  { value: 'timed', label: 'Timed' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddExerciseModal({ visible, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<number>(1);
  const [exerciseType, setExerciseType] = useState<ExerciseType>('reps');
  const [nameError, setNameError] = useState('');

  const { addExercise, loading, error } = useAddExercise();

  const resetForm = () => {
    setName('');
    setDescription('');
    setDifficulty(1);
    setExerciseType('reps');
    setNameError('');
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('Name is required.');
      return;
    }
    setNameError('');

    const success = await addExercise({
      name: name.trim(),
      description: description.trim() || null,
      difficulty,
      type: exerciseType,
    });

    if (success) {
      resetForm();
      onSuccess();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Add Exercise</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Pull-up"
            placeholderTextColor={theme.colors.muted}
          />
          {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}

          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the exercise…"
            placeholderTextColor={theme.colors.muted}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.chipRow}>
            {TYPES.map((t) => (
              <Pressable
                key={t.value}
                style={[styles.chip, exerciseType === t.value && styles.chipActive]}
                onPress={() => setExerciseType(t.value)}
              >
                <Text style={[styles.chipText, exerciseType === t.value && styles.chipTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Difficulty</Text>
          <DifficultySlider value={difficulty} onChange={setDifficulty} />

          {error ? <Text style={styles.saveError}>{error.message}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSave} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 22, 0.82)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  inputError: {
    borderColor: '#f87171',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  fieldError: {
    color: '#f87171',
    fontSize: 13,
    marginTop: -10,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  chipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  chipText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: theme.colors.text,
  },
  saveError: {
    color: '#f87171',
    fontSize: 14,
    marginBottom: 14,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cancelText: {
    color: theme.colors.muted,
    fontWeight: '700',
    fontSize: 15,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
  },
  saveText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
});
