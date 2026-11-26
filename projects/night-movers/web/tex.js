// Painted textures for NIGHT MOVERS (Canvas2D, deterministic).
import { rng } from './paint.js';
export const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
const blot = (g, r, w, h, n, col, rad = [4, 20]) => { for (let i = 0; i < n; i++) { g.fillStyle = typeof col === 'function' ? col() : col; g.beginPath(); g.ellipse(r() * w, r() * h, rad[0] + r() * rad[1], rad[0] + r() * rad[1] * 0.6, r() * 3, 0, 7); g.fill(); } };

export function tatami(seed = 1) {
  const [c, g] = cv(512, 1024), r = rng(seed);
  g.fillStyle = '#c8c27a'; g.fillRect(0, 0, 512, 1024);
  for (let y = 0; y < 1024; y += 6) { g.fillStyle = hsl(56 + r() * 6, 38, 58 + r() * 10, 0.7); g.fillRect(0, y, 512, 3); }
  for (let i = 0; i < 40; i++) { g.strokeStyle = hsl(50, 30, 45, 0.25); g.lineWidth = 1; g.beginPath(); const x = r() * 512; g.moveTo(x, 0); g.lineTo(x + r() * 8, 1024); g.stroke(); }
  g.fillStyle = '#2f4a3a'; g.fillRect(0, 0, 34, 1024); g.fillRect(478, 0, 34, 1024);
  g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(6, 0, 6, 1024); g.fillRect(484, 0, 6, 1024);
  return c;
}
export function woodFloor(seed = 2, hue = 30, lig = 50) {
  const [c, g] = cv(512, 512), r = rng(seed), n = 6, w = 512 / n;
  for (let i = 0; i < n; i++) { let y = -r() * 300; while (y < 512) { const L = lig + r() * 10 - 5, len = 180 + r() * 200;
    g.fillStyle = hsl(hue + r() * 6, 45, L); g.fillRect(i * w, y, w, len); for (let k = 0; k < 6; k++) { g.strokeStyle = hsl(hue, 40, L - 12, .4); g.lineWidth = 1 + r() * 2; g.beginPath(); const x = i * w + 4 + r() * (w - 8); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y + len); g.stroke(); }
    g.fillStyle = 'rgba(30,18,10,.8)'; g.fillRect(i * w, y, w, 3); y += len; } g.fillStyle = 'rgba(30,18,10,.85)'; g.fillRect(i * w, 0, 3, 512); }
  return c;
}
export function wallpaper(seed = 3, base = '#e9dcc0', motif = '#cdbb94', kind = 'dots') {
  const [c, g] = cv(256, 256), r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  if (kind === 'stripes') for (let x = 0; x < 256; x += 32) { g.fillStyle = motif; g.fillRect(x, 0, 10, 256); }
  else if (kind === 'diamond') { g.strokeStyle = motif; g.lineWidth = 3; for (let k = -256; k < 512; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 256, 256); g.moveTo(k, 256); g.lineTo(k + 256, 0); g.stroke(); } }
  else for (let y = 16; y < 256; y += 32) for (let x = (y / 32 % 2) * 16 + 8; x < 256; x += 32) { g.fillStyle = motif; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
  blot(g, r, 256, 256, 30, () => `rgba(120,100,70,${0.04 + r() * 0.05})`, [8, 30]);
  return c;
}
export function concrete(seed = 4, base = [210, 8, 70]) {
  const [c, g] = cv(512, 512), r = rng(seed); g.fillStyle = hsl(...base); g.fillRect(0, 0, 512, 512);
  blot(g, r, 512, 512, 220, () => hsl(base[0], base[1], base[2] - 8 + r() * 14, 0.35), [4, 26]);
  for (let i = 0; i < 1500; i++) { g.fillStyle = hsl(base[0], base[1], base[2] - 20 + r() * 30, 0.5); g.fillRect(r() * 512, r() * 512, 2, 2); }
  g.strokeStyle = 'rgba(40,40,50,.35)'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); let x = r() * 512, y = r() * 512; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += r() * 40 - 20; y += r() * 40 - 10; g.lineTo(x, y); } g.stroke(); }
  return c;
}
export function asphalt(seed = 5, lines = true) {
  const [c, g] = cv(512, 512), r = rng(seed); g.fillStyle = '#5a5d66'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 5000; i++) { g.fillStyle = hsl(225, 6, 28 + r() * 30, 0.6); g.fillRect(r() * 512, r() * 512, 2, 2); }
  blot(g, r, 512, 512, 40, () => `rgba(30,30,40,${0.08 + r() * 0.1})`, [10, 40]);
  if (lines) { g.fillStyle = '#f2efe6'; for (let x = 0; x < 512; x += 128) g.fillRect(x + 10, 250, 70, 12); }
  return c;
}
export function tiles(seed = 6, a = '#f1ece2', b = '#e2dccd', n = 8, grout = '#9b968c') {
  const [c, g] = cv(256, 256), r = rng(seed), s = 256 / n; g.fillStyle = grout; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(i * s + 4, j * s + 4, s - 12, 3); }
  return c;
}
export function bricks(seed = 7, hue = 12, sat = 45, lig = 46) {
  const [c, g] = cv(512, 512), r = rng(seed), bw = 64, bh = 28; g.fillStyle = '#cfc4b2'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 512 / bh; row++) for (let col = -1; col < 9; col++) { const x = col * bw + (row % 2) * bw / 2, y = row * bh;
    g.fillStyle = hsl(hue + r() * 8, sat, lig - 6 + r() * 12); g.fillRect(x + 2, y + 2, bw - 4, bh - 4); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 4, y + 3, bw - 10, 3); }
  return c;
}
export function siding(seed = 8, base = '#d8d2c2') { // corrugated / lap siding
  const [c, g] = cv(256, 256); g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) { g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(0, y + 12, 256, 4); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(0, y, 256, 3); }
  return c;
}
export function kawara(seed = 9, hue = 215) { // japanese roof tiles
  const [c, g] = cv(256, 256), r = rng(seed); g.fillStyle = hsl(hue, 14, 32); g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 32) { g.fillStyle = hsl(hue, 14, 44 + r() * 6); g.fillRect(x + 4, 0, 18, 256); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 6, 0, 4, 256); }
  for (let y = 0; y < 256; y += 64) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, y, 256, 5); }
  return c;
}
export function shoji(seed = 10) {
  const [c, g] = cv(256, 512); g.fillStyle = '#f6efdc'; g.fillRect(0, 0, 256, 512);
  g.strokeStyle = '#8a6440'; g.lineWidth = 7; for (let x = 0; x <= 256; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); } for (let y = 0; y <= 512; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
  return c;
}
// skyline backdrop with lit windows (night) or daylight facades
export function skyline(seed = 11, night = true, w = 2048, h = 512, opt = {}) {
  const [c, g] = cv(w, h), r = rng(seed); g.clearRect(0, 0, w, h);
  let x = 0; const cols = night ? ['#2d3a6e', '#34407a', '#263160', '#3b4a86'] : opt.cols || ['#c7b8a8', '#a9b8c9', '#d9c9a6', '#b5a4b9', '#9fb0a0'];
  while (x < w) { const bw = 60 + r() * 140, bh = h * (0.3 + r() * 0.65), col = cols[(r() * cols.length) | 0];
    g.fillStyle = col; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x + bw - 8, h - bh, 8, bh);
    for (let yy = h - bh + 12; yy < h - 10; yy += 22) for (let xx = x + 8; xx < x + bw - 14; xx += 18) { if (night) { if (r() < 0.45) { g.fillStyle = r() < 0.7 ? '#ffd87a' : '#9fe0ff'; g.fillRect(xx, yy, 9, 12); } } else { g.fillStyle = r() < 0.5 ? 'rgba(90,120,160,.55)' : 'rgba(255,255,255,.5)'; g.fillRect(xx, yy, 9, 12); } }
    if (night && r() < 0.35) { g.fillStyle = ['#ff4f7a', '#4fe3ff', '#ffe14f'][(r() * 3) | 0]; g.fillRect(x + 10, h - bh - 18, Math.min(bw - 20, 70), 14); }
    if (r() < 0.3) { g.fillStyle = col; g.fillRect(x + bw * 0.4, h - bh - 30, 4, 30); if (night) { g.fillStyle = '#ff3b3b'; g.beginPath(); g.arc(x + bw * 0.4 + 2, h - bh - 32, 4, 0, 7); g.fill(); } }
    x += bw + r() * 6; }
  g.strokeStyle = 'rgba(20,10,30,.6)'; g.lineWidth = 4; g.strokeRect(0, 0, 0, 0);
  return c;
}
// generic text sign. lines: [[text, sizePx, color]], bg, border
export function sign(w, h, lines, bg = '#fbf7ea', border = '#2e211d', opt = {}) {
  const [c, g] = cv(w, h); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (opt.stripe) { g.fillStyle = opt.stripe; g.fillRect(0, 0, w, h * 0.22); }
  if (border) { g.strokeStyle = border; g.lineWidth = opt.bw ?? Math.max(6, w * 0.018); g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, w - g.lineWidth, h - g.lineWidth); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const total = lines.reduce((s, l) => s + l[1] * 1.15, 0); let y = h / 2 - total / 2;
  for (const [t, sz, col, font] of lines) { let s = sz; g.font = `${font || 'bold'} ${s}px "DejaVu Sans", sans-serif`; while (g.measureText(t).width > w * 0.9 && s > 8) { s -= 2; g.font = `${font || 'bold'} ${s}px "DejaVu Sans", sans-serif`; }
    g.fillStyle = col; g.fillText(t, w / 2, y + sz * 0.575); y += sz * 1.15; }
  if (opt.photo) { const [px, py, pw, ph] = opt.photo; g.fillStyle = '#8fc0e8'; g.fillRect(px, py, pw, ph); g.strokeStyle = '#2e211d'; g.lineWidth = 5; g.strokeRect(px, py, pw, ph);
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(px + pw / 2, py + ph * 0.42, pw * 0.26, ph * 0.22, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(px + pw / 2, py + ph, pw * 0.36, ph * 0.3, 0, Math.PI, 0); g.fill(); g.stroke();
    g.fillStyle = '#2a211d'; g.beginPath(); g.ellipse(px + pw / 2, py + ph * 0.28, pw * 0.27, ph * 0.1, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#2a211d'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(px + pw / 2 + s * pw * 0.09, py + ph * 0.42, 4, 6, 0, 0, 7); g.fill(); } g.lineWidth = 4; g.beginPath(); g.arc(px + pw / 2, py + ph * 0.48, pw * 0.08, 0.2, Math.PI - 0.2); g.stroke(); }
  return c;
}
export function noren(seed = 12, col = '#26304d', text = 'RAMEN') {
  const [c, g] = cv(512, 256); g.fillStyle = col; g.fillRect(0, 0, 512, 256);
  for (let i = 1; i < 4; i++) { g.clearRect(i * 128 - 3, 70, 6, 186); }
  g.fillStyle = '#f6f1e6'; g.font = 'bold 74px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 150);
  g.strokeStyle = '#f6f1e6'; g.lineWidth = 5; g.strokeRect(12, 12, 488, 232);
  return c;
}
export function grassT(seed = 13) {
  const [c, g] = cv(256, 256), r = rng(seed); g.fillStyle = '#79a84c'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 700; i++) { g.strokeStyle = hsl(80 + r() * 30, 45, 32 + r() * 25, .9); g.lineWidth = 1.5; g.beginPath(); const x = r() * 256, y = r() * 256; g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 6 - r() * 6); g.stroke(); }
  return c;
}
export function water(seed = 14) {
  const [c, g] = cv(512, 512), r = rng(seed); g.fillStyle = '#3d7fb5'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,240,210,${0.15 + r() * 0.35})`; g.fillRect(r() * 512, r() * 512, 16 + r() * 40, 3); }
  return c;
}
export function paper(seed = 15, lines = 8) {
  const [c, g] = cv(128, 160), r = rng(seed); g.fillStyle = '#fbf7ea'; g.fillRect(0, 0, 128, 160);
  for (let i = 0; i < lines; i++) { g.fillStyle = '#8a8a9a'; g.fillRect(14, 22 + i * 15, 70 + r() * 30, 5); }
  return c;
}
export function debtLetter(seed = 16) { return sign(256, 160, [['FINAL NOTICE', 30, '#c0392b'], ['¥3,400,000', 40, '#2e211d'], ['OVERDUE', 22, '#c0392b']], '#fbe9e3', '#c0392b'); }
export function screen(col1 = '#3f8fd8', col2 = '#9fe0ff', seed = 17) {
  const [c, g] = cv(256, 160), r = rng(seed); const gr = g.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, col1); gr.addColorStop(1, col2); g.fillStyle = gr; g.fillRect(0, 0, 256, 160);
  for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(18, 18 + i * 18, 60 + r() * 150, 7); }
  return c;
}
export function clockFace() {
  const [c, g] = cv(256, 256); g.fillStyle = '#fbf7ea'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill();
  g.fillStyle = '#2e211d'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.save(); g.translate(128 + Math.sin(a) * 100, 128 - Math.cos(a) * 100); g.rotate(a); g.fillRect(-4, -12, 8, 24); g.restore(); }
  g.font = 'bold 30px "DejaVu Sans"'; g.textAlign = 'center'; g.textBaseline = 'middle'; [[12, 0], [3, 1], [6, 2], [9, 3]].forEach(([n, k]) => { const a = k * Math.PI / 2; g.fillText(n, 128 + Math.sin(a) * 72, 128 - Math.cos(a) * 72); });
  return c;
}
export function calendar(month = 'MAR') {
  const [c, g] = cv(256, 320); g.fillStyle = '#fbf7ea'; g.fillRect(0, 0, 256, 320); g.fillStyle = '#c0392b'; g.fillRect(0, 0, 256, 80);
  g.fillStyle = '#fff'; g.font = 'bold 60px "DejaVu Sans"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(month, 128, 42);
  g.fillStyle = '#2e211d'; g.font = 'bold 22px "DejaVu Sans"'; for (let i = 0; i < 30; i++) g.fillText(String(i + 1), 26 + (i % 7) * 34, 110 + Math.floor(i / 7) * 42);
  return c;
}
export function poster(seed, title, sub, bg = '#fbf7ea', accent = '#c0392b') { return sign(256, 360, [[title, 40, accent], ['', 150, '#000'], [sub, 22, '#2e211d']], bg, '#2e211d', { photo: [58, 90, 140, 150] }); }
