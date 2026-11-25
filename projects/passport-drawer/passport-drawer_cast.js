// ---------- "The Dream Job That Keeps Your Passport" — NEW cast, locked Ricks look (thick FC ink, soft shade, painted detail) ----------
// Everything here builds on characters/rick.js helpers (P, fillLine, ell, line, qc, sup, clip, softShade, inkRing, mulc, FC, LINE, D2R).

// hero arrival: mustard polo, collar + placket + rolled sleeves, khaki trousers
OUTFIT.polo = (g, b, o) => {
  const c = o.top ?? "#e8b23a"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 2], [b.cx + s * 42, b.y0 - 8], [b.cx + s * 34, b.y0 + 24]]); fillLine(g, mulc(c, 1.12), 3); }
  P(g, [[b.cx - 8, b.y0 + 2], [b.cx + 8, b.y0 + 2], [b.cx + 8, b.y0 + 56], [b.cx - 8, b.y0 + 56]]); fillLine(g, mulc(c, 0.9), 2.5);
  for (const k of [18, 38]) ell(g, b.cx, b.y0 + k, 3.5, 3.5, "#f6f1e6", 1.8);
  for (const s of [-1, 1]) { P(g, sup(b.cx + s * (b.w / 2 - 4), b.y0 + 40, 22, 34, 2, 2)); fillLine(g, mulc(c, 0.92), 3); line(g, [[b.cx + s * (b.w / 2 - 22), b.y0 + 62], [b.cx + s * (b.w / 2 + 14), b.y0 + 62]], 2.5, mulc(c, 0.7)); }
  P(g, [[b.cx + 18, b.y0 + 70], [b.cx + 44, b.y0 + 70], [b.cx + 44, b.y0 + 96], [b.cx + 18, b.y0 + 96]]); fillLine(g, mulc(c, 0.95), 2.2);
  g.fillStyle = o.pants ?? "#b7a27a"; g.fillRect(b.x0 - 20, b.y1 - 50, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 50], [b.x1 + 20, b.y1 - 50]], 3);
  g.fillStyle = "#5a3a24"; g.fillRect(b.x0 - 20, b.y1 - 56, b.w + 40, 8); ell(g, b.cx, b.y1 - 52, 7, 6, "#e5c158", 2);
};
// work coverall: zip, chest pocket, name tape, reflective knee band, sweat patches optional
OUTFIT.coverall = (g, b, o) => {
  const c = o.top ?? "#6f93b8"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 40, b.y0 - 8], [b.cx + s * 30, b.y0 + 22]]); fillLine(g, mulc(c, 0.86), 3); }
  line(g, [[b.cx, b.y0 + 4], [b.cx, b.y1 + 10]], 3, mulc(c, 0.6)); g.setLineDash([3, 4]); line(g, [[b.cx + 4, b.y0 + 8], [b.cx + 4, b.y1 + 10]], 1.6, "#d8dde2"); g.setLineDash([]);
  P(g, [[b.cx - 46, b.y0 + 48], [b.cx - 16, b.y0 + 48], [b.cx - 16, b.y0 + 78], [b.cx - 46, b.y0 + 78]]); fillLine(g, mulc(c, 0.92), 2.5);
  P(g, [[b.cx + 14, b.y0 + 44], [b.cx + 50, b.y0 + 44], [b.cx + 50, b.y0 + 58], [b.cx + 14, b.y0 + 58]]); fillLine(g, o.tape ?? "#f4f1ea", 2);
  g.fillStyle = mulc(c, 0.7); g.fillRect(b.x0 - 20, b.y0 + 118, b.w + 40, 12); line(g, [[b.x0 - 20, b.y0 + 118], [b.x1 + 20, b.y0 + 118]], 2.5);
  if (o.band !== false) { g.fillStyle = o.bandCol ?? "#f2d24a"; g.fillRect(b.x0 - 20, b.y1 - 40, b.w + 40, 12); line(g, [[b.x0 - 20, b.y1 - 40], [b.x1 + 20, b.y1 - 40]], 2); line(g, [[b.x0 - 20, b.y1 - 28], [b.x1 + 20, b.y1 - 28]], 2); }
  if (o.dirt) { g.fillStyle = "rgba(90,60,30,0.28)"; for (const [x, y, r] of [[-30, 150, 16], [26, 180, 12], [40, 90, 9]]) { g.beginPath(); g.ellipse(b.cx + x, b.y0 + y, r, r * 0.7, 0.4, 0, 6.3); g.fill(); } }
};
// boss: cream linen suit, gold tie, magenta pocket square, gold watch chain
OUTFIT.linen = (g, b, o) => {
  OUTFIT.suit(g, b, { ...o, top: o.top ?? "#eadfc4", shirt: "#ffffff", tie: "#e2b23a", trim: "#c9b48a" });
  P(g, [[b.cx - 50, b.y0 + 52], [b.cx - 26, b.y0 + 52], [b.cx - 30, b.y0 + 66], [b.cx - 38, b.y0 + 60], [b.cx - 46, b.y0 + 68]]); fillLine(g, "#d2337a", 2.5);
  line(g, qc([b.cx + 14, b.y0 + 150], [b.cx + 34, b.y0 + 166], [b.cx + 54, b.y0 + 146]), 3, "#e5c158");
};
// mother: violet kurta-style top with a teal shawl over one shoulder, embroidered hem
OUTFIT.shawl = (g, b, o) => {
  const c = o.top ?? "#8a5cc2"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  P(g, [[b.x0 - 20, b.y0 - 10], [b.x0 + 30, b.y0 - 20], [b.x1 + 20, b.y0 + 150], [b.x1 + 20, b.y0 + 200], [b.x0 - 20, b.y0 + 40]]); fillLine(g, o.shawl ?? "#2fa59a", 3);
  for (let i = 0; i < 5; i++) ell(g, b.x0 + 10 + i * 28, b.y0 + 18 + i * 34, 5, 5, "#f2c14e", 1.5);
  g.fillStyle = "#e5c158"; g.fillRect(b.x0 - 20, b.y1 - 30, b.w + 40, 10); for (let i = -4; i <= 4; i++) ell(g, b.cx + i * 18, b.y1 - 25, 3, 3, "#d2337a", 0);
};
// airport officer: teal short-sleeve uniform, epaulettes, badge, name bar
OUTFIT.officer = (g, b, o) => {
  const c = o.top ?? "#2f8c92"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 2], [b.cx + s * 40, b.y0 - 8], [b.cx + s * 32, b.y0 + 22]]); fillLine(g, mulc(c, 1.12), 3);
    P(g, [[b.cx + s * 38, b.y0 - 4], [b.cx + s * 70, b.y0 + 2], [b.cx + s * 68, b.y0 + 14], [b.cx + s * 38, b.y0 + 10]]); fillLine(g, "#1d3b4a", 2.5); line(g, [[b.cx + s * 46, b.y0 + 6], [b.cx + s * 60, b.y0 + 8]], 2.5, "#e5c158"); }
  line(g, [[b.cx, b.y0 + 4], [b.cx, b.y1 - 50]], 2.5, mulc(c, 0.7)); for (const k of [40, 80, 120]) ell(g, b.cx, b.y0 + k, 4, 4, "#e5c158", 1.8);
  P(g, [[b.cx - 46, b.y0 + 44], [b.cx - 34, b.y0 + 38], [b.cx - 22, b.y0 + 44], [b.cx - 24, b.y0 + 62], [b.cx - 34, b.y0 + 70], [b.cx - 44, b.y0 + 62]]); fillLine(g, "#e5c158", 2.5);
  P(g, [[b.cx + 14, b.y0 + 46], [b.cx + 48, b.y0 + 46], [b.cx + 48, b.y0 + 56], [b.cx + 14, b.y0 + 56]]); fillLine(g, "#f4f1ea", 2);
  g.fillStyle = "#1d2a3a"; g.fillRect(b.x0 - 20, b.y1 - 50, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 50], [b.x1 + 20, b.y1 - 50]], 3);
};
// recruiter: loud red floral shirt, gold chain, white trousers
OUTFIT.loud = (g, b, o) => {
  const c = o.top ?? "#d63b3b"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const [x, y] of [[-40, 40], [30, 30], [-10, 90], [44, 110], [-46, 140], [14, 160]]) { for (let k = 0; k < 5; k++) { const a = k * 1.2566; ell(g, b.cx + x + Math.cos(a) * 9, b.y0 + y + Math.sin(a) * 9, 7, 7, "#f6d24a", 1.6); } ell(g, b.cx + x, b.y0 + y, 4, 4, "#f08a2a", 0); }
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 30], [b.cx + s * 44, b.y0 - 8], [b.cx + s * 30, b.y0 + 20]]); fillLine(g, mulc(c, 1.15), 3); }
  line(g, qc([b.cx - 24, b.y0 + 4], [b.cx, b.y0 + 40], [b.cx + 24, b.y0 + 4]), 4, "#e5c158"); ell(g, b.cx, b.y0 + 40, 7, 7, "#e5c158", 2);
  g.fillStyle = "#f1ece0"; g.fillRect(b.x0 - 20, b.y1 - 46, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 46], [b.x1 + 20, b.y1 - 46]], 3);
};
// slick combed-back hair with a gloss streak (boss)
HATS.slick = (g, cx, cy, o) => { const c = o.hair ?? "#1d1614";
  const pts = [...qc([cx - 100, cy - 26], [cx - 108, cy - 118], [cx, cy - 122]), ...qc([cx, cy - 122], [cx + 108, cy - 118], [cx + 100, cy - 26]), ...qc([cx + 100, cy - 26], [cx + 88, cy - 92], [cx + 10, cy - 94]), ...qc([cx + 10, cy - 94], [cx - 88, cy - 92], [cx - 100, cy - 26])];
  softShade(g, pts, cx, cy - 70, 100, c, mulc(c, 0.7)); P(g, pts); fillLine(g, null);
  for (const dx of [-50, -10, 30]) line(g, qc([cx + dx - 20, cy - 80], [cx + dx + 10, cy - 116], [cx + dx + 50, cy - 104]), 3, mulc(c, 2.6)); };
