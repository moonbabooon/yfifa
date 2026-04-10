# FIFA WC 2026 Invitation Page Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add countdown timer, click-to-reveal team stat panels, Predict the Winner modal, Match Programme modal, film grain overlay, and fix header/banner spacing — all as overlays on the existing Three.js scene.

**Architecture:** Pure HTML/CSS/JS additions to three existing files (`index.html`, `style.css`, `main.js`). No new files, no build tools, no dependencies. All interactive logic is appended to `main.js` after the existing Three.js animation loop. CSS is appended to `style.css`.

**Tech Stack:** Vanilla JS, CSS3 (transitions, backdrop-filter, keyframes), Three.js (untouched), Google Fonts (Playfair Display already loaded via new link tag)

---

## File Map

| File | What changes |
|------|-------------|
| `index.html` | Add Playfair Display font link; add grain div; add countdown markup; add stat panel markup for both teams; add bottom-left button group; add predict modal + overlay; add programme modal + overlay |
| `style.css` | Fix header padding + venue text; fix VS banner top; add countdown styles; add stat panel styles; add bottom-left button styles; add modal overlay styles; add predict modal styles; add programme modal styles; add grain styles |
| `main.js` | Append: countdown tick function + interval; team panel toggle logic; generic modal open/close helpers; prediction selection + submit + toast logic |

---

## Task 1: Fix Header / Banner Spacing + Venue Legibility

**Files:**
- Modify: `style.css` (header, match-venue, vs-banner rules)
- Modify: `index.html` (add "tap for stats" hint spans, add Playfair Display font)

- [ ] **Step 1: Add Playfair Display to font import in `index.html`**

Find the existing Google Fonts link (line 8) and replace it:

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Fix header padding and venue text in `style.css`**

Find the existing `#header` rule and update `padding`:
```css
#header {
  position: fixed;
  top: 0; left: 0; right: 0;
  padding: 18px 24px 14px;
  text-align: center;
  z-index: 12;
  pointer-events: none;
}
```

Find the existing `.match-venue` rule and replace it:
```css
.match-venue {
  font-size: 12px;
  letter-spacing: 3px;
  color: rgba(255,255,255,0.92);
  margin-top: 6px;
  text-transform: uppercase;
  font-weight: 400;
  text-shadow: 0 1px 6px rgba(0,0,0,0.7);
}
```

- [ ] **Step 3: Push VS banner down in `style.css`**

Find the existing `#vs-banner` rule and update `top`:
```css
#vs-banner {
  position: fixed;
  top: 88px; left: 50%; transform: translateX(-50%);
  /* rest of existing properties unchanged */
}
```

- [ ] **Step 4: Add "tap for stats" hint + make teams clickable in `index.html`**

Find the existing Canada team div and replace it:
```html
<div class="team canada-team" id="canada-trigger">
  <img src="https://flagcdn.com/w160/ca.png" alt="Canada" class="team-flag" />
  <span class="team-name">CANADA</span>
  <span class="tap-hint">tap for stats</span>
</div>
```

Find the existing Bosnia team div and replace it:
```html
<div class="team bosnia-team" id="bosnia-trigger">
  <img src="https://flagcdn.com/w160/ba.png" alt="Bosnia &amp; Herzegovina" class="team-flag" />
  <span class="team-name">BOSNIA &amp; HERZ.</span>
  <span class="tap-hint">tap for stats</span>
</div>
```

- [ ] **Step 5: Add tap-hint style to `style.css`** (append to end of file)

```css
/* ── Tap Hint ────────────────────────────────────────────────────── */
.tap-hint {
  font-size: 8px;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.28);
  text-transform: uppercase;
  font-weight: 300;
}
```

- [ ] **Step 6: Open the page in browser and verify**

Open `index.html` directly (or via local server). Confirm:
- Header and VS banner no longer touch — visible gap between them
- "GROUP STAGE · BMO FIELD, TORONTO" is clearly legible against the sky
- "tap for stats" appears in small text under each team name

- [ ] **Step 7: Commit**

```bash
git add index.html style.css
git commit -m "fix: header/banner spacing, venue legibility, tap-for-stats hints"
```

