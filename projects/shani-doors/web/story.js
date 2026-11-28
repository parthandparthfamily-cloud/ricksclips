// "The Village With No Doors" — word-by-word action timeline, 30 fps, timed to Raw/voiceover.mp3 (Raw/script.json).
// Every clause = a story action + a camera move. One continuous camera flight through one village (2 hard cuts, both on word onsets).
import { CAST } from './cast.js';

export const FPS = 30, TOTAL = 2205; // 73.5 s = last word (73.20 s) + 0.3 s
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ramp = (f, a, b) => clamp((f - a) / (b - a));
const sm = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const eo = (t) => 1 - Math.pow(1 - clamp(t), 3);
const ei = (t) => Math.pow(clamp(t), 3);
const back = (t, s = 1.7) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };
const spring = (t, fr = 2.2, d = 4.5) => (t <= 0 ? 0 : 1 - Math.exp(-d * t) * Math.cos(fr * 2 * Math.PI * t));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const blinkAt = (f, seed) => { const per = 38 + (seed * 17) % 31, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
const seq = (f, list) => { let v = list[0][1]; for (const [ff, x] of list) if (f >= ff) v = x; return v; };
const hsh = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

// ---------- shots ----------
export const SHOTS = [
  ['hook', 0, 'day'], ['nodoor', 40, 'day'], ['centuries', 79, 'day'], ['imagine', 139, 'day'], ['shingnapur', 165, 'day'], ['village', 193, 'day'],
  ['landlord', 236, 'day'], ['walls', 286, 'day'], ['roof', 312, 'day'], ['frame', 328, 'day'], ['nodoor2', 372, 'day'], ['lock', 400, 'day'],
  ['laugh', 460, 'day'], ['why', 502, 'day'], ['night', 520, 'night'], ['footsteps', 565, 'night'], ['hide', 633, 'night'], ['shoe', 688, 'night'],
  ['days', 722, 'day'], ['neighbours', 787, 'day'], ['kids', 866, 'day'], ['bank', 957, 'day'], ['reason', 1024, 'day'], ['stone', 1082, 'stone'],
  ['notemple', 1152, 'day'], ['lordshani', 1225, 'day'], ['steal', 1293, 'day'], ['police', 1335, 'day'], ['ruins', 1378, 'day'], ['blind', 1410, 'day'],
  ['losses', 1432, 'day'], ['seven', 1452, 'day'], ['leaving', 1528, 'day'], ['safe', 1612, 'night'], ['pilgrims', 1708, 'day'], ['strangers', 1806, 'day'],
  ['news', 1892, 'day'], ['again', 1968, 'day'], ['station', 2020, 'day'], ['walkhome', 2090, 'golden'], ['notice', 2121, 'golden'], ['door', 2180, 'golden'],
].map(([id, a, light], i, arr) => ({ id, a, b: (arr[i + 1] ? arr[i + 1][1] : TOTAL) - 1, light }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lights ----------
export const LIGHTS = {
  day: { az: 70, el: 50, sky: '#d4e8ff', ground: '#a08a6a', hemi: 1.18, sun: '#fff3e0', sunI: 2.15, fog: '#d6ecfb', fogNear: 70, fogFar: 700, skyTop: '#3d8be0', skyHor: '#cfe8fb', sat: 1.1, vig: 0.18, shadowExt: 16, lamp: 0, lamp2: 0, stars: 0 },
  stone: { az: 8, el: 56, sky: '#d4e8ff', ground: '#a08a6a', hemi: 1.15, sun: '#fff1d6', sunI: 2.3, fog: '#d6ecfb', fogNear: 70, fogFar: 700, skyTop: '#3383dc', skyHor: '#d8eefc', sunDisc: '#fff6d0', sunSize: 0.006, sat: 1.12, vig: 0.18, shadowExt: 10, lamp: 0, lamp2: 0, stars: 0 },
  night: { az: 120, el: 42, sky: '#5f82e8', ground: '#283270', hemi: 0.85, sun: '#b8ccff', sunI: 0.95, fog: '#26407e', fogNear: 30, fogFar: 260, skyTop: '#0e2266', skyHor: '#3459aa', sat: 1.15, vig: 0.28, shadowExt: 14, lamp: 3.2, lamp2: 2.0, stars: 1 },
  golden: { az: 168, el: 13, sky: '#c2b4e0', ground: '#8a6448', hemi: 1.05, sun: '#ffc07a', sunI: 2.5, fog: '#f4cfa6', fogNear: 60, fogFar: 600, skyTop: '#5b7fd4', skyHor: '#ffcf98', sunDisc: '#fff0c8', sunSize: 0.004, sat: 1.12, vig: 0.22, shadowExt: 16, lamp: 0, lamp2: 0.6, stars: 0 },
  dusk: { az: 175, el: 4, sky: '#b49ad0', ground: '#6a4a50', hemi: 1.0, sun: '#ff9a6a', sunI: 1.8, fog: '#e8a890', fogNear: 50, fogFar: 500, skyTop: '#3f4fa0', skyHor: '#ffa070', sunDisc: '#ffe0b0', sunSize: 0.004, sat: 1.12, vig: 0.24, shadowExt: 16, lamp: 1.2, lamp2: 1, stars: 0.2 },
};
const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixHex = (a, b, t) => '#' + hx(a).map((v, i) => Math.round(lerp(v, hx(b)[i], t)).toString(16).padStart(2, '0')).join('');
const mixL = (A, B, t) => { const o = {}; for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) { const a = A[k] ?? B[k], b = B[k] ?? A[k]; o[k] = typeof a === 'number' ? lerp(a, b, t) : typeof a === 'string' && a[0] === '#' ? mixHex(a, b, t) : (t < 0.5 ? a : b); } return o; };
const LT = [[505, 532, 'day', 'night'], [700, 732, 'night', 'day'], [1600, 1626, 'day', 'night'], [1700, 1724, 'night', 'day'], [2080, 2104, 'day', 'golden'], [1074, 1090, 'day', 'stone'], [1150, 1168, 'stone', 'day']];
export const lightFor = (S, f) => {
  for (const [a, b, A, B] of LT) if (f >= a && f <= b) return mixL(LIGHTS[A], LIGHTS[B], sm(ramp(f, a, b)));
  if (S.id === 'days') { // time-lapse: two quick day->dusk->night->dawn swings, shadows sweep
    const p = ((f - 732) / 50) % 1, L0 = { ...LIGHTS.day };
    const L = p < 0.33 ? mixL(L0, LIGHTS.dusk, sm(p / 0.33)) : p < 0.66 ? mixL(LIGHTS.dusk, LIGHTS.night, sm((p - 0.33) / 0.33)) : mixL(LIGHTS.night, L0, sm((p - 0.66) / 0.34));
    L.az = 70 + (f - 732) * 7; return f < 732 ? LIGHTS.day : L; }
  return LIGHTS[S.light];
};

// ---------- world coordinates (see main.js) ----------
const DOOR = [-0.6, 0, -3.4];           // your doorway (empty frame)
const BED = [-1.85, 0.53, -7.5], PILLOW = [-1.85, 0.6, -8.25], TABLE = [1.75, 0.81, -8.1], SILL = [1.55, 1.12, -3.75], SHOE = [-1.2, 0, -4.5];
const CHAIR = [1.0, 0.47, -7.6];
const NEWDOOR = [-7.6, 0, -3.4], HASP = [-7.12, 1.12, -3.22];
const STONE = [37, 2.1, 0];
const ARCH = [-33, 0, 0];

// ---------- camera: one continuous key list ----------
// k(f, pos, look, fov, roll, ease, path)
const k = (f, pos, look, fov = 46, roll = 0, ease = 'sm', path = null) => ({ f, pos, look, fov, roll, ease, path });
const CK = [
  // hook: rush down the street past laundry to an empty door frame
  k(0, [-31.5, 2.15, -1.15], [-22, 1.75, -2.4], 50, -3),
  k(36, [-19.6, 1.7, -0.35], [-14.6, 1.3, -3.5], 50, 2, 'eo'),
  k(44, [-17.0, 1.55, 0.1], [-14.6, 1.25, -3.4], 50, 1.5),
  k(78, [-15.9, 1.5, -0.55], [-14.6, 1.25, -3.4], 47, -1, 'lin'),
  // centuries: crane up over the rooftops, then drop onto the thief at house n6
  k(98, [-9.0, 7.8, 4.2], [3.5, 1.0, -2.6], 52, -2, 'sm', [[-13.5, 4.5, 2.5]]),
  k(114, [3.2, 2.2, 1.6], [6.8, 1.15, -2.9], 48, 2, 'sm'),
  k(138, [3.7, 1.95, 1.2], [7.5, 1.15, -2.4], 46, 3, 'lin'),
  // HARD CUT 1 on "Imagine": auto-rickshaw arrives outside the village arch
  k(139, [-36.2, 1.05, 3.4], [-41.5, 1.0, -1.2], 46, -2),
  k(164, [-36.6, 1.15, 3.0], [-40.6, 1.1, -0.9], 44, 0, 'lin'),
  k(180, [-45.6, 2.0, 1.4], [-33.6, 4.3, 0], 50, 2, 'sm', [[-39.5, 1.7, 5.2]]),
  k(193, [-46.4, 2.2, 1.2], [-33.6, 4.4, 0], 49, 1, 'lin'),
  // "a small village in india": rise over the arch and swoop across the rooftops
  k(214, [-31.0, 10.5, 6.5], [-4, 0, -2], 52, -3),
  k(236, [-12.0, 9.0, 7.5], [-1, 0.5, -3], 52, 3, 'lin'),
  k(252, [1.7, 1.65, 2.7], [0.35, 1.35, -2.4], 50, -1, 'eo'),
  k(285, [1.35, 1.6, 2.3], [0.3, 1.35, -2.4], 48, 1, 'lin'),
  // walls / roof / frame / no door
  k(294, [2.6, 1.5, -0.5], [0.7, 1.4, -3.0], 50, 2, 'eo'),
  k(311, [2.45, 1.5, -0.4], [0.7, 1.45, -3.0], 49, 0, 'lin'),
  k(318, [2.3, 1.0, -0.4], [0.8, 3.7, -3.6], 56, -2, 'eo'),
  k(327, [2.2, 1.0, -0.3], [0.7, 3.75, -3.6], 56, -1, 'lin'),
  k(338, [0.4, 1.35, -0.6], [-0.5, 1.2, -3.4], 50, 1, 'eo'),
  k(371, [0.25, 1.33, -0.85], [-0.55, 1.2, -3.4], 48, 2, 'lin'),
  k(380, [1.5, 1.5, 0.7], [-0.3, 1.25, -2.9], 50, -1, 'eo'),
  k(399, [1.3, 1.5, 0.55], [-0.3, 1.25, -2.9], 49, 0, 'lin'),
  // lock: orbit the two of them
  k(408, [1.4, 1.5, 0.3], [0.0, 1.35, -2.2], 46, 1, 'eo'),
  k(459, [-0.8, 1.5, 0.55], [0.0, 1.35, -2.2], 44, -2, 'sm'),
  k(470, [0.95, 1.5, -0.85], [0.45, 1.45, -2.55], 46, 2, 'eo'),
  k(501, [0.85, 1.48, -1.05], [0.4, 1.42, -2.55], 44, -1, 'lin'),
  k(511, [2.7, 2.15, 2.7], [0.6, 1.2, -2.2], 52, 2, 'eo'),
  k(519, [2.6, 2.1, 2.5], [0.4, 1.2, -2.4], 52, 1, 'lin'),
  // night: push through the empty doorway into the room
  k(534, [-0.6, 1.5, -3.6], [-1.0, 1.15, -7.4], 52, 0, 'sm', [[-0.6, 1.55, -0.8]]),
  k(548, [1.3, 1.45, -5.0], [-1.45, 1.0, -7.3], 48, 2, 'eo'),
  k(564, [1.15, 1.42, -5.15], [-1.45, 1.0, -7.3], 47, 0, 'lin'),
  // footsteps: fly out and look back in through the doorway (the "thief" outside)
  k(580, [-0.15, 1.3, 0.9], [-0.95, 1.0, -6.6], 50, -2, 'sm', [[-0.6, 1.4, -3.4]]),
  k(632, [-0.3, 1.25, 0.5], [-1.0, 1.0, -6.6], 47, 1.5, 'lin'),
  // hide: back inside, macro on the pillow, then pull back
  k(648, [-0.75, 1.05, -6.9], [-1.85, 0.6, -8.2], 46, 2, 'sm', [[-0.6, 1.3, -3.6]]),
  k(662, [-0.85, 1.0, -7.05], [-1.85, 0.6, -8.2], 44, 0, 'lin'),
  k(676, [0.7, 1.35, -6.2], [-1.55, 0.95, -7.5], 48, -2, 'eo'),
  k(687, [0.8, 1.38, -6.0], [-1.5, 0.95, -7.4], 48, -1, 'lin'),
  // shoe: low macro by the door, tilt up to the grin
  k(696, [-0.3, 0.42, -5.6], [-1.1, 0.12, -4.5], 44, 2, 'eo'),
  k(708, [-0.25, 0.45, -5.65], [-1.1, 0.14, -4.5], 44, 1, 'lin'),
  k(721, [-0.2, 1.1, -6.7], [-2.1, 1.3, -5.4], 50, -1, 'eo'),
  // days pass: out to the street, time-lapse in front of your doorway
  k(738, [0.45, 1.55, 1.7], [-0.6, 1.0, -3.1], 48, 0, 'sm', [[-0.6, 1.4, -3.4]]),
  k(786, [0.2, 1.5, 1.2], [-0.6, 1.0, -3.1], 45, 1.5, 'lin'),
  // HARD CUT 2 on "Neighbours": inside, looking out through the open doorway
  k(787, [2.5, 1.5, -8.8], [-0.8, 1.15, -5.05], 56, -1),
  k(865, [2.4, 1.48, -8.6], [-0.95, 1.12, -4.9], 54, 1.5, 'lin'),
  // kids: wide from the corner, follow them back out
  k(874, [2.35, 1.95, -8.7], [-0.6, 0.65, -5.3], 58, -2, 'eo'),
  k(925, [2.2, 1.9, -8.5], [-0.9, 0.7, -6.0], 56, 1, 'sm'),
  k(956, [1.9, 1.8, -8.2], [-0.6, 1.0, -3.6], 54, 2, 'sm'),
  // bank: whip out the door, across the street and into the open bank
  k(984, [14.2, 1.7, 4.4], [12.8, 1.3, 9.3], 50, -3, 'sm', [[-0.6, 1.5, -3.2], [5.5, 1.9, -0.2]]),
  k(1023, [14.6, 1.6, 5.2], [12.6, 1.25, 9.4], 46, 1, 'lin'),
  // the reason: rise out of the bank and fly to the plaza
  k(1068, [29.0, 5.2, 5.6], [37, 1.8, 0], 48, -2, 'sm', [[14.4, 2.0, 2.0], [22, 7.0, 4.0]]),
  k(1081, [30.0, 4.6, 5.0], [37, 1.9, 0], 46, 0, 'lin'),
  // the stone: macro on the base, tilt up into the sun
  k(1094, [35.65, 1.55, 0.85], [37, 1.4, 0], 42, 2, 'eo'),
  k(1112, [35.55, 1.5, 0.95], [37, 1.6, 0], 42, 0, 'lin'),
  k(1134, [34.9, 1.25, 1.2], [37, 3.3, -0.1], 54, -2, 'sm'),
  k(1151, [34.8, 1.22, 1.3], [37, 3.4, -0.1], 54, -1, 'lin'),
  // no temple, no roof: orbit, then crane straight up over the open stone
  k(1172, [31.8, 3.0, 5.6], [37, 2.0, 0], 50, 2, 'sm'),
  k(1190, [33.2, 3.6, 6.4], [37, 2.0, 0], 50, -1, 'sm'),
  k(1212, [36.2, 9.6, 2.4], [37, 1.6, 0], 50, 2, 'sm'),
  k(1224, [36.4, 10.0, 2.2], [37, 1.6, 0.05], 50, 3, 'lin'),
  // Lord Shani: drop down and dolly along the faces of the crowd
  k(1240, [34.6, 1.9, 3.8], [31.0, 1.45, 0.4], 48, -2, 'eo'),
  k(1292, [34.4, 1.85, -0.8], [31.0, 1.45, -0.6], 46, 2, 'lin'),
  // steal: whip back to the street, house n7
  k(1308, [11.5, 1.1, 0.5], [13.4, 1.2, -3.2], 48, -3, 'sm', [[24, 3.5, 2.0]]),
  k(1334, [11.2, 1.15, 0.65], [12.9, 1.2, -2.6], 47, 1, 'lin'),
  k(1346, [7.3, 1.45, -0.7], [9.6, 1.05, 2.2], 48, 2, 'eo'),
  k(1377, [7.1, 1.45, -0.8], [9.5, 1.05, 2.2], 46, -1, 'lin'),
  k(1388, [4.6, 1.9, 2.6], [7.4, 2.0, 0.2], 52, -2, 'eo'),
  k(1409, [4.4, 1.85, 2.5], [7.0, 1.9, -0.1], 50, 1, 'lin'),
  k(1418, [2.9, 1.5, -0.2], [4.6, 1.3, -2.5], 48, 2, 'eo'),
  k(1431, [3.0, 1.45, -0.35], [4.5, 1.3, -2.6], 46, -1, 'lin'),
  k(1440, [2.9, 1.35, -0.15], [4.4, 0.95, -2.4], 52, 1, 'eo'),
  k(1451, [2.85, 1.3, -0.2], [4.4, 0.9, -2.4], 52, 2, 'lin'),
  k(1472, [0.8, 2.4, 2.5], [3.8, 1.4, -1.6], 54, -2, 'eo'),
  k(1527, [0.5, 2.5, 2.6], [3.6, 1.4, -1.5], 52, 1, 'lin'),
  // leaving: back through your doorway; phone on the table, wallet on the sill
  k(1548, [-1.5, 1.5, -7.1], [1.5, 1.0, -7.7], 48, 2, 'sm', [[-0.6, 1.5, -1.0], [-0.6, 1.5, -3.6]]),
  k(1564, [-1.6, 1.5, -7.25], [1.5, 1.0, -7.6], 46, 0, 'lin'),
  k(1578, [-1.9, 1.55, -7.3], [1.3, 1.15, -5.3], 48, 1, 'sm'),
  k(1590, [-0.5, 1.5, -6.4], [1.4, 1.2, -3.9], 48, -2, 'sm'),
  k(1611, [-0.4, 1.5, -6.2], [1.45, 1.15, -3.85], 47, 0, 'lin'),
  // completely safe: night, sleeping like a baby
  k(1632, [0.9, 1.7, -5.6], [-1.75, 0.75, -7.4], 48, 1, 'sm'),
  k(1707, [0.55, 1.55, -5.95], [-1.8, 0.75, -7.45], 44, -1.5, 'lin'),
  // pilgrims: out the door and up over the street, the crowd pours in
  k(1738, [-4.5, 7.4, 1.2], [-17, 0.6, 0], 52, -2, 'sm', [[-0.6, 1.5, -3.4], [-0.8, 2.6, 1.2]]),
  k(1805, [-3.0, 6.6, 1.4], [-11, 0.8, 0], 50, 2, 'lin'),
  // strangers: dolly through the crowd at head height
  k(1818, [-9.2, 1.55, 2.6], [-11.6, 1.35, -0.5], 48, -2, 'eo'),
  k(1891, [-6.6, 1.55, 2.5], [-8.6, 1.35, -0.9], 46, 1.5, 'lin'),
  // news: paper flies at the lens, pull back on the gossip at the chai stall
  k(1900, [-9.4, 1.65, 1.0], [-11.3, 1.4, 4.3], 48, 2, 'eo'),
  k(1940, [-9.0, 1.7, 0.6], [-11.4, 1.35, 4.4], 48, -1, 'sm'),
  k(1967, [-8.8, 1.7, 0.5], [-11.4, 1.35, 4.4], 46, 1, 'lin'),
  // again: a bag snatched
  k(1978, [-3.0, 1.5, 3.7], [-5.2, 1.2, 0.3], 48, -2, 'eo'),
  k(2019, [-3.4, 1.55, 3.4], [-9.0, 1.2, 0.0], 50, 2, 'sm'),
  // police station rises from the empty plot
  k(2036, [-12.0, 1.7, -1.7], [-14.4, 1.9, 4.6], 52, -1, 'eo'),
  k(2089, [-11.0, 3.0, -2.4], [-14.4, 2.2, 4.4], 52, 2, 'sm'),
  // walk home at golden hour, the new house, the door
  k(2100, [-10.4, 1.55, 1.9], [-11.0, 1.25, -1.6], 48, -1, 'eo'),
  k(2121, [-9.2, 1.55, 1.9], [-9.6, 1.25, -1.6], 48, 0, 'lin'),
  k(2140, [-5.6, 1.65, 2.0], [-7.8, 1.45, -2.5], 50, 2, 'eo'),
  k(2180, [-5.75, 1.62, 1.7], [-7.85, 1.45, -2.55], 49, -1, 'lin'),
  k(2188, [-6.1, 1.55, 0.3], [-8.15, 1.35, -2.8], 54, 1, 'eo'),
  k(2204, [-6.2, 1.55, 0.15], [-8.15, 1.35, -2.8], 52, -2, 'lin'),
];
const EASE = { sm, eo, lin: (t) => clamp(t) };
const spline = (pts, u) => { const n = pts.length - 1, x = clamp(u) * n, i = Math.min(n - 1, Math.floor(x)), t = x - i; const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  return p1.map((_, j) => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t * t * t)); };
const KICKS = [{ f: 385, a: 0.02 }, { f: 505, a: 0.02 }, { f: 600, a: 0.03 }, { f: 1392, a: 0.05 }, { f: 1425, a: 0.04 }, { f: 1502, a: 0.035 }, { f: 1985, a: 0.03 }, { f: 2060, a: 0.04 }, { f: 2189, a: 0.07 }];
export const camAt = (f) => {
  let c; const K = CK;
  if (f <= K[0].f) c = { ...K[0] }; else if (f >= K[K.length - 1].f) c = { ...K[K.length - 1] };
  else { const i = K.findIndex((x, j) => f >= x.f && f < K[j + 1].f), a = K[i], b = K[i + 1], t = EASE[b.ease]((f - a.f) / (b.f - a.f));
    const pos = b.path ? spline([a.pos, ...b.path, b.pos], t) : lerp3(a.pos, b.pos, t);
    c = { pos, look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll, b.roll, t) }; }
  // handheld drift (slow, smooth) + impact kicks
  const tt = f / 30; c.look = [c.look[0] + 0.012 * Math.sin(tt * 1.7) + 0.006 * Math.sin(tt * 3.1), c.look[1] + 0.01 * Math.sin(tt * 1.3 + 1), c.look[2] + 0.01 * Math.cos(tt * 1.1)];
  c.roll += 0.35 * Math.sin(tt * 0.9) + 0.15 * Math.sin(tt * 2.3);
  for (const kk of KICKS) { const d = f - kk.f; if (d >= 0 && d < 8) { const s = (d % 2 ? -1 : 1) * kk.a * (1 - d / 8); c.look = [c.look[0] + s * 1.5, c.look[1] + s * 2.5, c.look[2]]; c.roll += s * 25; } }
  c.flash = f >= 1392 && f < 1396 ? [0.7, 0.45, 0.2, 0.05][f - 1392] : 0; // the one white flash: the lightning bolt
  return c;
};

