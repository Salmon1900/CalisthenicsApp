import { Image, View } from 'react-native';

interface Props {
  canvasHeight: number;
  screenWidth: number;
}

// Canvas top = highest levels (space), canvas bottom = level 1 (cave).
// Images are ordered top-to-bottom so scrolling up reveals progression.
const ZONES = [
  require('../../../assets/map/zone5_space.jpg'),    // apex — milky way
  require('../../../assets/map/zone4_sky.jpg'),       // high levels — sky
  require('../../../assets/map/zone3_mountain.jpg'),  // mid levels — mountain
  require('../../../assets/map/zone2_forest.jpg'),    // early levels — forest
  require('../../../assets/map/zone1_cave.jpg'),      // level 1 — underground
] as const;

export function MapBackground({ canvasHeight, screenWidth }: Props) {
  const zoneHeight = canvasHeight / ZONES.length;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', width: screenWidth, height: canvasHeight, top: 0, left: 0 }}
    >
      {ZONES.map((src, i) => (
        <Image
          key={i}
          source={src}
          style={{ width: screenWidth, height: zoneHeight }}
          resizeMode="cover"
          fadeDuration={0}
        />
      ))}
      {/* Dark overlay keeps nodes, paths, and text readable over photos */}
      <View
        style={{
          position: 'absolute',
          width: screenWidth,
          height: canvasHeight,
          backgroundColor: 'rgba(0,0,0,0.52)',
        }}
      />
    </View>
  );
}
