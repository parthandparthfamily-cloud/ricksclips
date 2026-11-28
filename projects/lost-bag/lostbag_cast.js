// ---------- "Your Lost Bag Isn't Lost" cast: new outfits, hats, props in the locked Ricks look ----------
// (appended into toon.js after rick.js + rick_ext.js, so OUTFIT/HATS/PROPS and the ink helpers are in scope)

OUTFIT.airline = (g, b, o) => {
  const c = o.top ?? "#24365e"; OUTFIT.suit(g, b, { ...o, top: c, shirt: "#f6f3ee" });
  // red neck scarf knot + tails
  P(g, [[b.cx - 30, b.y0 + 2], [b.cx + 30, b.y0 + 2], [b.cx + 18, b.y0 + 24], [b.cx - 18, b.y0 + 24]]); fillLine(g, o.scarf ?? "#d8402f", 3);
  P(g, [[b.cx - 6, b.y0 + 20], [b.cx + 6, b.y0 + 20], [b.cx + 20, b.y0 + 64], [b.cx + 6, b.y0 + 60]]); fillLine(g, mulc(o.scarf ?? "#d8402f", 0.85), 3);
  // gold wing badge + name tag
  P(g, [[b.cx - 56, b.y0 + 44], [b.cx - 22, b.y0 + 40], [b.cx - 26, b.y0 + 52], [b.cx - 52, b.y0 + 54]]); fillLine(g, "#f0c44c", 2.5);
  P(g, [[b.cx + 24, b.y0 + 70], [b.cx + 58, b.y0 + 70], [b.cx + 58, b.y0 + 88], [b.cx + 24, b.y0 + 88]]); fillLine(g, "#ffffff", 2.5);
  line(g, [[b.cx + 30, b.y0 + 79], [b.cx + 52, b.y0 + 79]], 2.5, "#24365e");
  for (const k of [120, 156]) ell(g, b.cx, b.y0 + k, 5, 5, "#f0c44c", 2.5);
};
OUTFIT.polo = (g, b, o) => {
  const c = o.top ?? "#2fa37a"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 38, b.y0 - 8], [b.cx + s * 28, b.y0 + 24]]); fillLine(g, mulc(c, 1.18), 3); }
  line(g, [[b.cx, b.y0 + 6], [b.cx, b.y0 + 52]], 3); for (const k of [22, 40]) ell(g, b.cx + 6, b.y0 + k, 3.5, 3.5, "#fff", 2);
  // little logo: a suitcase on the chest
  P(g, [[b.cx + 26, b.y0 + 56], [b.cx + 52, b.y0 + 56], [b.cx + 52, b.y0 + 74], [b.cx + 26, b.y0 + 74]]); fillLine(g, "#f6d04d", 2.5);
  g.fillStyle = o.pants ?? "#33384d"; g.fillRect(b.x0 - 20, b.y1 - 44, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 44], [b.x1 + 20, b.y1 - 44]], 3);
};
OUTFIT.ilovetee = (g, b, o) => {
  OUTFIT.tee(g, b, { ...o, top: "#fbfaf4" });
  g.save(); g.fillStyle = FC; g.font = "bold 22px Arial"; g.textAlign = "center"; g.fillText("I", b.cx - 34, b.y0 + 76);
  const hx = b.cx, hy = b.y0 + 66; P(g, [[hx, hy + 18], ...qc([hx, hy + 18], [hx - 26, hy], [hx - 12, hy - 12]), ...qc([hx - 12, hy - 12], [hx - 2, hy - 16], [hx, hy - 4]), ...qc([hx, hy - 4], [hx + 2, hy - 16], [hx + 12, hy - 12]), ...qc([hx + 12, hy - 12], [hx + 26, hy], [hx, hy + 18])]); fillLine(g, "#e23b3b", 3);
  g.fillStyle = FC; g.font = "bold 17px Arial"; g.fillText("AIRPORTS", b.cx, b.y0 + 108); g.restore();
  // cheap: a loose thread and a crooked hem
  line(g, qc([b.cx + 40, b.y1 - 48], [b.cx + 46, b.y1 - 30], [b.cx + 38, b.y1 - 18]), 2, "#c9c3b4");
};
OUTFIT.flannel = (g, b, o) => {
  const c = o.top ?? "#c23a32"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  g.save(); g.globalAlpha = 0.35; g.fillStyle = "#1d1416";
  for (let x = b.x0 - 20; x < b.x1 + 20; x += 30) g.fillRect(x, b.y0 - 20, 11, b.h + 40);
  for (let y = b.y0 - 20; y < b.y1 + 20; y += 30) g.fillRect(b.x0 - 20, y, b.w + 40, 11);
  g.restore();
  line(g, [[b.cx, b.y0], [b.cx, b.y1 - 48]], 3); for (const k of [30, 64, 98, 132]) ell(g, b.cx + 6, b.y0 + k, 3.5, 3.5, "#f1ece0", 2);
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 36, b.y0 - 8], [b.cx + s * 26, b.y0 + 22]]); fillLine(g, mulc(c, 0.8), 3); }
  g.fillStyle = o.pants ?? "#41568a"; g.fillRect(b.x0 - 20, b.y1 - 44, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 44], [b.x1 + 20, b.y1 - 44]], 3);
};
// the hero's favourite jacket: mustard corduroy, open over the shirt underneath, with a patch
OUTFIT.cordjacket = (g, b, o) => {
  (OUTFIT[o.under ?? "flannel"])(g, b, o);
  const c = "#e0a52c";
  for (const s of [-1, 1]) {
    const pts = [[b.cx + s * 14, b.y0 - 20], [b.cx + s * 100, b.y0 - 20], [b.cx + s * 100, b.y1 + 20], [b.cx + s * 18, b.y1 + 20], [b.cx + s * 22, b.y0 + 96]];
    P(g, pts); fillLine(g, c, 3);
    clip(g, pts, () => { for (let x = -100; x <= 100; x += 9) line(g, [[b.cx + x, b.y0 - 20], [b.cx + x, b.y1 + 20]], 1.6, mulc(c, 0.82)); });
    P(g, pts); fillLine(g, null, 3);
    P(g, [[b.cx + s * 14, b.y0 - 20], [b.cx + s * 46, b.y0 - 14], [b.cx + s * 30, b.y0 + 40], [b.cx + s * 22, b.y0 + 96]]); fillLine(g, "#7a4a22", 3);
  }
  P(g, [[b.cx - 58, b.y0 + 120], [b.cx - 30, b.y0 + 120], [b.cx - 30, b.y0 + 146], [b.cx - 58, b.y0 + 146]]); fillLine(g, mulc(c, 0.78), 2.5);
  // elbow-patch style badge: a little star
  const sx = b.cx + 50, sy = b.y0 + 136, st = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6 : 13; st.push([sx + Math.cos(a) * r, sy + Math.sin(a) * r]); } P(g, st); fillLine(g, "#3d7fd6", 2.5);
};
OUTFIT.hawaii = (g, b, o) => {
  const c = o.top ?? "#2bb3c0"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  const r = [0.13, 0.71, 0.42, 0.88, 0.27, 0.55, 0.06, 0.93, 0.36, 0.64];
  for (let i = 0; i < 10; i++) { const x = b.x0 + r[i] * b.w, y = b.y0 + 20 + r[(i + 3) % 10] * (b.h - 70); for (let k = 0; k < 5; k++) { const a = k * 1.2566; ell(g, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 7, 7, i % 2 ? "#ffd84a" : "#ff7a59", 1.5); } ell(g, x, y, 4, 4, "#fff", 1.2); }
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 38, b.y0 - 8], [b.cx + s * 26, b.y0 + 26]]); fillLine(g, mulc(c, 0.85), 3); }
  g.fillStyle = o.pants ?? "#e8d9b0"; g.fillRect(b.x0 - 20, b.y1 - 44, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 44], [b.x1 + 20, b.y1 - 44]], 3);
};
OUTFIT.cardigan = (g, b, o) => {
  OUTFIT.school(g, b, { ...o, top: "#f4f1e8" });
  const c = o.top ?? "#7d6bb0";
  for (const s of [-1, 1]) { const pts = [[b.cx + s * 12, b.y0 - 20], [b.cx + s * 100, b.y0 - 20], [b.cx + s * 100, b.y1 + 20], [b.cx + s * 14, b.y1 + 20]]; P(g, pts); fillLine(g, c, 3); for (const k of [60, 100, 140]) ell(g, b.cx + s * 22, b.y0 + k, 5, 5, "#e9d28a", 2); }
};
HATS.pillbox = (g, cx, cy, o) => { HATS.hair(g, cx, cy, o); const c = o.hatCol ?? "#24365e"; g.save(); g.translate(cx + 30, cy - 92); g.rotate(12 * D2R);
  const pb = [[-46, 0], [-42, -34], [42, -34], [46, 0]]; softShade(g, pb, 0, -16, 46, c, mulc(c, 0.7)); inkRing(g, pb, 8, 0.3, Math.PI * 0.5, FC);
  P(g, [[-12, -26], [12, -26], [8, -12], [-8, -12]]); fillLine(g, "#f0c44c", 2.5); g.restore(); };