// ---------- lens ----------
const FOC = { hook: 9, nodoor: 10, centuries: 7, imagine: 9, shingnapur: 8, village: 4, stone: 13, hide: 14, shoe: 14, losses: 12, safe: 10, news: 10 };
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f); let focus = dist(C.pos, C.look); if (S.id === 'shingnapur') focus = Math.min(focus, 5.5); if (S.id === 'neighbours') focus = 2.0; if (S.id === 'kids') focus = 3.6;
  return { focus, cinf: FOC[S.id] ?? 8, near: 0.6 }; };

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { night: S.light === 'night' };
  // the street cow wanders; at night it is the "footsteps" at your doorway
  if (f < 140) W.cow = { x: -17 + f * 0.012, z: 1.6, ry: 0.05, walk: 1 };
  else if (S.id === 'footsteps') { const t = clamp((f - 572) / 28), t2 = clamp((f - 612) / 25); W.cow = { x: 3.6 - t * 3.15 - t2 * 3.0, z: -1.55, ry: Math.PI - (f > 598 && f < 614 ? 0.55 * sm(ramp(f, 598, 604)) : 0), walk: (f < 600 || f > 612) ? 1 : 0 }; }
  else if (f >= 1708 && f < 1900) W.cow = { x: -2.5 + (f - 1708) * 0.006, z: 2.3, ry: 0.4, walk: 1 };
  else W.cow = { x: 19.5, z: 1.7, ry: 2.6, walk: 0, graze: 1 };
  if (S.id === 'imagine' || S.id === 'shingnapur' || S.id === 'village') { const t = eo(ramp(f, 139, 154)); W.auto = { x: lerp(-56, -40.6, t), z: -2.2, ry: 0, bump: f > 150 && f < 158 ? 0.03 * Math.sin((f - 150) * 1.6) : 0 }; } else W.auto = { x: -46, z: 9, ry: 1.2 };
  W.dog = S.id === 'footsteps' ? { x: 2.2, z: 0.4, ry: 2.8 } : S.id === 'blind' || S.id === 'losses' || S.id === 'seven' ? { x: 2.0, z: 1.2, ry: 0.8, bark: 1 } : { x: -5.4, z: 4.7, ry: 0.4 };
  W.pump = f < 140 || (f > 1700 && f < 2000);
  W.bell = (S.id === 'lordshani' || S.id === 'notemple') ? 0.35 : S.id === 'again' ? 0.25 : 0.05;
  W.oil = S.id === 'notemple' ? clamp((f - 1176) / 10) * (f < 1215 ? 1 : 0) : S.id === 'stone' && f > 1098 ? 1 : 0;
  W.vault = S.id === 'bank' ? lerp(-1.9, -1.62, sm(ramp(f, 990, 1004))) * 1 : -1.9;
  W.pillow = S.id === 'hide' ? 0.08 * Math.sin(clamp((f - 648) / 12) * Math.PI) : 0;
  // the neighbour's brand-new door: open, then SLAM on "door"
  if (f >= 2121) { W.door = f < 2182 ? 1 : 1 - ei(ramp(f, 2182, 2189)); if (f > 2189) W.door = -0.03 * Math.exp(-(f - 2189) / 3) * Math.sin((f - 2189) * 1.8); W.ribbon = 1; }
  W.police = f < 2030 ? 0 : spring((f - 2030) / 30, 1.2, 5);
  W.signDrop = f < 2062 ? 2.5 : 1.2 * (1 - spring((f - 2062) / 30, 1.6, 6)) - 0.0;
  if (f >= 2062) W.signDrop = Math.max(-0.05, W.signDrop);
  return W;
};

