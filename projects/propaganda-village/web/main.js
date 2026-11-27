// "The Village Built For An Audience" — Kijong-dong, the DMZ, a South Korean observation post, and the soldier's hometown.
// One continuous inked 3D world; characters are 2D cards (unlit, pure-white faces). Everything else is real 3D.
import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { TOTAL, frameState } from './story.js';

const QS = new URLSearchParams(location.search), RS = +(QS.get('s') || 1);
const W = Math.round(1080 * RS), H = Math.round(1920 * RS);
const canvas = document.getElementById('c'); canvas.width = W; canvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;

// sign font
try { const buf = await (await fetch('LilitaOne.ttf')).arrayBuffer(); const ff = new FontFace('Lilita', buf); await ff.load(); document.fonts.add(ff); } catch (e) { console.log('font fail ' + e); }

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.08, 2500);
const rx = (a) => a * Math.PI / 180;
const R = P.rng;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([105, 105, 105, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
const speck = (g, w, h, r, n, cols, a = 1, b = 3) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.beginPath(); g.ellipse(r() * w, r() * h, a + r() * b, a + r() * b * 0.7, r() * 3, 0, 7); g.fill(); } };
// extra painted textures
const concrete = (seed, base = 74) => { const [c, g] = cv(256, 256), r = R(seed); g.fillStyle = hsl(40, 6, base); g.fillRect(0, 0, 256, 256); speck(g, 256, 256, r, 500, [hsl(40, 6, base - 8, .5), hsl(40, 8, base + 6, .5), hsl(30, 6, base - 16, .35)], 1, 3); for (let k = 0; k < 5; k++) { g.strokeStyle = hsl(30, 6, base - 22, .5); g.lineWidth = 1; g.beginPath(); let x = r() * 256, y = r() * 256; g.moveTo(x, y); for (let j = 0; j < 5; j++) { x += r() * 30 - 15; y += r() * 30 - 15; g.lineTo(x, y); } g.stroke(); } g.strokeStyle = hsl(30, 6, base - 20, .7); g.lineWidth = 3; g.strokeRect(0, 0, 256, 256); return c; };
const asphalt = (seed) => { const [c, g] = cv(256, 256), r = R(seed); g.fillStyle = '#6d6f78'; g.fillRect(0, 0, 256, 256); speck(g, 256, 256, r, 900, ['#5d5f68', '#7d808a', '#4f5159'], 0.5, 2); return c; };
const paving = (seed) => { const [c, g] = cv(256, 256), r = R(seed); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = hsl(18 + r() * 12, 30 + r() * 10, 70 + r() * 8); g.fillRect(x * 32 + 1, y * 32 + 1, 30, 30); } g.strokeStyle = 'rgba(80,60,50,.6)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 256); g.moveTo(0, i * 32); g.lineTo(256, i * 32); g.stroke(); } return c; };
const tiles = (hue, sat, lig, seed) => { const [c, g] = cv(256, 256), r = R(seed); g.fillStyle = hsl(hue, sat, lig); g.fillRect(0, 0, 256, 256); for (let y = 0; y < 8; y++) { const off = (y % 2) * 16; for (let x = -1; x < 9; x++) { g.fillStyle = hsl(hue, sat, lig - 6 + r() * 10); g.beginPath(); g.ellipse(x * 32 + off + 16, y * 32 + 26, 15, 10, 0, 0, Math.PI); g.fill(); } g.fillStyle = hsl(hue, sat, lig - 18, .8); g.fillRect(0, y * 32 + 28, 256, 4); } return c; };
const tin = (seed) => { const [c, g] = cv(256, 256), r = R(seed); for (let x = 0; x < 256; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#8d8f8e'); gr.addColorStop(0.5, '#c4c6c2'); gr.addColorStop(1, '#7a7c7b'); g.fillStyle = gr; g.fillRect(x, 0, 16, 256); } speck(g, 256, 256, r, 90, ['rgba(160,80,30,.7)', 'rgba(120,60,20,.6)', 'rgba(190,110,50,.5)'], 2, 9); return c; };
const brick = (seed) => { const [c, g] = cv(256, 256), r = R(seed); g.fillStyle = '#b9b3a6'; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 16; y++) for (let x = -1; x < 8; x++) { g.fillStyle = hsl(10 + r() * 8, 38, 46 + r() * 10); g.fillRect(x * 32 + (y % 2) * 16 + 1, y * 16 + 1, 30, 14); } return c; };
const sandbagT = (seed) => { const [c, g] = cv(128, 128), r = R(seed); g.fillStyle = '#c9b183'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(120,96,60,.35)'; g.beginPath(); const y = r() * 128; g.moveTo(0, y); g.lineTo(128, y + r() * 6 - 3); g.stroke(); } return c; };
const camoNet = () => { const [c, g] = cv(256, 256), r = R(77); g.fillStyle = '#5d6f3c'; g.fillRect(0, 0, 256, 256); speck(g, 256, 256, r, 120, ['#3f4f2a', '#7a8a4a', '#6b5a3a', '#8a9a5a'], 6, 14); return c; };
const glass = (lit) => { const [c, g] = cv(64, 96); if (lit) { const gr = g.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, '#fff2b0'); gr.addColorStop(1, '#ffc65a'); g.fillStyle = gr; g.fillRect(0, 0, 64, 96); g.fillStyle = '#e8a24a'; g.fillRect(0, 0, 14, 96); g.fillRect(50, 0, 14, 96); } else { const gr = g.createLinearGradient(0, 0, 64, 96); gr.addColorStop(0, '#9cc8ec'); gr.addColorStop(0.5, '#3e6a96'); gr.addColorStop(1, '#2b4a72'); g.fillStyle = gr; g.fillRect(0, 0, 64, 96); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(10, 0); g.lineTo(26, 0); g.lineTo(4, 40); g.lineTo(0, 40); g.fill(); } g.fillStyle = '#f2efe6'; g.fillRect(0, 44, 64, 6); g.fillRect(29, 0, 6, 96); return c; };
const flagNK = () => { const [c, g] = cv(512, 256); g.fillStyle = '#1f4fb4'; g.fillRect(0, 0, 512, 256); g.fillStyle = '#fff'; g.fillRect(0, 40, 512, 176); g.fillStyle = '#d4232f'; g.fillRect(0, 50, 512, 156); g.fillStyle = '#fff'; g.beginPath(); g.arc(170, 128, 56, 0, 7); g.fill(); g.fillStyle = '#d4232f'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 21 : 52; g.lineTo(170 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } g.fill(); return c; };
const flagROK = () => { const [c, g] = cv(384, 256); g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, 384, 256); g.save(); g.translate(192, 128); g.rotate(0.588); g.fillStyle = '#d0262f'; g.beginPath(); g.arc(0, 0, 64, Math.PI, 0); g.fill(); g.fillStyle = '#1d47a8'; g.beginPath(); g.arc(0, 0, 64, 0, Math.PI); g.fill(); g.fillStyle = '#d0262f'; g.beginPath(); g.arc(-32, 0, 32, 0, 7); g.fill(); g.fillStyle = '#1d47a8'; g.beginPath(); g.arc(32, 0, 32, 0, 7); g.fill(); g.restore(); g.fillStyle = '#1a1a1a'; const tri = (x, y, a, pat) => { g.save(); g.translate(x, y); g.rotate(a); pat.forEach((br, i) => { if (br) g.fillRect(-26, -22 + i * 16, 52, 10); else { g.fillRect(-26, -22 + i * 16, 22, 10); g.fillRect(4, -22 + i * 16, 22, 10); } }); g.restore(); }; tri(80, 54, -0.98, [1, 1, 1]); tri(304, 202, -0.98, [0, 0, 0]); tri(304, 54, 0.98, [1, 0, 1]); tri(80, 202, 0.98, [0, 1, 0]); return c; };
// weathered sign texture (Lilita)
const signTex = (lines, { w = 512, h = 256, bg = '#f4ead2', fg = '#2a2420', border = '#7a4a2a', sizes = null, sub = null, deco = null } = {}) => {
  const [c, g] = cv(w, h), r = R(lines.join('').length * 7 + w);
  g.fillStyle = bg; g.fillRect(0, 0, w, h); speck(g, w, h, r, 160, ['rgba(120,90,60,.10)', 'rgba(255,255,255,.12)', 'rgba(80,60,40,.08)'], 2, 10);
  g.strokeStyle = border; g.lineWidth = Math.max(10, h * 0.06); g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, w - g.lineWidth, h - g.lineWidth);
  if (deco) deco(g, w, h);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = fg;
  const n = lines.length; lines.forEach((t, i) => { let fs = sizes ? sizes[i] : h * 0.62 / n; g.font = `${fs}px Lilita, sans-serif`; while (g.measureText(t).width > w * 0.88 && fs > 10) { fs -= 2; g.font = `${fs}px Lilita, sans-serif`; } g.fillText(t, w / 2, h * (0.5 + (i - (n - 1) / 2) * (0.78 / n))); });
  if (sub) { g.font = `${h * 0.09}px Lilita, sans-serif`; g.fillStyle = 'rgba(42,36,32,.75)'; g.fillText(sub, w / 2, h * 0.88); }
  for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(90,60,30,.10)'; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 40, 4 + r() * 10, r() * 3, 0, 7); g.fill(); }
  return c;
};
const M = {
  grass: texM(P.grass(6), 60, 60, '#d8f0b0'), dirt: texM(P.dirt(7), 3, 3), plaster: texM(P.plaster(8), 1, 1), conc: texM(concrete(3), 1, 1), concD: texM(concrete(4, 60), 1, 1),
  asph: texM(asphalt(5), 1, 1), pave: texM(paving(6), 1, 1), blueRoof: texM(tiles(205, 72, 52, 9), 1, 1), redRoof: texM(tiles(4, 60, 52, 10), 1, 1), greenRoof: texM(tiles(150, 40, 46, 13), 1, 1),
  tin: texM(tin(11), 1, 1), brick: texM(brick(12), 1, 1), plank: texM(P.planks(1), 1, 1), beam: texM(P.beam(2), 1, 2), sand: texM(sandbagT(14), 1, 1), net: texM(camoNet(), 1, 1),
  trunk: toon({ color: '#6a4a32' }), leaf: toon({ color: '#5f9a3e' }), leaf2: toon({ color: '#7cb04a' }), leaf3: toon({ color: '#4c8a4a' }), bush: toon({ color: '#6c9a42' }),
  hill: toon({ color: '#79a84e' }), hillFar: toon({ color: '#8fb46a' }), mount: toon({ color: '#8ea6c2' }), mount2: toon({ color: '#a3b7cf' }),
  iron: toon({ color: '#5c5f66' }), steel: toon({ color: '#b6bec7' }), white: toon({ color: '#f4f2ec' }), red: toon({ color: '#d4232f' }), yellow: toon({ color: '#f2c23a' }),
  wood: toon({ color: '#8a5a34' }), woodL: toon({ color: '#b88a52' }), door: toon({ color: '#6a3f28' }), dark: toon({ color: '#2b2b30' }), black: toon({ color: '#1e1e22' }),
  wire: toon({ color: '#6f6f72' }), olive: toon({ color: '#6c7a3c' }), straw: toon({ color: '#e8c96a' }), water: toon({ color: '#6aaed6' }), mud: toon({ color: '#7a5a3a' }),
  pink: toon({ color: '#e98fa8' }), cream: toon({ color: '#f3e6c4' }), teal: toon({ color: '#3fa58a' }), orange: toon({ color: '#f08c3a' }), blue: toon({ color: '#2f6fc9' }),
};
M.plank.map.wrapS = M.plank.map.wrapT = THREE.RepeatWrapping;
const glassDay = P.tex(glass(false)), glassLit = P.tex(glass(true));
const wall = (hex) => { const m = M.plaster.clone(); m.color = new THREE.Color(hex); return m; };

