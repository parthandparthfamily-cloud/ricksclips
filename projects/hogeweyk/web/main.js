// Hogeweyk — engine + world. Characters are 2D cards (characters/rick.js); EVERYTHING else is inked 3D geometry.
import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as X from './paint_x.js';
import * as ST from './story.js';

await document.fonts.load('100px "Lilita One"').catch(() => {});
const HASH = new URLSearchParams(location.hash.slice(1));
const SC = +(HASH.get('s') || 1);
const W = Math.round(1080 * SC), H = Math.round(1920 * SC);
const canvas = document.getElementById('c'); canvas.width = W; canvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.06, 1600);
const rx = (a) => a * Math.PI / 180;
const IN = -300; // interiors live 300 m under the village (never visible from outside, outside the sun's shadow frustum)

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([120, 120, 120, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const tex = (c, rxx = 1, ryy = 1) => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rxx, ryy); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const col = (c) => toon({ color: c });
const tm = (c, color = '#ffffff') => toon({ map: tex(c), color });
const glow = (c) => new THREE.MeshBasicMaterial({ color: c });
const MC = {}; const C = (c) => MC[c] || (MC[c] = col(c)); // shared flat colour materials
const glassTex = (() => { const [c, g] = X.cv(128, 256); const gr = g.createLinearGradient(0, 0, 128, 256); gr.addColorStop(0, '#9fd3f2'); gr.addColorStop(0.5, '#3f6f99'); gr.addColorStop(1, '#2a4a70'); g.fillStyle = gr; g.fillRect(0, 0, 128, 256);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(10, 120); g.lineTo(60, 40); g.lineTo(80, 40); g.lineTo(30, 120); g.fill(); g.beginPath(); g.moveTo(40, 160); g.lineTo(100, 70); g.lineTo(110, 70); g.lineTo(50, 160); g.fill(); return c; })();
const shopTex = (() => { const [c, g] = X.cv(256, 256), r = X.rng(5); g.fillStyle = '#ffe9b8'; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 3; y++) { g.fillStyle = '#c98a3e'; g.fillRect(0, 70 + y * 70, 256, 8); for (let i = 0; i < 12; i++) { g.fillStyle = ['#e85a4f', '#f2c33a', '#5aa0d8', '#7cc07a', '#e07ab0'][(i + y) % 5]; g.fillRect(6 + i * 21, 30 + y * 70 + r() * 10, 16, 40 - r() * 10); } } g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.moveTo(0, 200); g.lineTo(120, 0); g.lineTo(160, 0); g.lineTo(40, 200); g.fill(); return c; })();
const M = {
  cob: tm(X.cobbles(1)), cobRing: tm(X.cobbles(2, 18, 30, 58)), grass: tm(X.grass(7)), hedge: tm(X.hedge(6)),
  brickR: tm(X.bricks(2, 8, 55, 44)), brickB: tm(X.bricks(3, 20, 45, 38)), brickY: tm(X.bricks(4, 34, 50, 62)), brickG: tm(X.bricks(5, 200, 10, 58)),
  plasterW: tm(X.plaster(8, 40, 92)), plasterP: tm(X.plaster(9, 350, 86)), plasterB: tm(X.plaster(10, 200, 84)),
  roof: tm(X.roofTiles(9)), roofG: tm(X.roofTiles(12, 200)), planks: tm(X.planks(3)), planksD: tm(X.planks(4, 24, 40)),
  glass: toon({ map: tex(glassTex) }), shop: toon({ map: tex(shopTex) }), asphalt: tm(X.asphalt()),
  white: C('#f6f3ee'), stone: tm(X.plaster(11, 30, 72)), wood: C('#8a5a34'), woodL: C('#c08a52'), iron: C('#3b3f4a'), chrome: C('#c9d2da'),
  wallApt: tm(X.wallpaper(4)), wallSalon: tm(X.wallpaper(5, '#f8cbd8', '#f3b6c9', '#ffffff')), wallLobby: tm(X.wallpaper(6, '#cfe6ea', '#bfdde2', '#f4efe0')),
  checker: tm(X.checker()), tilesW: tm(X.tiles()), tilesB: tm(X.tiles('#dfe9f2', '#b8c8d6', 3)), quilt: tm(X.quilt()),
  awnR: tm(X.stripes('#d6333c', '#fbf6ee')), awnG: tm(X.stripes('#2f9a4a', '#f6f3e6')), awnB: tm(X.stripes('#2f6fd1', '#fbf6ee')), awnP: tm(X.stripes('#e07ab0', '#fbf6ee')),
  water: null,
};
[M.cob, M.cobRing, M.grass].forEach((m) => m.map.repeat.set(1, 1));

// ---------- batching: static geometry merged per material ----------
const BATCH = new Map();
const stack = [new THREE.Matrix4()];
const top = () => stack[stack.length - 1];
const push = (x = 0, y = 0, z = 0, ry = 0, rxx = 0, rz = 0, s = 1) => { const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rxx, ry, rz, 'YXZ')), new THREE.Vector3(s, s, s)); stack.push(top().clone().multiply(m)); };
const pop = () => stack.pop();
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
const put = (geo, mat, x = 0, y = 0, z = 0, r = [0, 0, 0], sc = [1, 1, 1], cast = true) => {
  _m.compose(_v.set(x, y, z), _q.setFromEuler(_e.set(r[0], r[1], r[2], 'YXZ')), _s.set(sc[0], sc[1], sc[2]));
  let g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(top().clone().multiply(_m));
  for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  const key = mat.uuid + (cast ? 'c' : 'n'); if (!BATCH.has(key)) BATCH.set(key, { mat, cast, geos: [] }); BATCH.get(key).geos.push(g);
};
const tbox = (w, h, d, t = 2) => { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); } return g; };
const B = (w, h, d, mat, x, y, z, r, t = 2, cast = true) => put(tbox(w, h, d, t), mat, x, y, z, r, undefined, cast);
const CY = (rt, rb, h, mat, x, y, z, seg = 12, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, r);
const SP = (rad, mat, x, y, z, sc = [1, 1, 1], seg = 10) => put(new THREE.SphereGeometry(rad, seg, Math.max(4, seg * 0.6 | 0)), mat, x, y, z, [0, 0, 0], sc);
const flushBatches = () => { for (const { mat, cast, geos } of BATCH.values()) { const n = geos.reduce((a, g) => a + g.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
  for (const g of geos) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.computeBoundingSphere();
  const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); } BATCH.clear(); };

