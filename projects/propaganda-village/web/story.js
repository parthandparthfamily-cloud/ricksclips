// Shot plan for "The Village Built For An Audience" — timed to the supplied voiceover word timestamps (script.json), 30 fps.
// Every clause gets a story action + a camera move; compositions change every ~1.6 s; transitions are camera flights or moving dissolves.
export const FPS = 30, TOTAL = 2114;   // last word ends 70.16 s -> cut at ~70.46 s
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ramp = (f, a, b) => clamp((f - a) / (b - a));
const sm = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const EASE = { lin: (t) => clamp(t), out: (t) => 1 - Math.pow(1 - clamp(t), 3), sm, inout: (t) => sm(t), in: (t) => Math.pow(clamp(t), 2) };
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerpHex = (a, b, t) => '#' + hx(a).map((v, i) => Math.round(lerp(v, hx(b)[i], t)).toString(16).padStart(2, '0')).join('');

// ---------- lights ----------
export const LIGHTS = {
  day: { az: 125, el: 48, sky: '#cfe0f6', ground: '#8a8a6a', hemi: 1.2, sun: '#fff4e2', sunI: 2.4, fog: '#cfe2f4', fogNear: 120, fogFar: 1300,
    skyTop: '#3a86e0', skyHor: '#cfe6fa', sat: 1.12, vig: 0.18, water: '#64b4e0', water2: '#c8ecfa', shadowExt: 45 },
  golden: { az: 70, el: 14, sky: '#c9b8e8', ground: '#8a6a4a', hemi: 1.1, sun: '#ffc27a', sunI: 2.7, fog: '#f6cda0', fogNear: 110, fogFar: 1100,
    skyTop: '#6b8fd6', skyHor: '#ffd29a', sunDisc: '#fff0c8', sunSize: 0.004, sat: 1.12, gain: '#fff6ea', vig: 0.2, water: '#e8a878', water2: '#ffe2b8', cloud: '#ffe6cc', shadowExt: 45 },
  dusk: { az: 250, el: 6, sky: '#9a8ad8', ground: '#5a4a6a', hemi: 1.05, sun: '#ff9a6a', sunI: 1.9, fog: '#b48ac8', fogNear: 100, fogFar: 1000,
    skyTop: '#3b4fb0', skyHor: '#ff9e7a', sunDisc: '#ffd0a0', sunSize: 0.003, sat: 1.15, vig: 0.22, water: '#8a6ab0', water2: '#ffb48a', cloud: '#ffc0b0', night: 1, shadowExt: 45 },
  night: { az: 210, el: 40, sky: '#8aa6f0', ground: '#3a4a8a', hemi: 1.25, sun: '#b8ccff', sunI: 1.1, fog: '#3a5ab0', fogNear: 90, fogFar: 900,
    skyTop: '#16307e', skyHor: '#4d78d0', sunDisc: '#eef4ff', sunSize: 0.0016, sat: 1.18, gain: '#e4ecff', vig: 0.24, water: '#2f4f9a', water2: '#6f90e0', cloud: '#7f95d0', night: 1, shadowExt: 45 },
  home: { az: 150, el: 40, sky: '#d6dde6', ground: '#8a806a', hemi: 1.2, sun: '#fff0dc', sunI: 2.2, fog: '#d8e0ea', fogNear: 80, fogFar: 900,
    skyTop: '#6f98cc', skyHor: '#dce6f0', sat: 1.02, vig: 0.22, shadowExt: 25 },
};
const lightMix = (A, B, t) => { const o = { ...A }; for (const k in B) { if (typeof A[k] === 'string' && A[k][0] === '#' && typeof B[k] === 'string') o[k] = lerpHex(A[k], B[k], t); else if (typeof A[k] === 'number' && typeof B[k] === 'number') o[k] = lerp(A[k], B[k], t); else if (t > 0.5) o[k] = B[k]; } return o; };

// ---------- key places ----------
const OPY = 6, MIN = [0, OPY, 65.4], KANG = [-1.15, OPY, 65.6], SARGE = [1.3, OPY, 65.8];
const BY = OPY + 0.35, TA = [-2.3, BY, 66.6], TB = [-0.6, BY, 66.8], TC = [0.7, BY, 66.8], TD = [2.4, BY, 66.6];
const FACE = (p, h = 1.52) => [p[0], p[1] + h, p[2]];
const HOME = [400, 0, 400];
const HB = [14, 0, -84];

