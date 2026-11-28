// ---------- "The Village With No Doors" cast: new outfits & hats in the locked rick.js look ----------
// Same ink (FC), same soft shade, same thick inkRing. Faces untouched (pure white, drawn by rick.js).

OUTFIT.kurta = (g, b, o) => {
  const c = o.top ?? "#f2b733"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  // mandarin collar + button placket
  P(g, [[b.cx - 26, b.y0 - 6], [b.cx + 26, b.y0 - 6], [b.cx + 24, b.y0 + 12], [b.cx - 24, b.y0 + 12]]); fillLine(g, mulc(c, 0.85), 3);
  P(g, [[b.cx - 9, b.y0 + 10], [b.cx + 9, b.y0 + 10], [b.cx + 9, b.y0 + 96], [b.cx - 9, b.y0 + 96]]); fillLine(g, o.trim ?? mulc(c, 0.8), 2.5);
  for (const k of [28, 52, 76]) ell(g, b.cx, b.y0 + k, 4.5, 4.5, "#f6efe0", 2);
  // embroidered hem + side slits
  const hy = b.y1 - 34; g.fillStyle = o.trim ?? mulc(c, 0.75); g.fillRect(b.x0 - 20, hy, b.w + 40, 12); line(g, [[b.x0 - 20, hy], [b.x1 + 20, hy]], 2.5); line(g, [[b.x0 - 20, hy + 12], [b.x1 + 20, hy + 12]], 2.5);
  for (let i = -4; i <= 4; i++) ell(g, b.cx + i * 18, hy + 6, 3, 3, "#fff4c8", 0);
  for (const s of [-1, 1]) line(g, [[b.cx + s * 58, hy - 40], [b.cx + s * 60, b.y1 + 10]], 3);
  // pyjama legs peeking under the hem
  g.fillStyle = o.pants ?? "#f3eee2"; g.fillRect(b.x0 - 20, b.y1 - 20, b.w + 40, 40); line(g, [[b.x0 - 20, b.y1 - 20], [b.x1 + 20, b.y1 - 20]], 3);
  if (o.pocket) { P(g, [[b.cx + 22, b.y0 + 34], [b.cx + 48, b.y0 + 34], [b.cx + 48, b.y0 + 58], [b.cx + 22, b.y0 + 58]]); fillLine(g, mulc(c, 0.9), 2.5); }
};
OUTFIT.nehru = (g, b, o) => {
  OUTFIT.kurta(g, b, { ...o, top: o.shirt ?? "#f6f2e8", trim: "#d9cfba" });
  const v = o.top ?? "#e0782a";
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 14, b.y0 - 8], [b.cx + s * 90, b.y0 - 20], [b.cx + s * 90, b.y1 - 52], [b.cx + s * 6, b.y1 - 46], [b.cx + s * 6, b.y0 + 20]]); fillLine(g, v, 3);
    g.setLineDash([5, 5]); line(g, [[b.cx + s * 12, b.y0 + 20], [b.cx + s * 12, b.y1 - 52]], 2, mulc(v, 1.35)); g.setLineDash([]); }
  P(g, [[b.cx - 56, b.y0 + 70], [b.cx - 28, b.y0 + 70], [b.cx - 28, b.y0 + 76], [b.cx - 56, b.y0 + 76]]); fillLine(g, mulc(v, 0.7), 2);
  for (const k of [40, 80, 120]) ell(g, b.cx - 14, b.y0 + k, 5, 5, "#e5c158", 2.2);
};
OUTFIT.saree = (g, b, o) => {
  const bl = o.blouse ?? "#2c8a7a", c = o.top ?? "#d1386b", gold = "#f2c14e";
  g.fillStyle = bl; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  // skirt part with pleats
  P(g, [[b.x0 - 20, b.y0 + 104], [b.x1 + 20, b.y0 + 96], [b.x1 + 20, b.y1 + 20], [b.x0 - 20, b.y1 + 20]]); fillLine(g, c, 3);
  for (let i = -2; i <= 2; i++) line(g, [[b.cx + i * 16, b.y0 + 120], [b.cx + i * 22, b.y1 + 10]], 2.4, mulc(c, 0.72));
  g.fillStyle = gold; g.fillRect(b.x0 - 20, b.y1 - 24, b.w + 40, 10); line(g, [[b.x0 - 20, b.y1 - 24], [b.x1 + 20, b.y1 - 24]], 2); line(g, [[b.x0 - 20, b.y1 - 14], [b.x1 + 20, b.y1 - 14]], 2);
  // pallu: diagonal drape over the left shoulder
  const pl = [[b.cx - 70, b.y0 - 20], [b.cx - 20, b.y0 - 20], [b.cx + 90, b.y0 + 110], [b.cx + 90, b.y0 + 160], [b.cx + 40, b.y0 + 128]];
  P(g, pl); fillLine(g, c, 3); line(g, [[b.cx - 22, b.y0 - 16], [b.cx + 88, b.y0 + 112]], 6, gold); line(g, [[b.cx - 22, b.y0 - 16], [b.cx + 88, b.y0 + 112]], 2, FC);
  for (let i = 0; i < 4; i++) ell(g, b.cx - 30 + i * 26, b.y0 + 20 + i * 30, 4, 4, gold, 0);
};
OUTFIT.khaki = (g, b, o) => {
  const c = "#c8a86a"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 36, b.y0 - 8], [b.cx + s * 26, b.y0 + 24]]); fillLine(g, mulc(c, 0.88), 2.5);
    P(g, [[b.cx + s * 18, b.y0 + 44], [b.cx + s * 52, b.y0 + 44], [b.cx + s * 52, b.y0 + 76], [b.cx + s * 18, b.y0 + 76]]); fillLine(g, mulc(c, 0.92), 2.5); line(g, [[b.cx + s * 18, b.y0 + 52], [b.cx + s * 52, b.y0 + 52]], 2.2);
    P(g, [[b.cx + s * 44, b.y0 - 10], [b.cx + s * 76, b.y0 - 4], [b.cx + s * 74, b.y0 + 8], [b.cx + s * 44, b.y0 + 4]]); fillLine(g, "#b52a32", 2.2); }
  line(g, [[b.cx, b.y0 + 4], [b.cx, b.y0 + 140]], 2.5); for (const k of [30, 70, 110]) ell(g, b.cx, b.y0 + k, 4, 4, "#e5c158", 2);
  g.fillStyle = "#5a3524"; g.fillRect(b.x0 - 20, b.y0 + 146, b.w + 40, 16); line(g, [[b.x0 - 20, b.y0 + 146], [b.x1 + 20, b.y0 + 146]], 2.5); line(g, [[b.x0 - 20, b.y0 + 162], [b.x1 + 20, b.y0 + 162]], 2.5);
  P(g, [[b.cx - 12, b.y0 + 144], [b.cx + 12, b.y0 + 144], [b.cx + 12, b.y0 + 164], [b.cx - 12, b.y0 + 164]]); fillLine(g, "#e5c158", 2.5);
  g.fillStyle = mulc(c, 0.85); g.fillRect(b.x0 - 20, b.y0 + 162, b.w + 40, 80);
  P(g, [[b.cx + 22, b.y0 + 84], [b.cx + 52, b.y0 + 84], [b.cx + 52, b.y0 + 94], [b.cx + 22, b.y0 + 94]]); fillLine(g, "#1e2433", 2);
};
OUTFIT.stripe = (g, b, o) => { OUTFIT.tee(g, b, { ...o, top: o.top ?? "#3b3f52" }); for (let i = 0; i < 6; i++) { g.fillStyle = o.stripe ?? "#e9e4d6"; g.fillRect(b.x0 - 20, b.y0 + 18 + i * 30, b.w + 40, 11); } line(g, qc([b.cx - 26, b.y0 - 4], [b.cx, b.y0 + 20], [b.cx + 26, b.y0 - 4]), 3); };
OUTFIT.shawl = (g, b, o) => { OUTFIT.kurta(g, b, { ...o, top: o.shirt ?? "#f6f2e8", trim: "#d9cfba" }); const c = o.top ?? "#ff8c1a";
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 10, b.y0 - 20], [b.cx + s * 92, b.y0 - 20], [b.cx + s * 92, b.y0 + 120], [b.cx + s * 30, b.y0 + 150]]); fillLine(g, c, 3); line(g, [[b.cx + s * 30, b.y0 + 150], [b.cx + s * 92, b.y0 + 120]], 5, "#b52a32"); }
  for (let i = 0; i < 3; i++) ell(g, b.cx + 50, b.y0 + 30 + i * 28, 5, 5, "#f2c14e", 2); };