---

## Task 2: Film Grain Overlay

**Files:**
- Modify: `index.html` (add grain div)
- Modify: `style.css` (add grain styles)

- [ ] **Step 1: Add grain div to `index.html`**

Add immediately after `<body>`:
```html
<div class="grain"></div>
```

- [ ] **Step 2: Add grain styles to `style.css`** (append to end of file)

```css
/* ── Film Grain ──────────────────────────────────────────────────── */
.grain {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  opacity: 0.032;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
  mix-blend-mode: overlay;
}
```

- [ ] **Step 3: Verify in browser**

The page should look subtly richer — a very faint texture over the whole scene. It should not be obvious or distracting. If it looks too strong, reduce `opacity` toward `0.02`.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: add film grain texture overlay for premium feel"
```

---

## Task 3: Live Countdown Timer

**Files:**
- Modify: `index.html` (add countdown markup)
- Modify: `style.css` (add countdown styles)
- Modify: `main.js` (append countdown logic)

- [ ] **Step 1: Add countdown HTML to `index.html`**

Add after the closing `</div>` of `#vs-banner`:
```html
<div id="countdown">
  <div class="count-unit"><div class="count-num" id="cd-days">--</div><div class="count-label">Days</div></div>
  <div class="count-sep">·</div>
  <div class="count-unit"><div class="count-num" id="cd-hrs">--</div><div class="count-label">Hours</div></div>
  <div class="count-sep">·</div>
  <div class="count-unit"><div class="count-num" id="cd-mins">--</div><div class="count-label">Mins</div></div>
  <div class="count-sep">·</div>
  <div class="count-unit"><div class="count-num" id="cd-secs">--</div><div class="count-label">Secs</div></div>
</div>
```

- [ ] **Step 2: Add countdown styles to `style.css`** (append to end)

```css
/* ── Countdown ───────────────────────────────────────────────────── */
#countdown {
  position: fixed;
  top: 208px; left: 50%; transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  pointer-events: none;
}

.count-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0,0,0,0.58);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(201,162,39,0.22);
  border-radius: 10px;
  padding: 10px 13px 8px;
  min-width: 54px;
}

.count-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 30px;
  color: #e8c547;
  line-height: 1;
}

.count-label {
  font-size: 7px;
  letter-spacing: 2.5px;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  font-weight: 300;
  margin-top: 3px;
}

.count-sep {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 26px;
  color: rgba(201,162,39,0.25);
  margin-top: -6px;
}
```

- [ ] **Step 3: Append countdown JS to `main.js`**

Add at the very end of `main.js`:
```js
// ── Countdown Timer ───────────────────────────────────────────────────────────
(function () {
  const matchDate = new Date('2026-06-12T15:00:00-04:00');

  function tickCountdown() {
    const diff = matchDate - new Date();
    if (diff <= 0) return;
    document.getElementById('cd-days').textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
    document.getElementById('cd-hrs').textContent  = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  }

  tickCountdown();
  setInterval(tickCountdown, 1000);
}());
```

- [ ] **Step 4: Verify in browser**

Countdown should appear centred below the VS banner, ticking every second. Days should show ~64 (as of April 2026).

- [ ] **Step 5: Commit**

```bash
git add index.html style.css main.js
git commit -m "feat: add live countdown timer to match date"
```

---

## Task 4: Team Stat Panels

**Files:**
- Modify: `index.html` (add two stat panel divs)
- Modify: `style.css` (add stat panel styles)
- Modify: `main.js` (append panel toggle logic)

- [ ] **Step 1: Add stat panel HTML to `index.html`**

