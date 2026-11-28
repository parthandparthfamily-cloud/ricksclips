// "Your Lost Bag Isn't Lost" — word-by-word shot plan, timed to raw/voiceover.mp3 (65.46 s, 30 fps).
// Every clause gets a story action + a camera move. Transitions are camera moves: fly (same set), dissolve (6-8 f, both moving), whip (blurred).
import { clamp, lerp, ramp, M, q, blinkAt } from './motion.js';
export const FPS = 30, TOTAL = 1965;
const ez = M.smooth, eo = M.easeOut, ei = M.easeIn, back = M.back;
const L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const seq = (f, list) => { let v = list[0][1]; for (const [f0, x] of list) if (f >= f0) v = x; return v; };
const wob = (f, s, a = 1) => a * (Math.sin(f * 0.11 + s) * 0.6 + Math.sin(f * 0.047 + s * 2.3) * 0.4);
const talkAt = (f, on = true) => (on ? q(0.5 + 0.5 * Math.sin(f * 1.55) * Math.sin(f * 0.43 + 1), 1) : 0);

// ---------- lights per set ----------
const LIGHTS = {
  A: { az: -100, el: 42, sky: '#e8eefc', ground: '#b8a890', hemi: 1.25, sun: '#fff1dc', sunI: 1.5, fog: '#dfe8f2', fogNear: 30, fogFar: 260, skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, vig: 0.18, shadowExt: 12 },
  B: { az: -110, el: 30, sky: '#fff4e2', ground: '#a88a6a', hemi: 1.2, sun: '#ffe2b8', sunI: 1.5, fog: '#f3e6d4', fogNear: 30, fogFar: 160, skyTop: '#5f9ae0', skyHor: '#cfe2f6', sat: 1.1, vig: 0.2, shadowExt: 7 },
  Bm: { az: -100, el: 14, sky: '#ffe9d2', ground: '#a88a6a', hemi: 1.15, sun: '#ffc68a', sunI: 1.7, fog: '#f6d6b4', fogNear: 30, fogFar: 160, skyTop: '#7fa8e8', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.004, sat: 1.12, vig: 0.2, shadowExt: 7 },
  Bw: { az: -110, el: 30, sky: '#eef3fa', ground: '#9a9aa8', hemi: 1.25, sun: '#f2f6ff', sunI: 1.2, fog: '#e8eef6', fogNear: 20, fogFar: 90, skyTop: '#9fb8d8', skyHor: '#eef2f8', sat: 1.05, vig: 0.2, shadowExt: 7 },
  C: { az: 60, el: 62, sky: '#eef4ff', ground: '#8a95a3', hemi: 1.4, sun: '#ffffff', sunI: 1.1, fog: '#e8eef4', fogNear: 15, fogFar: 60, skyTop: '#9fc0e8', skyHor: '#e8eef4', sat: 1.1, vig: 0.18, shadowExt: 8 },
  D: { az: 40, el: 65, sky: '#e6eef8', ground: '#9a8f80', hemi: 1.35, sun: '#fff6e8', sunI: 1.25, fog: '#d7e0ea', fogNear: 14, fogFar: 70, skyTop: '#9fc0e8', skyHor: '#e8eef4', sat: 1.1, vig: 0.2, shadowExt: 12 },
  E: { az: 115, el: 38, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.1, sun: '#fff0d8', sunI: 2.3, fog: '#cadcf0', fogNear: 60, fogFar: 520, skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.12, vig: 0.18, shadowExt: 40 },
  F: { az: 70, el: 60, sky: '#fff8ee', ground: '#b0a28a', hemi: 1.35, sun: '#fffaf0', sunI: 1.3, fog: '#f4ecdc', fogNear: 18, fogFar: 75, skyTop: '#9fc0e8', skyHor: '#e8eef4', sat: 1.1, vig: 0.18, shadowExt: 14 },
};
// ---------- characters ----------
let TT = null; // toon module, set per frame
const ch = (id, key, p, o = {}, ex = {}) => {
  const sit = o.pose === 'sit';
  const k = key + JSON.stringify(o);
  return { id, key: k, draw: (pp) => { pp.g.translate(300, sit ? 760 : 975); pp.g.scale(1.2, 1.2); TT.drawChar(pp.g, key, o); }, x: p[0], y: p[1] + (sit ? -0.484 : 0) + (ex.bob || 0), z: p[2], ground: ex.ground ?? 0, roll: ex.roll ?? 0, s: ex.s || 1, flip: ex.flip, blob: ex.blob, shadow: ex.shadow, alpha: ex.alpha };
};
const life = (f, seed) => ({ bob: q(0.008 * Math.sin((f + seed * 11) * 0.12), 3), roll: q(0.02 * Math.sin((f + seed * 7) * 0.06), 3) });
const ht = (f, seed, a = 3) => q(a * Math.sin((f + seed * 5) * 0.07), 1);
// world point on a card (px,py in 600x1000 design units) for a card at P facing the camera
const cardPt = (P, cam, px, py, sit = false) => { const ry = Math.atan2(cam[0] - P[0], cam[2] - P[2]); const lx = (px - 300) / 600 * 1.35, ly = (1000 - py) / 1000 * 2.25 - 0.056 + (sit ? -0.484 : 0); return [P[0] + Math.cos(ry) * lx, P[1] + ly, P[2] - Math.sin(ry) * lx, ry]; };
const handR = (pose) => ({ holdUp: [420, 459], hold: [312, 431], point: [526, 513], up: [420, 331], thumb: [462, 513], hang: [394, 371 + 0] }[pose]);

// ---------- camera keys: Hermite spline through keys with time-scaled tangents (never parks), linear extrapolation ----------
const K = (f, pos, look, fov = 42, roll = 0) => ({ f, pos, look, fov, roll });
const herm = (keys, f, get) => {
  const n = keys.length; const v = (i) => get(keys[i]);
  const tan = (i) => { if (n < 2) return v(0).map(() => 0); const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1); return v(b).map((x, k) => (x - v(a)[k]) / (keys[b].f - keys[a].f)); };
  if (f <= keys[0].f) { const m = tan(0); return v(0).map((x, k) => x + m[k] * (f - keys[0].f)); }
  if (f >= keys[n - 1].f) { const m = tan(n - 1); return v(n - 1).map((x, k) => x + m[k] * (f - keys[n - 1].f)); }
  let i = 0; while (f > keys[i + 1].f) i++;
  const dt = keys[i + 1].f - keys[i].f, s = (f - keys[i].f) / dt, s2 = s * s, s3 = s2 * s;
  const h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
  const m0 = tan(i), m1 = tan(i + 1), p0 = v(i), p1 = v(i + 1);
  return p0.map((x, k) => h00 * x + h10 * dt * m0[k] + h01 * p1[k] + h11 * dt * m1[k]);
};
const evalKeys = (keys, f) => ({ pos: herm(keys, f, (k) => k.pos), look: herm(keys, f, (k) => k.look), fov: herm(keys, f, (k) => [k.fov])[0], roll: herm(keys, f, (k) => [k.roll])[0] });

// =====================================================================================
// set-wide defaults (living environment, always on)
// =====================================================================================
const birdsB = (f) => [0, 1, 2, 3].map((i) => { const k = ((f * 0.004 + i * 0.27) % 1); return { p: [93 + k * 16, 2.0 + i * 0.5 + Math.sin(f * 0.1 + i) * 0.15, -8 - i * 1.5], ry: Math.PI / 2, s: 1.2 }; });
const birdsE = (f) => [0, 1, 2, 3, 4, 5].map((i) => { const k = ((f * 0.003 + i * 0.17) % 1); return { p: [960 + k * 90, 14 + i * 1.6 + Math.sin(f * 0.08 + i) * 0.6, 10 - i * 4], ry: Math.PI / 2, s: 4 }; });
const SETDEF = {
  A: (f) => ({ beltS: f / 30 * 0.55 + 0.345 }),
  B: (f) => ({ birds: birdsB(f) }),
  C: () => ({}),
  D: (f) => ({ counter: 24817302 + Math.floor(f * 37.3) }),
  E: (f) => ({ birds: birdsE(f) }),
  F: () => ({}),
};

// =====================================================================================
// the hero's bag on the belt (hook): rides the back straight into the curtain tunnel
// =====================================================================================
const CAR_A = 3.5, CAR_R = 1.45, BACK0 = 2 * CAR_A + Math.PI * CAR_R;
const heroS = (f) => BACK0 + (CAR_A - 1.72) + f / 30 * 0.55;
const heroX = (f) => 1.72 - f / 30 * 0.55;
const lostT = (f, f0) => Math.max(0, (f - f0) / 18);
const stars = (c, n, r, f, f0, s = 0.06, dur = 22) => { const k = (f - f0) / dur; if (k < 0 || k > 1) return []; const o = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + f0; const rr = r * eo(k); o.push({ p: [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr * 0.8, c[2] + Math.sin(a * 1.7) * rr * 0.3], s: s * (1 - k * 0.7) * (0.7 + (i % 3) * 0.2), rz: k * 4 + i }); } return o; };
const puffs = (c, n, f, f0, s = 0.25, dur = 14) => { const k = (f - f0) / dur; if (k < 0 || k > 1) return []; const o = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283; o.push({ p: [c[0] + Math.cos(a) * s * 1.6 * eo(k), c[1] + k * s * 0.6, c[2] + Math.sin(a) * s * 1.6 * eo(k)], s: s * (0.5 + 0.6 * Math.sin(k * Math.PI)) }); } return o; };

