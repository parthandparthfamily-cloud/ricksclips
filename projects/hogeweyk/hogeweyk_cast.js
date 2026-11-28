// ---------------- Hogeweyk cast (new for this video, locked Ricks look: thick FC ink, soft shade, painted detail) ----------------
// Appended to toon.js by tools/build_toon.py. Uses the helpers from characters/rick.js (P, line, ell, qc, sup, clip, softShade, inkRing, fillLine, mulc).

// ---- outfits ----
OUTFIT.cardigan = (g, b, o) => { // hero: gingham shirt under an open mustard cardigan, brown trousers
  const sh = o.shirt ?? "#7fa8d8"; g.fillStyle = sh; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (let i = -8; i <= 8; i++) { g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(b.cx + i * 16, b.y0 - 20, 7, b.h + 40); g.fillRect(b.x0 - 20, b.y0 + i * 16 + 120, b.w + 40, 7); }
  const c = o.top ?? "#d9a23a";
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 18, b.y0 - 20], [b.cx + s * 100, b.y0 - 20], [b.cx + s * 100, b.y1 + 20], [b.cx + s * 26, b.y1 + 20], [b.cx + s * 24, b.y0 + 120]]); fillLine(g, c, 3.5);
    for (let k = 0; k < 9; k++) line(g, [[b.cx + s * 34, b.y0 + 10 + k * 22], [b.cx + s * 92, b.y0 + 10 + k * 22]], 1.8, mulc(c, 0.82));
    P(g, [[b.cx + s * 40, b.y0 + 130], [b.cx + s * 70, b.y0 + 130], [b.cx + s * 70, b.y0 + 160], [b.cx + s * 40, b.y0 + 160]]); fillLine(g, mulc(c, 0.9), 2.5); }
  for (const k of [60, 100, 140]) ell(g, b.cx + 30, b.y0 + k, 5, 5, "#6b4226", 2);
  P(g, [[b.cx - 14, b.y0 - 6], [b.cx + 14, b.y0 - 6], [b.cx, b.y0 + 22]]); fillLine(g, "#f4f1ea", 2.5);
  g.fillStyle = o.pants ?? "#7a5a3e"; g.fillRect(b.x0 - 20, b.y1 - 40, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 40], [b.x1 + 20, b.y1 - 40]], 3);
};
OUTFIT.smock = (g, b, o) => { // hairdresser: teal smock, pink trim, pocket with comb + scissors
  const c = o.top ?? "#2fa39a"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  P(g, sup(b.cx, b.y0 + 2, 46, 16, 2, 2)); fillLine(g, o.trim ?? "#f07aa8", 3);
  line(g, [[b.cx, b.y0 + 16], [b.cx, b.y1 + 10]], 2.5, mulc(c, 0.7)); for (const k of [50, 90, 130]) ell(g, b.cx, b.y0 + k, 4.5, 4.5, "#f6f1e6", 2);
  P(g, [[b.cx - 56, b.y0 + 70], [b.cx - 18, b.y0 + 70], [b.cx - 18, b.y0 + 112], [b.cx - 56, b.y0 + 112]]); fillLine(g, mulc(c, 0.88), 2.5);
  line(g, [[b.cx - 48, b.y0 + 74], [b.cx - 48, b.y0 + 46]], 4.5, "#3b3f52"); for (let i = 0; i < 5; i++) line(g, [[b.cx - 50, b.y0 + 50 + i * 5], [b.cx - 44, b.y0 + 50 + i * 5]], 1.5, "#f6f1e6");
  ell(g, b.cx - 30, b.y0 + 52, 6, 6, null, 3); ell(g, b.cx - 24, b.y0 + 52, 6, 6, null, 3); line(g, [[b.cx - 28, b.y0 + 58], [b.cx - 26, b.y0 + 74]], 3.5, "#b6bec7");
  g.fillStyle = o.trim ?? "#f07aa8"; g.fillRect(b.x0 - 20, b.y1 - 16, b.w + 40, 10);
  if (o.tag) { P(g, [[b.cx + 18, b.y0 + 40], [b.cx + 52, b.y0 + 40], [b.cx + 52, b.y0 + 58], [b.cx + 18, b.y0 + 58]]); fillLine(g, "#fff", 2); line(g, [[b.cx + 24, b.y0 + 49], [b.cx + 46, b.y0 + 49]], 2.5, "#c0392b"); }
};
OUTFIT.waiter = (g, b, o) => { // white shirt, black waistcoat, red bow tie, long white apron
  g.fillStyle = "#f6f3ee"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  const v = o.top ?? "#26232b";
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 10, b.y0 + 8], [b.cx + s * 100, b.y0 - 20], [b.cx + s * 100, b.y1 - 40], [b.cx + s * 4, b.y1 - 40], [b.cx + s * 4, b.y0 + 100]]); fillLine(g, v, 3); }
  for (const k of [110, 136, 162]) ell(g, b.cx + 12, b.y0 + k, 4, 4, "#e5c158", 2);
  P(g, [[b.cx - 30, b.y0 + 8], [b.cx - 4, b.y0 + 16], [b.cx - 30, b.y0 + 26]]); fillLine(g, o.bow ?? "#d6333c", 2.5);
  P(g, [[b.cx + 30, b.y0 + 8], [b.cx + 4, b.y0 + 16], [b.cx + 30, b.y0 + 26]]); fillLine(g, o.bow ?? "#d6333c", 2.5); ell(g, b.cx, b.y0 + 17, 7, 7, mulc(o.bow ?? "#d6333c", 0.8), 2.5);
  P(g, [[b.x0 - 20, b.y1 - 46], [b.x1 + 20, b.y1 - 46], [b.x1 + 20, b.y1 + 20], [b.x0 - 20, b.y1 + 20]]); fillLine(g, "#ffffff", 3);
  line(g, [[b.x0 - 20, b.y1 - 40], [b.x1 + 20, b.y1 - 40]], 4, "#d6dbe0");
};
OUTFIT.polo = (g, b, o) => { // supermarket cashier: green polo, yellow collar, name tag + logo
  const c = o.top ?? "#3f9a4a"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 2], [b.cx + s * 44, b.y0 - 12], [b.cx + s * 30, b.y0 + 20]]); fillLine(g, o.collar ?? "#f2c33a", 3); }
  line(g, [[b.cx, b.y0 + 4], [b.cx, b.y0 + 50]], 3); for (const k of [20, 38]) ell(g, b.cx + 6, b.y0 + k, 3.5, 3.5, "#fff", 1.5);
  P(g, [[b.cx + 16, b.y0 + 60], [b.cx + 56, b.y0 + 60], [b.cx + 56, b.y0 + 80], [b.cx + 16, b.y0 + 80]]); fillLine(g, "#fff", 2.5); line(g, [[b.cx + 22, b.y0 + 70], [b.cx + 50, b.y0 + 70]], 3, "#3b3f52");
  ell(g, b.cx - 34, b.y0 + 72, 14, 14, "#f2c33a", 2.5); line(g, qc([b.cx - 42, b.y0 + 72], [b.cx - 34, b.y0 + 80], [b.cx - 26, b.y0 + 70]), 2.5, c);
  g.fillStyle = o.pants ?? "#2f3550"; g.fillRect(b.x0 - 20, b.y1 - 42, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 42], [b.x1 + 20, b.y1 - 42]], 3);
};
OUTFIT.blouse = (g, b, o) => { // morning carer: lilac flowered blouse, white collar, navy skirt
  const c = o.top ?? "#a98bd6"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (let i = 0; i < 14; i++) { const x = b.x0 + ((i * 37) % (b.w)), y = b.y0 + 30 + ((i * 53) % (b.h - 90)); for (let k = 0; k < 5; k++) ell(g, x + Math.cos(k * 1.256) * 6, y + Math.sin(k * 1.256) * 6, 4, 4, "#fbe9f2", 0); ell(g, x, y, 3, 3, "#f2c33a", 0); }
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 42, b.y0 - 8], [b.cx + s * 32, b.y0 + 24]]); fillLine(g, "#ffffff", 3); }
  g.fillStyle = o.pants ?? "#2f3a66"; g.fillRect(b.x0 - 20, b.y1 - 56, b.w + 40, 90); line(g, [[b.x0 - 20, b.y1 - 56], [b.x1 + 20, b.y1 - 56]], 3);
  for (let i = -2; i <= 2; i++) line(g, [[b.cx + i * 24, b.y1 - 50], [b.cx + i * 30, b.y1 + 10]], 2, mulc(o.pants ?? "#2f3a66", 0.7));
};
OUTFIT.twinset = (g, b, o) => { // receptionist: rose top, navy cardigan, pearls, lanyard with badge
  g.fillStyle = "#e88f9e"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  const c = o.top ?? "#2e3f73";
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 26, b.y0 - 20], [b.cx + s * 100, b.y0 - 20], [b.cx + s * 100, b.y1 + 20], [b.cx + s * 30, b.y1 + 20]]); fillLine(g, c, 3); }
  for (let i = 0; i < 11; i++) { const a = Math.PI * (0.12 + i * 0.076); ell(g, b.cx + Math.cos(a) * 34, b.y0 + Math.sin(a) * 26 - 2, 5, 5, "#fbf7ee", 1.5); }
  for (const s of [-1, 1]) line(g, [[b.cx + s * 22, b.y0 - 6], [b.cx + s * 6, b.y0 + 92]], 3.5, "#d6333c");
  P(g, [[b.cx - 18, b.y0 + 90], [b.cx + 18, b.y0 + 90], [b.cx + 18, b.y0 + 126], [b.cx - 18, b.y0 + 126]]); fillLine(g, "#fff", 2.5); ell(g, b.cx, b.y0 + 104, 7, 7, "#8fd0f5", 1.5); line(g, [[b.cx - 10, b.y0 + 118], [b.cx + 10, b.y0 + 118]], 2.5, "#3b3f52");
  g.fillStyle = o.pants ?? "#5b4a3a"; g.fillRect(b.x0 - 20, b.y1 - 44, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 44], [b.x1 + 20, b.y1 - 44]], 3);
};
OUTFIT.knit = (g, b, o) => { // extra: zig-zag knitted jumper
  const c = o.top ?? "#c9503f"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const y of [b.y0 + 50, b.y0 + 110]) { const pts = []; for (let i = 0; i <= 12; i++) pts.push([b.x0 - 20 + i * 15, y + (i % 2 ? 12 : -2)]); line(g, pts, 5, o.zig ?? "#f4e9d2"); }
  P(g, sup(b.cx, b.y0 + 2, 40, 14, 2, 2)); fillLine(g, mulc(c, 0.82), 3);
  g.fillStyle = mulc(c, 0.82); g.fillRect(b.x0 - 20, b.y1 - 60, b.w + 40, 14); line(g, [[b.x0 - 20, b.y1 - 60], [b.x1 + 20, b.y1 - 60]], 2.5);
  g.fillStyle = o.pants ?? "#4a4f63"; g.fillRect(b.x0 - 20, b.y1 - 46, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 46], [b.x1 + 20, b.y1 - 46]], 3);
};
OUTFIT.raincoat = (g, b, o) => { // extra: yellow raincoat with toggles
  OUTFIT.suit(g, b, { ...o, top: o.top ?? "#f2c22e", shirt: "#e05a4f" }); for (const k of [120, 150, 180]) { line(g, [[b.cx - 14, b.y0 + k], [b.cx + 14, b.y0 + k]], 5, "#6b4226"); }
};

