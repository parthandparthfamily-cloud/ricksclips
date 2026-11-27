// ---------- "The Village Built For An Audience" cast: new outfits/hats/props in the locked Ricks look ----------
// (concatenated into toon.js after rick.js, so rick.js helpers P, fillLine, ell, line, qc, sup, softShade, inkRing, clip, mulc, FC are in scope)

// ROK woodland camo: green base with brown/dark blobs, name tape, flag patch, belt
OUTFIT.camo = (g, b, o) => {
  const c = o.top ?? "#6f8a4a"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  const r = ((s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296))(o.seed ?? 7);
  const cols = ["#4d6234", "#7c6343", "#3a3a2c", "#93a45f"];
  for (let i = 0; i < 26; i++) { const x = b.x0 - 10 + r() * (b.w + 20), y = b.y0 - 10 + r() * (b.h + 20); ell(g, x, y, 10 + r() * 16, 6 + r() * 9, cols[i % 4], 0, r() * 3); }
  line(g, qc([b.cx - 30, b.y0 - 6], [b.cx, b.y0 + 30], [b.cx + 30, b.y0 - 6]), 4);
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 8, b.y0 + 2], [b.cx + s * 40, b.y0 - 8], [b.cx + s * 34, b.y0 + 30]]); fillLine(g, mulc(c, 0.85), 3); }
  // name tape + flag patch
  P(g, [[b.cx + 14, b.y0 + 58], [b.cx + 54, b.y0 + 58], [b.cx + 54, b.y0 + 72], [b.cx + 14, b.y0 + 72]]); fillLine(g, "#efe6c8", 2.5);
  for (let i = 0; i < 4; i++) line(g, [[b.cx + 20 + i * 9, b.y0 + 65], [b.cx + 25 + i * 9, b.y0 + 65]], 2.4, "#2b2a24");
  if (!o.noPatch) { P(g, [[b.cx - 56, b.y0 + 52], [b.cx - 22, b.y0 + 52], [b.cx - 22, b.y0 + 76], [b.cx - 56, b.y0 + 76]]); fillLine(g, "#ffffff", 2.5); ell(g, b.cx - 39, b.y0 + 64, 7, 7, "#d8343a", 0); P(g, [[b.cx - 46, b.y0 + 64], [b.cx - 32, b.y0 + 64], [b.cx - 32, b.y0 + 70], [b.cx - 46, b.y0 + 70]]); g.fillStyle = "#2c56b3"; g.fill(); }
  // pockets + belt
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 14, b.y0 + 96], [b.cx + s * 50, b.y0 + 96], [b.cx + s * 50, b.y0 + 132], [b.cx + s * 14, b.y0 + 132]]); fillLine(g, mulc(c, 0.92), 2.5); line(g, [[b.cx + s * 14, b.y0 + 106], [b.cx + s * 50, b.y0 + 106]], 2.5); }
  g.fillStyle = "#2f2c25"; g.fillRect(b.x0 - 20, b.y1 - 56, b.w + 40, 16); P(g, [[b.cx - 10, b.y1 - 58], [b.cx + 10, b.y1 - 58], [b.cx + 10, b.y1 - 38], [b.cx - 10, b.y1 - 38]]); fillLine(g, "#c9b37a", 2.5);
};
// North Korean grey-blue work jacket (sweepers)
OUTFIT.workjacket = (g, b, o) => {
  const c = o.top ?? "#6a7f95"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 - 6], [b.cx + s * 44, b.y0 - 10], [b.cx + s * 30, b.y0 + 34]]); fillLine(g, mulc(c, 0.84), 3); }
  line(g, [[b.cx, b.y0 + 4], [b.cx, b.y1 + 10]], 3); for (const k of [40, 80, 120, 160]) ell(g, b.cx + 10, b.y0 + k, 4.5, 4.5, "#2b2a2a", 0);
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 18, b.y0 + 128], [b.cx + s * 52, b.y0 + 128], [b.cx + s * 52, b.y0 + 168], [b.cx + s * 18, b.y0 + 168]]); fillLine(g, mulc(c, 0.9), 2.5); }
  if (o.badge) { ell(g, b.cx - 34, b.y0 + 58, 10, 10, "#d8343a", 2.5); ell(g, b.cx - 34, b.y0 + 58, 4, 4, "#f2c14e", 0); }
};
// North Korean olive uniform (flag guards, announcer) with red collar tabs and gold buttons
OUTFIT.olive = (g, b, o) => {
  const c = o.top ?? "#7c7a46"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 - 4], [b.cx + s * 46, b.y0 - 8], [b.cx + s * 26, b.y0 + 30]]); fillLine(g, mulc(c, 0.86), 3); P(g, [[b.cx + s * 22, b.y0 + 6], [b.cx + s * 40, b.y0 + 2], [b.cx + s * 34, b.y0 + 16]]); fillLine(g, "#c8262f", 2); }
  for (const k of [40, 80, 120, 160]) ell(g, b.cx, b.y0 + k, 5, 5, "#e5c158", 2.2);
  g.fillStyle = "#4a3b26"; g.fillRect(b.x0 - 20, b.y1 - 60, b.w + 40, 15); P(g, [[b.cx - 12, b.y1 - 62], [b.cx + 12, b.y1 - 62], [b.cx + 12, b.y1 - 43], [b.cx - 12, b.y1 - 43]]); fillLine(g, "#e5c158", 2.5);
  if (o.medals) for (let i = 0; i < 3; i++) { P(g, [[b.cx - 56 + i * 12, b.y0 + 50], [b.cx - 46 + i * 12, b.y0 + 50], [b.cx - 46 + i * 12, b.y0 + 62], [b.cx - 56 + i * 12, b.y0 + 62]]); fillLine(g, ["#d8343a", "#2c56b3", "#e5c158"][i], 1.8); ell(g, b.cx - 51 + i * 12, b.y0 + 72, 5, 5, "#e5c158", 2); }
};
// grandma's quilted vest over a pink blouse with a long skirt
OUTFIT.quilt = (g, b, o) => {
  g.fillStyle = o.shirt ?? "#e9a3b8"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  const v = o.top ?? "#6d4f9a";
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 10, b.y0 - 20], [b.cx + s * 90, b.y0 - 20], [b.cx + s * 90, b.y0 + 150], [b.cx + s * 14, b.y0 + 150]]); fillLine(g, v, 3); clip(g, [[b.cx + s * 10, b.y0 - 20], [b.cx + s * 90, b.y0 - 20], [b.cx + s * 90, b.y0 + 150], [b.cx + s * 14, b.y0 + 150]], () => { for (let k = 0; k < 8; k++) line(g, [[b.cx + s * 10, b.y0 + k * 22], [b.cx + s * 90, b.y0 + k * 22 - 8]], 2, mulc(v, 0.75)); }); }
  g.fillStyle = o.skirt ?? "#3c6aa8"; g.fillRect(b.x0 - 20, b.y0 + 150, b.w + 40, 120); line(g, [[b.x0 - 20, b.y0 + 150], [b.x1 + 20, b.y0 + 150]], 3);
  for (let i = -2; i <= 2; i++) line(g, [[b.cx + i * 22, b.y0 + 160], [b.cx + i * 28, b.y1 + 10]], 2.2, mulc(o.skirt ?? "#3c6aa8", 0.75));
};

