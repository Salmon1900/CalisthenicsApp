import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';
import { FILMING_INSTRUCTIONS } from '../../../constants/digitalCoach';

export function CoachInstructions() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="videocam-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.title}>Before you film</Text>
      </View>
      {FILMING_INSTRUCTIONS.map((line) => (
        <View key={line} style={styles.row}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} style={styles.bullet} />
          <Text style={styles.text}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.18)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    marginTop: 2,
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
