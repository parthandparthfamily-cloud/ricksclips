// "The Dream Job That Keeps Your Passport" — shot plan, timed to the provided word timestamps (work/words.json, 30 fps).
// Every clause gets a story action + a camera move (TIMELINE.md). Coordinates are LOCAL to each set (sets.js adds the origin).
import * as T from './toon.js';
import { CAST } from './cast_sheet.js';
export const FPS = 30, TOTAL = 2458;

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const L3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const sm = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const eo = (t) => { t = clamp(t); return sm(1 - Math.pow(1 - t, 2.2)); }; // fast early, but eased start and settle (no one-frame jumps)
const ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 0.02) => Math.round(x / n) * n;
const A3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const S3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const M3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const len = (a) => Math.hypot(...a);
const dist = (a, b) => len(S3(a, b));
const rngF = (seed) => { let s = (seed * 2654435761) >>> 0 || 7; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const hash = (str) => { let h = 7; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 997; };

// ---------- camera paths: keys {f, p, l, fov, roll, e} ; e = easing INTO this key: o (fast-in, settle), s (smooth), l (linear drift) ----------
const EASE = { o: eo, s: sm, l: (t) => clamp(t), i: (t) => clamp(t) ** 2 };
const K = (f, p, l, fov = 48, e = 'o', roll = 0) => ({ f, p, l, fov, e, roll });
const interp = (a, b, t) => ({ pos: L3(a.p, b.p, t), look: L3(a.l, b.l, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) });
const path = (keys) => (f) => {
  if (f <= keys[0].f) return interp(keys[0], keys[0], 0);
  for (let i = 0; i < keys.length - 1; i++) if (f <= keys[i + 1].f) { const a = keys[i], b = keys[i + 1]; return interp(a, b, EASE[b.e || 'o']((f - a.f) / (b.f - a.f))); }
  const a = keys[keys.length - 2] || keys[0], b = keys[keys.length - 1]; const d = (f - b.f) / Math.max(1, b.f - a.f); return interp(a, b, 1 + d * 0.5);
};

// ---------- lights ----------
const LT = {
  desert: { az: 120, el: 55, sky: '#d6e8f8', ground: '#c8a878', hemi: 1.3, sun: '#fff2dc', sunI: 2.0, fog: '#d8e8f4', fogNear: 300, fogFar: 2600, skyTop: '#3f86d8', skyHor: '#d2e8f6', sat: 1.12, shadowExt: 30, fillI: 0.4 },
  hot: { az: 150, el: 62, sky: '#e2e6ee', ground: '#d0a874', hemi: 1.3, sun: '#fff0cc', sunI: 2.1, fog: '#eadcc4', fogNear: 250, fogFar: 2200, skyTop: '#4a8ad6', skyHor: '#f0e2c8', sat: 1.14, shadowExt: 26, fillI: 0.4 },
  hall: { az: 100, el: 68, sky: '#e8f2fa', ground: '#d8d0c0', hemi: 1.55, sun: '#fff6e6', sunI: 1.3, fog: '#e0ecf6', fogNear: 300, fogFar: 2600, skyTop: '#4a8ee0', skyHor: '#d8ecf8', sat: 1.1, shadowExt: 18, fillI: 0.35 },
  cabin: { az: 200, el: 40, sky: '#f0f4f8', ground: '#c8c0b0', hemi: 1.6, sun: '#fff6e6', sunI: 1.0, fog: '#e8eef4', fogNear: 300, fogFar: 2600, skyTop: '#4a8ee0', skyHor: '#d8ecf8', sat: 1.1, shadowExt: 6, fillI: 0.3 },
  office: { az: 240, el: 50, sky: '#f6ead6', ground: '#c8a888', hemi: 1.45, sun: '#fff0d8', sunI: 1.3, fog: '#e6eef6', fogNear: 400, fogFar: 2600, skyTop: '#3f86d8', skyHor: '#d8eaf6', sat: 1.1, shadowExt: 7, fillI: 0.35 },
  dorm: { az: 60, el: 66, sky: '#e6f0f6', ground: '#c8c0b0', hemi: 1.5, sun: '#fff4e0', sunI: 1.15, fog: '#e0e8f0', fogNear: 300, fogFar: 2600, skyTop: '#4a8ad6', skyHor: '#f0e2c8', sat: 1.1, shadowExt: 8, fillI: 0.3 },
  dormEve: { az: 250, el: 30, sky: '#f6e2cc', ground: '#c8a888', hemi: 1.42, sun: '#ffd8a8', sunI: 1.3, fog: '#f0d8c0', fogNear: 300, fogFar: 2600, skyTop: '#5a78c8', skyHor: '#ffcf9a', sat: 1.12, shadowExt: 8, fillI: 0.3 },
  dormMorn: { az: 20, el: 32, sky: '#fff0dc', ground: '#d0b090', hemi: 1.45, sun: '#ffe2b0', sunI: 1.4, fog: '#f4e6d0', fogNear: 300, fogFar: 2600, skyTop: '#5a96dc', skyHor: '#ffe6c0', sat: 1.1, shadowExt: 8, fillI: 0.3 },
  village: { az: 210, el: 48, sky: '#dfeef8', ground: '#8aa860', hemi: 1.25, sun: '#fff0d4', sunI: 2.0, fog: '#d8e8f2', fogNear: 200, fogFar: 1400, skyTop: '#3f86d8', skyHor: '#d6eaf6', sat: 1.14, shadowExt: 26, fillI: 0.4 },
  archive: { az: 160, el: 60, sky: '#f4ead6', ground: '#b89a72', hemi: 1.45, sun: '#fff0d4', sunI: 1.1, fog: '#efe4d0', fogNear: 300, fogFar: 2600, skyTop: '#8ab4e0', skyHor: '#f0e4d0', sat: 1.1, shadowExt: 7, fillI: 0.35 },
};

// ---------- characters ----------
const KU = 1.2 * 0.00225, SITOFF = (975 - 760) * 0.00225;
const HAND = { hang: [78, -290], hip: [64, -330], wave: [128, -550], up: [100, -590], point: [208, -449], hold: [36, -362], holdUp: [100, -430], staff: [100, -384], chin: [20, -450], mouth: [44, -486], cross: [-26, -384], thumb: [136, -446] };
const blinkAt = (f, seed) => { const per = 52 + (seed * 17) % 41, ph = (f + seed * 13) % per; return ph < 3; };
const dart = (f, seed) => { const k = Math.floor((f + seed * 7) / (18 + seed % 14)); const r = rngF(k * 31 + seed)(); return q((r - 0.5) * 1.2, 0.1); };
const talkAt = (f, ranges) => { for (const [a, b] of ranges) if (f >= a && f <= b) return [1, 0.4, 0, 0.7, 1, 0][Math.floor(f / 2) % 6]; return 0; };
const ex = (f, list) => { let e = list[0][1]; for (const [k, v] of list) if (f >= k) e = v; return e; };
const arm = (a, b, t) => (t <= 0.01 ? a : t >= 0.99 ? b : { a, b, t: q(t) });
// A(f, id, outfit, [x,y,z], rick opts, extra {sit, idle, s, flip, seed, roll, order})
function A(f, id, o, pos, opts = {}, x = {}) {
  const seed = x.seed ?? hash(id); const op = { ...opts };
  if (op.blink === undefined) op.blink = blinkAt(f, seed);
  if (op.look === undefined) op.look = dart(f, seed);
  const idle = x.idle !== false;
  op.headTilt = q((op.headTilt || 0) + (idle ? 2.2 * Math.sin(f * 0.041 + seed) : 0), 0.5);
  if (x.sit) op.pose = 'sit';
  for (const k of ['L', 'R']) if (op[k] && typeof op[k] === 'object') op[k] = { ...op[k], t: q(op[k].t) };
  const sit = !!x.sit, y = pos[1] - (sit ? SITOFF : 0) + (idle ? 0.007 * Math.sin(f * 0.09 + seed) : 0);
  const key = id + JSON.stringify(op);
  return { id, key, o, op, sit, seat: pos[1], x: pos[0], y, z: pos[2], s: x.s || 1, flip: x.flip, roll: (x.roll || 0) + (idle ? 1.1 * Math.sin(f * 0.05 + seed * 1.7) : 0), order: x.order, blob: sit ? false : x.blob, ground: x.ground,
    draw: (g) => { g.translate(300, sit ? 760 : 975); g.scale(1.2, 1.2); T.rick(g, o, op); } };
}
// world position of a hand of actor a, as seen from camera C
function hand(a, C, side = 'R') {
  const pose = a.op[side]; const pn = pose && typeof pose === 'object' ? (pose.t < 0.5 ? pose.a : pose.b) : pose || 'hang';
  let [hx, hy] = HAND[pn] || HAND.hang; const s = (side === 'R' ? 1 : -1) * (a.flip ? -1 : 1);
  if (pose && typeof pose === 'object') { const A_ = HAND[pose.a] || HAND.hang, B_ = HAND[pose.b] || HAND.hang; hx = lerp(A_[0], B_[0], pose.t); hy = lerp(A_[1], B_[1], pose.t); }
  if (pn === 'cross') hx = -hx;
  const d = [a.x - C.pos[0], 0, a.z - C.pos[2]], dl = Math.hypot(d[0], d[2]) || 1, right = [-d[2] / dl, 0, d[0] / dl], tow = [-d[0] / dl, 0, -d[2] / dl];
  const base = a.sit ? a.seat : a.y; const yy = base + (-(hy + (a.sit ? 255 : 0))) * KU * a.s;
  return A3(A3([a.x, yy, a.z], M3(right, s * hx * KU * a.s)), M3(tow, 0.07));
}
const headOf = (a) => [a.x, (a.sit ? a.seat + 0.775 : a.y + 1.46) * 1, a.z];

// ---------- extras ----------
const TOPS = ['#4f7fb8', '#d94a4a', '#3f8a4a', '#e07a3a', '#8a5cc2', '#2f8c92', '#c45a8a', '#f2c14e', '#5a9ec4', '#7a2e3a', '#6a8a3a', '#b8505a'];
const HAIRS = ['#1e1714', '#3a2a22', '#6b4226', '#9a958c', '#2a1d18', '#4a2a1a'];
function EXO(seed, kind) {
  const r = rngF(seed + 101), pick = (a) => a[Math.floor(r() * a.length)];
  const o = { top: pick(TOPS), pants: pick(['#3b3f52', '#2b2f3d', '#5d86b8', '#7a6a52', '#3a4a3a']), shoes: pick(['#2b1f1c', '#5a3a24', '#1d2330']), hair: pick(HAIRS) };
  if (kind === 'work') { o.outfit = pick(['coverall', 'coverall', 'vest']); o.top = pick(['#8fae5a', '#c45a8a', '#5a9ec4', '#e0a03a', '#7a8a96', '#a05a3a', '#4a8a7a']); o.dirt = r() > 0.4; const h = pick(['hardhat', 'cap', 'beanie', null, null]); if (h) { o.hat = h; o.hatCol = pick(['#f5c02e', '#f4f4f2', '#3f6fb0', '#d6403a', '#3f8a4a']); } else o.hairStyle = pick(['curly', 'spiky', 'hair']); if (r() > 0.7) o.moustache = pick(HAIRS); }
  else if (kind === 'vill') { o.outfit = pick(['dress', 'shawl', 'tee', 'polo', 'apron']); o.shawl = pick(['#e0a03a', '#2f8c92', '#d2337a']); o.hairStyle = pick(['bun', 'long', 'curly', 'hair', 'pigtails']); if (r() > 0.75) { o.beard = '#9a958c'; o.hairStyle = 'bald'; } if (r() > 0.8) o.moustache = pick(HAIRS); }
  else { o.outfit = pick(['tee', 'polo', 'suit', 'dress', 'hoodie', 'tee']); o.tie = r() > 0.5 ? pick(['#d6403a', '#1f3f7a']) : null; o.hairStyle = pick(['hair', 'curly', 'bun', 'long', 'spiky']); const h = r() > 0.65 ? pick(['cap', 'fedora', 'beanie', 'flatcap']) : null; if (h) { o.hat = h; o.hatCol = pick(TOPS); } }
  return o;
}
const HERO = CAST.hero.o, HEROW = CAST.heroWork.o, BOSS = CAST.boss.o, BUNK = CAST.bunk.o, MOM = CAST.mom.o, OFF = CAST.officer.o, AGENT = CAST.agent.o;
const OFF2 = { ...OFF, hatCol: '#7a2e3a', top: '#3a7a5a' };

// ---------- fx helpers ----------
const F = (k, p, o = {}) => ({ k, p, ...o });
const burst = (out, k, c, f, f0, n, spd, life, seed, o = {}) => { const age = f - f0; if (age < 0 || age > life) return; const r = rngF(seed); for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, b = (r() - 0.3) * 1.4, v = spd * (0.6 + r() * 0.6); const t = age / 30; const p = [c[0] + Math.cos(a) * Math.cos(b) * v * t, c[1] + Math.sin(b) * v * t - (o.g ?? 0) * t * t, c[2] + Math.sin(a) * Math.cos(b) * v * t]; out.push(F(k, p, { s: (o.s ?? 1) * (1 - age / life * (o.shrink ?? 0.9)), r: [age * 0.3 + i, age * 0.2, i], c: o.cols ? o.cols[i % o.cols.length] : o.c })); } };
const glint = (out, p, f, f0, life = 14, s = 1.2) => { const age = f - f0; if (age < 0 || age > life) return; const k = Math.sin(age / life * Math.PI); out.push(F('spark', p, { s: s * k, r: [0, 0, age * 0.15], face: true })); };
const puffs = (out, c, f, f0, n, seed, o = {}) => { const age = f - f0, life = o.life ?? 22; if (age < 0 || age > life) return; const r = rngF(seed); for (let i = 0; i < n; i++) { const a = r() * 6.28, v = (o.v ?? 1.2) * (0.5 + r() * 0.7); out.push(F(o.k || 'puff', [c[0] + Math.cos(a) * v * age / 30, c[1] + (o.up ?? 0.4) * age / 30 + r() * 0.1, c[2] + Math.sin(a) * v * age / 30], { s: (o.s ?? 0.5) * (0.4 + age / life * 0.9) * (1 - Math.pow(age / life, 3)), c: o.c })); } };
const motes = (out, box, f, n, seed) => { const r = rngF(seed); for (let i = 0; i < n; i++) { const x = box[0] + r() * (box[3] - box[0]), y = box[1] + r() * (box[4] - box[1]), z = box[2] + r() * (box[5] - box[2]), ph = r() * 6.28; out.push(F('mote', [x + 0.15 * Math.sin(f * 0.02 + ph), y + 0.12 * Math.sin(f * 0.017 + ph * 2), z + 0.1 * Math.cos(f * 0.023 + ph)], { s: 1.4 })); } };
const fly = (out, c, f, seed, r_ = 0.5) => { const t = f * 0.09 + seed; out.push(F('fly', [c[0] + r_ * Math.cos(t) + 0.1 * Math.sin(t * 3.1), c[1] + 0.15 * Math.sin(t * 1.7), c[2] + r_ * Math.sin(t * 1.3)], { r: [0, -t, 0] })); };
const note = (out, from, to, f, f0, dur, i, s = 1) => { const t = (f - f0) / dur; if (t < 0 || t > 1) return; const p = L3(from, to, sm(t)); p[1] += Math.sin(t * Math.PI) * 0.4; out.push(F('note', p, { r: [Math.sin(f * 0.3 + i) * 0.8, f * 0.2 + i, Math.cos(f * 0.25 + i) * 0.5], s })); };
const sweat = (out, h, f, seed) => { const t = ((f + seed * 9) % 24) / 24; out.push(F('drop', [h[0] + 0.32, h[1] + 0.12 - t * 0.35, h[2] + 0.05], { s: 1.6 })); };
const zz = (out, h, f, seed) => { for (let i = 0; i < 2; i++) { const t = ((f + i * 24 + seed) % 48) / 48; out.push(F('zz', [h[0] + 0.2 + t * 0.3, h[1] + 0.3 + t * 0.5, h[2]], { s: 1.4 * (0.6 + t * 0.6), face: true })); } };

