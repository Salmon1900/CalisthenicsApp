import { StyleSheet, Text, View } from 'react-native';
import { getDifficultyColor, getDifficultyColorAlpha, getDifficultyLabel } from '../../utils/difficulty';

interface Props {
  difficulty: number;
}

export function DifficultyBadge({ difficulty }: Props) {
  const color = getDifficultyColor(difficulty);
  return (
    <View style={[styles.badge, { backgroundColor: getDifficultyColorAlpha(difficulty, 0.13), borderColor: color }]}>
      <Text style={[styles.text, { color }]}>
        {getDifficultyLabel(difficulty).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
