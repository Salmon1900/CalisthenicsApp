import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../constants/theme';

export function AnalyzingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.title}>Analyzing your set…</Text>
      <Text style={styles.subtitle}>
        Our coach is reviewing every frame of your technique. This can take up to a minute — hang tight.
      </Text>
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
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