// ---------- actors ----------
const U = 0.00225;
const ARM = { hang: [78, -290], hip: [64, -330], wave: [128, -550], up: [100, -590], point: [186, -446], hold: [36, -362], holdUp: [100, -430], staff: [100, -384], chin: [20, -450], mouth: [44, -486], cross: [-26, -384], thumb: [136, -446] };
const KIDARM = { hang: [74, -225], hip: [60, -265], wave: [124, -415], up: [96, -455], point: [182, -311], hold: [32, -227], holdUp: [96, -295], chin: [20, -320], mouth: [44, -351] };
/** hand position in card px (x right, y up from the soles) for a given arm pose & side (+1 = R) */
const hand = (who, pose, side, k = 1.15, sit = false) => { const kid = CAST[who].kid; let [x, y] = (kid ? KIDARM : ARM)[pose] ?? ARM.hang; if (sit) y += kid ? 175 : 255; return [side * x * k, -y * k + (sit ? 215 : 0)]; };
const act = (who, pos, o = {}, ex = {}) => {
  const c = CAST[who], kid = !!c.kid, kk = ex.k ?? (kid ? 1.0 : 1.15), sit = o.pose === 'sit';
  const oo = { ...o }; for (const key of ['headTilt']) if (oo[key] != null) oo[key] = q(oo[key], 0);
  for (const key of ['look', 'talk', 'squash']) if (oo[key] != null) oo[key] = q(oo[key], 2);
  if (oo.walk != null) oo.walk = q(oo.walk % 1, 2);
  for (const s of ['L', 'R']) if (oo[s] && typeof oo[s] === 'object') oo[s] = { ...oo[s], t: q(clamp(oo[s].t), 2) };
  const oy = sit ? 760 : 975, s = ex.s || 1;
  return { key: who + JSON.stringify(oo) + kk, draw: (g) => { g.translate(300, oy); g.scale(kk, kk); T_.rick(g, c, oo); }, x: pos[0], y: pos[1] - (sit ? 215 * U * s : 0), z: pos[2], ground: ex.ground ?? 0, ...ex };
};
let T_ = null;
const idle = (f, seed) => ({ headTilt: 3 * Math.sin((f + seed * 9) * 0.07), look: q(0.35 * Math.sin((f + seed * 21) * 0.045) + (hsh(Math.floor((f + seed * 7) / 18) + seed) - 0.5) * 0.5, 1), blink: blinkAt(f, seed) });
const sway = (f, seed, a = 0.025) => a * Math.sin((f + seed * 13) * 0.06);
const walkTo = (f, f0, f1, A, B, ease = (t) => t) => { const t = ease(ramp(f, f0, f1)); return [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)]; };
const wphase = (f, speed = 1.0) => (f * speed / 30 / 1.1) % 1;