// dynamic meshes (moved per frame)
const dyn = (geo, mat, parent = scene, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
const group = (x = 0, y = 0, z = 0, ry = 0, parent = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
const D = {}; // registry of dynamic things

// ---------- signs (inked 3D slabs with painted text) ----------
const signMat = (lines, o) => { const c = X.signCanvas(lines, o); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { mat: toon({ map: t }), c, t }; };
const sign = (lines, w, h, o = {}, x = 0, y = 0, z = 0, ry = 0, parent = scene, depth = 0.1) => {
  const pw = Math.round(Math.min(1024, 256 * w / h)), S = signMat(lines, { w: pw, h: 256, ...o });
  const edge = C(o.edge || o.border || '#2b1f1c');
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), [edge, edge, edge, edge, S.mat, edge]); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; parent.add(m); m.userData.S = S; m.userData.o = { w: pw, h: 256, ...o }; return m;
};
const setSign = (m, lines, o) => { const k = JSON.stringify([lines, o]); if (m.userData.k === k) return; m.userData.k = k; const c = X.signCanvas(lines, { ...m.userData.o, ...(o || {}) }); const g = m.userData.S.c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(c, 0, 0); m.userData.S.t.needsUpdate = true; };

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .6)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .3*pow(max(s,0.), 24.)*step(.001,sunSize)); gl_FragColor = vec4(c,1.); }` }));
sky.userData.sky = true; sky.renderOrder = -10; scene.add(sky);
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target); scene.fog = new THREE.Fog('#ffffff', 60, 700);

// ---------- generic props ----------
const tree = (x, z, s = 1, y = 0) => { const g = group(x, y, z); const tr = dyn(new THREE.CylinderGeometry(0.16 * s, 0.26 * s, 3.2 * s, 8), C('#6a4a32'), g, 0, 1.6 * s, 0);
  const crown = group(0, 3.4 * s, 0, 0, g); const r = X.rng((x * 13 + z * 7) | 0); const greens = ['#4f9a3c', '#62ad45', '#3f8a35', '#74b84c'];
  for (let i = 0; i < 6; i++) { const a = i * 1.05, d = i ? 1.0 * s : 0; dyn(new THREE.IcosahedronGeometry((1.15 + r() * 0.4) * s, 1), C(greens[i % 4]), crown, Math.cos(a) * d, (i ? r() * 0.8 : 0.6) * s, Math.sin(a) * d); }
  g.userData.crown = crown; g.userData.seed = r() * 6; (D.trees ||= []).push(g); return g; };
const lamp = (x, z, ry = 0, h = 3.6) => { push(x, 0, z, ry); CY(0.07, 0.1, h, M.iron, 0, h / 2, 0, 8); CY(0.16, 0.2, 0.3, M.iron, 0, 0.15, 0, 8); B(0.06, 0.06, 0.5, M.iron, 0, h - 0.1, 0.22); pop();
  const bulb = dyn(new THREE.SphereGeometry(0.16, 10, 8), glow('#fff3c4'), scene); _v.set(0, h - 0.32, 0.45).applyMatrix4(new THREE.Matrix4().makeRotationY(ry)); bulb.position.set(x + _v.x, _v.y, z + _v.z);
  const cap = dyn(new THREE.ConeGeometry(0.26, 0.25, 8), M.iron, scene, bulb.position.x, h - 0.12, bulb.position.z); (D.lamps ||= []).push(bulb); };
const bench = (x, z, ry = 0) => { push(x, 0, z, ry); for (const s of [-1, 1]) { B(0.08, 0.5, 0.5, M.iron, s * 0.8, 0.25, 0); B(0.08, 0.6, 0.08, M.iron, s * 0.8, 0.75, -0.24); }
  for (let i = 0; i < 3; i++) B(1.9, 0.06, 0.14, M.woodL, 0, 0.5, -0.18 + i * 0.16, undefined, 1); for (let i = 0; i < 2; i++) B(1.9, 0.12, 0.05, M.woodL, 0, 0.75 + i * 0.18, -0.27, undefined, 1); pop(); };
const tulipMesh = (n, positions, colors) => { const geo = new THREE.SphereGeometry(0.07, 7, 5); geo.scale(1, 1.4, 1); const im = new THREE.InstancedMesh(geo, toon({ color: '#ffffff' }), n);
  const st = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 4), C('#3f8a35'), n);
  positions.forEach((p, i) => { _m.makeTranslation(p[0], p[1] + 0.38, p[2]); im.setMatrixAt(i, _m); im.setColorAt(i, new THREE.Color(colors[i])); _m.makeTranslation(p[0], p[1] + 0.18, p[2]); st.setMatrixAt(i, _m); });
  im.castShadow = st.castShadow = false; im.receiveShadow = true; scene.add(im); scene.add(st); return im; };
const TUL = ['#e8343e', '#f6c12e', '#f07aa8', '#ffffff', '#f28c28', '#b04fd1'];
const planter = (x, z, ry = 0, len = 2.4) => { push(x, 0, z, ry); B(len, 0.5, 0.6, M.brickB, 0, 0.25, 0, undefined, 1); B(len - 0.1, 0.06, 0.5, C('#5a3a24'), 0, 0.5, 0); pop();
  const ps = [], cs = [], r = X.rng((x * 31 + z * 17) | 0); const m4 = new THREE.Matrix4().makeRotationY(ry);
  for (let i = 0; i < 18; i++) { _v.set((r() - 0.5) * (len - 0.3), 0.5, (r() - 0.5) * 0.35).applyMatrix4(m4); ps.push([x + _v.x, _v.y, z + _v.z]); cs.push(TUL[(i + (x | 0)) % 6]); } tulipMesh(ps.length, ps, cs); };
const bike = (x, z, ry, c = '#2f6fd1') => { push(x, 0, z, ry); for (const s of [-1, 1]) put(new THREE.TorusGeometry(0.32, 0.035, 6, 18), M.iron, s * 0.5, 0.34, 0); B(1.0, 0.05, 0.05, C(c), 0, 0.6, 0); B(0.05, 0.4, 0.05, C(c), -0.15, 0.48, 0, [0, 0, 0.3]); B(0.05, 0.5, 0.05, C(c), 0.35, 0.55, 0, [0, 0, -0.2]);
  B(0.24, 0.06, 0.1, C('#2b1f1c'), -0.2, 0.74, 0); B(0.05, 0.05, 0.5, M.iron, 0.42, 0.85, 0); B(0.3, 0.2, 0.32, C('#c98a3e'), 0.55, 0.62, 0); pop(); };
const crate = (x, z, ry, fruit) => { push(x, 0, z, ry); B(0.9, 0.06, 0.6, M.woodL, 0, 0.55, 0); for (const s of [-1, 1]) { B(0.9, 0.25, 0.04, M.woodL, 0, 0.7, s * 0.3); B(0.04, 0.6, 0.6, M.woodL, s * 0.45, 0.4, 0); }
  const r = X.rng((x * 7 + z * 3) | 0); for (let i = 0; i < 14; i++) SP(0.08, C(fruit), (r() - 0.5) * 0.7, 0.65 + r() * 0.08, (r() - 0.5) * 0.45, [1, 1, 1], 7); pop(); };
const flowerBox = (w) => { B(w, 0.2, 0.25, C('#5a3a24'), 0, 0, 0.18); const r = X.rng((w * 100) | 0); for (let i = 0; i < Math.round(w * 6); i++) SP(0.07, C(TUL[i % 6]), -w / 2 + 0.08 + i * (w - 0.16) / Math.max(1, Math.round(w * 6) - 1), 0.14 + r() * 0.06, 0.18 + (r() - 0.5) * 0.12, [1, 1, 1], 6); };

// ---------- Dutch canal house ----------
const SHUT = ['#2f7a4a', '#d6333c', '#2f5fa8', '#1f3b2e'];
function house(o) {
  const { x, z, ry, w, d = 8, h = 9, mat = M.brickR, gable = 'step', shut = SHUT[(Math.abs(x * 3 + z) | 0) % 4], door = '#2f5fa8', shop = null, skipGround = false } = o;
  push(x, 0, z, ry);
  const fz = d / 2;
  B(w, h, d, mat, 0, h / 2, 0, undefined, 2);
  B(w + 0.12, 0.6, d + 0.12, M.stone, 0, 0.3, 0);
  B(w + 0.3, 0.28, 0.4, M.white, 0, h, fz);
  // gable + roof
  const gh = gable === 'flat' ? 0 : 3.2;
  if (gable === 'step') { for (let i = 0; i < 4; i++) { const ww = w * (1 - i * 0.22); B(ww, 0.8, 0.45, mat, 0, h + 0.4 + i * 0.8, fz - 0.22); B(ww + 0.1, 0.12, 0.55, M.white, 0, h + 0.82 + i * 0.8, fz - 0.22); } }
  if (gable === 'bell' || gable === 'tri') { const s = new THREE.Shape(); const hw = w / 2;
    if (gable === 'bell') { s.moveTo(-hw, 0); s.bezierCurveTo(-hw * 0.4, 0.2, -hw * 0.75, gh * 0.8, -hw * 0.3, gh); s.lineTo(hw * 0.3, gh); s.bezierCurveTo(hw * 0.75, gh * 0.8, hw * 0.4, 0.2, hw, 0); }
    else { s.moveTo(-hw, 0); s.lineTo(0, gh); s.lineTo(hw, 0); } s.closePath();
    put(new THREE.ExtrudeGeometry(s, { depth: 0.45, bevelEnabled: false, curveSegments: 10 }), mat, 0, h, fz - 0.45);
    if (gable === 'bell') B(w * 0.65, 0.18, 0.55, M.white, 0, h + gh, fz - 0.22); }
  if (gable !== 'flat') { const s = new THREE.Shape(); s.moveTo(-w / 2 - 0.15, 0); s.lineTo(0, gh); s.lineTo(w / 2 + 0.15, 0); s.closePath(); put(new THREE.ExtrudeGeometry(s, { depth: d - 0.5, bevelEnabled: false }), M.roof, 0, h, -d / 2); }
  else B(w + 0.2, 0.4, d + 0.2, M.white, 0, h + 0.2, 0);
  // gable window
  if (gable !== 'flat') { B(0.8, 0.9, 0.1, M.white, 0, h + 1.3, fz + 0.03); B(0.6, 0.7, 0.08, M.glass, 0, h + 1.3, fz + 0.06); }
  // upper windows
  const n = Math.max(1, Math.floor(w / 1.7)); const sp = w / n;
  for (let y = 4.2; y < h - 0.6; y += 2.6) for (let i = 0; i < n; i++) { const wx = -w / 2 + sp * (i + 0.5);
    push(wx, y, fz); B(0.95, 1.45, 0.12, M.white, 0, 0, 0.04); B(0.75, 1.22, 0.06, M.glass, 0, 0, 0.09); B(0.06, 1.22, 0.04, M.white, 0, 0, 0.12); B(0.75, 0.06, 0.04, M.white, 0, 0.15, 0.12);
    for (const s of [-1, 1]) B(0.38, 1.4, 0.06, C(shut), s * 0.68, 0, 0.06); B(1.05, 0.08, 0.25, M.white, 0, -0.76, 0.1);
    if ((i + Math.round(y)) % 2 === 0) { push(0, -0.88, 0); flowerBox(0.9); pop(); } pop(); }
  // ground floor
  if (!skipGround) {
    if (shop) { const sw = w - 1.6;
      B(sw, 2.2, 0.1, M.white, -0.45, 1.75, fz + 0.03); B(sw - 0.2, 2.0, 0.06, M.shop, -0.45, 1.75, fz + 0.07); B(0.06, 2.0, 0.04, M.white, -0.45, 1.75, fz + 0.11);
      B(0.95, 2.3, 0.1, C(door), w / 2 - 0.75, 1.15, fz + 0.03); B(0.6, 1.2, 0.06, M.glass, w / 2 - 0.75, 1.45, fz + 0.08); SP(0.05, C('#e5c158'), w / 2 - 0.45, 1.1, fz + 0.12, [1, 1, 1], 6);
      const am = shop.awn || M.awnR; push(0, 3.2, fz + 0.75, 0, -0.42); B(w - 0.2, 0.07, 1.7, am, 0, 0, 0, undefined, 1.2); pop();
      for (let i = 0; i < Math.round(w / 0.5); i++) put(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 10, 1, false, 0, Math.PI), am, -w / 2 + 0.3 + i * 0.5, 2.88, fz + 1.53, [Math.PI / 2, Math.PI / 2, 0], [1, 1, 1]);
    } else {
      B(1.0, 2.3, 0.1, C(door), o.doorX ?? 0, 1.15, fz + 0.03); B(1.2, 0.3, 0.14, M.white, o.doorX ?? 0, 2.4, fz + 0.05); SP(0.05, C('#e5c158'), (o.doorX ?? 0) + 0.3, 1.1, fz + 0.1, [1, 1, 1], 6);
      for (const s of [-1, 1]) if (w > 4) { push(s * w * 0.3, 1.6, fz); B(0.95, 1.3, 0.12, M.white, 0, 0, 0.04); B(0.75, 1.1, 0.06, M.glass, 0, 0, 0.09); B(1.05, 0.08, 0.25, M.white, 0, -0.7, 0.1); pop(); }
    }
  }
  pop();
}

// ======================================================================= WORLD
// ground + square paving
put(new THREE.PlaneGeometry(700, 700), M.grass, 0, 0, 0, [-Math.PI / 2, 0, 0], undefined, false); M.grass.map.repeat.set(1, 1);
{ const g = new THREE.PlaneGeometry(30, 30); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 7, uv.getY(i) * 7); put(g, M.cob, 0, 0.01, 0, [-Math.PI / 2, 0, 0], undefined, false);
  for (const [x, z, w, d] of [[16, -24, 4, 22], [-16, 24, 4, 22], [24, 16, 22, 4], [-24, -16, 22, 4], [0, 40, 6, 22]]) { const s = new THREE.PlaneGeometry(w, d); const u = s.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * w / 4, u.getY(i) * d / 4); put(s, M.cob, x, 0.012, z, [-Math.PI / 2, 0, 0], undefined, false); }
  const ring = new THREE.RingGeometry(3.6, 6.2, 48, 1); const u = ring.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * 4, u.getY(i) * 4); put(ring, M.cobRing, 0, 0.02, 0, [-Math.PI / 2, 0, 0], undefined, false);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; B(0.25, 0.04, 2.6, M.white, Math.cos(a) * 4.9, 0.03, Math.sin(a) * 4.9, [0, -a + Math.PI / 2, 0]); } }
// fountain
{ const pts = []; [[0, 0], [2.7, 0], [2.9, 0.1], [2.9, 0.62], [2.6, 0.7], [2.45, 0.6], [2.45, 0.2], [0, 0.2]].forEach(([a, b]) => pts.push(new THREE.Vector2(a, b)));
  put(new THREE.LatheGeometry(pts, 40), M.stone, 0, 0, 0); CY(0.35, 0.5, 1.9, M.stone, 0, 1.1, 0, 14); const bowl = []; [[0, 0], [1.1, 0.25], [1.2, 0.4], [1.0, 0.35], [0, 0.2]].forEach(([a, b]) => bowl.push(new THREE.Vector2(a, b)));
  put(new THREE.LatheGeometry(bowl, 28), M.stone, 0, 1.9, 0); CY(0.12, 0.18, 0.7, M.stone, 0, 2.4, 0, 10); SP(0.2, C('#e5c158'), 0, 2.85, 0, [1, 1.3, 1], 10);
  const wu = { t: { value: 0 } }; M.waterU = wu;
  M.water = new THREE.ShaderMaterial({ uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...wu }, fog: true,
    vertexShader: `#include <fog_pars_vertex>
      varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: `#include <fog_pars_fragment>
      uniform float t; varying vec3 vW;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      void main(){ float r = length(vW.xz); vec2 p = vW.xz*1.6 + vec2(sin(t*.7), t*.5);
        float n = noise(p)*.6 + noise(p*2.1+t)*.4; float rip = .5+.5*sin(r*9.-t*5.);
        vec3 c = mix(vec3(.2,.55,.78), vec3(.45,.8,.95), .35*n+.3*rip);
        c = mix(c, vec3(.92,.98,1.), smoothstep(.72,.8,noise(vW.xz*3.+vec2(t*.8,-t*.6)))*.8);
        gl_FragColor = vec4(c,1.);
        #include <fog_fragment>
      }` });
  const wsurf = new THREE.Mesh(new THREE.CircleGeometry(2.5, 40), M.water); wsurf.rotation.x = -Math.PI / 2; wsurf.position.y = 0.52; scene.add(wsurf);
  const w2 = new THREE.Mesh(new THREE.CircleGeometry(1.05, 28), M.water); w2.rotation.x = -Math.PI / 2; w2.position.y = 2.2; scene.add(w2);
  const dg = new THREE.SphereGeometry(0.06, 6, 4); D.drops = new THREE.InstancedMesh(dg, toon({ color: '#cdeefe' }), 90); D.drops.castShadow = false; scene.add(D.drops); }
// trees, lamps, benches, planters, bikes around the square
[[-9, -9], [9, -9], [-9, 9], [9, 9]].forEach(([x, z]) => { tree(x, z, 1.15); push(x, 0, z); CY(0.9, 0.9, 0.35, M.stone, 0, 0.17, 0, 16); pop(); });
[[-12, -4], [-12, 6], [12, -5], [12, 5], [-5, -12], [5, -12], [-5, 12], [5, 12]].forEach(([x, z]) => lamp(x, z, Math.atan2(-x, -z)));
bench(-12.2, 3.6, Math.PI / 2); bench(12.2, -0.2, -Math.PI / 2); bench(3.5, 4.4, Math.PI); bench(-3.8, -4.6, 0);
planter(-6.5, 12.8, 0); planter(6.5, 12.8, 0); planter(-12.9, -6.4, Math.PI / 2); planter(12.9, 3.5, Math.PI / 2); planter(-2.2, 7.4, 0, 2.2); planter(2.2, -7.4, 0, 2.2);
bike(-11.5, 11.2, 0.4, '#2f6fd1'); bike(-10.6, 12.1, 0.3, '#e05a4f'); bike(11.2, 12.4, -0.2, '#2f9a4a');
// flag pole with the Dutch flag
{ push(8.5, 0, 12.6); CY(0.05, 0.07, 7, M.white, 0, 3.5, 0, 8); SP(0.1, C('#e5c158'), 0, 7.05, 0, [1, 1, 1], 8); pop();
  const fg = new THREE.PlaneGeometry(1.8, 1.2, 12, 6); const fc = X.cv(96, 64); const g = fc[1]; ['#ae1c28', '#ffffff', '#21468b'].forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * 21.3, 96, 22); });
  const fm = toon({ map: tex(fc[0]), side: THREE.DoubleSide }); const fl = dyn(fg, fm, scene, 8.5 + 0.92, 6.3, 12.6); fl.userData.base = fg.attributes.position.array.slice(); D.flag = fl; }
// string lights across the square (bulbs glow at dusk)
{ const bulbs = []; const lines = [[[-13, 7.2, -13], [13, 7.2, 13]], [[13, 7.2, -13], [-13, 7.2, 13]], [[-13, 6.5, 0], [13, 6.5, 0]]];
  for (const [a, b] of lines) { for (let i = 0; i <= 30; i++) { const t = i / 30; const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * 1.6, a[2] + (b[2] - a[2]) * t];
    const m = dyn(new THREE.SphereGeometry(0.09, 8, 6), glow(TUL[i % 6]), scene, ...p); m.castShadow = false; m.userData.t = t; m.userData.c = new THREE.Color(TUL[i % 6]); bulbs.push(m);
    if (i < 30) { const q = [a[0] + (b[0] - a[0]) * (t + 1 / 60), a[1] + (b[1] - a[1]) * (t + 1 / 60) - Math.sin((t + 1 / 60) * Math.PI) * 1.6 + 0.08, a[2] + (b[2] - a[2]) * (t + 1 / 60)]; const L = Math.hypot(...[0, 1, 2].map(k => (b[k] - a[k]) / 30)); const cy = dyn(new THREE.CylinderGeometry(0.012, 0.012, L * 1.02, 4), M.iron, scene, ...q); cy.castShadow = false; _v.set(b[0] - a[0], (b[1] - a[1]) - Math.cos(t * Math.PI + Math.PI / 60) * 1.6 * Math.PI, b[2] - a[2]).normalize(); cy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), _v); } } }
  D.bulbs = bulbs; }