// ======================================================================= SHOTS
// world-position constants
const PL = (f) => ({ z: 80 - 1.6 * f, y: 3.85 + Math.max(0, 10 - f) * 0.12 });
const HUT = [8.44, 0, 14], WIN = [8.48, 1.6, 14], POSTER = [8.44, 1.7, 15.4];
const DX = -25; const BUNK_X = -22.25, BUNK_Z = 1.7, LOWER = 0.63, UPPER = 1.88;
const ROOMIES = [[-27.75, -3.9, LOWER], [-27.75, -3.9, UPPER], [-27.75, -1.1, LOWER], [-27.75, -1.1, UPPER], [-27.75, 1.7, LOWER], [-27.75, 1.7, UPPER], [-22.25, -3.9, LOWER], [-22.25, -3.9, UPPER], [-22.25, -1.1, LOWER], [-22.25, -1.1, UPPER]];
const KIOSK = [17.1, 1.1, -4], SLOT = [16.92, 1.05, -4];
const roomies = (f, out, mood = 'idle', C) => {
  const acts = ['sleepy', 'laugh', 'bored', 'grin', 'sleepy', 'think', 'smile', 'bored', 'laugh', 'sleepy'];
  ROOMIES.forEach(([x, z, y], i) => {
    let e = acts[i]; if (mood === 'shock') e = i % 3 ? 'shock' : 'grin'; if (mood === 'away') e = f > 2066 + i * 5 ? (i % 2 ? 'bored' : 'sleepy') : 'think';
    const lk = mood === 'away' ? (f > 2066 + i * 5 ? (i % 2 ? -1 : 1) : 0) : undefined;
    const R = e === 'laugh' ? 'up' : e === 'grin' ? 'wave' : (i % 3 === 0 ? 'chin' : 'hang');
    out.push(A(f, 'rm' + i, EXO(40 + i, 'work'), [x, y, z], { expr: e, look: lk, L: i % 4 === 1 ? 'hold' : 'hang', R, talk: e === 'laugh' ? talkAt(f, [[0, 9999]]) * 0.5 : 0 }, { sit: true, flip: mood === 'away' && f > 2066 + i * 5 && i % 2 }));
  });
  [[-25.6, -1.6, 'laugh', 'holdUp'], [-24.4, -1.6, 'think', 'chin']].forEach(([x, z, e, R], i) => out.push(A(f, 'cp' + i, EXO(57 + i, 'work'), [x, 0.45, z], { expr: mood === 'away' && f > 2090 + i * 8 ? 'bored' : mood === 'shock' ? 'shock' : e, R, L: 'hold', look: mood === 'away' && f > 2090 + i * 8 ? (i ? 1 : -1) : undefined }, { sit: true, flip: mood === 'away' && f > 2090 + i * 8 && i === 0 })));
  out.push(A(f, 'rm10', EXO(55, 'work'), [-25.2, 0, -3.6], { expr: mood === 'shock' ? 'shock' : 'bored', R: 'mouth', L: 'hang', look: mood === 'away' && f > 2100 ? -1 : undefined }, { flip: mood === 'away' && f > 2100 }));
};

const SH = [];
const shot = (o) => SH.push(o);

// ---- 1. hook: the plane lands (0–33)
shot({ id: 'land', a: 0, set: 'runway', light: 'desert',
  cam: (f) => { const p = PL(f), c = path([K(0, [6.8, 1.5, 6], [2, 1.6, 2], 40), K(12, [6.6, 1.0, 5.5], [2, 0.7, 2], 40, 's'), K(33, [26, 9, -18], [0, 3, -8], 54), K(50, [27, 9.6, -24], [0, 3.2, -14], 55, 'l')])(f); c.pos[2] += p.z; c.look[2] += p.z; return c; },
  world: (f) => { const p = PL(f); return { planeZ: p.z, planeY: p.y, planePitch: f < 10 ? 0.05 : 0.05 * Math.max(0, 1 - (f - 10) / 10) }; },
  fx: (f) => { const out = []; for (let s0 = 10; s0 < 30; s0 += 2) for (const gx of [-2, 2]) { const z0 = PL(s0).z + 2; puffs(out, [gx, 0.4, z0], f, s0, 2, s0 * 7 + gx, { k: 'smoke', s: 1.3, v: 2.4, up: 1.2, life: 26 }); } return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [2, 1, PL(f).z + 2]), cinf: f < 14 ? 9 : 3 }) });

// ---- 2. cabin: "...shiny desert city" (34–64)
shot({ id: 'cabin', a: 34, set: 'cabin', light: 'cabin', tin: 'dis',
  keys: [K(34, [0.6, 1.8, -4.1], [-1.2, 1.15, -1.4], 50), K(48, [0.3, 1.72, -3.75], [-1.3, 1.2, -1.4], 47), K(70, [0.15, 1.68, -3.55], [-1.33, 1.22, -1.4], 46, 'l')],
  actors: (f, C) => [
    A(f, 'hero', HERO, [-1.32, 0.51, -1.4], { expr: f < 50 ? 'grin' : 'beam', look: f < 46 ? -1 : 0.5, headTilt: f < 46 ? -9 : 0, L: f < 46 ? 'up' : 'hang', R: f >= 52 ? 'thumb' : 'hold' }, { sit: true }),
    A(f, 'pax1', EXO(3, 'trav'), [-0.8, 0.51, -0.45], { expr: 'sleepy', headTilt: 14, blink: true }, { sit: true }),
    A(f, 'pax2', EXO(4, 'trav'), [1.32, 0.51, -2.35], { expr: f > 52 ? 'smile' : 'bored', L: 'hold' }, { sit: true }),
    A(f, 'pax3', EXO(5, 'trav'), [1.32, 0.51, -0.45], { expr: 'think', R: 'chin' }, { sit: true }),
  ],
  fx: (f, C) => { const out = []; zz(out, [-0.8, 1.35, -0.4], f, 3); glint(out, [-1.84, 1.3, -1.25], f, 44, 16, 0.6); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [-1.32, 1.3, -1.4]), cinf: 8 }) });

// ---- 3. terminal: "for the job of your dreams" (65–102) — macro on the contract, pull back under the WELCOME banner
const heroZ3 = (f) => lerp(9.5, 6.8, ramp(f, 65, 112));
const crowdT = (f, out) => {
  const w = (s0) => (f * 0.05 + s0) % 1;
  out.push(A(f, 'tr1', EXO(11, 'trav'), [lerp(-7, 5, ramp(f, 65, 260)), 0, 4.0], { expr: 'smile', walk: q(w(0.1)), R: 'hold' }));
  out.push(A(f, 'tr2', EXO(12, 'trav'), [lerp(4, -8, ramp(f, 60, 300)), 0, 10.5], { expr: 'bored', walk: q(w(0.5)), L: 'mouth' }, { flip: true }));
  out.push(A(f, 'tr3', EXO(13, 'trav'), [3.4, 0, 9.4], { expr: 'grin', R: 'wave', L: 'hold' }));
  out.push(A(f, 'tr4', EXO(14, 'trav'), [-5.2, 0, 8.6], { expr: f % 120 < 60 ? 'smile' : 'beam', R: 'holdUp' }));
  out.push(A(f, 'tr5', EXO(15, 'trav'), [2.2, 0.45, 2.1], { expr: 'bored', R: 'mouth' }, { sit: true }));
};
shot({ id: 'dreams', a: 65, set: 'terminal', light: 'hall', tin: 'dis',
  keys: [K(65, [-1.25, 1.24, 8.55], [-1.27, 1.16, 9.4], 40), K(82, [0.3, 2.0, 0.4], [-1, 2.9, 7.5], 56), K(103, [0.1, 2.15, -0.4], [-1, 3.0, 7.2], 57, 'l')],
  world: () => ({ doors: 1 }),
  actors: (f) => { const out = [A(f, 'hero', HERO, [-1, 0, heroZ3(f)], { expr: 'beam', walk: q((f * 0.045) % 1), R: 'holdUp', L: f >= 86 ? 'wave' : 'hang' })]; crowdT(f, out); return out; },
  fx: (f, C, act) => { const out = []; const h = hand(act[0], C, 'R'); out.push(F('contract', A3(h, [0, 0.12, 0]), { face: true, flat: true, s: 1.4 })); glint(out, A3(h, [0.1, 0.25, -0.05]), f, 70, 18, 0.8); glint(out, A3(h, [-0.1, 0.05, -0.05]), f, 88, 14, 0.6); return out; },
  dof: (f, C) => ({ focus: f < 75 ? 0.9 : dist(C.pos, [-1, 1.5, heroZ3(f)]), cinf: f < 75 ? 12 : 5 }) });

