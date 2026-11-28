import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { TOTAL, shotAt, camAt, dofAt, lightFor, actorsAt, worldAt, fxAt } from './story.js';
await document.fonts.load('100px "Lilita One"');

// "The Village With No Doors" — one inked 3D village (street, your room, bank, shrine plaza, police plot, fields).
const W = 1080, H = 1920, RES = +(new URLSearchParams(location.search).get('res') || 1);
const canvas = document.getElementById('c');
canvas.width = W * RES; canvas.height = H * RES;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W * RES, H * RES, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- canvas helpers ----------
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
const hex2hsl = (hex) => { const c = new THREE.Color(hex), o = {}; c.getHSL(o); return [o.h * 360, o.s * 100, o.l * 100]; };
function wallTex(hex, seed = 1, band = null) {
  const [c, g] = cv(512, 512), r = P.rng(seed), [h, s, l] = hex2hsl(hex);
  g.fillStyle = hex; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 70; i++) { g.fillStyle = hsl(h + r() * 8 - 4, s * 0.9, l - 4 + r() * 9, 0.35); g.beginPath(); g.ellipse(r() * 512, r() * 512, 14 + r() * 50, 8 + r() * 26, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 14; i++) { const x = r() * 512; const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, hsl(h, s * 0.6, l - 18, 0)); gr.addColorStop(1, hsl(h, s * 0.5, l - 22, 0.35)); g.fillStyle = gr; g.fillRect(x, 200 + r() * 200, 4 + r() * 12, 312); }
  for (let i = 0; i < 6; i++) { g.strokeStyle = hsl(h, s * 0.4, l - 35, 0.7); g.lineWidth = 1.6; g.beginPath(); let x = r() * 512, y = r() * 512; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += r() * 30 - 15; y += 8 + r() * 18; g.lineTo(x, y); } g.stroke(); }
  // chipped plaster showing brick
  for (let i = 0; i < 3; i++) { const x = r() * 440, y = r() * 400; g.fillStyle = '#b5654a'; g.beginPath(); g.ellipse(x + 30, y + 16, 26, 14, r(), 0, 7); g.fill(); g.strokeStyle = '#7a3a2a'; g.lineWidth = 1.5; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + 8, y + 8 + k * 8); g.lineTo(x + 52, y + 8 + k * 8); g.stroke(); } }
  if (band) { g.fillStyle = band; g.fillRect(0, 440, 512, 72); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 440, 512, 6); }
  return c;
}
function tilesTex(a = '#e9e2d2', b = '#c9b79a', n = 8, seed = 3) { const [c, g] = cv(512, 512), r = P.rng(seed), w = 512 / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * w, j * w, w, w); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(i * w + 3, j * w + 3, w - 6, 4); g.fillStyle = `rgba(80,60,40,${r() * 0.12})`; g.fillRect(i * w, j * w, w, w); } g.strokeStyle = 'rgba(60,44,30,.6)'; g.lineWidth = 3; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * w, 0); g.lineTo(i * w, 512); g.moveTo(0, i * w); g.lineTo(512, i * w); g.stroke(); } return c; }
function roadTex(seed = 7) { const [c, g] = cv(512, 512), r = P.rng(seed); g.fillStyle = '#c49a6c'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 420; i++) { g.fillStyle = hsl(28 + r() * 10, 35, 48 + r() * 22, 0.55); g.beginPath(); g.ellipse(r() * 512, r() * 512, 2 + r() * 12, 2 + r() * 6, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 160; i++) { g.fillStyle = hsl(30, 15, 35 + r() * 30); g.beginPath(); g.arc(r() * 512, r() * 512, 1 + r() * 2.5, 0, 7); g.fill(); }
  for (let k = 0; k < 4; k++) { g.strokeStyle = 'rgba(110,76,48,.35)'; g.lineWidth = 9; g.beginPath(); const y = 80 + k * 110 + r() * 30; g.moveTo(0, y); g.bezierCurveTo(170, y + r() * 30 - 15, 340, y + r() * 30 - 15, 512, y); g.stroke(); }
  return c; }
function fieldTex(seed, base) { const [c, g] = cv(256, 256), r = P.rng(seed); g.fillStyle = base; g.fillRect(0, 0, 256, 256); const [h, s, l] = hex2hsl(base);
  for (let i = 0; i < 16; i++) { g.fillStyle = hsl(h, s, l - 10, 0.6); g.fillRect(0, i * 16, 256, 5); } for (let i = 0; i < 300; i++) { g.fillStyle = hsl(h + r() * 14 - 7, s, l + r() * 16 - 8, 0.7); g.fillRect(r() * 256, r() * 256, 3, 6); } return c; }