OUTFIT.sweater = (g, b, o) => { OUTFIT.school(g, b, { ...o, top: o.shirt ?? "#eaf1f7", tie: o.tie ?? "#7c2630" }); const c = o.top ?? "#5c7aa8";
  P(g, [[b.x0 - 20, b.y0 - 20], [b.cx - 34, b.y0 - 20], [b.cx, b.y0 + 64], [b.cx + 34, b.y0 - 20], [b.x1 + 20, b.y0 - 20], [b.x1 + 20, b.y1 - 46], [b.x0 - 20, b.y1 - 46]]); fillLine(g, c, 3);
  for (let i = -3; i <= 3; i++) line(g, [[b.cx + i * 20, b.y0 + 90], [b.cx + i * 20, b.y1 - 50]], 1.8, mulc(c, 0.8)); };

HATS.topi = (g, cx, cy, o) => { const c = o.hatCol ?? "#f7f4ec"; g.save(); g.translate(cx, cy - 10); g.rotate(-4 * D2R);
  const cap = [[-88, -60], ...qc([-88, -60], [-60, -130], [0, -124]), ...qc([0, -124], [64, -132], [90, -62]), ...qc([90, -62], [0, -74], [-88, -60])];
  softShade(g, cap, 0, -96, 90, c, mulc(c, 0.8)); clip(g, cap, () => { line(g, qc([-70, -78], [0, -118], [70, -80]), 2.4, mulc(c, 0.75)); g.fillStyle = mulc(c, 0.9); g.fillRect(-100, -82, 200, 16); });
  inkRing(g, cap, 9, 0.3, Math.PI * 0.5, FC); g.restore(); };