Add after the `#tooltip` div:
```html
<!-- Canada Stat Panel -->
<div class="stat-panel canada-panel" id="canada-panel">
  <div class="panel-header">
    <img src="https://flagcdn.com/w80/ca.png" class="panel-flag" alt="Canada" />
    <span class="panel-country canada-country">CANADA</span>
    <button class="panel-close" data-target="canada-panel">✕</button>
  </div>
  <div class="stat-lbl">Key Stat</div>
  <div class="stat-big">FIFA #49</div>
  <div class="stat-desc">Highest ranking in history. 2022 was their first World Cup in 36 years — now playing on home soil.</div>
  <div class="stat-lbl">Highlights</div>
  <ul class="stat-highlights">
    <li>Alphonso Davies — Bayern Munich starter</li>
    <li>Unbeaten in CONCACAF qualifying</li>
    <li>Home crowd advantage at BMO Field</li>
    <li>Jonathan David — top European scorer</li>
  </ul>
</div>

<!-- Bosnia Stat Panel -->
<div class="stat-panel bosnia-panel" id="bosnia-panel">
  <div class="panel-header">
    <img src="https://flagcdn.com/w80/ba.png" class="panel-flag" alt="Bosnia" />
    <span class="panel-country bosnia-country">BOSNIA</span>
    <button class="panel-close" data-target="bosnia-panel">✕</button>
  </div>
  <div class="stat-lbl">Key Stat</div>
  <div class="stat-big">FIFA #62</div>
  <div class="stat-desc">First WC appearance was 2014 Brazil. Attack-minded football with a dangerous set-piece threat.</div>
  <div class="stat-lbl">Highlights</div>
  <ul class="stat-highlights">
    <li>Edin Džeko — all-time leading scorer</li>
    <li>Strong European league presence</li>
    <li>Disciplined defensive block</li>
    <li>Veteran squad with WC experience</li>
  </ul>
</div>
```

- [ ] **Step 2: Add stat panel styles to `style.css`** (append to end)

```css
/* ── Stat Panels ─────────────────────────────────────────────────── */
.stat-panel {
  position: fixed;
  top: 50%;
  width: 230px;
  background: rgba(5,9,5,0.94);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(201,162,39,0.18);
  border-radius: 16px;
  padding: 22px;
  z-index: 15;
  transition: opacity 0.35s cubic-bezier(0.34,1.56,0.64,1),
              transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
}

.canada-panel {
  left: 24px;
  border-left: 3px solid #ff4444;
  transform: translateY(-50%) translateX(-300px);
  opacity: 0;
}

.canada-panel.open {
  transform: translateY(-50%) translateX(0);
  opacity: 1;
}

.bosnia-panel {
  right: 24px;
  border-right: 3px solid #4488ff;
  transform: translateY(-50%) translateX(300px);
  opacity: 0;
}

.bosnia-panel.open {
  transform: translateY(-50%) translateX(0);
  opacity: 1;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.panel-flag {
  width: 36px;
  height: auto;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.panel-country {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: 2px;
}

.canada-country { color: #ff4444; }
.bosnia-country { color: #4488ff; }

.panel-close {
  margin-left: auto;
  background: none;
  border: none;
  color: rgba(255,255,255,0.25);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1;
}
.panel-close:hover { color: rgba(255,255,255,0.7); }

.stat-lbl {
  font-size: 8px;
  letter-spacing: 2.5px;
  color: rgba(255,255,255,0.22);
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-big {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 40px;
  color: #e8c547;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-desc {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  line-height: 1.6;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.stat-highlights {
  list-style: none;
}

.stat-highlights li {
  font-size: 12px;
  color: rgba(255,255,255,0.58);
  padding: 5px 0;
  line-height: 1.4;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.stat-highlights li:last-child { border-bottom: none; }
.stat-highlights li::before { content: "▸ "; color: rgba(201,162,39,0.45); }
```

- [ ] **Step 3: Append panel toggle JS to `main.js`**

```js
// ── Team Stat Panels ──────────────────────────────────────────────────────────
(function () {
  const canadaPanel  = document.getElementById('canada-panel');
  const bosniaPanel  = document.getElementById('bosnia-panel');
  const canadaTrigger = document.getElementById('canada-trigger');
  const bosniaTrigger = document.getElementById('bosnia-trigger');

  canadaTrigger.addEventListener('click', () => {
    canadaPanel.classList.toggle('open');
  });

  bosniaTrigger.addEventListener('click', () => {
    bosniaPanel.classList.toggle('open');
  });

  document.querySelectorAll('.panel-close').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById(btn.dataset.target).classList.remove('open');
    });
  });
}());
```

- [ ] **Step 4: Verify in browser**

