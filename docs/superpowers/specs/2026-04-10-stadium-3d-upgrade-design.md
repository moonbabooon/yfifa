# Stadium 3D Upgrade — Design Spec

**Date:** 2026-04-10
**Status:** Approved for implementation

## Overview

Upgrade the procedural Three.js stadium in `main.js` across three pillars: **color palette**, **geometry**, and **detail/fill**. Lighting is intentionally left unchanged — it's already working well.

Implementation follows a layered approach (Approach B): three focused passes, each independently reviewable and committable.

---

## Scope

### Out of scope
- Lighting changes (spotlights, ambient, sun — left as-is)
- Camera or OrbitControls changes
- Trophy or ball changes
- Any UI / HTML / CSS changes

---

## Pass 1 — Colors, Row Risers & Fascia Bands

### 1.1 Color Palette

Replace dark/monochrome materials with Classic FIFA / World Cup tones:

| Element | Old color | New color |
|---|---|---|
| Concrete (concreteMat) | `0x1e1e24` | `0xc8bfa8` (warm sandy beige, roughness 0.9) |
| Roof (roofMat) | `0x2a2a32` | `0xb0a888` (slightly darker warm, roughness 0.85) |
| Seat row A (seatMat) | `0x7a1010` | `0xc8102e` (FIFA red) |
| Seat row B (seatMat2) | `0x8c1515` | `0x1a3880` (FIFA blue) |
| Seat row C (new seatMat3) | — | `0xd8d8d8` (light grey / white) |

Seating rows cycle `row % 3` to pick from `[seatMat, seatMat2, seatMat3]`.

Pole/column/floodlight mast materials are unchanged.

### 1.2 Row Riser Face

Inside the `addStand()` row loop, after placing each seat platform:

- Add a thin vertical box (`axis-appropriate depth ~0.12, height = ROW_THICK, length = standLen`) flush with the front edge of the platform.
- Color: one shade darker than the seat row color — `0xa00c24` / `0x142d66` / `0xaaaaaa` for red/blue/grey rows respectively.
- `receiveShadow = true`.

### 1.3 Fascia Bands

On the front face of the back wall, add a horizontal color strip per tier level:

- A flat box (`0.05` thick, `~1.0` tall, `standLen` wide) per row, positioned at `y = i * ROW_RISE + ROW_RISE / 2`, flush against the front face of the back wall.
- Color cycles `row % 3` using the same seat palette.

---

## Pass 2 — Roof Angle, Filled Corners & Exterior Facade

### 2.1 Angled Roof Canopy

The existing flat roof box gets a tilt applied after positioning:

- For `axis === 'x'` stands: `roof.rotation.z = sign * 0.15` (~8.6°) — front edge tilts down toward pitch.
- For `axis === 'z'` stands: `roof.rotation.x = -sign * 0.15`.
- Dimensions and position unchanged.

### 2.2 Filled Corner Stands

Replace the four plain concrete corner blocks with raked seating. For each corner `[sx, sz]`:

- Loop `i = 0` to `min(LONG_ROWS, END_ROWS) - 1` (8 rows, matching the shorter end stand).
- Each row: `BoxGeometry(cw, ROW_THICK, cd)` where `cw = LONG_BACK - 21.5`, `cd = END_BACK - 30.5`.
- Position: `(sx * (21.5 + cw/2), i * ROW_RISE + ROW_THICK/2, sz * (30.5 + cd/2))`.
- Material cycles `i % 3` same as main stands.
- Add riser face and fascia band per row (same logic as Pass 1).
- No roof canopy over corners.

### 2.3 Exterior Facade (Arcade Columns)

On the outside of each stand's back wall, add evenly-spaced arcade pillars:

- One pillar every `~8` units of stand length: `count = Math.floor(standLen / 8)`.
- Each pillar: `CylinderGeometry(0.3, 0.35, totalH, 8)` in `concreteMat`, placed at `x/z = backOff + 1.0` (just outside the back wall), `y = totalH / 2`.
- Between adjacent pillar pairs at `~70%` height: a shallow lintel box (`0.5 × 1.0 × pillarSpacing`) connecting them — creates the ribbed arcade look.
- Applied to all four stand sides.

