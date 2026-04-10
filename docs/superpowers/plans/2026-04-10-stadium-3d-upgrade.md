# Stadium 3D Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the procedural Three.js stadium in `main.js` with a Classic FIFA color palette, improved geometry (angled roof, corner stands, exterior facade, row risers, fascia bands), and rich detail (crowd texture, hoardings, corner flags, running track, scoreboard).

**Architecture:** Three sequential passes applied to `makeStadium()` and its `addStand()` helper in `main.js`. Pass 1 is pure material changes, Pass 2 is geometry changes, Pass 3 is additive detail. Each pass is one commit and leaves the scene in a working state.

**Tech Stack:** Three.js r160, ES modules via importmap CDN, HTML Canvas API for textures. No build step — serve with any local static server (e.g. `npx serve .` or VS Code Live Server).

---

## File Modified

- `main.js` — all changes are within `makeStadium()` and its inner `addStand()` helper. No other files change.

---

## Pass 1 — Colors, Row Risers & Fascia Bands

### Task 1: Update color palette + add third seat material

**Files:**
- Modify: `main.js` — inside `makeStadium()`, lines defining `concreteMat`, `roofMat`, `seatMat`, `seatMat2`

- [ ] **Step 1: Replace material definitions**

  In `makeStadium()`, replace the five material lines (concreteMat through seatMat2) with:

  ```js
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xc8bfa8, roughness: 0.90, metalness: 0.05 });
  const roofMat     = new THREE.MeshStandardMaterial({ color: 0xb0a888, roughness: 0.85, metalness: 0.18, side: THREE.DoubleSide });
  const poleMat     = new THREE.MeshStandardMaterial({ color: 0xb0b2b8, metalness: 0.82, roughness: 0.22 });
  const seatMat     = new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.92, metalness: 0 }); // FIFA red
  const seatMat2    = new THREE.MeshStandardMaterial({ color: 0x1a3880, roughness: 0.92, metalness: 0 }); // FIFA blue
  const seatMat3    = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.92, metalness: 0 }); // light grey
  const seatMats    = [seatMat, seatMat2, seatMat3];
  ```

- [ ] **Step 2: Update `addStand()` to use 3-way seat cycle**

  Inside `addStand()`, find the row loop line that picks the material:
  ```js
  const mat  = i % 2 === 0 ? seatMat : seatMat2;
  ```
  Replace with:
  ```js
  const mat  = seatMats[i % 3];
  ```

- [ ] **Step 3: Verify visually**

  Open `index.html` via a local server. The stands should now show alternating red → blue → grey rows instead of alternating dark reds. Concrete walls and roof should be warm sandy beige.

- [ ] **Step 4: Commit**

  ```bash
  git add main.js
  git commit -m "feat: stadium pass 1a — classic FIFA colour palette"
  ```

---

### Task 2: Add row riser faces

**Files:**
- Modify: `main.js` — inside the `for` loop in `addStand()`

- [ ] **Step 1: Add riser materials array after `seatMats`**

  After the `seatMats` line, add:
  ```js
  const riserMats = [
    new THREE.MeshStandardMaterial({ color: 0xa00c24, roughness: 0.92, metalness: 0 }), // dark red
    new THREE.MeshStandardMaterial({ color: 0x142d66, roughness: 0.92, metalness: 0 }), // dark blue
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.92, metalness: 0 }), // dark grey
  ];
  ```

- [ ] **Step 2: Add riser mesh inside the `addStand()` row loop**

  Inside `addStand()`, after `scene.add(mesh)` in the row loop (but still inside the `for` block), add:

  ```js
  // Riser face — vertical strip at front edge of each step (skip row 0, ground level)
  if (i > 0) {
    const riserH = ROW_RISE - ROW_THICK; // 1.05
    const riser = new THREE.Mesh(
      axis === 'x'
        ? new THREE.BoxGeometry(0.12, riserH, standLen)
        : new THREE.BoxGeometry(standLen, riserH, 0.12),
      riserMats[i % 3]
    );
    riser.position.set(
      axis === 'x' ? sign * (startOff + i * ROW_D) : 0,
      i * ROW_RISE - riserH / 2,
      axis === 'x' ? 0 : sign * (startOff + i * ROW_D)
    );
    scene.add(riser);
  }
  ```

- [ ] **Step 3: Verify visually**

  Thin vertical strips should now be visible at the front face of each seating step — dark red/blue/grey matching the step above.