- Click "CANADA" in the VS banner → Canada panel slides in from the left
- Click "CANADA" again → panel slides back out
- Click ✕ on either panel → panel closes
- Click "BOSNIA" → Bosnia panel slides in from the right
- Both panels can be open simultaneously

- [ ] **Step 5: Commit**

```bash
git add index.html style.css main.js
git commit -m "feat: click-to-reveal team stat panels with slide animation"
```

---

## Task 5: Predict the Winner

**Files:**
- Modify: `index.html` (bottom-left button group + predict modal markup)
- Modify: `style.css` (bottom-left buttons + modal styles)
- Modify: `main.js` (modal open/close + prediction logic)

- [ ] **Step 1: Add bottom-left button group + predict modal to `index.html`**

Add after the `#rsvp-cta` div:
```html
<!-- Bottom-left action buttons -->
<div id="bottom-left">
  <div class="bl-btn" id="predict-btn">
    <div class="bl-icon">🏆</div>
    <div class="bl-labels">
      <span class="bl-title predict-title">PREDICT THE WINNER</span>
      <span class="bl-sub">WHO TAKES IT?</span>
    </div>
  </div>
  <div class="bl-btn" id="programme-btn">
    <div class="bl-icon">📋</div>
    <div class="bl-labels">
      <span class="bl-title programme-title">MATCH PROGRAMME</span>
      <span class="bl-sub">THE FULL STORY</span>
    </div>
  </div>
</div>

<!-- Predict overlay -->
<div class="modal-overlay" id="predict-overlay"></div>
<div class="modal-box" id="predict-modal">
  <button class="modal-close-btn" data-overlay="predict-overlay" data-modal="predict-modal">✕</button>
  <div class="modal-eyebrow">Before the whistle blows</div>
  <div class="modal-title-text">WHO WINS ON JUNE 12?</div>
  <div class="modal-sub-text">Your prediction is on record.</div>
  <div class="predict-choices">
    <div class="predict-choice canada-pick" data-pick="canada">
      <img src="https://flagcdn.com/w160/ca.png" class="choice-flag" alt="Canada" />
      <div class="choice-name canada-choice-name">CANADA</div>
      <div class="choice-label">Home advantage</div>
    </div>
    <div class="predict-choice bosnia-pick" data-pick="bosnia">
      <img src="https://flagcdn.com/w160/ba.png" class="choice-flag" alt="Bosnia" />
      <div class="choice-name bosnia-choice-name">BOSNIA</div>
      <div class="choice-label">European flair</div>
    </div>
  </div>
  <div class="draw-option" data-pick="draw">IT'S A DRAW &nbsp;·&nbsp; 90 MINS ISN'T ENOUGH</div>
  <button id="submit-prediction" disabled>LOCK IN MY PREDICTION</button>
</div>
```

- [ ] **Step 2: Add bottom-left + modal styles to `style.css`** (append to end)