// ---- buildings around the square (fronts face the fountain) ----
const N = 0, E = -Math.PI / 2, Wd = Math.PI / 2, S = Math.PI;
// north row (front at z=-14)
house({ x: -7.5, z: -18, ry: N, w: 10, h: 10, mat: M.plasterP, gable: 'flat', skipGround: true }); // theatre (custom front below)
house({ x: 2, z: -18, ry: N, w: 8, h: 9.5, mat: M.brickR, gable: 'step', shop: { awn: M.awnR }, door: '#d6333c' }); // café
house({ x: 9.5, z: -18, ry: N, w: 6, h: 10.5, mat: M.brickY, gable: 'bell' });
// east row (front at x=+14)
house({ x: 18, z: 0, ry: E, w: 12, h: 8.5, mat: M.brickG, gable: 'tri', shop: { awn: M.awnG }, door: '#2f9a4a' }); // supermarket
house({ x: 18, z: -10, ry: E, w: 6, h: 10, mat: M.brickB, gable: 'step' });
house({ x: 18, z: 10, ry: E, w: 6, h: 9.5, mat: M.brickR, gable: 'bell' });
// west row (front at x=-14)
house({ x: -18, z: -1, ry: Wd, w: 7, h: 9, mat: M.plasterB, gable: 'bell', shop: { awn: M.awnP }, door: '#e07ab0' }); // hairdresser
house({ x: -18, z: -9.5, ry: Wd, w: 7, h: 10, mat: M.brickB, gable: 'step', door: '#2f7a4a', doorX: 0 }); // hero's apartment house
house({ x: -18, z: 7.5, ry: Wd, w: 7, h: 9.5, mat: M.brickY, gable: 'tri' });
// south row (front at z=+14)
house({ x: 0, z: 18, ry: S, w: 12, h: 7.5, mat: M.plasterW, gable: 'flat', skipGround: true }); // reception
house({ x: -8.5, z: 18, ry: S, w: 4, h: 9.5, mat: M.brickR, gable: 'step' });
house({ x: 9.5, z: 18, ry: S, w: 6, h: 10, mat: M.brickB, gable: 'bell' });
// back rows (outer ring of houses, seen in aerials)
const rr = X.rng(77);
for (const [x0, z0, ry, n] of [[-12, -30, N, 4], [-12, 30, S, 4], [30, -12, E, 4], [-30, -12, Wd, 4]]) for (let i = 0; i < n; i++) { const along = i * 8;
  const x = ry === N || ry === S ? x0 + along : x0, z = ry === N || ry === S ? z0 : z0 + along;
  house({ x, z, ry, w: 6 + rr() * 1.5, h: 8 + rr() * 2.5, mat: [M.brickR, M.brickB, M.brickY, M.brickG][i % 4], gable: ['step', 'bell', 'tri'][(i + (x0 > 0 ? 1 : 0)) % 3] }); }

// theatre front
{ push(-7.5, 0, -14); for (let i = 0; i < 4; i++) { CY(0.3, 0.34, 5.5, M.white, -3.6 + i * 2.4, 2.75, 0.4, 14); B(0.8, 0.3, 0.8, M.white, -3.6 + i * 2.4, 0.15, 0.4); }
  B(10.2, 0.6, 1.2, M.white, 0, 5.7, 0.3); const s = new THREE.Shape(); s.moveTo(-5.1, 0); s.lineTo(0, 2.2); s.lineTo(5.1, 0); s.closePath(); put(new THREE.ExtrudeGeometry(s, { depth: 0.8, bevelEnabled: false }), M.white, 0, 6, -0.2);
  B(3.2, 3.0, 0.12, C('#7a1f2b'), 0, 1.5, 0.06); B(1.4, 2.6, 0.08, C('#a8323e'), -0.75, 1.3, 0.12); B(1.4, 2.6, 0.08, C('#a8323e'), 0.75, 1.3, 0.12);
  B(5.6, 0.3, 1.8, C('#2b2730'), 0, 3.6, 1.2); pop();
  D.marq = []; for (let i = 0; i < 22; i++) { const m = dyn(new THREE.SphereGeometry(0.08, 8, 6), glow('#fff3a0'), scene, -7.5 - 2.7 + i * 0.257, 3.42, -12.0); m.castShadow = false; D.marq.push(m); }
  D.theatreSign = sign(['THEATRE'], 5.4, 0.9, { bg: '#7a1f2b', fg: '#ffe38a', border: '#f2c33a' }, -7.5, 4.25, -12.25, 0);
  sign(['NOW SHOWING:', 'EVERY DAY'], 1.6, 2.2, { bg: '#f6e6c8', fg: ['#7a1f2b', '#2f5fa8'], border: '#7a1f2b' }, -11.7, 2.0, -13.8, 0, scene, 0.06);
  sign(['TODAY:', 'THE SAME', 'PLAY'], 1.6, 2.2, { bg: '#2f5fa8', fg: '#ffffff', border: '#f2c33a' }, -3.3, 2.0, -13.8, 0, scene, 0.06);
  // theatre clock (hands spin wrong when things feel off)
  push(-7.5, 6.95, -13.3); CY(0.7, 0.7, 0.14, M.white, 0, 0, 0, 28, [Math.PI / 2, 0, 0]); put(new THREE.TorusGeometry(0.7, 0.07, 6, 28), C('#e5c158'), 0, 0, 0.07); for (let i = 0; i < 12; i++) B(0.05, 0.12, 0.03, C('#2b1f1c'), Math.sin(i * Math.PI / 6) * 0.56, Math.cos(i * Math.PI / 6) * 0.56, 0.08, [0, 0, -i * Math.PI / 6]); pop();
  D.clockH = dyn(new THREE.BoxGeometry(0.07, 0.4, 0.03), C('#2b1f1c'), scene, -7.5, 6.95, -13.2); D.clockM = dyn(new THREE.BoxGeometry(0.05, 0.58, 0.03), C('#2b1f1c'), scene, -7.5, 6.95, -13.18);
  D.clockH.geometry.translate(0, 0.18, 0); D.clockM.geometry.translate(0, 0.27, 0); }
// café terrace + sign
sign(['CAFÉ DE HOEK'], 4.6, 0.8, { bg: '#fbf6ee', fg: '#d6333c', border: '#d6333c' }, 2, 4.15, -13.4, 0);
D.cups = [];
[[-0.6, -10.2], [3.4, -10.4], [6.8, -9.6], [-3.0, -9.4]].forEach(([x, z], i) => { push(x, 0, z); CY(0.45, 0.45, 0.05, M.white, 0, 0.75, 0, 18); CY(0.04, 0.04, 0.75, M.iron, 0, 0.37, 0, 6); CY(0.25, 0.3, 0.04, M.iron, 0, 0.02, 0, 10);
  for (const a of [0.6, 2.6, 4.4]) { push(Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7, -a + Math.PI / 2); B(0.42, 0.05, 0.42, C(['#2f6fd1', '#d6333c', '#2f9a4a'][i % 3]), 0, 0.46, 0); B(0.42, 0.45, 0.05, C(['#2f6fd1', '#d6333c', '#2f9a4a'][i % 3]), 0, 0.7, -0.2); for (const s of [-1, 1]) for (const t of [-1, 1]) B(0.04, 0.46, 0.04, M.iron, s * 0.18, 0.23, t * 0.18); pop(); }
  CY(0.035, 0.035, 2.4, M.white, 0, 1.2, 0, 6); put(new THREE.ConeGeometry(1.3, 0.55, 8, 1, true), i % 2 ? M.awnR : M.awnG, 0, 2.45, 0); CY(0.06, 0.06, 0.04, M.white, 0, 2.73, 0, 6);
  pop(); const cup = dyn(new THREE.CylinderGeometry(0.06, 0.05, 0.09, 10), M.white, scene, x + 0.15, 0.82, z + 0.1); D.cups.push(cup); });
// supermarket front
sign(['SUPERMARKET'], 6.4, 0.9, { bg: '#2f9a4a', fg: '#ffffff', border: '#f2c33a' }, 13.4, 4.1, 0, -Math.PI / 2);
crate(12.6, -3.6, -Math.PI / 2, '#f28c28'); crate(12.6, -2.5, -Math.PI / 2, '#e8343e'); crate(12.6, -4.7, -Math.PI / 2, '#9bd14b');
sign(['APPLES', '€0,00'], 0.7, 0.5, { bg: '#fbf6ee', fg: ['#d6333c', '#2b1f1c'], border: '#2b1f1c' }, 12.2, 1.1, -2.5, -Math.PI / 2, scene, 0.04);
// hairdresser front + barber pole
sign(['HAIRDRESSER'], 4.2, 0.75, { bg: '#e07ab0', fg: '#ffffff', border: '#2fa39a' }, -13.4, 4.1, -1, Math.PI / 2);
sign(['WALK-INS', 'ALWAYS WELCOME'], 1.1, 0.75, { bg: '#2fa39a', fg: '#ffffff', border: '#f2c33a' }, -13.75, 1.6, -3.55, Math.PI / 2, scene, 0.05);
{ const pc = X.cv(64, 256); const g = pc[1]; g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 256); for (let i = -4; i < 12; i++) { g.fillStyle = i % 2 ? '#d6333c' : '#2f5fa8'; g.beginPath(); g.moveTo(0, i * 32); g.lineTo(64, i * 32 - 40); g.lineTo(64, i * 32 - 24); g.lineTo(0, i * 32 + 16); g.fill(); }
  const pt = tex(pc[0], 1, 2); D.pole = pt; push(-13.7, 2.0, 2.9); CY(0.16, 0.16, 0.12, M.chrome, 0, 0.75, 0, 12); CY(0.16, 0.16, 0.12, M.chrome, 0, -0.75, 0, 12); SP(0.16, M.chrome, 0, 0.85, 0, [1, 1, 1], 10); pop();
  dyn(new THREE.CylinderGeometry(0.13, 0.13, 1.4, 16), toon({ map: pt }), scene, -13.7, 2.0, 2.9); }
// reception (south) front: glass doors, EXIT sign, rooftop letters
{ push(0, 0, 14); B(4.2, 3.0, 0.15, C('#2b2730'), 0, 1.5, 0.05); B(12.2, 0.4, 2.2, M.white, 0, 3.3, 1.0); for (const s of [-1, 1]) CY(0.12, 0.12, 3.2, M.white, s * 5.6, 1.6, 2.0, 8); pop();
  D.recDoorL = dyn(new THREE.BoxGeometry(1.0, 2.6, 0.06), M.glass, scene, -0.5, 1.3, 14.15); D.recDoorR = dyn(new THREE.BoxGeometry(1.0, 2.6, 0.06), M.glass, scene, 0.5, 1.3, 14.15);
  sign(['RECEPTION'], 4.0, 0.7, { bg: '#2e3f73', fg: '#ffffff', border: '#e5c158' }, 0, 4.0, 15.2, Math.PI);
  D.exitOut = sign(['EXIT'], 1.2, 0.45, { bg: '#2f9a4a', fg: '#ffffff', border: '#ffffff' }, 0, 2.9, 14.2, Math.PI, scene, 0.08);
  D.letters = sign(['HOGEWEYK'], 12, 2.2, { bg: '#fbf6ee', fg: '#2e3f73', border: '#d6333c' }, 0, 9.6, 20, 0, scene, 0.3); D.letters.rotation.x = -0.35; }
// fingerposts at the corner streets: every arrow says SQUARE
for (const [x, z, ry] of [[14.5, -14.6, 0.6], [-14.6, 14.4, -2.5], [14.4, 14.5, 2.3], [-14.6, -14.5, -0.7], [15.6, -24, 0.1], [-15.6, 24, 3.1]]) {
  push(x, 0, z, ry); CY(0.06, 0.08, 3.2, M.white, 0, 1.6, 0, 8); pop();
  [0, 1.9, -1.4].forEach((a, i) => { const s = sign(['SQUARE ➜'], 1.3, 0.32, { bg: '#fbf6ee', fg: '#2e3f73', border: '#2e3f73' }, 0, 0, 0, 0, scene, 0.05); s.position.set(x, 2.9 - i * 0.42, z); s.rotation.y = ry + a; s.translateX(0.62); (D.posts ||= []).push(s); }); }
