// Framing gate: projects every visible actor's face each frame; flags cropped faces, over-zoom (face > 45% width), and faces hidden at edges.
import * as THREE from './web/lib/three.module.js';
const ST = await import('./web/story.js');
const cam = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.05, 1500), v = new THREE.Vector3();
const bad = {}; const step = +(process.argv[2] || 3);
for (let f = 0; f < ST.TOTAL; f += step) {
  const FR = ST.frameAt(f); const V = FR.views[FR.views.length - 1]; if (FR.views.length > 1 && FR.mix < 0.5) continue;
  const C = V.cam; cam.position.set(...C.pos); cam.up.set(0, 1, 0); cam.lookAt(...C.look); cam.rotateZ(C.roll * Math.PI / 180); cam.fov = C.fov; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const acts = V.actors ? V.actors(f / 30, f).filter((a) => !(a.x && a.x.hide) && !(a.x && a.x.roll)) : [];
  for (const a of acts) {
    const o = V.setOrigin, sit = a.o.pose === 'sit'; const hy = sit ? 0.79 : 1.49;
    v.set(a.p[0] + o[0], a.p[1] + o[1] + hy, a.p[2] + o[2]); const d = v.distanceTo(cam.position); v.project(cam);
    if (v.z > 1) continue;
    const r = 0.27 / (d * Math.tan(C.fov * Math.PI / 360)) ; // head radius in NDC (vertical units)
    const rx = r / (1080 / 1920); // horizontal NDC
    const inView = Math.abs(v.x) < 1 + rx && Math.abs(v.y) < 1 + r;
    if (!inView) continue;
    const issues = [];
    if (Math.abs(v.x) + rx * 0.6 > 1 || v.y + r * 0.8 > 1 || v.y - r * 0.8 < -1) issues.push('crop');
    if (rx > 0.45) issues.push('zoom' + (rx).toFixed(2));
    if (issues.length) { const k = V.shot.id + ' ' + a.who; (bad[k] = bad[k] || []).push(`${f}:${issues.join('/')}`); }
  }
}
for (const k in bad) console.log(k.padEnd(28), bad[k].length, bad[k].slice(0, 4).join(' '), bad[k].length > 4 ? '... ' + bad[k][bad[k].length - 1] : '');
