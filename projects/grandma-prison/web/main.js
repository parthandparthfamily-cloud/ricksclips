// "Why Grandmas in Japan Want to Go to Prison" — world + renderer.
// Engine: three.js toon world + ink (normal/depth edges) + DOF, 2D character cards (unlit, pure-white faces),
// 3D inked FX pool, moving dissolves (two layers blended) and whip blur. Sets: street+konbini, apartment, city office,
// courtroom, prison (gate, corridor, cafeteria, infirmary, stairs, workshop, dorm).
import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import * as ST from './story.js';

await document.fonts.load('80px "Lilita One"');
const QS = new URLSearchParams(location.search), SC = +(QS.get('s') || 1);
const W = Math.round(1080 * SC), H = Math.round(1920 * SC);
const canvas = document.getElementById('c'); canvas.width = W; canvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 2500);
const D2R = Math.PI / 180;

// ---------------- painted textures ----------------
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
const dots = (g, w, h, r, n, cols, a = 1, b = 3) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.beginPath(); g.ellipse(r() * w, r() * h, a + r() * b, a + r() * b * 0.7, r() * 3, 0, 7); g.fill(); } };
const TX = {
  tatami() { const [c, g] = cv(512, 512), r = P.rng(3); g.fillStyle = '#cfc47e'; g.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 4) { g.fillStyle = hsl(56 + r() * 6, 38, 58 + r() * 10, 0.6); g.fillRect(0, y, 512, 2); }
    g.fillStyle = '#3f5a3a'; g.fillRect(0, 0, 512, 18); g.fillRect(0, 494, 512, 18); g.fillStyle = '#6f8a4a'; g.fillRect(0, 6, 512, 4); g.fillRect(0, 500, 512, 4);
    g.fillStyle = 'rgba(60,50,20,.35)'; g.fillRect(254, 18, 3, 476); return c; },
  tiles(a, b, n = 8, grout = '#b9b2a4') { const [c, g] = cv(512, 512), s = 512 / n, r = P.rng(9); g.fillStyle = grout; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(i * s + 5, j * s + 5, s - 14, 5); if (r() < .2) { g.fillStyle = 'rgba(80,70,60,.12)'; g.fillRect(i * s + r() * s, j * s + r() * s, 10, 6); } }
    return c; },
  asphalt() { const [c, g] = cv(512, 512), r = P.rng(4); g.fillStyle = '#6d6f75'; g.fillRect(0, 0, 512, 512); dots(g, 512, 512, r, 2600, ['#5d5f66', '#7d8088', '#62646b', '#888a90'], 0.6, 1.8);
    for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(40,40,46,.5)'; g.lineWidth = 2; g.beginPath(); let x = r() * 512, y = r() * 512; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += r() * 40 - 20; y += r() * 40 - 20; g.lineTo(x, y); } g.stroke(); } return c; },
  concrete(base = 72, hue = 40) { const [c, g] = cv(512, 512), r = P.rng(5); g.fillStyle = hsl(hue, 6, base); g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 90; i++) { g.fillStyle = hsl(hue, 6, base - 8 + r() * 14, .25); g.beginPath(); g.ellipse(r() * 512, r() * 512, 10 + r() * 40, 8 + r() * 30, r() * 3, 0, 7); g.fill(); }
    dots(g, 512, 512, r, 500, [hsl(hue, 6, base - 14, .5)], 0.5, 1.2); g.strokeStyle = hsl(hue, 6, base - 18, .7); g.lineWidth = 2; for (const y of [128, 256, 384]) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); } return c; },
  blocks() { const [c, g] = cv(512, 512), r = P.rng(6); g.fillStyle = '#8f8c86'; g.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 8; row++) for (let col = -1; col < 5; col++) { const x = col * 128 + (row % 2) * 64, y = row * 64, L = 70 + r() * 8; g.fillStyle = hsl(40, 5, L); g.fillRect(x + 3, y + 3, 122, 58); dots(g, 0, 0, r, 0, ['#000']); g.fillStyle = hsl(40, 5, L - 9, .5); g.fillRect(x + 3, y + 52, 122, 9); for (let k = 0; k < 14; k++) { g.fillStyle = hsl(40, 5, L - 18, .5); g.fillRect(x + 6 + r() * 112, y + 6 + r() * 46, 2, 2); } }
    return c; },
  wood(h = 30, l = 40, n = 8, vertical = true) { const [c, g] = cv(512, 512), r = P.rng(h * 7 + l); const w = 512 / n;
    for (let i = 0; i < n; i++) { const L = l - 3 + r() * 6; g.fillStyle = hsl(h, 40, L); vertical ? g.fillRect(i * w, 0, w, 512) : g.fillRect(0, i * w, 512, w);
      for (let k = 0; k < 10; k++) { g.strokeStyle = hsl(h - 3, 40, L - 8 - r() * 6, .45); g.lineWidth = 1 + r() * 2; g.beginPath(); const x = i * w + r() * w; if (vertical) { g.moveTo(x, 0); g.bezierCurveTo(x + 5, 170, x - 5, 340, x + 2, 512); } else { g.moveTo(0, x); g.bezierCurveTo(170, x + 5, 340, x - 5, 512, x + 2); } g.stroke(); }
      g.fillStyle = hsl(h, 40, L - 18); vertical ? g.fillRect(i * w, 0, 3, 512) : g.fillRect(0, i * w, 512, 3); }
    return c; },
  plain(col, n = 260, seed = 1) { const [c, g] = cv(256, 256), r = P.rng(seed); g.fillStyle = col; g.fillRect(0, 0, 256, 256); for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${r() < .5 ? '255,255,255' : '60,40,30'},${0.03 + r() * 0.05})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 4 + r() * 18, 3 + r() * 12, r() * 3, 0, 7); g.fill(); } return c; },
  stripes(a, b, n = 8, vertical = true) { const [c, g] = cv(256, 256); for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? a : b; vertical ? g.fillRect(i * 256 / n, 0, 256 / n, 256) : g.fillRect(0, i * 256 / n, 256, 256 / n); } return c; },
  facade(wall, win, lit, rows = 8, cols = 5, seed = 1) { const [c, g] = cv(256, 512), r = P.rng(seed); g.fillStyle = wall; g.fillRect(0, 0, 256, 512);
    const cw = 256 / cols, rh = 512 / rows; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { g.fillStyle = r() < 0.3 ? lit : win; g.fillRect(i * cw + cw * 0.2, j * rh + rh * 0.22, cw * 0.6, rh * 0.5); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(i * cw + cw * 0.15, j * rh + rh * 0.74, cw * 0.7, 4); }
    return c; },
  shutter() { const [c, g] = cv(256, 256); for (let y = 0; y < 256; y += 8) { g.fillStyle = '#a9adb2'; g.fillRect(0, y, 256, 8); g.fillStyle = '#7d8187'; g.fillRect(0, y + 6, 256, 2); g.fillStyle = '#c6c9cd'; g.fillRect(0, y, 256, 2); } return c; },
  carpet(col) { const [c, g] = cv(256, 256), r = P.rng(11); g.fillStyle = col; g.fillRect(0, 0, 256, 256); dots(g, 256, 256, r, 1800, ['rgba(255,255,255,.08)', 'rgba(0,0,0,.1)'], 0.5, 1.2); return c; },
  fusuma() { const [c, g] = cv(256, 512), r = P.rng(13); g.fillStyle = '#efe6cf'; g.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 5; i++) { g.strokeStyle = '#7a9a6a'; g.lineWidth = 6; g.beginPath(); const x = 30 + r() * 200, y = 300 + r() * 200; g.moveTo(x, y); g.quadraticCurveTo(x + 30, y - 120, x + 10 - r() * 40, y - 200); g.stroke(); }
    g.fillStyle = '#d9c38a'; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(40 + r() * 180, 60 + r() * 200, 30, 10, 0, 0, 7); g.fill(); } return c; },
  sky(top, hor) { const [c, g] = cv(64, 256); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, top); gr.addColorStop(1, hor); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); return c; },
};
// sign text texture, Lilita One, fitted to the board (text never overflows)
const signC = (lines, o = {}) => {
  const w = o.w || 512, h = o.h || 256, [c, g] = cv(w, h);
  g.fillStyle = o.bg || '#f6f1e2'; g.fillRect(0, 0, w, h);
  if (o.stripe) { o.stripe.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, h - (i + 1) * h * 0.07, w, h * 0.07); }); }
  if (o.border !== 0) { g.strokeStyle = o.borderCol || '#2b1f1c'; g.lineWidth = o.border || 10; g.strokeRect(5, 5, w - 10, h - 10); }
  const L = Array.isArray(lines) ? lines : [lines], n = L.length;
  L.forEach((s, i) => { let size = (o.size || 0.62) * h / n; g.font = `${size}px "Lilita One"`; const mw = g.measureText(s).width; if (mw > w * 0.86) { size *= w * 0.86 / mw; g.font = `${size}px "Lilita One"`; }
    g.textAlign = 'center'; g.textBaseline = 'middle'; const y = h * (i + 0.5) / n + (o.dy || 0) * h;
    if (o.stroke) { g.lineWidth = size * 0.12; g.strokeStyle = o.stroke; g.strokeText(s, w / 2, y); }
    g.fillStyle = Array.isArray(o.fg) ? o.fg[i] : (o.fg || '#2b1f1c'); g.fillText(s, w / 2, y); });
  if (o.extra) o.extra(g, w, h);
  if (o.age !== false) { const r = P.rng(w + h); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(90,70,40,${0.03 + r() * 0.05})`; g.beginPath(); g.ellipse(r() * w, r() * h, 6 + r() * 30, 4 + r() * 16, r() * 3, 0, 7); g.fill(); } }
  return c;
};

// ---------------- materials ----------------
const grad = (() => { const d = new Uint8Array([105, 105, 105, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (o) => new THREE.MeshToonMaterial({ gradientMap: grad, ...o });
const MC = new Map(); const C = (col) => { if (!MC.has(col)) MC.set(col, toon({ color: col })); return MC.get(col); };
const TM = (canvasEl, rx = 1, ry = 1, color = '#ffffff') => toon({ map: P.tex(canvasEl, rx, ry), color });
const BASIC = (col) => new THREE.MeshBasicMaterial({ color: col, fog: false });
const M = {
  asphalt: TM(TX.asphalt(), 8, 2), walk: TM(TX.tiles('#c9c2b4', '#bdb5a6', 8, '#9c958a'), 10, 2), blocks: TM(TX.blocks()), conc: TM(TX.concrete(74)), concDark: TM(TX.concrete(58, 210)),
  tatami: TM(TX.tatami(), 2, 2), shopTile: TM(TX.tiles('#f2eee4', '#e3ddd0', 8, '#c7c0b2'), 6, 6), woodPanel: TM(TX.wood(28, 42, 8)), woodDark: TM(TX.wood(20, 24, 6)), woodFloor: TM(TX.wood(32, 52, 8, false), 4, 4),
  plasterW: TM(TX.plain('#efe6d6'), 2, 2), plasterG: TM(TX.plain('#d9dfd6', 300, 2), 3, 3), plasterB: TM(TX.plain('#cfe0ea', 300, 3), 3, 3), plasterP: TM(TX.plain('#f4e1e4', 300, 4), 3, 3),
  shutter: TM(TX.shutter(), 2, 2), carpet: TM(TX.carpet('#5f7690'), 6, 6), fusuma: TM(TX.fusuma()), prisonFloor: TM(TX.tiles('#9fb3a6', '#94a99c', 8, '#7c9184'), 6, 6),
  roofTile: TM(TX.stripes('#4e5a6e', '#5c6a80', 10, false), 3, 3), roofRed: TM(TX.stripes('#8a3b32', '#a24a3e', 10, false), 3, 3),
};
M.walk.map.rotation = 0;
const GLASS = (col = '#bfe3f2', op = 0.18) => { const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, fog: false }); return m; };

// ---------------- geometry helpers ----------------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true; parent.add(m); return m; };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const tbox = (w, h, d, t = 2) => { const g = box(w, h, d), uv = g.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); } return g; };
const B = (parent, w, h, d, mat, x, y, z, o = {}) => { const m = add(o.t ? tbox(w, h, d, o.t) : box(w, h, d), typeof mat === 'string' ? C(mat) : mat, x, y, z, parent, o); if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; return m; };
const CY = (parent, rt, rb, h, mat, x, y, z, seg = 16, o = {}) => { const m = add(new THREE.CylinderGeometry(rt, rb, h, seg), typeof mat === 'string' ? C(mat) : mat, x, y, z, parent, o); return m; };
const SP = (parent, r, mat, x, y, z, o = {}) => add(new THREE.SphereGeometry(r, o.seg || 16, o.seg2 || 12), typeof mat === 'string' ? C(mat) : mat, x, y, z, parent, o);
const PL = (parent, w, h, mat, x, y, z, o = {}) => { const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast: false, ...o }); if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; return m; };
const floor = (parent, w, d, mat, x, z, y = 0) => { const m = PL(parent, w, d, mat, x, y, z); m.rotation.x = -Math.PI / 2; return m; };
// sign board: box whose +z face carries the texture
const sign = (parent, c, w, h, x, y, z, ry = 0, o = {}) => {
  const face = toon({ map: P.tex(c), color: '#ffffff' }); const side = C(o.side || '#3a2e2a');
  const m = add(box(w, h, o.d ?? 0.05), [side, side, side, side, face, side], x, y, z, parent, { cast: o.cast ?? false }); m.rotation.y = ry; if (o.rz) m.rotation.z = o.rz; if (o.rx) m.rotation.x = o.rx;
  if (o.glow) { face.emissive = new THREE.Color('#ffffff'); face.emissiveMap = face.map; face.emissiveIntensity = o.glow; }
  return m;
};
// vertex-colour merger for clutter (hundreds of products in one draw)
class Merge {
  constructor() { this.p = []; this.n = []; this.c = []; this.i = []; this.v = 0; this.m4 = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.e = new THREE.Euler(); }
  add(geo, x, y, z, col, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) {
    this.e.set(rx, ry, rz); this.q.setFromEuler(this.e); this.m4.compose(new THREE.Vector3(x, y, z), this.q, new THREE.Vector3(sx, sy, sz));
    const pos = geo.attributes.position, nor = geo.attributes.normal, nm = new THREE.Matrix3().getNormalMatrix(this.m4), c = new THREE.Color(col), v = new THREE.Vector3();
    for (let k = 0; k < pos.count; k++) { v.fromBufferAttribute(pos, k).applyMatrix4(this.m4); this.p.push(v.x, v.y, v.z); v.fromBufferAttribute(nor, k).applyMatrix3(nm).normalize(); this.n.push(v.x, v.y, v.z); this.c.push(c.r, c.g, c.b); }
    if (geo.index) for (let k = 0; k < geo.index.count; k++) this.i.push(geo.index.getX(k) + this.v); else for (let k = 0; k < pos.count; k++) this.i.push(k + this.v);
    this.v += pos.count; return this;
  }
  box(w, h, d, x, y, z, col, ry = 0) { return this.add(UB, x, y, z, col, ry, w, h, d); }
  build(parent, o = {}) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3)); g.setIndex(this.i);
    return add(g, toon({ vertexColors: true }), 0, 0, 0, parent, { cast: o.cast ?? false }); }
}
const UB = box(1, 1, 1), UCY = new THREE.CylinderGeometry(0.5, 0.5, 1, 12), USP = new THREE.SphereGeometry(0.5, 12, 8);
const TRI = (() => { const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 3); g.rotateX(Math.PI / 2); g.rotateZ(Math.PI); return g; })(); // triangle prism facing +z, apex up
const PAL = ['#e2453c', '#f2b733', '#3d8ed8', '#47b36b', '#f08a3a', '#9b5fc0', '#f4f1ea', '#e85d8a', '#2f6f6f', '#ffd84a', '#5ac8e0', '#c0392b'];

// ---------------- registry (dynamic objects driven by story.worldAt) ----------------
const R = {}; const anim = []; // anim: [setName, fn(f, flags)]
const reg = (name, obj) => { R[name] = obj; obj.userData.base = { p: obj.position.clone(), r: obj.rotation.clone(), s: obj.scale.clone(), v: obj.visible }; return obj; };
const SETS = {}; const ORIGIN = ST.ORIGIN;
const mkSet = (name) => { const g = new THREE.Group(); g.position.set(...ORIGIN[name]); g.visible = false; scene.add(g); SETS[name] = g; return g; };

// ---------------- 3D props used in several sets ----------------
const onigiri = (parent, x, y, z, s = 1, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s); parent.add(g);
  const rice = add(TRI, C('#fbfaf4'), 0, 0.01, 0, g); rice.scale.set(0.16, 0.16, 0.05); B(g, 0.062, 0.06, 0.054, '#1f2a22', 0, -0.035, 0); B(g, 0.03, 0.014, 0.056, '#e2453c', 0, 0.035, 0); return g; };
const crow = (parent, x, y, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const b = SP(g, 0.12, '#24212b', 0, 0.12, 0); b.scale.set(1.4, 1, 0.9); SP(g, 0.08, '#24212b', 0.15, 0.22, 0); const bk = CY(g, 0, 0.03, 0.09, '#3b3640', 0.25, 0.22, 0, 6); bk.rotation.z = -Math.PI / 2; SP(g, 0.018, '#ffffff', 0.19, 0.25, 0.05, { cast: false });
  const t = B(g, 0.18, 0.03, 0.09, '#24212b', -0.2, 0.08, 0); t.rotation.z = 0.4; return g; };
const bird = (parent) => { const g = new THREE.Group(); parent.add(g); const b = SP(g, 0.1, '#f4f1ea', 0, 0, 0); b.scale.set(1.5, 0.8, 0.8); const wl = B(g, 0.12, 0.02, 0.3, '#e9e4da', 0, 0.03, 0.16); const wr = B(g, 0.12, 0.02, 0.3, '#e9e4da', 0, 0.03, -0.16); CY(g, 0, 0.03, 0.08, '#f2b733', 0.18, 0, 0, 6).rotation.z = -Math.PI / 2; g.userData.w = [wl, wr]; return g; };
const pole = (parent, x, z, h = 8) => { const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g); CY(g, 0.13, 0.17, h, M.conc, 0, h / 2, 0, 10); B(g, 1.6, 0.1, 0.1, '#5a5650', 0, h - 0.6, 0, { ry: Math.PI / 2 }); B(g, 1.2, 0.1, 0.1, '#5a5650', 0, h - 1.4, 0, { ry: Math.PI / 2 });
  CY(g, 0.22, 0.22, 0.7, '#9aa0a6', 0.3, h - 2.4, 0, 12); for (let i = 0; i < 3; i++) CY(g, 0.04, 0.04, 0.12, '#f4f1ea', 0, h - 0.5, -0.6 + i * 0.6, 6);
  sign(g, signC(['TEL', '03-81'], { bg: '#f4f1ea', fg: '#2b4a8a' }), 0.3, 0.6, 0, 2.6, 0.18, 0); return g; };
const wire = (parent, a, b, sag = 0.5, seg = 10, col = '#26232a') => { const pts = []; for (let i = 0; i <= seg; i++) { const t = i / seg; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t)); }
  return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg * 2, 0.018, 5), C(col), 0, 0, 0, parent, { cast: false }); };
const tree = (parent, x, z, h = 4, col = '#5f9a45', y = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); CY(g, 0.12, 0.2, h * 0.6, '#6a4a32', 0, h * 0.3, 0, 8);
  const r = P.rng(Math.round(x * 13 + z * 7)); for (let i = 0; i < 5; i++) { const s = SP(g, h * (0.22 + r() * 0.1), col, (r() - .5) * h * 0.4, h * (0.7 + r() * 0.25), (r() - .5) * h * 0.4); s.userData.sway = r() * 6; } return g; };
const plant = (parent, x, y, z, s = 1, col = '#4f9a4a') => { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g); CY(g, 0.16, 0.12, 0.3, '#b5653a', 0, 0.15, 0, 12); CY(g, 0.165, 0.165, 0.04, '#9a5330', 0, 0.3, 0, 12);
  const r = P.rng(Math.round(x * 31 + z * 17 + 5)); for (let i = 0; i < 7; i++) { const l = SP(g, 0.09, col, (r() - .5) * 0.22, 0.42 + r() * 0.3, (r() - .5) * 0.22); l.scale.set(1, 1.8, 0.5); l.rotation.z = (r() - .5) * 1.2; } return g; };
const bike = (parent, x, z, ry = 0, col = '#c0392b') => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
  for (const dx of [-0.5, 0.5]) { const w = add(new THREE.TorusGeometry(0.32, 0.035, 6, 20), C('#26232a'), dx, 0.34, 0, g); CY(g, 0.02, 0.02, 0.62, '#b9bec4', dx, 0.34, 0, 6).rotation.x = Math.PI / 2; }
  B(g, 1.0, 0.05, 0.05, col, 0, 0.62, 0, { rz: -0.1 }); B(g, 0.05, 0.5, 0.05, col, -0.15, 0.5, 0, { rz: 0.3 }); B(g, 0.25, 0.06, 0.14, '#26232a', -0.2, 0.82, 0); B(g, 0.05, 0.5, 0.05, '#b9bec4', 0.42, 0.75, 0, { rz: -0.2 }); B(g, 0.05, 0.05, 0.5, '#26232a', 0.46, 1.0, 0);
  B(g, 0.3, 0.2, 0.3, '#b9bec4', 0.62, 0.85, 0); return g; };
const kcar = (parent, col = '#f4f1ea') => { const g = new THREE.Group(); parent.add(g); B(g, 3.2, 0.8, 1.5, col, 0, 0.7, 0); B(g, 2.0, 0.7, 1.4, col, -0.3, 1.45, 0); B(g, 1.9, 0.5, 1.42, GLASS('#9cc7dd', 0.85), -0.3, 1.45, 0, { cast: false });
  for (const dx of [-1.05, 1.05]) for (const dz of [-0.72, 0.72]) { const w = CY(g, 0.32, 0.32, 0.22, '#222', dx, 0.34, dz, 14); w.rotation.x = Math.PI / 2; CY(g, 0.15, 0.15, 0.24, '#b9bec4', dx, 0.34, dz, 10).rotation.x = Math.PI / 2; }
  B(g, 0.06, 0.2, 0.3, '#ffe9a0', 1.6, 0.85, 0.5); B(g, 0.06, 0.2, 0.3, '#ffe9a0', 1.6, 0.85, -0.5); B(g, 0.06, 0.2, 0.3, '#e2453c', -1.6, 0.85, 0.5); B(g, 0.06, 0.2, 0.3, '#e2453c', -1.6, 0.85, -0.5); return g; };
const vending = (parent, x, z, col, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g); B(g, 1.0, 1.85, 0.75, col, 0, 0.925, 0); B(g, 0.86, 0.9, 0.04, '#f4f6f8', 0, 1.3, 0.38);
  const m = new Merge(); const r = P.rng(Math.round(x * 10)); for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) { const c = PAL[(r() * PAL.length) | 0]; m.add(UCY, -0.33 + i * 0.13, 1.0 + row * 0.29, 0.4, c, 0, 0.08, 0.17, 0.08); m.box(0.06, 0.03, 0.02, -0.33 + i * 0.13, 0.88 + row * 0.29, 0.41, row === 1 && i === 2 ? '#ff4040' : '#3de07a'); }
  m.build(g); B(g, 0.5, 0.16, 0.06, '#26232a', -0.05, 0.4, 0.38); B(g, 0.16, 0.3, 0.05, '#c7ccd2', 0.32, 0.8, 0.39); PL(g, 0.86, 0.16, BASIC('#fff7d6'), 0, 1.75, 0.38); return g; };
const clock = (parent, x, y, z, ry = 0, r = 0.3, rim = '#d8343a') => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const face = CY(g, r, r, 0.06, '#fbfaf4', 0, 0, 0, 32); face.rotation.x = Math.PI / 2; const rr = add(new THREE.TorusGeometry(r, 0.035, 8, 32), C(rim), 0, 0, 0.03, g);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; B(g, 0.02, i % 3 ? 0.04 : 0.07, 0.01, '#2b1f1c', Math.sin(a) * r * 0.82, Math.cos(a) * r * 0.82, 0.04, { rz: -a }); }
  const mk = (len, w, col) => { const h = new THREE.Group(); h.position.z = 0.05; g.add(h); B(h, w, len, 0.012, col, 0, len / 2 - 0.02, 0); return h; };
  g.userData.hh = mk(r * 0.5, 0.035, '#2b1f1c'); g.userData.mh = mk(r * 0.75, 0.025, '#2b1f1c'); g.userData.sh = mk(r * 0.82, 0.01, '#d8343a'); SP(g, 0.025, '#2b1f1c', 0, 0, 0.07); return g; };
const setClock = (c, hours, sec) => { c.userData.hh.rotation.z = -hours / 12 * Math.PI * 2; c.userData.mh.rotation.z = -(hours % 1) * Math.PI * 2; c.userData.sh.rotation.z = -sec / 60 * Math.PI * 2; };
const windowFrame = (parent, w, h, x, y, z, ry = 0, col = '#f4f1ea', bars = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  B(g, w + 0.16, 0.1, 0.16, col, 0, h / 2, 0); B(g, w + 0.16, 0.12, 0.22, col, 0, -h / 2, 0.03); B(g, 0.1, h, 0.16, col, -w / 2, 0, 0); B(g, 0.1, h, 0.16, col, w / 2, 0, 0); B(g, 0.06, h, 0.1, col, 0, 0, 0); B(g, w, 0.05, 0.1, col, 0, 0, 0);
  PL(g, w, h, GLASS('#cfeaf7', 0.12), 0, 0, 0, { nd: 'skip' }).userData.ndSkip = true;
  if (bars) for (let i = 0; i < bars; i++) CY(g, 0.025, 0.025, h, '#4a4f58', -w / 2 + (i + 0.5) * w / bars, 0, 0.1, 6); return g; };
const house = (parent, x, z, w, d, h, wall, roof = M.roofTile, ry = 0, seed = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g); const r = P.rng(seed);
  B(g, w, h, d, TM(TX.plain(wall, 200, seed), 2, 2), 0, h / 2, 0); const rf = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.6, 1.6, 4), roof, 0, h + 0.8, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
  for (let fl = 0; fl < Math.floor(h / 2.6); fl++) for (let i = 0; i < 2; i++) { windowFrame(g, 0.9, 0.9, (i ? 1 : -1) * w * 0.25, 1.5 + fl * 2.6, d / 2 + 0.06); if (r() < 0.6) B(g, 0.7, 0.5, 0.35, '#e9ece8', (i ? 1 : -1) * w * 0.25 + 0.8, 0.9 + fl * 2.6, d / 2 + 0.2); }
  if (h > 4) { B(g, w * 0.7, 0.08, 0.7, '#c9c4ba', 0, 2.7, d / 2 + 0.35); for (let i = 0; i < 6; i++) B(g, 0.03, 0.9, 0.03, '#8a8a8a', -w * 0.33 + i * w * 0.13, 3.15, d / 2 + 0.68); B(g, w * 0.7, 0.05, 0.05, '#8a8a8a', 0, 3.6, d / 2 + 0.68);
    for (let i = 0; i < 4; i++) { const cl = B(g, 0.35, 0.5, 0.03, PAL[(r() * PAL.length) | 0], -w * 0.25 + i * 0.45, 3.25, d / 2 + 0.55); cl.userData.sway = i; anim.push([null, (f) => { cl.rotation.x = 0.12 * Math.sin(f * 0.08 + i); }]); } }
  B(g, 0.9, 1.9, 0.08, '#6a4a32', w * 0.3, 0.95, d / 2 + 0.04); return g; };
const skyline = (parent, x0, z0, n, spread, seed, opts = {}) => { const r = P.rng(seed); const cols = opts.cols || ['#c9d3dd', '#e3d6c4', '#b9c6c9', '#d9c9c9', '#cfd8c6'];
  for (let i = 0; i < n; i++) { const w = 6 + r() * 10, h = (opts.hmin || 8) + r() * (opts.hvar || 24), x = x0 + (r() - 0.5) * spread, z = z0 - r() * (opts.depth || 30);
    const c = TX.facade(cols[(r() * cols.length) | 0], '#6f8aa6', '#ffe7a0', Math.max(3, Math.round(h / 3)), Math.max(2, Math.round(w / 3)), seed * 100 + i);
    const m = B(parent, w, h, w * 0.8, TM(c, 1, 1), x, h / 2, z, { cast: false }); B(parent, w * 0.5, 1, w * 0.4, '#9aa3ab', x, h + 0.5, z, { cast: false }); } };
const mountains = (parent, n, d, seed, col = '#9fb6c7') => { const r = P.rng(seed); for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, dd = d + r() * d * 0.4, hh = 60 + r() * 80; add(new THREE.ConeGeometry(hh * 1.6, hh, 7), C(col), Math.cos(a) * dd, hh / 2 - 6, Math.sin(a) * dd, parent, { cast: false }); } };
const futonQuilt = (col) => TM(signC('', { bg: col, border: 0, age: false, extra: (g, w, h) => { const r = P.rng(col.length * 9); for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); const x = r() * w, y = r() * h; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; g.ellipse(x + Math.cos(a) * 10, y + Math.sin(a) * 10, 8, 8, 0, 0, 7); } g.fill(); } } }));

// ======================================================================================
// SET 1: STREET + KONBINI ("HAPPY MART")
// ======================================================================================
{
  const S = mkSet('street');
  floor(S, 140, 7, M.asphalt, 5, 0, 0.0);
  for (const z of [-3.3, 3.3]) { const l = floor(S, 140, 0.12, C('#f4f1ea'), 5, z, 0.012); l.receiveShadow = true; }
  { const st = floor(S, 3.6, 0.8, C('#f4f1ea'), -12, 0.6, 0.013); } // stop line
  sign(S, signC('STOP', { bg: '#6d6f75', fg: '#f4f1ea', border: 0, age: false }), 2.6, 1.2, -9.5, 0.02, 1.8, 0, { rx: -Math.PI / 2, d: 0.01 });
  B(S, 140, 0.14, 3.2, M.walk, 5, 0.07, -5.1); B(S, 140, 0.16, 0.18, '#b3ada2', 5, 0.08, -3.55); B(S, 140, 0.14, 2.2, M.walk, 5, 0.07, 4.6); B(S, 140, 0.16, 0.18, '#b3ada2', 5, 0.08, 3.55);
  // --- konbini shell (x -6..6, z -6.5..-18.5) ---
  const kx0 = -6, kx1 = 6, kz0 = -6.6, kz1 = -18.6, KH = 3.9;
  floor(S, 12, 12, M.shopTile, 0, -12.6, 0.15);
  B(S, 12.4, 0.3, 12.4, '#e9e6df', 0, KH + 0.15, -12.6); // roof slab
  const ceil = PL(S, 12, 12, C('#f6f4ee'), 0, 3.4, -12.6); ceil.rotation.x = Math.PI / 2;
  B(S, 0.3, KH, 12, M.plasterW, kx0 - 0.15, KH / 2, -12.6); B(S, 0.3, KH, 12, M.plasterW, kx1 + 0.15, KH / 2, -12.6); B(S, 12.4, KH, 0.3, M.plasterW, 0, KH / 2, kz1 - 0.15);
  // facade band with stripes + sign
  B(S, 12.6, 0.95, 0.4, '#f4f1ea', 0, 3.42, kz0 + 0.05);
  [['#2f8f5b', 3.1], ['#f2b733', 3.0], ['#2c6fb8', 2.9]].forEach(([c, y]) => B(S, 12.62, 0.1, 0.42, c, 0, y, kz0 + 0.05));
  sign(S, signC(['HAPPY MART'], { bg: '#ffffff', fg: '#2f8f5b', border: 0, size: 0.8 }), 4.2, 0.62, -1.4, 3.5, kz0 + 0.27, 0, { glow: 0.25 });
  sign(S, signC('24H', { bg: '#f08a3a', fg: '#ffffff', border: 0, size: 0.8 }), 1.0, 0.62, 3.8, 3.5, kz0 + 0.27, 0, { glow: 0.25 });
  for (const x of [kx0, kx1]) B(S, 0.36, 2.9, 0.42, '#f4f1ea', x, 1.45, kz0 + 0.05);
  // glass front with a sliding door at x 2..4.4
  const glassM = GLASS('#cfeaf7', 0.16);
  for (const [x0, x1] of [[-5.8, 2.0]]) { const gp = PL(S, x1 - x0, 2.75, glassM, (x0 + x1) / 2, 1.5, kz0, { recv: false }); gp.userData.ndSkip = true; }
  const gpr = PL(S, 1.4, 2.75, glassM, 5.2, 1.5, kz0); gpr.userData.ndSkip = true;
  for (const x of [-3.2, -0.6, 2.0, 4.45]) B(S, 0.08, 2.8, 0.1, '#c7ccd2', x, 1.5, kz0);
  B(S, 11.8, 0.1, 0.12, '#c7ccd2', 0, 2.88, kz0); B(S, 11.8, 0.16, 0.14, '#c7ccd2', 0, 0.2, kz0);
  const door = (x) => { const g = new THREE.Group(); g.position.set(x, 0, kz0 + 0.06); S.add(g); B(g, 1.2, 0.08, 0.06, '#c7ccd2', 0, 2.78, 0); B(g, 1.2, 0.1, 0.06, '#c7ccd2', 0, 0.22, 0); B(g, 0.06, 2.6, 0.06, '#c7ccd2', -0.6, 1.5, 0); B(g, 0.06, 2.6, 0.06, '#c7ccd2', 0.6, 1.5, 0);
    const p = PL(g, 1.15, 2.5, glassM, 0, 1.5, 0); p.userData.ndSkip = true; sign(g, signC('PUSH? NO, AUTO', { bg: '#f2b733', size: 0.5, border: 4 }), 0.5, 0.12, 0, 1.2, 0.03, 0); return g; };
  reg('doorL', door(2.6)); reg('doorR', door(3.8));
  sign(S, signC(['ONIGIRI', '¥100'], { bg: '#fffbe9', fg: ['#2b1f1c', '#e2453c'], size: 0.8, extra: (g, w, h) => { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(w * 0.12, h * 0.75); g.lineTo(w * 0.22, h * 0.25); g.lineTo(w * 0.32, h * 0.75); g.fill(); } }), 1.4, 0.9, -4.4, 1.9, kz0 + 0.04, 0, { d: 0.01 });
  sign(S, signC(['SALE!'], { bg: '#e2453c', fg: '#fff', size: 0.7 }), 0.9, 0.5, -1.8, 2.2, kz0 + 0.04, 0, { d: 0.01 });
  sign(S, signC(['HOT', 'COFFEE'], { bg: '#5a3524', fg: '#ffd84a', size: 0.8 }), 0.8, 0.8, 1.0, 1.7, kz0 + 0.04, 0, { d: 0.01 });
  // outside clutter
  for (let i = 0; i < 3; i++) { const g = new THREE.Group(); g.position.set(-5.4 + i * 0.62, 0.14, kz0 + 0.55); S.add(g); B(g, 0.55, 0.95, 0.45, ['#2c6fb8', '#47b36b', '#f2b733'][i], 0, 0.48, 0); CY(g, 0.12, 0.12, 0.02, '#26232a', 0, 0.75, 0.23, 14).rotation.x = Math.PI / 2; sign(g, signC(['CANS', 'PET', 'BURN'][i], { bg: '#ffffff', size: 0.6, border: 4 }), 0.4, 0.14, 0, 0.5, 0.235, 0); }
  bike(S, -0.8, kz0 + 0.8, 0.2, '#3d8ed8'); bike(S, 0.6, kz0 + 0.9, -0.1, '#e85d8a');
  CY(S, 0.15, 0.2, 0.8, '#b9bec4', 5.4, 0.54, kz0 + 0.5, 12); CY(S, 0.25, 0.25, 0.08, '#8a8f95', 5.4, 0.96, kz0 + 0.5, 12);
  plant(S, 6.6, 0.14, kz0 + 0.6, 1.2); B(S, 0.8, 0.6, 1.6, '#c9ced4', 2.5, KH + 0.6, -10); B(S, 0.8, 0.6, 1.6, '#c9ced4', -2.5, KH + 0.6, -12);
  // --- interior ---
  const lights = new Merge(); for (let x = -4.5; x <= 4.5; x += 3) for (let z = -8; z >= -17.5; z -= 1.6) lights.box(2.4, 0.06, 0.25, x, 3.37, z, '#ffffff'); { const lm = lights.build(S); lm.material = BASIC('#fffdf2'); }
  // onigiri cooler on the left wall (x=-5.7), z -7.6 .. -12.4, faces +x
  { const g = new THREE.Group(); g.position.set(-5.55, 0.15, -10); S.add(g);
    B(g, 0.08, 2.2, 4.8, '#2c3a4a', -0.42, 1.1, 0); B(g, 0.8, 0.12, 4.8, '#2c3a4a', -0.1, 2.14, 0); B(g, 0.8, 0.6, 4.8, '#e9ecef', -0.1, 0.3, 0); for (const z of [-2.4, 2.4]) B(g, 0.8, 2.2, 0.08, '#2c3a4a', -0.1, 1.1, z);
    B(g, 0.05, 2.0, 4.6, '#cfe0ea', -0.37, 1.1, 0, { cast: false }); B(g, 0.05, 0.08, 4.6, BASIC('#eaf6ff'), 0.25, 2.05, 0);
    sign(g, signC(['ONIGIRI CORNER'], { bg: '#2f8f5b', fg: '#fff', size: 0.6, border: 0 }), 3.4, 0.4, 0.3, 2.45, 0, Math.PI / 2);
    const m = new Merge(); for (let tier = 0; tier < 3; tier++) { const y = 0.75 + tier * 0.42; m.box(0.55, 0.04, 4.6, 0.12, y - 0.03, 0, '#dfe6ea');
      for (let k = 0; k < 18; k++) { const z = -2.1 + k * 0.25; if (tier === 1 && Math.abs(z - 0.65) < 0.2) continue; m.add(TRI, 0.18, y + 0.08, z, '#fbfaf4', Math.PI / 2, 0.16, 0.16, 0.05); m.box(0.052, 0.07, 0.1, 0.21, y + 0.03, z, '#1f2a22'); m.box(0.054, 0.025, 0.05, 0.215, y + 0.12, z, ['#e2453c', '#f2b733', '#47b36b', '#3d8ed8'][k % 4]); }
      sign(g, signC('¥100', { bg: '#ffd84a', fg: '#e2453c', size: 0.85, border: 3 }), 0.5, 0.12, 0.42, y - 0.02, 0.65, Math.PI / 2, { d: 0.01 }); sign(g, signC('¥100', { bg: '#ffd84a', fg: '#e2453c', size: 0.85, border: 3 }), 0.5, 0.12, 0.42, y - 0.02, -1.4, Math.PI / 2, { d: 0.01 }); }
    m.build(g); }
  reg('oni1', onigiri(S, -5.37, 1.38, -9.35, 1.0, Math.PI / 2)); reg('oni2', onigiri(S, -5.37, 0.96, -9.85, 1.0, Math.PI / 2)); reg('oni3', onigiri(S, -5.37, 1.8, -10.6, 1.0, Math.PI / 2));
  // gondola shelves
  for (const [z, seed] of [[-11.6, 3], [-14.4, 4]]) { const g = new THREE.Group(); g.position.set(-0.6, 0.15, z); S.add(g); B(g, 6.4, 0.2, 1.0, '#e9ecef', 0, 0.1, 0); B(g, 6.4, 1.6, 0.08, '#e9ecef', 0, 0.9, 0);
    const m = new Merge(), r = P.rng(seed); for (const side of [-1, 1]) for (let lvl = 0; lvl < 4; lvl++) { const y = 0.3 + lvl * 0.38; m.box(6.4, 0.03, 0.42, 0, y, side * 0.26, '#f4f6f8');
      let x = -3.1; while (x < 3.1) { const w = 0.12 + r() * 0.18, h = 0.15 + r() * 0.17, c = PAL[(r() * PAL.length) | 0]; if (r() < 0.35) m.add(UCY, x + w / 2, y + h / 2 + 0.02, side * 0.3, c, 0, w, h, w); else m.box(w * 0.92, h, 0.2, x + w / 2, y + h / 2 + 0.02, side * 0.3, c); x += w; } }
    m.build(g); sign(g, signC(z > -12 ? 'SNACKS' : 'NOODLES', { bg: '#f2b733', size: 0.7 }), 1.6, 0.4, 0, 2.3, 0, 0, { d: 0.04 }); CY(g, 0.01, 0.01, 0.6, '#888', 0, 2.8, 0, 4); }
  // drink fridges on the back wall
  { const g = new THREE.Group(); g.position.set(-1.5, 0.15, -18.2); S.add(g); const m = new Merge(), r = P.rng(21);
    for (let d = 0; d < 5; d++) { const x = -3.6 + d * 1.5; m.box(1.45, 2.3, 0.6, x, 1.15, -0.1, '#3a4656'); for (let s = 0; s < 5; s++) { m.box(1.3, 0.03, 0.5, x, 0.3 + s * 0.42, 0.0, '#dfe6ea'); for (let k = 0; k < 7; k++) m.add(UCY, x - 0.54 + k * 0.18, 0.43 + s * 0.42, 0.12, PAL[(r() * PAL.length) | 0], 0, 0.11, 0.24, 0.11); } }
    m.build(g); for (let d = 0; d < 5; d++) { const p = PL(g, 1.35, 2.1, GLASS('#dff3ff', 0.14), -3.6 + d * 1.5, 1.2, 0.26); p.userData.ndSkip = true; B(g, 0.04, 0.6, 0.06, '#c7ccd2', -3.0 + d * 1.5, 1.2, 0.3); }
    sign(g, signC('COLD DRINKS', { bg: '#3d8ed8', fg: '#fff', size: 0.6, border: 0 }), 3.6, 0.45, 0, 2.75, 0.05, 0, { glow: 0.2 }); }
  // counter + register (x ~4.9, z -8 .. -11.6)
  { const g = new THREE.Group(); g.position.set(4.6, 0.15, -9.8); S.add(g); B(g, 0.8, 1.0, 3.6, '#f4f1ea', 0, 0.5, 0); B(g, 0.9, 0.06, 3.7, '#c79a62', 0, 1.03, 0); B(g, 0.82, 0.18, 3.62, '#2f8f5b', 0, 0.85, 0);
    B(g, 0.4, 0.22, 0.45, '#2b2f3a', 0.05, 1.17, -0.7); const sc = B(g, 0.04, 0.26, 0.36, BASIC('#7cd0ff'), -0.12, 1.42, -0.7, { rz: 0.3 }); B(g, 0.05, 0.3, 0.06, '#2b2f3a', -0.08, 1.3, -0.7);
    B(g, 0.6, 0.45, 0.8, '#f08a3a', 0.05, 1.28, 0.6); const hot = B(g, 0.55, 0.38, 0.75, GLASS('#ffcf7a', 0.45), 0.05, 1.3, 0.6); hot.userData.ndSkip = true; const mm = new Merge(); for (let i = 0; i < 8; i++) mm.add(USP, -0.05 + (i % 2) * 0.12, 1.16, 0.32 + i * 0.07, '#c97a2e', 0, 0.1, 0.08, 0.1); mm.build(g);
    sign(g, signC('FRIED CHICKEN', { bg: '#e2453c', fg: '#fff', size: 0.5 }), 0.05, 0.14, -0.27, 1.55, 0.6, -Math.PI / 2, { d: 0.6 });
    B(g, 0.4, 0.5, 0.35, '#5a3524', 0.1, 1.31, 1.4); CY(g, 0.05, 0.05, 0.12, '#f4f1ea', -0.05, 1.12, 1.4, 10);
    sign(g, signC(['DONATE', '♥'], { bg: '#ffffff', fg: '#e85d8a', size: 0.6 }), 0.16, 0.16, -0.2, 1.15, -1.4, -Math.PI / 2, { d: 0.14 });
    // cigarette wall behind
    const cw = new Merge(), r = P.rng(7); for (let row = 0; row < 6; row++) for (let i = 0; i < 16; i++) cw.box(0.06, 0.12, 0.2, 1.1, 1.0 + row * 0.2, -1.6 + i * 0.2, PAL[(r() * PAL.length) | 0]); cw.build(g); B(g, 0.3, 1.5, 3.6, '#e9ecef', 1.3, 1.6, 0); }
  sign(S, signC(['THANK YOU!', 'COME AGAIN'], { bg: '#2f8f5b', fg: '#fff', size: 0.75, border: 0 }), 2.2, 0.55, 3.2, 3.05, kz0 - 0.25, Math.PI, { d: 0.04 });
  sign(S, signC(['SMILE!', 'YOU ARE ON CAMERA'], { bg: '#ffd84a', size: 0.7 }), 0.9, 0.5, 5.85, 2.4, -8.5, -Math.PI / 2, { d: 0.02 });
  { const cam = new THREE.Group(); cam.position.set(5.6, 3.1, -7.3); S.add(cam); SP(cam, 0.16, '#26232a', 0, 0, 0); SP(cam, 0.06, '#7cd0ff', -0.13, -0.05, 0.05); reg('secCam', cam); }
  { const g = new THREE.Group(); g.position.set(-3, 0.15, -7.2); S.add(g); B(g, 5.0, 0.9, 0.4, '#e9ecef', 0, 0.45, 0); const m = new Merge(), r = P.rng(31); for (let i = 0; i < 18; i++) m.box(0.22, 0.3, 0.03, -2.3 + i * 0.27, 1.05, 0.1 - (i % 2) * 0.02, PAL[(r() * PAL.length) | 0], 0, 1, 1, 1); m.build(g); }
  B(S, 0.8, 1.6, 0.8, '#2c6fb8', 5.3, 0.95, -16.8); sign(S, signC('ATM', { bg: '#fff', fg: '#2c6fb8' }), 0.6, 0.3, 4.89, 1.5, -16.8, -Math.PI / 2, { d: 0.02 });
  B(S, 1.2, 1.1, 0.7, '#e9ecef', -4.8, 0.7, -16.6); sign(S, signC('COPY ¥10', { bg: '#fff' }), 0.7, 0.25, -4.8, 1.0, -16.24, 0, { d: 0.02 });
  // --- neighbouring shops on the north side ---
  { const g = new THREE.Group(); g.position.set(-12.5, 0.14, -7); S.add(g); B(g, 6.6, 4.6, 6, TM(TX.plain('#d7cbb5', 200, 41), 2, 2), 0, 2.3, -3); B(g, 6.2, 2.6, 0.1, M.shutter, 0, 1.3, 0.02); B(g, 6.8, 0.6, 0.6, '#c0392b', 0, 3.0, 0.2);
    sign(g, signC('PHARMACY', { bg: '#ffffff', fg: '#3d8ed8', border: 0 }), 3, 0.5, 0, 3.0, 0.52, 0); sign(g, signC(['CLOSED', 'TODAY'], { bg: '#fff', fg: '#e2453c' }), 0.6, 0.45, 1.2, 1.4, 0.1, 0); plant(g, -2.8, 0, 0.5, 1.4); plant(g, -2.2, 0, 0.6, 1.0, '#6ca84a'); windowFrame(g, 1.2, 1.0, -1.4, 3.9, 0.02); windowFrame(g, 1.2, 1.0, 1.4, 3.9, 0.02); }
  { const g = new THREE.Group(); g.position.set(12.6, 0.14, -7); S.add(g); B(g, 6.6, 4.2, 6, TM(TX.plain('#e9dcc2', 200, 42), 2, 2), 0, 2.1, -3); B(g, 5, 2.4, 0.1, '#5a3524', 0, 1.2, 0.02);
    const nor = []; for (let i = 0; i < 4; i++) { const n = B(g, 0.55, 0.8, 0.03, '#2c3a6a', -0.9 + i * 0.6, 2.0, 0.2); nor.push(n); } sign(g, signC('RAMEN', { bg: '#c0392b', fg: '#fff5d6', border: 0 }), 3, 0.7, 0, 3.4, 0.1, 0);
    anim.push(['street', (f) => nor.forEach((n, i) => { n.rotation.x = 0.1 + 0.08 * Math.sin(f * 0.09 + i * 0.8); })]);
    for (const x of [-2.6, 2.6]) { const l = SP(g, 0.28, '#e2453c', x, 2.2, 0.4); l.scale.y = 1.3; B(g, 0.2, 0.06, 0.2, '#26232a', x, 2.6, 0.4); } windowFrame(g, 1.4, 1.0, 1.8, 3.4, 0.02); }
  vending(S, 7.2, -5.9, '#e2453c'); vending(S, 8.3, -5.9, '#3d8ed8'); vending(S, 9.4, -5.9, '#f4f1ea');
  // --- south side: block wall + houses + traffic mirror ---
  B(S, 60, 1.4, 0.22, M.blocks, 0, 0.84, 5.8, { t: 2 }); for (const x of [-4, 6, 16]) { B(S, 1.6, 1.4, 0.24, '#5a3524', x, 0.84, 5.8); }
  house(S, -12, 10, 8, 6, 5.4, '#e7dcc8', M.roofTile, Math.PI, 3); house(S, -2, 10.5, 7, 6, 5.4, '#dfe4e8', M.roofRed, Math.PI, 4); house(S, 8, 10, 8, 6, 5.4, '#f0e2cf', M.roofTile, Math.PI, 5); house(S, 18, 10.4, 7, 6, 5.4, '#e4d9e8', M.roofRed, Math.PI, 6);
  for (const x of [-15, -6, 3, 13]) { tree(S, x, 7.6, 3.4, '#5f9a45'); plant(S, x + 2, 0.14, 5.4, 1.0); }
  { const g = new THREE.Group(); g.position.set(-3, 0.14, 4.4); S.add(g); CY(g, 0.05, 0.05, 2.8, '#f08a3a', 0, 1.4, 0, 8); const mr = CY(g, 0.42, 0.42, 0.08, '#f08a3a', 0, 2.9, 0, 24); mr.rotation.x = Math.PI / 2; const gl = CY(g, 0.36, 0.36, 0.09, '#cfe8f2', 0, 2.9, 0.01, 24); gl.rotation.x = Math.PI / 2; }
  // poles + wires + crows
  const P1 = pole(S, -8, -3.9), P2 = pole(S, 11, -3.9), P3 = pole(S, 30, -3.9), P0 = pole(S, -27, -3.9);
  for (const [a, b] of [[-27, -8], [-8, 11], [11, 30]]) for (const k of [-0.6, 0, 0.6]) wire(S, [a, 7.5, -3.9 + k], [b, 7.5, -3.9 + k], 0.6); for (const x of [-8, 11]) wire(S, [x, 7.0, -3.9], [x + 4, 4.2, 6.5], 0.3);
  const crows = []; for (const [x, k] of [[1.5, -0.6], [2.4, -0.6], [-2.5, 0.6], [17, 0]]) { const c = crow(S, x, 7.5 - 0.6 * 4 * ((x + 8) / 19) * (1 - (x + 8) / 19) - 0.02, -3.9 + k, Math.PI / 2 * (x > 0 ? 1 : -1)); crows.push(c); }
  anim.push(['street', (f) => crows.forEach((c, i) => { c.rotation.z = 0.06 * Math.sin(f * 0.13 + i * 2); c.children[1].position.y = 0.22 + 0.015 * Math.sin(f * 0.5 + i); })]);
  // far town + mountains
  skyline(S, 10, -40, 14, 120, 7); skyline(S, 0, 45, 10, 120, 8); mountains(S, 9, 420, 3);
  reg('car', kcar(S, '#f4f1ea')); reg('car2', kcar(S, '#3d8ed8')); reg('bikeR', bike(S, 0, 0, 0, '#47b36b'));
  // birds overhead
  const birds = []; for (let i = 0; i < 4; i++) birds.push(bird(S));
  anim.push(['street', (f) => birds.forEach((b, i) => { const t = (f * 0.004 + i * 0.23) % 1; b.position.set(-30 + t * 70, 11 + i * 0.8 + Math.sin(f * 0.05 + i) * 0.4, -12 + i * 4); b.userData.w[0].rotation.x = 0.6 * Math.sin(f * 0.6 + i); b.userData.w[1].rotation.x = -0.6 * Math.sin(f * 0.6 + i); })]);
}

// ======================================================================================
// SET 2: HANA'S APARTMENT (6-tatami room, x -2.4..2.4, z -2.4..2.4) + outside walkway (x 2.4..4.4)
// ======================================================================================
let aptPlant, aptPlantWilt, tvScreenTex, tvCtx;
{
  const S = mkSet('apt'); const RW = 2.4, RH = 2.45;
  floor(S, 4.8, 4.8, M.tatami, 0, 0, 0.02); B(S, 5.2, 0.1, 5.2, '#8a6a48', 0, -0.03, 0);
  const ceil = PL(S, 4.8, 4.8, TM(TX.wood(34, 62, 10), 2, 2), 0, RH, 0); ceil.rotation.x = Math.PI / 2;
  // back wall with window
  const wallM = TM(TX.plain('#e8dcc4', 260, 51), 2, 2);
  B(S, 4.8, 0.9, 0.12, wallM, 0, 0.45, -RW - 0.06, { cast: false }); B(S, 4.8, 0.45, 0.12, wallM, 0, RH - 0.22, -RW - 0.06, { cast: false }); B(S, 1.5, 1.1, 0.12, wallM, -1.65, 1.45, -RW - 0.06, { cast: false }); B(S, 1.5, 1.1, 0.12, wallM, 1.65, 1.45, -RW - 0.06, { cast: false });
  windowFrame(S, 1.8, 1.1, 0, 1.45, -RW, 0, '#c9a77a');
  for (const s of [-1, 1]) { const cu = B(S, 0.45, 1.4, 0.05, '#7fa3c9', s * 1.15, 1.35, -RW + 0.12); cu.userData.s = s; anim.push(['apt', (f) => { cu.rotation.y = 0.06 * Math.sin(f * 0.05 + s); }]); }
  B(S, 2.4, 0.05, 0.05, '#8a6a48', 0, 2.1, -RW + 0.15);
  B(S, 0.12, RH, 4.8, wallM, -RW - 0.06, RH / 2, 0, { cast: false });
  // right wall with the entrance door (z 0.4..1.4)
  B(S, 0.12, RH, 2.8, wallM, RW + 0.06, RH / 2, -1.0, { cast: false }); B(S, 0.12, RH, 1.0, wallM, RW + 0.06, RH / 2, 1.9, { cast: false }); B(S, 0.12, 0.45, 1.0, wallM, RW + 0.06, RH - 0.22, 0.9, { cast: false });
  { const d = new THREE.Group(); d.position.set(RW + 0.04, 0, 0.4); S.add(d); B(d, 0.06, 2.0, 1.0, '#7a5a44', 0, 1.0, 0.5); SP(d, 0.04, '#d9c08a', -0.06, 1.0, 0.9); SP(d, 0.04, '#d9c08a', 0.06, 1.0, 0.9); reg('aptDoor', d); }
  // front wall (fusuma) — only matters for wide shots from inside
  for (let i = 0; i < 4; i++) B(S, 1.2, 2.0, 0.06, M.fusuma, -1.8 + i * 1.2, 1.0, RW + 0.03, { cast: false }); B(S, 4.8, 0.45, 0.1, wallM, 0, RH - 0.22, RW + 0.05, { cast: false });
  // posts and beams
  for (const [x, z] of [[-RW, -RW], [RW, -RW], [-RW, RW], [RW, RW]]) B(S, 0.12, RH, 0.12, '#8a6a48', x, RH / 2, z); B(S, 4.8, 0.1, 0.1, '#8a6a48', 0, 2.05, -RW + 0.02); B(S, 0.1, 0.1, 4.8, '#8a6a48', -RW + 0.02, 2.05, 0);
  // chabudai + cushions + tea
  { const g = new THREE.Group(); g.position.set(0, 0, 0.2); S.add(g); CY(g, 0.55, 0.55, 0.05, '#7a4a2a', 0, 0.36, 0, 28); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.6; CY(g, 0.03, 0.03, 0.34, '#5a3524', Math.cos(a) * 0.4, 0.17, Math.sin(a) * 0.4, 6); }
    CY(g, 0.07, 0.06, 0.09, '#5f8a7a', -0.25, 0.43, 0.1, 14); CY(g, 0.1, 0.12, 0.14, '#3f6a5a', -0.05, 0.45, -0.2, 14); SP(g, 0.03, '#3f6a5a', -0.05, 0.54, -0.2); const sp = CY(g, 0.015, 0.02, 0.12, '#3f6a5a', 0.08, 0.48, -0.2, 6); sp.rotation.z = -1.0;
    B(g, 0.14, 0.03, 0.05, '#26232a', 0.3, 0.4, -0.05); CY(g, 0.06, 0.05, 0.03, '#f4f1ea', 0.22, 0.4, 0.25, 12); for (let i = 0; i < 3; i++) SP(g, 0.035, '#e8a73a', 0.2 + i * 0.05, 0.43, 0.25); }
  for (const [x, z, c] of [[0, 0.95, '#b8556a'], [-0.85, 0.1, '#5a7ab0'], [0, -0.6, '#9b7fc4']]) { const c2 = B(S, 0.6, 0.1, 0.6, c, x, 0.07, z); }
  // cake (shot "81") — 3D, with an "81" flag and two candles
  { const g = new THREE.Group(); g.position.set(0.05, 0.38, 0.25); S.add(g); CY(g, 0.17, 0.17, 0.14, '#fbf2e6', 0, 0.07, 0, 24); CY(g, 0.175, 0.175, 0.03, '#f3a7bf', 0, 0.15, 0, 24); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; SP(g, 0.025, '#e2453c', Math.cos(a) * 0.13, 0.18, Math.sin(a) * 0.13); }
    for (const x of [-0.04, 0.04]) CY(g, 0.012, 0.012, 0.12, x < 0 ? '#3d8ed8' : '#f2b733', x, 0.22, 0, 8);
    const fl = new THREE.Group(); fl.position.set(0, 0.3, 0); g.add(fl); for (const x of [-0.04, 0.04]) { const f = SP(fl, 0.018, '#ffb43a', x, 0, 0, { cast: false }); f.scale.y = 1.7; f.material = BASIC('#ffc04a'); } reg('flames', fl);
    CY(g, 0.004, 0.004, 0.2, '#c9a77a', 0.1, 0.25, 0, 4); sign(g, signC('81', { bg: '#fff', fg: '#e2453c', size: 0.9, border: 4 }), 0.1, 0.07, 0.15, 0.32, 0, 0, { d: 0.005 }); reg('cake', g); }
  // pension envelope + RENT jar + coins
  { const g = new THREE.Group(); g.position.set(0.2, 0.39, 0.45); S.add(g); sign(g, signC(['PENSION'], { bg: '#efe3c4', fg: '#7a3b2a', size: 0.55 }), 0.3, 0.18, 0, 0.005, 0, 0, { rx: -Math.PI / 2, d: 0.01 }); reg('envelope', g);
    const j = new THREE.Group(); j.position.set(-0.3, 0.38, 0.2); S.add(j); const jg = CY(j, 0.1, 0.1, 0.2, GLASS('#cfeaf7', 0.35), 0, 0.1, 0, 20); jg.userData.ndSkip = true; CY(j, 0.105, 0.105, 0.04, '#c79a62', 0, 0.22, 0, 20); sign(j, signC('RENT', { bg: '#fff', fg: '#c0392b', size: 0.8 }), 0.12, 0.07, 0, 0.1, 0.105, 0, { d: 0.005 });
    const cm = new Merge(); for (let i = 0; i < 9; i++) cm.add(UCY, (i % 3 - 1) * 0.03, 0.02 + Math.floor(i / 3) * 0.018, 0, '#e5c158', 0, 0.05, 0.015, 0.05); const coins = cm.build(j); reg('jarCoins', coins); reg('jar', j); }
  // TV on a low cabinet (screen = live canvas texture)
  { const g = new THREE.Group(); g.position.set(1.35, 0, -1.55); g.rotation.y = -0.5; S.add(g); B(g, 1.1, 0.42, 0.5, '#6a4a32', 0, 0.21, 0); B(g, 0.9, 0.62, 0.45, '#2b2f3a', 0, 0.75, 0); B(g, 0.08, 0.3, 0.08, '#2b2f3a', 0, 0.48, 0);
    const [c, x] = cv(256, 160); tvCtx = x; tvScreenTex = new THREE.CanvasTexture(c); tvScreenTex.colorSpace = THREE.SRGBColorSpace;
    const scr = add(new THREE.PlaneGeometry(0.8, 0.52), new THREE.MeshBasicMaterial({ map: tvScreenTex, fog: false }), 0, 0.76, 0.231, g, { cast: false }); reg('tv', g);
    for (const s of [-1, 1]) { const a = CY(g, 0.008, 0.008, 0.5, '#888', s * 0.15, 1.25, 0, 4); a.rotation.z = s * 0.5; }
    B(g, 0.16, 0.05, 0.05, '#26232a', -0.35, 0.44, 0.15); }
  // butsudan (family altar) on the left wall with the husband's photo frame
  { const g = new THREE.Group(); g.position.set(-2.05, 0, -1.25); g.rotation.y = Math.PI / 2; S.add(g); B(g, 0.9, 0.7, 0.55, '#3a2418', 0, 0.35, 0); B(g, 0.85, 0.9, 0.5, '#24160e', 0, 1.15, -0.02); B(g, 0.75, 0.8, 0.02, '#c9a24a', 0, 1.15, -0.25);
    for (const s of [-1, 1]) B(g, 0.42, 0.9, 0.04, '#3a2418', s * 0.62, 1.15, 0.38, { ry: s * -0.9 }); B(g, 0.9, 0.08, 0.55, '#c9a24a', 0, 1.62, 0);
    B(g, 0.32, 0.4, 0.04, '#26232a', 0, 1.2, -0.12); PL(g, 0.26, 0.34, C('#e9e2d6'), 0, 1.2, -0.095); // photo frame (the card sits in front)
    for (const s of [-1, 1]) { CY(g, 0.04, 0.05, 0.14, '#c9a24a', s * 0.28, 0.77, 0.1, 10); for (let k = 0; k < 3; k++) { const fl = SP(g, 0.035, ['#f2f2ee', '#f2b733', '#e85d8a'][k], s * 0.28 + (k - 1) * 0.03, 0.9 + k * 0.02, 0.1); } }
    CY(g, 0.07, 0.05, 0.06, '#c9a24a', 0.08, 0.73, 0.15, 14); CY(g, 0.06, 0.06, 0.05, '#8a8a8a', -0.1, 0.73, 0.15, 14); CY(g, 0.004, 0.004, 0.16, '#6a3a2a', -0.1, 0.83, 0.15, 4);
    for (let i = 0; i < 3; i++) SP(g, 0.045, '#f08a3a', -0.25 + i * 0.07, 0.75, 0.0); reg('altar', g); }
  // wall clock + calendar + phone shelf + kitchen corner + lamp + plant
  const aclock = clock(S, -RW + 0.05, 1.85, 0.6, Math.PI / 2, 0.2, '#8a6a48'); reg('aptClock', aclock);
  anim.push(['apt', (f, fl) => setClock(aclock, (fl.clockH ?? 3.25) + f / 30 / 3600 * 60, (f / 30 * 1) % 60)]);
  sign(S, signC(['JANUARY'], { bg: '#ffffff', fg: '#c0392b', size: 0.5, dy: -0.32, extra: (g, w, h) => { g.font = `${h * 0.08}px "Lilita One"`; g.fillStyle = '#2b1f1c'; for (let i = 0; i < 31; i++) { const x = w * (0.12 + (i % 7) * 0.127), y = h * (0.42 + Math.floor(i / 7) * 0.12); g.fillText(String(i + 1), x, y); } g.strokeStyle = '#e2453c'; g.lineWidth = 6; g.beginPath(); g.ellipse(w * 0.12, h * 0.415, 26, 22, 0, 0, 7); g.stroke(); } , w: 512, h: 640 }), 0.5, 0.62, -1.75, 1.6, -RW + 0.02, 0, { d: 0.01 });
  { const g = new THREE.Group(); g.position.set(-2.1, 0, 1.6); S.add(g); B(g, 0.45, 0.75, 0.5, '#7a5a44', 0, 0.375, 0); B(g, 0.25, 0.08, 0.2, '#f4f1ea', 0, 0.79, 0); const hs = B(g, 0.06, 0.06, 0.24, '#f4f1ea', 0, 0.86, 0); reg('handset', hs); add(new THREE.TorusGeometry(0.05, 0.008, 5, 12), C('#f4f1ea'), 0.1, 0.8, 0.12, g); }
  { const g = new THREE.Group(); g.position.set(1.9, 0, -2.05); S.add(g); B(g, 0.9, 0.85, 0.55, '#f4f1ea', 0, 0.425, 0); B(g, 0.55, 0.06, 0.4, '#2b2f3a', 0, 0.88, 0); CY(g, 0.08, 0.09, 0.16, '#c0392b', 0.12, 0.99, 0, 14); B(g, 0.9, 0.04, 0.3, '#8a6a48', 0, 1.6, -0.1); for (let i = 0; i < 4; i++) CY(g, 0.05, 0.05, 0.14, PAL[i + 2], -0.3 + i * 0.18, 1.69, -0.1, 10); }
  { const g = new THREE.Group(); g.position.set(0, RH, 0.2); S.add(g); const l = new THREE.Group(); g.add(l); CY(l, 0.006, 0.006, 0.55, '#3a2e2a', 0, -0.28, 0, 4); const sh = CY(l, 0.12, 0.32, 0.22, '#f3e6c9', 0, -0.62, 0, 20, { cast: false }); CY(l, 0.004, 0.004, 0.35, '#3a2e2a', 0.08, -0.85, 0, 4); SP(l, 0.07, BASIC('#fff6d8'), 0, -0.68, 0, { cast: false });
    anim.push(['apt', (f) => { l.rotation.z = 0.04 * Math.sin(f * 0.04); l.rotation.x = 0.03 * Math.sin(f * 0.031); }]); }
  aptPlant = plant(S, -2.0, 0, -2.05, 1.3, '#4f9a4a'); aptPlantWilt = plant(S, -2.0, 0, -2.05, 1.3, '#9a8a4a'); aptPlantWilt.scale.y = 0.75; aptPlantWilt.rotation.z = 0.25;
  B(S, 0.4, 0.3, 0.3, '#d9cdb5', 1.0, 0.15, 1.9); for (let i = 0; i < 5; i++) B(S, 0.36, 0.02, 0.26, '#f4f1ea', 1.0, 0.31 + i * 0.022, 1.9, { ry: i * 0.1 }); // newspapers
  // view through the window: street with the konbini across + houses + pole
  { const g = new THREE.Group(); g.position.set(0, -3, -9); S.add(g); floor(g, 40, 6, M.asphalt, 0, 0, 0); B(g, 7, 3.6, 3, M.plasterW, 3.5, 1.8, -5); B(g, 7.1, 0.7, 3.1, '#2f8f5b', 3.5, 3.25, -5);
    sign(g, signC('HAPPY MART 24H', { bg: '#ffffff', fg: '#2f8f5b', border: 0 }), 4.4, 0.55, 3.5, 3.25, -3.42, 0, { glow: 0.5 }); B(g, 6, 2.4, 0.05, BASIC('#fff4c2'), 3.5, 1.4, -3.45);
    house(g, -5, -6, 7, 5, 7, '#dfe4e8', M.roofTile, 0, 61); pole(g, 0.5, -2.8, 9); skyline(g, 0, -30, 8, 60, 62, { hmin: 14 }); tree(g, -1.5, -2.5, 4); }
  // outside walkway (for the ending): concrete floor, railing, neighbour doors, the konbini glowing across the street
  { const g = new THREE.Group(); g.position.set(0, 0, 0); S.add(g); B(g, 2.2, 0.1, 12, M.conc, RW + 1.2, -0.05, 0.5); B(g, 0.1, 1.1, 12, '#c7ccd2', RW + 2.3, 0.55, 0.5); B(g, 0.06, 0.06, 12, '#9aa0a6', RW + 2.3, 1.12, 0.5);
    B(g, 0.12, RH, 12, wallM, RW + 0.06, RH / 2, 0.5, { cast: false, }).visible = false;
    for (const z of [-3.2, 4.2]) { B(g, 0.06, 2.0, 1.0, '#6a7f9a', RW + 0.04, 1.0, z); } B(g, 2.2, 0.1, 12, M.conc, RW + 1.2, RH + 0.3, 0.5); sign(g, signC('203', { bg: '#fff' }), 0.02, 0.15, RW + 0.09, 2.1, 0.9, Math.PI / 2, { d: 0.25 });
    B(g, 0.3, 0.3, 0.3, '#3d8ed8', RW + 0.3, 0.15, 1.7); // milk box
    const k = new THREE.Group(); k.position.set(16, -6, 0); g.add(k); B(k, 4, 4, 8, M.plasterW, 0, 2, 0); B(k, 4.05, 0.8, 8.05, '#2f8f5b', 0, 3.6, 0); const ks = sign(k, signC(['HAPPY MART', 'OPEN 24H'], { bg: '#ffffff', fg: ['#2f8f5b', '#f08a3a'], border: 0 }), 0.05, 1.4, -2.05, 5.0, 0, -Math.PI / 2, { glow: 0.6, d: 3.2 }); reg('konbiniSign', ks);
    B(k, 0.05, 2.4, 7, BASIC('#fff4c2'), -2.03, 1.4, 0); floor(g, 40, 60, M.asphalt, 14, 0, -6); skyline(g, 40, 10, 12, 60, 63, { hmin: 10 }); tree(g, 9, -4, 5, '#5f9a45', -6); house(g, 13, 9, 6, 6, 6, '#e7dcc8', M.roofTile, -Math.PI / 2, 64);
    const wp = pole(g, 9, 2, 14); wp.position.y = -6; }
}

// ======================================================================================
// SET 3: CITY OFFICE (the kids, another city)
// ======================================================================================
{
  const S = mkSet('city');
  floor(S, 14, 10, M.carpet, 0, 0, 0); const ceil = PL(S, 14, 10, C('#eef0f2'), 0, 3.0, 0); ceil.rotation.x = Math.PI / 2;
  const lm = new Merge(); for (let x = -5; x <= 5; x += 2.5) for (let z = -4; z <= 4; z += 2) lm.box(1.2, 0.04, 0.5, x, 2.97, z, '#fff'); lm.build(S).material = BASIC('#ffffff');
  // window wall z=-5 with mullions; skyline outside
  for (let x = -7; x <= 7; x += 1.75) B(S, 0.08, 3.0, 0.12, '#3a4252', x, 1.5, -5); B(S, 14, 0.12, 0.14, '#3a4252', 0, 0.06, -5); B(S, 14, 0.14, 0.14, '#3a4252', 0, 2.95, -5);
  const gl = PL(S, 14, 3, GLASS('#bfe0f5', 0.1), 0, 1.5, -5.02); gl.userData.ndSkip = true;
  B(S, 0.2, 3, 10, M.plasterB, -7, 1.5, 0); B(S, 0.2, 3, 10, M.plasterB, 7, 1.5, 0); B(S, 14, 3, 0.2, M.plasterB, 0, 1.5, 5);
  { const g = new THREE.Group(); g.position.set(0, -120, 0); S.add(g); skyline(g, 0, -40, 26, 260, 71, { hmin: 30, hvar: 90, depth: 160 }); floor(g, 600, 600, C('#8aa0a8'), 0, -100);
    const tw = new THREE.Group(); tw.position.set(-40, 0, -150); g.add(tw); for (let i = 0; i < 6; i++) { const r0 = 14 - i * 2.2, h = 30; add(new THREE.CylinderGeometry(r0 - 2.2, r0, h, 4, 1, true), C(i % 2 ? '#f4f1ea' : '#e2453c'), 0, i * h + h / 2, 0, tw, { cast: false }); B(tw, (r0 - 1) * 1.6, 2, (r0 - 1) * 1.6, i % 2 ? '#e2453c' : '#f4f1ea', 0, (i + 1) * h, 0); } CY(tw, 0.5, 1.2, 30, '#f4f1ea', 0, 195, 0, 6); }
  mountains(S, 7, 700, 9, '#a9bccb');
  // desks
  const desk = (x, z, ry = 0, seed = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; S.add(g); const r = P.rng(seed);
    B(g, 1.6, 0.05, 0.8, '#e9e2d6', 0, 0.74, 0); for (const sx of [-0.75, 0.75]) B(g, 0.05, 0.72, 0.75, '#9aa0a6', sx, 0.36, 0); B(g, 0.6, 0.38, 0.04, '#26232a', 0, 1.0, -0.25); const sc = PL(g, 0.55, 0.32, BASIC(['#7cd0ff', '#9fe3b0', '#ffd27c'][seed % 3]), 0, 1.0, -0.227); B(g, 0.05, 0.2, 0.05, '#26232a', 0, 0.85, -0.25);
    B(g, 0.45, 0.02, 0.15, '#3a3f4a', 0, 0.77, 0.1); for (let i = 0; i < 3 + (r() * 4 | 0); i++) B(g, 0.3, 0.02, 0.22, '#f8f8f4', 0.55, 0.78 + i * 0.022, -0.05, { ry: r() * 0.3 }); CY(g, 0.04, 0.035, 0.1, PAL[seed % PAL.length], -0.6, 0.82, 0.15, 10);
    B(g, 0.5, 0.06, 0.5, '#2b2f3a', 0, 0.48, 0.6); B(g, 0.5, 0.55, 0.06, '#2b2f3a', 0, 0.8, 0.85); CY(g, 0.03, 0.03, 0.4, '#9aa0a6', 0, 0.25, 0.6, 6); return g; };
  desk(0, -1.5, 0, 1); desk(1.8, -1.5, 0, 2); desk(-1.8, -1.5, 0, 3); desk(0, 1.0, Math.PI, 4); desk(1.8, 1.0, Math.PI, 5); desk(-1.8, 1.0, Math.PI, 6); desk(-4.2, -2.6, 0.2, 7); desk(4.2, -2.6, -0.2, 8);
  plant(S, -5.8, 0, -4.2, 2.2); plant(S, 5.8, 0, -4.2, 2.2, '#3f8a4a'); B(S, 0.4, 1.2, 0.4, '#e9ecef', 6.2, 0.6, 1.5); CY(S, 0.16, 0.16, 0.4, GLASS('#9fd3f5', 0.6), 6.2, 1.4, 1.5, 16);
  // calendar pillar + clock
  B(S, 0.6, 3, 0.6, M.plasterB, 3.2, 1.5, -3.2);
  sign(S, signC(['JAN 1', 'CALL MOM', '(MAYBE)'], { bg: '#ffffff', fg: ['#c0392b', '#2b1f1c', '#8a8a9a'], size: 0.8, extra: (g, w, h) => { g.strokeStyle = '#e2453c'; g.lineWidth = 8; g.beginPath(); g.ellipse(w / 2, h / 6, w * 0.32, h * 0.15, 0, 0, 7); g.stroke(); }, w: 512, h: 640 }), 0.48, 0.6, 3.2, 1.6, -2.88, 0, { d: 0.02 });
  const oc = clock(S, -3.2, 2.4, -4.85, 0, 0.3); anim.push(['city', (f) => setClock(oc, 11.9 + f / 30 / 60, (f / 30 * 6) % 60)]);
  sign(S, signC(['DEADLINE', 'TODAY!!'], { bg: '#ffd84a', fg: '#c0392b' }), 1.0, 0.6, 0, 2.3, 4.88, Math.PI, { d: 0.02 });
  reg('cityPhone', (() => { const g = new THREE.Group(); S.add(g); B(g, 0.07, 0.14, 0.02, '#26232a', 0, 0, 0); PL(g, 0.055, 0.11, BASIC('#7cd0ff'), 0, 0, 0.011); return g; })());
  reg('cityPhone2', (() => { const g = new THREE.Group(); S.add(g); B(g, 0.07, 0.14, 0.02, '#e85d8a', 0, 0, 0); PL(g, 0.055, 0.11, BASIC('#ffffff'), 0, 0, 0.011); return g; })());
}

// ======================================================================================
// SET 4: COURTROOM
// ======================================================================================
{
  const S = mkSet('court');
  floor(S, 12, 16, M.woodFloor, 0, -1, 0); const ceil = PL(S, 12, 16, C('#efe7da'), 0, 5.2, -1); ceil.rotation.x = Math.PI / 2;
  B(S, 12, 5.2, 0.2, M.woodPanel, 0, 2.6, -9, { cast: false }); B(S, 0.2, 5.2, 16, TM(TX.plain('#e8dcc8', 200, 81), 3, 3), -6, 2.6, -1, { cast: false }); B(S, 0.2, 5.2, 16, TM(TX.plain('#e8dcc8', 200, 82), 3, 3), 6, 2.6, -1, { cast: false });
  B(S, 12, 1.2, 0.22, M.woodDark, 0, 0.6, -8.9); for (const x of [-6, 6]) B(S, 0.24, 1.2, 16, M.woodDark, x, 0.6, -1);
  for (const x of [-5.9, 5.9]) for (const z of [-5, 0, 4]) { windowFrame(S, 1.4, 2.2, x, 2.8, z, x < 0 ? Math.PI / 2 : -Math.PI / 2, '#f4f1ea'); for (let k = 0; k < 8; k++) B(S, 0.02, 0.06, 1.4, '#efe7da', x * 0.99, 2.0 + k * 0.25, z, { rz: 0 }); }
  // judges' bench (platform + tall front), three chairs, emblem
  B(S, 9, 0.6, 3, M.woodDark, 0, 0.3, -7.5); B(S, 8.4, 1.3, 0.25, M.woodPanel, 0, 1.25, -6.1); B(S, 8.6, 0.08, 0.6, '#5a3524', 0, 1.92, -6.3);
  for (const x of [-2.4, 0, 2.4]) { B(S, 0.9, 2.1, 0.2, '#6a1f2a', x, 1.65, -8.4); B(S, 0.9, 0.12, 0.9, '#6a1f2a', x, 1.05, -8.0); }
  { const g = new THREE.Group(); g.position.set(0, 3.8, -8.85); S.add(g); const d = CY(g, 0.62, 0.62, 0.08, '#c9a24a', 0, 0, 0, 32); d.rotation.x = Math.PI / 2; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; B(g, 0.08, 0.36, 0.04, '#f2d27a', Math.sin(a) * 0.42, Math.cos(a) * 0.42, 0.06, { rz: -a }); } SP(g, 0.2, '#e2453c', 0, 0, 0.05); }
  sign(S, signC('DISTRICT COURT', { bg: '#3a2418', fg: '#f2d27a', border: 0 }), 3.4, 0.5, 0, 4.8, -8.85, 0);
  // clerk desk + defendant stand + lawyer tables
  B(S, 3.2, 0.9, 0.8, M.woodPanel, 0, 0.45, -4.8); B(S, 0.5, 0.3, 0.4, '#26232a', 0.8, 1.05, -4.8);
  { const g = new THREE.Group(); g.position.set(0, 0, -1.6); S.add(g); B(g, 1.0, 1.0, 0.5, M.woodPanel, 0, 0.5, 0.35); B(g, 1.1, 0.06, 0.6, '#5a3524', 0, 1.02, 0.35); B(g, 1.4, 0.15, 1.4, M.woodDark, 0, 0.075, -0.1); }
  for (const x of [-3.6, 3.6]) { B(S, 2.4, 0.08, 1.0, '#5a3524', x, 0.78, -2.6); for (const sx of [-1.1, 1.1]) B(S, 0.08, 0.76, 0.9, '#5a3524', x + sx, 0.38, -2.6); B(S, 0.4, 0.02, 0.3, '#f4f1ea', x, 0.83, -2.6); }
  // gallery rail + benches
  B(S, 11.6, 0.9, 0.12, M.woodPanel, 0, 0.45, 0.6); for (let x = -5.5; x <= 5.5; x += 0.5) CY(S, 0.03, 0.03, 0.8, '#5a3524', x, 0.45, 0.6, 6);
  for (let z = 1.8; z <= 5.4; z += 1.2) for (const x of [-3, 3]) { B(S, 4.6, 0.08, 0.45, '#7a5a44', x, 0.46, z); B(S, 4.6, 0.6, 0.06, '#7a5a44', x, 0.8, z + 0.25); }
  // stamp + verdict paper (dynamic)
  { const g = new THREE.Group(); S.add(g); CY(g, 0.05, 0.06, 0.22, '#6a3a2a', 0, 0.2, 0, 12); SP(g, 0.08, '#6a3a2a', 0, 0.34, 0); B(g, 0.26, 0.08, 0.16, '#c9a24a', 0, 0.06, 0); B(g, 0.24, 0.02, 0.14, '#e2453c', 0, 0.01, 0); reg('stamp', g); }
  { const g = new THREE.Group(); S.add(g); const pc = signC(['VERDICT'], { bg: '#fbf8f0', fg: '#2b1f1c', size: 0.3, dy: -0.32, border: 0, w: 384, h: 512, extra: (gg, w, h) => { gg.fillStyle = '#9a9aa8'; for (let i = 0; i < 6; i++) gg.fillRect(w * 0.15, h * (0.3 + i * 0.07), w * (0.7 - (i % 3) * 0.1), 6); } }); sign(g, pc, 0.42, 0.56, 0, 0, 0, 0, { d: 0.005 }); reg('verdict', g);
    const st = sign(g, signC('PRISON', { bg: '#fbf8f0', fg: '#e2453c', border: 12, borderCol: '#e2453c', size: 0.7, age: false }), 0.34, 0.14, 0, -0.08, 0.006, 0, { d: 0.002, rz: 0.12 }); reg('stampMark', st); }
  // flags/ceiling lights
  for (let z = -6; z <= 4; z += 3.3) { CY(S, 0.01, 0.01, 0.6, '#555', 0, 4.9, z, 4); const l = SP(S, 0.28, BASIC('#fff7e0'), 0, 4.55, z, { cast: false }); l.scale.y = 0.5; }
  plant(S, -5.3, 0, -8.3, 2.0); plant(S, 5.3, 0, -8.3, 2.0, '#3f8a4a');
}

// ======================================================================================
// SET 5: PRISON — gate exterior (around x=0), interior zones x 100+ (corridor, cafeteria, infirmary, stairs, workshop), dorm x 200
// ======================================================================================
let dormMoon;
{
  const S = mkSet('prison');
  // ---------- exterior ----------
  floor(S, 120, 14, M.asphalt, 0, 6, 0); B(S, 120, 0.14, 2.4, M.walk, 0, 0.07, 1.3); B(S, 120, 0.14, 2.0, M.walk, 0, 0.07, 14);
  for (const z of [2.6, 12.9]) floor(S, 120, 0.12, C('#f4f1ea'), 0, z, 0.012);
  const wallM = TM(TX.concrete(78, 30), 3, 1);
  for (const [x0, x1] of [[-50, -3.4], [3.4, 50]]) { B(S, x1 - x0, 5.2, 0.6, wallM, (x0 + x1) / 2, 2.6, 0); for (let x = x0; x < x1; x += 2.2) { const c = add(new THREE.TorusGeometry(0.28, 0.025, 4, 10), C('#5a5f66'), x, 5.5, 0, S, { cast: false }); } B(S, x1 - x0, 0.25, 0.8, '#bfb8aa', (x0 + x1) / 2, 5.3, 0); }
  for (const x of [-3.7, 3.7]) { B(S, 0.9, 6.2, 1.0, '#b9b0a2', x, 3.1, 0); B(S, 1.1, 0.3, 1.2, '#a49b8c', x, 6.35, 0); }
  sign(S, signC(["WOMEN'S PRISON"], { bg: '#efe9dc', fg: '#2b1f1c', size: 0.5 }), 0.05, 0.5, 4.17, 3.8, 0.0, Math.PI / 2, { d: 2.1 });
  sign(S, signC(["WOMEN'S", 'PRISON'], { bg: '#efe9dc', fg: '#2b1f1c', size: 0.8 }), 0.7, 0.9, -3.7, 3.6, 0.52, 0, { d: 0.04 });
  { const g = new THREE.Group(); g.position.set(0, 0, 0.1); S.add(g); for (let i = 0; i < 2; i++) { const p = new THREE.Group(); p.position.x = i ? 1.6 : -1.6; g.add(p); B(p, 3.2, 0.14, 0.12, '#4a525c', 0, 4.4, 0); B(p, 3.2, 0.14, 0.12, '#4a525c', 0, 0.2, 0); B(p, 3.2, 0.14, 0.12, '#4a525c', 0, 2.3, 0); for (let k = 0; k < 11; k++) CY(p, 0.035, 0.035, 4.3, '#5a626c', -1.5 + k * 0.3, 2.3, 0, 6); reg(i ? 'gateR' : 'gateL', p); } }
  { const g = new THREE.Group(); g.position.set(6.5, 0, 1.2); S.add(g); B(g, 1.8, 2.5, 1.6, '#e9e4da', 0, 1.25, 0); B(g, 2.1, 0.15, 1.9, '#2f4f6f', 0, 2.6, 0); windowFrame(g, 1.1, 0.8, 0, 1.5, 0.81, 0, '#2f4f6f'); B(g, 1.1, 0.05, 0.3, '#2f4f6f', 0, 1.1, 0.95); }
  // courtyard + main building inside the walls
  floor(S, 40, 30, M.conc, 0, -15, 0.01); B(S, 30, 9, 8, TM(TX.facade('#d9d3c6', '#7a8a9a', '#a9b9c9', 3, 10, 91), 1, 1), 0, 4.5, -24); tree(S, -8, -10, 5); tree(S, 9, -12, 5.5, '#4f8a45');
  // outside street life: bus stop, lone tree, vending machine, pole, houses opposite
  { const g = new THREE.Group(); g.position.set(-8, 0.14, 1.6); S.add(g); CY(g, 0.04, 0.04, 2.4, '#9aa0a6', 0, 1.2, 0, 8); const sg = CY(g, 0.3, 0.3, 0.05, '#2c6fb8', 0, 2.5, 0, 24); sg.rotation.x = Math.PI / 2; sign(g, signC('BUS', { bg: '#2c6fb8', fg: '#fff', border: 0 }), 0.4, 0.2, 0, 2.5, 0.03, 0, { d: 0.01 });
    sign(g, signC(['TIMETABLE', '7:42  13:10', '(2 A DAY)'], { bg: '#fff', size: 0.75 }), 0.4, 0.5, 0, 1.5, 0.06, 0, { d: 0.02 }); B(g, 1.8, 0.06, 0.45, '#8a6a48', 1.4, 0.45, 0.1); for (const x of [0.6, 2.2]) B(g, 0.06, 0.45, 0.4, '#9aa0a6', x, 0.22, 0.1); B(g, 1.8, 0.45, 0.05, '#8a6a48', 1.4, 0.75, -0.1); reg('busStop', g); }
  const lone = tree(S, 9, 2.2, 5.5, '#c98a3a'); vending(S, -13, 1.1, '#47b36b'); pole(S, 13, 2.4, 8); wire(S, [13, 7.5, 2.4], [-30, 7.5, 2.4], 0.8); wire(S, [13, 7.5, 2.4], [40, 7.5, 2.4], 0.8);
  const pc = crow(S, -2, 7.5 - 0.8 * 4 * (15 / 43) * (28 / 43), 2.4, Math.PI / 2); anim.push(['prison', (f) => { pc.rotation.z = 0.06 * Math.sin(f * 0.11); }]);
  B(S, 120, 1.4, 0.22, M.blocks, 0, 0.84, 15.2); house(S, -12, 19, 8, 6, 5.4, '#e7dcc8', M.roofTile, Math.PI, 93); house(S, -1, 19.5, 7, 6, 5.4, '#dfe4e8', M.roofRed, Math.PI, 94); house(S, 10, 19, 8, 6, 5.4, '#f0e2cf', M.roofTile, Math.PI, 95);
  skyline(S, 0, 50, 10, 140, 96); skyline(S, 0, -45, 10, 140, 97); mountains(S, 9, 420, 98);
  // ---------- interior hall (x 100..190, z -6..6), one long building with zones ----------
  const IX = 100;
  floor(S, 100, 12, M.prisonFloor, IX + 45, 0, 0.02); { const c = PL(S, 100, 12, C('#e8ece6'), IX + 45, 4.0, 0); c.rotation.x = Math.PI / 2; }
  const wallG = TM(TX.plain('#dfe6da', 300, 101), 4, 1); B(S, 100, 4, 0.3, wallG, IX + 45, 2, -6.15, { cast: false }); B(S, 100, 4, 0.3, wallG, IX + 45, 2, 6.15, { cast: false });
  B(S, 100, 1.0, 0.32, '#8fa597', IX + 45, 0.5, -6.1, { cast: false }); B(S, 100, 1.0, 0.32, '#8fa597', IX + 45, 0.5, 6.1, { cast: false });
  for (const x of [IX - 0.15, IX + 95.15]) B(S, 0.3, 4, 12, wallG, x, 2, 0, { cast: false });
  const hl = new Merge(); for (let x = IX + 2; x < IX + 95; x += 3) hl.box(1.6, 0.05, 0.3, x, 3.96, 0, '#fff'); hl.build(S).material = BASIC('#fffdf2');
  for (let x = IX + 3; x < IX + 95; x += 4.5) for (const z of [-6.0, 6.0]) windowFrame(S, 1.2, 0.8, x, 3.2, z, z < 0 ? 0 : Math.PI, '#9aa7a0', 4);
  // partitions between zones (with wide openings)
  for (const x of [IX + 16, IX + 34, IX + 46, IX + 58]) { B(S, 0.25, 4, 4.0, wallG, x, 2, -4.0, { cast: false }); B(S, 0.25, 4, 4.0, wallG, x, 2, 4.0, { cast: false }); B(S, 0.25, 1.0, 4.0, wallG, x, 3.5, 0, { cast: false }); }
  // corridor zone (IX..IX+16): cell doors on the -z wall, sliding bar gate across at x=IX+8
  for (let x = IX + 1.5; x < IX + 15.5; x += 2.2) { B(S, 1.0, 2.1, 0.12, '#7d8a96', x, 1.05, -5.95); B(S, 0.36, 0.36, 0.13, '#3a4252', x, 1.55, -5.95); for (let k = 0; k < 3; k++) CY(S, 0.015, 0.015, 0.36, '#9aa7b2', x - 0.12 + k * 0.12, 1.55, -5.88, 5); sign(S, signC(String(200 + Math.round(x - IX)), { bg: '#fff', size: 0.7 }), 0.25, 0.14, x, 2.3, -5.88, 0, { d: 0.01 }); }
  { const g = new THREE.Group(); g.position.set(IX + 8, 0, 0); S.add(g); B(g, 0.3, 0.2, 12, '#4a525c', 0, 3.4, 0); const bars = new THREE.Group(); g.add(bars); for (let k = 0; k < 26; k++) CY(bars, 0.04, 0.04, 3.3, '#5a626c', 0, 1.7, -5.0 + k * 0.4, 6); for (const y of [0.3, 1.6, 3.2]) B(bars, 0.12, 0.12, 10.4, '#4a525c', 0, y, 0); B(bars, 0.2, 0.3, 0.25, '#c9a24a', 0, 1.5, 5.15); reg('bars', bars);
    for (const z of [-5.6, 5.6]) B(g, 0.4, 3.4, 1.0, '#7d8a96', 0, 1.7, z); }
  sign(S, signC('BLOCK C', { bg: '#2f4f6f', fg: '#fff', border: 0 }), 1.6, 0.5, IX + 4, 3.0, -5.95, 0, { d: 0.03 });
  sign(S, signC(['QUIET', 'PLEASE'], { bg: '#ffd84a' }), 0.7, 0.5, IX + 13, 2.4, 5.95, Math.PI, { d: 0.02 });
  reg('key', (() => { const g = new THREE.Group(); S.add(g); add(new THREE.TorusGeometry(0.05, 0.014, 6, 14), C('#c9a24a'), 0, 0.07, 0, g); B(g, 0.02, 0.12, 0.012, '#c9a24a', 0, -0.03, 0); B(g, 0.04, 0.02, 0.012, '#c9a24a', 0.02, -0.07, 0); return g; })());
  // cafeteria zone (IX+16..IX+34)
  { const X = IX + 25; for (const z of [-2.2, 1.4]) { B(S, 9, 0.08, 1.0, '#e9e2d6', X, 0.76, z); for (const dx of [-4, 0, 4]) B(S, 0.08, 0.74, 0.9, '#9aa0a6', X + dx, 0.37, z); for (const s of [-1, 1]) B(S, 9, 0.06, 0.35, '#8fa5b5', X, 0.45, z + s * 0.75);
      const m = new Merge(), r = P.rng(Math.round(z * 10 + 200)); for (let i = 0; i < 8; i++) { const x = X - 3.8 + i * 1.08; for (const s of [-1, 1]) { m.box(0.42, 0.02, 0.3, x, 0.81, z + s * 0.25, '#c9b48a'); m.add(UCY, x - 0.1, 0.85, z + s * 0.25, '#fbfaf4', 0, 0.12, 0.06, 0.12); m.add(UCY, x + 0.08, 0.85, z + s * 0.25, '#b0603a', 0, 0.1, 0.06, 0.1); m.box(0.14, 0.03, 0.06, x + 0.05, 0.83, z + s * 0.25 - 0.08, '#c97a3e'); } } m.build(S); }
    B(S, 0.9, 1.0, 8, '#c7ccd2', IX + 33, 0.5, 0); for (let i = 0; i < 4; i++) { CY(S, 0.28, 0.28, 0.45, '#b9bec4', IX + 33, 1.22, -3 + i * 2, 16); CY(S, 0.3, 0.3, 0.05, '#8a8f95', IX + 33, 1.47, -3 + i * 2, 16); }
    const cc = clock(S, IX + 25, 2.9, -5.95, 0, 0.42); reg('cafClock', cc); anim.push(['prison', (f, fl) => setClock(cc, fl.cafH ?? 7.0, (f / 30 * 6) % 60)]);
    sign(S, signC(['BREAKFAST 7:00', 'LUNCH 12:00  DINNER 5:00'], { bg: '#fffbe9', fg: ['#c0392b', '#2b1f1c'], size: 0.7 }), 2.6, 0.7, IX + 21, 2.9, -5.95, 0, { d: 0.03 });
    sign(S, signC(['TODAY: GRILLED FISH', 'MISO SOUP · RICE'], { bg: '#2f4f6f', fg: '#fff' }), 2.4, 0.6, IX + 29.5, 2.9, -5.95, 0, { d: 0.03 });
    reg('tray', (() => { const g = new THREE.Group(); S.add(g); B(g, 0.46, 0.03, 0.32, '#e0b36a', 0, 0, 0); CY(g, 0.07, 0.05, 0.07, '#fbfaf4', -0.12, 0.05, 0.05, 14); SP(g, 0.06, '#fbfaf4', -0.12, 0.08, 0.05); CY(g, 0.07, 0.05, 0.07, '#7a3b2a', 0.06, 0.05, 0.06, 14); CY(g, 0.06, 0.06, 0.01, '#c98a4a', 0.06, 0.085, 0.06, 14);
      const fish = SP(g, 0.05, '#c98a3e', 0.08, 0.04, -0.09); fish.scale.set(2.2, 0.7, 1); B(g, 0.04, 0.05, 0.05, '#c98a3e', 0.2, 0.04, -0.09, { rz: 0.6 }); B(g, 0.06, 0.03, 0.04, '#e8d64a', -0.14, 0.03, -0.09); return g; })()); }
  // infirmary zone (IX+34..IX+46)
  { const X = IX + 40; B(S, 11.6, 3.0, 0.1, M.plasterP, X, 1.5, -5.9, { cast: false }); B(S, 1.6, 0.06, 0.8, '#f4f1ea', X - 1.5, 0.76, -4.6); for (const dx of [-0.75, 0.75]) B(S, 0.05, 0.74, 0.75, '#9aa0a6', X - 1.5 + dx, 0.37, -4.6);
    B(S, 0.5, 1.8, 0.4, '#f4f6f8', X + 1.4, 0.9, -5.6); const bm = new Merge(), r = P.rng(55); for (let s = 0; s < 3; s++) for (let k = 0; k < 4; k++) bm.add(UCY, X + 1.25 + k * 0.1, 0.9 + s * 0.4, -5.45, PAL[(r() * PAL.length) | 0], 0, 0.06, 0.14, 0.06); bm.build(S); PL(S, 0.45, 1.5, GLASS('#dff3ff', 0.25), X + 1.4, 1.0, -5.39).userData.ndSkip = true;
    sign(S, signC(['E', 'F P', 'T O Z', 'L P E D'], { bg: '#fff', size: 0.9, border: 3 }), 0.5, 0.75, X + 3.2, 1.6, -5.82, 0, { d: 0.01 });
    sign(S, signC('INFIRMARY', { bg: '#fff', fg: '#d8343a', size: 0.6 }), 1.8, 0.45, X - 1, 2.8, -5.85, 0, { d: 0.02 });
    B(S, 2.0, 0.5, 0.9, '#f4f6f8', X + 3.8, 0.5, -3.8); B(S, 1.9, 0.15, 0.85, '#bfe0f0', X + 3.8, 0.8, -3.8); B(S, 0.5, 0.12, 0.6, '#ffffff', X + 3.2, 0.92, -3.8);
    for (let k = 0; k < 6; k++) { const cu = B(S, 0.4, 2.2, 0.04, '#9fd0d8', X + 2.6, 1.3, -3.2 + k * 0.38, { ry: Math.PI / 2 + (k % 2 ? 0.3 : -0.3) }); }
    reg('bp', (() => { const g = new THREE.Group(); S.add(g); B(g, 0.26, 0.2, 0.08, '#f4f6f8', 0, 0.1, 0); const d = CY(g, 0.09, 0.09, 0.02, '#ffffff', 0, 0.11, 0.045, 24); d.rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.09, 0.01, 6, 24), C('#3e4a66'), 0, 0.11, 0.05, g); const n = new THREE.Group(); n.position.set(0, 0.11, 0.06); g.add(n); B(n, 0.008, 0.075, 0.006, '#d8343a', 0, 0.035, 0); reg('bpNeedle', n);
      const tube = wire(g, [0.13, 0.08, 0], [0.4, -0.05, 0.1], 0.06, 6, '#3e4a66'); return g; })());
    reg('cuff', (() => { const g = new THREE.Group(); S.add(g); const c = CY(g, 0.075, 0.075, 0.16, '#3e5a9a', 0, 0, 0, 16); c.rotation.z = Math.PI / 2; B(g, 0.12, 0.02, 0.15, '#c9d6e3', 0, 0.07, 0); return g; })()); }
  // stairs zone (IX+46..IX+58): steps rising +x from x=IX+48, yellow rails
  { const X0 = IX + 48; for (let i = 0; i < 18; i++) { B(S, 0.32, 0.19 * (i + 1), 1.6, i % 2 ? '#b9c2bb' : '#aeb8b0', X0 + i * 0.32, 0.095 * (i + 1), -3.6); B(S, 0.34, 0.03, 1.62, '#e2b23a', X0 + i * 0.32 - 0.14, 0.19 * (i + 1) + 0.01, -3.6); }
    for (const z of [-2.75, -4.45]) { for (let i = 0; i < 18; i += 3) CY(S, 0.025, 0.025, 1.0, '#e2b23a', X0 + i * 0.32, 0.19 * (i + 1) + 0.5, z, 6); const rl = B(S, Math.hypot(18 * 0.32, 18 * 0.19), 0.06, 0.06, '#e2b23a', X0 + 2.7, 1.0 + 1.7, z); rl.rotation.z = Math.atan2(0.19, 0.32); }
    sign(S, signC(['2F', '↑'], { bg: '#2f4f6f', fg: '#fff', size: 0.8 }), 0.6, 0.6, X0 - 0.6, 2.0, -5.9, 0, { d: 0.02 }); sign(S, signC(['WATCH', 'YOUR STEP'], { bg: '#ffd84a' }), 0.8, 0.5, X0 + 2, 1.2, -5.9, 0, { d: 0.02 });
    floor(S, 12, 4, C('#aeb8b0'), X0 + 7.5, -3.6, 3.42); }
  // workshop zone (IX+58..IX+95)
  { const X = IX + 70; for (const z of [-2.2, 1.6]) { B(S, 16, 0.08, 1.2, '#c9a77a', X, 0.78, z); for (const dx of [-7.5, -2.5, 2.5, 7.5]) B(S, 0.08, 0.76, 1.1, '#7a5a44', X + dx, 0.38, z); for (const s of [-1, 1]) B(S, 16, 0.06, 0.32, '#8a6a48', X, 0.46, z + s * 0.85);
      const m = new Merge(), r = P.rng(Math.round(z * 10 + 300)); for (let i = 0; i < 14; i++) { const x = X - 7.2 + i * 1.1, n = 3 + (r() * 8 | 0); for (let k = 0; k < n; k++) m.box(0.34, 0.012, 0.44, x + (r() - .5) * 0.02, 0.83 + k * 0.014, z - 0.25, k % 5 === 4 ? '#f4f1ea' : '#c08a52', (r() - .5) * 0.1);
        for (let k = 0; k < 2; k++) { m.box(0.22, 0.3, 0.12, x + 0.25 + k * 0.14, 0.97, z + 0.25, '#b97e48'); } m.add(UCY, x - 0.3, 0.86, z + 0.3, PAL[i % PAL.length], 0, 0.06, 0.08, 0.06); } m.build(S); }
    const sh = new Merge(), r = P.rng(303); for (let i = 0; i < 10; i++) for (let k = 0; k < 4; k++) sh.box(0.9, 0.35, 0.4, X - 8 + i * 1.8, 0.3 + k * 0.42, -5.6, k % 2 ? '#c08a52' : '#b0784a'); for (let i = 0; i < 10; i++) sh.box(1.7, 0.04, 0.5, X - 8 + i * 1.8, 0.12, -5.6, '#7a5a44'); sh.build(S);
    sign(S, signC(['WORKSHOP 3', 'PAPER BAGS'], { bg: '#2f4f6f', fg: ['#ffd84a', '#ffffff'], border: 0 }), 2.6, 0.9, X - 3, 2.9, -5.9, 0, { d: 0.03 });
    sign(S, signC(['TODAY\'S GOAL', '500 BAGS'], { bg: '#fffbe9', fg: ['#2b1f1c', '#c0392b'] }), 1.4, 0.8, X + 3, 2.6, -5.9, 0, { d: 0.02 });
    sign(S, signC('HANA ♥', { bg: '#ffe0ea', fg: '#c0392b', size: 0.6 }), 0.42, 0.16, X - 1.1, 0.95, -2.2 + 0.58, 0, { d: 0.02, rx: -0.4 });
    reg('bag', (() => { const g = new THREE.Group(); S.add(g); const a = B(g, 0.3, 0.38, 0.02, '#c08a52', 0, 0.19, 0.06); const b = B(g, 0.3, 0.38, 0.02, '#b97e48', 0, 0.19, -0.06); const s1 = B(g, 0.02, 0.38, 0.12, '#a96e3c', -0.15, 0.19, 0); const s2 = B(g, 0.02, 0.38, 0.12, '#a96e3c', 0.15, 0.19, 0); const h = add(new THREE.TorusGeometry(0.06, 0.008, 5, 12, Math.PI), C('#7a5a44'), 0, 0.38, 0.06, g); g.userData.parts = [a, b, s1, s2, h]; return g; })());
    for (let i = 0; i < 3; i++) { const fan = new THREE.Group(); fan.position.set(X - 6 + i * 6, 3.9, -0.2); S.add(fan); CY(fan, 0.02, 0.02, 0.3, '#888', 0, -0.15, 0, 4); for (let k = 0; k < 3; k++) B(fan, 0.9, 0.02, 0.14, '#c7ccd2', 0, -0.3, 0, { ry: k * 2.094 }); anim.push(['prison', (f) => { fan.rotation.y = f * 0.25 + i; }]); } }
  // ---------- dorm (x 200..210), night ----------
  { const X = 205, g = new THREE.Group(); S.add(g);
    floor(g, 10, 8, M.tatami, X, 0, 0.02); const c = PL(g, 10, 8, C('#d9dfd6'), X, 2.6, 0); c.rotation.x = Math.PI / 2;
    const wM = TM(TX.plain('#d9dfd6', 300, 111), 3, 1); B(g, 10, 2.6, 0.2, wM, X, 1.3, -4.1, { cast: false }); B(g, 0.2, 2.6, 8, wM, X - 5.1, 1.3, 0, { cast: false }); B(g, 0.2, 2.6, 8, wM, X + 5.1, 1.3, 0, { cast: false }); B(g, 10, 2.6, 0.2, wM, X, 1.3, 4.1, { cast: false });
    windowFrame(g, 1.4, 0.9, X + 1.5, 1.9, -4.0, 0, '#9aa7a0', 6); windowFrame(g, 1.4, 0.9, X - 2.5, 1.9, -4.0, 0, '#9aa7a0', 6);
    dormMoon = SP(g, 1.6, BASIC('#fff6d0'), X + 6, 7, -30, { cast: false }); for (let i = 0; i < 30; i++) { const r = P.rng(i + 7); SP(g, 0.08, BASIC('#ffffff'), X - 20 + r() * 40, 3 + r() * 12, -32, { cast: false }); }
    const qcols = ['#5a7ab0', '#b8556a', '#6a9a6a', '#c98a3a', '#7a6ab0'];
    for (let i = 0; i < 5; i++) { const z = -2.8, x = X - 4 + i * 1.9; B(g, 1.0, 0.1, 2.1, '#f4f1ea', x, 0.07, z + 0.95); const q = B(g, 1.04, 0.14, 1.4, futonQuilt(qcols[i]), x, 0.17, z + 1.3); reg('quilt' + i, q); const pw = B(g, 0.6, 0.12, 0.3, '#f4f1ea', x, 0.18, z + 0.15); }
    B(g, 9.6, 0.8, 0.35, '#8a6a48', X, 0.4, 3.8); for (let i = 0; i < 8; i++) B(g, 0.5, 0.3, 0.3, PAL[i % PAL.length], X - 4 + i * 1.1, 0.95, 3.8);
    sign(g, signC(['ROOM 6', 'LIGHTS OUT 9:00'], { bg: '#fffbe9' }), 1.0, 0.5, X - 4.4, 2.0, -3.98, 0, { d: 0.02 });
    // Fumiko's wall: five framed "souvenir" photos (cards sit in the frames) + her nameplate
    for (let i = 0; i < 5; i++) { const fr = new THREE.Group(); fr.position.set(X - 1.0 + i * 0.36, 1.55 + (i % 2) * 0.12, -3.99); g.add(fr); B(fr, 0.3, 0.36, 0.03, '#7a5a44', 0, 0, 0); PL(fr, 0.24, 0.3, C(['#cfe0ea', '#f4e1e4', '#e9e2d6', '#dfe6da', '#ffe7a0'][i]), 0, 0, 0.02); reg('photo' + i, fr); }
    sign(g, signC(['FUMIKO, 89', '5TH VISIT'], { bg: '#fff', fg: ['#2b1f1c', '#c0392b'] }), 0.8, 0.36, X - 0.2, 0.95, -3.99, 0, { d: 0.02 }); }
}

// ---------------- extra handheld props (3D) ----------------
{ const S = SETS.street; const w = new THREE.Group(); S.add(w); sign(w, signC(['WARNING', 'don\'t do it', 'again'], { bg: '#fbf8f0', fg: ['#e2453c', '#2b1f1c', '#2b1f1c'], size: 0.7, w: 384, h: 480 }), 0.3, 0.38, 0, 0, 0, 0, { d: 0.005 }); reg('warnPaper', w); w.visible = false; w.userData.base.v = false;
  const cw = crow(S, 6, 0.14, -4.6, 0); reg('crowWalk', cw); }
for (const set of ['prison', 'apt']) { const S = SETS[set];
  const b = new THREE.Group(); S.add(b); B(b, 0.42, 0.16, 0.3, futonQuilt('#5a7ab0'), 0, 0, 0); B(b, 0.44, 0.04, 0.32, '#f4f1ea', 0, 0.09, 0); reg(set + 'Blanket', b); b.visible = false; b.userData.base.v = false;
  const c = new THREE.Group(); S.add(c); B(c, 0.36, 0.1, 0.28, '#9b7fc4', 0, 0, 0); B(c, 0.36, 0.02, 0.06, '#7d64a8', 0, 0.05, 0.05); B(c, 0.37, 0.07, 0.2, '#7a5a44', 0, -0.08, 0); SP(c, 0.02, '#fff7f2', 0.08, 0.06, 0.1); reg(set + 'Clothes', c); c.visible = false; c.userData.base.v = false;
  const u = new THREE.Group(); S.add(u); const bu = SP(u, 0.16, '#c0392b', 0, 0, 0); bu.scale.set(1.2, 0.8, 0.9); B(u, 0.06, 0.12, 0.06, '#c0392b', 0, 0.14, 0); reg(set + 'Bundle', u); u.visible = false; u.userData.base.v = false; }

// ---------------- cards ----------------
const CW = 1200, CH = 2000, CM = 2.25, U = CM / 1000;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const cardNd = (map) => new THREE.ShaderMaterial({ uniforms: { map: { value: map } }, vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`, side: THREE.DoubleSide });
const blobTex = P.tex(P.radial('20,14,30', 0.5));
class Card {
  constructor() { const c = document.createElement('canvas'); c.width = CW; c.height = CH; this.c = c; this.g = c.getContext('2d');
    this.t = new THREE.CanvasTexture(c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: false });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: false })); this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false; }
  draw(key, fn) { if (key === this.key) return; this.key = key; const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0); fn(g); this.t.needsUpdate = true; }
}
const pools = [[], []];
const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3();
function drawActors(list, layer, O) {
  const pool = pools[layer]; pool.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = pool[i] || (pool[i] = new Card()); c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x + O[0], a.y + O[1], a.z + O[2]); const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    const yaw = a.yaw != null ? a.yaw : Math.atan2(camera.position.x - c.mesh.position.x, camera.position.z - c.mesh.position.z);
    c.mesh.rotation.set(0, yaw, a.roll || 0); c.mat.opacity = a.alpha ?? 1; c.mesh.castShadow = a.shadow !== false; c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false) { c.blob.visible = true; c.blob.position.set(a.x + O[0], (a.ground ?? 0) + O[1] + 0.025, a.z + O[2]); c.blob.scale.set(0.8 * s, 0.5 * s, 1); }
    c.mesh.updateMatrixWorld(true);
    for (const at of a.attach || []) { const o = R[at.id]; if (!o) continue; tmpV.set((at.u[0] - 300) * U, (975 - at.u[1]) * U, at.dz ?? 0.06); c.mesh.localToWorld(tmpV); o.parent.worldToLocal(tmpV); o.position.copy(tmpV); o.rotation.set(at.rx || 0, yaw + (at.ry || 0), at.rz || 0); if (at.s) o.scale.setScalar(at.s); o.visible = true; }
  });
}