// streets out of the square: extra lamps, planters
lamp(17.5, -20, 0); lamp(-17.5, 20, Math.PI); planter(13.8, -22, Math.PI / 2, 2); planter(-13.8, 22, Math.PI / 2, 2);
// hedge ring + gardens + far trees
for (const [x, z, w, d] of [[0, -40, 80, 1.6], [0, 40, 80, 1.6], [40, 0, 1.6, 80], [-40, 0, 1.6, 80]]) B(w, 1.8, d, M.hedge, x, 0.9, z, undefined, 1.5);
for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2 + 0.05, r = 45 + (i % 3) * 5; tree(Math.cos(a) * r, Math.sin(a) * r, 1.1 + (i % 4) * 0.15); }
for (let i = 0; i < 10; i++) tree(-34 + i * 7.5 + (i % 2), -35 + (i % 3), 0.9);
// tulip fields (north-west, outside the hedge)
{ const ps = [], cs = []; for (let row = 0; row < 26; row++) for (let i = 0; i < 70; i++) { ps.push([-120 + i * 1.0 + (row % 2) * 0.5, -0.05, -60 - row * 0.9]); cs.push(TUL[Math.floor(row / 4) % 5]); } tulipMesh(ps.length, ps, cs); }
// windmill
{ const g = group(-70, 0, -82); push(-70, 0, -82); CY(2.4, 4.0, 14, M.brickB, 0, 7, 0, 10); put(new THREE.ConeGeometry(2.8, 3.4, 10), M.roof, 0, 15.6, 0); B(1.2, 2.2, 0.3, C('#2f7a4a'), 0, 1.1, 3.7); B(5.4, 0.3, 5.4, M.wood, 0, 5.5, 0); pop();
  const sails = group(0, 14.6, 3.2, 0, g); for (let i = 0; i < 4; i++) { const arm = group(0, 0, 0, 0, sails); arm.rotation.z = i * Math.PI / 2; dyn(new THREE.BoxGeometry(0.3, 9, 0.2), M.wood, arm, 0, 4.5, 0); dyn(new THREE.BoxGeometry(1.6, 7.2, 0.08), C('#f4efe0'), arm, 0.9, 5.2, 0); }
  D.sails = sails; }
// canal north of the hedge
{ const wm = new THREE.Mesh(new THREE.PlaneGeometry(600, 9), M.water); wm.rotation.x = -Math.PI / 2; wm.position.set(0, 0.05, -50); scene.add(wm); B(600, 0.3, 0.5, M.stone, 0, 0.15, -45.3); B(600, 0.3, 0.5, M.stone, 0, 0.15, -54.7); }
// ---- the OUTSIDE world: a fast, confusing highway south of the hedge ----
{ const road = new THREE.PlaneGeometry(500, 14); const u = road.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * 60, u.getY(i) * 2); put(road, M.asphalt, 0, 0.03, 62, [-Math.PI / 2, 0, 0], undefined, false);
  for (let i = 0; i < 80; i++) for (const z of [58.5, 62, 65.5]) B(2.2, 0.02, 0.18, M.white, -250 + i * 6.3, 0.05, z, undefined, 1, false);
  B(500, 0.9, 0.3, M.chrome, 0, 0.45, 54.6); B(500, 0.9, 0.3, M.chrome, 0, 0.45, 69.4);
  D.cars = []; const carCols = ['#d6333c', '#2f6fd1', '#f2c33a', '#2f9a4a', '#e07ab0', '#f28c28', '#ffffff', '#6b4ad1'];
  for (let i = 0; i < 24; i++) { const g = group(0, 0, [57, 60.3, 63.7, 67][i % 4]); const c = C(carCols[i % 8]);
    dyn(new THREE.BoxGeometry(3.6, 0.8, 1.7), c, g, 0, 0.65, 0); dyn(new THREE.BoxGeometry(2.0, 0.7, 1.5), c, g, -0.2, 1.35, 0); dyn(new THREE.BoxGeometry(1.9, 0.5, 1.56), M.glass, g, -0.2, 1.38, 0);
    for (const s of [-1, 1]) for (const t of [-1, 1]) { const wh = dyn(new THREE.CylinderGeometry(0.33, 0.33, 0.3, 12), M.iron, g, s * 1.15, 0.33, t * 0.78); wh.rotation.x = Math.PI / 2; }
    const hl = dyn(new THREE.BoxGeometry(0.06, 0.2, 1.3), glow('#fff6c0'), g, 1.81, 0.75, 0); g.userData = { lane: i % 4, off: i * 23.3, dir: i % 4 < 2 ? 1 : -1, sp: 14 + (i % 3) * 4 }; D.cars.push(g); }
  // tangled signposts + billboards + traffic lights
  D.arrows = []; for (let k = 0; k < 3; k++) { const x = -14 + k * 14; push(x, 0, 52); CY(0.08, 0.1, 6.4, M.iron, 0, 3.2, 0, 8); pop();
    ['CITY →', '← RING 3', 'EXIT 12B ↗', '↙ DETOUR', 'ALL ROUTES →', '↺ U-TURN'].forEach((t, i) => { const s = sign([t], 2.2, 0.45, { bg: ['#2f6fd1', '#2f9a4a', '#f2c33a', '#d6333c'][(i + k) % 4], fg: '#ffffff', border: '#ffffff' }, x, 6.0 - i * 0.55, 52, i * 1.1 + k, scene, 0.06); s.userData.base = s.rotation.y; D.arrows.push(s); }); }
  D.boards = []; [['BUY NOW!!'], ['NEW! FASTER!'], ['SCAN HERE ▣'], ['SALE 70%'], ['UPDATE NOW']].forEach((t, i) => { const x = -40 + i * 20; push(x, 0, 74); CY(0.2, 0.2, 6, M.iron, -2, 3, 0, 8); CY(0.2, 0.2, 6, M.iron, 2, 3, 0, 8); pop();
    D.boards.push(sign(t, 7, 3, { bg: ['#d6333c', '#f2c33a', '#2f6fd1', '#e07ab0', '#2f9a4a'][i], fg: '#ffffff', border: '#2b1f1c' }, x, 7, 74, Math.PI, scene, 0.3)); });
  D.tl = []; for (const x of [-26, 6, 30]) { push(x, 0, 53.6); CY(0.1, 0.1, 4.6, M.iron, 0, 2.3, 0, 8); B(0.5, 1.4, 0.45, C('#2b2730'), 0, 4.9, 0); pop(); D.tl.push(['#e8343e', '#f2c33a', '#2fbf5a'].map((c, i) => { const m = dyn(new THREE.SphereGeometry(0.16, 10, 8), glow(c), scene, x, 5.35 - i * 0.43, 53.85); m.userData.c = new THREE.Color(c); return m; })); }
  // skyline
  const sr = X.rng(5); for (let i = 0; i < 26; i++) { const w = 8 + sr() * 10, h = 20 + sr() * 60; B(w, h, 10, C(['#8fa7c8', '#a9b8cc', '#7d93b8', '#b7c3d6'][i % 4]), -150 + i * 12, h / 2, 120 + sr() * 30, undefined, 4); } }
// 3D clouds
D.clouds = []; { const r = X.rng(90); for (let i = 0; i < 16; i++) { const g = group(-300 + r() * 600, 70 + r() * 60, -320 + r() * 640); for (let k = 0; k < 6; k++) { const m = dyn(new THREE.IcosahedronGeometry(6 + r() * 6, 1), C('#ffffff'), g, k * 6 - 15, r() * 4, r() * 6); m.castShadow = false; m.scale.y = 0.7; } D.clouds.push(g); } }
// pigeons
D.pigeons = []; for (let i = 0; i < 10; i++) { const g = group(0, 0, 0); const body = C(i % 3 ? '#8d93a3' : '#b9bdc8');
  dyn(new THREE.SphereGeometry(0.11, 10, 8), body, g, 0, 0.13, 0).scale.set(1.5, 1, 1); const hd = dyn(new THREE.SphereGeometry(0.06, 8, 6), C('#6d7390'), g, 0.15, 0.22, 0); dyn(new THREE.ConeGeometry(0.02, 0.06, 5), C('#e5a04a'), hd, 0.06, 0, 0).rotation.z = -Math.PI / 2;
  dyn(new THREE.SphereGeometry(0.03, 6, 4), C('#3f8f7a'), g, 0.11, 0.17, 0); dyn(new THREE.BoxGeometry(0.14, 0.02, 0.08), body, g, -0.18, 0.15, 0);
  const wl = dyn(new THREE.BoxGeometry(0.16, 0.015, 0.22), body, g, 0, 0.18, 0.12), wr = dyn(new THREE.BoxGeometry(0.16, 0.015, 0.22), body, g, 0, 0.18, -0.12);
  for (const s of [-1, 1]) dyn(new THREE.CylinderGeometry(0.008, 0.008, 0.07, 4), C('#e5a04a'), g, 0, 0.035, s * 0.04);
  g.userData = { hd, wl, wr, seed: i * 1.7 }; D.pigeons.push(g); }
// gulls in the sky
D.gulls = []; for (let i = 0; i < 7; i++) { const g = group(0, 0, 0); const wl = dyn(new THREE.BoxGeometry(0.15, 0.03, 0.8), C('#ffffff'), g, 0, 0, 0.4), wr = dyn(new THREE.BoxGeometry(0.15, 0.03, 0.8), C('#ffffff'), g, 0, 0, -0.4); dyn(new THREE.SphereGeometry(0.12, 8, 6), C('#ffffff'), g).scale.set(2, 1, 1); g.userData = { wl, wr, seed: i * 2.3 }; D.gulls.push(g); }
// clapperboard (hook)
{ const g = group(1.6, 0, 6.3, 0.25); push(1.6, 0, 6.3, 0.25); for (const s of [-1, 1]) B(0.05, 1.05, 0.05, M.iron, s * 0.3, 0.52, 0.3 * s, [0.18 * s, 0, 0]); B(0.05, 1.1, 0.05, M.iron, 0, 0.52, -0.33, [-0.25, 0, 0]); pop();
  const brd = sign(['HOGEWEYK, NL', 'SCENE 1 · TAKE 1'], 0.9, 0.62, { bg: '#2b2730', fg: '#ffffff', border: '#ffffff', font: 'DejaVu Sans, sans-serif' }, 0, 1.35, 0, 0, g, 0.05);
  const stc = X.cv(256, 32); for (let i = 0; i < 8; i++) { stc[1].fillStyle = i % 2 ? '#ffffff' : '#2b2730'; stc[1].beginPath(); stc[1].moveTo(i * 32, 0); stc[1].lineTo(i * 32 + 32, 0); stc[1].lineTo(i * 32 + 16, 32); stc[1].lineTo(i * 32 - 16, 32); stc[1].fill(); }
  const stm = toon({ map: tex(stc[0]) }); dyn(new THREE.BoxGeometry(0.92, 0.12, 0.06), stm, g, 0, 1.72, 0); const arm = group(-0.46, 1.79, 0, 0, g); dyn(new THREE.BoxGeometry(0.92, 0.12, 0.06), stm, arm, 0.46, 0.06, 0); D.clap = { g, arm }; }
// spotlight beam (hook "actors")
{ const cone = new THREE.ConeGeometry(1.6, 9, 24, 1, true); cone.translate(0, -4.5, 0); D.spot = new THREE.Mesh(cone, new THREE.MeshBasicMaterial({ color: '#fff7c8', transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide })); D.spot.userData.ndSkip = true; D.spot.renderOrder = 5; scene.add(D.spot);
  D.spotPool = new THREE.Mesh(new THREE.CircleGeometry(1.6, 32), new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0.45, depthWrite: false })); D.spotPool.rotation.x = -Math.PI / 2; D.spotPool.userData.ndSkip = true; scene.add(D.spotPool); }
// rainbow (paradise)
{ const g = new THREE.Group(); ['#e8343e', '#f28c28', '#f6c12e', '#4fbf4a', '#3f8fe0', '#8a5ad6'].forEach((c, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(28 - i * 0.9, 0.45, 6, 64, Math.PI), toon({ color: c })); m.castShadow = false; g.add(m); });
  g.position.set(0, 0, -42); scene.add(g); D.rainbow = g; }

// ======================================================================= INTERIORS (y = IN)
const room = (ox, w, d, h, floor, wall, opts = {}) => { push(ox, IN, 0); B(w, 0.1, d, floor, 0, -0.05, 0, undefined, 1.5, false);
  B(w, h, 0.2, wall, 0, h / 2, -d / 2 - 0.1, undefined, 2, false); B(0.2, h, d, wall, -w / 2 - 0.1, h / 2, 0, undefined, 2, false); B(0.2, h, d, wall, w / 2 + 0.1, h / 2, 0, undefined, 2, false); B(w, h, 0.2, wall, 0, h / 2, d / 2 + 0.1, undefined, 2, false);
  B(w + 0.4, 0.15, d + 0.4, M.white, 0, h + 0.07, 0, undefined, 2, false); B(w, 0.15, 0.06, M.white, 0, 0.07, -d / 2 + 0.03, undefined, 2, false); B(0.06, 0.15, d, M.white, -w / 2 + 0.03, 0.07, 0, undefined, 2, false); B(0.06, 0.15, d, M.white, w / 2 - 0.03, 0.07, 0, undefined, 2, false);
  B(w, 0.12, 0.08, M.white, 0, h - 0.06, -d / 2 + 0.04, undefined, 2, false); pop(); };