// ---------- ink / normal-depth contract (instancing-aware) ----------
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vec3 nr = normal; vec4 p = vec4(position,1.);
    #ifdef USE_INSTANCING
      p = instanceMatrix*p; nr = mat3(instanceMatrix)*nr;
    #endif
    vN = normalize(normalMatrix*nr); vec4 mv = modelViewMatrix*p; vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});
const flatNd = new THREE.ShaderMaterial({ // water: depth only, no creases
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = true; parent.add(m); return m; };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const tbox = (w, h, d, t = 2) => { const g = box(w, h, d), uv = g.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); } return g; };
const grp = (x = 0, y = 0, z = 0, ry = 0, parent = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
const cyl = (r0, r1, h, n = 10) => new THREE.CylinderGeometry(r0, r1, h, n);
const sph = (r, a = 12, b = 8) => new THREE.SphereGeometry(r, a, b);
const inst = (geo, mat, mats, parent = scene, cast = true) => { const im = new THREE.InstancedMesh(geo, mat, mats.length); mats.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = cast; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; parent.add(im); return im; };
const mtx = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx_ = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx_, ry, rz)), new THREE.Vector3(sx, sy, sz));
const sign = (lines, w, h, opts, x, y, z, ry = 0, parent = scene, depth = 0.18) => {
  const c = signTex(lines, { w: 512, h: Math.round(512 * h / w), ...opts }); const t = P.tex(c);
  const g = grp(x, y, z, ry, parent); const edge = toon({ color: opts.edge || '#6a4428' });
  add(box(w, h, depth), [edge, edge, edge, edge, toon({ map: t }), edge], 0, 0, 0, g); return g;
};
const postSign = (lines, w, h, opts, x, z, ry = 0, hgt = 1.2, parent = scene, y0 = 0) => { const g = sign(lines, w, h, opts, x, y0 + hgt + h / 2, z, ry, parent); for (const s of [-1, 1]) add(box(0.14, hgt + h * 0.6, 0.14), M.wood, s * (w / 2 - 0.25), -(hgt + h * 0.6) / 2 + h * 0.3 - 0.0, -0.12, g); return g; };

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 60, 900);

// ================================================================ WORLD ================================================================
// Axes: +x east, +z south (toward the South Korean observation post), -z north (Kijong-dong). Ground y = 0.
const world = new THREE.Group(); scene.add(world);
const ground = add(new THREE.PlaneGeometry(3000, 3000), M.grass, 0, 0, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2;
const flat = (w, d, mat, x, z, y = 0.02, parent = world, rot = 0) => { const m = add(new THREE.PlaneGeometry(w, d), mat, x, y, z, parent, { cast: false }); m.rotation.x = -Math.PI / 2; m.rotation.z = rot; return m; };
const rep = (m, rx_, ry_) => { const c = m.clone(); c.map = m.map.clone(); c.map.repeat.set(rx_, ry_); c.map.needsUpdate = true; return c; };

// ---------- trees ----------
const treeMats = [];
const tree = (x, z, h = 6, kind = 0, parent = world, y = 0) => { const g = grp(x, y, z, 0, parent); add(cyl(0.16, 0.26, h * 0.5, 6), M.trunk, 0, h * 0.25, 0, g);
  const lm = [M.leaf, M.leaf2, M.leaf3][Math.abs(kind) % 3];
  if (Math.abs(kind) % 2) { for (let i = 0; i < 3; i++) { const c = add(new THREE.ConeGeometry(h * (0.34 - i * 0.07), h * 0.42, 8), lm, 0, h * (0.42 + i * 0.2), 0, g); } }
  else { const a = add(sph(h * 0.3, 10, 8), lm, 0, h * 0.68, 0, g); const b2 = add(sph(h * 0.22, 10, 8), lm, h * 0.16, h * 0.82, h * 0.08, g); const c2 = add(sph(h * 0.2, 10, 8), lm, -h * 0.17, h * 0.6, -h * 0.06, g); }
  treeMats.push(g); return g; };

// ---------- far hills / mountains ----------
{ const r = R(44);
  for (let i = 0; i < 22; i++) { const a = r() * Math.PI * 2, d = 380 + r() * 260; const h = add(sph(60 + r() * 60, 20, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, -16, Math.sin(a) * d - 60, world, { cast: false }); h.scale.y = 0.42 + r() * 0.3; }
  for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, d = 900 + r() * 300, hh = 120 + r() * 140, r_ = 150 + r() * 90; add(new THREE.ConeGeometry(r_, hh, 7), i % 2 ? M.mount : M.mount2, Math.cos(a) * d, hh / 2 - 8, Math.sin(a) * d, world, { cast: false }); }
}
// clouds (painted billboards)
const clouds = [];
{ const r = R(90);
  for (let i = 0; i < 18; i++) {
    const [c, g] = cv(600, 400); const pen = new T.Pen(g); pen.ol = 0; g.translate(300, 200); g.scale(1.4, 1.2); g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 900 + r() * 400; m.position.set(Math.cos(a) * d, 160 + r() * 220, Math.sin(a) * d); m.scale.setScalar(220 + r() * 160);
    m.userData.ndSkip = true; m.userData.a = a; m.userData.d = d; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ================= DMZ FIELD (z 50 .. -42) =================
const paddyU = { t: { value: 0 }, a: { value: new THREE.Color('#6fb7dd') }, b: { value: new THREE.Color('#bfe6f6') } };
const paddyMat = new THREE.ShaderMaterial({ uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...paddyU }, fog: true,
  vertexShader: `#include <fog_pars_vertex>
    varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform float t; uniform vec3 a, b; varying vec3 vW;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
    void main(){ float n = noise(vW.xz*.35 + vec2(t*.3, t*.12))*.6 + noise(vW.xz*1.1 - vec2(t*.2,0.))*.4;
      vec3 c = mix(a, b, smoothstep(.45,.8,n)); float sprout = step(.82, fract(vW.x*1.6))*step(.82, fract(vW.z*1.6)); c = mix(c, vec3(.45,.72,.3), sprout*.85);
      gl_FragColor = vec4(c,1.);
      #include <fog_fragment>
    }` });
const paddies = [];
{ const r = R(5);
  for (let i = -4; i <= 4; i++) for (let j = 0; j < 5; j++) {
    const x = i * 24 + (j % 2) * 6, z = 36 - j * 17; if (Math.abs(x) < 7 && z > -5 && z < 10) continue;
    const w = 20 + r() * 2, d = 13; const p = add(new THREE.PlaneGeometry(w, d), paddyMat, x, 0.05, z, world, { cast: false }); p.rotation.x = -Math.PI / 2; p.userData.nd = flatNd; p.receiveShadow = false; paddies.push(p);
    // dikes
    for (const s of [-1, 1]) { add(tbox(w + 1.4, 0.35, 0.7, 2), M.dirt, x, 0.12, z + s * (d / 2 + 0.35), world, { cast: false }); }
  } }
// tall grass clumps (instanced)
const grassClumps = (() => { const r = R(8), ms = []; for (let i = 0; i < 700; i++) { const x = (r() - 0.5) * 260, z = 50 - r() * 92; ms.push(mtx(x, 0.35, z, r() * 6, 0.5 + r() * 0.6, 0.8 + r() * 1.1, 0.5 + r() * 0.6)); } return inst(new THREE.ConeGeometry(0.4, 1.2, 5), M.leaf2, ms, world, false); })();
// southern fence (z=50) and northern fence (z=-42): posts, wires, coils of razor wire
const fence = (z, x0, x1, tall, col) => { const ms = [], coils = []; for (let x = x0; x <= x1; x += 3) { ms.push(mtx(x, tall / 2, z, 0, 1, tall, 1)); } inst(box(0.14, 1, 0.14), col, ms, world);
  for (const y of [0.6, 1.3, 2.0, 2.7].filter((y) => y < tall)) { add(cyl(0.025, 0.025, x1 - x0, 4), M.wire, (x0 + x1) / 2, y, z, world, { cast: false }).rotation.z = Math.PI / 2; }
  for (let x = x0; x <= x1; x += 1.1) coils.push(mtx(x, tall + 0.35, z, Math.PI / 2, 1, 1, 1)); inst(new THREE.TorusGeometry(0.38, 0.03, 4, 10), M.wire, coils, world, false); };
fence(50, -150, 150, 3.0, M.iron); fence(-42, -110, 110, 2.6, M.olive);
// MDL markers (yellow posts with plates) and mine triangles
const mdl = []; for (let x = -120; x <= 120; x += 30) { const g = grp(x, 0, 0, 0, world); add(cyl(0.12, 0.12, 2.2, 6), M.yellow, 0, 1.1, 0, g); add(box(1.2, 0.7, 0.08), M.yellow, 0, 2.0, 0, g); mdl.push(g); }
sign(['MILITARY', 'DEMARCATION LINE'], 3.2, 1.6, { bg: '#f2c23a', border: '#1f1f1f', edge: '#d9a92a' }, 4, 2.6, 0.06, 0, world);
add(cyl(0.12, 0.12, 2.2, 6), M.yellow, 4, 1.1, 0, world);
const mineSign = (x, z) => { const g = grp(x, 0, z, 0, world); add(cyl(0.05, 0.05, 1.2, 5), M.wood, 0, 0.6, 0, g); const sh = new THREE.Shape(); sh.moveTo(-0.45, 0); sh.lineTo(0.45, 0); sh.lineTo(0, -0.7); sh.closePath();
  const [c, gg] = cv(128, 128); gg.fillStyle = '#d4232f'; gg.fillRect(0, 0, 128, 128); gg.fillStyle = '#fff'; gg.font = '34px Lilita, sans-serif'; gg.textAlign = 'center'; gg.fillText('MINE', 64, 50);
  const t = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false }), toon({ map: P.tex(c) })); t.position.set(0, 1.55, 0); g.add(t); t.castShadow = true;
  const uv = t.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) + 0.5, uv.getY(i) + 1); };
[[-40, 46], [-14, 47], [22, 46], [56, 47], [-70, -38], [-30, -39], [30, -38], [70, -39]].forEach(([x, z]) => mineSign(x, z));
{ const r = R(31); for (let i = 0; i < 46; i++) { const x = (r() - 0.5) * 300, z = 44 - r() * 82; if (Math.abs(x) < 14) continue; tree(x, z, 5 + r() * 5, i, world); } }

