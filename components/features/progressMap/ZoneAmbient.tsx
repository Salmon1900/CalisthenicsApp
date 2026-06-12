import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export type ZoneId = 'cave' | 'forest' | 'mountain' | 'sky' | 'space';

interface Props {
  zone: ZoneId;
  yOffset: number;
  zoneHeight: number;
  screenWidth: number;
}

// --- Shared animated primitives ---

function PulsingOrb({ x, y, radius, color, minOpacity, maxOpacity, duration, delay }: {
  x: number; y: number; radius: number; color: string;
  minOpacity: number; maxOpacity: number; duration: number; delay: number;
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
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [minOpacity, maxOpacity] });
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: x - radius, top: y - radius,
      width: radius * 2, height: radius * 2, borderRadius: radius,
      backgroundColor: color, opacity,
    }} />
  );
}

function FloatingOrb({ x, y, radius, color, opacity, floatRange, duration, delay }: {
  x: number; y: number; radius: number; color: string;
  opacity: number; floatRange: number; duration: number; delay: number;
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
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -floatRange] });
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: x - radius, top: y - radius,
      width: radius * 2, height: radius * 2, borderRadius: radius,
      backgroundColor: color, opacity, transform: [{ translateY }],
    }} />
  );
}

function RotatedShard({ x, y, width, height, color, rotation, minOpacity, maxOpacity, duration, delay }: {
  x: number; y: number; width: number; height: number; color: string;
  rotation: number; minOpacity: number; maxOpacity: number; duration: number; delay: number;
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
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [minOpacity, maxOpacity] });
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: x, top: y, width, height,
      backgroundColor: color, opacity, transform: [{ rotate: `${rotation}deg` }],
    }} />
  );
}

function DriftingDot({ x, y, radius, color, minOpacity, maxOpacity, driftY, duration, delay }: {
  x: number; y: number; radius: number; color: string;
  minOpacity: number; maxOpacity: number; driftY: number; duration: number; delay: number;
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
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [minOpacity, maxOpacity] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, driftY] });
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: x - radius, top: y - radius,
      width: radius * 2, height: radius * 2, borderRadius: radius,
      backgroundColor: color, opacity, transform: [{ translateY }],
    }} />
  );
}

function DriftingLine({ x, y, width, height, color, minOpacity, maxOpacity, driftX, duration, delay }: {
  x: number; y: number; width: number; height: number; color: string;
  minOpacity: number; maxOpacity: number; driftX: number; duration: number; delay: number;
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
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [minOpacity, maxOpacity] });
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, driftX] });
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: x, top: y, width, height,
      backgroundColor: color, borderRadius: height / 2, opacity,
      transform: [{ translateX }],
    }} />
  );
}

function OrbitalRing({ x, y, radius, color, opacity, duration, delay }: {
  x: number; y: number; radius: number; color: string;
  opacity: number; duration: number; delay: number;
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
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['-5deg', '5deg'] });
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: x - radius, top: y - radius,
      width: radius * 2, height: radius * 2, borderRadius: radius,
      borderWidth: 2, borderColor: color, backgroundColor: 'transparent',
      opacity, transform: [{ rotate }],
    }} />
  );
}

// --- Zone-specific decoration components ---

function CaveZone({ yOffset, zoneHeight, screenWidth }: { yOffset: number; zoneHeight: number; screenWidth: number }) {
  const EMBER_COLORS = ['#ff6b1a', '#e84d00', '#ff9240', '#cc3300', '#ff7733'];
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <PulsingOrb
          key={`cave-ember-${i}`}
          x={(screenWidth * ((i * 97 + 11) % 100)) / 100}
          y={yOffset + (zoneHeight * ((i * 73 + 17) % 100)) / 100}
          radius={4 + (i * 31 % 7)}
          color={EMBER_COLORS[i % 5]}
          minOpacity={0.3}
          maxOpacity={0.7}
          duration={1500 + (i * 317 % 1500)}
          delay={i * 180}
        />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <RotatedShard
          key={`cave-crack-${i}`}
          x={screenWidth * 0.2 + i * 18}
          y={yOffset + zoneHeight * 0.72}
          width={14}
          height={2}
          color="#8b2200"
          rotation={(i % 2 === 0 ? 5 : -7) + i * 3}
          minOpacity={0.25}
          maxOpacity={0.45}
          duration={4000}
          delay={i * 200}
        />
      ))}
    </>
  );
}

function ForestZone({ yOffset, zoneHeight, screenWidth }: { yOffset: number; zoneHeight: number; screenWidth: number }) {
  const SPORE_COLORS = ['#00e5a0', '#00c87a', '#1aff9c', '#00d490', '#33ffb0'];
  const BLOB_X = [0.15, 0.55, 0.82];
  const BLOB_Y = [0.3, 0.65, 0.15];
  const BLOB_R = [80, 60, 70];
  const WISP_X = [0.1, 0.4, 0.65];
  const WISP_Y = [0.2, 0.5, 0.8];
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <FloatingOrb
          key={`forest-spore-${i}`}
          x={(screenWidth * ((i * 83 + 7) % 100)) / 100}
          y={yOffset + (zoneHeight * ((i * 67 + 23) % 100)) / 100}
          radius={6 + (i * 23 % 11)}
          color={SPORE_COLORS[i % 5]}
          opacity={0.25 + (i % 3) * 0.07}
          floatRange={10 + (i % 4) * 3}
          duration={3000 + (i * 400 % 2000)}
          delay={i * 210}
        />
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <PulsingOrb
          key={`forest-blob-${i}`}
          x={screenWidth * BLOB_X[i]}
          y={yOffset + zoneHeight * BLOB_Y[i]}
          radius={BLOB_R[i]}
          color="#003d1a"
          minOpacity={0.03}
          maxOpacity={0.05}
          duration={6000 + i * 800}
          delay={i * 1000}
        />
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <DriftingLine
          key={`forest-wisp-${i}`}
          x={screenWidth * WISP_X[i]}
          y={yOffset + zoneHeight * WISP_Y[i]}
          width={40 + i * 20}
          height={2}
          color="#00ff88"
          minOpacity={0.06}
          maxOpacity={0.12}
          driftX={8}
          duration={5000 + i * 700}
          delay={i * 500}
        />
      ))}
    </>
  );
}