```css
/* ── Bottom-Left Buttons ─────────────────────────────────────────── */
#bottom-left {
  position: fixed;
  bottom: 28px;
  left: 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 15;
}

.bl-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(12px);
  border-radius: 50px;
  padding: 11px 22px 11px 16px;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

#predict-btn {
  border: 1px solid rgba(100,160,255,0.4);
}
#predict-btn:hover {
  transform: scale(1.04);
  border-color: rgba(100,160,255,0.85);
  box-shadow: 0 0 20px rgba(68,136,255,0.2);
}

#programme-btn {
  border: 1px solid rgba(201,162,39,0.35);
}
#programme-btn:hover {
  transform: scale(1.04);
  border-color: rgba(201,162,39,0.8);
  box-shadow: 0 0 20px rgba(201,162,39,0.15);
}

.bl-icon { font-size: 26px; line-height: 1; }

.bl-labels {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.bl-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 16px;
  letter-spacing: 3px;
  line-height: 1;
}

.predict-title  { color: #88bbff; }
.programme-title { color: #c9a227; }

.bl-sub {
  font-size: 9px;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.38);
  font-weight: 300;
}

/* ── Shared Modal Base ───────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
  z-index: 40;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}
.modal-overlay.open { opacity: 1; pointer-events: all; }

.modal-box {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(0.92);
  z-index: 45;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s, transform 0.35s cubic-bezier(0.34,1.3,0.64,1);
  box-shadow: 0 24px 80px rgba(0,0,0,0.7);
}
.modal-box.open {
  opacity: 1;
  pointer-events: all;
  transform: translate(-50%, -50%) scale(1);
}

.modal-close-btn {
  position: absolute;
  top: 16px; right: 18px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.25);
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 2;
}
.modal-close-btn:hover { color: rgba(255,255,255,0.7); }

/* ── Predict Modal ───────────────────────────────────────────────── */
#predict-modal {
  width: min(580px, 92vw);
  background: linear-gradient(155deg, #0a160a 0%, #060b06 100%);
  border: 1px solid rgba(201,162,39,0.25);
  border-radius: 20px;
  padding: 36px;
}

.modal-eyebrow {
  font-size: 9px;
  letter-spacing: 3px;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 8px;
}

.modal-title-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  letter-spacing: 4px;
  text-align: center;
  margin-bottom: 6px;
}

.modal-sub-text {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 13px;
  color: rgba(255,255,255,0.35);
  text-align: center;
  margin-bottom: 24px;
}

.predict-choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 12px;
}

.predict-choice {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 22px 18px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.25s, background 0.25s, transform 0.2s;
  background: rgba(255,255,255,0.03);
}
.predict-choice:hover { transform: translateY(-2px); }

.canada-pick { border-color: rgba(255,68,68,0.3); }
.canada-pick:hover { border-color: rgba(255,68,68,0.75); background: rgba(255,68,68,0.07); }
.canada-pick.selected { border-color: #ff4444; background: rgba(255,68,68,0.12); }

.bosnia-pick { border-color: rgba(68,136,255,0.3); }
.bosnia-pick:hover { border-color: rgba(68,136,255,0.75); background: rgba(68,136,255,0.07); }
.bosnia-pick.selected { border-color: #4488ff; background: rgba(68,136,255,0.12); }

.choice-flag {
  width: 56px;
  height: auto;
  border-radius: 4px;
  margin: 0 auto 12px;
  display: block;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);
}

.choice-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: 3px;
  margin-bottom: 4px;
}
.canada-choice-name { color: #ff4444; }
.bosnia-choice-name { color: #4488ff; }

.choice-label {
  font-size: 9px;
  letter-spacing: 1.5px;
  color: rgba(255,255,255,0.28);
  text-transform: uppercase;
}

.draw-option {
  text-align: center;
  padding: 13px;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 15px;
  letter-spacing: 3px;
  color: rgba(255,255,255,0.32);
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  background: rgba(255,255,255,0.02);
  margin-bottom: 18px;
}
.draw-option:hover { border-color: rgba(201,162,39,0.5); color: #c9a227; background: rgba(201,162,39,0.05); }
.draw-option.selected { border-color: #c9a227; color: #e8c547; background: rgba(201,162,39,0.08); }

#submit-prediction {
  width: 100%;
  background: linear-gradient(135deg, #c9a227, #e8c547);
  border: none;
  border-radius: 10px;
  padding: 15px;
  color: #080600;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;
  letter-spacing: 4px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  opacity: 0.35;
}
#submit-prediction:not(:disabled) { opacity: 1; }
#submit-prediction:not(:disabled):hover { transform: scale(1.02); }
```

- [ ] **Step 3: Append predict modal JS to `main.js`**

