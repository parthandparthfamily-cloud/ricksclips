// ---------------- Ricks Clips style character renderer — LOCKED STYLE (matched to Ricks Clips frames) ----------------
// White round head (slightly wider than tall), THICK near-black brown brush outline heavier at the bottom (~6% of head width),
// pear-shaped pill body with clothes painted on, chunky brown limbs with small dark hands, small dark shoe ovals,
// big expressive face: dark oval / dash / ring / half-lid / >< eyes, thick arched brows high on the forehead,
// wide dark D-grin with a white tooth row, heavy frowns. Hats sit on the crown so the brows always show.
// Units: head radius = 100. Origin = between the feet on the ground (0, 0); pose "sit" origin = the seat. Up is negative y.
// Usage: rick(ctx2d, outfitObject, { pose, expr, look, L, R, propL, propR, headTilt }) after ctx.translate(x, y) + ctx.scale(s, s).

const LINE = "#2e211d", HEAD = "#f8f6f2", HEAD_SH = "#d8d1c8", LW = 6;
const D2R = Math.PI / 180;
const mulc = (hex, k) => { const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v, i) => Math.max(0, Math.min(255, Math.round(v * (Array.isArray(k) ? k[i] : k))))); return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join(""); };

// path helpers
const P = (g, pts, close = true) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath(); };
const fillLine = (g, fill, lw = LW, col = LINE) => { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = col; g.lineJoin = "round"; g.lineCap = "round"; g.stroke(); } };
const ell = (g, x, y, rx, ry, fill, lw = LW, rot = 0) => { g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); fillLine(g, fill, lw); };
const line = (g, pts, lw = LW, col = LINE) => { P(g, pts, false); g.lineWidth = lw; g.strokeStyle = col; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); };
const qc = (a, c, b, n = 14) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; o.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]); } return o; };
const sup = (cx, cy, rx, ry, nT = 2.6, nB = 2.6, n = 64) => { const o = []; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? nT : nB); o.push([cx + rx * Math.sign(c) * Math.abs(c) ** e, cy + ry * Math.sign(s) * Math.abs(s) ** e]); } return o; };
const clip = (g, pts, fn) => { g.save(); P(g, pts); g.clip(); fn(); g.restore(); };
const softShade = (g, pts, cx, cy, r, base, sh) => { const gr = g.createRadialGradient(cx - 0.35 * r, cy - 0.4 * r, 0.1 * r, cx, cy, 1.25 * r); gr.addColorStop(0, base); gr.addColorStop(0.62, base); gr.addColorStop(1, sh); P(g, pts); g.fillStyle = gr; g.fill(); };


const inkRing = (g, pts, w0 = 7, k = 0.6, ang = Math.PI * 0.32, col = LINE) => {
  const n = pts.length; let cx = 0, cy = 0; for (const [x, y] of pts) { cx += x / n; cy += y / n; }
  const out = [], inn = [];
  pts.forEach((q, i) => { const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n]; let nx = b[1] - a[1], ny = a[0] - b[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - ang)) * (1 + 0.08 * Math.sin(i * 1.7));
    out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]); });
  g.beginPath(); out.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); inn.reverse().forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  g.fillStyle = col; g.fill("evenodd");
};
// tapered brush stroke for limbs
const limbStroke = (g, pts, w0, w1, col = LINE) => { const n = pts.length; for (let i = 0; i < n - 1; i++) { const t = i / (n - 1); line(g, [pts[i], pts[i + 1]], w0 + (w1 - w0) * t, col); } };

