// ---------- NIGHT MOVERS cast: new outfits / hats / props, same locked Ricks look (thick FC ink, soft shade, painted detail) ----------
OUTFIT.jumpsuit = (g, b, o) => {
  const c = o.top ?? "#24365a"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  // collar, zipper, chest pocket with company patch, belt, knee seams
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 38, b.y0 - 8], [b.cx + s * 30, b.y0 + 24]]); fillLine(g, mulc(c, 1.25), 3); }
  line(g, [[b.cx, b.y0 + 6], [b.cx, b.y1 + 10]], 3, mulc(c, 0.6)); for (let k = 0; k < 9; k++) line(g, [[b.cx - 4, b.y0 + 16 + k * 22], [b.cx + 4, b.y0 + 16 + k * 22]], 2, "#c9ccd2");
  P(g, [[b.cx + 14, b.y0 + 40], [b.cx + 50, b.y0 + 40], [b.cx + 50, b.y0 + 72], [b.cx + 14, b.y0 + 72]]); fillLine(g, mulc(c, 1.12), 2.5);
  ell(g, b.cx - 32, b.y0 + 54, 15, 15, o.patch ?? "#f2c14e", 3); line(g, [[b.cx - 40, b.y0 + 54], [b.cx - 24, b.y0 + 54]], 3, FC);
  g.fillStyle = mulc(c, 0.7); g.fillRect(b.x0 - 20, b.y0 + 120, b.w + 40, 14); line(g, [[b.x0 - 20, b.y0 + 120], [b.x1 + 20, b.y0 + 120]], 2.5); line(g, [[b.x0 - 20, b.y0 + 134], [b.x1 + 20, b.y0 + 134]], 2.5);
  P(g, [[b.cx - 9, b.y0 + 118], [b.cx + 9, b.y0 + 118], [b.cx + 9, b.y0 + 136], [b.cx - 9, b.y0 + 136]]); fillLine(g, "#c9ccd2", 2);
};
OUTFIT.cardigan = (g, b, o) => {
  const c = o.top ?? "#a5743c"; g.fillStyle = o.shirt ?? "#e9e2d0"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 14, b.y0 - 20], [b.cx + s * 100, b.y0 - 20], [b.cx + s * 100, b.y1 + 20], [b.cx + s * 8, b.y1 + 20]]); fillLine(g, c, 3);
    for (let k = 0; k < 9; k++) line(g, [[b.cx + s * 20, b.y0 + 10 + k * 22], [b.cx + s * 96, b.y0 + 4 + k * 22]], 1.6, mulc(c, 0.82)); }
  for (const k of [40, 80, 120, 160]) ell(g, b.cx + 16, b.y0 + k, 5, 5, "#5a3524", 2);
  P(g, [[b.cx + 26, b.y0 + 130], [b.cx + 58, b.y0 + 130], [b.cx + 58, b.y0 + 160], [b.cx + 26, b.y0 + 160]]); fillLine(g, mulc(c, 0.9), 2.5);
};
OUTFIT.chef = (g, b, o) => {
  g.fillStyle = "#f6f4ef"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  P(g, [[b.x0 - 20, b.y0 - 20], [b.cx + 20, b.y0 - 20], [b.cx - 30, b.y1 + 20], [b.x0 - 20, b.y1 + 20]]); fillLine(g, "#ebe7dd", 3);
  for (const k of [40, 80, 120]) for (const s of [-1, 1]) ell(g, b.cx + s * 26 - 10, b.y0 + k, 4.5, 4.5, FC, 0);
  P(g, [[b.cx - 56, b.y0 + 110], [b.cx + 56, b.y0 + 110], [b.cx + 62, b.y1 + 20], [b.cx - 62, b.y1 + 20]]); fillLine(g, o.apron ?? "#2f4f8a", 3);
  line(g, [[b.x0 - 20, b.y0 + 112], [b.x1 + 20, b.y0 + 112]], 6, o.apron ?? "#2f4f8a");
  for (let i = -2; i <= 2; i++) line(g, [[b.cx + i * 22, b.y0 + 150], [b.cx + i * 25, b.y1 + 10]], 1.8, mulc(o.apron ?? "#2f4f8a", 0.75));
};
OUTFIT.pajamas = (g, b, o) => {
  const c = o.top ?? "#9fc6e8"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  for (let i = -6; i <= 6; i++) { g.fillStyle = mulc(c, 0.78); g.fillRect(b.cx + i * 24 - 5, b.y0 - 20, 10, b.h + 40); }
  for (const s of [-1, 1]) { P(g, [[b.cx, b.y0 + 4], [b.cx + s * 36, b.y0 - 6], [b.cx + s * 28, b.y0 + 24]]); fillLine(g, "#f4f1ea", 3); }
  for (const k of [50, 90, 130]) ell(g, b.cx, b.y0 + k, 5, 5, "#f4f1ea", 2);
  if (o.towel) { P(g, [[b.cx - 70, b.y0 - 6], [b.cx - 40, b.y0 - 14], [b.cx - 30, b.y0 + 110], [b.cx - 60, b.y0 + 118]]); fillLine(g, o.towel, 3); }
};
OUTFIT.police = (g, b, o) => {
  g.fillStyle = "#b9d2ec"; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  P(g, [[b.cx - 7, b.y0 + 8], [b.cx + 7, b.y0 + 8], [b.cx + 11, b.y0 + 70], [b.cx, b.y0 + 84], [b.cx - 11, b.y0 + 70]]); fillLine(g, "#1d2742", 3);
  for (const s of [-1, 1]) { P(g, [[b.cx + s * 24, b.y0 + 30], [b.cx + s * 80, b.y0 + 30], [b.cx + s * 80, b.y1 + 20], [b.cx + s * 24, b.y1 + 20]]); fillLine(g, "#26304d", 3);
    P(g, [[b.cx + s * 40, b.y0 + 60], [b.cx + s * 66, b.y0 + 60], [b.cx + s * 66, b.y0 + 84], [b.cx + s * 40, b.y0 + 84]]); fillLine(g, "#33406a", 2.5); }
  P(g, [[b.cx + 30, b.y0 + 92], [b.cx + 44, b.y0 + 88], [b.cx + 52, b.y0 + 104], [b.cx + 38, b.y0 + 110]]); fillLine(g, "#e5c158", 2.5);
  g.fillStyle = "#1a1f30"; g.fillRect(b.x0 - 20, b.y0 + 150, b.w + 40, 18); line(g, [[b.x0 - 20, b.y0 + 150], [b.x1 + 20, b.y0 + 150]], 2.5);
  g.fillStyle = "#26304d"; g.fillRect(b.x0 - 20, b.y1 - 40, b.w + 40, 70);
};
OUTFIT.blouse = (g, b, o) => { // mother: blouse + long skirt + small brooch
  const c = o.top ?? "#c96b84"; g.fillStyle = c; g.fillRect(b.x0 - 20, b.y0 - 20, b.w + 40, b.h + 40);
  line(g, qc([b.cx - 34, b.y0 - 2], [b.cx, b.y0 + 30], [b.cx + 34, b.y0 - 2]), 6, "#f6f1e6"); ell(g, b.cx, b.y0 + 40, 8, 8, "#e5c158", 2.5);
  for (const k of [64, 92]) ell(g, b.cx, b.y0 + k, 4.5, 4.5, mulc(c, 0.6), 0);
  const sk = o.skirt ?? "#4b5f8a"; g.fillStyle = sk; g.fillRect(b.x0 - 20, b.y0 + 116, b.w + 40, b.h); line(g, [[b.x0 - 20, b.y0 + 116], [b.x1 + 20, b.y0 + 116]], 3);
  for (let i = -2; i <= 2; i++) line(g, [[b.cx + i * 24, b.y0 + 130], [b.cx + i * 30, b.y1 + 10]], 2, mulc(sk, 0.75));
  if (o.cardi) for (const s of [-1, 1]) { P(g, [[b.cx + s * 22, b.y0 - 20], [b.cx + s * 100, b.y0 - 20], [b.cx + s * 100, b.y0 + 116], [b.cx + s * 30, b.y0 + 116]]); fillLine(g, o.cardi, 3); }
};
HATS.hachimaki = (g, cx, cy, o) => { HATS.hair(g, cx, cy, { ...o, hair: o.hair ?? "#2a211d" });
  const band = [[cx - 104, cy - 52], ...qc([cx - 104, cy - 52], [cx, cy - 76], [cx + 104, cy - 52]), [cx + 103, cy - 30], ...qc([cx + 103, cy - 30], [cx, cy - 54], [cx - 103, cy - 30])];
  P(g, band); fillLine(g, "#f6f4ef", 5); line(g, qc([cx - 40, cy - 60], [cx, cy - 66], [cx + 40, cy - 60]), 3, "#c0392b");
  P(g, [[cx + 96, cy - 44], [cx + 132, cy - 66], [cx + 136, cy - 50], [cx + 100, cy - 34]]); fillLine(g, "#f6f4ef", 4); };
