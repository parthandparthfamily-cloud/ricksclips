// Canvas textures the 3D world uses (signs, coin faces, money...). Each entry returns a canvas; Blender loads them from data/tex/<name>.png.
// Missing textures fall back to plain colours, so this file can stay empty.
const C = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; };
export const TEXTURES = {
  coin: () => C(256, 256, (g, w, h) => { g.fillStyle = '#e0ac3a'; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, 7); g.fill();
    g.fillStyle = '#a8731c'; g.font = 'bold 150px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', w / 2, h / 2 + 8); }),
};