HATS.police = (g, cx, cy, o) => { const c = "#b89858"; g.save(); g.translate(cx, cy - 12); g.rotate(-5 * D2R);
  const top = [[-84, -60], [-96, -138], ...qc([-96, -138], [0, -156], [96, -138]), [84, -60]]; softShade(g, top, 0, -110, 95, c, mulc(c, 0.7));
  clip(g, top, () => { g.fillStyle = "#b52a32"; g.fillRect(-110, -86, 220, 24); line(g, [[-110, -86], [110, -86]], 2.5); }); inkRing(g, top, 9, 0.3, Math.PI * 0.5, FC);
  ell(g, 0, -112, 12, 14, "#e5c158", 4);
  const vis = [...qc([-72, -62], [0, -70], [72, -62]), ...qc([72, -62], [0, -36], [-72, -62])]; softShade(g, vis, 0, -54, 70, "#2a1f18", "#140d09"); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
HATS.pagdi = (g, cx, cy, o) => { const c = o.hatCol ?? "#e8572a"; g.save(); g.translate(cx, cy - 14);
  const d = [[-98, -40], ...qc([-98, -40], [-112, -150], [0, -150]), ...qc([0, -150], [112, -150], [98, -40]), ...qc([98, -40], [0, -62], [-98, -40])];
  softShade(g, d, 0, -100, 100, c, mulc(c, 0.72)); clip(g, d, () => { for (let i = 0; i < 5; i++) line(g, qc([-110, -50 - i * 22], [0, -96 - i * 18], [110, -70 - i * 18]), 3, mulc(c, 0.7)); });
  inkRing(g, d, 9, 0.3, Math.PI * 0.5, FC); ell(g, 18, -112, 13, 13, "#f2c14e", 3.5); g.restore(); };
HATS.capkid = (g, cx, cy, o) => HATS.cap(g, cx, cy, o);

PROPS.bat = (g, x, y) => { line(g, [[x, y], [x + 10, y - 40]], 9); line(g, [[x, y], [x + 10, y - 40]], 5, "#c99b5a"); P(g, [[x + 4, y - 40], [x + 20, y - 40], [x + 34, y - 170], [x + 16, y - 172]]); fillLine(g, "#e8c98a", 4); };
PROPS.camera = (g, x, y) => { P(g, [[x - 26, y - 18], [x + 26, y - 18], [x + 26, y + 18], [x - 26, y + 18]]); fillLine(g, "#2a2f3a", 3.5); ell(g, x, y, 11, 11, "#7cc4ff", 3); P(g, [[x - 16, y - 26], [x - 2, y - 26], [x - 2, y - 18], [x - 16, y - 18]]); fillLine(g, "#2a2f3a", 2.5); };
PROPS.baton = (g, x, y) => { line(g, [[x, y + 20], [x + 30, y - 70]], 11); line(g, [[x, y + 20], [x + 30, y - 70]], 6, "#6a3f22"); };
PROPS.sack = (g, x, y) => { P(g, sup(x, y + 30, 34, 38, 2.2, 2.6)); fillLine(g, "#c9a86a", 4); line(g, [[x - 12, y - 4], [x + 12, y - 4]], 4); };
PROPS.chai = (g, x, y) => { P(g, [[x - 11, y - 14], [x + 11, y - 14], [x + 8, y + 14], [x - 8, y + 14]]); fillLine(g, "#e9f2f6", 3); g.fillStyle = "#c08a52"; g.fillRect(x - 10, y - 10, 20, 8); };
PROPS.pot = (g, x, y) => { P(g, sup(x, y - 30, 30, 28, 2, 2)); fillLine(g, "#c8742f", 4); P(g, [[x - 12, y - 64], [x + 12, y - 64], [x + 10, y - 54], [x - 10, y - 54]]); fillLine(g, "#b0612a", 3); };
PROPS.suitcase = (g, x, y) => { P(g, [[x - 40, y + 10], [x + 40, y + 10], [x + 40, y + 96], [x - 40, y + 96]]); fillLine(g, "#2f6fb0", 4); line(g, qc([x - 14, y + 10], [x, y - 8], [x + 14, y + 10]), 4); for (const s of [-1, 1]) line(g, [[x + s * 24, y + 14], [x + s * 24, y + 92]], 3, "#1f4e80"); };

export const CAST = {
  you:     { outfit: "kurta", top: "#2fa8a0", trim: "#1f6f69", pants: "#f3eee2", hair: "#2a1d16", hairStyle: "hair", backpack: null },
  landlord:{ outfit: "nehru", top: "#e0782a", hat: "topi", moustache: "#3a2a22", shoes: "#5a3524" },
  aunty:   { outfit: "saree", top: "#d1386b", blouse: "#2c8a7a", hairStyle: "bun", hair: "#1e1714" },
  uncle:   { outfit: "kurta", top: "#7a4fa0", trim: "#4d2f6b", hat: "pagdi", hatCol: "#e8b02a", moustache: "#e9e6de" },
  kid1:    { kid: true, outfit: "tee", top: "#e2453c", pants: "#2f4f8a", hat: "cap", hatCol: "#2f6fb0" },
  kid2:    { kid: true, outfit: "tee", top: "#f2c14e", pants: "#3b3f52", hairStyle: "spiky", hair: "#1e1714" },
  clerk:   { outfit: "sweater", top: "#4f8f5f", shirt: "#eef3f5", tie: "#7c2630", glasses: "round", hair: "#2a1d16", hairStyle: "hair" },
  pilgrim1:{ outfit: "shawl", top: "#ff8c1a", hairStyle: "bald", hair: "#e9e6de", beard: "#ece8df" },
  pilgrim2:{ outfit: "saree", top: "#f2c14e", blouse: "#c0392b", hairStyle: "bun", hair: "#2b211c" },
  pilgrim3:{ outfit: "tee", top: "#5c7aa8", pants: "#3b3f52", hat: "beanie", hatCol: "#2c8a7a", backpack: "#c0392b" },
  thief:   { outfit: "stripe", top: "#3b3f52", stripe: "#e9e4d6", hat: "beanie", hatCol: "#26233a", moustache: "#1e1714" },
  cop:     { outfit: "khaki", hat: "police", moustache: "#1e1714", shoes: "#3a2a1a" },
};