// ---- hats & hair ----
HATS.bob = (g, cx, cy, o) => { // big rounded bob with a side-swept fringe (sits on the crown, brows show)
  const c = o.hair ?? "#c2402f";
  const top = [[cx - 112, cy - 10], ...qc([cx - 112, cy - 10], [cx - 128, cy - 138], [cx - 4, cy - 132]), ...qc([cx - 4, cy - 132], [cx + 126, cy - 136], [cx + 112, cy - 12]),
    ...qc([cx + 112, cy - 12], [cx + 96, cy - 66], [cx + 52, cy - 74]), ...qc([cx + 52, cy - 74], [cx - 10, cy - 70], [cx - 44, cy - 96]), ...qc([cx - 44, cy - 96], [cx - 80, cy - 70], [cx - 112, cy - 10])];
  softShade(g, top, cx, cy - 80, 120, c, mulc(c, 0.7)); inkRing(g, top, 10, 0.3, Math.PI * 0.5, FC);
  line(g, qc([cx - 50, cy - 116], [cx + 10, cy - 124], [cx + 70, cy - 104]), 5, mulc(c, 1.35)); line(g, qc([cx - 20, cy - 92], [cx + 30, cy - 100], [cx + 80, cy - 80]), 3, mulc(c, 0.75));
  if (o.clip) { P(g, [[cx + 66, cy - 98], [cx + 96, cy - 108], [cx + 98, cy - 96], [cx + 68, cy - 88]]); fillLine(g, o.clip, 3); }
};
HAIR_BEHIND.bob = (g, cx, cy, o) => { const c = o.hair ?? "#c2402f"; const pts = sup(cx, cy - 8, 120, 100, 2.2, 3.0); softShade(g, pts, cx, cy, 130, mulc(c, 0.92), mulc(c, 0.65)); inkRing(g, pts, 10, 0.3, Math.PI * 0.5, FC); };
HATS.slick = (g, cx, cy, o) => { // waiter: slicked side-part with a shine
  const c = o.hair ?? "#2a211d";
  const pts = [[cx - 100, cy - 18], ...qc([cx - 100, cy - 18], [cx - 108, cy - 126], [cx - 20, cy - 124]), ...qc([cx - 20, cy - 124], [cx + 104, cy - 130], [cx + 101, cy - 30]),
    ...qc([cx + 101, cy - 30], [cx + 80, cy - 78], [cx + 10, cy - 80]), ...qc([cx + 10, cy - 80], [cx - 40, cy - 78], [cx - 62, cy - 96]), ...qc([cx - 62, cy - 96], [cx - 86, cy - 60], [cx - 100, cy - 18])];
  softShade(g, pts, cx, cy - 80, 100, c, mulc(c, 0.6)); inkRing(g, pts, 9, 0.3, Math.PI * 0.5, FC);
  line(g, qc([cx - 60, cy - 104], [cx - 10, cy - 116], [cx + 50, cy - 110]), 6, "#6d5d56"); line(g, qc([cx - 40, cy - 100], [cx - 10, cy - 104], [cx + 20, cy - 102]), 3, "#9b8a82");
};
HATS.visor = (g, cx, cy, o) => { // cashier: green visor cap with a yellow logo
  const c = o.hatCol ?? "#3f9a4a"; g.save(); g.translate(cx, cy - 14); g.rotate(-4 * D2R);
  HATS.hair(g, 0, 14, { hair: o.hair ?? "#5a3b2a" });
  const band = [[-98, -60], ...qc([-98, -60], [0, -84], [98, -60]), [96, -36], ...qc([96, -36], [0, -60], [-96, -36])];
  softShade(g, band, 0, -60, 100, c, mulc(c, 0.7)); inkRing(g, band, 8, 0.3, Math.PI * 0.5, FC);
  const vis = [...qc([-70, -44], [10, -56], [96, -44]), ...qc([96, -44], [20, -6], [-70, -44])]; softShade(g, vis, 10, -36, 80, mulc(c, 0.9), mulc(c, 0.6)); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC);
  ell(g, 0, -62, 11, 8, "#f2c33a", 2.5); g.restore();
};
HATS.greybun = (g, cx, cy, o) => { HATS.hair(g, cx, cy, { hair: o.hair ?? "#b9b4ae" }); ell(g, cx + 8, cy - 128, 36, 26, o.hair ?? "#b9b4ae", 6); line(g, [[cx - 20, cy - 140], [cx + 36, cy - 120]], 4, "#d6333c"); };
HATS.tufts = (g, cx, cy, o) => { // hero: bald dome with white side tufts and three wispy hairs
  const c = o.hair ?? "#f4f1ea";
  for (const s of [-1, 1]) { const t = [[cx + s * 84, cy - 64], ...qc([cx + s * 84, cy - 64], [cx + s * 128, cy - 48], [cx + s * 118, cy + 8]), ...qc([cx + s * 118, cy + 8], [cx + s * 104, cy - 6], [cx + s * 98, cy + 16]), ...qc([cx + s * 98, cy + 16], [cx + s * 90, cy - 20], [cx + s * 84, cy - 64])]; softShade(g, t, cx + s * 100, cy - 20, 40, c, "#cfc9bf"); inkRing(g, t, 7, 0.3, Math.PI * 0.5, FC); }
  for (const dx of [-14, 0, 14]) line(g, qc([cx + dx, cy - 92], [cx + dx + 10, cy - 122], [cx + dx + 24, cy - 118]), 3.2, FC);
  line(g, qc([cx - 50, cy - 74], [cx - 30, cy - 86], [cx - 8, cy - 86]), 5, "rgba(255,255,255,0.9)");
};
HATS.beret = (g, cx, cy, o) => { const c = o.hatCol ?? "#d6333c"; HATS.hair(g, cx, cy, { hair: o.hair ?? "#e7e3dc" }); const b = sup(cx + 10, cy - 104, 106, 36, 2.2, 2.2); softShade(g, b, cx, cy - 110, 100, c, mulc(c, 0.65)); inkRing(g, b, 9, 0.3, Math.PI * 0.5, FC); line(g, [[cx + 10, cy - 140], [cx + 14, cy - 156]], 6, FC); };