// ---------- shots ----------
// keys: [frame, pos, look, fov, roll, ease]. First key is reached from the previous shot with a fast eased move (unless diss).
const k = (f, pos, look, fov = 40, roll = 0, ease) => ({ f, pos, look, fov, roll, ease });
export const SHOTS = [
  { id: 'hook', a: 0, b: 61, light: 'day', foc: [7.4, 2.4, -63.6], cinf: 6, keys: [
    k(0, [6.6, 2.1, -57.6], [8.3, 1.95, -63.4], 40, -2), k(9, [6.2, 2.4, -57.0], [8.3, 2.0, -63.5], 41, -1, 'lin'),
    k(26, [1.5, 8.5, -47], [17, 3.5, -78], 46, 2, 'out'), k(61, [0.5, 9.4, -45], [17, 4, -79], 45, 3, 'lin')] },
  { id: 'people', a: 62, b: 114, light: 'day', foc: [0, 3.2, -97.5], cinf: 7, keys: [
    k(76, [-1.2, 2.4, -83], [0, 3.1, -97.5], 40, -2), k(114, [0.8, 2.9, -89.5], [0, 3.4, -97.5], 34, -3.5, 'lin')] },
  { id: 'soldier', a: 115, b: 200, light: 'day', diss: 8, foc: FACE(MIN), cinf: 9, keys: [
    k(115, [3.2, 10.5, 51], [0.2, 7.6, 65.5], 46, 4), k(136, [1.0, 8.4, 58.0], [0.2, 7.5, 65.5], 42, 2, 'out'), k(200, [-0.8, 8.5, 58.6], [-0.1, 7.55, 65.5], 41, -1, 'lin')] },
  { id: 'job', a: 201, b: 245, light: 'day', foc: FACE(MIN), cinf: 10, keys: [
    k(213, [0.9, 8.1, 59.8], [0.65, 7.95, 65.5], 40, -2), k(245, [0.5, 8.05, 60.3], [0.6, 7.95, 65.5], 38, 1, 'lin')] },
  { id: 'raise', a: 246, b: 279, light: 'day', foc: FACE(MIN, 1.5), cinf: 12, keys: [
    k(256, [0.25, 7.55, 62.7], [0, 7.48, 65.4], 36, 2), k(279, [0.05, 7.5, 64.0], [0, 7.47, 65.4], 34, 4, 'in')] },
  { id: 'bino1', a: 280, b: 325, light: 'day', diss: 8, bino: 1, foc: [10, 6, -84], cinf: 0, keys: [
    k(280, [-6, 10, 40], [-30, 8, -84], 6, 0), k(325, [-4, 10, 40], [28, 8.5, -84], 5.5, 0, 'lin')] },
  { id: 'hometown', a: 326, b: 367, light: 'home', diss: 8, foc: [HOME[0] - 2, 1.5, HOME[2] + 2.5], cinf: 7, keys: [
    k(326, [HOME[0] + 4.5, 2.6, HOME[2] + 11], [HOME[0] - 1, 2.0, HOME[2] - 1], 42, -2), k(367, [HOME[0] + 2.2, 2.3, HOME[2] + 9.2], [HOME[0] - 1.5, 1.9, HOME[2] - 1], 40, 1.5, 'lin')] },
  { id: 'roofs', a: 368, b: 404, light: 'day', diss: 8, foc: [-54, 7, -58], cinf: 4, keys: [
    k(368, [-41, 12.5, -46], [-55, 7.4, -59], 40, -3), k(404, [-49, 12.8, -46.5], [-60, 7.2, -59], 38, 1, 'lin')] },
  { id: 'apts', a: 405, b: 442, light: 'day', foc: [-32, 14, -133], cinf: 3, via: [[-30, 18, -70], [-27, 8, -105]], keys: [
    k(418, [-27.5, 1.8, -116], [-32, 6, -133], 52, 3), k(442, [-28.5, 2.4, -117], [-32, 27, -133], 54, -2, 'sm')] },
  { id: 'school', a: 443, b: 482, light: 'day', foc: [-30, 6, -58], cinf: 3, via: [[-4, 14, -95], [-2, 12, -50]], keys: [
    k(454, [-6, 5.2, -36], [-30, 7, -58], 44, 2), k(463, [-1, 5.4, -36.5], [10, 7, -60], 44, 0, 'inout'), k(482, [2, 5.8, -37], [30, 8, -60], 42, -2, 'out')] },
  { id: 'evening', a: 483, b: 514, light: 'dusk', diss: 8, foc: [0, 8, -84], cinf: 0, keys: [
    k(483, [16, 3.2, 14], [2, 8, -84], 30, 1), k(514, [13, 3.5, 8], [0, 8.5, -84], 28, -1, 'lin')] },
  { id: 'windows', a: 515, b: 544, light: 'dusk', foc: [42, 8, -79], cinf: 4, via: [[44, 20, -40]], keys: [
    k(527, [45, 7, -68.5], [42, 8, -79.5], 40, -2), k(544, [46.6, 7.6, -70], [42, 8.6, -79.5], 37, 1.5, 'lin')] },
  { id: 'morning', a: 545, b: 574, light: 'golden', diss: 8, foc: FACE(KANG), cinf: 10, keys: [
    k(545, [-0.3, 8.2, 59.2], [-0.2, 7.55, 65.6], 42, -2), k(574, [-0.9, 8.25, 59.7], [-0.4, 7.55, 65.6], 40, 1, 'lin')] },
  { id: 'horns', a: 575, b: 620, light: 'golden', foc: [18, 14, -46], cinf: 6, keys: [
    k(588, [15.6, 14.6, -39.5], [18, 14.3, -46], 40, 3), k(620, [14.4, 13.2, -36], [18, 14, -46], 46, -2, 'lin')] },
  { id: 'fields', a: 621, b: 647, light: 'golden', foc: FACE(MIN), cinf: 4, keys: [
    k(627, [12, 13, -32], [6, 10, 10], 48, -2, 'out'), k(636, [3, 9.5, 40], [0, 7.6, 65.5], 44, 3, 'sm'), k(647, [0.8, 8.3, 58.6], [0, 7.5, 65.6], 42, 1, 'out')] },
  { id: 'telling', a: 648, b: 712, light: 'day', foc: [-9, 1.6, -48], cinf: 8, via: [[-6, 10, -30]], keys: [
    k(662, [-8.2, 1.95, -44.4], [-9, 1.9, -48.2], 42, -2), k(712, [-7.6, 2.05, -44.8], [-8.8, 1.95, -48.2], 40, 2, 'lin')] },
  { id: 'come', a: 713, b: 760, light: 'day', foc: [-9, 2.5, -48], cinf: 5, keys: [
    k(725, [-7.6, 3.1, -42.7], [-9, 3.3, -48], 52, 2), k(760, [-8.6, 3.0, -43.0], [-9, 3.2, -48], 50, -1.5, 'lin')] },
  { id: 'jealous', a: 761, b: 800, light: 'day', foc: FACE(MIN), cinf: 12, via: [[-4, 12, 0]], keys: [
    k(773, [0.15, 7.5, 62.9], [0.05, 7.48, 65.4], 38, 2), k(800, [-0.1, 7.52, 63.3], [0, 7.48, 65.4], 36, -1.5, 'lin')] },
  { id: 'notice', a: 801, b: 850, light: 'day', foc: FACE(MIN), cinf: 10, keys: [
    k(812, [1.2, 7.7, 61.2], [0.4, 7.5, 65.5], 40, -2), k(838, [0.6, 7.6, 62.3], [0.1, 7.5, 65.4], 37, 1, 'lin'), k(850, [0.05, 7.5, 64.2], [0, 7.47, 65.4], 34, 3, 'in')] },
  { id: 'clock', a: 851, b: 892, light: 'night', diss: 8, bino: 1, foc: [-30, 11.6, -54.8], cinf: 4, keys: [
    k(851, [-28.6, 10.8, -42.6], [-30, 11.3, -55], 34, 0), k(892, [-29.2, 11.0, -44.2], [-30, 11.4, -55], 29, 0, 'lin')] },
  { id: 'snap', a: 893, b: 925, light: 'night', bino: 1, foc: [0, 9, -84], cinf: 0, keys: [
    k(905, [-12, 14, -28], [-6, 10, -84], 46, 0), k(925, [-10, 15, -24], [-4, 10, -84], 48, 0, 'lin')] },
  { id: 'every', a: 926, b: 954, light: 'night', foc: [0, 9, -86], cinf: 0, keys: [
    k(931, [-44, 9, -66], [-44, 8, -84], 42, 2), k(954, [44, 9.5, -66], [46, 8, -84], 42, -2, 'inout')] },
  { id: 'laundry', a: 955, b: 989, light: 'day', diss: 8, foc: [-45.5, 7.4, -78.7], cinf: 8, keys: [
    k(955, [-43.2, 7.6, -74.8], [-45.6, 7.0, -78.8], 38, -2), k(989, [-44.4, 7.9, -74.6], [-45.6, 7.0, -78.8], 34, 1.5, 'lin')] },
  { id: 'kids', a: 990, b: 1032, light: 'day', foc: [-31, 1.5, -49], cinf: 6, via: [[-46, 9, -50]], keys: [
    k(1002, [-24.5, 2.0, -42.6], [-31, 1.6, -49.5], 44, 2), k(1032, [-26.5, 1.8, -42.3], [-32.5, 1.5, -49.5], 42, -2, 'lin')] },
  { id: 'onlyppl', a: 1033, b: 1075, light: 'day', foc: FACE(MIN), cinf: 9, via: [[-20, 9, -30]], keys: [
    k(1045, [-0.2, 8.3, 58.4], [0, 7.5, 65.6], 42, -2), k(1075, [0.4, 8.25, 59.2], [0.1, 7.5, 65.6], 40, 2, 'lin')] },
  { id: 'sweep', a: 1076, b: 1133, light: 'day', foc: [4.5, 1.4, -70.5], cinf: 8, via: [[1, 12, -40]], keys: [
    k(1088, [4.6, 2.0, -61.8], [4.6, 1.45, -70.6], 56, -2), k(1133, [4.0, 2.05, -62.2], [4.5, 1.45, -70.6], 54, 2, 'lin')] },
  { id: 'leave', a: 1134, b: 1160, light: 'day', foc: [8, 1.4, -70.5], cinf: 4, keys: [
    k(1144, [5.0, 2.8, -64.8], [11, 1.5, -71], 46, 2), k(1160, [4.4, 3.2, -64.4], [12, 1.5, -71], 47, -1, 'lin')] },
  { id: 'zoom', a: 1161, b: 1200, light: 'day', diss: 8, bino: 1, foc: [14, 10.7, -80], cinf: 0, keys: [
    k(1161, [14.6, 10.9, -40], [14, 10.7, -80], 34, 0, 'lin'), k(1198, [14.2, 10.75, -48], [14, 10.7, -80], 8, 0, 'sm'), k(1200, [14.2, 10.75, -48.5], [14, 10.7, -80], 7.6, 0, 'lin')] },
  { id: 'through', a: 1201, b: 1263, light: 'day', diss: 6, foc: [14, 12, -110], cinf: 0, keys: [
    k(1201, [14.05, 10.72, -72], [14, 10.9, -100], 40, 0), k(1230, [14.0, 10.7, -79.4], [14, 11.3, -100], 44, -2, 'inout'), k(1263, [14.0, 10.6, -82.6], [14, 12.2, -100], 46, 2, 'lin')] },
  { id: 'noglass', a: 1264, b: 1292, light: 'day', foc: [14, 10.7, -80], cinf: 3, keys: [
    k(1274, [15.6, 10.0, -85.6], [14, 10.8, -80], 46, 3), k(1292, [15.2, 10.1, -86.0], [14, 10.7, -80], 44, -1, 'lin')] },
  { id: 'norooms', a: 1293, b: 1332, light: 'day', foc: [14, 3, -84], cinf: 0, via: [[15, 13, -84]], keys: [
    k(1305, [22, 21, -73], [14, 5, -84], 44, -3), k(1332, [24, 27, -71], [14, 4, -84], 44, 1, 'lin')] },
  { id: 'middle', a: 1333, b: 1368, light: 'day', foc: [0, 40, -122], cinf: 0, keys: [
    k(1346, [26, 32, -66], [0, 34, -122], 50, 2), k(1368, [22, 36, -63], [0, 42, -122], 52, -1, 'lin')] },
  { id: 'pole', a: 1369, b: 1421, light: 'day', foc: [0, 3, -116], cinf: 5, keys: [
    k(1380, [5.5, 1.6, -106.5], [1.5, 2.4, -116], 50, -3), k(1421, [7.5, 2.4, -104], [0, 78, -122], 56, 2, 'sm')] },
  { id: 'flag', a: 1422, b: 1477, light: 'day', foc: [13, 92, -122], cinf: 0, keys: [
    k(1434, [18, 96, -101], [12, 92, -122], 44, 3), k(1477, [24, 99, -94], [11, 91, -122], 50, -2, 'lin')] },
  { id: 'motorbike', a: 1478, b: 1515, light: 'day', foc: [-10, 2.4, -96], cinf: 7, keys: [
    k(1489, [-7.2, 2.9, -88.4], [-10, 2.6, -96], 42, 2), k(1515, [-8.6, 2.7, -88.0], [-10.2, 2.5, -96], 40, -2, 'lin')] },
  { id: 'why', a: 1516, b: 1566, light: 'day', foc: FACE(SARGE), cinf: 9, via: [[-4, 14, -40]], keys: [
    k(1527, [1.4, 8.2, 59.4], [0.7, 7.5, 65.6], 41, -2), k(1566, [0.9, 8.2, 59.9], [0.6, 7.5, 65.6], 39, 2, 'lin')] },
  { id: 'spole', a: 1567, b: 1630, light: 'day', diss: 8, foc: [-37, 1.8, 55], cinf: 4, keys: [
    k(1567, [-31, 2.2, 46.5], [-38, 4, 57], 46, -2), k(1600, [-31.5, 2.6, 46.0], [-40, 26, 58], 54, 1, 'sm'), k(1630, [-32, 3.0, 45.5], [-40, 34, 58], 56, 2, 'lin')] },
  { id: 'bigger', a: 1631, b: 1675, light: 'day', foc: [0, 3, -116], cinf: 3, via: [[-10, 40, -20], [6, 20, -90]], keys: [
    k(1641, [9, 2.2, -103], [1, 30, -122], 56, -2), k(1675, [15, 30, -94], [0, 95, -122], 58, 2, 'sm')] },
  { id: 'says', a: 1676, b: 1722, light: 'day', foc: [-9, 1.6, -48], cinf: 8, keys: [
    k(1688, [-9.6, 1.95, -44.3], [-9, 1.9, -48.2], 42, 2), k(1722, [-10.2, 2.0, -44.6], [-9, 1.95, -48.2], 40, -1.5, 'lin')] },
  { id: 'kijong', a: 1723, b: 1772, light: 'day', foc: [-46, 3.4, -52], cinf: 6, keys: [
    k(1734, [-44.4, 3.6, -44.6], [-46, 3.4, -52], 40, -2), k(1772, [-46.4, 3.9, -45.2], [-46.2, 3.3, -52], 42, 1.5, 'lin')] },
  { id: 'farming', a: 1773, b: 1822, light: 'day', foc: [-80, 1.8, -66], cinf: 5, keys: [
    k(1785, [-70, 2.6, -55], [-80, 1.9, -66], 44, 2), k(1822, [-73, 2.2, -54], [-83, 1.9, -68], 42, -2, 'lin')] },
  { id: 'everyone', a: 1823, b: 1886, light: 'day', foc: FACE(MIN), cinf: 4, via: [[-40, 12, -20]], keys: [
    k(1835, [-2.6, 8.3, 59.4], [-1.6, 7.6, 65.8], 44, 2), k(1886, [2.6, 8.3, 59.6], [1.6, 7.6, 65.8], 44, -2, 'lin')] },
  { id: 'movieset', a: 1887, b: 1915, light: 'day', foc: [-24, 1.6, -95], cinf: 5, via: [[-14, 22, -60]], keys: [
    k(1897, [-18.5, 2.8, -100.5], [-23.5, 1.9, -95], 46, -3), k(1915, [-22, 3.0, -101.8], [-24.5, 1.9, -95], 46, 2, 'lin')] },
  { id: 'notlived', a: 1916, b: 1967, light: 'golden', diss: 8, foc: [0, 8, -90], cinf: 0, keys: [
    k(1916, [24, 20, -20], [2, 8, -92], 46, -2), k(1967, [14, 18, -22], [-2, 8, -92], 46, 2, 'lin')] },
  { id: 'lookedat', a: 1968, b: 2006, light: 'night', lightFrom: 'golden', lightRamp: [1968, 1984], foc: [0, 10, -100], cinf: 0, keys: [
    k(1976, [8, 13, -26], [0, 18, -100], 46, 2), k(2006, [5, 14, -20], [0, 18, -100], 44, -1, 'lin')] },
  { id: 'audience', a: 2007, b: 2113, light: 'night', foc: FACE(MIN), cinf: 3, keys: [
    k(2007, [5, 14, -20], [0, 18, -100], 44, -1, 'lin'), k(2048, [0, 24, 30], [0, 14, -100], 48, 1, 'sm'),
    k(2076, [-14, 14, 52], [0, 7.2, 66], 46, -2, 'sm'), k(2094, [0.4, 8.4, 57.6], [0.2, 8.0, 65.6], 44, 1, 'out'), k(2113, [0.1, 8.45, 58.2], [0.1, 8.0, 65.6], 43, -1, 'lin')] },
];
SHOTS.forEach((s, i) => { s.i = i; });
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- camera ----------
const camCache = {};
const interpKeys = (S, f) => {
  const K = S.keys;
  if (f >= K[K.length - 1].f) { // extrapolate drift (outgoing side of a dissolve)
    const b = K[K.length - 1], a = K[K.length - 2] || b, n = Math.max(1, b.f - a.f), d = (f - b.f) / n;
    return { pos: b.pos.map((v, i) => v + (v - a.pos[i]) * d), look: b.look.map((v, i) => v + (v - a.look[i]) * d), fov: b.fov + (b.fov - a.fov) * d, roll: b.roll };
  }
  if (f <= K[0].f) {
    if (S.diss || S.i === 0) return { ...K[0] };
    const P = camEnd(SHOTS[S.i - 1]), a0 = S.a - 1, t = EASE[K[0].ease || 'out']((f - a0) / (K[0].f - a0));
    let pos = lerp3(P.pos, K[0].pos, t);
    if (S.via) { // curved flight through via points (quadratic bezier chain)
      const pts = [P.pos, ...S.via, K[0].pos], n = pts.length - 1, x = t * n, i = Math.min(n - 1, Math.floor(x)), u = x - i;
      pos = lerp3(pts[i], pts[i + 1], u);
    }
    return { pos, look: lerp3(P.look, K[0].look, t), fov: lerp(P.fov, K[0].fov, t), roll: lerp(P.roll, K[0].roll, t) };
  }
  for (let i = 0; i < K.length - 1; i++) if (f >= K[i].f && f <= K[i + 1].f) {
    const a = K[i], b = K[i + 1], t = EASE[b.ease || 'lin']((f - a.f) / (b.f - a.f));
    return { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll, b.roll, t) };
  }
};
const camEnd = (S) => camCache[S.id] || (camCache[S.id] = interpKeys(S, S.b));
const KICKS = [{ f: 30, a: 0.05 }, { f: 93, a: 0.03 }, { f: 589, a: 0.06 }, { f: 595, a: 0.04 }, { f: 893, a: 0.03 }, { f: 1590, a: 0.03 }, { f: 1648, a: 0.04 }, { f: 1660, a: 0.04 }, { f: 1672, a: 0.05 }, { f: 1972, a: 0.04 }, { f: 2080, a: 0.03 }];
const camShot = (S, f) => {
  const c = { ...interpKeys(S, f) };
  const d = dist(c.pos, c.look), n = 0.0022 * Math.min(d, 30);
  c.look = [c.look[0] + n * (Math.sin(f * 0.31) + 0.6 * Math.sin(f * 0.71 + 1)), c.look[1] + n * (Math.sin(f * 0.27 + 2) + 0.5 * Math.sin(f * 0.83)), c.look[2]];
  c.roll += 0.35 * Math.sin(f * 0.11 + 0.5) + 0.2 * Math.sin(f * 0.37);
  for (const kk of KICKS) { const dd = f - kk.f; if (dd >= 0 && dd < 8) { const s = (dd % 2 ? -1 : 1) * kk.a * (1 - dd / 8); c.look = [c.look[0] + s * d * 0.15, c.look[1] + s * d * 0.12, c.look[2]]; c.roll += s * 18; } }
  c.bino = S.bino || 0; c.binoR = 0.31;
  if (S.id === 'raise') c.bino = 0;
  if (S.id === 'notice') c.bino = 0;
  if (S.id === 'snap') c.bino = 1;
  return c;
};

