import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer } from 'expo-video';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';
import { useAnalyzeVideo } from '../hooks/useAnalyzeVideo';
import { CoachVideoPlayer } from '../components/features/digitalCoach/CoachVideoPlayer';
import { ScoreHeadline } from '../components/features/digitalCoach/ScoreHeadline';
import { MetaNote } from '../components/features/digitalCoach/MetaNote';
import { RemarkTimeline } from '../components/features/digitalCoach/RemarkTimeline';
import { CoachTips } from '../components/features/digitalCoach/CoachTips';
import { AnalyzingState } from '../components/features/digitalCoach/AnalyzingState';
import { CoachError } from '../components/features/digitalCoach/CoachError';

type Props = NativeStackScreenProps<RootStackParamList, 'DigitalCoachResult'>;

export default function DigitalCoachResultScreen({ route, navigation }: Props) {
  const { exerciseDisplayName, videoUri } = route.params;
  const insets = useSafeAreaInsets();
  const { analyzing, result, error, run } = useAnalyzeVideo();
  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    run({ exerciseName: exerciseDisplayName, videoUri });
    // Run once for this clip; retry is triggered explicitly from the error view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSeek = (seconds: number) => {
    player.currentTime = seconds;
    player.play();
  };

  if (analyzing) return <AnalyzingState />;

  if (error) {
    return (
      <CoachError
        message={error.message}
        onRetry={() => run({ exerciseName: exerciseDisplayName, videoUri })}
      />
    );
  }

  if (!result) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.exercise}>{result.exercise}</Text>
        <CoachVideoPlayer player={player} />
        <ScoreHeadline
          score={result.analysis.score}
          repCount={result.rep_count}
          holdSeconds={result.hold_seconds}
        />
        <MetaNote meta={result.meta} />
        <RemarkTimeline remarks={result.analysis.remarks} onSeek={handleSeek} />
        <CoachTips tips={result.analysis.tips} />
        <Pressable style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Analyze another</Text>
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
  scroll: {
    padding: 18,
    gap: 18,
  },
  exercise: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  button: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
});