function MountainZone({ yOffset, zoneHeight, screenWidth }: { yOffset: number; zoneHeight: number; screenWidth: number }) {
  const SHARD_COLORS = ['#b8e4ff', '#d4f0ff', '#a0d8f0', '#c8ecff'];
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => (
        <RotatedShard
          key={`mtn-shard-${i}`}
          x={(screenWidth * ((i * 71 + 5) % 100)) / 100}
          y={yOffset + (zoneHeight * ((i * 59 + 19) % 100)) / 100}
          width={2 + (i % 3)}
          height={20 + (i * 17 % 22)}
          color={SHARD_COLORS[i % 4]}
          rotation={-30 + (i * 37 % 60)}
          minOpacity={0.18}
          maxOpacity={0.35}
          duration={2500 + (i * 280 % 1500)}
          delay={i * 150}
        />
      ))}
      {Array.from({ length: 22 }, (_, i) => (
        <DriftingDot
          key={`mtn-snow-${i}`}
          x={(screenWidth * ((i * 89 + 3) % 100)) / 100}
          y={yOffset + (zoneHeight * ((i * 53 + 11) % 100)) / 100}
          radius={1.5}
          color="#ffffff"
          minOpacity={0.25}
          maxOpacity={0.55}
          driftY={10 + (i % 4) * 4}
          duration={4000 + (i * 370 % 3000)}
          delay={i * 120}
        />
      ))}
    </>
  );
}

function SkyZone({ yOffset, zoneHeight, screenWidth }: { yOffset: number; zoneHeight: number; screenWidth: number }) {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <DriftingLine
          key={`sky-cloud-${i}`}
          x={(screenWidth * ((i * 61 + 9) % 80)) / 100}
          y={yOffset + (zoneHeight * ((i * 43 + 15) % 100)) / 100}
          width={80 + (i * 31 % 50)}
          height={25 + (i * 13 % 25)}
          color="#ffffff"
          minOpacity={0.05}
          maxOpacity={0.11}
          driftX={(i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 3)}
          duration={5000 + i * 600}
          delay={i * 400}
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <DriftingLine
          key={`sky-wind-${i}`}
          x={(screenWidth * ((i * 79 + 13) % 90)) / 100}
          y={yOffset + (zoneHeight * ((i * 47 + 7) % 100)) / 100}
          width={30 + (i * 23 % 44)}
          height={1}
          color="#ffffff"
          minOpacity={0.05}
          maxOpacity={0.09}
          driftX={(i % 2 === 0 ? 1 : -1) * 6}
          duration={2200 + (i * 290 % 1200)}
          delay={i * 270}
        />
      ))}
    </>
  );
}

function SpaceZone({ yOffset, zoneHeight, screenWidth }: { yOffset: number; zoneHeight: number; screenWidth: number }) {
  const NEBULA_COLORS = ['#6b2faf', '#3b0f7a', '#b03cff', '#8b00ff', '#4a1575'];
  const NEBULA_X = [0.1, 0.7, 0.35, 0.85, 0.2];
  const NEBULA_Y = [0.15, 0.35, 0.6, 0.2, 0.8];
  const NEBULA_R = [140, 100, 160, 110, 120];
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <PulsingOrb
          key={`space-nebula-${i}`}
          x={screenWidth * NEBULA_X[i]}
          y={yOffset + zoneHeight * NEBULA_Y[i]}
          radius={NEBULA_R[i]}
          color={NEBULA_COLORS[i]}
          minOpacity={0.04}
          maxOpacity={0.08}
          duration={4000 + i * 700}
          delay={i * 800}
        />
      ))}
      <OrbitalRing
        x={screenWidth * 0.5}
        y={yOffset + zoneHeight * 0.4}
        radius={75}
        color="#38bdf8"
        opacity={0.08}
        duration={8000}
        delay={500}
      />
    </>
  );
}

// --- Public export ---

export function ZoneAmbient({ zone, yOffset, zoneHeight, screenWidth }: Props) {
  switch (zone) {
    case 'cave':     return <CaveZone yOffset={yOffset} zoneHeight={zoneHeight} screenWidth={screenWidth} />;
    case 'forest':   return <ForestZone yOffset={yOffset} zoneHeight={zoneHeight} screenWidth={screenWidth} />;
    case 'mountain': return <MountainZone yOffset={yOffset} zoneHeight={zoneHeight} screenWidth={screenWidth} />;
    case 'sky':      return <SkyZone yOffset={yOffset} zoneHeight={zoneHeight} screenWidth={screenWidth} />;
    case 'space':    return <SpaceZone yOffset={yOffset} zoneHeight={zoneHeight} screenWidth={screenWidth} />;
  }
}