// ---------- lens ----------
const dofShot = (S, C) => ({ focus: dist(C.pos, S.foc), cinf: S.cinf, near: 1 });

// ---------- world state ----------
const order = (i) => (i * 7) % 23;
const worldShot = (S, f) => {
  const W = { night: S.light === 'night' || S.light === 'dusk', people: f >= 93, roofDrop: sm(ramp(f, 16, 30)), signSink: -0.25 * sm(ramp(f, 0, 50)), nPole: 1.65, sPole: 1 };
  W.signSink = -[0, 6, 13, 20, 27, 34, 41, 48].filter((h) => f >= h).length * 0.03;
  if (S.light === 'dusk') W.lit = (i) => (f > 495 + order(i) * 1.8 ? 1 : 0);
  if (S.light === 'night') W.lit = (i) => (S.id === 'clock' ? 0 : S.id === 'snap' ? (f >= 893 ? 1 : 0) : S.id === 'lookedat' ? (f >= 1972 ? 1 : 0) : 1);
  if (S.id === 'clock' || S.id === 'snap') { W.clockHour = 7; W.clockMin = f < 885 ? 59 - (885 - f) * 0.004 : 60; if (f >= 885) W.clockHour = 7; }
  if (S.id === 'clock' && f < 885) { W.clockHour = 6.98; W.clockMin = 59; }
  W.blast = S.id === 'horns' ? (f >= 589 ? 1 : 0.15) : S.id === 'fields' || S.id === 'telling' || S.id === 'come' || S.id === 'lookedat' || S.id === 'audience' ? 0.7 : 0;
  W.ballRoll = S.id === 'kids' ? ramp(f, 992, 1032) : 0.0;
  W.xray = S.id === 'norooms' ? sm(ramp(f, 1293, 1312)) : 0;
  W.scaleTilt = S.id === 'motorbike' ? 0.12 * Math.exp(-(f - 1478) / 14) * Math.cos((f - 1478) * 0.35) : undefined;
  W.come = S.id === 'come' ? 1 : 0.3;
  if (S.id === 'hometown') W.tileFall = ramp(f, 338, 352);
  if (S.id === 'spole') W.sPole = 0.02 + 0.98 * sm(ramp(f, 1572, 1606));
  if (S.id === 'bigger') { const st = [[1641, 0.9], [1648, 1.12], [1660, 1.36], [1672, 1.65]]; let v = 0.85; for (const [ff, h] of st) if (f >= ff - 5) v = lerp(v, h, sm(ramp(f, ff - 5, ff))); W.nPole = v; }
  return W;
};

