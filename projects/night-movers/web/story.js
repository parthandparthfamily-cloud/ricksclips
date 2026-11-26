// NIGHT MOVERS — story, cameras, actors, world state. Timed to the supplied word timestamps (script.json), 30 fps.
import { C, drawChar } from './castdefs.js';
import { O } from './world.js';
export const FPS = 30, TOTAL = 2140; // 71.33 s: last word ends 71.00 s, cut ~0.3 s after
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const sm = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const eo = (x) => 1 - Math.pow(1 - clamp(x), 3);
const ei = (x) => Math.pow(clamp(x), 3);
const q2 = (x) => Math.round(x * 50) / 50; // never quantise motion coarser than 0.02
const EASE = { fast: (x) => 1 - Math.pow(1 - clamp(x), 3.2), lin: clamp, smooth: sm, in: ei };

// ---------- lights ----------
export const LIGHTS = {
  apt:      { expo: 1.48, az: 60, el: 70, sky: '#c4ccff', ground: '#9a8a78', hemi: 1.35, sun: '#ffe9c4', sunI: 1.55, fog: '#22306a', fogNear: 60, fogFar: 400, skyTop: '#16225e', skyHor: '#34489a', stars: 1, sat: 1.12, vig: 0.11, shadowExt: 5 },
  street:   { expo: 1.63, az: 120, el: 48, sky: '#9fb4ff', ground: '#4a4a72', hemi: 1.55, sun: '#c8d8ff', sunI: 1.35, fog: '#2c3c86', fogNear: 30, fogFar: 170, skyTop: '#121d58', skyHor: '#3b55b8', stars: 1.2, sat: 1.18, vig: 0.11, shadowExt: 14 },
  sepia:    { expo: 1.43, az: 120, el: 48, sky: '#fff0d8', ground: '#9a8a70', hemi: 1.8, sun: '#fff0d0', sunI: 1.5, fog: '#8a7050', fogNear: 30, fogFar: 170, skyTop: '#4a3a2a', skyHor: '#a08060', stars: 0.4, sat: 0.45, gain: '#fff0d0', lift: '#141008', vig: 0.18, shadowExt: 14 },
  office:   { expo: 1.30, az: 100, el: 62, sky: '#ffffff', ground: '#a8b0b8', hemi: 1.45, sun: '#ffffff', sunI: 1.25, fog: '#cfe8ff', fogNear: 60, fogFar: 300, skyTop: '#4f98e0', skyHor: '#cfe8ff', sat: 1.1, vig: 0.09, shadowExt: 7 },
  home:     { expo: 1.40, az: 270, el: 30, sky: '#ffe4c8', ground: '#8a6a4a', hemi: 1.35, sun: '#ffc890', sunI: 1.7, fog: '#ffb47a', fogNear: 40, fogFar: 200, skyTop: '#ff8a6a', skyHor: '#ffd0a0', sat: 1.1, vig: 0.12, shadowExt: 6 },
  memory:   { expo: 1.33, az: 270, el: 30, sky: '#fff0d8', ground: '#9a7a5a', hemi: 1.5, sun: '#ffd8a0', sunI: 1.6, fog: '#ffc890', fogNear: 40, fogFar: 200, skyTop: '#ffaa80', skyHor: '#ffe0b0', sat: 0.9, gain: '#fff0d8', lift: '#100a00', vig: 0.24, shadowExt: 6 },
  sunrise:  { expo: 1.36, az: 180, el: 13, sky: '#ffe0d0', ground: '#8a7a9a', hemi: 1.3, sun: '#ffc890', sunI: 2.1, fog: '#ffcfb0', fogNear: 60, fogFar: 380, skyTop: '#5f86d8', skyHor: '#ffc8a0', sunDisc: '#fff2c8', sunSize: 0.004, sat: 1.12, vig: 0.10, shadowExt: 16 },
  room:     { expo: 1.38, az: 270, el: 22, sky: '#ffe8d0', ground: '#9a8a70', hemi: 1.4, sun: '#ffd8a0', sunI: 1.8, fog: '#ffd8b0', fogNear: 40, fogFar: 200, skyTop: '#7f9ee0', skyHor: '#ffd0a8', sat: 1.1, vig: 0.12, shadowExt: 4 },
  ramen:    { expo: 1.50, az: 80, el: 72, sky: '#ffe2c4', ground: '#7a5040', hemi: 1.4, sun: '#ffe8c0', sunI: 1.35, fog: '#24306a', fogNear: 40, fogFar: 200, skyTop: '#16225e', skyHor: '#34489a', sat: 1.12, vig: 0.12, shadowExt: 5 },
  stationEve:{ expo: 1.43, az: 20, el: 16, sky: '#d8c8ff', ground: '#6a5a7a', hemi: 1.4, sun: '#ffb888', sunI: 1.7, fog: '#d89a9a', fogNear: 60, fogFar: 300, skyTop: '#4a52b0', skyHor: '#ffa07a', sat: 1.12, vig: 0.11, shadowExt: 12 },
  station:  { expo: 1.63, az: 120, el: 50, sky: '#9fb4ff', ground: '#4a4a72', hemi: 1.55, sun: '#c8d8ff', sunI: 1.3, fog: '#2c3c86', fogNear: 50, fogFar: 260, skyTop: '#121d58', skyHor: '#3b55b8', stars: 1.2, sat: 1.18, vig: 0.11, shadowExt: 14 },
  dream:    { expo: 1.53, az: 120, el: 50, sky: '#c8b4ff', ground: '#5a4a7a', hemi: 1.5, sun: '#e0c8ff', sunI: 1.2, fog: '#4a3a8a', fogNear: 20, fogFar: 120, skyTop: '#2a1a6a', skyHor: '#7a5ac8', stars: 1, sat: 0.85, gain: '#e8dcff', vig: 0.23, shadowExt: 10 },
};

// ---------- helpers for actors ----------
const blinkAt = (f, seed) => { const per = 70 + (seed * 37) % 50, ph = (f + seed * 13) % per; return ph < 2 ? 1 : ph < 3 ? 1 : 0; };
const pick = (t, list) => { let v = list[0][1]; for (const [t0, x] of list) if (t >= t0) v = x; return v; };
// arm pose track with 0.22 s blends: [[t,'pose'],...]
const arm = (t, list, d = 0.22) => { let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k][0]) i = k; const cur = list[i][1], prev = i > 0 ? list[i - 1][1] : cur, k = sm((t - list[i][0]) / d); return k >= 1 || prev === cur ? cur : { a: prev, b: cur, t: q2(k) }; };
const flap = (f, on) => (on ? [0, 0.3, 0.8, 0.8, 0.3, 0, 0.8, 0.3][(f >> 1) % 8] : 0);
const dart = (t, seed, amp = 0.5) => q2(Math.sin(t * 1.7 + seed) * amp * (Math.sin(t * 0.9 + seed * 2) > 0 ? 1 : 0.3));
const walkPh = (t, sp = 1.6) => q2((t * sp) % 1);
// actor: who, local pos, opts, extra(card fields)
const A = (who, p, o = {}, x = {}) => ({ who, p, o, x });

// ---------- shots ----------
// keys: [t, pos, look, fov, roll, ease]
const K = (t, pos, look, fov, roll = 0, ease = 'lin') => ({ t, pos, look, fov, roll, ease });
const STAIR_Y = (x) => clamp(2.94 * (10.6 - x) / 3.3, 0, 2.94);
const SH = [];
const shot = (o) => SH.push(o);

