# Progress Map Background Redesign

**Date:** 2026-06-12  
**Status:** Approved  
**Scope:** MapBackground + MapDecorations components only — no changes to nodes, paths, or screen layout

---

## Goal

Replace the current dark, flat progress map background (photo zones buried under a 52% black overlay, near-invisible emoji decorations) with a vibrant, game-like background built entirely from code-drawn gradients and animated geometric shapes. No new photo assets. Result should feel lively, welcoming, and professional — similar in energy to a polished mobile RPG world map.

---

## Files Changed

| File | Action |
|------|--------|
| `components/features/progressMap/MapBackground.tsx` | Complete rewrite |
| `components/features/progressMap/MapDecorations.tsx` | Complete rewrite |
| `components/features/progressMap/ZoneAmbient.tsx` | New file — per-zone geometric decorations |

Photo assets in `assets/map/` are unused after this change but left in place.

---

## Dependency

Add `expo-linear-gradient` via `expo install expo-linear-gradient`.  
No other new dependencies. All decorations use React Native `Animated.View`.

---

## Zone Gradient Palettes

Five zones stack bottom (cave) to top (space). Adjacent zones share a boundary color so the full canvas reads as one seamless gradient.

| Zone | Theme | Top Color | Bottom Color |
|------|-------|-----------|--------------|
| 5 — Space | deep indigo / purple | `#030212` | `#0d1535` |
| 4 — Sky | navy / deep azure | `#0d1535` | `#0d2a4a` |
| 3 — Mountain | teal-blue / dark slate | `#0d2a4a` | `#0a1820` |
| 2 — Forest | dark blue-green / near-black green | `#0a1820` | `#0d1a08` |
| 1 — Cave | dark amber-brown / near black | `#0d1a08` | `#0a0500` |

Each zone is rendered as a `LinearGradient` (vertical, top→bottom) with `height = canvasHeight / 5`. They are stacked in order top-to-bottom inside the background View so space is at canvas top, cave at canvas bottom.

No dark overlay is applied. The gradients are designed dark enough for the cyan path (`#38bdf8`) and white text to remain legible without any dimming layer.

---

## MapBackground Implementation

```
<View absolute fullCanvas>
  {ZONES.map(zone => (
    <LinearGradient
      key={zone.id}
      colors={[zone.topColor, zone.bottomColor]}
      style={{ width: screenWidth, height: canvasHeight / 5 }}
    />
  ))}
</View>
```

`MapDecorations` is rendered as a sibling on top, as it is today in `ProgressMapScreen`.

---

## Zone Decorations (ZoneAmbient.tsx)

Each zone occupies `y = zoneIndex * (canvasHeight / 5)` to `(zoneIndex + 1) * (canvasHeight / 5)`. All decoration coordinates are computed relative to this band.

### Zone 1 — Cave (ember glow)

- **Ember orbs**: 8–12 small circles, 4–10px radius, colors `#ff6b1a` / `#e84d00` / `#ff9240`. Pulsing opacity (0.3→0.7), 1.5–3s cycles. Scattered across zone.
- **Crack line**: A thin horizontal series of 3–5 small rotated rectangles forming an irregular line, color `#8b2200`, opacity 0.35.
- **Stalactite hints**: 4–6 dark triangles (View with `borderLeftWidth`/`borderRightWidth`/`borderBottomWidth` trick) hanging from the zone top edge, color `#000000`, opacity 0.5.

### Zone 2 — Forest (bioluminescence)

- **Spore orbs**: 10–14 teal-green circles, 12–22px radius, colors `#00e5a0` / `#00c87a` / `#1aff9c`. Slow float-upward animation: `translateY` oscillates ±10–15px, 3–5s cycles. Opacity 0.25–0.45.
- **Depth blobs**: 3–4 large circles, 60–100px radius, color `#003d1a`, opacity 0.04. No animation — pure depth layer.
- **Wisps**: 3 thin horizontal rectangles, 2–3px height, 40–80px width, color `#00ff88`, opacity 0.08. Slow horizontal drift ±8px, 6s cycles.

### Zone 3 — Mountain (ice geometry)

- **Ice shards**: 12–16 thin rotated rectangles, 2–4px × 20–40px, color `#b8e4ff` / `#d4f0ff`, rotation –30° to 30°. Opacity 0.2–0.35. Subtle pulse.
- **Snow dots**: 20–25 circles, 2–3px radius, white, opacity 0.3–0.6. Slow downward drift: `translateY` +8–16px, 4–7s cycles (each unique speed).
- **Peak silhouettes**: 2–3 dark triangles (same trick as stalactites) at the zone bottom, pointing upward, color `#050f14`, opacity 0.6.

### Zone 4 — Sky (clouds and light)

- **Cloud wisps**: 5–7 large ellipses, 80–130px × 30–50px, white, opacity 0.06–0.12. Slow horizontal drift ±8–12px, 5–8s cycles.
- **Light shafts**: 2–3 angled rectangles, 15–25px wide × 120–180px tall, rotated 10–20°, white, opacity 0.015–0.025.
- **Wind streaks**: 6–8 thin horizontal lines, 1–2px × 30–70px, white, opacity 0.06–0.10. Fast horizontal drift ±6px, 2–3s cycles.

### Zone 5 — Space (nebula + stars)

- **Nebula blobs**: 4–6 large circles, 100–220px radius, colors `#6b2faf` / `#3b0f7a` / `#b03cff` / `#e040fb`. Opacity 0.04–0.08, slow pulse 4–7s.
- **Star clusters**: 50–60 individual circles, 1–5px radius, white. Each has a unique twinkle: opacity 0.06→0.5, 0.8–1.8s cycles with staggered delays. Scattered across the full canvas height (not just the space zone) to create a star field everywhere.
- **Orbital arc**: 1 large partial ring, 120–160px radius, 2–3px border, color `#38bdf8` (app cyan), opacity 0.08. Slow rotation ±5deg, 8s cycle.

---

## MapDecorations Rewrite

`MapDecorations.tsx` becomes a thin orchestration component:

```tsx
export function MapDecorations({ canvasHeight, screenWidth }: Props) {
  return (
    <>
      <StarField canvasHeight={canvasHeight} screenWidth={screenWidth} />
      {ZONE_CONFIGS.map((zone, i) => (
        <ZoneAmbient
          key={zone.id}
          zone={zone.id}
          yOffset={i * (canvasHeight / 5)}
          zoneHeight={canvasHeight / 5}
          screenWidth={screenWidth}
        />
      ))}
    </>
  );
}
```

`StarField` renders the 50–60 twinkling star circles across the full canvas. `ZoneAmbient` renders zone-specific shapes within its band.

---

## Animation Constraints

- All animations use `useNativeDriver: true` — only `opacity` and `transform` properties.
- Every animated element has a unique stagger delay (computed from index × prime offset) so nothing pulses in synchrony.
- Loops use `Animated.loop(Animated.sequence([...]))` — same pattern as current codebase.
- No layout-affecting animations (no width/height changes).

---

## What Is NOT Changed

- `LevelNode` component
- `MapPath` component
- `ProgressMapScreen` layout and scroll behavior
- `useProgressMap` hook
- Navigation and level press handlers
- Theme colors (`constants/theme.ts`)
