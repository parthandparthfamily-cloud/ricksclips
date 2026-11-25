// 3D kit: painted canvas textures, toon materials, inked prop builders, signs, and the pooled 3D FX.
import * as THREE from './lib/three.module.js';
export { rng, tex, radial, plaster, dirt, grass, stone, roof, planks, beam } from './paint.js';
import { rng, tex } from './paint.js';

export const loadFonts = async () => { try { const f = new FontFace('Lilita', 'url(fonts/LilitaOne.ttf)'); await f.load(); document.fonts.add(f); } catch (e) { console.log('font', e.message); } };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([120, 120, 120, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const mcache = new Map();
export const toon = (color, opts = {}) => { const k = color + JSON.stringify(opts); if (!opts.map && mcache.has(k)) return mcache.get(k); const m = new THREE.MeshToonMaterial({ gradientMap: grad, color, ...opts }); if (!opts.map) mcache.set(k, m); return m; };
export const texM = (c, rx = 1, ry = 1, color = '#ffffff', extra = {}) => toon(color, { map: tex(c, rx, ry), ...extra });
export const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });

// ---------- textures ----------
export function tiles(c1 = '#e9e4da', c2 = '#d8d2c6', n = 4, grout = '#b9b2a6', sheen = true) {
  const [c, g] = cv(512, 512), s = 512 / n, r = rng(11);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? c1 : c2; g.fillRect(i * s, j * s, s, s); }
  g.strokeStyle = grout; g.lineWidth = 4; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); }
  if (sheen) for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(255,255,255,.16)'; g.save(); g.translate(r() * 512, r() * 512); g.rotate(-0.7); g.fillRect(-60, -4, 120, 8); g.restore(); }
  return c;
}
export function sand(seed = 21, base = '#e9c98c') {
  const [c, g] = cv(512, 512), r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26; i++) { g.strokeStyle = 'rgba(190,140,80,.35)'; g.lineWidth = 3; g.beginPath(); const y = r() * 512; g.moveTo(0, y); g.bezierCurveTo(170, y + r() * 30 - 15, 340, y + r() * 30 - 15, 512, y); g.stroke(); }
  for (let i = 0; i < 900; i++) { g.fillStyle = ['rgba(160,110,60,.45)', 'rgba(255,240,200,.5)', 'rgba(120,90,60,.4)'][i % 3]; g.fillRect(r() * 512, r() * 512, 2 + r() * 2, 2); }
  for (let i = 0; i < 18; i++) { g.fillStyle = hsl(30, 20, 50 + r() * 20); g.beginPath(); g.ellipse(r() * 512, r() * 512, 4 + r() * 6, 3 + r() * 4, r() * 3, 0, 7); g.fill(); g.strokeStyle = '#5a4430'; g.lineWidth = 1.5; g.stroke(); }
  return c;
}
export function concrete(seed = 22, base = [210, 6, 70]) {
  const [c, g] = cv(512, 512), r = rng(seed); g.fillStyle = hsl(...base); g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 200; i++) { g.fillStyle = hsl(base[0], base[1], base[2] - 8 + r() * 14, .35); g.beginPath(); g.ellipse(r() * 512, r() * 512, 4 + r() * 22, 3 + r() * 12, r() * 3, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(60,60,70,.55)'; g.lineWidth = 3; g.strokeRect(2, 2, 508, 508);
  for (let i = 0; i < 5; i++) { g.strokeStyle = 'rgba(60,60,70,.4)'; g.lineWidth = 1.5; g.beginPath(); let x = r() * 512, y = r() * 512; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += r() * 30 - 15; y += r() * 30 - 15; g.lineTo(x, y); } g.stroke(); }
  return c;
}
export function towerGlass(hue = 200, seed = 1, cols = 6, rows = 12) {
  const [c, g] = cv(256, 512), r = rng(seed);
  const gr = g.createLinearGradient(0, 0, 256, 512); gr.addColorStop(0, hsl(hue, 55, 72)); gr.addColorStop(0.5, hsl(hue, 50, 52)); gr.addColorStop(1, hsl(hue + 10, 45, 40)); g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(255,255,255,.22)'; g.save(); g.translate(r() * 256, r() * 512); g.rotate(-0.6); g.fillRect(-200, -10 - r() * 14, 400, 12 + r() * 20); g.restore(); }
  g.strokeStyle = hsl(hue, 30, 28); g.lineWidth = 3;
  for (let i = 0; i <= cols; i++) { g.beginPath(); g.moveTo(i * 256 / cols, 0); g.lineTo(i * 256 / cols, 512); g.stroke(); }
  for (let j = 0; j <= rows; j++) { g.beginPath(); g.moveTo(0, j * 512 / rows); g.lineTo(256, j * 512 / rows); g.stroke(); }
  for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(255,240,180,.55)'; const cx = (r() * cols) | 0, cy = (r() * rows) | 0; g.fillRect(cx * 256 / cols + 3, cy * 512 / rows + 3, 256 / cols - 6, 512 / rows - 6); }
  return c;
}
export function stripes(a = '#e9eef5', b = '#7fa6d8', n = 8, vertical = true) {
  const [c, g] = cv(256, 256); for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? a : b; if (vertical) g.fillRect(i * 256 / n, 0, 256 / n, 256); else g.fillRect(0, i * 256 / n, 256, 256 / n); } return c;
}
export function wood(seed = 31, h = 28, l = 42) {
  const [c, g] = cv(256, 256), r = rng(seed); g.fillStyle = hsl(h, 45, l); g.fillRect(0, 0, 256, 256);
  for (let k = 0; k < 30; k++) { g.strokeStyle = hsl(h - 3, 45, l - 8 - r() * 8, .5); g.lineWidth = 1 + r() * 2.5; g.beginPath(); const y = r() * 256; g.moveTo(0, y); g.bezierCurveTo(85, y + r() * 10 - 5, 170, y + r() * 10 - 5, 256, y + r() * 6 - 3); g.stroke(); }
  for (let k = 0; k < 3; k++) { g.strokeStyle = hsl(h - 4, 45, l - 14, .7); g.lineWidth = 2; g.beginPath(); g.ellipse(r() * 256, r() * 256, 10, 4, 0, 0, 7); g.stroke(); }
  return c;
}
export function carpet(c1 = '#7a2e3a', c2 = '#e2b85c') {
  const [c, g] = cv(256, 256); g.fillStyle = c1; g.fillRect(0, 0, 256, 256); g.strokeStyle = c2; g.lineWidth = 6;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.moveTo(i * 64 + 32, j * 64 + 8); g.lineTo(i * 64 + 56, j * 64 + 32); g.lineTo(i * 64 + 32, j * 64 + 56); g.lineTo(i * 64 + 8, j * 64 + 32); g.closePath(); g.stroke(); }
  return c;
}
export function wallpaper(base = '#cfe3d2', dot = '#9cc4a6') {
  const [c, g] = cv(256, 256); g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = dot; g.beginPath(); g.ellipse(i * 32 + (j % 2) * 16 + 8, j * 32 + 16, 5, 8, 0, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, 0, 4, 256); return c;
}
export function corrugated(base = '#c9d3dc') {
  const [c, g] = cv(256, 256); for (let i = 0; i < 16; i++) { const gr = g.createLinearGradient(i * 16, 0, i * 16 + 16, 0); gr.addColorStop(0, base); gr.addColorStop(0.5, '#ffffff'); gr.addColorStop(1, '#8a96a2'); g.fillStyle = gr; g.fillRect(i * 16, 0, 16, 256); } return c;
}
export function fence() {
  const [c, g] = cv(256, 256); g.clearRect(0, 0, 256, 256); g.strokeStyle = '#9aa3ab'; g.lineWidth = 3;
  for (let i = -8; i < 16; i++) { g.beginPath(); g.moveTo(i * 24, 0); g.lineTo(i * 24 + 256, 256); g.moveTo(i * 24 + 256, 0); g.lineTo(i * 24, 256); g.stroke(); } return c;
}
export function bill(val = '100', col = '#7fbf6a') {
  const [c, g] = cv(256, 128); g.fillStyle = col; g.fillRect(0, 0, 256, 128); g.strokeStyle = '#2e5a2a'; g.lineWidth = 8; g.strokeRect(8, 8, 240, 112);
  g.fillStyle = '#e8f5d8'; g.beginPath(); g.ellipse(128, 64, 34, 40, 0, 0, 7); g.fill(); g.fillStyle = '#2e5a2a'; g.font = '46px Lilita'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(val, 128, 66);
  g.font = '28px Lilita'; g.fillText(val, 40, 34); g.fillText(val, 216, 98); return c;
}
export function passportTex(col = '#7a1f2e') {
  const [c, g] = cv(256, 360); g.fillStyle = col; g.fillRect(0, 0, 256, 360); g.strokeStyle = '#e5c158'; g.lineWidth = 6; g.strokeRect(14, 14, 228, 332);
  g.beginPath(); g.arc(128, 170, 52, 0, 7); g.stroke(); g.beginPath(); g.arc(128, 170, 30, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = i * 0.785; g.beginPath(); g.moveTo(128 + Math.cos(a) * 30, 170 + Math.sin(a) * 30); g.lineTo(128 + Math.cos(a) * 52, 170 + Math.sin(a) * 52); g.stroke(); }
  g.fillStyle = '#e5c158'; g.font = '40px Lilita'; g.textAlign = 'center'; g.fillText('PASSPORT', 128, 290); return c;
}
/** sign face: auto-fit text lines on a coloured board */
export function signTex(lines, { bg = '#1f6f8b', fg = '#ffffff', w = 1024, h = 256, border = '#f2c14e', font = 'Lilita', stroke = null } = {}) {
  const [c, g] = cv(w, h); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (border) { g.strokeStyle = border; g.lineWidth = h * 0.06; g.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1); }
  const L = Array.isArray(lines) ? lines : [lines]; g.textAlign = 'center'; g.textBaseline = 'middle';
  L.forEach((t, i) => { let sz = (h * 0.72) / L.length; g.font = `${sz}px ${font}`; while (g.measureText(t).width > w * 0.86 && sz > 8) { sz -= 2; g.font = `${sz}px ${font}`; }
    const y = h * (i + 0.55) / L.length; if (stroke) { g.strokeStyle = stroke; g.lineWidth = sz * 0.12; g.strokeText(t, w / 2, y); } g.fillStyle = fg; g.fillText(t, w / 2, y); });
  return c;
}
export function boardTex(rows, { title = 'ARRIVALS', bg = '#151a26', fg = '#ffd23f', w = 1024, h = 512 } = {}) {
  const [c, g] = cv(w, h); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = '#2b6fb0'; g.fillRect(0, 0, w, 80); g.fillStyle = '#fff'; g.font = '60px Lilita'; g.textBaseline = 'middle'; g.fillText(title, 30, 42);
  rows.forEach((r, i) => { const y = 120 + i * 58; g.fillStyle = i % 2 ? '#1b2131' : '#20283a'; g.fillRect(0, y - 26, w, 54); g.font = '40px Lilita'; g.fillStyle = fg; r.forEach((t, k) => g.fillText(t, [30, 220, 600, 820][k], y)); });
  return c;
}