// ================= SOUTH: OBSERVATION POST on a hill (deck y=6, z 64..78) =================
const OPY = 6;
const opHill = add(sph(30, 28, 14), M.hill, 0, -14, 84, world, { cast: false }); opHill.scale.set(1.6, 0.68, 1.0);
add(sph(22, 20, 10), M.hill, -38, -12, 80, world, { cast: false }).scale.set(1.4, 0.7, 1); add(sph(22, 20, 10), M.hill, 40, -12, 82, world, { cast: false }).scale.set(1.4, 0.68, 1);
const op = grp(0, OPY, 71, 0, world);
add(tbox(26, 1.2, 16, 3), M.conc, 0, -0.6, 0, op);                     // deck slab
add(tbox(26, 7, 15, 3), M.concD, 0, -4.4, 0.6, op);                    // base
add(tbox(24, 0.45, 0.5, 2), M.conc, 0, 0.22, -6.9, op);                  // parapet (north)
for (const s of [-1, 1]) add(tbox(0.5, 0.45, 13, 2), M.conc, s * 11.8, 0.22, -0.4, op);
{ const ms = []; for (let i = 0; i < 30; i++) ms.push(mtx(-11.4 + i * 0.79, 0.56, -6.9, 0, 0.78, 0.22, 0.55)); inst(sph(0.5, 8, 6), M.sand, ms, op); }
add(tbox(14, 0.35, 1.4, 2), M.concD, 0, 0.17, -4.6, op);   // step for the back row
sign(['OBSERVATION POST 3'], 7, 1.1, { bg: '#2f4a2a', fg: '#fff7d6', border: '#e5c158', edge: '#1f3a1f' }, 0, -1.4, -7.25, Math.PI, op);
for (const x of [-9, -5.5, 5.5, 9]) { add(sph(1.1, 10, 8), M.bush, x, -3.0, -7.6, op).scale.y = 0.8; }
// roof on posts + camo net + fascia sign
for (const [x, z] of [[-11, -6.4], [11, -6.4], [-11, 6.5], [11, 6.5], [0, 6.5]]) add(box(0.4, 4.2, 0.4), M.iron, x, 2.1, z, op);
add(tbox(25, 0.5, 14.4, 3), M.conc, 0, 4.4, 0, op);
const net = add(new THREE.PlaneGeometry(26, 15, 18, 10), M.net, 0, 4.75, 0, op); net.rotation.x = -Math.PI / 2; { const pa = net.geometry.attributes.position; for (let i = 0; i < pa.count; i++) pa.setZ(i, 0.25 * Math.sin(pa.getX(i) * 1.3) * Math.cos(pa.getY(i) * 1.1)); net.geometry.computeVertexNormals(); }
const viewSign = sign(['VIEWING DECK'], 9, 1.3, { bg: '#1f5a3a', fg: '#fff7d6', border: '#e5c158', edge: '#173f2a' }, 0, 3.75, -7.35, Math.PI, op);
sign(['YOUR JOB:', 'WATCH ▸'], 2.0, 1.0, { bg: '#f4ead2', border: '#3f5a2a' }, -0.9, 3.25, -6.75, Math.PI, op, 0.12);
for (const s of [-1, 1]) add(cyl(0.02, 0.02, 0.7, 4), M.wire, -0.9 + s * 0.8, 4.05, -6.75, op, { cast: false });
// coin binoculars on the parapet
const binoStand = (x) => { const g = grp(x, 0, -6.3, 0, op); add(cyl(0.12, 0.16, 1.25, 8), M.blue, 0, 0.62, 0, g); add(box(0.5, 0.36, 0.42), M.blue, 0, 1.35, 0, g); for (const s of [-1, 1]) add(cyl(0.11, 0.13, 0.5, 10), M.dark, s * 0.13, 1.4, -0.3, g).rotation.x = Math.PI / 2;
  sign(['500 WON'], 0.4, 0.2, { bg: '#f2c23a', border: '#2a2420' }, 0, 1.08, 0.13, Math.PI, g, 0.04); return g; };
const binos = [-7, -2.5, 2.5, 7].map(binoStand);
// guard booth, flag, plants
{ const g = grp(9, 0, 4, 0, op); add(tbox(2.4, 2.6, 2.4, 2), wall('#e9e1cc'), 0, 1.3, 0, g); add(box(2.8, 0.3, 2.8), M.green ?? M.olive, 0, 2.75, 0, g); add(box(1.4, 0.8, 0.1), new THREE.MeshBasicMaterial({ map: glassDay }), 0, 1.6, -1.22, g); }
const opFlagPole = add(cyl(0.06, 0.08, 7, 8), M.steel, -11.5, 3.5, 6.5, op);
const opFlag = add(new THREE.PlaneGeometry(2.2, 1.45, 10, 6), toon({ map: P.tex(flagROK()), side: THREE.DoubleSide }), -10.35, 6.1, 6.5, op); opFlag.userData.cloth = opFlag.geometry.attributes.position.array.slice();
for (const x of [-9, 9]) { add(cyl(0.45, 0.35, 0.6, 10), M.door, x, 0.3, -5.4, op); add(sph(0.6, 10, 8), M.leaf, x, 0.95, -5.4, op); }
// stairs down the hill
for (let i = 0; i < 12; i++) add(box(3, 0.3, 0.9), M.conc, 14 + i * 0.0, OPY - 0.3 - i * 0.5, 64 - i * 0.9, world, { cast: false });

// ================= SOUTH FLAGPOLE (Daeseong-dong), rises in "your side put up a big flagpole first" =================
const lattice = (h, b0, b1, mat, parent, levels) => { const ms = [], ds = [];
  for (let k = 0; k < levels; k++) { const y0 = h * k / levels, y1 = h * (k + 1) / levels, w0 = b0 + (b1 - b0) * k / levels, w1 = b0 + (b1 - b0) * (k + 1) / levels;
    for (let s = 0; s < 4; s++) { const a = s * Math.PI / 2; const cx = Math.cos(a), sz = Math.sin(a);
      ms.push(mtx(cx * w0 / 2, y0, sz * w0 / 2, -a, w0, 0.16, 0.16));
      const L = Math.hypot(y1 - y0, w0); ds.push(mtx(cx * (w0 + w1) / 4, (y0 + y1) / 2, sz * (w0 + w1) / 4, -a + Math.PI / 2, 0.1, L, 0.1, 0, (k % 2 ? 1 : -1) * Math.atan2(w0, y1 - y0) * 0.9)); }
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { ms.push(new THREE.Matrix4().compose(new THREE.Vector3(sx * (w0 + w1) / 4, (y0 + y1) / 2, sz * (w0 + w1) / 4), new THREE.Quaternion(), new THREE.Vector3(0.28, y1 - y0, 0.28))); }
  }
  inst(box(1, 1, 1), mat, ms, parent); inst(box(1, 1, 1), mat, ds, parent, false); };
const sPole = grp(-42, 0, 58, 0, world);
const sPoleInner = grp(0, 0, 0, 0, sPole);
lattice(55, 3.2, 0.6, M.steel, sPoleInner, 12);
add(cyl(0.25, 0.25, 6, 8), M.steel, 0, 58, 0, sPoleInner);
const sFlagG = grp(0, 0, 0, 0, sPole); const sFlag = add(new THREE.PlaneGeometry(14, 9.3, 16, 10), toon({ map: P.tex(flagROK()), side: THREE.DoubleSide }), 7.2, 0, 0, sFlagG); sFlag.userData.cloth = sFlag.geometry.attributes.position.array.slice();
// Daeseong-dong (Freedom Village) houses near the south pole
for (let i = 0; i < 6; i++) { const g = grp(-70 + i * 9, 0, 66 + (i % 2) * 6, 0, world); add(tbox(6, 3.4, 5, 2), wall(['#f2e3c4', '#e9d4b0', '#efe8da'][i % 3]), 0, 1.7, 0, g); const rf = add(new THREE.ConeGeometry(4.9, 2, 4), [M.redRoof, M.greenRoof][i % 2], 0, 4.4, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(1.2, 1, 1); }

// ================= KIJONG-DONG (z -44 .. -150) =================
const VG = grp(0, 0, 0, 0, world);
flat(220, 110, rep(M.pave, 30, 15), 0, -97, 0.03, VG);
flat(9, 75, rep(M.asph, 2, 18), 0, -82, 0.06, VG);           // boulevard N-S
flat(150, 8, rep(M.asph, 36, 2), 0, -70, 0.055, VG);          // cross street
{ const ms = []; for (let z = -46; z > -118; z -= 4) ms.push(mtx(0, 0.07, z, 0, 0.25, 0.02, 1.8)); for (let x = -70; x < 70; x += 4) if (Math.abs(x) > 5) ms.push(mtx(x, 0.07, -70, 0, 1.8, 0.02, 0.25)); inst(box(1, 1, 1), M.white, ms, VG, false); }
const buildings = [];   // { winMat, kind }
const winMatFor = () => { const m = new THREE.MeshBasicMaterial({ map: glassDay, color: '#ffffff' }); return m; };
// window grid on a face (instanced panes + frames + balconies)
const windows = (g, w, h, floors, cols, zf, wm, opts = {}) => { const ms = [], fr = []; const fh = h / floors;
  for (let k = opts.skip0 ? 1 : 0; k < floors; k++) for (let i = 0; i < cols; i++) { const x = -w / 2 + (i + 0.5) * w / cols, y = (k + 0.5) * fh + 0.2;
    if (opts.door && k === 0 && Math.abs(x) < w / cols * 0.6) continue;
    ms.push(mtx(x, y, zf + 0.03, 0, 1.1, 1.45, 1)); fr.push(mtx(x, y - 0.82, zf + 0.12, 0, 1.4, 0.14, 0.26)); }
  inst(new THREE.PlaneGeometry(1, 1), wm, ms, g, false); inst(box(1, 1, 1), M.white, fr, g, false); };
const house = (x, z, w = 8, d = 7, roof = M.blueRoof, col = '#f6efe0', ry = 0) => { const g = grp(x, 0, z, ry, VG); const wm = winMatFor();
  add(tbox(w, 6, d, 2), wall(col), 0, 3, 0, g); add(box(w + 0.3, 0.3, d + 0.3), M.white, 0, 3, 0, g);
  const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.6, 0); sh.lineTo(d / 2 + 0.6, 0); sh.lineTo(0, 2.6); sh.closePath();
  const rg = new THREE.ExtrudeGeometry(sh, { depth: w + 0.8, bevelEnabled: false }); rg.translate(0, 0, -(w + 0.8) / 2); const rf = add(rg, [roof, roof], 0, 6, 0, g); rf.rotation.y = Math.PI / 2;
  { const uv = rg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.25, uv.getY(i) * 0.25); }
  windows(g, w, 6, 2, Math.max(2, Math.round(w / 2.6)), d / 2, wm, { door: true });
  add(box(1.3, 2.3, 0.15), M.door, 0, 1.15, d / 2 + 0.05, g); add(box(1.9, 0.18, 0.9), M.white, 0, 2.5, d / 2 + 0.4, g);
  add(box(w + 0.4, 0.5, 0.5), M.white, 0, 0.25, d / 2 + 0.15, g);
  // planters with flowers
  for (const s of [-1, 1]) { add(box(1, 0.5, 0.6), M.door, s * (w / 2 - 0.9), 0.25, d / 2 + 0.7, g); add(sph(0.35, 8, 6), s > 0 ? M.pink : M.yellow, s * (w / 2 - 0.9), 0.62, d / 2 + 0.7, g); }
  buildings.push({ g, wm, x, z, h: 8.6 }); return g; };
