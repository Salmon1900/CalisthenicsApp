# Progress Map Game Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bouncing emojis on active nodes, a breathing gold aura on boss nodes, and faded calisthenics environment art across the map background.

**Architecture:** `LevelNode.tsx` gains two internal sub-components (`BossAura`, `BouncingEmojis`) rendered as siblings via React Fragment; a new `MapDecorations.tsx` renders all background art once; `ProgressMapScreen.tsx` renders `MapDecorations` as the first child of the ScrollView.

**Tech Stack:** React Native `Animated` API with `useNativeDriver: true`, no new npm packages.

---

## File Map

| File | Change |
|------|--------|
| `components/features/progressMap/LevelNode.tsx` | Add `BossAura` + `BouncingEmojis` sub-components, update return to Fragment |
| `components/features/progressMap/MapDecorations.tsx` | **New** — data-driven background decoration renderer |
| `screens/ProgressMapScreen.tsx` | Import and render `MapDecorations` inside ScrollView |
| `__tests__/components/features/progressMap/LevelNode.test.tsx` | **New** — render tests for new animation additions |
| `__tests__/components/features/progressMap/MapDecorations.test.tsx` | **New** — smoke test |

---

## Task 1: Tests for LevelNode animation additions

**Files:**
- Create: `__tests__/components/features/progressMap/LevelNode.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// __tests__/components/features/progressMap/LevelNode.test.tsx
import { render } from '@testing-library/react-native';
import { LevelNode } from '../../../../components/features/progressMap/LevelNode';

describe('LevelNode', () => {
  const baseProps = { x: 100, y: 100, onPress: jest.fn() };

  it('renders level number when unlocked', () => {
    const { getByText } = render(
      <LevelNode {...baseProps} level={1} state="unlocked" isBoss={false} />
    );
    expect(getByText('1')).toBeTruthy();
  });

  it('renders bouncing emojis only when unlocked', () => {
    const { getByText: getUnlocked } = render(
      <LevelNode {...baseProps} level={5} state="unlocked" isBoss={false} />
    );
    // level 5 % 5 === 0 → EMOJI_SETS[0] = ['💪','🔥','⚡']
    expect(getUnlocked('💪')).toBeTruthy();
    expect(getUnlocked('🔥')).toBeTruthy();
    expect(getUnlocked('⚡')).toBeTruthy();
  });

  it('does not render bouncing emojis when locked', () => {
    const { queryByText } = render(
      <LevelNode {...baseProps} level={5} state="locked" isBoss={false} />
    );
    expect(queryByText('💪')).toBeNull();
  });

  it('does not render bouncing emojis when completed', () => {
    const { queryByText } = render(
      <LevelNode {...baseProps} level={5} state="completed" isBoss={false} />
    );
    expect(queryByText('💪')).toBeNull();
  });

  it('uses correct emoji set per level modulo', () => {
    // level 2 % 5 === 2 → ['🏃','⚡','💪']
    const { getByText } = render(
      <LevelNode {...baseProps} level={2} state="unlocked" isBoss={false} />
    );
    expect(getByText('🏃')).toBeTruthy();
  });

  it('renders boss node without crashing', () => {
    expect(() =>
      render(<LevelNode {...baseProps} level={10} state="unlocked" isBoss={true} />)
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```
npx jest __tests__/components/features/progressMap/LevelNode.test.tsx --no-coverage
```

Expected: FAIL — `LevelNode` doesn't yet render bouncing emojis.

---

## Task 2: Update LevelNode with BossAura and BouncingEmojis

**Files:**
- Modify: `components/features/progressMap/LevelNode.tsx`

- [ ] **Step 3: Replace LevelNode.tsx with the following**

```tsx
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';

export type LevelNodeState = 'locked' | 'unlocked' | 'completed';

interface LevelNodeProps {
  level: number;
  state: LevelNodeState;
  isBoss: boolean;
  x: number;
  y: number;
  onPress: () => void;
}

const NODE_SIZE_NORMAL = 56;
const NODE_SIZE_BOSS = 80;