// ---- 4. "The salary is tax-free" (103–147)
shot({ id: 'salary', a: 103, set: 'terminal', light: 'hall', cont: true,
  keys: [K(116, [-1.02, 1.18, 6.05], [-1, 1.06, 6.8], 40), K(128, [0.5, 1.55, 4.2], [-1, 1.65, 6.8], 48), K(150, [0.65, 1.5, 3.9], [-1, 1.6, 6.8], 47, 'l')],
  world: () => ({ doors: 1 }),
  actors: (f) => { const out = [A(f, 'hero', HERO, [-1, 0, 6.8], { expr: ex(f, [[103, 'smile'], [118, 'grin'], [126, 'beam']]), L: f < 125 ? 'hold' : 'up', R: f < 125 ? 'hold' : 'up', look: f < 125 ? 0 : undefined })]; crowdT(f, out);
    out.push(A(f, 'gawk', EXO(16, 'trav'), [0.6, 0, 6.2], { expr: f > 128 ? 'shock' : 'neutral', look: -0.8, R: f > 130 ? 'mouth' : 'hang' })); return out; },
  fx: (f, C, act) => { const out = []; const h = act[0]; const p = f < 125 ? [h.x, 1.0, h.z - 0.1] : A3(hand(h, C, 'R'), [0.27 * (C.pos[0] > h.x ? 1 : -1), 0.15, 0]); out.push(F('payslip', p, { face: true, flat: true, s: 1.5 })); if (f >= 125) burst(out, 'spark', A3(p, [0, 0.1, 0]), f, 125, 10, 2.2, 16, 5, { s: 0.9 }); return out; },
  dof: (f, C) => ({ focus: f < 122 ? dist(C.pos, [-1, 1.06, 6.7]) : dist(C.pos, [-1, 1.5, 6.8]), cinf: f < 122 ? 12 : 6 }) });

// ---- 5. "the housing is free" (148–178): key spins on his finger; orbit
shot({ id: 'housing', a: 148, set: 'terminal', light: 'hall', cont: true,
  keys: [K(156, [-3.6, 1.2, 4.6], [-1, 1.7, 6.8], 46), K(180, [1.6, 1.05, 4.0], [-1, 1.75, 6.8], 46, 's')],
  world: () => ({ doors: 1 }),
  actors: (f) => { const out = [A(f, 'hero', HERO, [-1, 0, 6.8], { expr: ex(f, [[148, 'grin'], [165, 'beam']]), R: 'up', L: 'hip' })]; crowdT(f, out); return out; },
  fx: (f, C, act) => { const out = []; const h = hand(act[0], C, 'R'); out.push(F('key', A3(h, [0, 0.12, 0]), { r: [0, f * 0.5, 0.3], s: 2.2 })); glint(out, A3(h, [0, 0.2, 0]), f, 166, 14, 0.7); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [-1, 1.5, 6.8]), cinf: 6 }) });

// ---- 6. "money to send home every month" (179–236): notes fly up toward the banner, follow them
shot({ id: 'money', a: 179, set: 'terminal', light: 'hall', cont: true,
  keys: [K(190, [0.9, 1.5, 3.8], [-1, 1.6, 6.8], 48), K(212, [0.5, 2.3, 2.4], [-0.6, 4.4, 6.5], 52), K(240, [0.3, 2.7, 1.7], [-0.9, 5.4, 6.1], 54, 'l')],
  world: () => ({ doors: 1 }),
  actors: (f) => { const out = [A(f, 'hero', HERO, [-1, 0, 6.8], { expr: ex(f, [[179, 'grin'], [189, 'laugh'], [215, 'beam']]), L: f >= 188 ? arm('hold', 'up', ramp(f, 188, 194)) : 'hold', R: f >= 188 ? arm('hold', 'up', ramp(f, 188, 194)) : 'hold' })]; crowdT(f, out); return out; },
  fx: (f) => { const out = []; [[189, 0], [207, 1], [221, 2]].forEach(([f0, w]) => { for (let i = 0; i < 9; i++) { const r = rngF(i + w * 20); note(out, [-1 + (r() - 0.5) * 0.4, 1.9, 6.7], [-1 + (r() - 0.5) * 6, 5 + r() * 2.5, 6.3 + (r() - 0.5) * 2], f, f0 + i, 34, i, 1.6); } }); if (f > 222) for (let i = 0; i < 14; i++) { const r = rngF(i + 90); const a = f * 0.03 + i; out.push(F('note', [-1 + Math.cos(a) * (1.5 + r() * 2), 5.2 + r() * 2 + 0.2 * Math.sin(f * 0.1 + i), 6 + Math.sin(a) * 1.2], { r: [f * 0.2 + i, i, f * 0.1], s: 1.6 })); } return out; },
  dof: (f, C) => ({ focus: f < 200 ? dist(C.pos, [-1, 1.5, 6.8]) : dist(C.pos, [-1, 5, 6.2]), cinf: 5 }) });

// ---- 7. "At the airport your new boss greets you with a big smile" (237–320)
const bossX7 = (f) => lerp(5.5, 0.45, eo(ramp(f, 237, 282)));
shot({ id: 'greet', a: 237, set: 'terminal', light: 'hall', cont: true,
  keys: [K(252, [3.2, 1.8, 0.6], [0.4, 1.4, 7], 52), K(276, [2.6, 1.75, 1.2], [0.2, 1.4, 7], 51, 'l'), K(292, [0.5, 1.6, 3.6], [-0.15, 1.45, 7], 46), K(306, [0.75, 1.56, 4.4], [0.45, 1.52, 7], 44), K(322, [0.9, 1.55, 4.6], [0.42, 1.52, 7], 43, 'l')],
  world: () => ({ doors: 1 }),
  actors: (f) => { const bx = bossX7(f); const out = [
    A(f, 'hero', HERO, [-0.6, 0, 6.8], { expr: ex(f, [[237, 'beam'], [262, 'shock'], [282, 'grin']]), R: f > 284 ? 'wave' : 'hang', L: 'hang' }),
    A(f, 'boss', BOSS, [bx, 0, 7.0], { expr: ex(f, [[237, 'grin'], [296, 'beam'], [306, 'grin']]), walk: f < 282 ? q((f * 0.06) % 1) : undefined, L: 'holdUp', R: f >= 276 ? 'up' : 'hang', talk: talkAt(f, [[280, 292]]) }, { flip: true })];
    crowdT(f, out); out.push(A(f, 'part1', EXO(17, 'trav'), [lerp(2.6, 3.6, ramp(f, 250, 270)), 0, 5.6], { expr: f > 256 ? 'shock' : 'neutral', L: 'hang', R: 'mouth' })); out.push(A(f, 'part2', EXO(18, 'trav'), [lerp(1.8, 1.4, ramp(f, 255, 275)), 0, 8.6], { expr: f > 260 ? 'grin' : 'bored' })); return out; },
  fx: (f, C, act) => { const out = []; out.push(F('board', A3(hand(act[1], C, 'L'), [0, 0.25, 0]), { face: true, s: 1.3 })); if (f > 296) burst(out, 'spark', [0.45, 1.5, 6.9], f, 297, 8, 2, 14, 9, { s: 0.6 }); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [bossX7(f), 1.5, 7]), cinf: 6 }) });

// ---- 8. "Let me keep your passport," he says (321–375)
const ppT8 = (f) => sm(ramp(f, 341, 353));
shot({ id: 'keep', a: 321, set: 'terminal', light: 'hall', cont: true,
  keys: [K(331, [0.1, 1.55, 3.9], [-0.1, 1.4, 7], 46), K(338, [0.05, 1.5, 3.95], [-0.1, 1.38, 7], 46, 'l'), K(348, [-0.05, 1.3, 6.0], [-0.08, 1.2, 6.92], 40), K(357, [-0.04, 1.29, 6.05], [-0.06, 1.2, 6.92], 40, 'l'), K(368, [0.4, 1.55, 4.5], [0.15, 1.42, 7], 46), K(378, [0.45, 1.55, 4.4], [0.18, 1.42, 7], 45, 'l')],
  world: () => ({ doors: 1 }),
  actors: (f) => { const out = [
    A(f, 'hero', HERO, [-0.6, 0, 6.8], { expr: ex(f, [[321, 'grin'], [340, 'smile'], [356, 'smile']]), L: f < 356 ? 'holdUp' : 'hang', look: -0.6 }),
    A(f, 'boss', BOSS, [0.45, 0, 7.0], { expr: ex(f, [[321, 'grin'], [350, 'smirk'], [360, 'grin']]), talk: talkAt(f, [[322, 358]]), R: f < 334 ? 'point' : 'holdUp', L: 'hip', look: 0.6 })];
    crowdT(f, out); return out; },
  fx: (f, C, act) => { const out = []; const a = hand(act[0], C, 'L'), b = hand(act[1], C, 'R'); const t = ppT8(f); const p = L3(a, b, t); p[1] += Math.sin(t * Math.PI) * 0.06; out.push(F('passport', A3(p, [0, 0.1, 0]), { face: true, flat: true, s: 1.5, r: [0, 0, (t - 0.5) * 0.4] })); glint(out, A3(p, [0.06, 0.2, 0.02]), f, 346, 14, 0.5); return out; },
  dof: (f, C) => ({ focus: f > 340 && f < 362 ? dist(C.pos, [-0.07, 1.2, 6.9]) : dist(C.pos, [0, 1.45, 7]), cinf: f > 340 && f < 362 ? 14 : 6 }) });

// ---- 9. "For safekeeping" (376–413): into the breast pocket, pat, wink
shot({ id: 'pocket', a: 376, set: 'terminal', light: 'hall', cont: true,
  keys: [K(386, [0.5, 1.25, 4.95], [0.42, 1.12, 7], 42), K(394, [0.52, 1.28, 4.9], [0.42, 1.18, 7], 42, 'l'), K(404, [0.6, 1.55, 4.2], [0.45, 1.5, 7], 45), K(415, [0.65, 1.56, 4.05], [0.45, 1.5, 7], 45, 'l')],
  world: () => ({ doors: 1 }),
  actors: (f) => { const out = [
    A(f, 'boss', BOSS, [0.45, 0, 7.0], { expr: ex(f, [[376, 'grin'], [390, 'wink']]), talk: talkAt(f, [[377, 399]]), R: f < 386 ? 'holdUp' : arm('holdUp', 'hold', ramp(f, 386, 392)), L: f > 396 ? 'thumb' : 'hip', look: 0.2 }),
    A(f, 'hero', HERO, [-0.6, 0, 6.8], { expr: 'smile', look: -0.6 })]; crowdT(f, out); return out; },
  fx: (f, C, act) => { const out = []; if (f < 392) { const b = hand(act[0], C, 'R'), t = sm(ramp(f, 384, 392)); const pocket = [0.45 - 0.12, 1.2, 7.0 - 0.03]; const p = L3(b, pocket, t); out.push(F('passport', A3(p, [0, 0.05 - t * 0.15, 0]), { face: true, flat: true, s: 1.5 * (1 - t * 0.3) })); } glint(out, [0.52, 1.58, 6.9], f, 392, 12, 0.5); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [0.45, 1.3, 7]), cinf: 8 }) });

// ---- 10. "And you're thinking: wow, that's actually kind of nice" (414–498)
const bossX10 = (f) => lerp(0.45, 6.5, ramp(f, 416, 500));
shot({ id: 'nice', a: 414, set: 'terminal', light: 'hall', cont: true,
  keys: [K(426, [-0.1, 1.55, 3.3], [-0.3, 1.4, 7], 48), K(439, [-0.15, 1.55, 3.45], [-0.3, 1.4, 7], 48, 'l'), K(450, [-0.6, 1.5, 4.6], [-0.6, 1.48, 6.8], 44), K(462, [-0.55, 1.5, 4.7], [-0.6, 1.48, 6.8], 44, 'l'), K(500, [1.9, 1.42, 4.9], [-0.4, 1.46, 6.9], 46, 's')],
  world: () => ({ doors: 1 }),
  actors: (f) => { const out = [
    A(f, 'hero', HERO, [-0.6, 0, 6.8], { expr: ex(f, [[414, 'think'], [440, 'shock'], [452, 'beam'], [470, 'smugsmile'], [484, 'beam']]), R: f < 440 ? 'chin' : f < 470 ? 'up' : 'thumb', L: f < 440 ? 'hang' : 'hip', headTilt: f > 484 ? 6 : 0 }),
    A(f, 'boss', BOSS, [bossX10(f), 0, lerp(7, 9, ramp(f, 416, 500))], { expr: f > 470 ? 'smirk' : 'grin', walk: q((f * 0.05) % 1), R: f > 440 ? 'wave' : 'hold', L: 'hip' }, { flip: false })];
    crowdT(f, out); out.push(A(f, 'thumb', EXO(19, 'trav'), [lerp(-4, -2.2, ramp(f, 430, 470)), 0, 8.2], { expr: 'grin', R: f > 465 ? 'thumb' : 'hang', walk: f < 470 ? q((f * 0.05) % 1) : undefined })); return out; },
  fx: (f) => { const out = []; if (f >= 484) burst(out, 'heart', [-0.6, 2.0, 6.8], f, 484, 5, 1.0, 14, 11, { s: 1.4, shrink: 0.5 }); if (f > 440 && f < 470) burst(out, 'spark', [-0.6, 1.9, 6.8], f, 441, 6, 1.6, 14, 12, { s: 0.6 }); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [-0.6, 1.5, 6.8]), cinf: 7 }) });

