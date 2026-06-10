import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../constants/theme';
import type { Remark } from '../../../types/digitalCoach';
import { RemarkRow } from './RemarkRow';

interface Props {
  remarks: Remark[];
  onSeek: (timestampSeconds: number) => void;
}

/** Remarks as a vertical timeline, sorted by timestamp. Tap a row to seek the clip. */
export function RemarkTimeline({ remarks, onSeek }: Props) {
  if (remarks.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.heading}>Moments</Text>
        <Text style={styles.empty}>No specific issues flagged — nice and clean.</Text>
      </View>
    );
  }

  const sorted = [...remarks].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Moments</Text>
      <View style={styles.list}>
        {sorted.map((remark, index) => (
          <RemarkRow key={`${remark.timestamp_seconds}-${index}`} remark={remark} onPress={onSeek} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  heading: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  list: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  empty: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