// ---------- geometry helpers ----------
export const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
export const tbox = (w, h, d, t = 2) => { const g = box(w, h, d), uv = g.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); } return g; };
export const cyl = (r0, r1, h, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);
export const sph = (r, a = 16, b = 12) => new THREE.SphereGeometry(r, a, b);
export const add = (parent, geo, mat, x = 0, y = 0, z = 0, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast ?? true; m.receiveShadow = true; if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz; if (o.s) m.scale.set(...(Array.isArray(o.s) ? o.s : [o.s, o.s, o.s])); parent.add(m); return m; };
export const grp = (parent, x = 0, y = 0, z = 0, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };

/** a sign board: 3D frame + painted face. Faces +z of the group. */
export function sign(parent, lines, x, y, z, w, h, opts = {}, ry = 0) {
  const g = grp(parent, x, y, z, ry);
  add(g, tbox(w + 0.12, h + 0.12, opts.depth ?? 0.08), toon(opts.frame ?? '#3a2a22'), 0, 0, 0);
  const face = add(g, new THREE.PlaneGeometry(w, h), new THREE.MeshToonMaterial({ gradientMap: grad, map: tex(signTex(lines, { ...opts, w: 1024, h: Math.round(1024 * h / w) })) }), 0, 0, (opts.depth ?? 0.08) / 2 + 0.004, { cast: false });
  g.userData.face = face; return g;
}
/** palm tree: segmented trunk + drooping fronds (inked 3D) */
export function palm(parent, x, z, h = 6, seed = 1, y = 0) {
  const g = grp(parent, x, y, z), r = rng(seed); const trunk = toon('#9a7048'), ring = toon('#7a5434'), leaf = toon('#4f9a3c'), leaf2 = toon('#3f8a34');
  let px = 0, py = 0; const lean = (r() - 0.5) * 0.25;
  for (let i = 0; i < 9; i++) { const s = add(g, cyl(0.17 - i * 0.008, 0.2 - i * 0.008, h / 9, 10), i % 2 ? trunk : ring, px, py + h / 18, 0); s.rotation.z = lean; px += Math.sin(lean) * -h / 9; py += Math.cos(lean) * h / 9; }
  const crown = grp(g, px, py, 0); g.userData.crown = crown;
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + r(); const fg = grp(crown, 0, 0, 0, a); const f = add(fg, sph(1, 10, 6), i % 2 ? leaf : leaf2, 1.2, -0.25, 0, { s: [1.4, 0.12, 0.38] }); f.rotation.z = -0.45; fg.userData.base = -0.45; }
  for (let i = 0; i < 4; i++) add(crown, sph(0.13, 8, 6), toon('#6a4a2a'), Math.cos(i * 1.6) * 0.2, -0.15, Math.sin(i * 1.6) * 0.2);
  return g;
}
export const swayPalm = (p, f, k = 1) => { const c = p.userData.crown; if (!c) return; c.rotation.z = 0.04 * k * Math.sin(f * 0.05 + p.position.x); c.rotation.x = 0.03 * k * Math.sin(f * 0.043 + p.position.z); };
export function planter(parent, x, z, rad = 0.8, col = '#d9d2c4') { const g = grp(parent, x, 0, z); add(g, cyl(rad, rad * 0.85, 0.7, 20), toon(col), 0, 0.35, 0); add(g, cyl(rad * 0.92, rad * 0.92, 0.06, 20), toon('#6a4a2e'), 0, 0.69, 0); return g; }
export function suitcase(parent, x, y, z, col = '#d94a4a', s = 1) { const g = grp(parent, x, y, z); add(g, tbox(0.42 * s, 0.6 * s, 0.24 * s, 1), toon(col), 0, 0.3 * s, 0); add(g, tbox(0.44 * s, 0.05 * s, 0.26 * s, 1), toon('#2b2b33'), 0, 0.42 * s, 0); add(g, tbox(0.06 * s, 0.22 * s, 0.04 * s, 1), toon('#2b2b33'), 0, 0.71 * s, 0); for (const sx of [-1, 1]) add(g, cyl(0.04 * s, 0.04 * s, 0.03 * s, 8), toon('#222'), sx * 0.15 * s, 0.03 * s, 0.1 * s, { rx: Math.PI / 2, rz: Math.PI / 2 }); return g; }
export function bench(parent, x, z, ry = 0, col = '#3f6fb0') { const g = grp(parent, x, 0, z, ry); for (let i = -1; i <= 1; i++) { add(g, tbox(0.5, 0.08, 0.5, 1), toon(col), i * 0.55, 0.45, 0); add(g, tbox(0.5, 0.5, 0.08, 1), toon(col), i * 0.55, 0.72, -0.24); } add(g, tbox(1.8, 0.06, 0.06, 1), toon('#9aa3ab'), 0, 0.4, 0); for (const s of [-1, 1]) add(g, tbox(0.06, 0.4, 0.4, 1), toon('#9aa3ab'), s * 0.8, 0.2, 0); return g; }
export function clock(parent, x, y, z, r = 0.35, ry = 0) { const g = grp(parent, x, y, z, ry); add(g, cyl(r, r, 0.08, 32), toon('#d23b3b'), 0, 0, 0, { rx: Math.PI / 2 }); add(g, cyl(r * 0.86, r * 0.86, 0.09, 32), toon('#ffffff'), 0, 0, 0.005, { rx: Math.PI / 2 });
  for (let i = 0; i < 12; i++) add(g, tbox(0.02, r * 0.14, 0.02, 1), toon('#222'), Math.sin(i * 0.5236) * r * 0.72, Math.cos(i * 0.5236) * r * 0.72, 0.05, { rz: -i * 0.5236 });
  const hands = [0.5, 0.75, 0.85].map((L, i) => { const h = grp(g, 0, 0, 0.06 + i * 0.01); add(h, tbox(i === 2 ? 0.012 : 0.03, r * L, 0.012, 1), toon(i === 2 ? '#d23b3b' : '#222'), 0, r * L / 2 - 0.02, 0); return h; });
  g.userData.hands = hands; return g; }