HATS.capback = (g, cx, cy, o) => { g.save(); g.scale(-1, 1); HATS.cap(g, -cx, cy, o); g.restore(); };

PROPS.form = (g, x, y) => { P(g, [[x - 26, y - 36], [x + 26, y - 36], [x + 28, y + 34], [x - 24, y + 36]]); fillLine(g, "#ffffff", 3.5, FC); for (let i = 0; i < 6; i++) line(g, [[x - 16, y - 24 + i * 10], [x + 16, y - 24 + i * 10]], 2, i % 2 ? "#8ab4e8" : "#9a9aa8"); };
PROPS.ticket = (g, x, y) => { P(g, [[x - 30, y - 16], [x + 30, y - 16], [x + 30, y + 16], [x - 30, y + 16]]); fillLine(g, "#fff6c8", 3.5, FC); line(g, [[x - 20, y - 4], [x + 20, y - 4]], 3, "#c0392b"); line(g, [[x - 20, y + 6], [x + 12, y + 6]], 3, "#555"); };
PROPS.toothbrush = (g, x, y) => { line(g, [[x - 4, y + 30], [x + 4, y - 40]], 9, FC); line(g, [[x - 4, y + 30], [x + 4, y - 40]], 5, "#3dbbe8"); P(g, [[x - 2, y - 40], [x + 12, y - 41], [x + 13, y - 62], [x, y - 62]]); fillLine(g, "#ffffff", 2.5); };
PROPS.shirt = (g, x, y) => { const s = [[x - 18, y - 30], [x - 6, y - 34], [x, y - 28], [x + 6, y - 34], [x + 18, y - 30], [x + 32, y - 16], [x + 22, y - 6], [x + 16, y - 12], [x + 16, y + 30], [x - 16, y + 30], [x - 16, y - 12], [x - 22, y - 6], [x - 32, y - 16]]; P(g, s); fillLine(g, "#fbfaf4", 3.5, FC); ell(g, x, y + 2, 6, 5, "#e23b3b", 1.5); };
PROPS.flashlight = (g, x, y) => { line(g, [[x - 6, y + 20], [x + 26, y - 22]], 16, FC); line(g, [[x - 6, y + 20], [x + 26, y - 22]], 10, "#3a3f52"); ell(g, x + 30, y - 27, 10, 10, "#fff6a8", 3); };
PROPS.headset = () => {};
PROPS.stamp = (g, x, y) => { line(g, [[x, y + 6], [x, y - 40]], 12, FC); line(g, [[x, y + 6], [x, y - 40]], 7, "#7a4a22"); ell(g, x, y - 46, 14, 11, "#c0392b", 3); P(g, [[x - 22, y + 6], [x + 22, y + 6], [x + 22, y + 22], [x - 22, y + 22]]); fillLine(g, "#3a3f52", 3); };
PROPS.cheque = (g, x, y) => { P(g, [[x - 40, y - 18], [x + 40, y - 18], [x + 40, y + 18], [x - 40, y + 18]]); fillLine(g, "#d9f2c4", 3.5, FC); g.save(); g.fillStyle = "#2b6b2f"; g.font = "bold 16px Arial"; g.textAlign = "center"; g.fillText("$150", x + 10, y + 6); g.restore(); };
PROPS.bag = (g, x, y) => { P(g, sup(x, y + 40, 36, 44, 3, 3)); fillLine(g, "#e8553a", 4, FC); line(g, [[x - 14, y], [x - 14, y - 10], [x + 14, y - 10], [x + 14, y]], 5, FC); line(g, [[x - 20, y + 30], [x + 20, y + 30]], 2.5, mulc("#e8553a", 0.7)); };