function ropeTex() { const [c, g] = cv(256, 256); g.fillStyle = '#d9b77a'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#8a6a3e'; g.lineWidth = 5; for (let i = -256; i < 512; i += 22) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 256, 256); g.stroke(); g.beginPath(); g.moveTo(i + 256, 0); g.lineTo(i, 256); g.stroke(); } return c; }
function clothTex(a, b, kind = 0) { const [c, g] = cv(128, 128); g.fillStyle = a; g.fillRect(0, 0, 128, 128); g.fillStyle = b; if (kind === 0) for (let i = 0; i < 8; i++) g.fillRect(0, i * 16, 128, 6); else if (kind === 1) for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { g.beginPath(); g.arc(10 + i * 22, 10 + j * 22, 4, 0, 7); g.fill(); } else { g.fillRect(0, 100, 128, 14); g.fillRect(0, 10, 128, 6); } return c; }
function woodTex(seed = 2, base = '#7a5434') { const [c, g] = cv(128, 512), r = P.rng(seed), [h, s, l] = hex2hsl(base); g.fillStyle = base; g.fillRect(0, 0, 128, 512); for (let k = 0; k < 26; k++) { g.strokeStyle = hsl(h, s, l - 10 - r() * 10, 0.5); g.lineWidth = 1 + r() * 2.5; g.beginPath(); const x = r() * 128; g.moveTo(x, 0); g.bezierCurveTo(x + 6, 170, x - 6, 340, x + r() * 8 - 4, 512); g.stroke(); } return c; }
export function signTex(lines, { w = 1024, h = 256, bg = '#f2c14e', fg = '#2e211d', border = '#2e211d', sizes = null, font = 'Lilita One', sub = null } = {}) {
  const [c, g] = cv(w, h); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = border; g.lineWidth = Math.max(10, h * 0.05); g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, w - g.lineWidth, h - g.lineWidth);
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(14, 14, w - 28, h * 0.12);
  g.textAlign = 'center'; g.textBaseline = 'middle'; const n = lines.length;
  lines.forEach((t, i) => { let sz = sizes ? sizes[i] : h * 0.62 / n; g.font = `${sz}px "${font}", sans-serif`; while (g.measureText(t).width > w * 0.9) { sz *= 0.94; g.font = `${sz}px "${font}", sans-serif`; }
    g.fillStyle = Array.isArray(fg) ? fg[i] : fg; g.fillText(t, w / 2, h * (i + 0.5) / n + h * 0.03); });
  return c;
}

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([118, 118, 118, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, extra = {}) => toon({ map: P.tex(c, rx_, ry_), ...extra });
const C = (col) => toon({ color: col });
const M = {
  road: texM(roadTex(), 1, 1), dirt: texM(P.dirt(7), 1, 1), grass: texM(P.grass(6), 1, 1),
  wood: texM(woodTex(2), 1, 1), woodDark: texM(woodTex(5, '#4a2e1c'), 1, 1), woodNew: texM(woodTex(9, '#a8642e'), 1, 1),
  tile: texM(tilesTex(), 1, 1), tileW: texM(tilesTex('#f4f1ea', '#d9534f', 6, 4), 1, 1), floor: texM(tilesTex('#d8c9a8', '#b99c74', 6, 8), 1, 1),
  rope: texM(ropeTex(), 2, 1), stone: texM(P.stone(4, 30, 18, 70), 1, 1), roofT: texM(P.roof(9), 1, 1),
  black: C('#24222b'), iron: C('#4a4a52'), steel: C('#b8c2cc'), brass: C('#d9a73a'), white: C('#f4f1ea'), red: C('#d23b34'),
  orange: C('#ff8c1a'), saffron: C('#f39c12'), marigold: C('#ffa21a'), marigold2: C('#ffcf3a'), leaf: C('#3f8a3c'), leaf2: C('#5aa04a'), trunk: C('#6a4a32'),
  water: C('#1b1b22'), tank: C('#2a2a30'), blue: C('#2f6fb0'), green: C('#3f9a5a'), yellow: C('#f2c14e'), pink: C('#e86a9a'), cream: C('#efe3c4'),
  hay: C('#e3c26a'), clay: C('#c8742f'), clay2: C('#a85a28'), glassDark: C('#28343f'), sky: C('#9fd3f0'), cow: C('#f2efe6'), cowDark: C('#6b5a4a'),
  shrineStone: toon({ color: '#2a2830' }), oil: toon({ color: '#3a3240' }), paper: C('#f6f1e2'), money: C('#8fbf6a'), gold: C('#f2c14e'),
  khaki: C('#c8a86a'), policeBlue: C('#2b4f8f'), cloudDark: C('#5a5f72'), cloudMid: C('#7c8196'),
};
const wallMats = {};
const wallM = (hex, band = null, seed = 1) => { const k = hex + band + seed; return wallMats[k] || (wallMats[k] = texM(wallTex(hex, seed, band), 1, 1)); };

// ---------- ink / normal-depth ----------
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`, side: THREE.DoubleSide });
const cardNd = (map) => new THREE.ShaderMaterial({ uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`, side: THREE.DoubleSide });

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast ?? true; m.receiveShadow = true; parent.add(m); return m; };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const tbox = (w, h, d, t = 2) => { const g = box(w, h, d), uv = g.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); } return g; };
const cyl = (r0, r1, h, n = 12) => new THREE.CylinderGeometry(r0, r1, h, n);
const sph = (r, a = 12, b = 8) => new THREE.SphereGeometry(r, a, b);
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _n3 = new THREE.Matrix3();
/** merge many small parts with one material into one mesh: parts = [geo, x,y,z, rx,ry,rz, sx,sy,sz] */
const merged = (parts) => { const pos = [], nor = [], uv = [];
  for (const [g0, x, y, z, rX = 0, rY = 0, rZ = 0, sx = 1, sy = 1, sz = 1] of parts) {
    const g = g0.index ? g0.toNonIndexed() : g0; _m4.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rX, rY, rZ)), _s.set(sx, sy, sz)); _n3.getNormalMatrix(_m4);
    const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i).applyMatrix4(_m4); pos.push(_v.x, _v.y, _v.z); _v.fromBufferAttribute(n, i).applyMatrix3(_n3).normalize(); nor.push(_v.x, _v.y, _v.z); uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0); } }
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); G.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); return G; };
const plane = (w, h, mat, x, y, z, ry = 0, parent = scene) => { const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast: false }); m.rotation.y = ry; return m; };
const signMat = (lines, o = {}) => { const t = P.tex(signTex(lines, o)); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return toon({ map: t }); };
/** sign board: inked 3D slab with painted face */
const signBoard = (lines, w, h, x, y, z, ry = 0, o = {}, parent = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const mat = signMat(lines, { w: 1024, h: Math.round(1024 * h / w), ...o }); add(box(w, h, 0.08), [M.woodDark, M.woodDark, M.woodDark, M.woodDark, mat, M.woodDark], 0, 0, 0, g); return g; };
const R = P.rng(2024);

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 }, stars: { value: 0 }, t: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize, stars, t; varying vec3 vP;
    float h1(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      if (stars > 0.) { vec3 q = floor(vP*260.); float r = h1(q); float tw = .6+.4*sin(t*3.+r*40.); c += vec3(1.,.97,.85)*step(.9965, r)*stars*tw*smoothstep(.05,.3,vP.y); }
      gl_FragColor = vec4(c,1.); }` }));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2; scene.add(sun); scene.add(sun.target);
const lamp = new THREE.PointLight('#ffc97a', 0, 9, 1.4); lamp.position.set(1.9, 1.3, -8.3); scene.add(lamp);   // oil lamp in your room (night)
const lamp2 = new THREE.PointLight('#ffd08a', 0, 14, 1.2); lamp2.position.set(37, 2.2, 0); scene.add(lamp2);  // shrine diyas
scene.fog = new THREE.Fog('#ffffff', 60, 600);

// =====================================================================================
// ---------- WORLD ----------
const world = new THREE.Group(); scene.add(world);
export const LAYOUT = { you: { x: 0, zf: -3.4, zb: -9.0, w: 5.6, doorX: -0.6 }, newh: { x: -7.6 }, bank: { x: 14, zf: 3.4 }, police: { x: -14.5 }, shrine: { x: 37, z: 0 }, arch: { x: -33 } };

// ground: big plain + street + plaza
const ground = add(new THREE.PlaneGeometry(900, 900), M.grass, 0, -0.01, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2; M.grass.map.repeat.set(160, 160);
const roadG = new THREE.PlaneGeometry(140, 7.2); { const uv = roadG.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 140 / 6, uv.getY(i) * 7.2 / 6); }
const road = add(roadG, M.road, -8, 0.014, 0, world, { cast: false }); road.rotation.x = -Math.PI / 2;
const yardG = new THREE.PlaneGeometry(84, 34); { const uv = yardG.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 14, uv.getY(i) * 6); }
const yard = add(yardG, M.dirt, -2, 0.007, 0, world, { cast: false }); yard.rotation.x = -Math.PI / 2;
// plaza tiles
const plazaG = new THREE.PlaneGeometry(22, 26); { const uv = plazaG.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 11, uv.getY(i) * 13); }
const plaza = add(plazaG, M.stone, 37, 0.02, 0, world, { cast: false }); plaza.rotation.x = -Math.PI / 2;
// open drains along the street + stone kerbs
for (const s of [-1, 1]) { add(tbox(66, 0.14, 0.3, 1), M.stone, -4, 0.07, s * 3.45, world, { cast: false }); add(box(66, 0.02, 0.3), M.water, -4, 0.02, s * 3.75, world, { cast: false }); }

// ---- house builder (front wall faces +z (s=1) for north row; -z for south row) ----
const HOUSES = {};
function house(id, x, zf, side, w, d, h, wall, band, o = {}) {
  // side = -1 north row (house body at z < zf, front faces +z); side = 1 south row (body at z > zf, faces -z)
  const g = new THREE.Group(); g.position.set(x, 0, zf); if (side > 0) g.rotation.y = Math.PI; world.add(g);
  // local frame: front wall at z=0 facing +z, body extends to z=-d
  const T_ = 0.22, dw = o.doorW ?? 1.1, dh = o.doorH ?? 2.15, dx = o.doorX ?? 0, wm = wallM(wall, band, o.seed ?? 1);
  const left = (dx - dw / 2) - (-w / 2), right = w / 2 - (dx + dw / 2);
  if (!o.shop) {
    add(tbox(left, h, T_, 2.4), wm, -w / 2 + left / 2, h / 2, -T_ / 2, g); add(tbox(right, h, T_, 2.4), wm, dx + dw / 2 + right / 2, h / 2, -T_ / 2, g);
    add(tbox(dw, h - dh, T_, 2.4), wm, dx, dh + (h - dh) / 2, -T_ / 2, g);
  } else { add(tbox(w, h - o.shopH, T_, 2.4), wm, 0, o.shopH + (h - o.shopH) / 2, -T_ / 2, g); for (const s of [-1, 1]) add(tbox(0.4, o.shopH, T_, 2.4), wm, s * (w / 2 - 0.2), o.shopH / 2, -T_ / 2, g); }
  const innerM = o.inner ?? wallM(o.innerCol ?? '#e9dcc0', null, (o.seed ?? 1) + 50);
  add(tbox(w, h, T_, 2.4), [wm, wm, wm, wm, innerM, wm], 0, h / 2, -d + T_ / 2, g);
  for (const s of [-1, 1]) add(tbox(T_, h, d, 2.4), s < 0 ? [wm, innerM, wm, wm, wm, wm] : [innerM, wm, wm, wm, wm, wm], s * (w / 2 - T_ / 2), h / 2, -d / 2, g);
  // floor + ceiling slab + parapet
  add(tbox(w - 0.1, 0.06, d - 0.1, 1.2), o.floor ?? M.floor, 0, 0.03, -d / 2, g, { cast: false });
  add(tbox(w + 0.3, 0.22, d + 0.3, 2), M.stone, 0, h + 0.11, -d / 2, g);
  for (const [px, pz, pw, pd] of [[0, 0.08, w + 0.3, 0.16], [0, -d - 0.08, w + 0.3, 0.16], [-w / 2 - 0.08, -d / 2, 0.16, d + 0.3], [w / 2 + 0.08, -d / 2, 0.16, d + 0.3]]) add(tbox(pw, 0.55, pd, 2), wm, px, h + 0.48, pz, g);
  // painted trim line under the parapet
  add(box(w + 0.34, 0.12, 0.05), C(o.trim ?? '#ffffff'), 0, h - 0.06, 0.03, g, { cast: false });
  // door frame (the joke: frame + hinges, no door)
  if (!o.shop) {
    const fm = o.frameM ?? M.woodDark;
    for (const s of [-1, 1]) add(tbox(0.12, dh, 0.3, 1), fm, dx + s * (dw / 2 + 0.06), dh / 2, 0.0, g);
    add(tbox(dw + 0.36, 0.16, 0.32, 1), fm, dx, dh + 0.08, 0.0, g);
    for (const y of [0.4, dh - 0.4]) add(cyl(0.025, 0.025, 0.14, 8), M.iron, dx - dw / 2 + 0.01, y, 0.1, g); // empty hinge pins
    add(tbox(dw + 0.8, 0.18, 0.7, 1), M.stone, dx, 0.09, 0.35, g); // otla step
    // toran (marigold + mango leaf string) over the door
    if (o.toran !== false) { const parts = []; for (let i = 0; i <= 12; i++) { const t = i / 12, xx = dx - dw / 2 - 0.1 + t * (dw + 0.2), yy = dh - 0.02 - Math.sin(t * Math.PI) * 0.16; parts.push([sph(0.055, 8, 6), xx, yy, 0.2]); }
      add(merged(parts), M.marigold, 0, 0, 0, g, { cast: false }); const lv = []; for (let i = 0; i < 7; i++) lv.push([new THREE.ConeGeometry(0.05, 0.22, 4), dx - dw / 2 + 0.05 + i * dw / 6, dh - 0.25, 0.21, Math.PI, 0, 0]); add(merged(lv), M.leaf, 0, 0, 0, g, { cast: false }); }
  }
  // windows with bars + shutters
  for (const wx of o.windows ?? []) {
    const wy = 1.55; add(box(0.9, 0.9, 0.08), M.glassDark, wx, wy, 0.02, g, { cast: false });
    add(tbox(1.1, 0.1, 0.32, 1), M.stone, wx, wy - 0.5, 0.1, g); add(tbox(1.04, 0.08, 0.14, 1), M.woodDark, wx, wy + 0.49, 0.06, g);
    const bars = []; for (let i = 0; i < 5; i++) bars.push([cyl(0.015, 0.015, 0.9, 6), wx - 0.36 + i * 0.18, wy, 0.07]); add(merged(bars), M.iron, 0, 0, 0, g, { cast: false });
    for (const s of [-1, 1]) { const sh = add(tbox(0.45, 0.92, 0.04, 1), C(o.shutter ?? '#2f8f8a'), wx + s * 0.7, wy, 0.06, g); sh.rotation.y = s * 0.25; }
  }
  // rooftop: black water tank, clothes line, dish
  if (o.tank !== false) { add(cyl(0.45, 0.42, 0.9, 14), M.tank, w / 2 - 0.9, h + 0.67, -d + 1.0, g); add(cyl(0.2, 0.2, 0.08, 10), M.tank, w / 2 - 0.9, h + 1.16, -d + 1.0, g); }
  if (o.dish) { const dsh = add(new THREE.SphereGeometry(0.35, 12, 6, 0, Math.PI * 2, 0, 0.9), M.white, -w / 2 + 0.6, h + 0.9, -0.6, g); dsh.rotation.x = 1.1; add(cyl(0.03, 0.03, 0.6, 6), M.iron, -w / 2 + 0.6, h + 0.5, -0.75, g); }
  // awning over shop fronts
  if (o.awning) { const aw = add(tbox(w + 0.2, 0.06, 1.3, 1), texM(clothTex(o.awning[0], o.awning[1], 0), 2, 1), 0, (o.shopH ?? 2.4) + 0.35, 0.6, g); aw.rotation.x = 0.28; }
  HOUSES[id] = { g, x, zf, side, w, d, h };
  return g;
}

// ---- the village rows ----
const NORTH = [ // id, x, w, d, h, wall, band, opts
  ['n1', -27.0, 5.0, 6, 3.3, '#7fc4d8', '#3d7fa0', { windows: [1.5], trim: '#ffffff', seed: 11 }],
  ['n2', -21.2, 5.6, 6, 3.6, '#f0a3b8', '#b5486f', { windows: [-1.6], dish: true, seed: 12 }],
  ['n3', -14.6, 6.0, 6, 3.2, '#f6d36b', '#c08a2a', { windows: [1.7, -1.7], seed: 13, shutter: '#c0392b' }],
  ['newh', -7.6, 6.0, 6, 3.4, '#b8e0a8', '#5f9a4a', { windows: [1.8], seed: 14, trim: '#fff6d8' }],
  ['you', 0.0, 5.6, 5.6, 3.2, '#f4b183', '#c0603a', { windows: [1.55], doorX: -0.6, seed: 15, innerCol: '#f3e7c9', tank: true }],
  ['n6', 7.0, 6.0, 6, 3.6, '#c7b2e6', '#7a5fa8', { windows: [-1.7], dish: true, seed: 16 }],
  ['n7', 13.4, 5.2, 6, 3.3, '#8fd0c0', '#3f8f7a', { windows: [1.5], seed: 17, shutter: '#e07a2a' }],
  ['n8', 19.6, 5.6, 6, 3.5, '#f2c4a0', '#c07a4a', { windows: [-1.6, 1.6], seed: 18 }],
];
for (const [id, x, w, d, h, wall, band, o] of NORTH) house(id, x, -3.4, -1, w, d, h, wall, band, o);
const SOUTH = [
  ['s1', -27.0, 5.4, 6, 3.4, '#f7e08a', '#c09a2a', { windows: [-1.5], seed: 21 }],
  ['s2', -20.8, 5.6, 6, 3.2, '#9fd4ef', '#3f7fb0', { windows: [1.6], seed: 22, dish: true }],
  ['s4', -7.4, 6.0, 6, 3.5, '#f5b5c9', '#b5486f', { windows: [1.8, -1.8], seed: 24 }],
  ['s5', 0.4, 5.6, 6, 3.3, '#c4e3a0', '#6fa04a', { windows: [-1.6], seed: 25, shutter: '#2f6fb0' }],
  ['s6', 7.2, 5.6, 6, 3.6, '#ffd2a0', '#d07a3a', { windows: [1.6], seed: 26 }],
  ['bank', 14.4, 7.2, 6.4, 3.8, '#f2efe6', '#2f6fb0', { shop: true, shopH: 2.6, seed: 27, trim: '#2f6fb0', tank: true, floor: M.tile, innerCol: '#eef1f4' }],
  ['s8', 21.4, 5.2, 6, 3.4, '#e8a87c', '#a85a28', { windows: [-1.5], seed: 28 }],
];
for (const [id, x, w, d, h, wall, band, o] of SOUTH) house(id, x, 3.4, 1, w, d, h, wall, band, o);

// --- dark-ish interiors seen through other doorways: a back curtain + clay pots + a cot
for (const [id, x] of [['n1', -27], ['n2', -21.2], ['n3', -14.6], ['n6', 7], ['n7', 13.4], ['n8', 19.6]]) {
  const hh = HOUSES[id]; const ins = new THREE.Group(); hh.g.add(ins);
  add(merged([[sph(0.22, 10, 8), -1.6, 0.22, -5.2], [sph(0.18, 10, 8), -1.2, 0.18, -5.3], [sph(0.15, 10, 8), -1.45, 0.52, -5.2]]), M.clay, 0, 0, 0, ins);
  add(tbox(1.8, 0.08, 0.8, 1), M.rope, 1.2, 0.45, -4.6, ins); for (const [a, b] of [[0.35, -4.25], [2.05, -4.25], [0.35, -4.95], [2.05, -4.95]]) add(cyl(0.04, 0.04, 0.45, 6), M.wood, a, 0.22, b, ins);
  add(tbox(1.2, 1.6, 0.06, 1), texM(clothTex('#c0392b', '#f2c14e', 2), 1, 1), -0.4, 1.4, -5.7, ins); // hanging cloth
  add(tbox(0.7, 0.9, 0.35, 1), M.blue, 2.0, 0.45, -5.6, ins); // steel trunk
}
// south row interiors (seen from the street): simple shelves + pots
for (const id of ['s1', 's2', 's4', 's5', 's6', 's8']) { const hh = HOUSES[id]; add(merged([[sph(0.2, 10, 8), 1.3, 0.2, -5.2], [sph(0.16, 10, 8), 1.6, 0.16, -5.3]]), M.clay, 0, 0, 0, hh.g); add(tbox(1.6, 0.06, 0.4, 1), M.wood, -1.2, 1.4, -5.6, hh.g); add(merged([[cyl(0.1, 0.1, 0.24, 8), -1.6, 1.55, -5.6], [cyl(0.09, 0.09, 0.2, 8), -1.2, 1.53, -5.6], [cyl(0.1, 0.1, 0.24, 8), -0.8, 1.55, -5.6]]), M.steel, 0, 0, 0, hh.g); }

// ---------- YOUR ROOM (interior of 'you') ----------
const YOU = HOUSES.you.g; // local: front wall z=0, back z=-5.6, x in [-2.8,2.8], door at x=-0.6
export const ROOM = { bed: [-1.85, 0, -4.4], table: [1.75, 0, -4.7], sill: [1.55, 1.08, -0.2], fan: [0, 3.0, -2.8] };
{ // charpai (rope cot) along the left wall
  const bx = -1.85, bz = -4.1, L = 2.0, Wd = 0.95;
  add(tbox(Wd, 0.06, L, 1), M.rope, bx, 0.48, bz, YOU);
  for (const s of [-1, 1]) { add(tbox(0.08, 0.08, L + 0.1, 1), M.wood, bx + s * Wd / 2, 0.5, bz, YOU); add(tbox(Wd + 0.1, 0.08, 0.08, 1), M.wood, bx, 0.5, bz + s * L / 2, YOU); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(cyl(0.05, 0.04, 0.5, 8), M.wood, bx + sx * Wd / 2, 0.25, bz + sz * L / 2, YOU);
  add(tbox(Wd - 0.1, 0.05, 1.3, 1), texM(clothTex('#3f6fb0', '#f2c14e', 1), 2, 2), bx, 0.53, bz + 0.25, YOU); // blanket
}
const pillow = add(new THREE.SphereGeometry(0.3, 14, 8), C('#f4f1ea'), -1.85, 0.6, -4.85, YOU); pillow.scale.set(1.3, 0.35, 0.75);
// table with a steel tumbler + oil lamp
add(tbox(1.0, 0.06, 0.6, 1), M.wood, 1.75, 0.78, -4.7, YOU); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(box(0.06, 0.76, 0.06), M.wood, 1.75 + sx * 0.44, 0.38, -4.7 + sz * 0.25, YOU);
add(cyl(0.05, 0.04, 0.14, 10), M.steel, 2.05, 0.88, -4.6, YOU);
const diya = add(new THREE.SphereGeometry(0.08, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.clay, 1.5, 0.88, -4.8, YOU);
const diyaFlame = add(new THREE.ConeGeometry(0.025, 0.09, 8), toon({ color: '#ffd23a', emissive: '#ff9a1a', emissiveIntensity: 1.2 }), 1.5, 0.93, -4.8, YOU, { cast: false });
// chair, wall shelf, calendar, mirror, hooks with clothes, steel trunk under the bed
add(tbox(0.5, 0.05, 0.5, 1), M.wood, 1.0, 0.47, -4.2, YOU); add(tbox(0.5, 0.55, 0.05, 1), M.wood, 1.0, 0.75, -4.43, YOU); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(box(0.05, 0.46, 0.05), M.wood, 1.0 + sx * 0.22, 0.23, -4.2 + sz * 0.22, YOU);
add(tbox(1.4, 0.05, 0.3, 1), M.wood, 0.4, 1.9, -5.4, YOU); add(merged([[cyl(0.08, 0.08, 0.2, 10), 0.0, 2.03, -5.4], [cyl(0.06, 0.07, 0.16, 10), 0.3, 2.01, -5.4], [sph(0.09, 10, 8), 0.65, 2.02, -5.4]]), M.brass, 0, 0, 0, YOU);
const calMat = toon({ map: P.tex(signTex(['NOV', '1'], { w: 256, h: 320, bg: '#fbf6e8', fg: ['#d23b34', '#2e211d'], sizes: [80, 150], border: '#d23b34' })) });
const calendar = add(box(0.5, 0.62, 0.02), [M.paper, M.paper, M.paper, M.paper, calMat, M.paper], -0.9, 1.8, -5.47, YOU, { cast: false });
add(box(0.42, 0.55, 0.03), C('#bfe6f5'), 2.1, 1.65, -5.46, YOU, { cast: false }); add(tbox(0.5, 0.62, 0.02, 1), M.woodDark, 2.1, 1.65, -5.48, YOU);
const hook = add(tbox(0.7, 0.9, 0.04, 1), texM(clothTex('#e07a2a', '#fff4c8', 0), 1, 1), -2.68, 1.6, -2.2, YOU); hook.rotation.y = Math.PI / 2;
add(tbox(0.8, 0.35, 0.45, 1), M.blue, -1.85, 0.18, -3.4, YOU);
// interior side of the window (pane + frame + sill) so it reads from inside
const inWin = new THREE.Group(); inWin.position.set(1.55, 0, -0.22); YOU.add(inWin);
const inPane = add(box(0.9, 0.9, 0.02), toon({ color: '#bfe6f5', emissive: '#bfe6f5', emissiveIntensity: 0.55 }), 0, 1.55, -0.005, inWin, { cast: false });
add(tbox(1.04, 0.08, 0.1, 1), M.woodDark, 0, 2.03, -0.04, inWin); for (const s_ of [-1, 1]) add(tbox(0.08, 1.0, 0.1, 1), M.woodDark, s_ * 0.5, 1.55, -0.04, inWin);
add(tbox(1.15, 0.06, 0.28, 1), M.stone, 0, 1.08, -0.12, inWin); { const bars = []; for (let i = 0; i < 5; i++) bars.push([cyl(0.014, 0.014, 0.9, 6), -0.36 + i * 0.18, 1.55, -0.03]); add(merged(bars), M.iron, 0, 0, 0, inWin, { cast: false }); }
// switchboard + tube light
add(box(0.25, 0.18, 0.03), M.white, 0.7, 1.3, -5.46, YOU); add(cyl(0.03, 0.03, 1.1, 8), toon({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.4 }), -0.6, 2.7, -5.42, YOU).rotation.z = Math.PI / 2;
// ceiling fan (spins)
const fan = new THREE.Group(); fan.position.set(0, 2.95, -2.8); YOU.add(fan);
add(cyl(0.02, 0.02, 0.3, 6), M.iron, 0, 0.12, 0, fan); add(cyl(0.12, 0.12, 0.1, 14), M.white, 0, -0.04, 0, fan);
const fanBlades = new THREE.Group(); fan.add(fanBlades); for (let i = 0; i < 3; i++) { const b = add(box(0.62, 0.02, 0.12), M.white, 0.36, -0.05, 0, fanBlades); const pv = new THREE.Group(); pv.rotation.y = i * Math.PI * 2 / 3; fanBlades.add(pv); pv.add(b); b.rotation.x = 0.12; }
// shoes by the door (one gets the cash)
const shoeGeo = merged([[sph(0.1, 12, 8), 0, 0.05, 0, 0, 0, 0, 0.9, 0.55, 1.6], [cyl(0.07, 0.08, 0.06, 10), 0, 0.09, -0.08]]);
const shoes = [add(shoeGeo, C('#5a3524'), -1.2, 0, -1.1, YOU), add(shoeGeo, C('#5a3524'), -1.0, 0, -1.05, YOU)];
// "ROOM FOR RENT" sign next to your doorway
const rentSign = signBoard(['ROOM FOR RENT', 'no door, no problem'], 1.3, 0.55, 1.55, 2.35, 0.08, 0, { bg: '#fff4c8', fg: ['#c0392b', '#2e211d'], sizes: [120, 78] }, YOU);

// ---------- THE NEIGHBOUR'S NEW HOUSE: a real door at the end ----------
const NEWH = HOUSES.newh.g;
const newDoor = new THREE.Group(); newDoor.position.set(-0.55, 0, 0.05); NEWH.add(newDoor);
const doorPanel = add(tbox(1.08, 2.12, 0.08, 1), M.woodNew, 0.54, 1.07, 0, newDoor);
for (const y of [0.6, 1.55]) add(tbox(0.8, 0.6, 0.03, 1), texM(woodTex(12, '#c27a3a'), 1, 1), 0.54, y, 0.05, newDoor);
const knob = add(sph(0.05, 10, 8), M.brass, 0.95, 1.05, 0.08, newDoor);
const hasp = add(box(0.06, 0.18, 0.04), M.brass, 1.03, 1.2, 0.07, newDoor);
const newPaint = []; // fresh shine sparkle anchors
const newRibbon = add(box(1.4, 0.12, 0.03), M.red, 0, 2.0, 0.22, NEWH, { cast: false }); newRibbon.visible = false;

// ---------- props (3D prototypes, cloned on demand) ----------
const PROTO = {};
PROTO.padlock = (() => { const g = new THREE.Group(); add(tbox(0.16, 0.13, 0.06, 1), M.brass, 0, 0, 0, g); const sh = add(new THREE.TorusGeometry(0.055, 0.016, 8, 16, Math.PI), M.steel, 0, 0.065, 0, g); add(cyl(0.012, 0.012, 0.03, 6), M.black, 0, -0.01, 0.031, g).rotation.x = Math.PI / 2; g.userData.shackle = sh; return g; })();
PROTO.phone = (() => { const g = new THREE.Group(); add(tbox(0.08, 0.16, 0.012, 1), M.black, 0, 0, 0, g); add(box(0.068, 0.135, 0.004), C('#7cc4ff'), 0, 0.002, 0.008, g, { cast: false }); return g; })();
PROTO.wallet = (() => { const g = new THREE.Group(); add(tbox(0.13, 0.09, 0.025, 1), C('#6a3f22'), 0, 0, 0, g); add(box(0.1, 0.03, 0.028), M.money, 0, 0.035, 0, g); return g; })();
PROTO.cash = (() => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = add(box(0.15, 0.004, 0.07), M.money, 0, i * 0.006, 0, g); b.rotation.y = i * 0.15; } add(box(0.02, 0.022, 0.075), M.paper, 0, 0.006, 0, g); return g; })();
PROTO.note = (() => { const g = new THREE.Group(); add(box(0.15, 0.003, 0.07), M.money, 0, 0, 0, g); add(box(0.04, 0.004, 0.04), C('#d8eccc'), 0.03, 0, 0, g, { cast: false }); return g; })();
PROTO.coin = (() => { const g = new THREE.Group(); add(cyl(0.035, 0.035, 0.01, 14), M.gold, 0, 0, 0, g).rotation.x = Math.PI / 2; return g; })();
PROTO.ball = (() => { const g = new THREE.Group(); add(sph(0.05, 14, 10), C('#c0222b'), 0, 0, 0, g); add(new THREE.TorusGeometry(0.05, 0.006, 6, 20), M.white, 0, 0, 0, g); return g; })();
PROTO.pot = (() => { const g = new THREE.Group(); add(sph(0.16, 14, 10), M.clay, 0, 0, 0, g).scale.y = 0.9; add(cyl(0.07, 0.09, 0.08, 12), M.clay2, 0, 0.16, 0, g); return g; })();
PROTO.brassPot = (() => { const g = new THREE.Group(); add(sph(0.13, 14, 10), M.brass, 0, 0, 0, g).scale.y = 0.85; add(cyl(0.06, 0.08, 0.06, 12), M.brass, 0, 0.12, 0, g); return g; })();
PROTO.oilcan = (() => { const g = new THREE.Group(); add(cyl(0.07, 0.07, 0.16, 12), M.steel, 0, 0, 0, g); add(cyl(0.012, 0.02, 0.12, 6), M.steel, 0.07, 0.08, 0, g).rotation.z = -0.9; return g; })();
PROTO.chai = (() => { const g = new THREE.Group(); add(cyl(0.035, 0.028, 0.08, 10), C('#e9f2f6'), 0, 0, 0, g); add(cyl(0.031, 0.031, 0.005, 10), C('#c08a52'), 0, 0.03, 0, g); return g; })();
PROTO.news = (() => { const g = new THREE.Group(); const t = P.tex(signTex(['THEFT IN', 'SHINGNAPUR!'], { w: 512, h: 400, bg: '#f6f1e2', fg: ['#2e211d', '#c0392b'], border: '#2e211d', sizes: [110, 96] })); add(box(0.42, 0.32, 0.006), [M.paper, M.paper, M.paper, M.paper, toon({ map: t }), M.paper], 0, 0, 0, g, { cast: false }); return g; })();
PROTO.sack = (() => { const g = new THREE.Group(); add(sph(0.2, 12, 10), C('#c9a86a'), 0, 0, 0, g).scale.set(1, 1.15, 0.9); add(cyl(0.05, 0.08, 0.1, 8), C('#a88a52'), 0, 0.22, 0, g); return g; })();
PROTO.suitcase = (() => { const g = new THREE.Group(); add(tbox(0.5, 0.62, 0.22, 1), M.blue, 0, 0.36, 0, g); add(new THREE.TorusGeometry(0.07, 0.015, 6, 12, Math.PI), M.black, 0, 0.67, 0, g); for (const s of [-1, 1]) add(cyl(0.03, 0.03, 0.04, 8), M.black, s * 0.18, 0.03, 0, g).rotation.z = Math.PI / 2; return g; })();
PROTO.cam = (() => { const g = new THREE.Group(); add(tbox(0.14, 0.09, 0.07, 1), M.black, 0, 0, 0, g); add(cyl(0.03, 0.03, 0.05, 10), M.iron, 0, 0, 0.05, g).rotation.x = Math.PI / 2; return g; })();
PROTO.marigoldGarland = (() => { const g = new THREE.Group(); const parts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; parts.push([sph(0.035, 8, 6), Math.cos(a) * 0.12, -Math.abs(Math.sin(a)) * 0.24, 0]); } add(merged(parts), M.marigold, 0, 0, 0, g); return g; })();
PROTO.bat = (() => { const g = new THREE.Group(); add(tbox(0.1, 0.55, 0.03, 1), C('#e8c98a'), 0, 0.3, 0, g); add(cyl(0.018, 0.018, 0.25, 8), C('#c0392b'), 0, -0.08, 0, g); return g; })();
PROTO.whistle = (() => { const g = new THREE.Group(); add(cyl(0.02, 0.02, 0.06, 8), M.steel, 0, 0, 0, g).rotation.z = Math.PI / 2; return g; })();
// FX prototypes (all real 3D, inked)
const starGeo = (() => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.04 : 0.1; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }); })();
PROTO.spark = (() => { const g = new THREE.Group(); add(starGeo, toon({ color: '#ffe27a', emissive: '#ffb020', emissiveIntensity: 0.5 }), 0, 0, -0.015, g, { cast: false }); return g; })();
PROTO.puff = (() => { const g = new THREE.Group(); add(merged([[sph(0.12, 10, 8), 0, 0, 0], [sph(0.09, 10, 8), 0.1, 0.03, 0.02], [sph(0.08, 10, 8), -0.09, 0.04, 0]]), C('#f2e6d0'), 0, 0, 0, g, { cast: false }); return g; })();
PROTO.dust = (() => { const g = new THREE.Group(); add(merged([[sph(0.12, 10, 8), 0, 0, 0], [sph(0.09, 10, 8), 0.1, 0.03, 0.02], [sph(0.08, 10, 8), -0.09, 0.04, 0]]), C('#d9b98a'), 0, 0, 0, g, { cast: false }); return g; })();
PROTO.drop = (() => { const g = new THREE.Group(); add(merged([[sph(0.03, 8, 6), 0, 0, 0], [new THREE.ConeGeometry(0.03, 0.06, 8), 0, 0.04, 0]]), C('#8fd0f5'), 0, 0, 0, g, { cast: false }); return g; })();
PROTO.sweat = PROTO.drop;
PROTO.petal = (() => { const g = new THREE.Group(); const m = add(sph(0.04, 8, 6), M.marigold, 0, 0, 0, g, { cast: false }); m.scale.set(1, 0.3, 0.7); return g; })();
PROTO.z = (() => { const g = new THREE.Group(); const s = new THREE.Shape(); s.moveTo(-0.08, 0.08); s.lineTo(0.08, 0.08); s.lineTo(0.08, 0.05); s.lineTo(-0.03, -0.05); s.lineTo(0.08, -0.05); s.lineTo(0.08, -0.08); s.lineTo(-0.08, -0.08); s.lineTo(-0.08, -0.05); s.lineTo(0.03, 0.05); s.lineTo(-0.08, 0.05); s.closePath(); add(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }), C('#e9f3ff'), 0, 0, 0, g, { cast: false }); return g; })();
PROTO.bang = (() => { const g = new THREE.Group(); add(tbox(0.06, 0.2, 0.04, 1), M.red, 0, 0.08, 0, g); add(sph(0.035, 8, 6), M.red, 0, -0.08, 0, g); return g; })();
PROTO.q = (() => { const g = new THREE.Group(); add(new THREE.TorusGeometry(0.07, 0.025, 8, 16, Math.PI * 1.4), C('#ffe27a'), 0, 0.08, 0, g).rotation.z = -0.6; add(tbox(0.045, 0.07, 0.04, 1), C('#ffe27a'), 0.0, -0.03, 0, g); add(sph(0.03, 8, 6), C('#ffe27a'), 0, -0.12, 0, g); return g; })();
PROTO.heart = (() => { const g = new THREE.Group(); add(merged([[sph(0.05, 10, 8), -0.035, 0.02, 0], [sph(0.05, 10, 8), 0.035, 0.02, 0], [new THREE.ConeGeometry(0.07, 0.1, 10), 0, -0.04, 0, Math.PI, 0, 0]]), C('#ff6b8a'), 0, 0, 0, g, { cast: false }); return g; })();
PROTO.cloud = (() => { const g = new THREE.Group(); add(merged([[sph(0.55, 12, 10), 0, 0, 0], [sph(0.42, 12, 10), 0.55, -0.1, 0.05], [sph(0.42, 12, 10), -0.55, -0.08, 0], [sph(0.35, 12, 10), 0.2, 0.3, 0.1], [sph(0.38, 12, 10), -0.25, 0.25, -0.1]]), M.cloudDark, 0, 0, 0, g, { cast: false }); return g; })();
PROTO.bolt = (() => { const g = new THREE.Group(); const s = new THREE.Shape(); s.moveTo(0.05, 0.4); s.lineTo(-0.1, 0.02); s.lineTo(0.02, 0.02); s.lineTo(-0.06, -0.4); s.lineTo(0.12, 0.08); s.lineTo(0.0, 0.08); s.lineTo(0.12, 0.4); s.closePath(); add(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }), toon({ color: '#fff27a', emissive: '#ffd020', emissiveIntensity: 0.8 }), 0, 0, 0, g, { cast: false }); return g; })();
PROTO.banana = (() => { const g = new THREE.Group(); add(new THREE.TorusGeometry(0.1, 0.025, 8, 12, Math.PI * 0.8), M.yellow, 0, 0, 0, g).rotation.x = Math.PI / 2; return g; })();
PROTO.flowerpot = (() => { const g = new THREE.Group(); add(cyl(0.12, 0.08, 0.18, 10), M.clay, 0, 0, 0, g); add(sph(0.13, 10, 8), M.leaf2, 0, 0.14, 0, g); return g; })();
PROTO.sevenSign = (() => { const g = new THREE.Group(); add(box(1.25, 0.62, 0.06), [M.woodDark, M.woodDark, M.woodDark, M.woodDark, signMat(['7½ YEARS', 'OF BAD LUCK'], { w: 1024, h: 508, bg: '#2a2440', fg: ['#ffcf3a', '#ffffff'], border: '#ffcf3a', sizes: [190, 120] }), M.woodDark], 0, 0, 0, g); add(cyl(0.03, 0.03, 1.2, 8), M.woodDark, 0, -0.85, -0.02, g); return g; })();
PROTO.policeSign = (() => { const g = new THREE.Group(); add(box(2.6, 0.7, 0.08), [M.woodDark, M.woodDark, M.woodDark, M.woodDark, signMat(['POLICE STATION', 'est. this week'], { w: 1024, h: 276, bg: '#2b4f8f', fg: ['#ffffff', '#ffcf3a'], border: '#ffffff', sizes: [130, 64] }), M.woodDark], 0, 0, 0, g); return g; })();
PROTO.speech = PROTO.q;
PROTO.crow = (() => { const g = new THREE.Group(); add(sph(0.1, 10, 8), C('#2a2a33'), 0, 0, 0, g).scale.set(1.4, 1, 0.9); add(sph(0.06, 8, 6), C('#2a2a33'), 0.12, 0.07, 0, g); add(new THREE.ConeGeometry(0.02, 0.06, 6), C('#3a3a3a'), 0.19, 0.06, 0, g).rotation.z = -Math.PI / 2; const w1 = add(box(0.14, 0.02, 0.22), C('#2a2a33'), -0.02, 0.04, 0.13, g), w2 = add(box(0.14, 0.02, 0.22), C('#2a2a33'), -0.02, 0.04, -0.13, g); g.userData.w = [w1, w2]; return g; })();
PROTO.coinpot = (() => { const g = new THREE.Group(); add(sph(0.2, 14, 10), M.clay, 0, 0.18, 0, g).scale.y = 0.85; add(cyl(0.12, 0.14, 0.06, 12), M.clay2, 0, 0.36, 0, g); add(merged([...Array(9)].map((_, i) => [cyl(0.035, 0.035, 0.01, 10), Math.cos(i * 2.4) * 0.07, 0.38 + (i % 3) * 0.012, Math.sin(i * 2.4) * 0.07, Math.PI / 2 * (i % 2), 0, 0.3])), M.gold, 0, 0, 0, g); return g; })();
const pools = {}; const usedCount = {};
const takeProto = (name) => { const pool = pools[name] || (pools[name] = []), k = usedCount[name] || 0; usedCount[name] = k + 1; if (!pool[k]) { const c = PROTO[name].clone(true); c.traverse((o) => { if (o.isMesh) o.material = o.material; }); scene.add(c); pool[k] = c; } const o = pool[k]; o.visible = true; return o; };
const resetPools = () => { for (const n in pools) for (const o of pools[n]) o.visible = false; for (const n in usedCount) usedCount[n] = 0; };

// ---------- street life: cow, dog, chickens, bicycle, cots, pots, handpump, trees, power lines, laundry ----------
const cow = new THREE.Group(); world.add(cow);
{ add(merged([[sph(0.5, 14, 10), 0, 0, 0, 0, 0, 0, 1.55, 0.85, 0.85]]), M.cow, 0, 1.0, 0, cow); add(sph(0.2, 10, 8), M.cow, -0.25, 1.48, 0, cow); // hump
  const head = new THREE.Group(); head.position.set(0.85, 1.25, 0); cow.add(head); cow.userData.head = head;
  add(merged([[sph(0.24, 12, 10), 0.08, 0, 0, 0, 0, 0, 1.3, 0.9, 0.85]]), M.cow, 0, 0, 0, head); add(sph(0.14, 10, 8), C('#f2b7a6'), 0.36, -0.08, 0, head);
  for (const s of [-1, 1]) { const hn = add(new THREE.ConeGeometry(0.05, 0.3, 8), M.cream, 0.0, 0.25, s * 0.14, head); hn.rotation.x = -s * 0.5; add(sph(0.05, 8, 6), M.black, 0.18, 0.06, s * 0.16, head); add(sph(0.08, 8, 6), M.cow, -0.05, 0.08, s * 0.24, head).scale.set(1, 0.5, 1.4); }
  add(merged([[sph(0.08, 8, 6), 0, 0, 0]]), M.marigold, 0.05, -0.2, 0, head); // marigold collar bead
  cow.userData.legs = []; for (const [lx, lz] of [[0.5, 0.25], [0.5, -0.25], [-0.5, 0.25], [-0.5, -0.25]]) { const lg = new THREE.Group(); lg.position.set(lx, 0.75, lz); cow.add(lg); add(cyl(0.07, 0.06, 0.72, 8), M.cow, 0, -0.36, 0, lg); add(cyl(0.065, 0.065, 0.08, 8), M.black, 0, -0.72, 0, lg); cow.userData.legs.push(lg); }
  const tail = add(cyl(0.025, 0.015, 0.7, 6), M.cow, -0.82, 0.9, 0, cow); tail.rotation.z = -0.3; cow.userData.tail = tail;
  add(sph(0.18, 10, 8), M.cowDark, 0.2, 1.2, 0.3, cow).scale.set(1.2, 0.6, 0.4); }
const dog = new THREE.Group(); world.add(dog);
{ add(merged([[sph(0.22, 12, 8), 0, 0.32, 0, 0, 0, 0, 1.4, 0.8, 0.8]]), C('#c98a4a'), 0, 0, 0, dog); const dh = add(sph(0.14, 10, 8), C('#c98a4a'), 0.3, 0.45, 0, dog); dog.userData.head = dh;
  for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.05, 0.12, 6), C('#8a5a2a'), 0.28, 0.6, s * 0.08, dog); add(sph(0.03, 6, 4), M.black, 0.44, 0.45, 0, dog);
  for (const [lx, lz] of [[0.18, 0.1], [0.18, -0.1], [-0.18, 0.1], [-0.18, -0.1]]) add(cyl(0.035, 0.03, 0.26, 6), C('#c98a4a'), lx, 0.13, lz, dog);
  const dt = add(cyl(0.02, 0.01, 0.25, 6), C('#c98a4a'), -0.32, 0.42, 0, dog); dt.rotation.z = 0.8; dog.userData.tail = dt; }
const chickens = []; for (let i = 0; i < 4; i++) { const c = new THREE.Group(); world.add(c); add(sph(0.12, 10, 8), i % 2 ? M.white : C('#b5653a'), 0, 0.18, 0, c).scale.set(1.2, 1, 0.9); const hd = add(sph(0.06, 8, 6), i % 2 ? M.white : C('#b5653a'), 0.12, 0.3, 0, c); add(new THREE.ConeGeometry(0.02, 0.05, 6), M.yellow, 0.18, 0.3, 0, c).rotation.z = -Math.PI / 2; add(sph(0.025, 6, 4), M.red, 0.12, 0.37, 0, c); for (const s of [-1, 1]) add(cyl(0.008, 0.008, 0.1, 4), M.yellow, 0, 0.05, s * 0.04, c); c.userData.head = hd; chickens.push(c); }
// trees: neem trees with round canopies + coconut palms
const neem = (x, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); world.add(g); const t = add(cyl(0.18, 0.28, 3.2, 8), M.trunk, 0, 1.6, 0, g); t.rotation.z = 0.06;
  const parts = []; const r = P.rng(Math.round(x * 13 + z * 7)); for (let i = 0; i < 9; i++) parts.push([sph(0.9 + r() * 0.5, 10, 8), (r() - 0.5) * 2.6, 3.6 + r() * 1.3, (r() - 0.5) * 2.6]); const cn = add(merged(parts), i_++ % 2 ? M.leaf : M.leaf2, 0, 0, 0, g); g.userData.canopy = cn; trees.push(g); return g; };
const palm = (x, z, h = 7) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); const seg = []; for (let i = 0; i < 8; i++) seg.push([cyl(0.16, 0.19, h / 8, 8), Math.sin(i * 0.2) * 0.3, h / 16 + i * h / 8, 0, 0, 0, 0.04]); add(merged(seg), M.trunk, 0, 0, 0, g);
  const fr = new THREE.Group(); fr.position.set(Math.sin(1.4) * 0.3, h, 0); g.add(fr); for (let i = 0; i < 8; i++) { const lf = add(box(2.2, 0.03, 0.4), M.leaf, 1.0, -0.3, 0, new THREE.Group()); const pv = lf.parent; pv.rotation.y = i * Math.PI / 4; pv.rotation.z = -0.35; fr.add(pv); } g.userData.fronds = fr; trees.push(g); return g; };
let i_ = 0; const trees = [];
neem(-4.2, 6.6, 1.0); neem(10.6, -9.8, 1.1); neem(-17.8, 7.8, 0.95); neem(24.5, 7.2, 1.15); neem(-31, -7, 1.2); neem(28, -11, 1.1);
for (const [x, z, h] of [[-40, 10, 8], [-44, -9, 7.5], [-52, 14, 9], [-60, -12, 8], [50, 14, 8.5], [55, -10, 9], [-70, 6, 9], [-36, 22, 8], [10, 22, 8.5], [-10, -22, 9], [30, -24, 8], [-25, -20, 7.5]]) palm(x, z, h);
// power poles + sagging wires along the north side with crows
const poles = [-24, -10, 4, 18, 30]; const wireParts = [];
for (const x of poles) { add(cyl(0.08, 0.1, 7, 8), C('#9a9a9a'), x, 3.5, -3.0, world); add(box(1.2, 0.08, 0.08), C('#7a7a7a'), x, 6.6, -3.0, world); }
for (let i = 0; i < poles.length - 1; i++) for (const dz of [-0.5, 0.5]) { const a = poles[i], b = poles[i + 1]; for (let k = 0; k < 24; k++) { const t = (k + 0.5) / 24, x = a + (b - a) * t, y = 6.62 - Math.sin(t * Math.PI) * 0.6; wireParts.push([cyl(0.012, 0.012, (b - a) / 24 + 0.02, 4), x, y, -3.0 + dz, 0, 0, Math.PI / 2 + Math.cos(t * Math.PI) * 0.08]); } }
add(merged(wireParts), M.black, 0, 0, 0, world, { cast: false });
const crows = []; for (const [x, dz] of [[-17, -0.5], [-16.2, -0.5], [11, 0.5], [-3, 0.5], [24, -0.5]]) { const c = new THREE.Group(); world.add(c); c.position.set(x, 6.62 - Math.sin(((x + 24) % 14) / 14 * Math.PI) * 0.6 + 0.12, -3 + dz); add(sph(0.1, 10, 8), C('#2a2a33'), 0, 0, 0, c).scale.set(1.4, 1, 0.9); add(sph(0.06, 8, 6), C('#2a2a33'), 0.12, 0.07, 0, c); add(new THREE.ConeGeometry(0.02, 0.06, 6), C('#3a3a3a'), 0.19, 0.06, 0, c).rotation.z = -Math.PI / 2; add(box(0.12, 0.02, 0.08), C('#2a2a33'), -0.15, 0.02, 0, c); crows.push(c); }
// flying birds (kites / crows) circling over the village
const birds = []; for (let i = 0; i < 7; i++) { const b = new THREE.Group(); world.add(b); add(sph(0.12, 8, 6), C('#3a3240'), 0, 0, 0, b).scale.set(1.6, 0.6, 0.6); const wl = add(box(0.1, 0.02, 0.5), C('#3a3240'), 0, 0, 0.27, b), wr = add(box(0.1, 0.02, 0.5), C('#3a3240'), 0, 0, -0.27, b); b.userData.w = [wl, wr]; birds.push(b); }
// laundry lines between houses / on rooftops
const laundry = [];
const line_ = (x0, x1, y, z, cols) => { const n = cols.length; add(cyl(0.008, 0.008, x1 - x0, 4), M.black, (x0 + x1) / 2, y, z, world, { cast: false }).rotation.z = Math.PI / 2;
  cols.forEach((c, i) => { const w = 0.5 + (i % 3) * 0.15, h = 0.7 + (i % 2) * 0.3; const g = new THREE.PlaneGeometry(w, h, 6, 6); g.translate(0, -h / 2, 0); const m = add(g, texM(clothTex(c[0], c[1], i % 3), 1, 1, { side: THREE.DoubleSide }), x0 + (i + 0.5) * (x1 - x0) / n, y, z, world); m.userData.base = g.attributes.position.array.slice(); m.userData.ph = i * 1.3; laundry.push(m); }); };
line_(-25.5, -22.6, 2.6, -2.6, [['#e2453c', '#f2c14e'], ['#2f6fb0', '#ffffff'], ['#f2c14e', '#e2453c'], ['#3f9a5a', '#ffffff']]);
line_(8.6, 11.8, 2.7, -2.6, [['#7a4fa0', '#f2c14e'], ['#ff8c1a', '#ffffff'], ['#e86a9a', '#ffffff']]);
line_(-6.2, -2.4, 2.5, 3.1, [['#2c8a7a', '#f2c14e'], ['#d1386b', '#ffcf3a'], ['#ffffff', '#2f6fb0'], ['#f2c14e', '#7a4fa0']]);
line_(-18.4, -15.4, 6.0, -6.0, [['#ffffff', '#e2453c'], ['#2f6fb0', '#f2c14e'], ['#e2453c', '#ffffff']]);
line_(4.6, 8.4, 6.3, -6.6, [['#f2c14e', '#3f9a5a'], ['#e86a9a', '#ffffff'], ['#2f6fb0', '#ffffff']]);
// street clutter: charpais, pots, bicycle, handpump, sacks, bricks, scooter, tyres, rangoli
const cot = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g); add(tbox(0.9, 0.05, 1.9, 1), M.rope, 0, 0.45, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(cyl(0.045, 0.04, 0.45, 6), M.wood, sx * 0.45, 0.22, sz * 0.95, g); for (const s of [-1, 1]) add(tbox(0.07, 0.07, 2.0, 1), M.wood, s * 0.45, 0.46, 0, g); return g; };
cot(-11.0, -4.6, 0.2); cot(9.6, 2.35, 1.5); cot(-24.0, 4.8, 1.4);
const potCluster = (x, z, n = 3) => { const parts = []; for (let i = 0; i < n; i++) parts.push([sph(0.2 - i * 0.02, 10, 8), x + i * 0.32, 0.18 - i * 0.01, z + (i % 2) * 0.2, 0, 0, 0, 1, 0.9, 1]); add(merged(parts), M.clay, 0, 0, 0, world); };
potCluster(-12.8, -4.0); potCluster(3.2, -4.0, 2); potCluster(-19.0, 4.1); potCluster(5.0, 4.2, 4); potCluster(-25.8, -4.0, 2); potCluster(17.0, -4.0, 3);
const bicycle = new THREE.Group(); bicycle.position.set(4.2, 0, -3.95); bicycle.rotation.y = 0.15; world.add(bicycle);
{ for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.33, 0.025, 6, 20), M.black, s * 0.55, 0.35, 0, bicycle); const fp = []; fp.push([cyl(0.02, 0.02, 1.1, 6), 0, 0.55, 0, 0, 0, Math.PI / 2 + 0.2], [cyl(0.02, 0.02, 0.6, 6), -0.2, 0.55, 0, 0, 0, 0.5], [cyl(0.02, 0.02, 0.6, 6), 0.4, 0.62, 0, 0, 0, -0.3]); add(merged(fp), M.red, 0, 0, 0, bicycle); add(box(0.25, 0.05, 0.1), M.black, -0.2, 0.85, 0, bicycle); add(box(0.05, 0.05, 0.5), M.iron, 0.5, 0.95, 0, bicycle); add(box(0.35, 0.03, 0.25), M.iron, -0.65, 0.68, 0, bicycle); }
// hand pump
{ const g = new THREE.Group(); g.position.set(-2.6, 0, 4.4); world.add(g); add(tbox(1.2, 0.15, 1.2, 1), M.stone, 0, 0.07, 0, g); add(cyl(0.08, 0.1, 1.0, 10), C('#3a6fa0'), 0, 0.6, 0, g); add(cyl(0.06, 0.06, 0.3, 8), C('#3a6fa0'), 0.15, 0.95, 0, g).rotation.z = Math.PI / 2; const hdl = add(box(0.7, 0.05, 0.05), C('#3a6fa0'), -0.35, 1.15, 0, g); hdl.rotation.z = 0.3; g.userData.h = hdl; world.userData.pump = g; add(cyl(0.18, 0.2, 0.22, 12), M.steel, 0.3, 0.26, 0.05, g); }
// scooter parked
{ const g = new THREE.Group(); g.position.set(-15.6, 0, 4.3); g.rotation.y = -0.2; world.add(g); for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.2, 0.06, 6, 16), M.black, s * 0.55, 0.22, 0, g); add(merged([[sph(0.35, 12, 8), -0.3, 0.5, 0, 0, 0, 0, 1.3, 0.7, 0.8]]), C('#d23b34'), 0, 0, 0, g); add(box(0.15, 0.7, 0.3), C('#d23b34'), 0.45, 0.6, 0, g); add(box(0.08, 0.05, 0.6), M.iron, 0.5, 1.0, 0, g); add(box(0.5, 0.08, 0.32), M.black, -0.35, 0.78, 0, g); }
// sacks, brick stack, tyres, rangoli in front of doors
add(merged([[sph(0.25, 10, 8), 0, 0.25, 0, 0, 0, 0, 1, 1.2, 0.9], [sph(0.24, 10, 8), 0.45, 0.24, 0.1, 0, 0, 0, 1, 1.2, 0.9], [sph(0.22, 10, 8), 0.2, 0.6, 0.05, 0, 0, 0, 1, 1.1, 0.9]]), C('#d8c08a'), 22.8, 0, -4.2, world);
{ const bp = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) bp.push([box(0.22, 0.07, 0.11), -0.25 + j * 0.24, 0.035 + i * 0.075, (i % 2) * 0.05]); add(merged(bp), C('#b5543a'), -13.8, 0, 5.2, world); add(merged(bp), C('#b5543a'), -14.8, 0, 5.4, world); }
const rangoli = (x, z) => { const [c, g] = cv(256, 256); g.translate(128, 128); const cols = ['#e2453c', '#f2c14e', '#2c8a7a', '#ffffff', '#d1386b']; for (let k = 5; k > 0; k--) { g.fillStyle = cols[k % 5]; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = (k * 22) * (i % 2 ? 0.75 : 1); i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); } const t = P.tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; const m = add(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshToonMaterial({ gradientMap: grad, map: t, transparent: true, alphaTest: 0.3 }), x, 0.02, z, world, { cast: false }); m.rotation.x = -Math.PI / 2; m.userData.ndSkip = true; };
rangoli(-0.6, -2.4); rangoli(-14.6, -2.5); rangoli(7.2, 2.5); rangoli(-20.8, 2.5);
// stray tyres + plastic chairs outside a chai stall (south side, x=-2..-1)
{ const g = new THREE.Group(); g.position.set(-11.4, 0, 4.6); world.add(g); add(tbox(1.6, 0.9, 0.7, 1), M.wood, 0, 0.45, 0, g); add(cyl(0.25, 0.2, 0.3, 12), M.steel, -0.4, 1.05, 0, g); add(cyl(0.05, 0.05, 0.25, 8), M.steel, -0.4, 1.3, 0, g); for (let i = 0; i < 4; i++) add(cyl(0.04, 0.035, 0.08, 8), C('#e9f2f6'), 0.1 + i * 0.12, 0.94, 0.1, g);
  for (const s of [-1, 1]) add(cyl(0.04, 0.04, 2.4, 6), M.wood, s * 0.9, 1.2, 0.5, g); add(tbox(2.2, 0.05, 1.3, 1), texM(clothTex('#2c8a7a', '#ffffff', 0), 2, 1), 0, 2.4, 0.1, g).rotation.x = 0.15;
  signBoard(['CHAI ₹10'], 1.2, 0.35, 0, 2.15, 0.75, 0, { bg: '#ffcf3a', fg: '#c0392b' }, g); world.userData.chai = g; }

// ---------- BANK interior + sign ----------
const BANK = HOUSES.bank.g; // local frame: front z=0 (faces street), interior to z=-6.4
signBoard(['GRAMIN BANK', 'locks: optional'], 3.6, 0.95, 0, 3.15, 0.14, 0, { bg: '#2f6fb0', fg: ['#ffffff', '#ffcf3a'], border: '#ffffff', sizes: [150, 86] }, BANK);
add(tbox(6.0, 1.05, 0.6, 1), M.woodDark, 0, 0.52, -3.0, BANK); add(tbox(6.1, 0.06, 0.7, 1), M.cream, 0, 1.08, -3.0, BANK);
for (let i = -2; i <= 2; i++) add(box(0.04, 0.8, 0.04), M.steel, i * 1.4, 1.5, -3.1, BANK); add(box(6.0, 0.05, 0.05), M.steel, 0, 1.9, -3.1, BANK);
const bankCash = []; for (let i = 0; i < 6; i++) { const c = PROTO.cash.clone(true); c.position.set(-1.6 + i * 0.5, 1.12 + (i % 2) * 0.012, -3.0); c.scale.setScalar(1.6); BANK.add(c); bankCash.push(c); }
// vault: open round door in the back wall
const vault = new THREE.Group(); vault.position.set(1.8, 1.25, -6.18); BANK.add(vault);
add(new THREE.TorusGeometry(0.95, 0.12, 10, 32), M.steel, 0, 0, 0.02, vault); add(new THREE.CircleGeometry(0.9, 32), M.black, 0, 0, 0.0, vault, { cast: false });
const vaultDoor = new THREE.Group(); vaultDoor.position.set(0.95, 0, 0.1); vault.add(vaultDoor);
add(cyl(0.92, 0.92, 0.22, 32), M.steel, -0.92, 0, 0.0, vaultDoor).rotation.x = Math.PI / 2; const wheel = add(new THREE.TorusGeometry(0.3, 0.035, 8, 20), M.brass, -0.92, 0, 0.14, vaultDoor);
for (let i = 0; i < 3; i++) add(box(0.6, 0.04, 0.04), M.brass, -0.92, 0, 0.14, vaultDoor).rotation.z = i * Math.PI / 3; vaultDoor.rotation.y = -1.9; vault.userData.wheel = wheel;
{ const st = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) st.push([box(0.3, 0.12, 0.15), -0.4 + j * 0.38, -0.55 + i * 0.13, -0.2]); add(merged(st), M.money, 0, 0, 0, vault); const gs = []; for (let i = 0; i < 4; i++) gs.push([box(0.22, 0.08, 0.1), -0.3 + (i % 2) * 0.3, -0.12 + Math.floor(i / 2) * 0.09, -0.2]); add(merged(gs), M.gold, 0, 0, 0, vault); }
signBoard(['VAULT', 'please close (or don\'t)'], 1.4, 0.4, 1.8, 2.5, -6.05, 0, { bg: '#f4f1ea', fg: ['#2e211d', '#c0392b'], sizes: [110, 64] }, BANK);
const bankFan = new THREE.Group(); bankFan.position.set(-1.5, 3.4, -4.0); BANK.add(bankFan); for (let i = 0; i < 3; i++) { const pv = new THREE.Group(); pv.rotation.y = i * 2.094; bankFan.add(pv); add(box(0.7, 0.02, 0.13), M.white, 0.4, 0, 0, pv); } add(cyl(0.11, 0.11, 0.1, 12), M.white, 0, 0, 0, bankFan);
add(tbox(0.9, 1.9, 0.5, 1), C('#7a8a9a'), -2.9, 0.95, -5.9, BANK); // filing cabinet
const bankClock = new THREE.Group(); bankClock.position.set(-1.6, 2.7, -6.16); BANK.add(bankClock); add(cyl(0.28, 0.28, 0.06, 24), M.white, 0, 0, 0, bankClock).rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.28, 0.04, 6, 24), M.red, 0, 0, 0.02, bankClock);
const clockHand = add(box(0.03, 0.22, 0.02), M.black, 0, 0.1, 0.05, new THREE.Group()); bankClock.add(clockHand.parent); bankClock.userData.hand = clockHand.parent;
// glass sliding doors (slid fully open)
for (const s of [-1, 1]) { add(box(1.6, 2.4, 0.04), toon({ color: '#bfe6f5', transparent: true, opacity: 0.45 }), s * 2.6, 1.25, 0.1, BANK, { cast: false }); add(tbox(1.64, 0.08, 0.08, 1), M.iron, s * 2.6, 2.45, 0.1, BANK); }

// ---------- SHRINE PLAZA ----------
const SH = new THREE.Group(); SH.position.set(37, 0, 0); world.add(SH);
add(tbox(6.4, 0.95, 6.4, 1.2), M.tileW, 0, 0.475, 0, SH); add(tbox(6.8, 0.12, 6.8, 1.2), M.stone, 0, 0.98, 0, SH);
for (let i = 0; i < 4; i++) add(tbox(2.4, 0.24, 0.5, 1), M.stone, -3.35 - i * 0.45 + 0.4, 0.12 + (3 - i) * 0.24 - 0.24 + 0.0, 0, SH).rotation.y = Math.PI / 2;
// the black stone (svayambhu shila): tall, plain, in the open sun
const stoneG = new THREE.Group(); stoneG.position.set(0, 1.04, 0); SH.add(stoneG);
add(tbox(0.9, 0.25, 0.9, 1), M.stone, 0, 0.12, 0, stoneG);
const shila = add(new THREE.CylinderGeometry(0.24, 0.3, 1.7, 7), M.shrineStone, 0, 1.1, 0, stoneG); shila.scale.z = 0.75;
const oilSheen = add(box(0.05, 1.5, 0.02), toon({ color: '#8a8698' }), -0.1, 1.1, 0.22, stoneG, { cast: false });
const oilStream = add(cyl(0.015, 0.015, 1, 6), toon({ color: '#c79a2a', emissive: '#6a4a10', emissiveIntensity: 0.3 }), 0, 2.2, 0.0, stoneG, { cast: false }); oilStream.visible = false;
add(merged([...Array(14)].map((_, i) => [sph(0.06, 8, 6), Math.cos(i / 14 * 6.283) * 0.4, 0.27, Math.sin(i / 14 * 6.283) * 0.4])), M.marigold, 0, 0, 0, stoneG);
add(merged([...Array(10)].map((_, i) => [sph(0.05, 8, 6), Math.cos(i / 10 * 6.283) * 0.3, 0.22, Math.sin(i / 10 * 6.283) * 0.3])), M.marigold2, 0, 0, 0, stoneG);
// brass oil lamps (diyas) + bell stand + flags
const shrineFlames = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; add(new THREE.SphereGeometry(0.07, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.brass, Math.cos(a) * 0.9, 1.14, Math.sin(a) * 0.9, stoneG); shrineFlames.push(add(new THREE.ConeGeometry(0.025, 0.09, 8), toon({ color: '#ffd23a', emissive: '#ff9a1a', emissiveIntensity: 1.2 }), Math.cos(a) * 0.9, 1.2, Math.sin(a) * 0.9, stoneG, { cast: false })); }
const bellStand = new THREE.Group(); bellStand.position.set(-2.3, 1.04, 2.3); SH.add(bellStand); for (const s of [-1, 1]) add(cyl(0.04, 0.04, 2.0, 8), M.brass, s * 0.5, 1.0, 0, bellStand); add(cyl(0.035, 0.035, 1.1, 8), M.brass, 0, 2.0, 0, bellStand).rotation.z = Math.PI / 2;
const bell = new THREE.Group(); bell.position.set(0, 1.98, 0); bellStand.add(bell); add(cyl(0.08, 0.2, 0.3, 14), M.brass, 0, -0.2, 0, bell); add(sph(0.04, 8, 6), M.brass, 0, -0.38, 0, bell);
const flags = []; for (const [fx, fz] of [[-3, -3], [3, -3], [3, 3], [-3, 3]]) { add(cyl(0.04, 0.05, 5.0, 8), M.wood, fx, 3.5, fz, SH); const fg = new THREE.PlaneGeometry(1.1, 0.7, 6, 4); fg.translate(0.55, 0, 0); const f = add(fg, new THREE.MeshToonMaterial({ gradientMap: grad, color: '#ff8c1a', side: THREE.DoubleSide }), fx, 5.6, fz, SH); f.userData.base = fg.attributes.position.array.slice(); flags.push(f); }
// queue railings (steel) leading to the steps + oil counter shop + shoe stand
const rail = []; for (let i = 0; i < 9; i++) for (const zz of [-0.9, 0.9]) rail.push([cyl(0.035, 0.035, 1.0, 6), -4.0 - i * 1.0, 0.5, zz]); for (const zz of [-0.9, 0.9]) for (const y of [0.55, 1.0]) rail.push([cyl(0.03, 0.03, 8.2, 6), -8.0, y, zz, 0, 0, Math.PI / 2]); add(merged(rail), M.steel, 0, 0, 0, SH);
signBoard(['OIL ₹21', 'flowers • coconuts'], 2.2, 0.7, -6.5, 2.9, -7.6, 0, { bg: '#ff8c1a', fg: ['#ffffff', '#2e211d'], sizes: [140, 80] }, SH);
{ const st = new THREE.Group(); st.position.set(-6.5, 0, -8.3); SH.add(st); add(tbox(3.0, 1.0, 1.0, 1), M.wood, 0, 0.5, 0, st); const pts = []; for (let i = 0; i < 8; i++) pts.push([cyl(0.07, 0.07, 0.16, 10), -1.2 + i * 0.34, 1.08, 0]); add(merged(pts), M.steel, 0, 0, 0, st); const fl = []; for (let i = 0; i < 20; i++) fl.push([sph(0.08, 8, 6), -1.2 + (i % 10) * 0.26, 1.07, 0.3 + Math.floor(i / 10) * 0.15]); add(merged(fl), M.marigold, 0, 0, 0, st); add(merged([[sph(0.15, 10, 8), 1.2, 1.15, -0.2], [sph(0.15, 10, 8), 0.9, 1.15, -0.25]]), C('#7a5434'), 0, 0, 0, st);
  for (const s of [-1, 1]) add(cyl(0.04, 0.04, 2.6, 6), M.wood, s * 1.5, 1.3, 0.5, st); add(tbox(3.4, 0.05, 1.6, 1), texM(clothTex('#f39c12', '#ffffff', 0), 2, 1), 0, 2.6, 0.2, st).rotation.x = 0.1; }
{ const st = new THREE.Group(); st.position.set(-6.0, 0, 8.3); st.rotation.y = Math.PI; SH.add(st); add(tbox(3.0, 1.0, 1.0, 1), M.wood, 0, 0.5, 0, st); const fl = []; for (let i = 0; i < 24; i++) fl.push([sph(0.07, 8, 6), -1.2 + (i % 12) * 0.22, 1.07, -0.2 + Math.floor(i / 12) * 0.25]); add(merged(fl), M.marigold2, 0, 0, 0, st);
  for (const s of [-1, 1]) add(cyl(0.04, 0.04, 2.6, 6), M.wood, s * 1.5, 1.3, 0.5, st); add(tbox(3.4, 0.05, 1.6, 1), texM(clothTex('#d1386b', '#ffffff', 0), 2, 1), 0, 2.6, 0.2, st).rotation.x = 0.1; }
// temple complex wall + gate behind the plaza (the stone itself has NO temple and NO roof)
{ const g = new THREE.Group(); g.position.set(10.5, 0, 0); SH.add(g); const wm = wallM('#f2e1b8', '#c0603a', 41); add(tbox(1.0, 3.2, 26, 2.4), wm, 0, 1.6, 0, g);
  for (const s of [-1, 1]) { add(tbox(1.6, 6.5, 1.6, 2), wm, 0, 3.25, s * 2.2, g); add(new THREE.ConeGeometry(1.1, 1.8, 4), M.saffron, 0, 7.4, s * 2.2, g).rotation.y = Math.PI / 4; }
  add(tbox(1.4, 1.0, 5.0, 2), wm, 0, 5.4, 0, g); for (let i = 0; i < 10; i++) add(sph(0.12, 8, 6), M.marigold, -0.75, 4.85, -2 + i * 0.44, g); }
signBoard(['SHANI SHINGNAPUR', 'open sky • no roof'], 3.4, 1.2, 9.8, 5.4, 0, -Math.PI / 2, { bg: '#ffcf3a', fg: ['#c0392b', '#2e211d'], sizes: [150, 120] }, SH);
// pilgrim footwear pile
add(merged([...Array(16)].map((_, i) => [sph(0.09, 8, 6), -9.5 + (i % 8) * 0.25, 0.05, 2.5 + Math.floor(i / 8) * 0.3, 0, i, 0, 1, 0.5, 1.6])), C('#5a3524'), 0, 0, 0, SH);

// ---------- VILLAGE ARCH (entry) + bus stop + fields ----------
{ const g = new THREE.Group(); g.position.set(-33, 0, 0); world.add(g); const wm = wallM('#f2c4a0', '#c0603a', 51);
  for (const s of [-1, 1]) { add(tbox(1.0, 5.6, 1.0, 2), wm, 0, 2.8, s * 4.3, g); add(new THREE.ConeGeometry(0.75, 1.2, 4), M.saffron, 0, 6.2, s * 4.3, g).rotation.y = Math.PI / 4; }
  add(tbox(1.0, 0.9, 9.6, 2), wm, 0, 5.2, 0, g);
  const sg = signBoard(['SHANI', 'SHINGNAPUR', 'the village with no doors'], 4.4, 1.9, -0.55, 4.9, 0, -Math.PI / 2, { bg: '#ffcf3a', fg: ['#c0392b', '#c0392b', '#2e211d'], sizes: [150, 150, 78] }, g);
  for (let i = 0; i < 16; i++) add(sph(0.11, 8, 6), i % 2 ? M.marigold : M.marigold2, -0.62, 3.85 - Math.sin(i / 15 * Math.PI) * 0.4, -3.75 + i * 0.5, g); }
// fields beyond the arch + sugarcane rows + far hills
const fieldMs = [texM(fieldTex(1, '#7fbf4a'), 6, 6), texM(fieldTex(2, '#e3c26a'), 6, 6), texM(fieldTex(3, '#5fa040'), 6, 6)];
for (let i = 0; i < 9; i++) { const fx = -60 - (i % 3) * 32, fz = -40 + Math.floor(i / 3) * 32; const f = add(new THREE.PlaneGeometry(30, 30), fieldMs[i % 3], fx, 0.004, fz, world, { cast: false }); f.rotation.x = -Math.PI / 2; }
for (let i = 0; i < 6; i++) { const f = add(new THREE.PlaneGeometry(30, 30), fieldMs[(i + 1) % 3], 70 + (i % 2) * 32, 0.004, -30 + Math.floor(i / 2) * 32, world, { cast: false }); f.rotation.x = -Math.PI / 2; }
{ const cane = []; for (let i = 0; i < 160; i++) { const x = -42 - (i % 20) * 0.8, z = 9 + Math.floor(i / 20) * 0.9; cane.push([cyl(0.03, 0.04, 2.2, 5), x, 1.1, z, 0, 0, Math.sin(i) * 0.08]); } add(merged(cane), C('#6fa040'), 0, 0, 0, world); }
for (let i = 0; i < 14; i++) { const a = R() * Math.PI * 2, d = 220 + R() * 160; const h = add(sph(60 + R() * 40, 20, 10), i % 2 ? C('#8fb46a') : C('#a7c07a'), Math.cos(a) * d, -20, Math.sin(a) * d, world, { cast: false }); h.scale.y = 0.45 + R() * 0.2; }
for (let i = 0; i < 6; i++) { const a = R() * Math.PI * 2, d = 520 + R() * 120; add(new THREE.ConeGeometry(160 + R() * 80, 120 + R() * 80, 7), C('#9fb2c8'), Math.cos(a) * d, 50, Math.sin(a) * d, world, { cast: false }); }
// bus stop + auto-rickshaw
{ const g = new THREE.Group(); g.position.set(-40, 0, 5.4); world.add(g); for (const s of [-1, 1]) add(cyl(0.05, 0.05, 2.6, 8), M.steel, s * 1.4, 1.3, 0, g); add(tbox(3.2, 0.08, 1.4, 1), M.blue, 0, 2.6, -0.3, g); add(tbox(2.6, 0.06, 0.4, 1), M.steel, 0, 0.5, -0.3, g); signBoard(['BUS STOP'], 1.4, 0.35, 0, 2.95, 0.3, Math.PI, { bg: '#ffffff', fg: '#2f6fb0' }, g); }
const auto = new THREE.Group(); world.add(auto);
{ const body = C('#f2c14e'), green = C('#2f8f4a'); add(merged([[box(1.5, 0.55, 1.15), -0.1, 0.62, 0]]), green, 0, 0, 0, auto); add(merged([[box(1.2, 0.7, 1.15), -0.25, 1.24, 0]]), body, 0, 0, 0, auto);
  const roofG = new THREE.CylinderGeometry(0.62, 0.62, 1.5, 16, 1, false, 0, Math.PI); add(roofG, C('#24222b'), -0.2, 1.55, 0, auto).rotation.set(Math.PI / 2, 0, Math.PI / 2);
  add(box(0.08, 0.9, 1.0), C('#9fd3f0'), 0.55, 1.2, 0, auto); add(box(0.3, 0.4, 0.5), green, 0.75, 0.55, 0, auto); add(sph(0.08, 8, 6), C('#fff6c8'), 0.92, 0.75, 0, auto); add(box(0.04, 0.04, 0.7), M.iron, 0.7, 1.0, 0, auto);
  auto.userData.wheels = []; for (const [wx, wz] of [[0.75, 0], [-0.75, 0.55], [-0.75, -0.55]]) { const w = add(new THREE.TorusGeometry(0.2, 0.08, 8, 16), M.black, wx, 0.25, wz, auto); auto.userData.wheels.push(w); } }

// ---------- POLICE STATION (rises from an empty plot) ----------
const PS = new THREE.Group(); PS.position.set(-14.4, 0, 3.4); PS.rotation.y = Math.PI; world.add(PS);
const psBody = new THREE.Group(); PS.add(psBody);
{ const wm = wallM('#f4f1ea', '#2b4f8f', 61); add(tbox(6.0, 3.4, 0.22, 2.4), wm, 0, 1.7, -0.11, psBody); add(tbox(6.0, 3.4, 0.22, 2.4), wm, 0, 1.7, -5.9, psBody); for (const s of [-1, 1]) add(tbox(0.22, 3.4, 5.8, 2.4), wm, s * 2.9, 1.7, -3, psBody); add(tbox(6.3, 0.22, 6.3, 2), M.stone, 0, 3.5, -3, psBody);
  add(box(1.3, 2.2, 0.05), C('#3a4a6a'), -1.2, 1.1, 0.02, psBody); // (the station has a door, naturally)
  for (const x of [1.1, 2.1]) add(box(0.7, 0.8, 0.05), M.glassDark, x, 1.7, 0.02, psBody); add(cyl(0.04, 0.04, 2.2, 6), M.steel, 2.6, 4.6, -0.5, psBody); }
const psFlag = (() => { const fg = new THREE.PlaneGeometry(0.9, 0.55, 6, 4); fg.translate(0.45, 0, 0); const [c, g] = cv(96, 64); g.fillStyle = '#ff9933'; g.fillRect(0, 0, 96, 21); g.fillStyle = '#ffffff'; g.fillRect(0, 21, 96, 22); g.fillStyle = '#138808'; g.fillRect(0, 43, 96, 21); g.strokeStyle = '#000080'; g.lineWidth = 2; g.beginPath(); g.arc(48, 32, 8, 0, 7); g.stroke();
  const f = add(fg, new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(c), side: THREE.DoubleSide }), 2.6, 5.4, -0.5, psBody); f.userData.base = fg.attributes.position.array.slice(); return f; })();
const psSign = PROTO.policeSign.clone(true); psSign.position.set(0, 2.85, 0.12); PS.add(psSign);
const psLamp = add(box(0.3, 0.15, 0.3), C('#d23b34'), -2.0, 3.75, -1.0, psBody);
const psScaff = new THREE.Group(); PS.add(psScaff); { const sp = []; for (let i = 0; i < 5; i++) for (const zz of [0.5, -6.4]) sp.push([cyl(0.04, 0.04, 4, 6), -3.2 + i * 1.6, 2, zz]); for (const y of [1.2, 2.6]) for (const zz of [0.5, -6.4]) sp.push([cyl(0.035, 0.035, 6.6, 6), 0, y, zz, 0, 0, Math.PI / 2]); add(merged(sp), C('#c9a86a'), 0, 0, 0, psScaff); }

// clouds (painted far billboards, no ink)
const clouds = [];
{ const r = P.rng(90); for (let i = 0; i < 12; i++) { const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0; pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false })); const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 140 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140); m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); } }

// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.6));
class Card {
  constructor() { const c = document.createElement('canvas'); c.width = CW; c.height = CH; this.c = c; this.g = c.getContext('2d');
    this.t = new THREE.CanvasTexture(c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: false });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    this.anchor = new THREE.Group(); scene.add(this.anchor); scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false; }
  draw(key, fn) { if (key === this.key) return; this.key = key; const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0); fn(g); this.t.needsUpdate = true; }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());
const U = 0.00225; // metres per design px
function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i); c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s * (a.sy || 1), s);
    const yaw = a.fixedYaw ?? (Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0));
    c.mesh.rotation.set(0, yaw, a.roll || 0); c.mat.opacity = a.alpha ?? 1; c.mesh.castShadow = a.shadow !== false; c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? 0) + 0.025, a.z); c.blob.scale.set(0.95 * s, 0.6 * s, 1); }
    // 3D props held by the character: positions in design px relative to the soles (x right, y up), dz toward camera
    c.anchor.position.copy(c.mesh.position); c.anchor.rotation.set(0, yaw, a.roll || 0); c.anchor.updateMatrixWorld();
    for (const pr of a.props || []) { const o = takeProto(pr.m); _v.set((a.flip ? -1 : 1) * pr.x * U * s, pr.y * U * s, (pr.dz ?? 0.06)); c.anchor.localToWorld(_v); o.position.copy(_v);
      o.rotation.set(pr.rx || 0, yaw + (pr.ry || 0), pr.rz || 0); o.scale.setScalar(pr.s || 1); }
  });
}
function drawFx(list) { for (const fx of list) { const o = takeProto(fx.m); o.position.set(fx.x, fx.y, fx.z); o.rotation.set(fx.rx || 0, fx.ry || 0, fx.rz || 0); const s = fx.s ?? 1; o.scale.set(s * (fx.sx || 1), s * (fx.sy || 1), s * (fx.sz || 1)); if (fx.face) o.quaternion.copy(camera.quaternion); } }

// ---------- render targets & post (same ink/DOF contract as the kit) ----------
const RW = W * RES, RH = H * RES;
const rtColor = new THREE.WebGLRenderTarget(RW, RH, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(RW, RH, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(RW, RH, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(RW, RH) }, px: { value: 1.6 }, sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){ vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.; float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.; vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01; if (card && ds > 0.) continue; if (card) ds = 1e4; vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d)); if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9); }
    return e * (1. - smoothstep(140., 520., d)*.8); }
  void main(){ vec3 c = texture2D(col, vUv).rgb; float e = edgeAt(vUv, px); c = mix(c, vec3(.03,.022,.026), e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat); c = c*gain + lift; vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2; c = mix(c, vec3(1.), flash);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(RW, RH) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){ float c0 = coc(vUv); if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.; for (int i=0;i<40;i++){ float fi = float(i); float r = sqrt((fi+.5)/40.); float a = fi*2.39996; vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5); acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` }));