- [ ] **Step 4: Commit**

  ```bash
  git add main.js
  git commit -m "feat: stadium pass 1b — row riser faces"
  ```

---

### Task 3: Add fascia color bands on back walls

**Files:**
- Modify: `main.js` — inside `addStand()`, after the back wall mesh

- [ ] **Step 1: Add fascia strip materials array after `riserMats`**

  ```js
  const fasciaStripMats = [
    new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.9, metalness: 0 }),
    new THREE.MeshStandardMaterial({ color: 0x1a3880, roughness: 0.9, metalness: 0 }),
    new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.9, metalness: 0 }),
  ];
  ```

- [ ] **Step 2: Add fascia band strips inside the row loop**

  Inside `addStand()`, after the riser block (still inside the `for` loop), add:

  ```js
  // Fascia colour band on front face of back wall at this tier height
  const fasciaStrip = new THREE.Mesh(
    axis === 'x'
      ? new THREE.BoxGeometry(0.06, ROW_RISE * 0.65, standLen)
      : new THREE.BoxGeometry(standLen, ROW_RISE * 0.65, 0.06),
    fasciaStripMats[i % 3]
  );
  const backOff = startOff + rows * ROW_D;
  fasciaStrip.position.set(
    axis === 'x' ? sign * backOff : 0,
    i * ROW_RISE + ROW_RISE / 2,
    axis === 'x' ? 0 : sign * backOff
  );
  scene.add(fasciaStrip);
  ```

- [ ] **Step 3: Verify visually**

  Coloured horizontal bands (red/blue/grey) should be visible on the back wall surface, one per tier. Especially visible from an orbital view.

- [ ] **Step 4: Commit**

  ```bash
  git add main.js
  git commit -m "feat: stadium pass 1c — fascia colour bands on back walls"
  ```

---

## Pass 2 — Roof Angle, Corner Stands & Exterior Facade

### Task 4: Tilt roof canopy

**Files:**
- Modify: `main.js` — inside `addStand()`, after the roof mesh is positioned

- [ ] **Step 1: Apply rotation to the roof mesh**

  In `addStand()`, find the line `scene.add(roof);` and add the rotation immediately before it:

  ```js
  // Tilt roof toward pitch (~8.6°)
  if (axis === 'x') {
    roof.rotation.z = sign * 0.15;
  } else {
    roof.rotation.x = -sign * 0.15;
  }
  scene.add(roof);
  ```

- [ ] **Step 2: Verify visually**

  All four roof canopies should now slope — front edge lower (toward pitch), back edge raised. No gaps or z-fighting expected.

- [ ] **Step 3: Commit**

  ```bash
  git add main.js
  git commit -m "feat: stadium pass 2a — angled roof canopies"
  ```

---

### Task 5: Replace corner concrete blocks with raked seating

**Files:**
- Modify: `main.js` — the corner block section after the `addStand()` calls

- [ ] **Step 1: Find and replace the corner block code**

  Find this block (after the four `addStand()` calls):
  ```js
  // ── Corner concrete blocks ────────────────────────────────────────────────
  const LONG_BACK = 21.5 + 12 * ROW_D; // ~43.1
  const END_BACK  = 30.5 + 9  * ROW_D; // ~46.7
  const LONG_H    = 12 * ROW_RISE;
  const END_H     = 9  * ROW_RISE;
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([sx,sz]) => {
    const cw = LONG_BACK - 21.5; // corner width matches stand depth
    const cd = END_BACK  - 30.5;
    const ch = Math.min(LONG_H, END_H) * 0.85;
    const corner = new THREE.Mesh(new THREE.BoxGeometry(cw, ch, cd), concreteMat);
    corner.position.set(sx * (21.5 + cw / 2), ch / 2, sz * (30.5 + cd / 2));
    scene.add(corner);
  });
  ```

  Replace it entirely with:

  ```js
  // ── Corner stands (raked seating) ─────────────────────────────────────────
  const LONG_BACK = 21.5 + 12 * ROW_D; // 43.1
  const END_BACK  = 30.5 + 9  * ROW_D; // 46.7
  const CORNER_ROWS = 9; // match end-stand row count
  const cw = LONG_BACK - 21.5; // 21.6
  const cd = END_BACK  - 30.5; // 16.2

  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([sx,sz]) => {
    for (let i = 0; i < CORNER_ROWS; i++) {
      const yPos = i * ROW_RISE + ROW_THICK / 2;
      const cornerRow = new THREE.Mesh(
        new THREE.BoxGeometry(cw, ROW_THICK, cd),
        seatMats[i % 3]
      );
      cornerRow.position.set(sx * (21.5 + cw / 2), yPos, sz * (30.5 + cd / 2));
      cornerRow.receiveShadow = true;
      scene.add(cornerRow);

      // Riser
      if (i > 0) {
        const riserH = ROW_RISE - ROW_THICK;
        const cRiser = new THREE.Mesh(
          new THREE.BoxGeometry(cw, riserH, cd),
          riserMats[i % 3]
        );
        cRiser.position.set(sx * (21.5 + cw / 2), i * ROW_RISE - riserH / 2, sz * (30.5 + cd / 2));
        scene.add(cRiser);
      }
    }
  });
  ```