// ---------- extras drawn on top of rick() with the same head transform ----------
const headFrame = (g, o, opts, fn) => {
  const kid = !!o.kid, BH = kid ? 170 : 225, LL = kid ? 175 : 255, bodyBot = (opts.pose === "sit") ? 0 : -LL, hcy = bodyBot - BH - 62;
  g.save(); if (opts.headTilt) { g.translate(0, hcy + 90); g.rotate(opts.headTilt * D2R); g.translate(0, -(hcy + 90)); }
  fn(hcy); g.restore();
};
export const EXTRAS = {
  headset: (g, o, opts) => headFrame(g, o, opts, (cy) => {
    line(g, qc([-104, cy + 6], [-112, cy - 126], [0, cy - 128]).concat(qc([0, cy - 128], [112, cy - 126], [104, cy + 6]).slice(1)), 9, FC);
    line(g, qc([-104, cy + 6], [-112, cy - 126], [0, cy - 128]).concat(qc([0, cy - 128], [112, cy - 126], [104, cy + 6]).slice(1)), 4, "#4a5068");
    ell(g, -104, cy + 4, 16, 24, "#3a3f52", 4); ell(g, 104, cy + 4, 16, 24, "#3a3f52", 4);
    line(g, qc([-104, cy + 24], [-92, cy + 70], [-34, cy + 54]), 5, FC); ell(g, -30, cy + 54, 8, 7, "#3a3f52", 3);
  }),
  eyebags: (g, o, opts) => headFrame(g, o, opts, (cy) => {
    g.save(); g.translate(0, cy - 8); g.scale(1.2, 1.2); g.translate(0, -(cy - 8)); const lx = (opts.look ?? 0) * 8;
    for (const s of [-1, 1]) line(g, qc([s * 27 + lx - 13, cy + 8], [s * 27 + lx, cy + 15], [s * 27 + lx + 13, cy + 8]), 3.2, "#9b8f9e");
    g.restore();
  }),
  stubble: (g, o, opts) => headFrame(g, o, opts, (cy) => { g.save(); g.fillStyle = "rgba(90,58,38,0.55)"; const r = [3, 7, 1, 9, 5, 2, 8, 4, 6, 0];
    for (let i = 0; i < 46; i++) { const a = Math.PI * (0.12 + 0.76 * (i / 46)), rr = 64 + r[i % 10] * 2.6; g.fillRect(Math.cos(a) * rr - 2, cy + 18 + Math.sin(a) * rr * 0.62 - 2, 4, 4); } g.restore(); }),
};