```js
// ── Modal Helpers ─────────────────────────────────────────────────────────────
function openModal(overlayId, modalId) {
  document.getElementById(overlayId).classList.add('open');
  document.getElementById(modalId).classList.add('open');
}
function closeModal(overlayId, modalId) {
  document.getElementById(overlayId).classList.remove('open');
  document.getElementById(modalId).classList.remove('open');
}

document.querySelectorAll('.modal-close-btn').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.overlay, btn.dataset.modal));
});
document.getElementById('predict-overlay').addEventListener('click', () => closeModal('predict-overlay', 'predict-modal'));

// ── Predict the Winner ────────────────────────────────────────────────────────
(function () {
  let currentPick = null;
  const submitBtn = document.getElementById('submit-prediction');

  document.getElementById('predict-btn').addEventListener('click', () => openModal('predict-overlay', 'predict-modal'));

  document.querySelectorAll('.predict-choice, .draw-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.predict-choice, .draw-option').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      currentPick = el.dataset.pick;
      submitBtn.disabled = false;
    });
  });

  submitBtn.addEventListener('click', () => {
    if (!currentPick) return;
    const labels = {
      canada: '🍁 Canada win locked in!',
      bosnia: '💙 Bosnia win locked in!',
      draw:   '🤝 Draw locked in!'
    };
    const toast = document.getElementById('success-toast');
    const original = toast.textContent;
    toast.textContent = labels[currentPick];
    closeModal('predict-overlay', 'predict-modal');
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => { toast.textContent = original; }, 400);
    }, 3500);
  });
}());
```

> Note: reuses the existing `#success-toast` element already in `index.html` — no new toast element needed.

- [ ] **Step 4: Verify in browser**

- "PREDICT THE WINNER" button appears bottom-left, blue-accented
- Clicking it opens modal with two team cards + draw option
- Selecting any option highlights it; "LOCK IN" button activates
- Clicking "LOCK IN" closes modal and shows toast with the right message
- Clicking outside modal (overlay) closes it
- ✕ button closes it

- [ ] **Step 5: Commit**

```bash
git add index.html style.css main.js
git commit -m "feat: predict the winner modal with team picks and toast confirmation"
```

---

## Task 6: Match Programme Modal

**Files:**
- Modify: `index.html` (add programme modal markup)
- Modify: `style.css` (add programme modal styles)
- Modify: `main.js` (append programme open/close wiring)

- [ ] **Step 1: Add programme modal HTML to `index.html`**