// ---------- faces (measured from his close-ups; units: head radius 100) ----------
const FC = "#2b1f1c";
const EYES = {
  dot: (g, x, y) => ell(g, x, y, 8, 12.5, FC, 0),
  dash: (g, x, y) => line(g, [[x - 15, y], [x + 15, y]], 8, FC),
  ring: (g, x, y) => { ell(g, x, y, 18, 18, "#fff", 6); ell(g, x, y, 5, 5, FC, 0); },
  half: (g, x, y, s) => { g.save(); g.beginPath(); g.rect(x - 20, y - 2, 40, 30); g.clip(); ell(g, x, y - 1, 10, 11, FC, 0); g.restore(); line(g, [[x - 13, y - 2], [x + 13, y - 2]], 6, FC); },
  smug: (g, x, y, s) => { g.save(); g.beginPath(); g.rect(x - 20, y, 40, 30); g.clip(); ell(g, x + 2, y + 1, 10, 9, FC, 0); g.restore(); line(g, qc([x - 14, y + 2], [x, y - 3], [x + 14, y + 1]), 6, FC); },
  happy: (g, x, y) => line(g, qc([x - 15, y + 5], [x, y - 11], [x + 15, y + 5]), 7.5, FC),
  wink: (g, x, y) => line(g, qc([x - 14, y - 2], [x, y + 8], [x + 14, y - 2]), 7.5, FC),
  chev: (g, x, y, s) => line(g, [[x + 13 * s, y - 10], [x - 11 * s, y], [x + 13 * s, y + 10]], 7.5, FC),
};
// brow: [innerDy, outerDy, arch] ; arched thick strokes well above the eyes
const FACES = {
  neutral:   { eyes: ["dot", "dot"],   brows: [[0, 0, 6], [0, 0, 6]],       mouth: "small" },
  grin:      { eyes: ["dot", "dot"],   brows: [[-4, -2, 9], [-4, -2, 9]],   mouth: "grin" },
  beam:      { eyes: ["dash", "dash"], brows: [[-6, -4, 9], [-6, -4, 9]],   mouth: "grin" },
  smile:     { eyes: ["dot", "dot"],   brows: [[-3, -1, 7], [-3, -1, 7]],   mouth: "smile" },
  smugsmile: { eyes: ["happy", "happy"], brows: [[-4, -2, 7], [-4, -2, 7]], mouth: "smile" },
  smirk:     { eyes: ["smug", "smug"], brows: [[3, -1, 4], [-6, -10, 8]],   mouth: "smirk" },
  sly:       { eyes: ["smug", "dot"],  brows: [[6, 0, 3], [-8, -12, 9]],    mouth: "smirk" },
  bored:     { eyes: ["dash", "dash"], brows: [[-2, 0, 7], [-2, 0, 7]],     mouth: "flat" },
  sleepy:    { eyes: ["dash", "dash"], brows: [[2, 4, 3], [2, 4, 3]],       mouth: "tiny" },
  stern:     { eyes: ["half", "half"], brows: [[8, -3, 2], [8, -3, 2]],     mouth: "frown" },
  angry:     { eyes: ["half", "half"], brows: [[12, -6, 0], [12, -6, 0]],   mouth: "tinyfrown" },
  shock:     { eyes: ["ring", "ring"], brows: [[-10, -8, 8], [-10, -8, 8]], mouth: "o" },
  nervous:   { eyes: ["ring", "ring"], brows: [[-12, 2, 4], [-12, 2, 4]],   mouth: "squiggle", sweat: true },
  think:     { eyes: ["dot", "dot"],   brows: [[-8, 0, 6], [4, -6, 6]],     mouth: "tinyfrown" },
  laugh:     { eyes: ["chev", "chev"], brows: [[-6, -4, 8], [-6, -4, 8]],   mouth: "open" },
  wink:      { eyes: ["wink", "dot"],  brows: [[0, -2, 7], [-6, -8, 9]],    mouth: "grin" },
};
const RMOUTH = {
  small: (g, x, y) => line(g, [[x - 9, y + 2], [x + 9, y + 2]], 6.5, FC),
  tiny: (g, x, y) => line(g, [[x - 5, y + 4], [x + 6, y + 2]], 6, FC),
  flat: (g, x, y) => line(g, [[x - 14, y + 4], [x + 14, y + 3]], 6.5, FC),
  smile: (g, x, y) => line(g, qc([x - 30, y - 6], [x, y + 18], [x + 30, y - 6]), 7, FC),
  smirk: (g, x, y) => line(g, qc([x - 22, y + 6], [x + 4, y + 12], [x + 26, y - 6]), 7, FC),
  frown: (g, x, y) => line(g, qc([x - 30, y + 18], [x, y - 12], [x + 30, y + 18]), 7.5, FC),
  tinyfrown: (g, x, y) => { P(g, [...qc([x - 12, y + 8], [x, y - 2], [x + 12, y + 8]), ...qc([x + 12, y + 8], [x, y + 4], [x - 12, y + 8])]); fillLine(g, FC, 5, FC); },
  o: (g, x, y) => ell(g, x, y + 8, 11, 13, FC, 0),
  squiggle: (g, x, y) => { const p = []; for (let i = 0; i <= 10; i++) p.push([x - 10 + i * 2, y + 6 + 2.6 * Math.sin(i * 1.6)]); line(g, p, 4.5, FC); },
  grin: (g, x, y) => { const top = qc([x - 50, y - 8], [x, y + 4], [x + 50, y - 8], 18), bot = qc([x + 50, y - 8], [x, y + 60], [x - 50, y - 8], 18);
    P(g, [...top, ...bot]); fillLine(g, FC, 0);
    g.save(); P(g, [...top, ...bot]); g.clip(); g.fillStyle = "#ffffff"; for (let i = -3; i <= 3; i++) { const tx = x + i * 13; g.fillRect(tx - 5, y - 10, 10, 14); } g.restore();
    P(g, [...top, ...bot]); fillLine(g, null, 6, FC); },
  open: (g, x, y) => { const top = qc([x - 42, y - 6], [x, y + 2], [x + 42, y - 6], 18), bot = qc([x + 42, y - 6], [x, y + 80], [x - 42, y - 6], 18);
    P(g, [...top, ...bot]); fillLine(g, FC, 0); g.save(); P(g, [...top, ...bot]); g.clip(); g.fillStyle = "#fff"; for (let i = -2; i <= 2; i++) g.fillRect(x + i * 12 - 5, y - 10, 10, 13); ell(g, x + 4, y + 34, 18, 10, "#d8566a", 0); g.restore(); P(g, [...top, ...bot]); fillLine(g, null, 6, FC); },
};
const face = (g, cx, cy, expr, look = 0, o = {}) => {
  const F = FACES[expr] ?? FACES.neutral, ey = cy - 10, ex = 27, lx = look * 8;
  [-1, 1].forEach((s, i) => {
    const ek = o.blink && !['dash', 'happy', 'chev', 'wink'].includes(F.eyes[i]) ? 'dash' : F.eyes[i];
    EYES[ek](g, cx + s * ex + lx, ey, s);
    if (!o.noBrows) { const [di, dout, arch] = F.brows[i], by = ey - 38, a = [cx + s * 12 + lx, by + di], b = [cx + s * 46 + lx, by + dout];
      line(g, qc(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - arch], b), 7.5, o.browCol ?? FC); }
  });
  if (F.sweat) { P(g, [[cx + 62, cy - 52], [cx + 54, cy - 36], [cx + 62, cy - 28], [cx + 70, cy - 36]]); fillLine(g, "#8fd0f5", 3.5, FC); }
  const mx = cx + lx * 0.6, my = cy + 28;
  if (o.moustache) { for (const s of [-1, 1]) { P(g, [...qc([mx + s * 2, my - 12], [mx + s * 22, my - 18], [mx + s * 34, my - 2]), ...qc([mx + s * 34, my - 2], [mx + s * 38, my - 14], [mx + s * 30, my - 16]), [mx + s * 36, my - 12], ...qc([mx + s * 30, my - 6], [mx + s * 16, my - 4], [mx + s * 2, my - 4])]); fillLine(g, o.moustache, 3, FC); } }
  RMOUTH[o.talk ? (o.talk > 0.5 ? 'o' : 'small') : F.mouth](g, mx, my + (o.moustache ? 4 : 0));
  if (o.goatee) { P(g, [[mx - 9, my + 18], [mx + 9, my + 18], [mx + 5, my + 38], [mx, my + 44], [mx - 5, my + 38]]); fillLine(g, o.goatee, 3, FC); }
};