export const tickClock = (c, f, speed = 1) => { const h = c.userData.hands; const s = f / 30 * speed; h[2].rotation.z = -s * Math.PI / 30 * 6; h[1].rotation.z = -s * Math.PI / 1800 * 60 - 1; h[0].rotation.z = -s * Math.PI / 21600 * 60 - 2; };
export function plant(parent, x, y, z, s = 1, col = '#4f9a3c') { const g = grp(parent, x, y, z); add(g, cyl(0.18 * s, 0.14 * s, 0.3 * s, 14), toon('#c8643a'), 0, 0.15 * s, 0); for (let i = 0; i < 6; i++) { const a = i * 1.05; add(g, sph(0.22 * s, 10, 6), toon(i % 2 ? col : '#3f8a34'), Math.cos(a) * 0.12 * s, 0.42 * s + (i % 3) * 0.08 * s, Math.sin(a) * 0.12 * s, { s: [0.6, 1.3, 0.6] }).rotation.z = Math.cos(a) * 0.5; } return g; }
export function fanBlades(parent, x, y, z, r = 0.6) { const g = grp(parent, x, y, z); add(g, cyl(0.03, 0.03, 0.4, 8), toon('#e6e6e6'), 0, 0.2, 0); add(g, cyl(0.12, 0.1, 0.12, 14), toon('#e6e6e6'), 0, 0, 0); const rot = grp(g, 0, -0.04, 0); for (let i = 0; i < 4; i++) add(rot, tbox(r, 0.02, 0.14, 1), toon('#b48a5a'), Math.cos(i * 1.5708) * r / 2, 0, Math.sin(i * 1.5708) * r / 2, { ry: -i * 1.5708 }); g.userData.rot = rot; return g; }
export function car(parent, x, z, ry = 0, col = '#f2f4f7', police = false) { const g = grp(parent, x, 0, z, ry);
  add(g, tbox(1.8, 0.6, 4.2, 2), toon(col), 0, 0.55, 0); add(g, tbox(1.6, 0.55, 2.2, 2), toon(col), 0, 1.1, -0.2); add(g, tbox(1.62, 0.42, 2.0, 2), toon('#2b3a52'), 0, 1.12, -0.2, { s: [1, 1, 1] });
  for (const sx of [-1, 1]) for (const sz of [-1.35, 1.35]) add(g, cyl(0.36, 0.36, 0.28, 16), toon('#22242a'), sx * 0.86, 0.36, sz, { rz: Math.PI / 2 });
  for (const sx of [-1, 1]) add(g, tbox(0.3, 0.14, 0.05, 1), toon('#fff6c8'), sx * 0.6, 0.62, 2.11);
  if (police) { add(g, tbox(1.82, 0.16, 4.22, 2), toon('#1f4fa8'), 0, 0.62, 0); const bar = grp(g, 0, 1.45, -0.2); const red = add(bar, tbox(0.4, 0.14, 0.24, 1), basic('#ff3a3a'), -0.25, 0, 0); const blue = add(bar, tbox(0.4, 0.14, 0.24, 1), basic('#3a7aff'), 0.25, 0, 0); g.userData.lights = [red, blue]; }
  return g; }