dofScene.children[0].material.toneMapped = false;

// ---------- per-frame state ----------
function applyLight(L) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi; sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0; skyU.stars.value = L.stars || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set('#ffffff'); inkU.lift.value.set('#000000'); lamp.intensity = L.lamp || 0; lamp2.intensity = L.lamp2 || 0;
}
const tmpV = new THREE.Vector3();
function placeSun(L, focus) { const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)); skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 80); sun.target.position.copy(focus); const ext = L.shadowExt || 16, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 200; sc.updateProjectionMatrix(); }

function worldState(S, f) {
  const t = f / 30; skyU.t.value = t;
  fanBlades.rotation.y = -t * 9; bankFan.rotation.y = -t * 7; bankClock.userData.hand.rotation.z = -t * 0.8;
  diyaFlame.scale.y = 1 + 0.25 * Math.sin(t * 17); diyaFlame.position.x = 1.5 + 0.004 * Math.sin(t * 23);
  shrineFlames.forEach((fl, i) => { fl.scale.y = 1 + 0.3 * Math.sin(t * 15 + i * 1.7); });
  laundry.forEach((m) => { const pa = m.geometry.attributes.position, b = m.userData.base; for (let i = 0; i < pa.count; i++) { const y = b[i * 3 + 1]; pa.setZ(i, Math.sin(t * 3.2 + m.userData.ph + b[i * 3] * 4 + y * 2) * 0.07 * (-y + 0.1)); } pa.needsUpdate = true; });
  [...flags, psFlag].forEach((fl, k) => { const pa = fl.geometry.attributes.position, b = fl.userData.base; for (let i = 0; i < pa.count; i++) { const x = b[i * 3]; pa.setZ(i, Math.sin(t * 5 + k + x * 5) * 0.12 * x); } pa.needsUpdate = true; });
  trees.forEach((tr, i) => { tr.rotation.z = 0.012 * Math.sin(t * 1.3 + i); if (tr.userData.fronds) tr.userData.fronds.rotation.y = 0.05 * Math.sin(t * 1.1 + i); });
  crows.forEach((c, i) => { c.rotation.y = 0.5 * Math.sin(t * 0.8 + i * 2) + (i % 2 ? Math.PI : 0); c.children[1].position.y = 0.07 + 0.015 * Math.sin(t * 6 + i); });
  birds.forEach((b, i) => { const a = t * (0.25 + i * 0.03) + i * 0.9, R0 = 9 + i * 3, cx = [0, 37, -14, 14, 0, -25, 30][i]; b.position.set(cx + Math.cos(a) * R0, 11 + i * 1.3 + Math.sin(t + i) * 0.6, Math.sin(a) * R0 * 0.7); b.rotation.y = -a; const fl = Math.sin(t * 9 + i) * 0.6; b.userData.w[0].rotation.x = fl; b.userData.w[1].rotation.x = -fl; });
  chickens.forEach((c, i) => { const a = t * 0.3 + i * 1.7; c.position.set(-9 + i * 1.3 + Math.sin(a) * 0.8, 0, 4.0 + Math.cos(a * 1.3) * 0.5 + (i % 2) * 0.4); c.rotation.y = -a * 1.5; c.userData.head.position.y = 0.3 - Math.max(0, Math.sin(t * 6 + i * 2)) * 0.12; });
  clouds.forEach((c) => c.quaternion.copy(camera.quaternion));
  const pump = world.userData.pump; pump.userData.h.rotation.z = 0.3 + (S.pump ? 0.35 * Math.sin(t * 5) : 0);
  // cow
  const cw = S.cow || { x: 6, z: 1.2, ry: 0, walk: 0 }; cow.position.set(cw.x, 0, cw.z); cow.rotation.y = cw.ry; cow.visible = cw.vis !== false;
  cow.userData.legs.forEach((lg, i) => { lg.rotation.z = cw.walk ? 0.35 * Math.sin(t * 6 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) : 0; });
  cow.userData.head.rotation.z = cw.graze ? -0.6 + 0.1 * Math.sin(t * 2) : 0.08 * Math.sin(t * 1.4); cow.userData.tail.rotation.x = 0.5 * Math.sin(t * 3);
  const dg = S.dog || { x: -5.2, z: 4.6, ry: 0.4 }; dog.position.set(dg.x, 0, dg.z); dog.rotation.y = dg.ry; dog.userData.tail.rotation.x = 0.8 * Math.sin(t * 14); dog.userData.head.position.y = 0.45 + (dg.bark ? 0.04 * Math.abs(Math.sin(t * 12)) : 0);
  // auto-rickshaw
  const au = S.auto || { x: -46, z: 1.4, ry: 0 }; auto.position.set(au.x, au.bump || 0, au.z); auto.rotation.y = au.ry; auto.userData.wheels.forEach((w) => { w.rotation.z = -au.x * 4; }); auto.visible = au.vis !== false;
  // bell swing
  bell.rotation.x = (S.bell || 0) * Math.sin(t * 7);
  // oil pour on the stone
  oilStream.visible = !!S.oil; if (S.oil) { oilStream.scale.y = S.oil; oilStream.position.y = 1.7 + 0.5 + (1 - S.oil) * 0.5; }
  // new house door: open (swung back) -> slams shut
  newDoor.visible = S.door != null; newDoor.rotation.y = S.door != null ? S.door * 1.6 : 0; hasp.rotation.z = 0; newRibbon.visible = !!S.ribbon;
  // police station rises
  const ps = S.police ?? 0; psBody.visible = ps > 0.01; psBody.scale.set(1, Math.max(0.01, ps), 1); psSign.visible = ps > 0.98; psSign.position.y = 2.85 + (S.signDrop || 0); psScaff.visible = ps < 0.995 && ps > 0.01; psLamp.material.color.set(Math.sin(t * 12) > 0 ? '#d23b34' : '#2b4f8f');
  // calendar page, shoe cash, rent sign wobble
  calendar.rotation.x = S.calFlip ? S.calFlip : 0; pillow.position.y = 0.6 + (S.pillow || 0); pillow.rotation.z = (S.pillow || 0) * 0.6; inPane.material.color.set(S.night ? '#1f3a7a' : '#bfe6f5'); inPane.material.emissive.set(S.night ? '#1f3a7a' : '#bfe6f5');
  rentSign.rotation.z = 0.02 * Math.sin(t * 1.7);
  vaultDoor.rotation.y = S.vault ?? -1.9; vault.userData.wheel.rotation.z = t * 0.6;
}

const swapForNd = (on) => { scene.traverse((o) => { if (!o.isMesh) return;
  if (on) { o.userData.mat0 = o.material; if (o.userData.ndSkip || o === sky) { o.userData.vis0 = o.visible; o.visible = false; return; } o.material = o.userData.nd || ndMat; }
  else { o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; } } }); };

window.renderFrame = (f) => {
  const S = shotAt(f), L = lightFor(S, f), Cm = camAt(f);
  applyLight(L);
  camera.position.set(...Cm.pos); camera.up.set(0, 1, 0); camera.lookAt(...Cm.look); camera.rotateZ(rx(Cm.roll || 0)); camera.fov = Cm.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const Ws = worldAt(f); worldState(Ws, f);
  placeSun(L, new THREE.Vector3(...(Cm.shadowAt || Cm.look)));
  resetPools();
  drawActors(actorsAt(f, T), camera); drawFx(fxAt(f));
  sky.position.copy(camera.position);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  const D = dofAt(f); inkU.px.value = 2.5 * RES; inkU.flash.value = Cm.flash || 0; inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf * RES; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
document.fonts.load('100px "Lilita One"').finally(() => { window.ready = true; });
