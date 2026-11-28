// Hogeweyk painted textures (our own, deterministic)
export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
export const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

export function cobbles(seed = 1, hue = 30, sat = 18, lig = 62) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = hsl(hue, sat - 6, lig - 26); g.fillRect(0, 0, 512, 512);
  const n = 16, s = 512 / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const L = lig - 8 + r() * 16, ox = (y % 2) * s / 2;
    g.fillStyle = hsl(hue + r() * 14 - 7, sat, L); g.beginPath(); g.roundRect(x * s + ox + 2, y * s + 2, s - 4, s - 4, 7); g.fill();
    g.fillStyle = hsl(hue, sat, L + 9, 0.6); g.fillRect(x * s + ox + 6, y * s + 5, s - 14, 4);
    if (x === n - 1) { g.fillStyle = hsl(hue + r() * 14 - 7, sat, L); g.beginPath(); g.roundRect(ox - s + 2, y * s + 2, s - 4, s - 4, 7); g.fill(); }
  }
  for (let i = 0; i < 80; i++) { g.fillStyle = hsl(95, 40, 38, 0.7); g.beginPath(); g.arc(r() * 512, r() * 512, 1.5 + r() * 2, 0, 7); g.fill(); }
  return c;
}
export function bricks(seed = 2, hue = 10, sat = 52, lig = 46) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#e8dccb'; g.fillRect(0, 0, 512, 512);
  const bw = 64, bh = 24;
  for (let y = 0; y < 512 / bh; y++) for (let x = -1; x < 512 / bw + 1; x++) {
    const ox = (y % 2) * bw / 2, L = lig - 7 + r() * 14;
    g.fillStyle = hsl(hue + r() * 10 - 5, sat, L); g.fillRect(x * bw + ox + 2, y * bh + 2, bw - 4, bh - 4);
    g.fillStyle = hsl(hue, sat, L + 10, 0.5); g.fillRect(x * bw + ox + 4, y * bh + 3, bw - 10, 3);
    g.fillStyle = hsl(hue, sat, L - 12, 0.4); g.fillRect(x * bw + ox + 4, y * bh + bh - 6, bw - 8, 3);
  }
  return c;
}
export function planks(seed = 3, hue = 30, lig = 52) {
  const [c, g] = cv(512, 512), r = rng(seed), n = 8, w = 512 / n;
  for (let i = 0; i < n; i++) {
    const L = lig - 6 + r() * 12; g.fillStyle = hsl(hue, 45, L); g.fillRect(i * w, 0, w, 512);
    for (let k = 0; k < 10; k++) { g.strokeStyle = hsl(hue - 4, 40, L - 10 - r() * 6, 0.45); g.lineWidth = 1 + r() * 2; g.beginPath(); const x = i * w + 4 + r() * (w - 8); g.moveTo(x, 0); g.bezierCurveTo(x + 5, 170, x - 5, 340, x + 2, 512); g.stroke(); }
    const cut = r() * 512; g.fillStyle = 'rgba(40,24,14,.8)'; g.fillRect(i * w, cut, w, 3); g.fillStyle = 'rgba(30,18,10,.9)'; g.fillRect(i * w, 0, 3, 512);
  }
  return c;
}
export function wallpaper(seed = 4, base = '#cfe3c8', stripe = '#b6d3ae', dot = '#f4efe0') {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) { g.fillStyle = stripe; g.fillRect(i * 32, 0, 14, 256); }
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = dot; const cx = x * 32 + 23, cy = y * 32 + 16 + (x % 2) * 16; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(cx + Math.cos(k * 1.57) * 4, cy + Math.sin(k * 1.57) * 4, 3, 3, 0, 0, 7); g.fill(); } }
  return c;
}
export function checker(a = '#f4f1ea', b = '#2b2730', n = 8) {
  const [c, g] = cv(256, 256), s = 256 / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = (x + y) % 2 ? a : b; g.fillRect(x * s, y * s, s, s); }
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 256); g.moveTo(0, i * s); g.lineTo(256, i * s); g.stroke(); }
  return c;
}
export function tiles(base = '#e9eef0', line = '#c3cdd2', n = 4) {
  const [c, g] = cv(256, 256), s = 256 / n, r = rng(9);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = base; g.fillRect(x * s, y * s, s, s); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x * s + 6, y * s + 6, s * 0.4, 5); g.fillStyle = `rgba(0,0,0,${0.02 + r() * 0.04})`; g.fillRect(x * s, y * s, s, s); }
  g.strokeStyle = line; g.lineWidth = 4; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 256); g.moveTo(0, i * s); g.lineTo(256, i * s); g.stroke(); }
  return c;
}
export function stripes(a = '#d6333c', b = '#fbf6ee', n = 8, vertical = true) {
  const [c, g] = cv(256, 256), s = 256 / n;
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; if (vertical) g.fillRect(i * s, 0, s, 256); else g.fillRect(0, i * s, 256, s); }
  return c;
}
export function asphalt(seed = 5) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#5d6470'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < .5 ? 30 : 140},${r() < .5 ? 34 : 146},${r() < .5 ? 40 : 156},.35)`; g.fillRect(r() * 512, r() * 512, 2 + r() * 3, 2 + r() * 3); }
  return c;
}
export function hedge(seed = 6) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#3f7a35'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 420; i++) { g.fillStyle = hsl(95 + r() * 30, 45, 28 + r() * 22); g.beginPath(); g.ellipse(r() * 256, r() * 256, 5 + r() * 7, 3 + r() * 5, r() * 3, 0, 7); g.fill(); }
  return c;
}
export function grass(seed = 7) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#74b04c'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) { g.fillStyle = hsl(85 + r() * 20, 45, 38 + r() * 14, .5); g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 50, 12 + r() * 30, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 1500; i++) { const x = r() * 512, y = r() * 512; g.strokeStyle = hsl(80 + r() * 30, 48, 30 + r() * 25, .9); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 5 - r() * 7); g.stroke(); }
  for (let i = 0; i < 40; i++) { g.fillStyle = ['#f3e27a', '#ffffff', '#e8a0c0'][i % 3]; g.beginPath(); g.arc(r() * 512, r() * 512, 2.5, 0, 7); g.fill(); }
  return c;
}
export function quilt() {
  const [c, g] = cv(256, 256), r = rng(11), cols = ['#f2c33a', '#5aa0d8', '#e86a6a', '#7cc07a', '#f4efe0', '#b48ad6'];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = cols[(x + y * 3 + ((r() * 2) | 0)) % cols.length]; g.fillRect(x * 64, y * 64, 64, 64);
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.setLineDash([6, 5]); g.lineWidth = 3; g.strokeRect(x * 64 + 6, y * 64 + 6, 52, 52); g.setLineDash([]); }
  return c;
}
export function roofTiles(seed = 9, hue = 12) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = hsl(hue, 50, 30); g.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) for (let col = 0; col < 9; col++) {
    const x = col * 32 + (row % 2) * 16 - 16, y = row * 32; g.fillStyle = hsl(hue + r() * 8, 55, 40 + r() * 10);
    g.beginPath(); g.ellipse(x + 16, y + 16, 14, 17, 0, 0, Math.PI); g.lineTo(x + 2, y); g.fill();
    g.fillStyle = 'rgba(255,220,180,.25)'; g.fillRect(x + 6, y + 2, 5, 20);
  }
  return c;
}
export function plaster(seed = 8, hue = 40, l = 88) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = hsl(hue, 38, l); g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) { g.fillStyle = hsl(hue, 30, l - 8 + r() * 6, .45); g.beginPath(); g.ellipse(r() * 256, r() * 256, 10 + r() * 30, 6 + r() * 16, 0, 0, 7); g.fill(); }
  return c;
}
/** auto-fit sign text onto a canvas: lines = array of strings */
export function signCanvas(lines, { w = 512, h = 128, bg = '#1f3b6e', fg = '#ffffff', border = '#f2c33a', font = 'Lilita One, DejaVu Sans, sans-serif', bold = true, pad = 0.12, radius = 18, sub = null } = {}) {
  const [c, g] = cv(w, h);
  g.fillStyle = border || bg; g.beginPath(); g.roundRect(0, 0, w, h, radius); g.fill();
  const bw = border ? Math.max(6, h * 0.07) : 0; g.fillStyle = bg; g.beginPath(); g.roundRect(bw, bw, w - 2 * bw, h - 2 * bw, Math.max(2, radius - bw)); g.fill();
  if (!Array.isArray(lines)) lines = [lines];
  const lh = (h * (1 - 2 * pad)) / lines.length;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((t, i) => {
    let sz = lh * 0.86; g.font = `${bold ? 'bold ' : ''}${sz}px ${font}`;
    const mw = w * (1 - 2 * pad); const tw = g.measureText(t).width; if (tw > mw) { sz *= mw / tw; g.font = `${bold ? 'bold ' : ''}${sz}px ${font}`; }
    const y = h * pad + lh * (i + 0.5);
    g.lineWidth = sz * 0.12; g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeText(t, w / 2 + sz * 0.04, y + sz * 0.05);
    g.fillStyle = Array.isArray(fg) ? fg[i % fg.length] : fg; g.fillText(t, w / 2, y);
  });
  return c;
}
export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}
/** painted backdrop seen through windows: sky + rooftops */
export function backdrop(kind = 'roofs') {
  const [c, g] = cv(1024, 512), r = rng(21);
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#5aa2e6'); gr.addColorStop(1, '#cfe7fb'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,.9)'; const x = r() * 1024, y = 60 + r() * 140; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + k * 26, y + Math.sin(k) * 8, 34, 22, 0, 0, 7); g.fill(); } }
  if (kind === 'roofs') {
    for (let i = 0; i < 9; i++) { const x = i * 120 - 20 + r() * 30, w = 110, h = 140 + r() * 80; g.fillStyle = ['#b5523b', '#8e4a3a', '#c76b45', '#9b5d4a'][i % 4]; g.fillRect(x, 512 - h, w, h);
      g.beginPath(); g.moveTo(x - 6, 512 - h); g.lineTo(x + w / 2, 512 - h - 60); g.lineTo(x + w + 6, 512 - h); g.fill();
      g.fillStyle = '#f4efe0'; for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) g.fillRect(x + 18 + j * 50, 512 - h + 30 + k * 50, 24, 30); }
    g.fillStyle = '#4f8f3f'; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(i * 80, 500, 60, 40, 0, 0, 7); g.fill(); }
  } else {
    g.fillStyle = '#8fbf6a'; g.fillRect(0, 380, 1024, 132); g.fillStyle = '#6a7380'; g.fillRect(0, 420, 1024, 50);
    g.fillStyle = '#fff'; for (let i = 0; i < 12; i++) g.fillRect(i * 90, 442, 50, 6);
    for (let i = 0; i < 7; i++) { g.fillStyle = '#4f8f3f'; g.beginPath(); g.ellipse(80 + i * 150, 370, 50, 60, 0, 0, 7); g.fill(); }
  }
  return c;
}