const backdropPlane = (kind, x, y, z, w, h, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(X.backdrop(kind)), fog: false })); m.position.set(x, y, z); m.rotation.y = ry; m.userData.nd = null; scene.add(m); return m; };
const winFrame = (w, h) => { B(w + 0.16, 0.1, 0.12, M.white, 0, h / 2, 0); B(w + 0.16, 0.1, 0.12, M.white, 0, -h / 2, 0); B(0.1, h, 0.12, M.white, -w / 2, 0, 0); B(0.1, h, 0.12, M.white, w / 2, 0, 0); B(0.06, h, 0.08, M.white, 0, 0, 0); B(w, 0.06, 0.08, M.white, 0, 0.15, 0); B(w + 0.3, 0.08, 0.25, M.white, 0, -h / 2 - 0.06, 0.08); };
const frame = (x, y, z, ry, w, h, c, kind) => { push(x, y, z, ry); B(w, h, 0.05, C('#c98a3e'), 0, 0, 0); pop(); const pc = X.cv(128, 160); const g = pc[1]; g.fillStyle = c; g.fillRect(0, 0, 128, 160);
  if (kind) { g.save(); g.translate(64, 150); g.scale(0.17, 0.17); T.rick(g, kind, { expr: 'grin' }); g.restore(); } else { g.fillStyle = '#4fbf4a'; g.fillRect(0, 110, 128, 50); g.fillStyle = '#fff'; g.beginPath(); g.arc(40, 40, 18, 0, 7); g.fill(); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, h * 0.8), toon({ map: tex(pc[0]) })); m.position.set(x, y, z); m.rotation.y = ry; m.translateZ(0.03); scene.add(m); return m; };
const DAUGHTER = { outfit: 'dress', hairStyle: 'long', hair: '#d9a23a', top: '#5aa0d8' };