// ---- 11. "At first it's paradise" (499–546): speed whip into the mall, ride the escalator up
const escU = (f) => lerp(0.12, 0.62, ramp(f, 499, 560));
const escP = (u) => [-4, u * 5.1, 5 - u * 10];
shot({ id: 'paradise', a: 499, set: 'mall', light: 'hall', tin: 'dis', blur: (f) => (f < 509 ? [0.06 * (1 - (f - 499) / 10), 0.005] : [0, 0]),
  cam: (f) => { const h = escP(escU(f)); const c = path([K(499, [10, 4.5, 9], [-2, 2.5, -4], 62), K(514, [3.0, 1.9, 1.4], [0, 1.45, 0], 50), K(560, [2.6, 1.75, 0.5], [0, 1.45, 0], 48, 'l')])(f); c.pos = A3(c.pos, h); c.look = A3(c.look, h); return c; },
  actors: (f) => { const h = escP(escU(f)); const out = [A(f, 'hero', HERO, [h[0], h[1] + 0.06, h[2]], { expr: ex(f, [[499, 'grin'], [517, 'beam']]), L: 'hold', R: f > 517 ? 'up' : 'hold' }, { blob: false })];
    for (let i = 0; i < 4; i++) { const u = escU(f) - 0.16 - i * 0.12; if (u > 0) { const p = escP(u); out.push(A(f, 'esc' + i, EXO(60 + i, 'trav'), [p[0], p[1] + 0.06, p[2]], { expr: ['smile', 'bored', 'grin', 'think'][i], R: i % 2 ? 'mouth' : 'hold' }, { blob: false })); } }
    [[-12.5, 5.25, -10], [-12.5, 5.25, 4], [12.5, 5.25, -4], [6, 0, 7], [9, 0, -2]].forEach((p, i) => out.push(A(f, 'shop' + i, EXO(70 + i, 'trav'), [p[0] + (i > 2 ? Math.sin(f * 0.02 + i) * 1.2 : 0), p[1], p[2] + lerp(-3, 3, ((f * 0.004 + i * 0.3) % 1))], { expr: ['smile', 'grin', 'bored', 'beam', 'think'][i], walk: q((f * 0.05 + i * 0.3) % 1), R: i % 2 ? 'hold' : 'hang' }, { flip: i % 2 })));
    return out; },
  fx: (f, C, act) => { const out = []; out.push(F('bag', hand(act[0], C, 'L'), { s: 1.6, r: [0, 0.3, 0.1 * Math.sin(f * 0.2)] })); if (f <= 517) out.push(F('bag', hand(act[0], C, 'R'), { s: 1.6, c: '#2f8c92', r: [0, -0.3, 0.1 * Math.sin(f * 0.2 + 1)] })); burst(out, 'confetti', A3(escP(escU(522)), [0, 2.6, 0]), f, 522, 26, 3.2, 26, 21, { g: 2, s: 2.2, shrink: 0.2, cols: ['#ff5d8f', '#ffd23f', '#3fd0c8', '#8a5cc2'] }); glint(out, [6, 4.4, 2], f, 510, 16, 1.2); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, A3(escP(escU(f)), [0, 1.5, 0])), cinf: 6 }) });

// ---- 12. "Air-conditioned malls, glass skyscrapers" (547–614)
shot({ id: 'ac', a: 547, set: 'mall', light: 'hall', tin: 'dis',
  keys: [K(547, [-11.6, 8.5, -4.3], [-14.7, 8.85, -6], 44), K(558, [-11.4, 8.4, -4.4], [-14.7, 8.7, -6], 44, 'l'), K(572, [-9.4, 7.0, -3.6], [-12.1, 6.55, -6], 48), K(580, [-9.2, 7.0, -3.5], [-12.1, 6.6, -6], 48, 'l'), K(596, [-8.2, 8.2, -2.2], [-5.5, 22, -16], 62), K(618, [-7.9, 8.8, -2.6], [-4.6, 27, -17], 64, 'l')],
  actors: (f) => [
    A(f, 'hero', HERO, [-12.1, 5.25, -6.2], { expr: f < 565 ? 'beam' : 'smugsmile', blink: f > 560 && f < 590, L: 'up', R: 'up', headTilt: -5 }, { ground: 5.25 }),
    A(f, 'sh2', EXO(80, 'trav'), [-12.4, 5.25, lerp(-1, -4, ramp(f, 547, 614))], { expr: 'smile', walk: q((f * 0.05) % 1), R: 'hold' }, { ground: 5.25 }),
    A(f, 'sh3', EXO(81, 'trav'), [-12.6, 5.25, -9.6], { expr: f > 570 ? 'laugh' : 'grin', L: 'up' }, { ground: 5.25 })],
  fx: (f) => { const out = []; for (const [x, y, z, f0] of [[-6, 24, -30, 586], [6, 30, -60, 594], [-20, 20, -40, 600], [-2, 34, -80, 606]]) glint(out, [x, y, z], f, f0, 14, 6); for (let i = 0; i < 6; i++) { const t = ((f * 0.02 + i / 6) % 1); out.push(F('confetti', [-14.4 + t * 2.5, 8.5 - t * 1.6 + 0.2 * Math.sin(f * 0.3 + i), -6.8 + i * 0.3], { r: [f * 0.3, i, f * 0.2], s: 1.6, c: ['#ff5d8f', '#3fd0c8', '#ffd23f'][i % 3] })); } return out; },
  dof: (f, C) => ({ focus: f < 580 ? dist(C.pos, f < 562 ? [-14.7, 8.8, -6] : [-12.1, 6.7, -6.2]) : 80, cinf: f < 580 ? 7 : 2 }) });

// ---- 13. "and your family back home telling everyone you've made it" (615–688) — village rooftop
const MOMP = [0.6, 6.2, 2.2];
const neighbours = (f, out, cheer) => {
  [[6.2, 0, 6.5], [7.6, 0, 4.4], [-11, 6.2, -2.6], [13.6, 3.6, 0.2], [4.6, 0, 8.4], [9, 0, 8]].forEach((p, i) => { const c = cheer && f > 664 + i * 2; out.push(A(f, 'nb' + i, EXO(90 + i, 'vill'), p, { expr: c ? (i % 2 ? 'laugh' : 'beam') : ['smile', 'think', 'grin', 'smile', 'shock', 'bored'][i], R: c ? 'up' : i % 2 ? 'wave' : 'hang', L: c ? 'up' : 'hang' }, { ground: p[1] })); });
};
shot({ id: 'family', a: 615, set: 'village', light: 'village', tin: 'dis',
  keys: [K(615, [10, 13, 18], [1, 5.5, 0], 56), K(640, [5.4, 8.6, 8.4], [0.6, 7.3, 2.2], 50), K(650, [5.2, 8.5, 8.1], [0.6, 7.3, 2.2], 50, 'l'), K(664, [6.6, 6.3, 10.6], [0.8, 7.2, 2.2], 54), K(690, [6.0, 6.5, 10.2], [0.7, 7.3, 2.2], 54, 'l')],
  actors: (f) => { const out = [A(f, 'mom', MOM, MOMP, { expr: ex(f, [[615, 'smile'], [630, 'grin'], [668, 'beam']]), talk: talkAt(f, [[620, 666]]), L: 'holdUp', R: f < 650 ? 'wave' : 'point' }, { ground: 6.2 })]; neighbours(f, out, true); return out; },
  fx: (f, C, act) => { const out = []; out.push(F('phone', hand(act[0], C, 'L'), { face: true, s: 1.8 })); burst(out, 'confetti', [0.6, 8.0, 2.2], f, 668, 30, 3.5, 24, 31, { g: 2.5, s: 2.5, shrink: 0.2, cols: ['#ff5d8f', '#ffd23f', '#3fd0c8', '#8a5cc2', '#ffffff'] }); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [0.6, 7.6, 2.2]), cinf: 4 }) });

// ---- 14. "Then your first salary comes a little late" (689–749) — payroll shutter slams
const QUEUE = [[7.5, 14], [6.7, 14.35], [5.9, 13.8], [5.1, 14.25], [4.3, 13.85], [3.5, 14.2], [2.7, 13.9]];
shot({ id: 'late', a: 689, set: 'yard', light: 'hot', tin: 'dis',
  keys: [K(689, [6.1, 2.55, 14.9], [8.44, 2.55, 14], 40), K(700, [6.0, 2.5, 15.0], [8.44, 2.5, 14], 40, 'l'), K(714, [1.6, 2.2, 21.5], [6.2, 1.3, 14], 52), K(726, [1.9, 2.1, 21.0], [6.4, 1.3, 14], 52, 'l'), K(736, [5.6, 1.62, 16.3], [7.5, 1.45, 14], 44), K(752, [5.5, 1.6, 16.5], [7.5, 1.45, 14], 44, 'l')],
  world: (f) => ({ shutter: ramp(f, 735, 739) }),
  actors: (f) => { const out = []; QUEUE.forEach(([x, z], i) => out.push(i === 0 ? A(f, 'hero', HEROW, [x, 0, z], { expr: ex(f, [[689, 'grin'], [722, 'smile'], [738, 'shock'], [746, 'nervous']]), R: f < 738 ? 'hold' : 'hang', L: f >= 738 ? 'up' : 'hang', look: 0.8 })
    : A(f, 'q' + i, EXO(100 + i, 'work'), [x, 0, z], { expr: f > 738 ? (i % 2 ? 'shock' : 'angry') : ['bored', 'sleepy', 'bored', 'think', 'sleepy', 'bored'][i % 6], R: i % 3 === 0 ? 'mouth' : 'hang', L: i % 2 ? 'hip' : 'hang', look: 0.8 })));
    return out; },
  fx: (f, C, act) => { const out = []; puffs(out, [8.3, 1.2, 14], f, 738, 5, 7, { s: 0.35, v: 1.6, c: '#e6d2a6' }); for (let i = 0; i < 3; i++) fly(out, [6 - i * 1.4, 1.9, 14.1], f, i * 7, 0.4); if (f > 740) sweat(out, headOf(act[0]), f, 3); return out; },
  dof: (f, C) => ({ focus: f < 708 ? dist(C.pos, [8.44, 2.5, 14]) : dist(C.pos, [7.5, 1.5, 14]), cinf: 6 }) });

// ---- 15. "Paperwork," he says (750–788) — office, the stack topples
shot({ id: 'paperwork', a: 750, set: 'office', light: 'office', tin: 'dis',
  keys: [K(750, [1.7, 1.75, 2.3], [-0.1, 1.2, -1.6], 52), K(762, [1.55, 1.72, 2.1], [-0.1, 1.2, -1.6], 52, 'l'), K(774, [0.95, 1.55, 0.75], [-0.15, 1.15, -1.8], 48), K(792, [0.85, 1.52, 0.6], [-0.2, 1.15, -1.8], 48, 'l')],
  world: (f) => ({ topple: ramp(f, 775, 790), drawer: 0 }),
  actors: (f) => [
    A(f, 'boss', BOSS, [0, 0.59, -2.0], { expr: ex(f, [[750, 'smirk'], [770, 'sly']]), talk: talkAt(f, [[751, 770]]), L: arm('hip', 'up', 0.5 + 0.5 * Math.sin(f * 0.3)), R: f > 772 ? 'point' : arm('hip', 'up', 0.5 + 0.5 * Math.sin(f * 0.3 + 1)) }, { sit: true }),
    A(f, 'hero', HEROW, [-0.75, 0, 0.9], { expr: ex(f, [[750, 'think'], [776, 'shock']]), R: 'hold', look: -0.5 })],
  fx: (f) => { const out = []; puffs(out, [-1.3, 0.9, -0.8], f, 777, 4, 15, { s: 0.25, v: 0.8 }); burst(out, 'paper', [-1.0, 1.1, -0.8], f, 776, 6, 1.6, 20, 19, { g: 1.2, s: 1, shrink: 0 }); out.push(F('mote', [1.1, 1.05 + ((f * 0.01) % 0.3), -0.7], { s: 2 })); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [0, 1.35, -2]), cinf: 6 }) });

