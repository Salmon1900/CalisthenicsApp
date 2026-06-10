import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';
import { LOW_POSE_RATIO } from '../../../constants/digitalCoach';
import type { AnalysisMeta } from '../../../types/digitalCoach';

interface Props {
  meta: AnalysisMeta;
}

/** Soft note when body tracking was partial, plus any non-fatal server warnings. */
export function MetaNote({ meta }: Props) {
  const partialTracking = meta.pose_detected_ratio < LOW_POSE_RATIO;
  if (!partialTracking && meta.warnings.length === 0) return null;

  return (
    <View style={styles.card}>
      <Ionicons name="information-circle-outline" size={18} color="#f59e0b" style={styles.icon} />
      <View style={styles.body}>
        {partialTracking && (
          <Text style={styles.text}>
            Tracking was partial ({Math.round(meta.pose_detected_ratio * 100)}% of the clip). For a more
            reliable read, keep your whole body in frame with good lighting.
          </Text>
        )}
        {meta.warnings.map((warning) => (
          <Text key={warning} style={styles.text}>
            {warning}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.10)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  icon: {
    marginTop: 1,
    marginRight: 10,
  },
  body: {
    flex: 1,
    gap: 6,
  },
  text: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
});
