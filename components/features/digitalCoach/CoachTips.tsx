import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';

interface Props {
  tips: string[];
}

export function CoachTips({ tips }: Props) {
  if (tips.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Coaching tips</Text>
      <View style={styles.card}>
        {tips.map((tip) => (
          <View key={tip} style={styles.row}>
            <Ionicons name="bulb-outline" size={16} color={theme.colors.accent} style={styles.icon} />
            <Text style={styles.text}>{tip}</Text>
          </View>
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginTop: 2,
    marginRight: 10,
  },
  text: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