// ---- 16. "The second one is late too" (789–840) — dorm calendar flips
const HEROBUNK = [BUNK_X + 0.05, LOWER, BUNK_Z + 0.15];
shot({ id: 'second', a: 789, set: 'yard', light: 'dorm', tin: 'dis',
  keys: [K(789, [-23.4, 2.0, -0.55], [-21.6, 2.05, -1.0], 40), K(806, [-23.5, 1.95, -0.5], [-21.6, 2.0, -1.0], 40, 'l'), K(818, [-24.8, 1.5, -0.3], [-22.3, 1.35, 1.6], 50), K(842, [-24.7, 1.45, 0.05], [-22.3, 1.35, 1.7], 49, 'l')],
  world: (f) => ({ calFlip: ramp(f, 794, 806), door: 0 }),
  actors: (f) => { const out = [A(f, 'hero', HEROW, HEROBUNK, { expr: ex(f, [[789, 'smile'], [812, 'nervous']]), look: -0.6, R: f > 815 ? 'chin' : 'hang' }, { sit: true })]; roomies(f, out); return out; },
  fx: (f, C, act) => { const out = []; fly(out, [-23.2, 2.3, -0.8], f, 4, 0.4); if (f > 815) sweat(out, headOf(act[0]), f, 6); return out; },
  dof: (f, C) => ({ focus: f < 812 ? dist(C.pos, [-21.6, 2.05, -1]) : dist(C.pos, headOf({ x: HEROBUNK[0], z: HEROBUNK[2], sit: true, seat: LOWER })), cinf: 7 }) });

// ---- 17. "The job you're doing isn't the job you signed up for" (841–912) — construction site, the contract blows away
const heroP17 = (f) => L3([21, 0, -31], [16.2, 0, -22.5], ramp(f, 841, 912));
shot({ id: 'site', a: 841, set: 'yard', light: 'hot', tin: 'dis',
  keys: [K(841, [14, 3.5, -10], [22, 6, -38], 58), K(872, [14.4, 3.6, -10.8], [22, 5.5, -38], 57, 'l'), K(886, [13.2, 1.9, -15.2], [15.5, 1.8, -23], 52), K(896, [14.3, 1.6, -19.3], [16.2, 1.45, -22.5], 46), K(915, [14.1, 1.6, -19.0], [16.2, 1.45, -22.5], 46, 'l')],
  world: () => ({ cop: null }),
  actors: (f) => { const h = heroP17(f); const out = [A(f, 'hero', HEROW, h, { expr: ex(f, [[841, 'nervous'], [890, 'shock'], [898, 'nervous']]), walk: q((f * 0.04) % 1), L: 'hold', R: 'hold', headTilt: 5 })];
    [[24, -29, 0], [18, -28, 0.3], [12, -20, 0.6]].forEach(([x, z, ph], i) => out.push(A(f, 'wk' + i, EXO(120 + i, 'work'), [x + Math.sin(f * 0.02 + i) * 1.2, 0, z], { expr: ['bored', 'nervous', 'sleepy'][i], walk: q((f * 0.04 + ph) % 1), L: 'hold', R: 'hold' })));
    out.push(A(f, 'fore', { outfit: 'vest', top: '#5c6b7a', hat: 'hardhat', hatCol: '#f4f4f2', moustache: '#3a2a22', shoes: '#2b1f1c' }, [19.5, 0, -24.5], { expr: f > 860 ? 'angry' : 'stern', R: 'point', L: 'hip', talk: talkAt(f, [[850, 880]]) }));
    return out; },
  fx: (f, C, act) => { const out = []; act.forEach((a, i) => { if (a.id === 'hero' || a.id.startsWith('wk')) { const l = hand(a, C, 'L'), r = hand(a, C, 'R'); out.push(F('bricks', A3(L3(l, r, 0.5), [0, -0.12, 0]), { s: 1.4, r: [0, 0.3, 0] })); } });
    const t = ramp(f, 868, 896); if (t > 0 && t < 1) { const p = L3([24, 4, -36], [13.6, 2.0, -16.4], sm(t)); p[1] += Math.sin(t * 6) * 0.5; out.push(F('contract', p, { r: [f * 0.25, f * 0.1, f * 0.18], s: 2.4 })); }
    puffs(out, [12, 0.3, -18], f, 850, 3, 3, { s: 0.6, life: 40, c: '#e6d2a6' }); puffs(out, [20, 0.2, -26], f, 875, 3, 4, { s: 0.5, life: 30, c: '#e6d2a6' }); if (f > 896) sweat(out, headOf(act[0]), f, 2); return out; },
  dof: (f, C) => ({ focus: f < 880 ? 20 : dist(C.pos, A3(heroP17(f), [0, 1.4, 0])), cinf: f < 880 ? 2 : 6 }) });

// ---- 18. "and the room you were promised has eleven other guys in it" (913–994)
const heroP18 = (f) => (f < 958 ? [-25.3, 0, 7.4] : L3([-25.0, 0, 6.6], [-24.6, 0, 3.3], ramp(f, 958, 985)));
shot({ id: 'room', a: 913, set: 'yard', light: 'dorm', tin: 'dis',
  keys: [K(913, [-23.75, 2.6, 7.3], [-23.9, 2.72, 5.86], 40), K(924, [-23.8, 2.6, 7.45], [-23.9, 2.72, 5.86], 40, 'l'), K(936, [-24.3, 1.85, 10.2], [-24.9, 1.6, 5.7], 52), K(950, [-25.0, 1.75, 4.6], [-25.0, 1.5, 0], 64), K(966, [-25.0, 1.7, 4.4], [-27.0, 1.5, -1.5], 64, 's'), K(996, [-24.9, 1.7, 4.2], [-22.6, 1.5, -1.5], 64, 's')],
  world: (f) => ({ door: ramp(f, 920, 934), calFlip: 1 }),
  actors: (f) => { const out = [A(f, 'hero', HEROW, heroP18(f), { expr: ex(f, [[913, 'grin'], [930, 'shock'], [975, 'nervous']]), walk: f >= 958 ? q((f * 0.04) % 1) : undefined, L: 'hold', R: f < 958 ? 'hang' : 'mouth' })]; roomies(f, out, f > 950 ? 'idle' : 'idle'); return out; },
  fx: (f, C, act) => { const out = []; out.push(F('duffel', A3(hand(act[0], C, 'L'), [0, -0.1, 0]), { s: 1.3, r: [0, 0.4, 0] })); zz(out, [-27.75, 1.5, -3.9], f, 2); zz(out, [-27.75, 1.5, 1.7], f, 9); motes(out, [-27, 0.5, -4, -23, 2.8, 4], f, 30, 7); fly(out, [-25, 2.1, -1], f, 3, 0.6); return out; },
  dof: (f, C) => ({ focus: f < 930 ? dist(C.pos, [-23.9, 2.72, 5.86]) : f < 948 ? dist(C.pos, [-25, 1.6, 6.5]) : 4, cinf: f < 948 ? 7 : 4 }) });

// ---- 19. "So you decide to quit. Easy, right?" (995–1058) — I QUIT slams the desk
shot({ id: 'quit', a: 995, set: 'office', light: 'office', tin: 'dis',
  keys: [K(995, [1.0, 1.7, 2.6], [-0.4, 1.1, -0.6], 50), K(1006, [0.9, 1.65, 2.4], [-0.4, 1.1, -0.6], 50, 'l'), K(1016, [-0.05, 1.38, 0.3], [-0.2, 0.9, -0.75], 42), K(1028, [-0.03, 1.36, 0.25], [-0.2, 0.9, -0.75], 42, 'l'), K(1040, [1.5, 1.5, 2.3], [-0.25, 1.2, -1.0], 50), K(1060, [1.6, 1.52, 2.1], [-0.25, 1.2, -1.0], 50, 'l')],
  world: (f) => ({ letter: f >= 1008 ? ramp(f, 1008, 1017) : 0, topple: 1 }),
  actors: (f) => [
    A(f, 'hero', HEROW, [-0.55, 0, 0.25], { expr: ex(f, [[995, 'stern'], [1017, 'smirk'], [1031, 'grin'], [1044, 'smugsmile']]), R: f < 1008 ? 'holdUp' : f < 1020 ? 'hold' : f > 1040 ? 'thumb' : 'hip', L: 'hip' }),
    A(f, 'boss', BOSS, [0.1, 0.59, -2.0], { expr: ex(f, [[995, 'smirk'], [1018, 'shock'], [1030, 'sly'], [1044, 'laugh']]), L: 'chin', R: 'chin', talk: f > 1044 ? talkAt(f, [[1044, 1058]]) * 0.6 : 0 }, { sit: true })],
  fx: (f, C, act) => { const out = []; if (f < 1008) out.push(F('paper', A3(hand(act[0], C, 'R'), [0, 0.1, 0]), { face: true, flat: true, s: 1.3 })); puffs(out, [-0.2, 0.9, -0.75], f, 1017, 6, 33, { s: 0.04, v: 0.5, c: '#efe6d2' }); burst(out, 'paper', [-0.6, 1.0, -0.8], f, 1018, 4, 1.2, 18, 41, { g: 1, s: 0.7, shrink: 0 }); return out; },
  dof: (f, C) => ({ focus: f > 1010 && f < 1032 ? dist(C.pos, [-0.2, 0.9, -0.75]) : dist(C.pos, [-0.2, 1.3, -1]), cinf: f > 1010 && f < 1032 ? 12 : 6 }) });

// ---- 20. "Except your visa is tied to him, and so is your right to stay in the country" (1059–1167) — the VISA chain
const heroX20 = (f) => lerp(-1.0, -0.62, eo(ramp(f, 1097, 1105))) + lerp(0, 0.28, eo(ramp(f, 1136, 1144)));
const heroZ20 = (f) => lerp(0.7, 0.35, eo(ramp(f, 1097, 1105))) + lerp(0, -0.25, eo(ramp(f, 1136, 1144)));
shot({ id: 'visa', a: 1059, set: 'office', light: 'office', tin: 'dis',
  keys: [K(1059, [-0.55, 1.0, 1.75], [-1.05, 0.82, 0.7], 40), K(1070, [-0.5, 1.02, 1.8], [-1.0, 0.85, 0.7], 40, 'l'), K(1084, [1.7, 1.75, 2.9], [-0.25, 1.1, -0.6], 54), K(1108, [1.8, 1.7, 2.7], [-0.25, 1.1, -0.6], 53, 'l'), K(1122, [-2.4, 1.6, 1.9], [0, 1.15, -1.0], 52), K(1140, [-2.2, 1.55, 1.7], [0, 1.15, -1.0], 51, 'l'), K(1152, [0.2, 1.55, 0.6], [0.45, 1.42, -1.9], 50), K(1170, [0.25, 1.55, 0.5], [0.45, 1.42, -1.9], 49, 'l')],
  world: (f) => ({ topple: 1, letter: 1 }),
  actors: (f) => [
    A(f, 'hero', HEROW, [heroX20(f), 0, heroZ20(f)], { expr: ex(f, [[1059, 'think'], [1083, 'shock'], [1100, 'nervous'], [1138, 'shock'], [1146, 'nervous']]), L: 'hang', R: 'mouth', look: 0.5 }),
    A(f, 'boss', BOSS, [0.45, 0, -1.95], { expr: ex(f, [[1059, 'smirk'], [1094, 'sly'], [1110, 'smirk'], [1148, 'sly']]), R: (f >= 1095 && f < 1100) || (f >= 1134 && f < 1139) ? 'hip' : 'holdUp', L: 'hip' }, { flip: true })],
  fx: (f, C, act) => { const out = []; const h = headOf(act[0]); if (f > 1100) sweat(out, h, f, 8); glint(out, A3(hand(act[1], C, 'R'), [0, 0.1, 0]), f, 1098, 10, 0.4); return out; },
  chain: (f, C, act) => ({ a: hand(act[0], C, 'L'), b: hand(act[1], C, 'R'), n: 26, sag: (f >= 1095 && f < 1104) || (f >= 1134 && f < 1143) ? 0.02 : 0.3 }),
  dof: (f, C) => ({ focus: f < 1076 ? dist(C.pos, [-1.05, 0.82, 0.7]) : dist(C.pos, [0, 1.3, -0.8]), cinf: f < 1076 ? 11 : 6 }) });

