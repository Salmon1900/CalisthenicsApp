# Progress Map — Game-Like Visual Design

**Date:** 2026-06-05  
**Status:** Approved

---

## Goal

Make the Progress Map feel more like a game world by adding three layers of visual polish:

1. **Bouncing emojis** around the active (unlocked) node only
2. **Breathing gold aura** behind boss nodes
3. **Faded calisthenics environment art** scattered across the map background

The color scheme stays the same. No new navigation or data changes required.

---

## Architecture

Three changes, all purely visual, no data or navigation impact:

### 1. New component: `MapDecorations`

`components/features/progressMap/MapDecorations.tsx`

Renders all background environment art for the full canvas. Receives `canvasHeight` and `screenWidth` so it can scatter figures at deterministic positions. Rendered once, behind paths and nodes.

**Contents:**
- ~12–16 emoji figures (🏋️ 🤸 🏃 💪 🧘) positioned along both sides of the path corridor, opacity ~0.20–0.28
- ~6–8 terrain emojis (🌲 🌿) near the edges, swaying animation
- ~10 tiny ✦ star specks at random-feeling positions, twinkle animation
- All animations via `Animated.Value` loops (no external libraries)
- Figures pulse between opacity 0.18 and 0.28 on a 4–6 s cycle; terrain sways ±5° on a 4–5 s cycle

Positions are hardcoded (not runtime-random) so they're stable across renders. Two columns: left edge (x ≈ 8–24) and right edge (x ≈ screenWidth − 36 to − 20).

### 2. Update `LevelNode` — bouncing emojis on active node

Add a `BouncingEmojis` sub-component inside `LevelNode.tsx`, rendered only when `state === 'unlocked'`.

- 3 emojis positioned around the node: top-left, right, bottom-center
- Each uses its own `Animated.Value` looping between `translateY: 0` and `translateY: -8`
- Duration 1.8–2.2 s, staggered delays (0, 0.6, 1.1 s)
- Emoji set cycles by `level % 5` so different levels show different icons:
  - 0: 💪 🔥 ⚡  
  - 1: 🤸 💥 🎯  
  - 2: 🏃 ⚡ 💪  
  - 3: 🧘 🌟 💪  
  - 4: 🏋️ 🔥 ⚡

### 3. Update `LevelNode` — boss aura

When `isBoss === true`, render a `View` sized ~130 % of the boss node diameter, centered behind it (negative offset), using a radial-gradient-style background via a semi-transparent gold circle with `borderRadius: 50%`. Animate scale from 1.0 to 1.4 and opacity from 0.7 to 1.0 on a 2.2 s ease-in-out loop.

React Native doesn't support CSS radial gradients natively, so simulate with nested `View`s:
- Outer ring: `rgba(245,158,11,0.15)`, 130 px
- Inner ring: `rgba(245,158,11,0.30)`, 90 px
Both animate together on the same `Animated.Value`.

---

## File Changes

| File | Change |
|------|--------|
| `components/features/progressMap/MapDecorations.tsx` | **New** — environment art component |
| `components/features/progressMap/LevelNode.tsx` | Add bouncing emojis (unlocked state) + boss aura |
| `screens/ProgressMapScreen.tsx` | Render `<MapDecorations>` inside ScrollView, behind paths |

---

## Constraints

- All animations use `useNativeDriver: true` (transform/opacity only) for 60 fps on device
- `MapDecorations` mounts once; no re-renders triggered by level state changes
- Environment figures must not overlap the node X corridor (roughly x: 36–screenWidth−36), keeping them as side-dressing only
- No new npm packages needed

---

## Out of Scope

- Animated path connectors (dashes, flow)
- Pulsing glow rings on unlocked nodes
- Sparkle particles floating upward
- Any changes to node tap behavior, data fetching, or navigation
