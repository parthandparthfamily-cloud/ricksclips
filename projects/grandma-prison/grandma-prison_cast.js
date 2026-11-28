// ---------- "Why Grandmas in Japan Want to Go to Prison" — NEW cast, locked rick.js look ----------
// Everything here is appended to toon.js (helpers P, fillLine, ell, line, qc, sup, clip, softShade, inkRing, mulc, FC, LINE, OUTFIT, HATS, PROPS are in scope).

const txt = (g, s, x, y, size, col = FC, font = "Lilita One, Arial Black, sans-serif") => { g.save(); g.font = `${size}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, x, y); g.restore(); };

// Hana's lavender cardigan over a cream blouse, pearl brooch, brown pleated skirt
OUTFIT.cardigan = (g, b, o) => {
  const c = o.top ?? "#9b7fc4", sk = o.pants ?? "#7a5a44";
  g.fillStyle = o.shirt ?? "#f4ead2"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 14, b.y0 - 20], [b.cx + s * 100, b.y0 - 20], [b.cx + s * 100, b.y1 + 20], [b.cx + s * 22, b.y1 + 20]]); fillLine(g, c, 3); }
  for (let i = 0; i < 5; i++) ell(g, b.cx + 26, b.y0 + 30 + i * 30, 4.5, 4.5, "#f3e9c9", 2);
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) line(g, [[b.cx + s * (30 + i * 8), b.y0 + 10], [b.cx + s * (30 + i * 8), b.y1]], 1.4, mulc(c, 0.82));
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 30, b.y0 - 8], [b.cx + s * 22, b.y0 + 20]]); fillLine(g, "#fffaf0", 2.5); }
  ell(g, b.cx, b.y0 + 30, 8, 8, "#fff7f2", 2.5); ell(g, b.cx - 2, b.y0 + 28, 2.5, 2.5, "#ffffff", 0);
  P(g, [[b.x0 - 20, b.y1 - 52], [b.x1 + 20, b.y1 - 52], [b.x1 + 20, b.y1 + 20], [b.x0 - 20, b.y1 + 20]]); fillLine(g, sk, 3);
  for (let i = -3; i <= 3; i++) line(g, [[b.cx + i * 18, b.y1 - 50], [b.cx + i * 21, b.y1 + 10]], 2, mulc(sk, 0.75));
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 34, b.y0 + 120], [b.cx + s * 62, b.y0 + 120], [b.cx + s * 62, b.y0 + 150], [b.cx + s * 34, b.y0 + 150]]); fillLine(g, mulc(c, 0.9), 2.5); }
};
// prison uniform: pale sage two-piece, collar, number patch
OUTFIT.inmate = (g, b, o) => {
  const c = o.top ?? "#a9b89a"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 2], [b.cx + s * 40, b.y0 - 8], [b.cx + s * 34, b.y0 + 24]]); fillLine(g, mulc(c, 1.12), 2.5); }
  line(g, [[b.cx, b.y0 + 6], [b.cx, b.y1 - 52]], 2.5, mulc(c, 0.7)); for (let i = 0; i < 4; i++) ell(g, b.cx + 6, b.y0 + 34 + i * 30, 4, 4, "#e9eee0", 2);
  P(g, [[b.cx - 56, b.y0 + 48], [b.cx - 14, b.y0 + 48], [b.cx - 14, b.y0 + 76], [b.cx - 56, b.y0 + 76]]); fillLine(g, "#f6f4ea", 2.5); txt(g, o.num ?? "81", b.cx - 35, b.y0 + 63, 24, "#2b1f1c");
  g.fillStyle = mulc(c, 0.86); g.fillRect(b.x0 - 20, b.y1 - 52, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 52], [b.x1 + 20, b.y1 - 52]], 3);
};
// convenience-store vest: three-colour stripe, white shirt, name tag
OUTFIT.konbini = (g, b, o) => {
  g.fillStyle = "#ffffff"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  const cols = o.stripes ?? ["#2f8f5b", "#f2f2ee", "#2c6fb8", "#f2f2ee", "#e07a2c"];
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) { P(g, [[b.cx + s * (16 + i * 18), b.y0 - 20], [b.cx + s * (34 + i * 18), b.y0 - 20], [b.cx + s * (34 + i * 18), b.y1 + 20], [b.cx + s * (16 + i * 18), b.y1 + 20]]); fillLine(g, cols[i], 0); }
  for (const s of [-1, 1]) line(g, [[b.cx + s * 16, b.y0 - 20], [b.cx + s * 16, b.y1 + 20]], 3);
  P(g, [[b.cx + 22, b.y0 + 60], [b.cx + 58, b.y0 + 60], [b.cx + 58, b.y0 + 80], [b.cx + 22, b.y0 + 80]]); fillLine(g, "#fffbe0", 2); txt(g, o.tag ?? "KENTA", b.cx + 40, b.y0 + 70, 11, "#2b1f1c");
  g.fillStyle = o.pants ?? "#2d3346"; g.fillRect(b.x0 - 20, b.y1 - 46, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 46], [b.x1 + 20, b.y1 - 46]], 3);
};
// store security: light-blue shirt, navy vest, badge, belt
OUTFIT.security = (g, b, o) => {
  g.fillStyle = "#9cc3e6"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 18, b.y0 - 20], [b.cx + s * 100, b.y0 - 20], [b.cx + s * 100, b.y1 + 20], [b.cx + s * 12, b.y1 + 20]]); fillLine(g, "#243556", 3); }
  P(g, [[b.cx - 7, b.y0 + 8], [b.cx + 7, b.y0 + 8], [b.cx + 10, b.y0 + 66], [b.cx, b.y0 + 78], [b.cx - 10, b.y0 + 66]]); fillLine(g, "#24304a", 2.5);
  P(g, [[b.cx + 30, b.y0 + 34], [b.cx + 50, b.y0 + 34], [b.cx + 50, b.y0 + 54], [b.cx + 40, b.y0 + 62], [b.cx + 30, b.y0 + 54]]); fillLine(g, "#f1c84b", 2.5);
  g.fillStyle = "#1b2133"; g.fillRect(b.x0 - 20, b.y1 - 60, b.w + 40, 16); ell(g, b.cx, b.y1 - 52, 9, 7, "#d9d9d9", 2.5);
  g.fillStyle = "#26304a"; g.fillRect(b.x0 - 20, b.y1 - 44, b.w + 40, 80);
};
// police / prison officer: dark navy jacket, light-blue shirt, gold buttons, shoulder boards
OUTFIT.officer = (g, b, o) => {
  const c = o.top ?? "#22305a"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  P(g, [[b.cx - 24, b.y0 - 10], [b.cx + 24, b.y0 - 10], [b.cx, b.y0 + 54]]); fillLine(g, o.shirt ?? "#a8cbe8", 2.5);
  P(g, [[b.cx - 5, b.y0 + 4], [b.cx + 5, b.y0 + 4], [b.cx + 7, b.y0 + 46], [b.cx, b.y0 + 54], [b.cx - 7, b.y0 + 46]]); fillLine(g, mulc(c, 0.7), 2);
  for (const k of [70, 102, 134, 166]) ell(g, b.cx, b.y0 + k, 4.5, 4.5, "#e5c158", 2);
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 30, b.y0 + 52], [b.cx + s * 56, b.y0 + 52], [b.cx + s * 56, b.y0 + 72], [b.cx + s * 30, b.y0 + 72]]); fillLine(g, mulc(c, 1.2), 2.5); }
  P(g, [[b.cx + 34, b.y0 + 26], [b.cx + 50, b.y0 + 22], [b.cx + 52, b.y0 + 44], [b.cx + 36, b.y0 + 46]]); fillLine(g, o.badge ?? "#e5c158", 2.5);
  g.fillStyle = "#151c33"; g.fillRect(b.x0 - 20, b.y1 - 58, b.w + 40, 14);
  g.fillStyle = mulc(c, 0.9); g.fillRect(b.x0 - 20, b.y1 - 44, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 44], [b.x1 + 20, b.y1 - 44]], 3);
};
// judge's black robe with a thin white collar
OUTFIT.robe = (g, b, o) => {
  g.fillStyle = "#1f1c24"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  P(g, [[b.cx - 22, b.y0 - 10], [b.cx + 22, b.y0 - 10], [b.cx, b.y0 + 40]]); fillLine(g, "#f6f3ee", 2.5);
  P(g, [[b.cx - 6, b.y0 + 4], [b.cx + 6, b.y0 + 4], [b.cx + 8, b.y0 + 34], [b.cx - 8, b.y0 + 34]]); fillLine(g, "#5a2a6a", 2);
  for (let i = -3; i <= 3; i++) line(g, qc([b.cx + i * 16, b.y0 + 70], [b.cx + i * 18, b.y0 + 140], [b.cx + i * 22, b.y1 + 10]), 2, "#3a3442");
  for (const s of [-1, 1]) line(g, [[b.cx + s * 24, b.y0 - 4], [b.cx + s * 10, b.y1 + 10]], 3, "#3b3545");
};
// nurse: soft pink scrubs, white apron panel, red cross pin, stethoscope
OUTFIT.nurse = (g, b, o) => {
  g.fillStyle = "#f3a7bf"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  line(g, qc([b.cx - 30, b.y0 - 6], [b.cx, b.y0 + 28], [b.cx + 30, b.y0 - 6]), 3);
  P(g, [[b.cx - 40, b.y0 + 60], [b.cx + 40, b.y0 + 60], [b.cx + 46, b.y1 + 20], [b.cx - 46, b.y1 + 20]]); fillLine(g, "#fffafc", 2.5);
  P(g, [[b.cx - 30, b.y0 + 30], [b.cx - 14, b.y0 + 30], [b.cx - 14, b.y0 + 46], [b.cx - 30, b.y0 + 46]]); fillLine(g, "#ffffff", 2); line(g, [[b.cx - 22, b.y0 + 33], [b.cx - 22, b.y0 + 43]], 3, "#d8343a"); line(g, [[b.cx - 27, b.y0 + 38], [b.cx - 17, b.y0 + 38]], 3, "#d8343a");
  line(g, qc([b.cx - 40, b.y0 + 2], [b.cx, b.y0 + 96], [b.cx + 40, b.y0 + 2]), 5, "#3e4a66"); ell(g, b.cx, b.y0 + 52, 9, 9, "#c7d0db", 3);
};
// schoolgirl sailor uniform
OUTFIT.sailor = (g, b, o) => {
  g.fillStyle = "#f6f6f2"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  P(g, [[b.x0 - 20, b.y0 - 20], [b.x1 + 20, b.y0 - 20], [b.x1 + 20, b.y0 + 30], [b.cx, b.y0 + 70], [b.x0 - 20, b.y0 + 30]]); fillLine(g, "#24376b", 3);
  line(g, [[b.x0, b.y0 + 22], [b.cx, b.y0 + 58], [b.x1, b.y0 + 22]], 2.5, "#ffffff");
  P(g, [[b.cx - 16, b.y0 + 62], [b.cx + 16, b.y0 + 62], [b.cx + 22, b.y0 + 92], [b.cx, b.y0 + 80], [b.cx - 22, b.y0 + 92]]); fillLine(g, "#d8343a", 2.5);
  g.fillStyle = "#2a3560"; g.fillRect(b.x0 - 20, b.y1 - 60, b.w + 40, 90); line(g, [[b.x0 - 20, b.y1 - 60], [b.x1 + 20, b.y1 - 60]], 3);
  for (let i = -3; i <= 3; i++) line(g, [[b.cx + i * 18, b.y1 - 58], [b.cx + i * 22, b.y1 + 10]], 2, "#1c2548");
};
// TV game-show host: loud checked jacket + bow tie
OUTFIT.host = (g, b, o) => {
  OUTFIT.suit(g, b, { ...o, top: "#e0553a", shirt: "#ffffff" });
  g.save(); g.globalAlpha = 0.35; for (let i = -6; i <= 6; i++) { line(g, [[b.cx + i * 22, b.y0 - 20], [b.cx + i * 22, b.y1 + 20]], 3, "#ffd84a"); line(g, [[b.x0 - 20, b.y0 + i * 22 + 110], [b.x1 + 20, b.y0 + i * 22 + 110]], 3, "#ffd84a"); } g.restore();
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 12], [b.cx + s * 24, b.y0], [b.cx + s * 24, b.y0 + 24]]); fillLine(g, "#2a6fd8", 2.5); } ell(g, b.cx, b.y0 + 12, 5, 5, "#2a6fd8", 2);
};

// hats (fit offsets baked in: rick translates to the head centre with FIT [0,1] for keys it doesn't know)
const fit = (dy, sx, fn) => (g, cx, cy, o) => { g.save(); g.translate(cx, cy - dy); g.scale(sx, 1); fn(g, o); g.restore(); };
HATS.peaked = fit(10, 0.9, (g, o) => { const c = o.hatCol ?? "#22305a";
  const top = [[-80, -60], [-104, -132], ...qc([-104, -132], [0, -156], [104, -132]), [80, -60]]; softShade(g, top, 0, -110, 100, c, mulc(c, 0.65));
  clip(g, top, () => { g.fillStyle = o.hatBand ?? "#111827"; g.fillRect(-120, -84, 240, 24); }); inkRing(g, top, 9, 0.3, Math.PI * 0.5, FC);
  ell(g, 0, -104, 13, 11, "#e5c158", 3.5);
  const vis = [...qc([-72, -62], [0, -70], [72, -62]), ...qc([72, -62], [0, -36], [-72, -62])]; softShade(g, vis, 0, -56, 70, "#141826", "#0b0d16"); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); });
HATS.nursecap = fit(10, 1, (g, o) => { HATS.hair(g, 0, 0, o); P(g, [[-56, -98], [56, -98], [44, -136], [-44, -136]]); fillLine(g, "#ffffff", 6); line(g, [[0, -126], [0, -106]], 6, "#d8343a"); line(g, [[-10, -116], [10, -116]], 6, "#d8343a"); });
HATS.party = fit(10, 1, (g, o) => { if (o.hair) HATS.hair(g, 0, 0, o); P(g, [[-40, -96], [40, -100], [8, -214]]); fillLine(g, "#ff6f91", 6); for (let i = 0; i < 3; i++) line(g, [[-30 + i * 8, -122 - i * 28], [30 - i * 9, -124 - i * 28]], 6, "#ffd84a"); ell(g, 8, -216, 13, 13, "#4ad0ff", 5); });
HATS.bigHair = fit(0, 1, (g, o) => { const c = o.hair ?? "#3a2a22"; const pts = []; for (let i = 0; i <= 16; i++) { const a = (185 + i * 170 / 16) * D2R, r = 104 + (i % 2) * 16; pts.push([Math.cos(a) * r, -58 + Math.sin(a) * r * 0.9]); } pts.push([100, -66], [40, -76], [-20, -64], [-100, -70]); softShade(g, pts, 0, -110, 130, c, mulc(c, 0.7)); P(g, pts); fillLine(g, null); });
HATS.bob = fit(10, 1, (g, o) => HATS.hair(g, 0, 0, o));
HAIR_BEHIND.bob = (g, cx, cy, o) => { const c = o.hair ?? "#2b211c", pts = sup(cx, cy + 6, 116, 104, 2.4, 3.2); softShade(g, pts, cx, cy, 120, c, mulc(c, 0.7)); P(g, pts); fillLine(g, null); };

// the character draw used by every card in this video (rick + optional lean/bow around the feet)
export const person = (g, o, opts = {}) => { if (opts.lean) g.rotate(opts.lean * D2R); rick(g, o, opts); };

// ---------------- THE CAST (new for this video) ----------------
export const PEOPLE = {
  hana:    { outfit: "cardigan", top: "#9b7fc4", shirt: "#f4ead2", pants: "#7a5a44", hairStyle: "bun", hair: "#b8b2bf", glasses: "round", shoes: "#5a3a2a" },
  hanaIn:  { outfit: "inmate", num: "81", hairStyle: "bun", hair: "#b8b2bf", glasses: "round", shoes: "#3a3a3a" },
  fumiko:  { outfit: "inmate", num: "89", top: "#a3b5a8", hairStyle: "curly", hair: "#ecebf2", shoes: "#3a3a3a" },
  kenta:   { outfit: "konbini", tag: "KENTA", hairStyle: "spiky", hair: "#2b211c" },
  guard:   { outfit: "security", hat: "cap", hatCol: "#243556", moustache: "#3a2a22" },
  police:  { outfit: "officer", top: "#22305a", hat: "peaked", hatCol: "#22305a" },
  judge:   { outfit: "robe", hairStyle: "bald", hair: "#cfcac2", glasses: "round", moustache: "#bdb7ae" },
  warden:  { outfit: "officer", top: "#2f4f6f", shirt: "#dfe9f2", badge: "#c9d6e3", hat: "peaked", hatCol: "#2f4f6f", hatBand: "#1b2b3d", hairStyle: "bob", hair: "#2b211c" },
  nurse:   { outfit: "nurse", hat: "nursecap", hair: "#4a2f24" },
  son:     { outfit: "suit", top: "#3c4658", tie: "#c0392b", hair: "#2b211c" },
  daughter:{ outfit: "suit", top: "#6c8fb4", shirt: "#fdf3e7", hairStyle: "long", hair: "#3a2418" },
  husband: { outfit: "suit", top: "#4a3a30", tie: "#2b4a6a", hairStyle: "bald", hair: "#d8d3cc", moustache: "#9a958c", glasses: "round" },
  host:    { outfit: "host", hat: "bigHair", hair: "#e8b23a" },
  inmateA: { outfit: "inmate", num: "57", hairStyle: "bun", hair: "#8d8794", glasses: "round" },
  inmateB: { outfit: "inmate", num: "64", top: "#b2bf9e", hairStyle: "curly", hair: "#6b5a52" },
  inmateC: { outfit: "inmate", num: "72", hairStyle: "bob", hair: "#d9d6de" },
  salary:  { outfit: "suit", top: "#5a6170", tie: "#2f8f5b", hair: "#1e1714", glasses: "round" },
  student: { outfit: "sailor", hairStyle: "pigtails", hair: "#2b211c", kid: true, backpack: "#c0392b" },
  courier: { outfit: "tee", top: "#e8b23a", pants: "#4a4a5a", hat: "cap", hatCol: "#2f8f5b" },
  granpa:  { outfit: "vest", top: "#7a8a6a", hairStyle: "bald", hair: "#d8d3cc", beard: "#e8e4dc" },
};

export const CAST = PEOPLE;
