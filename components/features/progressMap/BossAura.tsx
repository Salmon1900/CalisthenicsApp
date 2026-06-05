import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function BossAura({ x, y }: { x: number; y: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.outerRing,
        {
          left: x - 65,
          top: y - 65,
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      <View style={styles.innerRing} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  innerRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    left: 20,
    top: 20,
    borderRadius: 45,
    backgroundColor: 'rgba(245,158,11,0.22)',
  },
});
