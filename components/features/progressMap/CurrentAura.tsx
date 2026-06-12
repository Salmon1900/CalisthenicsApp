import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function CurrentAura({ x, y }: { x: number; y: number }) {
  const outer = useRef(new Animated.Value(0)).current;
  const inner = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const outerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(outer, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(outer, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    );
    // Inner ring pulses opposite phase
    const innerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(inner, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(inner, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    );
    outerLoop.start();
    setTimeout(() => innerLoop.start(), 800);
    return () => {
      outerLoop.stop();
      innerLoop.stop();
    };
  }, []);

  const outerScale = outer.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const outerOpacity = outer.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.9] });
  const innerScale = inner.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const innerOpacity = inner.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 90,
          height: 90,
          left: x - 45,
          top: y - 45,
          borderRadius: 45,
          backgroundColor: 'rgba(56,189,248,0.18)',
          transform: [{ scale: outerScale }],
          opacity: outerOpacity,
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 66,
          height: 66,
          left: x - 33,
          top: y - 33,
          borderRadius: 33,
          backgroundColor: 'rgba(56,189,248,0.28)',
          transform: [{ scale: innerScale }],
          opacity: innerOpacity,
        }}
      />
    </>
  );
}