// side-part hair (hero), short and neat
HATS.part = (g, cx, cy, o) => { const c = o.hair ?? "#2a1d18";
  const pts = [...qc([cx - 101, cy - 24], [cx - 110, cy - 122], [cx - 10, cy - 120]), ...qc([cx - 10, cy - 120], [cx + 110, cy - 122], [cx + 101, cy - 30]), ...qc([cx + 101, cy - 30], [cx + 78, cy - 92], [cx - 30, cy - 90]), [cx - 36, cy - 98], ...qc([cx - 36, cy - 98], [cx - 88, cy - 80], [cx - 101, cy - 24])];
  softShade(g, pts, cx, cy - 70, 100, c, mulc(c, 0.7)); P(g, pts); fillLine(g, null); line(g, qc([cx - 34, cy - 108], [cx - 32, cy - 96], [cx - 34, cy - 84]), 4, mulc(c, 0.55)); line(g, qc([cx + 10, cy - 108], [cx + 50, cy - 112], [cx + 80, cy - 92]), 4, mulc(c, 1.8)); };
// combover (recruiter)
HATS.combover = (g, cx, cy, o) => { const c = o.hair ?? "#5a3b2a"; for (const s of [-1, 1]) ell(g, cx + s * 94, cy - 10, 18, 34, c, 3.5);
  for (let i = 0; i < 4; i++) line(g, qc([cx - 92, cy - 40 - i * 14], [cx - 10, cy - 112 + i * 6], [cx + 88, cy - 52 - i * 8]), 6, i % 2 ? c : mulc(c, 1.25)); };