const apt = (x, z, w, d, floors, col, roof = M.blueRoof, opts = {}) => { const g = grp(x, 0, z, 0, VG); const wm = winMatFor(), h = floors * 3;
  add(tbox(w, h, d, 3), wall(col), 0, h / 2, 0, g);
  for (let k = 1; k < floors; k++) add(box(w + 0.25, 0.2, d + 0.25), M.white, 0, k * 3, 0, g);
  add(box(w + 0.8, 0.6, d + 0.8), M.white, 0, h + 0.3, 0, g);
  const rf = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.6, 3.2, 4), roof, 0, h + 2.2, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
  const cols = Math.round(w / 2.6); windows(g, w, h, floors, cols, d / 2, wm, { door: true });
  // side windows + balconies on alternate floors
  const bal = []; for (let k = 1; k < floors; k++) for (let i = 0; i < cols; i += 2) bal.push(mtx(-w / 2 + (i + 0.5) * w / cols, k * 3 + 0.1, d / 2 + 0.55, 0, 2.2, 0.16, 1.1));
  inst(box(1, 1, 1), M.white, bal, g); { const rl = []; for (let k = 1; k < floors; k++) for (let i = 0; i < cols; i += 2) rl.push(mtx(-w / 2 + (i + 0.5) * w / cols, k * 3 + 0.65, d / 2 + 1.05, 0, 2.2, 0.9, 0.08)); inst(box(1, 1, 1), new THREE.MeshToonMaterial({ gradientMap: grad, color: opts.rail || '#e9573f' }), rl, g); }
  add(box(2, 2.6, 0.2), M.door, 0, 1.3, d / 2 + 0.05, g); add(box(3, 0.25, 1.4), M.white, 0, 2.9, d / 2 + 0.6, g);
  // rooftop slogan board (red with gold)
  if (opts.slogan) sign([opts.slogan], w * 0.8, 1.6, { bg: '#c8262f', fg: '#ffe08a', border: '#ffe08a', edge: '#8a1a20' }, 0, h + 4.6, 0, 0, g);
  buildings.push({ g, wm, x, z, h }); return g; };

// row 1 (z -58): school, hospital, houses
const SCHOOL = new THREE.Vector3(-30, 0, -60), HOSP = new THREE.Vector3(30, 0, -60);
{ const g = grp(SCHOOL.x, 0, SCHOOL.z, 0, VG), wm = winMatFor(); add(tbox(22, 10, 9, 3), wall('#f3e2b8'), 0, 5, 0, g); for (const k of [1, 2]) add(box(22.3, 0.25, 9.3), M.red, 0, k * 3.4, 0, g);
  add(box(22.8, 0.6, 9.8), M.red, 0, 10.3, 0, g); const rf = add(new THREE.ConeGeometry(17, 3, 4), M.blueRoof, 0, 12, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 0.42);
  windows(g, 22, 10, 3, 8, 4.5, wm, { door: true }); add(box(2.6, 2.8, 0.2), M.door, 0, 1.4, 4.6, g);
  buildings.push({ g, wm, x: SCHOOL.x, z: SCHOOL.z, h: 10 });
  sign(['SCHOOL'], 5.5, 1.2, { bg: '#2f6fc9', fg: '#fff', border: '#f2c23a', edge: '#1f4f99' }, 0, 8.2, 4.75, 0, g);
}
// school clock (3D, hands animated)
const clock = grp(SCHOOL.x, 11.6, SCHOOL.z + 5.2, 0, world);
add(cyl(1.5, 1.5, 0.3, 32), M.white, 0, 0, 0, clock).rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(1.5, 0.15, 6, 32), M.red, 0, 0, 0.12, clock);
for (let i = 0; i < 12; i++) add(box(0.1, 0.26, 0.05), M.black, Math.sin(i * Math.PI / 6) * 1.22, Math.cos(i * Math.PI / 6) * 1.22, 0.17, clock);
const hourH = grp(0, 0, 0.2, 0, clock), minH = grp(0, 0, 0.26, 0, clock);
add(box(0.14, 0.75, 0.05), M.black, 0, 0.32, 0, hourH); add(box(0.1, 1.15, 0.05), M.black, 0, 0.52, 0, minH);
// playground in front of the school
const PLAY = new THREE.Vector3(-30, 0, -49);
flat(16, 8, M.dirt, PLAY.x, PLAY.z, 0.07, VG);
const swings = [];
{ const g = grp(PLAY.x - 4, 0, PLAY.z, 0, VG); for (const s of [-1, 1]) { const a = add(cyl(0.09, 0.09, 3.6, 6), M.red, s * 2.2, 1.7, 0.7, g); a.rotation.x = 0.2; const b = add(cyl(0.09, 0.09, 3.6, 6), M.red, s * 2.2, 1.7, -0.7, g); b.rotation.x = -0.2; }
  add(cyl(0.08, 0.08, 4.6, 6), M.red, 0, 3.4, 0, g).rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const sw = grp(s * 1.0, 3.4, 0, 0, g); for (const t of [-0.3, 0.3]) add(cyl(0.02, 0.02, 2.6, 4), M.wire, t, -1.3, 0, sw, { cast: false }); add(box(0.8, 0.08, 0.35), M.yellow, 0, -2.6, 0, sw); swings.push(sw); } }
{ const g = grp(PLAY.x + 4, 0, PLAY.z, 0, VG); add(box(1.2, 2.2, 1.2), M.blue, -1.2, 1.1, 0, g); const sl = add(box(0.9, 0.1, 3.4), M.yellow, 0.4, 1.0, 0, g); sl.rotation.z = -0.62; sl.rotation.y = Math.PI / 2; sl.position.set(0.8, 1.1, 0); }
const ball = add(sph(0.3, 14, 10), M.red, PLAY.x, 0.3, PLAY.z + 2, VG);
const seesaw = grp(PLAY.x + 1, 0.45, PLAY.z - 3, 0, VG); add(box(0.3, 0.9, 0.3), M.iron, 0, -0.2, 0, seesaw.parent).position.set(PLAY.x + 1, 0.25, PLAY.z - 3); add(box(4, 0.12, 0.35), M.orange, 0, 0, 0, seesaw);
// hospital
{ const g = grp(HOSP.x, 0, HOSP.z, 0, VG), wm = winMatFor(); add(tbox(18, 13, 10, 3), wall('#f7f7f3'), 0, 6.5, 0, g); add(box(18.6, 0.6, 10.6), M.teal, 0, 13.3, 0, g);
  windows(g, 18, 13, 4, 6, 5, wm, { door: true }); add(box(3.2, 2.8, 0.2), new THREE.MeshBasicMaterial({ map: glassDay }), 0, 1.4, 5.05, g); add(box(4.5, 0.25, 2), M.teal, 0, 3.1, 5.8, g);
  const cross = grp(0, 15.6, 0, 0, g); add(box(1, 3, 0.5), M.red, 0, 0, 0, cross); add(box(3, 1, 0.5), M.red, 0, 0, 0, cross);
  sign(['HOSPITAL'], 6.5, 1.2, { bg: '#fff', fg: '#d4232f', border: '#d4232f', edge: '#ccc' }, 0, 10.9, 5.1, 0, g);
  buildings.push({ g, wm, x: HOSP.x, z: HOSP.z, h: 13 }); }
// an ambulance with flat tyres (nobody to drive it)
{ const g = grp(HOSP.x - 6, 0, HOSP.z + 9, -0.3, VG); add(tbox(4.6, 2, 2.2, 1), M.white, 0, 1.4, 0, g); add(box(1.4, 1.2, 2.1), M.white, 2.9, 1.0, 0, g); add(box(0.9, 0.3, 2.22), M.red, 0, 1.6, 0, g);
  for (const [x, z] of [[-1.5, 1.1], [1.6, 1.1], [-1.5, -1.1], [1.6, -1.1]]) add(cyl(0.45, 0.45, 0.3, 12), M.black, x, 0.4, z, g).rotation.x = Math.PI / 2; }
