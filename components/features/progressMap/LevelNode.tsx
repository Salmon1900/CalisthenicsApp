import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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

const EMOJI_SETS = [
  ['💪', '🔥', '⚡'],
  ['🤸', '💥', '🎯'],
  ['🏃', '⚡', '💪'],
  ['🧘', '🌟', '💪'],
  ['🏋️', '🔥', '⚡'],
];

const BOUNCE_OFFSETS = [
  { dx: -26, dy: -30 },
  { dx: 20,  dy: -12 },
  { dx: -8,  dy: 20  },
];

function BossAura({ x, y }: { x: number; y: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: 130,
        height: 130,
        left: x - 65,
        top: y - 65,
        borderRadius: 65,
        backgroundColor: 'rgba(245,158,11,0.15)',
        transform: [{ scale }],
        opacity,
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 90,
          height: 90,
          left: 20,
          top: 20,
          borderRadius: 45,
          backgroundColor: 'rgba(245,158,11,0.22)',
        }}
      />
    </Animated.View>
  );
}

function BouncingEmojis({ level, x, y }: { level: number; x: number; y: number }) {
  const anims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const loops = anims.map((anim, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 850, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 850, useNativeDriver: true }),
        ])
      );
      timeouts.push(setTimeout(() => loop.start(), i * 280));
      return loop;
    });
    return () => {
      timeouts.forEach(clearTimeout);
      loops.forEach(l => l.stop());
    };
  }, []);

  const emojis = EMOJI_SETS[level % EMOJI_SETS.length] as string[];

  return (
    <>
      {emojis.map((emoji, i) => {
        const translateY = anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: x + BOUNCE_OFFSETS[i].dx,
              top: y + BOUNCE_OFFSETS[i].dy,
              transform: [{ translateY }],
            }}
          >
            <Text style={{ fontSize: 15 }}>{emoji}</Text>
          </Animated.View>
        );
      })}
    </>
  );
}

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
    <>
      {isBoss && <BossAura x={x} y={y} />}
      {state === 'unlocked' && <BouncingEmojis level={level} x={x} y={y} />}
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
    </>
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