export function tower(parent, x, z, w, d, h, hue, seed, top = 0) { const g = grp(parent, x, 0, z); const m = texM(towerGlass(hue, seed), Math.max(1, Math.round(w / 6)), Math.max(1, Math.round(h / 24)));
  add(g, box(w, h, d), m, 0, h / 2, 0, { cast: false }); add(g, box(w * 1.04, 0.6, d * 1.04), toon('#e9edf2'), 0, h + 0.3, 0, { cast: false });
  if (top === 1) add(g, new THREE.ConeGeometry(Math.min(w, d) * 0.45, h * 0.25, 4), toon('#dfe6ee'), 0, h + h * 0.125, 0, { cast: false, ry: Math.PI / 4 });
  if (top === 2) add(g, cyl(0.2, 0.3, h * 0.3, 6), toon('#cfd6de'), 0, h + h * 0.15, 0, { cast: false });
  if (top === 3) { add(g, cyl(w * 0.4, w * 0.5, h * 0.12, 20), m, 0, h + h * 0.06, 0, { cast: false }); add(g, cyl(0.12, 0.2, h * 0.25, 6), toon('#cfd6de'), 0, h + h * 0.24, 0, { cast: false }); }
  return g; }
export function chicken(parent, x, z, col = '#ffffff') { const g = grp(parent, x, 0, z); const body = grp(g, 0, 0.22, 0); add(body, sph(0.16, 12, 10), toon(col), 0, 0, 0, { s: [1.3, 1, 1] }); add(body, sph(0.09, 10, 8), toon(col), 0.17, 0.12, 0); add(body, new THREE.ConeGeometry(0.03, 0.08, 6), toon('#f2a12e'), 0.27, 0.12, 0, { rz: -Math.PI / 2 }); add(body, sph(0.035, 8, 6), toon('#d93a3a'), 0.17, 0.22, 0); add(body, sph(0.12, 10, 8), toon(col), -0.2, 0.06, 0, { s: [0.6, 1.2, 0.8] }); for (const s of [-1, 1]) add(g, cyl(0.012, 0.012, 0.14, 5), toon('#f2a12e'), 0, 0.07, s * 0.06); g.userData.body = body; return g; }
export function goat(parent, x, z, col = '#f1ece0') { const g = grp(parent, x, 0, z); const b = add(g, sph(0.3, 14, 10), toon(col), 0, 0.62, 0, { s: [1.5, 0.95, 0.9] }); for (const sx of [-0.3, 0.3]) for (const sz of [-0.12, 0.12]) add(g, cyl(0.04, 0.035, 0.45, 6), toon('#6a4a32'), sx, 0.22, sz);
  const head = grp(g, 0.45, 0.86, 0); add(head, sph(0.15, 12, 10), toon(col), 0.06, 0, 0, { s: [1.3, 1, 0.9] }); for (const s of [-1, 1]) add(head, new THREE.ConeGeometry(0.03, 0.18, 6), toon('#8a7a62'), -0.02, 0.15, s * 0.06, { rz: 0.5 }); add(head, sph(0.02, 6, 4), toon('#222'), 0.16, 0.04, 0.09); add(head, sph(0.02, 6, 4), toon('#222'), 0.16, 0.04, -0.09); add(head, new THREE.ConeGeometry(0.035, 0.12, 6), toon('#bdb6a4'), 0.14, -0.14, 0, { rx: Math.PI }); g.userData.head = head; return g; }