house(-60, -58, 8, 7, M.blueRoof, '#f6efe0'); house(-48, -58, 8, 7, M.blueRoof, '#e9f1f4'); house(50, -58, 8, 7, M.blueRoof, '#f8e9d6'); house(62, -58, 8, 7, M.blueRoof, '#eef4e6');
house(-12.5, -58, 7, 6.5, M.blueRoof, '#f4e7ef'); house(13.5, -58, 7, 6.5, M.blueRoof, '#e6eef8');
// row 2 (z -84): apartments, houses, the HOLLOW building HB
apt(-40, -84, 14, 9, 5, '#f2d9c8', M.blueRoof, { rail: '#e9573f' });
house(-58, -84, 8, 7, M.blueRoof, '#f1ead6'); house(-24, -84, 8, 7, M.blueRoof, '#eaf0f6'); const ROOFHOUSE = house(27.5, -84, 8, 7, M.blueRoof, '#f6ede2');
apt(42, -84, 14, 9, 5, '#d6e6f0', M.blueRoof, { rail: '#f2c23a' }); house(59, -84, 8, 7, M.blueRoof, '#f3eadb');
// HB: a facade shell with empty window holes (no glass, no floors), braced from inside
const HB = new THREE.Vector3(14, 0, -84), HBW = 12, HBD = 8, HBF = 5, HBH = HBF * 3;
const hbG = grp(HB.x, 0, HB.z, 0, VG);
const hbWall = (w, h, cols, floors) => { const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, h); sh.lineTo(-w / 2, h); sh.closePath();
  for (let k = 0; k < floors; k++) for (let i = 0; i < cols; i++) { if (k === 0 && i === Math.floor(cols / 2)) continue; const x = -w / 2 + (i + 0.5) * w / cols, y = (k + 0.5) * 3 + 0.2; const hp = new THREE.Path(); hp.moveTo(x - 0.55, y - 0.72); hp.lineTo(x + 0.55, y - 0.72); hp.lineTo(x + 0.55, y + 0.72); hp.lineTo(x - 0.55, y + 0.72); hp.closePath(); sh.holes.push(hp); }
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false }); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 3, uv.getY(i) / 3); return g; };
const hbMat = wall('#f3e3d0');
const hbFront = add(hbWall(HBW, HBH, 5, HBF), hbMat, 0, 0, HBD / 2 - 0.3, hbG);
const hbBack = add(hbWall(HBW, HBH, 5, HBF), hbMat, 0, 0, -HBD / 2, hbG);
for (const s of [-1, 1]) { const sw = add(hbWall(HBD, HBH, 3, HBF), hbMat, s * HBW / 2, 0, 0, hbG); sw.rotation.y = Math.PI / 2 * -s; sw.position.x = s * (HBW / 2 - (s > 0 ? 0 : 0.3)); }
for (let k = 1; k < HBF; k++) for (const z of [HBD / 2 + 0.02, -HBD / 2 - 0.02]) add(box(HBW + 0.3, 0.2, 0.15), M.white, 0, k * 3, z, hbG);
const hbRoof = grp(0, HBH, 0, 0, hbG); const hbRoofMat = M.blueRoof.clone(); hbRoofMat.transparent = true; const hbCapMat = M.white.clone(); hbCapMat.transparent = true;
add(box(HBW + 0.8, 0.6, HBD + 0.8), hbCapMat, 0, 0.3, 0, hbRoof); { const rf = add(new THREE.ConeGeometry(Math.hypot(HBW, HBD) / 2 + 0.6, 3.2, 4), hbRoofMat, 0, 2.2, 0, hbRoof); rf.rotation.y = Math.PI / 4; rf.scale.set(HBW / Math.hypot(HBW, HBD) * 1.414, 1, HBD / Math.hypot(HBW, HBD) * 1.414); }
// inner braces + rubble (it's a shell)
for (const x of [-4, 0, 4]) { const b = add(box(0.25, Math.hypot(HBH, HBD - 1), 0.25), M.woodL, x, HBH / 2, 0, hbG); b.rotation.x = Math.atan2(HBD - 1, HBH) * (x === 0 ? -1 : 1); }
for (const y of [5, 10]) add(box(HBW - 0.6, 0.22, 0.22), M.woodL, 0, y, 0, hbG);
{ const r = R(66), ms = []; for (let i = 0; i < 26; i++) ms.push(mtx((r() - 0.5) * 10, 0.15, (r() - 0.5) * 6, r() * 3, 0.5 + r(), 0.3 + r() * 0.4, 0.5 + r())); inst(box(1, 1, 1), M.conc, ms, hbG); }
flat(HBW - 0.4, HBD - 0.4, M.dirt, 0, 0, 0.09, hbG);
// row 3 (z -135): tall apartment blocks, gap behind HB so you can see the sky through it
apt(-52, -136, 14, 10, 9, '#f4e4d2', M.blueRoof, { rail: '#e9573f' }); apt(-32, -138, 14, 10, 10, '#e2eef4', M.blueRoof, { rail: '#2f6fc9', slogan: 'GLORY!' });
apt(32, -138, 14, 10, 10, '#f6ead8', M.blueRoof, { rail: '#f2c23a', slogan: 'PARADISE' }); apt(52, -136, 14, 10, 8, '#e8f2e2', M.blueRoof, { rail: '#3fa58a' });
apt(-70, -120, 12, 9, 6, '#f1e3e9', M.blueRoof); apt(70, -120, 12, 9, 6, '#e6eaf6', M.blueRoof);
// street lamps, trees, banners, benches, bus stop
const lampHeads = [];
{ const lampMat = new THREE.MeshBasicMaterial({ color: '#fff1c4' }); const ms = [];
  for (let z = -50; z > -115; z -= 10) if (z !== -70) for (const s of [-1, 1]) ms.push([s * 6, z]);
  for (let x = -66; x <= 66; x += 12) if (Math.abs(x) > 8) ms.push([x, -74.8]);
  for (const [x, z] of ms) { add(cyl(0.08, 0.12, 5, 6), M.dark, x, 2.5, z, VG); add(box(1.2, 0.08, 0.08), M.dark, x, 5, z, VG); const h = add(sph(0.26, 10, 8), lampMat, x + 0.5, 4.85, z, VG, { cast: false }); h.userData.lamp = true; lampHeads.push(h); }
  M.lamp = lampMat; }
{ const r = R(12); for (let z = -62; z > -112; z -= 10) for (const s of [-1, 1]) { if (z === -92 || z === -72) continue; tree(s * 8.5, z + 5, 4.5 + r() * 1.5, (z / 10) | 0, VG); add(box(1.6, 0.5, 1.6), M.conc, s * 8.5, 0.25, z + 5, VG); } }
const banners = [];
for (const [x, z] of [[-5.2, -56], [-5.2, -66], [-5.6, -88], [5.6, -88]]) { add(cyl(0.06, 0.06, 6, 6), M.steel, x, 3, z, VG); const b = add(new THREE.PlaneGeometry(0.9, 2.6, 4, 8), toon({ color: '#d4232f', side: THREE.DoubleSide }), x + Math.sign(x) * 0.5, 4.3, z, VG); b.rotation.y = Math.PI / 2; b.userData.cloth = b.geometry.attributes.position.array.slice(); banners.push(b); }
{ const g = grp(-9, 0, -72.5, 0, VG); add(box(3.4, 0.12, 1.4), M.blueRoof, 0, 2.6, 0, g); for (const s of [-1, 1]) add(box(0.12, 2.6, 0.12), M.steel, s * 1.5, 1.3, -0.5, g); add(box(2.6, 0.12, 0.5), M.woodL, 0, 0.55, -0.4, g);
  sign(['BUS STOP'], 1.4, 0.45, { bg: '#fff', fg: '#2f6fc9', border: '#2f6fc9' }, 0, 3.05, 0, 0, g, 0.06); sign(['NEXT BUS: NEVER'], 1.5, 0.5, { bg: '#fff8e0', border: '#888' }, 1.4, 1.6, -0.55, 0, g, 0.04); }
// plaza with fountain, the GIANT flagpole (NK)
const PLAZA = new THREE.Vector3(0, 0, -112);
flat(36, 22, rep(M.pave, 6, 4), 0, PLAZA.z, 0.08, VG);
const fountain = grp(-11, 0, -104, 0, VG); add(cyl(2.4, 2.6, 0.7, 24), M.conc, 0, 0.35, 0, fountain); const fWater = add(cyl(2.2, 2.2, 0.1, 24), M.water, 0, 0.62, 0, fountain); add(cyl(0.3, 0.4, 1.6, 10), M.conc, 0, 1.1, 0, fountain);
const nPole = grp(0, 0, -122, 0, world);
const nPoleInner = grp(0, 0, 0, 0, nPole);
lattice(60, 5.5, 0.9, M.steel, nPoleInner, 14);
add(cyl(0.3, 0.3, 5, 8), M.steel, 0, 62, 0, nPoleInner);
const nFlagG = grp(0, 0, 0, 0, nPole);
const nFlag = add(new THREE.PlaneGeometry(26, 13, 22, 12), toon({ map: P.tex(flagNK()), side: THREE.DoubleSide }), 13.4, 0, 0, nFlagG); nFlag.userData.cloth = nFlag.geometry.attributes.position.array.slice();
add(tbox(8, 1, 8, 2), M.conc, 0, 0.5, 0, nPole);
const heightSign = postSign(['WORLD\'S TALLEST*', '160 M'], 3.6, 1.8, { bg: '#c8262f', fg: '#ffe08a', border: '#ffe08a', edge: '#8a1a20', sub: '*WE CHECKED' }, 6.5, -113, 0, 1.0);
// checklist board in the plaza (hook: PEOPLE ✗)
const checklist = grp(0, 0, -97.5, 0, VG);
const CHK = (people) => signTex(['CHECKLIST', 'ROOFS ✓', 'LIGHTS ✓', 'FLAG ✓', people ? 'PEOPLE ✗' : 'PEOPLE ☐'], { w: 512, h: 640, bg: '#fbf6e8', border: '#2f6fc9', sizes: [74, 64, 64, 64, 72] });
const chkTex0 = P.tex(CHK(false)), chkTex1 = P.tex(CHK(true)); const chkMat = toon({ map: chkTex0 });
add(box(3.2, 4, 0.2), [M.wood, M.wood, M.wood, M.wood, chkMat, M.wood], 0, 3.2, 0, checklist); for (const s of [-1, 1]) add(box(0.2, 3.2, 0.2), M.wood, s * 1.4, 1.2, -0.15, checklist);
// balance scale: folded flag vs motorbike
const SCALE = new THREE.Vector3(-10, 0, -96);
const scaleG = grp(SCALE.x, 0, SCALE.z, 0, VG); add(cyl(0.25, 0.4, 4, 10), M.bronze ?? M.yellow, 0, 2, 0, scaleG); add(cyl(1.2, 1.4, 0.4, 16), M.conc, 0, 0.2, 0, scaleG);
const beamG = grp(0, 4.1, 0, 0, scaleG); add(box(7, 0.25, 0.25), M.yellow, 0, 0, 0, beamG); add(sph(0.3, 10, 8), M.yellow, 0, 0, 0, beamG);
const pans = [-1, 1].map((s) => { const p = grp(s * 3.3, 0, 0, 0, beamG); const hang = grp(0, 0, 0, 0, p); for (const a of [0, 2.1, 4.2]) { const c = add(cyl(0.02, 0.02, 2.4, 4), M.wire, Math.cos(a) * 0.6, -1.2, Math.sin(a) * 0.6, hang, { cast: false }); c.rotation.z = -Math.cos(a) * 0.24; c.rotation.x = Math.sin(a) * 0.24; } add(cyl(1.2, 0.9, 0.2, 16), M.yellow, 0, -2.45, 0, hang); return { p, hang }; });
{ const fb = grp(0, -2.3, 0, 0.3, pans[0].hang); for (let i = 0; i < 4; i++) add(box(1.5 - i * 0.05, 0.22, 1.1), [M.blue, M.red, M.white, M.red][i], 0, 0.12 + i * 0.22, 0, fb); }
{ const mb = grp(0, -2.3, 0, 0.5, pans[1].hang); for (const x of [-0.65, 0.65]) add(new THREE.TorusGeometry(0.36, 0.11, 8, 16), M.black, x, 0.48, 0, mb); add(box(1.0, 0.36, 0.35), M.red, 0, 0.82, 0, mb); add(box(0.6, 0.18, 0.34), M.black, -0.15, 1.08, 0, mb); add(cyl(0.04, 0.04, 0.8, 5), M.steel, 0.62, 1.12, 0, mb).rotation.x = Math.PI / 2; add(box(0.12, 0.7, 0.12), M.steel, 0.55, 0.8, 0, mb).rotation.z = 0.4; }
const kgSign = sign(['≈ 270 KG', 'EACH'], 2.4, 1.3, { bg: '#f2c23a', border: '#2a2420', edge: '#c99a1a' }, 0, 1.1, 1.4, 0, scaleG);
// loudspeaker towers + announcer booth + billboard
const towers = [];
const tower = (x, z) => { const g = grp(x, 0, z, 0, VG); add(cyl(0.22, 0.32, 14, 8), M.steel, 0, 7, 0, g); add(box(2.6, 0.2, 2.6), M.iron, 0, 13.2, 0, g);
  const hornG = grp(0, 13.3, 0, 0, g); const horns = [];
  for (let i = 0; i < 6; i++) { const hx = (i % 3 - 1) * 1.05, hy = Math.floor(i / 3) * 1.05 + 0.5; const h = grp(hx, hy, 0.2, 0, hornG); const hc = add(new THREE.CylinderGeometry(0.48, 0.1, 1.3, 14, 1, true), M.white, 0, 0, 0.6, h); hc.rotation.x = Math.PI / 2; hc.material = toon({ color: '#d9dde2', side: THREE.DoubleSide }); add(cyl(0.16, 0.16, 0.4, 8), M.iron, 0, 0, -0.1, h).rotation.x = Math.PI / 2; h.rotation.x = -0.12; h.rotation.y = (i % 3 - 1) * 0.15; horns.push(h); }
  towers.push({ g, hornG, horns, pos: new THREE.Vector3(x, 14, z) }); return g; };
