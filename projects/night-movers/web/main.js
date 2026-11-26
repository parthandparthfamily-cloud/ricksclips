// NIGHT MOVERS: render engine. Inked 3D world + unlit 2D character cards, ink/DOF passes, moving dissolves, TV render-to-texture.
import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import * as ST from './story.js';
import { buildWorld } from './world.js';

const SC = +(new URLSearchParams(location.search).get('s') || 1); // preview scale (0.5 = 540x960)
const W = Math.round(1080 * SC), H = Math.round(1920 * SC);
const canvas = document.getElementById('c'); canvas.width = W; canvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 }, stars: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize, stars; varying vec3 vP;
    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      if (stars > 0.) { vec2 q = vec2(atan(vP.z, vP.x)*120., vP.y*120.); vec2 i = floor(q); float r = h21(i); if (r > .985 && vP.y > .08) { float d = length(fract(q)-.5); c += stars*vec3(1.,.95,.8)*smoothstep(.22,.0,d); } }
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);

// ---------- world ----------
const grad = (() => { const d = new Uint8Array([168, 168, 168, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const WORLD = buildWorld({ THREE, scene, P, T, grad });

// ---------- ink / normal-depth ----------
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `#include <common>
    #include <skinning_pars_vertex>
    varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const ndInst = new THREE.ShaderMaterial({ // for InstancedMesh
  vertexShader: `varying vec3 vN; varying float vD; void main(){ mat4 m = modelMatrix*instanceMatrix; vN = normalize(mat3(viewMatrix*m)*normal); vec4 mv = viewMatrix*m*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});

// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.5));
class Card {
  constructor() {
    this.c = document.createElement('canvas'); this.c.width = CW; this.c.height = CH; this.g = this.c.getContext('2d');
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: false }); // unlit, never fogged: faces stay pure white
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    fn(new T.Pen(g)); this.t.needsUpdate = true;
  }
}
const cards = [];
function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = cards[i] || (cards[i] = new Card());
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.opacity = a.alpha ?? 1; c.mesh.renderOrder = a.order || 2; c.mesh.castShadow = a.shadow !== false;
    if (a.blob !== false) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? a.y) + 0.012, a.z); c.blob.scale.set(0.9 * s, 0.55 * s, 1); }
  });
}

// ---------- passes ----------
const mkPipe = (w, h) => ({ w, h,
  color: new THREE.WebGLRenderTarget(w, h, { samples: 4, type: THREE.HalfFloatType }),
  nd: new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }),
  ink: new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType }) });
const mkOut = (w, h) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType });
const PIPE = mkPipe(W, H), OUT = [mkOut(W, H), mkOut(W, H)];
const TVW = 640, TVH = 400, PIPE_TV = mkPipe(TVW, TVH), OUT_TV = mkOut(TVW, TVH);
OUT_TV.texture.colorSpace = THREE.LinearSRGBColorSpace;
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const VS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
const inkU = { col: { value: null }, nd: { value: null }, res: { value: new THREE.Vector2(W, H) }, px: { value: 2.5 },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.2 }, expo: { value: 1.0 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: VS,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, expo; uniform vec3 lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;
      if (card) ds = 1e4;
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9);
    }
    return e * (1. - smoothstep(140., 520., d)*.8);
  }
  void main(){
    vec4 nd0 = texture2D(nd, vUv); bool isCard = dot(nd0.rgb,nd0.rgb) < .01 && nd0.a > 0.;
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.03,.02,.025), e);
    if (!isCard) { float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat); c = c*gain*expo + lift; } // grade the WORLD only, never the characters
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: null }, nd: { value: null }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
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
const compU = { a: { value: OUT[0].texture }, b: { value: OUT[1].texture }, k: { value: 0 }, flash: { value: 0 }, blurDir: { value: new THREE.Vector2() }, res: { value: new THREE.Vector2(W, H) } };
const compScene = fs(new THREE.ShaderMaterial({ uniforms: compU, vertexShader: VS,
  fragmentShader: `uniform sampler2D a, b; uniform float k, flash; uniform vec2 blurDir, res; varying vec2 vUv;
  vec3 tap(sampler2D t, vec2 uv){ if (dot(blurDir,blurDir) < 1e-6) return texture2D(t, uv).rgb; vec3 s = vec3(0.); for (int i=0;i<12;i++){ float o = float(i)/11.-.5; s += texture2D(t, uv + blurDir*o).rgb; } return s/12.; }
  void main(){ vec3 c = tap(a, vUv); if (k > 0.) c = mix(c, tap(b, vUv), k); c = mix(c, vec3(1.), flash); gl_FragColor = linearToOutputTexel(vec4(c,1.)); }` }));

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh && !o.isInstancedMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || (o.isInstancedMesh ? ndInst : ndMat);
    } else {
      o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

const tmpV = new THREE.Vector3();
function applyLight(L) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0; skyU.stars.value = L.stars || 0;
  inkU.sat.value = L.sat ?? 1.08; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000'); inkU.vig.value = L.vig ?? 0.2; inkU.expo.value = L.expo ?? 1.2;
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)); skyU.sunDir.value.copy(tmpV);
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  sun.position.copy(focus).addScaledVector(tmpV, 60); sun.target.position.copy(focus);
  const ext = L.shadowExt || 14, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix();
}

// render one view (set + camera + actors) into `out`
function renderView(f, V, pipe, out, Wstate) {
  WORLD.show(V.sets);
  const L = ST.LIGHTS[V.light]; applyLight(L);
  const C = V.cam;
  camera.aspect = pipe.w / pipe.h; camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  placeSun(L, new THREE.Vector3(...(V.shadowAt || C.look)));
  drawActors(ST.actorsAt(f, V, T), camera);
  sky.position.copy(camera.position);
  renderer.setRenderTarget(pipe.color); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(pipe.nd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  inkU.col.value = pipe.color.texture; inkU.nd.value = pipe.nd.texture; inkU.res.value.set(pipe.w, pipe.h); inkU.px.value = 2.5 * pipe.h / 1920 * (pipe === PIPE_TV ? 2.2 : 1);
  renderer.setRenderTarget(pipe.ink); renderer.render(inkScene, fsCam);
  const D = V.dof || { focus: 5, cinf: 0 };
  dofU.src.value = pipe.ink.texture; dofU.nd.value = pipe.nd.texture; dofU.res.value.set(pipe.w, pipe.h);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf * pipe.h / 1920; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(out); renderer.render(dofScene, fsCam);
}

window.renderFrame = (f) => {
  const FR = ST.frameAt(f);
  const Ws = ST.worldAt(f); WORLD.update(f, Ws);
  // TV picture first (rendered from its own camera into a texture shown on the restaurant TV)
  if (FR.tv) { WORLD.tvScreen(null); renderView(f, FR.tv, PIPE_TV, OUT_TV, Ws); WORLD.tvScreen(OUT_TV.texture, FR.tv.screen); }
  else WORLD.tvScreen(null, FR.tvOff);
  FR.views.forEach((V, i) => renderView(f, V, PIPE, OUT[i], Ws));
  compU.k.value = FR.views.length > 1 ? FR.mix : 0; compU.flash.value = FR.flash || 0;
  compU.blurDir.value.set(...(FR.blur || [0, 0]));
  renderer.setRenderTarget(null); renderer.render(compScene, fsCam);
  return true;
};
window.TOTAL = ST.TOTAL;
window.ready = true;
