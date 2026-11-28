// "The Village Where Everyone Is Acting" (Hogeweyk) — word-timed story. 30 fps, voice 76.28 s, video ends 0.3 s after the last word.
// Word frames (from the supplied transcript): Netherlands 9 · village 37 · shopkeeper 56 · hairdresser 83 · waiter 108 · actors 138 · residents 166 · don't know 179
// Imagine 205 · waking up 218 · apartment 244 · recognise 276 · woman 310 · never met 324 · good morning 347 · name 382 · smiles 398 · years 436 · walk 472
// square 505 · café 524 · theatre 548 · supermarket 569 · hairdresser 595 · fits you in 611 · appointment 638 · waiter 661 · order 698 · supermarket 726 · basket 759
// cashier 781 · smiles 802 · waves 822 · thinking 854 · Wait 870 · charging 898 · paradise 958 · little things 990 · feel off 1006 · street 1044 · same square 1085
// one way out 1118 · front desk 1170 · always 1198 · kindly 1232 · today 1255 · leave 1290 · afternoon 1312 · scared 1334 · why 1366 · shout 1390 · hairdresser 1403
// doesn't shout back 1430 · sits beside 1472 · holds your hand 1501 · daughter 1546 · laughing 1573 · next morning 1597 · remember 1633 · she does 1666
// Hogeweyk 1714 · dementia 1773 · hairdresser 1794 · cashier 1824 · waiter 1848 · carers 1875 · outside world 1905 · too fast 1932 · confusing 1964 · smaller 1994
// shopping 2048 · hair done 2083 · yourself 2125 · names 2155 · every single day 2179 · again 2275 (ends 2284)
export const FPS = 30, TOTAL = 2294;
const IN = -300;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const E = {
  smooth: (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); },
  out: (t) => 1 - Math.pow(1 - clamp(t), 3),
  in: (t) => Math.pow(clamp(t), 3),
  lin: (t) => clamp(t),
  back: (t, s = 1.7) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; },
};
const spline = (pts, u) => { const n = pts.length - 1, x = clamp(u) * n, i = Math.min(n - 1, Math.floor(x)), t = x - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  return p1.map((_, k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)); };
const tl = (f, list) => { let v = list[0][1]; for (const [k, x] of list) if (f >= k) v = x; return v; };
const pop = (f, a, d = 8) => q(E.back(ramp(f, a, a + d)), 2);
const blinkAt = (f, seed) => { const per = 46 + (seed * 17) % 37, ph = (f + seed * 13) % per; return ph < 2 || (ph > 3 && ph < 5) ? 1 : 0; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------- cast (same as projects/hogeweyk/hogeweyk_cast.js CAST) ----------------
const CAST = {
  hero: { outfit: "cardigan", hat: "tufts", hair: "#f4f1ea", moustache: "#f4f1ea", top: "#d9a23a", shirt: "#7fa8d8", pants: "#7a5a3e", shoes: "#5a3524" },
  carer: { outfit: "blouse", hairStyle: "bun", hair: "#9a4a2a", top: "#a98bd6", pants: "#2f3a66" },
  hair: { outfit: "smock", hat: "bob", hairStyle: "bob", hair: "#c2402f", clip: "#f2c33a", top: "#2fa39a", trim: "#f07aa8", tag: true, shoes: "#d6333c" },
  waiter: { outfit: "waiter", hat: "slick", hair: "#2a211d", moustache: "#2a211d", top: "#26232b", bow: "#d6333c" },
  cashier: { outfit: "polo", hat: "visor", hair: "#5a3b2a", top: "#3f9a4a", collar: "#f2c33a", pants: "#2f3550" },
  desk: { outfit: "twinset", hat: "greybun", hairStyle: "bun", hair: "#b9b4ae", glasses: "round", top: "#2e3f73" },
  resA: { outfit: "knit", hat: "flatcap", hatCol: "#7a6a52", beard: "#f2f0ea", hairStyle: "bald", top: "#c9503f", zig: "#f4e9d2" },
  resB: { outfit: "dress", hat: "beret", hatCol: "#3f6fd1", hair: "#e7e3dc", top: "#e07ab0", glasses: "round" },
  resC: { outfit: "raincoat", hat: "bald", hair: "#dcd6cc", moustache: "#dcd6cc", top: "#f2c22e" },
  gardener: { outfit: "overalls", hat: "straw", top: "#e05a4f", pants: "#4f7fb8", patch: "#f2c33a" },
};
const SEED = { hero: 3, carer: 7, hair: 11, waiter: 5, cashier: 13, desk: 17, resA: 19, resB: 23, resC: 29, gardener: 31 };
let TT = null;
const SCL = 1.3;
/** a character card. o = rick opts. Every frame gets blink + idle head sway + eye darts unless overridden. */
const ch = (f, who, o, p, ex = {}) => {
  const sd = SEED[who] || 1;
  const look = o.look ?? q(0.35 * Math.sin((f + sd * 9) * 0.045) + 0.35 * (((Math.floor((f + sd * 7) / 26) * 7 + sd) % 3) - 1), 2);
  const oo = { expr: 'neutral', ...o, look, blink: o.blink ?? (['shock', 'nervous'].includes(o.expr) ? 0 : blinkAt(f, sd)), headTilt: q((o.headTilt ?? 0) + 2.2 * Math.sin((f + sd * 5) * 0.06), 1) };
  if (oo.talk) oo.talk = ((f + sd) >> 1) % 3 === 0 ? 0.2 : 0.8;
  const sit = oo.pose === 'sit'; const key = who + JSON.stringify(oo);
  return { key, draw: (g) => { g.translate(300, sit ? 742 : 975); g.scale(SCL, SCL); TT.rick(g, CAST[who], oo); }, x: p[0], y: p[1], z: p[2], ground: ex.ground ?? (sit ? p[1] + (p[1] > -100 ? 0 : 0) : p[1]), ...ex };
};
const sitY = (seatTop) => seatTop - 0.524; // card y so that the seated character's seat lands on seatTop
const walkPh = (f, f0, speed = 1.1) => q(((Math.max(0, f - f0) / 30) * speed / 1.3) % 1, 2);
const along = (f, a, b, p0, p1, e = E.lin) => lerp3(p0, p1, e(ramp(f, a, b)));

// ---------------- lights (characters are unlit cards: faces stay pure white) ----------------
export const LIGHTS = {
  day: { az: 130, el: 52, sky: '#d6e6ff', ground: '#a09470', hemi: 1.3, sun: '#fff4e2', sunI: 2.2, fog: '#d4e6f7', fogNear: 90, fogFar: 950, skyTop: '#3a84e0', skyHor: '#cfe8ff', sat: 1.12, vig: 0.16, shadowExt: 24 },
  room: { az: 160, el: 60, sky: '#fff3e0', ground: '#b08a68', hemi: 1.45, sun: '#ffe9c8', sunI: 1.25, fog: '#fff3e0', fogNear: 200, fogFar: 900, skyTop: '#6fb0ee', skyHor: '#d9efff', sat: 1.1, vig: 0.18, shadowExt: 8 },
  salon: { az: 120, el: 62, sky: '#fff4f8', ground: '#b9909c', hemi: 1.5, sun: '#ffffff', sunI: 1.2, fog: '#fff', fogNear: 200, fogFar: 900, skyTop: '#6fb0ee', skyHor: '#d9efff', sat: 1.1, vig: 0.16, shadowExt: 8 },
  shop: { az: 100, el: 70, sky: '#f4fbff', ground: '#a8b8b0', hemi: 1.55, sun: '#ffffff', sunI: 1.15, fog: '#fff', fogNear: 200, fogFar: 900, skyTop: '#6fb0ee', skyHor: '#d9efff', sat: 1.12, vig: 0.15, shadowExt: 10 },
  lobby: { az: 200, el: 58, sky: '#fff1e2', ground: '#a88a70', hemi: 1.42, sun: '#ffeccc', sunI: 1.2, fog: '#fff', fogNear: 200, fogFar: 900, skyTop: '#6fb0ee', skyHor: '#d9efff', sat: 1.1, vig: 0.18, shadowExt: 9 },
  golden: { az: 235, el: 24, sky: '#dccdf2', ground: '#9a7a5a', hemi: 1.18, sun: '#ffcf8a', sunI: 2.3, fog: '#f2d6b8', fogNear: 80, fogFar: 800, skyTop: '#5a8ad8', skyHor: '#ffdcae', sunDisc: '#fff0c8', sunSize: 0.003, sat: 1.14, vig: 0.18, shadowExt: 20 },
  gloom: { az: 235, el: 30, sky: '#c2cce4', ground: '#7d7c86', hemi: 1.2, sun: '#d6dcf0', sunI: 1.0, fog: '#b9c4da', fogNear: 60, fogFar: 600, skyTop: '#55709f', skyHor: '#b4c0d8', sat: 1.0, vig: 0.26, shadowExt: 20 },
  road: { az: 150, el: 48, sky: '#d6e2f5', ground: '#8f8a80', hemi: 1.25, sun: '#fff4e2', sunI: 2.3, fog: '#cfdcef', fogNear: 90, fogFar: 900, skyTop: '#3f7fd8', skyHor: '#d4e6f8', sat: 1.14, vig: 0.2, shadowExt: 28 },
  dusk: { az: 255, el: 7, sky: '#9a9ae8', ground: '#5a4a72', hemi: 1.2, sun: '#ffa070', sunI: 1.5, fog: '#8a80c8', fogNear: 70, fogFar: 700, skyTop: '#2f45a8', skyHor: '#ff9fb0', sunDisc: '#ffe0b0', sunSize: 0.004, sat: 1.2, vig: 0.2, shadowExt: 22 },
};
const mixL = (A, B, t) => { const o = { ...A }; for (const k in B) if (typeof B[k] === 'number' && typeof A[k] === 'number') o[k] = lerp(A[k], B[k], t); else if (typeof B[k] === 'string' && B[k][0] === '#' && typeof A[k] === 'string') o[k] = mixHex(A[k], B[k], t); return o; };
const mixHex = (a, b, t) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(lerp(v, y[i], t)).toString(16).padStart(2, '0')).join(''); };