// ---------- the cast (all NEW for this video) ----------
export const CHARS = {
  you:      { o: { outfit: "hoodie", top: "#2f8fc9", pants: "#38405a", hair: "#5a3a26", hairStyle: "hair", backpack: "#e8a23a" } },
  youTee:   { o: { outfit: "ilovetee", pants: "#38405a", hair: "#5a3a26", hairStyle: "hair" } },
  youBeard: { o: { outfit: "ilovetee", pants: "#38405a", hair: "#5a3a26", hairStyle: "hair", beard: "#5a3a26" } },
  doreen:   { o: { outfit: "airline", hair: "#8a3b2a", hairStyle: "bun", hat: "pillbox" }, x: ["eyebags"] },
  kiosk:    { o: { outfit: "apron", top: "#8a4fc0", hair: "#1e1714", hairStyle: "curly", glasses: "round" } },
  agent1:   { o: { outfit: "polo", top: "#2fa37a", hair: "#e8c45a", hairStyle: "spiky" }, x: ["headset"] },
  agent2:   { o: { outfit: "polo", top: "#e0703a", hair: "#3a2418", hairStyle: "pigtails" }, x: ["headset"] },
  agent3:   { o: { outfit: "polo", top: "#7a5cc4", hairStyle: "bald", hair: "#d8d2c4", moustache: "#5b4636" }, x: ["headset"] },
  agent4:   { o: { outfit: "polo", top: "#d8407a", hair: "#2b211c", hairStyle: "long" }, x: ["headset"] },
  hank:     { o: { outfit: "vest", top: "#56687c", hat: "beanie", hatCol: "#3f8f4f" } },
  earl:     { o: { outfit: "flannel", top: "#c23a32", pants: "#41568a", hat: "cap", hatCol: "#2f5fa8", beard: "#7a4a2a" } },
  earlJkt:  { o: { outfit: "cordjacket", under: "flannel", top: "#c23a32", pants: "#41568a", hat: "cap", hatCol: "#2f5fa8", beard: "#7a4a2a" } },
  biz:      { o: { outfit: "suit", top: "#4a4f63", tie: "#e0b22e", hat: "fedora", hatCol: "#5a4a3c", band: "#2b2f3d" } },
  tourist:  { o: { outfit: "hawaii", hat: "straw", pants: "#e8d9b0", glasses: "aviator" } },
  granny:   { o: { outfit: "dress", top: "#6a5ab8", hair: "#e9e6df", hairStyle: "curly", glasses: "round" } },
  teen:     { o: { outfit: "tee", top: "#f2c230", pants: "#3b3f52", hat: "capback", hatCol: "#e2453c" } },
  shopA:    { o: { outfit: "dress", top: "#3faa6a", hat: "straw" } },
  shopB:    { o: { outfit: "cardigan", top: "#c0632f", hairStyle: "bald", hair: "#eeeae0", moustache: "#eeeae0" } },
  shopC:    { o: { outfit: "hoodie", top: "#e86fa0", hair: "#3a2418", hairStyle: "long" } },
  shopD:    { o: { kid: true, outfit: "tee", top: "#47b0e8", pants: "#3b3f52", hat: "beanie", hatCol: "#f2c230" } },
};
export const drawChar = (g, key, opts = {}) => {
  const C = CHARS[key]; const o = { ...C.o, ...(opts.o || {}) };
  rick(g, o, opts);
  for (const x of (C.x || [])) EXTRAS[x](g, o, opts);
  if (opts.stubble) EXTRAS.stubble(g, o, opts);
};

export const CAST = CHARS;
