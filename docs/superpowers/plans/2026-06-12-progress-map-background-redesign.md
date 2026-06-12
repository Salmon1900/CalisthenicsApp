# Progress Map Background Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark flat photo-based progress map background with vibrant code-drawn gradient zones and animated geometric decorations.

**Architecture:** `MapBackground` renders 5 stacked `LinearGradient` bands (space→cave) with shared boundary colors for seamless transitions. `ZoneAmbient` renders per-zone geometric decorations (pulsing orbs, floating shards, drifting lines). `MapDecorations` orchestrates a full-canvas `StarField` plus one `ZoneAmbient` per zone.

**Tech Stack:** `expo-linear-gradient`, React Native `Animated` API, `@testing-library/react-native`

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Install | `expo-linear-gradient` | Gradient rendering |
| Create | `__mocks__/expo-linear-gradient.js` | Jest mock so LinearGradient renders as View |
| Rewrite | `components/features/progressMap/MapBackground.tsx` | 5 gradient bands, no overlay |
| Create | `__tests__/components/features/progressMap/MapBackground.test.tsx` | Render test |
| Create | `components/features/progressMap/ZoneAmbient.tsx` | Per-zone animated shapes |
| Create | `__tests__/components/features/progressMap/ZoneAmbient.test.tsx` | Render test for all 5 zones |
| Rewrite | `components/features/progressMap/MapDecorations.tsx` | StarField + ZoneAmbient orchestrator |
| Update | `__tests__/components/features/progressMap/MapDecorations.test.tsx` | Keep passing with new impl |

---

## Task 1: Install expo-linear-gradient and add Jest mock

**Files:**
- Install: `expo-linear-gradient`
- Create: `__mocks__/expo-linear-gradient.js`

- [ ] **Step 1: Install the package**

```bash
npx expo install expo-linear-gradient
```

Expected: package added to `node_modules`, `package.json` updated with `"expo-linear-gradient"` in dependencies.

- [ ] **Step 2: Create Jest mock**

Create `__mocks__/expo-linear-gradient.js`:

```js
const { View } = require('react-native');
module.exports = { LinearGradient: View };
```

This mock makes `LinearGradient` render as a plain `View` in tests so snapshots don't break.

- [ ] **Step 3: Verify existing tests still pass**

```bash
npx jest --testPathPattern="MapDecorations" --no-coverage
```

Expected: `PASS __tests__/components/features/progressMap/MapDecorations.test.tsx`

- [ ] **Step 4: Commit**

```bash
git add __mocks__/expo-linear-gradient.js package.json package-lock.json
git commit -m "feat: add expo-linear-gradient with jest mock"
```

---

## Task 2: Rewrite MapBackground

**Files:**
- Rewrite: `components/features/progressMap/MapBackground.tsx`
- Create: `__tests__/components/features/progressMap/MapBackground.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/components/features/progressMap/MapBackground.test.tsx`:

```tsx
import { render } from '@testing-library/react-native';
import { MapBackground } from '../../../../components/features/progressMap/MapBackground';

describe('MapBackground', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(<MapBackground canvasHeight={5000} screenWidth={390} />)
    ).not.toThrow();
  });

  it('renders 5 gradient zones', () => {
    const { UNSAFE_getAllByType } = render(
      <MapBackground canvasHeight={5000} screenWidth={390} />
    );
    const { View } = require('react-native');
    // LinearGradient is mocked as View; outer container + 5 zone Views = 6
    expect(UNSAFE_getAllByType(View).length).toBeGreaterThanOrEqual(5);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails (MapBackground not yet rewritten)**

```bash
npx jest --testPathPattern="MapBackground" --no-coverage
```

Expected: FAIL — test file not found or import fails because current file uses `Image` not `LinearGradient`.

- [ ] **Step 3: Rewrite MapBackground.tsx**

Replace entire contents of `components/features/progressMap/MapBackground.tsx`:

```tsx
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

