import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { getDifficultyColor, getDifficultyLabel } from '../../utils/difficulty';

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const THUMB = 24;
const DOT = 6;
const N = LEVELS.length;

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function DifficultySlider({ value, onChange }: Props) {
  const [ready, setReady] = useState(false);
  const twRef = useRef(0);
  const ciRef = useRef(value - 1);
  ciRef.current = value - 1;
  const startX = useRef(0);
  const animX = useRef(new Animated.Value(0)).current;

  function stopX(idx: number, tw = twRef.current) {
    return tw === 0 ? 0 : (idx * (tw - THUMB)) / (N - 1);
  }

  function nearest(x: number) {
    const step = (twRef.current - THUMB) / (N - 1);
    return step > 0 ? Math.round(Math.max(0, Math.min(N - 1, x / step))) : 0;
  }

  useEffect(() => {
    if (twRef.current === 0) return;
    Animated.spring(animX, {
      toValue: stopX(ciRef.current),
      useNativeDriver: false,
      tension: 180,
      friction: 10,
    }).start();
  }, [value]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        animX.stopAnimation();
        startX.current = stopX(ciRef.current);
      },
      onPanResponderMove: (_, { dx }) => {
        const tw = twRef.current;
        animX.setValue(Math.max(0, Math.min(tw - THUMB, startX.current + dx)));
      },
      onPanResponderRelease: (e, { dx }) => {
        const rawX = Math.abs(dx) < 4
          ? e.nativeEvent.locationX - THUMB / 2
          : startX.current + dx;
        onChange(LEVELS[nearest(rawX)]);
      },
    })
  ).current;

  const currentIndex = value - 1;
  const color = getDifficultyColor(value);

  return (
    <View style={styles.container}>
      <View
        style={styles.wrapper}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          twRef.current = w;
          animX.setValue(stopX(currentIndex, w));
          setReady(true);
        }}
        {...pan.panHandlers}
      >
        <View style={styles.track} />
        {ready && <Animated.View style={[styles.fill, { width: animX, backgroundColor: color }]} />}
        {ready && LEVELS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { left: stopX(i) + THUMB / 2 - DOT / 2 },
              i <= currentIndex && { backgroundColor: color },
            ]}
          />
        ))}
        {ready && (
          <Animated.View
            style={[
              styles.thumb,
              { transform: [{ translateX: animX }], backgroundColor: color, shadowColor: color },
            ]}
          />
        )}
      </View>
      <Text style={[styles.label, { color }]}>
        {value} — {getDifficultyLabel(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  wrapper: {
    height: THUMB + 12,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: THUMB / 2,
    right: THUMB / 2,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
  },
  fill: {
    position: 'absolute',
    left: THUMB / 2,
    height: 3,
    borderRadius: 2,
  },
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    top: (THUMB + 12 - DOT) / 2,
  },
  thumb: {
    position: 'absolute',
    top: 6,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
});