// ---- APARTMENT (ox = 0) ----
{ const ox = 0, y0 = IN; room(ox, 7, 6, 3, M.planks, M.wallApt);
  // window + curtains + backdrop
  push(ox + 0.9, y0 + 1.7, -2.95); winFrame(1.6, 1.4); pop(); backdropPlane('roofs', ox + 0.9, y0 + 1.6, -4.5, 6, 3);
  D.curL = dyn(new THREE.BoxGeometry(0.9, 1.9, 0.08), C('#e86a6a'), scene, ox + 0.45, y0 + 1.65, -2.82); D.curR = dyn(new THREE.BoxGeometry(0.9, 1.9, 0.08), C('#e86a6a'), scene, ox + 1.35, y0 + 1.65, -2.82);
  push(ox + 0.9, y0 + 2.65, -2.8); CY(0.03, 0.03, 2.4, M.woodL, 0, 0, 0, 6, [0, 0, Math.PI / 2]); pop();
  // bed
  push(ox - 2.0, y0, -1.75); B(1.6, 0.35, 2.3, M.wood, 0, 0.22, 0, undefined, 1); B(1.5, 0.25, 2.2, M.white, 0, 0.5, 0, undefined, 1); B(1.7, 1.2, 0.12, M.wood, 0, 0.6, -1.15, undefined, 1); B(1.7, 0.6, 0.1, M.wood, 0, 0.3, 1.15, undefined, 1);
  B(1.0, 0.18, 0.45, C('#f4f1ea'), 0, 0.7, -0.85, undefined, 1); B(1.56, 0.16, 1.35, M.quilt, 0, 0.7, 0.4, undefined, 1); for (const s of [-1, 1]) B(0.06, 0.4, 1.35, M.quilt, s * 0.8, 0.52, 0.4, undefined, 1); pop();
  // nightstand + alarm clock + lamp
  push(ox - 0.75, y0, -2.55); B(0.55, 0.6, 0.45, M.woodL, 0, 0.3, 0); B(0.4, 0.05, 0.02, M.wood, 0, 0.42, 0.23); CY(0.12, 0.15, 0.06, C('#2f6fd1'), 0.12, 0.63, -0.05, 10); CY(0.02, 0.02, 0.35, M.chrome, 0.12, 0.8, -0.05, 6); put(new THREE.ConeGeometry(0.17, 0.2, 12, 1, true), C('#f2c33a'), 0.12, 1.02, -0.05); pop();
  { const g = group(ox - 0.85, y0 + 0.73, -2.45); const face = dyn(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 18), C('#d6333c'), g); face.rotation.x = Math.PI / 2; const f2 = dyn(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 18), M.white, g, 0, 0, 0.035); f2.rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) dyn(new THREE.SphereGeometry(0.045, 8, 6), C('#e5c158'), g, s * 0.07, 0.1, 0); for (const s of [-1, 1]) dyn(new THREE.CylinderGeometry(0.01, 0.01, 0.06, 4), M.iron, g, s * 0.06, -0.12, 0);
    const hh = dyn(new THREE.BoxGeometry(0.012, 0.05, 0.01), C('#2b1f1c'), g, 0, 0.02, 0.05), mh = dyn(new THREE.BoxGeometry(0.01, 0.07, 0.01), C('#2b1f1c'), g, 0.02, 0.0, 0.052); mh.rotation.z = -1; D.alarm = g; }
  // wardrobe, door, rug, table with teapot, plant, photos, shelf
  push(ox + 2.6, y0, -2.55); B(1.3, 2.3, 0.7, M.woodL, 0, 1.15, 0, undefined, 1); B(0.03, 2.1, 0.02, M.wood, 0, 1.15, 0.36); for (const s of [-1, 1]) SP(0.04, C('#e5c158'), s * 0.1, 1.2, 0.37, [1, 1, 1], 6); pop();
  push(ox + 3.48, y0, 0.6); B(0.12, 2.4, 1.2, M.white, 0, 1.2, 0); pop();
  { const hinge = group(ox + 3.42, y0, 0.05, 0); dyn(new THREE.BoxGeometry(0.06, 2.2, 1.06), C('#2f7a4a'), hinge, 0, 1.1, 0.53); dyn(new THREE.SphereGeometry(0.05, 8, 6), C('#e5c158'), hinge, -0.06, 1.05, 0.95); D.aptDoor = hinge; }
  push(ox - 0.2, y0 + 0.012, 0.6); put(new THREE.CircleGeometry(1.4, 32), C('#d97a3e'), 0, 0, 0, [-Math.PI / 2, 0, 0], undefined, false); put(new THREE.CircleGeometry(1.0, 32), C('#f2c33a'), 0, 0.005, 0, [-Math.PI / 2, 0, 0], undefined, false); pop();
  push(ox + 2.2, y0, 1.6); CY(0.5, 0.5, 0.05, M.woodL, 0, 0.75, 0, 18); CY(0.05, 0.05, 0.75, M.wood, 0, 0.37, 0, 6); SP(0.14, C('#5aa0d8'), -0.1, 0.9, 0, [1, 0.85, 1], 12); CY(0.02, 0.03, 0.14, C('#5aa0d8'), 0.06, 0.93, 0, 6, [0, 0, -0.9]); CY(0.06, 0.05, 0.1, M.white, 0.25, 0.83, 0.1, 10); pop();
  D.teaSteam = [ox + 2.1, y0 + 1.05, 1.6];
  push(ox - 3.0, y0, 2.4); CY(0.22, 0.18, 0.4, C('#c9503f'), 0, 0.2, 0, 10); for (let i = 0; i < 5; i++) SP(0.25, C('#4f9a3c'), Math.cos(i) * 0.15, 0.7 + i * 0.1, Math.sin(i) * 0.15, [1, 1.3, 1], 8); pop();
  frame(ox - 3.47, y0 + 1.9, -0.6, Math.PI / 2, 0.6, 0.75, '#bfe3f5', DAUGHTER); frame(ox - 3.47, y0 + 1.8, 0.4, Math.PI / 2, 0.5, 0.6, '#f9d9a6', null); frame(ox - 2.0, y0 + 2.2, -2.94, 0, 0.7, 0.55, '#ffd0e0', null);
  push(ox - 3.35, y0 + 1.4, 1.6); B(0.28, 0.04, 1.2, M.woodL, 0, 0, 0); for (let i = 0; i < 8; i++) B(0.2, 0.26 + (i % 3) * 0.04, 0.1, C(TUL[i % 6]), 0, 0.15, -0.5 + i * 0.13); pop();
  push(ox + 1.7, y0 + 2.3, -2.95); CY(0.3, 0.3, 0.06, M.white, 0, 0, 0.03, 24, [Math.PI / 2, 0, 0]); put(new THREE.TorusGeometry(0.3, 0.04, 6, 24), C('#2f6fd1'), 0, 0, 0.06); pop();
  D.aptClock = [dyn(new THREE.BoxGeometry(0.03, 0.17, 0.02), C('#2b1f1c'), scene, ox + 1.7, y0 + 2.3, -2.85), dyn(new THREE.BoxGeometry(0.02, 0.24, 0.02), C('#2b1f1c'), scene, ox + 1.7, y0 + 2.3, -2.84)];
  D.aptClock.forEach((m) => m.geometry.translate(0, 0.08, 0));
  sign(['GOOD', 'MORNING!'], 0.9, 0.5, { bg: '#fff6d6', fg: '#d6333c', border: '#c98a3e' }, ox + 2.6, y0 + 1.75, -2.18, 0, scene, 0.03);
}
// ---- SALON (ox = 40) ----
{ const ox = 40, y0 = IN; room(ox, 8, 7, 3.2, M.checker, M.wallSalon); M.checker.map.repeat.set(1, 1);
  push(ox, y0, -3.4); B(2.2, 1.6, 0.08, C('#e5c158'), 0, 1.85, 0.04); B(1.95, 1.38, 0.06, toon({ map: tex(glassTex), color: '#d8f0ff' }), 0, 1.85, 0.09); B(3.6, 0.08, 0.5, M.white, 0, 0.95, 0.25); B(3.6, 0.9, 0.45, C('#2fa39a'), 0, 0.47, 0.22);
  for (let i = 0; i < 9; i++) CY(0.05, 0.05, 0.18 + (i % 3) * 0.05, C(TUL[i % 6]), -1.6 + i * 0.4, 1.08 + (i % 3) * 0.025, 0.3, 8); pop();
  { const g = group(ox, y0, -1.7); dyn(new THREE.CylinderGeometry(0.3, 0.4, 0.1, 16), M.chrome, g, 0, 0.05, 0); dyn(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), M.chrome, g, 0, 0.3, 0);
    const seat = group(0, 0.5, 0, 0, g); dyn(new THREE.BoxGeometry(0.7, 0.15, 0.65), C('#d6333c'), seat, 0, 0.05, 0); dyn(new THREE.BoxGeometry(0.7, 0.8, 0.14), C('#d6333c'), seat, 0, 0.45, -0.3); for (const s of [-1, 1]) dyn(new THREE.BoxGeometry(0.1, 0.12, 0.6), M.chrome, seat, s * 0.38, 0.28, 0); dyn(new THREE.BoxGeometry(0.5, 0.06, 0.25), M.chrome, seat, 0, -0.3, 0.42); D.chair = seat; }
  push(ox - 3.0, y0, -2.4); B(0.6, 0.5, 0.6, C('#f07aa8'), 0, 0.25, 0); B(0.6, 0.7, 0.12, C('#f07aa8'), 0, 0.75, -0.25); CY(0.04, 0.04, 1.4, M.chrome, 0, 1.1, -0.35, 6); put(new THREE.SphereGeometry(0.42, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), C('#c9d2da'), 0, 1.55, -0.1, [Math.PI * 0.85, 0, 0]); pop();
  push(ox + 3.0, y0, -3.0); B(1.0, 0.9, 0.6, M.white, 0, 0.45, 0); put(new THREE.SphereGeometry(0.3, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), C('#3b3f4a'), 0, 0.93, 0.05, [Math.PI, 0, 0]); CY(0.02, 0.02, 0.35, M.chrome, 0, 1.08, -0.2, 6); pop();
  push(ox + 2.5, y0, 1.5); B(1.6, 1.0, 0.7, C('#2fa39a'), 0, 0.5, 0); B(1.7, 0.06, 0.8, M.white, 0, 1.02, 0); pop();
  { const g = group(ox + 2.4, y0 + 1.08, 1.5, -0.3); const pc = X.cv(512, 256); const gg = pc[1]; gg.fillStyle = '#fffaf0'; gg.fillRect(0, 0, 512, 256); gg.strokeStyle = '#c3cdd2'; gg.lineWidth = 2; for (let i = 0; i < 9; i++) { gg.beginPath(); gg.moveTo(16, 40 + i * 24); gg.lineTo(240, 40 + i * 24); gg.moveTo(272, 40 + i * 24); gg.lineTo(496, 40 + i * 24); gg.stroke(); }
    gg.fillStyle = '#d6333c'; gg.font = 'bold 30px "Lilita One"'; gg.fillText('APPOINTMENTS', 20, 30); gg.fillText('(nobody)', 290, 30); gg.fillStyle = '#2b2730'; gg.fillRect(255, 0, 2, 256);
    const pm = toon({ map: tex(pc[0]) }); const L = dyn(new THREE.BoxGeometry(0.4, 0.02, 0.4), [C('#d6333c'), C('#d6333c'), pm, C('#d6333c'), C('#d6333c'), C('#d6333c')], g, 0, 0.01, 0);
    const pt = pm.map; pt.repeat.set(0.5, 1); L.position.x = -0.2; const R = dyn(new THREE.BoxGeometry(0.4, 0.02, 0.4), [C('#d6333c'), C('#d6333c'), (() => { const m = toon({ map: tex(pc[0]) }); m.map.repeat.set(0.5, 1); m.map.offset.set(0.5, 0); return m; })(), C('#d6333c'), C('#d6333c'), C('#d6333c')], g, 0.2, 0.01, 0); D.book = { g, L, R }; }
  { const g = group(ox + 2.0, y0 + 1.06, 1.35, 0.4 + Math.PI); const pc = X.cv(512, 256); const gg = pc[1]; gg.fillStyle = '#fffaf0'; gg.fillRect(0, 0, 512, 256); gg.strokeStyle = '#c3cdd2'; for (let i = 0; i < 9; i++) { gg.beginPath(); gg.moveTo(16, 40 + i * 24); gg.lineTo(496, 40 + i * 24); gg.stroke(); }
    gg.fillStyle = '#2e3f73'; gg.font = '28px "Lilita One"'; ['HENK, room 4', 'scared today :(', 'loves talking about', 'his daughter Lotte', 'laughed again ♥'].forEach((t, i) => gg.fillText(t, i < 2 ? 24 : 270, 62 + (i % 3) * 52 + (i >= 2 ? 0 : 0)));
    gg.fillStyle = '#2b2730'; gg.fillRect(255, 0, 2, 256);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.03, 0.28), [C('#d6333c'), C('#d6333c'), toon({ map: tex(pc[0]) }), C('#d6333c'), C('#d6333c'), C('#d6333c')]); g.add(m); m.castShadow = true; D.notebook = g; }
  sign(['WALK-INS', 'ALWAYS WELCOME!'], 1.5, 0.9, { bg: '#2fa39a', fg: '#ffffff', border: '#f2c33a' }, ox - 3.95, y0 + 2.0, 0.6, Math.PI / 2, scene, 0.05);
  push(ox - 3.95, y0 + 1.7, -1.3); winFrame(1.2, 1.2); pop(); backdropPlane('roofs', ox - 5.2, y0 + 1.6, -1.3, 5, 3, Math.PI / 2);
  push(ox + 3.0, y0, 3.0); CY(0.2, 0.16, 0.38, C('#2f6fd1'), 0, 0.19, 0, 10); for (let i = 0; i < 5; i++) SP(0.22, C('#62ad45'), Math.cos(i) * 0.12, 0.6 + i * 0.1, Math.sin(i) * 0.12, [1, 1.3, 1], 8); pop();
  push(ox - 3.9, y0, 2.6); for (let k = 0; k < 2; k++) { B(0.5, 0.45, 0.5, C('#f2c33a'), 0, 0.22, -k * 0.7); B(0.5, 0.5, 0.08, C('#f2c33a'), 0.21, 0.7, -k * 0.7, [0, Math.PI / 2, 0]); } pop();
  push(ox + 3.97, y0 + 2.0, -1.0); for (let i = 0; i < 3; i++) frame(ox + 3.94, y0 + 2.0, -1.8 + i * 0.75, -Math.PI / 2, 0.55, 0.7, ['#ffd0e0', '#d6f0e4', '#fff1b8'][i], [T.CAST?.hair, null, null][i] || ({ outfit: 'smock', hat: 'bob', hairStyle: 'bob', hair: ['#c2402f', '#3a2a22', '#d9a23a'][i], top: '#2fa39a' })); pop();
}
// ---- SUPERMARKET (ox = 80) ----
{ const ox = 80, y0 = IN; room(ox, 12, 10, 3.6, M.tilesW, M.wallLobby); M.tilesW.map.repeat.set(1, 1);
  const prodGeo = new THREE.BoxGeometry(0.22, 0.3, 0.2); const nP = 3 * 2 * 4 * 22; const prods = new THREE.InstancedMesh(prodGeo, toon({ color: '#ffffff' }), nP); let k = 0; const pr = X.rng(3);
  for (const sx of [-2.4, 0, 2.4]) { push(ox + sx, y0, -0.8); B(0.9, 2.0, 5.2, C('#e9eef0'), 0, 1.0, 0, undefined, 1); for (let l = 0; l < 4; l++) for (const s of [-1, 1]) B(0.3, 0.04, 5.2, M.white, s * 0.6, 0.35 + l * 0.48, 0); pop();
    for (let l = 0; l < 4; l++) for (const s of [-1, 1]) for (let i = 0; i < 22; i++) { _m.makeTranslation(ox + sx + s * 0.6, y0 + 0.52 + l * 0.48 + (pr() - 0.5) * 0.03, -0.8 - 2.5 + i * 0.235); prods.setMatrixAt(k, _m); prods.setColorAt(k++, new THREE.Color(['#e8343e', '#f6c12e', '#2f6fd1', '#4fbf4a', '#f28c28', '#e07ab0', '#ffffff', '#8a5ad6'][(i * 3 + l + (sx > 0 ? 2 : 0) + (pr() * 3 | 0)) % 8])); } }
  prods.castShadow = true; prods.receiveShadow = true; scene.add(prods); D.prods = prods;
  [['FRUIT', '#e8343e'], ['BREAD', '#f28c28'], ['MILK', '#2f6fd1']].forEach(([t, c], i) => sign([t], 1.4, 0.45, { bg: c, fg: '#ffffff', border: '#ffffff' }, ox - 2.4 + i * 2.4, y0 + 2.9, -0.8, 0, scene, 0.05));
  for (let i = 0; i < 4; i++) { push(ox - 3 + i * 2, y0 + 3.5, -0.5); B(0.25, 0.08, 2.4, glow('#f4fbff'), 0, 0, 0, undefined, 1, false); pop(); }
  // fruit stand
  // checkout
  push(ox + 3.6, y0, 3.1); B(2.6, 0.9, 0.8, C('#2f9a4a'), 0, 0.45, 0); B(2.7, 0.05, 0.85, M.white, 0, 0.92, 0); B(0.4, 0.3, 0.35, M.iron, 0.9, 1.1, -0.1); pop();
  { const bc = X.cv(64, 64); bc[1].fillStyle = '#2b2730'; bc[1].fillRect(0, 0, 64, 64); bc[1].fillStyle = '#4a4752'; for (let i = 0; i < 4; i++) bc[1].fillRect(i * 16, 0, 6, 64); const bt = tex(bc[0], 8, 1); D.belt = bt; dyn(new THREE.BoxGeometry(1.7, 0.03, 0.5), toon({ map: bt }), scene, ox + 3.1, y0 + 0.96, 3.0); }
  D.register = sign(['TOTAL: €0,00'], 0.8, 0.3, { bg: '#1a2a20', fg: '#7dff9a', border: '#3b3f4a', font: 'DejaVu Sans Mono, monospace' }, ox + 4.5, y0 + 1.45, 2.95, -0.3, scene, 0.08);
  sign(['CHECKOUT 1'], 1.3, 0.4, { bg: '#f2c33a', fg: '#2b1f1c', border: '#2b1f1c' }, ox + 3.6, y0 + 2.7, 3.1, 0, scene, 0.05);
  push(ox, y0 + 1.6, 4.98); B(3.0, 2.8, 0.1, M.white, 0, 0, 0); pop(); backdropPlane('road', ox, y0 + 1.6, 6.5, 8, 4, Math.PI);
  D.supDoorL = dyn(new THREE.BoxGeometry(0.75, 2.4, 0.05), M.glass, scene, ox - 0.4, y0 + 1.2, 4.9); D.supDoorR = dyn(new THREE.BoxGeometry(0.75, 2.4, 0.05), M.glass, scene, ox + 0.4, y0 + 1.2, 4.9);
  push(ox + 5.95, y0 + 1.8, 0); B(0.05, 1.2, 3.0, toon({ map: tex(X.signCanvas(['FRESH!', 'TODAY'], { w: 512, h: 256, bg: '#f28c28', fg: '#ffffff', border: '#ffffff' })) }), 0, 0, 0); pop();
  push(ox - 5.95, y0 + 1.8, -1.0); B(0.05, 1.2, 3.0, toon({ map: tex(X.signCanvas(['EVERYTHING', '€0,00*'], { w: 512, h: 256, bg: '#2f6fd1', fg: '#ffffff', border: '#ffffff' })) }), 0, 0, 0); pop();
}
// lift supermarket crates into the interior (crate() builds at y=0) — rebuild there properly
{ push(80, IN, 0); crate(-4.9, 3.6, 0, '#f28c28'); crate(-4.0, 3.6, 0, '#9bd14b'); crate(-4.45, 2.9, 0, '#e8343e'); pop(); }
// ---- LOBBY (ox = 130) ----
{ const ox = 130, y0 = IN; room(ox, 9, 8, 3.4, M.planksD, M.wallLobby);
  push(ox, y0, -1.5); B(3.6, 1.05, 0.7, M.woodL, 0, 0.52, 0, undefined, 1); B(3.8, 0.08, 0.9, M.white, 0, 1.08, 0); for (let i = 0; i < 6; i++) B(0.06, 0.95, 0.04, M.wood, -1.6 + i * 0.64, 0.52, 0.37); pop();
  sign(['RECEPTION'], 1.8, 0.4, { bg: '#2e3f73', fg: '#ffffff', border: '#e5c158' }, ox, y0 + 0.62, -1.1, 0, scene, 0.05);
  { const g = group(ox + 0.55, y0 + 1.12, -1.35, -0.35); dyn(new THREE.BoxGeometry(0.5, 0.04, 0.3), C('#2b2730'), g, 0, 0, 0); const back = dyn(new THREE.BoxGeometry(0.46, 0.34, 0.02), C('#2b2730'), g, 0, 0.17, -0.08); back.rotation.x = -0.35;
    D.cal = sign(['TODAY:', 'NOT A GOOD', 'DAY TO LEAVE'], 0.44, 0.32, { bg: '#fffaf0', fg: ['#2b1f1c', '#d6333c', '#d6333c'], border: '#d6333c' }, 0, 0.2, -0.06, 0, g, 0.015); D.cal.rotation.x = -0.35;
    D.calFlip = sign(['MONDAY:', 'NOT A GOOD', 'DAY TO LEAVE'], 0.44, 0.32, { bg: '#fffaf0', fg: ['#2b1f1c', '#d6333c', '#d6333c'], border: '#d6333c' }, 0, 0, 0, 0, g, 0.012); D.calG = g; }
  push(ox - 0.9, y0 + 1.12, -1.4); CY(0.13, 0.12, 0.25, toon({ color: '#cfe7f5', transparent: true, opacity: 0.85 }), 0, 0.12, 0, 12); for (let i = 0; i < 4; i++) CY(0.05, 0.05, 0.015, C('#c98a3e'), (i % 2) * 0.05 - 0.02, 0.05 + i * 0.04, 0, 10); SP(0.05, M.chrome, 0.35, 0.03, 0.1, [1, 0.6, 1], 8); pop();
  // glass exit doors on the right wall + EXIT sign + bright outside
  push(ox + 4.45, y0, 1.6); B(0.15, 3.4, 0.3, M.white, 0, 1.7, -1.3); B(0.15, 3.4, 0.3, M.white, 0, 1.7, 1.3); B(0.15, 0.6, 2.9, M.white, 0, 3.1, 0); pop();
  D.lobDoorL = dyn(new THREE.BoxGeometry(0.05, 2.7, 1.15), toon({ color: '#cfeefe', transparent: true, opacity: 0.55 }), scene, ox + 4.42, y0 + 1.35, 1.0); D.lobDoorR = dyn(new THREE.BoxGeometry(0.05, 2.7, 1.15), toon({ color: '#cfeefe', transparent: true, opacity: 0.55 }), scene, ox + 4.42, y0 + 1.35, 2.15);
  backdropPlane('road', ox + 7, y0 + 1.5, 1.6, 9, 5, -Math.PI / 2);
  D.exitIn = sign(['EXIT ➜'], 1.2, 0.42, { bg: '#2f9a4a', fg: '#ffffff', border: '#ffffff' }, ox + 4.3, y0 + 3.0, 1.6, -Math.PI / 2, scene, 0.08);
  push(ox - 3.0, y0, 2.4); for (let k = 0; k < 3; k++) { B(0.55, 0.45, 0.55, C(['#d6333c', '#2f6fd1', '#f2c33a'][k]), 0, 0.22, -k * 0.75); B(0.55, 0.5, 0.1, C(['#d6333c', '#2f6fd1', '#f2c33a'][k]), -0.24, 0.7, -k * 0.75, [0, Math.PI / 2, 0]); } pop();
  push(ox - 3.8, y0, -3.2); CY(0.25, 0.2, 0.45, C('#c9503f'), 0, 0.22, 0, 10); for (let i = 0; i < 6; i++) SP(0.3, C('#4f9a3c'), Math.cos(i) * 0.2, 0.8 + i * 0.13, Math.sin(i) * 0.2, [1, 1.3, 1], 8); pop();
  push(ox + 1.8, y0 + 2.5, -3.95); CY(0.3, 0.3, 0.06, M.white, 0, 0, 0.03, 24, [Math.PI / 2, 0, 0]); put(new THREE.TorusGeometry(0.3, 0.04, 6, 24), C('#d6333c'), 0, 0, 0.06); pop();
  D.lobClock = [dyn(new THREE.BoxGeometry(0.03, 0.17, 0.02), C('#2b1f1c'), scene, ox + 1.8, y0 + 2.5, -3.85), dyn(new THREE.BoxGeometry(0.02, 0.24, 0.02), C('#2b1f1c'), scene, ox + 1.8, y0 + 2.5, -3.84)]; D.lobClock.forEach((m) => m.geometry.translate(0, 0.08, 0));
  push(ox - 1.6, y0 + 1.9, -3.97); B(1.4, 1.0, 0.04, C('#c98a3e'), 0, 0, 0); for (let i = 0; i < 5; i++) B(0.3, 0.38, 0.02, C(['#fff6a8', '#ffffff', '#ffd0e0', '#d6f0e4', '#bfe3f5'][i]), -0.5 + (i % 3) * 0.45, 0.2 - (i > 2 ? 0.45 : 0), 0.03, [0, 0, (i - 2) * 0.08]); pop();
  sign(['ACTIVITIES', 'BINGO 3PM · DANCE 5PM'], 1.6, 0.5, { bg: '#f2c33a', fg: '#2b1f1c', border: '#2b1f1c' }, ox - 1.6, y0 + 2.65, -3.92, 0, scene, 0.03);
}
{ const g = new THREE.Group(); scene.add(g); const pc = X.cv(256, 320); const gg = pc[1]; gg.fillStyle = '#bfe3f5'; gg.fillRect(0, 0, 256, 320); gg.fillStyle = '#7cc07a'; gg.fillRect(0, 230, 256, 90);
  gg.save(); gg.translate(128, 300); gg.scale(0.34, 0.34); T.rick(gg, DAUGHTER, { expr: 'beam', R: 'wave' }); gg.restore();
  const fm = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.76, 0.06), [C('#c98a3e'), C('#c98a3e'), C('#c98a3e'), C('#c98a3e'), toon({ map: tex(pc[0]) }), C('#c98a3e')]); fm.castShadow = true; g.add(fm);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 6, 4), C('#e5c158')); rim.rotation.z = Math.PI / 4; rim.scale.set(0.9, 1.08, 1); g.add(rim); g.visible = false; D.memory = g; }
