// "Why Grandmas in Japan Want to Go to Prison" — shot plan, word-timed to voiceover.mp3 (65.25 s) + 0.3 s tail. 30 fps, 1960 frames.
// Every clause: a story action + a camera move. Coordinates are set-local (main.js adds the set origin).
import { M as E, blinkAt, q, clamp, lerp, ramp } from './motion.js';
export const FPS = 30, TOTAL = 1960;
export const ORIGIN = { street: [0, 0, 0], apt: [300, 0, 0], city: [600, 0, 0], court: [900, 0, 0], prison: [1200, 0, 0] };
const U = 2.25 / 1000;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const sm = E.smooth, eo = E.easeOut;
const qq = (x) => Math.round(x * 50) / 50; // motion quantised at 0.02 (never coarser)

// ---------------- lights ----------------
export const LIGHTS = {
  day: { az: -60, el: 52, sky: '#d4e4f7', ground: '#a89a80', hemi: 1.3, sun: '#fff3e0', sunI: 2.1, fog: '#d6e6f5', fogNear: 70, fogFar: 800, skyTop: '#4f8fdc', skyHor: '#cfe4f6', sat: 1.14, vig: 0.18, shadowExt: 12 },
  afternoon: { az: -30, el: 34, sky: '#e0dcf0', ground: '#a8906e', hemi: 1.25, sun: '#ffe4bc', sunI: 2.2, fog: '#ecdcca', fogNear: 60, fogFar: 700, skyTop: '#5a8ed8', skyHor: '#f5dcc0', sat: 1.14, vig: 0.2, shadowExt: 12 },
  shop: { az: -70, el: 60, sky: '#ffffff', ground: '#d8d2c4', hemi: 1.45, sun: '#fffaf0', sunI: 1.2, fog: '#f2f0ea', fogNear: 60, fogFar: 400, skyTop: '#5a96e0', skyHor: '#d6e8f6', sat: 1.14, vig: 0.16, shadowExt: 10 },
  apt: { az: -90, el: 32, sky: '#fff2df', ground: '#c9b48a', hemi: 1.35, sun: '#ffe9c8', sunI: 1.6, fog: '#f3e4cc', fogNear: 40, fogFar: 300, skyTop: '#5f97dc', skyHor: '#e9eef2', sat: 1.12, vig: 0.2, shadowExt: 5 },
  office: { az: -90, el: 40, sky: '#e8f1fa', ground: '#8aa0b4', hemi: 1.35, sun: '#ffffff', sunI: 1.5, fog: '#d9e6f2', fogNear: 120, fogFar: 1400, skyTop: '#3f86e0', skyHor: '#cfe2f4', sat: 1.12, vig: 0.18, shadowExt: 9 },
  court: { az: 170, el: 42, sky: '#fff3e2', ground: '#a8865e', hemi: 1.3, sun: '#fff0d6', sunI: 1.7, fog: '#f0e4d0', fogNear: 60, fogFar: 300, skyTop: '#5a96e0', skyHor: '#e0ecf6', sat: 1.12, vig: 0.2, shadowExt: 10 },
  prison: { az: -80, el: 55, sky: '#eaf3f6', ground: '#9fb3a6', hemi: 1.4, sun: '#ffffff', sunI: 1.4, fog: '#e6efea', fogNear: 60, fogFar: 300, skyTop: '#5a96e0', skyHor: '#d6e8f6', sat: 1.12, vig: 0.18, shadowExt: 9 },
  night: { az: -80, el: 40, sky: '#8aa6ea', ground: '#3a4a86', hemi: 1.25, sun: '#c6d6ff', sunI: 1.1, fog: '#4a62a8', fogNear: 40, fogFar: 300, skyTop: '#1c2c70', skyHor: '#3b5cb0', sat: 1.22, gain: '#e4ecff', vig: 0.28, shadowExt: 7 },
  morning: { az: -110, el: 22, sky: '#fff0dc', ground: '#b8a07a', hemi: 1.3, sun: '#ffdcae', sunI: 2.0, fog: '#f6e2cc', fogNear: 60, fogFar: 700, skyTop: '#6c9ad8', skyHor: '#ffe2c4', sat: 1.12, vig: 0.2, shadowExt: 10 },
  flash: { az: -40, el: 30, sky: '#f4e6cc', ground: '#a8906e', hemi: 1.3, sun: '#ffe6c0', sunI: 1.9, fog: '#eedcc0', fogNear: 50, fogFar: 600, skyTop: '#a89a8a', skyHor: '#f2dcc0', sat: 0.62, gain: '#ffeccc', vig: 0.34, shadowExt: 10 },
  dusk: { az: 200, el: 12, sky: '#c8b0d8', ground: '#7a5a4a', hemi: 1.15, sun: '#ffb46c', sunI: 2.4, fog: '#f0b88c', fogNear: 60, fogFar: 700, skyTop: '#5f62b0', skyHor: '#ffbf7e', sunDisc: '#fff0c8', sunSize: 0.004, sat: 1.15, vig: 0.24, shadowExt: 9 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------------- people helpers ----------------
let TT = null, CF = 0;
const SITY = 790;
const ARMH = { hang: (s, b) => [s * (b.BW + 12), b.bt + 190], hip: (s, b) => [s * (b.BW - 2), b.bt + 150], wave: (s, b) => [s * (b.BW + 62), b.bt - 70], up: (s, b) => [s * (b.BW + 34), b.bt - 110],
  point: (s, b) => [s * (b.BW + 130), b.bt + 32], hold: (s, b) => [s * (b.BW - 30), b.bt + 118], holdUp: (s, b) => [s * (b.BW + 34), b.bt + 50], staff: (s, b) => [s * (b.BW + 34), b.bt + 96],
  chin: (s, b) => [s * 20, b.hcy + 92], mouth: (s, b) => [s * 44, b.hcy + 56], cross: (s, b) => [-s * 26, b.bt + 96], thumb: (s, b) => [s * (b.BW + 70), b.bt + 34] };
/** hand position in card design units (for 3D props held by a card) */
const handU = (o, side = 'R', kid = false) => {
  const sit = o.pose === 'sit', BW = kid ? 62 : 66, BH = kid ? 170 : 225, LL = kid ? 175 : 255, bb = sit ? 0 : -LL, bt = bb - BH, b = { BW, bt, hcy: bt - 62 };
  const s = side === 'R' ? 1 : -1, pose = side === 'R' ? (o.R ?? 'hang') : (o.L ?? 'hang');
  let p; if (typeof pose === 'object') { const A = ARMH[pose.a](s, b), Bp = ARMH[pose.b](s, b); p = [lerp(A[0], Bp[0], pose.t), lerp(A[1], Bp[1], pose.t)]; } else p = ARMH[pose](s, b);
  if (o.lean) { const a = o.lean * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a); p = [p[0] * c - p[1] * sn, p[0] * sn + p[1] * c]; }
  return [300 + p[0], (sit ? SITY : 975) + p[1]];
};
const headY = (o = {}, s = 1, kid = false) => ((o.pose === 'sit' ? (kid ? 232 : 287) : (kid ? 469 : 542)) * U) * s; // head centre above the card origin/seat
/** a character card. name = PEOPLE key or { id, o: outfit }. p = feet (or seat for pose 'sit') in set coords */
const P = (name, o, p, x = {}) => {
  const out = typeof name === 'string' ? TT.PEOPLE[name] : name.o, id = typeof name === 'string' ? name : name.id, s = x.s || 1, sit = o.pose === 'sit';
  const seed = x.seed ?? id.length * 7 + (p[0] * 3 | 0);
  const opts = { blink: blinkAt(CF, seed), ...o }; for (const k of ['look', 'headTilt', 'lean', 'talk', 'walk', 'squash']) if (typeof opts[k] === 'number') opts[k] = qq(opts[k]);
  const key = id + JSON.stringify(opts);
  return { key, draw: (g) => { g.translate(300, sit ? SITY : 975); TT.person(g, out, opts); }, x: p[0], y: p[1] - (sit ? (975 - SITY) * U * s : 0), z: p[2], ground: x.ground ?? (sit ? p[1] - 0.45 : p[1]), blob: sit ? false : x.blob, ...x, _o: opts, _kid: !!out.kid };
};
const hold = (actor, id, side = 'R', extra = {}) => { (actor.attach = actor.attach || []).push({ id, u: handU(actor._o, side, actor._kid), ...extra }); return actor; };
const ex = (f, list) => { let e = list[0][1]; for (const [f0, v] of list) if (f >= f0) e = v; return e; };
const dart = (f, seed = 1, amp = 0.7) => [0, 0.6, -0.3, 0.8, -0.7, 0.2, -0.5][Math.floor((f + seed * 11) / 13) % 7] * amp;
const flap = (f, a, b) => (f >= a && f <= b ? [0, 0.6, 1, 0.4, 0.8, 0][Math.floor(f / 2.5) % 6] : 0);
const wk = (f, rate = 0.045) => qq((f * rate) % 1);
const sway = (f, seed, a = 1.5) => a * Math.sin(f * 0.07 + seed);

// ---------------- 3D FX helpers (inked geometry) ----------------
const FX = (t, p, s, r, c, x = {}) => ({ t, p, s, r, c, ...x });
const burst = (f, f0, p, n, o = {}) => { const out = [], dur = o.dur || 18, t = (f - f0) / dur; if (t < 0 || t > 1) return out;
  for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + (o.rot || 0), sp = (o.spread || 0.5) * (0.7 + 0.3 * Math.sin(k * 7.3)), up = o.up ?? 0.2, e = eo(t);
    out.push(FX(o.t || 'puff', [p[0] + Math.cos(a) * sp * e * (o.flat ? 1 : 0.8), p[1] + Math.sin(a) * sp * e * (o.flat ? 0.3 : 0.8) + up * e, p[2] + (o.flat ? Math.sin(a) * sp * e : 0.05)], (o.s || 0.06) * Math.sin(Math.PI * Math.min(1, t * 1.2 + 0.05)) + 0.002, [t * 3 + k, t * 2, k], o.c, { face: o.face })); }
  return out; };
const spark = (f, f0, p, s = 0.08, dur = 14, c) => { const t = (f - f0) / dur; if (t < 0 || t > 1) return []; return [FX('spark', p, s * Math.sin(Math.PI * t), [0, 0, t * 3], c || '#ffd84a', { face: true })]; };
const steam = (f, p, n = 4, h = 0.5, s = 0.035, c = '#ffffff') => { const out = []; for (let k = 0; k < n; k++) { const t = ((f * 0.02 + k / n) % 1); out.push(FX('puff', [p[0] + Math.sin(t * 9 + k) * 0.04, p[1] + t * h, p[2]], s * Math.sin(Math.PI * t) + 0.002, [t, k, 0], c)); } return out; };
const motes = (f, c, size, n = 14, col = '#fff3c8') => { const out = []; for (let k = 0; k < n; k++) { const ph = k * 1.7; out.push(FX('mote', [c[0] + Math.sin(f * 0.011 + ph) * size[0], c[1] + ((f * 0.002 + k / n) % 1) * size[1] - size[1] / 2, c[2] + Math.cos(f * 0.013 + ph * 1.3) * size[2]], 0.008, null, col, { noink: true })); } return out; };
const arc = (f, f0, dur, a, b, h) => { const t = clamp((f - f0) / dur); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t) + h * 4 * t * (1 - t), lerp(a[2], b[2], t)]; };
const bang = (f, f0, p, s = 0.1, c = '#e2453c') => { const t = (f - f0) / 20; if (t < 0 || t > 1) return []; return [FX('bang', p, s * clamp(E.back(t * 3)) * (t > 0.8 ? (1 - t) * 5 : 1), [0, 0, 0.15 * Math.sin(f * 0.8)], c, { face: true })]; };
const hearts = (f, f0, p, n = 3, dur = 30) => { const out = []; for (let k = 0; k < n; k++) { const t = (f - f0 - k * 5) / dur; if (t < 0 || t > 1) continue; out.push(FX('heart', [p[0] + (k - 1) * 0.15 + Math.sin(t * 6 + k) * 0.04, p[1] + t * 0.45, p[2]], 0.05 * Math.sin(Math.PI * t) + 0.002, [0, 0, 0.3 * Math.sin(t * 8)], '#ff6f91', { face: true })); } return out; };
const notes = (f, p, n = 3) => { const out = []; for (let k = 0; k < n; k++) { const t = ((f * 0.018 + k / n) % 1); out.push(FX('note', [p[0] + Math.sin(t * 7 + k) * 0.1 + t * 0.2, p[1] + t * 0.5, p[2]], 0.05 * Math.sin(Math.PI * t) + 0.002, [0, 0, 0.3 * Math.sin(t * 6)], ['#2b1f1c', '#3d8ed8', '#e2453c'][k % 3], { face: true })); } return out; };
const tears = (f, p, n = 3, fall = 0.35) => { const out = []; for (const s of [-1, 1]) for (let k = 0; k < n; k++) { const t = ((f * 0.05 + k / n) % 1); out.push(FX('drop', [p[0] + s * (0.06 + t * 0.05), p[1] - t * fall, p[2] + 0.04], 0.025 * (1 - t * 0.5), [Math.PI, 0, 0], '#8fd0f5')); } return out; };
const sweat = (f, p) => { const t = (f * 0.04) % 1; return [FX('drop', [p[0] + 0.17, p[1] + 0.12 - t * 0.2, p[2] + 0.04], 0.022, [Math.PI, 0, 0], '#8fd0f5')]; };