// ---------------- shots: one continuous flight; dis = moving dissolve (frames) into the shot ----------------
export const SHOTS = [
  { id: 'hook', a: 0, b: 199, light: 'day' },
  { id: 'apt', a: 200, b: 449, light: 'room', dis: 10 },
  { id: 'walk', a: 450, b: 589, light: 'day', dis: 8 },
  { id: 'salon', a: 590, b: 654, light: 'salon', dis: 8 },
  { id: 'cafe', a: 655, b: 719, light: 'day', dis: 8 },
  { id: 'super', a: 720, b: 847, light: 'shop', dis: 8 },
  { id: 'wait', a: 848, b: 1061, light: 'day', dis: 8 },
  { id: 'loop', a: 1062, b: 1109, light: 'day', dis: 8 },
  { id: 'lobby', a: 1110, b: 1304, light: 'lobby', dis: 8 },
  { id: 'scared', a: 1305, b: 1596, light: 'gloom', dis: 8 },
  { id: 'morning', a: 1597, b: 1663, light: 'room', dis: 8 },
  { id: 'notebook', a: 1664, b: 1689, light: 'salon', dis: 6 },
  { id: 'reveal', a: 1690, b: 1899, light: 'day', dis: 8 },
  { id: 'outside', a: 1900, b: 1986, light: 'road', dis: 8 },
  { id: 'smaller', a: 1987, b: 2065, light: 'day' },
  { id: 'hairdo', a: 2066, b: 2099, light: 'salon', dis: 6 },
  { id: 'dance', a: 2100, b: 2144, light: 'golden', dis: 6 },
  { id: 'end', a: 2145, b: 2293, light: 'dusk', dis: 8 },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
export const blendAt = (f) => {
  for (let i = 1; i < SHOTS.length; i++) { const S = SHOTS[i]; if (!S.dis) continue; const h = S.dis / 2;
    if (f >= S.a - h && f < S.a + h) return { a: SHOTS[i - 1], b: S, t: q(E.smooth((f - (S.a - h) + 0.5) / S.dis), 3) }; }
  return { a: shotAt(f), b: null, t: 0 };
};
export const lightFor = (S, f) => {
  let L = { ...LIGHTS[S.light] };
  if (S.id === 'scared') { // gloom while scared, then the gold comes back with her kindness
    L = mixL(LIGHTS.gloom, LIGHTS.golden, E.smooth(ramp(f, 1425, 1500))); }
  if (S.id === 'end') L = mixL(LIGHTS.golden, LIGHTS.dusk, E.smooth(ramp(f, 2150, 2215)));
  if (S.id === 'dance') L = mixL(LIGHTS.day, LIGHTS.golden, 0.6);
  return L;
};

// ---------------- cameras ----------------
// key: { f, p, l, fov, r (roll), e (ease into this key), via (curved path) }
const camKeys = (K, f) => {
  if (f <= K[0].f) return { p: K[0].p, l: K[0].l, fov: K[0].fov, r: K[0].r || 0 };
  const L = K[K.length - 1]; if (f >= L.f) return { p: L.p, l: L.l, fov: L.fov, r: L.r || 0 };
  let i = 0; while (!(f >= K[i].f && f <= K[i + 1].f)) i++; const a = K[i], b = K[i + 1];
  const t = (E[b.e || 'smooth'])((f - a.f) / (b.f - a.f));
  return { p: b.via ? spline([a.p, ...b.via, b.p], t) : lerp3(a.p, b.p, t), l: lerp3(a.l, b.l, t), fov: lerp(a.fov, b.fov, t), r: lerp(a.r || 0, b.r || 0, t) };
};
const CAMS = {
  hook: [
    { f: -6, p: [2.05, 1.45, 8.05], l: [1.6, 1.42, 6.3], fov: 50 },
    { f: 4, p: [2.15, 1.5, 8.35], l: [1.6, 1.45, 6.3], fov: 50 },
    { f: 34, p: [3.2, 4.8, 12.2], l: [0.2, 1.8, -2], fov: 50, e: 'out', r: -2 },
    { f: 52, p: [2.8, 4.5, 11.6], l: [0, 2.0, -3.0], fov: 49, r: -1 },
    { f: 62, p: [8.4, 1.85, 0.6], l: [12.8, 1.45, -1.9], fov: 42, e: 'out', r: 2 },
    { f: 80, p: [8.8, 1.8, 0.3], l: [12.8, 1.5, -1.9], fov: 40, r: 1 },
    { f: 90, p: [-8.3, 1.8, 0.5], l: [-13.2, 1.5, 1.8], fov: 44, e: 'out', via: [[-0.5, 4.5, 4]], r: -2 },
    { f: 105, p: [-8.8, 1.75, 0.3], l: [-13.2, 1.5, 1.6], fov: 42, r: -1 },
    { f: 116, p: [2.4, 1.75, -5.6], l: [1.0, 1.45, -11.0], fov: 42, e: 'out', r: 2 },
    { f: 134, p: [2.0, 1.75, -6.2], l: [1.0, 1.5, -11.0], fov: 40, r: 1 },
    { f: 144, p: [-5.2, 2.3, -2.0], l: [-5.5, 1.6, -9.6], fov: 44, e: 'out', r: -1.5 },
    { f: 160, p: [-5.4, 2.0, -3.2], l: [-5.5, 1.6, -9.6], fov: 42, r: 0 },
    { f: 172, p: [2.6, 1.45, 7.6], l: [0.7, 1.05, 2.8], fov: 42, e: 'out', via: [[1.5, 3.4, 1.5], [3.4, 2.2, 5.6]], r: 2 },
    { f: 205, p: [2.2, 1.38, 6.6], l: [0.7, 1.15, 2.8], fov: 38, r: 1 },
  ],
  apt: [
    { f: 195, p: [-0.45, IN + 0.9, -1.75], l: [-0.85, IN + 0.75, -2.45], fov: 36 },
    { f: 212, p: [-0.5, IN + 0.92, -1.85], l: [-0.85, IN + 0.76, -2.45], fov: 35 },
    { f: 236, p: [0.8, IN + 1.55, 1.7], l: [-1.7, IN + 1.05, -2.0], fov: 46, e: 'out', r: -2 },
    { f: 248, p: [0.6, IN + 1.5, 1.4], l: [-1.8, IN + 1.1, -2.0], fov: 45, r: -1 },
    { f: 258, p: [-0.4, IN + 1.4, 0.4], l: [-2.0, IN + 1.32, -2.2], fov: 42, e: 'out', r: 1.5 },
    { f: 268, p: [-0.5, IN + 1.38, 0.2], l: [-2.0, IN + 1.32, -2.2], fov: 41, r: 1 },
    { f: 278, p: [-1.0, IN + 1.75, 0.9], l: [-3.4, IN + 1.75, -0.4], fov: 44, e: 'out', r: -1.5 },
    { f: 290, p: [-1.2, IN + 1.7, 0.7], l: [-3.4, IN + 1.75, -0.4], fov: 43 },
    { f: 302, p: [-0.9, IN + 1.55, 1.8], l: [3.0, IN + 1.3, 0.4], fov: 46, e: 'out', r: 2 },
    { f: 318, p: [-1.0, IN + 1.55, 1.85], l: [2.2, IN + 1.3, 0.0], fov: 46, e: 'lin', r: 1.5 },
    { f: 334, p: [-1.1, IN + 1.55, 1.9], l: [0.9, IN + 1.3, -0.6], fov: 46, e: 'lin', r: 1 },
    { f: 340, p: [2.0, IN + 1.55, 0.9], l: [-0.8, IN + 1.4, -1.6], fov: 50, e: 'out', r: -1.5 },
    { f: 366, p: [1.9, IN + 1.52, 0.75], l: [-0.8, IN + 1.4, -1.6], fov: 48, r: -0.5 },
    { f: 376, p: [2.4, IN + 1.5, 1.2], l: [-0.9, IN + 1.4, -1.8], fov: 46, e: 'out', r: 1 },
    { f: 404, p: [2.3, IN + 1.48, 1.05], l: [-0.9, IN + 1.4, -1.8], fov: 44, r: 1.5 },
    { f: 414, p: [-0.4, IN + 1.4, 0.9], l: [0.8, IN + 1.65, -2.7], fov: 44, e: 'out', r: -1 },
    { f: 432, p: [-0.5, IN + 1.38, 0.8], l: [0.8, IN + 1.65, -2.7], fov: 43 },
    { f: 442, p: [-0.7, IN + 1.4, 0.25], l: [-2.0, IN + 1.32, -2.25], fov: 40, e: 'out', r: 1.5 },
    { f: 456, p: [-0.8, IN + 1.38, 0.1], l: [-2.0, IN + 1.32, -2.25], fov: 38, r: 2 },
  ],
  walk: [
    { f: 444, p: [-9.6, 1.75, -7.0], l: [-13.0, 1.45, -9.2], fov: 42 },
    { f: 484, p: [-8.4, 1.7, -7.8], l: [-11.2, 1.45, -8.6], fov: 40, r: 1 },
    { f: 500, p: [-5.5, 6.0, 7.0], l: [0, 1.4, -3.0], fov: 50, e: 'out', via: [[-8.0, 4.0, 0.0]], r: -2 },
    { f: 520, p: [-4.4, 6.2, 7.4], l: [0.5, 1.4, -3.5], fov: 50, r: -1 },
    { f: 529, p: [0.3, 2.1, -5.4], l: [2.6, 2.4, -14], fov: 48, e: 'out', r: 2 },
    { f: 545, p: [0.7, 2.0, -6.0], l: [2.6, 2.5, -14], fov: 47, r: 1 },
    { f: 552, p: [-5.4, 2.3, -5.6], l: [-7.5, 3.4, -13], fov: 48, e: 'out', r: -2 },
    { f: 562, p: [-5.7, 2.2, -6.2], l: [-7.5, 3.5, -13], fov: 47, r: -1 },
    { f: 572, p: [6.8, 2.1, -1.0], l: [14, 2.4, 1.8], fov: 50, e: 'out', r: 2 },
    { f: 596, p: [7.4, 2.0, -0.6], l: [14, 2.4, 1.8], fov: 48, r: 1 },
  ],
  salon: [
    { f: 584, p: [41.9, IN + 1.55, 1.8], l: [40.3, IN + 1.2, -1.6], fov: 46 },
    { f: 622, p: [41.4, IN + 1.5, 1.2], l: [40.2, IN + 1.2, -1.7], fov: 42, r: 1 },
    { f: 630, p: [41.8, IN + 1.75, 2.35], l: [42.35, IN + 1.08, 1.45], fov: 40, e: 'out', r: -2 },
    { f: 643, p: [41.85, IN + 1.7, 2.3], l: [42.35, IN + 1.1, 1.45], fov: 38, r: -1 },
    { f: 652, p: [40.9, IN + 1.45, 0.4], l: [40.0, IN + 1.25, -1.7], fov: 40, e: 'out', r: 1.5 },
    { f: 662, p: [40.8, IN + 1.42, 0.2], l: [40.0, IN + 1.25, -1.7], fov: 38 },
  ],
  cafe: [
    { f: 650, p: [0.4, 1.6, -6.0], l: [0.6, 1.2, -10.0], fov: 44 },
    { f: 688, p: [0.2, 1.5, -6.7], l: [0.5, 1.2, -10.0], fov: 42, r: 1 },
    { f: 697, p: [-1.3, 1.42, -7.6], l: [0.45, 1.3, -9.9], fov: 44, e: 'out', r: -2 },
    { f: 725, p: [-1.5, 1.4, -7.9], l: [0.45, 1.3, -9.9], fov: 42, r: -1 },
  ],
  super: [
    { f: 714, p: [78.75, IN + 1.6, -3.6], l: [78.85, IN + 1.35, 1.0], fov: 48 },
    { f: 770, p: [78.7, IN + 1.6, -2.7], l: [78.85, IN + 1.35, -0.4], fov: 46, r: 1 },
    { f: 780, p: [85.4, IN + 1.65, 0.0], l: [82.6, IN + 1.35, 2.8], fov: 52, e: 'out', r: -2 },
    { f: 796, p: [85.3, IN + 1.63, 0.2], l: [82.6, IN + 1.35, 2.8], fov: 50, r: -1 },
    { f: 804, p: [83.6, IN + 1.6, 2.0], l: [83.0, IN + 1.5, 3.85], fov: 46, e: 'out', r: 1.5 },
    { f: 816, p: [83.6, IN + 1.6, 2.05], l: [83.0, IN + 1.5, 3.85], fov: 44 },
    { f: 828, p: [79.4, IN + 1.6, 4.4], l: [82.0, IN + 1.35, 2.4], fov: 50, e: 'out', r: -1.5 },
    { f: 854, p: [79.5, IN + 1.62, 4.5], l: [81.0, IN + 1.35, 3.4], fov: 50, r: -2 },
  ],
  wait: [
    { f: 842, p: [7.0, 1.6, 2.4], l: [11.0, 1.45, 4.6], fov: 42 },
    { f: 866, p: [7.6, 1.58, 2.7], l: [11.0, 1.45, 4.6], fov: 40, r: 1 },
    { f: 874, p: [9.2, 1.6, 3.6], l: [11.0, 1.5, 4.6], fov: 42, e: 'out', r: -2 },
    { f: 890, p: [9.15, 1.6, 3.65], l: [11.0, 1.5, 4.6], fov: 41, r: -1 },
    { f: 900, p: [8.1, 1.7, 2.6], l: [11.0, 1.5, 4.6], fov: 44, e: 'out', r: 1.5 },
    { f: 928, p: [7.9, 1.72, 2.4], l: [11.0, 1.5, 4.6], fov: 44, r: 2 },
    { f: 944, p: [3.2, 1.3, 8.6], l: [3.2, 3.8, 0.0], fov: 54, e: 'out', via: [[6.5, 3.0, 7.5]], r: -1 },
    { f: 978, p: [3.0, 1.28, 8.2], l: [3.2, 4.0, 0.0], fov: 54, r: 0 },
    { f: 990, p: [2.6, 1.42, 7.6], l: [3.4, 1.25, 4.3], fov: 44, e: 'out', r: 1 },
    { f: 1004, p: [2.5, 1.42, 7.3], l: [3.4, 1.25, 4.3], fov: 42, r: 2 },
    { f: 1012, p: [-6.6, 5.6, -8.4], l: [-7.5, 6.9, -13.3], fov: 40, e: 'out', r: -3 },
    { f: 1024, p: [-6.6, 5.5, -8.6], l: [-7.5, 6.9, -13.3], fov: 38, r: -4 },
    { f: 1036, p: [9.4, 1.9, -7.6], l: [13.0, 1.4, -14.0], fov: 46, e: 'out', r: 1 },
    { f: 1062, p: [13.6, 1.8, -13.6], l: [16.2, 1.3, -21.5], fov: 46, r: 2 },
  ],
  loop: [
    { f: 1056, p: [-10.6, 1.62, 9.6], l: [-14.4, 1.45, 17.5], fov: 44 },
    { f: 1084, p: [-11.0, 1.6, 10.0], l: [-13.6, 1.45, 14.6], fov: 42, r: -1 },
    { f: 1092, p: [-11.6, 1.62, 12.4], l: [-13.2, 1.55, 14.6], fov: 38, e: 'out', r: -3 },
    { f: 1116, p: [-11.7, 1.62, 12.5], l: [-13.2, 1.55, 14.6], fov: 36, r: -4 },
  ],
  lobby: [
    { f: 1104, p: [132.4, IN + 2.6, 0.3], l: [134.3, IN + 2.95, 1.6], fov: 34 },
    { f: 1126, p: [132.3, IN + 2.55, 0.25], l: [134.3, IN + 2.9, 1.6], fov: 33 },
    { f: 1142, p: [130.2, IN + 1.75, -0.6], l: [133.4, IN + 1.4, 1.8], fov: 48, e: 'out', r: 2 },
    { f: 1158, p: [130.0, IN + 1.7, -0.8], l: [133.4, IN + 1.4, 1.8], fov: 46, r: 1 },
    { f: 1168, p: [128.6, IN + 1.62, 1.6], l: [129.9, IN + 1.45, -1.6], fov: 50, e: 'out', r: -1.5 },
    { f: 1196, p: [128.7, IN + 1.6, 1.4], l: [129.9, IN + 1.45, -1.6], fov: 48, r: -1 },
    { f: 1204, p: [131.25, IN + 1.62, -0.3], l: [130.55, IN + 1.32, -1.38], fov: 42, e: 'out', r: 1.5 },
    { f: 1240, p: [131.2, IN + 1.6, -0.4], l: [130.55, IN + 1.32, -1.38], fov: 40, r: 2 },
    { f: 1250, p: [128.4, IN + 1.6, 1.4], l: [129.9, IN + 1.45, -1.6], fov: 50, e: 'out', r: -1 },
    { f: 1276, p: [128.5, IN + 1.6, 1.2], l: [129.9, IN + 1.45, -1.6], fov: 48 },
    { f: 1284, p: [131.3, IN + 1.5, 0.8], l: [129.6, IN + 1.4, -0.5], fov: 42, e: 'out', r: 2 },
    { f: 1312, p: [131.4, IN + 1.5, 1.0], l: [129.6, IN + 1.4, -0.5], fov: 42, r: 2.5 },
  ],
  scared: [
    { f: 1300, p: [-7.6, 1.5, 5.8], l: [-12.0, 1.25, 3.7], fov: 42, r: 3 },
    { f: 1344, p: [-8.4, 1.42, 5.2], l: [-12.0, 1.25, 3.7], fov: 40, r: 4 },
    { f: 1354, p: [-9.9, 1.38, 2.6], l: [-12.0, 1.3, 3.7], fov: 38, e: 'out', r: -4 },
    { f: 1378, p: [-10.1, 1.36, 2.6], l: [-12.0, 1.3, 3.7], fov: 36, r: -5 },
    { f: 1386, p: [-8.9, 1.65, 3.8], l: [-12.4, 1.45, 2.7], fov: 46, e: 'out', r: 2 },
    { f: 1420, p: [-9.2, 1.62, 3.6], l: [-12.4, 1.45, 2.7], fov: 44, r: 3 },
    { f: 1430, p: [-10.5, 1.62, 1.0], l: [-12.6, 1.55, 1.75], fov: 38, e: 'out', r: -1 },
    { f: 1462, p: [-10.6, 1.6, 1.1], l: [-12.6, 1.55, 1.75], fov: 36, r: 0 },
    { f: 1472, p: [-8.4, 1.4, 3.7], l: [-12.1, 1.15, 3.6], fov: 42, e: 'out', r: 1 },
    { f: 1498, p: [-8.7, 1.38, 3.65], l: [-12.1, 1.15, 3.6], fov: 40, r: 1 },
    { f: 1506, p: [-9.9, 1.3, 3.55], l: [-12.1, 1.18, 3.6], fov: 46, e: 'out', r: -1 },
    { f: 1522, p: [-10.0, 1.3, 3.5], l: [-12.1, 1.18, 3.6], fov: 44 },
    { f: 1530, p: [-8.9, 1.62, 3.6], l: [-12.0, 1.7, 3.55], fov: 50, e: 'out', r: 1.5 },
    { f: 1558, p: [-9.0, 1.6, 3.6], l: [-12.0, 1.7, 3.55], fov: 48, r: 2 },
    { f: 1570, p: [-6.8, 2.3, 5.8], l: [-12.0, 1.3, 3.4], fov: 46, e: 'out', r: -1 },
    { f: 1603, p: [-6.4, 2.5, 6.2], l: [-12.0, 1.4, 3.4], fov: 46, r: -2 },
  ],
  morning: [
    { f: 1591, p: [-0.5, IN + 0.92, -1.85], l: [-0.85, IN + 0.76, -2.45], fov: 36 },
    { f: 1600, p: [-0.5, IN + 0.95, -1.8], l: [-0.85, IN + 0.78, -2.45], fov: 36 },
    { f: 1614, p: [-0.6, IN + 1.45, 0.4], l: [-2.0, IN + 1.3, -2.2], fov: 42, e: 'out', r: -1 },
    { f: 1636, p: [-0.7, IN + 1.42, 0.3], l: [-2.0, IN + 1.3, -2.2], fov: 40, r: -1.5 },
    { f: 1646, p: [-0.9, IN + 1.6, 0.9], l: [-3.2, IN + 1.6, -0.9], fov: 46, e: 'out', r: 1 },
    { f: 1668, p: [-1.0, IN + 1.6, 0.8], l: [-3.2, IN + 1.6, -0.9], fov: 45, r: 2 },
  ],
  notebook: [
    { f: 1658, p: [41.85, IN + 1.62, 0.62], l: [41.98, IN + 1.07, 1.35], fov: 38 },
    { f: 1672, p: [41.8, IN + 1.6, 0.55], l: [42.0, IN + 1.1, 1.35], fov: 37 },
    { f: 1684, p: [41.5, IN + 1.6, 0.1], l: [42.2, IN + 1.5, 2.3], fov: 40, e: 'out', r: 1 },
    { f: 1696, p: [41.45, IN + 1.6, 0.0], l: [42.2, IN + 1.52, 2.3], fov: 39, r: 1.5 },
  ],
  reveal: [
    { f: 1684, p: [-8.6, 1.9, -0.4], l: [-13.6, 2.4, -0.6], fov: 44 },
    { f: 1696, p: [-8.4, 2.0, -0.2], l: [-13.6, 2.5, -0.6], fov: 44 },
    { f: 1730, p: [14, 40, 58], l: [0, 2, 4], fov: 50, e: 'smooth', via: [[-4, 8, 6], [6, 24, 34]], r: -3 },
    { f: 1742, p: [13, 38, 55], l: [0, 2, 4], fov: 50, r: -2 },
    { f: 1770, p: [5.5, 5.8, 10.5], l: [-1.0, 1.2, 1.0], fov: 48, e: 'smooth', r: 1 },
    { f: 1790, p: [5.0, 5.0, 9.6], l: [-1.0, 1.2, 1.0], fov: 46, r: 2 },
    { f: 1798, p: [-9.4, 1.75, 1.0], l: [-12.8, 1.5, 0.8], fov: 42, e: 'out', r: -2 },
    { f: 1816, p: [-9.7, 1.72, 1.1], l: [-12.8, 1.5, 0.8], fov: 40, r: -1 },
    { f: 1824, p: [9.4, 1.75, -0.6], l: [12.8, 1.5, -1.2], fov: 42, e: 'out', via: [[0, 3.5, 3.5]], r: 2 },
    { f: 1840, p: [9.7, 1.72, -0.7], l: [12.8, 1.5, -1.2], fov: 40, r: 1 },
    { f: 1848, p: [1.4, 1.75, -7.0], l: [1.0, 1.5, -10.6], fov: 42, e: 'out', r: -2 },
    { f: 1862, p: [1.3, 1.72, -7.3], l: [1.0, 1.5, -10.6], fov: 40, r: -1 },
    { f: 1872, p: [0, 1.85, 9.6], l: [0, 1.6, 4.0], fov: 52, e: 'out', via: [[4, 3.5, 2]], r: 1 },
    { f: 1905, p: [0, 1.8, 9.2], l: [0, 1.6, 4.0], fov: 50, r: 2 },
  ],
  outside: [
    { f: 1894, p: [-5.5, 1.5, 48.0], l: [-0.5, 1.7, 60.0], fov: 50 },
    { f: 1950, p: [1.2, 1.55, 48.0], l: [-4.2, 1.7, 60.0], fov: 50, e: 'lin', r: 3 },
    { f: 1960, p: [0.2, 2.0, 47.8], l: [-2.1, 1.95, 52.5], fov: 48, e: 'out', r: -3 },
    { f: 1990, p: [0.0, 1.95, 48.1], l: [-2.1, 1.95, 52.5], fov: 46, r: -5 },
  ],
  smaller: [
    { f: 1987, p: [1.6, 2.2, 48.6], l: [0.4, 2.6, 41.0], fov: 46 },
    { f: 2022, p: [2.2, 5.4, 9.6], l: [0, 1.4, 0], fov: 50, e: 'smooth', via: [[-5, 16.5, 33], [-5.5, 15.5, 20]], r: -2 },
    { f: 2030, p: [8.4, 1.65, 2.6], l: [12.8, 1.4, 4.6], fov: 44, e: 'out', r: 1 },
    { f: 2068, p: [8.8, 1.62, 3.0], l: [12.6, 1.4, 4.6], fov: 42, r: 2 },
  ],
  hairdo: [
    { f: 2060, p: [41.1, IN + 1.5, 0.7], l: [40.0, IN + 1.25, -1.7], fov: 42 },
    { f: 2104, p: [40.6, IN + 1.45, 0.3], l: [40.0, IN + 1.3, -1.7], fov: 38, r: 1.5 },
  ],
  dance: [
    { f: 2094, p: [4.2, 1.6, 7.6], l: [1.0, 1.35, 4.8], fov: 44 },
    { f: 2150, p: [-2.6, 1.7, 8.0], l: [1.0, 1.35, 4.8], fov: 44, via: [[1.0, 1.65, 9.0]], r: -3 },
  ],
  end: [
    { f: 2139, p: [-0.2, 1.62, 8.6], l: [-0.5, 1.5, 5.0], fov: 40 },
    { f: 2200, p: [-0.4, 1.6, 8.2], l: [-0.5, 1.52, 5.0], fov: 38, r: 1 },
    { f: 2212, p: [0.2, 1.75, 9.6], l: [0.0, 1.6, 4.6], fov: 46, e: 'out', r: -1 },
    { f: 2240, p: [0.2, 1.7, 9.2], l: [0.0, 1.6, 4.6], fov: 44 },
    { f: 2296, p: [0.3, 3.3, 11.4], l: [0.0, 1.9, 3.2], fov: 54, e: 'smooth', r: 2 },
  ],
};
const KICKS = { 6: 0.03, 140: 0.025, 222: 0.03, 870: 0.04, 1334: 0.035, 1395: 0.05, 1403: 0.03, 1905: 0.02, 2241: 0.02 };
export const camAt = (f, S) => {
  const K = CAMS[S.id]; const c = camKeys(K, f);
  // handheld + slow roll drift + push-in creep (never parked)
  const d = dist(c.p, c.l); const hh = 0.006 * d;
  const look = [c.l[0] + hh * Math.sin(f * 0.13 + S.a), c.l[1] + hh * 0.8 * Math.sin(f * 0.17 + 1 + S.a), c.l[2] + hh * Math.sin(f * 0.11 + 2)];
  let roll = c.r + 1.1 * Math.sin(f * 0.04 + S.a * 0.1) + 0.25 * Math.sin(f * 0.21);
  const creep = 1 - 0.00035 * (f - S.a);
  const pos = c.p.slice();
  for (const k in KICKS) { const dd = f - +k; if (dd >= 0 && dd < 8) { const s = (dd % 2 ? -1 : 1) * KICKS[k] * (1 - dd / 8); look[1] += s * d * 0.5; roll += s * 25; } }
  const out = { pos, look, fov: c.fov * creep, roll };
  if (S.id === 'reveal' && f > 1700 && f < 1765) out.shadowAt = [0, 0, 0];
  if (S.id === 'smaller' && f < 2025) out.shadowAt = lerp3([0, 0, 40], [0, 0, 4], ramp(f, 1987, 2022));
  return out;
};
export const dofAt = (f, S, C) => {
  const d = dist(C.pos, C.look);
  const cinf = { hook: 7, apt: 9, walk: 6, salon: 8, cafe: 8, super: 8, wait: 7, loop: 7, lobby: 9, scared: 8, morning: 9, notebook: 10, reveal: 4, outside: 6, smaller: 4, hairdo: 8, dance: 7, end: 6 }[S.id] || 6;
  let c = cinf; if (S.id === 'reveal' && f > 1700 && f < 1775) c = 1.5; if (S.id === 'smaller' && f < 2025) c = 1.5;
  return { focus: d, cinf: c, near: 0.6 };
};

// ---------------- square extras (background life: 3+ characters on screen) ----------------
const extras = (f, out, skip = {}) => {
  if (!skip.resA) { const a = f * 0.006 + 2.4; const p = [Math.cos(a) * 7.6, 0, Math.sin(a) * 7.6]; out.push(ch(f, 'resA', { expr: tl(f % 300, [[0, 'smile'], [120, 'grin'], [200, 'smugsmile']]), walk: walkPh(f, 0, 0.9), L: 'hip' }, p, { lo: true, flip: Math.sin(a) > 0 })); }
  if (!skip.resB) out.push(ch(f, 'resB', { pose: 'sit', expr: tl(f % 240, [[0, 'smile'], [90, 'beam'], [170, 'smile']]), R: f % 200 < 100 ? 'wave' : 'hang' }, [-3.8, sitY(0.53), -4.42], { lo: true, ground: 0 }));
  if (!skip.gardener) { const w = f % 360 < 180; out.push(ch(f, 'gardener', { expr: 'grin', R: 'hold', propR: 'can', headTilt: w ? 4 : -2 }, [3.2, 0, -7.0], { lo: true })); }
  if (!skip.resC) { const x = ((f * 0.03) % 30) - 15; out.push(ch(f, 'resC', { expr: 'smile', walk: walkPh(f, 0, 0.8), R: 'hip' }, [x, 0, 9.4], { lo: true, flip: false })); }
};

// ---------------- actors ----------------
export const actorsAt = (f, S, T) => {
  TT = T; const out = [];
  switch (S.id) {
    case 'hook': {
      // shopkeeper (cashier) at the supermarket crates, tosses an apple on "shopkeeper"
      const toss = f >= 56 && f < 80;
      out.push(ch(f, 'cashier', { expr: f < 56 ? 'smile' : toss ? 'grin' : 'wink', R: toss ? 'holdUp' : 'wave', L: 'hip' }, [12.9, 0, -1.3]));
      // hairdresser snips the air on "hairdresser"
      out.push(ch(f, 'hair', { expr: f < 83 ? 'smile' : 'beam', R: f >= 83 && f < 110 ? { a: 'holdUp', b: 'up', t: q(0.5 + 0.5 * Math.sin(f * 0.9), 2) } : 'holdUp', propR: 'scissors', L: 'hip' }, f < 136 ? [-13.0, 0, 1.3] : [-6.7, 0, -9.6]));
      // waiter spins with the tray on "waiter"
      const spin = f >= 108 && f < 128;
      out.push(ch(f, 'waiter', { expr: f < 108 ? 'smugsmile' : 'grin', R: 'holdUp', propR: 'tray', L: spin ? 'up' : 'hip', headTilt: spin ? 10 * Math.sin(f * 0.8) : 0 }, f < 136 ? [1.0, 0, -11.0] : [-4.3, 0, -9.6], { flip: spin && (f >> 2) % 2 === 0 }));
      if (f >= 136) { // the trio bows in the spotlight on "actors", then scatters back to act natural
        const bow = f >= 140 && f < 158 ? Math.sin(ramp(f, 140, 158) * Math.PI) : 0;
        const sc = f >= 165;
        const o = (who, x, prop) => { const dx = sc ? (x < -5.5 ? -1 : x > -5.5 ? 1 : 0) * (f - 165) * 0.06 : 0;
          out.push(ch(f, who, { expr: bow > 0.2 ? 'smugsmile' : sc ? 'sly' : 'grin', L: bow > 0.2 ? 'cross' : sc ? 'hang' : 'wave', R: prop ? 'holdUp' : bow > 0.2 ? 'cross' : 'wave', propR: prop, headTilt: bow * 14, walk: sc ? walkPh(f, 165, 1.4) : undefined, squash: q(bow * -0.05, 2) }, [x + dx, 0, -9.6 - (sc ? (f - 165) * 0.02 : 0)], { flip: sc && x < -5.5 })); };
        o('hair', -6.9, 'scissors'); o('cashier', -5.5, null); o('waiter', -4.1, 'tray');
      }
      // hero feeding pigeons on the fountain rim, blissfully unaware
      if (f >= 150) out.push(ch(f, 'hero', { pose: 'sit', expr: tl(f, [[150, 'smile'], [176, 'smugsmile'], [186, 'beam']]), R: { a: 'hold', b: 'point', t: q(0.5 + 0.5 * Math.sin(f * 0.35), 2) }, L: 'hang', look: 0.6 }, [0.75, sitY(0.64), 2.95], { ground: 0 }));
      if (f < 150) extras(f, out, { resB: f > 60 && f < 140 });
      else out.push(ch(f, 'resB', { pose: 'sit', expr: 'smile', R: 'wave' }, [-3.8, sitY(0.53), -4.42], { lo: true, ground: 0 }));
      break; }
    case 'apt': {
      const up = E.back(ramp(f, 216, 228));
      const heroE = tl(f, [[200, 'sleepy'], [219, 'shock'], [240, 'think'], [262, 'nervous'], [300, 'think'], [318, 'shock'], [346, 'nervous'], [372, 'think'], [400, 'smile'], [436, 'beam']]);
      const heroLook = f > 300 && f < 440 ? 0.6 : f >= 262 && f < 300 ? q(Math.sin(f * 0.25), 2) : undefined;
      out.push(ch(f, 'hero', { pose: 'sit', expr: heroE, look: heroLook, L: f > 262 && f < 300 ? 'chin' : 'hang', R: f >= 219 && f < 240 ? 'up' : 'hang', squash: q(f >= 222 && f < 228 ? -0.06 : 0, 2) }, [-2.0, IN + sitY(0.72) - (1 - up) * 0.9, -2.2], { ground: IN, blob: false }));
      if (f >= 306) { // the carer walks in, says good morning, opens the curtains
        const walkIn = along(f, 306, 336, [3.3, IN, 0.55], [0.55, IN, -0.75]);
        const toWin = along(f, 406, 420, [0.55, IN, -0.75], [0.9, IN, -2.35]);
        const back = along(f, 432, 448, [0.9, IN, -2.35], [0.2, IN, -1.0]);
        const p = f < 406 ? walkIn : f < 432 ? toWin : back;
        const talking = (f >= 340 && f < 364) || (f >= 370 && f < 392);
        out.push(ch(f, 'carer', { expr: tl(f, [[306, 'smile'], [340, 'grin'], [398, 'beam'], [420, 'smile'], [436, 'smugsmile']]), talk: talking ? 1 : 0, look: -0.6,
          R: f >= 340 && f < 364 ? 'wave' : f >= 412 && f < 430 ? 'up' : 'hang', L: f >= 412 && f < 430 ? 'up' : f > 436 ? 'hip' : 'hang',
          walk: (f >= 306 && f < 336) || (f >= 406 && f < 420) || (f >= 432 && f < 448) ? walkPh(f, 306, 1.4) : undefined }, p, { flip: f < 336 }));
      }
      break; }
    case 'walk': {
      const p = along(f, 452, 486, [-13.5, 0, -9.4], [-10.6, 0, -8.3]);
      const p2 = along(f, 486, 600, [-10.6, 0, -8.3], [-5.0, 0, -5.8]);
      out.push(ch(f, 'hero', { expr: tl(f, [[440, 'smile'], [475, 'grin'], [505, 'beam'], [525, 'smile'], [570, 'grin']]), walk: walkPh(f, 440, 1.1), R: f > 470 && f < 485 ? 'wave' : 'hang', L: 'hang' }, f < 486 ? p : p2, { flip: false }));
      out.push(ch(f, 'waiter', { expr: 'smugsmile', R: 'holdUp', propR: 'tray', L: 'hip', walk: walkPh(f, 0, 1) }, [lerp(-2.5, 3.5, ramp(f, 500, 560)), 0, -10.6], { lo: true }));
      out.push(ch(f, 'cashier', { expr: 'grin', R: f > 566 ? 'wave' : 'hip' }, [13.0, 0, 1.6]));
      out.push(ch(f, 'hair', { expr: 'smile', R: 'wave', propR: 'comb' }, [-12.9, 0, 1.4], { lo: true }));
      extras(f, out);
      break; }
    case 'salon': {
      const sitDown = f >= 612;
      const hp = along(f, 590, 612, [41.6, IN, 0.6], [40.15, IN, -1.45]);
      out.push(ch(f, 'hero', sitDown ? { pose: 'sit', expr: tl(f, [[612, 'shock'], [624, 'grin'], [645, 'beam']]), L: 'hang', R: f > 645 ? 'thumb' : 'hang' } : { expr: 'think', walk: walkPh(f, 590, 1.2), look: -0.6 }, sitDown ? [40.0, IN + sitY(0.64), -1.55] : hp, { ground: IN }));
      const snip = f >= 640;
      out.push(ch(f, 'hair', { expr: tl(f, [[590, 'beam'], [611, 'grin'], [640, 'smugsmile']]), R: snip ? { a: 'holdUp', b: 'up', t: q(0.5 + 0.5 * Math.sin(f * 1.1), 2) } : f < 611 ? 'point' : 'wave', propR: 'scissors', L: f < 611 ? 'hip' : 'hold', propL: 'comb', look: -0.5 }, [40.85, IN, -1.15], { flip: true }));
      break; }
    case 'cafe': {
      const order = f >= 676 && f < 694;
      out.push(ch(f, 'hero', { pose: 'sit', expr: tl(f, [[650, 'smile'], [674, 'think'], [690, 'shock'], [702, 'grin'], [712, 'beam']]), R: order ? 'point' : f > 702 ? 'thumb' : 'hang', L: 'hang', look: 0.5 }, [0.05, sitY(0.49), -9.75], { ground: 0 }));
      const wp = along(f, 655, 674, [4.6, 0, -9.8], [1.1, 0, -10.3], E.out);
      out.push(ch(f, 'waiter', { expr: tl(f, [[655, 'grin'], [680, 'smugsmile'], [704, 'wink']]), R: f < 690 ? 'holdUp' : 'hold', propR: f < 690 ? 'tray' : null, L: f >= 690 ? 'thumb' : 'hip', walk: f < 674 ? walkPh(f, 655, 2.2) : undefined, talk: f >= 682 && f < 700 ? 1 : 0, look: -0.5 }, wp, { flip: true }));
      out.push(ch(f, 'resA', { pose: 'sit', expr: tl(f, [[650, 'smile'], [700, 'laugh']]), R: 'hold', propR: 'mug' }, [3.55, sitY(0.49), -9.85], { lo: true, ground: 0 }));
      out.push(ch(f, 'resB', { pose: 'sit', expr: 'beam', R: 'wave' }, [-2.7, sitY(0.49), -9.1], { lo: true, ground: 0 }));
      break; }
    case 'super': {
      if (f < 778) { const p = along(f, 714, 776, [78.85, IN, 1.8], [78.85, IN, -0.9]);
        out.push(ch(f, 'hero', { expr: tl(f, [[714, 'smile'], [744, 'grin'], [760, 'beam']]), walk: walkPh(f, 714, 1.0), R: 'hold', propR: 'basket', L: f > 744 && f < 770 ? 'up' : 'hang', look: q(0.6 * Math.sin(f * 0.12), 2) }, p, { flip: false }));
        out.push(ch(f, 'resB', { expr: 'smile', walk: walkPh(f, 0, 0.8), R: 'hold', propR: 'basket' }, [81.2, IN, lerp(-3.0, 1.0, ramp(f, 714, 776))], { lo: true }));
      } else { const p = f < 820 ? along(f, 778, 800, [81.7, IN, 2.4], [82.6, IN, 2.45]) : along(f, 822, 848, [82.6, IN, 2.45], [81.1, IN, 3.9]);
        out.push(ch(f, 'hero', { expr: tl(f, [[778, 'smile'], [792, 'think'], [810, 'shock'], [826, 'nervous'], [840, 'think']]), walk: f < 800 || f >= 822 ? walkPh(f, 778, 1.0) : undefined, R: 'hold', propR: 'basket', L: f >= 812 && f < 826 ? 'point' : 'hang', look: 0.5 }, p, { flip: f >= 822 }));
        out.push(ch(f, 'cashier', { expr: tl(f, [[778, 'smile'], [796, 'beam'], [816, 'grin']]), R: f >= 817 ? 'wave' : 'hang', L: f >= 817 ? { a: 'hang', b: 'wave', t: q(0.5 + 0.5 * Math.sin(f * 0.7), 2) } : 'hip', look: -0.5 }, [83.0, IN, 3.85], { flip: true }));
      }
      break; }
    case 'wait': {
      if (f < 935) { // outside the supermarket: "Wait... nobody's charging me?"
        out.push(ch(f, 'hero', { expr: tl(f, [[842, 'think'], [870, 'shock'], [885, 'think'], [898, 'nervous'], [918, 'shock']]), R: 'hold', propR: 'basket', L: f >= 892 && f < 925 ? 'holdUp' : f >= 870 && f < 885 ? 'up' : 'chin', look: f >= 870 && f < 885 ? 0 : 0.4, talk: 0 }, [11.0, 0, 4.6]));
        out.push(ch(f, 'cashier', { expr: 'grin', R: 'wave', L: 'hip', look: 0.4 }, [13.2, 0, 5.4], { lo: true }));
        out.push(ch(f, 'resC', { expr: 'smile', walk: walkPh(f, 0, 0.9) }, [lerp(4, 9, ramp(f, 842, 935)), 0, 7.6], { lo: true }));
      } else if (f < 1036) { // paradise on the bench → little things feel off
        out.push(ch(f, 'hero', { pose: 'sit', expr: tl(f, [[935, 'beam'], [958, 'smugsmile'], [985, 'smile'], [1000, 'think'], [1010, 'sly'], [1026, 'nervous']]), R: 'hold', propR: f < 1000 ? 'mug' : null, L: f < 990 ? 'thumb' : 'hang', look: f > 990 ? q(0.8 * Math.sin(f * 0.2), 2) : 0.2 }, [3.5, sitY(0.53), 4.3], { ground: 0 }));
        // the same resident walks past twice in the same direction (the loop)
        const lp = ((f - 980) % 30) / 30; if (f >= 980) out.push(ch(f, 'resA', { expr: 'smile', walk: walkPh(f, 0, 1.0), R: 'hip' }, [lerp(0.3, 6.8, lp), 0, 2.4], { lo: true }));
        else extras(f, out, { resC: true });
        out.push(ch(f, 'resB', { pose: 'sit', expr: 'beam', R: f % 120 < 60 ? 'wave' : 'hang' }, [-3.8, sitY(0.53), -4.42], { lo: true, ground: 0 }));
        out.push(ch(f, 'gardener', { expr: 'grin', R: 'hold', propR: 'can' }, [3.2, 0, -7.0], { lo: true }));
      } else { // every street you take...
        const p = along(f, 1036, 1062, [11.6, 0, -11.6], [15.9, 0, -19.6]);
        out.push(ch(f, 'hero', { expr: tl(f, [[1036, 'think'], [1050, 'sly']]), walk: walkPh(f, 1036, 1.3), R: 'hold', propR: 'basket', look: 0.6 }, p, { flip: true }));
      }
      break; }
    case 'loop': {
      const p = along(f, 1056, 1084, [-15.4, 0, 21.5], [-13.6, 0, 15.6], E.lin);
      out.push(ch(f, 'hero', { expr: tl(f, [[1056, 'smile'], [1078, 'think'], [1086, 'shock'], [1098, 'nervous']]), walk: f < 1084 ? walkPh(f, 1056, 1.3) : undefined, R: 'hold', propR: 'basket', L: f > 1090 ? 'up' : 'hang', look: f > 1086 ? 0.3 : -0.3 }, p));
      out.push(ch(f, 'resA', { expr: 'smile', walk: walkPh(f, 0, 1.0) }, [lerp(-11, -7, ramp(f, 1056, 1110)), 0, 9.0], { lo: true }));
      break; }
    case 'lobby': {
      const hp = f < 1160 ? along(f, 1110, 1150, [130.6, IN, 3.0], [132.9, IN, 1.9]) : along(f, 1160, 1185, [132.6, IN, 1.4], [129.6, IN, -0.5]);
      out.push(ch(f, 'hero', { expr: tl(f, [[1104, 'grin'], [1150, 'smile'], [1170, 'smile'], [1205, 'think'], [1258, 'shock'], [1272, 'bored'], [1290, 'sleepy']]), walk: (f < 1150 || (f >= 1160 && f < 1185)) ? walkPh(f, 1104, 1.2) : undefined, R: 'hold', propR: f < 1160 ? 'briefcase' : null, L: f >= 1290 ? 'hang' : 'hang', look: f < 1160 ? 0.5 : -0.4, headTilt: f > 1272 ? -6 : 0 }, hp, { flip: f >= 1160 }));
      const talking = f >= 1200 && f < 1298;
      out.push(ch(f, 'desk', { expr: tl(f, [[1104, 'smile'], [1170, 'grin'], [1232, 'smugsmile'], [1260, 'smile'], [1290, 'beam']]), talk: talking && ((f - 1200) % 40 < 30) ? 1 : 0, R: f >= 1250 && f < 1275 ? 'point' : 'hang', L: f >= 1280 ? 'hold' : 'hip', look: 0.5 }, [130.05, IN, -2.3]));
      break; }
    case 'scared': {
      const standing = f >= 1380 && f < 1460;
      const heroP = [-12.05, sitY(0.53), 3.95];
      const heroE = tl(f, [[1300, 'think'], [1326, 'nervous'], [1350, 'shock'], [1366, 'nervous'], [1380, 'angry'], [1425, 'shock'], [1440, 'nervous'], [1475, 'sleepy'], [1500, 'smile'], [1540, 'beam'], [1561, 'laugh']]);
      if (standing) out.push(ch(f, 'hero', { expr: heroE, talk: f < 1420 ? 1 : 0, L: f < 1420 ? 'up' : 'hang', R: f < 1420 ? 'point' : 'hang', headTilt: f < 1420 ? 6 * Math.sin(f * 0.9) : 0, squash: q(f >= 1390 && f < 1396 ? -0.05 : 0, 2) }, [-12.0, 0, 3.4]));
      else out.push(ch(f, 'hero', { pose: 'sit', expr: heroE, L: f < 1380 ? 'cross' : 'hang', R: f >= 1500 ? { a: 'hang', b: 'point', t: 0.55 } : f >= 1561 ? 'hold' : f < 1380 ? 'cross' : 'hang', headTilt: f >= 1561 ? 8 * Math.sin(f * 0.5) : 0, look: f >= 1470 ? -0.6 : undefined }, heroP, { ground: 0 }));
      if (f >= 1380) { // the hairdresser: shouted at, stays calm, sits beside him, holds his hand
        const sitting = f >= 1482;
        const hp = f < 1465 ? [-12.6, 0, 1.75] : along(f, 1465, 1482, [-12.6, 0, 1.75], [-12.05, 0, 3.1]);
        out.push(ch(f, 'hair', sitting ? { pose: 'sit', expr: tl(f, [[1482, 'smile'], [1523, 'grin'], [1561, 'laugh']]), talk: f >= 1523 && f < 1560 ? 1 : 0, L: f >= 1500 ? { a: 'hang', b: 'point', t: 0.55 } : 'hang', R: f >= 1523 && f < 1565 ? 'holdUp' : 'hang', propR: f >= 1523 && f < 1565 ? 'photo' : null, look: 0.6 }
          : { expr: tl(f, [[1380, 'shock'], [1405, 'neutral'], [1430, 'smile'], [1450, 'smugsmile']]), R: f < 1440 ? 'holdUp' : 'hang', propR: f < 1440 ? 'scissors' : null, L: f >= 1440 ? 'wave' : 'hang', headTilt: f >= 1395 && f < 1425 ? -9 : 0, walk: f >= 1465 && f < 1482 ? walkPh(f, 1465, 1.0) : undefined, look: 0.5 }, sitting ? [-12.05, sitY(0.53), 3.15] : hp, { ground: 0 }));
      }
      if (f < 1330 || f > 1561) out.push(ch(f, 'resC', { expr: f > 1561 ? 'laugh' : 'smile', walk: walkPh(f, 0, 0.8) }, [lerp(-6, -2, ramp(f, 1300, 1600)), 0, 7.2], { lo: true }));
      if (f > 1561) out.push(ch(f, 'resB', { expr: 'beam', R: 'wave' }, [-9.6, 0, 6.8], { lo: true }));
      break; }
    case 'morning': {
      const up = E.back(ramp(f, 1600, 1610));
      out.push(ch(f, 'hero', { pose: 'sit', expr: tl(f, [[1591, 'sleepy'], [1606, 'neutral'], [1623, 'think'], [1640, 'bored'], [1652, 'think']]), L: f > 1623 ? 'chin' : 'hang', R: 'hang', look: f > 1640 ? -0.8 : q(0.5 * Math.sin(f * 0.15), 2) }, [-2.0, IN + sitY(0.72) - (1 - up) * 0.9, -2.2], { ground: IN, blob: false }));
      break; }
    case 'notebook': {
      out.push(ch(f, 'hair', { expr: tl(f, [[1658, 'smile'], [1676, 'smugsmile'], [1684, 'beam']]), R: 'hold', propR: 'comb', L: 'chin', look: -0.4 }, [42.25, IN, 2.3]));
      break; }
    case 'reveal': {
      if (f < 1716) out.push(ch(f, 'hair', { expr: 'smile', R: 'wave' }, [-12.9, 0, -0.4]));
      if (f >= 1730 && f < 1796) { // residents with carers, arm in arm
        out.push(ch(f, 'resA', { expr: 'beam', walk: walkPh(f, 0, 0.8), R: 'cross' }, [lerp(-3, 1, ramp(f, 1730, 1796)), 0, 5.6], { lo: true }));
        out.push(ch(f, 'carer', { expr: 'smile', walk: walkPh(f, 3, 0.8), L: 'cross' }, [lerp(-2.4, 1.6, ramp(f, 1730, 1796)), 0, 5.55], { lo: true }));
        out.push(ch(f, 'resB', { expr: 'grin', R: 'wave' }, [3.0, 0, -6.2], { lo: true }));
        out.push(ch(f, 'gardener', { expr: 'grin', R: 'hold', propR: 'can' }, [3.6, 0, -6.6], { lo: true }));
        out.push(ch(f, 'resC', { pose: 'sit', expr: 'smile', R: 'hold', propR: 'mug' }, [-3.8, sitY(0.53), -4.42], { lo: true, ground: 0 }));
        out.push(ch(f, 'waiter', { expr: 'smugsmile', R: 'holdUp', propR: 'tray' }, [-2.9, 0, -3.6], { lo: true }));
        out.push(ch(f, 'hero', { expr: 'beam', walk: walkPh(f, 0, 0.9), R: 'hold', propR: 'basket' }, [lerp(4, 1.5, ramp(f, 1730, 1796)), 0, 3.6], { lo: true }));
      }
      const badge = (who, a) => f >= a;
      if (f >= 1790) {
        out.push(ch(f, 'hair', { expr: f >= 1800 ? 'beam' : 'smile', R: f >= 1796 && f < 1872 ? 'holdUp' : 'wave', L: 'hip' }, f < 1866 ? [-12.8, 0, 0.8] : [-1.0, 0, 4.0]));
        out.push(ch(f, 'cashier', { expr: f >= 1824 ? 'grin' : 'smile', R: f >= 1820 && f < 1872 ? 'holdUp' : 'wave', L: 'hip' }, f < 1866 ? [12.8, 0, -1.2] : [0, 0, 4.0]));
        out.push(ch(f, 'waiter', { expr: f >= 1848 ? 'beam' : 'smugsmile', R: f >= 1841 && f < 1872 ? 'holdUp' : 'wave', L: 'hip' }, f < 1866 ? [1.0, 0, -10.6] : [1.0, 0, 4.0]));
        if (f >= 1866) out.push(ch(f, 'hero', { expr: 'beam', R: 'wave' }, [3.2, 0, 3.0], { lo: true }));
      }
      if (f < 1730) extras(f, out);
      break; }
    case 'outside': {
      out.push(ch(f, 'resC', { expr: tl(f, [[1894, 'nervous'], [1932, 'shock'], [1960, 'nervous']]), L: f > 1950 ? 'up' : 'hang', R: f > 1950 ? 'up' : 'chin', headTilt: 10 * Math.sin(f * 0.3), look: q(Math.sin(f * 0.4), 2) }, [-2.2, 0, 52.6]));
      break; }
    case 'smaller': {
      if (f >= 2024) { const p = along(f, 2024, 2062, [13.4, 0, 5.3], [11.4, 0, 4.0]);
        out.push(ch(f, 'hero', { expr: tl(f, [[2024, 'grin'], [2048, 'beam']]), walk: walkPh(f, 2024, 1.0), R: 'hold', propR: 'basket', L: 'wave' }, p, { flip: true }));
        out.push(ch(f, 'cashier', { expr: 'beam', R: 'wave', L: { a: 'hang', b: 'wave', t: q(0.5 + 0.5 * Math.sin(f * 0.6), 2) } }, [13.4, 0, 6.4]));
        extras(f, out, { resB: true });
      } else if (f > 2005) extras(f, out);
      break; }
    case 'hairdo': {
      out.push(ch(f, 'hero', { pose: 'sit', expr: tl(f, [[2060, 'smile'], [2083, 'beam']]), R: 'thumb', L: 'hang', look: 0.5 }, [40.0, IN + sitY(0.64), -1.55], { ground: IN }));
      out.push(ch(f, 'hair', { expr: 'grin', R: { a: 'holdUp', b: 'up', t: q(0.5 + 0.5 * Math.sin(f * 0.5), 2) }, propR: 'comb', L: 'hold', propL: 'scissors', look: -0.5 }, [40.85, IN, -1.15], { flip: true }));
      break; }
    case 'dance': {
      const sway = Math.sin(f * 0.22);
      out.push(ch(f, 'hero', { expr: tl(f, [[2094, 'beam'], [2125, 'laugh']]), walk: q((f * 0.03) % 1, 2), L: sway > 0 ? 'up' : 'wave', R: sway > 0 ? 'wave' : 'up', headTilt: 9 * sway, look: 0.6 }, [0.6 + 0.25 * sway, 0, 4.9]));
      out.push(ch(f, 'resB', { expr: 'laugh', walk: q((f * 0.03 + 0.5) % 1, 2), L: sway < 0 ? 'up' : 'wave', R: 'wave', headTilt: -9 * sway, look: -0.6 }, [1.5 - 0.25 * sway, 0, 4.8], { flip: true }));
      out.push(ch(f, 'waiter', { expr: 'grin', R: 'holdUp', propR: 'tray', L: 'thumb' }, [-1.6, 0, 3.6], { lo: true }));
      out.push(ch(f, 'resA', { expr: 'laugh', R: 'wave', L: 'up' }, [3.2, 0, 3.4], { lo: true }));
      break; }
    case 'end': {
      const shake = f >= 2245 && f < 2275;
      out.push(ch(f, 'hero', { expr: tl(f, [[2139, 'smile'], [2160, 'think'], [2190, 'nervous'], [2241, 'shock'], [2250, 'beam']]), R: shake ? { a: 'hang', b: 'point', t: q(0.5 + 0.12 * Math.sin(f * 1.2), 2) } : 'hang', L: 'hang', look: -0.6 }, [0.35, 0, 5.3]));
      out.push(ch(f, 'hair', { expr: tl(f, [[2139, 'smile'], [2209, 'grin'], [2241, 'beam']]), talk: f >= 2241 && f < 2262 ? 1 : 0, L: f >= 2240 ? { a: 'hang', b: 'point', t: 0.5 } : 'hip', R: 'hang', look: 0.6 }, [-0.65, 0, 5.05]));
      if (f >= 2212) {
        out.push(ch(f, 'cashier', { expr: 'beam', R: f >= 2256 ? 'wave' : 'hang', talk: f >= 2256 && f < 2270 ? 1 : 0 }, [1.7, 0, 4.2]));
        out.push(ch(f, 'waiter', { expr: 'grin', R: f >= 2268 ? 'wave' : 'holdUp', propR: f >= 2268 ? null : 'tray', talk: f >= 2268 && f < 2282 ? 1 : 0 }, [-2.0, 0, 4.15]));
        out.push(ch(f, 'resB', { expr: 'laugh', R: 'wave' }, [3.0, 0, 3.0], { lo: true }));
        out.push(ch(f, 'resA', { expr: 'beam', R: 'up' }, [-3.3, 0, 2.9], { lo: true }));
      }
      break; }
  }
  return out;
};

// ---------------- world state per frame ----------------
export const worldAt = (f, S) => {
  const W = { wind: 1, lights: 0, bubbles: [], clapVis: S.id === 'hook' && f < 50 };
  switch (S.id) {
    case 'hook': {
      W.clap = f < 6 ? 0.55 * (1 - E.in(ramp(f, -6, 6))) : 0;
      if (f >= 138 && f < 175) { W.spot = [-5.5, 0, -9.6]; W.spotA = E.out(ramp(f, 138, 144)) * (1 - ramp(f, 166, 175)); }
      W.feed = f >= 150 ? [0.75, 0, 3.4] : null;
      break; }
    case 'apt': W.alarm = f < 230 ? 1 : 0; W.aptDoor = E.out(ramp(f, 306, 322)); W.curtain = E.smooth(ramp(f, 412, 430));
      if (f >= 342 && f < 404) W.bubbles.push({ id: 'gm', lines: f < 370 ? ['GOOD MORNING!'] : ['GOOD MORNING,', 'HENK!'], w: 1.25, h: f < 370 ? 0.42 : 0.62, p: [0.15, IN + 2.0, -1.05], s: pop(f, f < 370 ? 342 : 370) * 0.75, tail: -0.3, fg: '#d6333c' });
      break;
    case 'walk': break;
    case 'salon': W.chair = f < 612 ? E.out(ramp(f, 592, 612)) * Math.PI * 4 : 0; W.book = E.out(ramp(f, 630, 642)); break;
    case 'cafe': if (f >= 682 && f < 712) W.bubbles.push({ id: 'usual', lines: ['THE USUAL,', 'HENK!'], w: 1.1, h: 0.6, p: [1.2, 2.2, -10.3], s: pop(f, 682), tail: -0.3, fg: '#2e3f73' }); break;
    case 'super': W.supDoor = E.smooth(ramp(f, 826, 838)); W.register = f >= 786 && f < 812 ? ((f >> 2) % 2 ? 'TOTAL: €0,00' : '★ FREE ★') : 'TOTAL: €0,00'; break;
    case 'wait':
      if (f >= 886 && f < 932) W.bubbles.push({ id: 'think', lines: ['WAIT...', '€0,00?!'], w: 0.95, h: 0.62, p: [11.05, 2.38, 4.55], s: pop(f, 886), noTail: true, bg: '#fff6d6', fg: '#d6333c' });
      W.rainbow = f >= 935 && f < 1000 ? E.smooth(ramp(f, 938, 966)) * (1 - ramp(f, 985, 1000)) : 0;
      W.clockWrong = f >= 1000; W.wind = f > 990 ? 1.8 : 1; W.wiggle = f > 1036 ? 1 : 0;
      if (f >= 1036) W.pigeons = false;
      break;
    case 'loop': W.wiggle = 1; break;
    case 'lobby': W.lobDoor = 0; W.calPage = f >= 1200 && f < 1242 ? (f - 1200) / 6 : f >= 1242 ? 7 : 0;
      if (f >= 1252 && f < 1300) W.bubbles.push({ id: 'nt', lines: ['NOT TODAY,', 'DEAR ♥'], w: 1.0, h: 0.55, p: [130.1, IN + 2.2, -2.2], s: pop(f, 1252), tail: 0.25, fg: '#2e3f73' });
      break;
    case 'scared': W.wind = f < 1440 ? 3.2 : 1.2; W.scatter = 1334; W.pigeonBase = [-7, 0, 4];
      if (f > 1561) { W.scatter = null; W.feed = [-10.2, 0, 4.2]; }
      if (f >= 1523 && f < 1575) W.memory = { p: [-11.9, 2.25 + 0.05 * Math.sin(f * 0.1), 3.55], s: pop(f, 1525, 10), ry: Math.PI / 2, roll: 0.05 * Math.sin(f * 0.08) };
      if (f >= 1390 && f < 1424) W.bubbles.push({ id: 'shout', lines: ['WHO ARE', 'YOU?!'], w: 0.95, h: 0.6, p: [-12.05, 2.2, 3.75], s: pop(f, 1390, 5) * (1 + 0.04 * Math.sin(f * 2)), tail: 0.3, bg: '#ffe0e0', fg: '#d6333c', roll: 0.08 * Math.sin(f) });
      break;
    case 'morning': W.alarm = f < 1612 ? 1 : 0; W.curtain = 0; break;
    case 'notebook': break;
    case 'reveal': W.letters = f >= 1708 && f < 1790; W.gullC = [0, 18, 4];
      for (const [id, a, p] of [['bh', 1800, [-12.8, 2.28, 0.8]], ['bc', 1826, [12.8, 2.28, -1.2]], ['bw', 1850, [1.0, 2.28, -10.6]]]) {
        if (f >= a && f < 1866) W.bubbles.push({ id, lines: ['CARER ♥'], w: 0.85, h: 0.34, p, s: pop(f, a), noTail: true, bg: '#2f9a4a', fg: '#ffffff', border: '#ffffff' }); }
      if (f >= 1870) [[-1.0, 'th'], [0, 'tc'], [1.0, 'tw']].forEach(([x, id], i) => W.bubbles.push({ id, lines: ['CARER ♥'], w: 0.85, h: 0.34, p: [x, 2.32, 4.0], s: pop(f, 1870 + i * 3) * 0.8, noTail: true, bg: '#2f9a4a', fg: '#ffffff', border: '#ffffff' }));
      break;
    case 'outside': W.fast = 2.4; W.spinArrows = f > 1950 ? 1 : 0.3; W.pigeons = false; break;
    case 'smaller': W.gullC = [0, 12, 20]; break;
    case 'hairdo': W.chair = 0; W.notebook = true; break;
    case 'dance': W.lights = 0.4; break;
    case 'end': {
      W.lights = E.smooth(ramp(f, 2209, 2250));
      const names = ['ANNA', 'ANN', 'AN', 'A', '?'];
      if (f >= 2150 && f < 2236) W.bubbles.push({ id: 'name', lines: [names[Math.min(4, Math.floor(ramp(f, 2172, 2205) * 4.99))]], w: 0.7, h: 0.32, p: [-0.65, 2.42, 5.05], s: pop(f, 2150), noTail: true, bg: '#ffffff', fg: '#d6333c', border: '#d6333c' });
      if (f >= 2241) W.bubbles.push({ id: 'hi', lines: ["HI, I'M ANNA!"], w: 1.15, h: 0.4, p: [-0.3, 2.45, 5.05], s: pop(f, 2241), tail: 0.25, fg: '#d6333c' });
      if (f >= 2256) W.bubbles.push({ id: 'sem', lines: ["I'M SEM!"], w: 0.85, h: 0.36, p: [1.75, 2.65, 4.2], s: pop(f, 2256), tail: -0.2, fg: '#2f9a4a' });
      if (f >= 2268) W.bubbles.push({ id: 'bram', lines: ["I'M BRAM!"], w: 0.9, h: 0.36, p: [-2.1, 2.7, 4.15], s: pop(f, 2268), tail: 0.2, fg: '#2e3f73' });
      break; }
  }
  return W;
};

// ---------------- 3D FX (all real geometry, see main.js FXG) ----------------
const arc = (t, p0, p1, h) => [lerp(p0[0], p1[0], t), lerp(p0[1], p1[1], t) + Math.sin(t * Math.PI) * h, lerp(p0[2], p1[2], t)];
const burst = (out, f, a, c, n, type, R = 0.8, life = 18, col, k = 1) => { if (f < a || f >= a + life) return; const t = (f - a) / life;
  for (let i = 0; i < n; i++) { const th = i / n * Math.PI * 2 + rnd(i + a) * 0.5, ph = (rnd(i * 3 + a) - 0.3) * 1.2; out.push({ t: type, p: [c[0] + Math.cos(th) * R * E.out(t) * Math.cos(ph), c[1] + Math.sin(ph) * R * E.out(t) + 0.2 * t, c[2] + Math.sin(th) * R * E.out(t) * Math.cos(ph)], r: [t * 4, th + t * 3, 0], s: ((1 - t) * 1.1 + 0.2) * k, c: col ? col[i % col.length] : undefined }); } };
const fall = (out, f, n, c, sz, type, cols, sp = 0.02, h = 4, k = 1) => { for (let i = 0; i < n; i++) { const ph = (f * sp + rnd(i)) % 1; out.push({ t: type, p: [c[0] + (rnd(i * 7) - 0.5) * sz + 0.3 * Math.sin(f * 0.05 + i), c[1] + h * (1 - ph), c[2] + (rnd(i * 11) - 0.5) * sz], r: [f * 0.1 + i, f * 0.07 + i, f * 0.05], s: k, c: cols ? cols[i % cols.length] : undefined }); } };
const steam = (out, f, p, n = 4, seed = 0) => { for (let i = 0; i < n; i++) { const t = ((f * 0.025 + i / n + seed) % 1); out.push({ t: 'puff', p: [p[0] + 0.05 * Math.sin(t * 9 + i), p[1] + t * 0.6, p[2]], s: 0.15 + t * 0.35, c: '#ffffff' }); } };
const CONF = ['#e8343e', '#f6c12e', '#2f6fd1', '#4fbf4a', '#e07ab0', '#f28c28'];
export const fxAt = (f, S) => {
  const out = [];
  const leaves = (n, c, sz) => fall(out, f, n, c, sz, 'leaf', ['#7cc07a', '#f2c33a', '#f28c28'], 0.012, 5);
  switch (S.id) {
    case 'hook':
      burst(out, f, 6, [1.6, 1.8, 6.3], 12, 'sparkle', 0.6, 16);
      if (f >= 56 && f < 80) { const t = ramp(f, 56, 78); out.push({ t: 'apple', p: [13.2, 2.0 + Math.sin(t * Math.PI) * 1.1, -1.6], r: [f * 0.3, 0, 0] }); }
      if (f >= 83 && f < 112) for (let i = 0; i < 6; i++) { const t = ((f - 83) / 20 + i / 6) % 1; out.push({ t: 'tuft', p: [-12.95 + 0.3 * Math.sin(i * 2), 2.3 - t * 1.6, 1.0 + 0.3 * Math.cos(i * 3)], r: [f * 0.2, i, 0], s: 1.2, c: '#c2402f' }); }
      if (f >= 108 && f < 132) for (let i = 0; i < 2; i++) out.push({ t: 'cup', p: [1.35 + 0.35 * Math.cos(f * 0.6 + i * 3), 2.15 + 0.15 * Math.abs(Math.sin(f * 0.4 + i)), -11.0 + 0.35 * Math.sin(f * 0.6 + i * 3)], r: [f * 0.3, 0, f * 0.2] });
      if (f >= 138 && f < 190) { fall(out, f, 26, [-5.5, 0, -9.6], 3.2, 'petal', ['#f07aa8', '#e8343e', '#ffffff'], 0.03, 4); fall(out, f, 20, [-5.5, 0, -9.6], 3.2, 'confetti', CONF, 0.035, 4.5); }
      burst(out, f, 140, [-5.5, 2.6, -9.6], 10, 'star', 1.2, 20);
      if (f >= 150) for (let i = 0; i < 6; i++) { const t = ((f - 150) / 14 + i / 6) % 1; out.push({ t: 'tuft', p: arc(t, [1.1, 1.0, 3.1], [1.0 + (i % 3) * 0.3, 0.05, 3.9 + (i % 2) * 0.3], 0.3), s: 0.8, c: '#d9a23a' }); }
      leaves(10, [0, 0, 3], 14);
      break;
    case 'apt':
      if (f < 230) for (let i = 0; i < 3; i++) { const t = ((f * 0.08 + i / 3) % 1); out.push({ t: 'ring', p: [-0.85, IN + 0.75, -2.42], s: 0.15 + t * 0.35, c: '#f28c28', r: [0, 0.5, 0] }); }
      if (f >= 264 && f < 300) for (let i = 0; i < 3; i++) { const a = 264 + i * 10; if (f >= a) out.push({ t: 'q', p: [-2.0 + (i - 1) * 0.35, IN + 2.05 + 0.05 * Math.sin(f * 0.2 + i), -2.2], r: [0, 0.3 * Math.sin(f * 0.1 + i), 0.2 * (i - 1)], s: pop(f, a) * 0.9 }); }
      burst(out, f, 398, [0.6, IN + 1.9, -0.75], 8, 'sparkle', 0.5, 16);
      steam(out, f, [2.1, IN + 1.05, 1.6], 4);
      if (f >= 420) { fall(out, f, 12, [0.6, IN, -1.6], 1.6, 'sparkle', ['#fff6c0'], 0.006, 2.2, 0.45); }
      if (f >= 400 && f < 450) for (let i = 0; i < 3; i++) { const t = ((f - 400) / 30 + i / 3) % 1; out.push({ t: 'heart', p: [0.55 + 0.15 * Math.sin(t * 6), IN + 2.0 + t * 0.6, -0.75], s: 0.25 * (1 - t) + 0.05, c: '#f07aa8' }); }
      break;
    case 'walk':
      leaves(14, [-6, 0, -4], 16); fall(out, f, 8, [-10, 0, -8], 5, 'petal', ['#f07aa8', '#ffffff'], 0.01, 4);
      steam(out, f, [-0.45, 0.85, -10.1], 3); steam(out, f, [3.55, 0.85, -10.3], 3, 0.4);
      for (let i = 0; i < 6; i++) { const t = ((f * 0.04 + i / 6) % 1); out.push({ t: 'drop', p: arc(t, [3.75, 1.05, -7.0], [3.9, 0.55, -7.4], 0.15) }); }
      break;
    case 'salon':
      if (f >= 640) for (let i = 0; i < 10; i++) { const t = ((f - 640) / 16 + i / 10) % 1; out.push({ t: 'tuft', p: [39.85 + (i % 2) * 0.3 + 0.1 * Math.sin(i), IN + 1.75 - t * 1.0, -1.4 + 0.1 * Math.cos(i)], r: [f * 0.3, i, 0], s: 1.3 }); }
      burst(out, f, 612, [40.0, IN + 1.6, -1.55], 10, 'sparkle', 0.6, 16);
      burst(out, f, 636, [42.4, IN + 1.25, 1.5], 8, 'sparkle', 0.3, 16, null, 0.35);
      break;
    case 'cafe':
      steam(out, f, [0.55, 0.88, -10.15], 4); steam(out, f, [3.55, 0.88, -10.3], 3, 0.5);
      if (f >= 690) { out.push({ t: 'cup', p: [0.45, 0.82, -10.05], s: pop(f, 690) }); out.push({ t: 'pie', p: [0.2, 0.81, -10.25], s: pop(f, 692), r: [0, 1, 0] }); steam(out, f, [0.45, 0.9, -10.05], 4, 0.2); }
      burst(out, f, 692, [0.35, 1.2, -10.1], 10, 'sparkle', 0.5, 16);
      burst(out, f, 702, [0.05, 2.1, -9.75], 6, 'bang', 0.25, 14, ['#e8343e']);
      leaves(8, [0, 0, -9], 10);
      break;
    case 'super':
      if (f >= 744 && f < 776) for (let i = 0; i < 6; i++) { const a = 744 + i * 4; if (f >= a && f < a + 14) { const t = (f - a) / 14; const side = i % 2 ? -1 : 1; const hp = along(f, 714, 776, [78.85, IN, 1.8], [78.85, IN, -0.9]);
        out.push({ t: i % 3 === 2 ? 'apple' : 'item', p: arc(t, [78.8 + side * 0.6, IN + 1.0 + (i % 3) * 0.4, hp[2] - 0.3], [hp[0] + 0.35, IN + 1.05, hp[2] + 0.05], 0.5), r: [t * 6, t * 4, 0], c: CONF[i % 6] }); } }
      if (f >= 780 && f < 830) for (let i = 0; i < 4; i++) { const x = 82.5 + ((f * 0.02 + i * 0.4) % 1.6); out.push({ t: 'item', p: [x, IN + 1.08, 3.0], c: CONF[i] }); }
      burst(out, f, 790, [84.5, IN + 1.75, 2.95], 10, 'sparkle', 0.45, 16);
      burst(out, f, 818, [83.0, IN + 2.25, 3.8], 6, 'heart', 0.4, 18, ['#e07ab0', '#e8343e'], 0.5);
      break;
    case 'wait':
      if (f < 935) { if (f >= 852 && f < 870) for (let i = 0; i < 2; i++) out.push({ t: 'q', p: [10.75 + i * 0.5, 2.6 + 0.05 * Math.sin(f * 0.3 + i), 4.6], s: pop(f, 852 + i * 5) * 0.8, r: [0, 0, (i - 0.5) * 0.4] });
        if (f >= 870 && f < 886) out.push({ t: 'bang', p: [11.0, 2.75, 4.6], s: pop(f, 870, 5) * 1.3 });
        if (f >= 900 && f < 935) for (let i = 0; i < 4; i++) { const t = ((f - 900) / 24 + i / 4) % 1; out.push({ t: 'moth', p: [11.25 + t * 0.8 * Math.cos(i * 1.7), 1.55 + t * 1.2, 4.75 + t * 0.6 * Math.sin(i * 1.7)], r: [Math.sin(f * 1.5 + i) * 0.6, i, 0], s: 1.6 }); }
        burst(out, f, 918, [11.0, 2.4, 4.5], 6, 'sweat', 0.4, 14, null, 0.5); }
      else if (f < 1036) { fall(out, f, 16, [3, 0, 2], 9, 'sparkle', ['#fff1a0', '#ffffff'], 0.008, 5); fall(out, f, 10, [3, 0, 2], 9, 'petal', ['#f07aa8', '#ffffff', '#f6c12e'], 0.01, 4);
        if (f < 985) for (let i = 0; i < 3; i++) { const t = ((f * 0.02 + i / 3) % 1); out.push({ t: 'note', p: [1.5 + t * 1.5, 2.2 + t * 1.6, -6.0 + i * 0.3], r: [0, 0.6, 0.3 * Math.sin(f * 0.2 + i)], c: CONF[i] }); }
        steam(out, f, [3.85, 1.25, 4.45], 3);
        if (f >= 1000) leaves(16, [3, 0, 2], 8);
        if (f >= 1026) out.push({ t: 'sweat', p: [3.85, 1.95 - ((f - 1026) % 12) * 0.02, 4.35], s: 1 }); }
      else leaves(10, [15, 0, -16], 6);
      break;
    case 'loop':
      leaves(12, [-13, 0, 14], 7);
      if (f >= 1086) { out.push({ t: 'bang', p: [-13.25, 2.45, 15.1], s: pop(f, 1086, 5) * 1.2 }); burst(out, f, 1096, [-13.4, 2.05, 15.4], 6, 'sweat', 0.45, 14, null, 0.5); }
      break;
    case 'lobby':
      burst(out, f, 1110, [134.3, IN + 3.0, 1.45], 8, 'sparkle', 0.5, 16);
      if (f >= 1205 && f < 1242) out.push({ t: 'q', p: [129.6, IN + 2.25, -0.5], s: pop(f, 1205) * 0.7, r: [0, 0, 0.2 * Math.sin(f * 0.2)] });
      if (f >= 1278) out.push({ t: 'pie', p: [129.6 + E.out(ramp(f, 1278, 1292)) * 0.5, IN + 1.15, -1.3], s: 0.8, r: [0, f * 0.05, 0], c: '#c98a3e' });
      if (f >= 1286) burst(out, f, 1290, [129.6, IN + 2.05, -0.62], 5, 'sweat', 0.35, 14, null, 0.5);
      break;
    case 'scared':
      if (f < 1450) fall(out, f, 30, [-10, 0, 3.5], 8, 'leaf', ['#7cc07a', '#a08a6a', '#f28c28'], 0.04, 4);
      if (f >= 1326 && f < 1380) for (let i = 0; i < 2; i++) { const t = ((f - 1326) / 14 + i / 2) % 1; out.push({ t: 'sweat', p: [-12.15, 1.7 - t * 0.5, 3.95 + (i ? -0.34 : 0.34)], s: 0.8 }); }
      if (f >= 1390 && f < 1425) for (let i = 0; i < 3; i++) { const t = ((f - 1390) / 12 + i / 3) % 1; out.push({ t: 'ring', p: lerp3([-12.0, 1.62, 3.15], [-12.4, 1.6, 2.0], t), r: [0, Math.PI / 2 + 0.3, 0], s: 0.3 + t * 0.9, c: '#f28c28' }); out.push({ t: 'bolt', p: [-12.0 + 0.4 * Math.cos(i * 2.1 + f * 0.3), 2.1 + 0.2 * Math.sin(i), 3.3], r: [0, Math.PI / 2, 0.4 * Math.sin(f * 0.5 + i)], s: 0.6 }); }
      if (f >= 1500 && f < 1530) burst(out, f, 1503, [-12.05, 0.95, 3.55], 6, 'heart', 0.35, 24, ['#e8343e', '#f07aa8'], 0.45);
      if (f >= 1525 && f < 1575) fall(out, f, 10, [-11.9, 1.4, 3.55], 0.9, 'sparkle', ['#fff1a0'], 0.02, 1.6, 0.35);
      if (f >= 1561) { for (let i = 0; i < 4; i++) { const t = ((f - 1561) / 26 + i / 4) % 1; out.push({ t: 'heart', p: [-12.0 + 0.2 * Math.sin(t * 6 + i), 2.1 + t * 1.0, 3.55 + (i - 1.5) * 0.25], s: 0.35 * (1 - t) + 0.05, c: i % 2 ? '#f07aa8' : '#e8343e' }); } fall(out, f, 14, [-11, 0, 4], 6, 'petal', ['#f07aa8', '#ffffff', '#f6c12e'], 0.012, 4); }
      break;
    case 'morning':
      if (f < 1612) for (let i = 0; i < 3; i++) { const t = ((f * 0.08 + i / 3) % 1); out.push({ t: 'ring', p: [-0.85, IN + 0.75, -2.42], s: 0.15 + t * 0.35, c: '#f28c28', r: [0, 0.5, 0] }); }
      if (f >= 1625) out.push({ t: 'q', p: [-2.0, IN + 2.05 + 0.04 * Math.sin(f * 0.2), -2.2], s: pop(f, 1625), r: [0, 0, 0.15 * Math.sin(f * 0.1)] });
      steam(out, f, [2.1, IN + 1.05, 1.6], 4);
      break;
    case 'notebook':
      for (let i = 0; i < 3; i++) { const t = ((f - 1658) / 30 + i / 3) % 1; out.push({ t: 'heart', p: [41.75 + 0.1 * Math.sin(t * 6 + i), IN + 1.15 + t * 0.35, 1.2], s: 0.16 * (1 - t) + 0.03, c: '#e8343e' }); }
      break;
    case 'reveal':
      if (f >= 1706 && f < 1760) fall(out, f, 20, [0, 7, 18], 10, 'sparkle', ['#fff1a0', '#ffffff'], 0.01, 6);
      for (const [a, p] of [[1800, [-12.8, 2.3, 0.8]], [1826, [12.8, 2.3, -1.2]], [1850, [1.0, 2.3, -10.6]]]) burst(out, f, a, p, 8, 'heart', 0.6, 20, ['#e8343e', '#f07aa8'], 0.45);
      if (f >= 1872) { for (let i = 0; i < 6; i++) { const t = ((f - 1872) / 30 + i / 6) % 1; out.push({ t: 'heart', p: [-1.8 + i * 0.7, 2.7 + t * 1.4, 3.6], s: 0.22 * (1 - t) + 0.05, c: i % 2 ? '#f07aa8' : '#e8343e' }); } }
      if (f < 1730 || f > 1790) leaves(10, [0, 0, 0], 16);
      break;
    case 'outside':
      for (let i = 0; i < 10; i++) { const t = ((f * 0.05 + i / 10) % 1); out.push({ t: 'puff', p: [-30 + i * 7 + t * 4, 0.4 + t * 0.8, 58 + (i % 4) * 3], s: 0.3 + t * 0.6, c: '#c9ccd2' }); }
      if (f >= 1950) { out.push({ t: 'swirl', p: [-2.2, 2.35, 52.6], r: [Math.PI / 2, 0, f * 0.3], s: 1.2 }); out.push({ t: 'swirl', p: [-2.2, 2.5, 52.6], r: [Math.PI / 2, 0, -f * 0.25], s: 0.8, c: '#f6c12e' });
        for (let i = 0; i < 3; i++) out.push({ t: i % 2 ? 'q' : 'bang', p: [-3.1 + i * 0.9, 2.7 + 0.1 * Math.sin(f * 0.3 + i), 52.4], s: pop(f, 1952 + i * 4) * 0.8, r: [0, 0, 0.3 * Math.sin(f * 0.2 + i)] }); }
      if (f < 1950) burst(out, f, 1932, [-2.2, 1.6, 52.8], 6, 'sweat', 0.4, 14);
      break;
    case 'smaller':
      fall(out, f, 14, [0, 0, 5], 16, 'petal', ['#f07aa8', '#ffffff', '#f6c12e'], 0.01, 6);
      if (f >= 2040) for (let i = 0; i < 3; i++) { const t = ((f - 2040) / 20 + i / 3) % 1; out.push({ t: 'apple', p: [12.6 + 0.05 * i, 1.0 + Math.sin(t * Math.PI) * 0.6, -2.5 - i * 1.1], s: 0.9 }); }
      break;
    case 'hairdo':
      for (let i = 0; i < 6; i++) { const t = ((f - 2060) / 30 + i / 6) % 1; out.push({ t: 'sparkle', p: [39.8 + (i % 3) * 0.2, IN + 1.8 + t * 0.4, -1.5], s: (1 - t) * 0.8, r: [0, 0, t * 3] }); }
      burst(out, f, 2083, [40.0, IN + 1.95, -1.55], 10, 'star', 0.5, 16);
      break;
    case 'dance':
      for (let i = 0; i < 5; i++) { const t = ((f * 0.025 + i / 5) % 1); out.push({ t: 'note', p: [-1.0 + t * 3.0, 2.0 + t * 1.6 + 0.2 * Math.sin(t * 9), 3.8 + (i % 2) * 0.6], r: [0, 0.4, 0.3 * Math.sin(f * 0.2 + i)], c: CONF[i] }); }
      fall(out, f, 20, [1, 0, 4.5], 5, 'petal', ['#f07aa8', '#ffffff', '#f6c12e'], 0.015, 4);
      fall(out, f, 14, [1, 0, 4.5], 5, 'confetti', CONF, 0.02, 4);
      break;
    case 'end':
      if (f >= 2209) { fall(out, f, 30, [0, 0, 4.5], 8, 'confetti', CONF, 0.018, 6); fall(out, f, 16, [0, 0, 4.5], 8, 'sparkle', ['#fff1a0', '#ffffff', '#f6c12e'], 0.01, 5); }
      burst(out, f, 2250, [-0.15, 2.3, 5.0], 8, 'heart', 0.6, 24, ['#e8343e', '#f07aa8'], 0.45);
      burst(out, f, 2262, [1.7, 2.6, 4.2], 8, 'star', 0.5, 18);
      burst(out, f, 2274, [-2.0, 2.6, 4.15], 8, 'star', 0.5, 18);
      if (f >= 2165 && f < 2236) out.push({ t: 'q', p: [0.35, 2.4 + 0.05 * Math.sin(f * 0.2), 5.3], s: pop(f, 2190) * 0.8, r: [0, 0, 0.15 * Math.sin(f * 0.1)] });
      break;
  }
  return out;
};
