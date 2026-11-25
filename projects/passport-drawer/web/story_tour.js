// set tour for checking sets: frame i = view i
const day = { az: 130, el: 50, sky: '#cfe2f6', ground: '#b89a72', hemi: 1.25, sun: '#fff3df', sunI: 2.2, fog: '#d6e6f4', fogNear: 250, fogFar: 2200, skyTop: '#3f86d8', skyHor: '#cfe6f6', sat: 1.1, shadowExt: 30 };
const inside = { ...day, hemi: 1.55, sunI: 1.4, el: 70, shadowExt: 16 };
const V = [
  ['runway', [14, 4, 40], [0, 4, 0], 50, day],
  ['runway', [-20, 30, 300], [0, 10, -400], 50, day],
  ['cabin', [0, 1.5, 2.5], [-1.3, 1.1, -1], 55, inside],
  ['terminal', [6, 2.2, 12], [-6, 2.5, -12], 55, inside],
  ['terminal', [-3, 2.0, -22], [-4, 1.6, -34], 50, inside],
  ['mall', [10, 3, 18], [-4, 4, -6], 55, inside],
  ['mall', [0, 3, 0], [0, 14, -6], 70, inside],
  ['office', [2.5, 1.6, 3.2], [0, 1.0, -1.5], 55, inside],
  ['office', [0.6, 1.4, -3.4], [0.9, 0.7, -1.2], 50, inside],
  ['yard', [-25, 1.6, 4.6], [-25, 1.3, -4], 62, inside],
  ['yard', [-6, 2.0, 30], [10, 3, 8], 55, day],
  ['yard', [10, 3, 8], [40, 8, -45], 55, day],
  ['yard', [0, 2.2, 36], [0, 2.5, 50], 55, day],
  ['village', [10, 3, 22], [0, 4, 0], 55, day],
  ['village', [24, 1.7, 12], [24, 1.2, 6], 55, day],
  ['archive', [0, 1.8, 3.2], [0, 1.4, 0], 50, inside],
];
export const TOTAL = V.length;
export const frameAt = (f) => { const [set, pos, look, fov, light] = V[f]; return { a: { set, cam: { pos, look, fov }, light, world: { gate: 0.3, drawer: 0.7, cop: [0, 30], poster: 1, web: 1, spider: 0.5, tape: 0.5, shutter: 0.5 }, actors: [], fx: [], dof: { focus: 8, cinf: 0 } } }; };
