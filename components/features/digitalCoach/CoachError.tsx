import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';

interface Props {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}

export function CoachError({ message, onRetry, retryLabel = 'Try again' }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={44} color="#ef4444" />
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>{retryLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  message: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  buttonText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 15,
  },
});
