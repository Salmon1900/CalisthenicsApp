import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';
import { SEVERITY_COLORS, SEVERITY_LABELS } from '../../../constants/digitalCoach';
import type { Remark } from '../../../types/digitalCoach';

interface Props {
  remark: Remark;
  onPress: (timestampSeconds: number) => void;
}

function formatTimestamp(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

export function RemarkRow({ remark, onPress }: Props) {
  const color = SEVERITY_COLORS[remark.severity];
  return (
    <Pressable style={styles.row} onPress={() => onPress(remark.timestamp_seconds)}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.time}>{formatTimestamp(remark.timestamp_seconds)}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.tags}>
          <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
            <Text style={[styles.badgeText, { color }]}>{SEVERITY_LABELS[remark.severity]}</Text>
          </View>
          <Text style={styles.area}>{remark.area}</Text>
        </View>
        <Text style={styles.message}>{remark.message}</Text>
      </View>
      <Ionicons name="play-circle-outline" size={20} color={theme.colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  rail: {
    width: 44,
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  time: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    gap: 6,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  area: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  message: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