HATS.jpolice = (g, cx, cy, o) => { g.save(); g.translate(cx, cy - 10);
  const top = [[-84, -62], [-96, -136], ...qc([-96, -136], [0, -150], [96, -136]), [84, -62]]; softShade(g, top, 0, -110, 95, "#232c48", "#141a2e");
  clip(g, top, () => { g.fillStyle = "#11162a"; g.fillRect(-110, -92, 220, 26); }); inkRing(g, top, 9, 0.3, Math.PI * 0.5, FC);
  P(g, [[0, -126], [12, -112], [0, -98], [-12, -112]]); fillLine(g, "#e5c158", 3.5);
  const vis = [...qc([-72, -64], [0, -72], [72, -64]), ...qc([72, -64], [0, -38], [-72, -64])]; softShade(g, vis, 0, -58, 70, "#141826", "#0b0d16"); inkRing(g, vis, 8, 0.3, Math.PI * 0.5, FC); g.restore(); };
HATS.perm = (g, cx, cy, o) => { const c = o.hair ?? "#b9b4ad"; for (let i = 0; i < 11; i++) { const a = (190 + i * 16) * D2R; ell(g, cx + Math.cos(a) * 94, cy - 26 + Math.sin(a) * 84, 30, 27, i % 2 ? c : mulc(c, 1.08), 3.5); } };
HATS.slick = (g, cx, cy, o) => { const c = o.hair ?? "#1c1716"; const pts = [...qc([cx - 100, cy - 20], [cx - 104, cy - 124], [cx + 10, cy - 118]), ...qc([cx + 10, cy - 118], [cx + 112, cy - 110], [cx + 100, cy - 26]), ...qc([cx + 100, cy - 26], [cx + 60, cy - 74], [cx - 60, cy - 70]), ...qc([cx - 60, cy - 70], [cx - 90, cy - 50], [cx - 100, cy - 20])];
  softShade(g, pts, cx, cy - 70, 100, c, mulc(c, 0.7)); P(g, pts); fillLine(g, null); for (const d of [-30, 0, 30]) line(g, qc([cx - 70, cy - 80 + d * 0.2], [cx, cy - 112 + d * 0.3], [cx + 80, cy - 84]), 2.5, mulc(c, 2.2)); };

