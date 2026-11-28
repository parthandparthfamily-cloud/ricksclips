// "Your Lost Bag Isn't Lost" — every set is real inked 3D geometry. Only the characters are 2D cards.
// Sets (world x offsets): A airport baggage hall (0) · B apartment (100) · C call centre (200) · D airline warehouse (300)
//                         F outlet store interior (700) · E Alabama town + giant store exterior (1000)
import * as P from './paint.js';

const ff = new FontFace('Lilita', 'url(fonts/LilitaOne.ttf)'); await ff.load(); document.fonts.add(ff);

export function buildWorld(THREE, scene, { T }) {
  const H = {}; // animated handles
  const rngS = P.rng;
  // ---------- materials ----------
  const grad = (() => { const d = new Uint8Array([105, 105, 105, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
  const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
  const MC = new Map(); const col = (c) => { if (!MC.has(c)) MC.set(c, toon({ color: c })); return MC.get(c); };
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); fn(g, w, h); return c; };
  const tex = (c, rx = 1, ry = 1) => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const texM = (c, rx = 1, ry = 1, extra = {}) => toon({ map: tex(c, rx, ry), ...extra });
  const noise = (g, w, h, seed, n, cols, r0 = 1, r1 = 3) => { const r = rngS(seed); for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.beginPath(); g.ellipse(r() * w, r() * h, r0 + r() * r1, r0 + r() * r1, r() * 3, 0, 7); g.fill(); } };
  // painted surfaces
  const tiles = (a = '#e9e4da', b = '#dcd5c8', gr = '#a79f92', n = 4, seed = 3) => cv(512, 512, (g, w) => { const s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); } noise(g, w, w, seed, 900, ['rgba(0,0,0,.05)', 'rgba(255,255,255,.12)'], 1, 4); g.strokeStyle = gr; g.lineWidth = 5; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, w); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); } g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) g.fillRect(i * s + 8, j * s + 8, s * 0.35, 6); });
  const paintWall = (base, stripe, seed = 5) => cv(512, 512, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); noise(g, w, w, seed, 600, ['rgba(0,0,0,.04)', 'rgba(255,255,255,.07)'], 2, 7); if (stripe) { g.fillStyle = stripe; g.fillRect(0, 380, w, 40); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 418, w, 3); } g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 500, w, 12); });
  const planks = (h0 = 32, l0 = 52, seed = 1) => cv(512, 512, (g, w) => { const r = rngS(seed); for (let i = 0; i < 8; i++) { const L = l0 + r() * 10; g.fillStyle = `hsl(${h0},42%,${L}%)`; g.fillRect(0, i * 64, w, 64); for (let k = 0; k < 10; k++) { g.strokeStyle = `hsla(${h0 - 4},40%,${L - 12}%,.45)`; g.lineWidth = 1 + r() * 2; g.beginPath(); const y = i * 64 + 6 + r() * 52; g.moveTo(0, y); g.bezierCurveTo(170, y + r() * 8 - 4, 340, y + r() * 8 - 4, 512, y); g.stroke(); } g.fillStyle = 'rgba(40,24,14,.8)'; g.fillRect(0, i * 64, w, 3); g.fillRect(r() * 512, i * 64, 3, 64); } });
  const carpet = (a, b, seed = 9) => cv(256, 256, (g, w) => { g.fillStyle = a; g.fillRect(0, 0, w, w); noise(g, w, w, seed, 1800, [b, 'rgba(0,0,0,.08)', 'rgba(255,255,255,.08)'], 0.8, 1.6); });
  const brick = (base = '#b5523a', mortar = '#d8c9b0', seed = 4) => cv(512, 512, (g, w) => { g.fillStyle = mortar; g.fillRect(0, 0, w, w); const r = rngS(seed); for (let j = 0; j < 16; j++) for (let i = -1; i < 5; i++) { const x = i * 128 + (j % 2) * 64, y = j * 32; g.fillStyle = `hsl(${12 + r() * 10},${45 + r() * 15}%,${40 + r() * 12}%)`; g.fillRect(x + 4, y + 4, 120, 25); } noise(g, w, w, seed, 700, ['rgba(0,0,0,.08)', 'rgba(255,255,255,.08)'], 1, 3); });
  const corrugated = (base = '#9fb0bf', seed = 6) => cv(256, 256, (g, w) => { for (let x = 0; x < w; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, base); gr.addColorStop(0.5, '#dfe7ee'); gr.addColorStop(1, base); g.fillStyle = gr; g.fillRect(x, 0, 16, w); } noise(g, w, w, seed, 300, ['rgba(80,60,40,.12)', 'rgba(0,0,0,.06)'], 1, 3); });
  const concrete = (base = '#b9b7b0', seed = 7) => cv(512, 512, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); noise(g, w, w, seed, 2500, ['rgba(0,0,0,.06)', 'rgba(255,255,255,.08)', 'rgba(90,80,60,.06)'], 1, 5); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; g.strokeRect(0, 0, w, w); });
  const asphalt = (lines = true) => cv(512, 512, (g, w) => { g.fillStyle = '#5d6168'; g.fillRect(0, 0, w, w); noise(g, w, w, 11, 3000, ['rgba(255,255,255,.07)', 'rgba(0,0,0,.12)'], 0.7, 2); if (lines) { g.fillStyle = '#f2c94c'; g.fillRect(248, 0, 16, w); } });
  const grassT = () => cv(256, 256, (g, w) => { g.fillStyle = '#79b04a'; g.fillRect(0, 0, w, w); noise(g, w, w, 12, 1600, ['#6aa03f', '#8cc35a', '#5c9238', '#9fcf6a'], 1, 2.4); });
  const fabric = (base = '#7d8fae') => cv(128, 128, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); noise(g, w, w, 13, 900, ['rgba(0,0,0,.1)', 'rgba(255,255,255,.1)'], 0.6, 1.2); });
  const cord = (base = '#e0a52c') => cv(128, 128, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); for (let x = 0; x < w; x += 8) { g.fillStyle = 'rgba(120,70,10,.3)'; g.fillRect(x, 0, 3, w); } });
  const wallpaper = (a = '#f3e3c3', b = '#e7a86b') => cv(256, 256, (g, w) => { g.fillStyle = a; g.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = b; g.beginPath(); g.arc(x + 32 + (y / 64 % 2) * 32, y + 32, 9, 0, 7); g.fill(); g.strokeStyle = 'rgba(120,70,40,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); } noise(g, w, w, 14, 300, ['rgba(0,0,0,.04)'], 2, 6); });
  // text on a canvas (auto-fit)
  const label = (text, o = {}) => { const w = o.w || 1024, h = o.h || 256; return cv(w, h, (g) => {
    g.fillStyle = o.bg ?? '#1f3b6e'; g.fillRect(0, 0, w, h);
    if (o.border !== false) { g.strokeStyle = o.bc ?? '#f2c94c'; g.lineWidth = o.bw ?? Math.max(10, h * 0.05); g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, w - g.lineWidth, h - g.lineWidth); }
    const lines = String(text).split('\n'); let fs = o.fs || h * 0.62 / lines.length;
    g.font = `${fs}px Lilita`; const maxW = w * 0.9; for (const L of lines) { const m = g.measureText(L).width; if (m > maxW) fs = Math.min(fs, fs * maxW / m); }
    g.font = `${fs}px Lilita`; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((L, i) => { const y = h / 2 + (i - (lines.length - 1) / 2) * fs * 1.08; if (o.stroke) { g.lineWidth = fs * 0.12; g.strokeStyle = o.stroke; g.strokeText(L, w / 2, y); } g.fillStyle = o.fg ?? '#ffffff'; g.fillText(L, w / 2, y); });
    if (o.extra) o.extra(g, w, h);
  }); };

  // ---------- geometry helpers ----------
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const tbox = (w, h, d, t = 2) => { const g = box(w, h, d), uv = g.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); } return g; };
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast ?? true; m.receiveShadow = true; if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; if (o.noink) m.userData.ndSkip = true; parent.add(m); return m; };
  const grp = (x = 0, y = 0, z = 0, parent = scene, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
  const cyl = (r0, r1, h, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);
  const sph = (r, a = 16, b = 12) => new THREE.SphereGeometry(r, a, b);
  // a sign = a thin box with the painted label on the front (+z) face
  const sign = (text, w, h, o = {}, x = 0, y = 0, z = 0, parent = scene, ry = 0) => {
    const front = toon({ map: tex(label(text, { w: o.pw || Math.round(256 * Math.min(8, w / h)), h: o.ph || 256, ...o })) });
    if (o.emissive) { front.emissive = new THREE.Color('#ffffff'); front.emissiveMap = front.map; front.emissiveIntensity = o.emissive; }
    const edge = col(o.edge ?? '#2b2b33');
    const m = add(box(w, h, o.d ?? 0.06), [edge, edge, edge, edge, front, edge], x, y, z, parent, { ry, cast: o.cast ?? false }); return m;
  };
  // flat label plane (for posters, pages); still inked by geometry edges
  const plate = (c, w, h, x, y, z, parent = scene, ry = 0) => add(box(w, h, 0.012), [col('#eeeeee'), col('#eeeeee'), col('#eeeeee'), col('#eeeeee'), toon({ map: tex(c) }), col('#dddddd')], x, y, z, parent, { ry, cast: false });

  // ---------- reusable props ----------
  const BAGCOL = ['#3d7fd6', '#2f9e6e', '#8a4fc0', '#e2b33a', '#d8407a', '#3a3f52', '#5ec4d8', '#a05a2c', '#e86f4a', '#6c7a3a', '#c94a4a', '#f0e6d2'];
  const suitcase = (c, w = 0.48, h = 0.66, d = 0.26, parent = scene, o = {}) => {
    const g = grp(0, 0, 0, parent);
    add(box(w, h, d), col(c), 0, h / 2 + 0.03, 0, g);
    for (const s of [-1, 1]) add(box(w * 0.08, h * 0.92, 0.02), col(shade(c, 0.78)), s * w * 0.28, h / 2 + 0.03, d / 2 + 0.01, g, { cast: false });
    add(box(w * 0.3, 0.04, 0.05), col('#2b2b33'), 0, h + 0.07, 0, g);
    for (const s of [-1, 1]) add(box(0.03, 0.06, 0.04), col('#2b2b33'), s * w * 0.15, h + 0.04, 0, g, { cast: false });
    for (const s of [-1, 1]) for (const t of [-1, 1]) add(cyl(0.025, 0.025, 0.02, 8), col('#22222a'), s * w * 0.4, 0.025, t * d * 0.35, g, { rz: Math.PI / 2, cast: false });
    if (o.strap) add(box(w + 0.01, 0.05, d + 0.01), col(o.strap), 0, h * 0.55, 0, g, { cast: false });
    return g;
  };
  const duffel = (c, L = 0.7, r = 0.17, parent = scene) => { const g = grp(0, 0, 0, parent); add(cyl(r, r, L, 14), col(c), 0, r, 0, g, { rz: Math.PI / 2 }); for (const s of [-1, 1]) add(sph(r, 14, 10), col(shade(c, 0.85)), s * L / 2, r, 0, g).scale.set(0.35, 1, 1); add(new THREE.TorusGeometry(0.12, 0.02, 6, 16, Math.PI), col('#2b2b33'), 0, 2 * r, 0, g, { cast: false }); return g; };
  function shade(hex, k) { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); }
  const plant = (x, z, s = 1, parent = scene, y = 0) => { const g = grp(x, y, z, parent); add(cyl(0.22 * s, 0.17 * s, 0.4 * s, 12), col('#c46a3a'), 0, 0.2 * s, 0, g); const r = rngS((x * 7 + z * 13) | 0); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28, l = add(sph(0.16 * s, 10, 8), col(i % 2 ? '#4f9a3e' : '#6cbf4a'), Math.cos(a) * 0.14 * s, (0.55 + r() * 0.5) * s, Math.sin(a) * 0.14 * s, g); l.scale.set(0.6, 1.8, 0.6); l.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); } return g; };
  const clock = (x, y, z, r = 0.35, parent = scene, ry = 0) => { const g = grp(x, y, z, parent, ry); add(cyl(r, r, 0.06, 28), col('#d64a3a'), 0, 0, 0, g, { rx: Math.PI / 2, cast: false }); add(cyl(r * 0.86, r * 0.86, 0.07, 28), col('#fbfaf4'), 0, 0, 0.005, g, { rx: Math.PI / 2, cast: false }); for (let i = 0; i < 12; i++) add(box(0.02, 0.06, 0.01), col('#2b2b33'), Math.sin(i / 12 * 6.28) * r * 0.72, Math.cos(i / 12 * 6.28) * r * 0.72, 0.045, g, { rz: -i / 12 * 6.28, cast: false }); const hh = grp(0, 0, 0.05, g), mm = grp(0, 0, 0.06, g), ss = grp(0, 0, 0.07, g); add(box(0.03, r * 0.45, 0.01), col('#2b2b33'), 0, r * 0.2, 0, hh, { cast: false }); add(box(0.022, r * 0.7, 0.01), col('#2b2b33'), 0, r * 0.32, 0, mm, { cast: false }); add(box(0.01, r * 0.75, 0.01), col('#d64a3a'), 0, r * 0.3, 0, ss, { cast: false }); return { g, hh, mm, ss }; };
  const clocks = []; const addClock = (...a) => { const c = clock(...a); clocks.push(c); return c; };
  const bench = (x, z, n = 3, parent = scene, ry = 0) => { const g = grp(x, 0, z, parent, ry); for (let i = 0; i < n; i++) { add(box(0.55, 0.06, 0.5), col('#3b6fb0'), (i - (n - 1) / 2) * 0.6, 0.46, 0, g); add(box(0.55, 0.5, 0.06), col('#3b6fb0'), (i - (n - 1) / 2) * 0.6, 0.74, -0.24, g); } add(box(0.6 * n, 0.06, 0.08), col('#9aa3ad'), 0, 0.38, 0, g); for (const s of [-1, 1]) add(box(0.06, 0.4, 0.4), col('#9aa3ad'), s * 0.3 * n, 0.2, 0, g); return g; };
  const ceilingLights = (x0, x1, z0, z1, y, step = 3, parent = scene) => { for (let x = x0; x <= x1; x += step) for (let z = z0; z <= z1; z += step) { const m = add(box(1.4, 0.06, 0.4), toon({ color: '#ffffff', emissive: '#fffbe8', emissiveIntensity: 0.9 }), x, y - 0.03, z, parent, { cast: false }); } };
  const room = (x0, x1, z0, z1, h, mats, parent = scene, o = {}) => { // floor, ceiling, 4 walls (walls/ceiling never cast shadows)
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = x1 - x0, D = z1 - z0;
    add(tbox(W, 0.2, D, o.ft || 2), mats.floor, cx, -0.1, cz, parent, { cast: false });
    if (mats.ceil) add(tbox(W, 0.2, D, 3), mats.ceil, cx, h + 0.1, cz, parent, { cast: false });
    if (!o.noBack) add(tbox(W, h, 0.2, o.wt || 3), mats.wall, cx, h / 2, z0 - 0.1, parent, { cast: false });
    if (!o.noFront) add(tbox(W, h, 0.2, o.wt || 3), mats.wall, cx, h / 2, z1 + 0.1, parent, { cast: false });
    if (!o.noLeft) add(tbox(0.2, h, D, o.wt || 3), mats.wall2 || mats.wall, x0 - 0.1, h / 2, cz, parent, { cast: false });
    if (!o.noRight) add(tbox(0.2, h, D, o.wt || 3), mats.wall2 || mats.wall, x1 + 0.1, h / 2, cz, parent, { cast: false });
    // skirting
    add(box(W, 0.12, 0.04), col('#5b4a3e'), cx, 0.06, z0 + 0.02, parent, { cast: false });
  };
  // merged coloured boxes (one mesh for hundreds of shelf bags)
  const mergedBoxes = (list) => { // list of {x,y,z,w,h,d,c,ry}
    const g0 = box(1, 1, 1).toNonIndexed(); const pos0 = g0.attributes.position.array, nor0 = g0.attributes.normal.array, n = pos0.length / 3;
    const pos = new Float32Array(list.length * n * 3), nor = new Float32Array(list.length * n * 3), cols = new Float32Array(list.length * n * 3); const c = new THREE.Color();
    list.forEach((b, k) => { c.set(b.c); const cs = Math.cos(b.ry || 0), sn = Math.sin(b.ry || 0); for (let i = 0; i < n; i++) { const x = pos0[i * 3] * b.w, y = pos0[i * 3 + 1] * b.h, z = pos0[i * 3 + 2] * b.d; const o = (k * n + i) * 3; pos[o] = b.x + x * cs + z * sn; pos[o + 1] = b.y + y; pos[o + 2] = b.z - x * sn + z * cs; const nx = nor0[i * 3], nz = nor0[i * 3 + 2]; nor[o] = nx * cs + nz * sn; nor[o + 1] = nor0[i * 3 + 1]; nor[o + 2] = -nx * sn + nz * cs; cols[o] = c.r; cols[o + 1] = c.g; cols[o + 2] = c.b; } });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('color', new THREE.BufferAttribute(cols, 3)); return geo;
  };
  const vcMat = toon({ vertexColors: true });
  // 3D sparkle star (inked) and "!" / "?" marks
  const starGeo = (() => { const s = new THREE.Shape(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 0.38 : 1; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: false }); g.translate(0, 0, -0.125); return g; })();
  const textGeo3 = (ch) => { // extruded glyph from a canvas-traced polygon is heavy; use blocky letters for ? and !
    const s = new THREE.Shape();
    if (ch === '!') { s.moveTo(-0.15, 1); s.lineTo(0.15, 1); s.lineTo(0.08, 0.3); s.lineTo(-0.08, 0.3); s.closePath(); const d = new THREE.Path(); }
    else { s.moveTo(-0.45, 0.6); s.quadraticCurveTo(-0.45, 1.05, 0, 1.05); s.quadraticCurveTo(0.45, 1.05, 0.45, 0.65); s.quadraticCurveTo(0.45, 0.4, 0.12, 0.3); s.lineTo(0.12, 0.2); s.lineTo(-0.12, 0.2); s.lineTo(-0.12, 0.42); s.quadraticCurveTo(0.2, 0.5, 0.2, 0.66); s.quadraticCurveTo(0.2, 0.82, 0, 0.82); s.quadraticCurveTo(-0.2, 0.82, -0.2, 0.6); s.closePath(); }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: false }); g.translate(0, -0.5, -0.1); return g; };
  const FXPOOL = {}; // reusable 3D fx meshes, made visible per frame
  const pool = (name, n, make) => { const a = []; for (let i = 0; i < n; i++) { const m = make(i); m.visible = false; a.push(m); } FXPOOL[name] = a; return a; };
  pool('star', 24, (i) => add(starGeo, toon({ color: i % 3 ? '#ffe066' : '#ffffff', emissive: '#fff3a0', emissiveIntensity: 0.35 }), 0, 0, 0, scene, { cast: false }));
  pool('qmark', 4, () => { const g = grp(); add(textGeo3('?'), col('#f2c94c'), 0, 0.1, 0, g, { cast: false }); add(sph(0.12, 10, 8), col('#f2c94c'), 0, -0.55, 0, g, { cast: false }); return g; });
  pool('xmark', 4, () => { const g = grp(); add(textGeo3('!'), col('#e8553a'), 0, 0.1, 0, g, { cast: false }); add(sph(0.12, 10, 8), col('#e8553a'), 0, -0.55, 0, g, { cast: false }); return g; });
  pool('puff', 18, () => add(sph(0.5, 14, 10), toon({ color: '#f4f1ea' }), 0, 0, 0, scene, { cast: false }));
  pool('zzz', 3, () => { const s = new THREE.Shape(); s.moveTo(-0.5, 0.5); s.lineTo(0.5, 0.5); s.lineTo(0.5, 0.3); s.lineTo(-0.15, -0.3); s.lineTo(0.5, -0.3); s.lineTo(0.5, -0.5); s.lineTo(-0.5, -0.5); s.lineTo(-0.5, -0.3); s.lineTo(0.15, 0.3); s.lineTo(-0.5, 0.3); s.closePath(); return add(new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: false }), col('#8fc3ff'), 0, 0, 0, scene, { cast: false }); });
  const billTex = tex(cv(256, 128, (g, w, h) => { g.fillStyle = '#9fd17f'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3f7a35'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#3f7a35'; g.beginPath(); g.arc(w / 2, h / 2, 34, 0, 7); g.fill(); g.fillStyle = '#9fd17f'; g.font = '56px Lilita'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', w / 2, h / 2 + 2); g.fillStyle = '#3f7a35'; g.font = '34px Lilita'; g.fillText('20', 36, 30); g.fillText('20', w - 36, h - 28); }));
  pool('bill', 26, () => add(box(0.32, 0.005, 0.15), [col('#7fb862'), col('#7fb862'), toon({ map: billTex }), toon({ map: billTex }), col('#7fb862'), col('#7fb862')], 0, 0, 0, scene, { cast: false }));
  pool('snow', 70, () => add(sph(0.04, 6, 5), col('#ffffff'), 0, 0, 0, scene, { cast: false }));
  pool('page', 10, () => add(box(0.5, 0.62, 0.006), [col('#f4f1ea'), col('#f4f1ea'), col('#f4f1ea'), col('#f4f1ea'), toon({ map: tex(cv(256, 320, (g, w, h) => { g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, w, h); g.fillStyle = '#d64a3a'; g.fillRect(0, 0, w, 60); g.strokeStyle = '#c9c3b4'; g.lineWidth = 3; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(0, 60 + i * 52); g.lineTo(w, 60 + i * 52); g.stroke(); g.beginPath(); g.moveTo(i * 51, 60); g.lineTo(i * 51, h); g.stroke(); } })) }), col('#f4f1ea')], 0, 0, 0, scene, { cast: false }));
  pool('bird', 10, () => { const g = grp(); add(sph(0.09, 10, 8), col('#3a3f52'), 0, 0, 0, g).scale.set(1.6, 0.8, 0.8); for (const s of [-1, 1]) { const w = add(box(0.03, 0.01, 0.22), col('#3a3f52'), 0, 0, s * 0.11, g, { cast: false }); w.userData.side = s; } return g; });

  // =====================================================================================
  // SET A — airport baggage hall (x 0)
  // =====================================================================================
  const A = grp(0, 0, 0);
  {
    const floor = texM(tiles('#e8e3da', '#d7d0c4', '#a79f92', 4, 21), 1, 1);
    const wall = texM(paintWall('#efe6d4', '#3d7fd6', 22), 1, 1);
    room(-15, 15, -12, 10, 8, { floor, wall, ceil: col('#e6e8ee') }, A, { noBack: true, ft: 2.5 });
    // back: low wall + glass curtain wall with mullions
    add(tbox(30, 1.0, 0.3, 2), texM(concrete('#c9c4ba', 23)), 0, 0.5, -12.1, A, { cast: false });
    add(box(30, 0.5, 0.3), col('#d8d2c6'), 0, 7.75, -12.1, A, { cast: false });
    for (let x = -15; x <= 15; x += 2.5) add(box(0.16, 6.6, 0.2), col('#5b6677'), x, 4.3, -12.05, A, { cast: false });
    for (const y of [1.05, 4.4, 7.5]) add(box(30, 0.12, 0.2), col('#5b6677'), 0, y, -12.05, A, { cast: false });
    const glass = add(new THREE.PlaneGeometry(30, 6.5), new THREE.MeshBasicMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.12, depthWrite: false }), 0, 4.3, -12.12, A, { cast: false, noink: true });
    // ceiling lights + vents
    ceilingLights(-12, 12, -9, 8, 8, 4, A);
    // outside: apron, taxiway, terminal far, control tower, planes
    const apron = add(new THREE.PlaneGeometry(260, 300), texM(asphalt(false), 30, 30), 0, -0.02, -162, scene, { cast: false, rx: -Math.PI / 2 });
    for (let x = -120; x < 120; x += 8) add(box(4, 0.02, 0.35), col('#f2c94c'), x, 0.01, -46, scene, { cast: false });
    for (let x = -100; x < 100; x += 26) add(box(0.3, 0.02, 14), col('#f4f4f4'), x, 0.01, -30, scene, { cast: false });
    add(new THREE.PlaneGeometry(600, 300), texM(grassT(), 60, 30), 0, -0.05, -330, scene, { cast: false, rx: -Math.PI / 2 });
    const tower = grp(48, 0, -95); add(cyl(1.6, 2.2, 26, 14), col('#e9e4da'), 0, 13, 0, tower); add(cyl(3.6, 2.8, 3, 10), col('#4a6a8a'), 0, 27.5, 0, tower); add(cyl(3.9, 3.9, 0.6, 10), col('#e9e4da'), 0, 29.3, 0, tower); add(cyl(0.1, 0.1, 4, 6), col('#c94a4a'), 0, 31.5, 0, tower);
    for (let i = 0; i < 6; i++) { const b = grp(-90 + i * 32, 0, -150 - (i % 2) * 20); add(box(24, 8 + (i % 3) * 4, 14), col(['#d9d3c7', '#c9d6e3', '#e8dcc0'][i % 3]), 0, 5, 0, b); add(box(24.2, 1.2, 14.2), col('#4a6a8a'), 0, 7 + (i % 3) * 2, 0, b); }
    for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI, d = 230; const h = add(sph(30, 14, 8), col(i % 2 ? '#8fb86a' : '#7aa65a'), Math.cos(a) * 260 - 0, -18, -200 - Math.sin(a) * 80, scene, { cast: false }); h.scale.y = 0.6; }
    const plane = (c1, c2) => { const g = grp(); const L = 26;
      add(cyl(1.6, 1.6, L, 20), col('#f7f7f4'), 0, 2.4, 0, g, { rz: Math.PI / 2 });
      add(sph(1.6, 20, 14), col('#f7f7f4'), L / 2, 2.4, 0, g).scale.set(1.8, 1, 1);
      add(new THREE.ConeGeometry(1.6, 6, 20), col('#f7f7f4'), -L / 2 - 3, 2.9, 0, g, { rz: Math.PI / 2 }).scale.set(1, 1, 1);
      add(box(L * 0.95, 0.35, 0.06), col(c1), 0, 2.2, 1.6, g, { cast: false }); add(box(L * 0.95, 0.35, 0.06), col(c1), 0, 2.2, -1.6, g, { cast: false });
      for (let i = 0; i < 16; i++) for (const s of [-1, 1]) add(box(0.32, 0.4, 0.05), col('#2b3550'), -L / 2 + 2 + i * 1.45, 3.0, s * 1.58, g, { cast: false });
      const wg = new THREE.Shape(); wg.moveTo(0, 0); wg.lineTo(-4, 13); wg.lineTo(-6, 13); wg.lineTo(-5.5, 0); wg.closePath();
      for (const s of [-1, 1]) { const w = add(new THREE.ExtrudeGeometry(wg, { depth: 0.3, bevelEnabled: false }), col('#e9e9e4'), 2, 1.6, 0, g, { rx: s * Math.PI / 2 }); w.scale.z = 1; }
      for (const s of [-1, 1]) add(cyl(0.9, 0.9, 3.2, 14), col('#cfd3d8'), 0.5, 0.9, s * 5, g, { rz: Math.PI / 2 });
      const tf = new THREE.Shape(); tf.moveTo(0, 0); tf.lineTo(-3.8, 0); tf.lineTo(-5.4, 6); tf.lineTo(-3.6, 6); tf.closePath(); add(new THREE.ExtrudeGeometry(tf, { depth: 0.3, bevelEnabled: false }), col(c2), -L / 2 + 1, 3.2, -0.15, g);
      for (const s of [-1, 1]) add(box(3.4, 0.2, 5), col('#e9e9e4'), -L / 2 - 2.6, 3.4, s * 2.4, g);
      for (const x of [-2, 2.5, 10]) add(cyl(0.45, 0.45, 0.4, 12), col('#22222a'), x, 0.45, x === 10 ? 0 : 1.4 * (x > 0 ? 1 : -1), g, { rx: Math.PI / 2 });
      return g; };
    H.planeA = plane('#e8553a', '#2f8fc9'); H.planeB = plane('#2f9e6e', '#f2c94c');
    // baggage tug with carts
    H.tug = grp(); add(box(2.2, 1.0, 1.4), col('#f2c94c'), 0, 0.7, 0, H.tug); add(box(0.9, 0.8, 1.3), col('#2b3550'), -0.4, 1.5, 0, H.tug);
    for (let i = 0; i < 3; i++) { const c = grp(-3 - i * 3, 0, 0, H.tug); add(box(2.4, 0.15, 1.5), col('#9aa3ad'), 0, 0.5, 0, c); for (let k = 0; k < 4; k++) { const s = suitcase(BAGCOL[(i * 4 + k) % 12], 0.5, 0.6, 0.28, c); s.position.set(-0.8 + k * 0.55, 0.58, 0); } }
    // carousel
    const CA = 3.5, CR = 1.45, CZ = -3;
    H.car = { a: CA, r: CR, z: CZ, P: 4 * CA + 2 * Math.PI * CR };
    const stad = (a, r, hole = false) => { const s = hole ? new THREE.Path() : new THREE.Shape(); if (!hole) { s.moveTo(-a, -r); s.lineTo(a, -r); s.absarc(a, 0, r, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-a, r); s.absarc(-a, 0, r, Math.PI / 2, Math.PI * 1.5, false); } else { s.moveTo(-a, r); s.lineTo(a, r); s.absarc(a, 0, r, Math.PI / 2, -Math.PI / 2, true); s.lineTo(-a, -r); s.absarc(-a, 0, r, -Math.PI / 2, -Math.PI * 1.5, true); } return s; };
    const ring = stad(CA, CR + 0.62); ring.holes.push(stad(CA, CR + 0.5, true));
    const ringG = new THREE.ExtrudeGeometry(ring, { depth: 0.5, bevelEnabled: false, curveSegments: 24 }); ringG.rotateX(-Math.PI / 2);
    add(ringG, col('#aeb6bf'), 0, 0, CZ, A);
    const isl = new THREE.ExtrudeGeometry(stad(CA, CR - 0.5), { depth: 0.62, bevelEnabled: false, curveSegments: 24 }); isl.rotateX(-Math.PI / 2); add(isl, col('#c7cdd4'), 0, 0, CZ, A);
    const isl2 = new THREE.ExtrudeGeometry(stad(CA * 0.9, CR - 0.75), { depth: 0.2, bevelEnabled: false, curveSegments: 24 }); isl2.rotateX(-Math.PI / 2); add(isl2, col('#3a3f52'), 0, 0.62, CZ, A);
    const base = new THREE.ExtrudeGeometry(stad(CA, CR + 0.5), { depth: 0.42, bevelEnabled: false, curveSegments: 24 }); base.rotateX(-Math.PI / 2); add(base, col('#5b6677'), 0, 0, CZ, A);
    H.slats = []; const nS = 84; for (let i = 0; i < nS; i++) { const m = add(box(0.24, 0.05, 1.0), col(i % 2 ? '#3a3f52' : '#4a5068'), 0, 0.46, 0, A); H.slats.push(m); }
    // curtain tunnel on the back straight
    const tun = grp(0, 0, CZ - CR, A); add(box(2.2, 0.16, 1.4), col('#2f8fc9'), 0, 1.25, 0, tun); for (const s of [-1, 1]) add(box(2.2, 0.8, 0.12), col('#2f8fc9'), 0, 0.85, s * 0.66, tun);
    sign('BELT 7', 1.6, 0.42, { bg: '#2f8fc9', fg: '#ffffff', bc: '#ffffff' }, 0, 1.0, 0.73, tun);
    H.flaps = []; for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const fl = add(box(0.03, 0.62, 0.2), col('#2b2b33'), s * 1.1, 1.15, -0.5 + i * 0.2, tun, { cast: false }); fl.geometry = box(0.03, 0.62, 0.2); fl.geometry.translate(0, -0.31, 0); fl.position.y = 1.17; H.flaps.push(fl); }
    // bags on the belt
    H.beltBags = []; for (let i = 0; i < 22; i++) { const c = BAGCOL[(i * 5) % 12]; const b = i % 4 === 3 ? duffel(c, 0.62, 0.16, A) : suitcase(c, 0.5 + (i % 3) * 0.06, 0.3, 0.62 + (i % 2) * 0.1, A, { strap: i % 5 === 0 ? '#f2c94c' : null }); H.beltBags.push(b); }
    // the hero's bag: orange hard shell, green ribbon, sticker, name tag "YOURS"
    const heroBag = (parent) => { const g = suitcase('#e8553a', 0.5, 0.68, 0.28, parent, { strap: '#2f9e6e' }); add(cyl(0.07, 0.07, 0.01, 16), col('#f2c94c'), 0.1, 0.5, 0.15, g, { rx: Math.PI / 2, cast: false }); add(box(0.12, 0.08, 0.01), col('#3d7fd6'), -0.08, 0.25, 0.15, g, { cast: false }); add(new THREE.TorusGeometry(0.06, 0.012, 6, 12), col('#2f9e6e'), 0.1, 0.78, 0, g, { cast: false });
      const tag = grp(0.1, 0.74, 0.02, g); const tagL = sign('YOURS', 0.16, 0.09, { bg: '#fbfaf4', fg: '#2b2b33', bc: '#2b2b33', d: 0.01, pw: 512, ph: 288 }, 0, -0.08, 0, tag); g.userData.tag = tag; return g; };
    H.heroBagA = heroBag(A);
    H.heroBag = heroBag;
    // the tumbleweed (joke: the empty belt)
    H.tumble = grp(0, 0, 0, A); { const r = rngS(77); for (let i = 0; i < 9; i++) { const t = add(new THREE.TorusGeometry(0.2 + r() * 0.06, 0.012, 5, 18), col('#a07a46'), 0, 0, 0, H.tumble, { cast: false }); t.rotation.set(r() * 3, r() * 3, r() * 3); } } H.tumble.visible = false;
    // hanging signs
    const hang = (m, len = 1.2) => { const [x, y, z] = [m.position.x, m.position.y, m.position.z]; for (const s of [-1, 1]) add(cyl(0.015, 0.015, len, 6), col('#5b6677'), x + s * 1.0, y + len / 2 + 0.4, z, A, { cast: false }); };
    hang(sign('BAGGAGE CLAIM', 4.4, 0.8, { bg: '#1f2a44', fg: '#f2c94c', bc: '#f2c94c' }, 0, 5.9, -1.8, A));
    hang(sign('ARRIVALS ← EXIT →', 3.6, 0.6, { bg: '#2f9e6e', fg: '#ffffff', bc: '#ffffff' }, -8, 6.3, 2.5, A, 0.4));
    // flight info board on the island tunnel side
    H.fids = sign('FLIGHT 714\n14 HOURS · BELT 7', 2.6, 1.1, { bg: '#10151f', fg: '#ffd23f', bc: '#5b6677', pw: 1024, ph: 440, emissive: 0.5 }, 0, 3.0, CZ - CR - 0.1, A);
    // pillars with ads
    for (const [x, z] of [[-6.5, 2], [6.5, 2], [-6.5, -8], [6.5, -8]]) { add(cyl(0.42, 0.42, 8, 18), texM(concrete('#e2ddd2', x | 0)), x, 4, z, A, { cast: false }); add(cyl(0.45, 0.45, 0.2, 18), col('#3d7fd6'), x, 0.1, z, A); }
    plate(label('VISIT\nALABAMA!', { w: 512, h: 768, bg: '#e8553a', fg: '#fff7dc', bc: '#fff7dc', extra: (g, w, h) => { g.fillStyle = '#f2c94c'; g.beginPath(); g.arc(w / 2, h * 0.84, 60, 0, 7); g.fill(); } }), 1.4, 2.1, -14.88, 2.4, -4, A, Math.PI / 2);
    plate(label('LOST\nSOMETHING?\nNO PROBLEM :)', { w: 512, h: 768, bg: '#3d7fd6', fg: '#ffffff', bc: '#ffffff' }), 1.4, 2.1, 14.88, 2.4, -6.5, A, -Math.PI / 2);
    H.clockA = addClock(14.85, 5.4, 0.5, 0.55, A, -Math.PI / 2);
    // benches, plants, bins, trolleys (foreground parallax)
    bench(-2.4, 5.2, 4, A, Math.PI); bench(2.6, 5.2, 4, A, Math.PI); bench(-3.5, 8.6, 3, A, Math.PI);
    for (const [x, z] of [[-6.2, 5.6], [6.4, 5.8], [-13.8, -10.5], [13.8, -10.6], [-13.8, 9], [5.2, -10.8]]) plant(x, z, 1.4, A);
    for (const [x, z] of [[-5.2, 6.2], [5.3, 6.4]]) { add(cyl(0.22, 0.2, 0.75, 14), col('#5b6677'), x, 0.375, z, A); add(cyl(0.24, 0.24, 0.06, 14), col('#2b2b33'), x, 0.77, z, A); }
    for (let i = 0; i < 4; i++) { const t = grp(-12.5 + i * 0.55, 0, -7.5, A, 0.1); add(box(0.5, 0.05, 0.9), col('#9aa3ad'), 0, 0.3, 0, t); add(box(0.5, 0.9, 0.05), col('#9aa3ad'), 0, 0.75, -0.45, t); add(box(0.55, 0.05, 0.05), col('#e8553a'), 0, 1.2, -0.45, t); }
    // arrivals doors (left of the hall, in the side wall x=-15)
    const dr = grp(-14.9, 0, -2.5, A, Math.PI / 2); for (const sx of [-1, 1]) add(box(0.2, 3.1, 0.3), col('#5b6677'), sx * 1.5, 1.55, 0.05, dr, { cast: false }); add(box(3.2, 0.25, 0.3), col('#5b6677'), 0, 3.0, 0.05, dr, { cast: false }); add(box(2.8, 2.9, 0.1), col('#1f3550'), 0, 1.45, -0.12, dr, { cast: false });
    H.doors = [add(box(1.4, 2.8, 0.06), toon({ color: '#bfe0f5' }), -0.7, 1.45, 0.06, dr, { cast: false }), add(box(1.4, 2.8, 0.06), toon({ color: '#bfe0f5' }), 0.7, 1.45, 0.06, dr, { cast: false })];
    sign('ARRIVALS', 2.2, 0.45, { bg: '#2f9e6e', fg: '#fff', bc: '#fff' }, 0, 3.4, 0.12, dr); sign('FLIGHT 714\n14 HOURS', 1.3, 0.75, { bg: '#10151f', fg: '#ffd23f', bc: '#5b6677', pw: 512, ph: 300, emissive: 0.5 }, 2.6, 2.3, 0.12, dr);
    // ---- the TINY lost-baggage desk (right side, against x=15 wall) ----
    const D = grp(12.2, 0, 4.5, A, -Math.PI / 2); H.deskA = D;
    add(box(0.7, 0.5, 0.42), texM(planks(30, 58, 31), 0.5, 0.5), 0, 0.25, 0, D);
    add(box(0.74, 0.04, 0.46), col('#c9a46a'), 0, 0.52, 0, D);
    add(box(0.22, 0.16, 0.03), col('#2b2b33'), -0.16, 0.64, -0.12, D); add(box(0.19, 0.13, 0.031), toon({ color: '#7cc4ff', emissive: '#7cc4ff', emissiveIntensity: 0.4 }), -0.16, 0.645, -0.105, D, { cast: false }); add(box(0.04, 0.06, 0.04), col('#2b2b33'), -0.16, 0.56, -0.12, D);
    add(cyl(0.035, 0.03, 0.07, 10), col('#fbfaf4'), 0.25, 0.575, 0.05, D); // coffee
    add(sph(0.04, 10, 8), col('#f2c94c'), 0.08, 0.56, 0.1, D).scale.y = 0.6; // bell
    for (let i = 0; i < 6; i++) add(box(0.16, 0.012, 0.22), col(i % 2 ? '#ffffff' : '#f6f1e6'), 0.16, 0.548 + i * 0.012, -0.06, D, { cast: false });
    H.formA = add(box(0.17, 0.006, 0.23), toon({ map: tex(cv(170, 230, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#d64a3a'; g.font = '26px Lilita'; g.fillText('LOST BAG', 14, 34); g.strokeStyle = '#8ab4e8'; g.lineWidth = 3; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(12, 60 + i * 22); g.lineTo(w - 12, 60 + i * 22); g.stroke(); } })) }), -0.02, 0.546, 0.08, D, { cast: false });
    { const stl = grp(0, 0, 0.66, D); add(cyl(0.14, 0.12, 0.24, 12), col('#e8553a'), 0, 0.12, 0, stl); } H.pen = add(cyl(0.008, 0.008, 0.14, 6), col('#3d7fd6'), 0, 0.57, 0.08, D, { cast: false });
    H.refTicket = add(box(0.2, 0.004, 0.09), toon({ map: tex(label('REF #LX-0471-B', { w: 512, h: 230, bg: '#fff6c8', fg: '#c0392b', bc: '#2b2b33' })) }), 0, 0.55, 0.0, D, { cast: false });
    H.folder = grp(0, 0.545, 0.05, D); add(box(0.24, 0.02, 0.3), col('#e2b33a'), 0, 0, 0, H.folder); H.closedStamp = add(box(0.2, 0.003, 0.09), toon({ map: tex(label('CASE CLOSED', { w: 512, h: 230, bg: '#e2b33a', fg: '#c0392b', bc: '#c0392b', border: true })), transparent: true }), 0, 0.012, 0, H.folder, { cast: false }); H.folder.visible = false;
    H.stamp3d = grp(0, 0.8, 0.05, D); add(cyl(0.04, 0.04, 0.16, 10), col('#7a4a22'), 0, 0.1, 0, H.stamp3d); add(sph(0.06, 10, 8), col('#c0392b'), 0, 0.2, 0, H.stamp3d); add(box(0.14, 0.04, 0.08), col('#3a3f52'), 0, 0, 0, H.stamp3d); H.stamp3d.visible = false;
    // the wall behind the desk: LOST BAGGAGE sign, a "WE'LL FIND IT!" banner, a shelf with one lonely bag
    const W2 = grp(14.85, 0, 4.5, A, -Math.PI / 2);
    sign('LOST BAGGAGE', 3.2, 0.62, { bg: '#c0392b', fg: '#ffffff', bc: '#ffffff' }, 0, 3.4, 0, W2);
    plate(label("WE'LL FIND IT!*", { w: 1024, h: 256, bg: '#fff6c8', fg: '#2f8fc9', bc: '#2f8fc9', extra: (g, w, h) => { g.fillStyle = '#7b8494'; g.font = '30px Lilita'; g.fillText('*probably', w - 120, h - 30); } }), 1.8, 0.45, 0.9, 2.45, 0.02, W2);
    add(box(1.4, 0.05, 0.4), col('#9a6a3a'), -1.2, 1.6, 0.2, W2); { const lb = suitcase('#6c7a3a', 0.3, 0.42, 0.2, W2); lb.position.set(-1.5, 1.625, 0.2); const lb2 = duffel('#5ec4d8', 0.5, 0.12, W2); lb2.position.set(-0.95, 1.625, 0.2); }
    H.deskClock = addClock(-0.3, 2.5, 0.03, 0.28, W2);
    // ---- travel shop kiosk (left side, against x=-15 wall) ----
    const K = grp(-12.6, 0, 4.6, A, Math.PI / 2); H.kiosk = K;
    add(box(2.4, 1.0, 0.7), col('#8a4fc0'), 0, 0.5, 0, K); add(box(2.5, 0.06, 0.8), col('#f2c94c'), 0, 1.03, 0, K);
    sign('TRAVEL SHOP', 2.6, 0.5, { bg: '#8a4fc0', fg: '#fff', bc: '#f2c94c' }, 0, 3.3, -2.0, K);
    for (let r = 0; r < 3; r++) add(box(2.6, 0.05, 0.35), col('#c9a46a'), 0, 1.4 + r * 0.6, -2.1, K);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { const c = BAGCOL[(i + r * 3) % 12]; if (r === 0) { add(cyl(0.012, 0.012, 0.22, 6), col(c), -1.2 + i * 0.21, 1.55, -2.1, K, { cast: false }); add(box(0.03, 0.04, 0.02), col('#ffffff'), -1.2 + i * 0.21, 1.68, -2.1, K, { cast: false }); } else if (r === 1) add(new THREE.TorusGeometry(0.11, 0.06, 8, 14, 5.4), col(c), -1.15 + i * 0.21, 2.12, -2.1, K, { rz: 2.0 }); else add(box(0.15, 0.22, 0.1), col(c), -1.15 + i * 0.21, 2.15 + 0.38, -2.1, K); }
    const tsh = (c, x, y, parent, s = 1) => { const sh = new THREE.Shape(); const P_ = [[-0.18, 0.3], [-0.06, 0.34], [0, 0.28], [0.06, 0.34], [0.18, 0.3], [0.34, 0.14], [0.24, 0.04], [0.17, 0.1], [0.17, -0.32], [-0.17, -0.32], [-0.17, 0.1], [-0.24, 0.04], [-0.34, 0.14]]; P_.forEach(([a, b], i) => i ? sh.lineTo(a * s, b * s) : sh.moveTo(a * s, b * s)); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false }); const m = add(g, col(c), x, y, 0, parent); return m; };
    for (let i = 0; i < 4; i++) { const m = tsh(['#fbfaf4', '#f2c94c', '#5ec4d8', '#fbfaf4'][i], -1.05 + i * 0.7, 3.0, K); m.position.z = -2.25; add(sph(0.05, 8, 6), col('#e23b3b'), -1.05 + i * 0.7, 3.06, -2.21, K, { cast: false }); }
    sign('TOOTHBRUSH $9\nT-SHIRT $39', 1.2, 0.6, { bg: '#fff6c8', fg: '#c0392b', bc: '#c0392b', pw: 512, ph: 256 }, 0.9, 1.35, 0.37, K);
    H.shirt3d = tsh('#fbfaf4', 0, 0, A, 1.4); H.shirt3d.visible = false; H.shirtHeart = add(sph(0.07, 8, 6), col('#e23b3b'), 0, 0, 0, A, { cast: false }); H.shirtHeart.visible = false;
    H.brush3d = grp(0, 0, 0, A); add(cyl(0.014, 0.014, 0.26, 8), col('#3dbbe8'), 0, 0, 0, H.brush3d); add(box(0.035, 0.05, 0.025), col('#ffffff'), 0, 0.14, 0.01, H.brush3d); H.brush3d.visible = false;
    H.shirtSign = sign('CHEAP*', 0.7, 0.3, { bg: '#f2c94c', fg: '#c0392b', bc: '#c0392b', pw: 512, ph: 220, extra: (g, w, h) => { g.fillStyle = '#2b2b33'; g.font = '34px Lilita'; g.fillText('*$39', w - 70, h - 26); } }, 0, 0, 0, A); H.shirtSign.visible = false;
    // "LOST THIS YEAR" counter board (on the back wall low)
  }

  // =====================================================================================
  // SET B — the apartment (x 100)
  // =====================================================================================
  const B = grp(100, 0, 0);
  {
    const wall = texM(wallpaper('#f3e3c3', '#e7a86b'), 1, 1);
    room(-4, 4, -4, 4, 3.2, { floor: texM(planks(28, 50, 41), 1, 1), wall, ceil: col('#f4efe6') }, B, { noBack: true, ft: 1.5 });
    // back wall with a window hole (x -1.2..1.2, y 0.9..2.5)
    const bw = texM(wallpaper('#f3e3c3', '#e7a86b'), 1, 1);
    add(tbox(2.8, 3.2, 0.2), bw, -2.6, 1.6, -4.1, B, { cast: false }); add(tbox(2.8, 3.2, 0.2), bw, 2.6, 1.6, -4.1, B, { cast: false });
    add(tbox(2.4, 0.9, 0.2), bw, 0, 0.45, -4.1, B, { cast: false }); add(tbox(2.4, 0.7, 0.2), bw, 0, 2.85, -4.1, B, { cast: false });
    for (const x of [-1.2, 0, 1.2]) add(box(0.08, 1.6, 0.26), col('#fbfaf4'), x, 1.7, -4.1, B, { cast: false });
    for (const y of [0.9, 1.7, 2.5]) add(box(2.48, 0.08, 0.26), col('#fbfaf4'), 0, y, -4.1, B, { cast: false });
    add(box(2.7, 0.06, 0.4), col('#fbfaf4'), 0, 0.88, -3.9, B);
    H.curtains = [add(box(0.5, 2.2, 0.06), col('#d8407a'), -1.5, 1.85, -3.85, B, { cast: false }), add(box(0.5, 2.2, 0.06), col('#d8407a'), 1.5, 1.85, -3.85, B, { cast: false })];
    // outside: street below + city blocks + trees
    add(new THREE.PlaneGeometry(200, 200), texM(asphalt(true), 10, 10), 100, -8, -90, scene, { cast: false, rx: -Math.PI / 2 });
    const r = rngS(52); for (let i = 0; i < 26; i++) { const bx = 60 + r() * 80, bz = -16 - r() * 70, bh = 8 + r() * 30, bw_ = 6 + r() * 8; const b = grp(bx, -8, bz); const cc = ['#d9a066', '#b5523a', '#9fb0bf', '#e9d8b4', '#7d8fae', '#c27b5a'][i % 6]; add(box(bw_, bh, 6), texM(cv(128, 256, (g, w, h) => { g.fillStyle = cc; g.fillRect(0, 0, w, h); for (let y = 10; y < h; y += 26) for (let x = 10; x < w; x += 26) { g.fillStyle = r() < 0.3 ? '#ffe9a8' : '#2b3550'; g.fillRect(x, y, 12, 14); } }), 1, 1), 0, bh / 2, 0, b); add(box(bw_ + 0.4, 0.5, 6.4), col('#5b4a3e'), 0, bh, 0, b); }
    for (let i = 0; i < 8; i++) { const t = grp(88 + i * 3.4, -8, -12 - (i % 2) * 1.5); add(cyl(0.15, 0.2, 3, 8), col('#6a4a32'), 0, 1.5, 0, t); add(sph(1.3, 12, 10), col(i % 2 ? '#5c9238' : '#79b04a'), 0, 3.6, 0, t); }
    // bed (left), nightstand, lamp, alarm clock
    const bed = grp(-2.8, 0, -1.9, B); add(box(1.6, 0.45, 2.3), col('#8a5a3a'), 0, 0.22, 0, bed); add(box(1.55, 0.2, 2.2), col('#fbfaf4'), 0, 0.55, 0, bed); add(box(1.6, 0.22, 1.4), col('#3d7fd6'), 0, 0.6, 0.4, bed); add(box(1.65, 1.0, 0.12), col('#8a5a3a'), 0, 0.6, -1.15, bed); add(box(0.7, 0.16, 0.4), col('#fbfaf4'), 0, 0.72, -0.85, bed).rotation.x = -0.2;
    const ns = grp(-1.6, 0, -3.5, B); add(box(0.55, 0.6, 0.45), col('#a06a3a'), 0, 0.3, 0, ns); add(box(0.4, 0.04, 0.02), col('#5b4a3e'), 0, 0.42, 0.23, ns);
    add(cyl(0.06, 0.12, 0.3, 10), col('#f2c94c'), 0.12, 0.75, -0.05, ns); add(cyl(0.14, 0.2, 0.22, 12), toon({ color: '#fff6c8', emissive: '#fff1b0', emissiveIntensity: 0.5 }), 0.12, 1.0, -0.05, ns);
    H.alarm = grp(-0.12, 0.6, 0.05, ns); add(cyl(0.1, 0.1, 0.06, 16), col('#e8553a'), 0, 0.11, 0, H.alarm, { rx: Math.PI / 2 }); add(cyl(0.085, 0.085, 0.065, 16), col('#fbfaf4'), 0, 0.11, 0.003, H.alarm, { rx: Math.PI / 2, cast: false }); for (const s of [-1, 1]) add(sph(0.045, 10, 8), col('#f2c94c'), s * 0.07, 0.2, 0, H.alarm);
    // desk (right) + laptop with dynamic screen
    const dk = grp(2.9, 0, -3.3, B); add(box(1.6, 0.06, 0.8), col('#c9a46a'), 0, 0.76, 0, dk); for (const s of [-1, 1]) add(box(0.06, 0.76, 0.7), col('#a07a46'), s * 0.75, 0.38, 0, dk);
    add(box(0.42, 0.02, 0.3), col('#9aa3ad'), -0.1, 0.8, 0.1, dk); const scr = grp(-0.1, 0.81, -0.05, dk); scr.rotation.x = -0.25; add(box(0.42, 0.28, 0.02), col('#9aa3ad'), 0, 0.14, 0, scr);
    H.laptopCanvas = cv(256, 170, () => {}); H.laptopTex = tex(H.laptopCanvas); H.laptopScreen = add(box(0.38, 0.24, 0.022), [col('#9aa3ad'), col('#9aa3ad'), col('#9aa3ad'), col('#9aa3ad'), toon({ map: H.laptopTex, emissive: '#ffffff', emissiveMap: H.laptopTex, emissiveIntensity: 0.55 }), col('#9aa3ad')], 0, 0.14, 0.003, scr, { cast: false });
    H.laptopState = '';
    add(cyl(0.05, 0.045, 0.1, 12), col('#3d7fd6'), 0.45, 0.84, 0.1, dk); // mug
    H.steamB = [0, 1, 2].map(() => add(sph(0.04, 8, 6), col('#ffffff'), 0, 0, 0, B, { cast: false }));
    H.cable = add(cyl(0.008, 0.008, 0.5, 6), col('#2b2b33'), 0.25, 0.8, 0.25, dk, { rz: Math.PI / 2, cast: false });
    // wall calendar (right of window) with flipping pages
    const cal = grp(2.4, 1.85, -3.97, B); H.calendar = cal; add(box(0.62, 0.08, 0.04), col('#c0392b'), 0, 0.42, 0, cal); add(box(0.6, 0.8, 0.02), col('#e9e4da'), 0, 0, -0.01, cal);
    const calPage = (t) => toon({ map: tex(label(t, { w: 300, h: 400, bg: '#fbfaf4', fg: '#2b2b33', bc: '#c0392b', fs: 120, extra: (g, w, h) => { g.fillStyle = '#c0392b'; g.fillRect(0, 0, w, 60); g.fillStyle = '#fff'; g.font = '40px Lilita'; g.textAlign = 'center'; g.fillText('WAITING', w / 2, 32); } })) });
    H.calTexts = ['DAY\n1', 'DAY\n2', 'DAY\n3', 'DAY\n5', 'DAY\n9', 'WEEK\n2', 'WEEK\n5', 'MONTH\n2', 'MONTH\n3'];
    H.calMats = H.calTexts.map(calPage);
    H.calFront = add(box(0.56, 0.74, 0.01), [col('#fbfaf4'), col('#fbfaf4'), col('#fbfaf4'), col('#fbfaf4'), H.calMats[0], col('#fbfaf4')], 0, -0.02, 0.012, cal, { cast: false });
    H.calFlip = grp(0, 0.35, 0.02, cal); H.calFlipPage = add(box(0.56, 0.74, 0.01), [col('#fbfaf4'), col('#fbfaf4'), col('#fbfaf4'), col('#fbfaf4'), H.calMats[0], col('#e9e4da')], 0, -0.37, 0, H.calFlip, { cast: false });
    // "MISSING" poster of the bag + wall clock
    plate(label('MISSING', { w: 384, h: 512, bg: '#fff6c8', fg: '#c0392b', bc: '#2b2b33', fs: 80, extra: (g, w, h) => { g.fillStyle = '#e8553a'; g.fillRect(w / 2 - 70, 150, 140, 190); g.strokeStyle = '#2b2b33'; g.lineWidth = 8; g.strokeRect(w / 2 - 70, 150, 140, 190); g.fillStyle = '#2f9e6e'; g.fillRect(w / 2 - 70, 230, 140, 22); g.fillStyle = '#2b2b33'; g.font = '44px Lilita'; g.textAlign = 'center'; g.fillText('REWARD: $5', w / 2, 420); } }), 0.5, 0.66, -3.98, 1.8, -1.2, B, Math.PI / 2);
    H.clockB = addClock(-2.3, 2.45, -3.98, 0.24, B);
    plant(3.6, 0.5, 1.0, B); plant(-3.6, 3.4, 0.9, B);
    add(box(2.2, 0.01, 1.6), texM(carpet('#c0632f', '#e2b33a'), 2, 2), 0, 0.005, 0.3, B, { cast: false }); // rug
    add(box(0.9, 0.5, 0.5), col('#2f8fc9'), 1.6, 0.25, 2.6, B); // pouf (foreground)
    // a 3D smartphone the hero holds, plus the email envelope
    H.phone = grp(0, 0, 0, B); add(box(0.09, 0.17, 0.012), col('#22232b'), 0, 0, 0, H.phone); H.phoneScr = add(box(0.075, 0.15, 0.013), toon({ color: '#7cc4ff', emissive: '#7cc4ff', emissiveIntensity: 0.5 }), 0, 0, 0.001, H.phone, { cast: false }); H.phone.visible = false;
    H.env = grp(0, 0, 0, scene); add(box(0.5, 0.32, 0.02), col('#fbfaf4'), 0, 0, 0, H.env); const fl = new THREE.Shape(); fl.moveTo(-0.25, 0); fl.lineTo(0.25, 0); fl.lineTo(0, -0.18); fl.closePath(); H.envFlap = add(new THREE.ExtrudeGeometry(fl, { depth: 0.01, bevelEnabled: false }), col('#efe3c4'), 0, 0.16, 0.012, H.env); add(cyl(0.035, 0.035, 0.012, 14), col('#c0392b'), 0, 0.02, 0.03, H.env, { rx: Math.PI / 2 });
    H.letter = add(box(0.42, 0.5, 0.006), [col('#fff'), col('#fff'), col('#fff'), col('#fff'), toon({ map: tex(label("WE'RE\nSORRY :(", { w: 420, h: 500, bg: '#ffffff', fg: '#2f8fc9', bc: '#2f8fc9', fs: 110 })) }), col('#fff')], 0, 0, -0.005, H.env, { cast: false });
    H.cheque = add(box(0.5, 0.22, 0.006), [col('#d9f2c4'), col('#d9f2c4'), col('#d9f2c4'), col('#d9f2c4'), toon({ map: tex(label('CLAIM PAID: $150', { w: 700, h: 300, bg: '#d9f2c4', fg: '#2b6b2f', bc: '#2b6b2f' })) }), col('#d9f2c4')], 0, 0, -0.01, H.env, { cast: false });
    H.env.visible = false;
  }

  // =====================================================================================
  // SET C — airline call centre (x 200)
  // =====================================================================================
  const C = grp(200, 0, 0);
  {
    room(-7, 7, -3.5, 4, 3.2, { floor: texM(carpet('#4a5a7a', '#5d6f93'), 4, 4), wall: texM(paintWall('#dfe7ee', '#2f9e6e', 61)), ceil: col('#eef0f4') }, C);
    ceilingLights(-6, 6, -2.5, 3, 3.2, 3, C);
    sign('CUSTOMER CARE ♥', 4.2, 0.6, { bg: '#2f9e6e', fg: '#ffffff', bc: '#ffffff' }, 0, 2.6, -3.38, C);
    plate(label("SMILE!\nYOU'RE ON HOLD", { w: 512, h: 512, bg: '#f2c94c', fg: '#2b2b33', bc: '#2b2b33' }), 0.9, 0.9, -4.8, 1.9, -3.38, C);
    H.clockC = addClock(4.6, 2.2, -3.38, 0.3, C);
    const scrCv = label('SAY:\n"WE ARE STILL\nSEARCHING."', { w: 400, h: 300, bg: '#16324f', fg: '#7cf5b0', bc: '#5b6677', fs: 70 });
    const scrM = toon({ map: tex(scrCv), emissive: '#ffffff', emissiveMap: tex(scrCv), emissiveIntensity: 0.65 });
    const fab = texM(fabric('#7d8fae'), 1, 1);
    for (let i = 0; i < 5; i++) { const x = -5 + i * 2.5, cub = grp(x, 0, -0.8, C);
      add(box(2.3, 0.05, 0.9), col('#e9e4da'), 0, 0.75, -0.5, cub); for (const s of [-1, 1]) add(box(0.05, 0.75, 0.8), col('#9aa3ad'), s * 1.05, 0.375, -0.5, cub);
      add(box(2.4, 1.4, 0.08), fab, 0, 0.7, -1.0, cub); add(box(0.08, 1.4, 1.9), fab, 1.2, 0.7, -0.1, cub); add(box(2.45, 0.06, 0.12), col('#5b6677'), 0, 1.42, -1.0, cub);
      add(box(0.62, 0.42, 0.04), col('#2b2b33'), 0, 1.06, -0.72, cub); add(box(0.56, 0.36, 0.045), scrM, 0, 1.06, -0.7, cub, { cast: false }); add(box(0.08, 0.22, 0.06), col('#2b2b33'), 0, 0.86, -0.75, cub);
      add(box(0.5, 0.02, 0.18), col('#3a3f52'), 0, 0.79, -0.4, cub); add(cyl(0.04, 0.035, 0.09, 10), col(BAGCOL[i * 2]), 0.6, 0.82, -0.5, cub);
      const ch = grp(0, 0, 0.35, cub); add(box(0.55, 0.08, 0.5), col('#2b2b33'), 0, 0.46, 0, ch); add(box(0.55, 0.6, 0.08), col('#2b2b33'), 0, 0.8, 0.25, ch); add(cyl(0.04, 0.04, 0.4, 8), col('#5b6677'), 0, 0.22, 0, ch);
      plate(label(['HOLD MUSIC\n8 HRS', 'SCRIPT\nV.47', 'BE NICE', 'NO\nREFUNDS', "DON'T\nPROMISE"][i], { w: 256, h: 256, bg: ['#fff6c8', '#ffd6e8', '#d6f2ff', '#e2f5d0', '#fff6c8'][i], fg: '#2b2b33', bc: '#2b2b33' }), 0.3, 0.3, -0.75, 1.05, -0.95, cub);
    }
    plant(-6.4, 3.4, 1.1, C); plant(6.4, 3.4, 1.1, C);
  }

  // =====================================================================================
  // SET D — airline warehouse of unclaimed bags (x 300)
  // =====================================================================================
  const Dg = grp(300, 0, 0);
  {
    room(-14, 14, -12, 12, 11, { floor: texM(concrete('#b9b7b0', 71), 1, 1), wall: texM(corrugated('#9fb0bf'), 6, 2), ceil: col('#8a95a3') }, Dg, { noFront: true, ft: 3, wt: 2 });
    // front wall with a big dock door opening (x -3..3, y 0..5)
    const cw = texM(corrugated('#9fb0bf'), 3, 2);
    add(tbox(11, 11, 0.2), cw, -8.5, 5.5, 12.1, Dg, { cast: false }); add(tbox(11, 11, 0.2), cw, 8.5, 5.5, 12.1, Dg, { cast: false }); add(tbox(6, 6, 0.2), cw, 0, 8, 12.1, Dg, { cast: false });
    add(box(6.2, 0.3, 0.3), col('#f2c94c'), 0, 5.1, 12.0, Dg); for (const s of [-1, 1]) add(box(0.3, 5, 0.3), col('#f2c94c'), s * 3.1, 2.5, 12.0, Dg);
    ceilingLights(-12, 12, -10, 10, 11, 4, Dg);
    for (let x = -12; x <= 12; x += 6) add(box(0.3, 0.6, 24), col('#5b6677'), x, 10.6, 0, Dg, { cast: false });
    // racks of bags: merged mesh
    const list = []; const r = rngS(88);
    const rackRow = (z, x0, x1, levels = 4) => { for (let x = x0; x <= x1; x += 2.4) { for (let l = 0; l < levels; l++) { const y = 0.25 + l * 1.5; let px = x - 1.05; while (px < x + 1.0) { const w = 0.3 + r() * 0.25, h = 0.45 + r() * 0.5, d = 0.25 + r() * 0.15; if (!(l === 1 && z === -5.5 && Math.abs(px - 0) < 0.6)) list.push({ x: px + w / 2, y: y + h / 2 + 0.06, z: z + (r() - 0.5) * 0.15, w, h, d, c: BAGCOL[(r() * 12) | 0], ry: (r() - 0.5) * 0.2 }); px += w + 0.04; } } } };
    const RZ = [-10, -5.5, 0.5, 5];
    for (const z of RZ) { rackRow(z, -11, 11); for (let x = -12.2; x <= 12.2; x += 2.4) for (const dz of [-0.45, 0.45]) add(box(0.1, 6.2, 0.1), col('#e8792f'), x, 3.1, z + dz, Dg, { cast: false }); for (let l = 0; l < 4; l++) for (const dz of [-0.45, 0.45]) add(box(24.4, 0.08, 0.1), col('#2f5fa8'), 0, 0.25 + l * 1.5, z + dz, Dg, { cast: false }); for (let l = 0; l < 4; l++) add(box(24.4, 0.03, 0.9), col('#9aa3ad'), 0, 0.29 + l * 1.5, z, Dg, { cast: false }); }
    add(mergedBoxes(list), vcMat, 0, 0, 0, Dg);
    // the hero's bag on the second shelf of row z=-5.5, at x=0
    H.heroBagD = H.heroBag(Dg); H.heroBagD.position.set(0, 1.81, -5.35); H.heroBagD.rotation.y = 0;
    // x-ray contents (hidden until the dive)
    H.xray = grp(0, 1.81, -5.35, Dg); { const xr = H.xray;
      add(box(0.12, 0.05, 0.08), col('#2b2b33'), -0.1, 0.12, 0, xr); add(new THREE.TorusGeometry(0.06, 0.008, 6, 16), col('#2b2b33'), -0.1, 0.22, 0, xr, { cast: false }); add(box(0.03, 0.02, 0.03), col('#9aa3ad'), -0.03, 0.12, 0, xr);
      const jk = grp(0.08, 0.4, 0.02, xr); { const sh = new THREE.Shape(); const P_ = [[-0.06, 0.13], [0, 0.09], [0.06, 0.13], [0.11, 0.11], [0.2, -0.08], [0.15, -0.1], [0.09, 0.0], [0.09, -0.15], [-0.09, -0.15], [-0.09, 0.0], [-0.15, -0.1], [-0.2, -0.08], [-0.11, 0.11]]; P_.forEach(([a, b], i) => i ? sh.lineTo(a, b) : sh.moveTo(a, b)); sh.closePath(); add(new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false }), texM(cord(), 6, 6), 0, 0, -0.02, jk); for (const s_ of [-1, 1]) add(box(0.03, 0.12, 0.01), col('#7a4a22'), s_ * 0.035, 0.05, 0.025, jk, { rz: s_ * 0.35 }); add(box(0.035, 0.035, 0.01), col('#3d7fd6'), 0.05, -0.06, 0.025, jk); }
      const gift = grp(-0.05, 0.6, 0, xr); add(box(0.2, 0.14, 0.16), col('#d8407a'), 0, 0, 0, gift); add(box(0.04, 0.145, 0.165), col('#f2c94c'), 0, 0, 0, gift, { cast: false }); add(box(0.205, 0.145, 0.04), col('#f2c94c'), 0, 0, 0, gift, { cast: false }); for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.035, 0.012, 6, 12), col('#f2c94c'), s * 0.03, 0.09, 0, gift, { rz: s * 0.6, cast: false });
      H.giftTag = sign('FOR MUM ♥', 0.14, 0.07, { bg: '#fbfaf4', fg: '#d8407a', bc: '#d8407a', d: 0.006, pw: 512, ph: 256 }, 0.1, 0.05, 0.09, gift); xr.visible = false; }
    H.xrayShell = add(box(0.52, 0.72, 0.3), new THREE.MeshBasicMaterial({ color: '#7fe8ff', transparent: true, opacity: 0.1, depthWrite: false }), 0, 2.17, -5.35, Dg, { cast: false, noink: true }); H.xrayShell.visible = false;
    H.xrayEdges = new THREE.LineSegments(new THREE.EdgesGeometry(box(0.52, 0.72, 0.3)), new THREE.LineBasicMaterial({ color: '#bff6ff' })); H.xrayEdges.position.set(300, 2.17, -5.35); H.xrayEdges.userData.ndSkip = true; scene.add(H.xrayEdges); H.xrayEdges.visible = false;
    // sign wall: LOST BAGS (letters fall off) + UNCLAIMED 90 DAYS + counter
    H.lostLetters = []; ['L', 'O', 'S', 'T'].forEach((ch, i) => { const m = sign(ch, 0.9, 1.1, { bg: '#c0392b', fg: '#ffffff', bc: '#ffffff', pw: 256, ph: 320, d: 0.15, cast: true }, -4.8 + i * 1.0, 8.4, -11.8, Dg); m.userData.p0 = m.position.clone(); H.lostLetters.push(m); });
    sign('BAGS', 3.6, 1.1, { bg: '#c0392b', fg: '#ffffff', bc: '#ffffff', d: 0.15 }, 0.2 + 1.5, 8.4, -11.8, Dg);
    sign('UNCLAIMED — 90 DAYS', 5.2, 0.8, { bg: '#1f2a44', fg: '#f2c94c', bc: '#f2c94c' }, 0, 7.0, -11.85, Dg);
    H.counterCv = cv(1024, 300, () => {}); H.counterTex = tex(H.counterCv); H.counterVal = -1;
    H.counter = add(box(5.6, 1.6, 0.12), [col('#2b2b33'), col('#2b2b33'), col('#2b2b33'), col('#2b2b33'), toon({ map: H.counterTex, emissive: '#ffffff', emissiveMap: H.counterTex, emissiveIntensity: 0.5 }), col('#2b2b33')], 7.2, 8.2, -11.8, Dg, { cast: false });
    // forklift + pallet + dumpster + office
    const fk = grp(-8.5, 0, 2.8, Dg, 0.4); add(box(1.4, 0.9, 2.0), col('#f2c94c'), 0, 0.75, 0, fk); add(box(1.3, 0.1, 1.0), col('#2b2b33'), 0, 2.0, -0.2, fk); for (const s of [-1, 1]) add(box(0.08, 1.8, 0.08), col('#2b2b33'), s * 0.6, 1.1, 0.5, fk); for (const s of [-1, 1]) add(box(0.08, 3, 0.1), col('#5b6677'), s * 0.4, 1.5, -1.05, fk); for (const s of [-1, 1]) add(box(0.12, 0.06, 1.1), col('#5b6677'), s * 0.3, 0.2, -1.6, fk); for (const s of [-1, 1]) for (const t of [-1, 1]) add(cyl(0.3, 0.3, 0.25, 12), col('#22222a'), s * 0.72, 0.3, t * 0.65, fk, { rz: Math.PI / 2 });
    H.dumpster = grp(-5, 0, 8.5, Dg); add(box(2.6, 1.3, 1.5), col('#2f7a4a'), 0, 0.7, 0, H.dumpster); H.dLid = add(box(2.7, 0.08, 1.6), col('#25603a'), 0, 1.38, 0, H.dumpster); sign('TRASH', 1.2, 0.4, { bg: '#2f7a4a', fg: '#fff', bc: '#fff' }, 0, 0.75, 0.77, H.dumpster);
    for (let i = 0; i < 5; i++) { const s = suitcase(BAGCOL[(i * 3 + 2) % 12], 0.45, 0.6, 0.26, Dg); s.position.set(-1.8 + i * 0.55, 0.0, 8.8); s.rotation.y = (i - 2) * 0.1; }
    // truck at the dock (outside)
    add(new THREE.PlaneGeometry(40, 30), texM(asphalt(false), 4, 3), 300, -0.01, 27, scene, { cast: false, rx: -Math.PI / 2 });
    const trk = grp(0, 0, 18, Dg); add(box(5.6, 4.2, 10), col('#fbfaf4'), 0, 2.6, 0, trk); add(box(5.2, 3.8, 0.1), col('#3a3f52'), 0, 2.6, -5.0, trk, { cast: false });
    sign('LOST BAG OUTLET · ALABAMA', 9, 1.2, { bg: '#c0392b', fg: '#fff', bc: '#f2c94c' }, 2.82, 3.0, 0, trk, Math.PI / 2);
    for (let l = 0; l < 3; l++) for (let i = 0; i < 6; i++) { const s = suitcase(BAGCOL[(i + l * 4) % 12], 0.6, 0.85, 0.35, trk); s.position.set(-2.2 + i * 0.85, 0.5 + l * 1.05, -4.4 + (i % 2) * 0.3); }
    add(box(5.8, 0.4, 3), col('#e9e4da'), 0, 2.2, 7.5, trk); add(box(5.4, 2.8, 2.6), col('#c0392b'), 0, 2.9, 7.3, trk); for (const z of [-3.5, 3.5, 7.5]) for (const s of [-1, 1]) add(cyl(0.55, 0.55, 0.4, 14), col('#22222a'), s * 2.6, 0.55, z, trk, { rz: Math.PI / 2 });
    // little office corner
    sign('OFFICE', 1.4, 0.4, { bg: '#fff6c8', fg: '#2b2b33', bc: '#2b2b33' }, 11.5, 3.3, 9.8, Dg, Math.PI);
    H.clockD = addClock(-13.85, 6, 3, 0.6, Dg, Math.PI / 2);
    H.flashBeam = add(new THREE.ConeGeometry(0.55, 2.2, 18, 1, true), new THREE.MeshBasicMaterial({ color: '#fff3a0', transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide }), 0, 0, 0, scene, { cast: false, noink: true }); H.flashBeam.visible = false;
    H.mug = grp(0, 0, 0, scene); add(cyl(0.06, 0.05, 0.12, 12), col('#fbfaf4'), 0, 0, 0, H.mug); add(new THREE.TorusGeometry(0.035, 0.01, 6, 10), col('#fbfaf4'), 0.065, 0, 0, H.mug); H.mug.visible = false;
    H.bagThrow = H.heroBag(scene); H.bagThrow.visible = false;
  }

  // =====================================================================================
  // SET F — outlet store interior (x 700)
  // =====================================================================================
  const F = grp(700, 0, 0);
  {
    room(-20, 20, -14, 10, 6.5, { floor: texM(tiles('#efe9dc', '#e2d9c6', '#b9ae98', 3, 91), 1, 1), wall: texM(paintWall('#f6eedc', '#c0392b', 92), 1, 1), ceil: col('#e9e6df') }, F, { ft: 3 });
    ceilingLights(-18, 18, -12, 8, 6.5, 4, F);
    // clothes racks with garments (merged)
    const garments = []; const r = rngS(93); const GC = ['#3d7fd6', '#2f9e6e', '#8a4fc0', '#e2b33a', '#d8407a', '#3a3f52', '#5ec4d8', '#c94a4a', '#f0e6d2', '#6c7a3a', '#e86f4a'];
    const rack = (x, z, len = 3, ry = 0, skipMid = false) => { const g = grp(x, 0, z, F, ry); add(cyl(0.025, 0.025, len, 8), col('#9aa3ad'), 0, 1.55, 0, g, { rz: Math.PI / 2 }); for (const s of [-1, 1]) { add(cyl(0.025, 0.025, 1.55, 8), col('#9aa3ad'), s * len / 2, 0.78, 0, g); add(box(0.06, 0.04, 0.7), col('#9aa3ad'), s * len / 2, 0.02, 0, g); }
      for (let p = -len / 2 + 0.12; p < len / 2 - 0.1; p += 0.11) { if (skipMid && Math.abs(p) < 0.25) continue; const c = GC[(r() * GC.length) | 0], h = 0.75 + r() * 0.25; const cs = Math.cos(ry), sn = Math.sin(ry); garments.push({ x: x + p * cs, y: 1.5 - h / 2, z: z - p * sn, w: 0.05, h, d: 0.55, c, ry }); garments.push({ x: x + p * cs, y: 1.49, z: z - p * sn, w: 0.04, h: 0.04, d: 0.3, c: '#2b2b33', ry }); } return g; };
    for (const [x, z] of [[-14, -8], [-9, -8], [-4, -8], [4, -8], [9, -8], [14, -8], [-14, -3.5], [-9, -3.5], [9, -3.5], [14, -3.5]]) rack(x, z, 3.4);
    H.rackEarl = rack(0, -3.5, 3.4, 0, true);
    rack(-2.3, 1.0, 2.4); rack(2.4, 0.4, 2.4);
    add(mergedBoxes(garments), vcMat, 0, 0, 0, F);
    const hangS = (t, x, z, bg, w = 3) => { const m = sign(t, w, 0.6, { bg, fg: '#fff', bc: '#fff' }, x, 4.6, z, F); for (const s of [-1, 1]) add(cyl(0.012, 0.012, 1.6, 6), col('#5b6677'), x + s * w * 0.4, 5.7, z, F, { cast: false }); return m; };
    hangS('JACKETS $20', 0, -5.5, '#c0392b', 3.4); hangS('HEADPHONES', -11, -5.5, '#2f8fc9'); hangS('SUITCASES', 11, -5.5, '#2f9e6e');
    H.endSign = hangS('LOST & FOUND & SOLD', 6.0, 1.2, '#8a4fc0', 4.6);
    // tables of electronics
    for (const [x, z] of [[-11, 1], [-6, 3.5], [6, 3.5]]) { const t = grp(x, 0, z, F); add(box(2.4, 0.08, 1.2), col('#c9a46a'), 0, 0.85, 0, t); for (const s of [-1, 1]) for (const u of [-1, 1]) add(box(0.08, 0.85, 0.08), col('#7a5434'), s * 1.1, 0.42, u * 0.5, t);
      for (let i = 0; i < 4; i++) { add(new THREE.TorusGeometry(0.11, 0.03, 8, 16, Math.PI), col(BAGCOL[(i + x) & 7]), -0.9 + i * 0.55, 0.9, 0.25, t, { cast: false }); for (const s of [-1, 1]) add(cyl(0.05, 0.05, 0.05, 12), col('#2b2b33'), -0.9 + i * 0.55 + s * 0.11, 0.92, 0.25, t, { rz: Math.PI / 2, cast: false }); }
      for (let i = 0; i < 3; i++) { add(box(0.4, 0.02, 0.28), col('#9aa3ad'), -0.7 + i * 0.7, 0.9, -0.25, t); const sc = add(box(0.4, 0.26, 0.02), col('#3a3f52'), -0.7 + i * 0.7, 1.03, -0.39, t); }
      sign('$20', 0.4, 0.24, { bg: '#fff6c8', fg: '#c0392b', bc: '#c0392b', pw: 256, ph: 154 }, 0.9, 0.98, 0.5, t, 0); }
    // big bin of fresh-arrival bags + the ceiling chute (ending spectacle)
    const pile = []; const r2 = rngS(95); for (let i = 0; i < 180; i++) { const a = r2() * 6.28, rr = Math.sqrt(r2()) * 3.2, h0 = (1 - rr / 3.4) * 2.4; pile.push({ x: 8 + Math.cos(a) * rr, y: Math.max(0.2, h0 * r2() + 0.2), z: 4 + Math.sin(a) * rr * 0.8, w: 0.4 + r2() * 0.3, h: 0.3 + r2() * 0.3, d: 0.5 + r2() * 0.3, c: BAGCOL[(r2() * 12) | 0], ry: r2() * 3 }); }
    H.pile = add(mergedBoxes(pile), vcMat, 0, 0, 0, F); H.pile.position.set(0, 0, 0);
    const binG = grp(8, 0, 4, F); for (const s of [-1, 1]) { add(box(7.2, 0.9, 0.15), col('#2f8fc9'), 0, 0.45, s * 2.9, binG); add(box(0.15, 0.9, 5.8), col('#2f8fc9'), s * 3.6, 0.45, 0, binG); }
    sign('FRESH FROM THE AIRPORT', 3.4, 0.5, { bg: '#2f8fc9', fg: '#fff', bc: '#f2c94c' }, 0, 0.5, 2.99, binG);
    const chute = grp(8, 0, 4, F); add(cyl(0.9, 0.9, 1.6, 20, 1, true), col('#9aa3ad'), 0, 5.8, 0, chute); add(cyl(1.0, 1.0, 0.15, 20), col('#5b6677'), 0, 5.0, 0, chute);
    H.fallBags = []; for (let i = 0; i < 16; i++) { const b = suitcase(BAGCOL[(i * 7) % 12], 0.45, 0.62, 0.28, scene); b.visible = false; H.fallBags.push(b); }
    // display shelf with the hero's bag + spotlight
    const ds = grp(-1.5, 0, 6.5, F); add(box(1.4, 0.9, 0.9), col('#3a3f52'), 0, 0.45, 0, ds); add(box(1.5, 0.06, 1.0), col('#f2c94c'), 0, 0.92, 0, ds);
    H.heroBagF = H.heroBag(F); H.heroBagF.position.set(-1.5, 0.95, 6.5); H.heroBagF.rotation.y = 0.25; H.heroBagF.userData.tag.visible = false;
    H.spot = add(new THREE.ConeGeometry(0.9, 4.6, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#fff6c8', transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }), -1.5, 3.25, 6.5, F, { cast: false, noink: true });
    H.priceTagF = grp(0, 0, 0, F); H.ptFront = sign('YOURS', 0.32, 0.18, { bg: '#fbfaf4', fg: '#2b2b33', bc: '#2b2b33', d: 0.012, pw: 512, ph: 288 }, 0, 0, 0.007, H.priceTagF); H.ptBack = sign('$20', 0.32, 0.18, { bg: '#fff6c8', fg: '#c0392b', bc: '#c0392b', d: 0.012, pw: 512, ph: 288 }, 0, 0, -0.007, H.priceTagF, Math.PI);
    H.priceTagF.position.set(-1.38, 1.5, 6.82);
    // mirror: frame + pale glass + the reflection room behind it (the reflected card stands in there)
    const mr = grp(3.2, 0, -1.6, F, -0.35); H.mirror = mr;     add(box(1.2, 0.1, 0.14), col('#7a5434'), 0, 2.4, 0, mr); add(box(1.2, 0.1, 0.14), col('#7a5434'), 0, 0.1, 0, mr); for (const s of [-1, 1]) add(box(0.1, 2.4, 0.14), col('#7a5434'), s * 0.6, 1.25, 0, mr);
    for (const s of [-1, 1]) add(box(0.05, 2.3, 1.6), col('#cfe6f2'), s * 0.56, 1.25, -0.8, mr, { cast: false }); add(box(1.1, 2.3, 0.05), col('#cfe6f2'), 0, 1.25, -1.6, mr, { cast: false }); add(box(1.1, 0.05, 1.6), col('#b8d6e6'), 0, 0.15, -0.8, mr, { cast: false });
    add(new THREE.PlaneGeometry(1.1, 2.2), new THREE.MeshBasicMaterial({ color: '#e8f6ff', transparent: true, opacity: 0.18, depthWrite: false }), 0, 1.25, 0.02, mr, { cast: false, noink: true });
    add(box(0.25, 0.02, 0.6), col('#7a5434'), 0, 0.05, 0.3, mr);
    // the price tag on Earl's sleeve (positioned per frame)
    H.sleeveTag = grp(0, 0, 0, scene); H.stFront = sign('JACKET', 0.22, 0.13, { bg: '#fbfaf4', fg: '#2b2b33', bc: '#2b2b33', d: 0.008, pw: 512, ph: 300 }, 0, 0, 0.005, H.sleeveTag); H.stBack = sign('$20', 0.22, 0.13, { bg: '#fff6c8', fg: '#c0392b', bc: '#c0392b', d: 0.008, pw: 512, ph: 300 }, 0, 0, -0.005, H.sleeveTag, Math.PI); add(cyl(0.003, 0.003, 0.12, 4), col('#2b2b33'), 0, 0.12, 0, H.sleeveTag, { cast: false }); H.sleeveTag.visible = false;
    // checkout with cash register
    const co = grp(-13, 0, 6, F, 0.3); add(box(3, 1.0, 0.9), col('#c0392b'), 0, 0.5, 0, co); add(box(3.1, 0.06, 1.0), col('#fbfaf4'), 0, 1.03, 0, co);
    H.reg = grp(0, 1.06, 0, co); add(box(0.6, 0.3, 0.5), col('#3a3f52'), 0, 0.2, 0, H.reg); add(box(0.5, 0.14, 0.05), toon({ map: tex(label('$20.00', { w: 400, h: 140, bg: '#16324f', fg: '#7cf5b0', bc: '#5b6677' })), emissive: '#ffffff', emissiveIntensity: 0.4, emissiveMap: tex(label('$20.00', { w: 400, h: 140, bg: '#16324f', fg: '#7cf5b0', bc: '#5b6677' })) }), 0, 0.5, 0, H.reg, { rx: -0.3 }); add(box(0.1, 0.3, 0.1), col('#3a3f52'), 0, 0.42, 0, H.reg);
    H.drawer = add(box(0.55, 0.1, 0.45), col('#5b6677'), 0, 0.02, 0.05, H.reg); sign('CHECKOUT', 2.0, 0.4, { bg: '#f2c94c', fg: '#2b2b33', bc: '#2b2b33' }, 0, 2.6, -0.4, co);
    H.soldSign = sign('SOLD!', 1.0, 0.45, { bg: '#c0392b', fg: '#fff', bc: '#f2c94c' }, 0, 0, 0, scene); H.soldSign.visible = false;
    for (const [x, z] of [[-18.5, 8.5], [18.5, 8.5], [-18.5, -12.5], [18.5, -12.5]]) plant(x, z, 1.3, F);
    H.clockF = addClock(-19.85, 4.6, -2, 0.5, F, Math.PI / 2);
    plate(label('BOUGHT FROM\nAIRLINES\nBY THE TRUCKLOAD', { w: 768, h: 512, bg: '#fff6c8', fg: '#2b2b33', bc: '#c0392b' }), 2.4, 1.6, 19.85, 3.2, -2, F, -Math.PI / 2);
  }

  // =====================================================================================
  // SET E — small-town Alabama + the store the size of a city block (x 1000)
  // =====================================================================================
  const E = grp(1000, 0, 0);
  {
    add(new THREE.PlaneGeometry(520, 700), texM(grassT(), 52, 70), 0, -0.02, 0, E, { cast: false, rx: -Math.PI / 2 });
    add(new THREE.PlaneGeometry(110, 34), texM(asphalt(false), 11, 4), 0, 0.0, 6, E, { cast: false, rx: -Math.PI / 2 }); // parking lot
    for (let x = -50; x <= 50; x += 3.2) add(box(0.12, 0.012, 4.5), col('#f4f4f4'), x, 0.01, 2, E, { cast: false });
    add(new THREE.PlaneGeometry(500, 9), texM(asphalt(true), 50, 1), 0, 0.01, 30, E, { cast: false, rx: -Math.PI / 2 }); // road
    // the store: 90 m long block
    const st = grp(0, 0, -28, E);
    add(tbox(90, 10, 30, 3), texM(brick('#c46a4a', '#e9dcc4', 96), 1, 1), 0, 5, 0, st);
    add(box(91, 0.8, 31), col('#e9e4da'), 0, 10.2, 0, st);
    for (let x = -40; x <= 40; x += 8) { if (Math.abs(x) < 6) continue; add(box(5, 3, 0.2), col('#3a5a7a'), x, 2.2, 15.05, st, { cast: false }); add(box(5.2, 0.25, 0.4), col('#e9e4da'), x, 3.8, 15.1, st); }
    add(box(10, 5, 0.3), col('#2b3550'), 0, 2.5, 15.05, st, { cast: false }); add(box(9.4, 4.4, 0.32), col('#9fd0f0'), 0, 2.3, 15.05, st, { cast: false });
    add(box(14, 0.4, 3.5), col('#c0392b'), 0, 5.6, 16.6, st); for (const s of [-1, 1]) add(cyl(0.12, 0.12, 5.4, 8), col('#e9e4da'), s * 6.5, 2.7, 18.1, st);
    H.storeSign = sign('LOST BAG OUTLET', 34, 4.2, { bg: '#fbfaf4', fg: '#c0392b', bc: '#c0392b', stroke: '#2b2b33', d: 0.4, cast: true }, 0, 8.0, 15.4, st);
    sign('EVERYTHING FROM LOST LUGGAGE', 18, 1.3, { bg: '#2f5fa8', fg: '#fff', bc: '#f2c94c' }, 0, 6.5, 18.4, st);
    sign('OPEN', 2.2, 0.8, { bg: '#2f9e6e', fg: '#fff', bc: '#fff' }, 3.6, 4.6, 18.4, st);
    // pickup trucks
    const pickup = (c, x, z, ry, parent = E) => { const g = grp(x, 0, z, parent, ry); add(box(1.9, 0.75, 4.8), col(c), 0, 0.85, 0, g); add(box(1.8, 0.75, 1.7), col(c), 0, 1.6, 0.5, g); add(box(1.7, 0.6, 1.6), col('#bfe0f5'), 0, 1.62, 0.52, g, { cast: false }); for (const s of [-1, 1]) for (const t of [-1.5, 1.5]) add(cyl(0.4, 0.4, 0.3, 12), col('#22222a'), s * 0.95, 0.4, t, g, { rz: Math.PI / 2 }); add(box(1.95, 0.2, 0.1), col('#d0d4d8'), 0, 0.6, 2.42, g); return g; };
    const PC = ['#c0392b', '#2f5fa8', '#f0e6d2', '#2f9e6e', '#3a3f52', '#e2b33a', '#8a4fc0', '#e86f4a'];
    for (let i = 0; i < 18; i++) { const x = -46 + i * 5.4 + (i % 3) * 0.3; if (Math.abs(x) < 7) continue; pickup(PC[i % 8], x, i % 2 ? 6 : -2, i % 2 ? Math.PI : 0); }
    H.pickupDrive = pickup('#c0392b', 0, 30, Math.PI / 2);
    // lamp posts, flags, trees, water tower, welcome sign, hills
    for (let x = -45; x <= 45; x += 15) { add(cyl(0.12, 0.15, 7, 8), col('#5b6677'), x, 3.5, 13, E); add(box(1.2, 0.2, 0.4), col('#5b6677'), x + 0.5, 7, 13, E); }
    H.flags = []; for (const x of [-12, -9]) { add(cyl(0.08, 0.08, 9, 8), col('#e9e4da'), x, 4.5, 16, E); const fl = add(new THREE.PlaneGeometry(2.4, 1.4, 10, 4), toon({ map: tex(cv(256, 150, (g, w, h) => { for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#fff' : '#c0392b'; g.fillRect(0, i * h / 7, w, h / 7 + 1); } g.fillStyle = '#2f5fa8'; g.fillRect(0, 0, w * 0.42, h * 0.55); })), side: THREE.DoubleSide }), x + 1.2, 8.2, 16, E, { cast: false }); fl.userData.base = fl.geometry.attributes.position.array.slice(); H.flags.push(fl); }
    const tree = (x, z, s = 1) => { const t = grp(x, 0, z, E); add(cyl(0.25 * s, 0.35 * s, 3 * s, 8), col('#6a4a32'), 0, 1.5 * s, 0, t); for (let i = 0; i < 3; i++) add(sph((1.9 - i * 0.3) * s, 12, 10), col(['#4f8a35', '#5c9a3e', '#6cb04a'][i]), (i - 1) * 0.6 * s, (3.6 + i * 0.9) * s, (i % 2) * 0.4 * s, t); return t; };
    const r = rngS(101); for (let i = 0; i < 40; i++) { const x = (r() - 0.5) * 220, z = -50 - r() * 70; tree(x, z, 1 + r() * 0.8); } for (let i = 0; i < 18; i++) { const x = (r() - 0.5) * 200; if (Math.abs(x) < 56) continue; tree(x, 20 - r() * 40, 1 + r() * 0.6); } for (let i = 0; i < 14; i++) tree(-60 + i * 9, 40 + r() * 6, 0.9 + r() * 0.5);
    const wt = grp(40, 0, -75, E); for (let i = 0; i < 4; i++) { const a = i / 4 * 6.28 + 0.78; add(cyl(0.3, 0.3, 22, 8), col('#9aa3ad'), Math.cos(a) * 4, 11, Math.sin(a) * 4, wt); } add(sph(6, 20, 14), col('#dfe7ee'), 0, 25, 0, wt).scale.y = 0.7; add(new THREE.ConeGeometry(2.5, 2.5, 16), col('#9aa3ad'), 0, 30, 0, wt);
    sign('ALABAMA', 9, 2.2, { bg: '#dfe7ee', fg: '#2f5fa8', border: false, d: 0.1 }, 0, 25.5, 6.05, wt);
    const ws = grp(-30, 0, 35, E, Math.PI); for (const s of [-1, 1]) add(cyl(0.15, 0.15, 3.4, 8), col('#7a5434'), s * 2.2, 1.7, 0, ws); sign('WELCOME TO\nALABAMA', 5.4, 2.2, { bg: '#2f5fa8', fg: '#fff', bc: '#fff', pw: 768, ph: 312 }, 0, 3.0, 0.1, ws);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, d = 330; if (Math.cos(a) < -0.45) continue; const h = add(sph(60, 16, 8), col(i % 2 ? '#7aa65a' : '#8fb86a'), Math.cos(a) * d, -25, Math.sin(a) * d, E, { cast: false }); h.scale.y = 0.55; }
    // power lines along the road
    for (let x = -80; x <= 80; x += 20) { add(cyl(0.15, 0.18, 9, 8), col('#7a5434'), x, 4.5, 36, E); add(box(2.4, 0.15, 0.15), col('#7a5434'), x, 8.3, 36, E); }
  }

  // clouds: painted billboards (no ink, no fog)
  const clouds = []; { const r = rngS(90); for (let i = 0; i < 22; i++) { const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, fog: false, depthWrite: false })); const cx = i < 11 ? 0 : 1000; const a = Math.PI * (1.05 + r() * 0.9), d = 500 + r() * 250; m.position.set(cx + Math.cos(a) * d * 0.9, 90 + r() * 150, Math.sin(a) * d); m.scale.setScalar(150 + r() * 120); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }

  // =====================================================================================
  // per-frame animation
  // =====================================================================================
  const carPos = (s) => { const { a, r, z, P: Ptot } = H.car; s = ((s % Ptot) + Ptot) % Ptot; let x, zz, dx, dz;
    if (s < 2 * a) { x = -a + s; zz = z + r; dx = 1; dz = 0; }
    else if (s < 2 * a + Math.PI * r) { const t = (s - 2 * a) / r; x = a + r * Math.sin(t); zz = z + r * Math.cos(t); dx = Math.cos(t); dz = -Math.sin(t); }
    else if (s < 4 * a + Math.PI * r) { x = a - (s - 2 * a - Math.PI * r); zz = z - r; dx = -1; dz = 0; }
    else { const t = (s - 4 * a - Math.PI * r) / r; x = -a - r * Math.sin(t); zz = z - r * Math.cos(t); dx = -Math.cos(t); dz = Math.sin(t); }
    return { x, z: zz, yaw: Math.atan2(dx, dz) }; };
  H.carPos = carPos;
  let laptopKey = '';
  const drawLaptop = (mode, f) => { const key = mode + (mode === 'dead' ? (f >> 3) % 2 : ''); if (key === laptopKey) return; laptopKey = key; const g = H.laptopCanvas.getContext('2d'), w = 256, h = 170;
    g.fillStyle = mode === 'email' ? '#e9f2fb' : '#16324f'; g.fillRect(0, 0, w, h);
    if (mode === 'dead') { g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(70, 55, 100, 56); g.fillStyle = '#fff'; g.fillRect(170, 70, 12, 26); if ((f >> 3) % 2) { g.fillStyle = '#e23b3b'; g.fillRect(78, 63, 14, 40); } g.fillStyle = '#e23b3b'; g.font = '26px Lilita'; g.textAlign = 'center'; g.fillText('1%  NO CHARGER', w / 2, 150); }
    else if (mode === 'email') { g.fillStyle = '#2f8fc9'; g.fillRect(0, 0, w, 30); g.fillStyle = '#fff'; g.font = '22px Lilita'; g.fillText('INBOX (1)', 10, 23); g.fillStyle = '#2b2b33'; g.fillText('AIRLINE: Your claim', 12, 70); g.fillText('has been paid.', 12, 100); g.fillStyle = '#c0392b'; g.fillText('CASE CLOSED', 12, 140); }
    else { g.fillStyle = '#2f8fc9'; g.fillRect(0, 0, w, h); }
    H.laptopTex.needsUpdate = true; H.laptopScreen.material[4].emissiveMap.needsUpdate = true; };
  let counterKey = -1;
  const drawCounter = (v) => { if (v === counterKey) return; counterKey = v; const g = H.counterCv.getContext('2d'); g.fillStyle = '#10151f'; g.fillRect(0, 0, 1024, 300); g.strokeStyle = '#f2c94c'; g.lineWidth = 12; g.strokeRect(6, 6, 1012, 288); g.fillStyle = '#f2c94c'; g.font = '64px Lilita'; g.textAlign = 'center'; g.fillText('BAGS LOST THIS YEAR', 512, 90); g.fillStyle = '#ff6b4a'; g.font = '150px Lilita'; g.fillText(v.toLocaleString('en-US'), 512, 250); H.counterTex.needsUpdate = true; H.counter.material[4].emissiveMap.needsUpdate = true; };

  const hideFx = () => { for (const k in FXPOOL) for (const m of FXPOOL[k]) m.visible = false; };
  const placeFx = (name, i, p, s = 1, rot = [0, 0, 0]) => { const m = FXPOOL[name][i]; if (!m) return; m.visible = true; m.position.set(...p); m.scale.setScalar(s); m.rotation.set(...rot); return m; };
  const faceCam = [];
  function animate(f, st, cam) {
    const t = f / 30;
    hideFx();
    // clocks tick everywhere
    for (const c of clocks) { const sp = st.clockSpin || 0; c.ss.rotation.z = -Math.floor(t) / 60 * 6.283 - sp * 6.283; c.mm.rotation.z = -(t / 3600 * 6.283 + 1.1) - sp * 0.6; c.hh.rotation.z = -(t / 43200 * 6.283 + 2.2) - sp * 0.05; }
    // ---- set A ----
    const beltOn = st.belt ?? 1;
    const s0 = (st.beltS ?? t * 0.55) * beltOn;
    H.slats.forEach((m, i) => { const p = carPos(i / H.slats.length * H.car.P + s0); m.position.set(p.x, 0.46, p.z); m.rotation.y = p.yaw + Math.PI / 2; });
    const nb = st.bags ?? H.beltBags.length;
    H.beltBags.forEach((b, i) => { const s = i / H.beltBags.length * H.car.P + s0 * 1; const p = carPos(s); b.visible = i < nb && !(Math.abs(p.x) < 1.15 && p.z < H.car.z - 0.5); b.position.set(p.x, 0.49 + (p.z < H.car.z - 0.5 ? Math.max(0, 1 - Math.abs(p.x + 1.35) / 0.3) * 0.18 : 0), p.z); b.rotation.set(0, p.yaw + Math.PI / 2 + (i % 3 - 1) * 0.15, 0); });
    // hero bag on belt (hook)
    if (st.heroBeltS != null) { const p = carPos(st.heroBeltS); H.heroBagA.visible = !(Math.abs(p.x) < 1.15 && p.z < H.car.z - 0.5); H.heroBagA.position.set(p.x, 0.49 + 0.15, p.z); H.heroBagA.rotation.set(-Math.PI / 2, p.yaw + Math.PI / 2, 0, 'YXZ'); const tg = H.heroBagA.userData.tag; tg.rotation.z = Math.sin(t * 9) * 0.35; } else H.heroBagA.visible = false;
    H.flaps.forEach((fl, i) => { fl.rotation.z = 0.12 * Math.sin(t * 7 + i) * beltOn + (st.flapKick ? st.flapKick * Math.sin(i) * 0.6 : 0); });
    H.tumble.visible = !!st.tumble; if (st.tumble) { const p = carPos(st.tumble.s); H.tumble.position.set(p.x, 0.75, p.z); H.tumble.rotation.set(t * 4, 0, t * 2.7); }
    // planes outside
    { const pa = st.planeA ?? ((t * 7) % 260 - 130); H.planeA.position.set(pa, 0, -62); H.planeA.rotation.y = 0; H.planeA.position.y = st.planeAy ?? 0; H.planeA.rotation.z = st.planeAp ?? 0;
      H.planeB.position.set(70 - (t * 3) % 160, 0, -40); H.planeB.rotation.y = Math.PI; H.tug.position.set(-20 + (t * 2.2) % 50, 0, -22); }
    H.doors[0].position.x = -0.7 - (st.doors || 0) * 1.3; H.doors[1].position.x = 0.7 + (st.doors || 0) * 1.3;
    // desk props
    H.refTicket.position.set(st.ticketX ?? -0.05, 0.552, st.ticketZ ?? 0.0); H.refTicket.visible = st.ticket !== false;
    H.formA.visible = st.form !== false; H.pen.visible = st.form !== false; if (st.scribble) { H.pen.position.set(-0.02 + Math.sin(t * 23) * 0.05, 0.57, 0.08 + Math.sin(t * 7) * 0.05); H.pen.rotation.set(0.6, 0, 0.5); }
    H.folder.visible = !!st.folder; H.closedStamp.visible = (st.stampDown ?? 0) >= 1; H.stamp3d.visible = st.stampY != null; if (st.stampY != null) H.stamp3d.position.y = 0.56 + st.stampY;
    H.shirt3d.visible = !!st.shirt; H.shirtHeart.visible = !!st.shirt; H.shirtSign.visible = !!st.shirt; if (st.shirt) { H.shirt3d.position.set(...st.shirt.p); H.shirt3d.rotation.set(0, st.shirt.ry || 0, Math.sin(t * 3) * 0.05); H.shirtHeart.position.set(st.shirt.p[0] + Math.sin(st.shirt.ry || 0) * 0.06, st.shirt.p[1] + 0.12, st.shirt.p[2] + Math.cos(st.shirt.ry || 0) * 0.06); H.shirtSign.position.set(st.shirt.p[0] + 0.45 * Math.cos(st.shirt.ry || 0), st.shirt.p[1] - 0.35, st.shirt.p[2] - 0.45 * Math.sin(st.shirt.ry || 0) + 0.05); H.shirtSign.rotation.y = st.shirt.ry || 0; }
    H.brush3d.visible = !!st.brush; if (st.brush) { H.brush3d.position.set(...st.brush.p); H.brush3d.rotation.set(0, 0, st.brush.rz || 0.4); }
    // ---- set B ----
    H.curtains.forEach((c, i) => { c.rotation.y = Math.sin(t * 1.3 + i) * 0.06; });
    H.steamB.forEach((m, i) => { const k = (t * 0.5 + i / 3) % 1; m.position.set(2.9 + 0.45 + Math.sin(k * 6 + i) * 0.03, 0.9 + k * 0.35, -3.2); m.scale.setScalar(0.6 + k * 1.4); });
    { const pg = st.calPage ?? 0, fl = st.calFlip ?? 0; const cur = Math.floor(pg), nxt = Math.min(H.calMats.length - 1, cur + 1); H.calFront.material[4] = H.calMats[fl > 0 ? nxt : cur]; H.calFlipPage.material[4] = H.calMats[cur]; H.calFlip.visible = fl > 0 && fl < 1; H.calFlip.rotation.x = -fl * 2.6; H.calFlip.position.z = 0.02 + fl * 0.05; }
    H.alarm.rotation.z = st.alarm ? Math.sin(t * 60) * 0.18 : 0; H.alarm.position.y = 0.6 + (st.alarm ? Math.abs(Math.sin(t * 30)) * 0.02 : 0);
    drawLaptop(st.laptop || 'idle', f);
    H.phone.visible = !!st.phone; if (st.phone) { H.phone.position.set(...st.phone.p); H.phone.rotation.set(st.phone.rx || 0, st.phone.ry || 0, st.phone.rz || 0); H.phone.scale.setScalar(st.phone.s || 1); H.phoneScr.material.emissiveIntensity = 0.4 + 0.3 * Math.abs(Math.sin(t * 6)); }
    H.env.visible = !!st.env; if (st.env) { H.env.position.set(...st.env.p); H.env.rotation.set(st.env.rx || 0, st.env.ry || 0, st.env.rz || 0); H.env.scale.setScalar(st.env.s || 1); H.envFlap.rotation.x = -(st.env.open || 0) * 2.6; H.letter.position.y = (st.env.letter || 0) * 0.42; H.letter.position.z = (st.env.letter || 0) > 0 ? 0.02 : -0.005; H.cheque.position.set((st.env.cheque || 0) * 0.15, (st.env.cheque || 0) * 0.7, (st.env.cheque || 0) > 0 ? 0.03 : -0.01); H.cheque.rotation.z = (st.env.cheque || 0) * 0.2; }
    if (st.snow) for (let i = 0; i < 70; i++) { const k = (t * 0.25 + i * 0.137) % 1; placeFx('snow', i, [100 - 3 + ((i * 37) % 60) / 10, 3.5 - k * 12, -5 - (i % 7) * 0.8 + Math.sin(t + i) * 0.1], 1); }
    // birds outside windows / over Alabama
    if (st.birds) st.birds.forEach((b, i) => { const m = placeFx('bird', i, b.p, b.s || 1, [0, b.ry || 0, 0]); m.children.forEach((w) => { if (w.userData.side) w.rotation.x = w.userData.side * Math.sin(t * 14 + i) * 0.7; }); });
    // ---- set D ----
    if (st.counter != null) drawCounter(st.counter);
    H.lostLetters.forEach((m, i) => { const k = st.lostFall ? st.lostFall[i] : 0; m.position.copy(m.userData.p0); m.rotation.set(0, 0, 0); if (k > 0) { const tl = Math.sqrt((m.userData.p0.y - 0.6) / 15.68), tt = Math.min(k, tl); m.position.y = m.userData.p0.y - 15.68 * tt * tt; m.position.z += tt / tl * 4.05; m.rotation.set(tt / tl * 1.2 * (i % 2 ? 1 : -1), 0, tt / tl * (i - 1.5) * 0.8); if (k >= tl) { m.rotation.set(-Math.PI / 2, 0, (i - 1.5) * 0.5); m.position.y = 0.08; } } });
    H.heroBagD.visible = st.heroD !== false; H.xray.visible = !!st.xray; H.xrayShell.visible = !!st.xray; H.xrayEdges.visible = !!st.xray; if (st.xray) { H.heroBagD.visible = false; }
    if (st.heroDglow) { H.heroBagD.scale.setScalar(1 + 0.04 * Math.sin(t * 10)); } else H.heroBagD.scale.setScalar(1);
    H.flashBeam.visible = !!st.beam; if (st.beam) { H.flashBeam.position.set(...st.beam.p); H.flashBeam.rotation.set(...st.beam.r); }
    H.mug.visible = !!st.mug; if (st.mug) { H.mug.position.set(...st.mug.p); }
    H.dLid.rotation.x = (st.lid || 0) * 1.3; H.dLid.position.z = (st.lid || 0) * 0.55; H.dLid.position.y = 1.38 + (st.lid || 0) * 0.62;
    H.bagThrow.visible = !!st.bagThrow; if (st.bagThrow) { H.bagThrow.position.set(...st.bagThrow.p); H.bagThrow.rotation.set(...(st.bagThrow.r || [0, 0, 0])); }
    // ---- set F ----
    H.sleeveTag.visible = !!st.sleeveTag; if (st.sleeveTag) { H.sleeveTag.position.set(...st.sleeveTag.p); H.sleeveTag.rotation.set(0, st.sleeveTag.ry, Math.sin(t * 5) * 0.12); H.sleeveTag.scale.setScalar(st.sleeveTag.s || 1); }
    H.priceTagF.rotation.set(0, st.tagFlipF ? st.tagFlipF * Math.PI : 0, Math.sin(t * 4) * 0.1);
    H.drawer.position.z = 0.05 + (st.drawer || 0) * 0.35;
    if (st.bills) st.bills.forEach((b, i) => placeFx('bill', i, b.p, 1, b.r));
    H.soldSign.visible = !!st.sold; if (st.sold) { H.soldSign.position.set(...st.sold.p); H.soldSign.scale.setScalar(st.sold.s); H.soldSign.rotation.set(0, st.sold.ry || 0, Math.sin(t * 8) * 0.08); }
    H.fallBags.forEach((b, i) => { const fb = st.fall && st.fall[i]; b.visible = !!fb; if (fb) { b.position.set(...fb.p); b.rotation.set(...fb.r); } });
    H.spot.material.opacity = st.spot ?? 0.16;
    // ---- set E ----
    H.pickupDrive.position.x = 1000 + (st.pickupX ?? (-60 + (t * 9) % 120));
    H.flags.forEach((fl, k) => { const pa = fl.geometry.attributes.position, b0 = fl.userData.base; for (let i = 0; i < pa.count; i++) { const x = b0[i * 3]; pa.setZ(i, Math.sin(t * 6 + x * 2.6 + k) * 0.12 * (x + 1.2)); } pa.needsUpdate = true; });
    for (const c of clouds) c.position.x += 0;
    // generic fx from the story
    if (st.stars) st.stars.forEach((s, i) => placeFx('star', i, s.p, s.s, [0, s.ry || 0, s.rz || 0]));
    if (st.puffs) st.puffs.forEach((s, i) => placeFx('puff', i, s.p, s.s));
    if (st.qmarks) st.qmarks.forEach((s, i) => placeFx('qmark', i, s.p, s.s, [0, s.ry || 0, s.rz || 0]));
    if (st.xmarks) st.xmarks.forEach((s, i) => placeFx('xmark', i, s.p, s.s, [0, s.ry || 0, s.rz || 0]));
    if (st.zzz) st.zzz.forEach((s, i) => placeFx('zzz', i, s.p, s.s, [0, s.ry || 0, s.rz || 0]));
    if (st.pages) st.pages.forEach((s, i) => placeFx('page', i, s.p, 1, s.r));
  }
  function faceCamera(cam) { for (const c of clouds) c.quaternion.copy(cam.quaternion); }
  return { animate, faceCamera, H };
}