flushBatches();

// ======================================================================= 3D FX pool (never 2D)
const heartShape = (() => { const s = new THREE.Shape(); s.moveTo(0, -0.5); s.bezierCurveTo(-0.6, -0.05, -0.55, 0.45, -0.25, 0.45); s.bezierCurveTo(-0.08, 0.45, 0, 0.3, 0, 0.22); s.bezierCurveTo(0, 0.3, 0.08, 0.45, 0.25, 0.45); s.bezierCurveTo(0.55, 0.45, 0.6, -0.05, 0, -0.5); return s; })();
const starShape = (() => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.2 : 0.5, a = i / 10 * Math.PI * 2 + Math.PI / 2; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } s.closePath(); return s; })();
const boltShape = (() => { const s = new THREE.Shape(); [[0, 0.5], [0.25, 0.5], [0.05, 0.08], [0.25, 0.08], [-0.15, -0.5], [0, -0.05], [-0.2, -0.05]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; })();
const ext = (s, d = 0.12) => { const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 8 }); g.center(); return g; };
const qGeo = (() => { const a = new THREE.TorusGeometry(0.2, 0.065, 8, 20, Math.PI * 1.35).toNonIndexed(); a.rotateZ(-Math.PI * 0.35); a.translate(0, 0.25, 0); const b = new THREE.CylinderGeometry(0.065, 0.065, 0.2, 8).toNonIndexed(); b.translate(0.0, -0.02, 0); const c = new THREE.SphereGeometry(0.08, 8, 6).toNonIndexed(); c.translate(0, -0.3, 0); return mergeNI([a, b, c]); })();
const bangGeo = (() => { const b = new THREE.CylinderGeometry(0.09, 0.05, 0.5, 8).toNonIndexed(); b.translate(0, 0.15, 0); const c = new THREE.SphereGeometry(0.08, 8, 6).toNonIndexed(); c.translate(0, -0.25, 0); return mergeNI([b, c]); })();
const noteGeo = (() => { const a = new THREE.SphereGeometry(0.1, 10, 8).toNonIndexed(); a.scale(1.3, 1, 1); const b = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6).toNonIndexed(); b.translate(0.11, 0.22, 0); const c = new THREE.BoxGeometry(0.15, 0.06, 0.04).toNonIndexed(); c.translate(0.18, 0.42, 0); return mergeNI([a, b, c]); })();
const mothGeo = (() => { const a = new THREE.BoxGeometry(0.16, 0.01, 0.12).toNonIndexed(); a.rotateY(0.5); a.translate(0.07, 0, 0); const b = new THREE.BoxGeometry(0.16, 0.01, 0.12).toNonIndexed(); b.rotateY(-0.5); b.translate(-0.07, 0, 0); const c = new THREE.SphereGeometry(0.03, 6, 4).toNonIndexed(); c.scale(1, 1, 2); return mergeNI([a, b, c]); })();
function mergeNI(gs) { const n = gs.reduce((a, g) => a + g.attributes.position.count, 0); const p = new Float32Array(n * 3), q = new Float32Array(n * 3); let o = 0; for (const g of gs) { p.set(g.attributes.position.array, o * 3); q.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('normal', new THREE.BufferAttribute(q, 3)); return g; }
const FXG = {
  coin: [new THREE.CylinderGeometry(0.12, 0.12, 0.03, 18), '#f2c33a'], sparkle: [ext(starShape, 0.05).scale(0.18, 0.18, 0.5), '#fff1a0'], star: [ext(starShape, 0.1).scale(0.32, 0.32, 0.6), '#f6c12e'], heart: [ext(heartShape, 0.12).scale(0.42, 0.42, 0.6), '#e8343e'],
  puff: [new THREE.IcosahedronGeometry(0.2, 1), '#ffffff'], drop: [new THREE.SphereGeometry(0.05, 8, 6), '#7cc8f5'], q: [qGeo, '#f6c12e'], bang: [bangGeo, '#e8343e'],
  leaf: [new THREE.SphereGeometry(0.08, 6, 4).scale(1, 0.25, 0.6), '#7cc07a'], confetti: [new THREE.BoxGeometry(0.07, 0.012, 0.04), '#e8343e'], petal: [new THREE.SphereGeometry(0.06, 6, 4).scale(1, 0.3, 0.7), '#f07aa8'],
  tuft: [new THREE.IcosahedronGeometry(0.05, 0), '#f4f1ea'], moth: [mothGeo, '#a08a6a'], ring: [new THREE.TorusGeometry(0.4, 0.045, 6, 28), '#f28c28'], bolt: [ext(boltShape, 0.06).scale(0.5, 0.5, 0.6), '#f6c12e'],
  note: [noteGeo, '#2e3f73'], apple: [new THREE.SphereGeometry(0.08, 10, 8), '#e8343e'], item: [new THREE.BoxGeometry(0.16, 0.22, 0.12), '#2f6fd1'], swirl: [new THREE.TorusGeometry(0.25, 0.04, 6, 24, Math.PI * 1.6), '#b04fd1'],
  sweat: [new THREE.SphereGeometry(0.06, 8, 6).scale(1, 1.4, 1), '#8fd0f5'], cup: [new THREE.CylinderGeometry(0.06, 0.05, 0.09, 10), '#ffffff'], pie: [new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12, 1, false, 0, Math.PI * 1.6), '#e8b04a'],
  receipt: [new THREE.BoxGeometry(0.12, 0.6, 0.005), '#fffaf0'], beam: [new THREE.BoxGeometry(0.05, 1.6, 0.05), '#fff6c0'],
};
for (const k of Object.keys(FXG)) if (FXG[k][0].index) FXG[k][0] = FXG[k][0].toNonIndexed(), FXG[k][0].computeVertexNormals();
const FXP = {}; const fxUsed = {};
const fxMesh = (t, i) => { const P = FXP[t] || (FXP[t] = []); if (!P[i]) { const glowy = t === 'sparkle' || t === 'beam'; const m = new THREE.Mesh(FXG[t][0], glowy ? glow(FXG[t][1]) : toon({ color: FXG[t][1] })); m.castShadow = !glowy; scene.add(m); P[i] = m; } return P[i]; };
const drawFx = (list) => { for (const t in FXP) FXP[t].forEach((m) => (m.visible = false)); const cnt = {};
  for (const e of list) { const i = cnt[e.t] = (cnt[e.t] || 0) + 1; const m = fxMesh(e.t, i - 1); m.visible = true; m.position.set(...e.p); m.rotation.set(...(e.r || [0, 0, 0])); m.scale.setScalar(e.s ?? 1); if (e.sv) m.scale.set(...e.sv); m.material.color.set(e.c || FXG[e.t][1]); } };
// speech bubbles / badges: inked 3D slabs that face the camera
const BUB = {}; const drawBubbles = (list, cam) => { for (const k in BUB) BUB[k].visible = false;
  for (const b of list || []) { let m = BUB[b.id]; if (!m) { m = BUB[b.id] = sign(b.lines, b.w, b.h, { bg: b.bg || '#ffffff', fg: b.fg || '#2b1f1c', border: b.border || '#2b1f1c', radius: 60 }, 0, 0, 0, 0, scene, 0.12); m.castShadow = false;
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 4), C(b.bg || '#ffffff')); tail.position.set(b.tail ?? -b.w * 0.3, -b.h / 2 - 0.12, 0); tail.rotation.z = Math.PI + (b.tail ?? -1) * 0.3; m.add(tail); m.userData.tail = tail; }
    setSign(m, b.lines, { bg: b.bg || '#ffffff', fg: b.fg || '#2b1f1c', border: b.border || '#2b1f1c', radius: 60 });
    m.userData.tail.visible = b.noTail !== true; m.visible = true; m.position.set(...b.p); m.scale.setScalar(b.s ?? 1); m.rotation.set(0, Math.atan2(cam.position.x - b.p[0], cam.position.z - b.p[2]), b.roll || 0); } };

// ======================================================================= ink / cards / post (from the kit, extended)
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vec4 p = vec4(position,1.); vec3 nn = normal;
    #ifdef USE_INSTANCING
      p = instanceMatrix*p; nn = mat3(instanceMatrix)*nn;
    #endif
    vN = normalize(normalMatrix*nn); vec4 mv = modelViewMatrix*p; vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`, side: THREE.DoubleSide });
const cardNd = (map) => new THREE.ShaderMaterial({ uniforms: { map: { value: map } }, vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`, side: THREE.DoubleSide });
const CW = 1200, CH = 2000, CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = tex(X.radial('30,22,40', 0.55));
class Card { constructor(lo) { const c = document.createElement('canvas'); this.cw = lo ? CW / 2 : CW; this.ch = lo ? CH / 2 : CH; c.width = this.cw; c.height = this.ch; this.c = c; this.g = c.getContext('2d');
    this.t = new THREE.CanvasTexture(c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: false });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1; scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false; }
  draw(key, fn) { if (key === this.key) return; this.key = key; const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.cw, this.ch); g.setTransform(this.cw / 600, 0, 0, this.ch / 1000, 0, 0); fn(g); this.t.needsUpdate = true; } }
const cardsHi = [], cardsLo = []; const cards = { forEach: (fn) => { cardsHi.forEach(fn); cardsLo.forEach(fn); } }; const getCard = (i, lo) => { const A = lo ? cardsLo : cardsHi; return A[i] || (A[i] = new Card(lo)); };
const drawActors = (list, cam) => { cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  let nh = 0, nl = 0; list.forEach((a) => { const c = a.lo ? getCard(nl++, true) : getCard(nh++, false); c.draw(a.key, a.draw); c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s); c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.opacity = a.alpha ?? 1; c.mesh.renderOrder = a.order || 2; c.mesh.castShadow = a.shadow !== false;
    if (a.blob !== false) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? a.y) + 0.025, a.z); c.blob.scale.set(1.0 * s, 0.62 * s, 1); } }); };

