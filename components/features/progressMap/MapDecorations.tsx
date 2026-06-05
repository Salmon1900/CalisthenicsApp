import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface Props {
  canvasHeight: number;
  screenWidth: number;
}

type DecorationType = 'pulse' | 'sway';

type Decoration = {
  emoji: string;
  xLeft: boolean;
  xOffset: number;
  yFraction: number;
  duration: number;
  type: DecorationType;
  size: number;
};

const DECORATIONS: Decoration[] = [
  // Left column — calisthenics figures
  { emoji: '🏋️', xLeft: true,  xOffset: 8,  yFraction: 0.04, duration: 5000, type: 'pulse', size: 28 },
  { emoji: '🤸',  xLeft: true,  xOffset: 10, yFraction: 0.13, duration: 4600, type: 'pulse', size: 26 },
  { emoji: '💪',  xLeft: true,  xOffset: 12, yFraction: 0.23, duration: 5400, type: 'pulse', size: 22 },
  { emoji: '🏃',  xLeft: true,  xOffset: 8,  yFraction: 0.34, duration: 4200, type: 'pulse', size: 26 },
  { emoji: '🧘',  xLeft: true,  xOffset: 10, yFraction: 0.45, duration: 5800, type: 'pulse', size: 24 },
  { emoji: '🏋️', xLeft: true,  xOffset: 8,  yFraction: 0.56, duration: 5000, type: 'pulse', size: 28 },
  { emoji: '🤸',  xLeft: true,  xOffset: 12, yFraction: 0.67, duration: 4800, type: 'pulse', size: 24 },
  { emoji: '💪',  xLeft: true,  xOffset: 8,  yFraction: 0.78, duration: 5200, type: 'pulse', size: 22 },
  { emoji: '🏃',  xLeft: true,  xOffset: 10, yFraction: 0.90, duration: 4400, type: 'pulse', size: 26 },
  // Right column — calisthenics figures
  { emoji: '🧘',  xLeft: false, xOffset: 30, yFraction: 0.08, duration: 5600, type: 'pulse', size: 24 },
  { emoji: '🏋️', xLeft: false, xOffset: 32, yFraction: 0.18, duration: 4800, type: 'pulse', size: 28 },
  { emoji: '🏃',  xLeft: false, xOffset: 28, yFraction: 0.29, duration: 5200, type: 'pulse', size: 26 },
  { emoji: '💪',  xLeft: false, xOffset: 30, yFraction: 0.40, duration: 4600, type: 'pulse', size: 22 },
  { emoji: '🤸',  xLeft: false, xOffset: 28, yFraction: 0.51, duration: 5000, type: 'pulse', size: 26 },
  { emoji: '🧘',  xLeft: false, xOffset: 32, yFraction: 0.62, duration: 4400, type: 'pulse', size: 24 },
  { emoji: '🏋️', xLeft: false, xOffset: 28, yFraction: 0.73, duration: 5400, type: 'pulse', size: 28 },
  { emoji: '🏃',  xLeft: false, xOffset: 30, yFraction: 0.84, duration: 4800, type: 'pulse', size: 26 },
  { emoji: '💪',  xLeft: false, xOffset: 28, yFraction: 0.95, duration: 5800, type: 'pulse', size: 22 },
  // Terrain — left
  { emoji: '🌲', xLeft: true,  xOffset: 2, yFraction: 0.01, duration: 5000, type: 'sway', size: 20 },
  { emoji: '🌿', xLeft: true,  xOffset: 4, yFraction: 0.25, duration: 4800, type: 'sway', size: 18 },
  { emoji: '🌲', xLeft: true,  xOffset: 2, yFraction: 0.50, duration: 5200, type: 'sway', size: 20 },
  { emoji: '🌿', xLeft: true,  xOffset: 4, yFraction: 0.75, duration: 4600, type: 'sway', size: 18 },
  { emoji: '🌲', xLeft: true,  xOffset: 2, yFraction: 0.98, duration: 5000, type: 'sway', size: 20 },
  // Terrain — right
  { emoji: '🌿', xLeft: false, xOffset: 26, yFraction: 0.10, duration: 4800, type: 'sway', size: 18 },
  { emoji: '🌲', xLeft: false, xOffset: 24, yFraction: 0.35, duration: 5200, type: 'sway', size: 20 },
  { emoji: '🌿', xLeft: false, xOffset: 26, yFraction: 0.60, duration: 4600, type: 'sway', size: 18 },
  { emoji: '🌲', xLeft: false, xOffset: 24, yFraction: 0.85, duration: 5000, type: 'sway', size: 20 },
];

const STAR_POSITIONS = [
  { xLeft: true,  xOffset: 38, yFraction: 0.06 },
  { xLeft: false, xOffset: 52, yFraction: 0.15 },
  { xLeft: true,  xOffset: 42, yFraction: 0.24 },
  { xLeft: false, xOffset: 56, yFraction: 0.33 },
  { xLeft: true,  xOffset: 36, yFraction: 0.42 },
  { xLeft: false, xOffset: 50, yFraction: 0.51 },
  { xLeft: true,  xOffset: 44, yFraction: 0.60 },
  { xLeft: false, xOffset: 54, yFraction: 0.69 },
  { xLeft: true,  xOffset: 38, yFraction: 0.78 },
  { xLeft: false, xOffset: 48, yFraction: 0.87 },
];

function DecorationItem({
  emoji, x, y, duration, type, size,
}: {
  emoji: string; x: number; y: number; duration: number; type: DecorationType; size: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  if (type === 'sway') {
    const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.decoration, { left: x, top: y, opacity: 0.22, transform: [{ rotate }] }]}
      >
        <Text style={{ fontSize: size }}>{emoji}</Text>
      </Animated.View>
    );
  }

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.28] });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.decoration, { left: x, top: y, opacity }]}
    >
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </Animated.View>
  );
}

function StarSpeck({ x, y, duration }: { x: number; y: number; duration: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.25] });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.decoration, { left: x, top: y, opacity }]}
    >
      <Text style={styles.starText}>✦</Text>
    </Animated.View>
  );
}

export function MapDecorations({ canvasHeight, screenWidth }: Props) {
  return (
    <>
      {DECORATIONS.map((d, i) => {
        const x = d.xLeft ? d.xOffset : screenWidth - d.xOffset - d.size;
        const y = canvasHeight * d.yFraction;
        return (
          <DecorationItem
            key={i}
            emoji={d.emoji}
            x={x}
            y={y}
            duration={d.duration}
            type={d.type}
            size={d.size}
          />
        );
      })}
      {STAR_POSITIONS.map((s, i) => {
        const x = s.xLeft ? s.xOffset : screenWidth - s.xOffset;
        const y = canvasHeight * s.yFraction;
        return (
          <StarSpeck key={`star-${i}`} x={x} y={y} duration={2500 + (i * 317) % 1500} />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  decoration: {
    position: 'absolute',
  },
  starText: {
    fontSize: 8,
    color: '#f8fafc',
  },
});
