import { StyleSheet, View } from 'react-native';
import { theme } from '../../../constants/theme';

interface Props {
  totalSets: number;
  completedSets: number;
  /** 0-based index of the set currently in progress. */
  currentSetIndex: number;
}

export function SetStepper({ totalSets, completedSets, currentSetIndex }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalSets }, (_, i) => {
        const isCompleted = i < completedSets;
        const isCurrent = i === currentSetIndex && !isCompleted;
        return (
          <View
            key={i}
            style={[
              styles.segment,
              isCompleted && styles.segmentCompleted,
              isCurrent && styles.segmentCurrent,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'stretch',
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surface,
  },
  segmentCompleted: {
    backgroundColor: theme.colors.success,
  },
  segmentCurrent: {
    backgroundColor: theme.colors.primary,
  },
});