Add after the `#predict-modal` closing div:
```html
<!-- Programme overlay -->
<div class="modal-overlay" id="programme-overlay"></div>
<div class="modal-box" id="programme-modal">
  <button class="modal-close-btn" data-overlay="programme-overlay" data-modal="programme-modal">✕</button>

  <div class="prog-header">
    <div class="prog-gold-line"></div>
    <div class="prog-eyebrow">Official Match Programme</div>
    <div class="prog-title">CANADA VS BOSNIA</div>
    <div class="prog-subtitle">A night of history at BMO Field, Toronto</div>
    <div class="prog-matchup">
      <div class="prog-team">
        <img src="https://flagcdn.com/w80/ca.png" class="prog-flag" alt="Canada" />
        <span class="prog-team-name prog-ca">CANADA</span>
      </div>
      <span class="prog-vs">VS</span>
      <div class="prog-team">
        <img src="https://flagcdn.com/w80/ba.png" class="prog-flag" alt="Bosnia" />
        <span class="prog-team-name prog-ba">BOSNIA &amp; HERZ.</span>
      </div>
      <div class="prog-date">
        <div class="prog-date-main">JUNE 12, 2026</div>
        <div class="prog-date-sub">3:00 PM ET · Kickoff</div>
      </div>
    </div>
  </div>

  <div class="prog-body">

    <div class="prog-section">
      <div class="prog-section-title">The Story of the Match</div>
      <p class="prog-para">Canada returns to the World Cup stage on home soil for the first time in a generation. BMO Field in Toronto will be electric — a crowd hungry to witness history as the Canucks take on Bosnia &amp; Herzegovina in what promises to be an unforgettable Group Stage opener.</p>
      <p class="prog-para">Bosnia bring European pedigree and a squad brimming with experience. Canada bring speed, hunger, and 60,000 passionate home fans. Only 90 minutes will decide it.</p>
    </div>

    <div class="prog-section">
      <div class="prog-section-title">By the Numbers</div>
      <div class="prog-stat-row">
        <div class="prog-stat-card">
          <div class="prog-stat-label">Canada FIFA Rank</div>
          <div class="prog-stat-value">#49</div>
          <div class="prog-stat-desc">Highest ever ranking in program history</div>
        </div>
        <div class="prog-stat-card">
          <div class="prog-stat-label">Bosnia FIFA Rank</div>
          <div class="prog-stat-value">#62</div>
          <div class="prog-stat-desc">First WC since 2014 Brazil campaign</div>
        </div>
      </div>
      <div class="prog-stat-row">
        <div class="prog-stat-card">
          <div class="prog-stat-label">Stadium Capacity</div>
          <div class="prog-stat-value">30K</div>
          <div class="prog-stat-desc">BMO Field, Toronto, Canada</div>
        </div>
        <div class="prog-stat-card">
          <div class="prog-stat-label">Years Since Last WC</div>
          <div class="prog-stat-value">36</div>
          <div class="prog-stat-desc">Canada last appeared in 1986 Mexico</div>
        </div>
      </div>
    </div>

    <div class="prog-section">
      <div class="prog-section-title">Players to Watch</div>
      <div class="prog-players">
        <div class="prog-player">
          <div class="prog-player-num">19</div>
          <div class="prog-player-info">
            <div class="prog-player-name">ALPHONSO DAVIES</div>
            <div class="prog-player-detail">Left Back &nbsp;·&nbsp; <span class="prog-player-club">Bayern Munich</span></div>
          </div>
        </div>
        <div class="prog-player">
          <div class="prog-player-num">20</div>
          <div class="prog-player-info">
            <div class="prog-player-name">JONATHAN DAVID</div>
            <div class="prog-player-detail">Striker &nbsp;·&nbsp; <span class="prog-player-club">Lille OSC</span></div>
          </div>
        </div>
        <div class="prog-player">
          <div class="prog-player-num">9</div>
          <div class="prog-player-info">
            <div class="prog-player-name">EDIN DŽEKO</div>
            <div class="prog-player-detail">Striker &nbsp;·&nbsp; <span class="prog-player-club">Bosnia &amp; Herz. Captain</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="prog-section">
      <div class="prog-section-title">Venue &amp; Logistics</div>
      <div class="prog-venue-grid">
        <div class="prog-venue-item">
          <div class="prog-venue-icon">📍</div>
          <div class="prog-venue-label">Venue</div>
          <div class="prog-venue-val">BMO FIELD</div>
        </div>
        <div class="prog-venue-item">
          <div class="prog-venue-icon">🕒</div>
          <div class="prog-venue-label">Kickoff</div>
          <div class="prog-venue-val">3:00 PM ET</div>
        </div>
        <div class="prog-venue-item">
          <div class="prog-venue-icon">🎟️</div>
          <div class="prog-venue-label">Your Status</div>
          <div class="prog-venue-val">VIP GUEST</div>
        </div>
      </div>
    </div>

  </div>

  <div class="prog-footer">
    <span class="prog-footer-text">FIFA WORLD CUP 2026™ · GROUP STAGE · MATCHDAY 1</span>
    <span class="prog-trophy-icon">🏆</span>
  </div>
</div>
```

- [ ] **Step 2: Add programme modal styles to `style.css`** (append to end)