// =====================================================================================
// THE TIMELINE
// =====================================================================================
const HERO = 'you';
const DESK_D = [12.75, 0, 4.5], DESK_Y = [11.58, 0.26, 4.5];
const KIOSK_S = [-13.4, 0, 4.6], KIOSK_Y = [-11.6, 0, 4.15];
const HB = [300, 1.81, -5.35];
const COMPS = [
  // ---------------- HOOK: "Your Lost Bag Isn't Lost" ----------------
  { id: 'hook1', a: 0, b: 34, set: 'A', keys: (c) => [K(0, [heroX(0) + 0.5, 0.95, -5.3], [heroX(0) - 0.05, 0.6, -4.45], 40, -2), K(20, [heroX(20) + 0.95, 1.15, -5.85], [heroX(20) - 0.35, 0.68, -4.4], 44, 1), K(34, [2.3, 1.2, -6.2], [0.9, 0.8, -4.45], 44, 3)],
    fp: (f) => [heroX(f), 0.64, -4.45], cinf: 9,
    st: (f) => ({ heroBeltS: heroS(f), flapKick: f > 26 ? Math.sin((f - 26) * 0.6) * Math.exp(-(f - 26) * 0.08) : 0 }),
    act: (f) => [ch('biz', 'biz', [-2.6, 0, -0.4], { expr: 'bored', look: 0.5, blink: blinkAt(f, 4) }, life(f, 4)), ch('granny', 'granny', [1.9, 0, -0.2], { expr: 'smile', look: -0.4, blink: blinkAt(f, 5) }, life(f, 5))] },
  { id: 'hook2', a: 34, b: 52, set: 'D', tin: 'dissolve', keys: () => [K(30, [300.18, 2.25, -4.55], [300, 2.17, -5.35], 40, -2), K(52, [300.75, 2.45, -3.2], [300, 2.12, -5.35], 44, 1)],
    fp: () => [300, 2.15, -5.35], cinf: 10,
    st: (f) => ({ heroDglow: 1, stars: stars([300, 2.2, -5.1], 10, 0.55, f, 36, 0.07, 18) }),
    act: (f) => [] },
  // ---------------- "Airlines lose millions of bags every year" ----------------
  { id: 'millions', a: 52, b: 86, set: 'D', tin: 'fly', keys: () => [K(52, [300.75, 2.45, -3.2], [300, 2.12, -5.35], 44, 1), K(66, [302, 5.2, -2.6], [299.5, 3.6, -8], 50, -1), K(86, [304, 8.4, 6.2], [299, 4.2, -9], 56, 2)],
    fp: () => [300, 3, -5], cinf: 4,
    act: (f) => [ch('hank', 'hank', [302.5, 0, -2.6], { expr: f < 70 ? 'neutral' : 'shock', look: -0.4, L: 'hang', R: 'hold', propR: 'clipboard', blink: blinkAt(f, 8), walk: q((f * 0.045) % 1, 2) }, { ...life(f, 8) })] },
  { id: 'counter', a: 86, b: 120, set: 'D', tin: 'fly', keys: () => [K(86, [304, 8.4, 6.2], [299, 4.2, -9], 56, 2), K(100, [305.6, 8.5, 1.5], [307.2, 8.1, -11.8], 46, 0), K(120, [306.2, 8.6, -3.0], [307.2, 8.05, -11.8], 40, -2)],
    fp: () => [307.2, 8.1, -11.8], cinf: 6,
    st: (f) => ({ counter: 24817302 + Math.floor(Math.max(0, f - 86) ** 2 * 1931) }),
    act: () => [] },
  // ---------------- "but almost none of them are actually lost" ----------------
  { id: 'letters', a: 120, b: 150, set: 'D', tin: 'fly', keys: () => [K(120, [306.2, 8.6, -3.0], [307.2, 8.05, -11.8], 40, -2), K(134, [298.6, 8.0, -5.0], [297.6, 7.9, -11.8], 48, 1), K(150, [298.3, 7.5, -5.6], [297.4, 6.6, -11.8], 50, -1)],
    fp: () => [297.5, 8.2, -11.8], cinf: 6,
    st: (f) => ({ lostFall: [lostT(f, 134), lostT(f, 142), lostT(f, 151), lostT(f, 160)] }), act: () => [] },
  { id: 'crash', a: 150, b: 180, set: 'D', tin: 'fly', keys: () => [K(150, [294.0, 1.3, -6.3], [297.2, 1.4, -8.0], 46, 2), K(180, [294.4, 1.25, -6.6], [297.0, 1.2, -8.1], 42, -1)],
    fp: () => [296.8, 1.0, -7.9], cinf: 7,
    st: (f) => ({ lostFall: [lostT(f, 134), lostT(f, 142), lostT(f, 151), lostT(f, 160)], puffs: [...puffs([295.4, 0.15, -7.75], 6, f, 147, 0.3), ...puffs([296.4, 0.15, -7.75], 6, f, 155, 0.3), ...puffs([297.4, 0.15, -7.75], 6, f, 164, 0.3)], xmarks: f > 152 && f < 172 ? [{ p: [297.0, 2.35 + 0.06 * Math.sin(f), -7.9], s: 0.35 * back(ramp(f, 152, 160)) }] : [] }),
    act: (f) => [ch('hank', 'hank', [297.0, 0, -7.95], { expr: seq(f, [[150, 'nervous'], [158, 'shock'], [172, 'think']]), look: -0.3, L: f < 168 ? 'up' : 'hip', R: f < 168 ? 'up' : 'hip', blink: blinkAt(f, 8), headTilt: ht(f, 8, 4) }, { bob: f > 152 && f < 162 ? q(0.25 * Math.sin((f - 152) / 10 * Math.PI), 3) : life(f, 8).bob, roll: life(f, 8).roll })] },
  // ---------------- "Imagine you land after a 14-hour flight" ----------------
  { id: 'land', a: 180, b: 216, set: 'A', tin: 'whip', keys: () => [K(180, [-4.8, 1.75, -6.4], [-12, 5.5, -60], 50, -2), K(216, [-3.6, 1.7, -7.0], [0, 3.0, -60], 48, 1)],
    fp: () => [-12, 3, -62], cinf: 3,
    st: (f) => { const x = -32 + (f - 180) * 1.3, y = Math.max(0, 12 * (1 - ez(ramp(f, 176, 202)))); return { planeA: x, planeAy: y, planeAp: y > 0 ? 0.06 : 0, puffs: [...puffs([x + 2, 0.4, -60.6], 5, f, 204, 1.2, 12), ...puffs([x + 2, 0.4, -63.4], 5, f, 205, 1.2, 12)] }; },
    act: (f) => [ch('tourist', 'tourist', [-5.4, 0, -10.6], { expr: f < 204 ? 'grin' : 'shock', look: -0.8, L: 'point', R: 'hang', blink: blinkAt(f, 2) }, life(f, 2)), ch('granny', 'granny', [-2.9, 0, -11.0], { expr: f < 206 ? 'smile' : 'laugh', look: -0.6, L: 'wave', blink: blinkAt(f, 5) }, life(f, 5))] },
  { id: 'arrive', a: 216, b: 250, set: 'A', tin: 'fly', keys: () => [K(216, [-8.4, 2.0, 2.2], [-14.2, 1.7, -2.4], 46, 2), K(250, [-8.9, 1.85, 1.5], [-13.4, 1.4, -2.4], 44, -1)],
    fp: () => [-13.6, 1.4, -2.5], cinf: 7,
    st: (f) => ({ doors: eo(ramp(f, 222, 234)) }),
    act: (f) => { const hx = -14.6 + Math.max(0, f - 228) * 0.06; const o = [ch('you', HERO, [hx, 0, -2.45], { expr: 'sleepy', look: 0.3, walk: q(((f * 0.035) % 1), 2), headTilt: q(8 * Math.sin(f * 0.15), 1) }, { roll: q(0.05 * Math.sin(f * 0.15), 3), bob: q(Math.abs(Math.sin(f * 0.22)) * 0.02, 3) })];
      if (f > 236) o.push(ch('biz', 'biz', [-14.6 + (f - 236) * 0.05, 0, -1.7], { expr: 'bored', propR: 'briefcase', walk: q((f * 0.04) % 1, 2), blink: blinkAt(f, 4) }, life(f, 4)));
      o.push(ch('teen', 'teen', [-11.6, 0, -4.2], { expr: 'bored', propR: 'phone', R: 'hold', look: 0.6, blink: blinkAt(f, 6) }, life(f, 6))); return o; } },
  // ---------------- "You're exhausted" ----------------
  { id: 'tired', a: 250, b: 280, set: 'A', tin: 'fly', keys: () => [K(250, [-10.2, 1.55, -0.6], [-12.9, 1.42, -2.45], 40, 1), K(280, [-10.9, 1.5, -1.2], [-12.8, 1.45, -2.45], 36, -3)],
    fp: () => [-12.85, 1.45, -2.45], cinf: 10,
    st: (f) => ({ zzz: [0, 1, 2].map((i) => { const k = ((f - 250) / 30 + i * 0.33) % 1; return { p: [-12.75 + k * 0.4, 2.0 + k * 0.6, -2.3], s: 0.08 + k * 0.06, rz: Math.sin(f * 0.2 + i) * 0.3 }; }) }),
    act: (f) => [ch('you', HERO, [-12.85 + (f - 250) * 0.006, 0, -2.45], { expr: seq(f, [[250, 'sleepy'], [258, 'bored'], [266, 'sleepy']]), talk: f > 256 && f < 268 ? 1 : 0, L: f > 256 && f < 268 ? 'mouth' : 'hang', look: 0.2, headTilt: q(10 * Math.sin(f * 0.12), 1), walk: q(((f * 0.02) % 1), 2), o: {} }, { roll: q(0.07 * Math.sin(f * 0.12), 3), bob: q(-0.03 * Math.abs(Math.sin(f * 0.12)), 3) })] },
  // ---------------- "and you stand at the carousel" ----------------
  { id: 'stand', a: 280, b: 316, set: 'A', tin: 'fly', keys: () => [K(280, [3.2, 2.4, 6.6], [-0.2, 0.9, -2.4], 46, 2), K(316, [2.2, 2.15, 5.6], [0.2, 0.95, -2.2], 44, -1)],
    fp: () => [0.4, 1.2, -0.3], cinf: 4,
    act: (f) => { const hx = Math.min(0.4, -2.6 + (f - 280) * 0.12); return [ch('you', HERO, [hx, 0, -0.25], { expr: f < 300 ? 'sleepy' : 'neutral', look: -0.4, walk: hx < 0.4 ? q((f * 0.05) % 1, 2) : undefined, blink: blinkAt(f, 1) }, life(f, 1)),
      ch('biz', 'biz', [-1.9, 0, -0.35], { expr: 'bored', look: -0.6, propR: 'briefcase', blink: blinkAt(f, 4) }, life(f, 4)), ch('tourist', 'tourist', [2.3, 0, -0.3], { expr: 'grin', look: -0.5, L: 'hip', blink: blinkAt(f, 2) }, life(f, 2)), ch('granny', 'granny', [-3.4, 0, 0.1], { expr: 'smile', look: 0.3, blink: blinkAt(f, 5) }, life(f, 5)), ch('teen', 'teen', [3.7, 0, 0.3], { expr: 'bored', propR: 'phone', R: 'hold', blink: blinkAt(f, 6) }, life(f, 6))]; } },
  // ---------------- "watching bags go round and round" ----------------
  { id: 'round', a: 316, b: 365, set: 'A', tin: 'fly', keys: (c) => { const o = []; for (let i = 0; i <= 4; i++) { const f = 316 + i * 12.25, th = 0.15 + i * 0.32; o.push(K(f, [3.5 + 3.5 * Math.sin(th), 1.55, -3 + 3.5 * Math.cos(th)], [3.5 + 1.45 * Math.sin(th + 0.55) - 0.6, 0.65, -3 + 1.45 * Math.cos(th + 0.55)], 46, Math.sin(i) * 2)); } return o; },
    fp: (f) => [3.6, 0.6, -2], cinf: 6,
    act: (f) => [ch('you', HERO, [0.4, 0, -0.25], { expr: f < 345 ? 'neutral' : 'nervous', look: q(Math.sin(f * 0.25), 2), headTilt: q(10 * Math.sin(f * 0.25), 1), blink: blinkAt(f, 1) }, life(f, 1)),
      ch('tourist', 'tourist', [2.3, 0, -0.3], { expr: f < 338 ? 'grin' : 'beam', L: f < 338 ? 'hip' : 'holdUp', R: f < 338 ? 'hang' : 'holdUp', propR: f < 338 ? null : 'bag', look: -0.5, blink: blinkAt(f, 2) }, { ...life(f, 2), bob: f > 338 && f < 350 ? q(0.12 * Math.sin((f - 338) / 12 * Math.PI), 3) : 0 }),
      ch('teen', 'teen', [3.7, 0, 0.3], { expr: 'bored', propR: 'phone', R: 'hold', blink: blinkAt(f, 6) }, life(f, 6)), ch('granny', 'granny', [-3.4, 0, 0.1], { expr: 'smile', look: -0.5, L: 'point', blink: blinkAt(f, 5) }, life(f, 5))] },
  // ---------------- "Yours never comes" ----------------
  { id: 'never', a: 365, b: 405, set: 'A', tin: 'fly', keys: () => [K(365, [-1.2, 2.6, 3.6], [0.4, 0.95, -1.0], 44, 1), K(405, [-2.8, 5.4, 8.4], [0.4, 0.6, -2.0], 50, -2)],
    fp: () => [0.4, 1.0, -0.3], cinf: 3,
    st: (f) => ({ bags: 0, tumble: { s: 0.6 + (f - 365) * 0.095 }, flapKick: 0 }),
    act: (f) => [ch('you', HERO, [0.4, 0, -0.25], { expr: seq(f, [[365, 'neutral'], [374, 'think'], [386, 'nervous']]), look: q(-0.6 + (f - 365) * 0.03, 2), L: 'hang', R: f > 384 ? 'chin' : 'hang', blink: blinkAt(f, 1) }, life(f, 1))] },
  // ---------------- "You fill out a form at a tiny desk" ----------------
  { id: 'form', a: 405, b: 440, set: 'A', tin: 'dissolve', keys: () => [K(401, [11.86, 0.9, 4.22], [12.12, 0.55, 4.5], 38, -2), K(418, [11.25, 1.25, 2.8], [11.75, 0.8, 4.5], 46, 0), K(440, [10.4, 1.55, 2.3], [11.65, 0.95, 4.5], 46, 2)],
    fp: (f) => f < 420 ? [12.12, 0.55, 4.48] : [11.6, 0.9, 4.5], cinf: 9,
    st: (f) => ({ scribble: 1 }),
    act: (f) => [ch('you', HERO, DESK_Y, { pose: 'sit', expr: seq(f, [[405, 'think'], [420, 'nervous'], [432, 'think']]), R: 'hold', L: 'hang', look: 0.6, headTilt: q(6 + 4 * Math.sin(f * 0.3), 1), blink: blinkAt(f, 1) }, { roll: q(0.12 + 0.01 * Math.sin(f * 0.2), 3) })] },
  { id: 'tinydesk', a: 440, b: 462, set: 'A', tin: 'fly', keys: () => [K(440, [8.2, 1.9, 1.6], [12.0, 1.0, 4.5], 46, 1), K(462, [7.8, 2.0, 2.2], [12.2, 1.1, 4.5], 44, -2)],
    fp: () => [12.2, 1.0, 4.5], cinf: 4,
    st: (f) => ({ scribble: 1 }),
    act: (f) => [ch('you', HERO, DESK_Y, { pose: 'sit', expr: 'nervous', R: 'hold', look: 0.6, headTilt: 6, blink: blinkAt(f, 1) }, { roll: 0.12 }), ch('doreen', 'doreen', DESK_D, { expr: 'sleepy', look: -0.6, R: 'hold', propR: 'coffee', blink: blinkAt(f, 3) }, life(f, 3))] },
  // ---------------- "and a tired woman gives you a reference number and a smile" ----------------
  { id: 'doreen', a: 462, b: 500, set: 'A', tin: 'fly', keys: () => [K(462, [10.3, 1.7, 5.9], [12.75, 1.35, 4.5], 40, -1), K(500, [10.8, 1.62, 5.3], [12.7, 1.3, 4.45], 38, 2)],
    fp: () => [12.75, 1.4, 4.5], cinf: 9,
    st: (f) => ({ ticketZ: lerp(-0.14, 0.16, ez(ramp(f, 487, 503))) }),
    act: (f) => [ch('doreen', 'doreen', DESK_D, { expr: seq(f, [[462, 'sleepy'], [468, 'bored'], [478, 'sleepy'], [487, 'neutral']]), talk: f > 468 && f < 476 ? 1 : 0, L: f > 468 && f < 476 ? 'mouth' : 'hang', R: f < 485 ? 'hold' : { a: 'hold', b: 'point', t: q(ramp(f, 485, 495), 2) }, propR: f < 485 ? 'coffee' : null, look: -0.7, blink: blinkAt(f, 3), headTilt: q(-4 + 3 * Math.sin(f * 0.08), 1) }, life(f, 3)),
      ch('you', HERO, DESK_Y, { pose: 'sit', expr: 'neutral', look: 0.8, R: 'hang', blink: blinkAt(f, 1) }, { roll: 0.05 })] },
  { id: 'ticket', a: 500, b: 528, set: 'A', tin: 'fly', keys: () => [K(500, [11.72, 0.82, 4.15], [12.06, 0.55, 4.45], 34, -2), K(528, [11.62, 0.86, 4.78], [12.02, 0.56, 4.45], 36, 2)],
    fp: () => [12.0, 0.55, 4.45], cinf: 11,
    st: (f) => ({ ticketZ: lerp(0.06, 0.2, ez(ramp(f, 500, 516))), stars: stars([12.0, 0.6, 4.45], 6, 0.12, f, 510, 0.025, 16) }),
    act: (f) => [ch('doreen', 'doreen', DESK_D, { expr: 'neutral', R: 'point', look: -0.7, blink: blinkAt(f, 3) }, life(f, 3))] },
  { id: 'smile', a: 528, b: 550, set: 'A', tin: 'fly', keys: () => [K(528, [10.55, 1.6, 5.2], [12.75, 1.5, 4.5], 38, -1), K(550, [10.75, 1.58, 5.1], [12.75, 1.48, 4.5], 36, 2)],
    fp: () => [12.75, 1.45, 4.5], cinf: 12,
    st: (f, C) => { const m = cardPt(DESK_D, C.pos, 300, 367); return { stars: stars([m[0] + Math.cos(m[3]) * 0.12, m[1], m[2] - Math.sin(m[3]) * 0.12], 3, 0.06, f, 531, 0.045, 16) }; },
    act: (f) => [ch('doreen', 'doreen', DESK_D, { expr: f < 531 ? 'sleepy' : 'beam', R: 'hang', look: -0.5, blink: 0 }, life(f, 3))] },
  // ---------------- "We'll find it, she says" ----------------
  { id: 'findit', a: 550, b: 593, set: 'A', tin: 'fly', keys: () => [K(550, [10.3, 1.75, 3.5], [12.75, 1.45, 4.6], 42, 1), K(570, [10.6, 1.8, 3.8], [13.3, 1.8, 4.9], 42, 0), K(593, [11.2, 2.1, 4.3], [14.8, 2.35, 5.3], 40, -2)],
    fp: (f) => f < 572 ? [12.75, 1.45, 4.5] : [14.8, 2.4, 5.4], cinf: 6,
    act: (f) => [ch('doreen', 'doreen', DESK_D, { expr: seq(f, [[550, 'grin'], [565, 'smile'], [572, 'wink']]), talk: f < 566 ? talkAt(f) : 0, R: f < 572 ? 'thumb' : 'point', L: 'hang', look: -0.6, blink: blinkAt(f, 3) }, life(f, 3)),
      ch('you', HERO, DESK_Y, { pose: 'sit', expr: f < 575 ? 'smile' : 'grin', look: 0.8, blink: blinkAt(f, 1) }, { roll: 0.04 })] },
  // ---------------- "Most bags turn up in a day or two" ----------------
  { id: 'turnup', a: 593, b: 650, set: 'A', tin: 'whip', keys: () => [K(593, [-3.4, 1.6, 0.4], [-1.2, 0.75, -4.4], 42, -2), K(650, [-4.7, 1.75, -0.6], [-1.4, 0.8, -4.4], 44, 2)],
    fp: () => [-1.4, 0.7, -4.45], cinf: 5,
    st: (f) => ({ flapKick: 0.4 * Math.sin(f * 0.5) }),
    act: (f) => [ch('tourist', 'tourist', [-3.0, 0, -0.8], { expr: f < 615 ? 'grin' : 'laugh', L: f < 615 ? 'point' : 'holdUp', R: f < 615 ? 'hang' : 'holdUp', propR: f < 615 ? null : 'bag', look: 0.6, blink: blinkAt(f, 2) }, { ...life(f, 2), bob: f > 615 && f < 630 ? q(0.15 * Math.sin((f - 615) / 15 * Math.PI), 3) : 0 }),
      ch('granny', 'granny', [-4.7, 0, -2.6], { expr: f < 630 ? 'smile' : 'beam', L: f < 630 ? 'hang' : 'holdUp', propL: f < 630 ? null : 'bag', look: 0.5, blink: blinkAt(f, 5) }, life(f, 5)),
      ch('you', HERO, [0.4, 0, -0.25], { expr: seq(f, [[593, 'neutral'], [612, 'smile'], [630, 'grin']]), look: -0.7, blink: blinkAt(f, 1) }, life(f, 1))] },
  // ---------------- "So you buy a toothbrush and a cheap T-shirt" ----------------
  { id: 'brush', a: 650, b: 690, set: 'A', tin: 'whip', keys: () => [K(650, [-9.2, 1.75, 6.9], [-12.9, 1.55, 4.4], 44, 2), K(690, [-9.6, 1.62, 6.0], [-12.6, 1.4, 4.3], 42, -1)],
    fp: () => [-12.4, 1.3, 4.4], cinf: 6,
    st: (f) => { const k = ez(ramp(f, 659, 677)); return { brush: { p: [lerp(-14.6, -11.95, k), lerp(1.55, 1.15, k) + Math.sin(k * Math.PI) * 0.5, lerp(4.0, 4.2, k)], rz: k * 6.28 } }; },
    act: (f) => [ch('kiosk', 'kiosk', KIOSK_S, { expr: seq(f, [[650, 'grin'], [668, 'beam']]), L: f < 668 ? 'point' : 'hang', R: 'hang', look: 0.6, talk: f < 662 ? talkAt(f) : 0, blink: blinkAt(f, 7) }, life(f, 7)),
      ch('you', 'youTee', KIOSK_Y, { o: { outfit: 'hoodie', top: '#2f8fc9', backpack: '#e8a23a' }, expr: seq(f, [[650, 'sleepy'], [672, 'smile']]), R: f < 664 ? 'holdUp' : 'hold', propR: f < 664 ? 'cash' : null, look: -0.6, blink: blinkAt(f, 1) }, life(f, 1))] },
  { id: 'tshirt', a: 690, b: 718, set: 'A', tin: 'fly', keys: () => [K(690, [-10.5, 1.7, 5.4], [-12.6, 1.65, 4.7], 40, -2), K(718, [-10.85, 1.66, 5.05], [-12.6, 1.62, 4.7], 37, 2)],
    fp: () => [-12.5, 1.7, 4.7], cinf: 10,
    st: (f) => { const k = back(ramp(f, 690, 700)); return { shirt: { p: [-12.55, 1.2 + k * 0.6, 4.75], ry: Math.PI / 2 - 0.2 }, brush: null }; },
    act: (f) => [ch('kiosk', 'kiosk', [-13.4, 0, 4.9], { expr: 'beam', L: 'holdUp', R: 'holdUp', look: 0.5, blink: 0 }, life(f, 7)),
      ch('you', 'youTee', [-11.5, 0, 3.95], { o: { outfit: 'hoodie', top: '#2f8fc9', backpack: '#e8a23a' }, expr: f < 700 ? 'neutral' : 'shock', look: -0.7, propR: 'toothbrush', R: 'hold', blink: blinkAt(f, 1) }, { ...life(f, 1), bob: f > 700 && f < 708 ? 0.05 : 0 })] },
  // ---------------- "and wait" ----------------
  { id: 'wait', a: 718, b: 735, set: 'B', tin: 'dissolve', keys: () => [K(714, [99.7, 1.45, 1.3], [97.9, 0.95, -1.6], 44, -2), K(735, [99.35, 1.38, 0.8], [97.9, 0.95, -1.6], 42, 1)],
    fp: () => [97.9, 1.0, -1.6], cinf: 6,
    st: (f) => ({ clockSpin: (f - 718) * 0.08, calPage: 1 }),
    act: (f) => [ch('you', 'youTee', [97.9, 0.62, -1.55], { pose: 'sit', expr: 'bored', propR: 'toothbrush', R: 'mouth', look: 0.4, blink: blinkAt(f, 1) }, { roll: q(0.03 * Math.sin(f * 0.3), 3) })] },
  // ---------------- "Day three, they're still searching" ----------------
  { id: 'day3', a: 735, b: 753, set: 'B', tin: 'fly', keys: () => [K(735, [101.75, 1.95, -2.55], [102.4, 1.82, -3.97], 38, 1), K(753, [101.6, 1.9, -2.75], [102.4, 1.82, -3.97], 36, -1)],
    fp: () => [102.4, 1.85, -3.97], cinf: 8,
    st: (f) => ({ calPage: 1, calFlip: ez(ramp(f, 735, 747)) }), act: () => [] },
  { id: 'search1', a: 753, b: 786, set: 'D', tin: 'whip', keys: () => [K(753, [303.7, 1.5, -0.9], [300.6, 1.4, -3.9], 44, -2), K(786, [303.2, 1.45, -1.3], [300.4, 1.4, -4.0], 42, 2)],
    fp: () => [301.2, 1.2, -2.8], cinf: 4,
    st: (f, C) => { const P = [301.3, 0, -2.6]; const h = cardPt(P, C.pos, 420, 520); return { heroDglow: 1, beam: { p: [h[0] - 0.4, h[1] - 0.25, h[2] + 0.95], r: [-Math.PI / 2 + 0.25, 0, -0.35] } }; },
    act: (f) => [ch('hank', 'hank', [301.3, 0, -2.6], { expr: seq(f, [[753, 'think'], [770, 'nervous']]), R: 'point', propR: 'flashlight', look: q(0.8 * Math.sin(f * 0.12), 2), blink: blinkAt(f, 8), headTilt: ht(f, 8, 5) }, life(f, 8))] },
  // ---------------- "Week two, they're still searching" ----------------
  { id: 'week2', a: 786, b: 805, set: 'B', tin: 'whip', keys: () => [K(786, [100.6, 1.7, -0.6], [101.9, 1.55, -3.8], 48, 2), K(805, [100.9, 1.68, -1.0], [102.1, 1.6, -3.9], 44, -1)],
    fp: () => [102.2, 1.6, -3.6], cinf: 5,
    st: (f) => { const k = ramp(f, 786, 800); const pg = 2 + Math.floor(k * 3); return { calPage: Math.min(4, pg), calFlip: k < 1 ? (k * 3) % 1 : 0, pages: [0, 1, 2, 3].map((i) => { const kk = clamp((f - 786 - i * 3) / 14); return { p: [102.4 - kk * 0.9 - i * 0.1, 1.9 + kk * 0.4 - kk * kk * 1.2, -3.9 + kk * 1.3], r: [kk * 3 + i, kk * 2, kk * 4] }; }).filter((x, i) => f - 786 - i * 3 > 0 && f - 786 - i * 3 < 14) }; },
    act: (f) => [ch('you', 'youTee', [101.3, 0, -2.6], { expr: 'bored', stubble: true, L: 'cross', R: 'cross', look: 0.5, blink: blinkAt(f, 1) }, { ...life(f, 1), bob: q(Math.abs(Math.sin(f * 0.5)) * 0.015, 3) })] },
  { id: 'search2', a: 805, b: 845, set: 'D', tin: 'whip', keys: () => [K(805, [296.9, 1.75, 0.1], [299.1, 1.35, -2.8], 44, 2), K(845, [297.3, 1.68, -0.4], [299.1, 1.35, -2.8], 42, -1)],
    fp: () => [299.0, 1.3, -2.7], cinf: 7,
    st: (f, C) => { const P = [299.0, 0, -2.6]; const h = cardPt(P, C.pos, 312, 431); const m = cardPt(P, C.pos, 200, 470); return { heroDglow: 1, mug: { p: [m[0], m[1], m[2] + 0.05] }, beam: { p: [m[0] + 0.02, m[1] + 0.42, m[2] + 0.05], r: [Math.PI, 0, 0.1] } }; },
    act: (f) => [ch('hank', 'hank', [299.0, 0, -2.6], { expr: seq(f, [[805, 'think'], [826, 'shock'], [834, 'smile']]), R: 'hold', propR: 'flashlight', L: 'hold', look: -0.2, blink: blinkAt(f, 8), headTilt: q(12 + 3 * Math.sin(f * 0.2), 1) }, life(f, 8))] },
  // ---------------- "You call every morning and every morning" ----------------
  { id: 'call1', a: 845, b: 880, set: 'B', light: 'Bm', tin: 'whip', keys: () => [K(845, [97.3, 1.65, 1.9], [100.2, 1.45, -3.0], 46, -2), K(880, [97.7, 1.58, 1.4], [100.3, 1.4, -3.0], 44, 1)],
    fp: () => [100.3, 1.4, -3.2], cinf: 5,
    st: (f) => ({ alarm: f < 860 ? 1 : 0, calPage: 5 }),
    act: (f) => [ch('you', 'youTee', [100.3, 0, -3.2], { expr: seq(f, [[845, 'sleepy'], [858, 'neutral'], [866, 'smile']]), stubble: true, R: f < 852 ? 'hang' : 'mouth', propR: f < 852 ? null : 'phone', talk: f > 866 ? talkAt(f) : 0, look: 0.3, blink: blinkAt(f, 1) }, life(f, 1))] },
  { id: 'call2', a: 880, b: 905, set: 'B', light: 'Bm', tin: 'fly', keys: () => [K(880, [101.9, 1.55, -1.2], [100.3, 1.45, -3.2], 40, 2), K(905, [101.65, 1.52, -1.55], [100.3, 1.45, -3.2], 37, -2)],
    fp: () => [100.3, 1.45, -3.2], cinf: 8,
    st: (f) => ({ alarm: f < 890 ? 1 : 0, calPage: 6 }),
    act: (f) => [ch('you', 'youTee', [100.3, 0, -3.2], { expr: seq(f, [[880, 'bored'], [894, 'think']]), stubble: true, R: 'mouth', propR: 'phone', talk: talkAt(f), look: 0.5, blink: blinkAt(f, 1), headTilt: ht(f, 1, 5) }, life(f, 1))] },
  // ---------------- "it's a new person reading the same sentence off a screen" ----------------
  { id: 'agent1', a: 905, b: 940, set: 'C', tin: 'dissolve', keys: () => [K(901, [194.85, 1.12, -0.95], [195.0, 1.06, -1.52], 40, -1), K(918, [194.6, 1.28, 0.3], [195.15, 1.05, -1.0], 44, 0), K(940, [196.4, 1.4, 1.9], [195.4, 1.0, -0.6], 44, 2)],
    fp: (f) => f < 918 ? [195, 1.06, -1.52] : [195.5, 1.1, -0.4], cinf: 8,
    act: (f) => [ch('a1', 'agent1', [195.55, 0.5, -0.4], { pose: 'sit', expr: seq(f, [[905, 'bored'], [922, 'smile'], [934, 'bored']]), talk: f > 920 ? talkAt(f) : 0, look: -0.6, R: 'hang', blink: blinkAt(f, 21) }, life(f, 21)), ch('a2', 'agent2', [198.05, 0.5, -0.4], { pose: 'sit', expr: 'bored', talk: talkAt(f + 3), look: -0.6, blink: blinkAt(f, 22) }, life(f, 22))] },
  { id: 'agents', a: 940, b: 979, set: 'C', tin: 'fly', keys: () => [K(940, [196.6, 1.35, 1.6], [196.9, 1.0, -0.9], 44, 2), K(958, [200.4, 1.38, 1.7], [200.6, 1.0, -0.9], 46, -1), K(979, [204.4, 1.4, 1.6], [204.8, 1.0, -0.9], 44, 2)],
    fp: (f, C) => [C.pos[0] + 0.3, 1.0, -0.4], cinf: 5,
    act: (f) => [['a1', 'agent1', 195.55, 21], ['a2', 'agent2', 198.05, 22], ['a3', 'agent3', 200.55, 23], ['a4', 'agent4', 203.05, 24], ['a5', 'agent1', 205.55, 25]].map(([id, k, x, s]) => ch(id, k, [x, 0.5, -0.4], { pose: 'sit', expr: seq(f + s, [[0, 'bored'], [950, 'smile'], [962, 'bored']]), talk: talkAt(f), look: -0.6, blink: blinkAt(f, s), o: s === 25 ? { top: '#3d7fd6', hair: '#a0522d' } : {} }, life(f, s))) },
  // ---------------- "Your laptop charger is in that bag" ----------------
  { id: 'laptop', a: 979, b: 1010, set: 'B', tin: 'dissolve', keys: () => [K(975, [102.62, 1.08, -2.8], [102.8, 0.97, -3.4], 40, -2), K(992, [102.62, 1.3, -1.7], [102.6, 1.05, -3.2], 44, 0), K(1010, [101.7, 1.5, -0.55], [102.3, 1.15, -3.0], 46, 2)],
    fp: (f) => f < 990 ? [102.8, 0.97, -3.4] : [101.6, 1.2, -2.7], cinf: 8,
    st: () => ({ laptop: 'dead', calPage: 6 }),
    act: (f) => [ch('you', 'youTee', [101.55, 0, -2.75], { expr: seq(f, [[979, 'nervous'], [997, 'shock'], [1004, 'nervous']]), stubble: true, R: 'holdUp', L: 'hang', look: 0.7, blink: blinkAt(f, 1) }, life(f, 1))] },
  { id: 'xray0', a: 1010, b: 1036, set: 'D', tin: 'whip', keys: () => [K(1010, [302.8, 2.3, -2.2], [300, 2.15, -5.35], 44, 2), K(1024, [300.55, 2.25, -4.3], [300, 2.15, -5.35], 40, -1), K(1036, [300.3, 2.05, -4.6], [299.92, 1.96, -5.35], 36, 1)],
    fp: () => [300, 2.0, -5.35], cinf: 9,
    st: (f) => ({ xray: f >= 1021, heroDglow: f < 1021, stars: stars([300, 2.17, -5.1], 8, 0.45, f, 1021, 0.05, 14) }), act: () => [] },
  // ---------------- "along with your favourite jacket" ----------------
  { id: 'jacket', a: 1036, b: 1078, set: 'D', tin: 'fly', keys: () => [K(1036, [300.3, 2.05, -4.6], [299.92, 1.96, -5.35], 36, 1), K(1060, [300.32, 2.28, -4.7], [300.08, 2.21, -5.35], 36, -1), K(1078, [300.26, 2.33, -4.78], [300.06, 2.24, -5.35], 34, 1)],
    fp: (f) => f < 1052 ? [299.9, 1.93, -5.35] : [300.08, 2.21, -5.35], cinf: 10,
    st: (f) => ({ xray: 1, stars: stars([300.08, 2.22, -5.2], 6, 0.2, f, 1060, 0.025, 16) }), act: () => [] },
  // ---------------- "and the gift you bought for your mum" ----------------
  { id: 'gift', a: 1078, b: 1120, set: 'D', tin: 'fly', keys: () => [K(1078, [300.26, 2.33, -4.78], [300.06, 2.24, -5.35], 34, 1), K(1096, [300.15, 2.5, -4.85], [299.96, 2.41, -5.35], 34, -1), K(1120, [300.08, 2.47, -4.98], [299.97, 2.41, -5.35], 32, 2)],
    fp: () => [299.96, 2.41, -5.35], cinf: 10,
    st: (f) => ({ xray: 1, stars: [...stars([299.95, 2.42, -5.25], 7, 0.16, f, 1084, 0.022, 18), ...stars([299.95, 2.42, -5.25], 7, 0.18, f, 1104, 0.022, 14)] }), act: () => [] },
  // ---------------- "Then after about three months" ----------------
  { id: 'months', a: 1120, b: 1170, set: 'B', light: 'Bw', tin: 'dissolve', keys: () => [K(1116, [101.0, 1.65, 1.0], [98.0, 1.15, -1.8], 48, -2), K(1170, [100.6, 1.55, 0.5], [97.95, 1.12, -1.75], 45, 2)],
    fp: () => [98.4, 1.2, -1.8], cinf: 4,
    st: (f) => { const k = ramp(f, 1124, 1165); const pg = 5 + k * 3; return { snow: 1, clockSpin: (f - 1120) * 0.05, calPage: Math.min(8, Math.floor(pg)), calFlip: k < 1 ? pg % 1 : 0, pages: [0, 1, 2, 3, 4, 5].map((i) => { const kk = (((f - 1120) / 16) + i / 6) % 1; return { p: [102.4 - kk * 2.6, 1.9 + Math.sin(kk * 3 + i) * 0.4 - kk * 0.6, -3.9 + kk * 2.6], r: [kk * 5 + i, kk * 3, kk * 6] }; }) }; },
    act: (f) => [ch('you', 'youBeard', [98.25, 0.62, -1.3], { pose: 'sit', expr: seq(f, [[1120, 'bored'], [1145, 'sleepy']]), look: 0.6, L: 'cross', R: 'cross', blink: blinkAt(f, 1), headTilt: ht(f, 1, 4) }, { roll: q(0.02 * Math.sin(f * 0.1), 3) })] },
  // ---------------- "an email arrives" ----------------
  { id: 'email', a: 1170, b: 1208, set: 'B', light: 'Bw', tin: 'fly', keys: () => [K(1170, [100.5, 1.55, -0.5], [102.4, 1.25, -3.1], 44, 1), K(1208, [100.75, 1.55, -0.85], [101.8, 1.45, -2.3], 40, -1)],
    fp: () => [101.9, 1.3, -2.5], cinf: 6,
    st: (f) => { const k = ez(ramp(f, 1189, 1206)); return { snow: 1, laptop: f > 1185 ? 'email' : 'dead', calPage: 8, env: f > 1186 ? { p: [lerp(102.8, 101.2, k), lerp(1.0, 1.35, k) + Math.sin(k * Math.PI) * 0.3, lerp(-3.2, -1.9, k)], ry: lerp(0, -0.5, k) + (1 - k) * 6.28, s: lerp(0.3, 0.75, back(k)) } : null, stars: stars([102.8, 1.05, -3.2], 7, 0.3, f, 1188, 0.04, 14) }; },
    act: (f) => [ch('you', 'youBeard', [101.6, 0, -2.75], { expr: f < 1189 ? 'bored' : 'shock', look: 0.6, blink: blinkAt(f, 1) }, { ...life(f, 1), bob: f > 1189 && f < 1197 ? 0.05 : 0 })] },
  // ---------------- "They're sorry. They've paid your claim." ----------------
  { id: 'sorry', a: 1208, b: 1235, set: 'B', light: 'Bw', tin: 'fly', keys: () => [K(1208, [100.55, 1.55, -0.2], [101.65, 1.5, -2.3], 44, -1), K(1235, [100.7, 1.6, -0.35], [101.65, 1.55, -2.3], 42, 2)],
    fp: () => [101.75, 1.5, -2.0], cinf: 8,
    st: (f) => ({ snow: 1, laptop: 'email', calPage: 8, env: { p: [101.2, 1.35 + 0.02 * Math.sin(f * 0.2), -1.9], ry: -0.5, s: 0.75, open: ez(ramp(f, 1208, 1216)), letter: ez(ramp(f, 1212, 1224)) } }),
    act: (f) => [ch('you', 'youBeard', [102.2, 0, -2.85], { expr: seq(f, [[1208, 'neutral'], [1220, 'bored']]), look: -0.5, blink: blinkAt(f, 1) }, life(f, 1))] },
  { id: 'paid', a: 1235, b: 1270, set: 'B', light: 'Bw', tin: 'fly', keys: () => [K(1235, [100.7, 1.6, -0.35], [101.65, 1.55, -2.3], 42, 2), K(1270, [101.0, 1.62, -0.1], [101.9, 1.5, -2.6], 44, -1)],
    fp: () => [101.8, 1.55, -2.1], cinf: 7,
    st: (f) => ({ snow: 1, laptop: 'email', calPage: 8, env: { p: [101.2, 1.35, -1.9], ry: -0.5, s: 0.75, open: 1, letter: 1 - ez(ramp(f, 1236, 1246)), cheque: back(ramp(f, 1238, 1250)) * 0.6 }, stars: stars([101.85, 2.0, -2.0], 5, 0.25, f, 1248, 0.03, 12) }),
    act: (f) => [ch('you', 'youBeard', [102.2, 0, -2.85], { expr: seq(f, [[1235, 'bored'], [1250, 'smile'], [1258, 'bored']]), L: 'hang', R: f > 1252 ? 'thumb' : 'hang', look: -0.5, blink: blinkAt(f, 1) }, life(f, 1))] },
  // ---------------- "The case is closed" ----------------
  { id: 'closed', a: 1270, b: 1303, set: 'A', tin: 'whip', keys: () => [K(1270, [10.6, 1.6, 3.3], [12.4, 1.0, 4.5], 46, -2), K(1303, [10.85, 1.55, 3.5], [12.4, 0.95, 4.5], 44, 2)],
    fp: () => [12.3, 0.8, 4.5], cinf: 7,
    st: (f) => { const d = f < 1283 ? 0.35 - ramp(f, 1272, 1283) * 0.05 : f < 1287 ? 0.3 * (1 - (f - 1283) / 4) : Math.min(0.35, (f - 1290) * 0.03); return { form: false, ticket: false, folder: 1, stampY: Math.max(0, d), stampDown: f >= 1286 ? 1 : 0, puffs: puffs([12.2, 0.6, 4.55], 6, f, 1286, 0.12, 12) }; },
    act: (f) => [ch('doreen', 'doreen', DESK_D, { expr: seq(f, [[1270, 'stern'], [1286, 'smirk'], [1296, 'smugsmile']]), R: f < 1292 ? 'hold' : 'hip', L: f < 1292 ? 'hang' : 'hip', look: -0.7, blink: blinkAt(f, 3) }, { ...life(f, 3), bob: f >= 1286 && f < 1290 ? -0.03 : 0 })] },
  // ---------------- "And you think, well, it's gone forever" ----------------
  { id: 'think', a: 1303, b: 1340, set: 'B', light: 'Bw', tin: 'dissolve', keys: () => [K(1299, [101.6, 1.65, -0.6], [99.6, 1.6, -3.6], 44, 2), K(1340, [101.3, 1.6, -0.95], [99.5, 1.55, -3.6], 41, -1)],
    fp: () => [99.4, 1.45, -3.3], cinf: 6,
    st: (f) => ({ snow: 1, calPage: 8, laptop: 'email', puffs: puffs([99.25, 1.35, -3.15], 4, f, 1322, 0.06, 12) }),
    act: (f) => [ch('you', 'youBeard', [99.4, 0, -3.35], { expr: seq(f, [[1303, 'think'], [1322, 'sleepy']]), L: 'hang', R: f < 1318 ? 'chin' : 'hang', look: -0.8, blink: blinkAt(f, 1), headTilt: q(-4 + 3 * Math.sin(f * 0.07), 1) }, { ...life(f, 1), bob: f > 1322 && f < 1332 ? -0.03 : 0 })] },
  { id: 'gone', a: 1340, b: 1370, set: 'B', light: 'Bw', tin: 'fly', keys: () => [K(1340, [100.95, 1.5, -1.5], [99.4, 1.45, -3.35], 40, -1), K(1370, [100.8, 1.48, -1.75], [99.4, 1.43, -3.35], 37, -4)],
    fp: () => [99.4, 1.45, -3.35], cinf: 10,
    st: () => ({ snow: 1, calPage: 8 }),
    act: (f) => [ch('you', 'youBeard', [99.4, 0, -3.35], { expr: seq(f, [[1340, 'sleepy'], [1352, 'bored']]), L: 'hang', R: f > 1352 ? 'wave' : 'hang', look: 0.2, blink: blinkAt(f, 1), headTilt: q(-6 + 2 * Math.sin(f * 0.1), 1) }, life(f, 1))] },
  // ---------------- "Except it isn't" ----------------
  { id: 'except', a: 1370, b: 1395, set: 'B', light: 'Bw', tin: 'fly', keys: () => [K(1370, [100.4, 1.5, -2.2], [99.4, 1.5, -3.35], 36, 2), K(1378, [100.3, 1.6, -2.15], [99.5, 1.8, -4.0], 40, 0), K(1388, [99.45, 2.05, -3.7], [99.4, 2.05, -6], 44, 0), K(1395, [99.4, 1.9, -6.0], [99.4, 1.6, -12], 50, 0)],
    fp: () => [99.4, 1.6, -3.4], cinf: 4,
    st: () => ({ snow: 1, calPage: 8 }),
    act: (f) => [ch('you', 'youBeard', [99.0, 0, -3.25], { expr: f < 1373 ? 'sleepy' : 'shock', L: 'hang', R: 'hang', look: 0.8, blink: 0 }, { bob: f > 1372 && f < 1380 ? q(0.1 * Math.sin((f - 1372) / 8 * Math.PI), 3) : 0 })] },
  // ---------------- "Right now in a small town in Alabama" ----------------
  { id: 'town', a: 1395, b: 1440, set: 'E', tin: 'whip', keys: () => [K(1395, [966.5, 1.5, 24.8], [970, 2.8, 35], 46, -2), K(1440, [971.5, 1.7, 25.6], [970.2, 2.9, 35], 42, 2)],
    fp: () => [970, 2.8, 35], cinf: 3,
    st: (f) => ({ pickupX: -52 + (f - 1395) * 0.95 }), act: () => [] },
  { id: 'tower', a: 1440, b: 1470, set: 'E', tin: 'fly', keys: () => [K(1440, [978, 2.2, 20], [1040, 22, -75], 30, 2), K(1470, [982, 6.5, 18], [1040, 25.5, -75], 26, -1)],
    fp: () => [1040, 25, -75], cinf: 2, act: () => [] },
  // ---------------- "there's a store the size of a city block" ----------------
  { id: 'store', a: 1470, b: 1518, set: 'E', tin: 'fly', keys: () => [K(1470, [1000, 3.2, 6], [1000, 7.5, -13], 50, 1), K(1490, [1000, 9, 22], [1000, 6, -14], 52, -1), K(1518, [1000, 21, 58], [1000, 4, -16], 50, 1)],
    fp: () => [1000, 6, -13], cinf: 2,
    act: (f) => [['shopA', 'shopA', 996, 4, 31], ['shopB', 'shopB', 1003.5, 6, 32], ['shopC', 'shopC', 1001.2, 1, 33], ['shopD', 'shopD', 998.4, 2.5, 34], ['earl', 'earl', 1005.5, -4, 35]].map(([id, k, x, z, s]) => ch(id, k, [x, 0, z - (f - 1470) * 0.04], { expr: s % 2 ? 'grin' : 'smile', walk: q(((f * 0.04 + s * 0.3) % 1), 2), blink: blinkAt(f, s), look: 0 }, { ...life(f, s), s: 1 })) },
  { id: 'doors', a: 1518, b: 1540, set: 'E', tin: 'fly', keys: () => [K(1518, [1000, 2.8, 3], [1000, 4.0, -13], 48, 2), K(1540, [1000, 2.1, -8.2], [1000, 2.2, -13], 50, -1)],
    fp: () => [1000, 2, -13], cinf: 3,
    act: (f) => [ch('shopC', 'shopC', [1001.4, 0, -10.6 - (f - 1518) * 0.03], { expr: 'grin', walk: q((f * 0.04) % 1, 2), blink: blinkAt(f, 33) }, life(f, 33))] },
  // ---------------- "And on a rack inside" ----------------
  { id: 'inside', a: 1540, b: 1562, set: 'F', tin: 'dissolve', keys: () => [K(1536, [700, 2.7, 9.0], [700, 1.5, -4], 50, -1), K(1562, [700.6, 2.4, 6.6], [700.2, 1.5, -3.5], 48, 2)],
    fp: () => [700, 1.3, -3], cinf: 3,
    act: (f) => [ch('earl', 'earl', [700.1, 0, -2.9], { expr: 'grin', L: 'up', look: -0.3, blink: blinkAt(f, 35) }, life(f, 35)), ch('shopA', 'shopA', [699.0, 0, 3.2], { expr: 'smile', look: 0.5, R: 'hold', propR: 'bag', blink: blinkAt(f, 31) }, life(f, 31)), ch('shopC', 'shopC', [704.2, 0, -0.8], { expr: 'grin', look: -0.4, blink: blinkAt(f, 33) }, life(f, 33)), ch('shopD', 'shopD', [701.2, 0, 4.2], { expr: 'beam', propR: 'phone', R: 'hold', blink: blinkAt(f, 34) }, life(f, 34)), ch('shopB', 'shopB', [686.8, 0, 5.2], { expr: 'smile', blink: blinkAt(f, 32) }, life(f, 32))] },
  // ---------------- "a stranger is trying on your jacket" ----------------
  { id: 'tryon', a: 1562, b: 1610, set: 'F', tin: 'fly', keys: () => [K(1562, [701.7, 1.65, 0.5], [700.1, 1.35, -3.0], 44, 1), K(1610, [701.3, 1.58, 0.0], [700.2, 1.35, -2.9], 40, -2)],
    fp: () => [700.1, 1.35, -2.9], cinf: 6,
    st: (f) => ({ puffs: puffs([700.1, 1.2, -2.75], 6, f, 1588, 0.18, 12) }),
    act: (f) => { const on = f >= 1590; return [ch('earl', on ? 'earlJkt' : 'earl', [700.1, 0, -2.9], { expr: seq(f, [[1562, 'think'], [1576, 'grin'], [1592, 'beam'], [1602, 'smirk']]), L: f < 1580 ? 'up' : on ? (f < 1600 ? 'up' : 'hip') : 'holdUp', R: f < 1580 ? 'hang' : on ? (f < 1600 ? 'up' : 'hip') : 'holdUp', look: -0.3, blink: blinkAt(f, 35) }, { ...life(f, 35), bob: f > 1590 && f < 1600 ? q(0.08 * Math.sin((f - 1590) / 10 * Math.PI), 3) : 0 }),
      ch('shopC', 'shopC', [701.7, 0, -1.9], { expr: f < 1596 ? 'think' : 'grin', look: -0.8, R: f > 1596 ? 'thumb' : 'hang', blink: blinkAt(f, 33) }, life(f, 33))]; } },
  // ---------------- "He checks the mirror" ----------------
  { id: 'mirror', a: 1610, b: 1640, set: 'F', tin: 'fly', keys: () => [K(1610, [702.75, 1.5, -0.05], [703.2, 1.3, -1.6], 44, -1), K(1640, [703.03, 1.45, -0.95], [703.25, 1.32, -1.7], 42, 2)],
    fp: () => [703.47, 1.3, -2.35], cinf: 4,
    act: (f) => [ch('earlM', 'earlJkt', [703.47, 0, -2.35], { expr: seq(f, [[1610, 'smirk'], [1620, 'sly'], [1630, 'wink']]), L: 'hip', R: f > 1622 ? 'thumb' : 'hip', look: 0.2, blink: blinkAt(f, 35), headTilt: ht(f, 35, 6) }, { ...life(f, 35), flip: true, s: 0.95, blob: false })] },
  // ---------------- "flips the price tag" ----------------
  { id: 'flip', a: 1640, b: 1672, set: 'F', tin: 'fly', keys: () => [K(1640, [701.35, 1.4, -1.55], [700.7, 1.12, -2.55], 38, 1), K(1672, [701.2, 1.35, -1.7], [700.68, 1.1, -2.55], 34, -2)],
    fp: () => [700.7, 1.12, -2.55], cinf: 11,
    st: (f, C) => { const P = [700.45, 0, -2.6]; const h = cardPt(P, C.pos, 420, 470); const fl = ez(ramp(f, 1642, 1656)); return { sleeveTag: { p: [h[0] + Math.sin(h[3]) * 0.06, h[1] - 0.1, h[2] + Math.cos(h[3]) * 0.06], ry: h[3] + fl * Math.PI, s: 1.1 }, stars: stars([h[0], h[1] - 0.1, h[2] + 0.1], 5, 0.12, f, 1656, 0.02, 12) }; },
    act: (f) => [ch('earl', 'earlJkt', [700.45, 0, -2.6], { expr: f < 1656 ? 'think' : 'shock', L: 'hang', R: 'holdUp', look: 0.6, blink: blinkAt(f, 35) }, life(f, 35))] },
  // ---------------- "and smiles" ----------------
  { id: 'grin', a: 1672, b: 1695, set: 'F', tin: 'fly', keys: () => [K(1672, [701.45, 1.55, -0.15], [700.45, 1.45, -2.6], 38, -2), K(1695, [701.35, 1.53, -0.4], [700.45, 1.45, -2.6], 36, 2)],
    fp: () => [700.45, 1.45, -2.6], cinf: 11,
    st: (f, C) => { const m = cardPt([700.45, 0, -2.6], C.pos, 300, 367); return { stars: stars([m[0] + 0.12 * Math.cos(m[3]), m[1], m[2] - 0.12 * Math.sin(m[3])], 4, 0.08, f, 1676, 0.04, 16) }; },
    act: (f) => [ch('earl', 'earlJkt', [700.45, 0, -2.6], { expr: f < 1676 ? 'smirk' : 'beam', L: 'hip', R: 'hip', look: 0.1, blink: 0, headTilt: ht(f, 35, 4) }, life(f, 35))] },
  // ---------------- "Twenty dollars" ----------------
  { id: 'twenty', a: 1695, b: 1731, set: 'F', tin: 'fly', keys: () => [K(1695, [700.95, 1.12, -1.95], [700.62, 1.06, -2.5], 34, 2), K(1708, [701.3, 1.5, -0.8], [700.55, 1.6, -3.2], 40, 0), K(1731, [701.9, 2.1, 1.0], [700.3, 2.5, -4.6], 46, -2)],
    fp: (f) => f < 1706 ? [700.62, 1.06, -2.5] : [700.4, 1.4, -2.6], cinf: 8,
    st: (f, C) => { const P = [700.45, 0, -2.6]; const h = cardPt(P, C.pos, 420, 459); return { sleeveTag: { p: [h[0] + Math.sin(h[3]) * 0.06, h[1] - 0.1, h[2] + Math.cos(h[3]) * 0.06], ry: h[3] + Math.PI, s: 1.1 + 0.2 * back(ramp(f, 1695, 1704)) }, stars: stars([h[0], h[1] - 0.1, h[2] + 0.1], 6, 0.25, f, 1704, 0.03, 14) }; },
    act: (f) => [ch('earl', 'earlJkt', [700.45, 0, -2.6], { expr: 'beam', R: 'holdUp', L: 'hip', look: 0.4, blink: blinkAt(f, 35) }, life(f, 35)),
      ch('shopC', 'shopC', [701.8, 0, -1.9], { expr: f < 1704 ? 'neutral' : 'shock', look: -0.8, blink: 0 }, life(f, 33)), ch('shopD', 'shopD', [699.0, 0, -1.6], { expr: f < 1706 ? 'smile' : 'shock', look: 0.6, blink: 0 }, life(f, 34))] },
  // ---------------- "You see, when an airline can't find a bag's owner" ----------------
  { id: 'owner', a: 1731, b: 1775, set: 'D', tin: 'dissolve', keys: () => [K(1727, [299.1, 1.7, 11.0], [296.6, 1.3, 9.3], 44, -2), K(1775, [298.8, 1.65, 10.7], [296.6, 1.3, 9.3], 42, 2)],
    fp: () => [296.6, 1.3, 9.4], cinf: 6,
    st: (f, C) => { const P = [296.6, 0, 9.4]; const h = cardPt(P, C.pos, 420, 459); return { bagThrow: { p: [h[0], h[1] - 0.6, h[2] + 0.15], r: [0, h[3] + 0.3, 0.1 * Math.sin(f * 0.2)] }, lid: 0, qmarks: f > 1766 ? [{ p: [296.5, 2.4, 9.4], s: 0.3 * back(ramp(f, 1766, 1774)), rz: Math.sin(f * 0.2) * 0.2 }] : [] }; },
    act: (f) => [ch('hank', 'hank', [296.6, 0, 9.4], { expr: seq(f, [[1731, 'neutral'], [1748, 'think'], [1766, 'nervous']]), R: 'holdUp', L: f < 1755 ? 'hang' : 'chin', look: 0.6, blink: blinkAt(f, 8), headTilt: ht(f, 8, 6) }, life(f, 8))] },
  { id: 'shrug', a: 1775, b: 1808, set: 'D', tin: 'fly', keys: () => [K(1775, [299.2, 1.8, 11.6], [296.6, 1.4, 9.4], 48, 2), K(1808, [294.3, 1.85, 11.7], [296.6, 1.45, 9.4], 50, -2)],
    fp: () => [296.6, 1.3, 9.4], cinf: 5,
    st: (f, C) => { const P = [296.6, 0, 9.4]; const h = cardPt(P, C.pos, 420, 459); return { bagThrow: { p: [h[0], h[1] - 0.6, h[2] + 0.15], r: [0, h[3] + 0.3, 0] }, qmarks: [{ p: [296.4, 2.45, 9.4], s: 0.3, rz: Math.sin(f * 0.2) * 0.2 }, { p: [296.9, 2.3 + 0.1 * back(ramp(f, 1780, 1788)), 9.4], s: 0.22 * back(ramp(f, 1780, 1788)), rz: -0.3 }] }; },
    act: (f) => [ch('hank', 'hank', [296.6, 0, 9.4], { expr: seq(f, [[1775, 'nervous'], [1790, 'bored']]), R: 'holdUp', L: f > 1790 ? 'up' : 'hip', look: 0.3, blink: blinkAt(f, 8), headTilt: q(8 * Math.sin(f * 0.15), 1) }, life(f, 8))] },
  // ---------------- "it doesn't throw the bag away" ----------------
  { id: 'nothrow', a: 1808, b: 1851, set: 'D', tin: 'fly', keys: () => [K(1808, [299.8, 2.0, 11.5], [296.0, 1.3, 8.8], 50, -1), K(1851, [300.1, 2.1, 11.6], [296.0, 1.35, 8.8], 48, 2)],
    fp: () => [296.8, 1.3, 9.4], cinf: 4,
    st: (f) => { const sw = ez(ramp(f, 1815, 1828)) - ez(ramp(f, 1836, 1846)); return { lid: ez(ramp(f, 1808, 1816)), bagThrow: { p: [lerp(297.05, 295.1, sw), lerp(1.0, 2.1, sw), lerp(9.75, 8.5, sw)], r: [sw * 0.6, 0.4, sw * 0.4] }, xmarks: f > 1832 ? [{ p: [297.3, 2.5, 9.6], s: 0.32 * back(ramp(f, 1832, 1840)) }] : [] }; },
    act: (f) => [ch('hank', 'hank', [297.3, 0, 9.6], { expr: seq(f, [[1808, 'bored'], [1832, 'shock'], [1840, 'stern']]), R: 'holdUp', L: f < 1832 ? 'hang' : 'point', look: q(f > 1840 ? 0.6 * Math.sin(f * 0.5) : -0.5, 2), blink: blinkAt(f, 8), headTilt: f > 1840 ? q(8 * Math.sin(f * 0.5), 1) : 0 }, life(f, 8))] },
  // ---------------- "It can sell it" ----------------
  { id: 'sell', a: 1851, b: 1876, set: 'F', tin: 'whip', keys: () => [K(1851, [689.8, 1.85, 9.0], [687.0, 1.35, 6.0], 44, 2), K(1876, [689.3, 1.75, 8.6], [687.0, 1.4, 6.0], 42, -1)],
    fp: () => [687, 1.3, 6], cinf: 5,
    st: (f) => ({ drawer: back(ramp(f, 1859, 1865)), bills: Array.from({ length: 14 }, (_, i) => { const k = (f - 1860 - i * 0.6) / 16; if (k < 0 || k > 1) return null; const a = i * 2.39; return { p: [687 + Math.cos(a) * k * 1.2, 1.3 + k * 1.8 - k * k * 1.4, 6.3 + Math.sin(a) * k * 0.9], r: [k * 7 + i, k * 3, k * 5] }; }).filter(Boolean), sold: f > 1862 ? { p: [687.0, 2.35, 6.2], s: back(ramp(f, 1862, 1870)), ry: 0.3 } : null }),
    act: (f) => [ch('shopB', 'shopB', [686.76, 0, 5.24], { expr: seq(f, [[1851, 'smile'], [1860, 'laugh']]), L: f > 1860 ? 'up' : 'hold', R: f > 1860 ? 'up' : 'hang', look: 0.4, blink: blinkAt(f, 32) }, life(f, 32)), ch('earl', 'earlJkt', [688.2, 0, 7.0], { expr: 'beam', R: 'holdUp', propR: 'cash', look: -0.6, blink: blinkAt(f, 35) }, life(f, 35))] },
  // ---------------- "Your bag was never lost" ----------------
  { id: 'never', a: 1876, b: 1920, set: 'F', tin: 'dissolve', keys: () => [K(1872, [700.3, 1.65, 9.2], [698.5, 1.3, 6.5], 42, -1), K(1920, [699.55, 1.52, 8.15], [698.55, 1.35, 6.55], 38, 2)],
    fp: () => [698.5, 1.4, 6.5], cinf: 7,
    st: (f) => ({ spot: 0.16 + 0.05 * Math.sin(f * 0.3), stars: stars([698.5, 1.7, 6.7], 6, 0.35, f, 1900, 0.04, 16) }),
    act: (f) => [ch('shopA', 'shopA', [697.1, 0, 7.4], { expr: seq(f, [[1876, 'smile'], [1896, 'grin']]), look: 0.6, L: 'point', blink: blinkAt(f, 31) }, life(f, 31)), ch('shopD', 'shopD', [699.9, 0, 6.9], { expr: 'beam', look: -0.6, blink: blinkAt(f, 34) }, life(f, 34))] },
  // ---------------- "It just stopped being yours" ----------------
  { id: 'yours', a: 1920, b: 1965, set: 'F', tin: 'fly', keys: () => [K(1920, [699.4, 1.55, 7.9], [698.65, 1.45, 6.7], 36, 2), K(1940, [699.6, 1.75, 8.6], [699.2, 1.6, 6.2], 42, 0), K(1965, [702.0, 3.6, 9.4], [707.0, 2.8, 3.8], 58, -2)],
    fp: (f) => f < 1942 ? [698.62, 1.5, 6.8] : [705, 1.5, 3], cinf: 5,
    st: (f) => ({ tagFlipF: ez(ramp(f, 1929, 1945)), spot: 0.2, fall: Array.from({ length: 16 }, (_, i) => { const t = (f - 1936 - i * 1.7) / 30; if (t < 0) return null; const tl = 0.62; const tt = Math.min(t, tl); const a = i * 2.4; return { p: [708 + Math.cos(a) * (0.4 + tt * 2.4), 5.0 - 4.9 * tt * tt * 2.2 + (t > tl ? 0 : 0), 4 + Math.sin(a) * (0.3 + tt * 1.8)], r: [tt * 6 + i, tt * 4, tt * 5] }; }).filter(Boolean), stars: stars([698.62, 1.5, 6.9], 6, 0.2, f, 1944, 0.03, 14) }),
    act: (f) => [ch('shopA', 'shopA', [705.0, 0, 7.6], { expr: 'beam', L: 'up', R: 'up', look: 0.6, blink: 0 }, { ...life(f, 31), bob: q(Math.abs(Math.sin(f * 0.4)) * 0.08, 3) }), ch('shopD', 'shopD', [706.4, 0, 7.7], { expr: 'laugh', L: 'up', R: 'up', blink: 0 }, { bob: q(Math.abs(Math.sin(f * 0.45 + 1)) * 0.1, 3) }), ch('shopC', 'shopC', [706.3, 0, 0.2], { expr: 'grin', L: 'up', R: 'wave', blink: 0 }, { bob: q(Math.abs(Math.sin(f * 0.42 + 2)) * 0.08, 3) }),
      ch('earl', 'earlJkt', [703.4, 0, 6.6], { expr: 'beam', R: 'wave', L: 'hip', look: -0.4, blink: blinkAt(f, 35) }, life(f, 35)), ch('shopB', 'shopB', [702.6, 0, -0.6], { expr: 'shock', L: 'up', R: 'hang', blink: 0 }, life(f, 32))] },
];
COMPS.forEach((c, i) => { c.i = i; c._keys = c.keys(c); c.light = c.light || c.set; });
const KICKS = [{ f: 152, a: 0.04 }, { f: 160, a: 0.03 }, { f: 169, a: 0.03 }, { f: 204, a: 0.02 }, { f: 1286, a: 0.05 }, { f: 1373, a: 0.03 }, { f: 1859, a: 0.03 }, { f: 1946, a: 0.03 }];

