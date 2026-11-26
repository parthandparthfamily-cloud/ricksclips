// Sets 1: APARTMENT (night), STREET outside the apartment (2 a.m.), OFFICE (day), PARENTS' HOME (evening)
export function buildSets1(H) {
  const { THREE, X, mt, glow, glowT, C, box, cyl, sph, plane, mesh, signBoard, line3, wire, rng, tx, toon } = H;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

  // shared prop builders ----------------------------------------------------
  const books = (p, x, y, z, w, seed, rotY = 0) => { const r = rng(seed), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; p.add(g); let xx = -w / 2; const out = [];
    while (xx < w / 2 - 0.04) { const bw = 0.03 + r() * 0.04, bh = 0.18 + r() * 0.1; out.push(box(g, ['#c0392b', '#2f6fb5', '#f2c14e', '#3f8f6f', '#8a4f7d', '#e86a9a', '#f4f1ea'][(r() * 7) | 0], xx + bw / 2, bh / 2, 0, bw, bh, 0.18)); xx += bw + 0.005; } g.userData.items = out; return g; };
  const plant = (p, x, y, z, s = 1, seed = 1, wilt = false) => { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); p.add(g); const r = rng(seed);
    cyl(g, '#c76a3a', 0, 0.12, 0, 0.13, 0.1, 0.24); cyl(g, '#4a3222', 0, 0.245, 0, 0.12, 0.12, 0.01);
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28, l = mesh(new THREE.SphereGeometry(0.09, 10, 6), C(wilt ? '#8a9a3a' : '#4f9a3a'), Math.cos(a) * 0.1, 0.38 + r() * 0.15 - (wilt ? 0.1 : 0), Math.sin(a) * 0.1, g); l.scale.set(0.6, 1.6, 0.35); l.rotation.z = Math.cos(a) * (wilt ? 1.6 : 0.5); l.rotation.x = Math.sin(a) * (wilt ? 1.6 : 0.5); }
    return g; };
  const cardboard = (p, x, y, z, w = 0.5, h = 0.4, d = 0.4, label) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); box(g, '#c89a5e', 0, h / 2, 0, w, h, d); box(g, '#e8d7a8', 0, h + 0.002, 0, 0.08, 0.004, d + 0.004, { cast: false });
    if (label) { const c = X.sign(256, 128, [[label, 50, '#2e211d']], '#c89a5e', null); plane(g, mt(c), 0, h * 0.55, d / 2 + 0.003, w * 0.8, w * 0.4); } return g; };
  const chair = (p, x, z, ry = 0, colr = '#3b3f52') => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); box(g, colr, 0, 0.46, 0, 0.46, 0.06, 0.44); box(g, colr, 0, 0.8, -0.2, 0.44, 0.5, 0.05); for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, '#2e2a30', sx * 0.19, 0.22, sz * 0.18, 0.02, 0.02, 0.44); return g; };
  H.books = books; H.plant = plant; H.cardboard = cardboard; H.chair = chair;
  const fluoro = (p, x, y, z, l = 1.2) => { box(p, '#e9eef2', x, y + 0.03, z, l, 0.06, 0.22); box(p, glow('#fffdf2'), x, y - 0.005, z, l - 0.08, 0.02, 0.16, { cast: false }); };
  const clock = (p, x, y, z, r = 0.2, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; p.add(g);
    cyl(g, '#c0392b', 0, 0, -0.02, r * 1.08, r * 1.08, 0.05, { rx: Math.PI / 2, seg: 28 }); plane(g, mt(X.clockFace(), 1, 1, { transparent: true, alphaTest: 0.5 }), 0, 0, 0.008, r * 2, r * 2, { noink: true });
    const hh = new THREE.Group(), mh = new THREE.Group(), sh = new THREE.Group(); [hh, mh, sh].forEach((k, i) => { k.position.z = 0.015 + i * 0.006; g.add(k); });
    box(hh, '#2e211d', 0, r * 0.25, 0, r * 0.08, r * 0.55, 0.008); box(mh, '#2e211d', 0, r * 0.38, 0, r * 0.06, r * 0.8, 0.008); box(sh, '#e0453a', 0, r * 0.35, 0, r * 0.025, r * 0.85, 0.006); sph(g, '#2e211d', 0, 0, 0.03, r * 0.06);
    g.userData.set = (min, sec) => { hh.rotation.z = -min / 720 * Math.PI * 2; mh.rotation.z = -(min % 60) / 60 * Math.PI * 2; sh.rotation.z = -sec / 60 * Math.PI * 2; }; return g; };
  H.clock = clock; H.fluoro = fluoro;

  // ======================================================================================
  // APARTMENT (night). Room x -2.5..2.5, z -2..2, h 2.5. Window on back wall, door on right wall.
  // ======================================================================================
  {
    const A = H.newSet('apt');
    const floor = plane(A, mt(X.tatami(1), 5 / 0.9, 4 / 1.8), 0, 0, 0, 5, 4, { rx: -Math.PI / 2, recv: true }); floor.material.map.rotation = 0;
    const wallM = mt(X.wallpaper(3, '#e8dcc2', '#d3c29a', 'dots'), 4, 2), wallM2 = mt(X.wallpaper(3, '#e8dcc2', '#d3c29a', 'dots'), 3, 2);
    // back wall with window hole (x 0.4..2.0, y 0.9..2.1)
    box(A, wallM, -1.05, 1.25, -2.05, 2.9, 2.5, 0.1); box(A, wallM2, 2.25, 1.25, -2.05, 0.5, 2.5, 0.1); box(A, wallM2, 1.2, 0.45, -2.05, 1.6, 0.9, 0.1); box(A, wallM2, 1.2, 2.3, -2.05, 1.6, 0.4, 0.1);
    box(A, wallM, -2.55, 1.25, 0, 0.1, 2.5, 4.2); box(A, wallM, 2.55, 1.25, -0.55, 0.1, 2.5, 3.1); box(A, wallM, 2.55, 2.3, 1.4, 0.1, 0.4, 1.2);
    box(A, wallM, 0, 1.25, 2.05, 5.2, 2.5, 0.1);
    box(A, mt(X.woodFloor(4, 34, 74), 3, 3), 0, 2.53, 0, 5.2, 0.06, 4.2, { cast: false });
    for (const [x, z, w, d] of [[0, -1.98, 5, 0.04], [-2.48, 0, 0.04, 4], [2.48, -0.5, 0.04, 3], [0, 1.98, 5, 0.04]]) box(A, '#7a5434', x, 0.05, z, w, 0.1, d);
    // window frame + mullion + curtains
    for (const [x, y, w, h] of [[1.2, 0.92, 1.66, 0.06], [1.2, 2.08, 1.66, 0.06], [0.4, 1.5, 0.06, 1.2], [2.0, 1.5, 0.06, 1.2], [1.2, 1.5, 0.05, 1.2]]) box(A, '#d9dde3', x, y, -2.0, w, h, 0.08);
    const curtL = box(A, '#3f6fb5', 0.25, 1.55, -1.92, 0.36, 1.5, 0.06), curtR = box(A, '#3f6fb5', 2.12, 1.55, -1.92, 0.3, 1.5, 0.06); cyl(A, '#b8bcc4', 1.2, 2.32, -1.9, 0.015, 0.015, 2.3, { rz: Math.PI / 2, seg: 6 });
    // view: night city outside
    const city = plane(A, glowT(X.skyline(21, true, 2048, 512), { transparent: true }), 1.2, 1.2, -9, 22, 5.5, { noink: true }); city.userData.ndSkip = false;
    const city2 = plane(A, glowT(X.skyline(22, true, 2048, 512), { transparent: true }), -2, 2.4, -16, 34, 8.5);
    const neon = box(A, glow('#ff4f8a'), 2.6, 2.2, -5.5, 1.4, 0.35, 0.05, { cast: false }); const neonB = box(A, '#20232c', 2.6, 2.2, -5.54, 1.55, 0.48, 0.04);
    sph(A, glow('#fff6d8'), -3, 7.5, -30, 1.4, { cast: false }); // moon
    box(A, '#8a8f99', 1.2, 0.85, -2.25, 1.7, 0.05, 0.35); for (let i = 0; i < 9; i++) cyl(A, '#8a8f99', 0.45 + i * 0.19, 0.6, -2.4, 0.012, 0.012, 0.5, { seg: 6 }); // balcony rail
    // wall clock, calendar, flyer, posters
    const wc = clock(A, -0.55, 1.95, -1.98, 0.2); A.userData.clock = wc;
    signBoard(A, X.calendar('MAR'), -1.25, 1.6, -1.98, 0.32, 0.4, { frame: '#e9e2d0', d: 0.01, border: 0.01 });
    const flyer = signBoard(A, X.sign(300, 420, [['NIGHT', 58, '#f2c14e'], ['MOVERS', 58, '#f2c14e'], ['', 16, '#fff'], ['LIFE NOT WORKING?', 24, '#fff'], ['WE ERASE YOU.', 30, '#ff6f61'], ['NO QUESTIONS', 22, '#fff'], ['', 10, '#fff'], ['24H  0120-NIGHT', 26, '#9fe0ff']], '#1b2540', '#f2c14e'), -1.85, 1.3, -1.98, 0.42, 0.58, { frame: '#f2c14e', d: 0.008, border: 0.01, rz: 0.05 });
    A.userData.flyer = flyer;
    signBoard(A, X.sign(256, 340, [['SUMMER', 40, '#fff'], ['FESTIVAL', 40, '#fff'], ['2019', 60, '#f2c14e']], '#3f8f6f', '#2e211d'), -2.48, 1.55, 1.2, 0.4, 0.55, { ry: Math.PI / 2, d: 0.01 });
    // kitchenette along the right wall (z -2..-0.2)
    box(A, '#e9e2d0', 2.2, 0.45, -1.15, 0.6, 0.9, 1.7); box(A, '#b8bcc4', 2.2, 0.91, -1.15, 0.62, 0.04, 1.72); box(A, '#8a8f99', 2.2, 0.88, -1.45, 0.4, 0.06, 0.4); cyl(A, '#b8bcc4', 2.38, 1.08, -1.45, 0.015, 0.015, 0.3, { seg: 6 });
    box(A, '#d8dde2', 2.2, 1.85, -1.15, 0.5, 0.6, 1.7); for (const z of [-1.6, -0.7]) box(A, '#b8bcc4', 1.94, 1.75, z, 0.02, 0.04, 0.2);
    const kettle = new THREE.Group(); kettle.position.set(2.15, 0.93, -0.75); A.add(kettle); sph(kettle, '#c0392b', 0, 0.09, 0, 0.1, { s: [1, 0.8, 1] }); cyl(kettle, '#2e211d', -0.09, 0.1, 0, 0.015, 0.02, 0.12, { rz: 0.9, seg: 6 }); box(kettle, '#2e211d', 0, 0.2, 0, 0.12, 0.02, 0.02);
    for (let i = 0; i < 4; i++) box(A, ['#f4f1ea', '#f2c14e', '#3f8f6f', '#e86a9a'][i], 2.15 + (i % 2) * 0.12, 0.98, -1.85 + i * 0.07, 0.07, 0.1, 0.07); // cups
    box(A, '#f4f6f8', 2.15, 0.45, -0.2, 0.62, 0.9, 0.55); box(A, '#b8bcc4', 1.83, 0.6, -0.2, 0.02, 0.25, 0.04); // mini fridge
    sph(A, '#2b2f3d', 2.1, 0.98, -0.2, 0.12, { s: [1, 0.6, 1] }); // rice cooker
    // genkan + steel door on the right wall (z 0.8..1.95)
    box(A, mt(X.tiles(6, '#bfb8ab', '#b2ab9e', 6)), 2.1, -0.08, 1.4, 0.8, 0.16, 1.2); box(A, '#7a5434', 1.69, 0.0, 1.4, 0.04, 0.16, 1.2);
    const door = new THREE.Group(); door.position.set(2.5, 0, 0.82); A.add(door); const dleaf = new THREE.Group(); door.add(dleaf);
    box(dleaf, '#7d8796', 0, 1.03, 0.47, 0.06, 2.05, 0.9); box(dleaf, '#5c6470', -0.04, 1.0, 0.85, 0.06, 0.06, 0.06); box(dleaf, '#2e2a30', -0.035, 0.75, 0.47, 0.01, 0.04, 0.3); sph(dleaf, '#2e2a30', -0.035, 1.6, 0.47, 0.02);
    A.userData.door = dleaf; box(A, '#5c6470', 2.5, 2.08, 1.29, 0.12, 0.08, 1.0);
    for (let i = 0; i < 4; i++) { box(A, ['#2b1f1c', '#c0392b', '#2f6fb5', '#f4f1ea'][i], 2.0 + (i % 2) * 0.18, 0.04, 1.0 + i * 0.22, 0.12, 0.08, 0.26); }
    cyl(A, '#3f6fb5', 1.86, 0.3, 1.9, 0.05, 0.05, 0.6, { seg: 8 }); // umbrella
    // left wall: shelf + TV cabinet
    const shelf = new THREE.Group(); shelf.position.set(-2.28, 0, -1.2); A.add(shelf);
    box(shelf, '#9a6a3e', 0, 0.9, -0.38, 0.38, 1.8, 0.04); box(shelf, '#9a6a3e', 0, 0.9, 0.38, 0.38, 1.8, 0.04); box(shelf, '#8a5c34', -0.18, 0.9, 0, 0.03, 1.8, 0.8);
    const boards = []; for (const y of [0.05, 0.5, 0.95, 1.4, 1.78]) boards.push(box(shelf, '#a87444', 0, y, 0, 0.36, 0.04, 0.78));
    const bk = [books(shelf, 0, 0.52, 0, 0.7, 31, Math.PI / 2), books(shelf, 0, 0.97, 0, 0.7, 32, Math.PI / 2), books(shelf, 0, 1.42, 0, 0.5, 33, Math.PI / 2)];
    const trophy = cyl(shelf, '#f2c14e', 0, 1.88, -0.25, 0.05, 0.03, 0.14); plant(shelf, 0, 1.8, 0.2, 0.6, 3, true);
    A.userData.shelf = { boards, bk, root: shelf };
    box(A, '#5a3b2a', -2.2, 0.22, 0.6, 0.5, 0.44, 1.1); const crt = new THREE.Group(); crt.position.set(-2.15, 0.44, 0.6); A.add(crt); box(crt, '#3b3f52', 0, 0.22, 0, 0.42, 0.44, 0.5);
    const tvS = plane(crt, glowT(X.screen('#3f6fb5', '#8fd0f5', 5)), 0.215, 0.24, 0, 0.42, 0.32, { ry: Math.PI / 2 }); A.userData.tvS = tvS; line3(crt, [0, 0.44, 0], [-0.1, 0.62, 0.14], 0.006, C('#2e211d')); line3(crt, [0, 0.44, 0], [-0.1, 0.62, -0.14], 0.006, C('#2e211d'));
    // center: chabudai + clutter (packable)
    const pack = []; const P_ = (o) => (pack.push(o), o);
    const table = P_(new THREE.Group()); table.position.set(0, 0, 0.1); A.add(table);
    box(table, '#8a5c34', 0, 0.33, 0, 0.95, 0.05, 0.65); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(table, '#6e4a2a', sx * 0.4, 0.15, sz * 0.26, 0.05, 0.3, 0.05);
    const envs = []; const er = rng(8); for (let i = 0; i < 9; i++) { const e = box(table, i % 3 ? '#f4e0d8' : '#e0453a', -0.2 + er() * 0.3, 0.36 + i * 0.008, -0.05 + er() * 0.2, 0.22, 0.008, 0.14); e.rotation.y = er() * 1.2 - 0.6; envs.push(e); }
    const dl = signBoard(table, X.debtLetter(), 0.18, 0.375, 0.12, 0.26, 0.16, { rx: -Math.PI / 2, rz: 0.3, d: 0.005, frame: '#fbe9e3', border: 0.005 });
    cyl(table, '#f4f1ea', 0.32, 0.42, -0.15, 0.06, 0.05, 0.12); cyl(table, '#e0453a', 0.32, 0.43, -0.15, 0.062, 0.062, 0.04); // cup noodle
    for (let i = 0; i < 3; i++) { const c = cyl(table, '#c9ccd2', -0.36 + i * 0.07, 0.42, 0.2 - i * 0.03, 0.03, 0.03, 0.11); if (i === 2) { c.rotation.z = Math.PI / 2; c.position.y = 0.39; } }
    for (const [x, z, c] of [[-0.75, 0.15, '#c0392b'], [0.7, 0.3, '#3f6fb5']]) P_(box(A, c, x, 0.05, z, 0.5, 0.1, 0.5));
    const futon = new THREE.Group(); futon.position.set(0.05, 0, -0.78); A.add(futon); box(futon, '#f4f1ea', 0, 0.22, 0, 1.1, 0.44, 0.7); box(futon, '#e86a9a', 0, 0.46, 0, 1.05, 0.06, 0.66); box(futon, '#f2c14e', 0.35, 0.52, 0, 0.3, 0.1, 0.4);
    const laundry = P_(new THREE.Group()); laundry.position.set(0.3, 0, 1.75); A.add(laundry); cyl(laundry, '#b8bcc4', 0, 1.9, 0, 0.012, 0.012, 2.2, { rz: Math.PI / 2, seg: 6 });
    const shirts = []; for (let i = 0; i < 5; i++) { const s = box(laundry, ['#ffffff', '#9fc6e8', '#f2c14e', '#ffffff', '#3f8f6f'][i], -0.8 + i * 0.4, 1.62, 0, 0.32, 0.5, 0.02); shirts.push(s); }
    P_(plant(A, -2.1, 0, 1.85, 1, 4, true)); const fan = P_(new THREE.Group()); fan.position.set(1.6, 0, 1.6); A.add(fan); cyl(fan, '#f4f6f8', 0, 0.02, 0, 0.15, 0.17, 0.04); cyl(fan, '#f4f6f8', 0, 0.35, 0, 0.02, 0.02, 0.66, { seg: 6 });
    const fanHead = new THREE.Group(); fanHead.position.set(0, 0.7, 0); fan.add(fanHead); cyl(fanHead, '#9fc6e8', 0, 0, 0.04, 0.2, 0.2, 0.04, { rx: Math.PI / 2, seg: 20 }); const blades = new THREE.Group(); blades.position.z = 0.07; fanHead.add(blades); for (let i = 0; i < 3; i++) { const b = box(blades, '#ffffff', 0, 0.09, 0, 0.07, 0.16, 0.01); b.parent.remove(b); const pv = new THREE.Group(); pv.rotation.z = i * 2.09; pv.add(b); blades.add(pv); }
    const bag = P_(sph(A, '#e8eef2', 1.55, 0.22, 0.75, 0.24, { s: [1, 0.95, 1] }));
    const piles = P_(new THREE.Group()); A.add(piles); const pr = rng(19); for (let i = 0; i < 14; i++) { const m = box(piles, ['#f4f1ea', '#c0392b', '#3b3f52', '#9fc6e8'][i % 4], -1.6 + pr() * 1.4, 0.02, -1.6 + pr() * 0.6, 0.28, 0.03, 0.2); m.rotation.y = pr() * 3; }
    // boxes that appear while packing
    const boxes = []; [[-1.4, -1.5], [-0.9, -1.55], [-1.15, -1.5, 0.4], [-0.4, 1.4], [0.1, 1.45], [-0.15, 1.42, 0.4], [1.1, 0.9], [1.1, 1.35], [1.1, 1.1, 0.4], [-1.9, 0.6], [-1.9, 1.0], [0.9, -1.4]].forEach(([x, z, y = 0], i) => boxes.push(cardboard(A, x, y, z, 0.5, 0.4, 0.4, i === 2 ? 'FRAGILE' : i === 5 ? 'KITCHEN' : null)));
    // ceiling lamp (swings) + drip
    const lamp = new THREE.Group(); lamp.position.set(0, 2.5, 0.1); A.add(lamp); line3(lamp, [0, 0, 0], [0, -0.5, 0], 0.008, C('#2e211d'));
    const shade = cyl(lamp, '#f2e6c8', 0, -0.55, 0, 0.12, 0.32, 0.18, { open: true, seg: 20 }); shade.material = toon({ color: '#f2e6c8', side: THREE.DoubleSide });
    const bulb = sph(lamp, glow('#fff3c4'), 0, -0.6, 0, 0.07, { cast: false }); line3(lamp, [0.05, -0.62, 0], [0.05, -0.95, 0], 0.004, C('#2e211d')); sph(lamp, '#f2c14e', 0.05, -0.97, 0, 0.025);
    const drops = []; for (let i = 0; i < 3; i++) drops.push(sph(A, C('#8fd0f5'), -0.9, 2.4, -0.9, 0.025)); cyl(A, '#3f6fb5', -0.9, 0.12, -0.9, 0.14, 0.11, 0.24, { open: true }); // bucket
    sph(A, '#6a7380', -0.9, 2.5, -0.9, 0.18, { s: [1.4, 0.05, 1] }); // ceiling stain
    // mail slot letters (fly in)
    const mail = []; for (let i = 0; i < 8; i++) mail.push(box(A, i % 2 ? '#e0453a' : '#f4e0d8', 2.4, 0.75, 1.3, 0.2, 0.006, 0.13));
    // moth around lamp
    const moth = new THREE.Group(); A.add(moth); sph(moth, '#6a5a4a', 0, 0, 0, 0.02, { s: [1, 0.7, 1.6] }); const wl = box(moth, '#b8a890', 0.03, 0, 0, 0.05, 0.004, 0.04), wr = box(moth, '#b8a890', -0.03, 0, 0, 0.05, 0.004, 0.04);
    H.onUpdate((f, W) => {
      const S = W.apt || {};
      const mins = S.clock ?? 119; wc.userData.set(mins, (f / 30 * 1.0) % 60 + (S.clockSec || 0));
      const p = S.pack ?? 0; pack.forEach((o, i) => { o.visible = p < (i + 1) / (pack.length + 2); });
      table.visible = p < 0.75; boxes.forEach((b, i) => { const k = clamp((p - i / boxes.length * 0.8) * 6); b.visible = k > 0 && (S.boxesOut ?? 0) < (i + 1) / boxes.length; b.scale.set(1, Math.max(0.01, k), 1); });
      // falling apart: shelf board drops, books tumble
      const sf = S.shelfFall ?? 0; const b3 = boards[3]; b3.rotation.x = -clamp(sf * 2) * 0.5; b3.position.y = 1.4 - clamp(sf * 2) * 0.12;
      bk[2].userData.items.forEach((m, i) => { const t = clamp(sf * 1.6 - i * 0.04); m.position.y = (m.userData.y0 ??= m.position.y) - t * t * 1.35; m.rotation.x = t * (1 + i % 3) * 0.9; m.position.x = (m.userData.x0 ??= m.position.x) + t * 0.05 * (i % 2 ? 1 : -1); m.position.z = (m.userData.z0 ??= m.position.z) + (m.userData.dz ??= (i % 3) * 0.02); });
      // lamp swing + flicker
      const sw = S.lamp ?? 0.3; lamp.rotation.z = Math.sin(f * 0.09) * 0.06 * sw; lamp.rotation.x = Math.cos(f * 0.07) * 0.03 * sw; bulb.material.color.set(S.flicker && (f % 9 < 2) ? '#6a6040' : '#fff3c4');
      // drip
      drops.forEach((d, i) => { const ph = ((f + i * 17) % 50) / 50; d.position.y = 2.4 - ph * ph * 2.25; d.visible = ph < 0.98; });
      // curtains sway, laundry sways, fan
      curtL.rotation.x = Math.sin(f * 0.05) * 0.04; curtR.rotation.x = Math.sin(f * 0.05 + 1) * 0.04; shirts.forEach((s, i) => (s.rotation.x = Math.sin(f * 0.08 + i) * 0.12)); blades.rotation.z = f * 0.6; fanHead.rotation.y = Math.sin(f * 0.03) * 0.6;
      neon.material.color.set((f % 47) < 3 ? '#5a2030' : '#ff4f8a'); tvS.material.color.setScalar(0.85 + 0.15 * Math.sin(f * 1.3));
      // door bang + open
      dleaf.rotation.y = -(S.doorOpen ?? 0) * 1.4; dleaf.position.x = (S.doorBang ?? 0) * 0.02 * Math.sin(f * 2.2);
      // mail
      const ml = S.mail ?? -1; mail.forEach((m, i) => { const t = clamp(ml * 1.6 - i * 0.08); m.visible = ml >= 0 && t > 0; m.position.set(2.4 - t * (1.0 + i * 0.08), 0.75 * (1 - t) + 0.02 + t * (1 - t) * 0.6 + i * 0.006, 1.3 - t * (0.2 + i * 0.07)); m.rotation.y = t * (2 + i); });
      // moth
      const a = f * 0.21; moth.position.set(Math.cos(a) * 0.28, 1.85 + Math.sin(a * 1.7) * 0.1, 0.1 + Math.sin(a) * 0.28); moth.rotation.y = -a; wl.rotation.z = Math.sin(f * 2.3) * 0.8; wr.rotation.z = -Math.sin(f * 2.3) * 0.8;
      kettle.rotation.y = 0;
    });
    H.aptKettle = kettle;
  }

  // ======================================================================================
  // STREET outside the apartment block (2 a.m., saturated night blue). Road along x (z 0..6), building z -8..-2.6.
  // 2F corridor at y 2.8 (z -2.6..-1.4). Hero door 2F x=1.75; neighbour 2F x=5.25. Stairs at the right end.
  // ======================================================================================
  {
    const S = H.newSet('street');
    const road = plane(S, mt(X.asphalt(5), 16, 2), 0, 0, 3, 80, 6, { rx: -Math.PI / 2 }); road.material.map.repeat.set(10, 1);
    box(S, mt(X.concrete(4, [220, 6, 72]), 16, 1), 0, 0.06, -0.5, 80, 0.12, 1.8, { t: 1 }); box(S, '#b8bcc4', 0, 0.08, 0.42, 80, 0.16, 0.14);
    box(S, mt(X.concrete(41, [220, 6, 66]), 16, 1), 0, 0.06, 7.6, 80, 0.12, 3); // far sidewalk
    // building
    const BLD = new THREE.Group(); S.add(BLD);
    const sid = mt(X.siding(8, '#e2dccb'), 6, 3); box(BLD, sid, 0, 2.8, -5.3, 14.4, 5.6, 5.4);
    const roof = box(BLD, mt(X.kawara(9, 210), 6, 2), 0, 5.75, -5.3, 15.2, 0.3, 6.4); box(BLD, '#5c6470', 0, 5.95, -5.3, 15.2, 0.12, 0.3);
    box(BLD, mt(X.concrete(43, [215, 5, 62]), 6, 1), 0, 2.85, -2.0, 14.4, 0.18, 1.3, { t: 1 }); // 2F corridor slab
    for (let x = -7; x <= 7.05; x += 0.14) cyl(BLD, '#d9dde3', x, 3.45, -1.38, 0.012, 0.012, 1.0, { seg: 5, cast: false }); box(BLD, '#d9dde3', 0, 3.95, -1.38, 14.4, 0.06, 0.08); box(BLD, '#5c6470', 0, 3.0, -1.38, 14.4, 0.1, 0.1);
    for (const x of [-7.1, -3.5, 0, 3.5, 7.1]) box(BLD, '#cfd4da', x, 1.42, -1.45, 0.14, 2.84, 0.14);
    const doors = {}; for (const fl of [0, 1]) for (const [i, x] of [-5.25, -1.75, 1.75, 5.25].entries()) { const y0 = fl * 2.94;
      const dg = new THREE.Group(); dg.position.set(x - 0.45, y0, -2.58); BLD.add(dg); const leaf = new THREE.Group(); dg.add(leaf);
      box(leaf, ['#7d8796', '#8a6d5a', '#6d7f8a', '#7d8796'][i], 0.45, 1.0, 0, 0.9, 2.0, 0.06); sph(leaf, '#d9c27a', 0.8, 1.0, 0.05, 0.03); box(leaf, '#2e2a30', 0.45, 0.85, 0.035, 0.3, 0.035, 0.01);
      box(BLD, '#5c6470', x, y0 + 2.04, -2.58, 1.0, 0.08, 0.08); doors[`${fl}${i}`] = leaf;
      const nameC = X.sign(200, 80, [[['SATO', 'MORI', 'TANAKA', 'ITO'][i], 44, '#2e211d']], '#f4f1ea', '#2e211d'); const np = signBoard(BLD, nameC, x + 0.62, y0 + 1.5, -2.54, 0.2, 0.08, { d: 0.01, border: 0.01, frame: '#c9ccd2' });
      if (fl === 1 && i === 2) S.userData.plate = np;
      box(BLD, '#cfd4da', x + 0.85, y0 + 1.75, -2.4, 0.5, 0.35, 0.3); // AC unit
      box(BLD, '#2b3550', x - 1.2, y0 + 1.55, -2.58, 0.9, 0.6, 0.05); box(BLD, glow(fl ? (i === 2 ? '#ffd87a' : '#1d2742') : (i % 2 ? '#ffd87a' : '#1d2742')), x - 1.2, y0 + 1.55, -2.55, 0.8, 0.5, 0.01, { cast: false });
      for (let k = 0; k < 3; k++) cyl(BLD, '#5c6470', x - 1.62 + k * 0.42, y0 + 1.55, -2.5, 0.01, 0.01, 0.6, { seg: 4, cast: false });
      cyl(BLD, '#8a8f99', x + 0.95, y0 + 0.35, -2.45, 0.06, 0.06, 0.7, { seg: 8 }); // gas meter pipe
    }
    S.userData.doors = doors;
    // external steel stairs at the right end (x 7.2 -> 10.8)
    for (let i = 0; i < 14; i++) { const t = i / 14; box(BLD, '#8a96a8', 10.6 - t * 3.3, 0.1 + t * 2.8, -2.0, 0.26, 0.05, 1.0); }
    const strL = box(BLD, '#6d7a8c', 9.0, 1.45, -1.48, 3.9, 0.1, 0.06); strL.rotation.z = -Math.atan2(2.8, 3.3); const strR = box(BLD, '#6d7a8c', 9.0, 1.45, -2.52, 3.9, 0.1, 0.06); strR.rotation.z = -Math.atan2(2.8, 3.3);
    const rl = box(BLD, '#d9dde3', 9.0, 2.35, -1.45, 4.2, 0.05, 0.05); rl.rotation.z = -Math.atan2(2.8, 3.3); box(BLD, '#8a96a8', 7.6, 2.85, -2.0, 1.1, 0.12, 1.1);
    // vending machines + bikes + mailboxes + garbage station + plants
    for (const [i, x] of [-9.2, -8.3].entries()) { const v = new THREE.Group(); v.position.set(x, 0, -1.6); S.add(v); box(v, i ? '#e0453a' : '#2f6fb5', 0, 0.95, 0, 0.85, 1.9, 0.75);
      plane(v, glowT(X.sign(256, 300, [['', 10, '#000']], i ? '#fff4e8' : '#e8f6ff', null)), 0, 1.25, 0.38, 0.7, 0.8, { noink: false });
      for (let r_ = 0; r_ < 3; r_++) for (let c = 0; c < 5; c++) cyl(v, ['#c0392b', '#f2c14e', '#3f8f6f', '#2f6fb5', '#ffffff'][(c + r_) % 5], -0.26 + c * 0.13, 1.0 + r_ * 0.25, 0.4, 0.035, 0.035, 0.14, { seg: 8, cast: false });
      box(v, '#20232c', 0, 0.3, 0.38, 0.6, 0.16, 0.04); box(v, '#c9ccd2', 0.28, 0.75, 0.39, 0.08, 0.2, 0.02); }
    const vglow = box(S, glow('#cfe9ff', { transparent: true, opacity: 0.18, depthWrite: false }), -8.75, 0.02, -0.7, 2.2, 0.01, 1.6, { cast: false, noink: true });
    for (const x of [-4.5, -3.8, -3.1]) { const b = new THREE.Group(); b.position.set(x, 0, -1.15); b.rotation.y = 0.15; S.add(b);
      for (const dx of [-0.42, 0.42]) mesh(new THREE.TorusGeometry(0.3, 0.03, 6, 20), C('#2e2a30'), dx, 0.32, 0, b); line3(b, [-0.42, 0.32, 0], [0, 0.55, 0], 0.025, C(x < -4 ? '#c0392b' : x < -3.5 ? '#3f8f6f' : '#f2c14e')); line3(b, [0, 0.55, 0], [0.42, 0.32, 0], 0.025, C('#2e2a30')); line3(b, [0, 0.55, 0], [0.1, 0.85, 0], 0.02, C('#2e2a30')); box(b, '#2e2a30', 0.1, 0.88, 0, 0.06, 0.03, 0.4); box(b, '#b8bcc4', -0.32, 0.78, 0, 0.22, 0.14, 0.2); }
    for (let i = 0; i < 8; i++) { box(S, '#c9ccd2', -1.2 + (i % 4) * 0.3, 1.1 + Math.floor(i / 4) * 0.3, -2.45, 0.27, 0.26, 0.25); box(S, '#2e2a30', -1.2 + (i % 4) * 0.3, 1.14 + Math.floor(i / 4) * 0.3, -2.32, 0.18, 0.02, 0.01); }
    const gs = new THREE.Group(); gs.position.set(-6.2, 0, -1.0); S.add(gs); for (let i = 0; i < 5; i++) sph(gs, i % 2 ? '#e8eef2' : '#9fc6e8', -0.5 + i * 0.25, 0.22, (i % 2) * 0.2, 0.22); box(gs, mt(X.sign(256, 128, [['BURNABLE', 40, '#2e211d'], ['MON / THU', 30, '#c0392b']], '#f2c14e', '#2e211d')), 0, 0.9, -0.42, 0.7, 0.35, 0.02);
    const net = box(gs, toon({ color: '#3f8f6f', transparent: true, opacity: 0.55 }), 0, 0.35, 0.05, 1.5, 0.5, 0.8, { cast: false });
    plant(S, 6.6, 0, -1.6, 1.3, 7); plant(S, 6.1, 0, -1.7, 1.0, 8); plant(S, -7.2, 0, -1.7, 1.1, 9);
    // far side: block wall + hedge + houses
    box(S, mt(X.concrete(44, [30, 8, 68]), 12, 1), 0, 0.75, 9.3, 80, 1.5, 0.25, { t: 1 }); for (let x = -38; x < 40; x += 1.6) box(S, '#b5ab98', x, 1.55, 9.3, 0.3, 0.12, 0.3);
    const hr = rng(51); for (let i = 0; i < 26; i++) sph(S, i % 2 ? '#3f7a3a' : '#4f8f42', -38 + i * 3 + hr(), 1.9, 9.7, 0.9 + hr() * 0.5, { s: [1.3, 0.9, 1] });
    for (let i = 0; i < 9; i++) { const x = -32 + i * 8 + hr() * 2, h = 4 + hr() * 3; const hb = box(S, mt(X.siding(60 + i, ['#d9cdb4', '#c9d2dc', '#dcc6c0'][i % 3]), 2, 2), x, h / 2, 13 + hr() * 2, 5, h, 4); const rf = mesh(new THREE.ConeGeometry(3.8, 1.5, 4), C(['#3d4a66', '#7a3a2a', '#3f5a4a'][i % 3]), x, h + 0.7, hb.position.z, S); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 0.75);
      box(S, glow(hr() < 0.5 ? '#ffd87a' : '#2b3550'), x - 1, h * 0.6, hb.position.z - 2.01, 0.8, 0.7, 0.02, { cast: false }); }
    const skyB = plane(S, glowT(X.skyline(25, true, 2048, 512), { transparent: true }), 0, 7, 40, 120, 18, { ry: Math.PI }); const skyF = plane(S, glowT(X.skyline(26, true, 2048, 512), { transparent: true }), 0, 9, -30, 120, 20);
    // utility poles + wires + streetlight
    const poles = [-12, 2, 16].map((x) => { const p = new THREE.Group(); p.position.set(x, 0, 8.6); S.add(p); cyl(p, '#b8b2a6', 0, 4.5, 0, 0.13, 0.17, 9, { seg: 10 }); box(p, '#8a8f99', 0, 8.2, 0, 1.8, 0.1, 0.1); box(p, '#8a8f99', 0, 7.6, 0, 1.4, 0.1, 0.1);
      for (const dx of [-0.8, -0.3, 0.3, 0.8]) cyl(p, '#e9e2d0', dx, 8.3, 0, 0.04, 0.04, 0.14, { seg: 6 }); cyl(p, '#7d8796', 0.35, 6.6, 0.2, 0.22, 0.22, 0.6, { seg: 10 });
      for (let k = 0; k < 6; k++) box(p, '#d9c27a', 0, 1.6 + k * 0.4, 0.15, 0.2, 0.03, 0.06); return p; });
    for (let i = 0; i < 2; i++) for (const dx of [-0.8, -0.3, 0.3, 0.8]) wire(S, [-12 + i * 14 + dx, 8.3, 8.6], [2 + i * 14 + dx, 8.3, 8.6], 0.35 + dx * 0.05);
    for (const dx of [-0.8, 0.8]) { wire(S, [-26 + dx, 8.3, 8.6], [-12 + dx, 8.3, 8.6], 0.4); wire(S, [16 + dx, 8.3, 8.6], [30 + dx, 8.3, 8.6], 0.4); }
    wire(S, [2.3, 7.6, 8.6], [5.6, 5.4, -2.6], 0.4, 0.012); wire(S, [-11.7, 7.6, 8.6], [-5, 5.4, -2.6], 0.4, 0.012);
    const sl = new THREE.Group(); sl.position.set(2, 0, 8.6); S.add(sl); line3(sl, [0, 5.6, 0], [0, 5.9, -1.4], 0.05, C('#8a8f99')); box(sl, '#5c6470', 0, 5.85, -1.5, 0.3, 0.12, 0.5); const lampG = box(sl, glow('#fff1c0'), 0, 5.78, -1.5, 0.24, 0.02, 0.42, { cast: false });
    const pool = mesh(new THREE.CircleGeometry(3.2, 32), glow('#fff0c0', { transparent: true, opacity: 0.13, depthWrite: false }), 2, 0.015, 6.6, S, { rx: -Math.PI / 2, cast: false, noink: true });
    const moths = []; for (let i = 0; i < 5; i++) { const m = new THREE.Group(); sl.add(m); sph(m, '#3a3030', 0, 0, 0, 0.03, { s: [1, 0.7, 1.6] }); m.userData.w = [box(m, '#d9cdb4', 0.04, 0, 0, 0.06, 0.004, 0.05), box(m, '#d9cdb4', -0.04, 0, 0, 0.06, 0.004, 0.05)]; moths.push(m); }
    // cat on the far wall (3D)
    const cat = new THREE.Group(); cat.position.set(-2.5, 1.62, 9.3); S.add(cat); sph(cat, '#f2a64a', 0, 0.12, 0, 0.14, { s: [1.5, 0.8, 0.9] }); const ch = sph(cat, '#f2a64a', 0.2, 0.26, 0, 0.09); for (const s of [-1, 1]) mesh(new THREE.ConeGeometry(0.035, 0.07, 4), C('#f2a64a'), 0.2, 0.36, s * 0.05, cat);
    const tail = new THREE.Group(); tail.position.set(-0.18, 0.12, 0); cat.add(tail); cyl(tail, '#e08a3a', 0, 0.16, 0, 0.025, 0.03, 0.32, { seg: 6 });
    // the white van
    const van = new THREE.Group(); S.add(van); const vb = new THREE.Group(); van.add(vb);
    box(vb, '#f4f6f8', 0, 1.25, 0, 4.6, 1.9, 1.85); box(vb, '#f4f6f8', 2.55, 0.95, 0, 0.6, 1.3, 1.8); box(vb, '#cfd4da', 2.9, 0.55, 0, 0.12, 0.35, 1.8);
    box(vb, glow('#2b3550'), 2.27, 1.75, 0, 0.42, 0.6, 1.6, { cast: false }); const wsh = box(vb, '#4a6a9a', 2.42, 1.75, 0, 0.06, 0.62, 1.62); wsh.rotation.z = 0.35;
    for (const s of [-1, 1]) { box(vb, '#4a6a9a', 1.8, 1.72, s * 0.93, 0.7, 0.55, 0.02); box(vb, '#cfd4da', -0.1, 1.25, s * 0.93, 0.02, 1.7, 0.02); box(vb, '#8a8f99', 2.0, 0.6, s * 0.93, 0.6, 0.12, 0.03); }
    box(vb, '#2e2a30', 0, 0.3, 0, 4.8, 0.18, 1.86); box(vb, '#2e2a30', -2.35, 0.55, 0, 0.12, 0.3, 1.86);
    const hl = [-0.62, 0.62].map((z) => box(vb, glow('#fffbe0'), 2.97, 0.82, z, 0.04, 0.16, 0.3, { cast: false })); [-0.72, 0.72].forEach((z) => box(vb, glow('#ff3b3b'), -2.32, 1.0, z, 0.04, 0.3, 0.14, { cast: false }));
    const beams = [-0.62, 0.62].map((z) => { const m = mesh(new THREE.ConeGeometry(1.1, 6, 20, 1, true), glow('#fff6d0', { transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }), 6.0, 0.6, z, vb, { rz: Math.PI / 2, cast: false, noink: true }); return m; });
    const wheels = []; for (const x of [-1.5, 1.7]) for (const z of [-0.85, 0.85]) { const w = cyl(vb, '#1f1d22', x, 0.36, z, 0.36, 0.36, 0.25, { rx: Math.PI / 2, seg: 16 }); cyl(w, '#b8bcc4', 0, 0.13, 0, 0.16, 0.16, 0.02, { seg: 12 }); wheels.push(w); }
    const sideDoor = box(vb, '#eef1f4', 0.6, 1.2, 0.95, 1.4, 1.7, 0.05); box(vb, '#141824', 0.6, 1.2, 0.92, 1.36, 1.66, 0.01, { cast: false }); // interior dark behind door
    const plate = signBoard(vb, X.sign(200, 100, [['NIGHT 22-40', 34, '#2e5a3a']], '#f4f1ea', '#2e5a3a'), -2.42, 0.62, 0, 0.36, 0.18, { ry: -Math.PI / 2, d: 0.01 });
    const vboxes = []; for (let i = 0; i < 8; i++) vboxes.push(H.cardboard(vb, -1.9 + (i % 4) * 0.5, 0.39 + Math.floor(i / 4) * 0.4, -0.35 + (i % 2) * 0.1, 0.45, 0.38, 0.45));
    S.userData.van = van;
    H.onUpdate((f, W) => {
      const s = W.street || {};
      van.position.set(s.vanX ?? 30, 0, 3.2); van.rotation.y = s.vanYaw ?? 0; van.visible = s.van !== false;
      wheels.forEach((w) => (w.rotation.y = -(s.vanX ?? 0) / 0.36)); vb.position.y = (s.vanBounce ?? 0) * Math.sin(f * 0.9) * 0.02;
      sideDoor.position.x = 0.6 - (s.vanDoor ?? 0) * 1.4; sideDoor.position.z = 0.95 + (s.vanDoor ?? 0) * 0.06;
      vboxes.forEach((b, i) => (b.visible = (s.vanLoad ?? 0) > i / 8));
      beams.forEach((b) => (b.visible = s.beams !== false)); hl.forEach((h) => (h.visible = s.beams !== false));
      const pl = S.userData.plate, pt = s.plate ?? 0; pl.rotation.z = pt * 0.8; pl.position.set(1.75 + 0.62 + pt * 0.35, 2.94 + 1.5 - pt * pt * 0.4, -2.54 + pt * 0.5); pl.rotation.x = -pt * 0.6; pl.visible = pt < 0.98;
      for (const k in doors) doors[k].rotation.y = k === '13' ? (s.neighborDoor ?? 0) * 1.2 : k === '12' ? (s.heroDoor ?? 0) * 1.3 : 0;
      moths.forEach((m, i) => { const a = f * (0.16 + i * 0.03) + i * 1.3; m.position.set(Math.cos(a) * (0.3 + i * 0.08), 5.55 + Math.sin(a * 1.9) * 0.18, -1.5 + Math.sin(a) * (0.3 + i * 0.06)); m.rotation.y = -a; m.userData.w[0].rotation.z = Math.sin(f * 2.5 + i) * 0.9; m.userData.w[1].rotation.z = -Math.sin(f * 2.5 + i) * 0.9; });
      tail.rotation.z = Math.sin(f * 0.12) * 0.6 + 0.5; ch.rotation.y = Math.sin(f * 0.03) * 0.5; cat.position.x = -2.5 + (s.catWalk ?? 0);
      lampG.material.color.set((f % 61) < 2 ? '#a89a70' : '#fff1c0');
    });
  }

  // ======================================================================================
  // OFFICE (day, fluorescent). Room x -5..5, z -4..4, h 2.8. Hero desk at (0,0,0) facing +z (camera usually z>0).
  // ======================================================================================
  {
    const Of = H.newSet('office');
    plane(Of, mt(X.tiles(30, '#9db4c8', '#8fa7bd', 8, '#7d93a8'), 6, 6), 0, 0, 0, 10, 8, { rx: -Math.PI / 2 });
    const wm = mt(X.wallpaper(31, '#e4ead2', '#d2dcbc', 'stripes'), 5, 2); box(Of, wm, -5.05, 1.4, 0, 0.1, 2.8, 8); box(Of, wm, 5.05, 1.4, 0, 0.1, 2.8, 8); box(Of, wm, 0, 1.4, 4.05, 10, 2.8, 0.1);
    box(Of, wm, 0, 0.45, -4.05, 10, 0.9, 0.1); box(Of, wm, 0, 2.6, -4.05, 10, 0.4, 0.1); for (let x = -5; x <= 5; x += 1.25) box(Of, '#d9dde3', x, 1.65, -4.02, 0.08, 1.5, 0.12);
    plane(Of, glowT(X.skyline(33, false, 2048, 512)), 0, 2.0, -12, 26, 7); plane(Of, glow('#9fd0f5'), 0, 4, -14, 60, 14);
    box(Of, '#e9eef2', 0, 2.83, 0, 10.2, 0.06, 8.2, { cast: false }); for (const x of [-3, 0, 3]) for (const z of [-2.5, 0, 2.5]) H.fluoro(Of, x, 2.78, z, 1.4);
    const ban = signBoard(Of, X.sign(700, 140, [['OVERTIME = LOYALTY', 64, '#c0392b']], '#fff6d8', '#c0392b'), 0, 2.4, -3.98, 2.6, 0.5, { d: 0.02 });
    const desk = (x, z, hero) => { const g = new THREE.Group(); g.position.set(x, 0, z); Of.add(g); box(g, '#cfd6de', 0, 0.72, 0, 1.4, 0.05, 0.75); box(g, '#9aa7b5', -0.65, 0.36, 0, 0.05, 0.72, 0.7); box(g, '#9aa7b5', 0.45, 0.36, 0, 0.45, 0.72, 0.7);
      box(g, '#7d93a8', 0, 1.0, -0.4, 1.5, 0.55, 0.04); const mon = new THREE.Group(); mon.position.set(0, 0.75, -0.18); g.add(mon); box(mon, '#2b2f3d', 0, 0.3, 0, 0.55, 0.36, 0.04); plane(mon, glowT(X.screen('#3f8fd8', '#9fe0ff', (x * 7 + z) | 0)), 0, 0.3, 0.021, 0.5, 0.31); box(mon, '#2b2f3d', 0, 0.06, 0, 0.06, 0.12, 0.06);
      box(g, '#2b2f3d', 0, 0.76, 0.12, 0.45, 0.02, 0.15); const r = rng((x * 13 + z * 7) | 0); for (let i = 0; i < 3; i++) { const st = r() * 0.15; box(g, '#f4f1ea', -0.5 + i * 0.12, 0.76 + st / 2, 0.15, 0.22, 0.04 + st, 0.3); }
      cyl(g, ['#c0392b', '#f2c14e', '#3f8f6f'][(r() * 3) | 0], 0.5, 0.8, 0.15, 0.04, 0.035, 0.1); H.chair(g, 0, 0.7, Math.PI, ['#2f4f8a', '#3b3f52', '#8a4f7d'][(r() * 3) | 0]); return g; };
    for (const x of [-3.2, 3.2]) for (const z of [-1.8, 0.2, 2.2]) desk(x, z); const hd = desk(0, 0, true);
    // the hero's paper tower (wobbles, then topples)
    const tower = new THREE.Group(); tower.position.set(-0.45, 0.75, 0.05); Of.add(tower); const sheets = []; for (let i = 0; i < 26; i++) { const m = box(tower, i % 5 === 4 ? '#f2c14e' : '#f4f1ea', 0, 0.02 + i * 0.045, 0, 0.3, 0.04, 0.38); m.rotation.y = Math.sin(i * 1.7) * 0.15; sheets.push(m); }
    const tag = signBoard(tower, X.sign(200, 90, [['URGENT', 52, '#c0392b']], '#fff', '#c0392b'), 0.0, 1.0, 0.2, 0.22, 0.1, { d: 0.005, border: 0.005 });
    // boss desk + filing cabinets + water cooler + copier + plants + clock
    const bd = new THREE.Group(); bd.position.set(0, 0, -3.1); Of.add(bd); box(bd, '#7a5434', 0, 0.75, 0, 2.0, 0.08, 0.9); box(bd, '#6e4a2a', 0, 0.37, 0.4, 2.0, 0.74, 0.06); signBoard(bd, X.sign(300, 80, [['MANAGER', 50, '#f2c14e']], '#2e211d', null), 0, 0.85, 0.32, 0.5, 0.12, { rx: -0.6, d: 0.01 });
    for (let i = 0; i < 4; i++) { const fc = box(Of, '#9aa7b5', -4.6, 0.65, -3.4 + i * 0.6, 0.6, 1.3, 0.55); for (let k = 0; k < 3; k++) box(Of, '#c9ccd2', -4.29, 0.3 + k * 0.4, -3.4 + i * 0.6, 0.02, 0.05, 0.2); }
    const wc_ = new THREE.Group(); wc_.position.set(4.5, 0, -3.3); Of.add(wc_); box(wc_, '#e9eef2', 0, 0.5, 0, 0.4, 1.0, 0.4); cyl(wc_, toon({ color: '#8fd0f5', transparent: true, opacity: 0.8 }), 0, 1.25, 0, 0.17, 0.17, 0.5);
    box(Of, '#cfd4da', 4.5, 0.55, 1.5, 0.8, 1.1, 0.7); box(Of, '#2b2f3d', 4.5, 1.12, 1.5, 0.7, 0.04, 0.5);
    H.plant(Of, 4.5, 0, 3.4, 1.6, 41); H.plant(Of, -4.5, 0, 3.4, 1.6, 42); H.plant(Of, 4.6, 0, -0.5, 1.4, 43);
    const oc = clock(Of, 2.5, 2.25, -3.98, 0.22);
    const cork = box(Of, '#c89a5e', 5.0, 1.5, 0.8, 0.04, 0.9, 1.4); for (let i = 0; i < 6; i++) box(Of, ['#f4f1ea', '#f2c14e', '#9fc6e8'][i % 3], 4.97, 1.25 + (i % 2) * 0.35, 0.3 + Math.floor(i / 2) * 0.4, 0.01, 0.25, 0.2);
    H.onUpdate((f, W) => {
      const s = W.office || {}; oc.userData.set(23 * 60 - 25 + f / 180, f / 30 % 60);
      const p = s.paper ?? 0; sheets.forEach((m, i) => { const k = i / 26; m.position.x = Math.sin(f * 0.35 + i * 0.2) * 0.012 * k * (1 + p * 4) + (p > 0.5 ? (p - 0.5) * 2 * k * k * 1.2 : 0); m.position.y = 0.02 + i * 0.045 - (p > 0.5 ? (p - 0.5) ** 2 * 4 * k * 0.9 : 0); m.rotation.z = p > 0.5 ? -(p - 0.5) * 2 * k * 1.4 : Math.sin(f * 0.35 + i * 0.2) * 0.02 * k; });
      ban.rotation.z = Math.sin(f * 0.05) * 0.01;
    });
  }

  // ======================================================================================
  // PARENTS' HOME (warm evening). Dining room x -3.5..3.5, z -3..3. Table at (0,0,0) top y 0.72.
  // ======================================================================================
  {
    const Hm = H.newSet('home');
    plane(Hm, mt(X.woodFloor(50, 28, 52), 4, 4), 0, 0, 0, 7, 6, { rx: -Math.PI / 2 });
    const wm = mt(X.wallpaper(51, '#f1e3c8', '#e2c99a', 'diamond'), 5, 2); box(Hm, wm, -3.55, 1.3, 0, 0.1, 2.6, 6); box(Hm, wm, 3.55, 1.3, 0, 0.1, 2.6, 6); box(Hm, wm, -2.2, 1.3, -3.05, 2.7, 2.6, 0.1); box(Hm, wm, 2.2, 1.3, -3.05, 2.7, 2.6, 0.1); box(Hm, wm, 0, 2.3, -3.05, 1.7, 0.6, 0.1); box(Hm, wm, 0, 0.4, -3.05, 1.7, 0.8, 0.1); box(Hm, wm, 0, 1.3, 3.05, 7, 2.6, 0.1);
    box(Hm, '#d9c7a4', 0, 2.63, 0, 7.2, 0.06, 6.2, { cast: false }); for (let z = -3; z <= 3; z += 0.6) box(Hm, '#8a6440', 0, 2.58, z, 7, 0.05, 0.06);
    for (const [x, y, w, h] of [[0, 0.82, 1.7, 0.06], [0, 2.0, 1.7, 0.06], [-0.85, 1.4, 0.06, 1.2], [0.85, 1.4, 0.06, 1.2], [0, 1.4, 0.04, 1.2]]) box(Hm, '#7a5434', x, y, -3.0, w, h, 0.08);
    plane(Hm, glow('#ffb46c'), 0, 2.5, -12, 30, 12); const gr = rng(52); for (let i = 0; i < 7; i++) sph(Hm, i % 2 ? '#4f8f42' : '#3f7a3a', -4 + i * 1.4, 0.8 + gr(), -6 - gr() * 2, 1 + gr() * 0.6); box(Hm, '#b5ab98', 0, 0.8, -8.5, 20, 1.6, 0.3);
    sph(Hm, glow('#fff0c8'), 3, 2.2, -11.8, 0.8, { cast: false });
    // shoji doors on the left wall, kitchen counter right
    for (let i = 0; i < 3; i++) { const sj = new THREE.Group(); sj.position.set(-3.48, 0, -1.8 + i * 0.95); Hm.add(sj); plane(sj, mt(X.shoji(53)), 0, 1.0, 0, 0.92, 2.0, { ry: Math.PI / 2 }); }
    box(Hm, '#c9b48a', 3.15, 0.45, -1.2, 0.7, 0.9, 2.4); box(Hm, '#e9e2d0', 3.15, 0.92, -1.2, 0.72, 0.04, 2.42); box(Hm, '#a87444', 3.25, 1.9, -1.2, 0.5, 0.7, 2.4);
    for (let i = 0; i < 4; i++) cyl(Hm, ['#f4f1ea', '#3f6fb5', '#c0392b', '#f2c14e'][i], 3.1, 1.0, -2.0 + i * 0.4, 0.07, 0.05, 0.1);
    const pot = new THREE.Group(); pot.position.set(3.1, 0.94, -0.3); Hm.add(pot); cyl(pot, '#2e2a30', 0, 0.1, 0, 0.16, 0.14, 0.2);
    // table + chairs + dinner
    const T_ = new THREE.Group(); Hm.add(T_); box(T_, '#9a6a3e', 0, 0.72, 0, 1.7, 0.06, 0.95); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(T_, '#7a5434', sx * 0.75, 0.35, sz * 0.4, 0.07, 0.7, 0.07);
    box(T_, '#f2e6c8', 0, 0.755, 0, 1.2, 0.005, 0.5, { cast: false });
    const steamSrc = []; for (const [x, z] of [[-0.5, 0.25], [0, 0.28], [0.5, 0.25], [-0.25, -0.25], [0.3, -0.25]]) { cyl(T_, '#2e2a30', x, 0.8, z, 0.08, 0.05, 0.08); cyl(T_, '#f4f1ea', x, 0.835, z, 0.07, 0.07, 0.01); }
    for (const [x, z] of [[-0.28, 0.25], [0.25, 0.27]]) { cyl(T_, '#8a2a1a', x, 0.8, z, 0.08, 0.05, 0.08); cyl(T_, '#c98a4a', x, 0.835, z, 0.07, 0.07, 0.01); steamSrc.push([x, z]); }
    const plate = cyl(T_, '#f4f6f8', 0, 0.77, -0.02, 0.2, 0.18, 0.02); const fish = sph(T_, '#c98a4a', 0, 0.82, -0.02, 0.07, { s: [2.2, 0.6, 0.8] }); mesh(new THREE.ConeGeometry(0.06, 0.1, 4), C('#c98a4a'), 0.2, 0.82, -0.02, T_, { rz: Math.PI / 2 });
    const teapot = sph(T_, '#3f6f5a', 0.65, 0.84, -0.2, 0.09, { s: [1.2, 0.9, 1.2] }); for (const [x, z] of [[-0.7, 0.3], [0.7, 0.3]]) { box(T_, '#a87444', x, 0.79, z, 0.25, 0.01, 0.03); }
    for (const [x, z, ry] of [[-0.5, 0.75, Math.PI], [0.5, 0.75, Math.PI], [-0.5, -0.75, 0], [0.5, -0.75, 0]]) H.chair(Hm, x, z, ry, '#8a5c34');
    const steams = []; for (let i = 0; i < 6; i++) steams.push(sph(Hm, toon({ color: '#ffffff', transparent: true, opacity: 0.7 }), 0, 1, 0, 0.05, { cast: false }));
    // family photo (hero graduation), cabinet, TV, cat, pendant lamp
    const photo = signBoard(Hm, X.sign(300, 240, [['', 10, '#000']], '#cfe6f5', null, { photo: [80, 30, 140, 180] }), -2.0, 1.65, -2.98, 0.6, 0.48, { frame: '#c9a46a', border: 0.06, d: 0.03 });
    signBoard(Hm, X.sign(300, 140, [['GRADUATION', 40, '#2e211d'], ['WE ARE PROUD', 30, '#c0392b']], '#fff6d8', '#c9a46a'), -2.0, 1.25, -2.98, 0.5, 0.22, { d: 0.01 });
    box(Hm, '#7a5434', 2.2, 0.45, -2.7, 1.4, 0.9, 0.5); H.plant(Hm, 2.7, 0.9, -2.7, 0.8, 54); for (let i = 0; i < 3; i++) signBoard(Hm, X.sign(120, 150, [['', 10, '#000']], '#cfe6f5', null, { photo: [25, 20, 70, 110] }), 1.6 + i * 0.3, 1.05, -2.62, 0.18, 0.22, { frame: '#c9a46a', rx: -0.15, d: 0.01 });
    const lamp = new THREE.Group(); lamp.position.set(0, 2.6, 0); Hm.add(lamp); line3(lamp, [0, 0, 0], [0, -0.7, 0], 0.008, C('#2e211d')); const sh = cyl(lamp, '#e0a040', 0, -0.75, 0, 0.1, 0.4, 0.22, { open: true, seg: 20 }); sh.material = toon({ color: '#e0a040', side: THREE.DoubleSide }); sph(lamp, glow('#fff0c0'), 0, -0.8, 0, 0.08, { cast: false });
    const cat = new THREE.Group(); cat.position.set(2.6, 0, 1.6); Hm.add(cat); sph(cat, '#f4f1ea', 0, 0.15, 0, 0.17, { s: [1.5, 0.8, 0.9] }); const chd = sph(cat, '#f4f1ea', 0.24, 0.3, 0, 0.11); sph(cat, '#2e2a30', 0.05, 0.25, 0, 0.09, { s: [1, 0.5, 1] }); const tl = new THREE.Group(); tl.position.set(-0.22, 0.15, 0); cat.add(tl); cyl(tl, '#2e2a30', 0, 0.16, 0, 0.025, 0.03, 0.32, { seg: 6 });
    box(Hm, '#c0392b', -2.8, 0.03, 1.8, 1.4, 0.03, 1.0, { cast: false }); // rug
    signBoard(Hm, X.calendar('JAN'), 3.48, 1.6, 1.2, 0.32, 0.4, { ry: -Math.PI / 2, d: 0.01 });
    H.onUpdate((f, W) => {
      if (!Hm.visible) return;
      steams.forEach((m, i) => { const src = steamSrc[i % 2], ph = ((f + i * 23) % 60) / 60; m.position.set(src[0] + Math.sin(f * 0.1 + i) * 0.03, 0.86 + ph * 0.35, src[1]); m.scale.setScalar(0.4 + ph * 0.8); m.material.opacity = 0.75 * (1 - ph); });
      tl.rotation.z = Math.sin(f * 0.1) * 0.5 + 0.4; chd.rotation.y = Math.sin(f * 0.04) * 0.6; lamp.rotation.z = Math.sin(f * 0.05) * 0.015;
    });
  }
}