// officer peaked cap: white top, teal band, gold badge
HATS.peakcap = (g, cx, cy, o) => { g.save(); g.translate(cx, cy - 12);
  const top = [[-86, -64], [-100, -136], ...qc([-100, -136], [0, -156], [100, -136]), [86, -64]]; softShade(g, top, 0, -110, 100, "#f4f6f8", "#c8ced6");
  clip(g, top, () => { g.fillStyle = o.hatCol ?? "#2f8c92"; g.fillRect(-110, -92, 220, 28); line(g, [[-110, -92], [110, -92]], 2.5); }); inkRing(g, top, 9, 0.3, Math.PI * 0.5, FC);
  P(g, [[-12, -118], [0, -132], [12, -118], [0, -104]]); fillLine(g, "#e5c158", 3);
  const vis = [...qc([-72, -66], [0, -74], [72, -66]), ...qc([72, -66], [0, -40], [-72, -66])]; softShade(g, vis, 0, -58, 70, "#1a1f2c", "#0b0d16"); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
HATS.gbun = (g, cx, cy, o) => { HATS.hair(g, cx, cy, o); };
HAIR_BEHIND.gbun = (g, cx, cy, o) => ell(g, cx - 6, cy - 118, 44, 36, o.hair ?? "#9a958c");

// held props (painted on the card): passport, contract, duffel, phone already exists
PROPS.passport = (g, x, y) => { P(g, [[x - 20, y - 28], [x + 20, y - 28], [x + 20, y + 26], [x - 20, y + 26]]); fillLine(g, "#7a1f2e", 3.5, FC); ell(g, x, y - 4, 9, 9, null, 2.5); line(g, [[x - 10, y + 14], [x + 10, y + 14]], 2.5, "#e5c158"); ell(g, x, y - 4, 9, 9, null, 2); g.strokeStyle = "#e5c158"; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 4, 9, 0, 6.3); g.stroke(); };
PROPS.contract = (g, x, y) => { P(g, [[x - 30, y - 42], [x + 30, y - 42], [x + 30, y + 40], [x - 30, y + 40]]); fillLine(g, "#fbf6e8", 3.5, FC); for (let i = 0; i < 6; i++) line(g, [[x - 20, y - 30 + i * 9], [x + 20, y - 30 + i * 9]], 2, "#8a8a9a"); g.save(); g.translate(x + 4, y + 22); g.rotate(-0.25); P(g, [[-22, -9], [22, -9], [22, 9], [-22, 9]]); fillLine(g, null, 2.5, "#c0392b"); g.fillStyle = "#c0392b"; g.font = "bold 11px sans-serif"; g.fillText("DREAM JOB", -20, 4); g.restore(); };
PROPS.duffel = (g, x, y) => { P(g, sup(x, y + 30, 48, 26, 2.4, 2.4)); fillLine(g, "#3f6fb0", 3.5, FC); line(g, [[x - 40, y + 30], [x + 40, y + 30]], 2.5, "#2c4f80"); line(g, qc([x - 24, y + 8], [x, y - 14], [x + 24, y + 8]), 5, FC); ell(g, x + 30, y + 20, 5, 5, "#e5c158", 2); };
PROPS.wallet = (g, x, y) => { P(g, [[x - 24, y - 14], [x + 24, y - 14], [x + 24, y + 16], [x - 24, y + 16]]); fillLine(g, "#6a3f22", 3.5, FC); P(g, [[x - 18, y - 22], [x + 14, y - 20], [x + 16, y - 12], [x - 18, y - 12]]); fillLine(g, "#8fbf6a", 2.5, FC); };