// ---------- hats & hair ----------
const HATS = {
  cap: (g, cx, cy, o) => { const c = o.hatCol ?? "#d9433a"; g.save(); g.translate(cx, cy); g.rotate(-7 * D2R);
    const dome = [[-80, -60], ...qc([-80, -60], [-88, -132], [0, -132]), ...qc([0, -132], [88, -132], [80, -60]), ...qc([80, -60], [0, -78], [-80, -60])];
    softShade(g, dome, 0, -100, 90, c, mulc(c, 0.7)); clip(g, dome, () => { for (const dx of [-38, 0, 38]) { g.setLineDash([6, 5]); line(g, qc([dx * 0.15, -128], [dx * 1.05, -112], [dx * 1.5, -66]), 2.6, mulc(c, 1.35)); g.setLineDash([]); line(g, qc([dx * 0.15, -128], [dx * 1.05, -112], [dx * 1.5, -66]), 2, mulc(c, 0.62)); } });
    inkRing(g, dome, 9, 0.3, Math.PI * 0.5, FC); ell(g, 0, -131, 9, 6, mulc(c, 0.85), 4);
    const vis = [...qc([-70, -70], [0, -82], [78, -70]), ...qc([78, -70], [10, -40], [-70, -70])];
    softShade(g, vis, 0, -64, 70, mulc(c, 0.9), mulc(c, 0.65)); g.setLineDash([6, 5]); line(g, qc([-56, -66], [8, -52], [64, -66]), 2.4, mulc(c, 1.35)); g.setLineDash([]); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); },
  hair: (g, cx, cy, o) => { const c = o.hair ?? "#3a2a22"; const pts = [...qc([cx - 99, cy - 10], [cx - 112, cy - 120], [cx - 10, cy - 116]), ...qc([cx - 10, cy - 116], [cx + 108, cy - 118], [cx + 99, cy - 20]), ...qc([cx + 99, cy - 20], [cx + 70, cy - 64], [cx + 20, cy - 66]), ...qc([cx + 20, cy - 66], [cx - 40, cy - 48], [cx - 58, cy - 74]), ...qc([cx - 58, cy - 74], [cx - 80, cy - 40], [cx - 99, cy - 10])]; softShade(g, pts, cx, cy - 70, 100, c, mulc(c, 0.7)); P(g, pts); fillLine(g, null); line(g, qc([cx - 30, cy - 100], [cx + 20, cy - 108], [cx + 60, cy - 90]), 4, mulc(c, 1.5)); },
  fedora: (g, cx, cy, o) => { const c = o.hatCol ?? "#3e3943", b = o.band ?? "#7c2630"; g.save(); g.translate(cx, cy - 18); g.rotate(-6 * D2R); const cr = [[-92, -48], ...qc([-92, -48], [-96, -150], [-60, -150]), ...qc([-60, -150], [0, -134], [60, -150]), ...qc([60, -150], [96, -150], [92, -48])]; softShade(g, cr, 0, -100, 100, c, mulc(c, 0.7)); clip(g, cr, () => { g.fillStyle = b; g.fillRect(-120, -82, 240, 30); line(g, [[-120, -82], [120, -82]], 2.5); }); P(g, cr); fillLine(g, null); line(g, qc([-40, -136], [0, -124], [40, -136]), 3, mulc(c, 0.6)); const br = [...qc([-150, -44], [0, -70], [150, -50]), ...qc([150, -50], [0, -14], [-150, -44])]; softShade(g, br, 0, -40, 150, mulc(c, 1.05), mulc(c, 0.72)); P(g, br); fillLine(g, null); g.restore(); },
  hardhat: (g, cx, cy, o) => { const c = o.hatCol ?? "#f5c02e"; const d = [[cx - 102, cy - 30], ...qc([cx - 102, cy - 30], [cx - 104, cy - 140], [cx, cy - 138]), ...qc([cx, cy - 138], [cx + 104, cy - 140], [cx + 102, cy - 30])]; softShade(g, d, cx, cy - 90, 100, c, mulc(c, [0.8, 0.7, 0.55])); clip(g, d, () => { g.fillStyle = mulc(c, [1.04, 1.02, 0.86]); g.fillRect(cx - 14, cy - 150, 28, 130); }); P(g, d); fillLine(g, null); P(g, [[cx - 122, cy - 32], [cx + 122, cy - 32], [cx + 116, cy - 16], [cx - 116, cy - 16]]); fillLine(g, mulc(c, 0.9)); },
  straw: (g, cx, cy, o) => { const c = "#e9c86f"; const br = sup(cx, cy - 40, 172, 30, 2, 2); softShade(g, br, cx, cy - 40, 170, c, mulc(c, [0.8, 0.72, 0.6])); clip(g, br, () => { for (let i = -10; i <= 10; i++) line(g, [[cx + i * 18, cy - 70], [cx + i * 22, cy - 10]], 1.6, "#c99b42"); }); P(g, br); fillLine(g, null); const cr = [[cx - 82, cy - 46], ...qc([cx - 82, cy - 46], [cx - 84, cy - 132], [cx, cy - 130]), ...qc([cx, cy - 130], [cx + 84, cy - 132], [cx + 82, cy - 46])]; softShade(g, cr, cx, cy - 90, 90, c, mulc(c, [0.8, 0.72, 0.6])); clip(g, cr, () => { g.fillStyle = "#c0392b"; g.fillRect(cx - 100, cy - 78, 200, 22); }); P(g, cr); fillLine(g, null); },
  pilot: (g, cx, cy, o) => { const c = "#28324f"; const top = [[cx - 92, cy - 40], [cx - 118, cy - 112], ...qc([cx - 118, cy - 112], [cx, cy - 140], [cx + 118, cy - 112]), [cx + 92, cy - 40]]; softShade(g, top, cx, cy - 90, 110, c, mulc(c, 0.7)); P(g, top); fillLine(g, null); P(g, [[cx - 94, cy - 64], [cx + 94, cy - 64], [cx + 92, cy - 40], [cx - 92, cy - 40]]); fillLine(g, "#1a2238"); line(g, [[cx - 90, cy - 58], [cx + 90, cy - 58]], 3.5, "#e5c158"); P(g, [...qc([cx - 80, cy - 42], [cx, cy - 52], [cx + 80, cy - 42]), ...qc([cx + 80, cy - 42], [cx, cy - 14], [cx - 80, cy - 42])]); fillLine(g, "#14182a"); ell(g, cx, cy - 92, 10, 10, "#e5c158", 3); for (const s of [-1, 1]) { P(g, [[cx + s * 8, cy - 96], [cx + s * 40, cy - 104], [cx + s * 34, cy - 88], [cx + s * 8, cy - 86]]); fillLine(g, "#e5c158", 2.5); } },
  beanie: (g, cx, cy, o) => { const c = o.hatCol ?? "#c0392b"; const d = [[cx - 101, cy - 34], ...qc([cx - 101, cy - 34], [cx - 104, cy - 150], [cx, cy - 146]), ...qc([cx, cy - 146], [cx + 104, cy - 150], [cx + 101, cy - 34])]; softShade(g, d, cx, cy - 90, 100, c, mulc(c, 0.7)); clip(g, d, () => { for (let i = -6; i <= 6; i++) line(g, [[cx + i * 16, cy - 40], [cx + i * 13, cy - 150]], 2, mulc(c, 0.8)); }); P(g, d); fillLine(g, null); P(g, sup(cx, cy - 40, 106, 20, 2.2, 2.2)); fillLine(g, mulc(c, 0.88)); ell(g, cx, cy - 152, 18, 16, mulc(c, 1.15)); },
  tophat: (g, cx, cy, o) => { const c = "#24222a"; P(g, [[cx - 68, cy - 70], [cx - 74, cy - 230], [cx + 74, cy - 230], [cx + 68, cy - 70]]); fillLine(g, c); g.fillStyle = "#7c2630"; g.fillRect(cx - 69, cy - 104, 138, 26); line(g, [[cx - 69, cy - 104], [cx + 69, cy - 104]], 2.5); line(g, [[cx - 69, cy - 78], [cx + 69, cy - 78]], 2.5); P(g, sup(cx, cy - 70, 112, 16, 2, 2)); fillLine(g, c); line(g, [[cx - 50, cy - 210], [cx - 46, cy - 120]], 5, "#4a4752"); },
  laurel: (g, cx, cy) => { for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { const a = (205 + i * 20) * D2R, x = cx + s * -Math.cos(a) * 98, y = cy - 20 + Math.sin(a) * 92; ell(g, x, y, 15, 7, i % 2 ? "#79a53e" : "#5f8a30", 2.6, s * (0.7 + i * 0.3)); } },
  bald: (g, cx, cy, o) => { for (const s of [-1, 1]) ell(g, cx + s * 94, cy - 6, 20, 30, o.hair ?? "#f2f0ea", 3.5); },
  bun: (g, cx, cy, o) => { HATS.hair(g, cx, cy, o); },
  long: (g, cx, cy, o) => { HATS.hair(g, cx, cy, o); },
  pigtails: (g, cx, cy, o) => { HATS.hair(g, cx, cy, o); },
  curly: (g, cx, cy, o) => { const c = o.hair ?? "#1e1714"; for (let i = 0; i < 9; i++) { const a = (195 + i * 19) * D2R; ell(g, cx + Math.cos(a) * 92, cy - 30 + Math.sin(a) * 86, 30, 28, i % 2 ? c : mulc(c, 1.2), 3.5); } },
  spiky: (g, cx, cy, o) => { const c = o.hair ?? "#f2f0ea", pts = []; for (let i = 0; i <= 12; i++) { const a = (188 + i * 164 / 12) * D2R, r = i % 2 ? 100 : 140; pts.push([cx + Math.cos(a) * r, cy - 22 + Math.sin(a) * r * 0.95]); } softShade(g, pts, cx, cy - 80, 120, c, mulc(c, 0.8)); P(g, pts); fillLine(g, null); },
};
const HAIR_BEHIND = {
  bun: (g, cx, cy, o) => ell(g, cx + 10, cy - 116, 40, 34, o.hair ?? "#2b211c"),
  long: (g, cx, cy, o) => { const c = o.hair ?? "#6b4226", pts = sup(cx, cy + 40, 110, 128, 2.2, 3); softShade(g, pts, cx, cy, 130, c, mulc(c, 0.7)); P(g, pts); fillLine(g, null); },
  pigtails: (g, cx, cy, o) => { for (const s of [-1, 1]) { ell(g, cx + s * 118, cy + 6, 30, 46, o.hair ?? "#5a3b2a", LW, s * -0.4); ell(g, cx + s * 96, cy - 30, 9, 9, "#e2453c", 3); } },
  curly: (g, cx, cy, o) => { const c = o.hair ?? "#1e1714"; for (let i = 0; i < 12; i++) { const a = (150 + i * 22) * D2R; ell(g, cx + Math.cos(a) * 108, cy - 10 + Math.sin(a) * 100, 36, 34, c, 3.5); } },
};