// ---------- actors ----------
const blinkAt = (f, seed) => { const per = 38 + (seed * 17) % 31, ph = (f + seed * 13) % per; return ph < 2 ? 1 : 0; };
const exprAt = (f, list) => { let e = list[0][1]; for (const [ff, x] of list) if (f >= ff) e = x; return e; };
const dart = (f, seed) => q(Math.sin(f * 0.05 + seed) > 0.6 ? 0.5 : Math.sin(f * 0.05 + seed) < -0.7 ? -0.5 : 0, 1);
const talkAt = (f, on = true) => (on ? [0, 0.3, 0.8, 0.3, 0, 0.8][Math.floor(f / 3) % 6] : 0);
const blend = (a, b, t) => ({ a, b, t: q(clamp(t), 2) });
const act = (T, who, pos, o = {}, x = {}) => {
  const opts = { expr: 'neutral', blink: blinkAt(x.f ?? 0, x.seed ?? 1), ...o };
  for (const kk of ['L', 'R']) if (opts[kk] && typeof opts[kk] === 'object') opts[kk] = { ...opts[kk], t: q(opts[kk].t, 2) };
  if (opts.walk != null) opts.walk = q(opts.walk, 2);
  if (opts.headTilt) opts.headTilt = q(opts.headTilt, 1);
  const f = x.f ?? 0, seed = x.seed ?? 1;
  return { key: who + JSON.stringify(opts), draw: (p) => T.castDraw(p, T.PV_CAST[who], opts), x: pos[0] + (x.dx || 0), y: pos[1] + (x.dy || 0), z: pos[2] + (x.dz || 0),
    roll: (x.roll ?? 0) + 0.018 * Math.sin(f * 0.06 + seed * 2), sq: x.sq || 0, s: x.s || 1, ground: pos[1], order: x.order, blob: x.blob };
};
const bob = (f, seed, a = 0.012) => a * Math.sin(f * 0.13 + seed);