// ---- 21. "If you just walk out he can report you for absconding, and suddenly you're the criminal" (1168–1290)
const heroP21 = (f) => L3([-15, 0, 15], [-7.2, 0, 21.6], ramp(f, 1168, 1250));
const copP = (f) => { const t = eo(ramp(f, 1228, 1262)); const p = L3([22, 0, -6], [-11.5, 0, 17.5], t); return [p[0], p[2], Math.atan2(-11.5 - 22, 17.5 + 6)]; };
shot({ id: 'abscond', a: 1168, set: 'yard', light: 'hot', tin: 'dis',
  cam: (f) => { if (f < 1199) { const h = heroP21(f); return { pos: A3(h, [3.6 - (f - 1168) * 0.01, 1.3, 3.4]), look: A3(h, [0, 1.15, 0]), fov: 50, roll: 0 }; }
    const h0 = heroP21(1198); return path([K(1198, A3(h0, [3.29, 1.3, 3.4]), A3(h0, [0, 1.15, 0]), 50), K(1210, [3.4, 1.75, 15.3], [7.0, 1.4, 12.2], 48), K(1222, [3.6, 1.75, 15.6], [7.0, 1.4, 12.4], 48, 'l'), K(1233, [6.0, 1.8, 16.6], [8.44, 1.7, 15.4], 44), K(1246, [5.9, 1.8, 16.7], [8.44, 1.7, 15.3], 44, 'l'), K(1258, [-3.0, 1.55, 26.8], [-7.2, 1.4, 21.6], 52), K(1292, [-2.6, 1.6, 27.4], [-7.4, 1.4, 21.4], 50, 'l')])(f); },
  blur: (f) => (f >= 1199 && f < 1206 ? [0.05, 0] : f >= 1248 && f < 1255 ? [-0.05, 0] : [0, 0]),
  world: (f) => ({ poster: eo(ramp(f, 1225, 1231)), cop: f > 1226 ? copP(f) : null, gate: 0 }),
  actors: (f) => { const h = heroP21(f); const frz = f > 1258; const out = [
    A(f, 'hero', HEROW, frz ? [-7.2, 0, 21.6] : h, { expr: frz ? 'shock' : ex(f, [[1168, 'sly'], [1200, 'smirk']]), walk: frz ? undefined : q((f * 0.05) % 1), L: frz ? 'up' : 'hold', R: frz ? 'up' : 'hang', look: frz ? -0.7 : undefined }),
    A(f, 'boss', BOSS, [7.0, 0, 12.2], { expr: ex(f, [[1168, 'smirk'], [1226, 'sly']]), talk: talkAt(f, [[1202, 1246]]), R: 'mouth', L: f > 1225 ? 'point' : 'hip' }, { flip: true }),
    A(f, 'gd', EXO(150, 'work'), [5.2, 0, 17.5], { expr: f > 1235 ? 'shock' : 'bored', L: 'hang', R: f > 1240 ? 'point' : 'hang' })];
    if (f > 1250) out.push(A(f, 'cop1', OFF2, [-9.6, 0, 19.6], { expr: 'stern', R: 'point', L: 'hip', walk: f < 1270 ? q((f * 0.05) % 1) : undefined }));
    return out; },
  fx: (f, C, act) => { const out = []; out.push(F('duffel', A3(hand(act[0], C, 'L'), [0, -0.1, 0]), { s: 1.3, r: [0, 0.4, 0] })); out.push(F('phone', A3(hand(act[1], C, 'R'), [0, 0.05, 0]), { face: true, s: 1.6 })); puffs(out, POSTER, f, 1226, 5, 51, { s: 0.25, v: 0.8 }); if (f > 1258) sweat(out, headOf(act[0]), f, 5); const cp = copP(f); if (f > 1228 && f < 1265) puffs(out, [cp[0], 0.3, cp[1]], f, 1228 + ((f - 1228) >> 2 << 2), 2, f >> 2, { k: 'smoke', s: 0.6, life: 14 }); return out; },
  dof: (f, C) => ({ focus: f < 1199 ? dist(C.pos, A3(heroP21(f), [0, 1.4, 0])) : f < 1250 ? dist(C.pos, [7.5, 1.5, 13]) : dist(C.pos, [-7.2, 1.45, 21.6]), cinf: 6 }) });

// ---- 22. "So you decide to go home instead" (1291–1346) — out through the gate, whip
const heroP22 = (f) => L3([0.3, 0, 44.5], [0.6, 0, 50.5], ramp(f, 1291, 1346));
shot({ id: 'gohome', a: 1291, set: 'yard', light: 'hot', tin: 'dis', blur: (f) => (f >= 1332 ? [0.07 * ramp(f, 1332, 1346), 0] : [0, 0]),
  cam: (f) => { const h = heroP22(f); const k = ramp(f, 1332, 1350) ** 2; return { pos: A3(h, [1.1 - k * 2, 1.65, 3.9 + k * 2]), look: A3(h, [-k * 9, 1.4 + k * 0.5, -k * 3]), fov: 50, roll: k * 6 }; },
  world: () => ({ gate: 0.38, cop: null, poster: 1 }),
  actors: (f) => [A(f, 'hero', HERO, heroP22(f), { expr: ex(f, [[1291, 'smile'], [1320, 'grin']]), walk: q((f * 0.045) % 1), L: 'hold', R: 'hang' }),
    A(f, 'gate', EXO(151, 'work'), [8.4, 0, 53.6], { expr: 'bored', R: f > 1310 ? 'wave' : 'hang', L: 'hang' })],
  fx: (f, C, act) => { const out = [F('duffel', A3(hand(act[0], C, 'L'), [0, -0.1, 0]), { s: 1.3, r: [0, 0.4, 0] })]; puffs(out, [1, 0.2, 49], f, 1300, 3, 61, { s: 0.6, life: 40, v: 2, c: '#e6d2a6' }); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, A3(heroP22(f), [0, 1.4, 0])), cinf: 6 }) });

// ---- 23. "You walk up to the airport counter and the officer asks you one question" (1347–1449)
const heroZ23 = (f) => lerp(-23.6, -32.3, ramp(f, 1347, 1405));
const OFFP = [-4, 0, -34.75];
const queueD = (f, out) => { [[2, -32.8], [2.3, -31.6], [-10, -32.7], [-9.7, -31.2], [-10.2, -30], [-4.3, -22.5]].forEach(([x, z], i) => out.push(A(f, 'dq' + i, EXO(160 + i, 'trav'), [x, 0, z], { expr: ['bored', 'think', 'sleepy', 'bored', 'smile', 'think'][i], R: i % 2 ? 'mouth' : 'hold', L: 'hang' })));
  out.push(A(f, 'off2', OFF2, [2, 0, -34.75], { expr: 'bored', R: 'hold' })); out.push(A(f, 'off3', { ...OFF2, top: '#2f6a8c' }, [-10, 0, -34.75], { expr: 'stern', L: 'hold' })); };
shot({ id: 'counter', a: 1347, set: 'terminal', light: 'hall', tin: 'dis', blur: (f) => (f < 1354 ? [0.07 * (1 - (f - 1347) / 7), 0] : [0, 0]),
  keys: [K(1347, [-2.3, 0.95, -19.5], [-4, 1.2, -29], 52), K(1378, [-2.5, 1.05, -25.2], [-4, 1.3, -31], 52, 'l'), K(1392, [0.7, 2.7, -26.3], [-4, 1.9, -33.6], 50), K(1412, [0.4, 2.6, -26.8], [-4, 1.9, -33.6], 49, 'l'), K(1424, [-3.35, 1.65, -31.4], [-4, 1.55, -34.75], 44), K(1450, [-3.4, 1.63, -31.7], [-4, 1.55, -34.75], 44, 'l')],
  actors: (f) => { const out = [A(f, 'hero', HERO, [-4.05, 0, heroZ23(f)], { expr: ex(f, [[1347, 'grin'], [1400, 'smile'], [1430, 'think']]), walk: f < 1405 ? q((f * 0.045) % 1) : undefined, L: 'hold', R: 'hang' }),
    A(f, 'off', OFF, OFFP, { expr: ex(f, [[1347, 'bored'], [1400, 'stern']]), R: f >= 1427 ? 'up' : 'hold', L: 'hip', look: f > 1400 ? 0.3 : -0.6, talk: talkAt(f, [[1413, 1440]]) * 0.7 })]; queueD(f, out); return out; },
  fx: (f, C, act) => [F('duffel', A3(hand(act[0], C, 'L'), [0, -0.1, 0]), { s: 1.3, r: [0, 0.4, 0] })],
  dof: (f, C) => ({ focus: f < 1415 ? dist(C.pos, [-4, 1.4, heroZ23(f)]) : dist(C.pos, [-4, 1.5, -34.75]), cinf: 6 }) });

// ---- 24. "Passport?" (1450–1472) — hard cut on the word
shot({ id: 'passportQ', a: 1450, set: 'terminal', light: 'hall', tin: 'cut',
  keys: [K(1450, [-3.5, 1.62, -31.2], [-4.1, 1.45, -34.75], 46), K(1474, [-3.55, 1.6, -31.5], [-4.1, 1.45, -34.75], 45, 'l')],
  actors: (f) => { const out = [A(f, 'off', OFF, OFFP, { expr: 'stern', R: 'holdUp', L: 'hip', talk: talkAt(f, [[1451, 1465]]) }), A(f, 'hero', HERO, [-4.75, 0, -32.6], { expr: f > 1456 ? 'shock' : 'think', look: 0.6 })]; queueD(f, out); return out; },
  fx: (f, C, act) => { const out = []; if (f > 1456) sweat(out, headOf(act[1]), f, 1); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [-4, 1.5, -34.75]), cinf: 9 }) });

// ---- 25. "Your passport is sitting in a drawer in your boss's office" (1473–1557) — fly in through the tower window, the drawer slides open
shot({ id: 'drawer', a: 1473, set: 'office', light: 'office', tin: 'dis',
  keys: [K(1473, [0.6, 3.0, -16], [0.8, 0.9, -1.4], 52), K(1500, [0.85, 1.45, -3.35], [0.92, 0.6, -1.4], 44, 's'), K(1514, [0.88, 1.2, -2.75], [0.92, 0.55, -1.6], 42), K(1520, [0.9, 1.18, -2.7], [0.92, 0.55, -1.6], 42, 'l'), K(1534, [1.9, 2.3, -3.7], [0.3, 0.95, -1.4], 56), K(1560, [2.1, 2.4, -3.8], [0.2, 0.95, -1.4], 57, 'l')],
  world: (f) => ({ drawer: eo(ramp(f, 1506, 1516)), topple: 1, letter: 1 }),
  actors: (f) => [A(f, 'boss', BOSS, [-0.15, 0.59, -2.0], { expr: ex(f, [[1473, 'smugsmile'], [1530, 'laugh']]), talk: talkAt(f, [[1525, 1556]]), R: 'mouth', L: 'hip' }, { sit: true })],
  fx: (f, C, act) => { const out = [F('phone', A3(hand(act[0], C, 'R'), [0, 0.05, 0]), { face: true, s: 1.6 })]; glint(out, [0.82, 0.58, -1.75], f, 1514, 16, 0.5); glint(out, [1.02, 0.6, -1.55], f, 1522, 12, 0.35); motes(out, [-1, 0.5, -3.5, 2, 2.5, -1], f, 16, 3); return out; },
  dof: (f, C) => ({ focus: f < 1526 ? dist(C.pos, [0.92, 0.55, -1.6]) : dist(C.pos, [0.3, 1.1, -1.8]), cinf: f < 1526 ? 9 : 5 }) });