export const CAST = {
  hero: { label: "YOU (new arrival)", o: { outfit: "polo", top: "#e8b23a", pants: "#b7a27a", hat: "part", hair: "#2a1d18", shoes: "#5a3a24" }, opts: { expr: "beam", R: "hold", propR: "duffel", L: "wave" } },
  heroWork: { label: "YOU (month 2)", o: { outfit: "coverall", top: "#6f93b8", hat: "part", hair: "#2a1d18", dirt: true, tape: "#f4f1ea", shoes: "#3a2a22" }, opts: { expr: "nervous", L: "hang", R: "chin" } },
  boss: { label: "THE BOSS (sponsor)", o: { outfit: "linen", hat: "slick", hair: "#1d1614", moustache: "#1d1614", shoes: "#6a3f22" }, opts: { expr: "grin", L: "hip", R: "holdUp", propR: "passport" } },
  bunk: { label: "BUNKMATE (9 years)", o: { outfit: "coverall", top: "#e07a3a", bandCol: "#f4f1ea", hat: "beanie", hatCol: "#3f8a4a", moustache: "#9a958c", dirt: true, shoes: "#3a2a22" }, opts: { expr: "smugsmile", L: "hang", R: "holdUp", propR: "wallet" } },
  mom: { label: "MOTHER (back home)", o: { outfit: "shawl", top: "#8a5cc2", shawl: "#2fa59a", hairStyle: "gbun", hair: "#9a958c", shoes: "#6a3f22" }, opts: { expr: "smile", L: "hang", R: "mouth", propR: "phone" } },
  officer: { label: "AIRPORT OFFICER", o: { outfit: "officer", hat: "peakcap", hatCol: "#2f8c92", shoes: "#141826" }, opts: { expr: "stern", L: "hip", R: "point" } },
  agent: { label: "RECRUITMENT AGENT", o: { outfit: "loud", top: "#d63b3b", hat: "combover", hair: "#5a3b2a", goatee: "#5a3b2a", shoes: "#f1ece0" }, opts: { expr: "sly", L: "thumb", R: "hold", propR: "contract" } },
  room1: { label: "roommate", o: { outfit: "coverall", top: "#8fae5a", hat: "hardhat", hatCol: "#f5c02e", shoes: "#3a2a22" }, opts: { expr: "sleepy" } },
  room2: { label: "roommate", o: { outfit: "coverall", top: "#c45a8a", hat: "cap", hatCol: "#3f6fb0", shoes: "#3a2a22" }, opts: { expr: "bored" } },
  room3: { label: "roommate", o: { outfit: "coverall", top: "#5a9ec4", hairStyle: "curly", hair: "#1e1714", shoes: "#3a2a22" }, opts: { expr: "think" } },
};