export const actorsAt = (f, T) => {
  T_ = T; const S = shotAt(f), out = []; const A = (who, pos, o, ex) => out.push(act(who, pos, o, ex));
  const tt = f / 30;
  switch (S.id) {
    case 'hook': {
      // street already alive: a kid sprints with his bat, a woman carries water, the uncle strolls, the landlord sweeps... everyone walks through empty door frames
      A('kid1', [-27 + f * 0.09, 0, -0.7], { ...idle(f, 1), expr: 'beam', R: 'up', L: 'hang', walk: wphase(f, 2.4) }, { roll: sway(f, 1, 0.08), props: [{ m: 'bat', x: 96, y: 450, dz: 0.05, rz: -0.2 }] });
      A('kid2', [-25.4 + f * 0.085, 0, -0.2], { ...idle(f, 2), expr: 'laugh', R: 'wave', L: 'hang', walk: wphase(f + 9, 2.4) }, { roll: sway(f, 2, 0.08) });
      A('pilgrim2', [-20.5 + f * 0.02, 0, -2.6 + clamp(f / 30) * 0.8], { ...idle(f, 3), expr: 'smile', L: 'holdUp', R: 'hang', walk: wphase(f, 1) }, { props: [{ m: 'pot', x: -60, y: 760, dz: 0.02 }] });
      A('uncle', [-14.6, 0, -4.2 + clamp((f - 4) / 40) * 1.4], { ...idle(f, 4), expr: f < 24 ? 'sleepy' : 'grin', L: 'hang', R: { a: 'hang', b: 'wave', t: ramp(f, 22, 32) }, walk: f < 40 ? wphase(f) : null }, { roll: sway(f, 4) });
      A('aunty', [-22.4, 0, 2.6], { ...idle(f, 5), expr: 'smile', L: 'hold', R: { a: 'hang', b: 'wave', t: 0.5 + 0.5 * Math.sin(tt * 6) }, }, { props: [{ m: 'brassPot', x: -40, y: 360, dz: 0.08, s: 0.9 }] });
      break; }
    case 'nodoor': {
      const p = walkTo(f, 40, 66, [-14.6, 0, -2.8], [-14.9, 0, -2.1], eo);
      A('uncle', p, { ...idle(f, 4), expr: seq(f, [[40, 'grin'], [58, 'beam'], [70, 'smugsmile']]), L: 'hip', R: { a: 'hang', b: 'wave', t: ramp(f, 52, 60) }, walk: f < 66 ? wphase(f) : null }, { roll: sway(f, 4) });
      A('aunty', [-13.15, 0, -2.5], { ...idle(f, 5), expr: f > 60 ? 'beam' : 'smile', L: 'hold', R: { a: 'hang', b: 'wave', t: ramp(f, 58, 64) } }, { props: [{ m: 'brassPot', x: -40, y: 360, dz: 0.08, s: 0.9 }] });
      A('kid1', [-12.4 + (f - 40) * 0.06, 0, -0.6], { ...idle(f, 1), expr: 'beam', R: 'up', walk: wphase(f, 2.4) }, { props: [{ m: 'bat', x: 96, y: 450, dz: 0.05, rz: -0.2 }] });
      break; }
    case 'centuries': {
      // the thief tiptoes to an open doorway full of gold, freezes, looks up... and runs
      const tp = f < 118 ? walkTo(f, 98, 118, [5.0, 0, -1.4], [6.5, 0, -2.75]) : f < 124 ? [6.5, 0, -2.75] : walkTo(f, 124, 138, [6.5, 0, -2.75], [9.6, 0, -0.9], ei);
      const fr = f >= 118 && f < 124;
      A('thief', tp, { expr: f < 116 ? 'sly' : fr ? 'shock' : 'nervous', L: f < 118 ? 'hold' : 'up', R: f < 118 ? { a: 'hang', b: 'point', t: ramp(f, 104, 116) } : 'up', look: f < 118 ? 0.6 : -0.5, headTilt: fr ? -8 : 0, walk: f < 118 ? wphase(f, 0.7) : f >= 124 ? wphase(f, 3) : null, blink: blinkAt(f, 9) },
        { squash: 0, roll: fr ? 0 : sway(f, 9, 0.06), y: fr ? 0.04 * Math.abs(Math.sin(f)) : 0 });
      A('aunty', [3.2, 0, -2.6], { ...idle(f, 5), expr: 'smile', L: 'hold', R: 'hang' }, { props: [{ m: 'brassPot', x: -40, y: 360, dz: 0.08, s: 0.9 }] });
      A('pilgrim1', [10.5, 0, 1.4], { ...idle(f, 6), expr: 'smile', L: 'chin', R: 'chin' });
      break; }
    case 'imagine': {
      const out_ = f >= 152; const p = out_ ? walkTo(f, 152, 162, [-40.4, 0.45, -1.5], [-39.6, 0, -0.5], eo) : [-40.9, 0.2, -2.2];
      if (out_) A('you', p, { ...idle(f, 10), expr: f < 158 ? 'grin' : 'beam', L: 'hang', R: 'hold', walk: f < 162 ? wphase(f, 2) : null }, { y: p[1] + (f < 162 ? 0.18 * Math.sin(ramp(f, 152, 162) * Math.PI) : 0), props: [{ m: 'suitcase', x: 40, y: 160, dz: 0.12, s: 1 }] });
      A('pilgrim3', [-43.2, 0, 4.5], { ...idle(f, 11), expr: 'smile', L: 'hang', R: 'wave' });
      break; }
    case 'shingnapur': {
      const p = walkTo(f, 165, 193, [-39.6, 0, -0.5], [-38.6, 0, 0.9]);
      A('you', p, { ...idle(f, 10), expr: f < 176 ? 'shock' : 'beam', look: 0.4, headTilt: -10, L: 'hang', R: 'hold', walk: wphase(f, 1) }, { props: [{ m: 'suitcase', x: 40, y: 160, dz: 0.12 }] });
      A('pilgrim3', [-36.8, 0, -1.8], { ...idle(f, 11), expr: 'smile', L: 'hang', R: 'holdUp', walk: wphase(f) }, { props: [{ m: 'cam', x: 115, y: 500, dz: 0.08 }] });
      A('pilgrim1', [-35.6 + (f - 165) * 0.02, 0, 3.0], { ...idle(f, 6), expr: 'smile', L: 'chin', R: 'chin', walk: wphase(f) });
      break; }
    case 'village': {
      A('you', walkTo(f, 193, 236, [-38.4, 0, 1.6], [-34.6, 0, 0.8]), { ...idle(f, 10), expr: 'beam', L: 'hang', R: 'hold', walk: wphase(f, 1.2) }, { props: [{ m: 'suitcase', x: 40, y: 160, dz: 0.12 }] });
      for (let i = 0; i < 6; i++) { const who = ['pilgrim1', 'pilgrim2', 'pilgrim3', 'uncle', 'kid1', 'aunty'][i]; A(who, [-26 + i * 5.5 + Math.sin(tt + i) * 0.8, 0, (i % 2 ? 1.3 : -1.6)], { ...idle(f, 20 + i), expr: 'smile', walk: wphase(f + i * 7) }); }
      A('landlord', [-1.8, 0, -1.9], { ...idle(f, 12), expr: 'grin', R: 'wave', L: 'hip' });
      break; }
    case 'landlord': case 'walls': case 'roof': case 'frame': case 'nodoor2': {
      // landlord shows the new house: walls, roof, frame... no door
      const lp = S.id === 'landlord' ? walkTo(f, 236, 254, [-2.6, 0, -1.6], [0.35, 0, -2.75], eo) : [0.35, 0, -2.75];
      let lo = { ...idle(f, 12), expr: 'grin', L: 'hip', R: 'hang' };
      if (S.id === 'landlord') lo = { ...lo, expr: seq(f, [[236, 'grin'], [256, 'beam'], [272, 'smugsmile']]), L: { a: 'hip', b: 'point', t: ramp(f, 254, 262) }, R: { a: 'hang', b: 'wave', t: ramp(f, 256, 266) }, walk: f < 254 ? wphase(f, 1.4) : null, talk: f > 256 && f < 282 ? Math.abs(Math.sin(f * 0.9)) : 0 };
      if (S.id === 'walls') lo = { ...lo, expr: 'grin', R: { a: 'point', b: 'holdUp', t: 0.5 + 0.5 * Math.sin((f - 286) * 0.8) }, L: 'hip', look: 0.8 };
      if (S.id === 'roof') lo = { ...lo, expr: 'beam', R: 'up', L: 'up', headTilt: -8 };
      if (S.id === 'frame') lo = { ...lo, expr: seq(f, [[328, 'smugsmile'], [352, 'grin']]), L: { a: 'hip', b: 'holdUp', t: ramp(f, 330, 340) }, R: 'hip', look: -0.8, talk: f > 334 && f < 362 ? Math.abs(Math.sin(f * 0.8)) : 0 };
      if (S.id === 'nodoor2') lo = { ...lo, expr: 'smugsmile', L: 'hip', R: 'hip' };
      A('landlord', lp, lo, { roll: sway(f, 12, 0.03), y: S.id === 'walls' && (f % 12) < 3 ? 0.015 : 0 });
      let yp = walkTo(f, 236, 260, [2.4, 0, -0.4], [1.2, 0, -1.4], eo), yo = { ...idle(f, 10), expr: seq(f, [[236, 'grin'], [262, 'think'], [300, 'smile'], [320, 'think']]), L: 'hang', R: 'hold', look: -0.6, walk: f < 260 ? wphase(f) : null };
      if (S.id === 'roof') yo = { ...yo, headTilt: -12, expr: 'shock' };
      if (S.id === 'frame') yo = { ...yo, expr: seq(f, [[328, 'think'], [350, 'nervous']]), look: -0.9 };
      if (S.id === 'nodoor2') { yp = walkTo(f, 372, 386, [1.2, 0, -1.4], [-0.45, 0, -2.75], eo); const stum = ramp(f, 390, 398);
        yo = { ...yo, expr: f < 384 ? 'think' : f < 391 ? 'grin' : 'shock', R: f < 384 ? 'hang' : { a: 'hold', b: 'point', t: 0.5 + 0.5 * Math.sin((f - 384) * 1.3) }, L: 'hang', look: -0.9, walk: f < 386 ? wphase(f, 1.5) : null };
        A('you', yp, yo, { roll: stum > 0 ? -0.35 * Math.sin(stum * Math.PI) : 0, z: yp[2] - stum * 0.25 }); }
      else if (S.id !== 'roof' && S.id !== 'walls') A('you', yp, yo, { props: [{ m: 'suitcase', x: 40, y: 160, dz: 0.12 }], roll: sway(f, 10, 0.02) });
      if (S.id === 'landlord' || S.id === 'walls') A('kid2', [3.6 - (f - 236) * 0.02, 0, 0.4], { ...idle(f, 14), expr: 'grin', R: 'wave', walk: wphase(f, 1.6) });
      break; }
    case 'lock': case 'laugh': case 'why': {
      const yp = [-0.45, 0, -2.4], lp = [0.45, 0, -2.75];
      const talkY = S.id === 'lock' && f < 436 ? Math.abs(Math.sin(f * 0.85)) : 0;
      const hasLock = f < 488;
      A('you', yp, { ...idle(f, 10), expr: S.id === 'lock' ? seq(f, [[400, 'nervous'], [420, 'think'], [438, 'nervous']]) : S.id === 'laugh' ? 'nervous' : 'shock', look: 0.6, talk: talkY,
        R: hasLock ? { a: 'hold', b: 'holdUp', t: ramp(f, 400, 410) } : 'hang', L: S.id === 'why' ? 'up' : f > 436 && f < 458 ? 'wave' : 'hang' },
        { roll: sway(f, 10, 0.02), props: hasLock && S.id !== 'why' ? [{ m: 'padlock', x: 112, y: 500, dz: 0.1, s: 1.3, rz: 0.2 * Math.sin(f * 0.3) }] : [] });
      const laughing = f >= 466 && f < 488, tossing = f >= 488 && f < 502;
      A('landlord', lp, { ...idle(f, 12), expr: S.id === 'lock' ? seq(f, [[400, 'smile'], [440, 'smirk'], [452, 'grin']]) : laughing ? 'laugh' : S.id === 'why' ? 'smugsmile' : 'grin',
        L: S.id === 'why' ? 'wave' : laughing ? 'hold' : tossing ? 'up' : 'hip', R: S.id === 'why' ? 'wave' : laughing ? 'hold' : 'hip', look: -0.5,
        talk: (tossing && f < 497) || (S.id === 'why' && f < 512) ? Math.abs(Math.sin(f * 0.9)) : 0, headTilt: laughing ? 8 * Math.sin(f * 0.9) : 0 },
        { y: laughing ? 0.03 * Math.abs(Math.sin(f * 0.9)) : 0, roll: laughing ? 0.06 * Math.sin(f * 0.45) : sway(f, 12, 0.02) });
      if (S.id !== 'lock') { A('aunty', [1.9, 0, -1.4], { ...idle(f, 5), expr: 'laugh', L: 'hold', R: 'hold', headTilt: 6 * Math.sin(f * 0.8) }, { y: 0.02 * Math.abs(Math.sin(f * 0.8)), props: [{ m: 'brassPot', x: -40, y: 360, dz: 0.08, s: 0.9 }] });
        A('uncle', [-1.9, 0, -1.6], { ...idle(f, 4), expr: 'laugh', L: 'hold', R: 'point', headTilt: -6 * Math.sin(f * 0.7) }, { y: 0.02 * Math.abs(Math.sin(f * 0.7 + 1)) }); }
      break; }
    case 'night': case 'footsteps': {
      // first night: can't sleep, wide eyes, sweat; a "thief" outside is only the cow
      const jump = S.id === 'footsteps' && f >= 600 && f < 612;
      A('you', [-1.45, 0.48, -7.3], { pose: 'sit', expr: jump ? 'shock' : seq(f, [[520, 'nervous'], [545, 'shock'], [560, 'nervous'], [585, 'shock'], [618, 'nervous']]), look: q(Math.sin(f * 0.35) * 0.8, 1), blink: 0, L: 'hold', R: jump ? 'up' : 'hold', headTilt: 4 * Math.sin(f * 0.3) },
        { y: 0.48 - 215 * U + (jump ? 0.12 * Math.sin(ramp(f, 600, 612) * Math.PI) : 0), roll: 0.03 * Math.sin(f * 0.5) });
      break; }
    case 'hide': case 'shoe': {
      if (S.id === 'hide') A('you', [-1.45, 0.48, -7.15], { pose: 'sit', expr: seq(f, [[633, 'nervous'], [656, 'sly'], [672, 'smirk']]), look: -0.7, L: 'hold', R: { a: 'hold', b: 'point', t: ramp(f, 636, 650) }, blink: blinkAt(f, 10) }, { y: 0.48 - 215 * U });
      else A('you', [-2.15, 0, -5.4], { ...idle(f, 10), expr: seq(f, [[688, 'sly'], [706, 'smirk'], [714, 'wink']]), L: 'mouth', R: 'hip', look: -0.4 }, {});
      break; }
    case 'days': {
      // days pass: sitting on the step, bored; the village zips past in fast-forward
      A('you', [-0.6, 0.2, -2.85], { pose: 'sit', expr: seq(f, [[722, 'bored'], [745, 'sleepy'], [760, 'bored'], [772, 'sleepy']]), L: 'chin', R: 'hold', look: q(Math.sin(f * 0.2), 1), blink: blinkAt(f, 10) }, { y: 0.2 - 215 * U, props: [{ m: 'chai', x: 40, y: 600, dz: 0.1 }] });
      for (let i = 0; i < 4; i++) { const who = ['aunty', 'kid1', 'uncle', 'pilgrim1'][i], dir = i % 2 ? -1 : 1, x = dir * (-6 + ((f - 722) * 0.35 + i * 4.5) % 12); A(who, [x, 0, -0.9 + i * 0.5], { ...idle(f, 30 + i), expr: 'smile', walk: wphase(f, 4) }, { roll: dir * 0.04 }); }
      break; }
    case 'neighbours': {
      A('you', CHAIR, { pose: 'sit', expr: f < 842 ? seq(f, [[787, 'smile'], [805, 'think'], [825, 'smile']]) : 'grin', look: -0.8, L: 'hold', R: f >= 842 ? { a: 'hang', b: 'wave', t: 0.6 + 0.4 * Math.sin(f * 0.6) } : 'hang', blink: blinkAt(f, 10) },
        { y: CHAIR[1] - 215 * U, props: [{ m: 'chai', x: -36, y: 420, dz: 0.1 }] });
      const ap = f < 838 ? walkTo(f, 787, 838, [-3.4, 0, -1.7], [-0.75, 0, -1.7]) : f < 856 ? [-0.75, 0, -1.7] : walkTo(f, 856, 866, [-0.75, 0, -1.7], [0.6, 0, -1.7]);
      A('aunty', ap, { ...idle(f, 5), expr: f >= 838 ? 'beam' : 'smile', L: 'holdUp', R: f >= 840 && f < 860 ? { a: 'hang', b: 'wave', t: 0.5 + 0.5 * Math.sin(f * 0.7) } : 'hang', look: 0.8, walk: f < 838 || f >= 856 ? wphase(f) : null }, { props: [{ m: 'brassPot', x: -100, y: 790, dz: 0.03, s: 1 }] });
      const up = f < 834 ? walkTo(f, 800, 834, [2.6, 0, -1.2], [-0.4, 0, -1.2]) : f < 856 ? [-0.4, 0, -1.2] : walkTo(f, 856, 866, [-0.4, 0, -1.2], [-1.4, 0, -1.2]);
      A('uncle', up, { ...idle(f, 4), expr: f >= 836 ? 'grin' : 'smile', L: 'hang', R: f >= 836 && f < 858 ? { a: 'hang', b: 'wave', t: 0.5 + 0.5 * Math.sin(f * 0.8 + 1) } : 'hang', look: 0.8, walk: f < 834 || f >= 856 ? wphase(f) : null });
      break; }
    case 'kids': {
      const startled = f >= 872 && f < 900;
      A('you', CHAIR, { pose: 'sit', expr: startled ? 'shock' : f < 930 ? 'nervous' : 'smile', look: q(clamp((f - 880) / 40) * -1.2 + 0.4, 1), L: 'hold', R: startled ? 'up' : 'hang', blink: 0 }, { y: CHAIR[1] - 215 * U + (startled ? 0.06 * Math.sin(ramp(f, 872, 886) * Math.PI) : 0), props: [{ m: 'chai', x: -36, y: 420, dz: 0.1 }] });
      const k1 = f < 905 ? walkTo(f, 878, 905, [-0.6, 0, -2.6], [-1.0, 0, -5.7]) : f < 918 ? [-1.0, 0, -5.7] : walkTo(f, 918, 950, [-1.0, 0, -5.7], [-0.6, 0, -1.6]);
      const k2 = f < 908 ? walkTo(f, 882, 908, [-0.4, 0, -2.4], [-1.2, 0, -6.4]) : f < 920 ? [-1.2, 0, -6.4] : walkTo(f, 920, 954, [-1.2, 0, -6.4], [-0.4, 0, -1.4]);
      const runN = (a, b) => f >= a && f < b;
      if (f >= 876) A('kid1', k1, { ...idle(f, 1), expr: runN(905, 918) ? 'beam' : 'grin', L: 'up', R: runN(905, 918) ? 'point' : 'hang', walk: runN(905, 918) ? null : wphase(f, 3.2) }, { roll: 0.06 * Math.sin(f * 0.8) });
      if (f >= 880) A('kid2', k2, { ...idle(f, 2), expr: f >= 910 ? 'laugh' : 'beam', L: 'hang', R: f >= 910 ? 'holdUp' : 'hang', walk: runN(908, 920) ? null : wphase(f + 5, 3.2) }, { roll: 0.06 * Math.sin(f * 0.8 + 1), props: f >= 910 ? [{ m: 'ball', x: 96, y: 295, dz: 0.08, s: 1.3 }] : [] });
      break; }
    case 'bank': {
      // the clerk snoozes, the vault yawns open, a customer strolls out with cash
      A('clerk', [13.6, 0, 7.15], { ...idle(f, 15), expr: f > 992 && f < 1008 ? 'bored' : 'sleepy', blink: 1, L: f > 992 && f < 1010 ? { a: 'hang', b: 'wave', t: 0.5 + 0.5 * Math.sin(f * 0.4) } : 'hold', R: 'chin', headTilt: 14 + 3 * Math.sin(f * 0.1) }, { roll: 0.04 * Math.sin(f * 0.08) });
      A('pilgrim3', walkTo(f, 957, 1024, [11.6, 0, 7.9], [11.3, 0, 4.0]), { ...idle(f, 11), expr: 'beam', L: 'hang', R: 'holdUp', walk: wphase(f) }, { props: [{ m: 'cash', x: 115, y: 500, dz: 0.1, s: 1.4, rx: 1.2 }] });
      A('pilgrim2', [16.4, 0, 6.0], { ...idle(f, 3), expr: 'smile', L: 'hold', R: 'hang' });
      break; }
    case 'reason': {
      for (let i = 0; i < 8; i++) { const who = ['pilgrim1', 'pilgrim2', 'pilgrim3', 'aunty', 'uncle', 'kid1', 'kid2', 'landlord'][i]; A(who, [26 + i * 0.95 + ((f - 1024) * 0.02), 0, (i % 2 ? 0.45 : -0.45)], { ...idle(f, 40 + i), expr: 'smile', L: 'chin', R: 'chin', walk: wphase(f + i * 5, 0.8) }); }
      break; }
    case 'stone': case 'notemple': {
      const pour = S.id === 'notemple' && f >= 1170 && f < 1215;
      A('pilgrim1', [36.0, 1.04, -0.75], { ...idle(f, 6), expr: pour ? 'smugsmile' : 'smile', L: 'chin', R: pour ? 'holdUp' : 'chin', blink: blinkAt(f, 6) }, { ground: 1.04, props: pour ? [{ m: 'oilcan', x: 115, y: 500, dz: 0.1, s: 1.2, rz: -0.8 }] : [] });
      for (let i = 0; i < 6; i++) { const who = ['pilgrim2', 'pilgrim3', 'aunty', 'uncle', 'landlord', 'kid2'][i]; A(who, [30.6 - i * 0.95, 0, (i % 2 ? 0.45 : -0.45)], { ...idle(f, 50 + i), expr: i % 3 ? 'smile' : 'smugsmile', L: 'chin', R: 'chin', walk: wphase(f + i * 3, 0.4) }); }
      break; }
    case 'lordshani': {
      // the whole village, hands folded, nodding solemnly; the landlord whispers it to you
      const row = ['pilgrim2', 'aunty', 'uncle', 'landlord', 'you', 'kid1', 'pilgrim1', 'kid2', 'pilgrim3'];
      row.forEach((who, i) => { const z = 2.6 - i * 0.62, x = 31.1 + (i % 2) * 0.5; const nod = Math.sin((f + i * 9) * 0.2);
        const o = { ...idle(f, 60 + i), expr: who === 'you' ? seq(f, [[1225, 'think'], [1262, 'shock'], [1280, 'nervous']]) : who === 'landlord' ? 'stern' : (i % 3 ? 'smugsmile' : 'sleepy'), L: 'chin', R: 'chin', headTilt: 4 * nod, look: who === 'landlord' ? 0.8 : who === 'you' ? -0.6 : 0.6 };
        if (who === 'landlord') { o.talk = f > 1240 && f < 1290 ? Math.abs(Math.sin(f * 0.9)) : 0; o.R = 'mouth'; }
        A(who, [x, 0, z], o, { y: 0.01 * nod }); });
      break; }
    case 'steal': {
      const p = walkTo(f, 1298, 1335, [13.4, 0, -3.3], [12.0, 0, -1.4]);
      A('thief', p, { expr: seq(f, [[1293, 'sly'], [1318, 'smirk']]), L: 'hold', R: 'hip', look: 0.8, walk: wphase(f, 0.8), blink: blinkAt(f, 9) }, { roll: sway(f, 9, 0.07), props: [{ m: 'brassPot', x: -41, y: 415, dz: 0.12, s: 1.2 }] });
      A('aunty', [16.2, 0, -2.2], { ...idle(f, 5), expr: 'think', L: 'hip', R: 'hold', look: -1 });
      break; }
    case 'police': {
      const p = walkTo(f, 1335, 1378, [11.8, 0, -1.0], [8.2, 0, 1.6]);
      A('thief', p, { expr: 'smirk', L: 'hold', R: 'wave', look: 0.4, walk: wphase(f, 2.4) }, { roll: 0.05 * Math.sin(f * 0.7), props: [{ m: 'brassPot', x: -41, y: 415, dz: 0.12, s: 1.2 }] });
      const ignore = f >= 1350;
      A('cop', [9.6, 0.46, 2.25], { pose: 'sit', expr: ignore ? 'bored' : 'smile', L: ignore ? 'hold' : 'mouth', R: ignore ? 'mouth' : 'hang', look: ignore ? -0.8 : 0.6, blink: blinkAt(f, 16) },
        { y: 0.46 - 215 * U, props: ignore ? [{ m: 'chai', x: 50, y: 700, dz: 0.1, s: 1.2 }] : [{ m: 'phone', x: -50, y: 700, dz: 0.1, s: 1.2 }] });
      A('kid2', [11.2, 0, 2.6], { ...idle(f, 2), expr: 'grin', L: 'hang', R: 'hang' });
      break; }
    case 'ruins': case 'blind': case 'losses': case 'seven': {
      let p, o = { blink: blinkAt(f, 9), L: 'hold', R: 'hang', look: 0 }, ex = { roll: 0, props: [] };
      if (S.id === 'ruins') { p = walkTo(f, 1378, 1410, [8.2, 0, 1.0], [6.6, 0, -0.4]); o = { ...o, expr: f < 1390 ? 'smirk' : 'shock', look: f > 1390 ? 0 : 0.5, R: f > 1392 ? 'up' : 'hang', L: f > 1392 ? 'up' : 'hold', walk: f < 1390 ? wphase(f, 1.6) : null }; ex.y = f > 1392 && f < 1404 ? 0.25 * Math.sin(ramp(f, 1392, 1404) * Math.PI) : 0; if (f < 1392) ex.props = [{ m: 'brassPot', x: -41, y: 415, dz: 0.12, s: 1.2 }]; }
      else if (S.id === 'blind') { p = f < 1425 ? walkTo(f, 1410, 1425, [5.8, 0, -1.4], [4.35, 0, -2.6]) : [4.35, 0, -2.6]; o = { ...o, expr: f < 1425 ? 'sleepy' : 'shock', blink: 1, L: 'point', R: 'point', walk: f < 1425 ? wphase(f, 1.2) : null, look: 0 }; ex.roll = f >= 1425 ? -0.25 * Math.exp(-(f - 1425) / 6) * Math.sin((f - 1425) * 1.3) : 0.05 * Math.sin(f * 0.6); ex.props = [{ m: 'sack', x: -80, y: 330, dz: 0.1 }]; }
      else if (S.id === 'losses') { p = [4.5, 0, -2.4]; o = { ...o, expr: 'shock', L: 'up', R: 'up', look: 0 }; }
      else { const slip = f >= 1498; p = slip ? [4.4 + ramp(f, 1498, 1506) * 0.4, 0, -2.2] : walkTo(f, 1452, 1498, [4.5, 0, -2.4], [4.4, 0, -2.2]); o = { ...o, expr: seq(f, [[1452, 'nervous'], [1470, 'angry'], [1498, 'shock']]), L: slip ? 'up' : 'hold', R: slip ? 'up' : 'hang', walk: slip ? null : wphase(f, 0.8) };
        ex.roll = slip ? -sm(ramp(f, 1498, 1508)) * 1.35 : 0; ex.y = slip ? 0.35 * Math.sin(ramp(f, 1498, 1508) * Math.PI) : 0; }
      A('thief', p, o, ex);
      if (S.id === 'seven' || S.id === 'blind' || S.id === 'losses') { A('aunty', [1.2, 0, -2.4], { ...idle(f, 5), expr: f > 1500 ? 'shock' : 'think', L: 'mouth', R: 'hold' }); A('uncle', [2.2, 0, -3.0], { ...idle(f, 4), expr: f > 1500 ? 'shock' : 'stern', L: 'cross', R: 'cross' }); }
      if (S.id === 'seven') A('kid1', [6.8, 0, -1.0], { ...idle(f, 1), expr: f > 1500 ? 'laugh' : 'grin', L: 'point', R: 'hang' });
      break; }
    case 'leaving': {
      const yp = f < 1560 ? walkTo(f, 1528, 1548, [0.3, 0, -6.2], [1.5, 0, -7.35]) : walkTo(f, 1562, 1586, [1.5, 0, -7.35], [1.25, 0, -4.35]);
      const walking = (f > 1528 && f < 1548) || (f > 1562 && f < 1586);
      A('you', yp, { ...idle(f, 10), expr: seq(f, [[1528, 'smile'], [1545, 'smugsmile'], [1575, 'smile'], [1592, 'beam']]), L: 'hang', R: f < 1545 ? 'holdUp' : f >= 1578 && f < 1592 ? 'holdUp' : 'hang', walk: walking ? wphase(f) : null }, { roll: sway(f, 10, 0.03) });
      break; }
    case 'safe': if (f < 1626) { A('you', [1.25, 0, -4.35], { ...idle(f, 10), expr: 'sleepy', blink: 1, L: 'up', R: 'up', talk: 0.8 }, { roll: 0.04 * Math.sin(f * 0.3) }); break; } {
      // sound asleep with the door wide open: lying on the cot (card turned flat to the side)
      A('you', [-1.85, 0.72, -6.62], { expr: f > 1675 ? 'smugsmile' : 'sleepy', blink: 1, L: 'hang', R: f > 1680 ? 'hold' : 'hang', headTilt: 0 }, { fixedYaw: Math.PI / 2, roll: -Math.PI / 2, blob: false, y: 0.72 + 0.01 * Math.sin(f * 0.12) });
      break; }
    case 'pilgrims': case 'strangers': {
      if (f < 1736) A('you', [-1.85, 0.72, -6.62], { expr: f < 1716 ? 'sleepy' : 'smile', blink: f < 1716 ? 1 : blinkAt(f, 10), L: 'hang', R: f > 1716 ? 'wave' : 'hang' }, { fixedYaw: Math.PI / 2, roll: -Math.PI / 2, blob: false });
      // thousands of pilgrims pour in through the arch and down the street
      const n = S.id === 'pilgrims' ? 16 : 12, who = ['pilgrim1', 'pilgrim2', 'pilgrim3', 'pilgrim1', 'pilgrim2', 'pilgrim3', 'thief', 'pilgrim2'];
      for (let i = 0; i < n; i++) { const sp = 1.15 + (i % 3) * 0.12, x = S.id === 'pilgrims' ? -30 + ((f - 1700) * sp / 30 + i * 2.3) % 26 : -17 + ((f - 1700) * sp / 30 + i * 1.3) % 12.5, z = S.id === 'pilgrims' ? -2.0 + (i * 0.73) % 4.0 : -2.1 + (i * 0.53) % 3.3;
        const w = i === 6 ? 'pilgrim3' : who[i % 8];
        const o = { ...idle(f, 70 + i), expr: ['smile', 'grin', 'think', 'smugsmile'][i % 4], L: i % 3 === 0 ? 'chin' : 'hang', R: i % 4 === 1 ? 'holdUp' : 'hang', walk: wphase(f + i * 4, sp) };
        const props = i % 4 === 1 ? [{ m: 'cam', x: 115, y: 500, dz: 0.08 }] : i % 5 === 2 ? [{ m: 'marigoldGarland', x: 0, y: 470, dz: 0.12, s: 1.2 }] : [];
        A(w, [x, 0, z], o, { roll: 0.03 * Math.sin(f * 0.25 + i), props }); }
      if (S.id === 'strangers') { const flash = f >= 1866 && f < 1874;
        A('pilgrim3', [-8.6, 0, -1.6], { ...idle(f, 80), expr: flash ? 'beam' : 'grin', L: 'hang', R: 'holdUp', look: -1 }, { props: [{ m: 'cam', x: 115, y: 500, dz: 0.08 }] });
        A('aunty', [-6.7, 0, -2.9], { ...idle(f, 5), expr: 'sly', L: 'cross', R: 'cross', look: -1 }); A('uncle', [-9.9, 0, -2.6], { ...idle(f, 4), expr: 'stern', L: 'cross', R: 'cross', look: 1 }); }
      break; }
    case 'news': {
      const shock = f >= 1944;
      A('aunty', [-10.9, 0, 3.4], { ...idle(f, 5), expr: shock ? 'shock' : seq(f, [[1918, 'think'], [1930, 'nervous']]), L: 'holdUp', R: 'holdUp', talk: f > 1922 && f < 1944 ? Math.abs(Math.sin(f * 0.9)) : 0, look: 0.6 }, { props: f >= 1918 ? [{ m: 'news', x: 0, y: 520, dz: 0.15, s: 1.3 }] : [] });
      A('uncle', [-12.2, 0, 3.8], { ...idle(f, 4), expr: shock ? 'shock' : 'think', L: shock ? 'up' : 'chin', R: 'hip', look: -0.6 }, { y: shock && f < 1952 ? 0.1 * Math.sin(ramp(f, 1944, 1952) * Math.PI) : 0 });
      A('landlord', [-9.8, 0, 4.2], { ...idle(f, 12), expr: shock ? 'shock' : 'stern', L: shock ? 'mouth' : 'hip', R: 'hold', look: -0.7 }, { props: [{ m: 'chai', x: 41, y: 415, dz: 0.1, s: 1.2 }] });
      A('kid1', [-11.8, 0, 2.6], { ...idle(f, 1), expr: shock ? 'shock' : 'grin', L: 'hang', R: 'hang' });
      break; }
    case 'again': {
      const snatch = f >= 1985; const pp = walkTo(f, 1968, 2020, [-6.2, 0, 1.1], [-4.6, 0, 0.6]);
      A('pilgrim2', pp, { ...idle(f, 3), expr: snatch ? 'shock' : 'smile', L: snatch ? 'up' : 'hold', R: snatch ? 'point' : 'hang', walk: snatch ? null : wphase(f) }, { roll: snatch ? 0.12 * Math.sin((f - 1985) * 0.6) * Math.exp(-(f - 1985) / 14) : 0, props: snatch ? [] : [{ m: 'sack', x: -41, y: 330, dz: 0.12 }] });
      const tp = f < 1985 ? walkTo(f, 1972, 1985, [-2.6, 0, 1.6], [-4.4, 0, 1.1], eo) : walkTo(f, 1985, 2020, [-4.4, 0, 1.1], [-10.5, 0, 0.2], ei);
      A('thief', tp, { expr: snatch ? 'laugh' : 'sly', L: snatch ? 'holdUp' : 'hold', R: 'point', walk: wphase(f, 3.4) }, { roll: -0.08, props: snatch ? [{ m: 'sack', x: -100, y: 430, dz: 0.12 }] : [] });
      A('kid2', [-3.0, 0, -1.6], { ...idle(f, 2), expr: snatch ? 'shock' : 'grin', L: 'hang', R: snatch ? 'point' : 'hang' });
      break; }
    case 'station': {
      const done = f >= 2066;
      A('cop', walkTo(f, 2062, 2080, [-14.0, 0, 3.0], [-13.2, 0, 2.2], eo), { ...idle(f, 16), expr: done ? 'beam' : 'smile', L: 'hip', R: done && f < 2085 ? 'up' : 'staff', walk: f > 2062 && f < 2080 ? wphase(f) : null }, { props: [{ m: 'whistle', x: 50, y: 560, dz: 0.1 }] });
      A('aunty', [-11.0, 0, 1.6], { ...idle(f, 5), expr: done ? 'beam' : 'shock', L: done ? 'hold' : 'mouth', R: done ? 'hold' : 'hang' }, { y: done ? 0.03 * Math.abs(Math.sin(f * 0.7)) : 0 });
      A('uncle', [-16.6, 0, 0.8], { ...idle(f, 4), expr: done ? 'grin' : 'shock', L: done ? 'hold' : 'up', R: done ? 'hold' : 'up' });
      A('kid1', [-15.2, 0, 0.0], { ...idle(f, 1), expr: 'beam', L: 'up', R: 'up' }, { y: 0.05 * Math.abs(Math.sin(f * 0.5)) });
      break; }
    case 'walkhome': case 'notice': case 'door': {
      const stop = S.id !== 'walkhome' && f >= 2124;
      const yp = stop ? [-8.3, 0, -2.0] : walkTo(f, 2090, 2124, [-11.6, 0, -1.6], [-8.3, 0, -2.0]);
      const slam = f >= 2186;
      A('you', yp, { ...idle(f, 10), expr: S.id === 'walkhome' ? 'smile' : seq(f, [[2121, 'think'], [2130, 'shock'], [2150, 'nervous'], [2186, 'shock']]), look: stop ? 1 : 0.3, L: slam ? 'up' : 'hang', R: slam ? 'up' : stop && f < 2160 ? 'chin' : 'hang', walk: stop ? null : wphase(f, 1.1), blink: stop ? 0 : blinkAt(f, 10) },
        { y: slam && f < 2196 ? 0.12 * Math.sin(ramp(f, 2186, 2196) * Math.PI) : 0, roll: S.id === 'walkhome' ? sway(f, 10, 0.04) : 0 });
      if (S.id !== 'walkhome') { A('aunty', [-7.05, 0, -2.5], { ...idle(f, 5), expr: slam ? 'smugsmile' : 'beam', L: 'hip', R: slam ? 'thumb' : 'wave', look: 0.8 }); A('uncle', [-6.55, 0, -3.0], { ...idle(f, 4), expr: 'smugsmile', L: 'cross', R: 'cross', look: 0.5 }); }
      if (S.id === 'walkhome') A('kid2', [-13.6 + (f - 2090) * 0.02, 0, 0.8], { ...idle(f, 2), expr: 'grin', R: 'wave', walk: wphase(f) });
      break; }
  }
  return out;
};