// props (held in hand; units: head radius 100)
PROPS.chopsticks = (g, x, y) => { line(g, [[x - 4, y + 6], [x + 70, y - 46]], 7, FC); line(g, [[x - 4, y + 6], [x + 70, y - 46]], 3.5, "#d8a860"); line(g, [[x + 2, y + 10], [x + 76, y - 36]], 7, FC); line(g, [[x + 2, y + 10], [x + 76, y - 36]], 3.5, "#d8a860"); };
PROPS.bowl = (g, x, y) => { P(g, [...qc([x - 40, y - 8], [x, y + 44], [x + 40, y - 8])]); fillLine(g, "#c0392b", 4); ell(g, x, y - 8, 40, 9, "#f2d38a", 4); line(g, qc([x - 24, y - 10], [x - 8, y - 4], [x + 8, y - 10]), 2.5, "#e9c46a"); };
PROPS.photo = (g, x, y) => { P(g, [[x - 30, y - 40], [x + 30, y - 40], [x + 30, y + 30], [x - 30, y + 30]]); fillLine(g, "#f4efe4", 4); P(g, [[x - 22, y - 32], [x + 22, y - 32], [x + 22, y + 14], [x - 22, y + 14]]); fillLine(g, "#8fc0e8", 2.5);
  ell(g, x, y - 12, 12, 11, "#fff", 2.5); P(g, [[x - 14, y + 14], [x - 10, y], [x + 10, y], [x + 14, y + 14]]); fillLine(g, "#fff", 2.5); P(g, [[x - 12, y - 18], [x - 10, y - 24], [x + 10, y - 24], [x + 12, y - 18]]); fillLine(g, "#2a211d", 2); };
PROPS.flyer = (g, x, y) => { P(g, [[x - 44, y - 60], [x + 44, y - 60], [x + 44, y + 50], [x - 44, y + 50]]); fillLine(g, "#fbf7ea", 4); g.fillStyle = "#c0392b"; g.font = "bold 22px sans-serif"; g.textAlign = "center"; g.fillText("MISSING", x, y - 36);
  P(g, [[x - 26, y - 28], [x + 26, y - 28], [x + 26, y + 18], [x - 26, y + 18]]); fillLine(g, "#8fc0e8", 2.5); ell(g, x, y - 8, 12, 11, "#fff", 2.5); P(g, [[x - 13, y - 14], [x - 10, y - 20], [x + 10, y - 20], [x + 13, y - 14]]); fillLine(g, "#2a211d", 2);
  for (let i = 0; i < 2; i++) line(g, [[x - 30, y + 30 + i * 10], [x + 30, y + 30 + i * 10]], 2.5, "#8a8a9a"); };
