import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../constants/theme';
import { formatElapsed } from '../../../utils/formatTime';

interface Props {
  elapsedSeconds: number;
  isRunning: boolean;
  onToggle: () => void;
}

export function WorkoutTimer({ elapsedSeconds, isRunning, onToggle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatElapsed(elapsedSeconds)}</Text>
      <Pressable
        style={styles.toggleButton}
        onPress={onToggle}
        accessibilityLabel={isRunning ? 'Pause timer' : 'Resume timer'}
      >
        <Text style={styles.toggleText}>{isRunning ? '⏸' : '▶'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  time: {
    color: theme.colors.text,
    fontSize: 56,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  toggleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleText: {
    color: theme.colors.primary,
    fontSize: 20,
  },
});