// ---------- clothes painted on the pill body ----------
const OUTFIT = {
  overalls: (g, b, o) => { const sl = o.top ?? "#f2b733"; for (const sd of [-1, 1]) { P(g, sup(b.cx + sd * (b.w / 2 - 6), b.y0 + 44, 26, 40, 2, 2)); fillLine(g, mulc(sl, 0.92), 3); }
    OUTFIT._overalls(g, b, o);
    g.setLineDash([7, 6]); line(g, [[b.cx - 30, b.y0 + 72], [b.cx + 30, b.y0 + 72], [b.cx + 30, b.y0 + 116], [b.cx - 30, b.y0 + 116], [b.cx - 30, b.y0 + 72]], 2.2, "#f2c14e"); line(g, [[b.x0 - 10, b.y0 + 124], [b.x1 + 10, b.y0 + 128]], 2.2, "#f2c14e"); g.setLineDash([]);
    for (let i = 0; i < 3; i++) line(g, qc([b.cx - 40 + i * 30, b.y1 - 70], [b.cx - 36 + i * 30, b.y1 - 40], [b.cx - 42 + i * 30, b.y1 - 12]), 2.2, mulc(o.pants ?? "#5d86b8", 0.75)); },
  _overalls: (g, b, o) => { g.fillStyle = o.top ?? "#f2b733"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); const den = o.pants ?? "#5d86b8"; P(g, [[b.cx - 46, b.y0 + 62], [b.cx + 46, b.y0 + 62], [b.cx + 50, b.y0 + 116], [b.x1 + 20, b.y0 + 120], [b.x1 + 20, b.y1 + 20], [b.x0 - 20, b.y1 + 20], [b.x0 - 20, b.y0 + 120], [b.cx - 50, b.y0 + 116]]); fillLine(g, den, 3); for (const s of [-1, 1]) { line(g, [[b.cx + s * 40, b.y0 + 64], [b.cx + s * 52, b.y0 - 5]], 14, LINE); line(g, [[b.cx + s * 40, b.y0 + 64], [b.cx + s * 52, b.y0 - 5]], 9, den); ell(g, b.cx + s * 38, b.y0 + 70, 6, 6, "#e5c158", 2.5); } P(g, [[b.cx - 26, b.y0 + 80], [b.cx + 26, b.y0 + 80], [b.cx + 26, b.y0 + 112], [b.cx - 26, b.y0 + 112]]); fillLine(g, mulc(den, 0.92), 2.5); g.setLineDash([5, 5]); line(g, [[b.cx - 22, b.y0 + 84], [b.cx + 22, b.y0 + 84]], 1.6, "#e5c158"); g.setLineDash([]); if (o.patch) { P(g, [[b.cx - 12, b.y0 + 88], [b.cx + 12, b.y0 + 88], [b.cx + 12, b.y0 + 108], [b.cx - 12, b.y0 + 108]]); fillLine(g, o.patch, 2); } },
  suit: (g, b, o) => { const c = o.top ?? "#2b2f3d"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); P(g, [[b.cx - 30, b.y0 - 10], [b.cx + 30, b.y0 - 10], [b.cx, b.y0 + 96]]); fillLine(g, o.shirt ?? "#f6f3ee", 3); if (o.tie) { P(g, [[b.cx - 7, b.y0 + 8], [b.cx + 7, b.y0 + 8], [b.cx + 12, b.y0 + 74], [b.cx, b.y0 + 90], [b.cx - 12, b.y0 + 74]]); fillLine(g, o.tie, 3); } for (const s of [-1, 1]) { P(g, [[b.cx + s * 30, b.y0 - 10], [b.cx + s * 60, b.y0 + 4], [b.cx + s * 38, b.y0 + 44], [b.cx + s * 6, b.y0 + 110]]); fillLine(g, mulc(c, 1.15), 3); } if (o.trim) for (const s of [-1, 1]) line(g, [[b.cx + s * 31, b.y0 - 6], [b.cx + s * 5, b.y0 + 108]], 3, o.trim); ell(g, b.cx, b.y0 + 132, 4.5, 4.5, LINE, 0); ell(g, b.cx, b.y0 + 168, 4.5, 4.5, LINE, 0); },
  trench: (g, b, o) => { OUTFIT.suit(g, b, { ...o, top: o.top ?? "#c09257" }); g.fillStyle = mulc(o.top ?? "#c09257", 0.75); g.fillRect(b.x0 - 20, b.y0 + 150, b.w + 40, 16); line(g, [[b.x0 - 20, b.y0 + 150], [b.x1 + 20, b.y0 + 150]], 2.5); line(g, [[b.x0 - 20, b.y0 + 166], [b.x1 + 20, b.y0 + 166]], 2.5); for (const s of [-1, 1]) for (const k of [118, 186]) ell(g, b.cx + s * 26, b.y0 + k, 5, 5, "#4a3222", 2); },
  lab: (g, b, o) => { OUTFIT.suit(g, b, { ...o, top: "#f4f6f8", shirt: o.shirt ?? "#8dbbe4" }); P(g, [[b.cx + 22, b.y0 + 96], [b.cx + 52, b.y0 + 96], [b.cx + 52, b.y0 + 120], [b.cx + 22, b.y0 + 120]]); fillLine(g, "#e9edf1", 2.5); line(g, [[b.cx + 30, b.y0 + 86], [b.cx + 30, b.y0 + 104]], 4, "#3d6fb5"); line(g, [[b.cx + 41, b.y0 + 84], [b.cx + 41, b.y0 + 104]], 4, "#c0392b"); },
  toga: (g, b, o) => { g.fillStyle = "#f3eee2"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); P(g, [[b.x0 - 20, b.y0 + 4], [b.x0 + 10, b.y0 - 20], [b.x1 + 20, b.y1 - 40], [b.x1 + 20, b.y1 + 10]]); fillLine(g, o.sash ?? "#6b3c8f", 3); for (let i = 0; i < 3; i++) line(g, qc([b.x0, b.y0 + 70 + i * 40], [b.cx - 10, b.y0 + 84 + i * 40], [b.cx + 30, b.y0 + 110 + i * 40]), 2.2, "#cfc6b2"); },
  hoodie: (g, b, o) => { const c = o.top ?? "#3f8f6f"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); P(g, sup(b.cx, b.y0 + 4, 52, 20, 2, 2)); fillLine(g, mulc(c, 0.86), 3); for (const s of [-1, 1]) line(g, [[b.cx + s * 12, b.y0 + 18], [b.cx + s * 14, b.y0 + 62]], 3, "#f4f1ea"); P(g, [[b.cx - 44, b.y0 + 140], [b.cx + 44, b.y0 + 140], [b.cx + 52, b.y0 + 186], [b.cx - 52, b.y0 + 186]]); fillLine(g, mulc(c, 0.92), 3); if (o.print) ell(g, b.cx, b.y0 + 96, 20, 20, o.print, 3); },
  vest: (g, b, o) => { g.fillStyle = o.top ?? "#5c6b7a"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); for (const s of [-1, 1]) { P(g, [[b.cx + s * 12, b.y0 - 20], [b.cx + s * 90, b.y0 - 20], [b.cx + s * 90, b.y1 + 20], [b.cx + s * 10, b.y1 + 20]]); fillLine(g, "#ff8a1f", 3); } for (const y of [b.y0 + 100, b.y0 + 140]) { g.fillStyle = "#eef3f5"; g.fillRect(b.x0 - 20, y, b.w + 40, 12); line(g, [[b.x0 - 20, y], [b.x1 + 20, y]], 2); line(g, [[b.x0 - 20, y + 12], [b.x1 + 20, y + 12]], 2); } },
  pilot: (g, b, o) => { OUTFIT.suit(g, b, { ...o, top: "#28324f", tie: "#1a2238", trim: "#e5c158" }); for (const s of [-1, 1]) { P(g, [[b.cx + s * 40, b.y0 - 2], [b.cx + s * 74, b.y0 + 4], [b.cx + s * 72, b.y0 + 16], [b.cx + s * 40, b.y0 + 12]]); fillLine(g, "#e5c158", 2.5); } },
  school: (g, b, o) => { g.fillStyle = o.top ?? "#ffffff"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 34, b.y0 - 6], [b.cx + s * 24, b.y0 + 22]]); fillLine(g, "#ffffff", 2.5); } if (o.tie) { P(g, [[b.cx - 7, b.y0 + 8], [b.cx + 7, b.y0 + 8], [b.cx + 11, b.y0 + 70], [b.cx, b.y0 + 84], [b.cx - 11, b.y0 + 70]]); fillLine(g, o.tie, 3); } g.fillStyle = o.pants ?? "#3b5b9a"; g.fillRect(b.x0 - 20, b.y1 - 46, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 46], [b.x1 + 20, b.y1 - 46]], 3); if (o.backpack) for (const s of [-1, 1]) line(g, [[b.cx + s * 50, b.y0 - 10], [b.cx + s * 56, b.y1 - 50]], 12, o.backpack); },
  tee: (g, b, o) => { g.fillStyle = o.top ?? "#4f7fb8"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40); line(g, qc([b.cx - 26, b.y0 - 4], [b.cx, b.y0 + 20], [b.cx + 26, b.y0 - 4]), 3); g.fillStyle = o.pants ?? "#3b3f52"; g.fillRect(b.x0 - 20, b.y1 - 46, b.w + 40, 80); line(g, [[b.x0 - 20, b.y1 - 46], [b.x1 + 20, b.y1 - 46]], 3); },
};