export const NODE_SIZE_NORMAL_EXPORT = NODE_SIZE_NORMAL;
export const NODE_SIZE_BOSS_EXPORT = NODE_SIZE_BOSS;

const EMOJI_SETS = [
  ['💪', '🔥', '⚡'],
  ['🤸', '💥', '🎯'],
  ['🏃', '⚡', '💪'],
  ['🧘', '🌟', '💪'],
  ['🏋️', '🔥', '⚡'],
] as const;

const BOUNCE_OFFSETS = [
  { dx: -26, dy: -30 },
  { dx: 20,  dy: -12 },
  { dx: -8,  dy: 20  },
];

function BossAura({ x, y }: { x: number; y: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: 130,
        height: 130,
        left: x - 65,
        top: y - 65,
        borderRadius: 65,
        backgroundColor: 'rgba(245,158,11,0.15)',
        transform: [{ scale }],
        opacity,
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 90,
          height: 90,
          left: 20,
          top: 20,
          borderRadius: 45,
          backgroundColor: 'rgba(245,158,11,0.22)',
        }}
      />
    </Animated.View>
  );
}

function BouncingEmojis({ level, x, y }: { level: number; x: number; y: number }) {
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

  const emojis = EMOJI_SETS[level % EMOJI_SETS.length];

  return (
    <>
      {emojis.map((emoji, i) => {
        const translateY = anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: x + BOUNCE_OFFSETS[i].dx,
              top: y + BOUNCE_OFFSETS[i].dy,
              transform: [{ translateY }],
            }}
          >
            <Text style={{ fontSize: 15 }}>{emoji}</Text>
          </Animated.View>
        );
      })}
    </>
  );
}

export function LevelNode({ level, state, isBoss, x, y, onPress }: LevelNodeProps) {
  const size = isBoss ? NODE_SIZE_BOSS : NODE_SIZE_NORMAL;
  const iconSize = isBoss ? 24 : 18;

  const bgColor =
    state === 'completed'
      ? theme.colors.success
      : state === 'unlocked'
        ? theme.colors.primary
        : '#374151';

  return (
    <>
      {isBoss && <BossAura x={x} y={y} />}
      {state === 'unlocked' && <BouncingEmojis level={level} x={x} y={y} />}
      <Pressable
        style={[
          styles.node,
          {
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
            opacity: state === 'locked' ? 0.65 : 1,
            borderWidth: isBoss ? 3 : 0,
            borderColor: '#F59E0B',
            shadowColor: isBoss ? '#F59E0B' : '#000',
            shadowOpacity: isBoss ? 0.5 : 0.25,
            shadowRadius: isBoss ? 12 : 6,
            elevation: isBoss ? 8 : 4,
          },
        ]}
        onPress={onPress}
      >
        {state === 'locked' ? (
          <Ionicons name="lock-closed" size={iconSize} color="#9CA3AF" />
        ) : state === 'completed' ? (
          <Ionicons name="checkmark" size={iconSize + 4} color={theme.colors.background} />
        ) : (
          <Text style={[styles.levelNumber, { fontSize: isBoss ? 18 : 14 }]}>{level}</Text>
        )}
        {isBoss && (
          <View style={styles.starBadge}>
            <Text style={styles.starText}>★</Text>
          </View>
        )}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
  },
  levelNumber: {
    color: theme.colors.background,
    fontWeight: '800',
  },
  starBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starText: {
    fontSize: 11,
    color: '#fff',
    lineHeight: 14,
  },
});
```

- [ ] **Step 4: Run tests to verify they pass**

```
npx jest __tests__/components/features/progressMap/LevelNode.test.tsx --no-coverage
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```
git add components/features/progressMap/LevelNode.tsx __tests__/components/features/progressMap/LevelNode.test.tsx
git commit -m "feat: add boss aura and bouncing emojis to LevelNode"
```

---

## Task 3: MapDecorations component

**Files:**
- Create: `components/features/progressMap/MapDecorations.tsx`
- Create: `__tests__/components/features/progressMap/MapDecorations.test.tsx`