// ---- props held in hand (drawn at the hand point) ----
PROPS.scissors = (g, x, y) => { for (const s of [-1, 1]) { line(g, [[x, y], [x + 10 + s * 4, y - 52]], 7, FC); line(g, [[x, y], [x + 10 + s * 4, y - 52]], 4, "#d9dee4"); } ell(g, x - 10, y + 10, 10, 8, null, 5); ell(g, x + 12, y + 10, 10, 8, null, 5); ell(g, x - 10, y + 10, 10, 8, null, 2.5, 0); };
PROPS.comb = (g, x, y) => { P(g, [[x - 6, y + 4], [x + 50, y - 30], [x + 56, y - 22], [x, y + 12]]); fillLine(g, "#f07aa8", 3); for (let i = 0; i < 7; i++) line(g, [[x + 6 + i * 7, y - 2 - i * 4], [x + 12 + i * 7, y + 6 - i * 4]], 2, FC); };
PROPS.tray = (g, x, y) => { P(g, sup(x, y - 10, 62, 9, 2, 2)); fillLine(g, "#c9ced6", 4); P(g, [[x - 26, y - 54], [x - 4, y - 54], [x - 7, y - 18], [x - 23, y - 18]]); fillLine(g, "#fff", 3); g.fillStyle = "#7a4a2a"; g.fillRect(x - 24, y - 48, 18, 8); ell(g, x - 4, y - 40, 7, 9, null, 3);
  P(g, [[x + 14, y - 66], [x + 40, y - 66], [x + 36, y - 18], [x + 18, y - 18]]); fillLine(g, "#ffe9a8", 3); g.fillStyle = "#f2c33a"; g.fillRect(x + 17, y - 56, 21, 34); };