const actorsShot = (S, f, T) => {
  const out = [], A = (who, pos, o, x = {}) => out.push(act(T, who, pos, o, { f, seed: x.seed ?? who.length * 3, dy: bob(f, who.length) + (x.dy || 0), ...x }));
  switch (S.id) {
    case 'hook': { // foreman hammers the PERFECT VILLAGE sign in; a roof slams onto a house behind
      const ph = (f % 7) / 7, swing = ph < 0.45 ? ph / 0.45 : 1 - (ph - 0.45) / 0.55;
      A('foreman', [8.7, 0, -63.0], { expr: exprAt(f, [[0, 'grin'], [20, 'beam'], [34, 'smugsmile'], [50, 'grin']]), R: blend('up', 'hold', swing), propR: 'mallet', L: f > 40 ? 'thumb' : 'hip', look: -0.4 });
      break; }
    case 'people': {
      const scratch = f > 93; A('foreman', [-2.3, 0, -95.6], { expr: exprAt(f, [[62, 'grin'], [80, 'think'], [93, 'shock'], [104, 'nervous']]), L: scratch ? blend('chin', 'up', 0.3 + 0.2 * Math.sin(f * 0.6)) : 'hip', R: 'point', look: 0.5, headTilt: scratch ? 6 * Math.sin(f * 0.3) : 0 });
      break; }
    case 'soldier': { // Min arrives with his duffel, Sarge points at the border, Kang waves
      const wk = clamp((f - 120) / 50), x = lerp(4.8, MIN[0], sm(wk));
      A('min', [x, OPY, MIN[2]], { expr: exprAt(f, [[115, 'grin'], [160, 'beam'], [185, 'shock']]), walk: wk < 1 ? (f * 0.06) % 1 : null, R: 'hold', propR: 'duffel', look: -0.4 }, { roll: wk < 1 ? 0.04 * Math.sin(f * 0.4) : 0 });
      A('sarge', SARGE, { expr: exprAt(f, [[115, 'smirk'], [170, 'stern'], [188, 'smirk']]), L: 'hold', propL: 'mug', R: f > 180 ? blend('hip', 'point', ramp(f, 180, 188)) : 'hip', look: 0.6, talk: f > 176 && f < 196 ? talkAt(f) : 0 }, { flip: true });
      A('kang', KANG, { expr: exprAt(f, [[115, 'smile'], [150, 'grin']]), R: blend('wave', 'up', 0.5 + 0.5 * Math.sin(f * 0.4)), look: 0.6 });
      break; }
    case 'job': {
      const give = ramp(f, 208, 222);
      A('sarge', SARGE, { expr: exprAt(f, [[201, 'smirk'], [222, 'smugsmile']]), L: blend('hip', 'point', give), propL: give < 0.8 ? 'binos' : null, R: 'hold', propR: 'mug', look: -0.6, talk: f < 226 ? talkAt(f) : 0 });
      A('min', MIN, { expr: exprAt(f, [[201, 'grin'], [220, 'beam'], [236, 'smile']]), R: give >= 0.8 ? blend('holdUp', 'hold', 0.2 * Math.sin(f * 0.3)) : 'hang', propR: give >= 0.8 ? 'binos' : null, look: 0.5 });
      A('kang', KANG, { expr: 'smile', L: 'hip', look: 0.4 });
      break; }
    case 'raise': {
      const up = f > 256;
      A('min', MIN, { expr: exprAt(f, [[246, 'grin'], [256, 'stern']]), binoEyes: up, R: up ? 'mouth' : blend('hold', 'holdUp', ramp(f, 246, 256)), propR: up ? null : 'binos', headTilt: up ? -2 : 0 });
      break; }
    case 'hometown': {
      const H = (dx, dz) => [HOME[0] + dx, 0, HOME[2] + dz];
      A('grandma', H(1.4, 4.6), { expr: exprAt(f, [[326, 'smile'], [340, 'grin'], [352, 'shock'], [360, 'smile']]), R: blend('wave', 'up', 0.5 + 0.5 * Math.sin(f * 0.45)), look: 0.4 });
      break; }
    case 'morning': {
      A('kang', KANG, { expr: 'sleepy', blink: 1, L: 'hang', R: 'hang', headTilt: -8 + 3 * Math.sin(f * 0.12) });
      A('sarge', SARGE, { expr: exprAt(f, [[545, 'smugsmile'], [560, 'bored']]), L: blend('hold', 'mouth', 0.5 + 0.5 * Math.sin(f * 0.15)), propL: 'mug', look: -0.5 });
      A('min', MIN, { expr: 'sleepy', blink: 1, headTilt: 5 });
      break; }
    case 'fields': {
      const hit = f > 640;
      A('min', MIN, { expr: hit ? 'shock' : 'sleepy', L: hit ? 'mouth' : 'hang', R: hit ? 'mouth' : 'hang' }, { dy: hit ? 0.06 * Math.abs(Math.sin(f * 0.8)) : 0 });
      A('kang', KANG, { expr: hit ? 'nervous' : 'sleepy', L: hit ? 'up' : 'hang', R: hit ? 'up' : 'hang', blink: hit ? 0 : 1 }, { dy: hit ? 0.05 : 0 });
      A('sarge', SARGE, { expr: hit ? 'angry' : 'bored', L: 'hold', propL: 'mug' });
      break; }
    case 'telling': case 'says': {
      const read = S.id === 'says';
      A('announcer', [-9, 0, -48.2], { expr: exprAt(f, read ? [[1676, 'grin'], [1700, 'beam'], [1712, 'wink']] : [[648, 'beam'], [670, 'grin'], [690, 'beam'], [700, 'wink']]), R: 'mouth', propR: 'mic', L: read ? 'hold' : blend('thumb', 'up', 0.5 + 0.5 * Math.sin(f * 0.25)), propL: read ? 'paper' : null, talk: talkAt(f), look: read ? -0.3 : 0.4 }, { s: 1, dy: 0.02 * Math.sin(f * 0.5) });
      break; }
    case 'come': {
      A('announcer', [-9, 0, -48.2], { expr: exprAt(f, [[713, 'beam'], [735, 'wink'], [748, 'grin']]), R: 'mouth', propR: 'mic', L: blend('point', 'wave', 0.5 + 0.5 * Math.sin(f * 0.7)), talk: talkAt(f), look: 0.6 });
      break; }
    case 'jealous': {
      A('min', MIN, { expr: exprAt(f, [[761, 'think'], [776, 'nervous'], [790, 'think']]), R: 'hold', propR: 'binos', L: 'chin', look: dart(f, 1), headTilt: 4 * Math.sin(f * 0.08) });
      A('kang', KANG, { expr: exprAt(f, [[761, 'smile'], [784, 'smugsmile']]), L: 'chin', look: -0.6 });
      A('sarge', SARGE, { expr: exprAt(f, [[761, 'bored'], [790, 'stern']]), L: 'cross', R: 'cross', look: -0.8 });
      break; }
    case 'notice': {
      const up = f > 818;
      A('min', MIN, { expr: exprAt(f, [[801, 'think'], [812, 'stern']]), binoEyes: up, R: up ? 'mouth' : blend('hold', 'holdUp', ramp(f, 806, 818)), propR: up ? null : 'binos', look: 0.2, headTilt: up ? -3 : 0 });
      A('kang', KANG, { expr: 'think', L: 'chin', look: 0.6 });
      A('sarge', SARGE, { expr: 'stern', L: 'hold', propL: 'mug', look: -0.6 });
      break; }
    case 'onlyppl': {
      A('min', MIN, { expr: 'stern', binoEyes: true, headTilt: 2 * Math.sin(f * 0.1) }, { dz: -0.1 });
      A('kang', KANG, { expr: exprAt(f, [[1033, 'think'], [1050, 'shock']]), binoEyes: true }, { roll: 0.06 });
      A('sarge', SARGE, { expr: exprAt(f, [[1033, 'bored'], [1055, 'think']]), L: 'chin', look: -0.6 }, { roll: -0.04 });
      break; }
    case 'sweep': case 'leave': {
      const leave = S.id === 'leave';
      [['sweepA', 2.4], ['sweepB', 4.6], ['sweepC', 6.8]].forEach(([w, x0], i) => {
        const ph = Math.sin(f * 0.32 + 0), go = leave ? clamp((f - 1136 - i * 3) / 22) : 0;
        const x = x0 + (leave ? go * 7 : ph * 0.12);
        A(w, [x, 0, -70.8 + i * 0.25], { expr: leave ? 'bored' : exprAt(f + i * 7, [[1076, 'bored'], [1095, 'sleepy'], [1112, 'neutral']]), R: leave ? 'staff' : blend('hold', 'staff', 0.5 + 0.5 * ph), propR: 'broom', walk: leave && go > 0 && go < 1 ? (f * 0.07 + i * 0.3) % 1 : null, look: leave ? 0.8 : 0 }, { roll: leave ? 0 : 0.06 * ph, flip: leave });
      });
      break; }
    case 'motorbike': {
      A('guardB', [-6.8, 0, -95.2], { expr: exprAt(f, [[1478, 'think'], [1500, 'shock']]), L: 'chin', R: 'hip', look: -0.6, headTilt: 5 * Math.sin(f * 0.1) });
      break; }
    case 'pole': {
      A('guardA', [3.2, 0, -114.8], { expr: exprAt(f, [[1369, 'stern'], [1395, 'smugsmile']]), R: 'point', look: 0.3, headTilt: -6 });
      A('guardB', [-1.8, 0, -115.2], { expr: exprAt(f, [[1369, 'smirk'], [1400, 'grin']]), L: 'thumb', look: -0.3, headTilt: 6 });
      break; }
    case 'bigger': {
      A('guardA', [3.0, 0, -114.6], { expr: exprAt(f, [[1631, 'smirk'], [1648, 'laugh']]), R: blend('up', 'point', 0.5 + 0.5 * Math.sin(f * 0.3)), headTilt: -6 }, { dy: f > 1648 ? 0.05 * Math.abs(Math.sin(f * 0.6)) : 0 });
      A('guardB', [-2.0, 0, -115.0], { expr: exprAt(f, [[1631, 'smugsmile'], [1660, 'laugh']]), L: 'thumb', R: 'thumb', headTilt: 6 });
      break; }
    case 'why': {
      const pt = ramp(f, 1528, 1540);
      A('sarge', SARGE, { expr: exprAt(f, [[1516, 'smirk'], [1540, 'stern'], [1556, 'smugsmile']]), R: blend('hip', 'point', pt), L: 'hold', propL: 'mug', talk: talkAt(f), look: 0.6 }, { flip: true });
      A('min', MIN, { expr: exprAt(f, [[1516, 'think'], [1548, 'shock']]), R: 'hold', propR: 'binos', look: 0.7, headTilt: 3 });
      A('kang', KANG, { expr: 'think', L: 'chin', look: 0.8 });
      break; }
    case 'spole': {
      const up = f > 1606;
      A('sarge', [-37.4, 0, 54.4], { expr: up ? 'beam' : 'grin', R: up ? blend('up', 'thumb', 0.5 + 0.5 * Math.sin(f * 0.4)) : 'point', headTilt: -5 });
      A('kang', [-35.7, 0, 54.9], { expr: up ? 'laugh' : 'smile', L: up ? 'up' : 'hip', R: up ? 'up' : 'hang', headTilt: -5 }, { dy: up ? 0.08 * Math.abs(Math.sin(f * 0.5)) : 0 });
      break; }
    case 'everyone': {
      const X = (p) => p;
      A('touristA', TA, { expr: exprAt(f, [[1823, 'shock'], [1850, 'think']]), R: 'hold', propR: 'camera', look: 0.4 });
      A('touristB', TB, { expr: 'neutral', binoEyes: true });
      A('kang', KANG, { expr: 'stern', binoEyes: true });
      A('min', MIN, { expr: 'think', binoEyes: true, headTilt: 2 * Math.sin(f * 0.1) });
      A('sarge', SARGE, { expr: 'stern', binoEyes: true });
      A('touristC', TC, { expr: exprAt(f, [[1823, 'think'], [1865, 'shock']]), L: 'chin', look: -0.4 });
      A('touristA', TD, { expr: 'smile', binoEyes: true }, { seed: 31 });
      break; }
    case 'audience': {
      if (f > 2040) {
        const low = f > 2084, e = (seedE) => exprAt(f + seedE, [[2040, 'stern'], [2084, 'shock'], [2098, 'nervous']]);
        A('touristA', TA, { expr: e(0), binoEyes: !low, R: low ? 'hold' : 'mouth', propR: low ? 'camera' : null });
        A('touristB', TB, { expr: e(3), binoEyes: !low, R: low ? 'holdUp' : 'mouth', propR: low ? 'binos' : null });
        A('kang', KANG, { expr: e(5), binoEyes: !low });
        A('min', MIN, { expr: low ? exprAt(f, [[2084, 'shock'], [2100, 'think']]) : 'stern', binoEyes: !low, R: low ? 'hold' : 'mouth', propR: low ? 'binos' : null, look: low ? dart(f, 3) : 0 });
        A('sarge', SARGE, { expr: e(2), binoEyes: !low, L: low ? 'hold' : 'mouth', propL: low ? 'mug' : null });
        A('touristC', TC, { expr: e(7), binoEyes: !low });
      }
      break; }
  }
  return out;
};

