// Browser side of the Blender export. Needs story.js (your timeline), toon.js (built cast) and textures.js (optional canvas textures).
import * as T from './toon.js';
import { TOTAL, SHOTS, XF, shotAt, camAt, dofAt, actorsAt } from './story.js';
import { TEXTURES } from './textures.js';
const CW = 960, CH = 1600;
const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const g = cv.getContext('2d');
const seen = new Map();
window.TOTAL = TOTAL;
window.texture = (name) => TEXTURES[name]().toDataURL('image/png');
window.textureNames = Object.keys(TEXTURES);
const state = (f, sid, newCards) => {
  const C = camAt(f, sid), D = dofAt(f, sid), list = actorsAt(f, T, sid), out = [];
  for (const a of list) {
    let id = seen.get(a.key);
    if (id === undefined) { id = seen.size; seen.set(a.key, id);
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0); a.draw({ g });
      newCards.push([id, cv.toDataURL('image/webp', 0.9)]); }
    out.push({ id, who: JSON.parse(a.key)[0], x: a.x, y: a.y, z: a.z, s: a.s || 1 });
  }
  return { sid, set: (SHOTS.find((x) => x.id === sid) || {}).set, cam: { pos: C.pos, look: C.look, fov: C.fov, roll: C.roll || 0 }, dof: D, actors: out };
};
// moving dissolve: the last XF frames of a shot also carry the NEXT shot's state; Blender renders both and mixes them
window.exportFrame = (f) => {
  const newCards = [], S = shotAt(f), r = { f, ...state(f, S.id, newCards) }, i = SHOTS.indexOf(S);
  if (i < SHOTS.length - 1 && f > S.b - XF) { const w = (f - (S.b - XF)) / (XF + 1); r.blend = { w, ...state(f, SHOTS[i + 1].id, newCards) }; }
  r.newCards = newCards; return r;
};
window.ready = true;
