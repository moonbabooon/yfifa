// ── Live vote tally — Firebase Realtime Database ─────────────────────────────
//
// SETUP (5 min, free):
//  1. Go to console.firebase.google.com → Add project (any name)
//  2. Build → Realtime Database → Create database → Start in TEST MODE
//  3. Rules tab → paste:
//       { "rules": { "predictions": { ".read": true, ".write": true } } }
//  4. Project Settings (gear icon) → Your apps → Add web app → copy firebaseConfig
//  5. Replace `null` below with that config object
//
// Until configured, votes are saved to localStorage only (no sync between users).
// ─────────────────────────────────────────────────────────────────────────────

const FIREBASE_CONFIG = null;
// const FIREBASE_CONFIG = {
//   apiKey:            "...",
//   authDomain:        "....firebaseapp.com",
//   databaseURL:       "https://...-default-rtdb.firebaseio.com",
//   projectId:         "...",
//   storageBucket:     "....appspot.com",
//   messagingSenderId: "...",
//   appId:             "...",
// };

// ── LocalStorage (always used) ────────────────────────────────────────────────
const LS_KEY = 'yfifa_prediction';
export const getSavedPick = () => localStorage.getItem(LS_KEY);
export const savePick     = pick => localStorage.setItem(LS_KEY, pick);

// ── Firebase (only when FIREBASE_CONFIG is set) ───────────────────────────────
let _ref       = null;
let _increment = null;
let _update    = null;
let _onValue   = null;

const fbReady = FIREBASE_CONFIG
  ? (async () => {
      try {
        const [{ initializeApp }, { getDatabase, ref, increment, update, onValue }] =
          await Promise.all([
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js'),
          ]);
        const db = getDatabase(initializeApp(FIREBASE_CONFIG));
        _ref       = ref(db, 'predictions');
        _increment = increment;
        _update    = update;
        _onValue   = onValue;
        return true;
      } catch (e) {
        console.warn('[predictions] Firebase init failed:', e.message);
        return false;
      }
    })()
  : Promise.resolve(false);

export async function castVote(pick) {
  if (!(await fbReady)) return;
  await _update(_ref, { [pick]: _increment(1) });
}

export async function subscribeTotals(callback) {
  if (!(await fbReady)) return;
  _onValue(_ref, snap => {
    const d = snap.val() || {};
    callback({
      canada: d.canada || 0,
      bosnia: d.bosnia || 0,
      draw:   d.draw   || 0,
    });
  });
}