// ---------- 3D FX ----------
const fxShot = (S, f, C) => {
  const out = [];
  const push = (type, pos, s = 1, r = {}) => out.push({ type, pos, s, ...r });
  // ambient: leaves / petals drifting through the focus area (layer F)
  if (!['flag', 'middle', 'norooms', 'every', 'snap', 'bino1', 'evening', 'lookedat'].includes(S.id)) {
    const L = S.foc; for (let i = 0; i < 6; i++) { const t = ((f * 0.006 + i / 6) % 1); const x = L[0] - 4 + t * 8 + Math.sin(i * 2.1) * 1.5, y = L[1] + 2.2 - t * 3.2 + Math.sin(t * 8 + i) * 0.3, z = L[2] + 1.5 + Math.cos(i * 1.7) * 1.8;
      push('leaf', [x, y, z], 0.8, { rx: t * 9 + i, ry: t * 5, rz: t * 7 }); }
  }
  if (S.id === 'hook') { if (f >= 30 && f < 52) { const t = (f - 30) / 22; for (let i = 0; i < 6; i++) { const a = i * 1.05; push('puff', [27.5 + Math.cos(a) * (2 + t * 4), 6.4 + t * 1.5, -84 + 3.6 + Math.sin(a) * 1.5], 1.4 * (1 - t * 0.6)); } }
    for (const h of [6, 13, 20, 27, 34, 41, 48]) if (f >= h && f < h + 5) { const t = (f - h) / 5; push('puff', [7, 1.4 + t * 0.2, -63.2], 0.5 + t * 0.4); push('glint', [7.8, 2.7, -63.2], 0.6 * (1 - t), { face: true, rz: t * 2 }); } }
  if (S.id === 'people') { if (f >= 93 && f < 110) { const t = (f - 93) / 17; push('bang', [1.4, 4.1 + t * 0.4, -97.1], 0.8 * Math.min(1, t * 4), { face: true }); push('ring', [0.5, 2.5, -97.2], 1 + t * 2, { face: true }); }
    const t = ((f - 62) / 52); push('bag', [-2 + t * 12, 0.5 + Math.abs(Math.sin(t * 9)) * 1.2, -88 - t * 2], 1, { rx: t * 6, rz: t * 9 }); }
  if (S.id === 'bino1' || S.id === 'roofs') { for (let i = 0; i < 6; i++) { const ph = (f + i * 11) % 30; if (ph < 12) { const xs = S.id === 'roofs' ? [-62, -58, -50, -46, -60, -48] : [-40, -24, 14, 28, 42, -58]; push('glint', [xs[i], S.id === 'roofs' ? 7.6 + (i % 2) * 0.6 : 8 + (i % 3), S.id === 'roofs' ? -58 : -84 + (i % 2) * 26], (S.id === 'roofs' ? 0.9 : 2.5) * Math.sin(ph / 12 * Math.PI), { face: true, rz: ph * 0.2 }); } } }
  if (S.id === 'hometown') { for (let i = 0; i < 3; i++) { const t = ((f * 0.025 + i / 3) % 1); push('drop', [HOME[0] - 0.3, 3.2 - t * 2.7, HOME[2] - 4 + 2.9], 1); }
    for (let i = 0; i < 4; i++) { const t = ((f * 0.012 + i / 4) % 1); push('puff', [HOME[0] + 2.4, 4.9 + t * 4, HOME[2] - 5 + t * 1.5], 0.4 + t * 0.9); }
    if (f >= 350 && f < 362) push('puff', [HOME[0] + 3.8, 0.3, HOME[2] - 2.1 + 1.4], 0.8); }
  if (S.id === 'horns' || S.id === 'fields' || S.id === 'telling' || S.id === 'come' || S.id === 'lookedat' || (S.id === 'audience' && f < 2050)) { // cheerful music notes pour out of the horns
    const tw = [[-13, 14, -45.4], [18, 14, -45.4]], on = S.id === 'horns' ? f >= 589 : true;
    if (on) for (let i = 0; i < 18; i++) { const t = ((f * (S.id === 'fields' ? 0.022 : 0.014) + i / 18) % 1), base = tw[i % 2];
      const far = S.id === 'fields' ? 110 : S.id === 'horns' ? 26 : 14; push('note', [base[0] + Math.sin(i * 2.3) * (2 + t * 6), base[1] + Math.sin(t * 12 + i) * 1.2 + t * 2 - (S.id === 'fields' ? t * 6 : 0), base[2] + t * far], S.id === 'fields' ? 1.6 : 1.1 + t * 0.6, { face: true, rz: Math.sin(f * 0.2 + i) * 0.4 }); }
    if (S.id === 'horns' && f >= 589 && f < 606) { const t = (f - 589) / 17; for (let j = 0; j < 2; j++) push('ring', [18, 14.4, -45 + t * 4 + j * 2], 1 + t * 3 + j, { face: true }); }
  }
  if (S.id === 'fields' && f > 640) { const t = (f - 640) / 7; push('drop', [SARGE[0] + 0.5, OPY + 1.2 + t * 0.4, SARGE[2] - 0.3], 1.2); push('bang', [MIN[0] + 0.5, OPY + 2.25, MIN[2] - 0.2], 0.6, { face: true }); }
  if (S.id === 'morning') for (let i = 0; i < 3; i++) { const t = ((f * 0.02 + i / 3) % 1); push('zzz', [KANG[0] + 0.35 + t * 0.5, OPY + 2.0 + t * 1.1, KANG[2] - 0.2], 0.4 + t * 0.4, { face: true, rz: Math.sin(t * 6) * 0.3 }); }
  if (S.id === 'jealous') for (let i = 0; i < 3; i++) { const t = ((f * 0.02 + i / 3) % 1); push('heart', [KANG[0] + 0.4 + Math.sin(t * 8 + i) * 0.2, OPY + 2.0 + t * 1.0, KANG[2] - 0.2], 0.35 * Math.sin(t * Math.PI), { face: true }); }
  if (S.id === 'snap' && f >= 893 && f < 905) { const t = (f - 893) / 12; push('ring', [-4, 12, -84], 6 + t * 30, { face: true }); }
  if (S.id === 'clock' && f >= 885) { const t = (f - 885) / 8; push('glint', [-30 + 0.9, 12.6, -54.6], 1.2 * Math.sin(Math.min(1, t) * Math.PI), { face: true }); }
  if (S.id === 'sweep' || S.id === 'leave') { [2.4, 4.6, 6.8].forEach((x0, i) => { const ph = ((f * 0.04 + i * 0.33) % 1); if (S.id === 'sweep' || ph < 0.5) push('puff', [x0 + 0.7 + ph * 1.2, 0.2 + ph * 0.5, -70.5 + i * 0.25], 0.25 + ph * 0.45); }); }
  if (S.id === 'leave') { const t = (f - 1134) / 26; push('bag', [2 + t * 6, 0.4 + Math.abs(Math.sin(t * 7)) * 0.8, -68], 1, { rx: t * 6, rz: t * 9 }); }
  if (S.id === 'norooms') for (let i = 0; i < 8; i++) { const t = ((f * 0.02 + i / 8) % 1); push('puff', [14 + Math.sin(i * 2) * 4, HBH + 0.5 + t * 3, -84 + Math.cos(i * 2) * 3], 0.4 + t * 0.6); }
  if (S.id === 'motorbike' && f >= 1495) { const t = ((f - 1495) / 20) % 1; push('glint', [-10, 4.6, -95.6], 0.8 * Math.sin(t * Math.PI), { face: true, rz: t * 3 }); }
  if (S.id === 'spole' && f > 1572 && f < 1612) { const t = (f - 1572) / 40; for (let i = 0; i < 6; i++) { const a = i * 1.05; push('puff', [-42 + Math.cos(a) * (2.5 + t * 4), 0.5 + t, 58 + Math.sin(a) * (2.5 + t * 4)], 1.2 * (1 - t * 0.5)); } }
  if (S.id === 'spole' && f > 1606) for (let i = 0; i < 4; i++) { const t = ((f - 1606) / 24 + i / 4) % 1; push('glint', [-42 + Math.sin(i * 2) * 3, 52 + Math.cos(i * 3) * 6, 58], 1.8 * Math.sin(t * Math.PI), { face: true }); }
  if (S.id === 'bigger') for (const ff of [1648, 1660, 1672]) if (f >= ff && f < ff + 10) { const t = (f - ff) / 10; for (let i = 0; i < 5; i++) { const a = i * 1.25; push('puff', [Math.cos(a) * (3 + t * 4), 1 + t, -122 + Math.sin(a) * (3 + t * 4)], 1.4 * (1 - t * 0.5)); } push('bang', [4, 6 + t * 2, -116], 1.4, { face: true }); }
  if (S.id === 'movieset') { const t = (f % 14) / 14; push('glint', [-24 + 4.6, 3.1, -91 - 3.5 + 0.4], 0.9 + 0.3 * Math.sin(t * 6.28), { face: true }); }
  if (S.id === 'lookedat' || S.id === 'audience') { for (let i = 0; i < 10; i++) { const ph = (f + i * 13) % 40; if (ph < 16 && (S.id === 'lookedat' ? f > 1972 : f < 2070)) push('glint', [-50 + i * 11, 10 + (i % 3) * 7, -84 - (i % 2) * 50], 3 * Math.sin(ph / 16 * Math.PI), { face: true }); } }
  if (S.id === 'audience' && f > 2084 && f < 2100) { push('bang', [MIN[0] + 0.45, OPY + 2.3, MIN[2] - 0.2], 0.5, { face: true }); }
  if (S.id === 'kids') { const t = ((f - 990) / 42); push('leaf', [-34 + t * 6, 0.6 + Math.abs(Math.sin(t * 6)) * 0.5, -47], 1.2, { rx: t * 9, rz: t * 5 }); }
  return out;
};