// ---------------- 3D FX pool (inked geometry, never flat stickers) ----------------
const starGeo = (() => { const s = new THREE.Shape(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = i % 2 ? 0.38 : 1; (i ? s.lineTo : s.moveTo).call(s, Math.sin(a) * r, Math.cos(a) * r); } s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: false }); g.translate(0, 0, -0.125); return g; })();
const heartGeo = (() => { const s = new THREE.Shape(); s.moveTo(0, -0.9); s.bezierCurveTo(-1.2, -0.1, -0.9, 0.9, 0, 0.35); s.bezierCurveTo(0.9, 0.9, 1.2, -0.1, 0, -0.9); const g = new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: false }); g.translate(0, 0, -0.17); return g; })();
const dropGeo = (() => { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12, a = t * Math.PI; pts.push(new THREE.Vector2(Math.sin(a) * (1 - t) * 0.7 + (t > 0.5 ? 0 : 0), -Math.cos(a) * 0.9 + t * 0.6)); } return new THREE.LatheGeometry(pts, 12); })();
const bangGeo = (() => { const m = new Merge(); m.box(0.35, 1.2, 0.3, 0, 0.35, 0, '#fff'); m.add(USP, 0, -0.55, 0, '#fff', 0, 0.42, 0.42, 0.42); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(m.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(m.n, 3)); g.setIndex(m.i); return g; })();
const FXG = { puff: new THREE.IcosahedronGeometry(1, 1), spark: starGeo, heart: heartGeo, drop: dropGeo, coin: new THREE.CylinderGeometry(1, 1, 0.18, 20), confetti: box(1, 0.6, 0.08), mote: new THREE.SphereGeometry(1, 8, 6), paper: box(1, 1.3, 0.02), leaf: (() => { const g = new THREE.SphereGeometry(1, 10, 6); g.scale(1, 0.15, 0.6); return g; })(), bang: bangGeo, ring: new THREE.TorusGeometry(1, 0.08, 8, 32), note: (() => { const m = new Merge(); m.add(USP, 0, 0, 0, '#fff', 0, 0.7, 0.55, 0.5, 0, 0.5); m.box(0.12, 1.3, 0.12, 0.3, 0.6, 0, '#fff'); m.box(0.5, 0.14, 0.12, 0.5, 1.2, 0, '#fff', 0); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(m.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(m.n, 3)); g.setIndex(m.i); return g; })() };
const fxPool = {}; const fxDefault = { puff: '#f4f1ea', spark: '#ffd84a', heart: '#ff6f91', drop: '#8fd0f5', coin: '#e5c158', confetti: '#e2453c', mote: '#fff3c8', paper: '#fbf8f0', leaf: '#d9822b', bang: '#e2453c', ring: '#ffd84a', note: '#2b1f1c' };
function drawFx(list, O) {
  for (const k in fxPool) fxPool[k].forEach((m) => (m.visible = false));
  const used = {};
  for (const e of list) { const pool = fxPool[e.t] || (fxPool[e.t] = []); const i = used[e.t] = (used[e.t] || 0); used[e.t]++;
    let m = pool[i]; if (!m) { m = new THREE.Mesh(FXG[e.t], C('#ffffff')); m.castShadow = false; m.receiveShadow = false; scene.add(m); pool[i] = m; }
    m.material = C(e.c || fxDefault[e.t]); m.visible = true; m.position.set(e.p[0] + O[0], e.p[1] + O[1], e.p[2] + O[2]); const s = e.s ?? 0.1; Array.isArray(s) ? m.scale.set(...s) : m.scale.setScalar(s);
    if (e.face) { m.quaternion.copy(camera.quaternion); if (e.r) m.rotateZ(e.r[2] || 0); } else m.rotation.set(...(e.r || [0, 0, 0])); m.userData.ndSkip = !!e.noink; }
}