PROPS.mic = (g, x, y) => { line(g, [[x, y + 10], [x + 8, y - 40]], 12, FC); line(g, [[x, y + 10], [x + 8, y - 40]], 7, "#3b3f52"); ell(g, x + 10, y - 52, 15, 17, "#6b7280", 4); P(g, [[x - 10, y - 30], [x + 22, y - 30], [x + 22, y - 18], [x - 10, y - 18]]); fillLine(g, "#d9433a", 3); };
PROPS.box = (g, x, y) => { P(g, [[x - 60, y - 50], [x + 60, y - 50], [x + 60, y + 40], [x - 60, y + 40]]); fillLine(g, "#c89a5e", 4.5); P(g, [[x - 60, y - 50], [x + 60, y - 50], [x + 48, y - 66], [x - 48, y - 66]]); fillLine(g, "#d9ae74", 4); g.fillStyle = "#e8d7a8"; g.fillRect(x - 8, y - 50, 16, 90); line(g, [[x - 40, y - 10], [x - 10, y - 10]], 3, "#6b4a2a"); };
PROPS.shovel = (g, x, y) => { line(g, [[x, y + 150], [x, y - 130]], 9); line(g, [[x, y + 150], [x, y - 130]], 5, "#b07a45"); P(g, [[x - 26, y + 150], [x + 26, y + 150], [x + 22, y + 210], [x, y + 226], [x - 22, y + 210]]); fillLine(g, "#9aa3ad", 4); };
PROPS.can = (g, x, y) => { P(g, [[x - 13, y - 26], [x + 13, y - 26], [x + 13, y + 22], [x - 13, y + 22]]); fillLine(g, "#2f6fb5", 3.5); g.fillStyle = "#f2c14e"; g.fillRect(x - 12, y - 8, 24, 10); ell(g, x, y - 26, 13, 4, "#c9ccd2", 3); };
PROPS.card = (g, x, y) => { P(g, [[x - 30, y - 18], [x + 30, y - 18], [x + 30, y + 18], [x - 30, y + 18]]); fillLine(g, "#3d7fd1", 4); g.fillStyle = "#e5c158"; g.fillRect(x - 22, y - 8, 14, 11); line(g, [[x - 22, y + 10], [x + 20, y + 10]], 2.5, "#dfe8f5"); };
PROPS.key = (g, x, y) => { ell(g, x, y - 12, 12, 12, "#e5c158", 4); line(g, [[x, y], [x, y + 40]], 8, FC); line(g, [[x, y], [x, y + 40]], 4, "#e5c158"); line(g, [[x, y + 34], [x + 10, y + 34]], 5, FC); };
PROPS.stamp = (g, x, y) => { ell(g, x, y - 34, 14, 12, "#7a4a2a", 4); line(g, [[x, y - 24], [x, y]], 12, FC); line(g, [[x, y - 24], [x, y]], 7, "#a8743f"); P(g, [[x - 20, y], [x + 20, y], [x + 20, y + 14], [x - 20, y + 14]]); fillLine(g, "#c0392b", 3.5); };
PROPS.wallet = (g, x, y) => { P(g, [[x - 34, y - 22], [x + 34, y - 22], [x + 34, y + 22], [x - 34, y + 22]]); fillLine(g, "#6b3f22", 4); line(g, [[x - 34, y - 6], [x + 34, y - 6]], 2.5, "#3a2416"); ell(g, x + 40, y + 30, 6, 6, null, 2.5); ell(g, x + 50, y + 44, 4, 4, null, 2); };
PROPS.vase = (g, x, y) => { P(g, [...qc([x - 12, y - 40], [x - 38, y + 6], [x - 16, y + 40]), [x + 16, y + 40], ...qc([x + 16, y + 40], [x + 38, y + 6], [x + 12, y - 40])]); fillLine(g, "#4f8fc0", 4); line(g, qc([x - 24, y], [x, y + 12], [x + 24, y]), 3, "#f4f1ea"); };
PROPS.tape = (g, x, y) => { ell(g, x, y, 26, 26, "#c9a46a", 4); ell(g, x, y, 11, 11, "#f4efe4", 3); line(g, [[x + 22, y + 14], [x + 60, y + 30]], 6, "#c9a46a"); };
PROPS.coin10 = (g, x, y) => { ell(g, x, y, 18, 18, "#c9804a", 4); ell(g, x, y, 10, 10, null, 2); };
PROPS.receiver = (g, x, y) => { line(g, qc([x - 10, y + 30], [x - 30, y - 10], [x - 4, y - 40]), 18, FC); line(g, qc([x - 10, y + 30], [x - 30, y - 10], [x - 4, y - 40]), 11, "#e86a9a"); };

export const CAST = {};