// ---- 26. "Every Friday you call your mother and tell her everything's great" (1558–1647)
shot({ id: 'friday', a: 1558, set: 'yard', light: 'dormEve', tin: 'dis',
  keys: [K(1558, [-24.4, 1.55, 0.2], [-22.3, 1.3, 1.75], 47), K(1584, [-24.25, 1.5, 0.45], [-22.3, 1.3, 1.75], 47, 'l'), K(1596, [-23.9, 1.25, 3.5], [-22.3, 1.35, 1.75], 46), K(1610, [-23.85, 1.25, 3.4], [-22.3, 1.35, 1.75], 46, 'l')],
  world: () => ({ calFlip: 1, beam: true }),
  actors: (f) => { const out = [A(f, 'hero', HEROW, HEROBUNK, { expr: ex(f, [[1558, 'grin'], [1596, 'beam'], [1622, 'grin']]), talk: talkAt(f, [[1586, 1640]]), R: 'mouth', L: f > 1632 ? 'thumb' : 'hang' }, { sit: true })]; roomies(f, out); return out; },
  fx: (f, C, act) => { const out = [F('phone', A3(hand(act[0], C, 'R'), [0, 0.05, 0]), { face: true, s: 1.6 })]; fly(out, [-22.8, 1.9, 1.6], f, 6, 0.35); zz(out, [-27.75, 1.5, -1.1], f, 5); const t = (f % 40) / 40; out.push(F('drop', [-28.1, 1.2 - t * 0.3, -4.52], { s: 1.2 })); motes(out, [-26, 1, 0, -23, 2.6, 4], f, 20, 9); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [-22.2, 1.4, 1.85]), cinf: 7 }) });
shot({ id: 'mom', a: 1601, set: 'village', light: 'village', tin: 'dis',
  keys: [K(1601, [3.0, 8.0, 6.0], [0.6, 7.5, 2.2], 48), K(1650, [2.5, 7.85, 5.5], [0.6, 7.45, 2.2], 47, 'l')],
  actors: (f) => { const out = [A(f, 'mom', MOM, MOMP, { expr: ex(f, [[1601, 'smile'], [1622, 'beam'], [1636, 'smugsmile']]), R: 'mouth', L: f > 1630 ? 'chin' : 'hang' }, { ground: 6.2 })]; out.push(A(f, 'nb0', EXO(90, 'vill'), [-11, 6.2, -2.6], { expr: 'smile', R: 'wave' }, { ground: 6.2 })); return out; },
  fx: (f, C, act) => { const out = [F('phone', A3(hand(act[0], C, 'R'), [0, 0.05, 0]), { face: true, s: 1.6 })]; if (f > 1636) burst(out, 'heart', [0.6, 8.2, 2.2], f, 1636, 4, 0.8, 12, 3, { s: 1.4, shrink: 0.4 }); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [0.6, 7.6, 2.2]), cinf: 5 }) });

// ---- 27. "because you still owe the recruitment agent back home more than you've earned" (1648–1741)
const AGP = [25.25, 0, 6.4], LEDGER = [24.3, 0.99, 6.2];
shot({ id: 'agent', a: 1648, set: 'village', light: 'village', tin: 'dis',
  keys: [K(1648, [23.1, 1.55, 6.8], [24.3, 1.05, 6.2], 42), K(1664, [23.0, 1.5, 6.9], [24.3, 1.02, 6.2], 42, 'l'), K(1680, [21.0, 1.75, 7.9], [25, 1.35, 6.4], 48), K(1692, [20.9, 1.72, 8.0], [25, 1.35, 6.4], 48, 'l'), K(1704, [22.0, 2.2, 9.6], [8, 1.0, 7.0], 50), K(1744, [11.0, 1.9, 9.2], [4, 1.2, 7.3], 50, 's')],
  world: (f) => ({ tape: ramp(f, 1676, 1740) }),
  actors: (f) => { const out = [A(f, 'agent', AGENT, AGP, { expr: ex(f, [[1648, 'sly'], [1672, 'laugh'], [1700, 'smirk']]), R: f < 1690 ? 'hold' : 'point', L: 'hip', talk: talkAt(f, [[1676, 1700]]) * 0.6 }),
    A(f, 'mom', MOM, [4.0, 0, 7.4], { expr: f > 1722 ? 'nervous' : 'think', L: 'chin', R: f > 1722 ? 'mouth' : 'hang', look: 0.9 }),
    A(f, 'nb1', EXO(91, 'vill'), [6.2, 0, 5.4], { expr: f > 1715 ? 'shock' : 'smile', R: f > 1715 ? 'mouth' : 'hang' }), A(f, 'nb2', EXO(92, 'vill'), [9.5, 0, 9.6], { expr: f > 1710 ? 'laugh' : 'grin', R: 'point' })]; return out; },
  fx: (f, C, act) => { const out = []; const st = f < 1666 ? Math.abs(Math.sin((f - 1648) * 0.35)) * 0.12 : f < 1672 ? 0 : 0.12; out.push(F('stamp', [LEDGER[0] + 0.05, LEDGER[1] + 0.03 + st, LEDGER[2]], { s: 2, r: [0, 0.4, 0] })); puffs(out, LEDGER, f, 1669, 4, 71, { s: 0.15, v: 0.5, c: '#f4c4c4' }); burst(out, 'coin', [24.4, 1.2, 6.3], f, 1670, 8, 1.5, 22, 72, { g: 3, s: 1.8, shrink: 0 }); return out; },
  dof: (f, C) => ({ focus: f < 1676 ? dist(C.pos, LEDGER) : f < 1700 ? dist(C.pos, [25, 1.4, 6.4]) : 8, cinf: f < 1676 ? 10 : 5 }) });

// ---- 28. "But the guy on the bunk above you has been here nine years" (1742–1821)
const BUNKP = [BUNK_X + 0.05, UPPER, BUNK_Z + 0.15];
shot({ id: 'bunkmate', a: 1742, set: 'yard', light: 'dorm', tin: 'dis',
  keys: [K(1742, [-24.4, 1.25, 0.15], [-22.3, 1.3, 1.75], 48), K(1756, [-24.35, 1.25, 0.2], [-22.3, 1.3, 1.75], 48, 'l'), K(1772, [-24.6, 1.75, -0.1], [-22.3, 2.15, 1.75], 56), K(1796, [-24.5, 1.78, 0.0], [-22.3, 2.2, 1.75], 56, 'l'), K(1806, [-22.95, 2.55, 0.95], [-21.55, 2.72, 1.7], 44), K(1824, [-22.9, 2.5, 1.0], [-21.7, 2.68, 1.75], 44, 'l')],
  world: () => ({ calFlip: 1 }),
  actors: (f) => { const out = [A(f, 'hero', HEROW, HEROBUNK, { expr: ex(f, [[1742, 'bored'], [1765, 'think']]), look: f > 1760 ? 0.2 : -0.3, headTilt: f > 1760 ? -8 : 0 }, { sit: true }),
    A(f, 'bunk', BUNK, BUNKP, { expr: ex(f, [[1742, 'smile'], [1768, 'grin'], [1800, 'smugsmile']]), R: f > 1800 ? 'thumb' : 'wave', L: 'hang', headTilt: 10, look: -0.4 }, { sit: true })]; roomies(f, out); return out; },
  fx: (f) => { const out = []; glint(out, [-21.5, 2.75, 1.5], f, 1801, 14, 0.6); motes(out, [-24, 1, 0, -22, 3, 3], f, 14, 4); return out; },
  dof: (f, C) => ({ focus: f < 1765 ? dist(C.pos, [-22.2, 1.4, 1.85]) : dist(C.pos, [-22.2, 2.6, 1.85]), cinf: 7 }) });

// ---- 29. "and sends money home every month like clockwork" (1822–1895) — remittance kiosk
shot({ id: 'clockwork', a: 1822, set: 'yard', light: 'hot', tin: 'dis',
  keys: [K(1822, [14.2, 1.75, -6.9], [16.8, 1.3, -4.1], 50), K(1850, [14.4, 1.7, -6.5], [16.8, 1.3, -4.1], 50, 'l'), K(1866, [13.9, 1.85, -0.9], [16.6, 1.6, -4.0], 54), K(1898, [14.1, 1.85, -0.7], [16.6, 1.65, -4.0], 53, 'l')],
  world: (f) => ({ clockSpeed: f > 1866 ? 2400 : 30 }),
  actors: (f) => [A(f, 'bunk', BUNK, [16.25, 0, -4.35], { expr: ex(f, [[1822, 'smile'], [1843, 'beam'], [1870, 'smugsmile']]), R: (f % 20 < 10 && f < 1860) ? 'holdUp' : 'hold', L: 'hang', look: 0.6 }),
    A(f, 'hero', HEROW, [15.1, 0, -2.95], { expr: ex(f, [[1822, 'think'], [1860, 'shock'], [1875, 'think']]), R: 'chin', look: 0.7 }),
    A(f, 'wq1', EXO(170, 'work'), [14.4, 0, -5.4], { expr: 'bored', R: 'hold' })],
  fx: (f, C, act) => { const out = []; for (const [f0, i] of [[1826, 0], [1835, 1], [1843, 2], [1852, 3], [1859, 4]]) note(out, hand(act[0], C, 'R'), SLOT, f, f0 - 6, 8, i, 1.4); glint(out, [16.94, 1.5, -4], f, 1846, 10, 0.5); if (f > 1866) burst(out, 'spark', [16.9, 2.2, -3.2], f, 1867, 6, 1.4, 12, 81, { s: 0.5 }); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [16.6, 1.5, -4]), cinf: 6 }) });

// ---- 30. "So you keep your head down and do the same" (1896–1973)
shot({ id: 'same', a: 1896, set: 'yard', light: 'hot', tin: 'dis',
  keys: [K(1896, [10.6, 1.6, -28.8], [12.8, 1.25, -21.6], 50), K(1937, [17.0, 1.65, -28.6], [19, 1.25, -21.6], 50, 'l'), K(1950, [14.3, 1.65, -6.3], [16.7, 1.3, -4.0], 48), K(1975, [14.4, 1.65, -6.0], [16.7, 1.3, -4.0], 48, 'l')],
  actors: (f) => { if (f < 1944) { const out = []; for (let i = 0; i < 5; i++) { const x = lerp(9 + i * 2.2, 15 + i * 2.2, ramp(f, 1896, 1944)); out.push(A(f, i === 2 ? 'hero' : 'ln' + i, i === 2 ? HEROW : EXO(130 + i, 'work'), [x, 0, -21.6 + (i % 2) * 0.3], { expr: 'bored', headTilt: 12, walk: q((f * 0.04 + i * 0.2) % 1), L: 'hold', R: 'hold', look: 0 })); } return out; }
    return [A(f, 'hero', HEROW, [16.25, 0, -4.35], { expr: ex(f, [[1944, 'bored'], [1956, 'smile']]), R: f % 16 < 8 ? 'holdUp' : 'hold', L: 'hang', look: 0.6 }), A(f, 'bunk', BUNK, [15.2, 0, -3.0], { expr: 'grin', R: 'thumb', look: 0.7 })]; },
  fx: (f, C, act) => { const out = []; if (f < 1944) act.forEach((a) => out.push(F('bricks', A3(L3(hand(a, C, 'L'), hand(a, C, 'R'), 0.5), [0, -0.12, 0]), { s: 1.4, r: [0, 0.3, 0] }))); else for (const [f0, i] of [[1950, 0], [1958, 1], [1966, 2]]) note(out, hand(act[0], C, 'R'), SLOT, f, f0 - 6, 8, i, 1.4); puffs(out, [14, 0.2, -23], f, 1900, 3, 8, { s: 0.5, life: 40, c: '#e6d2a6' }); return out; },
  dof: (f, C) => ({ focus: f < 1944 ? dist(C.pos, [12, 1.2, -21.6]) : dist(C.pos, [16.4, 1.4, -4.2]), cinf: 5, near: 1.4 }) });

// ---- 31. "Then one morning his bunk is empty" (1974–2029)
shot({ id: 'empty', a: 1974, set: 'yard', light: 'dormMorn', tin: 'dis',
  keys: [K(1974, [-24.7, 1.35, -0.5], [-22.3, 1.45, 1.75], 50), K(2000, [-24.3, 1.55, -0.1], [-22.3, 1.6, 1.75], 50, 'l'), K(2014, [-23.5, 2.05, 0.55], [-22.3, 2.05, 1.8], 48), K(2032, [-23.35, 2.1, 0.7], [-22.3, 2.05, 1.8], 47, 'l')],
  world: () => ({ calFlip: 1, emptyBunk: true, beam: true }),
  actors: (f) => { const out = [A(f, 'hero', HEROW, HEROBUNK, { expr: ex(f, [[1974, 'sleepy'], [1992, 'think'], [2014, 'shock']]), look: f > 1996 ? 0.3 : 0, headTilt: f > 2000 ? -10 : 0, R: f > 1985 && f < 2000 ? 'mouth' : 'hang' }, { sit: true })]; roomies(f, out); return out; },
  fx: (f) => { const out = []; motes(out, [-24, 0.8, 1, -21.8, 2.6, 4.5], f, 40, 11); fly(out, [-22.2, 2.2, 1.8], f, 9, 0.35); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [-22.2, 2.0, 1.85]), cinf: 6 }) });