// ---------- composition lookup + camera ----------
export const compAt = (f) => COMPS.find((c) => f >= c.a && f < c.b) || COMPS[COMPS.length - 1];
const rawCam = (c, f) => evalKeys(c._keys, f);
const flyN = 12;
const camOf = (c, f) => {
  let C = rawCam(c, f);
  if (c.tin === 'fly' && c.i > 0 && f < c.a + flyN) { const p = rawCam(COMPS[c.i - 1], f), t = ez((f - c.a) / flyN); C = { pos: L3(p.pos, C.pos, t), look: L3(p.look, C.look, t), fov: lerp(p.fov, C.fov, t), roll: lerp(p.roll, C.roll, t) }; }
  return C;
};
const WHIP = 6, DIS = 4;
export const camAt = (f, c) => {
  const C = camOf(c, f);
  // whip: yaw the look sideways at the boundary
  const nx = COMPS[c.i + 1], yawOff = (() => { let y = 0; if (nx && nx.tin === 'whip' && f > nx.a - WHIP) y += 55 * ei((f - (nx.a - WHIP)) / WHIP); if (c.tin === 'whip' && f < c.a + WHIP) y -= 55 * (1 - eo((f - c.a) / WHIP)); return y; })();
  let look = C.look;
  if (yawOff) { const d = look.map((v, i) => v - C.pos[i]); const a = yawOff * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a); look = [C.pos[0] + d[0] * cs + d[2] * sn, C.pos[1] + d[1], C.pos[2] - d[0] * sn + d[2] * cs]; }
  // handheld drift
  const dd = dist(C.pos, look); look = [look[0] + 0.004 * dd * wob(f, 1), look[1] + 0.003 * dd * wob(f, 2.7), look[2] + 0.004 * dd * wob(f, 4.1)];
  let roll = C.roll + 0.6 * wob(f, 3.3);
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 8) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / 8); look = [look[0], look[1] + s * 3, look[2] + s * 2]; roll += s * 25; } }
  return { pos: C.pos, look, fov: C.fov, roll, yawOff };
};
export const views = (f) => {
  const c = compAt(f), nx = COMPS[c.i + 1], pv = COMPS[c.i - 1];
  const blurOf = (cc) => { const y = camAt(f, cc).yawOff || 0; const y2 = camAt(f + 1, cc).yawOff || 0; return [Math.max(-0.12, Math.min(0.12, (y2 - y) * 0.006)), 0]; };
  if (nx && nx.tin === 'dissolve' && f >= nx.a - DIS) return [{ c, w: 1 }, { c: nx, w: (f - (nx.a - DIS)) / (2 * DIS) }];
  if (c.tin === 'dissolve' && pv && f < c.a + DIS) return [{ c: pv, w: 1 }, { c, w: (f - (c.a - DIS)) / (2 * DIS) }];
  if (nx && nx.tin === 'whip' && f >= nx.a - 1) return [{ c, w: 1, blur: blurOf(c) }, { c: nx, w: 0.5, blur: blurOf(nx) }];
  if (c.tin === 'whip' && pv && f < c.a + 1) return [{ c: pv, w: 1, blur: blurOf(pv) }, { c, w: 0.5, blur: blurOf(c) }];
  const v = { c, w: 1 }; if ((nx && nx.tin === 'whip' && f > nx.a - WHIP) || (c.tin === 'whip' && f < c.a + WHIP)) v.blur = blurOf(c);
  return [v];
};
export const lightFor = (c) => LIGHTS[c.light];
export const dofAt = (f, c, C) => ({ focus: dist(C.pos, c.fp(f, C)), cinf: c.cinf, near: 1 });
export const stateAt = (f, c) => { const C = camAt(f, c); return { ...SETDEF[c.set](f), ...(c.st ? c.st(f, C) : {}) }; };
export const actorsAt = (f, c, T, C) => { TT = T; return c.act(f, C); };
export const COMP_LIST = COMPS.map((c) => ({ id: c.id, a: c.a, b: c.b, set: c.set, tin: c.tin }));