// ---------------- camera ----------------
const K = (f, p, l, fov = 40, roll = 0, e = 'smooth') => ({ f, pos: p, look: l, fov, roll, ease: e });
const camKeys = (Ks, f) => { let c; if (f <= Ks[0].f) c = { ...Ks[0] }; else if (f >= Ks[Ks.length - 1].f) { const a = Ks[Ks.length - 2] || Ks[0], b = Ks[Ks.length - 1], d = f - b.f, span = Math.max(1, b.f - a.f), v = (b.ease === 'easeOut' ? 0.15 : 0.35) / span;
    c = { pos: b.pos.map((x, i) => x + (x - a.pos[i]) * v * d), look: b.look.map((x, i) => x + (x - a.look[i]) * v * d), fov: b.fov, roll: b.roll }; }
  else { const i = Ks.findIndex((k, j) => f >= k.f && f <= Ks[j + 1].f), a = Ks[i], b = Ks[i + 1], t = (E[b.ease] || sm)((f - a.f) / (b.f - a.f));
    c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) }; }
  return c; };
const KICKS = [{ f: 655, a: 0.025 }, { f: 949, a: 0.03 }, { f: 1026, a: 0.025 }, { f: 1930, a: 0.03 }, { f: 1068, a: 0.01 }];
export const camAt = (S, f) => {
  const c = camKeys(S.keys, f);
  // global framing: wider lens + pull back (Ricks keeps heads small; 9:16 is narrow). Per-shot override with S.wide = [fovMul, backMul]
  const [fm, bm] = S.wide || [1.28, 1.3]; c.fov = Math.min(64, c.fov * fm); c.pos = c.look.map((l, i) => l + (c.pos[i] - l) * bm);
  // handheld: subtle layered noise on look + roll
  const d = Math.hypot(c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]), n = 0.004 * d;
  c.look = [c.look[0] + n * Math.sin(f * 0.31 + 1), c.look[1] + n * Math.sin(f * 0.23 + 2), c.look[2] + n * Math.sin(f * 0.27)];
  c.roll = (c.roll || 0) + 0.5 * Math.sin(f * 0.09) + 0.25 * Math.sin(f * 0.21 + 1);
  for (const k of KICKS) { const dd = f - k.f; if (dd >= 0 && dd < 8) { const s = (dd % 2 ? -1 : 1) * k.a * (1 - dd / 8) * d; c.look = [c.look[0] + s, c.look[1] + s * 0.8, c.look[2]]; c.roll += s * 12; } }
  if (S.whip && f < S.a + S.whip[2]) { const t = (f - S.a) / S.whip[2]; c.blur = [S.whip[0] * (1 - t), S.whip[1] * (1 - t)]; }
  if (S.shadowAt) c.shadowAt = S.shadowAt;
  return c;
};
export const dofAt = (S, f, C) => { const fp = typeof S.focus === 'function' ? S.focus(f) : S.focus; const d = Math.hypot(fp[0] - C.pos[0], fp[1] - C.pos[1], fp[2] - C.pos[2]); return { focus: d, cinf: S.cinf ?? 9, near: 0.7 }; };