const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const rtA = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }), rtB = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const VS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 2.5 * SC }, sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.2 }, flash: { value: 0 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: VS,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){ vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o); float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue; if (card) ds = 1e4; vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d)); if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9); }
    return e * (1. - smoothstep(140., 520., d)*.8); }
  void main(){ vec3 c = texture2D(col, vUv).rgb; float e = edgeAt(vUv, px); c = mix(c, vec3(.012,.01,.014), e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat); c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2; c = mix(c, vec3(1.), flash); gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: VS,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){ float c0 = coc(vUv); if (cinf < .5 || c0 < .6) { gl_FragColor = vec4(texture2D(src, vUv).rgb, 1.); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<40;i++){ float fi = float(i); float r = sqrt((fi+.5)/40.); float a = fi*2.39996; vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5); acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = vec4(acc/max(wsum,1e-3), 1.); }` }));
const mixU = { a: { value: rtA.texture }, b: { value: rtB.texture }, t: { value: 0 }, glow: { value: 0 } };
const mixScene = fs(new THREE.ShaderMaterial({ uniforms: mixU, vertexShader: VS, fragmentShader: `uniform sampler2D a, b; uniform float t; varying vec2 vUv;
  void main(){ vec3 c = mix(texture2D(a, vUv).rgb, texture2D(b, vUv).rgb, t); gl_FragColor = linearToOutputTexel(vec4(c,1.)); }` }));

// ======================================================================= per-frame
const tmpV = new THREE.Vector3();
function applyLight(L) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi; sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat ?? 1.08; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000'); inkU.vig.value = L.vig ?? 0.2;
}
function placeSun(L, focus) { const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)); skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 70); sun.target.position.copy(focus); const ext = L.shadowExt || 22, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix(); }

function updateWorld(Wd, f) {
  const t = f / 30; M.waterU.t.value = t;
  // trees sway, flag waves, windmill, clouds, barber pole, marquee chase, belt
  for (const g of D.trees) { g.userData.crown.rotation.z = 0.03 * Math.sin(t * 1.3 + g.userData.seed) * (Wd.wind || 1); g.userData.crown.rotation.x = 0.02 * Math.sin(t * 1.1 + g.userData.seed * 2) * (Wd.wind || 1); }
  { const pa = D.flag.geometry.attributes.position, b = D.flag.userData.base; for (let i = 0; i < pa.count; i++) { const x = b[i * 3] + 0.9, y = b[i * 3 + 1]; pa.setZ(i, Math.sin(t * 5 + x * 3.2 + y * 0.8) * 0.12 * x); } pa.needsUpdate = true; D.flag.geometry.computeVertexNormals(); }
  D.sails.rotation.z = -t * 0.9; for (const c of D.clouds) { c.position.x += 0; c.userData.x0 ??= c.position.x; c.position.x = c.userData.x0 + t * 1.6; }
  D.pole.offset.y = -t * 0.6; D.belt.offset.x = -t * 0.8;
  D.marq.forEach((m, i) => m.material.color.set(((i + Math.floor(t * 10)) % 3) === 0 ? '#fff3a0' : '#c98a3e'));
  // fountain jets
  { let k = 0; for (let j = 0; j < 8; j++) for (let i = 0; i < 9; i++) { const a = j / 8 * Math.PI * 2, ph = ((t * 0.9 + i / 9 + j * 0.13) % 1); const r = 0.25 + ph * 1.9, y = 2.85 + ph * 1.5 - ph * ph * 3.6;
      _m.makeTranslation(Math.cos(a) * r, Math.max(0.55, y), Math.sin(a) * r); D.drops.setMatrixAt(k++, _m); }
    for (let i = 0; i < 18; i++) { const ph = (t * 1.3 + i / 18) % 1; _m.makeTranslation(Math.cos(i) * 0.08, 2.9 + ph * 0.9 - ph * ph * 0.9, Math.sin(i) * 0.08); D.drops.setMatrixAt(k++, _m); } D.drops.instanceMatrix.needsUpdate = true; }
  // pigeons: peck & walk around the fountain; scatter when Wd.scatter
  D.pigeons.forEach((g, i) => { const u = g.userData, s = u.seed; const base = Wd.pigeonBase || [0, 0, 0];
    const ang = s * 2.1 + t * 0.12 * (i % 2 ? 1 : -1), rad = 3.4 + (i % 3) * 0.5; let x = base[0] + Math.cos(ang) * rad, z = base[2] + Math.sin(ang) * rad, y = 0;
    if (Wd.feed) { const fx = Wd.feed; const a2 = s * 2.4; x = fx[0] + Math.cos(a2) * (0.5 + (i % 4) * 0.25); z = fx[2] + Math.sin(a2) * (0.5 + (i % 4) * 0.25) + 0.3; }
    let fly = 0; if (Wd.scatter != null && f >= Wd.scatter) { fly = (f - Wd.scatter) / 30; x += Math.cos(s * 3) * fly * 4; z += Math.sin(s * 3) * fly * 4; y = fly * fly * 3 + fly * 2; }
    g.position.set(x, y + (base[1] || 0), z); g.rotation.y = Wd.feed ? -s * 2.4 + Math.PI : -ang - Math.PI / 2;
    const peck = fly ? 0 : Math.max(0, Math.sin(t * 6 + s * 5)) ; u.hd.position.y = 0.22 - peck * 0.12; u.hd.position.x = 0.15 + peck * 0.04;
    const fl = fly ? Math.sin(t * 40 + s) * 0.9 : 0; u.wl.rotation.x = fl; u.wr.rotation.x = -fl; g.visible = Wd.pigeons !== false && y < 30; });
  D.gulls.forEach((g, i) => { const u = g.userData, a = t * 0.15 + u.seed; const c = Wd.gullC || [0, 14, 0]; g.position.set(c[0] + Math.cos(a) * (18 + i * 3), c[1] + i * 0.8 + Math.sin(t + i) * 0.5, c[2] + Math.sin(a) * (18 + i * 3)); g.rotation.y = -a; const fl = Math.sin(t * 8 + u.seed) * 0.5; u.wl.rotation.x = fl; u.wr.rotation.x = -fl; });
  // clapper
  D.clap.arm.rotation.z = Wd.clap ?? 0.5; D.clap.g.visible = Wd.clapVis !== false;
  // spotlight
  D.spot.visible = D.spotPool.visible = !!Wd.spot; if (Wd.spot) { D.spot.position.set(Wd.spot[0], 9, Wd.spot[2]); D.spotPool.position.set(Wd.spot[0], 0.03, Wd.spot[2]); D.spot.material.opacity = 0.3 * (Wd.spotA ?? 1); D.spotPool.material.opacity = 0.45 * (Wd.spotA ?? 1); }
  // rainbow
  D.rainbow.visible = (Wd.rainbow || 0) > 0.01; if (D.rainbow.visible && D.rainbow.userData.k !== Wd.rainbow) { D.rainbow.userData.k = Wd.rainbow; } if (D.rainbow.visible) D.rainbow.children.forEach((m, i) => { const k = Math.min(1, Math.max(0, (Wd.rainbow || 0) * 1.3 - i * 0.05)); m.geometry.dispose(); m.geometry = new THREE.TorusGeometry(28 - i * 0.9, 0.45, 6, 48, Math.PI * Math.max(0.01, k)); });
  // clocks
  const tc = Wd.clockWrong ? t * 9 : t * 0.02; D.clockH.rotation.z = -tc * 0.4 - 1; D.clockM.rotation.z = -tc * 4.8 - 2;
  D.aptClock[0].rotation.z = -1.2 - t * 0.01; D.aptClock[1].rotation.z = -t * 0.12; D.lobClock[0].rotation.z = -2 - t * 0.01; D.lobClock[1].rotation.z = -t * 0.12;
  // alarm clock shakes when ringing
  { const a = Wd.alarm || 0; D.alarm.rotation.set(0, 0.5, a * 0.25 * Math.sin(t * 60)); D.alarm.position.y = IN + 0.73 + a * 0.02 * Math.abs(Math.sin(t * 50)); }
  D.curL.position.x = 0.45 - (Wd.curtain || 0) * 0.75; D.curR.position.x = 1.35 + (Wd.curtain || 0) * 0.75;
  D.aptDoor.rotation.y = -(Wd.aptDoor || 0) * 1.6;
  D.chair.rotation.y = Wd.chair || 0;
  { const o = Wd.book || 0; D.book.L.rotation.z = (1 - o) * -1.4; D.book.L.position.set(-0.2 * Math.cos((1 - o) * 1.4), 0.2 * Math.sin((1 - o) * 1.4) * 0.5, 0); }
  D.notebook.visible = Wd.notebook !== false;
  D.memory.visible = !!Wd.memory; if (Wd.memory) { D.memory.position.set(...Wd.memory.p); D.memory.scale.setScalar(Wd.memory.s ?? 1); D.memory.rotation.set(0, Wd.memory.ry ?? 0, Wd.memory.roll ?? 0); }
  D.supDoorL.position.x = 79.6 - (Wd.supDoor || 0) * 0.7; D.supDoorR.position.x = 80.4 + (Wd.supDoor || 0) * 0.7;
  D.recDoorL.position.x = -0.5 - (Wd.recDoor || 0) * 0.9; D.recDoorR.position.x = 0.5 + (Wd.recDoor || 0) * 0.9;
  D.lobDoorL.position.z = 1.0 - (Wd.lobDoor || 0) * 0.9; D.lobDoorR.position.z = 2.15 + (Wd.lobDoor || 0) * 0.9;
  setSign(D.register, [Wd.register || 'TOTAL: €0,00']);
  // flip calendar: pages flip over the top, every page says the same
  { const p = Wd.calPage || 0, k = p % 1, day = ['MONDAY:', 'TUESDAY:', 'WEDNESDAY:', 'THURSDAY:', 'FRIDAY:', 'SATURDAY:', 'SUNDAY:', 'TODAY:'][Math.floor(p) % 8];
    setSign(D.calFlip, [day, 'NOT A GOOD', 'DAY TO LEAVE']); D.calFlip.visible = k > 0.02 && k < 0.98; D.calFlip.position.set(0, 0.2 + Math.sin(k * Math.PI) * 0.18, -0.06 - Math.sin(k * Math.PI) * 0.05); D.calFlip.rotation.x = -0.35 + k * 3.0; }
  // exit signs glow pulse
  { const p = 0.85 + 0.15 * Math.sin(t * 4); D.exitIn.material?.[4]?.color?.setScalar(p); }
  // string lights / lamps at dusk
  const lit = Wd.lights ?? 0; D.bulbs.forEach((m, i) => { const on = lit > m.userData.t * 0.9 ? 1 : 0.18; const tw = 0.85 + 0.15 * Math.sin(t * 6 + i * 1.7); m.material.color.copy(m.userData.c).multiplyScalar(on ? tw : 0.35).lerp(new THREE.Color('#ffffff'), on * 0.25); });
  D.lamps.forEach((m) => m.material.color.set(lit > 0.3 ? '#fff3a0' : '#e9e2c8'));
  // rooftop letters glow
  setSign(D.letters, ['HOGEWEYK'], { bg: Wd.letters ? '#fff3a0' : '#fbf6ee' });
  // highway traffic + blinking + spinning arrows + flashing boards
  D.cars.forEach((g) => { const u = g.userData; const x = ((t * u.sp * (Wd.fast || 1) + u.off) % 160) - 80; g.position.x = u.dir * x; g.rotation.y = u.dir > 0 ? 0 : Math.PI; });
  D.tl.forEach((ls, j) => ls.forEach((m, i) => m.material.color.copy(m.userData.c).multiplyScalar(((Math.floor(t * 3) + j) % 3) === i ? 1.0 : 0.25)));
  D.arrows.forEach((s, i) => { s.rotation.y = s.userData.base + (Wd.spinArrows || 0) * Math.sin(t * 2.3 + i) * 1.4; });
  D.boards.forEach((s, i) => { const on = ((Math.floor(t * 4) + i) % 2) === 0; s.material[4].color.setScalar(on ? 1 : 0.6); });
  D.posts.forEach((s, i) => { s.rotation.z = (Wd.wiggle || 0) * Math.sin(t * 7 + i) * 0.08; });
  // pigeons and gulls already placed; extra props
}

const swapForNd = (on) => { scene.traverse((o) => { if (!o.isMesh && !o.isInstancedMesh) return;
  if (on) { o.userData.mat0 = o.material; if (o.userData.ndSkip || o.userData.sky || o.userData.nd === null) { o.userData.vis0 = o.visible; o.visible = false; return; } o.material = o.userData.nd || ndMat; }
  else { o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; } } }); };

function renderView(f, S, target) {
  const L = ST.lightFor(S, f), Cm = ST.camAt(f, S);
  applyLight(L);
  camera.position.set(...Cm.pos); camera.up.set(0, 1, 0); camera.lookAt(...Cm.look); camera.rotateZ(rx(Cm.roll || 0)); camera.fov = Cm.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const Wd = ST.worldAt(f, S); updateWorld(Wd, f);
  placeSun(L, new THREE.Vector3(...(Cm.shadowAt || Cm.look)));
  drawActors(ST.actorsAt(f, S, T), camera); drawFx(ST.fxAt(f, S)); drawBubbles(Wd.bubbles, camera);
  sky.position.copy(camera.position);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  inkU.flash.value = Cm.flash || 0; renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  const Df = ST.dofAt(f, S, Cm); dofU.focus.value = Df.focus; dofU.cinf.value = Df.cinf * SC; dofU.near.value = Df.near ?? 1;
  renderer.setRenderTarget(target); renderer.render(dofScene, fsCam);
}
window.renderFrame = (f) => {
  const bl = ST.blendAt(f); // {a: shot, b: shot|null, t}
  renderView(f, bl.a, rtA);
  if (bl.b && bl.t > 0.001) renderView(f, bl.b, rtB);
  mixU.t.value = bl.b ? bl.t : 0; renderer.setRenderTarget(null); renderer.render(mixScene, fsCam); return true;
};
window.TOTAL = ST.TOTAL; window.ready = true;
