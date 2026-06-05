import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';

export type LevelNodeState = 'locked' | 'unlocked' | 'completed';

interface LevelNodeProps {
  level: number;
  state: LevelNodeState;
  isBoss: boolean;
  x: number;
  y: number;
  onPress: () => void;
}

const NODE_SIZE_NORMAL = 56;
const NODE_SIZE_BOSS = 80;

export const NODE_SIZE_NORMAL_EXPORT = NODE_SIZE_NORMAL;
export const NODE_SIZE_BOSS_EXPORT = NODE_SIZE_BOSS;

export function LevelNode({ level, state, isBoss, x, y, onPress }: LevelNodeProps) {
  const size = isBoss ? NODE_SIZE_BOSS : NODE_SIZE_NORMAL;
  const iconSize = isBoss ? 24 : 18;

  const bgColor =
    state === 'completed'
      ? theme.colors.success
      : state === 'unlocked'
        ? theme.colors.primary
        : '#374151';

  return (
    <Pressable
      style={[
        styles.node,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          opacity: state === 'locked' ? 0.65 : 1,
          borderWidth: isBoss ? 3 : 0,
          borderColor: '#F59E0B',
          shadowColor: isBoss ? '#F59E0B' : '#000',
          shadowOpacity: isBoss ? 0.5 : 0.25,
          shadowRadius: isBoss ? 12 : 6,
          elevation: isBoss ? 8 : 4,
        },
      ]}
      onPress={onPress}
    >
      {state === 'locked' ? (
        <Ionicons name="lock-closed" size={iconSize} color="#9CA3AF" />
      ) : state === 'completed' ? (
        <Ionicons name="checkmark" size={iconSize + 4} color={theme.colors.background} />
      ) : (
        <Text style={[styles.levelNumber, { fontSize: isBoss ? 18 : 14 }]}>{level}</Text>
      )}

      {isBoss && (
        <View style={styles.starBadge}>
          <Text style={styles.starText}>★</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
  },
  levelNumber: {
    color: theme.colors.background,
    fontWeight: '800',
  },
  starBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starText: {
    fontSize: 11,
    color: '#fff',
    lineHeight: 14,
  },
});