export function MapBackground({ canvasHeight, screenWidth }: Props) {
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
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest --testPathPattern="MapBackground" --no-coverage
```

Expected: `PASS __tests__/components/features/progressMap/MapBackground.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add components/features/progressMap/MapBackground.tsx \
        __tests__/components/features/progressMap/MapBackground.test.tsx
git commit -m "feat: rewrite MapBackground with seamless gradient zones"
```

---

## Task 3: Create ZoneAmbient

**Files:**
- Create: `components/features/progressMap/ZoneAmbient.tsx`
- Create: `__tests__/components/features/progressMap/ZoneAmbient.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/features/progressMap/ZoneAmbient.test.tsx`:

```tsx
import { render } from '@testing-library/react-native';
import { ZoneAmbient } from '../../../../components/features/progressMap/ZoneAmbient';
import type { ZoneId } from '../../../../components/features/progressMap/ZoneAmbient';

const ZONE_IDS: ZoneId[] = ['cave', 'forest', 'mountain', 'sky', 'space'];

const defaultProps = { yOffset: 0, zoneHeight: 300, screenWidth: 390 };

describe('ZoneAmbient', () => {
  ZONE_IDS.forEach((zone) => {
    it(`renders ${zone} zone without crashing`, () => {
      expect(() =>
        render(<ZoneAmbient zone={zone} {...defaultProps} />)
      ).not.toThrow();
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest --testPathPattern="ZoneAmbient" --no-coverage
```

Expected: FAIL — `ZoneAmbient` module not found.

- [ ] **Step 3: Create ZoneAmbient.tsx**

Create `components/features/progressMap/ZoneAmbient.tsx`:

```tsx
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
    const t = setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])).start();
    }, delay);
    return () => clearTimeout(t);
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
    const t = setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])).start();
    }, delay);
    return () => clearTimeout(t);
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
    const t = setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])).start();
    }, delay);
    return () => clearTimeout(t);
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
    const t = setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])).start();
    }, delay);
    return () => clearTimeout(t);
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
    const t = setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])).start();
    }, delay);
    return () => clearTimeout(t);
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
    const t = setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])).start();
    }, delay);
    return () => clearTimeout(t);
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
```

- [ ] **Step 4: Run ZoneAmbient tests**

```bash
npx jest --testPathPattern="ZoneAmbient" --no-coverage
```

Expected: `PASS __tests__/components/features/progressMap/ZoneAmbient.test.tsx` — all 5 zone renders pass.

- [ ] **Step 5: Commit**

```bash
git add components/features/progressMap/ZoneAmbient.tsx \
        __tests__/components/features/progressMap/ZoneAmbient.test.tsx
git commit -m "feat: add ZoneAmbient with per-zone geometric decorations"
```

---

## Task 4: Rewrite MapDecorations

**Files:**
- Rewrite: `components/features/progressMap/MapDecorations.tsx`
- Update: `__tests__/components/features/progressMap/MapDecorations.test.tsx`

- [ ] **Step 1: Update the test first**

Replace entire contents of `__tests__/components/features/progressMap/MapDecorations.test.tsx`:

```tsx
import { render } from '@testing-library/react-native';
import { MapDecorations } from '../../../../components/features/progressMap/MapDecorations';

describe('MapDecorations', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(<MapDecorations canvasHeight={7880} screenWidth={390} />)
    ).not.toThrow();
  });

  it('renders with minimal canvas height', () => {
    expect(() =>
      render(<MapDecorations canvasHeight={100} screenWidth={390} />)
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test to confirm it still passes before rewriting the component**

```bash
npx jest --testPathPattern="MapDecorations" --no-coverage
```

Expected: `PASS` (old implementation still in place).

- [ ] **Step 3: Rewrite MapDecorations.tsx**

Replace entire contents of `components/features/progressMap/MapDecorations.tsx`:

```tsx
import { useEffect, useRef } from 'react';
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
    const t = setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])).start();
    }, delay);
    return () => clearTimeout(t);
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

export function MapDecorations({ canvasHeight, screenWidth }: Props) {
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
}
```

- [ ] **Step 4: Run all progress map tests**

```bash
npx jest --testPathPattern="progressMap" --no-coverage
```

Expected:
```
PASS __tests__/components/features/progressMap/MapBackground.test.tsx
PASS __tests__/components/features/progressMap/ZoneAmbient.test.tsx
PASS __tests__/components/features/progressMap/MapDecorations.test.tsx
```

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add components/features/progressMap/MapDecorations.tsx \
        __tests__/components/features/progressMap/MapDecorations.test.tsx
git commit -m "feat: rewrite MapDecorations with StarField and ZoneAmbient orchestration"
```
