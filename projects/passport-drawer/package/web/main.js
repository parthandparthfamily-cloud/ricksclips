// Engine for "The Dream Job That Keeps Your Passport".
// One scene, several sets (groups) toggled per shot; 2D character cards (characters/rick.js, unlit = pure white faces)
// inside inked 3D sets; every FX is pooled 3D geometry. Post: ink (normal/depth edges) + grade, lens blur, moving dissolves, whip blur.
// ?s=0.25 renders a low-res proxy (QA gate / previews). window.renderFrame(f) draws frame f.
import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as K from './kit3d.js';
import { buildSets } from './sets.js';

const Q = new URLSearchParams(location.search), SC = +(Q.get('s') || 1);
const W = Math.round(1080 * SC), H = Math.round(1920 * SC);
await K.loadFonts();
const ST = await import('./' + (Q.get('story') || 'story') + '.js');
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 2500);
const rx = (a) => a * Math.PI / 180;

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
sky.userData.ndSkip = true; sky.renderOrder = -2; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
const fill = new THREE.DirectionalLight('#ffffff', 0.5); scene.add(fill); scene.add(fill.target);
scene.fog = new THREE.Fog('#ffffff', 60, 900);

// ---------- world ----------
const SETS = buildSets(THREE, scene, K, T);
const fxPool = K.makeFxPool(THREE, scene);

// ---------- cards ----------
const CW = Math.round(1200 * Math.min(1, SC * 2)), CH = Math.round(2000 * Math.min(1, SC * 2)), CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = K.tex(K.radial('20,14,30', 0.5));
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});
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
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    fn(g); this.t.needsUpdate = true;
  }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());
// cards are keyed per character id so the same character keeps its canvas between frames
const cardFor = new Map();
function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; c.used = false; });
  const free = () => { let i = 0; while (cards[i] && cards[i].used) i++; return getCard(i); };
  for (const a of list) {
    let c = cardFor.get(a.id); if (!c || c.used) { c = free(); cardFor.set(a.id, c); }
    c.used = true; c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), 0); c.mesh.rotateZ(rx(a.roll || 0));
    c.mat.opacity = a.alpha ?? 1; c.mat.transparent = true;
    c.mesh.castShadow = a.shadow !== false; c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? 0) + 0.015, a.z); c.blob.scale.set(0.9 * s, 0.55 * s, 1); }
  }
}

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const rtOut = [0, 1].map(() => new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }));
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const VS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 2.5 * SC },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.2 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: VS,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig; uniform vec3 lift, gain; varying vec2 vUv;
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
    return e * (1. - smoothstep(160., 700., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb; float e = edgeAt(vUv, px);
    c = mix(c, vec3(.03,.02,.025), e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat); c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: VS,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = vec4(texture2D(src, vUv).rgb, 1.); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<40;i++){ float fi = float(i); float r = sqrt((fi+.5)/40.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = vec4(acc/max(wsum,1e-3), 1.); }` }));
const finU = { a: { value: rtOut[0].texture }, b: { value: rtOut[1].texture }, mixT: { value: 0 }, blurA: { value: new THREE.Vector2() }, blurB: { value: new THREE.Vector2() } };
const finScene = fs(new THREE.ShaderMaterial({ uniforms: finU, vertexShader: VS, toneMapped: false,
  fragmentShader: `uniform sampler2D a, b; uniform float mixT; uniform vec2 blurA, blurB; varying vec2 vUv;
  vec3 tap(sampler2D t, vec2 d){ if (dot(d,d) < 1e-8) return texture2D(t, vUv).rgb; vec3 s = vec3(0.); for (int i=0;i<12;i++){ float k = float(i)/11. - .5; s += texture2D(t, vUv + d*k).rgb; } return s/12.; }
  void main(){ vec3 c = tap(a, blurA); if (mixT > 0.) c = mix(c, tap(b, blurB), mixT); gl_FragColor = linearToOutputTexel(vec4(c,1.)); }` }));

// ---------- per-frame ----------
const tmpV = new THREE.Vector3();
function applyLight(L, focus) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI; sun.castShadow = L.shadow !== false;
  fill.color.set(L.fill || '#ffffff'); fill.intensity = L.fillI ?? 0.45;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = (L.sat ?? 1.08) * 1.22; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000'); inkU.vig.value = L.vig ?? 0.2;
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV); sun.position.copy(focus).addScaledVector(tmpV, 90); sun.target.position.copy(focus);
  fill.position.copy(focus).add(new THREE.Vector3(-tmpV.x, 0.6, -tmpV.z).multiplyScalar(50)); fill.target.position.copy(focus);
  const ext = L.shadowExt || 25, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 260; sc.updateProjectionMatrix();
}
const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh && !o.isInstancedMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else { o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; } }
  });
};
function renderState(st, f, target) {
  const SET = SETS[st.set], O = SET.origin, add3 = (p) => [p[0] + O[0], p[1] + O[1], p[2] + O[2]];
  for (const [k, s] of Object.entries(SETS)) s.group.visible = k === st.set || SET.uses.includes(k);
  if (Q.get('nodesert')) SETS.desert.group.visible = false;
  const C = st.cam, pos = add3(C.pos), look = add3(C.look);
  camera.position.set(...pos); camera.up.set(0, 1, 0); camera.lookAt(...look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  applyLight(st.light, new THREE.Vector3(...add3(C.shadowAt || C.look)));
  SET.update(f, st.world || {}, camera); for (const u of SET.uses) SETS[u].update(f, st.world || {}, camera);
  if (Q.get('nofx')) st = { ...st, fx: [] }; if (Q.get('noact')) st = { ...st, actors: [] };
  fxPool.place((st.fx || []).map((x) => ({ ...x, p: add3(x.p) })), camera);
  drawActors((st.actors || []).map((a) => ({ ...a, x: a.x + O[0], y: a.y + O[1], z: a.z + O[2], ground: (a.ground ?? 0) + O[1] })), camera);
  sky.position.copy(camera.position);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  const D = st.dof || { focus: 10, cinf: 0 };
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf * SC; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(target); renderer.render(dofScene, fsCam);
}
window.renderFrame = (f) => {
  const fr = ST.frameAt(f); // { a: state, b?: state, t?: 0..1 }
  renderState(fr.a, f, rtOut[0]);
  finU.blurA.value.set(...(fr.a.cam.blur || [0, 0]));
  finU.mixT.value = 0;
  if (fr.b) { renderState(fr.b, f, rtOut[1]); finU.mixT.value = fr.t; finU.blurB.value.set(...(fr.b.cam.blur || [0, 0])); }
  renderer.setRenderTarget(null); renderer.render(finScene, fsCam);
  return true;
};
window.TOTAL = ST.TOTAL;
window.ready = true;