// ---------- props (thin outline style) ----------
const PROPS = {
  pipe: (g, x, y) => { line(g, qc([x, y], [x + 22, y + 14], [x + 40, y + 14]), 9); line(g, qc([x, y], [x + 22, y + 14], [x + 40, y + 14]), 5, "#3a271c"); P(g, [[x + 34, y - 10], [x + 60, y - 10], [x + 57, y + 20], [x + 46, y + 26], [x + 37, y + 20]]); fillLine(g, "#6a3f22", 3.5); ell(g, x + 47, y - 10, 13, 4, "#ff8a3d", 3); },
  clipboard: (g, x, y) => { P(g, [[x - 28, y - 40], [x + 28, y - 40], [x + 28, y + 34], [x - 28, y + 34]]); fillLine(g, "#b07a45", 3.5); P(g, [[x - 21, y - 30], [x + 21, y - 30], [x + 21, y + 27], [x - 21, y + 27]]); fillLine(g, "#fff", 2); for (let i = 0; i < 4; i++) line(g, [[x - 14, y - 18 + i * 11], [x + 14, y - 18 + i * 11]], 2, "#8a8a9a"); },
  flask: (g, x, y) => { const f = [[x - 7, y - 40], [x + 7, y - 40], [x + 7, y - 18], [x + 26, y + 18], [x - 26, y + 18], [x - 7, y - 18]]; P(g, f); fillLine(g, "#e9f6ff", 0); clip(g, f, () => { g.fillStyle = "#55e08a"; g.fillRect(x - 30, y - 2, 60, 24); }); P(g, f); fillLine(g, null, 3.5); ell(g, x + 6, y - 54, 6, 6, "#9cf0b8", 2.5); ell(g, x - 4, y - 70, 4, 4, "#9cf0b8", 2.5); },
  pitchfork: (g, x, y) => { line(g, [[x, y + 150], [x, y - 140]], 9); line(g, [[x, y + 150], [x, y - 140]], 5, "#a8743f"); line(g, [[x - 22, y - 140], [x + 22, y - 140]], 6); for (const dx of [-22, 0, 22]) line(g, [[x + dx, y - 140], [x + dx, y - 186]], 4.5); },
  wrench: (g, x, y) => { line(g, [[x, y], [x + 10, y - 60]], 13); line(g, [[x, y], [x + 10, y - 60]], 8, "#b6bec7"); ell(g, x + 12, y - 70, 17, 17, "#b6bec7", 3.5); ell(g, x + 12, y - 82, 7, 9, "#7a4a12", 0); },
  briefcase: (g, x, y) => { P(g, [[x - 36, y + 8], [x + 36, y + 8], [x + 36, y + 56], [x - 36, y + 56]]); fillLine(g, "#5a3524", 3.5); line(g, qc([x - 12, y + 8], [x, y - 10], [x + 12, y + 8]), 4); P(g, [[x - 5, y + 20], [x + 5, y + 20], [x + 5, y + 30], [x - 5, y + 30]]); fillLine(g, "#e5c158", 2); },
  scroll: (g, x, y) => { P(g, sup(x, y, 11, 36, 4, 4)); fillLine(g, "#f2e2b8", 3); for (const s of [-1, 1]) ell(g, x, y + s * 36, 15, 6, "#d9c08a", 3); },
  phone: (g, x, y) => { P(g, sup(x, y, 12, 22, 4, 4)); fillLine(g, "#22232b", 3); P(g, sup(x, y - 1, 9, 17, 4, 4)); fillLine(g, "#7cc4ff", 0); },
  book: (g, x, y) => { P(g, [[x - 32, y - 22], [x, y - 16], [x + 32, y - 22], [x + 32, y + 22], [x, y + 28], [x - 32, y + 22]]); fillLine(g, "#fff", 3); line(g, [[x, y - 16], [x, y + 28]], 2.5); },
  magnifier: (g, x, y) => { line(g, [[x, y], [x + 20, y - 24]], 10); line(g, [[x, y], [x + 20, y - 24]], 6, "#5a3524"); ell(g, x + 34, y - 44, 22, 22, "rgba(200,235,255,0.6)", 4.5); },
  coffee: (g, x, y) => { P(g, [[x - 14, y - 20], [x + 14, y - 20], [x + 11, y + 20], [x - 11, y + 20]]); fillLine(g, "#fff", 3); g.fillStyle = "#b0784a"; g.fillRect(x - 12, y - 6, 24, 10); P(g, [[x - 17, y - 27], [x + 17, y - 27], [x + 17, y - 19], [x - 17, y - 19]]); fillLine(g, "#5a3524", 2.5); },
  coin: (g, x, y) => { ell(g, x, y, 22, 22, "#f2c14e", 3.5); ell(g, x, y, 15, 15, null, 2); },
};

