
// ---------- story additions, same locked look (thick FC ink, soft shade, painted detail) ----------
OUTFIT.dress = (g, b, o) => {
  const c = o.top ?? "#8a4f7d"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  // white collar, buttons, belt, skirt pleats
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 6], [b.cx + s * 40, b.y0 - 6], [b.cx + s * 30, b.y0 + 26]]); fillLine(g, "#f6f1e6", 3); }
  for (const k of [50, 80]) ell(g, b.cx, b.y0 + k, 5, 5, "#f6f1e6", 2.5);
  g.fillStyle = mulc(c, 0.7); g.fillRect(b.x0 - 20, b.y0 + 108, b.w + 40, 14); line(g, [[b.x0 - 20, b.y0 + 108], [b.x1 + 20, b.y0 + 108]], 2.5); line(g, [[b.x0 - 20, b.y0 + 122], [b.x1 + 20, b.y0 + 122]], 2.5);
  for (let i = -2; i <= 2; i++) line(g, [[b.cx + i * 22, b.y0 + 130], [b.cx + i * 30, b.y1 + 10]], 2.2, mulc(c, 0.72));
};
HATS.flatcap = (g, cx, cy, o) => { const c = o.hatCol ?? "#6b5a48"; g.save(); g.translate(cx, cy - 12); g.rotate(-5 * D2R);
  const top = [[-84, -62], ...qc([-84, -62], [-92, -128], [10, -126]), ...qc([10, -126], [104, -120], [96, -62]), ...qc([96, -62], [10, -74], [-84, -62])];
  softShade(g, top, 0, -100, 95, c, mulc(c, 0.7)); clip(g, top, () => { for (let i = -5; i <= 5; i++) line(g, [[i * 18, -130], [i * 20, -60]], 1.6, mulc(c, 0.8)); });
  inkRing(g, top, 9, 0.3, Math.PI * 0.5, FC); ell(g, 6, -124, 8, 5, mulc(c, 0.85), 3.5);
  const vis = [...qc([-66, -66], [10, -78], [86, -66]), ...qc([86, -66], [20, -46], [-66, -66])]; softShade(g, vis, 0, -60, 70, mulc(c, 0.9), mulc(c, 0.62)); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
HATS.bowler = (g, cx, cy, o) => { const c = o.hatCol ?? "#2a2428"; g.save(); g.translate(cx, cy - 14); g.rotate(-4 * D2R);
  const dome = [[-74, -70], ...qc([-74, -70], [-80, -170], [0, -168]), ...qc([0, -168], [80, -170], [74, -70])];
  softShade(g, dome, 0, -120, 85, c, mulc(c, 0.6)); clip(g, dome, () => { g.fillStyle = "#4a2a2e"; g.fillRect(-90, -96, 180, 22); line(g, [[-30, -150], [-20, -110]], 6, mulc(c, 1.8)); }); inkRing(g, dome, 9, 0.3, Math.PI * 0.5, FC);
  const br = sup(0, -70, 112, 15, 2, 2); softShade(g, br, 0, -70, 110, mulc(c, 1.1), mulc(c, 0.7)); inkRing(g, br, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
HATS.gendarme = (g, cx, cy, o) => { const c = "#26304d"; g.save(); g.translate(cx, cy - 10);
  const top = [[-82, -62], [-90, -146], ...qc([-90, -146], [0, -158], [90, -146]), [82, -62]]; softShade(g, top, 0, -110, 95, c, mulc(c, 0.65));
  clip(g, top, () => { g.fillStyle = "#b52a32"; g.fillRect(-100, -150, 200, 16); g.fillStyle = "#e5c158"; g.fillRect(-100, -86, 200, 8); }); inkRing(g, top, 9, 0.3, Math.PI * 0.5, FC);
  ell(g, 0, -114, 11, 13, "#e5c158", 4);
  const vis = [...qc([-70, -64], [0, -72], [70, -64]), ...qc([70, -64], [0, -40], [-70, -64])]; softShade(g, vis, 0, -58, 70, "#141826", "#0b0d16"); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
OUTFIT.uniform = (g, b, o) => { OUTFIT.suit(g, b, { ...o, top: "#26304d", tie: "#141826", trim: "#e5c158" }); for (const k of [120, 150, 180]) ell(g, b.cx, b.y0 + k, 5, 5, "#e5c158", 2.5); P(g, [[b.cx + 30, b.y0 + 40], [b.cx + 52, b.y0 + 40], [b.cx + 52, b.y0 + 62], [b.cx + 41, b.y0 + 70], [b.cx + 30, b.y0 + 62]]); fillLine(g, "#e5c158", 2.5); };
OUTFIT.apron = (g, b, o) => { OUTFIT.tee(g, b, o); P(g, [[b.cx - 46, b.y0 + 40], [b.cx + 46, b.y0 + 40], [b.cx + 56, b.y1 + 20], [b.cx - 56, b.y1 + 20]]); fillLine(g, "#f1ece0", 3); line(g, [[b.cx - 46, b.y0 + 40], [b.cx - 40, b.y0 - 10]], 3); line(g, [[b.cx + 46, b.y0 + 40], [b.cx + 40, b.y0 - 10]], 3); P(g, [[b.cx - 22, b.y0 + 110], [b.cx + 22, b.y0 + 110], [b.cx + 22, b.y0 + 140], [b.cx - 22, b.y0 + 140]]); fillLine(g, "#e6dfd0", 2.5); };
PROPS.envelope = (g, x, y) => { P(g, [[x - 34, y - 22], [x + 34, y - 22], [x + 34, y + 22], [x - 34, y + 22]]); fillLine(g, "#efe3c4", 4, FC); line(g, [[x - 34, y - 22], [x, y + 4], [x + 34, y - 22]], 3.5, FC); ell(g, x, y + 4, 7, 7, "#b52a32", 2.5); P(g, [[x - 20, y - 30], [x + 18, y - 30], [x + 18, y - 22], [x - 20, y - 22]]); fillLine(g, "#7fae5a", 2.5, FC); };
PROPS.bill = (g, x, y) => { P(g, [[x - 26, y - 30], [x + 26, y - 30], [x + 30, y + 190], [x - 22, y + 196]]); fillLine(g, "#fbf6e8", 4, FC); for (let i = 0; i < 12; i++) line(g, [[x - 16, y - 14 + i * 16], [x + 16 + (i % 3) * 3, y - 14 + i * 16]], 3, "#8a8a9a"); g.fillStyle = "#c0392b"; g.font = "bold 30px sans-serif"; g.fillText("$$$", x - 22, y + 184); ell(g, x, y - 32, 30, 8, "#e8dfc8", 3.5); };
PROPS.cash = (g, x, y) => { for (let i = 0; i < 3; i++) { P(g, [[x - 34, y - 14 + i * 7], [x + 34, y - 18 + i * 7], [x + 36, y + 10 + i * 7], [x - 32, y + 14 + i * 7]]); fillLine(g, "#8fbf6a", 3.5, FC); } ell(g, x, y + 4, 9, 9, "#5f8a3c", 2.5); };
PROPS.cigar = (g, x, y) => { line(g, [[x, y], [x + 34, y + 6]], 11, FC); line(g, [[x, y], [x + 34, y + 6]], 6.5, "#7a4a2a"); ell(g, x + 36, y + 6, 5, 5, "#ff8a3d", 0); };