```css
/* ── Programme Modal ─────────────────────────────────────────────── */
#programme-modal {
  width: min(720px, 94vw);
  max-height: 88vh;
  background: #09100a;
  border: 1px solid rgba(201,162,39,0.3);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.prog-header {
  background: linear-gradient(135deg, #0d1a0d 0%, #111d11 100%);
  border-bottom: 1px solid rgba(201,162,39,0.2);
  padding: 28px 36px 24px;
  position: relative;
  flex-shrink: 0;
}

.prog-gold-line {
  position: absolute;
  top: 0; left: 36px; right: 36px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #c9a227, transparent);
}

.prog-eyebrow {
  font-size: 9px;
  letter-spacing: 4px;
  color: #c9a227;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 10px;
  opacity: 0.7;
}

.prog-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 38px;
  letter-spacing: 5px;
  color: #fff;
  line-height: 1;
  margin-bottom: 4px;
}

.prog-subtitle {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 14px;
  color: rgba(255,255,255,0.4);
  margin-bottom: 20px;
}

.prog-matchup {
  display: flex;
  align-items: center;
  gap: 20px;
}

.prog-team {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prog-flag {
  width: 42px;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.6);
}

.prog-team-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: 3px;
}
.prog-ca { color: #ff4444; }
.prog-ba { color: #4488ff; }

.prog-vs {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;
  color: rgba(201,162,39,0.35);
  letter-spacing: 3px;
}

.prog-date { margin-left: auto; text-align: right; }
.prog-date-main {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 16px;
  letter-spacing: 2px;
  color: #e8c547;
}
.prog-date-sub {
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  margin-top: 2px;
}

.prog-body {
  overflow-y: auto;
  padding: 28px 36px 32px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201,162,39,0.2) transparent;
}
.prog-body::-webkit-scrollbar { width: 4px; }
.prog-body::-webkit-scrollbar-thumb { background: rgba(201,162,39,0.2); border-radius: 2px; }

.prog-section { margin-bottom: 28px; }

.prog-section-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px;
  letter-spacing: 4px;
  color: #c9a227;
  text-transform: uppercase;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(201,162,39,0.15);
}

.prog-para {
  font-family: 'Playfair Display', serif;
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  line-height: 1.85;
  margin-bottom: 10px;
}

.prog-stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 10px;
}

.prog-stat-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 14px 16px;
}

.prog-stat-label {
  font-size: 8px;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.prog-stat-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 26px;
  color: #e8c547;
  line-height: 1;
  margin-bottom: 2px;
}

.prog-stat-desc {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  line-height: 1.4;
}

.prog-players { display: flex; flex-direction: column; gap: 10px; }

.prog-player {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px;
  padding: 12px 16px;
}

.prog-player-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 26px;
  color: rgba(201,162,39,0.25);
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.prog-player-info { flex: 1; }

.prog-player-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 16px;
  letter-spacing: 2px;
  color: #fff;
  line-height: 1;
  margin-bottom: 2px;
}

.prog-player-detail {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
}

.prog-player-club {
  color: rgba(201,162,39,0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 10px;
}

.prog-venue-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.prog-venue-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 14px;
  text-align: center;
}

.prog-venue-icon { font-size: 22px; margin-bottom: 6px; }

.prog-venue-label {
  font-size: 8px;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.prog-venue-val {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 14px;
  letter-spacing: 1px;
  color: #fff;
}

.prog-footer {
  border-top: 1px solid rgba(201,162,39,0.12);
  padding: 16px 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0,0,0,0.3);
  flex-shrink: 0;
}

.prog-footer-text {
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.2);
  text-transform: uppercase;
}

.prog-trophy-icon { font-size: 20px; opacity: 0.5; }
```

- [ ] **Step 3: Append programme wiring to `main.js`**

```js
// ── Match Programme ───────────────────────────────────────────────────────────
document.getElementById('programme-overlay').addEventListener('click', () => closeModal('programme-overlay', 'programme-modal'));
document.getElementById('programme-btn').addEventListener('click', () => openModal('programme-overlay', 'programme-modal'));
```

> Note: `openModal` and `closeModal` are defined in Task 5. This task's JS must be appended after Task 5's JS block.

- [ ] **Step 4: Verify in browser**

- "MATCH PROGRAMME" button appears below "PREDICT" button, gold-accented
- Clicking opens a full-height scrollable modal with:
  - Gold top line accent in header
  - Match title, subtitle, flag matchup + date
  - Story section (2 paragraphs)
  - By the Numbers (4 stat cards)
  - Players to Watch (3 rows)
  - Venue & Logistics (3 icon cards)
  - Footer with tournament info + trophy
- Scroll works inside modal; clicking overlay or ✕ closes it

- [ ] **Step 5: Final smoke test — all features together**

Check end-to-end:
1. Header and VS banner have visible gap, venue text is legible
2. Countdown ticks in real time
3. Click Canada → left panel slides in; click again → slides out
4. Click Bosnia → right panel slides in; ✕ closes it
5. Both panels open at same time
6. Predict button → pick team → lock in → toast fires
7. Programme button → modal opens, scrolls, closes
8. Grain texture visible (subtle) on entire page

- [ ] **Step 6: Commit**

```bash
git add index.html style.css main.js
git commit -m "feat: match programme modal — editorial layout with stats, players, venue"
```
