# FIFA WC 2026 Invitation Page — Upgrade Design Spec
**Date:** 2026-04-09  
**Audience:** Select executives and decision-makers at partner companies  
**Delivery:** Physical mailed card with QR code linking to this page

---

## Overview

Upgrade the existing Three.js FIFA World Cup 2026 invitation page (Canada vs Bosnia, BMO Field) to fill empty screen real estate, fix the header/banner spacing, and add interactive features that build excitement and feel premium for an executive audience.

The 3D stadium, rotating trophy, orbit controls, and all existing Three.js scene elements are **preserved unchanged**. All new UI elements are overlays on top of the existing canvas.

---

## Problems Being Solved

1. **Empty space** — large unused areas on left and right of the 3D scene
2. **Banner/header collision** — VS banner text touching the top of the page (insufficient spacing between header and banner)
3. **No interactivity beyond RSVP** — nothing to engage with beyond clicking the trophy and RSVPing
4. **No excitement-building** — no sense of urgency or competition before kickoff

---

## Design Direction

**Aesthetic:** Premium, luxury sports editorial. Dark glass panels, gold accents, Bebas Neue display type, Playfair Display for editorial italics, DM Sans for body. Subtle film grain overlay across the entire page to evoke a luxury print piece.

**Tone:** Exclusive. Bespoke. Built for people who appreciate craft — not gamified, not loud.

---

## Changes & New Features

### 1. Header / Banner Spacing Fix
- Increase top padding on `#header` to give breathing room
- Adjust `#vs-banner` `top` value so it sits clearly below the header text with visible separation
- Add `"tap for stats"` hint text under each team name in the banner

### 2. Live Countdown Timer
- Positioned below the VS banner, centred
- 4 units: Days · Hours · Mins · Secs
- Dark glass pill cards with gold numbers, ticking in real time to `2026-06-12T15:00:00-04:00`

### 3. Team Stat Panels (click to reveal)
- **Trigger:** clicking a team's flag/name in the VS banner
- **Canada panel** slides in from the left; **Bosnia panel** slides in from the right
- Animation: `translateX` + `opacity`, spring easing (`cubic-bezier(0.34,1.56,0.64,1)`)
- Each panel contains:
  - Country flag + name header with coloured left/right border accent (red for Canada, blue for Bosnia)
  - Key stat (FIFA ranking + one-line context)
  - 4 bullet highlights (notable players, tournament context)
  - ✕ close button; clicking the team again also toggles closed
- Panels are hidden by default, visible only on interaction

### 4. Predict the Winner Button (bottom-left)
- Frosted glass pill button, blue accent border
- Opens a **Prediction Modal**:
  - Two team cards (flag, name, one-line label) side by side
  - "It's a Draw" option below
  - "Lock In My Prediction" CTA button (disabled until a pick is selected)
  - On submit: modal closes, toast notification confirms pick (e.g. "🍁 Canada win locked in!")
- Prediction is client-side only — no backend required

### 5. Match Programme Button (bottom-left, below Predict)
- Frosted glass pill button, gold accent border
- Opens a **Match Programme Modal** — a beautifully designed full-screen-height scrollable modal styled like a luxury print programme:
  - **Header section:** gold top line accent, eyebrow text, match title, subtitle, matchup row with flags + date
  - **The Story of the Match:** 2 paragraphs of editorial copy about the matchup
  - **By the Numbers:** 4 stat cards in a 2×2 grid (Canada rank, Bosnia rank, stadium capacity, years since last WC)
  - **Players to Watch:** 3 player rows (Alphonso Davies, Jonathan David, Edin Džeko) with number, name, club
  - **Venue & Logistics:** 3 icon cards (Venue, Kickoff, "VIP GUEST" status)
  - **Footer:** tournament info + trophy emoji

### 6. Film Grain Texture Overlay
- Fixed `div.grain` over the entire page, `z-index: 100`, `pointer-events: none`
- SVG fractalNoise pattern, `opacity: 0.032`, `mix-blend-mode: overlay`
- Gives the page a premium luxury-print tactile quality

---

## Layout

```
┌─────────────────────────────────────────────────┐
│          FIFA WORLD CUP 2026™  (header)         │
│        GROUP STAGE · BMO FIELD, TORONTO          │
│                                                  │
│              [ CANADA  VS  BOSNIA ]              │  ← VS banner
│           [ 64d · 09h · 41m · 22s ]             │  ← Countdown
│                                                  │
│  [Canada Panel]    3D SCENE     [Bosnia Panel]   │  ← slide-in on click
│   (hidden)       trophy/field     (hidden)       │
│                                                  │
│  [🏆 PREDICT]                  [⚽ ARE YOU IN?] │
│  [📋 PROGRAMME]                [😔 CAN'T MAKE IT]│
└─────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `style.css` | Header padding, VS banner top offset, new panel/countdown/button/modal styles, grain overlay |
| `index.html` | Grain div, countdown markup, stat panel markup, bottom-left buttons, predict modal, programme modal |
| `main.js` | Countdown JS, panel toggle logic, modal open/close logic, prediction submit + toast |

No new files. No backend changes. No dependency additions.

---

## Out of Scope

- Personalized URLs per recipient (QR codes are shared/identical)
- Server-side prediction tracking
- Social sharing of predictions
- Mobile/responsive layout changes
- Ambient audio
- Any changes to the Three.js scene, camera, lighting, or trophy model
