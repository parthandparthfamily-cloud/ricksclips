// NIGHT MOVERS world: helpers, materials, 3D FX pool, set registry. Sets live in sets1.js / sets2.js.
import * as X from './tex.js';
import { buildSets1 } from './sets1.js';
import { buildSets2 } from './sets2.js';
export const O = { apt: [0, 0, 0], street: [300, 0, 0], office: [600, 0, 0], home: [900, 0, 0], city: [1200, 0, 0], room: [1500, 0, 0], ramen: [1800, 0, 0], station: [2100, 0, 0] };

export function buildWorld({ THREE, scene, P, T, grad }) {
  const toon = (o) => new THREE.MeshToonMaterial({ gradientMap: grad, ...o });
  const tx = (c, rx = 1, ry = 1) => P.tex(c, rx, ry);
  const mt = (c, rx, ry, o = {}) => toon({ map: tx(c, rx, ry), ...o });
  const glow = (color, o = {}) => new THREE.MeshBasicMaterial({ color, ...o });
  const glowT = (c, o = {}) => new THREE.MeshBasicMaterial({ map: tx(c), ...o });
  const col = {}; const C = (hex) => col[hex] || (col[hex] = toon({ color: hex }));
  const geoCache = {};
  const BOX = (w, h, d) => { const k = `b${w},${h},${d}`; return geoCache[k] || (geoCache[k] = new THREE.BoxGeometry(w, h, d)); };
  const tboxG = (w, h, d, t = 1) => { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); } return g; };
  const mesh = (geo, mat, x = 0, y = 0, z = 0, parent, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true;
    if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz; if (o.s) (Array.isArray(o.s) ? m.scale.set(...o.s) : m.scale.setScalar(o.s)); if (o.noink) m.userData.ndSkip = true; parent.add(m); return m; };
  // box by min/max corners or center/size
  const box = (parent, mat, x, y, z, w, h, d, o = {}) => mesh(o.t ? tboxG(w, h, d, o.t) : BOX(w, h, d), typeof mat === 'string' ? C(mat) : mat, x, y, z, parent, o);
  const cyl = (parent, mat, x, y, z, rt, rb, h, o = {}) => mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg || 14, 1, !!o.open), typeof mat === 'string' ? C(mat) : mat, x, y, z, parent, o);
  const sph = (parent, mat, x, y, z, r, o = {}) => mesh(new THREE.SphereGeometry(r, o.seg || 16, o.seg2 || 12), typeof mat === 'string' ? C(mat) : mat, x, y, z, parent, o);
  const plane = (parent, mat, x, y, z, w, h, o = {}) => mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast: false, ...o });
  // sign: painted canvas face on a thin board (both 3D, inked)
  const signBoard = (parent, canvas, x, y, z, w, h, o = {}) => { const g = new THREE.Group(); g.position.set(x, y, z); if (o.ry) g.rotation.y = o.ry; if (o.rx) g.rotation.x = o.rx; if (o.rz) g.rotation.z = o.rz; parent.add(g);
    const d = o.d ?? 0.04; box(g, o.frame || '#3a2a22', 0, 0, -d / 2, w + (o.border ?? 0.04), h + (o.border ?? 0.04), d);
    const face = mesh(new THREE.PlaneGeometry(w, h), o.lit ? glowT(canvas, { toneMapped: false }) : mt(canvas), 0, 0, 0.002, g, { cast: false }); g.userData.face = face; return g; };
  const line3 = (parent, a, b, r, mat) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B); const m = cyl(parent, mat, 0, 0, 0, r, r, L, { seg: 6, cast: false });
    m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return m; };
  const wire = (parent, a, b, sag, r = 0.015, mat = '#1f1a1e') => { const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]); }
    for (let i = 0; i < 10; i++) line3(parent, pts[i], pts[i + 1], r, mat); };
  const H = { THREE, scene, P, T, X, toon, tx, mt, glow, glowT, C, BOX, tboxG, mesh, box, cyl, sph, plane, signBoard, line3, wire, rng: P.rng };

  // ---------- set registry ----------
  const SETS = {}; const updaters = [];
  H.newSet = (name) => { const g = new THREE.Group(); g.position.set(...O[name]); g.visible = false; scene.add(g); SETS[name] = g; return g; };
  H.onUpdate = (fn) => updaters.push(fn);
  H.O = O;

  // ---------- 3D FX pool (pops): bang "!", question "?", sweat drop, dust puff, spark star, zzz ----------
  const fxRoot = new THREE.Group(); scene.add(fxRoot);
  const ink = C('#2e211d'), red = C('#e0453a'), yel = C('#ffd23f'), blue = C('#8fd0f5'), white = C('#f4f1ea');
  const mkBang = () => { const g = new THREE.Group(); const m1 = cyl(g, red, 0, 0.16, 0, 0.055, 0.03, 0.3, { seg: 10 }); sph(g, red, 0, -0.06, 0, 0.045); return g; };
  const mkQ = () => { const g = new THREE.Group(); const t = mesh(new THREE.TorusGeometry(0.09, 0.035, 8, 20, Math.PI * 1.5), yel, 0, 0.2, 0, g, { rz: -Math.PI * 0.5 }); cyl(g, yel, 0, 0.06, 0, 0.035, 0.035, 0.1); sph(g, yel, 0, -0.06, 0, 0.04); return g; };
  const mkSweat = () => { const g = new THREE.Group(); sph(g, blue, 0, 0, 0, 0.05); const c = mesh(new THREE.ConeGeometry(0.05, 0.08, 10), blue, 0, 0.06, 0, g); return g; };
  const mkPuff = () => { const g = new THREE.Group(); for (let i = 0; i < 4; i++) sph(g, white, Math.cos(i * 1.6) * 0.08, Math.sin(i * 2.1) * 0.04, Math.sin(i * 1.6) * 0.08, 0.09 - i * 0.012, { seg: 10, seg2: 8 }); return g; };
  const mkStar = () => { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const m = box(g, yel, 0, 0, 0, 0.04, 0.22, 0.04); m.rotation.z = i * Math.PI / 4; } return g; };
  const mkZ = () => { const g = new THREE.Group(); box(g, C('#9fc6e8'), 0, 0.06, 0, 0.14, 0.03, 0.03); box(g, C('#9fc6e8'), 0, -0.06, 0, 0.14, 0.03, 0.03); const d = box(g, C('#9fc6e8'), 0, 0, 0, 0.03, 0.17, 0.03); d.rotation.z = 0.85; return g; };
  const MK = { bang: mkBang, q: mkQ, sweat: mkSweat, puff: mkPuff, star: mkStar, z: mkZ };
  const pool = {}; const getPop = (k, i) => { pool[k] = pool[k] || []; while (pool[k].length <= i) { const g = MK[k](); fxRoot.add(g); pool[k].push(g); } return pool[k][i]; };
  function pops(list = []) {
    for (const k in pool) pool[k].forEach((g) => (g.visible = false));
    const cnt = {};
    for (const p of list) { const i = cnt[p.kind] = (cnt[p.kind] ?? -1) + 1; const g = getPop(p.kind, i); g.visible = true; const t = Math.max(0, Math.min(1, p.t));
      const s = (p.s || 1) * (p.kind === 'puff' ? 0.5 + t * 1.2 : t < 0.18 ? (t / 0.18) * 1.25 : t < 0.3 ? 1.25 - (t - 0.18) / 0.12 * 0.25 : t > 0.88 ? (1 - t) / 0.12 : 1);
      g.scale.setScalar(Math.max(0.001, s)); g.position.set(p.p[0], p.p[1] + (p.kind === 'puff' ? t * 0.4 : p.kind === 'sweat' ? -t * 0.25 : p.kind === 'z' ? t * 0.5 : 0), p.p[2]);
      g.rotation.set(0, p.ry ?? 0, p.kind === 'bang' || p.kind === 'q' ? Math.sin(t * 18) * 0.15 * (1 - t) : p.kind === 'star' ? t * 4 : 0); }
  }

  buildSets1(H); buildSets2(H);

  // 3D TV screen hook (sets2 registers H.tv = { screen mesh, offMat })
  return {
    show(names) { for (const k in SETS) SETS[k].visible = names.includes(k); fxRoot.visible = true; },
    update(f, W) { for (const u of updaters) u(f, W); pops(W.pops); },
    tvScreen(texture, on) { if (!H.tv) return; const s = H.tv.screen; if (texture) { s.material = H.tv.liveMat; H.tv.liveMat.map = texture; H.tv.liveMat.needsUpdate = H.tv.liveMat.userData.t !== texture; H.tv.liveMat.userData.t = texture; } else s.material = on ? H.tv.staticMat : H.tv.offMat; },
    sets: SETS,
  };
}