// ---------- 3D FX pool ----------
const paperOf = (lines, ink, w, h) => { const g = new THREE.Group(); const c = signTex(lines, { bg: '#fbf8ef', fg: ink, border: ink, w: 256, h: Math.round(256 * h / w) }); const pm = toon('#fbf8ef'); g.add(new THREE.Mesh(box(w, 0.004, h), [pm, pm, toon('#ffffff', { map: tex(c) }), pm, pm, pm])); return g; };
// fx spec: { k: kind, p:[x,y,z], r:[rx,ry,rz], s:number|[sx,sy,sz], c: colour?, a: opacity? }
export function makeFxPool(THREE_, scene) {
  const proto = {
    note: () => { const g = new THREE.Group(); const m = new THREE.Mesh(box(0.32, 0.005, 0.15), [toon('#5f9a4a'), toon('#5f9a4a'), toon('#ffffff', { map: tex(bill()) }), toon('#ffffff', { map: tex(bill()) }), toon('#5f9a4a'), toon('#5f9a4a')]); g.add(m); return g; },
    spark: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), basic('#ffe066'))); const m2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), basic('#fff6c8')); m2.scale.set(0.35, 1.9, 0.35); g.add(m2); const m3 = m2.clone(); m3.rotation.z = Math.PI / 2; g.add(m3); return g; },
    puff: () => { const g = new THREE.Group(); const r = rng(5); for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(sph(0.22 + r() * 0.12, 12, 8), toon('#f4efe6')); m.position.set(r() * 0.4 - 0.2, r() * 0.25, r() * 0.4 - 0.2); g.add(m); } return g; },
    smoke: () => { const g = new THREE.Group(); const r = rng(9); for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(sph(0.3 + r() * 0.15, 12, 8), toon('#d9d6d2')); m.position.set(r() * 0.5 - 0.25, r() * 0.3, r() * 0.5 - 0.25); g.add(m); } return g; },
    confetti: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(box(0.06, 0.004, 0.1), toon('#ff5d8f'))); return g; },
    paper: () => { const g = new THREE.Group(); const c = document.createElement('canvas'); c.width = 128; c.height = 180; const x = c.getContext('2d'); x.fillStyle = '#fbf8ef'; x.fillRect(0, 0, 128, 180); x.fillStyle = '#9aa0ab'; for (let i = 0; i < 9; i++) x.fillRect(14, 24 + i * 16, 100 - (i % 3) * 14, 5); g.add(new THREE.Mesh(box(0.21, 0.004, 0.297), [toon('#fbf8ef'), toon('#fbf8ef'), toon('#ffffff', { map: tex(c) }), toon('#fbf8ef'), toon('#fbf8ef'), toon('#fbf8ef')])); return g; },
    drop: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(sph(0.03, 10, 8), toon('#7cc8f2'))); const c = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 10), toon('#7cc8f2')); c.position.y = 0.04; g.add(c); return g; },
    fly: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(sph(0.025, 8, 6), toon('#222222'))); for (const s of [-1, 1]) { const w = new THREE.Mesh(sph(0.03, 8, 4), toon('#dfefff')); w.scale.set(1, 0.15, 0.5); w.position.set(0, 0.02, s * 0.03); g.add(w); } return g; },
    coin: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(cyl(0.06, 0.06, 0.012, 20), toon('#f2c14e'))); return g; },
    mote: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(sph(0.012, 6, 4), basic('#fff3d0'))); return g; },
    contract: () => paperOf(['CONTRACT', 'DREAM JOB', '$$$  TAX FREE', '_______'], '#c0392b', 0.21, 0.297),
    payslip: () => paperOf(['SALARY  2000', 'TAX:  0', 'HOUSING: FREE'], '#2f6a3a', 0.24, 0.17),
    passport: () => { const g = new THREE.Group(); const m = toon('#7a1f2e'); g.add(new THREE.Mesh(box(0.13, 0.018, 0.18), [m, m, toon('#ffffff', { map: tex(passportTex()) }), m, m, m])); return g; },
    phone: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(box(0.075, 0.15, 0.012), toon('#22232b'))); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.062, 0.13), basic('#7cc4ff')); s.position.z = 0.007; g.add(s); return g; },
    key: () => { const g = new THREE.Group(); const k = toon('#f2c14e'); g.add(new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 8, 16), k)); const sh = new THREE.Mesh(box(0.012, 0.09, 0.012), k); sh.position.y = -0.08; g.add(sh); const t = new THREE.Mesh(box(0.03, 0.012, 0.012), k); t.position.set(0.015, -0.11, 0); g.add(t); const tag = new THREE.Mesh(box(0.06, 0.04, 0.005), toon('#d6403a')); tag.position.set(0.0, 0.07, 0); g.add(tag); return g; },
    bricks: () => { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(box(0.24, 0.07, 0.12), toon(i % 2 ? '#c45a3a' : '#b04a30')); b.position.y = i * 0.075; g.add(b); } return g; },
    duffel: () => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.35, 6, 12), toon('#3f6fb0')); b.rotation.z = Math.PI / 2; g.add(b); const st = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 6, 16, Math.PI), toon('#1d2a3a')); st.position.y = 0.12; g.add(st); return g; },
    bag: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(box(0.22, 0.26, 0.09), toon('#d2337a'))); const h = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 6, 12, Math.PI), toon('#2b2f3a')); h.position.y = 0.13; g.add(h); return g; },
    board: () => { const g = new THREE.Group(); const c = signTex(['WELCOME', 'MY FRIEND!'], { bg: '#ffffff', fg: '#d6403a', border: '#1f8f9a', w: 512, h: 300 }); g.add(new THREE.Mesh(box(0.6, 0.35, 0.02), [toon('#c9b48a'), toon('#c9b48a'), toon('#c9b48a'), toon('#c9b48a'), toon('#ffffff', { map: tex(c) }), toon('#c9b48a')])); const st = new THREE.Mesh(box(0.025, 0.4, 0.02), toon('#8a5a3a')); st.position.set(0, -0.3, -0.02); g.add(st); return g; },
    stamp: () => { const g = new THREE.Group(); const b = new THREE.Mesh(box(0.1, 0.04, 0.07), toon('#c0392b')); g.add(b); const h = new THREE.Mesh(cyl(0.02, 0.025, 0.08, 10), toon('#3a2a22')); h.position.y = 0.06; g.add(h); const k = new THREE.Mesh(sph(0.03, 10, 8), toon('#3a2a22')); k.position.y = 0.11; g.add(k); return g; },
    case: () => { const g = new THREE.Group(); const b = new THREE.Mesh(box(0.38, 0.55, 0.22), toon('#d94a4a')); b.position.y = 0.3; g.add(b); const h = new THREE.Mesh(box(0.05, 0.35, 0.03), toon('#2b2b33')); h.position.y = 0.72; g.add(h); return g; },
    zz: () => { const g = new THREE.Group(); const m = toon('#ffffff'); for (const [x, y, rz] of [[0, 0.05, 0], [0.012, 0, -0.95], [0, -0.05, 0]]) { const b = new THREE.Mesh(box(rz ? 0.12 : 0.09, 0.022, 0.022), m); b.position.set(x, y, 0); b.rotation.z = rz; g.add(b); } return g; },
    heart: () => { const g = new THREE.Group(); const m = toon('#ff5d8f'); for (const s of [-1, 1]) { const b = new THREE.Mesh(sph(0.05, 10, 8), m); b.position.set(s * 0.035, 0.02, 0); g.add(b); } const c = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.09, 12), m); c.rotation.z = Math.PI; c.position.y = -0.035; g.add(c); return g; },
    star: () => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), toon('#ffd23f')); m.scale.set(1, 1, 0.4); g.add(m); return g; },
  };
  const pools = {}; const used = {};
  const get = (k) => { pools[k] = pools[k] || []; used[k] = used[k] || 0; let o = pools[k][used[k]]; if (!o) { o = proto[k](); o.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; } }); scene.add(o); pools[k].push(o); } used[k]++; return o; };
  return {
    place(list, cam) {
      for (const k in pools) { pools[k].forEach((o) => (o.visible = false)); used[k] = 0; }
      for (const s of list) {
        const o = get(s.k); o.visible = true; o.position.set(...s.p);
        if (s.face) { o.quaternion.copy(cam.quaternion); if (s.flat) o.rotateX(Math.PI / 2); if (s.r) { o.rotateX(s.r[0]); o.rotateY(s.r[1]); o.rotateZ(s.r[2]); } } else o.rotation.set(...(s.r || [0, 0, 0]));
        const sc = s.s ?? 1; Array.isArray(sc) ? o.scale.set(...sc) : o.scale.setScalar(sc);
        if (s.c) o.traverse((m) => { if (m.isMesh && !Array.isArray(m.material)) { if (!m.userData.own) { m.material = m.material.clone(); m.userData.own = true; } m.material.color.set(s.c); } });
      }
    },
  };
}