tower(-13, -46); tower(18, -46);
const BOOTH = new THREE.Vector3(-9, 0, -47.5);
{ const g = grp(BOOTH.x, 0, BOOTH.z, 0, VG); add(tbox(3.2, 0.9, 1.6, 2), M.red, 0, 0.45, 0, g); add(box(3.4, 0.25, 1.8), M.yellow, 0, 0.95, 0, g); add(box(3.6, 0.25, 2.2), M.red, 0, 3.3, 0, g); for (const s of [-1, 1]) add(box(0.15, 2.4, 0.15), M.yellow, s * 1.6, 2.1, 0.8, g);
  add(cyl(0.03, 0.03, 0.6, 5), M.dark, 0.6, 1.3, 0.6, g); add(sph(0.12, 8, 6), M.steel, 0.6, 1.62, 0.6, g); sign(['RADIO KIJONG'], 3.2, 0.5, { bg: '#ffe08a', fg: '#c8262f', border: '#c8262f' }, 0, 3.75, 0.3, 0, g, 0.08); }
const BILL = new THREE.Vector3(3.5, 0, -46.5);
{ const g = grp(BILL.x, 0, BILL.z, 0, VG); for (const s of [-1, 1]) add(box(0.3, 4, 0.3), M.dark, s * 3.6, 2, -0.2, g);
  const c = signTex(['LIFE IS GREAT HERE!'], { w: 1024, h: 512, bg: '#ffe9a8', fg: '#c8262f', border: '#c8262f', sizes: [86], deco: (gg, w, h) => { gg.save(); gg.translate(0, 70); const fam = [[300, 300, '#2f6fc9'], [440, 290, '#e9573f'], [580, 330, '#3fa58a'], [700, 340, '#f08c3a']]; for (const [x, y, col] of fam) { gg.fillStyle = col; gg.beginPath(); gg.ellipse(x, y + 60, 46, 60, 0, 0, 7); gg.fill(); gg.fillStyle = '#fff'; gg.strokeStyle = '#2b1f1c'; gg.lineWidth = 8; gg.beginPath(); gg.arc(x, y - 30, 44, 0, 7); gg.fill(); gg.stroke(); gg.lineWidth = 7; gg.beginPath(); gg.arc(x, y - 22, 24, 0.2, Math.PI - 0.2); gg.stroke(); gg.fillStyle = '#2b1f1c'; gg.fillRect(x - 18, y - 46, 8, 14); gg.fillRect(x + 10, y - 46, 8, 14); } gg.fillStyle = '#ffd23a'; gg.beginPath(); gg.arc(870, 120, 60, 0, 7); gg.fill(); gg.restore(); } });
  add(box(8, 4, 0.25), [M.dark, M.dark, M.dark, M.dark, toon({ map: P.tex(c) }), M.dark], 0, 5.4, 0, g); }
const comeOver = grp(-9, 4.05, -47.4, 0, VG); comeOver.scale.setScalar(0.55); { const sh = new THREE.Shape(); sh.moveTo(-2, -0.6); sh.lineTo(0.8, -0.6); sh.lineTo(0.8, -1.2); sh.lineTo(2.2, 0); sh.lineTo(0.8, 1.2); sh.lineTo(0.8, 0.6); sh.lineTo(-2, 0.6); sh.closePath();
  const c = signTex(['COME OVER!'], { w: 512, h: 256, bg: '#2f6fc9', fg: '#fff', border: '#2f6fc9' }); const ag = new THREE.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: false }); const uv = ag.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + 2) / 4.4, (uv.getY(i) + 1.2) / 2.4);
  const arrow = add(ag, [toon({ map: P.tex(c) }), M.blue], 0, 1.4, 0, comeOver); add(box(0.2, 1.2, 0.2), M.dark, 0, 0.5, -0.1, comeOver); comeOver.userData.arrow = arrow; }
// village name sign
const nameSign = postSign(['KIJONG-DONG', 'POP. 200 FAMILIES*'], 5, 2.2, { bg: '#f4ead2', fg: '#1f3f7a', border: '#2f6fc9', sizes: [92, 54], sub: '*TRUST US' }, -46, -52, 0.15, 1.2, VG);
// "PERFECT VILLAGE" sign (hook) on a hammered post
const perfSign = grp(7, 0, -63.6, -0.3, VG);
sign(['PERFECT', 'VILLAGE ★★★★★'], 3.4, 1.7, { bg: '#fff3c4', fg: '#c8262f', border: '#c8262f', sizes: [96, 70] }, 0, 2.45, 0, 0, perfSign); add(box(0.24, 2.2, 0.24), M.wood, 0, 0.6, -0.12, perfSign);
// movie-set rig behind row 2 (z ~ -90): braces, sandbags, spotlight, director's chair, clapperboard
const RIG = new THREE.Vector3(-24, 0, -91);
{ const g = grp(RIG.x, 0, RIG.z, 0, VG); for (const x of [-3, 0, 3]) { const b = add(box(0.25, 7.5, 0.25), M.woodL, x, 3.2, -1.6, g); b.rotation.x = -0.55; add(box(0.9, 0.4, 0.6), M.sand, x, 0.2, -3.4, g); }
  const sl = grp(4.6, 0, -3.5, 0.6, g); add(cyl(0.05, 0.05, 2.8, 5), M.dark, 0, 1.4, 0, sl); for (const a of [0, 2.1, 4.2]) { const l = add(cyl(0.04, 0.04, 1.6, 4), M.dark, Math.cos(a) * 0.4, 0.6, Math.sin(a) * 0.4, sl); l.rotation.z = Math.cos(a) * 0.5; l.rotation.x = -Math.sin(a) * 0.5; }
  const lamp = add(cyl(0.45, 0.35, 0.8, 12), M.dark, 0, 2.9, 0, sl); lamp.rotation.x = 1.2; add(cyl(0.4, 0.4, 0.05, 12), new THREE.MeshBasicMaterial({ color: '#fff6d0' }), 0, 3.05, 0.35, sl).rotation.x = 1.2;
  const ch = grp(-3.5, 0, -4.6, 0.5, g); for (const s of [-1, 1]) { add(box(0.08, 1.5, 0.08), M.woodL, s * 0.4, 0.75, 0.3, ch).rotation.x = 0.35; add(box(0.08, 1.5, 0.08), M.woodL, s * 0.4, 0.75, -0.3, ch).rotation.x = -0.35; } add(box(0.9, 0.06, 0.6), toon({ color: '#2a2a2e' }), 0, 0.95, 0, ch); add(box(0.9, 0.5, 0.06), toon({ color: '#2a2a2e' }), 0, 1.5, -0.3, ch);
  sign(['DIRECTOR'], 0.8, 0.22, { bg: '#2a2a2e', fg: '#fff', border: '#2a2a2e' }, 0, 1.5, -0.34, Math.PI, ch, 0.02);
  const cl = grp(-2.4, 1.0, -4.6, 0.4, g); add(box(0.7, 0.5, 0.05), M.black, 0, 0, 0, cl); const clTop = add(box(0.72, 0.12, 0.06), M.white, 0, 0.32, 0, cl); clTop.rotation.z = 0.25; add(box(0.6, 0.6, 0.6), M.door, 0, -0.75, 0, cl);
  sign(['SET B', 'DO NOT ENTER'], 2.2, 1.1, { bg: '#f2c23a', border: '#1f1f1f' }, 0.8, 1.6, -4.0, Math.PI, g); add(box(0.12, 1.6, 0.12), M.wood, 0.8, 0.8, -3.9, g); }
// mannequin "farmers" in a field west of the village
const FARM = new THREE.Vector3(-82, 0, -70);
{ const p = add(new THREE.PlaneGeometry(36, 40), paddyMat, FARM.x, 0.05, FARM.z, VG, { cast: false }); p.rotation.x = -Math.PI / 2; p.userData.nd = flatNd; }
const mannequins = [];
const mannequin = (x, z, col, ry, hat = true) => { const g = grp(x, 0, z, ry, VG); add(cyl(0.06, 0.06, 1.2, 5), M.wood, 0, 0.6, 0, g); add(cyl(0.35, 0.42, 1.0, 10), toon({ color: col }), 0, 1.6, 0, g); add(box(1.5, 0.16, 0.16), toon({ color: col }), 0, 1.95, 0, g);
  const head = add(sph(0.32, 14, 10), toon({ color: '#efe3cf' }), 0, 2.4, 0, g); for (const s of [-1, 1]) add(sph(0.045, 6, 4), M.black, s * 0.11, 2.45, 0.29, g); add(new THREE.TorusGeometry(0.1, 0.025, 4, 10, Math.PI), M.black, 0, 2.33, 0.3, g).rotation.z = Math.PI;
  if (hat) { add(cyl(0.6, 0.6, 0.06, 14), M.straw, 0, 2.66, 0, g); add(cyl(0.25, 0.32, 0.25, 10), M.straw, 0, 2.8, 0, g); }
  add(box(0.05, 1.6, 0.05), M.wood, 0.75, 1.6, 0.1, g).rotation.z = 0.25; add(box(0.4, 0.08, 0.05), M.steel, 0.95, 0.85, 0.1, g); mannequins.push(g); return g; };
