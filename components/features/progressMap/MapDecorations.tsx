import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { ZoneAmbient } from './ZoneAmbient';
import type { ZoneId } from './ZoneAmbient';

interface Props {
  canvasHeight: number;
  screenWidth: number;
}

// Ordered top-to-bottom on canvas, matching MapBackground zone order.
const ZONES: ZoneId[] = ['space', 'sky', 'mountain', 'forest', 'cave'];

function TwinkleStar({ x, y, radius, duration, delay }: {
  x: number; y: number; radius: number; duration: number; delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation;
    const t = setTimeout(() => {
      loop = Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ]));
      loop.start();
    }, delay);
    return () => { clearTimeout(t); loop?.stop(); };
  }, []);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.55] });
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute',
      left: x - radius,
      top: y - radius,
      width: radius * 2,
      height: radius * 2,
      borderRadius: radius,
      backgroundColor: '#ffffff',
      opacity,
    }} />
  );
}

function StarField({ canvasHeight, screenWidth }: { canvasHeight: number; screenWidth: number }) {
  const STAR_COUNT = 55;
  return (
    <>
      {Array.from({ length: STAR_COUNT }, (_, i) => {
        const x = (screenWidth * ((i * 137 + 41) % 100)) / 100;
        const y = (canvasHeight * ((i * 97 + 13) % 100)) / 100;
        const radius = 1 + (i % 3);
        const duration = 800 + (i * 317 % 1000);
        const delay = i * 89;
        return (
          <TwinkleStar key={`star-${i}`} x={x} y={y} radius={radius} duration={duration} delay={delay} />
        );
      })}
    </>
  );
}

export const MapDecorations = React.memo(function MapDecorations({ canvasHeight, screenWidth }: Props) {
  const zoneHeight = canvasHeight / ZONES.length;
  return (
    <>
      <StarField canvasHeight={canvasHeight} screenWidth={screenWidth} />
      {ZONES.map((zone, i) => (
        <ZoneAmbient
          key={zone}
          zone={zone}
          yOffset={i * zoneHeight}
          zoneHeight={zoneHeight}
          screenWidth={screenWidth}
        />
      ))}
    </>
  );
});