PROPS.basket = (g, x, y) => { line(g, qc([x - 34, y + 16], [x, y - 38], [x + 34, y + 16]), 6); P(g, [[x - 44, y + 14], [x + 44, y + 14], [x + 34, y + 62], [x - 34, y + 62]]); fillLine(g, "#d6333c", 4);
  for (let i = -3; i <= 3; i++) line(g, [[x + i * 11, y + 20], [x + i * 9, y + 56]], 2, "#9c2028"); ell(g, x - 18, y + 4, 14, 14, "#f28c28", 3); ell(g, x + 8, y, 12, 16, "#9bd14b", 3); P(g, [[x + 20, y - 26], [x + 36, y - 26], [x + 36, y + 12], [x + 20, y + 12]]); fillLine(g, "#f4f1ea", 3); };
PROPS.mug = (g, x, y) => { P(g, [[x - 16, y - 24], [x + 16, y - 24], [x + 14, y + 16], [x - 14, y + 16]]); fillLine(g, "#f2c33a", 3.5); ell(g, x + 20, y - 4, 9, 11, null, 4); };
PROPS.notebook = (g, x, y) => { P(g, [[x - 30, y - 38], [x + 30, y - 38], [x + 30, y + 34], [x - 30, y + 34]]); fillLine(g, "#d6333c", 3.5); P(g, [[x - 24, y - 32], [x + 26, y - 32], [x + 26, y + 28], [x - 24, y + 28]]); fillLine(g, "#fffaf0", 2); for (let i = 0; i < 4; i++) line(g, [[x - 16, y - 20 + i * 12], [x + 18, y - 20 + i * 12]], 2, "#8a8a9a"); line(g, qc([x - 6, y + 20], [x, y + 26], [x + 6, y + 20]), 2, "#d6333c"); };
PROPS.can = (g, x, y) => { P(g, [[x - 20, y - 10], [x + 24, y - 10], [x + 22, y + 34], [x - 18, y + 34]]); fillLine(g, "#3fa3d9", 3.5); line(g, [[x + 22, y], [x + 56, y - 24]], 7); ell(g, x + 58, y - 26, 8, 6, "#3fa3d9", 3); line(g, qc([x - 18, y - 10], [x + 2, y - 34], [x + 20, y - 10]), 4.5); };
PROPS.photo = (g, x, y) => { P(g, [[x - 30, y - 36], [x + 30, y - 36], [x + 30, y + 30], [x - 30, y + 30]]); fillLine(g, "#c98a3e", 4); P(g, [[x - 22, y - 28], [x + 22, y - 28], [x + 22, y + 22], [x - 22, y + 22]]); fillLine(g, "#bfe3f5", 2); ell(g, x, y - 6, 10, 10, "#fff", 2.5); line(g, [[x - 10, y + 22], [x, y + 6], [x + 10, y + 22]], 6, "#d6333c"); };
PROPS.hanky = (g, x, y) => { P(g, [[x - 14, y - 4], [x + 22, y - 20], [x + 30, y + 16], [x - 6, y + 26]]); fillLine(g, "#fff", 3); line(g, [[x - 6, y + 4], [x + 22, y - 8]], 2, "#8fd0f5"); };