mannequin(-86, -60, '#3f6aa8', 0.3); mannequin(-80, -66, '#c8462f', -0.2); mannequin(-90, -70, '#3fa58a', 0.6); mannequin(-76, -74, '#f2c23a', 0.1); mannequin(-84, -80, '#7a4fa0', -0.4);
const stroller = grp(-72, 0, -60, 0.4, VG); add(box(1.0, 0.5, 0.6), M.pink, 0, 0.8, 0, stroller); add(new THREE.SphereGeometry(0.45, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.pink, -0.25, 1.0, 0, stroller).rotation.z = 0.6; for (const [x, z] of [[-0.4, 0.32], [0.4, 0.32], [-0.4, -0.32], [0.4, -0.32]]) add(new THREE.TorusGeometry(0.2, 0.05, 6, 12), M.black, x, 0.25, z, stroller); add(box(0.06, 0.8, 0.06), M.steel, 0.6, 1.1, 0, stroller).rotation.z = -0.5;
postSign(['FARMING', 'IN PROGRESS'], 2.6, 1.1, { bg: '#e8f2c8', fg: '#2f5a2a', border: '#2f5a2a' }, -66, -52, 0.4, 1.0, VG);
{ const r = R(9); for (let i = 0; i < 30; i++) tree(-110 + r() * 220, -150 - r() * 60, 5 + r() * 4, i, VG); for (let i = 0; i < 16; i++) tree(-115 + r() * 20, -50 - r() * 90, 5 + r() * 4, i, VG); for (let i = 0; i < 16; i++) tree(95 + r() * 20, -50 - r() * 90, 5 + r() * 4, i, VG); }
// laundry balcony close-up target: apt at x=-40 row 2; an EMPTY laundry line on floor 2 balcony
const LAUNDRY = new THREE.Vector3(-40 - 14 / 2 + 2.7 * 0.5 + 0.1, 6.1, -84 + 9 / 2 + 0.55);
{ const g = grp(LAUNDRY.x, LAUNDRY.y, LAUNDRY.z, 0, VG); for (const s of [-1, 1]) add(box(0.06, 1.4, 0.06), M.steel, s * 1.0, 0.7, 0.3, g); const ln = add(cyl(0.012, 0.012, 2, 4), M.wire, 0, 1.3, 0.3, g, { cast: false }); ln.rotation.z = Math.PI / 2;
  const pins = []; for (let i = 0; i < 4; i++) { const p = grp(-0.6 + i * 0.4, 1.3, 0.3, 0, g); add(box(0.05, 0.16, 0.05), [M.red, M.yellow, M.blue, M.pink][i], 0, -0.06, 0, p); pins.push(p); } g.userData.pins = pins; VG.userData.laundry = g; }

// ================= HOMETOWN (far away, x 400, z 400) =================
const HOME = new THREE.Vector3(400, 0, 400);
const homeG = grp(HOME.x, 0, HOME.z, 0, world);
flat(70, 60, rep(M.dirt, 8, 8), 0, 0, 0.04, homeG);
{ const hut = grp(0, 0, -4, 0, homeG); add(tbox(7, 3.2, 5, 2), M.brick, 0, 1.6, 0, hut); const rf = add(box(8, 0.15, 6.4), M.tin, 0, 3.5, 0, hut); rf.rotation.x = 0.22; rf.rotation.z = 0.06;
  add(box(1.1, 2.0, 0.12), M.door, -1.6, 1.0, 2.55, hut); const win = add(box(1.2, 0.9, 0.12), new THREE.MeshBasicMaterial({ map: glassDay }), 1.6, 1.9, 2.55, hut); add(box(1.4, 0.12, 0.12), M.woodL, 1.6, 1.4, 2.62, hut).rotation.z = 0.3;
  add(box(0.6, 1.6, 0.6), M.brick, 2.4, 4.0, -1, hut); const missing = add(box(1.2, 0.18, 1.0), M.tin, 2.6, 3.9, 1.9, hut); missing.rotation.z = 0.4; homeG.userData.tile = missing;
  add(cyl(0.35, 0.3, 0.5, 10), M.steel, -0.3, 0.25, 2.9, hut); homeG.userData.bucket = new THREE.Vector3(HOME.x - 0.3, 0.5, HOME.z - 4 + 2.9); }
const laundry = [];
{ for (const x of [-7, 3]) add(cyl(0.06, 0.08, 2.4, 6), M.wood, x, 1.2, 3.5, homeG); const ln = add(cyl(0.015, 0.015, 10, 4), M.wire, -2, 2.25, 3.5, homeG, { cast: false }); ln.rotation.z = Math.PI / 2;
  [['#e9573f', 0.8, 1.0], ['#2f6fc9', 0.7, 1.1], ['#f2c23a', 0.9, 0.8], ['#f4f2ec', 1.0, 1.2], ['#3fa58a', 0.6, 0.7]].forEach(([c, w, h], i) => { const m = add(new THREE.PlaneGeometry(w, h, 4, 4), toon({ color: c, side: THREE.DoubleSide }), -6 + i * 1.7, 2.25 - h / 2, 3.5, homeG); m.userData.cloth = m.geometry.attributes.position.array.slice(); laundry.push(m); }); }
const dog = grp(-4, 0, 1.2, 0.5, homeG);
{ const fur = toon({ color: '#c98a4a' }); const b = add(sph(0.5, 12, 8), fur, 0, 0.35, 0, dog); b.scale.set(1.5, 0.7, 0.9); const hd = grp(0.75, 0.42, 0, 0, dog); add(sph(0.3, 12, 8), fur, 0, 0, 0, hd); add(sph(0.12, 8, 6), M.black, 0.28, -0.02, 0, hd); for (const s of [-1, 1]) { const e = add(sph(0.14, 8, 6), toon({ color: '#8a5a2a' }), -0.05, 0.1, s * 0.25, hd); e.scale.set(0.6, 1.2, 0.5); } dog.userData.head = hd; dog.userData.tail = add(cyl(0.05, 0.03, 0.5, 5), fur, -0.75, 0.45, 0, dog); }
add(new THREE.CircleGeometry(1.4, 20), M.water, 3, 0.06, 4.5, homeG, { cast: false }).rotation.x = -Math.PI / 2;
{ const lamp = grp(6.5, 0, 1, 0, homeG); const p = add(cyl(0.08, 0.1, 5, 6), M.wood, 0, 2.5, 0, lamp); lamp.rotation.z = 0.18; add(box(0.9, 0.1, 0.1), M.dark, 0.4, 4.9, 0, lamp); add(sph(0.2, 8, 6), M.dark, 0.8, 4.8, 0, lamp); }
{ const r = R(3); for (let i = 0; i < 18; i++) add(sph(0.35 + r() * 0.1, 10, 8), M.leaf2, -9 + (i % 6) * 1.1, 0.3, -1 + Math.floor(i / 6) * 1.1, homeG).scale.y = 0.7;
  for (let i = 0; i < 10; i++) { const x = -12 + i * 2.6; add(box(0.12, 1.1, 0.12), M.wood, x, 0.55, 7.5, homeG).rotation.z = (r() - 0.5) * 0.4; } add(box(26, 0.1, 0.08), M.wood, 0, 0.9, 7.5, homeG);
  for (let i = 0; i < 12; i++) tree(-30 + r() * 60, -18 - r() * 20, 5 + r() * 3, i, homeG); }
postSign(['HOMETOWN', 'POP. 41 + 1 DOG'], 2.6, 1.0, { bg: '#d9d2c2', fg: '#3a3a3a', border: '#6a6a6a' }, -10, 6, 0.4, 1.0, homeG);

// ================= 3D FX POOLS (all inked geometry) =================
const fxPool = {};
const makeNote = () => { const s = new THREE.Shape(); s.absellipse(0, 0, 0.32, 0.24, 0, Math.PI * 2, false, -0.4); const g1 = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false }); const st = new THREE.Mesh(box(0.08, 1.0, 0.1)); st.position.set(0.28, 0.5, 0.05); st.updateMatrix(); const fl = new THREE.Mesh(box(0.4, 0.12, 0.1)); fl.position.set(0.44, 0.92, 0.05); fl.rotation.z = -0.5; fl.updateMatrix();
  const gg = [g1, st.geometry.clone().applyMatrix4(st.matrix), fl.geometry.clone().applyMatrix4(fl.matrix)]; return gg; };
const noteGeos = makeNote();
const pool = (name, n, make) => { fxPool[name] = []; for (let i = 0; i < n; i++) { const o = make(i); o.visible = false; scene.add(o); fxPool[name].push(o); } };
const noteCols = ['#d4232f', '#2f6fc9', '#f2c23a', '#3fa58a', '#e98fa8'];
pool('note', 40, (i) => { const g = new THREE.Group(); const m = toon({ color: noteCols[i % 5] }); noteGeos.forEach((ge) => add(ge, m, 0, 0, 0, g, { cast: false })); return g; });
pool('puff', 40, (i) => { const g = new THREE.Group(); const m = toon({ color: '#f4efe4' }); for (let k = 0; k < 4; k++) add(sph(0.4, 10, 8), m, Math.cos(k * 1.7) * 0.35, Math.sin(k * 2.3) * 0.2 + 0.2, Math.sin(k * 1.7) * 0.3, g, { cast: false }); return g; });
const starShape = (() => { const s = new THREE.Shape(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 0.18 : 0.6; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(r, 0); } s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false }); })();
pool('glint', 24, () => { const g = new THREE.Group(); add(starShape, new THREE.MeshBasicMaterial({ color: '#fff6c8' }), 0, 0, 0, g, { cast: false }); return g; });
pool('leaf', 24, (i) => { const g = new THREE.Group(); const s = new THREE.Shape(); s.moveTo(0, -0.2); s.quadraticCurveTo(0.18, 0, 0, 0.2); s.quadraticCurveTo(-0.18, 0, 0, -0.2); add(new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false }), toon({ color: ['#d9822b', '#c4452c', '#e6b13a', '#7cb04a'][i % 4] }), 0, 0, 0, g, { cast: false }); return g; });
pool('drop', 12, () => { const g = new THREE.Group(); add(sph(0.12, 10, 8), toon({ color: '#8fd0f5' }), 0, 0, 0, g, { cast: false }).scale.set(0.8, 1.2, 0.8); return g; });
pool('ring', 8, () => { const g = new THREE.Group(); add(new THREE.TorusGeometry(1, 0.08, 6, 32), new THREE.MeshBasicMaterial({ color: '#fff3b0' }), 0, 0, 0, g, { cast: false }); return g; });
pool('bag', 3, () => { const g = new THREE.Group(); const b = add(new THREE.SphereGeometry(0.35, 10, 8), toon({ color: '#f4f2ec', side: THREE.DoubleSide }), 0, 0, 0, g, { cast: false }); b.scale.set(1, 0.7, 0.6); add(new THREE.TorusGeometry(0.12, 0.03, 4, 8), M.white, 0.1, 0.25, 0, g); return g; });
pool('zzz', 6, () => { const g = new THREE.Group(); const s = new THREE.Shape(); s.moveTo(-0.3, 0.3); s.lineTo(0.3, 0.3); s.lineTo(-0.15, -0.2); s.lineTo(0.3, -0.2); s.lineTo(0.3, -0.3); s.lineTo(-0.3, -0.3); s.lineTo(0.15, 0.2); s.lineTo(-0.3, 0.2); s.closePath(); add(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false }), toon({ color: '#ffffff' }), 0, 0, 0, g, { cast: false }); return g; });
pool('bang', 6, () => { const g = new THREE.Group(); const m = toon({ color: '#f2c23a' }); add(box(0.22, 0.8, 0.12), m, 0, 0.3, 0, g); add(box(0.22, 0.22, 0.12), m, 0, -0.35, 0, g); return g; });
pool('heart', 8, () => { const g = new THREE.Group(); const s = new THREE.Shape(); s.moveTo(0, -0.35); s.bezierCurveTo(-0.6, 0.05, -0.3, 0.45, 0, 0.2); s.bezierCurveTo(0.3, 0.45, 0.6, 0.05, 0, -0.35); add(new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }), toon({ color: '#e9476a' }), 0, 0, 0, g, { cast: false }); return g; });
// birds: cranes (white, black tips, red crown) and magpies
const birds = [];
const bird = (crane) => { const g = new THREE.Group(); const body = toon({ color: crane ? '#f6f6f2' : '#25262b' }); const b = add(sph(0.3, 10, 8), body, 0, 0, 0, g, { cast: false }); b.scale.set(1.8, 0.7, 0.7);
  if (crane) { const n = add(cyl(0.05, 0.06, 0.8, 5), M.black, 0.75, 0.2, 0, g, { cast: false }); n.rotation.z = -1.1; add(sph(0.09, 8, 6), M.red, 1.08, 0.38, 0, g, { cast: false }); add(new THREE.ConeGeometry(0.03, 0.35, 5), M.yellow, 1.28, 0.36, 0, g, { cast: false }).rotation.z = -Math.PI / 2; }
  else { add(sph(0.15, 8, 6), body, 0.5, 0.1, 0, g, { cast: false }); add(box(0.7, 0.05, 0.16), body, -0.75, 0.05, 0, g, { cast: false }); }
  const wings = [-1, 1].map((s) => { const w = grp(0, 0.05, s * 0.12, 0, g); const wm = add(new THREE.PlaneGeometry(0.9, crane ? 1.4 : 0.8), toon({ color: crane ? '#ffffff' : '#25262b', side: THREE.DoubleSide }), 0, 0, s * (crane ? 0.7 : 0.4), w, { cast: false }); wm.rotation.x = Math.PI / 2; if (crane) add(new THREE.PlaneGeometry(0.4, 0.5), toon({ color: '#1e1e22', side: THREE.DoubleSide }), -0.3, 0.01, s * 1.2, w, { cast: false }).rotation.x = Math.PI / 2; return w; });
  if (crane) for (const s of [-1, 1]) add(cyl(0.025, 0.025, 1.0, 4), M.black, -0.7, -0.1, s * 0.06, g, { cast: false }).rotation.z = 1.4;
  g.userData.wings = wings; g.visible = false; scene.add(g); birds.push(g); return g; };
