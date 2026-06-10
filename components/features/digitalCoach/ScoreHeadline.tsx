import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../constants/theme';

interface Props {
  score: number;
  repCount: number | null;
  holdSeconds: number | null;
}

function scoreColor(score: number): string {
  if (score >= 80) return theme.colors.success;
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Great form';
  if (score >= 50) return 'Solid, room to refine';
  return 'Needs work';
}

export function ScoreHeadline({ score, repCount, holdSeconds }: Props) {
  const color = scoreColor(score);
  const metric =
    holdSeconds !== null
      ? { value: `${Math.round(holdSeconds)}s`, label: 'Hold' }
      : repCount !== null
        ? { value: `${repCount}`, label: repCount === 1 ? 'Rep' : 'Reps' }
        : null;

  return (
    <View style={styles.card}>
      <View style={[styles.dial, { borderColor: color }]}>
        <Text style={[styles.score, { color }]}>{score}</Text>
        <Text style={styles.outOf}>/ 100</Text>
      </View>
      <View style={styles.meta}>
        <Text style={[styles.label, { color }]}>{scoreLabel(score)}</Text>
        {metric && (
          <Text style={styles.metric}>
            <Text style={styles.metricValue}>{metric.value}</Text> {metric.label}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 18,
  },
  dial: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
  },
  outOf: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 20,
    fontWeight: '800',
  },
  metric: {
    color: theme.colors.muted,
    fontSize: 15,
  },
  metricValue: {
    color: theme.colors.text,
    fontWeight: '800',
  },
});