export const CAST = {
  hero: { outfit: "cardigan", hat: "tufts", hair: "#f4f1ea", moustache: "#f4f1ea", top: "#d9a23a", shirt: "#7fa8d8", pants: "#7a5a3e", shoes: "#5a3524" },
  carer: { outfit: "blouse", hairStyle: "bun", hair: "#9a4a2a", top: "#a98bd6", pants: "#2f3a66" },
  hair: { outfit: "smock", hat: "bob", hairStyle: "bob", hair: "#c2402f", clip: "#f2c33a", top: "#2fa39a", trim: "#f07aa8", tag: true, shoes: "#d6333c" },
  waiter: { outfit: "waiter", hat: "slick", hair: "#2a211d", moustache: "#2a211d", top: "#26232b", bow: "#d6333c" },
  cashier: { outfit: "polo", hat: "visor", hair: "#5a3b2a", top: "#3f9a4a", collar: "#f2c33a", pants: "#2f3550" },
  desk: { outfit: "twinset", hat: "greybun", hairStyle: "bun", hair: "#b9b4ae", glasses: "round", top: "#2e3f73" },
  resA: { outfit: "knit", hat: "flatcap", hatCol: "#7a6a52", beard: "#f2f0ea", hairStyle: "bald", top: "#c9503f", zig: "#f4e9d2" },
  resB: { outfit: "dress", hat: "beret", hatCol: "#3f6fd1", hair: "#e7e3dc", top: "#e07ab0", glasses: "round" },
  resC: { outfit: "raincoat", hat: "bald", hair: "#dcd6cc", moustache: "#dcd6cc", top: "#f2c22e" },
  gardener: { outfit: "overalls", hat: "straw", top: "#e05a4f", pants: "#4f7fb8", patch: "#f2c33a" },
};