- [ ] **Step 2: Verify visually**

  Corners should now show stacked red/blue/grey rows matching the adjacent stands. The bowl should look continuous with no plain concrete patches.

- [ ] **Step 3: Commit**

  ```bash
  git add main.js
  git commit -m "feat: stadium pass 2b — corner raked seating replaces concrete blocks"
  ```

---

### Task 6: Add exterior arcade facade

**Files:**
- Modify: `main.js` — inside `addStand()`, after `scene.add(backWall)`

- [ ] **Step 1: Add arcade column + lintel loop after the back wall**

  In `addStand()`, after the existing `scene.add(backWall)` line, add:

  ```js
  // Exterior arcade facade — columns + lintels outside back wall
  const arcadeColCount = Math.floor(standLen / 8);
  const arcadeTotalH   = rows * ROW_RISE;
  const arcadeBackX    = backOff + 1.6; // just outside back wall

  for (let c = 0; c <= arcadeColCount; c++) {
    const colPos = -standLen / 2 + (c / arcadeColCount) * standLen;

    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, arcadeTotalH, 8),
      concreteMat
    );
    pillar.position.set(
      axis === 'x' ? sign * arcadeBackX : colPos,
      arcadeTotalH / 2,
      axis === 'x' ? colPos : sign * arcadeBackX
    );
    scene.add(pillar);

    if (c < arcadeColCount) {
      const lintelSpan = standLen / arcadeColCount;
      const lintelMid  = -standLen / 2 + (c + 0.5) / arcadeColCount * standLen;
      const lintel = new THREE.Mesh(
        axis === 'x'
          ? new THREE.BoxGeometry(0.5, 1.0, lintelSpan)
          : new THREE.BoxGeometry(lintelSpan, 1.0, 0.5),
        concreteMat
      );
      lintel.position.set(
        axis === 'x' ? sign * arcadeBackX : lintelMid,
        arcadeTotalH * 0.70,
        axis === 'x' ? lintelMid : sign * arcadeBackX
      );
      scene.add(lintel);
    }
  }
  ```

- [ ] **Step 2: Verify visually**

  Evenly-spaced beige columns and connecting lintels should be visible on the outside of all four stands. Orbit the camera to the outside to check.

- [ ] **Step 3: Commit**

  ```bash
  git add main.js
  git commit -m "feat: stadium pass 2c — exterior arcade facade columns"
  ```

---

## Pass 3 — Crowd, Hoardings, Flags, Track & Scoreboard

### Task 7: Crowd canvas textures on seating rows

**Files:**
- Modify: `main.js` — inside `makeStadium()`, before `addStand()` calls

- [ ] **Step 1: Add `makeCrowdTexture()` helper function**

  Add this function inside `makeStadium()`, before the `addStand()` helper function definition:

  ```js
  function makeCrowdTexture(seatHex) {
    const W = 512, H = 128;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');

    const r = (seatHex >> 16) & 0xff;
    const g = (seatHex >> 8)  & 0xff;
    const b =  seatHex        & 0xff;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, W, H);

    const shirts = ['#4a6040','#2a6060','#1e2a50','#363636','#9a8030','#6a1830','#5a3a20'];
    const skins  = ['#f5c8a0','#e8b080','#c88050','#a06030','#7a4420'];
    const cols = 88, dotRows = 4;

    for (let row = 0; row < dotRows; row++) {
      for (let col = 0; col < cols; col++) {
        const x  = (col + 0.5) * (W / cols) + (Math.random() - 0.5) * 2;
        const y  = (row + 0.5) * (H / dotRows) + (Math.random() - 0.5) * 3;
        const dr = 3.5;
        ctx.beginPath();
        ctx.arc(x, y + dr * 1.1, dr * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = shirts[Math.floor(Math.random() * shirts.length)];
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, dr, 0, Math.PI * 2);
        ctx.fillStyle = skins[Math.floor(Math.random() * skins.length)];
        ctx.fill();
      }
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.stroke();

    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.x = 4;
    return tex;
  }
  ```