// ---------- 3D FX (never 2D) ----------
export const fxAt = (f) => {
  const S = shotAt(f), out = []; const F = (m, x, y, z, o = {}) => out.push({ m, x, y, z, ...o });
  const tt = f / 30;
  // ambient life everywhere: marigold petals drifting on the breeze in daylight street shots
  if (['hook', 'nodoor', 'centuries', 'landlord', 'days', 'pilgrims', 'strangers', 'walkhome', 'notice'].includes(S.id)) for (let i = 0; i < 6; i++) { const p = ((f * 0.006 + i / 6) % 1); const cam = camAt(f); F('petal', cam.look[0] + Math.sin(i * 2.1) * 2.2 + p * 2, 3.2 - p * 3.0, cam.look[2] + 1.5 + Math.cos(i * 1.7) * 1.2, { rx: f * 0.2 + i, rz: f * 0.13 }); }
  switch (S.id) {
    case 'nodoor': if (f >= 64 && f < 76) for (const y of [0.4, 1.75]) F('spark', -15.15, y, -3.25, { s: back(ramp(f, 64, 70)) * (1 - ramp(f, 72, 76)) * 0.9, rz: f * 0.2 }); break;
    case 'centuries': F('coinpot', 6.9, 0, -4.2, { s: 1.3 }); if (f >= 106) for (let i = 0; i < 3; i++) F('spark', 6.9 + Math.sin(i * 2) * 0.25, 0.75 + i * 0.1, -4.0, { s: 0.6 * (0.5 + 0.5 * Math.sin(f * 0.5 + i * 2)), rz: f * 0.1 }); if (f >= 118 && f < 126) F('bang', 6.5, 2.05, -2.6, { s: back(ramp(f, 118, 122)) * 1.4 });
      if (f >= 118) for (let i = 0; i < 2; i++) F('sweat', 6.75 + i * 0.1, 1.65 - ((f - 118 + i * 5) % 12) * 0.03, -2.6, { s: 1 }); break;
    case 'imagine': if (f >= 150 && f < 166) for (let i = 0; i < 4; i++) F('dust', -40.2 + i * 0.3 - (f - 150) * 0.02, 0.15 + (f - 150) * 0.01, 1.0 + i * 0.25, { s: 0.8 + ramp(f, 150, 166) }); break;
    case 'walls': for (const k0 of [292, 300]) if (f >= k0 && f < k0 + 10) F('dust', 0.85, 1.5, -3.25, { s: 0.6 + ramp(f, k0, k0 + 10) * 0.8 }); break;
    case 'roof': { const t = ramp(f, 312, 324); F('crow', lerp(3.2, 1.5, eo(t)), lerp(5.2, 3.82, eo(t)), -3.3, { ry: Math.PI, s: 1.2 }); break; }
    case 'frame': if (f >= 348) for (const y of [0.4, 1.75]) F('spark', -1.15, y, -3.25, { s: 0.9 * (0.6 + 0.4 * Math.sin(f * 0.7)), rz: f * 0.15 }); break;
    case 'nodoor2': if (f >= 392) for (let i = 0; i < 2; i++) F('q', -0.6 + i * 0.35, 2.05 + i * 0.1 + Math.sin(f * 0.3 + i) * 0.03, -2.8, { s: back(ramp(f, 392 + i * 3, 398 + i * 3)) * 1.6, ry: Math.sin(f * 0.2) * 0.4 }); break;
    case 'laugh': case 'why': {
      if (f >= 488 && f < 505) { const t = ramp(f, 488, 505); F('padlock', lerp(-0.2, 2.6, t), 1.4 + Math.sin(t * Math.PI) * 1.3, lerp(-2.3, -3.75, t), { s: 1.3, rz: t * 12, rx: t * 6 }); }
      if (f >= 505 && f < 519) for (let i = 0; i < 6; i++) { const t = ramp(f, 505, 519), a = i / 6 * 6.28; F('drop', 2.6 + Math.cos(a) * t * 0.4, 0.05 + Math.sin(t * Math.PI) * 0.45, -3.75 + Math.sin(a) * t * 0.2, { s: 1.4 }); }
      if (S.id === 'laugh' && f < 488) for (let i = 0; i < 3; i++) F('drop', 0.75 + i * 0.12, 1.9 - ((f + i * 7) % 15) * 0.02, -2.6, { s: 0.8 }); break; }
    case 'night': case 'footsteps': {
      for (let i = 0; i < 2; i++) F('sweat', -1.2 + i * 0.12, 1.35 - ((f + i * 9) % 18) * 0.02, -7.15, { s: 1 });
      if (S.id === 'footsteps' && f >= 600 && f < 616) F('bang', -1.45, 1.75, -7.2, { s: back(ramp(f, 600, 605)) * 1.6 });
      for (let i = 0; i < 4; i++) F('drop', -3 + i * 2.2, 0.02, -1.0 - i * 0.3, { s: 0.001 }); // (moths are the fan; keep pools warm)
      break; }
    case 'hide': { const t = ramp(f, 638, 654); F('phone', lerp(-1.25, -1.85, eo(t)), lerp(0.95, 0.58, eo(t)), lerp(-7.05, -8.15, eo(t)), { rx: -Math.PI / 2 * t, s: 1.4 }); if (f > 652 && f < 664) F('puff', -1.85, 0.7, -8.0, { s: 0.6 + ramp(f, 652, 664) }); break; }
    case 'shoe': { const t = ramp(f, 694, 708); if (f < 712) F('cash', lerp(-1.9, -1.2, t), lerp(1.1, 0.12, ei(t)), lerp(-5.2, -4.5, t), { s: 1.4, ry: t * 3, rz: Math.sin(t * 9) * 0.4 }); if (f >= 706 && f < 716) for (let i = 0; i < 3; i++) F('spark', -1.2 + (i - 1) * 0.12, 0.25 + ramp(f, 706, 716) * 0.2, -4.45, { s: 0.5, rz: f * 0.3 }); break; }
    case 'days': F('calendar', 0, 0, 0, { s: 0 }); break;
    case 'kids': {
      if (f < 902) { const t1 = ramp(f, 866, 876), t2 = ramp(f, 876, 902); const p = f < 876 ? [lerp(-0.6, 0.2, t1), lerp(1.4, 0.05, t1 * t1), lerp(-1.2, -5.6, t1)] : [lerp(0.2, -1.6, eo(t2)), 0.05 + Math.abs(Math.sin(t2 * Math.PI * 3)) * 0.35 * (1 - t2), lerp(-5.6, -6.2, eo(t2))]; F('ball', ...p, { s: 1.4, rz: -f * 0.6 }); }
      else if (f < 910) F('ball', -1.6, 0.05, -6.2, { s: 1.4 });
      if (f >= 873 && f < 893) for (let i = 0; i < 5; i++) { const t = ramp(f, 873, 893); F('drop', 1.0 + i * 0.05 - 0.2, 1.25 + Math.sin(t * Math.PI) * 0.25 - t * 0.7, -7.45 + i * 0.03, { s: 1.1 }); }
      if (f >= 876 && f < 890) F('bang', 1.0, 2.0, -7.6, { s: back(ramp(f, 876, 881)) * 1.5 });
      break; }
    case 'bank': for (let i = 0; i < 3; i++) { const p = ((f - 957) / 36 + i / 3) % 1; F('z', 13.75 + p * 0.3, 1.95 + p * 0.6, 7.0, { s: (0.6 + p) * (1 - p) * 2.2, face: true }); } break;
    case 'stone': case 'notemple': if (S.id === 'stone' || f > 1170) for (let i = 0; i < 5; i++) F('drop', 37 + Math.sin(i * 1.3) * 0.18, 2.9 - ((f * 0.03 + i / 5) % 1) * 1.7, 0.2, { s: 0.6, sy: 1.4 }); break;
    case 'lordshani': for (let i = 0; i < 5; i++) { const p = ((f - 1225) / 50 + i / 5) % 1; F('petal', 33.5 + Math.sin(i * 2) * 1.2, 3.4 - p * 3.2, -1.0 + i * 0.7, { rx: f * 0.2, rz: f * 0.1 + i }); } break;
    case 'police': if (f >= 1352 && f < 1366) F('q', 9.6, 1.95, 2.25, { s: back(ramp(f, 1352, 1358)) * 1.4 }); break;
    case 'ruins': case 'blind': case 'losses': case 'seven': {
      // the curse: a storm cloud that follows only him, lightning, rain, stars, coins pouring away, the 7½-year sign
      const tx = S.id === 'ruins' ? lerp(8.2, 6.6, ramp(f, 1378, 1410)) : S.id === 'blind' ? lerp(5.8, 4.35, ramp(f, 1410, 1425)) : 4.5, tz = S.id === 'ruins' ? lerp(1.0, -0.4, ramp(f, 1378, 1410)) : -2.4;
      const grow = S.id === 'ruins' ? back(ramp(f, 1380, 1392)) : 1;
      F('cloud', tx, 3.3 + 0.05 * Math.sin(f * 0.3), tz, { s: grow * 0.9, ry: f * 0.01 });
      if (S.id === 'ruins' && f >= 1392 && f < 1400) F('bolt', tx + 0.05, 2.6, tz + 0.1, { s: 2.2, face: true });
      if (S.id !== 'ruins' || f > 1394) for (let i = 0; i < 9; i++) { const p = ((f * 0.07 + i / 9) % 1); F('drop', tx + Math.sin(i * 3.1) * 0.5, 3.0 - p * 3.0, tz + Math.cos(i * 2.3) * 0.35, { s: 0.9, sy: 1.6 }); }
      if (S.id === 'blind' && f >= 1425) for (let i = 0; i < 4; i++) { const a = f * 0.3 + i * 1.57; F('spark', 4.35 + Math.cos(a) * 0.3, 2.05 + Math.sin(a * 2) * 0.05, -2.6 + Math.sin(a) * 0.2, { s: 0.7, rz: f * 0.3 }); }
      if (S.id === 'losses' || (S.id === 'seven' && f < 1475)) for (let i = 0; i < 10; i++) { const p = ((f - 1432) * 0.05 + i / 10) % 1; F('coin', 4.3 + Math.sin(i * 1.9) * 0.15 + p * 0.1, 0.95 - p * 0.92, -2.35 + Math.cos(i * 2.7) * 0.15, { s: 1.5, rx: f * 0.4 + i, ry: i }); }
      if (S.id === 'losses' || S.id === 'seven') { F('sack', 4.25, 0.18, -2.25, { s: 1, rz: 0.9 }); for (let i = 0; i < 8; i++) F('coin', 3.7 + i * 0.13, 0.02, -2.1 + Math.sin(i * 2) * 0.25, { s: 1.4, rx: Math.PI / 2 }); }
      if (S.id === 'seven') { const r_ = spring((f - 1456) / 30, 1.4, 5); F('sevenSign', 2.6, -0.9 + r_ * 2.25, -1.0, { ry: 0.25, s: 1.1 }); F('banana', 4.6, 0.03, -2.15, { s: 1.3, ry: 0.5 });
        if (f > 1505 && f < 1528) for (let i = 0; i < 4; i++) { const a = f * 0.35 + i * 1.57; F('spark', 4.9 + Math.cos(a) * 0.3, 0.6 + Math.sin(a * 2) * 0.05, -2.2 + Math.sin(a) * 0.2, { s: 0.6, rz: f * 0.3 }); }
        if (f >= 1500 && f < 1512) F('dust', 4.9, 0.2, -2.1, { s: 0.6 + ramp(f, 1500, 1512) }); }
      break; }
    case 'leaving': { const tp = ramp(f, 1540, 1548); if (f >= 1540) F('phone', lerp(1.62, 1.6, tp), lerp(1.2, 0.83, eo(tp)), lerp(-7.45, -8.0, tp), { rx: -Math.PI / 2 * tp, s: 1.4 }); if (f >= 1546 && f < 1556) F('spark', 1.6, 0.95, -8.0, { s: 0.6, rz: f * 0.2 });
      const tw = ramp(f, 1584, 1592); if (f >= 1584) F('wallet', lerp(1.35, 1.55, tw), lerp(1.4, 1.16, eo(tw)), lerp(-4.2, -3.72, tw), { s: 1.4, rx: -Math.PI / 2 * tw }); if (f >= 1590 && f < 1600) F('spark', 1.55, 1.3, -3.72, { s: 0.6, rz: f * 0.2 }); break; }
    case 'safe': { F('phone', 1.6, 0.83, -8.0, { rx: -Math.PI / 2, s: 1.4 }); F('wallet', 1.55, 1.16, -3.72, { rx: -Math.PI / 2, s: 1.4 }); for (let i = 0; i < 3; i++) { const p = ((f - 1612) / 40 + i / 3) % 1; F('z', -1.85 + 0.15 + p * 0.35, 0.95 + p * 0.9, -8.0 + p * 0.2, { s: (0.5 + p) * (1 - p) * 2.4, face: true }); }
      if (f > 1675 && f < 1700) F('heart', -1.6, 1.2 + ramp(f, 1675, 1700) * 0.4, -7.8, { s: back(ramp(f, 1675, 1682)) * 1.4, face: true }); break; }
    case 'strangers': if (f >= 1866 && f < 1874) F('spark', -8.3, 1.75, -1.4, { s: back(ramp(f, 1866, 1869)) * 2.2, rz: f * 0.3 }); break;
    case 'news': { if (f >= 1892 && f < 1920) { const t = ramp(f, 1892, 1918), C = camAt(f); const tgt = [lerp(-10.9, C.pos[0] + (C.look[0] - C.pos[0]) * 0.12, eo(Math.min(t * 1.6, 1))), lerp(2.4, C.pos[1] + (C.look[1] - C.pos[1]) * 0.12, eo(Math.min(t * 1.6, 1))), lerp(3.4, C.pos[2] + (C.look[2] - C.pos[2]) * 0.12, eo(Math.min(t * 1.6, 1)))];
        const back_ = ramp(f, 1910, 1920); F('news', lerp(tgt[0], -10.9, back_), lerp(tgt[1], 1.7, back_), lerp(tgt[2], 3.5, back_), { s: 1.6, face: true, rz: 0.4 * (1 - t) }); }
      if (f >= 1944 && f < 1966) for (const [x, z] of [[-10.9, 3.4], [-12.2, 3.8], [-9.8, 4.2]]) F('bang', x, 2.1, z, { s: back(ramp(f, 1944, 1949)) * 1.5 }); break; }
    case 'again': if (f >= 1985 && f < 2000) { F('bang', -4.6, 2.0, 0.6, { s: back(ramp(f, 1985, 1990)) * 1.5 }); for (let i = 0; i < 3; i++) F('dust', -4.6 - i * 0.4 - (f - 1985) * 0.04, 0.15, 0.8 + i * 0.2, { s: 0.5 + ramp(f, 1985, 2000) }); } break;
    case 'station': if (f >= 2030 && f < 2072) for (let i = 0; i < 6; i++) { const t = ramp(f, 2030 + i * 3, 2060 + i * 3); F('dust', -17.2 + i * 1.1, 0.2 + t * 0.6, 3.2 + (i % 2) * 0.3, { s: (0.6 + t * 1.4) * (1 - ramp(f, 2066, 2072) * 0.8) }); }
      if (f >= 2072 && f < 2090) for (let i = 0; i < 4; i++) F('spark', -15.4 + i * 0.7, 3.4 + Math.sin(f * 0.3 + i) * 0.1, 3.2, { s: 0.7 * (0.5 + 0.5 * Math.sin(f * 0.5 + i)), rz: f * 0.2 }); break;
    case 'notice': case 'door': {
      // fresh paint sparkles on the brand-new house
      for (let i = 0; i < 5; i++) F('spark', -9.6 + i * 1.0, 1.0 + (i % 3) * 0.9, -3.3, { s: 0.6 * (0.5 + 0.5 * Math.sin(f * 0.4 + i * 1.3)), rz: f * 0.1 + i });
      if (f >= 2189) { const t = ramp(f, 2189, 2204); for (let i = 0; i < 7; i++) F('dust', -7.6 + (i - 3) * 0.32 * (1 + t), 0.2 + t * 0.5 + (i % 2) * 0.3, -3.1 + t * 0.3, { s: 0.6 + t * 1.2 });
        F('padlock', HASP[0], HASP[1], HASP[2] + 0.02, { s: back(ramp(f, 2191, 2197)) * 1.6 }); for (let i = 0; i < 4; i++) { const a = f * 0.4 + i * 1.57; F('spark', HASP[0] + Math.cos(a) * 0.25, HASP[1] + Math.sin(a) * 0.25, HASP[2] + 0.06, { s: 0.6 * ramp(f, 2192, 2196), rz: f * 0.3 }); }
        F('bang', -8.3, 2.05, -1.95, { s: back(ramp(f, 2190, 2195)) * 1.6 }); }
      break; }
  }
  return out.filter((o) => o.m !== 'calendar' && (o.s ?? 1) > 0.002);
};