// K-style kevlar helmet with a woodland cover and a strap band
HATS.kevlar = (g, cx, cy, o) => { const c = o.hatCol ?? "#62793f"; g.save(); g.translate(cx, cy - 6); g.rotate((o.hatTilt ?? -4) * D2R);
  const d = [[-108, -64], ...qc([-108, -64], [-112, -176], [0, -172]), ...qc([0, -172], [112, -176], [108, -64]), ...qc([108, -64], [0, -80], [-108, -64])];
  softShade(g, d, 0, -120, 105, c, mulc(c, 0.68));
  clip(g, d, () => { const cols = ["#3f512a", "#7a6242", "#2f3326"]; for (let i = 0; i < 12; i++) ell(g, -90 + (i * 47) % 180, -150 + (i * 31) % 80, 20, 11, cols[i % 3], 0, i); g.fillStyle = "#3a3b2c"; g.fillRect(-120, -100, 240, 14); });
  inkRing(g, d, 10, 0.3, Math.PI * 0.5, FC); line(g, qc([-104, -66], [0, -84], [104, -66]), 7, FC); g.restore(); };
// patrol cap (sergeant): flat-topped soft cap with a short brim + rank bar
HATS.patrol = (g, cx, cy, o) => { const c = o.hatCol ?? "#5d7540"; g.save(); g.translate(cx, cy - 10); g.rotate(-3 * D2R);
  const top = [[-84, -66], [-90, -150], ...qc([-90, -150], [0, -158], [90, -150]), [84, -66]]; softShade(g, top, 0, -110, 95, c, mulc(c, 0.7));
  clip(g, top, () => { for (let i = 0; i < 9; i++) ell(g, -80 + i * 22, -130 + (i % 3) * 22, 14, 8, ["#41532c", "#7a6242"][i % 2], 0, i); });
  inkRing(g, top, 9, 0.3, Math.PI * 0.5, FC);
  P(g, [[-12, -124], [12, -124], [12, -100], [-12, -100]]); fillLine(g, "#141414", 2.5); for (const y of [-118, -110]) line(g, [[-8, y], [8, y]], 2.5, "#e5c158");
  const vis = [...qc([-72, -68], [0, -76], [72, -68]), ...qc([72, -68], [0, -46], [-72, -68])]; softShade(g, vis, 0, -60, 70, mulc(c, 0.85), mulc(c, 0.55)); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
// North Korean worker cap (soft cloth cap, grey-blue)
HATS.nkcap = (g, cx, cy, o) => { const c = o.hatCol ?? "#55687d"; g.save(); g.translate(cx, cy - 10); g.rotate(-6 * D2R);
  const top = [[-88, -66], ...qc([-88, -66], [-100, -140], [0, -138]), ...qc([0, -138], [100, -140], [88, -66])]; softShade(g, top, 0, -110, 95, c, mulc(c, 0.7));
  clip(g, top, () => { for (let i = -3; i <= 3; i++) line(g, [[i * 26, -140], [i * 30, -66]], 2, mulc(c, 0.8)); }); inkRing(g, top, 9, 0.3, Math.PI * 0.5, FC);
  const vis = [...qc([-70, -68], [10, -78], [84, -66]), ...qc([84, -66], [16, -44], [-70, -68])]; softShade(g, vis, 0, -60, 70, mulc(c, 0.9), mulc(c, 0.6)); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
// peaked officer cap: wide olive crown, red band, gold star badge, black visor
HATS.peaked = (g, cx, cy, o) => { const c = o.hatCol ?? "#7c7a46"; g.save(); g.translate(cx, cy - 12);
  const band = [[-80, -64], [-82, -104], [82, -104], [80, -64]]; P(g, band); fillLine(g, "#c8262f", 0);
  const crown = [[-82, -100], ...qc([-82, -100], [-150, -150], [-40, -168]), ...qc([-40, -168], [0, -172], [40, -168]), ...qc([40, -168], [150, -150], [82, -100])];
  softShade(g, crown, 0, -140, 120, c, mulc(c, 0.66)); inkRing(g, crown, 9, 0.3, Math.PI * 0.5, FC); P(g, band); fillLine(g, null, 7, FC);
  ell(g, 0, -112, 17, 17, "#e5c158", 4); const st = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4.5 : 11; st.push([Math.cos(a) * r, -112 + Math.sin(a) * r]); } P(g, st); fillLine(g, "#c8262f", 0);
  const vis = [...qc([-74, -66], [0, -74], [74, -66]), ...qc([74, -66], [0, -40], [-74, -66])]; softShade(g, vis, 0, -58, 70, "#1b1b1f", "#0b0b0e"); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
// tourist sun hat
HATS.sunhat = (g, cx, cy, o) => { const c = o.hatCol ?? "#f0d27a"; g.save(); g.translate(cx, cy - 26);
  const br = sup(0, -46, 168, 26, 2, 2); softShade(g, br, 0, -46, 160, c, mulc(c, [0.85, 0.78, 0.66])); inkRing(g, br, 8, 0.3, Math.PI * 0.5, FC);
  const cr = [[-80, -50], ...qc([-80, -50], [-86, -150], [0, -146]), ...qc([0, -146], [86, -150], [80, -50])]; softShade(g, cr, 0, -100, 90, c, mulc(c, 0.75)); clip(g, cr, () => { g.fillStyle = o.band ?? "#e0475a"; g.fillRect(-100, -82, 200, 22); }); inkRing(g, cr, 9, 0.3, Math.PI * 0.5, FC); g.restore(); };

// props
PROPS.binos = (g, x, y) => { for (const s of [-1, 1]) { P(g, sup(x + s * 17, y - 10, 15, 26, 3, 3)); fillLine(g, "#2b2f2a", 4, FC); ell(g, x + s * 17, y - 36, 13, 6, "#8fc3e6", 3, 0); } P(g, [[x - 6, y - 18], [x + 6, y - 18], [x + 6, y - 2], [x - 6, y - 2]]); fillLine(g, "#4a4f45", 2.5, FC); };
PROPS.broom = (g, x, y) => { line(g, [[x, y - 150], [x + 10, y + 150]], 9); line(g, [[x, y - 150], [x + 10, y + 150]], 5, "#b88a4d"); P(g, [[x - 8, y + 140], [x + 28, y + 140], [x + 50, y + 214], [x - 34, y + 214]]); fillLine(g, "#d7b05a", 4, FC); for (let i = 0; i < 7; i++) line(g, [[x - 4 + i * 4, y + 150], [x - 26 + i * 11, y + 210]], 2, "#9a7a36"); };
PROPS.mic = (g, x, y) => { line(g, [[x, y + 10], [x + 4, y - 30]], 10); line(g, [[x, y + 10], [x + 4, y - 30]], 6, "#3a3d44"); ell(g, x + 5, y - 46, 15, 17, "#9aa3ad", 4); for (let i = -1; i <= 1; i++) line(g, [[x - 6, y - 46 + i * 7], [x + 16, y - 46 + i * 7]], 1.6, "#5a626b"); };
PROPS.camera = (g, x, y) => { P(g, [[x - 30, y - 22], [x + 30, y - 22], [x + 30, y + 18], [x - 30, y + 18]]); fillLine(g, "#2d2f36", 4, FC); ell(g, x, y - 2, 15, 15, "#5d7fa8", 4); ell(g, x - 3, y - 6, 5, 4, "#dff1ff", 0); P(g, [[x + 12, y - 30], [x + 26, y - 30], [x + 26, y - 22], [x + 12, y - 22]]); fillLine(g, "#2d2f36", 2.5, FC); };
PROPS.duffel = (g, x, y) => { P(g, sup(x, y + 30, 52, 26, 2.2, 2.2)); fillLine(g, "#5f6f3c", 4, FC); line(g, [[x - 40, y + 30], [x + 40, y + 30]], 3, "#3f4a28"); line(g, qc([x - 20, y + 6], [x, y - 14], [x + 20, y + 6]), 5); };
PROPS.paper = (g, x, y) => { P(g, [[x - 26, y - 36], [x + 26, y - 36], [x + 26, y + 30], [x - 26, y + 30]]); fillLine(g, "#fbf6e8", 3.5, FC); for (let i = 0; i < 5; i++) line(g, [[x - 16, y - 24 + i * 11], [x + 16 - (i % 2) * 8, y - 24 + i * 11]], 2.4, "#8a8a9a"); };
PROPS.mug = (g, x, y) => { P(g, [[x - 16, y - 22], [x + 16, y - 22], [x + 14, y + 18], [x - 14, y + 18]]); fillLine(g, "#e9eef2", 3.5, FC); ell(g, x + 20, y - 2, 9, 11, null, 4); g.fillStyle = "#2c56b3"; g.fillRect(x - 15, y - 8, 30, 8); };

// helper: draw a cast member centred on the card (600x1000 design, soles at y=975)
const CAST_SCALE = 1.25;
PROPS.mallet = (g, x, y) => { line(g, [[x, y + 20], [x + 6, y - 70]], 10); line(g, [[x, y + 20], [x + 6, y - 70]], 6, "#b88a4d"); P(g, [[x - 30, y - 96], [x + 42, y - 96], [x + 42, y - 62], [x - 30, y - 62]]); fillLine(g, "#8a5a34", 4, FC); };
export const castDraw = (p, o, opts) => { const g = p.g; g.save(); g.translate(300, 975); g.scale(CAST_SCALE, CAST_SCALE);
  if (opts.binoEyes) opts = { ...opts, L: 'mouth', R: 'mouth' };
  rick(g, o, opts);
  if (opts.binoEyes) { const hy = -542 - 10; g.save(); if (opts.headTilt) { g.translate(0, -542 + 90); g.rotate(opts.headTilt * D2R); g.translate(0, 542 - 90); }
    for (const s of [-1, 1]) { P(g, sup(s * 33, hy, 30, 30, 2.4, 2.4)); fillLine(g, "#2b2f2a", 6, FC); ell(g, s * 33, hy, 19, 19, "#6fa8d6", 4); ell(g, s * 33 - 6, hy - 7, 6, 5, "#e8f6ff", 0); }
    P(g, [[-10, hy - 12], [10, hy - 12], [10, hy + 10], [-10, hy + 10]]); fillLine(g, "#4a4f45", 3, FC); g.restore(); }
  g.restore(); };

export const PV_CAST = {
  min:      { outfit: "camo", hat: "kevlar", pants: "#4d6234", shoes: "#2a241c", seed: 3 },
  sarge:    { outfit: "camo", hat: "patrol", pants: "#4d6234", shoes: "#2a241c", moustache: true, seed: 11, top: "#69834a" },
  kang:     { outfit: "camo", hat: "kevlar", pants: "#4d6234", shoes: "#2a241c", glasses: "round", seed: 19, hatCol: "#5a703c" },
  sweepA:   { outfit: "workjacket", hat: "nkcap", badge: true },
  sweepB:   { outfit: "workjacket", hat: "nkcap", top: "#5f7489", hatCol: "#4c5e70", badge: true, moustache: true },
  sweepC:   { outfit: "workjacket", hat: "nkcap", top: "#73879b", hatCol: "#5b6f84", badge: true },
  announcer:{ outfit: "olive", hat: "peaked", medals: true, top: "#7a7444" },
  guardA:   { outfit: "olive", hat: "peaked", top: "#6f6d3e" },
  guardB:   { outfit: "olive", hat: "peaked", top: "#77753f", moustache: true },
  foreman:  { outfit: "workjacket", hat: "hardhat", hatCol: "#e8483c", top: "#5a6e86", badge: true },
  grandma:  { outfit: "quilt", hairStyle: "bun", hair: "#d9d6d0", glasses: "round" },
  touristA: { outfit: "tee", hat: "sunhat", top: "#f08c3a", pants: "#3c6aa8" },
  touristB: { outfit: "hoodie", hat: "cap", hatCol: "#2f86c9", top: "#d23f66", print: "#f2c14e" },
  touristC: { outfit: "tee", hairStyle: "curly", hair: "#2a1d18", top: "#3fa58a", pants: "#3b3f52" },
};
export const CAST = PV_CAST;