- [ ] **Step 2: Apply crowd textures to seat materials**

  After the `seatMats` array definition, add:

  ```js
  seatMat.map  = makeCrowdTexture(0xc8102e);
  seatMat2.map = makeCrowdTexture(0x1a3880);
  seatMat3.map = makeCrowdTexture(0xd8d8d8);
  seatMat.needsUpdate  = true;
  seatMat2.needsUpdate = true;
  seatMat3.needsUpdate = true;
  ```

- [ ] **Step 3: Verify visually**

  Each seating row should now show a crowd of tiny heads and shirts on the seat-colour background. Rows are distinct. Shirts are neutral tones (not matching seat colours).

- [ ] **Step 4: Commit**

  ```bash
  git add main.js
  git commit -m "feat: stadium pass 3a — crowd canvas texture on seating rows"
  ```

---

### Task 8: Advertising hoardings with canvas text

**Files:**
- Modify: `main.js` — the hoarding section inside `makeStadium()`

- [ ] **Step 1: Add `makeHoardingTexture()` helper**

  Add this inside `makeStadium()`, alongside the other texture helpers:

  ```js
  function makeHoardingTexture(canvasW) {
    const H = 64;
    const cvs = document.createElement('canvas');
    cvs.width = canvasW; cvs.height = H;
    const ctx = cvs.getContext('2d');

    ctx.fillStyle = '#1a3880';
    ctx.fillRect(0, 0, canvasW, H);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 1);     ctx.lineTo(canvasW, 1);     ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H - 1); ctx.lineTo(canvasW, H - 1); ctx.stroke();

    ctx.fillStyle  = '#ffffff';
    ctx.font       = 'bold 18px Arial, sans-serif';
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    const phrases = ['FIFA WORLD CUP 2026', 'CANADA · MEXICO · USA'];
    const spacing = 220;
    for (let x = spacing / 2; x < canvasW; x += spacing) {
      ctx.fillText(phrases[Math.floor(x / spacing) % 2], x, H / 2);
    }

    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }
  ```

- [ ] **Step 2: Replace the flat `adMat` with textured materials**

  Find the hoarding section:
  ```js
  const adMat = new THREE.MeshStandardMaterial({ color: 0x1a3880 });
  [-20.6, 20.6].forEach(x => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 61), adMat);
    b.position.set(x, 0.4, 0); scene.add(b);
  });
  [-30.4, 30.4].forEach(z => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(41.5, 0.8, 0.2), adMat);
    b.position.set(0, 0.4, z); scene.add(b);
  });
  ```

  Replace with:
  ```js
  const adMatSide = new THREE.MeshStandardMaterial({ map: makeHoardingTexture(1024) });
  const adMatEnd  = new THREE.MeshStandardMaterial({ map: makeHoardingTexture(512)  });
  [-20.6, 20.6].forEach(x => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 61), adMatSide);
    b.position.set(x, 0.4, 0); scene.add(b);
  });
  [-30.4, 30.4].forEach(z => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(41.5, 0.8, 0.2), adMatEnd);
    b.position.set(0, 0.4, z); scene.add(b);
  });
  ```

- [ ] **Step 3: Verify visually**

  Hoardings should show white text on blue — "FIFA WORLD CUP 2026" and "CANADA · MEXICO · USA" alternating along their length.

- [ ] **Step 4: Commit**

  ```bash
  git add main.js
  git commit -m "feat: stadium pass 3b — advertising hoardings with canvas text"
  ```

---

### Task 9: Corner flags

**Files:**
- Modify: `main.js` — inside `makeStadium()`, after the hoarding section

