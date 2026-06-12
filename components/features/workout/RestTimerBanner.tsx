import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../constants/theme';

interface Props {
  secondsLeft: number;
  onSkip: () => void;
}

export function RestTimerBanner({ secondsLeft, onSkip }: Props) {
  return (
    <View style={styles.banner}>
      <View>
        <Text style={styles.label}>Rest</Text>
        <Text style={styles.countdown}>{secondsLeft}s</Text>
      </View>
      <Pressable style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipText}>Skip rest</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  countdown: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  skipText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
});