// ===== HOOK: "In Japan you can pay a company to erase you and nobody can stop you" =====
shot({ id: 'hook_pay', t0: 0, t1: 1.72, set: 'street', light: 'street',
  keys: [K(0, [1.45, 4.05, 0.15], [1.45, 4.0, -2.0], 56, -3), K(0.55, [1.6, 4.35, 1.35], [1.6, 4.1, -2.0], 52, 1.5, 'fast'), K(1.72, [1.8, 4.4, 1.6], [1.7, 4.12, -2.0], 50, 2.5)],
  dof: { on: [1.5, 4.2, -2.0], c: 7 },
  actors: (t, f) => [
    A('you', [1.0, 2.94, -2.05], { expr: pick(t, [[0, 'nervous'], [0.9, 'smirk']]), R: arm(t, [[0, 'hold'], [1.0, 'hang']]), propR: t < 1.0 ? 'cash' : null, L: 'hang', look: q2(Math.min(1, t)), blink: blinkAt(f, 1) }),
    A('driver', [1.9, 2.94, -2.1], { expr: pick(t, [[0, 'smile'], [1.0, 'grin']]), L: arm(t, [[0, 'hang'], [0.75, 'hold']]), propL: t > 0.95 ? 'cash' : null, R: 'hip', look: -0.6, blink: blinkAt(f, 2) }),
    A('mover2', [2.8, 2.94, -2.15], { expr: 'stern', L: 'hang', R: 'hip', look: -1, blink: blinkAt(f, 3) }, { hide: true }),
    A('mover3', [7.6 + t * 0.8, STAIR_Y(7.6 + t * 0.8), -2.0], { expr: 'stern', R: 'holdUp', propR: 'box', L: 'holdUp', walk: walkPh(t), blink: blinkAt(f, 4) }),
  ],
  pops: (t) => [{ kind: 'star', p: [1.45, 4.0, -1.85], t: ramp(t, 0.95, 1.5), s: 1.2 }],
});
shot({ id: 'hook_erase', t0: 1.72, t1: 2.42, set: 'street', light: 'street', blur: [[1.74, 2.05, 0.018, 0.004]],
  keys: [K(1.72, [1.8, 4.4, 1.6], [1.7, 4.12, -2.0], 50, 2.5), K(2.08, [2.5, 4.45, 0.55], [2.6, 4.38, -2.54], 46, -4, 'fast'), K(2.6, [2.45, 4.45, 0.65], [2.6, 4.4, -2.54], 45, -3)],
  dof: { on: [2.5, 4.4, -2.5], c: 8 },
  actors: (t, f) => [
    A('driver', [1.9, 2.94, -2.1], { expr: 'grin', L: 'hold', propL: 'cash', R: 'hip', look: 0.5, blink: blinkAt(f, 2) }, { hide: t > 1.85 }),
    A('mover2', [2.95, 2.94, -2.2], { expr: pick(t, [[0, 'stern'], [2.2, 'smirk']]), L: arm(t, [[1.72, 'hang'], [1.78, 'point'], [2.3, 'up']]), R: 'hip', look: -1, blink: blinkAt(f, 3) }),
  ],
  pops: (t) => [{ kind: 'puff', p: [2.4, 4.44, -2.4], t: ramp(t, 2.2, 2.7), s: 0.7 }],
});
shot({ id: 'hook_stop', t0: 2.42, t1: 3.75, set: 'street', light: 'street',
  keys: [K(2.42, [2.45, 4.45, 0.65], [2.6, 4.4, -2.54], 45, -3), K(2.92, [3.3, 3.5, 10.4], [3.6, 2.9, -2.0], 54, 2, 'fast'), K(3.9, [3.7, 3.6, 10.7], [3.8, 2.95, -2.0], 52, 3.5)],
  dof: { on: [3.6, 3.5, -2.0], c: 3 },
  actors: (t, f) => [
    A('you', [lerp(1.0, 2.4, ramp(t, 2.6, 3.7)), 2.94, -2.05], { expr: pick(t, [[2.42, 'smirk'], [3.2, 'sly']]), L: 'hang', R: 'hold', propR: 'briefcase', walk: t > 2.6 ? walkPh(t) : null, look: 0.6, blink: blinkAt(f, 1) }),
    A('driver', [lerp(1.9, 3.3, ramp(t, 2.42, 3.6)), 2.94, -2.1], { expr: 'grin', R: 'holdUp', propR: 'box', L: 'holdUp', walk: walkPh(t), blink: blinkAt(f, 2) }),
    A('mover2', [4.4, 2.94, -2.0], { expr: pick(t, [[2.42, 'stern'], [3.2, 'sly']]), R: arm(t, [[2.42, 'hip'], [3.15, 'mouth']]), L: 'hang', look: 1, blink: blinkAt(f, 3) }),
    A('neighbor', [5.35, 2.94, -2.3], { expr: pick(t, [[2.42, 'shock'], [3.3, 'nervous']]), R: arm(t, [[2.42, 'hang'], [2.95, 'up'], [3.4, 'hang']]), L: 'hang', look: -1, blink: blinkAt(f, 5) }, { alpha: 1, hide: t < 2.52 }),
    A('mover3', [lerp(9.6, 10.6, ramp(t, 2.42, 3.2)), STAIR_Y(lerp(9.6, 10.6, ramp(t, 2.42, 3.2))), -2.0], { expr: 'stern', R: 'holdUp', propR: 'box', L: 'holdUp', walk: walkPh(t), blink: blinkAt(f, 4) }),
  ],
  pops: (t) => [{ kind: 'bang', p: [5.35, 4.85, -2.3], t: ramp(t, 2.55, 3.4), s: 1.6 }],
});
// ===== "Imagine your life is falling apart" =====
shot({ id: 'apart', t0: 3.75, t1: 5.62, set: 'apt', light: 'apt', dissolve: 8,
  keys: [K(3.75, [1.45, 1.55, 1.75], [0.1, 1.0, -0.6], 58, -2), K(4.55, [1.2, 1.5, 1.6], [0.0, 1.0, -0.6], 56, -1), K(4.95, [1.1, 1.45, 1.6], [-0.75, 1.0, -0.7], 66, 2, 'fast'), K(5.75, [1.05, 1.42, 1.55], [-0.8, 0.95, -0.7], 64, 3)],
  dof: { on: [0, 1.1, -0.7], c: 5 },
  actors: (t, f) => [A('you', [0.05, 0.5, -0.45], { pose: 'sit', expr: pick(t, [[3.75, 'bored'], [4.3, 'nervous'], [4.9, 'shock']]), L: arm(t, [[3.75, 'chin'], [4.85, 'up']]), R: arm(t, [[3.75, 'hang'], [4.85, 'up']]), look: t < 4.85 ? dart(t, 1, 0.4) : -1, blink: blinkAt(f, 1) }, { ground: 0 })],
  pops: (t) => [{ kind: 'sweat', p: [0.3, 1.55, -0.7], t: ramp(t, 4.4, 5.2) }, { kind: 'bang', p: [-0.15, 1.75, -0.75], t: ramp(t, 4.92, 5.6), s: 1.1 }],
});
// ===== "Debt you can't pay" =====
shot({ id: 'debt', t0: 5.62, t1: 6.62, set: 'apt', light: 'apt',
  keys: [K(5.62, [1.05, 1.42, 1.55], [-0.8, 0.95, -0.7], 64, 3), K(5.95, [0.35, 1.3, 0.35], [2.2, 0.75, 1.25], 62, -3, 'fast'), K(6.7, [0.3, 1.3, 0.4], [2.2, 0.78, 1.25], 59, -2)],
  dof: { on: [2.2, 0.8, 1.25], c: 3 },
  actors: (t, f) => [A('collector', [3.3, 0, 1.25], { expr: 'angry' }, { hide: true })],
  pops: (t) => [{ kind: 'bang', p: [2.42, 1.75, 1.15], t: ramp(t, 5.7, 6.15), s: 1.3 }, { kind: 'bang', p: [2.42, 1.55, 1.5], t: ramp(t, 6.15, 6.62), s: 1.2 }],
});
// ===== "a job you can't face" =====
shot({ id: 'job', t0: 6.62, t1: 7.88, set: 'office', light: 'office', dissolve: 7,
  keys: [K(6.62, [2.6, 1.7, 3.6], [0.3, 1.2, 0.4], 50, -2), K(7.0, [2.1, 1.65, 3.2], [0.35, 1.2, 0.4], 48, 0, 'fast'), K(8.0, [1.9, 1.65, 3.0], [0.35, 1.22, 0.4], 46, 2)],
  dof: { on: [0.2, 1.2, 0.6], c: 5 },
  actors: (t, f) => [
    A('you', [0, 0.46, 0.7], { pose: 'sit', expr: pick(t, [[6.62, 'nervous'], [7.3, 'shock']]), L: arm(t, [[6.62, 'hang'], [7.2, 'mouth']]), R: arm(t, [[6.62, 'hang'], [7.24, 'mouth']]), look: t < 7.2 ? 0.6 : -1, blink: blinkAt(f, 1) }, { ground: 0 }),
    A('boss', [0.75, 0, 0.2], { expr: 'angry', R: 'hip', L: arm(t, [[6.62, 'hang'], [6.8, 'point']]), talk: flap(f, true), look: -1, blink: blinkAt(f, 6) }),
    A('coworker', [-0.45, 0, -0.9], { expr: pick(t, [[6.62, 'shock'], [7.3, 'nervous']]), L: 'mouth', R: 'hang', look: 1, blink: blinkAt(f, 7) }),
    A('coworker2', [2.6, 0, -1.3], { expr: 'smirk', R: 'hold', propR: 'coffee', look: -1, blink: blinkAt(f, 8) }),
  ],
  world: (t, W) => { W.office.paper = 0.25; },
  pops: (t) => [{ kind: 'sweat', p: [0.25, 1.5, 0.75], t: ramp(t, 7.25, 7.9) }],
});
// ===== "and a family you can't look in the eye" =====
shot({ id: 'family', t0: 7.88, t1: 9.55, set: 'home', light: 'home', dissolve: 7,
  keys: [K(7.88, [2.6, 1.65, 2.6], [-0.1, 1.05, 0], 60, -2), K(8.2, [2.2, 1.6, 2.8], [-0.15, 1.05, 0], 60, 0, 'fast'), K(8.95, [1.1, 1.55, 2.95], [-0.3, 1.1, 0], 58, 2), K(9.28, [0.6, 1.5, 2.9], [-0.45, 1.2, 0.4], 50, 1, 'fast'), K(9.8, [0.55, 1.5, 2.88], [-0.45, 1.22, 0.4], 49, 2)],
  dof: { on: [-0.45, 1.25, 0.75], c: 6 },
  actors: (t, f) => [
    A('you', [-0.5, 0.46, 0.75], { pose: 'sit', expr: pick(t, [[7.88, 'smile'], [8.5, 'nervous'], [9.06, 'sleepy']]), look: t < 8.5 ? 0.3 : -1, L: 'hang', R: arm(t, [[7.88, 'hang'], [8.6, 'chin']]), blink: blinkAt(f, 1) }, { ground: 0 }),
    A('mom', [-0.5, 0.46, -0.75], { pose: 'sit', expr: pick(t, [[7.88, 'smile'], [8.14, 'beam'], [9.2, 'think']]), R: arm(t, [[7.88, 'hang'], [8.1, 'holdUp']]), propR: t > 8.1 ? 'bowl' : null, look: 0.3, blink: blinkAt(f, 9) }, { ground: 0 }),
    A('dad', [0.5, 0.46, -0.75], { pose: 'sit', expr: pick(t, [[7.88, 'grin'], [9.2, 'think']]), L: arm(t, [[7.88, 'hang'], [8.3, 'thumb']]), R: 'hang', look: -0.4, blink: blinkAt(f, 10) }, { ground: 0 }),
  ],
  pops: (t) => [{ kind: 'sweat', p: [-0.25, 1.5, 0.8], t: ramp(t, 8.8, 9.5) }],
});
// ===== "So you make one phone call" =====
shot({ id: 'call', t0: 9.55, t1: 11.0, set: 'apt', light: 'apt', dissolve: 6,
  keys: [K(9.55, [-1.72, 1.32, -1.42], [-1.85, 1.3, -1.98], 46, -3), K(9.8, [-1.68, 1.33, -1.38], [-1.85, 1.3, -1.98], 45, -2), K(10.2, [-0.2, 1.55, 1.4], [-1.35, 1.38, -1.5], 52, 2, 'fast'), K(11.1, [-0.15, 1.56, 1.45], [-1.35, 1.4, -1.5], 51, 3)],
  dof: { on: [-1.3, 1.45, -1.4], c: 5 },
  actors: (t, f) => [A('you', [-1.2, 0, -1.35], { expr: pick(t, [[9.55, 'think'], [9.9, 'sly'], [10.66, 'smirk']]), L: arm(t, [[9.55, 'point'], [10.2, 'hang']]), R: arm(t, [[9.55, 'hang'], [9.92, 'holdUp'], [10.4, 'mouth']]), propR: t > 9.92 ? 'phone' : null, talk: flap(f, t > 10.6), look: t < 10.2 ? -1 : 0.3, blink: blinkAt(f, 1) })],
  pops: (t) => [{ kind: 'star', p: [-0.95, 1.85, -1.3], t: ramp(t, 10.25, 10.85) }],
});
// ===== "At 2 a.m." =====
shot({ id: 'twoam', t0: 11.0, t1: 11.9, set: 'apt', light: 'apt',
  keys: [K(11.0, [-0.15, 1.6, 1.4], [-1.35, 1.4, -1.5], 51, 3), K(11.3, [-0.35, 1.8, -0.75], [-0.55, 1.9, -1.98], 50, -1, 'fast'), K(12.0, [-0.38, 1.82, -0.85], [-0.55, 1.92, -1.98], 47, -3)],
  dof: { on: [-0.55, 1.95, -1.98], c: 4 },
  actors: (t, f) => [A('you', [-1.2, 0, -1.35], { expr: 'sly', R: 'mouth', propR: 'phone', look: 0.5, blink: blinkAt(f, 1) })],
  pops: (t) => [{ kind: 'star', p: [-0.32, 2.12, -1.9], t: ramp(t, 11.25, 11.85), s: 0.45 }],
});
// ===== "a white van pulls up outside" =====
shot({ id: 'van', t0: 11.9, t1: 13.0, set: 'street', light: 'street', dissolve: 7,
  keys: [K(11.9, [-4.6, 0.85, 1.5], [5, 1.0, 3.0], 52, -3), K(13.0, [-3.9, 0.95, 1.7], [2, 1.15, 3.0], 50, -1)],
  dof: { on: [1, 1, 3.2], c: 3 },
  actors: () => [],
});
shot({ id: 'outside', t0: 13.0, t1: 13.65, set: 'street', light: 'street',
  keys: [K(13.0, [-3.9, 0.95, 1.7], [2, 1.15, 3.0], 50, -1), K(13.42, [-0.6, 3.15, 6.6], [1.5, 3.6, -2.0], 50, 2, 'fast'), K(13.8, [-0.5, 3.2, 6.5], [1.55, 3.62, -2.0], 49, 2.5)],
  dof: { on: [1.4, 3.7, -2.1], c: 3 },
  actors: (t, f) => [
    A('you', [1.45, 2.94, -2.25], { expr: 'nervous', L: 'hang', R: 'wave', look: 0.8, blink: blinkAt(f, 1) }),
    A('driver', [lerp(1.6, 0.6, ramp(t, 13.2, 13.65)), 0, 1.9], { expr: 'grin', R: 'wave', L: 'hang', walk: walkPh(t), look: -0.5, blink: blinkAt(f, 2) }, { hide: t < 13.25 }),
  ],
});
// ===== "Three men in gloves pack up your entire apartment in forty minutes without making a sound" =====
shot({ id: 'three', t0: 13.65, t1: 14.8, set: 'apt', light: 'apt', dissolve: 6,
  keys: [K(13.65, [-1.25, 1.55, 1.15], [1.6, 1.3, 1.15], 58, -2), K(14.35, [-1.0, 1.56, 1.15], [1.6, 1.35, 1.15], 58, 0), K(14.55, [-0.7, 1.6, 1.15], [1.6, 1.48, 1.15], 60, 2, 'fast'), K(14.9, [-0.65, 1.6, 1.15], [1.6, 1.5, 1.15], 59, 2)],
  dof: { on: [1.6, 1.4, 1.15], c: 4 },
  actors: (t, f) => { const k = eo(ramp(t, 13.65, 14.15)); const up = arm(t, [[13.65, 'hang'], [14.38, 'wave']], 0.15); return [
    A('driver', [lerp(2.2, 1.55, k), 0, 1.15], { expr: pick(t, [[13.65, 'stern'], [14.4, 'grin']]), L: up, R: up, walk: k < 1 ? walkPh(t) : null, blink: blinkAt(f, 2) }),
    A('mover2', [lerp(2.4, 1.7, k), 0, 0.7], { expr: pick(t, [[13.65, 'stern'], [14.45, 'smirk']]), L: up, R: up, walk: k < 1 ? walkPh(t + 0.3) : null, blink: blinkAt(f, 3) }),
    A('mover3', [lerp(2.4, 1.75, k), 0, 1.6], { expr: pick(t, [[13.65, 'stern'], [14.42, 'sly']]), L: up, R: up, walk: k < 1 ? walkPh(t + 0.6) : null, blink: blinkAt(f, 4) }),
  ]; },
  world: (t, W) => { W.apt.doorOpen = eo(ramp(t, 13.65, 13.9)); },
  pops: (t) => [{ kind: 'star', p: [1.5, 2.05, 0.75], t: ramp(t, 14.42, 14.95) }, { kind: 'star', p: [1.45, 2.05, 1.55], t: ramp(t, 14.46, 14.99) }, { kind: 'star', p: [1.6, 2.05, 2.0], t: ramp(t, 14.5, 15.0) }],
});
const zip = (t, seed, pts) => { const n = pts.length, ph = (t * 2.2 + seed * 0.37), i = Math.floor(ph) % n, k = sm((ph % 1) * 1.6); const a = pts[i], b = pts[(i + 1) % n]; return [lerp(a[0], b[0], k), 0, lerp(a[1], b[1], k)]; };
shot({ id: 'pack', t0: 14.8, t1: 16.25, set: 'apt', light: 'apt',
  keys: [K(14.8, [-0.65, 1.6, 1.15], [1.6, 1.5, 1.15], 59, 2), K(15.15, [1.9, 2.3, 1.85], [-0.1, 0.4, -0.45], 72, -6, 'fast'), K(16.35, [1.55, 2.33, 1.6], [-0.35, 0.4, -0.45], 70, -2)],
  dof: { on: [0, 0.6, -0.2], c: 2 },
  actors: (t, f) => [
    A('driver', zip(t, 1, [[-1.2, -1.2], [0.6, 0.4], [-0.6, 1.0], [0.6, -0.9]]), { expr: 'grin', R: 'holdUp', L: 'holdUp', propR: 'box', walk: walkPh(t, 3), blink: blinkAt(f, 2) }),
    A('mover2', zip(t, 2, [[0.6, 0.2], [-1.6, 0.6], [0.4, -1.2], [-0.8, 0.9]]), { expr: 'smirk', R: 'hold', propR: 'tape', L: 'hold', walk: walkPh(t + 0.3, 3), blink: blinkAt(f, 3) }),
    A('mover3', zip(t, 3, [[-0.4, 0.9], [0.7, -1.3], [-1.8, -0.3], [0.2, 0.5]]), { expr: 'stern', R: 'holdUp', L: 'holdUp', propR: 'box', walk: walkPh(t + 0.6, 3), blink: blinkAt(f, 4) }),
    A('you', [-1.9, 0, 1.45], { expr: 'shock', L: 'mouth', R: 'hang', look: dart(t * 3, 2, 1), blink: blinkAt(f, 1) }),
  ],
  pops: (t) => [0, 1, 2, 3, 4].map((i) => ({ kind: 'puff', p: [[-1.2, 0.3, -1.4], [0.0, 0.3, 1.4], [1.1, 0.3, 1.0], [-1.9, 0.3, 0.8], [0.9, 0.3, -1.4]][i], t: ramp(t, 14.9 + i * 0.25, 15.5 + i * 0.25), s: 0.8 })),
});
shot({ id: 'forty', t0: 16.25, t1: 17.08, set: 'apt', light: 'apt',
  keys: [K(16.25, [1.55, 2.33, 1.6], [-0.35, 0.4, -0.45], 70, -2), K(16.6, [0.4, 1.6, 0.6], [-0.55, 1.7, -1.9], 54, 2, 'fast'), K(17.15, [0.38, 1.6, 0.55], [-0.56, 1.72, -1.9], 53, 0)],
  dof: { on: [-0.6, 1.7, -1.8], c: 4 },
  actors: (t, f) => [A('you', [-0.6, 0, -1.45], { expr: 'shock', L: 'hang', R: 'point', look: 0.6, blink: 0 })],
  pops: (t) => [{ kind: 'sweat', p: [-0.3, 1.6, -1.4], t: ramp(t, 16.5, 17.1) }],
});
shot({ id: 'silent', t0: 17.08, t1: 18.2, set: 'apt', light: 'apt',
  keys: [K(17.08, [0.38, 1.6, 0.55], [-0.56, 1.72, -1.9], 53, 0), K(17.42, [1.75, 1.55, 1.85], [0.1, 1.15, -0.2], 58, -1, 'fast'), K(18.3, [1.7, 1.55, 1.85], [0.0, 1.15, -0.2], 56, -2.5)],
  dof: { on: [0.1, 1.2, -0.2], c: 4 },
  actors: (t, f) => [
    A('mover3', [0.5, 0, -0.5], { expr: pick(t, [[17.08, 'shock'], [17.6, 'smugsmile']]), R: 'holdUp', L: 'holdUp', propR: 'vase', blink: blinkAt(f, 4) }),
    A('driver', [-0.2, 0, 0.1], { expr: 'stern', R: 'mouth', L: 'hang', look: 0.4, blink: blinkAt(f, 2) }),
    A('mover2', [lerp(1.0, 1.8, ramp(t, 17.1, 18.2)), 0, -1.0], { expr: 'sly', R: 'holdUp', L: 'holdUp', propR: 'box', walk: walkPh(t, 0.8), blink: blinkAt(f, 3) }),
    A('you', [-0.8, 0, -0.9], { expr: pick(t, [[17.08, 'shock'], [17.7, 'smirk']]), R: arm(t, [[17.08, 'hang'], [17.7, 'mouth']]), L: 'hang', look: 1, blink: blinkAt(f, 1) }),
  ],
});
// ===== "By sunrise you're in a city you've never seen" =====
const vanArrive = (t) => 30 - 23.8 * eo(ramp(t, 18.2, 19.45));
shot({ id: 'drive', t0: 18.2, t1: 19.25, set: 'city', light: 'sunrise', dissolve: 8,
  camFn: (t) => { const vx = vanArrive(t); return { pos: [vx + 6.2, 2.1, 7.6], look: [vx - 6, 1.5, 2.2], fov: 55, roll: -2 + t * 0.5 }; },
  dof: { on: 'van', c: 3 },
  actors: () => [],
});
shot({ id: 'newcity', t0: 19.25, t1: 20.45, set: 'city', light: 'sunrise',
  keys: [K(19.25, [12.2, 2.1, 7.6], [0.2, 1.5, 2.2], 55, -1.5), K(19.62, [-0.6, 1.9, 6.6], [2.8, 2.0, -0.5], 58, 1, 'fast'), K(20.55, [-0.8, 1.95, 6.4], [2.8, 2.1, -0.6], 56, 2.5)],
  dof: { on: [4.6, 1.6, 1.6], c: 3 },
  actors: (t, f) => [A('you', [lerp(3.2, 2.5, ramp(t, 19.3, 19.9)), 0, 1.6], { expr: pick(t, [[19.25, 'shock'], [19.75, 'grin']]), L: arm(t, [[19.25, 'hang'], [19.75, 'up']]), R: 'hold', propR: 'briefcase', look: dart(t, 3, 1), walk: t < 19.9 ? walkPh(t) : null, blink: blinkAt(f, 1) }),
    A('driver', [3.0, 0, 2.05], { expr: 'smile', R: 'wave', L: 'hang', look: 0.8, blink: blinkAt(f, 2) }, { hide: true })],
  pops: (t) => [{ kind: 'q', p: [2.55, 2.25, 1.6], t: ramp(t, 19.35, 19.95) }],
});
// ===== "in a room paid for in cash" =====
shot({ id: 'cash', t0: 20.45, t1: 21.98, set: 'city', light: 'sunrise', dissolve: 6,
  keys: [K(20.45, [0.7, 0.95, 3.1], [-1.4, 2.15, -1.0], 60, -3), K(20.85, [0.4, 1.05, 2.85], [-1.35, 2.05, -1.0], 58, -1, 'fast'), K(21.35, [0.3, 1.1, 2.7], [-1.3, 2.0, -1.0], 57, 0), K(21.6, [0.1, 1.35, 2.1], [-1.1, 1.55, -0.6], 50, 2, 'fast'), K(22.1, [0.05, 1.37, 2.0], [-1.1, 1.56, -0.6], 49, 3)],
  dof: { on: [-1.0, 1.5, -0.6], c: 3 },
  actors: (t, f) => [
    A('you', [-0.55, 0.12, -0.35], { expr: pick(t, [[20.45, 'smile'], [21.5, 'grin']]), R: arm(t, [[20.45, 'hold'], [21.5, 'hang']]), propR: t < 21.5 ? 'cash' : null, L: 'hang', look: -0.8, blink: blinkAt(f, 1) }),
    A('landlady', [-1.45, 0.12, -0.95], { expr: pick(t, [[20.45, 'stern'], [21.48, 'smugsmile']]), R: arm(t, [[20.45, 'holdUp'], [21.5, 'hold']]), propR: t < 21.5 ? 'key' : 'cash', L: arm(t, [[20.45, 'hip'], [21.5, 'holdUp']]), propL: t > 21.5 ? 'key' : null, look: 0.8, blink: blinkAt(f, 11) }),
  ],
  pops: (t) => [{ kind: 'star', p: [-1.0, 1.4, -0.55], t: ramp(t, 21.45, 21.98), s: 1.2 }],
});
// ===== "at a job that never asks your real name" =====
shot({ id: 'noname', t0: 21.98, t1: 24.05, set: 'city', light: 'sunrise', dissolve: 6,
  keys: [K(21.98, [0.9, 1.5, 2.3], [-2.2, 1.95, 7.6], 56, -2), K(22.35, [0.2, 1.6, 3.2], [-2.2, 1.95, 7.4], 54, 0, 'fast'), K(23.3, [-0.25, 1.65, 3.6], [-2.3, 2.0, 7.4], 52, 2), K(23.55, [-0.9, 1.75, 3.9], [-2.35, 1.85, 7.2], 48, -1.5, 'fast'), K(24.15, [-0.95, 1.75, 4.0], [-2.35, 1.86, 7.2], 47, -2.5)],
  dof: { on: [-2.2, 1.6, 7.0], c: 4 },
  actors: (t, f) => [
    A('foreman', [-2.75, 0.12, 7.15], { expr: pick(t, [[21.98, 'grin'], [22.7, 'smirk'], [23.4, 'smugsmile']]), R: arm(t, [[21.98, 'hold'], [23.42, 'hip']]), propR: t < 23.42 ? 'clipboard' : null, L: arm(t, [[21.98, 'hang'], [22.68, 'point'], [23.42, 'hip']]), talk: flap(f, t > 22.5 && t < 23.3), look: 0.6, blink: blinkAt(f, 12) }),
    A('youNew', [-1.85, 0.12, 6.75], { expr: pick(t, [[21.98, 'nervous'], [23.5, 'grin']]), R: arm(t, [[21.98, 'hang'], [23.6, 'thumb']]), L: 'hang', look: -0.7, blink: blinkAt(f, 1) }),
    A('worker', [lerp(-8.5, -5.5, ramp(t, 21.98, 24.05)), 1.85, 10.4], { expr: 'grin', R: 'holdUp', L: 'holdUp', propR: 'box', walk: walkPh(t), blink: blinkAt(f, 13) }),
    A('worker', [-1.2, 3.65, 10.4], { expr: 'stern', R: arm(t, [[21.98, 'up'], [22.3, 'hang'], [22.6, 'up'], [22.9, 'hang'], [23.2, 'up'], [23.5, 'hang'], [23.8, 'up']], 0.12), propR: 'wrench', L: 'hang', blink: blinkAt(f, 14) }),
  ],
  pops: (t) => [{ kind: 'q', p: [-2.75, 2.25, 7.15], t: ramp(t, 23.4, 24.05), s: 1.3 }],
});
// ===== "No phone, no bank account, no past" =====
shot({ id: 'nophone', t0: 24.05, t1: 26.48, set: 'room', light: 'room', dissolve: 7,
  keys: [K(24.05, [-1.2, 1.6, 1.35], [0.2, 1.15, -0.1], 62, -3), K(24.35, [-1.1, 1.58, 1.3], [0.2, 1.12, -0.1], 62, -1, 'fast'), K(25.0, [-1.05, 1.58, 1.28], [0.2, 1.12, -0.1], 61, 0), K(25.25, [-0.75, 1.5, 1.3], [0.05, 1.22, -0.45], 58, 2, 'fast'), K(25.95, [-0.72, 1.5, 1.3], [0.05, 1.22, -0.45], 57, 2.5), K(26.2, [1.15, 0.95, 1.35], [0.5, 0.42, 0.55], 48, -2, 'fast'), K(26.6, [1.18, 0.94, 1.37], [0.5, 0.42, 0.55], 47, -3)],
  dof: { on: [0.3, 0.9, 0.3], c: 4 },
  actors: (t, f) => [A('youNew', [-0.05, 0, -0.5], { expr: pick(t, [[24.05, 'stern'], [25.1, 'smirk'], [25.95, 'nervous'], [26.4, 'stern']]), R: arm(t, [[24.05, 'hold'], [24.4, 'hang'], [24.95, 'hold'], [25.65, 'hang'], [25.9, 'hold'], [26.42, 'hang']]), propR: t < 24.4 ? 'phone' : null, L: arm(t, [[24.05, 'hang'], [24.95, 'hold'], [25.65, 'hang']]), look: 0.6, blink: blinkAt(f, 1) }, { hide: t > 26.25 })],
  world: (t, W) => { W.room.phone = ramp(t, 24.4, 24.95); W.room.card = t < 24.95 ? -1 : ramp(t, 25.0, 26.0); W.room.photo = t < 25.95 ? -1 : ramp(t, 26.0, 26.45); W.room.lid = 1 - sm(ramp(t, 26.42, 26.62)); },
  pops: (t) => [{ kind: 'puff', p: [0.55, 0.4, 0.6], t: ramp(t, 26.55, 27.1), s: 0.8 }],
});
// ===== "And you're thinking: Wait, it was this easy?" =====
shot({ id: 'easy', t0: 26.48, t1: 28.95, set: 'room', light: 'room',
  keys: [K(26.48, [1.18, 0.94, 1.37], [0.5, 0.42, 0.55], 47, -3), K(26.8, [0.8, 1.42, 1.35], [0, 1.3, -0.8], 66, 2, 'fast'), K(27.35, [0.7, 1.45, 1.3], [0, 1.35, -0.8], 64, 1), K(27.55, [0.2, 1.55, 1.35], [0, 1.5, -0.8], 54, -3, 'fast'), K(28.3, [0.18, 1.56, 1.33], [0, 1.5, -0.8], 53, -2), K(28.55, [-0.7, 1.45, 1.3], [0, 1.4, -0.8], 64, -2, 'fast'), K(29.05, [-0.75, 1.45, 1.32], [0, 1.4, -0.8], 63, -3)],
  dof: { on: [0, 1.4, -0.8], c: 5 },
  actors: (t, f) => [A('youNew', [0.0, 0, -0.8], { expr: pick(t, [[26.48, 'think'], [27.42, 'shock'], [27.95, 'beam'], [28.5, 'laugh']]), L: arm(t, [[26.48, 'chin'], [27.42, 'up'], [27.95, 'wave']]), R: arm(t, [[26.48, 'hang'], [27.42, 'up'], [27.95, 'wave']]), look: t < 27.4 ? dart(t, 4, 0.6) : 0, blink: blinkAt(f, 1) })],
  world: (t, W) => { W.room.lid = 0; },
  pops: (t) => [{ kind: 'bang', p: [0.05, 2.05, -0.8], t: ramp(t, 27.42, 27.95), s: 1.1 }, { kind: 'q', p: [0.35, 2.0, -0.8], t: ramp(t, 28.1, 28.95), s: 1.0 }],
});
// ===== "At first it's paradise" =====
shot({ id: 'paradise', t0: 28.95, t1: 30.75, set: 'city', light: 'sunrise', dissolve: 8,
  keys: [K(28.95, [13.6, 4.6, 4.0], [10, 1.5, 8.6], 52, -3), K(29.6, [12.0, 2.6, 5.2], [10, 1.3, 8.6], 50, 0, 'fast'), K(30.85, [11.55, 2.2, 5.6], [10, 1.25, 8.6], 47, 2.5)],
  dof: { on: [10, 1.2, 8.6], c: 4 },
  actors: (t, f) => [A('youNew', [10, 0.48, 8.38], { pose: 'sit', expr: pick(t, [[28.95, 'smile'], [29.84, 'beam']]), L: arm(t, [[28.95, 'hang'], [29.84, 'up']]), R: arm(t, [[28.95, 'hold'], [29.84, 'up']]), propR: 'can', look: 0.3, blink: blinkAt(f, 1) }, { ground: 0.13 })],
  world: (t, W) => { W.city.van = false; },
});
// ===== "Nobody calls you, nobody chases you, and nobody is disappointed in you anymore" =====
shot({ id: 'nocall', t0: 30.75, t1: 31.85, set: 'room', light: 'room', dissolve: 7,
  keys: [K(30.75, [0.95, 0.75, 1.25], [0.55, 0.35, 0.6], 50, -2), K(31.1, [1.15, 1.2, 1.3], [-0.2, 0.7, 0.3], 60, 2, 'fast'), K(31.95, [1.15, 1.22, 1.33], [-0.25, 0.72, 0.3], 58, 3)],
  dof: { on: [0, 0.4, 0.4], c: 3 },
  actors: (t, f) => [A('youNew', [-0.55, 0.2, 0.2], { pose: 'sit', expr: 'sleepy', L: 'cross', R: 'cross', headTilt: q2(8 * Math.sin(t * 2.2)) }, { ground: 0.12 })],
  world: (t, W) => { W.room.lid = 0; },
  pops: (t) => [{ kind: 'z', p: [-0.3, 1.35, 0.2], t: ((t * 0.9) % 1) }, { kind: 'z', p: [-0.2, 1.5, 0.2], t: ((t * 0.9 + 0.5) % 1), s: 0.7 }],
});
shot({ id: 'nochase', t0: 31.85, t1: 32.95, set: 'street', light: 'street', dissolve: 6,
  keys: [K(31.85, [-0.4, 4.1, 1.2], [1.6, 3.8, -2.3], 52, -2), K(32.3, [0.0, 4.15, 0.6], [1.65, 3.85, -2.3], 50, 0, 'fast'), K(33.0, [0.15, 4.12, 0.5], [1.7, 3.86, -2.3], 48, 2)],
  dof: { on: [1.5, 4.0, -2.2], c: 4 },
  actors: (t, f) => [A('collector', [1.4, 2.94, -2.15], { expr: pick(t, [[31.85, 'angry'], [32.5, 'shock']]), R: arm(t, [[31.85, 'up'], [32.0, 'point'], [32.15, 'up'], [32.3, 'point'], [32.5, 'hang']], 0.1), L: 'hip', talk: flap(f, t < 32.4), look: 1, blink: blinkAt(f, 15) })],
  world: (t, W) => { W.street.heroDoor = sm(ramp(t, 32.45, 32.8)) * 0.9; W.street.van = false; W.street.plate = 1; },
  pops: (t) => [{ kind: 'bang', p: [1.75, 4.6, -2.3], t: ramp(t, 31.9, 32.4), s: 1.2 }, { kind: 'q', p: [1.4, 4.85, -2.15], t: ramp(t, 32.5, 33.0), s: 1.2 }],
});
shot({ id: 'nodisappoint', t0: 32.95, t1: 35.0, set: 'office', light: 'office', dissolve: 6,
  keys: [K(32.95, [2.8, 1.7, 3.6], [0.3, 1.1, 0.3], 52, -2), K(33.45, [2.2, 1.62, 3.3], [0.2, 1.05, 0.3], 50, 0, 'fast'), K(34.15, [1.9, 1.6, 3.1], [0.1, 1.0, 0.3], 50, 1), K(34.45, [-1.6, 1.6, 3.2], [0.1, 1.0, 0.3], 54, 3, 'fast'), K(35.1, [-1.7, 1.6, 3.25], [0.15, 1.0, 0.3], 53, 4)],
  dof: { on: [0.4, 1.2, 0.6], c: 4 },
  actors: (t, f) => [
    A('boss', [0.75, 0, 0.2], { expr: pick(t, [[32.95, 'angry'], [33.68, 'think'], [34.46, 'bored']]), L: arm(t, [[32.95, 'point'], [33.68, 'chin'], [34.46, 'hip']]), R: arm(t, [[32.95, 'hip'], [34.46, 'hip']]), talk: flap(f, t < 33.6), look: -1, blink: blinkAt(f, 6) }),
    A('coworker', [-1.1, 0, -0.5], { expr: pick(t, [[32.95, 'bored'], [34.0, 'shock']]), L: 'hip', R: 'hip', look: 1, blink: blinkAt(f, 7) }),
    A('coworker2', [2.2, 0, -1.0], { expr: pick(t, [[32.95, 'smirk'], [34.1, 'laugh']]), R: 'hold', propR: 'coffee', L: 'hang', look: -1, blink: blinkAt(f, 8) }),
  ],
  world: (t, W) => { W.office.paper = t < 34.0 ? 0.3 : 0.5 + 0.5 * ei(ramp(t, 34.0, 34.7)); },
  pops: (t) => [{ kind: 'q', p: [0.75, 2.1, 0.2], t: ramp(t, 33.68, 34.4), s: 1.2 }, { kind: 'puff', p: [0.2, 0.9, 0.5], t: ramp(t, 34.6, 35.2), s: 1.4 }],
});
// ===== "The driver who moved you says he did the same thing twenty years ago and never looked back" =====
shot({ id: 'driver', t0: 35.0, t1: 36.46, set: 'city', light: 'sunrise', dissolve: 7,
  keys: [K(35.0, [-3.7, 1.6, 6.7], [-1.1, 1.4, 2.4], 50, -3), K(35.4, [-3.1, 1.6, 6.0], [-1.1, 1.4, 2.4], 50, 0, 'fast'), K(36.55, [-2.85, 1.62, 5.75], [-1.1, 1.42, 2.4], 48, 2)],
  dof: { on: [-0.8, 1.4, 2.8], c: 4 },
  actors: (t, f) => [
    A('driver', [-0.45, 0, 2.45], { expr: pick(t, [[35.0, 'smile'], [36.1, 'grin']]), R: 'hold', propR: 'can', L: arm(t, [[35.0, 'hang'], [36.1, 'thumb']]), talk: flap(f, t > 36.1), look: -0.7, blink: blinkAt(f, 2) }),
    A('youNew', [-1.6, 0, 2.05], { expr: 'smile', L: 'hang', R: 'hip', look: 0.8, blink: blinkAt(f, 1) }),
  ],
  world: (t, W) => { W.city.vanX = 3.0; W.city.vanYaw = Math.PI; W.city.exhaust = false; },
});
shot({ id: 'photo', t0: 36.46, t1: 37.26, set: 'city', light: 'sunrise',
  keys: [K(36.46, [-2.85, 1.62, 5.75], [-1.1, 1.42, 2.4], 48, 2), K(36.75, [-2.4, 1.72, 5.3], [-0.6, 1.55, 2.45], 44, -2, 'fast'), K(37.35, [-2.35, 1.72, 5.22], [-0.6, 1.56, 2.45], 43, -3)],
  dof: { on: [-0.5, 1.5, 2.45], c: 5 },
  actors: (t, f) => [
    A('driver', [-0.45, 0, 2.45], { expr: pick(t, [[36.46, 'grin'], [36.9, 'smugsmile']]), R: arm(t, [[36.46, 'hold'], [36.5, 'holdUp']]), propR: 'photo', L: 'hip', talk: flap(f, true), look: -0.4, blink: blinkAt(f, 2) }),
    A('youNew', [-1.6, 0, 2.05], { expr: pick(t, [[36.46, 'smile'], [36.8, 'shock']]), L: 'hang', R: 'hip', look: 0.8, blink: blinkAt(f, 1) }),
  ],
  world: (t, W) => { W.city.vanX = 3.0; W.city.vanYaw = Math.PI; W.city.exhaust = false; },
  pops: (t) => [{ kind: 'star', p: [-0.2, 1.75, 2.5], t: ramp(t, 36.55, 37.2) }],
});
shot({ id: 'twenty', t0: 37.26, t1: 38.22, set: 'street', light: 'sepia', dissolve: 7,
  keys: [K(37.26, [5.0, 2.4, 6.6], [8.6, 1.8, -1.6], 50, -2), K(38.3, [5.6, 2.3, 6.0], [9.0, 1.5, -1.6], 48, 1)],
  dof: { on: [9, 1.5, -1.8], c: 3 },
  actors: (t, f) => { const x = lerp(8.0, 10.4, ramp(t, 37.26, 38.2)); return [A('mover2', [x, STAIR_Y(x), -2.0], { expr: 'stern', R: 'hold', propR: 'briefcase', L: 'hang', walk: walkPh(t), look: 1, blink: blinkAt(f, 3) })]; },
  world: (t, W) => { W.street.vanX = 12.2; W.street.vanDoor = 1; W.street.vanLoad = 0; W.street.beams = true; },
});
shot({ id: 'nevback', t0: 38.22, t1: 39.25, set: 'street', light: 'sepia',
  keys: [K(38.22, [5.6, 2.3, 6.0], [9.0, 1.5, -1.6], 48, 1), K(38.55, [4.2, 1.7, 8.4], [9.5, 1.3, 3.0], 52, 2, 'fast'), K(39.35, [3.6, 1.75, 8.6], [4.0, 1.3, 3.0], 55, -2)],
  dof: { on: 'van', c: 2 },
  actors: (t, f) => [A('mover2', [lerp(10.5, 11.6, ramp(t, 38.22, 38.5)), 0, 1.8], { expr: 'stern', R: 'hold', propR: 'briefcase', L: 'hang', walk: walkPh(t), look: -1, blink: blinkAt(f, 3) }, { hide: t > 38.5 })],
  world: (t, W) => { W.street.vanX = 12.2 - 30 * ei(ramp(t, 38.55, 39.4)); W.street.vanDoor = 1 - ramp(t, 38.45, 38.6); W.street.vanLoad = 0; },
});
// ===== "So you don't either" =====
shot({ id: 'noteither', t0: 39.25, t1: 40.25, set: 'city', light: 'sunrise', dissolve: 7,
  keys: [K(39.25, [-2.9, 1.6, 3.1], [-0.6, 1.5, -0.2], 50, -2), K(39.55, [-2.4, 1.62, 2.8], [-0.4, 1.5, -0.2], 48, 0, 'fast'), K(40.35, [-1.6, 1.62, 2.9], [0.4, 1.5, -0.2], 50, 2)],
  dof: { on: [0, 1.5, -0.2], c: 4 },
  actors: (t, f) => [A('youNew', [lerp(-0.7, 0.8, ramp(t, 39.8, 40.25)), 0.12, -0.25], { expr: pick(t, [[39.25, 'smirk'], [39.64, 'sly']]), R: arm(t, [[39.25, 'hang'], [39.5, 'thumb'], [39.95, 'hang']]), L: 'hang', walk: t > 39.8 ? walkPh(t) : null, look: 0.6, blink: blinkAt(f, 1) })],
  world: (t, W) => { W.city.vanX = 3.0; W.city.vanYaw = Math.PI; W.city.van = false; },
});
// ===== "Then one night you're eating at a tiny restaurant and the TV is on" =====
const RAMEN_CROWD = (t, f, heroO = {}) => [
  A('youNew', [1.0, 0.7, 0.35], { pose: 'sit', expr: 'smile', L: 'hang', R: 'holdUp', propR: 'chopsticks', blink: blinkAt(f, 1), ...heroO }, { ground: 0 }),
  A('chef', [-0.1, 0, -1.05], { expr: pick(t, [[0, 'laugh'], [42.6, 'grin'], [44.0, 'think']]), R: arm(t, [[0, 'hold'], [41.6, 'holdUp'], [42.2, 'hold']]), propR: 'bowl', L: 'hang', look: 0.5, blink: blinkAt(f, 16) }),
  A('diner', [-0.6, 0.7, 0.35], { pose: 'sit', expr: 'laugh', R: 'holdUp', propR: 'chopsticks', L: 'hang', look: -0.5, talk: flap(f, ((f / 40) | 0) % 2 === 0), blink: blinkAt(f, 17) }, { ground: 0 }),
  A('extraC', [-1.4, 0.7, 0.35], { pose: 'sit', expr: 'grin', R: 'hold', propR: 'coffee', L: 'hang', look: 0.5, blink: blinkAt(f, 18) }, { ground: 0 }),
];
shot({ id: 'night', t0: 40.25, t1: 41.4, set: 'ramen', light: 'ramen', dissolve: 8,
  keys: [K(40.25, [5.4, 1.72, 1.25], [-0.6, 1.3, -0.2], 50, -2), K(41.45, [2.9, 1.7, 1.6], [0.3, 1.3, -0.2], 56, 1, 'smooth')],
  dof: { on: [0.8, 1.3, 0.0], c: 3 },
  actors: (t, f) => RAMEN_CROWD(t, f, { R: arm(t, [[40.25, 'holdUp'], [40.7, 'hold'], [41.1, 'holdUp']]) }),
  world: (t, W) => { W.ramen.chop = false; },
});
shot({ id: 'eating', t0: 41.4, t1: 42.55, set: 'ramen', light: 'ramen',
  keys: [K(41.4, [2.9, 1.7, 1.6], [0.3, 1.3, -0.2], 56, 1), K(41.7, [2.7, 1.6, 1.6], [0.9, 1.3, 0.0], 56, -2, 'fast'), K(42.6, [2.65, 1.6, 1.58], [0.9, 1.3, 0.0], 55, -3)],
  dof: { on: [1.0, 1.25, 0.3], c: 5 },
  actors: (t, f) => RAMEN_CROWD(t, f, { expr: pick(t, [[41.4, 'beam'], [42.0, 'smugsmile']]), R: arm(t, [[41.4, 'hold'], [41.65, 'holdUp'], [42.0, 'hold'], [42.3, 'holdUp']], 0.15) }),
  world: (t, W) => { W.ramen.chop = false; },
  pops: (t) => [{ kind: 'puff', p: [1.0, 1.35, -0.2], t: ramp(t, 41.6, 42.3), s: 0.6 }],
});
const TVCAM = (t) => ({ pos: [-3.45 + Math.sin(t * 0.4) * 0.08, 1.55, -1.45], look: [-3.5, 1.5, -3.0], fov: 38, roll: Math.sin(t * 0.7) * 1.5 });
const TV_ACTORS = (t, f) => [
  A('momGrey', [-3.5, 0, -3.0], { expr: pick(t, [[0, 'nervous'], [46.0, 'think'], [47.6, 'nervous']]), R: 'holdUp', propR: 'flyer', L: 'hang', talk: flap(f, t > 46.1 && t < 47.4), look: dart(t, 5, 0.6), blink: blinkAt(f, 19) }),
  A('reporter', [-2.6, 0, -2.6], { expr: 'stern', R: 'hold', propR: 'mic', L: 'hang', look: -0.8, talk: flap(f, t < 46), blink: blinkAt(f, 20) }),
];
const tvView = (t) => ({ sets: ['station'], light: 'stationEve', cam: TVCAM(t), dof: { focus: 1.6, cinf: 0 }, actors: TV_ACTORS, screen: true });
shot({ id: 'tvon', t0: 42.55, t1: 43.75, set: 'ramen', light: 'ramen', blur: [[42.58, 42.9, -0.02, 0.006]],
  keys: [K(42.55, [2.65, 1.6, 1.58], [0.9, 1.3, 0.0], 55, -3), K(42.95, [2.6, 1.8, 1.9], [-1.9, 1.75, -1.6], 56, 3, 'fast'), K(43.8, [2.5, 1.8, 1.85], [-1.95, 1.77, -1.6], 55, 4)],
  dof: { on: [-1.2, 1.5, -0.6], c: 2 },
  actors: (t, f) => RAMEN_CROWD(t, f, { expr: pick(t, [[42.55, 'smile'], [43.4, 'shock']]), look: -1 }),
  world: (t, W) => { W.ramen.chop = false; },
  tv: (t) => (t > 43.35 ? tvView(t) : null), tvOff: (t) => t > 42.95,
});
shot({ id: 'mother', t0: 43.75, t1: 44.62, set: 'ramen', light: 'ramen',
  keys: [K(43.75, [2.5, 1.8, 1.85], [-1.95, 1.77, -1.6], 55, 4), K(44.25, [-1.48, 1.9, -0.72], [-2.35, 2.0, -1.55], 42, -2, 'fast'), K(44.75, [-1.58, 1.92, -0.82], [-2.35, 2.0, -1.55], 40, -3)],
  dof: { on: [-2.35, 2.0, -1.55], c: 2 },
  actors: (t, f) => RAMEN_CROWD(t, f, { expr: 'shock', look: -1, R: 'hold' }),
  world: (t, W) => { W.ramen.chop = false; },
  tv: tvView,
});
// ===== "She's holding up your photo and asking if anyone has seen you" =====
const walker = (who, t, x0, x1, z, t0, t1, seed, extra = {}) => A(who, [lerp(x0, x1, ramp(t, t0, t1)), 0, z], { expr: extra.expr || 'neutral', L: 'hang', R: extra.R || 'hang', propR: extra.propR, walk: walkPh(t + seed * 0.3, 1.8), look: extra.look ?? (x1 > x0 ? 0.6 : -0.6), blink: blinkAt(Math.round(t * 30), seed) }, { hide: t < t0 - 0.05 || t > t1 + 0.05 });
shot({ id: 'holding', t0: 44.62, t1: 47.55, set: 'station', light: 'stationEve', dissolve: 6,
  keys: [K(44.62, [-3.45, 1.55, -1.45], [-3.5, 1.5, -3.0], 42, 0), K(45.1, [-1.9, 1.65, 1.3], [-3.1, 1.4, -2.8], 55, 1, 'fast'), K(46.0, [-1.75, 1.65, 1.45], [-3.1, 1.4, -2.8], 54, 2), K(46.35, [-4.7, 1.6, 0.7], [-3.25, 1.4, -2.8], 52, -2, 'fast'), K(47.65, [-4.8, 1.6, 0.8], [-3.3, 1.4, -2.8], 50, -3)],
  dof: { on: [-3.4, 1.4, -2.9], c: 4 },
  actors: (t, f) => [...TV_ACTORS(t, f),
    walker('extraA', t, -8, 0, -4.6, 44.62, 47.55, 21, { expr: pick(t, [[0, 'bored'], [46.3, 'nervous']]), propR: 'briefcase', R: 'hold' }),
    walker('extraB', t, 1, -7, -5.4, 44.62, 47.2, 22, { expr: 'neutral' }),
    walker('extraD', t, -9, -1, -6.0, 45.3, 47.55, 23, { expr: 'smile', R: 'hold', propR: 'phone' }),
    walker('extraE', t, 0, -8, -4.2, 45.8, 47.55, 24, { expr: 'bored' }),
  ],
  world: (t, W) => { W.station.posters = 4; },
});
// ===== "Her hair is greyer than you remember and you realise she's been doing this for months" =====
shot({ id: 'greyer', t0: 47.55, t1: 48.7, set: 'station', light: 'stationEve',
  keys: [K(47.55, [-4.8, 1.6, 0.8], [-3.3, 1.4, -2.8], 50, -3), K(47.85, [-2.95, 1.9, -0.75], [-3.45, 1.55, -3.0], 50, -2, 'fast'), K(48.8, [-2.9, 1.88, -0.8], [-3.45, 1.57, -3.0], 48, 1)],
  dof: { on: [-3.5, 1.6, -3.0], c: 6 },
  actors: (t, f) => [A('momGrey', [-3.5, 0, -3.0], { expr: pick(t, [[47.55, 'nervous'], [48.4, 'sleepy']]), R: 'holdUp', propR: 'flyer', L: 'hang', look: q2(Math.sin(t * 2) * 0.3), blink: blinkAt(f, 19), headTilt: q2(Math.sin(t * 1.3) * 3) })],
  world: (t, W) => { W.station.posters = 4; },
});
shot({ id: 'remember', t0: 48.7, t1: 49.3, set: 'home', light: 'memory', dissolve: 5,
  keys: [K(48.7, [0.6, 1.55, 1.4], [-0.5, 1.25, -0.75], 50, 2), K(49.45, [0.5, 1.53, 1.3], [-0.5, 1.26, -0.75], 48, 0)],
  dof: { on: [-0.5, 1.25, -0.75], c: 5 },
  actors: (t, f) => [A('mom', [-0.5, 0.46, -0.75], { pose: 'sit', expr: 'beam', R: 'holdUp', propR: 'bowl', L: 'hang', look: 0.3, blink: blinkAt(f, 9) }, { ground: 0 }), A('dad', [0.5, 0.46, -0.75], { pose: 'sit', expr: 'grin', L: 'thumb', R: 'hang', blink: blinkAt(f, 10) }, { ground: 0 })],
});
shot({ id: 'months', t0: 49.3, t1: 51.3, set: 'station', light: 'stationEve', dissolve: 5,
  keys: [K(49.3, [0.6, 2.3, 2.6], [-4.4, 1.4, -3.9], 54, -3), K(51.4, [-1.6, 2.5, 3.5], [-4.8, 1.4, -4.0], 52, 2.5)],
  dof: { on: [-4, 1.4, -3.5], c: 3 },
  actors: (t, f) => { const tl = (t - 49.3) * 6; const out = [A('momGrey', [-3.5, 0, -3.0], { expr: pick(t, [[49.3, 'nervous'], [50.3, 'bored'], [50.9, 'sleepy']]), R: 'holdUp', propR: 'flyer', L: 'hang', look: q2(Math.sin(t * 9) * 0.8), blink: blinkAt(f * 3, 19) })];
    for (let i = 0; i < 6; i++) { const ph = (tl * 0.35 + i * 0.17) % 1, dir = i % 2 ? 1 : -1; out.push(A(['extraA', 'extraB', 'extraC', 'extraD', 'extraE', 'diner'][i], [dir * (-9 + ph * 16), 0, -1.6 + i * 0.6], { expr: ['bored', 'neutral', 'stern', 'smile', 'bored', 'neutral'][i], L: 'hang', R: 'hang', walk: walkPh(tl + i * 0.3, 2.5), look: dir * 0.6, blink: 0 })); }
    return out; },
  world: (t, W) => { W.station.posters = 4 + Math.floor(ramp(t, 49.4, 51.0) * 6.99); W.station.clock = 19 * 60 + (t - 49.3) * 2000; },
  pops: (t) => [{ kind: 'sweat', p: [-3.2, 1.7, -2.9], t: ramp(t, 50.5, 51.3) }],
});
// ===== "You could call her" / "One call and it's over" =====
shot({ id: 'couldcall', t0: 51.3, t1: 52.3, set: 'ramen', light: 'ramen', dissolve: 6,
  keys: [K(51.3, [-1.0, 1.6, 1.9], [1.6, 1.2, -0.25], 54, -2), K(52.4, [-0.85, 1.6, 1.88], [1.7, 1.2, -0.25], 52, 1)],
  dof: { on: [1.2, 1.2, 0.1], c: 3 },
  actors: (t, f) => RAMEN_CROWD(t, f, { expr: pick(t, [[51.3, 'nervous'], [51.66, 'think']]), look: 1, R: 'hang', L: arm(t, [[51.3, 'hang'], [51.66, 'chin']]) }).slice(0, 3),
  world: (t, W) => { W.ramen.chop = false; },
  tv: tvView,
});
shot({ id: 'onecall', t0: 52.3, t1: 53.7, set: 'ramen', light: 'ramen',
  keys: [K(52.3, [-0.85, 1.6, 1.88], [1.7, 1.2, -0.25], 52, 1), K(52.6, [0.3, 1.55, 1.9], [2.0, 1.3, -0.2], 54, 3, 'fast'), K(53.8, [0.35, 1.55, 1.88], [2.0, 1.32, -0.2], 53, 2)],
  dof: { on: [1.85, 1.3, 0.1], c: 4 },
  actors: (t, f) => [A('youNew', [1.75, 0, 0.3], { expr: pick(t, [[52.3, 'stern'], [53.28, 'nervous']]), R: arm(t, [[52.3, 'holdUp'], [52.75, 'mouth']]), propR: t < 52.75 ? 'coin10' : 'receiver', L: 'hang', look: 0.6, blink: blinkAt(f, 1) })],
  world: (t, W) => { W.ramen.chop = false; W.ramen.receiver = t > 52.75 ? 1 : 0; },
  tv: tvView,
  pops: (t) => [{ kind: 'sweat', p: [2.0, 1.6, 0.3], t: ramp(t, 53.2, 53.8) }],
});
// ===== "But then you'd have to explain the debt, the lies and why you left without saying goodbye" =====
shot({ id: 'explain', t0: 53.7, t1: 55.6, set: 'station', light: 'dream', dissolve: 7,
  keys: [K(53.7, [-1.1, 1.65, 0.35], [-2.8, 1.3, -2.7], 52, -2), K(54.05, [-1.35, 1.55, -0.05], [-2.75, 1.25, -2.7], 50, 0, 'fast'), K(55.7, [-1.25, 1.56, -0.15], [-2.7, 1.28, -2.7], 48, 2)],
  dof: { on: [-2.7, 1.3, -2.6], c: 4 },
  actors: (t, f) => [
    A('youNew', [-2.55, 0, -2.3], { expr: pick(t, [[53.7, 'nervous'], [55.3, 'shock']]), L: arm(t, [[53.7, 'holdUp'], [54.4, 'hip'], [54.8, 'holdUp']]), R: arm(t, [[53.7, 'holdUp'], [55.0, 'up']]), talk: flap(f, t < 55.1), look: -0.8, blink: blinkAt(f, 1) }),
    A('momGrey', [-3.5, 0, -3.0], { expr: pick(t, [[53.7, 'think'], [55.26, 'shock']]), L: 'hang', R: 'hang', look: 0.8, blink: blinkAt(f, 19) }),
  ],
  world: (t, W) => { W.station.debt = ramp(t, 54.2, 55.5); W.station.posters = 10; },
  pops: (t) => [{ kind: 'puff', p: [-1.6, 0.4, -2.2], t: ramp(t, 55.35, 55.9), s: 1.5 }],
});
shot({ id: 'lies', t0: 55.6, t1: 56.3, set: 'station', light: 'dream',
  keys: [K(55.6, [-1.25, 1.56, -0.15], [-2.7, 1.28, -2.7], 48, 2), K(55.85, [-2.0, 1.95, 0.3], [-2.9, 1.1, -2.6], 56, 3, 'fast'), K(56.4, [-2.05, 1.97, 0.35], [-2.9, 1.1, -2.6], 55, 4)],
  dof: { on: [-2.8, 1.0, -2.4], c: 3 },
  actors: (t, f) => [
    A('youNew', [-2.55, 0, -2.3], { expr: 'nervous', L: 'up', R: 'up', look: -0.5, blink: blinkAt(f, 1) }),
    A('momGrey', [-3.5, 0, -3.0], { expr: 'shock', L: 'mouth', R: 'hang', look: 0.8, blink: blinkAt(f, 19) }),
  ],
  world: (t, W) => { W.station.debt = 1; W.station.lies = ramp(t, 55.62, 56.25); W.station.posters = 10; },
});
shot({ id: 'goodbye', t0: 56.3, t1: 58.1, set: 'station', light: 'dream',
  keys: [K(56.3, [-2.05, 1.97, 0.35], [-2.9, 1.1, -2.6], 55, 4), K(56.6, [-2.6, 1.75, -0.8], [-3.45, 1.52, -3.0], 50, -2, 'fast'), K(57.35, [-2.65, 1.72, -0.85], [-3.42, 1.5, -3.0], 49, 0), K(57.6, [-1.6, 1.65, -0.2], [-2.6, 1.45, -2.3], 50, 2, 'fast'), K(58.2, [-1.58, 1.64, -0.18], [-2.6, 1.45, -2.3], 49, 3)],
  dof: { on: [-3.0, 1.5, -2.6], c: 5 },
  actors: (t, f) => [
    A('youNew', [-2.55, 0, -2.3], { expr: pick(t, [[56.3, 'nervous'], [57.3, 'sleepy']]), L: 'hang', R: 'hang', look: -0.6, headTilt: q2(-4 * ramp(t, 57.3, 57.8)), blink: blinkAt(f, 1) }, { hide: t > 56.45 && t < 57.5 }),
    A('momGrey', [-3.5, 0, -3.0], { expr: pick(t, [[56.3, 'nervous'], [57.0, 'sleepy']]), L: 'mouth', R: 'hang', look: 0.8, blink: blinkAt(f, 19), headTilt: q2(3 * Math.sin(t * 1.5)) }),
  ],
  world: (t, W) => { W.station.debt = 1; W.station.lies = 1; W.station.posters = 10; },
  pops: (t) => [{ kind: 'sweat', p: [-3.32, 1.47, -2.9], t: ramp(t, 56.7, 57.4), s: 0.7 }, { kind: 'sweat', p: [-3.66, 1.45, -2.9], t: ramp(t, 57.0, 57.7), s: 0.7 }],
});
// ===== "So you put your chopsticks down and stay quiet" =====
shot({ id: 'chop', t0: 58.1, t1: 60.62, set: 'ramen', light: 'ramen', dissolve: 7,
  keys: [K(58.1, [1.28, 1.32, 0.3], [1.0, 1.08, -0.25], 40, -2), K(59.4, [1.24, 1.33, 0.32], [1.0, 1.08, -0.25], 39, -1), K(59.75, [2.6, 1.7, 1.95], [0.9, 1.3, -0.3], 56, 2, 'fast'), K(60.7, [2.5, 1.7, 1.95], [0.85, 1.3, -0.3], 55, 3)],
  dof: { on: [1.0, 1.1, -0.2], c: 4 },
  actors: (t, f) => RAMEN_CROWD(t, f, { expr: pick(t, [[58.1, 'nervous'], [59.4, 'sleepy']]), R: 'hang', look: -0.3, headTilt: q2(-5 * ramp(t, 59.5, 60.2)) }).slice(0, 3).map((a) => (a.who === 'chef' ? { ...a, p: [-0.4, 0, -1.05] } : a)),
  world: (t, W) => { W.ramen.chop = true; W.ramen.chopDown = sm(ramp(t, 58.45, 59.35)); W.ramen.slurp = 0; },
  tv: tvView,
});
// ===== "You see, Japan's privacy laws are strict and police usually won't search for an adult who leaves on purpose" =====
const KOBAN_COP = (t, f, o = {}) => A('cop', o.p || [8.45, 0, -3.25], { expr: 'stern', L: 'hang', R: 'hang', blink: blinkAt(f, 25), ...o.o });
shot({ id: 'yousee', t0: 60.62, t1: 61.6, set: 'station', light: 'station', dissolve: 7,
  keys: [K(60.62, [2.5, 3.6, 9.5], [7, 1.6, -3], 50, -4), K(61.65, [6.4, 1.75, 1.6], [7.6, 1.45, -2.6], 50, 0, 'smooth')],
  dof: { on: [8, 1.4, -3], c: 3 },
  actors: (t, f) => [KOBAN_COP(t, f, { o: { expr: 'bored', R: 'hip', look: dart(t, 7, 0.6) } }), walker('extraA', t, 0, 10, 0.6, 60.62, 61.6, 26, { expr: 'bored' }), walker('extraE', t, 12, 3, -0.4, 60.62, 61.6, 27, { expr: 'neutral' })],
  world: (t, W) => { W.station.lock = 0; },
});
shot({ id: 'privacy', t0: 61.6, t1: 63.0, set: 'station', light: 'station',
  keys: [K(61.6, [6.4, 1.75, 1.6], [7.6, 1.45, -2.6], 50, 0), K(61.95, [7.6, 1.5, -0.9], [7.05, 1.2, -3.6], 50, -2, 'fast'), K(63.1, [7.55, 1.5, -0.95], [7.05, 1.22, -3.6], 49, 1)],
  dof: { on: [6.95, 1.2, -3.7], c: 4 },
  actors: (t, f) => [KOBAN_COP(t, f, { p: [7.45, 0, -3.25], o: { expr: pick(t, [[61.6, 'stern'], [62.7, 'smirk']]), L: arm(t, [[61.6, 'hang'], [61.9, 'point']]), R: arm(t, [[61.6, 'hang'], [62.6, 'hip']]), look: -1 } })],
  world: (t, W) => { W.station.lock = ramp(t, 61.8, 62.75); },
  pops: (t) => [{ kind: 'bang', p: [6.9, 1.55, -3.45], t: ramp(t, 62.65, 63.1), s: 1.0 }],
});
shot({ id: 'nosearch', t0: 63.0, t1: 64.6, set: 'station', light: 'station',
  keys: [K(63.0, [7.55, 1.5, -0.95], [7.05, 1.22, -3.6], 49, 1), K(63.35, [10.6, 1.75, 1.2], [8.3, 1.3, -2.3], 54, 2, 'fast'), K(64.05, [10.5, 1.73, 1.1], [8.3, 1.28, -2.3], 53, 1), K(64.3, [8.9, 1.6, -0.8], [8.25, 1.1, -2.5], 54, -2, 'fast'), K(64.7, [8.88, 1.6, -0.85], [8.25, 1.1, -2.5], 53, -3)],
  dof: { on: [8.2, 1.3, -2.5], c: 4 },
  actors: (t, f) => [
    KOBAN_COP(t, f, { p: [8.2, 0, -3.1], o: { expr: pick(t, [[63.0, 'bored'], [63.6, 'stern']]), look: t < 64 ? q2(Math.sin(t * 14) * 0.8) : 0, R: arm(t, [[63.0, 'hang'], [64.0, 'holdUp'], [64.12, 'hold']], 0.1), propR: t > 63.9 ? 'stamp' : null, L: 'hang' } }),
    A('momGrey', [8.6, 0, -1.1], { expr: 'nervous', R: 'holdUp', propR: 'flyer', L: 'hang', look: -0.7, talk: flap(f, t < 63.8), blink: blinkAt(f, 19) }, { hide: t > 64.08 }),
  ],
  world: (t, W) => { W.station.lock = 1; W.station.stamp = t > 64.15 ? 1 : 0; },
  pops: (t) => [{ kind: 'bang', p: [8.1, 1.3, -2.4], t: ramp(t, 64.12, 64.55), s: 0.8 }],
});
shot({ id: 'purpose', t0: 64.6, t1: 66.15, set: 'station', light: 'station',
  keys: [K(64.6, [8.88, 1.6, -0.85], [8.25, 1.1, -2.5], 53, -3), K(64.85, [7.95, 1.0, -1.5], [6.9, 0.5, -3.4], 48, -2, 'fast'), K(65.3, [7.9, 1.02, -1.55], [6.9, 0.5, -3.4], 47, -1), K(65.55, [10.6, 1.75, 1.2], [8.4, 1.3, -2.3], 54, 2, 'fast'), K(66.25, [10.5, 1.75, 1.1], [8.4, 1.32, -2.3], 53, 3)],
  dof: { on: [7.6, 1.0, -2.8], c: 3 },
  actors: (t, f) => [
    KOBAN_COP(t, f, { p: [8.2, 0, -3.1], o: { expr: pick(t, [[64.6, 'stern'], [65.4, 'bored']]), L: arm(t, [[64.6, 'hang'], [65.44, 'hip']]), R: arm(t, [[64.6, 'hold'], [65.44, 'hip']]), look: 0.4 } }),
    A('momGrey', [8.6, 0, -1.1], { expr: pick(t, [[64.6, 'nervous'], [65.5, 'sleepy']]), R: 'holdUp', propR: 'flyer', L: 'hang', look: -0.7, blink: blinkAt(f, 19) }, { hide: t < 65.4 }),
  ],
  world: (t, W) => { W.station.lock = 1; W.station.stamp = 1; W.station.drawer = sm(ramp(t, 64.65, 64.9)) - sm(ramp(t, 65.35, 65.6)); W.station.file = sm(ramp(t, 64.85, 65.35)); },
});
// ===== "Tens of thousands of people are reported missing there every year and some of them just never come back" =====
const PLAZA_CROWD = (t, f) => { const out = []; for (let i = 0; i < 7; i++) { const ph = ((t - 66) * 0.12 + i * 0.141) % 1, dir = i % 2 ? 1 : -1; out.push(A(['extraA', 'extraB', 'extraC', 'extraD', 'extraE', 'diner', 'coworker2'][i], [dir * (-10 + ph * 20), 0, -6 + i * 1.4], { expr: ['bored', 'neutral', 'stern', 'smile', 'bored', 'neutral', 'smirk'][i], L: 'hang', R: 'hang', walk: walkPh(t + i * 0.3), look: dir * 0.6, blink: blinkAt(f, 30 + i) })); } return out; };
const MOM_PLAZA = (t, f) => A('momGrey', [-1.0, 0, -1.0], { expr: pick(t, [[66, 'nervous'], [70.2, 'sleepy'], [70.8, 'nervous']]), R: 'holdUp', propR: 'flyer', L: 'hang', look: q2(Math.sin(t * 1.4) * 0.7), blink: blinkAt(f, 19), headTilt: q2(Math.sin(t * 1.1) * 3) });
shot({ id: 'tens', t0: 66.15, t1: 68.4, set: 'station', light: 'station',
  keys: [K(66.15, [10.5, 1.75, 1.1], [8.4, 1.32, -2.3], 53, 3), K(66.75, [4.0, 3.6, 9.5], [-2.5, 3.6, -9], 55, -2, 'fast'), K(68.5, [3.0, 4.6, 11.5], [-3.2, 4.0, -9], 56, -1)],
  dof: { on: [-4, 3.5, -8.9], c: 2 },
  actors: (t, f) => [MOM_PLAZA(t, f), KOBAN_COP(t, f, { p: [8.35, 0, -3.15], o: { expr: 'bored', R: 'hip', L: 'hip' } }), ...PLAZA_CROWD(t, f)],
  world: (t, W) => { W.station.lock = 1; W.station.count = 80000 * eo(ramp(t, 66.36, 68.6)); W.station.wind = ramp(t, 67.5, 68.4); },
});
shot({ id: 'everyyear', t0: 68.4, t1: 69.7, set: 'station', light: 'station',
  keys: [K(68.4, [3.0, 4.6, 11.5], [-3.2, 4.0, -9], 56, -1), K(69.75, [7, 19, 23], [-2, 3, -7], 60, -4, 'smooth')],
  dof: { on: [-2, 3, -6], c: 0 },
  actors: (t, f) => [MOM_PLAZA(t, f), ...PLAZA_CROWD(t, f)],
  world: (t, W) => { W.station.lock = 1; W.station.count = 80000; W.station.storm = ramp(t, 68.4, 70.2); W.station.wind = 1; },
});
shot({ id: 'neverback', t0: 69.7, t1: 71.4, set: 'station', light: 'station',
  keys: [K(69.7, [7, 19, 23], [-2, 3, -7], 60, -4), K(70.55, [0.7, 2.1, 3.4], [-1.0, 1.4, -1.0], 52, 0, 'smooth'), K(71.5, [0.35, 1.85, 2.6], [-1.0, 1.45, -1.0], 47, 2.5)],
  dof: { on: [-1.0, 1.4, -1.0], c: 4 },
  actors: (t, f) => [MOM_PLAZA(t, f)],
  world: (t, W) => { W.station.lock = 1; W.station.count = 80000; W.station.storm = 1; W.station.wind = 1; },
});
export const SHOTS = SH.map((s) => ({ ...s, a: Math.round(s.t0 * FPS), b: Math.round(s.t1 * FPS) - 1 }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- camera ----------
const noise = (t, s) => Math.sin(t * 2.1 + s) * 0.6 + Math.sin(t * 3.7 + s * 2) * 0.3 + Math.sin(t * 7.3 + s * 3) * 0.1;
function camLocal(S, t) {
  if (S.camFn) return S.camFn(t);
  const K_ = S.keys; let c;
  if (t <= K_[0].t) c = K_[0];
  else if (t >= K_[K_.length - 1].t) { const a = K_[K_.length - 2], b = K_[K_.length - 1], v = (t - b.t) / Math.max(0.2, b.t - a.t); c = { pos: b.pos.map((x, i) => x + (x - a.pos[i]) * v * 0.3), look: b.look.map((x, i) => x + (x - a.look[i]) * v * 0.3), fov: b.fov, roll: b.roll }; }
  else { const i = K_.findIndex((k, j) => t >= k.t && t <= K_[j + 1].t), a = K_[i], b = K_[i + 1], e = EASE[b.ease || 'lin']((t - a.t) / (b.t - a.t));
    c = { pos: a.pos.map((x, k) => lerp(x, b.pos[k], e)), look: a.look.map((x, k) => lerp(x, b.look[k], e)), fov: lerp(a.fov, b.fov, e), roll: lerp(a.roll, b.roll, e) }; }
  return c;
}
function viewOf(S, f) {
  const t = f / FPS, o = O[S.set]; const c = camLocal(S, t);
  const d = Math.hypot(...c.pos.map((x, i) => x - c.look[i]));
  const hh = 0.006 * d; // subtle handheld
  const cam = { pos: c.pos.map((x, i) => x + o[i]), look: [c.look[0] + o[0] + noise(t, 1) * hh, c.look[1] + o[1] + noise(t, 2) * hh, c.look[2] + o[2] + noise(t, 3) * hh], fov: c.fov, roll: c.roll + noise(t, 4) * 0.5 };
  let focusP = S.dof?.on === 'van' ? [ (S.set === 'city' ? vanArrive(t) : 0) + o[0], 1 + o[1], 3 + o[2]] : S.dof?.on ? S.dof.on.map((x, i) => x + o[i]) : cam.look;
  const focus = Math.hypot(...cam.pos.map((x, i) => x - focusP[i]));
  return { sets: [S.set], light: S.light, cam, dof: { focus, cinf: S.dof?.c ?? 4 }, shot: S, actors: S.actors, setOrigin: o };
}
export const camAt = (f) => viewOf(shotAt(f), f).cam;
export function frameAt(f) {
  const S = shotAt(f), t = f / FPS; const views = [viewOf(S, f)]; let mix = 0;
  const idx = SHOTS.indexOf(S);
  if (S.dissolve && idx > 0 && f - S.a < S.dissolve) { const P = SHOTS[idx - 1]; views.unshift(viewOf(P, f)); mix = sm((f - S.a + 1) / (S.dissolve + 1)); }
  let blur = [0, 0]; for (const [a, b, bx, by] of S.blur || []) if (t >= a && t <= b) { const k = Math.sin(Math.PI * (t - a) / (b - a)); blur = [bx * k, by * k]; }
  let tv = null; if (S.tv) { const v = S.tv(t); if (v) tv = { ...v, cam: { ...v.cam, pos: v.cam.pos.map((x, i) => x + O.station[i]), look: v.cam.look.map((x, i) => x + O.station[i]) }, setOrigin: O.station }; }
  const tvOff = S.tvOff ? S.tvOff(t) : !!tv;
  return { views, mix, blur, tv, tvOff, flash: 0 };
}
export const shotsForTv = () => {};

// ---------- world state (global, by time) ----------
export function worldAt(f) {
  const t = f / FPS, S = shotAt(f);
  const W = { apt: {}, street: {}, office: {}, home: {}, city: {}, room: {}, ramen: {}, station: {}, pops: [] };
  // apartment
  W.apt.clock = t < 11.25 ? 118 + t / 11.25 : t < 11.32 ? 119 + ramp(t, 11.25, 11.32) : t < 16.3 ? 120 + (t - 11.32) * 0.05 : t < 17.0 ? 120.3 + 40 * sm(ramp(t, 16.3, 17.0)) : 160.3 + (t - 17) * 0.05;
  W.apt.clockSec = t > 16.3 && t < 17.0 ? (t - 16.3) * 3000 : 0;
  W.apt.pack = t < 14.84 ? 0 : t < 16.2 ? ramp(t, 14.84, 16.2) : 1;
  W.apt.shelfFall = ramp(t, 4.82, 5.5); W.apt.flicker = t > 4.8 && t < 5.8; W.apt.lamp = t > 4.8 && t < 7 ? 1.5 : 0.4;
  W.apt.mail = t < 5.62 ? -1 : ramp(t, 5.62, 6.45); W.apt.doorBang = t > 5.62 && t < 6.62 ? 1 : 0; W.apt.doorOpen = t > 13.9 && t < 18.3 ? 1 : 0;
  // street
  W.street.vanX = t < 11.9 ? 1.0 : t < 13.0 ? 16 - 15 * eo(ramp(t, 11.9, 12.95)) : 1.0; W.street.vanYaw = Math.PI; W.street.vanBounce = t > 11.9 && t < 13.1 ? 1 : 0;
  W.street.vanDoor = t < 4 ? 1 : ramp(t, 13.1, 13.5); W.street.vanLoad = t < 4 ? 0.6 : 0; W.street.beams = true;
  W.street.plate = t < 4 ? eo(ramp(t, 1.8, 2.35)) : 1; W.street.neighborDoor = t < 4 ? sm(ramp(t, 2.45, 2.7)) : 0; W.street.heroDoor = t < 4 ? 0.9 : t > 13 && t < 14 ? 0.5 : 0;
  W.street.catWalk = Math.sin(t * 0.3) * 0.4;
  // city
  W.city.vanX = t < 19.5 ? vanArrive(t) : 6.2; W.city.vanYaw = Math.PI;
  // room
  W.room.lid = 1; W.room.door = 0;
  // ramen
  W.ramen.chop = true; W.ramen.chopDown = 0; W.ramen.slurp = 0.5 + 0.5 * Math.sin(t * 5); W.ramen.receiver = 0;
  // station
  W.station.trainX = t > 66 ? lerp(-160, 60, ramp(t, 66.5, 71.4)) : -60 + ((t * 18) % 200); W.station.posters = 10; W.station.count = 0; W.station.clock = 19 * 60 + 12 + t / 4;
  if (S.world) S.world(t, W);
  // previous shot's world for dissolves is close enough; pops only from the current shot (+ the outgoing one during a dissolve)
  const idx = SHOTS.indexOf(S); const prev = S.dissolve && idx > 0 && f - S.a < S.dissolve ? SHOTS[idx - 1] : null;
  for (const s of [prev, S]) if (s && s.pops) for (const p of s.pops(t)) if (p.t > 0 && p.t < 1) W.pops.push({ ...p, p: p.p.map((x, i) => x + O[s.set][i]) });
  return W;
}

// ---------- actors -> cards ----------
export function actorsAt(f, V, T) {
  const t = f / FPS, o = V.setOrigin; if (!V.actors) return [];
  return V.actors(t, f).filter((a) => !(a.x && a.x.hide)).map((a) => { const op = { ...a.o }; if (op.look != null) op.look = q2(op.look);
    const key = a.who + JSON.stringify(op);
    const sway = Math.sin(t * 1.7 + a.p[0] * 3) * 0.012;
    return { key, draw: drawChar(T.rick, a.who, op), x: a.p[0] + o[0], y: a.p[1] + o[1], z: a.p[2] + o[2], roll: (a.x?.roll ?? 0) + sway, ground: (a.x?.ground ?? a.p[1]) + o[1], blob: a.x?.blob, shadow: a.x?.shadow, alpha: a.x?.alpha };
  });
}
