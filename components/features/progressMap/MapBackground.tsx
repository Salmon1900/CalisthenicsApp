import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

interface Props {
  canvasHeight: number;
  screenWidth: number;
}

// Ordered top-to-bottom on canvas: space (canvas top = highest level) → cave (canvas bottom = level 1).
// Adjacent zones share their boundary color so the full canvas reads as one seamless gradient.
const ZONES = [
  { id: 'space',    colors: ['#030212', '#0d1535'] as const },
  { id: 'sky',      colors: ['#0d1535', '#0d2a4a'] as const },
  { id: 'mountain', colors: ['#0d2a4a', '#0a1820'] as const },
  { id: 'forest',   colors: ['#0a1820', '#0d1a08'] as const },
  { id: 'cave',     colors: ['#0d1a08', '#0a0500'] as const },
] as const;

export const MapBackground = React.memo(function MapBackground({ canvasHeight, screenWidth }: Props) {
  const zoneHeight = canvasHeight / ZONES.length;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', width: screenWidth, height: canvasHeight, top: 0, left: 0 }}
    >
      {ZONES.map((zone) => (
        <LinearGradient
          key={zone.id}
          colors={zone.colors}
          style={{ width: screenWidth, height: zoneHeight }}
        />
      ))}
    </View>
  );
});
