import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';
import { useDigitalCoachExercises } from '../hooks/useDigitalCoachExercises';
import type { MatchedExercise } from '../utils/digitalCoachExercises';
import { pickVideo, type VideoSource } from '../utils/videoPicker';
import { openTrimEditor } from '../utils/videoTrimmer';
import { CoachInstructions } from '../components/features/digitalCoach/CoachInstructions';
import { CoachExercisePicker } from '../components/features/digitalCoach/CoachExercisePicker';
import { CoachError } from '../components/features/digitalCoach/CoachError';

type Props = NativeStackScreenProps<RootStackParamList, 'DigitalCoach'>;

export default function DigitalCoachScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { matched, loading, error, refetch } = useDigitalCoachExercises();
  const [selected, setSelected] = useState<MatchedExercise | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSource = async (source: VideoSource) => {
    if (busy) return;
    if (!selected?.serviceName) {
      Alert.alert('Pick an exercise', 'Choose an exercise to analyze first.');
      return;
    }
    setBusy(true);
    try {
      const picked = await pickVideo(source);
      if (picked.status === 'denied') {
        Alert.alert('Permission needed', 'Allow camera and photo access to analyze a video.');
        return;
      }
      if (picked.status !== 'picked' || !picked.uri) return;

      const trimmed = await openTrimEditor(picked.uri);
      if (!trimmed) return; // user cancelled the trimmer

      navigation.navigate('DigitalCoachResult', {
        exerciseDisplayName: selected.serviceName,
        videoUri: trimmed.uri,
      });
    } catch (err) {
      Alert.alert('Something went wrong', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <CoachError message="Couldn't load Digital Coach. Check your connection and try again." onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}>
        <CoachInstructions />
        <Text style={styles.sectionTitle}>Choose an exercise</Text>
        {loading ? (
          <Text style={styles.muted}>Loading exercises…</Text>
        ) : (
          <CoachExercisePicker
            items={matched}
            selectedId={selected?.exercise.id ?? null}
            onSelect={setSelected}
          />
        )}
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={() => handleSource('camera')}
          disabled={busy}
        >
          <Ionicons name="videocam" size={20} color={theme.colors.background} />
          <Text style={styles.buttonText}>{busy ? 'Working…' : 'Record video'}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.buttonSecondary, busy && styles.buttonDisabled]}
          onPress={() => handleSource('library')}
          disabled={busy}
        >
          <Ionicons name="images" size={20} color={theme.colors.text} />
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Choose from gallery</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: 18,
    gap: 18,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  muted: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 10,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.card,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 15,
  },
  buttonTextSecondary: {
    color: theme.colors.text,
  },
});