// ---------- birds (always alive: cranes over the DMZ, magpies over the village) ----------
const birdsAt = (S, f) => {
  const out = [], t = f / 30;
  for (let i = 0; i < 5; i++) { const u = ((t * 0.035 + i * 0.2) % 1), x = -120 + u * 240, z = 10 + Math.sin(i * 2.7) * 18; out.push({ crane: true, pos: [x, 14 + i * 2 + Math.sin(t + i) * 0.6, z], heading: 0, flap: t * 5 + i, s: 1.4 }); }
  for (let i = 0; i < 4; i++) out.push({ crane: true, pos: [-30 + i * 16, 0.9, 18 - i * 9], heading: i * 1.3 + Math.sin(t * 0.3 + i) * 0.4, flap: 0.3, s: 1.3 });
  if (S.id === 'fields' || S.id === 'farming') { for (let i = 0; i < 4; i++) { const u = clamp((f - (S.a + i * 3)) / 30); out[5 + i] = { crane: true, pos: S.id === 'fields' ? [-6 + i * 4, 1 + u * 12, 22 - i * 6 + u * 10] : [-84 + i * 3, 4 + (1 - u) * 6, -66 + i], heading: -0.5, flap: t * 8 + i, s: 1.4 }; } }
  for (let i = 0; i < 6; i++) { const a = t * 0.45 + i * 1.05, r = 22 + (i % 3) * 8; out.push({ crane: false, pos: [Math.cos(a) * r, 20 + (i % 3) * 5 + Math.sin(t * 2 + i), -92 + Math.sin(a) * r * 0.7], heading: -a - Math.PI / 2, bank: 0.3, flap: t * 12 + i, s: 1.1 }); }
  if ((S.id === 'through' && f >= 1228) || S.id === 'noglass') { const u = clamp((f - (S.id === 'through' ? 1228 : 1264)) / 28); out[out.length - 1] = { crane: false, pos: S.id === 'through' ? [14 + Math.sin(u * 3) * 0.3, 10.7 + u * 0.4, -74 - u * 22] : [14.2, 10.4 + (1 - u) * 0.6, -76 - u * 6], heading: Math.PI / 2, flap: t * 14, s: 0.9 }; }
  if (S.id === 'kijong') { const u = clamp((f - 1728) / 20); out[out.length - 2] = { crane: false, pos: [-49 + u * 2.6, 5.1 + (1 - u) * 3 - 0.1, -52.1], heading: 0, flap: u < 1 ? t * 14 : 0.6, s: 0.9 }; }
  if (S.id === 'flag' || S.id === 'pole' || S.id === 'middle') for (let i = 0; i < 3; i++) { const a = t * 0.6 + i * 2; out.push({ crane: false, pos: [Math.cos(a) * 18, 80 + i * 4, -122 + Math.sin(a) * 14], heading: -a - Math.PI / 2, bank: 0.4, flap: t * 12 + i, s: 1.4 }); }
  return out;
};