// ---------- the character ----------
// o: { kid, top, pants, shoes, outfit, tie, shirt, trim, hat, hatCol, band, hair, hairStyle, glasses, beard, moustache, goatee, backpack, sash, print, patch, laurel }
// opts: { pose: "stand"|"sit", expr, look, L, R, propL, propR, lean, headTilt, flip }
const rickBody = (g, o, opts = {}) => {
  const { pose = "stand", expr = "neutral", look = 0, L = "hang", R = "hang", propL = null, propR = null, headTilt = 0, weight = 1 } = opts;
  const kid = !!o.kid, BW = kid ? 62 : 66, BH = kid ? 170 : 225, LL = kid ? 175 : 255;
  const bodyBot = pose === "sit" ? 0 : -LL, bodyTop = bodyBot - BH;
  const hcy = bodyTop - 92 + 30, hcx = 0;
  const legCol = FC, limb = 11.5 * weight;
  const b = { cx: 0, x0: -BW, x1: BW, y0: bodyTop, y1: bodyBot, w: 2 * BW, h: BH };
  // legs
  if (pose === "sit") {
    for (const s of [-1, 1]) { const hx = s * 22, kx = s * 30, ky = bodyBot + 8, fy = bodyBot + LL * 0.66; limbStroke(g, qc([hx, bodyBot - 10], [kx + s * 2, ky - 4], [kx, ky + 6], 6), limb, limb, legCol); limbStroke(g, qc([kx, ky + 6], [kx + s * 4, (ky + fy) / 2], [kx + s * 2, fy], 10), limb, limb * 0.92, legCol); ell(g, kx + s * 12, fy + 2, 19 * weight, 9.5 * weight, o.shoes ?? FC, 0); }
  } else {
    for (const s of [-1, 1]) { const ph = opts.walk == null ? 0 : Math.sin(2 * Math.PI * (opts.walk + (s > 0 ? 0.5 : 0))), up = Math.max(0, ph) * 34, sw = ph * 10;
      const hx = s * 24, fx = hx + s * 2 + sw, fy = -6 - up; limbStroke(g, qc([hx, bodyBot - 10], [hx + s * 4 + sw * 0.5 + up * 0.4 * s, bodyBot + LL * 0.5 - up * 0.3], [fx, fy], 12), limb, limb * 0.92, legCol); ell(g, fx + s * 12, fy + 1, 19 * weight, 9.5 * weight, o.shoes ?? FC, 0); }
  }
  // backpack / long hair behind
  if (o.backpack) { P(g, sup(0, bodyTop + BH * 0.42, BW + 20, BH * 0.4, 3, 3)); fillLine(g, o.backpack, LW); }
  // arms (behind-the-body ones first)
  const sh = (s) => [s * (BW - 8), bodyTop + 52];
  const ARM = {
    hang: (s) => [sh(s), [s * (BW + 16), bodyTop + 120], [s * (BW + 12), bodyTop + 190]],
    hip: (s) => [sh(s), [s * (BW + 50), bodyTop + 110], [s * (BW - 2), bodyTop + 150]],
    wave: (s) => [sh(s), [s * (BW + 52), bodyTop + 20], [s * (BW + 62), bodyTop - 70]],
    up: (s) => [sh(s), [s * (BW + 40), bodyTop - 20], [s * (BW + 34), bodyTop - 110]],
    point: (s) => [sh(s), [s * (BW + 60), bodyTop + 50], [s * (BW + 120), bodyTop + 34]],
    hold: (s) => [sh(s), [s * (BW + 26), bodyTop + 130], [s * (BW - 30), bodyTop + 118]],
    holdUp: (s) => [sh(s), [s * (BW + 40), bodyTop + 120], [s * (BW + 34), bodyTop + 50]],
    staff: (s) => [sh(s), [s * (BW + 30), bodyTop + 120], [s * (BW + 34), bodyTop + 96]],
    chin: (s) => [sh(s), [s * (BW + 20), bodyTop + 110], [s * 20, hcy + 92]],
    mouth: (s) => [sh(s), [s * (BW + 34), bodyTop + 90], [s * 44, hcy + 56]],
    cross: (s) => [sh(s), [s * (BW + 10), bodyTop + 110], [-s * 26, bodyTop + 96]],
    thumb: (s) => [sh(s), [s * (BW + 44), bodyTop + 80], [s * (BW + 70), bodyTop + 34]],
  };
  const front = new Set(["hold", "chin", "mouth", "cross"]);
  const armPts = (s, pose) => { if (pose && typeof pose === 'object') { const A = (ARM[pose.a] ?? ARM.hang)(s), B = (ARM[pose.b] ?? ARM.hang)(s), t = pose.t; return A.map((p, i) => [p[0] + (B[i][0] - p[0]) * t, p[1] + (B[i][1] - p[1]) * t]); } return (ARM[pose] ?? ARM.hang)(s); };
  const pname = (p) => (p && typeof p === 'object' ? (p.t < 0.5 ? p.a : p.b) : p);
  const drawArm = (s, pose0, prop) => {
    const [a, k, h] = armPts(s, pose0), pose = pname(pose0);
    limbStroke(g, qc(a, k, h, 10), limb, limb * 0.9);
    if (prop && PROPS[prop] && prop !== "pipe") PROPS[prop](g, h[0], h[1]);
    ell(g, h[0], h[1], 10.5 * weight, 10.5 * weight, FC, 0);
    if (pose === "point") line(g, [[h[0], h[1]], [h[0] + s * 22, h[1] - 3]], 7, FC);
    if (pose === "thumb") line(g, [[h[0], h[1]], [h[0] + s * 4, h[1] - 22]], 7, FC);
  };
  [[-1, L, propL], [1, R, propR]].forEach(([s, p, pr]) => { if (!front.has(pname(p))) drawArm(s, p, pr); });
  // body pill
  const bcy = (bodyTop + bodyBot) / 2, pill = sup(0, bcy, BW, BH / 2, 2.2, 2.5).map(([x, y]) => [x * (1 + 0.13 * (y - bcy) / (BH / 2)), y]);
  g.save(); P(g, pill); g.clip(); (OUTFIT[o.outfit ?? "tee"])(g, b, o);
  const shg = g.createLinearGradient(-BW, 0, BW, 0); shg.addColorStop(0, "rgba(255,255,255,0.10)"); shg.addColorStop(0.55, "rgba(0,0,0,0)"); shg.addColorStop(1, "rgba(30,15,40,0.22)"); g.fillStyle = shg; g.fillRect(-BW - 10, bodyTop - 10, 2 * BW + 20, BH + 20);
  g.restore();
  inkRing(g, pill, 11 * weight, 0.35, Math.PI * 0.5, FC);
  [[-1, L, propL], [1, R, propR]].forEach(([s, p, pr]) => { if (front.has(pname(p))) drawArm(s, p, pr); });
  // head
  g.save(); if (headTilt) { g.translate(hcx, hcy + 90); g.rotate(headTilt * D2R); g.translate(-hcx, -(hcy + 90)); }
  if (HAIR_BEHIND[o.hairStyle] && !["hardhat", "pilot"].includes(o.hat)) HAIR_BEHIND[o.hairStyle](g, hcx, hcy, o);
  const hp = sup(hcx, hcy, 102, 95, 2.05, 2.25, 80);
  softShade(g, hp, hcx, hcy, 100, HEAD, HEAD_SH); inkRing(g, hp, 12 * weight, 0.35, Math.PI * 0.5, FC);
  if (o.beard) { const bc = o.beard, top = hcy + 62;
    const bp = [[hcx - 72, top - 18], ...qc([hcx - 72, top - 18], [hcx - 92, top + 70], [hcx - 40, top + 104]), ...qc([hcx - 40, top + 104], [hcx - 20, top + 92], [hcx, top + 118]), ...qc([hcx, top + 118], [hcx + 20, top + 92], [hcx + 40, top + 104]), ...qc([hcx + 40, top + 104], [hcx + 92, top + 70], [hcx + 72, top - 18]), ...qc([hcx + 72, top - 18], [hcx, top + 20], [hcx - 72, top - 18])];
    softShade(g, bp, hcx, top + 40, 90, bc, mulc(bc, 0.82)); inkRing(g, bp, 9 * weight, 0.3, Math.PI * 0.5, FC);
    for (const dx of [-36, -12, 12, 36]) line(g, qc([hcx + dx, top + 34], [hcx + dx * 1.15, top + 62], [hcx + dx * 0.9, top + 88]), 3, mulc(bc, 0.78)); }
  g.save(); g.translate(hcx, hcy - 8); g.scale(1.2, 1.2); g.translate(-hcx, -(hcy - 8));
  face(g, hcx, hcy, expr, look, { blink: opts.blink, talk: opts.talk, moustache: o.moustache, goatee: o.goatee, browCol: o.beard && o.hairStyle === "bald" ? "#9a958c" : LINE });
  g.restore();
  
  if (o.glasses === "goggles") { line(g, [[hcx - 100, hcy + 6], [hcx + 100, hcy + 6]], 9, "#3b3f52"); for (const s of [-1, 1]) ell(g, hcx + s * 30, hcy + 10, 22, 20, "rgba(190,232,255,0.55)", 5); }
  else if (o.glasses === "aviator") { for (const s of [-1, 1]) { P(g, [[hcx + s * 6, hcy - 4], [hcx + s * 54, hcy - 6], [hcx + s * 50, hcy + 20], [hcx + s * 30, hcy + 28], [hcx + s * 10, hcy + 16]]); fillLine(g, "#2a2f3a", 3.5); } line(g, [[hcx - 6, hcy - 2], [hcx + 6, hcy - 2]], 3.5); }
  else if (o.glasses === "round") { for (const s of [-1, 1]) ell(g, hcx + s * 30, hcy + 10, 20, 18, "rgba(255,255,255,0.25)", 4); line(g, [[hcx - 10, hcy + 8], [hcx + 10, hcy + 8]], 4); }
  const hk = o.hat ?? o.hairStyle ?? (o.hair ? "hair" : null);
  const FIT = { cap: [14, 1], fedora: [30, 0.9], hardhat: [28, 0.84], straw: [30, 0.95], pilot: [16, 0.86], beanie: [26, 0.84], tophat: [24, 0.95], hair: [10, 1], bun: [10, 1], long: [10, 1], pigtails: [10, 1], spiky: [6, 1], curly: [10, 1] };
  if (hk && HATS[hk]) { const [dy, sx] = FIT[hk] ?? [0, 1]; g.save(); g.translate(hcx, hcy - dy); g.scale(sx, 1); HATS[hk](g, 0, 0, o); g.restore(); }
  if (o.laurel) HATS.laurel(g, hcx, hcy, o);
  if (propL === "pipe" || propR === "pipe") PROPS.pipe(g, hcx + 30, hcy + 30);
  g.restore();
};
export const SIT_LIFT = (kid) => 0; // in pose "sit" the origin is the seat (bottom of the body)

// squash & stretch around the feet; everything else lives in rickBody
export const rick = (g, o, opts = {}) => { const q = opts.squash || 0; if (!q) return rickBody(g, o, opts); g.save(); g.scale(1 + q, 1 - q); rickBody(g, o, opts); g.restore(); };