// ---------------- render targets & passes ----------------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const rtOut = [new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }), new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType })];
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const VS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
const ndMat = new THREE.ShaderMaterial({ vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`, side: THREE.DoubleSide });
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 2.5 * SC }, sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.2 }, flash: { value: 0 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: VS,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){ vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.; float e = 0.; float rr = r * clamp(4./d, .55, 1.3);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.; vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o); float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue; if (card) ds = 1e4; vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d)); if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9); }
    return e * (1. - smoothstep(60., 300., d)*.8); }
  void main(){ vec3 c = texture2D(col, vUv).rgb; vec4 ndc = texture2D(nd, vUv); bool isCard = dot(ndc.rgb,ndc.rgb) < .01 && ndc.a > 0.;
    float e = edgeAt(vUv, px); c = mix(c, vec3(.012,.01,.014), e);
    if (!isCard) { float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat); c = c*gain + lift; }
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2; c = mix(c, vec3(1.), flash); gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: VS,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){ float c0 = coc(vUv); if (cinf < .5 || c0 < .6) { gl_FragColor = vec4(texture2D(src, vUv).rgb, 1.); return; }
    vec3 acc = vec3(0.); float wsum = 0.; for (int i=0;i<40;i++){ float fi = float(i); float r = sqrt((fi+.5)/40.); float a = fi*2.39996; vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5); acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = vec4(acc/max(wsum,1e-3), 1.); }` }));