// ---------- frame state ----------
const lightShot = (S, f) => {
  let L = { ...LIGHTS[S.light] };
  if (S.lightFrom) L = lightMix(LIGHTS[S.lightFrom], LIGHTS[S.light], sm(ramp(f, ...S.lightRamp)));
  return L;
};
const stateFor = (S, f, T) => {
  const C = camShot(S, f);
  if (S.id === 'spole' || S.id === 'bigger' || S.id === 'pole') C.shadowAt = [C.look[0], 0, C.look[2]];
  if (S.id === 'flag' || S.id === 'middle' || S.id === 'norooms' || S.id === 'evening' || S.id === 'snap' || S.id === 'every' || S.id === 'notlived' || S.id === 'lookedat' || (S.id === 'audience' && f < 2070)) C.shadowAt = [C.look[0] * 0.5 + C.pos[0] * 0.5, 0, C.look[2] * 0.5 + C.pos[2] * 0.5];
  return { L: lightShot(S, f), C, Wd: worldShot(S, f), actors: actorsShot(S, f, T), fx: fxShot(S, f, C), birds: birdsAt(S, f), D: dofShot(S, C) };
};
export const frameState = (f, T) => {
  const S = shotAt(f), st = stateFor(S, f, T);
  if (S.diss && f < S.a + S.diss && S.i > 0) { const P = SHOTS[S.i - 1]; st.out = stateFor(P, f, T); st.mix = sm((f - S.a + 1) / (S.diss + 1)); }
  return st;
};
export const HBH = 15;
