import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../../../constants/theme';
import { DEFAULT_REST_SECONDS } from '../../../utils/queryFunctions';
import type { PlanExerciseConfig, PlanExerciseWithExercise } from '../../../utils/queryFunctions';
import { hasSetOverrides, reconcileSetReps } from '../../../utils/sets';

interface Props {
  visible: boolean;
  item: PlanExerciseWithExercise | null;
  onClose: () => void;
  onSave: (config: PlanExerciseConfig) => Promise<void>;
}

const MAX_SETS = 10;

function parsePositive(text: string, fallback: number): number {
  const parsed = parseInt(text, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : fallback;
}

export function PlanExerciseEditorModal({ visible, item, onClose, onSave }: Props) {
  const [sets, setSets] = useState(3);
  const [baseText, setBaseText] = useState('10');
  const [restText, setRestText] = useState(String(DEFAULT_REST_SECONDS));
  const [overrideOn, setOverrideOn] = useState(false);
  const [setRepsText, setSetRepsText] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Reload form whenever a different exercise is opened.
  useEffect(() => {
    if (!item) return;
    setSets(item.sets);
    setBaseText(String(item.quantity));
    setRestText(String(item.rest_seconds));
    const override = hasSetOverrides(item);
    setOverrideOn(override);
    setSetRepsText(reconcileSetReps(item.set_reps, item.sets, item.quantity).map(String));
  }, [item?.id]);

  if (!item) return null;

  const isReps = item.exercise.type === 'reps';
  const unitLabel = isReps ? 'Reps per set' : 'Seconds per set';

  const changeSets = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), MAX_SETS);
    setSets(clamped);
    const base = parsePositive(baseText, item.quantity);
    setSetRepsText((prev) =>
      reconcileSetReps(prev.map((t) => parsePositive(t, base)), clamped, base).map(String),
    );
  };

  const changeSetRep = (index: number, text: string) => {
    setSetRepsText((prev) => prev.map((t, i) => (i === index ? text : t)));
  };

  const handleSave = async () => {
    const base = parsePositive(baseText, item.quantity);
    const rest = Math.max(parseInt(restText, 10) || 0, 0);
    const set_reps = overrideOn
      ? reconcileSetReps(setRepsText.map((t) => parsePositive(t, base)), sets, base)
      : null;
    setSaving(true);
    try {
      await onSave({ quantity: base, sets, set_reps, rest_seconds: rest });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title} numberOfLines={1}>
            {item.exercise.name}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled" style={styles.scroll}>
            <Text style={styles.label}>Sets</Text>
            <View style={styles.stepperRow}>
              <Pressable style={styles.stepperButton} onPress={() => changeSets(sets - 1)}>
                <Text style={styles.stepperButtonText}>−</Text>
              </Pressable>
              <Text style={styles.stepperValue}>{sets}</Text>
              <Pressable style={styles.stepperButton} onPress={() => changeSets(sets + 1)}>
                <Text style={styles.stepperButtonText}>+</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>{unitLabel}</Text>
            <TextInput
              style={styles.input}
              value={baseText}
              onChangeText={setBaseText}
              keyboardType="numeric"
              selectTextOnFocus
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Different reps per set</Text>
              <Switch
                value={overrideOn}
                onValueChange={setOverrideOn}
                trackColor={{ true: theme.colors.primary, false: theme.colors.surface }}
              />
            </View>

            {overrideOn ? (
              <View style={styles.perSetWrap}>
                {Array.from({ length: sets }, (_, i) => (
                  <View key={i} style={styles.perSetItem}>
                    <Text style={styles.perSetLabel}>Set {i + 1}</Text>
                    <TextInput
                      style={styles.perSetInput}
                      value={setRepsText[i] ?? ''}
                      onChangeText={(t) => changeSetRep(i, t)}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={styles.label}>Rest between sets (sec)</Text>
            <TextInput
              style={styles.input}
              value={restText}
              onChangeText={setRestText}
              keyboardType="numeric"
              selectTextOnFocus
            />
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving ? (
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
    maxHeight: '85%',
  },
  scroll: {
    flexGrow: 0,
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
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stepperButtonText: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 26,
  },
  stepperValue: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    minWidth: 36,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  perSetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  perSetItem: {
    alignItems: 'center',
    gap: 4,
  },
  perSetLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  perSetInput: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 56,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
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