// ---- 32. "His bag is gone and nobody will tell you whether he went home or just disappeared" (2030–2155)
shot({ id: 'gone', a: 2030, set: 'yard', light: 'dormMorn', cont: true,
  keys: [K(2044, [-23.05, 2.55, 1.0], [-22.25, 1.98, 1.95], 44), K(2060, [-23.0, 2.5, 1.1], [-22.25, 1.98, 1.95], 44, 'l'), K(2074, [-25.3, 1.75, 4.6], [-25, 1.4, -1], 62), K(2120, [-24.7, 1.7, 4.1], [-25.5, 1.4, -1], 62, 's'), K(2134, [-23.1, 2.5, 0.85], [-21.6, 2.45, 1.75], 44), K(2158, [-23.0, 2.45, 0.95], [-21.6, 2.5, 1.75], 43, 'l')],
  world: () => ({ calFlip: 1, emptyBunk: true, beam: true }),
  actors: (f) => { const out = [A(f, 'hero', HEROW, [-24.8, 0, 2.3], { expr: ex(f, [[2030, 'think'], [2068, 'nervous'], [2122, 'shock']]), talk: talkAt(f, [[2070, 2118]]), L: f > 2068 ? 'up' : 'hang', R: f > 2068 ? 'up' : 'chin' })]; roomies(f, out, 'away'); return out; },
  fx: (f) => { const out = []; motes(out, [-24, 0.8, 1, -21.8, 2.6, 4.5], f, 40, 11); fly(out, [-22.25, 2.1, 1.95], f, 12, 0.3); return out; },
  dof: (f, C) => ({ focus: f < 2066 ? dist(C.pos, [-22.25, 1.98, 1.95]) : f < 2126 ? 4 : dist(C.pos, [-21.6, 2.5, 1.75]), cinf: 7 }) });

// ---- 33. "Taking a worker's passport is actually illegal in most of these countries" (2156–2261) — the LAW box
const GUARD = [-1.9, 0.49, -3.75];
const guard = (f, awake = false) => A(f, 'guard', { outfit: 'uniform', hat: 'gendarme', moustache: '#5a3b2a', shoes: '#141826' }, GUARD, { expr: awake ? 'shock' : 'sleepy', blink: !awake, headTilt: 16, L: 'cross', R: 'cross' }, { sit: true });
shot({ id: 'law', a: 2156, set: 'archive', light: 'archive', tin: 'dis',
  keys: [K(2156, [0, 0.72, 1.45], [0, 0.62, 0.62], 40), K(2170, [0.02, 0.74, 1.5], [0, 0.63, 0.62], 40, 'l'), K(2186, [1.7, 2.0, 4.0], [0, 1.2, -0.3], 54), K(2214, [1.9, 2.05, 3.8], [0, 1.25, -0.4], 54, 'l'), K(2230, [-2.2, 1.8, 3.4], [0, 1.4, -0.6], 52), K(2264, [-3.0, 1.9, 1.6], [0, 1.4, -0.8], 52, 's')],
  world: () => ({ web: 0.05, spider: 0 }),
  actors: (f) => [guard(f)],
  fx: (f) => { const out = []; glint(out, [0.3, 0.72, 0.66], f, 2160, 14, 0.4); glint(out, [0.45, 2.05, 0.45], f, 2216, 14, 0.6); zz(out, [-1.9, 1.3, -3.7], f, 4); motes(out, [-3, 0.5, -3, 3, 3.5, 3], f, 40, 21); return out; },
  dof: (f, C) => ({ focus: f < 2180 ? dist(C.pos, [0, 0.62, 0.62]) : dist(C.pos, [0, 1.4, 0]), cinf: f < 2180 ? 10 : 6 }) });

// ---- 34. "But a law doesn't do much when nobody enforces it" (2262–2334)
shot({ id: 'enforce', a: 2262, set: 'archive', light: 'archive', cont: true,
  keys: [K(2276, [-1.3, 1.95, 1.75], [0, 1.6, 0], 46), K(2294, [-1.15, 1.95, 1.55], [0, 1.65, 0], 46, 'l'), K(2306, [-0.75, 2.05, 1.05], [0.15, 2.15, 0.15], 44), K(2312, [-0.72, 2.05, 1.0], [0.15, 2.12, 0.15], 44, 'l'), K(2322, [-0.1, 1.75, 0.9], [-1.9, 1.5, -3.8], 50), K(2338, [-0.15, 1.75, 0.75], [-1.9, 1.6, -3.9], 49, 'l')],
  world: (f) => ({ web: lerp(0.05, 0.55, sm(ramp(f, 2262, 2300))), spider: sm(ramp(f, 2297, 2330)) }),
  actors: (f) => [guard(f)],
  fx: (f) => { const out = []; zz(out, [-1.9, 1.3, -3.7], f, 4); motes(out, [-3, 0.5, -3, 3, 3.5, 3], f, 40, 21); puffs(out, [0, 2.05, 0], f, 2268, 4, 91, { s: 0.2, v: 0.4, c: '#d8d0c0', life: 40 }); return out; },
  dof: (f, C) => ({ focus: f < 2316 ? dist(C.pos, [0, 1.9, 0]) : dist(C.pos, [-1.9, 1.3, -3.75]), cinf: 7 }) });

// ---- 35. "They never had to lock the door" (2335–2381) — the camp gate swings wide open
shot({ id: 'door', a: 2335, set: 'yard', light: 'hot', tin: 'dis',
  keys: [K(2335, [1.5, 1.7, 43.3], [0.3, 1.5, 47.2], 48), K(2346, [1.6, 1.75, 43.0], [0.3, 1.55, 47.2], 48, 'l'), K(2362, [3.2, 5.6, 33.5], [0, 2.6, 50], 56), K(2384, [3.0, 6.0, 32.5], [0, 2.8, 50], 57, 'l')],
  world: (f) => ({ gate: lerp(0.15, 1, eo(ramp(f, 2335, 2366))), cop: null, poster: 1 }),
  actors: (f) => [A(f, 'hero', HEROW, [0.3, 0, 46.4], { expr: ex(f, [[2335, 'think'], [2352, 'nervous']]), look: 0, L: 'hang', R: 'hang' }),
    A(f, 'gate', EXO(151, 'work'), [8.4, 0, 53.6], { expr: 'sleepy', blink: true, R: 'cross', L: 'cross' })],
  fx: (f) => { const out = []; for (let i = 0; i < 5; i++) puffs(out, [-3 + i * 1.6, 0.3, 50], f, 2338 + i * 4, 3, 100 + i, { s: 0.7, v: 2.4, life: 36, c: '#e8d4a8' }); return out; },
  dof: (f, C) => ({ focus: dist(C.pos, [0.3, 1.45, 46.4]), cinf: 5 }) });

// ---- 36. "They just took the one thing you need to walk through it" (2382–2457) — fly up and away, into the office, the drawer slams
shot({ id: 'fly', a: 2382, set: 'yard', light: 'hot', cont: true, blur: (f) => (f > 2396 ? [0, -0.05 * ramp(f, 2396, 2410)] : [0, 0]),
  keys: [K(2398, [2.5, 12, 30], [-2, 22, -40], 64, 'i'), K(2414, [0, 40, 10], [-60, 60, -200], 70, 'i')],
  world: () => ({ gate: 1, cop: null, poster: 1 }),
  actors: (f) => [A(f, 'hero', HEROW, [0.3, 0, 46.4], { expr: 'nervous', L: 'hang', R: 'hang' })],
  fx: () => [], dof: () => ({ focus: 40, cinf: 0 }) });
shot({ id: 'slam', a: 2406, set: 'office', light: 'office', tin: 'dis', blur: (f) => (f < 2414 ? [0, -0.05 * (1 - ramp(f, 2406, 2414))] : [0, 0]),
  keys: [K(2406, [0.7, 4, -22], [0.85, 0.7, -1.5], 56), K(2420, [0.88, 1.25, -2.85], [0.92, 0.6, -1.5], 46, 's'), K(2434, [0.95, 1.12, -2.55], [0.92, 0.55, -1.5], 42, 'l'), K(2446, [1.7, 1.9, -3.5], [0.4, 0.85, -1.6], 52), K(2460, [1.8, 2.0, -3.6], [0.35, 0.9, -1.6], 53, 'l')],
  world: (f) => ({ drawer: 1 - eo(ramp(f, 2419, 2423)), topple: 1, letter: 1 }),
  actors: (f) => [A(f, 'boss', BOSS, [-0.15, 0.59, -2.0], { expr: ex(f, [[2406, 'smugsmile'], [2423, 'laugh']]), R: f > 2418 && f < 2424 ? 'hold' : 'hip', L: 'hip', talk: f > 2426 ? talkAt(f, [[2426, 2457]]) * 0.5 : 0 }, { sit: true })],
  fx: (f) => { const out = []; puffs(out, [0.92, 0.6, -1.5], f, 2423, 8, 111, { s: 0.05, v: 0.8, c: '#efe6d2' }); burst(out, 'paper', [0.6, 1.0, -1.3], f, 2423, 6, 2.0, 30, 112, { g: 1.6, s: 0.7, shrink: 0 }); burst(out, 'coin', [0.9, 0.9, -1.4], f, 2423, 10, 1.8, 30, 113, { g: 4, s: 0.55, shrink: 0 }); glint(out, [0.92, 0.56, -1.47], f, 2430, 18, 0.7); return out; },
  dof: (f, C) => ({ focus: f < 2440 ? dist(C.pos, [0.92, 0.55, -1.47]) : dist(C.pos, [0.5, 0.9, -1.7]), cinf: f < 2440 ? 9 : 6 }) });

// ---------- assemble ----------
SH.forEach((s, i) => { s.b = i + 1 < SH.length ? SH[i + 1].a - 1 : TOTAL - 1; s.prev = SH[i - 1]; });
export const SHOTS = SH;
const SHAKE = [[737, 0.05], [775, 0.02], [1017, 0.05], [1097, 0.04], [1136, 0.04], [1226, 0.03], [1258, 0.03], [1451, 0.03], [2421, 0.07]];
function rawCam(s, f) {
  if (s.cam) return s.cam(f);
  if (!s._path) { const k = [...s.keys]; if (s.cont && s.prev) { const p = rawCam(s.prev, s.a - 1); k.unshift({ f: s.a - 1, p: p.pos, l: p.look, fov: p.fov, roll: p.roll || 0 }); } s._path = path(k); }
  return s._path(f);
}
function camFor(s, f) {
  const c = rawCam(s, f); c.pos = [...c.pos]; c.look = [...c.look];
  const d = dist(c.pos, c.look), n = 0.0032 * d;
  c.look[0] += n * (Math.sin(f * 0.13 + 1.3) + 0.6 * Math.sin(f * 0.31)); c.look[1] += n * (Math.sin(f * 0.11 + 0.4) + 0.5 * Math.sin(f * 0.27 + 2));
  c.roll = (c.roll || 0) + 1.4 * Math.sin(f * 0.019 + 0.5) + 0.6 * Math.sin(f * 0.047);
  for (const [sf, amp] of SHAKE) { const k = f - sf; if (k >= 0 && k < 9) { const sg = (k % 2 ? -1 : 1) * amp * (1 - k / 9); c.look[1] += sg * d * 0.6; c.look[0] += sg * d * 0.3; c.roll += sg * 40; } }
  c.blur = s.blur ? s.blur(f) : [0, 0];
  return c;
}
function stateFor(s, f) {
  const C = camFor(s, f);
  const actors = s.actors ? s.actors(f, C) : [];
  const fx = s.fx ? s.fx(f, C, actors) : [];
  const world = s.world ? { ...s.world(f) } : {};
  if (s.chain) world.chain = s.chain(f, C, actors);
  const L = { ...LT[s.light] };
  return { set: s.set, cam: C, light: L, actors, fx, world, dof: s.dof ? s.dof(f, C) : { focus: 10, cinf: 0 } };
}
export const shotAt = (f) => SH.find((s) => f >= s.a && f <= s.b) || SH[SH.length - 1];
const DIS = 8;
export const frameAt = (f) => {
  const s = shotAt(f);
  if (s.tin === 'dis' && s.prev && f < s.a + DIS) return { a: stateFor(s.prev, f), b: stateFor(s, f), t: sm((f - s.a + 1) / (DIS + 1)) };
  return { a: stateFor(s, f) };
};