// ======================================================================================
// SHOTS
// ======================================================================================
const HANA_I = [-4.55, 0.15, -9.0];
const SHOTS = [
  // 1 ---- HOOK (inside): "In Japan some grandmothers shoplift on purpose" — macro on the onigiri, pull back, she grabs one, tucks it, winks
  { id: 'hookIn', a: 0, b: 88, set: 'street', light: 'shop', cinf: 9, focus: (f) => (f < 22 ? [-5.35, 1.36, -9.4] : [HANA_I[0], 1.35, HANA_I[2]]),
    keys: [K(0, [-4.72, 1.42, -10.25], [-5.35, 1.36, -9.45], 34, -4), K(28, [-2.6, 1.3, -10.45], [-4.65, 1.05, -9.05], 38, 2, 'easeOut'), K(62, [-2.8, 1.29, -10.05], [-4.6, 1.08, -9.0], 37, -1), K(74, [-3.35, 1.32, -9.95], [-4.55, 1.2, -9.0], 34, 1, 'easeOut'), K(96, [-3.5, 1.33, -9.8], [-4.55, 1.22, -9.0], 33, -2)],
    act(f) { const grab = f >= 49, tuck = f >= 60; const o = { expr: ex(f, [[0, 'think'], [30, 'sly'], [49, 'smirk'], [66, 'wink'], [80, 'smugsmile']]), look: f < 45 ? dart(f, 1) : f < 66 ? 0.8 : 0,
        R: f < 40 ? 'hang' : f < 49 ? { a: 'hang', b: 'point', t: qq(ramp(f, 40, 48)) } : f < 60 ? { a: 'point', b: 'hold', t: qq(ramp(f, 49, 58)) } : f < 66 ? 'hold' : { a: 'hold', b: 'thumb', t: qq(ramp(f, 66, 72)) }, L: 'hang', headTilt: sway(f, 1, 3) + (f >= 66 ? 6 : 0) };
      const h = P('hana', o, HANA_I); if (grab && !tuck) hold(h, 'oni1', 'R', { dz: 0.08 }); const out = [h];
      out.push(P('student', { expr: ex(f, [[0, 'grin'], [55, 'shock']]), R: 'holdUp', L: 'hold', look: f > 55 ? -0.8 : 0.4 }, [-3.4, 0.15, -12.4], { s: 1 }));
      return out; },
    props(f) { const p = {}; if (f >= 60) p.oni1 = { v: false }; return p; },
    fx(f) { return [...spark(f, 48, [HANA_I[0] + 0.25, 1.5, HANA_I[2] - 0.35], 0.07), ...spark(f, 66, [HANA_I[0] - 0.05, 1.36, HANA_I[2] + 0.1], 0.05), ...burst(f, 58, [HANA_I[0] + 0.05, 0.9, HANA_I[2] + 0.12], 5, { s: 0.03, spread: 0.15 }), ...motes(f, [-4, 1.6, -9.6], [1.2, 1.4, 1])]; } },
  // 2 ---- HOOK (outside): "so they can go to prison" — she walks out, offers her wrists to the guard
  { id: 'hookOut', a: 89, b: 117, dis: 6, whip: [0.05, 0, 6], set: 'street', light: 'day', cinf: 7, focus: [3.2, 1.3, -5.4],
    keys: [K(89, [0.6, 1.3, -1.9], [3.5, 1.05, -5.5], 42, 3), K(100, [1.1, 1.28, -2.4], [3.6, 1.05, -5.4], 39, 0, 'easeOut'), K(117, [1.45, 1.25, -2.75], [3.7, 1.05, -5.3], 38, -2), K(130, [1.6, 1.24, -2.9], [3.7, 1.05, -5.3], 38, -2)],
    act(f) { const at = clamp((f - 89) / 14); const hp = [lerp(3.0, 3.25, at), 0.14, lerp(-6.2, -5.4, at)];
      const h = P('hana', { expr: ex(f, [[89, 'smugsmile'], [100, 'beam']]), walk: f < 103 ? wk(f, 0.05) : undefined, L: f < 98 ? 'hang' : 'hold', R: f < 98 ? 'hang' : 'hold', look: 0.6, headTilt: sway(f, 2, 3) }, hp);
      const g = P('guard', { expr: ex(f, [[89, 'bored'], [104, 'shock']]), L: f < 104 ? 'hip' : 'up', R: f < 104 ? { a: 'hang', b: 'mouth', t: 1 } : 'up', look: f < 104 ? -0.4 : -0.8, squash: f >= 104 && f < 110 ? -0.04 : 0 }, [4.5, 0.14, -4.95], { s: 1.12 });
      return [h, g, P('kenta', { expr: ex(f, [[89, 'smile'], [105, 'shock']]), L: 'hold', R: 'hold' }, [5.5, 0.15, -9.6], { s: 1.1 })]; },
    props(f) { return { doorL: { p: [2.6 - 1.15, 0, -6.54] }, doorR: { p: [3.8 + 1.15, 0, -6.54] } }; },
    fx(f) { return [...bang(f, 104, [4.5, 2.05, -4.95], 0.12), ...burst(f, 104, [4.5, 1.6, -4.9], 6, { t: 'spark', s: 0.04, spread: 0.35, face: true }), ...sweat(f, [4.5, 1.52, -4.95])]; } },
  // 3 ---- "Imagine you're 81." — alone at the low table, party hat, blows out the candles
  { id: 'cake', a: 118, b: 154, dis: 8, set: 'apt', light: 'apt', cinf: 8, focus: [0, 0.8, -0.55],
    keys: [K(118, [1.6, 1.55, 2.1], [0, 0.7, -0.4], 46, 3), K(132, [0.6, 1.05, 1.55], [0, 0.8, -0.35], 38, -1, 'easeOut'), K(150, [0.42, 1.0, 1.3], [0, 0.8, -0.4], 36, -3), K(162, [0.35, 0.98, 1.2], [0, 0.8, -0.4], 35, -3)],
    act(f) { const blow = f >= 140 && f < 148; return [P({ id: 'hanaParty', o: { ...TT.PEOPLE.hana, hat: 'party' } }, { pose: 'sit', expr: ex(f, [[118, 'beam'], [134, 'smile'], [148, 'bored']]), talk: blow ? 1 : 0, look: f >= 148 ? -0.8 : 0, L: 'hold', R: f < 136 ? 'wave' : 'hold', headTilt: f >= 148 ? -6 : sway(f, 3, 3) }, [0, 0.12, -0.55])]; },
    props(f) { return { cake: { v: true }, envelope: { v: false }, jar: { v: false }, flames: { s: f < 143 ? 1 + 0.15 * Math.sin(f * 1.3) : 0.001 } }; },
    fx(f) { const out = [...steam(f, [-0.25, 0.48, 0.3], 3, 0.35, 0.025)]; if (f >= 143) out.push(...steam(f, [0.05, 0.7, 0.25], 4, 0.6, 0.03, '#c9c4bb'));
      out.push(...burst(f, 139, [0.02, 0.72, -0.2], 5, { s: 0.03, spread: 0.2, up: -0.05 }));
      for (let k = 0; k < 3; k++) { const t = clamp((f - 146 - k * 3) / 30); if (t > 0) out.push(FX('confetti', [-0.2 + k * 0.2 + Math.sin(t * 6 + k) * 0.05, 1.7 - t * 1.2, -0.2], 0.035, [t * 5, t * 3 + k, k], ['#ff6f91', '#ffd84a', '#5ac8e0'][k])); }
      return [...out, ...motes(f, [0, 1.2, -0.5], [1.4, 1.6, 1])]; } },
  // 4 ---- "Your husband is gone." — macro on his photo with incense smoke, pull back to her praying
  { id: 'altar', wide: [1.3, 1.45], a: 155, b: 188, dis: 6, set: 'apt', light: 'apt', cinf: 8, focus: (f) => (f < 166 ? [-2.14, 1.2, -1.25] : [-1.0, 0.75, -0.4]),
    keys: [K(155, [-1.72, 1.27, -1.1], [-2.14, 1.22, -1.25], 30, -3), K(170, [0.15, 1.18, 0.55], [-1.55, 0.88, -0.95], 38, 2, 'easeOut'), K(188, [0.3, 1.15, 0.7], [-1.55, 0.88, -0.95], 37, 3)],
    act(f) { return [P('husband', { expr: 'smile', blink: 0 }, [-2.115, 1.06, -1.25], { s: 0.17, yaw: Math.PI / 2, blob: false, shadow: false }),
      P('hana', { pose: 'sit', expr: ex(f, [[155, 'sleepy'], [176, 'bored']]), L: 'hold', R: 'hold', headTilt: ex(f, [[155, 8], [176, 2]]), look: f >= 176 ? -1 : 0 }, [-1.0, 0.1, -0.4])]; },
    props() { return { cake: { v: false } }; },
    fx(f) { return [...steam(f, [-1.9, 0.92, -1.15], 6, 0.8, 0.025, '#c9c4bb'), ...(f >= 177 ? tears(f, [-1.0, 0.86, -0.4], 2, 0.25) : []), ...motes(f, [-1.3, 1.3, -0.9], [1, 1.2, 0.8])]; } },
  // 5 ---- "Your kids live in another city" — busy office high above the skyline
  { id: 'city', a: 189, b: 232, dis: 8, set: 'city', light: 'office', cinf: 8, focus: [0.2, 1.1, -0.9],
    keys: [K(189, [4.3, 2.6, 3.9], [0, 1.0, -2.6], 46, -3), K(206, [1.5, 1.38, 1.5], [0.4, 1.0, -1.2], 40, 1, 'easeOut'), K(232, [0.95, 1.32, 1.25], [0.5, 1.0, -1.1], 38, -2), K(242, [0.85, 1.31, 1.2], [0.5, 1.0, -1.1], 38, -2)],
    act(f) { const ty = qq(0.5 + 0.5 * Math.sin(f * 0.9));
      const son = P('son', { pose: 'sit', expr: ex(f, [[189, 'nervous'], [215, 'stern']]), L: { a: 'hold', b: 'hang', t: ty }, R: { a: 'hold', b: 'hang', t: qq(1 - ty) }, look: dart(f, 4) }, [0, 0.5, -0.9], { s: 1.1 });
      const dau = P('daughter', { pose: 'sit', expr: ex(f, [[189, 'grin'], [210, 'laugh']]), R: 'mouth', L: 'hip', talk: flap(f, 189, 240), look: -0.4 }, [1.8, 0.5, -0.9], { s: 1.08 }); hold(dau, 'cityPhone2', 'R', { dz: 0.08 });
      const cw = P('salary', { expr: 'bored', walk: wk(f), R: 'hold', L: 'hang' }, [-3.5 + (f - 189) * 0.035, 0, -3.7], { s: 1.1 });
      const cw2 = P('courier', { expr: 'neutral', walk: wk(f, 0.05), L: 'hold', R: 'hold' }, [3.6 - (f - 189) * 0.03, 0, -3.9], { s: 1.1 });
      return [son, dau, cw, cw2]; },
    props() { return { cityPhone: { v: false } }; },
    fx(f) { const out = []; for (let k = 0; k < 4; k++) { const t = ((f - 189) / 26 + k / 4) % 1; out.push(FX('paper', [0.3 + t * 0.7 + Math.sin(t * 5 + k) * 0.1, 0.85 + t * 1.0, -1.4 + t * 0.4], 0.12, [t * 4 + k, t * 3, t * 5], '#fbf8f0')); } return out; } },
  // 6 ---- "and call on New Year's," — the calendar: JAN 1, CALL MOM (MAYBE)
  { id: 'calendar', wide: [1.3, 1.7], a: 233, b: 262, dis: 6, set: 'city', light: 'office', cinf: 10, focus: [3.2, 1.6, -2.88],
    keys: [K(233, [2.55, 1.75, -1.85], [3.2, 1.62, -2.88], 34, 4), K(246, [2.92, 1.66, -2.32], [3.2, 1.62, -2.88], 30, -1, 'easeOut'), K(262, [3.02, 1.64, -2.4], [3.2, 1.62, -2.88], 29, -3), K(272, [3.05, 1.63, -2.42], [3.2, 1.62, -2.88], 29, -3)],
    act(f) { return [P('son', { pose: 'sit', expr: 'nervous', L: 'hold', R: 'hold' }, [0, 0.5, -0.9], { s: 1.1 })]; },
    fx(f) { return [...spark(f, 249, [3.05, 1.82, -2.84], 0.05), ...spark(f, 254, [3.36, 1.8, -2.84], 0.04, 12, '#ff6f91')]; } },
  // 7 ---- "maybe." — he looks at the phone, shrugs, puts it down; sister side-eyes him
  { id: 'maybe', wide: [1.35, 1.6], a: 263, b: 279, dis: 5, set: 'city', light: 'office', cinf: 8, focus: [0, 1.1, -0.9],
    keys: [K(263, [1.0, 1.35, 1.1], [0.5, 1.05, -1.0], 38, 2), K(273, [0.55, 1.3, 0.85], [0.5, 1.05, -1.0], 36, -1, 'easeOut'), K(290, [0.48, 1.29, 0.8], [0.5, 1.05, -1.0], 36, -2)],
    act(f) { const sh = f >= 267 && f < 276; const son = P('son', { pose: 'sit', expr: ex(f, [[263, 'think'], [267, 'bored']]), R: sh ? 'up' : 'holdUp', L: sh ? 'up' : 'hang', headTilt: sh ? 10 : 0, look: f < 267 ? 0.6 : 0 }, [0, 0.5, -0.9], { s: 1.1 });
      if (!sh) hold(son, 'cityPhone', 'R', { dz: 0.08 }); return [son, P('daughter', { pose: 'sit', expr: 'bored', look: -1, R: 'hip', L: 'cross' }, [1.0, 0.5, -1.25], { s: 1.08 })]; },
    props(f) { return f >= 267 && f < 276 ? { cityPhone: { p: [0.35, 1.9, -0.85], r: [0, 0, f * 0.4] } } : {}; },
    fx(f) { return [...spark(f, 268, [0.35, 1.95, -0.85], 0.04)]; } },
  // 8 ---- "Your pension covers rent and not much else." — coins hop from the PENSION envelope into the RENT jar, one coin left
  { id: 'pension', a: 280, b: 346, dis: 8, set: 'apt', light: 'apt', cinf: 9, focus: (f) => (f < 320 ? [0.0, 0.45, 0.35] : [0, 0.78, -0.55]),
    keys: [K(280, [0.4, 0.86, 0.98], [0.18, 0.4, 0.42], 32, -3), K(302, [0.05, 0.92, 1.02], [-0.12, 0.45, 0.28], 34, 1, 'easeOut'), K(322, [0.62, 1.0, 1.45], [0.05, 0.62, 0.0], 38, 2, 'easeOut'), K(346, [0.75, 1.04, 1.6], [0, 0.7, -0.3], 38, 3), K(356, [0.78, 1.05, 1.64], [0, 0.7, -0.3], 38, 3)],
    act(f) { return [P('hana', { pose: 'sit', expr: ex(f, [[280, 'neutral'], [309, 'think'], [330, 'nervous']]), look: f < 325 ? dart(f, 2, 0.5) : 0.3, L: 'hold', R: f < 318 ? 'hold' : { a: 'hold', b: 'chin', t: qq(ramp(f, 318, 326)) }, headTilt: sway(f, 4, 2) }, [0, 0.12, -0.55])]; },
    props(f) { return { cake: { v: false }, envelope: { v: true }, jar: { v: true }, jarCoins: { s: [1, 0.6 + 0.4 * ramp(f, 300, 320), 1] } }; },
    fx(f) { const out = []; for (let k = 0; k < 6; k++) { const f0 = 296 + k * 4, t = (f - f0) / 12; if (t >= 0 && t <= 1) out.push(FX('coin', arc(f, f0, 12, [0.2, 0.42, 0.45], [-0.3, 0.62, 0.2], 0.25), 0.025, [Math.PI / 2 + t * 6, 0, t * 3])); }
      if (f >= 318) { const t = clamp((f - 318) / 26), w = (1 - t) * 0.6 * Math.sin(f * 0.9); out.push(FX('coin', [0.25 - t * 0.12, 0.42, 0.55], 0.025, [t < 1 ? 1.2 + w : Math.PI / 2, 0, w], '#e5c158')); }
      return [...out, ...spark(f, 330, [0.15, 0.48, 0.55], 0.03), ...steam(f, [-0.25, 0.48, 0.3], 3, 0.35, 0.025)]; } },
  // 9 ---- "Some days the only voice you hear is the TV." — the quiz host talks to her; she laughs back alone; pull back to the empty room
  { id: 'tv', a: 347, b: 428, dis: 6, set: 'apt', light: 'apt', cinf: 8, focus: (f) => (f < 378 ? [1.24, 0.76, -1.35] : [0, 0.8, -0.55]),
    keys: [K(347, [0.9, 0.82, -0.78], [1.24, 0.74, -1.35], 30, -3), K(376, [0.55, 0.95, -0.42], [1.2, 0.74, -1.3], 32, 2), K(392, [1.05, 1.12, 0.95], [0.1, 0.75, -0.5], 38, -1, 'easeOut'), K(408, [1.15, 1.15, 1.05], [0.05, 0.75, -0.5], 38, 2), K(420, [1.85, 1.62, 2.1], [0, 0.72, -0.6], 46, 0, 'easeOut'), K(436, [1.95, 1.66, 2.18], [0, 0.72, -0.6], 46, -1)],
    act(f) { const up = qq(0.5 + 0.5 * Math.sin(f * 0.5));
      const host = P('host', { expr: ex(f, [[347, 'laugh'], [365, 'grin'], [380, 'laugh']]), talk: flap(f, 347, 428), L: { a: 'up', b: 'wave', t: up }, R: { a: 'wave', b: 'point', t: qq(1 - up) } }, [1.235, 0.5, -1.32], { s: 0.2, blob: false, shadow: false, order: 3 });
      const h = P('hana', { pose: 'sit', expr: ex(f, [[347, 'smile'], [380, 'laugh'], [408, 'grin'], [415, 'bored']]), talk: flap(f, 382, 405), R: f >= 404 && f < 416 ? 'point' : 'hold', L: 'hold', headTilt: f < 410 ? 4 * Math.sin(f * 0.4) : -4, look: 0.7 }, [0, 0.12, -0.55]);
      return [host, h]; },
    props() { return { cake: { v: false }, envelope: { v: false } }; },
    fx(f) { return [...notes(f, [1.1, 1.05, -1.2], 3), ...steam(f, [-0.25, 0.48, 0.3], 3, 0.35, 0.025), ...motes(f, [0.5, 1.2, -0.5], [1.5, 1.6, 1.2])]; } },
  // 10 ---- "So one afternoon you walk into a convenience store," — she walks along the street; a delivery bike wipes past; doors slide open
  { id: 'walk', a: 429, b: 509, dis: 8, set: 'street', light: 'afternoon', cinf: 6, focus: (f) => [lerp(0.4, 3.0, ramp(f, 429, 500)), 1.3, -5.3],
    keys: [K(429, [-2.3, 1.45, -1.1], [0.4, 1.1, -5.2], 40, 3), K(446, [-0.7, 1.36, -1.7], [1.3, 1.05, -5.2], 39, 0, 'easeOut'), K(480, [0.9, 1.3, -2.3], [2.6, 1.08, -5.6], 39, -2), K(509, [2.45, 1.32, -4.55], [3.2, 1.12, -7.5], 37, 1), K(518, [2.6, 1.32, -4.8], [3.2, 1.12, -7.6], 37, 1)],
    act(f) { const t = ramp(f, 429, 488), hp = f < 488 ? [lerp(0.4, 3.05, t), 0.14, -5.3] : [3.1, 0.14, lerp(-5.3, -7.0, ramp(f, 488, 509))];
      const out = [P('hana', { expr: ex(f, [[429, 'smile'], [455, 'neutral'], [478, 'sly']]), walk: wk(f, 0.04), L: 'hang', R: 'hang', look: f > 470 ? 0.8 : dart(f, 6, 0.4), headTilt: sway(f, 5, 2) }, hp)];
      const bt = (f - 436) / 24; if (bt >= 0 && bt <= 1) out.push(P('courier', { pose: 'sit', expr: 'grin', L: 'holdUp', R: 'holdUp', walk: wk(f, 0.08) }, [lerp(4.5, -6.5, bt), 0.86, -2.6], { s: 1.05 }));
      out.push(P('guard', { expr: 'bored', L: 'hip', R: 'mouth', look: 0.8 }, [5.0, 0.14, -5.5], { s: 1.12 }));
      return out; },
    props(f) { const bt = (f - 436) / 24, o = (eo(ramp(f, 476, 488))) * 1.15; return { bikeR: { p: [lerp(4.5, -6.5, clamp(bt)), 0, -2.6], v: bt >= 0 && bt <= 1 }, doorL: { p: [2.6 - o, 0, -6.54] }, doorR: { p: [3.8 + o, 0, -6.54] }, car: { p: [-30 + (f - 429) * 0.4, 0, 1.6] }, car2: { p: [40 - (f - 429) * 0.35, 0, -1.6], r: [0, Math.PI, 0] } }; },
    fx(f) { return [...spark(f, 478, [3.2, 2.95, -6.5], 0.07), ...motes(f, [1, 2, -4], [3, 2, 1.2], 10, '#fff7d0')]; } },
  // 11 ---- "pick up a rice ball worth a hundred yen" — macro ¥100 tag, her hand takes it, tilt up to her face
  { id: 'pick', a: 510, b: 568, dis: 6, set: 'street', light: 'shop', cinf: 9, focus: (f) => (f < 528 ? [-5.3, 1.33, -9.35] : [HANA_I[0], 1.35, HANA_I[2]]),
    keys: [K(510, [-4.62, 1.42, -9.95], [-5.28, 1.32, -9.38], 30, -3), K(532, [-2.95, 1.35, -10.25], [-4.6, 1.12, -9.08], 38, 2, 'easeOut'), K(568, [-3.2, 1.36, -10.0], [-4.6, 1.15, -9.05], 36, -2), K(578, [-3.25, 1.36, -9.95], [-4.6, 1.15, -9.05], 36, -2)],
    act(f) { const g = f >= 521; const o = { expr: ex(f, [[510, 'neutral'], [527, 'think'], [545, 'smile'], [558, 'grin']]), R: f < 514 ? 'hang' : f < 521 ? { a: 'hang', b: 'point', t: qq(ramp(f, 514, 520)) } : { a: 'point', b: 'holdUp', t: qq(ramp(f, 521, 530)) }, L: 'hang', look: f > 527 ? 0.9 : 0, headTilt: f > 527 ? 6 : 0 };
      const h = P('hana', o, HANA_I); if (g) hold(h, 'oni1', 'R', { dz: 0.08, s: 1.4 }); return [h, P('student', { expr: 'grin', R: 'holdUp', L: 'hold', look: 0.3 }, [-3.5, 0.15, -12.4])]; },
    fx(f) { return [...spark(f, 542, [-4.2, 1.55, -9.0], 0.06), ...spark(f, 555, [-5.12, 1.32, -9.32], 0.04), ...motes(f, [-4, 1.6, -9.6], [1.2, 1.4, 1])]; } },
  // 12 ---- "and walk out without paying." — she strolls past the till, waves; Kenta is busy scanning
  { id: 'walkout', a: 569, b: 609, dis: 6, set: 'street', light: 'shop', cinf: 7, focus: (f) => [lerp(3.5, 3.1, ramp(f, 569, 600)), 1.3, lerp(-10.0, -7.3, ramp(f, 569, 600))],
    keys: [K(569, [0.95, 1.45, -7.35], [4.6, 1.1, -10.9], 41, 2), K(585, [1.4, 1.4, -7.7], [4.4, 1.1, -10.6], 38, -1, 'easeOut'), K(609, [1.62, 1.38, -7.88], [4.3, 1.1, -10.4], 38, -3), K(619, [1.7, 1.37, -7.95], [4.3, 1.1, -10.4], 38, -3)],
    act(f) { const t = ramp(f, 569, 606); const h = P('hana', { expr: ex(f, [[569, 'smugsmile'], [590, 'beam']]), walk: wk(f, 0.045), R: 'holdUp', L: f >= 588 ? { a: 'hang', b: 'wave', t: qq(0.5 + 0.5 * Math.sin(f * 0.6)) } : 'hang', look: -0.5 }, [lerp(3.6, 3.05, t), 0.15, lerp(-10.0, -7.1, t)]);
      hold(h, 'oni1', 'R', { dz: 0.08, s: 1.4 });
      return [h, P('kenta', { expr: ex(f, [[569, 'smile'], [590, 'grin']]), L: 'hold', R: { a: 'hold', b: 'holdUp', t: qq(0.5 + 0.5 * Math.sin(f * 0.5)) }, talk: flap(f, 590, 604), look: 0.5 }, [5.6, 0.15, -10.6], { s: 1.1 }),
        P('salary', { expr: 'bored', L: 'hold', R: 'hang', look: -0.6 }, [4.4, 0.15, -11.0], { s: 1.12 })]; },
    props(f) { return { doorL: { p: [2.6 - 1.15, 0, -6.54] }, doorR: { p: [3.8 + 1.15, 0, -6.54] } }; },
    fx(f) { return [...spark(f, 580, [4.75, 1.45, -10.45], 0.05, 10, '#7cd0ff'), ...spark(f, 596, [4.75, 1.45, -10.45], 0.05, 10, '#7cd0ff'), ...notes(f, [3.4, 1.65, -8.4], 2)]; } },
  // 13 ---- "You don't even run." — she ambles; a crow walks past her faster
  { id: 'norun', a: 610, b: 638, dis: 6, set: 'street', light: 'day', cinf: 6, focus: [3.8, 0.9, -5.0],
    keys: [K(610, [2.0, 0.72, -2.5], [4.1, 0.85, -5.0], 38, 4), K(624, [2.5, 0.76, -2.65], [4.2, 0.86, -5.0], 37, 0, 'easeOut'), K(638, [2.85, 0.78, -2.75], [4.3, 0.88, -5.0], 37, -3), K(648, [3.0, 0.79, -2.8], [4.3, 0.88, -5.0], 37, -3)],
    act(f) { const h = P('hana', { expr: 'smugsmile', walk: wk(f, 0.02), R: 'holdUp', L: 'hang', headTilt: 5 * Math.sin(f * 0.2) }, [lerp(3.6, 4.0, ramp(f, 610, 640)), 0.14, -5.1]); hold(h, 'oni1', 'R', { dz: 0.08, s: 1.4 }); return [h]; },
    props(f) { return { crowWalk: { p: [lerp(3.0, 5.8, ramp(f, 610, 640)), 0.14 + (Math.floor(f / 3) % 2) * 0.03, -4.7], r: [0, 0, 0] }, doorL: { p: [2.6 - 1.15, 0, -6.54] }, doorR: { p: [3.8 + 1.15, 0, -6.54] } }; },
    fx(f) { return [...notes(f, [4.0, 1.45, -5.0], 3)]; } },
  // 14 ---- "The guard catches you" — he bursts out of the door and grabs her
  { id: 'catch', a: 639, b: 671, dis: 5, set: 'street', light: 'day', cinf: 7, focus: [4.3, 1.2, -5.2],
    keys: [K(639, [5.9, 1.45, -2.2], [3.9, 1.0, -5.6], 44, -3), K(652, [5.25, 1.36, -3.0], [4.2, 1.02, -5.3], 38, 1, 'easeOut'), K(671, [5.05, 1.32, -3.2], [4.25, 1.02, -5.25], 37, 3), K(680, [5.0, 1.31, -3.25], [4.25, 1.02, -5.25], 37, 3)],
    act(f) { const t = eo(ramp(f, 639, 655)); const caught = f >= 655;
      const g = P('guard', { expr: caught ? 'angry' : 'stern', walk: caught ? undefined : wk(f, 0.12), L: caught ? 'hip' : 'hang', R: caught ? 'point' : 'hang', lean: caught ? 0 : -8 }, [lerp(3.2, 3.95, t), 0.14, lerp(-6.3, -5.2, t)], { s: 1.12 });
      const h = P('hana', { expr: caught ? 'shock' : 'smugsmile', R: 'holdUp', L: caught ? 'up' : 'hang', squash: caught && f < 660 ? 0.04 : 0, look: caught ? -0.8 : 0 }, [4.6, 0.14, -5.1]); hold(h, 'oni1', 'R', { dz: 0.08, s: 1.4 });
      return [g, h]; },
    props(f) { return { doorL: { p: [2.6 - 1.15, 0, -6.54] }, doorR: { p: [3.8 + 1.15, 0, -6.54] } }; },
    fx(f) { return [...bang(f, 655, [4.6, 1.9, -5.1], 0.1), ...sweat(f, [3.9, 1.38, -5.2]), ...burst(f, 655, [4.3, 1.2, -5.1], 7, { t: 'spark', s: 0.04, spread: 0.45, face: true }), ...burst(f, 641, [3.4, 0.2, -6.1], 6, { s: 0.06, spread: 0.4, up: 0.05, flat: true })]; } },
  // 15 ---- "and you say I'm sorry." — a deep bow, mouth flapping; the guard softens
  { id: 'sorry', wide: [1.35, 1.6], a: 672, b: 712, dis: 5, set: 'street', light: 'day', cinf: 7, focus: [4.3, 1.15, -5.15],
    keys: [K(672, [4.75, 1.42, -3.25], [4.3, 1.2, -5.15], 37, -2), K(712, [3.85, 1.4, -3.4], [4.3, 1.2, -5.15], 36, 3), K(722, [3.75, 1.4, -3.42], [4.3, 1.2, -5.15], 36, 3)],
    act(f) { const bow = f >= 692 && f < 709; const h = P('hana', { expr: ex(f, [[672, 'nervous'], [692, 'sleepy'], [709, 'nervous']]), lean: bow ? -14 : 0, headTilt: bow ? -14 : 0, talk: flap(f, 695, 708), L: 'hold', R: 'hold' }, [4.6, 0.14, -5.1]);
      hold(h, 'oni1', 'R', { dz: 0.08, s: 1.4 }); return [h, P('guard', { expr: ex(f, [[672, 'angry'], [700, 'stern'], [706, 'think']]), L: 'hip', R: f < 700 ? 'cross' : 'chin', look: 0.6 }, [3.95, 0.14, -5.2], { s: 1.12 })]; },
    props(f) { return { doorL: { p: [2.6 - 1.15, 0, -6.54] }, doorR: { p: [3.8 + 1.15, 0, -6.54] } }; },
    fx(f) { return [...sweat(f, [4.6, 1.2, -5.1]), ...burst(f, 694, [4.45, 1.35, -5.0], 4, { s: 0.025, spread: 0.2, t: 'drop', c: '#8fd0f5' })]; } },
  // 16 ---- "But you're not." — she turns to the lens: sly grin, wink, glint
  { id: 'butnot', a: 713, b: 735, dis: 4, set: 'street', light: 'day', cinf: 10, focus: [4.6, 1.3, -5.1],
    keys: [K(713, [4.3, 1.32, -2.7], [4.6, 1.2, -5.1], 36, 2), K(722, [4.42, 1.3, -3.22], [4.6, 1.22, -5.1], 34, -2, 'easeOut'), K(735, [4.45, 1.3, -3.3], [4.6, 1.22, -5.1], 34, -4), K(745, [4.46, 1.3, -3.33], [4.6, 1.22, -5.1], 34, -4)],
    act(f) { const h = P('hana', { expr: ex(f, [[713, 'neutral'], [719, 'sly'], [727, 'wink']]), look: 0, L: 'hold', R: 'holdUp', headTilt: f > 719 ? 8 : 0 }, [4.6, 0.14, -5.1]); hold(h, 'oni1', 'R', { dz: 0.08, s: 1.4 });
      return [h, P('guard', { expr: 'bored', L: 'hip', R: 'hang', look: 1 }, [3.7, 0.14, -5.6], { s: 1.12 })]; },
    fx(f) { return [...spark(f, 727, [4.52, 1.42, -4.95], 0.07), ...spark(f, 731, [4.78, 1.45, -4.95], 0.04, 10, '#ffffff')]; } },
  // 17 ---- "The first time they let you go with a warning." — a policeman waves a WARNING; she pouts
  { id: 'warning', a: 736, b: 800, dis: 6, set: 'street', light: 'shop', cinf: 7, focus: [2.3, 1.3, -8.85],
    keys: [K(736, [-0.3, 1.55, -7.2], [3.8, 1.0, -9.8], 44, -3), K(752, [0.4, 1.4, -7.6], [3.8, 1.05, -9.7], 38, 1, 'easeOut'), K(800, [0.85, 1.38, -7.95], [3.8, 1.05, -9.6], 37, 3), K(810, [0.9, 1.38, -8.0], [3.8, 1.05, -9.6], 37, 3)],
    act(f) { const wag = qq(0.5 + 0.5 * Math.sin(f * 0.7)); const go = f >= 775;
      const pol = P('police', { expr: ex(f, [[736, 'stern'], [775, 'smile']]), talk: flap(f, 742, 798), L: 'holdUp', R: go ? 'thumb' : { a: 'point', b: 'up', t: wag }, look: 0.6 }, [2.5, 0.15, -8.6], { s: 1.12 }); hold(pol, 'warnPaper', 'L', { dz: 0.08 });
      const h = P('hana', { expr: ex(f, [[736, 'bored'], [762, 'sleepy'], [775, 'smugsmile']]), look: f < 775 ? -0.9 : 0.2, L: 'hold', R: 'hold', headTilt: f < 775 ? -6 : 5 }, [2.0, 0.15, -9.1]);
      return [pol, h, P('kenta', { expr: 'think', L: 'chin', R: 'hold', look: -0.5 }, [5.6, 0.15, -9.8], { s: 1.1 }), P('guard', { expr: ex(f, [[736, 'stern'], [775, 'angry']]), L: 'hip', R: f > 775 ? 'chin' : 'cross' }, [4.2, 0.15, -10.6], { s: 1.12 })]; },
    props(f) { return { warnPaper: { v: true } }; },
    fx(f) { return [...(f >= 750 && f < 775 ? notes(f, [2.1, 1.5, -9.0], 2) : []), ...spark(f, 787, [2.15, 1.62, -8.55], 0.05), ...motes(f, [2.5, 1.6, -9], [1.5, 1.4, 1])]; } },
  // 18 ---- "So you do it again." — whip back to the cooler: grab #2; a kid gasps
  { id: 'again1', a: 801, b: 831, dis: 4, whip: [0.07, 0, 6], set: 'street', light: 'shop', cinf: 8, focus: [-4.5, 1.3, -9.3],
    keys: [K(801, [-2.6, 1.32, -10.7], [-4.7, 1.0, -9.4], 40, 5), K(812, [-3.05, 1.3, -10.55], [-4.7, 1.02, -9.4], 37, 0, 'easeOut'), K(831, [-3.25, 1.29, -10.3], [-4.65, 1.05, -9.35], 36, -3), K(841, [-3.3, 1.29, -10.25], [-4.65, 1.05, -9.35], 36, -3)],
    act(f) { const g = f >= 817; const h = P('hana', { expr: ex(f, [[801, 'sly'], [817, 'grin']]), R: f < 812 ? { a: 'hang', b: 'point', t: qq(ramp(f, 804, 812)) } : f < 817 ? 'point' : { a: 'point', b: 'holdUp', t: qq(ramp(f, 817, 824)) }, L: 'hang', look: 0.8 }, [-4.5, 0.15, -9.3]);
      if (g) hold(h, 'oni2', 'R', { dz: 0.08, s: 1.4 }); return [h, P('student', { expr: f > 818 ? 'shock' : 'neutral', L: f > 818 ? 'mouth' : 'hold', R: 'holdUp', look: -0.8 }, [-3.3, 0.15, -12.3])]; },
    fx(f) { return [...spark(f, 817, [-4.25, 1.55, -9.25], 0.06), ...bang(f, 820, [-3.3, 1.75, -12.3], 0.08)]; } },
  // 19 ---- "And again." — grab #3, both hands full; the guard facepalms
  { id: 'again2', a: 832, b: 858, dis: 4, whip: [-0.07, 0, 6], set: 'street', light: 'shop', cinf: 8, focus: [-4.5, 1.3, -9.6],
    keys: [K(832, [-3.0, 1.55, -7.7], [-4.7, 1.15, -9.7], 40, -5), K(842, [-3.3, 1.5, -8.05], [-4.7, 1.12, -9.65], 37, 0, 'easeOut'), K(858, [-3.45, 1.48, -8.2], [-4.7, 1.1, -9.6], 36, 3), K(868, [-3.5, 1.47, -8.25], [-4.7, 1.1, -9.6], 36, 3)],
    act(f) { const h = P('hana', { expr: ex(f, [[832, 'grin'], [841, 'beam']]), R: f < 839 ? 'point' : 'holdUp', L: 'holdUp', look: -0.5 }, [-4.5, 0.15, -9.6]); hold(h, 'oni2', 'L', { dz: 0.08, s: 1.4 }); if (f >= 839) hold(h, 'oni3', 'R', { dz: 0.08, s: 1.4 });
      return [h, P('guard', { expr: 'angry', L: 'chin', R: 'hip', headTilt: -8 }, [-3.9, 0.15, -11.2], { s: 1.12 })]; },
    fx(f) { return [...spark(f, 839, [-4.3, 1.6, -9.55], 0.06), ...spark(f, 845, [-4.75, 1.6, -9.55], 0.05)]; } },
  // 20 ---- "Until finally a judge says the word you were waiting for" — fly over the gallery; the judge raises the verdict; she leans in
  { id: 'judge', a: 859, b: 943, dis: 8, set: 'court', light: 'court', cinf: 8, focus: (f) => (f < 925 ? [0, 2.1, -7.9] : [0.1, 1.4, -1.75]),
    keys: [K(859, [0.4, 2.9, 6.0], [0, 1.6, -6.0], 44, 3), K(894, [0.3, 2.0, 1.6], [0, 1.8, -7.5], 38, -1), K(912, [0.85, 1.68, 1.05], [-0.15, 1.75, -7.5], 34, 2, 'easeOut'), K(943, [0.5, 1.52, 0.35], [0.05, 1.42, -1.9], 36, -2), K(953, [0.45, 1.5, 0.28], [0.05, 1.42, -1.9], 36, -2)],
    act(f) { const out = [];
      const j = P('judge', { pose: 'sit', expr: ex(f, [[859, 'stern'], [900, 'think'], [925, 'stern']]), L: 'hold', R: f > 895 ? 'holdUp' : 'hold', talk: flap(f, 902, 940), look: 0.3 }, [0, 1.95, -7.1], { s: 1.12, blob: false }); if (f > 895) hold(j, 'verdict', 'R', { dz: 0.1 }); out.push(j);
      for (const [x, o] of [[-2.4, { hairStyle: 'bun', hair: '#4a3a36' }], [2.4, { hairStyle: 'spiky', hair: '#2b211c' }]]) out.push(P({ id: 'judgeSide' + x, o: { ...TT.PEOPLE.judge, ...o, moustache: undefined } }, { pose: 'sit', expr: 'bored', L: 'hold', R: 'hold', look: dart(f, x > 0 ? 2 : 5, 0.5) }, [x, 1.95, -7.3], { s: 1.1, blob: false }));
      out.push(P('hana', { expr: ex(f, [[859, 'nervous'], [913, 'shock']]), L: 'hold', R: 'hold', squash: qq(0.02 * Math.sin(f * 0.6)), look: 0, headTilt: sway(f, 7, 3) }, [0.1, 0.15, -1.75]));
      const gallery = [['kenta', -3.4, 1.8], ['guard', -1.8, 1.8], ['salary', 2.0, 1.8], ['student', 3.3, 3.0], ['granpa', -2.6, 3.0], ['courier', -0.9, 4.2], ['police', 1.2, 3.0], ['daughter', 3.0, 4.2]];
      gallery.forEach(([n, x, z], i) => out.push(P(n, { pose: 'sit', expr: f > 905 ? (i % 2 ? 'nervous' : 'think') : (i % 3 ? 'bored' : 'neutral'), L: i % 2 ? 'chin' : 'hold', R: 'hold', look: dart(f, i, 0.5), headTilt: sway(f, i, 3) }, [x, 0.5, z], { s: n === 'student' ? 1 : 1.08, blob: false })));
      return out; },
    props(f) { return { stamp: { p: [0.6, 1.97, -6.3] }, verdict: { v: f > 895 } }; },
    fx(f) { return [...motes(f, [0, 2.6, -2], [4, 2.4, 4], 18, '#fff3c8'), ...sweat(f, [0.1, 1.4, -1.75])]; } },
  // 21 ---- "Prison." — STAMP! She throws her arms up; confetti of joy; the gallery gasps
  { id: 'prison', a: 944, b: 968, dis: 4, set: 'court', light: 'court', cinf: 8, focus: (f) => (f < 952 ? [0.3, 1.97, -6.35] : [0.1, 1.4, -1.75]),
    keys: [K(944, [0.75, 2.45, -5.55], [0.3, 1.96, -6.35], 34, -3), K(949, [0.72, 2.42, -5.6], [0.3, 1.96, -6.35], 34, -3), K(959, [0.55, 1.55, 0.55], [0.05, 1.38, -1.75], 38, 2, 'easeOut'), K(968, [0.5, 1.52, 0.4], [0.05, 1.4, -1.75], 37, 4), K(978, [0.48, 1.51, 0.35], [0.05, 1.4, -1.75], 37, 4)],
    act(f) { const out = [P('hana', { expr: f >= 950 ? 'beam' : 'nervous', L: f >= 950 ? 'up' : 'hold', R: f >= 950 ? 'up' : 'hold', squash: f >= 950 && f < 956 ? -0.05 : 0, headTilt: f > 950 ? 6 * Math.sin(f * 0.5) : 0 }, [0.1, 0.15 + (f >= 950 && f < 962 ? 0.12 * Math.sin((f - 950) / 12 * Math.PI) : 0), -1.75])];
      out.push(P('judge', { pose: 'sit', expr: 'stern', L: 'hold', R: 'hold' }, [0, 1.95, -7.1], { s: 1.12, blob: false }));
      out.push(P('police', { pose: 'sit', expr: f > 952 ? 'shock' : 'bored', L: 'mouth', R: 'hold' }, [1.2, 0.5, 3.0], { s: 1.08, blob: false }));
      return out; },
    props(f) { const down = f < 949 ? 1 - E.easeIn(ramp(f, 944, 949)) : ramp(f, 951, 958) * 0.8; return { stamp: { p: [0.3, 1.97 + down * 0.35, -6.35] }, verdict: { p: [0.3, 1.965, -6.32], r: [-Math.PI / 2, 0, 0.1], v: true }, stampMark: { v: f >= 949 } }; },
    fx(f) { return [...burst(f, 949, [0.3, 2.0, -6.3], 8, { s: 0.035, spread: 0.3, up: 0.05, flat: true, c: '#e2453c', t: 'spark', face: true }), ...burst(f, 952, [0.1, 1.9, -1.7], 10, { t: 'confetti', s: 0.04, spread: 0.7, up: 0.3, dur: 18 }), ...hearts(f, 953, [0.1, 1.8, -1.6], 3, 16), ...spark(f, 955, [-0.35, 1.95, -1.7], 0.06)]; } },
  // 22 ---- "At first it's strange." — new uniform, blanket in her arms, looking around the cell block
  { id: 'strange', a: 969, b: 1007, dis: 8, set: 'prison', light: 'prison', cinf: 7, focus: [106.7, 1.3, 0.5],
    keys: [K(969, [102.8, 1.5, 2.8], [107.2, 1.1, 0.3], 42, -3), K(985, [104.0, 1.36, 2.2], [107.0, 1.1, 0.4], 38, 1, 'easeOut'), K(1007, [104.45, 1.33, 1.92], [107.0, 1.12, 0.4], 37, 3), K(1017, [104.55, 1.33, 1.88], [107.0, 1.12, 0.4], 37, 3)],
    act(f) { const h = P('hanaIn', { expr: ex(f, [[969, 'think'], [990, 'nervous']]), look: dart(f, 3, 0.9), L: 'hold', R: 'hold', headTilt: sway(f, 3, 4) }, [106.7, 0.02, 0.5]); hold(h, 'prisonBlanket', 'R', { u: [300, 640], dz: 0.1 });
      return [h, P('warden', { expr: 'smile', walk: wk(f, 0.04), L: 'hang', R: 'hang' }, [109.5, 0.02, lerp(-1.5, 0.2, ramp(f, 969, 1007))], { s: 1.1 }),
        P('inmateA', { expr: 'smile', walk: wk(f, 0.04), L: 'hold', R: 'hang' }, [lerp(113, 111, ramp(f, 969, 1007)), 0.02, -3.2]), P('inmateB', { expr: 'laugh', L: 'wave', R: 'hip', talk: flap(f, 975, 1000) }, [104.6, 0.02, -3.4])]; },
    props() { return { bars: { p: [0, 0, 10.4] } }; },
    fx(f) { return [...sweat(f, [106.7, 1.24, 0.5]), ...motes(f, [106, 2, 0], [3, 2, 2])]; } },
  // 23 ---- "The doors lock behind you." — the bar gate slides shut, CLANK, the key turns
  { id: 'lock', a: 1008, b: 1045, dis: 5, set: 'prison', light: 'prison', cinf: 7, focus: (f) => (f < 1030 ? [107.6, 1.4, 0.6] : [107.0, 1.3, 0.6]),
    keys: [K(1008, [105.0, 1.45, 2.6], [107.9, 1.35, 0.8], 40, 3), K(1022, [105.5, 1.38, 2.0], [107.7, 1.3, 0.8], 37, -1, 'easeOut'), K(1045, [105.75, 1.34, 1.75], [107.6, 1.28, 0.7], 36, -3), K(1055, [105.8, 1.34, 1.72], [107.6, 1.28, 0.7], 36, -3)],
    act(f) { const w = P('warden', { expr: ex(f, [[1008, 'smile'], [1026, 'neutral']]), L: f > 1026 ? { a: 'holdUp', b: 'point', t: 0.4 } : 'hang', R: 'hip', look: -0.6 }, [108.7, 0.02, 1.6], { s: 1.1 }); if (f > 1026) hold(w, 'key', 'L', { dz: 0.08, rz: qq(ramp(f, 1030, 1040) * 1.6) });
      return [P('hanaIn', { expr: ex(f, [[1008, 'neutral'], [1024, 'shock'], [1036, 'nervous']]), look: f > 1024 ? 1 : 0, L: 'hold', R: 'hold', squash: f >= 1026 && f < 1031 ? 0.05 : 0 }, [107.0, 0.02, 0.55]), w]; },
    props(f) { return { bars: { p: [0, 0, 10.4 * (1 - eo(ramp(f, 1011, 1026)))] }, prisonBlanket: { v: false } }; },
    fx(f) { return [...burst(f, 1026, [108.0, 1.6, 0.9], 8, { t: 'spark', s: 0.04, spread: 0.5, face: true, c: '#ffffff' }), ...bang(f, 1027, [107.0, 2.0, 0.55], 0.1)]; } },
  // 24 ---- "But then breakfast arrives, hot, at seven." — the tray slides in, steam rises, tilt up to the clock: 7:00
  { id: 'breakfast', a: 1046, b: 1119, dis: 8, set: 'prison', light: 'prison', cinf: 8, focus: (f) => (f < 1098 ? [125, 0.95, -2.7] : [125, 2.9, -5.95]),
    keys: [K(1046, [123.5, 1.45, 0.3], [125, 0.95, -2.6], 42, 3), K(1062, [124.6, 1.25, -0.55], [125, 0.95, -2.5], 38, -1, 'easeOut'), K(1092, [124.9, 1.18, -0.95], [125, 0.92, -2.5], 36, 2), K(1104, [125.0, 1.62, -1.6], [125, 2.82, -5.9], 36, -2, 'easeOut'), K(1119, [125.05, 1.66, -1.85], [125, 2.86, -5.9], 35, 2), K(1129, [125.06, 1.67, -1.9], [125, 2.86, -5.9], 35, 2)],
    act(f) { const out = [P('hanaIn', { pose: 'sit', expr: ex(f, [[1046, 'neutral'], [1072, 'shock'], [1089, 'beam'], [1104, 'smile']]), L: 'hold', R: f > 1089 ? 'holdUp' : 'hold', look: f < 1072 ? 0.8 : 0, headTilt: sway(f, 8, 3) }, [125, 0.48, -2.95])];
      const ts = ramp(f, 1062, 1074); out.push(P('inmateC', { expr: 'grin', L: 'hold', R: { a: 'hold', b: 'point', t: qq(ts) }, walk: f < 1062 ? wk(f, 0.05) : undefined }, [lerp(127.8, 126.4, ramp(f, 1046, 1062)), 0.02, -1.35]));
      out.push(P('inmateA', { pose: 'sit', expr: ex(f, [[1046, 'smile'], [1080, 'laugh']]), L: 'hold', R: 'hold', talk: flap(f, 1080, 1100) }, [123.9, 0.48, -2.95]), P('inmateB', { pose: 'sit', expr: 'beam', L: 'hold', R: 'holdUp' }, [126.1, 0.48, -2.95]));
      return out; },
    props(f) { const t = eo(ramp(f, 1062, 1072)); return { tray: { p: [lerp(126.6, 125.0, t), 0.82, -2.35] }, cafClock: {} }; },
    fx(f) { const tx = lerp(126.6, 125.0, eo(ramp(f, 1062, 1072))); return [...(f > 1070 ? [...steam(f, [tx - 0.12, 0.9, -2.25], 4, 0.22, 0.022), ...steam(f + 13, [tx + 0.06, 0.88, -2.24], 4, 0.2, 0.02)] : []), ...steam(f, [133, 1.5, -1], 4, 0.6, 0.06), ...spark(f, 1108, [125.3, 3.25, -5.9], 0.08), ...burst(f, 1106, [125, 2.9, -5.85], 8, { t: 'note', s: 0.05, spread: 0.6, c: '#2b1f1c', face: true, dur: 16 })]; },
    flags: { cafH: 7.0 } },
  // 25 ---- "Someone checks your blood pressure." — macro on the gauge, needle bounces; the nurse gives a thumbs-up
  { id: 'bp', a: 1120, b: 1166, dis: 6, set: 'prison', light: 'prison', cinf: 9, focus: (f) => (f < 1136 ? [138.7, 0.9, -4.55] : [138.4, 1.0, -3.8]),
    keys: [K(1120, [138.78, 1.02, -4.12], [138.7, 0.9, -4.55], 30, -3), K(1138, [139.45, 1.36, -1.6], [138.55, 1.0, -3.85], 38, 2, 'easeOut'), K(1166, [139.62, 1.33, -1.48], [138.55, 1.0, -3.85], 37, -2), K(1176, [139.66, 1.33, -1.45], [138.55, 1.0, -3.85], 37, -2)],
    act(f) { const h = P('hanaIn', { pose: 'sit', expr: ex(f, [[1120, 'neutral'], [1146, 'smile'], [1153, 'beam']]), L: 'hang', R: 'hold', look: 0.6 }, [138.0, 0.48, -3.8]); hold(h, 'cuff', 'L', { u: [300 - 76, SITY - 225 + 110], dz: 0.06 });
      const n = P('nurse', { expr: ex(f, [[1120, 'neutral'], [1150, 'grin']]), L: 'hold', R: f >= 1150 ? 'thumb' : 'hold', talk: flap(f, 1135, 1148), look: -0.6 }, [139.05, 0.02, -3.6], { s: 1.08 });
      return [h, n]; },
    props(f) { const t = (f - 1124); const ang = t < 0 ? 0 : t < 14 ? -2.4 * eo(t / 14) : -1.4 - 1.0 * Math.exp(-(t - 14) * 0.15) * Math.cos((t - 14) * 0.7); return { bp: { p: [138.7, 0.79, -4.55] }, bpNeedle: { r: [0, 0, ang] } }; },
    fx(f) { return [...hearts(f, 1152, [139.05, 1.75, -3.6], 3, 18), ...spark(f, 1146, [138.7, 0.95, -4.48], 0.04)]; } },
  // 26 ---- "A guard holds your arm on the stairs." — tilt up as they climb together
  { id: 'stairs', a: 1167, b: 1220, dis: 6, set: 'prison', light: 'prison', cinf: 7, focus: (f) => [lerp(148.2, 149.7, ramp(f, 1167, 1220)), lerp(1.3, 2.3, ramp(f, 1167, 1220)), -3.5],
    keys: [K(1167, [146.2, 0.95, -1.4], [148.5, 1.25, -3.6], 42, 3), K(1185, [146.7, 1.35, -1.85], [149.0, 1.7, -3.6], 38, -1, 'easeOut'), K(1220, [147.05, 1.75, -2.0], [149.7, 2.2, -3.6], 37, 2), K(1230, [147.1, 1.8, -2.02], [149.8, 2.25, -3.6], 37, 2)],
    act(f) { const t = ramp(f, 1170, 1220), x = lerp(148.15, 149.8, t), y = 0.19 * (Math.floor((x - 148) / 0.32 + 0.5) + 1) - 0.02;
      return [P('hanaIn', { expr: ex(f, [[1167, 'neutral'], [1185, 'smile']]), walk: wk(f, 0.03), L: 'hang', R: 'hold', look: 0.5 }, [x, y, -3.45]),
        P('warden', { expr: 'smile', walk: wk(f + 7, 0.03), L: 'hold', R: 'hang', look: -0.6 }, [x - 0.25, 0.19 * (Math.floor((x - 0.25 - 148) / 0.32 + 0.5) + 1) - 0.02, -3.85], { s: 1.1 })]; },
    fx(f) { return [...motes(f, [149, 2.2, -3.4], [1.6, 2, 1])]; } },
  // 27 ---- "In the workshop you fold paper bags beside women who know your name." — dolly down the bench; bags fold; "HANA!" and hearts
  { id: 'workshop', a: 1221, b: 1327, dis: 6, set: 'prison', light: 'prison', cinf: 7, focus: [168.9, 0.95, -3.0],
    keys: [K(1221, [164.6, 1.28, -0.55], [166.6, 0.95, -2.8], 40, -3), K(1262, [167.4, 1.2, -0.7], [168.9, 0.95, -2.8], 38, 1), K(1284, [167.9, 1.22, -0.75], [168.95, 0.95, -2.85], 36, -1, 'easeOut'), K(1305, [168.2, 1.38, -0.2], [169.3, 1.0, -3.0], 40, 2, 'easeOut'), K(1327, [168.4, 1.4, -0.05], [169.3, 1.0, -3.0], 41, -2), K(1337, [168.45, 1.4, 0.0], [169.3, 1.0, -3.0], 41, -2)],
    act(f) { const out = []; const hi = f >= 1290;
      const fold = qq(0.5 + 0.5 * Math.sin(f * 0.35));
      out.push(P('hanaIn', { pose: 'sit', expr: ex(f, [[1221, 'neutral'], [1258, 'think'], [1290, 'smugsmile'], [1310, 'beam']]), L: { a: 'hold', b: 'holdUp', t: f < 1290 ? fold : 0 }, R: { a: 'hold', b: 'holdUp', t: f < 1290 ? qq(1 - fold) : 0.2 }, look: hi ? 0 : 0.3 }, [168.9, 0.48, -3.05]));
      const ws = [['inmateA', 167.75, -1], ['fumiko', 170.05, 1], ['inmateB', 171.2, 1], ['inmateC', 166.6, -1]];
      ws.forEach(([n, x, s], i) => out.push(P(n, { pose: 'sit', expr: hi ? (i % 2 ? 'beam' : 'laugh') : 'neutral', L: hi && i < 2 ? 'wave' : 'hold', R: 'hold', talk: flap(f, 1296 + i * 2, 1318), look: hi ? -s * 0.8 : dart(f, i, 0.4) }, [x, 0.48, -3.05])));
      for (const [n, x] of [['inmateA', 173.5], ['inmateC', 164.3]]) out.push(P({ id: n + 'bg', o: { ...TT.PEOPLE[n], num: '7' + (x | 0) % 10 } }, { pose: 'sit', expr: 'smile', L: 'hold', R: 'hold' }, [x, 0.48, -3.05]));
      return out; },
    props(f) { const t = eo(ramp(f, 1256, 1272)); return { bag: { p: [168.9, 0.82, -2.35], s: [1, Math.max(0.05, t), 0.2 + 0.8 * t], r: [0, 0.2 * Math.sin(f * 0.1), 0] } }; },
    fx(f) { return [...hearts(f, 1300, [168.9, 1.35, -3.0], 3, 22), ...spark(f, 1272, [168.9, 1.25, -2.3], 0.05), ...burst(f, 1258, [168.9, 0.95, -2.3], 5, { t: 'paper', s: 0.05, spread: 0.3, up: 0.15, c: '#c08a52' }), ...motes(f, [169, 2.2, -2], [4, 2, 2])]; } },
  // 28 ---- "When you cough at night someone asks if you're okay." — blue night dorm; cough puffs; the neighbour sits up
  { id: 'cough', wide: [1.35, 1.55], a: 1328, b: 1404, dis: 8, set: 'prison', light: 'night', cinf: 7, focus: [203.6, 0.65, -2.4],
    keys: [K(1328, [204.6, 1.7, 0.9], [203.4, 0.5, -2.3], 44, -3), K(1345, [203.4, 1.3, 0.3], [203.3, 0.6, -2.35], 40, 1, 'easeOut'), K(1370, [203.7, 1.28, 0.25], [203.75, 0.62, -2.35], 40, -1), K(1404, [204.0, 1.25, 0.2], [203.9, 0.62, -2.35], 40, 2), K(1414, [204.05, 1.25, 0.18], [203.9, 0.62, -2.35], 40, 2)],
    act(f) { const out = []; const cough = f >= 1339 && f < 1352;
      out.push(P('hanaIn', { pose: 'sit', expr: cough ? 'laugh' : ex(f, [[1328, 'sleepy'], [1352, 'nervous'], [1385, 'smile']]), talk: cough ? 1 : 0, squash: cough ? 0.03 * Math.sin(f * 2) : 0, L: cough ? 'mouth' : 'hold', R: 'hold', look: f > 1365 ? 0.8 : 0 }, [202.9, 0.2, -2.35]));
      const up = eo(ramp(f, 1358, 1372)); out.push(P('fumiko', { pose: 'sit', expr: f < 1360 ? 'sleepy' : ex(f, [[1360, 'nervous'], [1390, 'smile']]), talk: flap(f, 1375, 1398), R: f > 1372 ? 'point' : 'hold', L: 'hold', look: -0.8 }, [204.8, lerp(-0.62, 0.2, up), -2.35]));
      for (const [n, x] of [['inmateA', 201.0], ['inmateB', 206.7], ['inmateC', 208.6]]) out.push(P(n, { pose: 'sit', expr: 'sleepy', blink: 1, L: 'hold', R: 'hold', squash: qq(0.02 * Math.sin(f * 0.15 + x)) }, [x, -0.62, -2.35]));
      return out; },
    fx(f) { const out = []; for (const f0 of [1339, 1344, 1349]) out.push(...burst(f, f0, [202.95, 0.78, -2.2], 5, { s: 0.04, spread: 0.25, up: 0.15, c: '#e9ecf5' }));
      return [...out, ...motes(f, [204, 1.4, -2], [3, 1.6, 2], 16, '#dfe8ff')]; } },
  // 29 ---- "The woman in the next bed is 89." — whip to Fumiko, waving; her nameplate glints: FUMIKO, 89
  { id: 'neighbor', a: 1405, b: 1465, dis: 5, whip: [0.06, 0, 6], set: 'prison', light: 'night', cinf: 8, focus: [204.8, 0.85, -2.35],
    keys: [K(1405, [204.15, 1.25, -0.55], [204.9, 0.9, -2.4], 38, -3), K(1420, [204.4, 1.18, -0.85], [205.0, 0.95, -2.5], 36, 1, 'easeOut'), K(1446, [204.55, 1.14, -1.0], [205.1, 1.0, -2.6], 35, -2), K(1465, [204.65, 1.12, -1.08], [205.15, 1.0, -2.6], 35, 2), K(1475, [204.7, 1.12, -1.1], [205.15, 1.0, -2.6], 35, 2)],
    act(f) { return [P('fumiko', { pose: 'sit', expr: ex(f, [[1405, 'beam'], [1433, 'laugh'], [1446, 'smugsmile']]), L: { a: 'wave', b: 'up', t: qq(0.5 + 0.5 * Math.sin(f * 0.45)) }, R: f > 1444 ? 'thumb' : 'hold', talk: flap(f, 1410, 1430) }, [204.8, 0.2, -2.35])]; },
    fx(f) { return [...spark(f, 1446, [205.6, 1.28, -3.95], 0.07), ...spark(f, 1452, [205.95, 1.22, -3.95], 0.05), ...motes(f, [205, 1.4, -2], [2, 1.6, 2], 12, '#dfe8ff')]; } },
  // 30 ---- "This is her fifth time in." — pan across her five souvenir photos; each pops in on a beat
  { id: 'fifth', wide: [1.3, 1.9], a: 1466, b: 1506, dis: 5, set: 'prison', light: 'night', cinf: 6, focus: [205.0, 1.6, -3.99],
    keys: [K(1466, [204.15, 1.62, -2.75], [204.35, 1.6, -3.99], 36, -2), K(1506, [205.55, 1.56, -2.8], [205.6, 1.6, -3.99], 36, 2), K(1516, [205.7, 1.56, -2.8], [205.7, 1.6, -3.99], 36, 2)],
    act(f) { const out = [], hairs = ['#2b211c', '#5a4a42', '#8d8794', '#c9c6cf', '#ecebf2'], exps = ['beam', 'smile', 'grin', 'laugh', 'wink'];
      for (let i = 0; i < 5; i++) { const f0 = 1468 + i * 7; if (f < f0) continue; const pop = clamp(E.back(ramp(f, f0, f0 + 6)), 0, 1.2);
        out.push(P({ id: 'fphoto' + i, o: { ...TT.PEOPLE.fumiko, hair: hairs[i], num: String(i + 1) } }, { expr: exps[i], blink: 0, L: i === 4 ? 'thumb' : 'hang', R: i % 2 ? 'hold' : 'hang' }, [204.0 + i * 0.36, 1.457 + (i % 2) * 0.12, -3.962], { s: 0.13 * pop, yaw: 0, blob: false, shadow: false, order: 3 })); }
      return out; },
    fx(f) { const out = []; for (let i = 0; i < 5; i++) out.push(...spark(f, 1468 + i * 7, [204.12 + i * 0.36, 1.72 + (i % 2) * 0.12, -3.9], 0.035, 10)); return out; } },
  // 31 ---- "She tells you she cried..." (part 1) — Fumiko leans in and tells her
  { id: 'tells', wide: [1.35, 1.6], a: 1507, b: 1540, dis: 5, set: 'prison', light: 'night', cinf: 7, focus: [203.85, 0.85, -2.35],
    keys: [K(1507, [203.85, 1.32, 0.15], [203.85, 0.75, -2.4], 40, 2), K(1540, [203.85, 1.22, -0.35], [203.85, 0.78, -2.4], 38, -2), K(1550, [203.85, 1.21, -0.42], [203.85, 0.78, -2.4], 38, -2)],
    act(f) { return [P('fumiko', { pose: 'sit', expr: ex(f, [[1507, 'nervous'], [1528, 'think']]), talk: flap(f, 1512, 1540), L: 'hold', R: 'chin', lean: -6, look: -1 }, [204.75, 0.2, -2.35]),
      P('hanaIn', { pose: 'sit', expr: ex(f, [[1507, 'think'], [1530, 'nervous']]), L: 'hold', R: 'hold', look: 1 }, [202.95, 0.2, -2.35])]; },
    fx(f) { return [...motes(f, [204, 1.4, -2], [3, 1.6, 2], 12, '#dfe8ff')]; } },
  // 32 ---- "...on the day they released her, and it wasn't from joy." — sepia flashback: Fumiko clings to the gate, crying
  { id: 'cried', a: 1541, b: 1622, dis: 8, set: 'prison', light: 'flash', cinf: 7, focus: [-0.3, 1.2, 0.6],
    keys: [K(1541, [1.6, 1.4, 5.0], [0, 1.2, 0.2], 40, 3), K(1562, [1.05, 1.32, 3.6], [-0.2, 1.15, 0.3], 38, -1, 'easeOut'), K(1592, [0.35, 1.26, 2.35], [-0.3, 1.18, 0.45], 35, 2, 'easeOut'), K(1622, [0.22, 1.25, 2.12], [-0.3, 1.18, 0.5], 34, -2), K(1632, [0.2, 1.25, 2.08], [-0.3, 1.18, 0.5], 34, -2)],
    act(f) { const fo = { ...TT.PEOPLE.fumiko, outfit: 'cardigan', top: '#6a9a8a', shirt: '#f4ead2', pants: '#5a4a42' };
      return [P({ id: 'fumikoOut', o: fo }, { expr: ex(f, [[1541, 'nervous'], [1580, 'shock'], [1592, 'nervous']]), L: 'up', R: 'holdUp', talk: flap(f, 1555, 1575), headTilt: 4 * Math.sin(f * 0.5), squash: qq(0.02 * Math.sin(f * 0.9)) }, [-0.35, 0.02, 0.55]),
        P('warden', { expr: ex(f, [[1541, 'smile'], [1580, 'nervous']]), L: 'hip', R: { a: 'point', b: 'hold', t: qq(0.5 + 0.5 * Math.sin(f * 0.2)) }, look: -0.7 }, [0.55, 0.02, -0.6], { s: 1.1 })]; },
    props() { return { gateL: { p: [-3.4, 0, 0] }, gateR: { p: [3.4, 0, 0] } }; },
    fx(f) { return [...tears(f, [-0.35, 1.25, 0.6], 3, 0.45), ...(f > 1588 ? tears(f + 7, [-0.35, 1.25, 0.6], 3, 0.6) : []), ...burst(f, 1595, [-0.35, 1.25, 0.65], 8, { t: 'drop', s: 0.03, spread: 0.35, up: 0.1, c: '#8fd0f5' })]; } },
  // 33 ---- "Then one morning a guard smiles and hands you your old clothes." — morning light; the warden hands over the folded cardigan; Hana's face falls
  { id: 'clothes', wide: [1.35, 1.85], a: 1623, b: 1728, dis: 8, set: 'prison', light: 'morning', cinf: 7, focus: (f) => (f < 1700 ? [203.5, 1.0, -2.0] : [202.95, 0.85, -2.35]),
    keys: [K(1623, [202.2, 1.55, 0.9], [203.3, 0.9, -2.2], 44, -3), K(1648, [202.9, 1.32, 0.1], [203.4, 0.95, -2.0], 38, 1, 'easeOut'), K(1690, [203.2, 1.27, -0.15], [203.45, 0.95, -2.0], 37, -1), K(1728, [203.0, 1.2, -0.6], [203.0, 0.82, -2.3], 35, 2), K(1738, [203.0, 1.2, -0.65], [203.0, 0.82, -2.3], 35, 2)],
    act(f) { const handed = f >= 1705;
      const w = P('warden', { expr: ex(f, [[1623, 'neutral'], [1668, 'smile'], [1680, 'beam']]), L: handed ? 'hang' : 'hold', R: handed ? 'hip' : { a: 'hold', b: 'point', t: qq(ramp(f, 1690, 1704)) }, look: -0.7 }, [203.95, 0.02, -1.75], { s: 1.1 });
      if (!handed) hold(w, 'prisonClothes', 'R', { dz: 0.1 });
      const h = P('hanaIn', { pose: 'sit', expr: ex(f, [[1623, 'smile'], [1690, 'neutral'], [1712, 'bored'], [1720, 'stern']]), L: 'hold', R: 'hold', headTilt: f > 1712 ? -8 : 0, look: f > 1712 ? -0.4 : 0.6 }, [202.95, 0.2, -2.35]);
      if (handed) hold(h, 'prisonClothes', 'R', { u: [300, SITY - 330], dz: 0.12 });
      return [w, h, P('fumiko', { pose: 'sit', expr: f > 1712 ? 'nervous' : 'smile', L: 'hold', R: 'hold', look: -0.8 }, [204.8, 0.2, -2.35])]; },
    fx(f) { return [...spark(f, 1705, [203.3, 1.05, -2.0], 0.05), ...motes(f, [203.5, 1.5, -2], [2.5, 1.6, 2], 18, '#fff1c8'), ...(f > 1715 ? sweat(f, [202.95, 0.85, -2.35]) : [])]; } },
  // 34 ---- "Your sentence is over." — the bars slide open; she walks out in her old cardigan; friends wave, Fumiko cries
  { id: 'over', a: 1729, b: 1765, dis: 6, set: 'prison', light: 'prison', cinf: 7, focus: (f) => [lerp(106.6, 107.6, ramp(f, 1729, 1765)), 1.3, 0.4],
    keys: [K(1729, [110.9, 1.45, 1.6], [107.0, 1.1, 0.35], 42, 3), K(1745, [110.3, 1.38, 1.35], [107.1, 1.1, 0.35], 38, -1, 'easeOut'), K(1765, [110.0, 1.35, 1.2], [107.2, 1.1, 0.35], 37, 2), K(1775, [109.95, 1.35, 1.18], [107.2, 1.1, 0.35], 37, 2)],
    act(f) { const h = P('hana', { expr: ex(f, [[1729, 'bored'], [1753, 'stern']]), walk: f > 1745 ? wk(f, 0.03) : undefined, L: 'hang', R: 'hang', headTilt: -6 }, [lerp(106.4, 107.4, ramp(f, 1745, 1765)), 0.02, 0.35]); hold(h, 'prisonBundle', 'R', { dz: 0.06 });
      return [h, P('fumiko', { expr: 'nervous', L: 'wave', R: 'mouth' }, [104.9, 0.02, -0.9]), P('inmateA', { expr: 'nervous', L: { a: 'wave', b: 'up', t: qq(0.5 + 0.5 * Math.sin(f * 0.5)) }, R: 'hang' }, [104.2, 0.02, 1.4]), P('warden', { expr: 'smile', L: 'hip', R: 'point', look: -0.5 }, [108.8, 0.02, -1.4], { s: 1.1 })]; },
    props(f) { return { bars: { p: [0, 0, 10.4 * eo(ramp(f, 1733, 1750))] } }; },
    fx(f) { return [...tears(f, [104.9, 1.25, -0.85], 2, 0.4), ...burst(f, 1733, [108.0, 1.5, 0.9], 6, { t: 'spark', s: 0.035, spread: 0.4, face: true, c: '#ffffff' })]; } },
  // 35 ---- "You walk out through the gate and the street is exactly as quiet as you left it." — the gate rolls open; crane up: an empty street
  { id: 'gate', a: 1766, b: 1872, dis: 8, set: 'prison', light: 'morning', cinf: 5, focus: (f) => [0, 1.0, lerp(-2.6, 1.8, ramp(f, 1766, 1805))],
    keys: [K(1766, [1.3, 1.55, -6.8], [0, 1.1, 1.5], 42, 2), K(1800, [0.9, 1.5, -5.6], [0, 1.0, 2.0], 40, -1), K(1824, [0.9, 6.7, -3.8], [0, 1.0, 1.8], 44, 2), K(1850, [0.6, 7.6, 4.2], [0, 0.6, 1.6], 46, -1), K(1872, [0.6, 8.0, 8.6], [0, 0.6, 1.8], 46, 2), K(1882, [0.6, 8.1, 9.0], [0, 0.6, 1.8], 46, 2)],
    act(f) { const t = ramp(f, 1768, 1810); const h = P('hana', { expr: ex(f, [[1766, 'neutral'], [1811, 'bored']]), walk: f < 1810 ? wk(f, 0.035) : undefined, L: 'hang', R: 'hang', look: f > 1811 ? dart(f, 9, 1) : 0 }, [0, lerp(0.02, 0.14, ramp(f, 1798, 1806)), lerp(-2.8, 2.0, t)]); hold(h, 'prisonBundle', 'R', { dz: 0.06 }); return [h]; },
    props(f) { const o = eo(ramp(f, 1768, 1790)) * 3.4; return { gateL: { p: [-o, 0, 0] }, gateR: { p: [o, 0, 0] } }; },
    fx(f) { const out = []; for (let k = 0; k < 6; k++) { const t = ((f - 1766) * 0.008 + k / 6) % 1; out.push(FX('leaf', [9 + Math.sin(t * 9 + k) * 1.2 - t * 3, 5 - t * 5, 2.2 + Math.cos(t * 7 + k) * 1.0 + t * 2], 0.09, [t * 6, k, t * 4], ['#d9822b', '#c4452c', '#e6b13a'][k % 3])); }
      const bt = clamp((f - 1815) / 57); out.push(FX('paper', [lerp(-9, 6, bt), 0.25 + Math.abs(Math.sin(bt * 12)) * 0.5, 4.2], 0.3, [bt * 14, bt * 9, bt * 11], '#f4f1ea'));
      return out; } },
  // 36 ---- "Nobody's waiting." — the empty bus stop (2 buses a day); she stands alone
  { id: 'nobody', a: 1873, b: 1906, dis: 5, set: 'prison', light: 'morning', cinf: 5, focus: [-5.4, 1.0, 2.0],
    keys: [K(1873, [-10.2, 0.85, 5.3], [-5.8, 1.0, 1.5], 40, -3), K(1885, [-9.75, 0.92, 4.9], [-5.7, 1.0, 1.5], 38, 0, 'easeOut'), K(1906, [-9.45, 0.95, 4.65], [-5.6, 1.0, 1.5], 37, 3), K(1916, [-9.4, 0.95, 4.6], [-5.6, 1.0, 1.5], 37, 3)],
    act(f) { const h = P('hana', { expr: ex(f, [[1873, 'neutral'], [1890, 'bored']]), look: dart(f, 4, 1), L: 'hang', R: 'hang', headTilt: -5 }, [-5.0, 0.14, 2.1]); hold(h, 'prisonBundle', 'R', { dz: 0.06 }); return [h]; },
    fx(f) { const out = []; for (let k = 0; k < 5; k++) { const t = ((f - 1873) * 0.012 + k / 5) % 1; out.push(FX('leaf', [-6 + Math.sin(t * 9 + k) * 1.5 + t * 2, 3 - t * 3, 2.5 + Math.cos(t * 7 + k)], 0.08, [t * 6, k, t * 4], ['#d9822b', '#c4452c', '#e6b13a'][k % 3])); } return out; } },
  // 37 ---- "Your apartment smells like dust." — door opens, a dust cloud explodes out, she coughs, glances across at the glowing HAPPY MART
  { id: 'dust', a: 1907, b: 1959, dis: 8, set: 'apt', light: 'dusk', cinf: 6, focus: (f) => (f < 1940 ? [3.3, 1.2, 1.6] : [4.15, 1.2, 3.8]),
    keys: [K(1907, [5.4, 1.55, 3.9], [2.6, 1.1, 1.0], 42, 3), K(1924, [5.0, 1.45, 4.5], [2.7, 1.1, 1.1], 40, -1, 'easeOut'), K(1940, [4.6, 1.42, 5.0], [3.2, 1.1, 1.8], 40, 2), K(1955, [2.75, 1.4, 4.9], [13.9, -0.9, 0.0], 34, -2, 'easeOut'), K(1965, [2.7, 1.4, 4.95], [13.9, -0.9, 0.0], 34, -2)],
    act(f) { const back = ramp(f, 1928, 1950); const cough = f >= 1930 && f < 1946;
      const h = P('hana', { expr: f >= 1948 ? 'sly' : cough ? 'laugh' : ex(f, [[1907, 'neutral'], [1922, 'shock']]), talk: cough ? 1 : 0, L: cough ? 'mouth' : 'hang', R: f < 1914 ? { a: 'hang', b: 'point', t: qq(ramp(f, 1907, 1913)) } : 'hang', look: f >= 1948 ? 1 : 0, squash: cough ? 0.03 * Math.sin(f * 2) : 0 }, [lerp(3.3, 4.15, back), 0, lerp(1.6, 3.8, back)]);
      hold(h, 'aptBundle', 'L', { dz: 0.06 }); return [h]; },
    props(f) { return { aptDoor: { r: [0, 1.35 * eo(ramp(f, 1913, 1924)), 0] } }; },
    flags: { dusty: true, tvOff: true },
    fx(f) { const out = [], t0 = 1918; if (f >= t0) { for (let k = 0; k < 34; k++) { const fk = t0 + (k % 7) * 2, t = clamp((f - fk) / 40); if (t <= 0) continue; const a = k * 2.39, r = 0.4 + (k % 5) * 0.35, e = eo(t);
          out.push(FX('puff', [2.5 + e * (1.2 + Math.cos(a) * r * 0.8), 0.4 + (k % 6) * 0.3 + e * (0.5 + Math.sin(a) * 0.3), 0.9 + e * (1.0 + Math.sin(a * 1.7) * r * 1.4)], (0.12 + (k % 4) * 0.05) * (0.3 + e * 1.1) * (1 - Math.max(0, t - 0.8) * 3), [t, k, 0], ['#ddd6ca', '#e9e3d8', '#cfc6b8'][k % 3])); } }
      for (const f0 of [1930, 1936, 1942]) out.push(...burst(f, f0, [lerp(3.3, 4.15, ramp(f, 1928, 1950)), 1.13, lerp(1.6, 3.8, ramp(f, 1928, 1950)) + 0.1], 4, { s: 0.04, spread: 0.2, up: 0.1, c: '#d8d0c2' }));
      return [...out, ...motes(f, [3.0, 1.2, 1.8], [1.2, 1.6, 1.5], 22, '#ffe2b0'), ...spark(f, 1950, [13.9, -0.9, 0.2], 0.4)]; } },
];
for (const s of SHOTS) { s.props = s.props || (() => ({})); s.fx = s.fx || (() => []); s.act = s.act || (() => []); }
export { SHOTS };
const shotIdx = (f) => { for (let i = SHOTS.length - 1; i >= 0; i--) if (f >= SHOTS[i].a) return i; return 0; };
export const layersAt = (f) => { const i = shotIdx(f), S = SHOTS[i]; if (i > 0 && S.dis && f < S.a + S.dis) { const t = (f - S.a + 1) / (S.dis + 1); return [{ S: SHOTS[i - 1], w: 1 }, { S, w: sm(t) }]; } return [{ S, w: 1 }]; };
export const worldAt = (S, f) => { CF = f; return { props: S.props(f), flags: { ...(S.flags || {}) } }; };
export const actorsAt = (S, f, T) => { TT = T; CF = f; return S.act(f); };
export const fxAt = (S, f) => S.fx(f);