const compU = { a: { value: rtOut[0].texture }, b: { value: rtOut[1].texture }, w: { value: 0 }, blur: { value: new THREE.Vector2(0, 0) } };
const compScene = fs(new THREE.ShaderMaterial({ uniforms: compU, vertexShader: VS,
  fragmentShader: `uniform sampler2D a, b; uniform float w; uniform vec2 blur; varying vec2 vUv;
  vec3 smp(vec2 uv){ vec3 x = texture2D(a, uv).rgb; if (w > 0.) x = mix(x, texture2D(b, uv).rgb, w); return x; }
  void main(){ vec3 c; if (dot(blur,blur) > 1e-7) { c = vec3(0.); for (int i=0;i<14;i++){ float t = float(i)/13. - .5; c += smp(vUv + blur*t); } c /= 14.; } else c = smp(vUv);
    gl_FragColor = linearToOutputTexel(vec4(c,1.)); }` }));
compScene.children[0].material.toneMapped = false;

// ---------------- sky + lights ----------------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP; void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
    float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize)); gl_FragColor = vec4(c,1.); }` }));
sky.userData.sky = true; scene.add(sky);
// painted clouds (far billboards)
const clouds = []; { const r = P.rng(90); for (let i = 0; i < 16; i++) { const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false })); const a = r() * Math.PI * 2, d = 900 + r() * 300; m.userData.a = a; m.userData.d = d; m.userData.h = 140 + r() * 200; m.scale.setScalar(220 + r() * 160); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2; scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);
function applyLight(L) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi; sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar; skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat ?? 1.1; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000'); inkU.vig.value = L.vig ?? 0.2;
}
function placeSun(L, focus) { const az = L.az * D2R, el = L.el * D2R; tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)); skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 60); sun.target.position.copy(focus); const ext = L.shadowExt || 14, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 150; sc.updateProjectionMatrix(); }

// ---------------- per-frame world state ----------------
function worldState(S, f, Wd) {
  for (const k in SETS) SETS[k].visible = k === S.set;
  for (const k in R) { const o = R[k], b = o.userData.base; o.position.copy(b.p); o.rotation.copy(b.r); o.scale.copy(b.s); o.visible = b.v; }
  const fl = Wd.flags || {};
  for (const [name, p] of Object.entries(Wd.props || {})) { const o = R[name]; if (!o) continue; if (p.p) o.position.set(...p.p); if (p.r) o.rotation.set(...p.r); if (p.s != null) Array.isArray(p.s) ? o.scale.set(...p.s) : o.scale.setScalar(p.s); if (p.v != null) o.visible = p.v; }
  for (const [set, fn] of anim) if (!set || set === S.set) fn(f, fl);
  // apartment state
  aptPlant.visible = !fl.dusty; aptPlantWilt.visible = !!fl.dusty;
  if (S.set === 'apt') { const g = tvCtx, t = f / 30; g.fillStyle = fl.tvOff ? '#1a1d24' : `hsl(${(t * 40) % 360},70%,55%)`; g.fillRect(0, 0, 256, 160); if (!fl.tvOff) { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ffd84a' : '#ff6f91'; g.beginPath(); g.moveTo(128, 200); g.arc(128, 200, 260, -Math.PI + i * 0.4 + t * 0.6, -Math.PI + i * 0.4 + 0.2 + t * 0.6); g.fill(); } g.fillStyle = '#2b1f1c'; g.fillRect(0, 128, 256, 32); g.fillStyle = '#fff'; g.font = '22px "Lilita One"'; g.fillText('QUIZ TIME!  ★ ★ ★', 10 - (t * 60) % 300 + 120, 152); } tvScreenTex.needsUpdate = true; }
  // whole-scene clouds drift
  for (const c of clouds) { const a = c.userData.a + f * 0.00012; c.position.set(camera.position.x + Math.cos(a) * c.userData.d, c.userData.h, camera.position.z + Math.sin(a) * c.userData.d); c.quaternion.copy(camera.quaternion); }
}
const swapForNd = (on) => { scene.traverse((o) => { if (!o.isMesh) return; if (on) { o.userData.mat0 = o.material; if (o.userData.ndSkip || o.userData.sky || (o.parent && o.parent.userData.ndSkip)) { o.userData.vis0 = o.visible; o.visible = false; return; } o.material = o.userData.nd || ndMat; } else { o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; } } }); };

function renderLayer(S, f, idx) {
  const O = ORIGIN[S.set], L = ST.lightFor(S, f), Cm = ST.camAt(S, f);
  applyLight(L);
  camera.position.set(Cm.pos[0] + O[0], Cm.pos[1] + O[1], Cm.pos[2] + O[2]); camera.up.set(0, 1, 0); camera.lookAt(Cm.look[0] + O[0], Cm.look[1] + O[1], Cm.look[2] + O[2]); camera.rotateZ((Cm.roll || 0) * D2R);
  camera.fov = Cm.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  sky.position.copy(camera.position);
  worldState(S, f, ST.worldAt(S, f));
  const focusP = Cm.shadowAt || Cm.look; placeSun(L, tmpV2.set(focusP[0] + O[0], focusP[1] + O[1], focusP[2] + O[2]));
  drawActors(ST.actorsAt(S, f, T), idx, O);
  drawFx(ST.fxAt(S, f), O);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  inkU.flash.value = Cm.flash || 0; renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  const D = ST.dofAt(S, f, Cm); dofU.focus.value = D.focus; dofU.cinf.value = D.cinf * SC; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(rtOut[idx]); renderer.render(dofScene, fsCam);
  return Cm;
}
window.renderFrame = (f) => {
  const layers = ST.layersAt(f);
  let blur = [0, 0];
  layers.forEach((ly, i) => { const Cm = renderLayer(ly.S, f, i); if (Cm.blur) blur = Cm.blur; });
  compU.w.value = layers.length > 1 ? layers[1].w : 0; compU.blur.value.set(blur[0], blur[1]);
  renderer.setRenderTarget(null); renderer.render(compScene, fsCam);
  return true;
};
window.TOTAL = ST.TOTAL; window.ready = true;