- [ ] **Step 1: Add corner flag geometry**

  After the hoarding block, add:

  ```js
  // ── Corner flags ──────────────────────────────────────────────────────────
  const flagPoleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.3 });
  const flagMat     = new THREE.MeshStandardMaterial({ color: 0xc8102e, side: THREE.DoubleSide });

  [[-20, -30], [20, -30], [-20, 30], [20, 30]].forEach(([fx, fz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6), flagPoleMat);
    pole.position.set(fx, 0.75, fz);
    scene.add(pole);

    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.32), flagMat);
    flag.position.set(fx + 0.26, 1.4, fz);
    flag.rotation.y = Math.PI / 2;
    scene.add(flag);
  });
  ```

- [ ] **Step 2: Verify visually**

  Small red flags on white poles should be visible at each corner of the pitch at ground level.

- [ ] **Step 3: Commit**

  ```bash
  git add main.js
  git commit -m "feat: stadium pass 3c — corner flags"
  ```

---

### Task 10: Running track

**Files:**
- Modify: `main.js` — inside `makeStadium()`, after corner flags

- [ ] **Step 1: Add four track strips around the pitch**

  ```js
  // ── Running track ─────────────────────────────────────────────────────────
  const trackMat = new THREE.MeshStandardMaterial({ color: 0xc8603a, roughness: 0.95, metalness: 0 });
  const TRACK_W  = 4.5;

  // Long sides (east & west)
  [-1, 1].forEach(sx => {
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(TRACK_W, 69), trackMat);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(sx * (20 + TRACK_W / 2), 0.005, 0);
    scene.add(strip);
  });

  // End strips (north & south)
  [-1, 1].forEach(sz => {
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(49, TRACK_W), trackMat);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(0, 0.005, sz * (30 + TRACK_W / 2));
    scene.add(strip);
  });
  ```

- [ ] **Step 2: Verify visually**

  A terracotta border should ring the pitch, flush with the ground, separating the green grass from the hoardings.

- [ ] **Step 3: Commit**

  ```bash
  git add main.js
  git commit -m "feat: stadium pass 3d — running track perimeter"
  ```

---

### Task 11: Scoreboard

**Files:**
- Modify: `main.js` — inside `makeStadium()`, after the running track

- [ ] **Step 1: Add `makeScoreboardTexture()` helper**

  ```js
  function makeScoreboardTexture() {
    const W = 512, H = 256;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');

    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, W, H);

    // Header
    ctx.fillStyle = '#e8c44a';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FIFA WORLD CUP 2026', W / 2, 36);

    // Divider
    ctx.strokeStyle = '#e8c44a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, 52); ctx.lineTo(W - 20, 52); ctx.stroke();

    // Team names
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CANADA', 24, 115);
    ctx.textAlign = 'right';
    ctx.fillText('BOSNIA & HERZ.', W - 24, 115);

    // Score
    ctx.font = 'bold 52px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0 - 0', W / 2, 190);

    // Footer
    ctx.font = '15px Arial, sans-serif';
    ctx.fillStyle = '#888888';
    ctx.fillText('GROUP STAGE · TORONTO', W / 2, 232);

    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  ```

- [ ] **Step 2: Add scoreboard geometry**

  After the running track block:

  ```js
  // ── Scoreboard ────────────────────────────────────────────────────────────
  const sbMat = new THREE.MeshStandardMaterial({ map: makeScoreboardTexture() });

  // Support pillars
  [-7, 7].forEach(px => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 14, 8), concreteMat);
    pillar.position.set(px, 7, -58);
    scene.add(pillar);
  });

  // Screen (faces +z toward camera / pitch)
  const sbScreen = new THREE.Mesh(new THREE.BoxGeometry(16, 8, 0.4), sbMat);
  sbScreen.position.set(0, 18, -58);
  scene.add(sbScreen);
  ```

- [ ] **Step 3: Verify visually**

  A dark scoreboard panel showing "CANADA — 0 - 0 — BOSNIA & HERZ." with a gold FIFA header should be visible at the far end of the stadium, mounted on two concrete pillars.

- [ ] **Step 4: Commit**

  ```bash
  git add main.js
  git commit -m "feat: stadium pass 3e — scoreboard with canvas texture"
  ```

---

## Done

All 11 tasks complete. The stadium now has:
- Classic FIFA red/blue/grey seating palette
- Row riser faces and fascia bands
- Angled roof canopies
- Filled corner stands
- Exterior arcade facade
- Crowd canvas textures
- FIFA World Cup advertising hoardings
- Corner flags
- Terracotta running track
- Scoreboard at far end