- [ ] **Step 6: Write the smoke test**

```tsx
// __tests__/components/features/progressMap/MapDecorations.test.tsx
import { render } from '@testing-library/react-native';
import { MapDecorations } from '../../../../components/features/progressMap/MapDecorations';

it('renders without crashing', () => {
  expect(() =>
    render(<MapDecorations canvasHeight={7880} screenWidth={390} />)
  ).not.toThrow();
});
```

- [ ] **Step 7: Run the smoke test to verify it fails (file doesn't exist yet)**

```
npx jest __tests__/components/features/progressMap/MapDecorations.test.tsx --no-coverage
```

Expected: FAIL — cannot find module.

- [ ] **Step 8: Create MapDecorations.tsx**

```tsx
// components/features/progressMap/MapDecorations.tsx
import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

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
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, []);

  if (type === 'sway') {
    const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });
    return (
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', left: x, top: y, opacity: 0.22, transform: [{ rotate }] }}
      >
        <Text style={{ fontSize: size }}>{emoji}</Text>
      </Animated.View>
    );
  }

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.28] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: x, top: y, opacity }}
    >
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </Animated.View>
  );
}

function StarSpeck({ x, y, duration }: { x: number; y: number; duration: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.25] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: x, top: y, opacity }}
    >
      <Text style={{ fontSize: 8, color: '#f8fafc' }}>✦</Text>
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
```

- [ ] **Step 9: Run tests to verify they pass**

```
npx jest __tests__/components/features/progressMap/MapDecorations.test.tsx --no-coverage
```

Expected: 1 test PASS.

- [ ] **Step 10: Commit**

```
git add components/features/progressMap/MapDecorations.tsx __tests__/components/features/progressMap/MapDecorations.test.tsx
git commit -m "feat: add MapDecorations background environment art component"
```

---

## Task 4: Wire MapDecorations into ProgressMapScreen

**Files:**
- Modify: `screens/ProgressMapScreen.tsx`

- [ ] **Step 11: Add the import and render MapDecorations**

Add this import at the top of `screens/ProgressMapScreen.tsx` alongside the other progressMap imports:

```tsx
import { MapDecorations } from '../components/features/progressMap/MapDecorations';
```

Then inside the `ScrollView`, add `<MapDecorations>` as the first child (before the path connectors):

```tsx
<ScrollView
  ref={scrollRef}
  style={styles.scroll}
  contentContainerStyle={{ height: CANVAS_HEIGHT }}
  showsVerticalScrollIndicator={false}
>
  <MapDecorations canvasHeight={CANVAS_HEIGHT} screenWidth={SCREEN_WIDTH} />

  {/* Path connectors rendered first (behind nodes) */}
  {levels.slice(0, -1).map((level, index) => {
    const next = levels[index + 1];
    const from = getLevelPosition(level.levelNumber);
    const to = getLevelPosition(next.levelNumber);
    return (
      <MapPath
        key={`path-${level.levelNumber}`}
        fromX={from.x}
        fromY={from.y}
        toX={to.x}
        toY={to.y}
        isCompleted={level.isCompleted}
      />
    );
  })}

  {/* Level nodes rendered on top of paths */}
  {levels.map((level) => {
    const { x, y } = getLevelPosition(level.levelNumber);
    const state = level.isCompleted ? 'completed' : level.isUnlocked ? 'unlocked' : 'locked';
    return (
      <LevelNode
        key={level.levelNumber}
        level={level.levelNumber}
        state={state}
        isBoss={level.isBoss}
        x={x}
        y={y}
        onPress={() => handleLevelPress(level.levelNumber)}
      />
    );
  })}
</ScrollView>
```

- [ ] **Step 12: Run all progress map tests**

```
npx jest __tests__/components/features/progressMap/ --no-coverage
```

Expected: All tests PASS.

- [ ] **Step 13: Commit**

```
git add screens/ProgressMapScreen.tsx
git commit -m "feat: wire MapDecorations into ProgressMapScreen"
```