---

## Pass 3 — Crowd Texture, Hoardings, Flags, Scoreboard & Track

### 3.1 Crowd Texture

Generate **3 canvas textures** (one per seat color), reused across all rows of that color:

- Canvas size: `512 × 128px` (wide, short — matches the row aspect ratio).
- Background: seat base color.
- Shirt dots: `r ≈ 5px` filled circles, color randomly sampled from `['#4a6040','#2a6060','#1e2a50','#363636','#9a8030','#6a1830','#5a3a20']` — neutral tones, never matching seat color.
- Head dots: `r ≈ 3.5px` on top of shirt, color from skin tone palette `['#f5c8a0','#e8b080','#c88050','#a06030','#7a4420']`.
- Top-edge riser line: 1px dark stroke.

Apply as `map` on each `seatMat` / `seatMat2` / `seatMat3` via `new THREE.CanvasTexture(cvs)`. Set `texture.wrapS = THREE.RepeatWrapping`, `texture.repeat.x = 4` so dots tile naturally across long rows.

### 3.2 Advertising Hoardings

Replace flat `adMat` with a `CanvasTexture` per axis:

- Long-side boards (`z` direction, length 61): canvas `1024 × 64px`, text repeats `FIFA WORLD CUP 2026` / `CANADA · MEXICO · USA` alternately, white on `#1a3880`, 18px bold sans-serif.
- End boards (`x` direction, length 41.5): same approach, canvas `512 × 64px`.
- White 2px border top and bottom.
- Applied as `map` on the existing four hoarding meshes.

### 3.3 Corner Flags

Four flags at pitch corners `(±20, 0, ±30)` (exact pitch edge):

- Pole: `CylinderGeometry(0.05, 0.05, 1.5, 6)` in white `MeshStandardMaterial`.
- Flag: `PlaneGeometry(0.5, 0.35)` in `#c8102e` (FIFA red), `side: THREE.DoubleSide`, positioned at top of pole, rotated to face center.

### 3.4 Running Track

A terracotta perimeter band around the pitch:

- Two overlapping `PlaneGeometry` planes (rotated flat) forming a rectangular frame:
  - Outer rect: `52 × 72`, inner rect: `42 × 62` (matches pitch edge).
- Implemented as four flat strips (N/S/E/W) each `5 × 72` or `5 × 42` positioned at pitch edges.
- Material: `MeshStandardMaterial({ color: 0xc8603a, roughness: 0.95 })`, `y = 0.005`.

### 3.5 Scoreboard

Mounted at far end (Canada's goal side, `z ≈ -58`), facing `+z`:

- Two support pillars: `CylinderGeometry(0.3, 0.35, 14, 8)` in `concreteMat`, at `x = ±7, y = 7` (center = height/2), `z = -58`.
- Screen: `BoxGeometry(16, 8, 0.4)` at `y = 18` (pillar top 14 + screen half-height 4), `z = -58`.
- Front face canvas texture `512 × 256px`:
  - Dark background `#0a0a14`.
  - Header: `FIFA WORLD CUP 2026` in gold `#e8c44a`, 20px.
  - Team names hardcoded: `CANADA` (left) and `BOSNIA & HERZ.` (right) in white, 28px bold.
  - Score hardcoded: `0 - 0` in large white centered text, 48px.

---

## Implementation Order

```
Pass 1: colors → row risers → fascia bands     (commit 1)
Pass 2: roof angle → corner stands → facade    (commit 2)
Pass 3: crowd tex → hoardings → flags → track → scoreboard  (commit 3)
```

Each pass leaves the scene in a working, viewable state.

---

## Files Changed

- `main.js` only — all changes are inside or called from `makeStadium()` / `addStand()`
- No new files, no HTML/CSS changes