for (let i = 0; i < 10; i++) bird(true); for (let i = 0; i < 8; i++) bird(false);

// ---------- cards (2D characters, unlit) ----------
const CW = 1200, CH = 2000, CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.55));
class Card {
  constructor() {
    this.c = document.createElement('canvas'); this.c.width = CW; this.c.height = CH; this.g = this.c.getContext('2d');
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) { if (key === this.key) return; this.key = key; const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0); fn(new T.Pen(g)); this.t.needsUpdate = true; }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const rtA = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }), rtB = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 2.5 * RS }, sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.2 }, flash: { value: 0 }, bino: { value: 0 }, binoR: { value: 0.3 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash, bino, binoR; uniform vec3 lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue; if (card) ds = 1e4;
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9);
    }
    return e * (1. - smoothstep(160., 600., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    if (bino > 0.001) { vec2 p = (vUv - .5) * vec2(res.x/res.y, 1.); float r = binoR / max(bino, .001);
      float d1 = length(p - vec2(-r*.62, 0.)), d2 = length(p - vec2(r*.62, 0.)); float d = min(d1, d2);
      float m = smoothstep(r, r*.93, d); c *= mix(.0, 1., m); c = mix(c, c*vec3(.92,.97,1.05), .5*m*(1.-smoothstep(r*.5, r, d)));
      c += vec3(1.)*.25*smoothstep(r*.96, r*.99, d)*(1.-smoothstep(r*.99, r*1.01, d)); }
    c = mix(c, vec3(1.), flash);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofMat = new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<40;i++){ float fi = float(i); float r = sqrt((fi+.5)/40.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` });
dofMat.toneMapped = false; const dofScene = fs(dofMat);
const mixU = { a: { value: rtA.texture }, b: { value: rtB.texture }, t: { value: 0 } };
const mixMat = new THREE.ShaderMaterial({ uniforms: mixU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D a, b; uniform float t; varying vec2 vUv; void main(){ gl_FragColor = linearToOutputTexel(vec4(mix(texture2D(a,vUv).rgb, texture2D(b,vUv).rgb, t),1.)); }` });
mixMat.toneMapped = false; const mixScene = fs(mixMat);

// ---------- per-frame state ----------
const tmpV = new THREE.Vector3();
function applyLight(L) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi; sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000'); inkU.vig.value = L.vig ?? 0.2;
  paddyU.a.value.set(L.water || '#6fb7dd'); paddyU.b.value.set(L.water2 || '#bfe6f6');
  M.lamp.color.set(L.night ? '#ffe9a0' : '#f4f2ec');
  for (const c of clouds) c.material.color.set(L.cloud || '#ffffff');
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV); sun.position.copy(focus).addScaledVector(tmpV, 120); sun.target.position.copy(focus);
  const ext = L.shadowExt || 40, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 300; sc.updateProjectionMatrix();
}
const wave = (m, f, amp, speed = 0.2, k = 1.4, pin = 'left', w = 1) => { const pa = m.geometry.attributes.position, base = m.userData.cloth;
  for (let i = 0; i < pa.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; const u = pin === 'left' ? (x / w + 0.5) : pin === 'top' ? (0.5 - y / w) : 1; pa.setZ(i, base[i * 3 + 2] + Math.sin(f * speed - x * k + y * 0.4) * amp * u); }
  pa.needsUpdate = true; m.geometry.computeVertexNormals(); };
function worldState(Wd, f) {
  const t = f / 30;
  paddyU.t.value = t;
  // windows
  buildings.forEach((b, i) => { const on = Wd.lit ? Wd.lit(i, b) : 0; b.wm.map = on > 0.5 ? glassLit : glassDay; b.wm.color.setScalar(on > 0.5 ? 1 : Wd.night ? 0.55 : 1); });
  // flags & cloth
  wave(nFlag, f, 1.6, 0.16, 0.25, 'left', 26); wave(sFlag, f + 20, 1.0, 0.18, 0.4, 'left', 14); wave(opFlag, f, 0.25, 0.3, 2.2, 'left', 2.2);
  banners.forEach((b, i) => wave(b, f + i * 9, 0.18, 0.2, 2, 'top', 2.6)); laundry.forEach((l, i) => wave(l, f + i * 7, 0.18, 0.22, 3, 'top', 1));
  // poles
  const sp = Wd.sPole ?? 1, np = Wd.nPole ?? 1.65;
  sPoleInner.scale.y = Math.max(0.001, sp); sPoleInner.visible = sFlagG.visible = sp > 0.01; sFlagG.position.y = 53.5 * sp;
  nPoleInner.scale.y = np; nFlagG.position.y = 56 * np;
  // loudspeakers shake while blasting
  towers.forEach((tw, i) => { const k = Wd.blast || 0; tw.horns.forEach((h, j) => { h.position.z = 0.2 + k * 0.08 * Math.sin(f * 2.1 + j); h.scale.setScalar(1 + k * 0.08 * Math.abs(Math.sin(f * 1.7 + j))); }); });
  // school clock
  const mins = Wd.clockMin ?? (t * 0.5); minH.rotation.z = -mins / 60 * Math.PI * 2; hourH.rotation.z = -(Wd.clockHour ?? 6 + mins / 60) / 12 * Math.PI * 2;
  // playground: the empty swing sways on its own, the ball rolls by itself
  swings.forEach((s, i) => { s.rotation.x = Math.sin(t * 2.0 + i * 1.3) * (i ? 0.45 : 0.2); });
  const bx = Wd.ballRoll ?? 0; ball.position.set(PLAY.x - 5 + bx * 10, 0.3, PLAY.z + 2.2); ball.rotation.z = -bx * 10 / 0.3;
  seesaw.rotation.z = Math.sin(t * 1.1) * 0.22;
  // checklist
  chkMat.map = Wd.people ? chkTex1 : chkTex0;
  // hook: roof drops onto the house; sign post hammered down
  const rd = Wd.roofDrop ?? 1; const rfm = ROOFHOUSE.children[2]; if (rfm) rfm.position.y = 6 + (1 - rd) * 14;
  perfSign.position.y = (Wd.signSink ?? 0);
  // HB cutaway
  const xr = Wd.xray || 0; hbRoof.position.y = HBH + xr * 9; hbRoofMat.opacity = hbCapMat.opacity = 1 - xr * 0.85; hbRoof.visible = xr < 0.98;
  // balance scale
  beamG.rotation.z = Wd.scaleTilt ?? Math.sin(t * 1.3) * 0.04; pans.forEach((p) => { p.hang.rotation.z = -beamG.rotation.z; });
  // comeOver arrow bobs
  comeOver.userData.arrow.position.x = Math.sin(t * 6) * 0.25 * (Wd.come || 0.3);
  // laundry pins swing on the EMPTY line
  const lp = VG.userData.laundry.userData.pins; lp.forEach((p, i) => { p.rotation.z = Math.sin(t * 3 + i) * 0.35; });
  // hometown dog wags, tile slides
  dog.userData.tail.rotation.x = Math.sin(t * 9) * 0.6; dog.userData.head.rotation.z = Math.sin(t * 0.9) * 0.15;
  if (Wd.tileFall != null) { const k = Wd.tileFall; homeG.userData.tile.position.set(2.6 + k * 1.2, 3.9 - k * k * 3.7, 1.9 + k * 1.4); homeG.userData.tile.rotation.z = 0.4 + k * 2.2; }
  fWater.position.y = 0.62 + Math.sin(t * 3) * 0.03;
  // stroller rolls gently by itself
  stroller.position.x = -72 + Math.sin(t * 0.7) * 1.2;
  // binocular stands turn slightly
  binos.forEach((b, i) => { b.rotation.y = Math.sin(t * 0.6 + i) * 0.15; });
  // clouds drift
  clouds.forEach((c, i) => { const a = c.userData.a + t * 0.004 * (i % 2 ? 1 : -1); c.position.x = Math.cos(a) * c.userData.d; c.position.z = Math.sin(a) * c.userData.d; });
}
function drawFx(list) {
  for (const k in fxPool) fxPool[k].forEach((o) => (o.visible = false));
  const used = {};
  for (const fx of list) { const p = fxPool[fx.type]; if (!p) continue; const i = used[fx.type] = (used[fx.type] || 0); if (i >= p.length) continue; used[fx.type]++; const o = p[i];
    o.visible = true; o.position.set(...fx.pos); o.scale.setScalar(fx.s ?? 1); o.rotation.set(fx.rx || 0, fx.ry || 0, fx.rz || 0);
    if (fx.face) o.quaternion.copy(camera.quaternion), o.rotateZ(fx.rz || 0); }
}
function drawBirds(list) {
  birds.forEach((b) => (b.visible = false)); let ci = 0, mi = 0;
  for (const b of list) { const g = b.crane ? birds[ci++] : birds[10 + mi++]; if (!g) continue; g.visible = true; g.position.set(...b.pos); g.rotation.set(0, b.heading, b.bank || 0); g.scale.setScalar(b.s || 1);
    const fl = Math.sin(b.flap) * 0.9; g.userData.wings.forEach((w, s) => (w.rotation.x = (s ? -1 : 1) * fl)); }
}
function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i); c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s * (1 + (a.sq || 0)), s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.set('#ffffff'); c.mat.opacity = a.alpha ?? 1; c.mesh.castShadow = a.shadow !== false; c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? a.y) + 0.03, a.z); c.blob.scale.set(1.1 * s, 0.7 * s, 1); }
  });
}
const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) { o.userData.mat0 = o.material; if (o.userData.ndSkip || o === sky) { o.userData.vis0 = o.visible; o.visible = false; return; } o.material = o.userData.nd || ndMat; }
    else { o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; } }
  });
};
// render one complete state into a target (null = screen)
function renderState(st, target) {
  const { L, C, Wd, actors, fx, birds: bl, D } = st;
  applyLight(L);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  worldState(Wd, st.f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors(actors, camera); drawFx(fx); drawBirds(bl);
  sky.position.copy(camera.position);
  for (const c of clouds) c.quaternion.copy(camera.quaternion);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  inkU.flash.value = C.flash || 0; inkU.bino.value = C.bino || 0; inkU.binoR.value = C.binoR || 0.3;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf * RS; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(target); renderer.render(dofScene, fsCam);
}
window.renderFrame = (f) => {
  const st = frameState(f, T);
  if (st.out) { // moving dissolve: outgoing shot keeps flying while the incoming one fades in
    renderState({ ...st.out, f }, rtA); renderState({ ...st, f }, rtB);
    mixU.t.value = st.mix; renderer.setRenderTarget(null); renderer.render(mixScene, fsCam);
  } else renderState({ ...st, f }, null);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
