import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

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

export function BouncingEmojis({ level, x, y }: { level: number; x: number; y: number }) {
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

  const translateYValues = anims.map(anim =>
    anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] })
  );

  return (
    <>
      {emojis.map((emoji, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[styles.emoji, {
            left: x + BOUNCE_OFFSETS[i].dx,
            top: y + BOUNCE_OFFSETS[i].dy,
            transform: [{ translateY: translateYValues[i] }],
          }]}
        >
          <Text style={styles.emojiText}>{emoji}</Text>
        </Animated.View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  emoji: {
    position: 'absolute',
  },
  emojiText: {
    fontSize: 15,
  },
});
