// Sets for "The Dream Job That Keeps Your Passport". Each set: { group, origin, uses, update(f, w, cam) }.
// Story coordinates are LOCAL to a set (the engine adds `origin`). The shared 'desert' (ground, dunes, skyline, cranes)
// is in world coordinates and is shown with every desert-side set, so the city is one consistent place.
export function buildSets(THREE, scene, K, T) {
  const { add, grp, tbox, box, cyl, sph, toon, texM, basic, sign, palm, swayPalm, planter, suitcase, bench, clock, tickClock, plant, fanBlades, car, tower, chicken, goat, rng, tex } = K;
  const SETS = {};
  const mk = (key, origin, uses = []) => { const g = new THREE.Group(); g.position.set(...origin); scene.add(g); SETS[key] = { group: g, origin, uses, update: () => {} }; return g; };
  const glassMat = (col = '#bfe3f2', op = 0.22) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });
  const glass = (parent, geo, x, y, z, o = {}) => { const m = add(parent, geo, glassMat(o.col, o.op), x, y, z, { cast: false, ...o }); m.userData.ndSkip = true; m.renderOrder = 3; return m; };
  const M = {
    sand: texM(K.sand(21), 300, 300), sandPad: texM(K.sand(23, '#e3bf80'), 30, 30), asphalt: texM(K.concrete(5, [220, 8, 34]), 4, 60), apron: texM(K.concrete(6, [210, 6, 72]), 30, 30),
    tiles: texM(K.tiles('#efe9df', '#dcd4c6', 4), 6, 12), marble: texM(K.tiles('#f3ede2', '#e6d9c2', 2, '#c9b998'), 7, 12),
    plasterW: texM(K.plaster(8, 40), 3, 2), plasterG: texM(K.plaster(18, 150), 2, 1), white: toon('#f4f4f2'), steel: toon('#9aa3ab'), dark: toon('#2b2f3a'),
    wood: texM(K.wood(31), 1, 1), woodD: texM(K.wood(32, 22, 30), 1, 1), carpet: texM(K.carpet('#7a2e3a', '#e2b85c'), 5, 4), wallpaper: texM(K.wallpaper('#d6e8d0', '#a7ccaa'), 4, 2),
    corr: texM(K.corrugated('#d8dee4'), 6, 1), dirt: texM(K.dirt(7), 20, 20), grass: texM(K.grass(6), 60, 60),
  };

  // ======================= DESERT (shared, world coords) =======================
  const D = mk('desert', [0, 0, 0]);
  add(D, new THREE.PlaneGeometry(5000, 5000), M.sand, 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  { const r = rng(70);
    for (let i = 0; i < 60; i++) { const a = r() * Math.PI * 2, d = 520 + r() * 1300, x = Math.cos(a) * d, z = 300 + Math.sin(a) * d; if (z < -400 && Math.abs(x) < 500) continue;
      add(D, sph(1, 20, 10), toon(i % 2 ? '#e6c184' : '#dcb274'), x, -4, z, { cast: false, s: [40 + r() * 60, 10 + r() * 16, 30 + r() * 40] }); }
    const hues = [200, 190, 175, 210, 45, 160, 220, 30];
    const keep = (x, z) => Math.hypot(x + 60, z + 560) > 60 && Math.hypot(x - 80, z + 520) > 30;
    for (let i = 0; i < 70; i++) { const x = -380 + r() * 760, z = -580 - r() * 420; if (!keep(x, z)) continue; const h = 40 + r() * r() * 240, w = 14 + r() * 18;
      tower(D, x, z, w, w * (0.7 + r() * 0.6), h, hues[i % hues.length], i, i % 4); }
    tower(D, 10, -880, 30, 30, 420, 200, 99, 2); tower(D, -120, -760, 26, 26, 300, 175, 98, 3); tower(D, 150, -720, 24, 36, 260, 45, 97, 1);
    // city cranes on the skyline
    const cranes = [];
    for (const [x, z, h] of [[-200, -620, 90], [120, -640, 110], [-20, -600, 70], [260, -700, 120]]) { const c = grp(D, x, 0, z); add(c, tbox(2, h, 2, 4), toon('#f2c14e'), 0, h / 2, 0, { cast: false }); const jib = grp(c, 0, h, 0); add(jib, tbox(46, 1.6, 1.6, 4), toon('#f2c14e'), 12, 0, 0, { cast: false }); add(jib, tbox(6, 4, 3, 2), toon('#9aa3ab'), -9, -1, 0, { cast: false }); add(jib, cyl(0.15, 0.15, 20, 4), toon('#333'), 26, -10, 0, { cast: false }); cranes.push(jib); }
    // road to the city
    add(D, new THREE.PlaneGeometry(14, 1400), texM(K.concrete(8, [220, 6, 36]), 2, 100), 120, 0.03, -300, { rx: -Math.PI / 2, ry: 0, cast: false });
    for (let i = 0; i < 40; i++) palm(D, 120 + (i % 2 ? 11 : -11), -40 - i * 28, 8 + r() * 3, i + 3);
    SETS.desert.update = (f) => { cranes.forEach((j, i) => (j.rotation.y = 0.4 * Math.sin(f * 0.004 + i * 2) + i)); };
  }

  // shared plane builder (nose toward -z)
  const planeModel = (parent, x, y, z, ry = 0) => {
    const P = grp(parent, x, y, z, ry), w = toon('#f6f7f9'), teal = toon('#1f8f9a'), red = toon('#d6403a'), dk = toon('#26303f');
    const body = add(P, cyl(2.1, 2.1, 30, 28), w, 0, 0, 0, { rx: Math.PI / 2 });
    add(P, sph(2.1, 28, 16), w, 0, 0, -15, { s: [1, 1, 1.6] }); add(P, new THREE.ConeGeometry(2.1, 8, 28), w, 0, 0.6, 19, { rx: Math.PI / 2, s: [1, 1, 0.7] });
    add(P, tbox(4.3, 0.5, 30.2, 2), teal, 0, -0.6, 0, { s: [1, 1, 1] }).scale.x = 0.99;
    for (let i = 0; i < 22; i++) for (const s of [-1, 1]) add(P, tbox(0.06, 0.34, 0.26, 1), dk, s * 2.08, 0.6, -12 + i * 1.15);
    for (const s of [-1, 1]) add(P, tbox(0.06, 0.34, 0.5, 1), dk, s * 2.04, 0.65, -17.2, { ry: s * 0.4 });
    for (const s of [-1, 1]) { const wg = add(P, tbox(15, 0.45, 5, 2), w, s * 9, -1.0, 1, { ry: s * 0.38 }); const eng = add(P, cyl(0.95, 0.85, 4, 20), toon('#dfe3e8'), s * 6.2, -2.1, -0.8, { rx: Math.PI / 2 }); add(P, cyl(0.8, 0.8, 0.1, 20), dk, s * 6.2, -2.1, -2.8, { rx: Math.PI / 2 }); add(P, tbox(0.4, 1.2, 1.4, 1), w, s * 6.2, -1.4, -0.4); add(P, tbox(0.3, 1.6, 0.6, 1), red, s * 16.2, -0.4, 3.2); }
    add(P, tbox(0.5, 7, 5, 2), red, 0, 4.8, 18, { rz: 0 }).rotation.x = -0.35; for (const s of [-1, 1]) add(P, tbox(6, 0.3, 2.6, 2), w, s * 3.4, 1.2, 19.5, { ry: s * 0.3 });
    const gear = []; for (const [gx, gz] of [[0, -12], [-2, 2], [2, 2]]) { const g = grp(P, gx, -2.1, gz); add(g, cyl(0.1, 0.1, 1.4, 6), M.steel, 0, -0.4, 0); for (const s of [-0.22, 0.22]) add(g, cyl(0.55, 0.55, 0.35, 16), toon('#22242a'), s, -1.2, 0, { rz: Math.PI / 2 }); gear.push(g); }
    P.userData.gear = gear; return P;
  };

  // ======================= RUNWAY =======================
  { const G = mk('runway', [0, 0, 0], ['desert']);
    const rt = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 1024; const g = c.getContext('2d'); g.fillStyle = '#3b3f48'; g.fillRect(0, 0, 256, 1024); const r = rng(4); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},255,.05)`; g.fillRect(r() * 256, r() * 1024, 3, 3); } g.fillStyle = '#f4f4f0'; g.fillRect(122, 0, 12, 420); g.fillRect(8, 0, 6, 1024); g.fillRect(242, 0, 6, 1024); g.fillStyle = 'rgba(20,20,20,.35)'; for (let i = 0; i < 12; i++) g.fillRect(70 + r() * 110, r() * 1024, 4, 60 + r() * 80); return c; })();
    add(G, new THREE.PlaneGeometry(44, 1200), toon('#ffffff', { map: tex(rt, 1, 24) }), 0, 0.03, 100, { rx: -Math.PI / 2, cast: false });
    add(G, new THREE.PlaneGeometry(90, 1200), M.apron, -50, 0.02, 100, { rx: -Math.PI / 2, cast: false });
    for (let z = -400; z < 700; z += 24) for (const s of [-1, 1]) add(G, tbox(0.3, 0.3, 0.3, 1), basic(s > 0 ? '#ffe066' : '#6fb6ff'), s * 23, 0.15, z, { cast: false });
    for (let i = 0; i < 8; i++) for (const s of [-1, 1]) add(G, tbox(2.4, 0.02, 18, 1), toon('#f4f4f0'), s * (6 + i * 1.8) * 0.9, 0.04, 560, { cast: false });
    // terminal exterior + control tower
    const term = grp(G, -150, 0, 40); add(term, box(40, 14, 160), texM(K.towerGlass(195, 7, 8, 4), 6, 2), 0, 7, 0, { cast: false }); add(term, tbox(46, 1.2, 166, 4), toon('#f2f2ee'), 0, 14.6, 0, { cast: false });
    sign(term, 'DESERT CITY INTERNATIONAL', 20.4, 17, 0, 60, 5, { bg: '#ffffff', fg: '#1f6f8b', border: '#d6403a' }, Math.PI / 2);
    const ct = grp(G, -110, 0, 140); add(ct, cyl(3, 4, 44, 16), toon('#eef0f2'), 0, 22, 0); add(ct, cyl(7, 5, 6, 16), texM(K.towerGlass(190, 3, 8, 2), 3, 1), 0, 47, 0); add(ct, cyl(7.6, 7.6, 1, 16), toon('#d6403a'), 0, 50.5, 0);
    for (let i = 0; i < 10; i++) palm(G, -122, -60 + i * 16, 9, 40 + i);
    // windsock
    const ws = grp(G, 34, 0, 520); add(ws, cyl(0.12, 0.12, 8, 8), M.steel, 0, 4, 0); const sock = grp(ws, 0, 7.6, 0); for (let i = 0; i < 5; i++) add(sock, cyl(0.5 - i * 0.07, 0.45 - i * 0.07, 0.8, 12), toon(i % 2 ? '#ffffff' : '#f2762e'), 0, 0, 0.4 + i * 0.8, { rx: Math.PI / 2 });
    // baggage tractor with carts
    const bt = grp(G, -35, 0, 500); add(bt, tbox(2, 1.2, 3, 1), toon('#f2c14e'), 0, 0.9, 0); add(bt, tbox(1.8, 1, 1.4, 1), toon('#2b3a52'), 0, 1.9, 0.4); for (let i = 1; i < 4; i++) { add(bt, tbox(2, 0.3, 3, 1), M.steel, 0, 0.6, i * 3.6); suitcase(bt, -0.4, 0.75, i * 3.6, ['#d94a4a', '#3f6fb0', '#8fae5a'][i - 1], 2); suitcase(bt, 0.5, 0.75, i * 3.6 + 0.6, '#f2c14e', 2); }
    const plane = planeModel(G, 0, 3.5, 0);
    SETS.runway.update = (f, w) => { plane.position.set(0, w.planeY ?? 3.4, w.planeZ ?? 0); plane.rotation.x = w.planePitch ?? 0; sock.rotation.y = 0.2 * Math.sin(f * 0.07); sock.children.forEach((c, i) => (c.position.x = 0.2 * Math.sin(f * 0.2 - i))); bt.position.z = 500 - f * 0.12; };
  }

  // ======================= CABIN =======================
  { const G = mk('cabin', [0, 0, 6000]);
    add(G, tbox(3.8, 0.1, 18, 1), M.carpet, 0, -0.05, -2);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.15, 18, 40, 1, true), toon('#f1ede4', { side: THREE.BackSide })); shell.rotation.x = Math.PI / 2; shell.position.set(0, 1.15, -2); G.add(shell);
    add(G, tbox(4.4, 3.6, 0.2, 1), toon('#e8e2d6'), 0, 1.2, -10.8); sign(G, 'EXIT', 1.1, 2.3, -10.65, 0.6, 0.25, { bg: '#c0392b', fg: '#fff', border: null }); add(G, tbox(1.4, 2.2, 0.06, 1), toon('#3f6fb0'), -0.4, 1.1, -10.68);
    add(G, tbox(4.4, 3.6, 0.2, 1), toon('#e8e2d6'), 0, 1.2, 7);
    const seatM = toon('#2f5fa8'), cover = toon('#f4f1ea');
    for (let i = 0; i < 16; i++) { const z = -9 + i * 0.95; for (const x of [-1.32, -0.8, 0.8, 1.32]) { const s = grp(G, x, 0, z); add(s, tbox(0.48, 0.14, 0.5, 1), seatM, 0, 0.44, 0); add(s, tbox(0.48, 0.8, 0.12, 1), seatM, 0, 0.88, 0.26, { rx: 0.12 }); add(s, tbox(0.36, 0.22, 0.13, 1), cover, 0, 1.18, 0.31, { rx: 0.12 }); add(s, tbox(0.05, 0.18, 0.4, 1), M.steel, x > 0 ? -0.27 : 0.27, 0.58, 0); add(s, tbox(0.22, 0.16, 0.02, 1), toon('#1d2a3a'), 0, 0.95, 0.33); } }
    for (const s of [-1, 1]) { add(G, tbox(0.9, 0.5, 18, 2), toon('#ece8de'), s * 1.45, 2.05, -2); for (let i = 0; i < 16; i++) add(G, tbox(0.02, 0.4, 0.02, 1), toon('#c9c3b6'), s * 1.0, 2.05, -9.45 + i * 0.95); }
    for (let i = 0; i < 8; i++) add(G, tbox(0.8, 0.04, 1.4, 1), basic('#fff6dc'), 0, 2.55, -9 + i * 2);
    // windows with a scrolling view of the city
    const view = document.createElement('canvas'); view.width = 1024; view.height = 256; { const g = view.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#5fa8e6'); gr.addColorStop(0.6, '#cfe6f6'); gr.addColorStop(0.61, '#e8c88c'); gr.addColorStop(1, '#d9b070'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 256); const r = rng(3); for (let i = 0; i < 46; i++) { const x = r() * 1024, w = 14 + r() * 24, h = 30 + r() * r() * 120; g.fillStyle = `hsl(${[200, 185, 45, 170][i % 4]},45%,${50 + r() * 20}%)`; g.fillRect(x, 156 - h, w, h); g.strokeStyle = '#2a3a4a'; g.lineWidth = 2; g.strokeRect(x, 156 - h, w, h); } for (let i = 0; i < 6; i++) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(r() * 1024, 30 + r() * 50, 40, 14, 0, 0, 7); g.fill(); } }
    const vt = tex(view); vt.repeat.set(0.25, 1);
    const winTex = [];
    for (let i = 0; i < 16; i++) for (const s of [-1, 1]) { const z = -9 + i * 0.95 + 0.05; const wg = grp(G, s * 1.86, 1.2, z, -s * Math.PI / 2); const t = vt.clone(); t.offset.x = i * 0.06; t.needsUpdate = true; winTex.push(t);
      add(wg, new THREE.PlaneGeometry(0.3, 0.4), new THREE.MeshBasicMaterial({ map: t }), 0, 0, 0.01, { cast: false }); add(wg, new THREE.TorusGeometry(0.2, 0.045, 8, 24), toon('#e6e1d6'), 0, 0, 0.03, { s: [0.85, 1.1, 1], cast: false }); add(wg, tbox(0.34, 0.12, 0.04, 1), toon('#d8d2c6'), 0, 0.22, 0.03); }
    SETS.cabin.update = (f) => { winTex.forEach((t, i) => (t.offset.x = (i % 16) * 0.06 + f * 0.0035)); };
  }

  // ======================= TERMINAL (arrivals + departures) =======================
  { const G = mk('terminal', [-150, 0, 0], ['desert']);
    add(G, tbox(26, 0.1, 56, 4), M.tiles, -3, -0.03, -13);
    add(G, new THREE.PlaneGeometry(140, 140), M.apron, 80, 0.01, -13, { rx: -Math.PI / 2, cast: false });
    // glass wall facing the apron (+x)
    glass(G, new THREE.PlaneGeometry(56, 9.2), 10, 4.6, -13, { ry: Math.PI / 2 });
    for (let z = -41; z <= 15; z += 3) add(G, tbox(0.22, 9.2, 0.22, 1), toon('#cfd6de'), 10, 4.6, z, { cast: false });
    for (const y of [0.15, 3, 6, 9.1]) add(G, tbox(0.3, 0.2, 56, 4), toon('#cfd6de'), 10, y, -13, { cast: false });
    // walls + ceiling (no shadows so the hall stays bright)
    add(G, tbox(0.4, 9.4, 56, 4), M.plasterW, -16.2, 4.7, -13, { cast: false }); add(G, tbox(26, 9.4, 0.4, 4), M.plasterW, -3, 4.7, -41.2, { cast: false }); add(G, tbox(12.9, 4, 0.4, 4), M.plasterW, -9.55, 2, 15.2, { cast: false }); add(G, tbox(8.9, 4, 0.4, 4), M.plasterW, 5.55, 2, 15.2, { cast: false }); add(G, tbox(4.2, 1, 0.4, 2), M.plasterW, -1, 3.5, 15.2, { cast: false }); add(G, tbox(26, 0.9, 0.4, 4), M.plasterW, -3, 8.95, 15.2, { cast: false });
    glass(G, new THREE.PlaneGeometry(26, 4.5), -3, 6.25, 15.25); for (let x = -16; x <= 10; x += 2.6) add(G, tbox(0.18, 4.5, 0.25, 1), toon('#cfd6de'), x, 6.25, 15.2, { cast: false }); add(G, tbox(26, 0.2, 0.3, 4), toon('#cfd6de'), -3, 4.05, 15.15, { cast: false });
    sign(G, ['GOLD SALE', '50% OFF'], -10.5, 2.2, 14.98, 3.2, 1.8, { bg: '#f2c14e', fg: '#7a2e3a', border: '#ffffff' }, Math.PI); sign(G, ['SHINY TOWERS', 'NOW LEASING'], -6.2, 2.2, 14.98, 3, 1.8, { bg: '#2f8c92', fg: '#ffffff', border: '#f2c14e' }, Math.PI);
    sign(G, 'TAXI  >', 3.6, 3.4, 14.98, 2.2, 0.6, { bg: '#ffd23f', fg: '#1d2330', border: null }, Math.PI); sign(G, 'EXIT', -1, 3.75, 14.95, 1.3, 0.45, { bg: '#2f6a3a', fg: '#ffffff', border: null }, Math.PI);
    const eclk = clock(G, 7.2, 2.6, 14.95, 0.55, Math.PI);
    const cafe = grp(G, 6.6, 0, 11.6, Math.PI); add(cafe, tbox(3, 1.1, 1, 1), toon('#8a5a3a'), 0, 0.55, 0); add(cafe, tbox(3.1, 0.08, 1.1, 1), toon('#f4efe6'), 0, 1.12, 0); add(cafe, tbox(3.2, 0.1, 1.6, 1), K.texM(K.stripes('#d6403a', '#ffffff', 12), 1, 1), 0, 2.5, 0.2, { rx: 0.2 }); for (const sx of [-1.5, 1.5]) add(cafe, cyl(0.04, 0.04, 1.4, 6), M.steel, sx, 1.8, 0.5); sign(cafe, 'CAFE', 0, 2.95, 0.3, 1.4, 0.5, { bg: '#d6403a', fg: '#fff', border: '#ffffff' }); for (let i = 0; i < 4; i++) add(cafe, cyl(0.06, 0.05, 0.14, 10), toon(['#ffffff', '#f2c14e', '#d6403a', '#3f6fb0'][i]), -1 + i * 0.6, 1.23, 0.1); add(cafe, tbox(0.4, 0.5, 0.35, 1), toon('#9aa3ab'), 1.1, 1.4, -0.2);
    add(G, tbox(26, 0.3, 56, 4), toon('#f7f7f4'), -3, 9.35, -13, { cast: false });
    for (let z = -38; z <= 12; z += 6) add(G, tbox(14, 0.06, 1.2, 2), basic('#e8f6ff'), -4, 9.18, z, { cast: false });
    for (let z = -32; z <= 8; z += 10) { add(G, cyl(0.45, 0.45, 9.2, 20), toon('#f2f2ee'), -7, 4.6, z, { cast: false }); add(G, cyl(0.6, 0.6, 0.3, 20), toon('#d8d2c6'), -7, 0.15, z); }
    // arrivals board on the back wall
    const board = add(G, new THREE.PlaneGeometry(7, 3.5), toon('#ffffff', { map: tex(K.boardTex([['EK 201', 'DUBAI', 'LANDED', ''], ['QR 88', 'DOHA', 'LANDED', ''], ['DC 404', 'MANILA', 'ON TIME', ''], ['DC 117', 'KATHMANDU', 'LANDED', ''], ['DC 552', 'DHAKA', 'DELAYED', ''], ['DC 909', 'COLOMBO', 'ON TIME', '']])) }), -15.95, 5.6, -2, { ry: Math.PI / 2, cast: false });
    add(G, tbox(0.2, 3.8, 7.3, 1), toon('#2b2f3a'), -16.05, 5.6, -2);
    // welcome banner hanging from the ceiling
    const ban = sign(G, ['WELCOME TO YOUR', 'DREAM JOB!'], -1, 4.7, 6, 7.4, 2.1, { bg: '#1f8f9a', fg: '#ffffff', border: '#f2c14e', stroke: '#13525a' }, Math.PI);
    for (const s of [-1, 1]) add(G, cyl(0.02, 0.02, 3.6, 4), M.steel, -1 + s * 3.3, 7.6, 6);
    // ad posters
    sign(G, ['SHINY CITY', 'LIVE YOUR DREAM'], -15.95, 2.4, -14, 4, 2, { bg: '#f2c14e', fg: '#7a2e3a', border: '#ffffff' }, Math.PI / 2);
    sign(G, ['TAX FREE', 'SALARIES!'], -15.95, 2.4, 8, 3.6, 1.8, { bg: '#d6403a', fg: '#ffffff', border: '#f2c14e' }, Math.PI / 2);
    // exit doors (slide open)
    const doorL = glass(G, new THREE.PlaneGeometry(2, 2.6), -2, 1.3, 14.9), doorR = glass(G, new THREE.PlaneGeometry(2, 2.6), 0, 1.3, 14.9);
    for (const x of [-3.1, 1.1]) add(G, tbox(0.15, 3, 0.3, 1), M.steel, x, 1.5, 14.9); add(G, tbox(4.4, 0.3, 0.3, 1), M.steel, -1, 3, 14.9);
    // luggage carousel
    const car0 = grp(G, -10, 0, -22); add(car0, tbox(2.6, 0.5, 8, 1), M.steel, 0, 0.25, 0); for (const s of [-1, 1]) add(car0, cyl(1.3, 1.3, 0.5, 24, 1), M.steel, 0, 0.25, s * 4);
    const plates = []; for (let i = 0; i < 34; i++) { const p = add(car0, tbox(0.62, 0.08, 0.5, 1), toon(i % 2 ? '#3a3f4a' : '#4a505c'), 0, 0.56, 0); plates.push(p); }
    const bags = []; const bc = ['#d94a4a', '#3f6fb0', '#f2c14e', '#8fae5a', '#8a5cc2', '#e07a3a']; for (let i = 0; i < 7; i++) bags.push(suitcase(car0, 0, 0.6, 0, bc[i % 6], 0.9));
    add(car0, tbox(1.4, 2.5, 1.2, 1), toon('#5a6270'), 0, 1.25, -5.6); add(car0, tbox(1.0, 0.9, 0.1, 1), toon('#1d2330'), 0, 1.0, -4.98);
    const ovalPt = (u) => { u = ((u % 1) + 1) % 1; const L = 8, C = Math.PI * 1.3, P = 2 * L + 2 * C; let d = u * P; if (d < L) return [1.3, -4 + d, 0]; d -= L; if (d < C) { const a = d / 1.3; return [1.3 * Math.cos(a), 4 + 1.3 * Math.sin(a), a]; } d -= C; if (d < L) return [-1.3, 4 - d, Math.PI]; d -= L; const a = Math.PI + d / 1.3; return [1.3 * Math.cos(a), -4 + 1.3 * Math.sin(a), a]; };
    // palms, benches, bins, kiosk
    const palms = []; for (const [x, z] of [[6, -28], [6, -16], [6, -4], [6, 8], [-13, -32], [-13, 4]]) { planter(G, x, z, 0.9, '#d9d2c4'); palms.push(palm(G, x, z, 5.5, x * 3 + z, 0.7)); }
    bench(G, -13, -6, Math.PI / 2, '#3f6fb0'); bench(G, -13, -10, Math.PI / 2, '#3f6fb0'); bench(G, 2, 2, 0, '#d6403a'); bench(G, 2, -20, 0, '#d6403a');
    for (const [x, z] of [[3, 6], [-12, 10]]) { add(G, cyl(0.25, 0.22, 0.8, 14), toon('#7a8a96'), x, 0.4, z); add(G, cyl(0.27, 0.27, 0.06, 14), toon('#2b2f3a'), x, 0.82, z); }
    const kiosk = grp(G, -6, 0, 6); add(kiosk, tbox(1.6, 1.1, 0.8, 1), toon('#f2c14e'), 0, 0.55, 0); sign(kiosk, 'INFO', 0, 2.2, 0, 1.2, 0.5, { bg: '#1f6f8b' }); add(kiosk, cyl(0.04, 0.04, 1.2, 6), M.steel, 0, 1.6, 0);
    // departures zone: passport control booths + queue
    sign(G, 'DEPARTURES', -3, 6.6, -40.9, 7, 1.4, { bg: '#1d2a3a', fg: '#ffd23f', border: '#ffd23f' });
    add(G, new THREE.PlaneGeometry(8, 3), toon('#ffffff', { map: tex(K.boardTex([['DC 405', 'MANILA', 'BOARDING', ''], ['DC 118', 'KATHMANDU', 'GATE 7', ''], ['DC 553', 'DHAKA', 'GATE 3', ''], ['DC 910', 'COLOMBO', 'ON TIME', '']], { title: 'DEPARTURES' })) }), 4, 4.2, -40.95, { cast: false });
    for (const x of [-10, -4, 2]) { const b = grp(G, x, 0, -34); add(b, tbox(2.4, 1.15, 1.2, 1), toon('#e9e4da'), 0, 0.58, 0); add(b, tbox(2.5, 0.08, 1.3, 1), M.woodD, 0, 1.19, 0); glass(b, new THREE.PlaneGeometry(2.4, 1.0), 0, 1.75, 0.55); add(b, tbox(2.4, 0.12, 0.12, 1), M.steel, 0, 2.3, 0.55); add(b, tbox(0.4, 0.3, 0.3, 1), toon('#2b2f3a'), 0.6, 1.38, -0.2); add(b, tbox(0.08, 1.5, 1.2, 1), M.steel, 1.25, 1.55, 0); add(b, tbox(0.08, 1.5, 1.2, 1), M.steel, -1.25, 1.55, 0); }
    sign(G, 'PASSPORT CONTROL', -4, 3.6, -33.3, 5, 0.8, { bg: '#1f8f9a', fg: '#fff', border: '#ffffff' });
    for (let i = 0; i < 6; i++) for (const x of [-5.4, -2.6]) { const z = -31 + i * 1.6; add(G, cyl(0.05, 0.05, 1, 8), toon('#c9b048'), x, 0.5, z); add(G, cyl(0.2, 0.2, 0.05, 12), toon('#c9b048'), x, 0.03, z); if (i < 5) add(G, tbox(0.03, 0.1, 1.6, 1), toon('#c0392b'), x, 0.92, z + 0.8); }
    // outside: parked plane, jet bridge, apron cars
    const p2 = planeModel(G, 48, 4.2, -8, Math.PI / 2 + 0.3);
    const jb = grp(G, 18, 0, -8); add(jb, tbox(16, 3, 3, 2), toon('#cfd6de'), 8, 5, 0, { cast: false }); add(jb, cyl(0.6, 0.6, 5, 10), M.steel, 14, 2.5, 0);
    const tug = grp(G, 30, 0, 14); add(tug, tbox(2, 1.4, 3, 1), toon('#f2c14e'), 0, 0.9, 0); add(tug, tbox(1.6, 1, 1.2, 1), toon('#2b3a52'), 0, 2, -0.4);
    SETS.terminal.update = (f, w) => {
      plates.forEach((p, i) => { const [x, z, a] = ovalPt(i / 34 + f * 0.0016); p.position.set(x, 0.56, z); p.rotation.y = a; });
      bags.forEach((b, i) => { const [x, z, a] = ovalPt(i / 7 + 0.03 + f * 0.0016); b.position.set(x, 0.6, z); b.rotation.y = a + 1.57; });
      const o = Math.min(1, Math.max(0, w.doors ?? 0)); doorL.position.x = -2 - o * 1.9; doorR.position.x = 0 + o * 1.9;
      palms.forEach((p) => swayPalm(p, f, 0.5)); ban.rotation.x = 0.03 * Math.sin(f * 0.05); ban.rotation.y = Math.PI + 0.04 * Math.sin(f * 0.037);
      tug.position.z = 14 - ((f * 0.05) % 50); tickClock(eclk, f, 1); p2.children[0] && (p2.position.y = 4.2);
    };
  }

  // ======================= MALL =======================
  { const G = mk('mall', [-60, 0, -560], ['desert']);
    add(G, tbox(30, 0.1, 50, 4), M.marble, 0, -0.03, 0);
    const wallM = texM(K.plaster(19, 30), 4, 2);
    for (const s of [-1, 1]) add(G, tbox(0.4, 11, 50, 4), wallM, s * 15, 5.5, 0, { cast: false }); add(G, tbox(30, 11, 0.4, 4), wallM, 0, 5.5, -25, { cast: false }); add(G, tbox(30, 11, 0.4, 4), wallM, 0, 5.5, 25, { cast: false });
    // upper level ring + glass railing
    for (const s of [-1, 1]) { add(G, tbox(5, 0.5, 50, 4), M.marble, s * 12.5, 5, 0, { cast: false }); glass(G, new THREE.PlaneGeometry(50, 1.1), s * 10, 5.8, 0, { ry: Math.PI / 2 }); add(G, tbox(0.12, 0.12, 50, 2), toon('#c9b048'), s * 10, 6.35, 0); }
    add(G, tbox(15, 0.5, 4, 4), M.marble, 0, 5, -23, { cast: false });
    // glass roof grid
    for (let x = -15; x <= 15; x += 3) add(G, tbox(0.2, 0.3, 50, 2), toon('#e9edf2'), x, 11.1, 0, { cast: false }); for (let z = -25; z <= 25; z += 5) add(G, tbox(30, 0.3, 0.2, 2), toon('#e9edf2'), 0, 11.1, z, { cast: false });
    glass(G, new THREE.PlaneGeometry(30, 50), 0, 11.2, 0, { rx: Math.PI / 2, op: 0.12 });
    // shopfronts on both levels
    const shops = [['GOLD SOUK', '#f2c14e', '#7a2e3a'], ['PERFUME', '#d2337a', '#fff'], ['SNEAKERS', '#2f8c92', '#fff'], ['COFFEE', '#6a3f22', '#ffd23f'], ['TOYS', '#8a5cc2', '#fff'], ['PHONES', '#3f6fb0', '#fff'], ['SWEETS', '#e07a3a', '#fff'], ['WATCHES', '#1d2a3a', '#f2c14e']];
    let k = 0; for (const s of [-1, 1]) for (const lv of [0, 5.25]) for (let i = 0; i < 4; i++) { const z = -18 + i * 11, [n, bg, fg] = shops[k++ % shops.length]; const sh = grp(G, s * 14.7, lv, z, -s * Math.PI / 2);
      add(sh, tbox(8, 3.4, 0.3, 2), toon(bg), 0, 1.9, -0.2, { cast: false }); glass(sh, new THREE.PlaneGeometry(7, 2.6), 0, 1.4, 0.05, { op: 0.3 }); sign(sh, n, 0, 3.3, 0.15, 5, 0.8, { bg, fg, border: '#ffffff' });
      const aw = add(sh, tbox(7.6, 0.08, 1.2, 1), K.texM(K.stripes(bg, '#ffffff', 10), 1, 1), 0, 2.85, 0.6, { rx: 0.35 }); for (let j = 0; j < 3; j++) add(sh, tbox(0.6, 0.8 + j * 0.2, 0.5, 1), toon(['#f2c14e', '#d94a4a', '#3f6fb0'][j]), -2 + j * 2, 0.5 + j * 0.1, -0.3); }
    // escalator (rises toward -z)
    const esc = grp(G, -4, 0, 0); const run = 10, rise = 5.1, ang = Math.atan2(rise, run);
    for (const s of [-1, 1]) { const side = add(esc, tbox(0.15, 1.2, Math.hypot(run, rise) + 1, 2), toon('#cfd6de'), s * 0.75, rise / 2 + 0.6, 0, { cast: false }); side.rotation.x = ang; const rail = add(esc, tbox(0.12, 0.12, Math.hypot(run, rise) + 1, 2), toon('#1d2330'), s * 0.75, rise / 2 + 1.25, 0); rail.rotation.x = ang; }
    const under = add(esc, tbox(1.4, 0.8, Math.hypot(run, rise), 2), M.steel, 0, rise / 2 - 0.4, 0); under.rotation.x = ang;
    const steps = []; for (let i = 0; i < 28; i++) steps.push(add(esc, tbox(1.3, 0.08, 0.38, 1), toon(i % 2 ? '#5a6270' : '#4a505c'), 0, 0, 0));
    // fountain
    const fo = grp(G, 6, 0, 2); add(fo, cyl(3, 3.1, 0.7, 32), toon('#e6d9c2'), 0, 0.35, 0); add(fo, cyl(2.75, 2.75, 0.05, 32), toon('#5fb8d8'), 0, 0.62, 0, { cast: false }); add(fo, cyl(0.35, 0.5, 1.8, 16), toon('#e6d9c2'), 0, 1.2, 0); add(fo, cyl(1.2, 0.5, 0.3, 24), toon('#e6d9c2'), 0, 2.1, 0); add(fo, cyl(1.05, 1.05, 0.04, 24), toon('#5fb8d8'), 0, 2.25, 0, { cast: false });
    const jets = []; for (let i = 0; i < 10; i++) jets.push(add(fo, sph(0.09, 8, 6), toon('#9fd8f0'), 0, 0, 0, { cast: false }));
    // AC vents with streamers
    const strm = []; for (const [x, y, z] of [[-14.75, 9, -6], [-14.75, 9, 6], [14.75, 9, 0], [-14.75, 3.6, 10]]) { const v = grp(G, x, y, z, x < 0 ? Math.PI / 2 : -Math.PI / 2); add(v, tbox(2.2, 0.7, 0.12, 1), toon('#dfe3e8'), 0, 0, 0); for (let j = 0; j < 5; j++) add(v, tbox(2, 0.04, 0.05, 1), toon('#9aa3ab'), 0, -0.25 + j * 0.12, 0.07); for (let j = 0; j < 6; j++) { const sg = grp(v, -0.9 + j * 0.36, -0.32, 0.08); add(sg, tbox(0.08, 0.6, 0.01, 1), toon(['#d2337a', '#2f8c92', '#f2c14e'][j % 3]), 0, -0.3, 0); strm.push(sg); } }
    const palms = []; for (const [x, z] of [[-9, -14], [-9, 14], [9, -16], [11, 16]]) { planter(G, x, z, 1, '#c9b998'); palms.push(palm(G, x, z, 5, x + z, 0.7)); }
    bench(G, 6, 8, Math.PI, '#7a2e3a'); bench(G, 6, -4, 0, '#7a2e3a');
    sign(G, 'SHINY MALL', 0, 8.6, -24.75, 10, 2, { bg: '#ffffff', fg: '#d2337a', border: '#f2c14e' });
    SETS.mall.update = (f) => {
      const L = Math.hypot(run, rise); steps.forEach((s, i) => { const u = ((i / 28 + f * 0.004) % 1); s.position.set(0, u * rise + 0.08, run / 2 - u * run); });
      jets.forEach((j, i) => { const t = ((f * 0.03 + i / 10) % 1), a = i / 10 * Math.PI * 2; j.position.set(Math.cos(a) * t * 1.0, 2.3 + 2.2 * t - 3.4 * t * t, Math.sin(a) * t * 1.0); });
      strm.forEach((s, i) => (s.rotation.x = 0.7 + 0.35 * Math.sin(f * 0.45 + i * 1.3))); palms.forEach((p) => swayPalm(p, f, 0.4));
    };
    SETS.mall.escPos = (u) => [-4, u * rise, run / 2 - u * run];
  }

  // ======================= BOSS'S OFFICE (high up in a tower) =======================
  { const G = mk('office', [80, 90, -520], ['desert']);
    add(G, tbox(10.4, 0.2, 8.4, 2), M.carpet, 0, -0.1, 0);
    add(G, tbox(10.4, 0.2, 8.4, 2), toon('#f4f2ec'), 0, 3.5, 0, { cast: false });
    // tower shell (outside) — no shadows
    const shellM = texM(K.towerGlass(205, 31, 4, 10), 2, 6);
    for (const s of [-1, 1]) add(G, box(0.3, 140, 8.8), shellM, s * 5.35, -20, 0, { cast: false }); add(G, box(10.8, 140, 0.3), shellM, 0, -20, 4.35, { cast: false });
    add(G, box(10.8, 90, 0.3), shellM, 0, -45.05, -4.35, { cast: false }); add(G, box(10.8, 46, 0.3), shellM, 0, 26.6, -4.35, { cast: false });
    // inner walls
    for (const s of [-1, 1]) add(G, tbox(0.15, 3.4, 8, 2), M.wallpaper, s * 5.1, 1.7, 0, { cast: false }); add(G, tbox(10, 3.4, 0.15, 2), M.wallpaper, 0, 1.7, 4.1, { cast: false });
    for (const s of [-1, 1]) add(G, tbox(0.2, 0.25, 8, 2), M.woodD, s * 5.0, 0.12, 0); add(G, tbox(10, 0.25, 0.2, 2), M.woodD, 0, 0.12, 4.0);
    // window wall (north, -z) with mullions
    glass(G, new THREE.PlaneGeometry(10, 3.4), 0, 1.7, -4.2, { op: 0.15 });
    for (let x = -5; x <= 5; x += 2) add(G, tbox(0.14, 3.4, 0.14, 1), toon('#3a3f4a'), x, 1.7, -4.2); add(G, tbox(10.2, 0.16, 0.2, 1), toon('#3a3f4a'), 0, 0.08, -4.2); add(G, tbox(10.2, 0.16, 0.2, 1), toon('#3a3f4a'), 0, 3.35, -4.2);
    // desk (drawers face -z, toward the boss's chair)
    const desk = grp(G, 0, 0, -0.9); const dw = M.wood;
    add(desk, tbox(2.8, 0.1, 1.2, 1), dw, 0, 0.8, 0); add(desk, tbox(2.7, 0.72, 0.08, 1), M.woodD, 0, 0.4, 0.52); add(desk, tbox(0.08, 0.75, 1.1, 1), M.woodD, -1.32, 0.38, 0);
    add(desk, tbox(0.9, 0.75, 1.1, 1), M.woodD, 0.92, 0.38, 0);
    for (let i = 1; i < 3; i++) { add(desk, tbox(0.82, 0.2, 0.05, 1), dw, 0.92, 0.6 - i * 0.24, -0.56); add(desk, tbox(0.2, 0.04, 0.04, 1), toon('#c9a94a'), 0.92, 0.6 - i * 0.24, -0.6); }
    const drawer = grp(desk, 0.92, 0.6, -0.1); add(drawer, tbox(0.82, 0.2, 0.06, 1), dw, 0, 0, -0.46); add(drawer, tbox(0.78, 0.03, 0.9, 1), M.woodD, 0, -0.09, 0); for (const s of [-1, 1]) add(drawer, tbox(0.03, 0.16, 0.9, 1), M.woodD, s * 0.38, -0.01, 0); add(drawer, tbox(0.78, 0.16, 0.03, 1), M.woodD, 0, -0.01, 0.44);
    add(drawer, tbox(0.22, 0.04, 0.04, 1), toon('#c9a94a'), 0, 0.02, -0.5);
    const lab = sign(drawer, 'SAFEKEEPING', 0, -0.04, -0.495, 0.5, 0.09, { bg: '#c9a94a', fg: '#3a2a12', border: null, frame: '#8a6a2a', depth: 0.01 }, Math.PI);
    const ppM = toon('#ffffff', { map: tex(K.passportTex()) }), ppMs = [toon('#7a1f2e'), toon('#1f3f7a'), toon('#2f6a3a'), toon('#5a2a6a')];
    for (let i = 0; i < 14; i++) { const r_ = rng(i + 5); add(drawer, tbox(0.13, 0.018, 0.18, 1), [ppMs[i % 4], ppMs[i % 4], i === 13 ? ppM : ppMs[i % 4], ppMs[i % 4], ppMs[i % 4], ppMs[i % 4]], -0.25 + (i % 4) * 0.165 + (r_() - 0.5) * 0.03, -0.065 + Math.floor(i / 8) * 0.02, -0.25 + Math.floor((i % 8) / 4) * 0.22, { ry: (r_() - 0.5) * 0.4 }); }
    add(drawer, sph(0.045, 14, 10), toon('#e5c158'), -0.1, -0.02, -0.25);
    // desk top props
    const stacks = []; for (let i = 0; i < 9; i++) stacks.push(add(desk, tbox(0.3, 0.05, 0.4, 1), toon(i % 3 ? '#fbf8ef' : '#efe6c8'), -0.95, 0.88 + i * 0.05, 0.1));
    const np = sign(desk, 'THE BOSS', 0, 0.92, 0.42, 0.6, 0.14, { bg: '#c9a94a', fg: '#3a2a12', border: null, frame: '#3a2a22', depth: 0.06 });
    add(desk, cyl(0.06, 0.07, 0.12, 12), toon('#c9a94a'), 0.4, 0.91, 0.3); for (let i = 0; i < 3; i++) add(desk, cyl(0.008, 0.008, 0.2, 6), toon('#1d2330'), 0.4 + (i - 1) * 0.02, 1.0, 0.3, { rz: (i - 1) * 0.2 });
    const lap = grp(desk, 1.05, 0, -0.1, 0.5); add(lap, tbox(0.4, 0.03, 0.3, 1), toon('#2b2f3a'), 0, 0.86, 0); add(lap, tbox(0.4, 0.28, 0.02, 1), toon('#2b2f3a'), 0, 1.0, -0.15, { rx: -0.25 }); add(lap, new THREE.PlaneGeometry(0.34, 0.22), basic('#7cc4ff'), 0, 1.0, -0.162, { rx: -0.25, ry: Math.PI, cast: false });
    add(desk, cyl(0.05, 0.04, 0.1, 12), toon('#ffffff'), 1.1, 0.9, 0.2); add(desk, tbox(0.22, 0.08, 0.16, 1), toon('#c0392b'), -0.4, 0.89, 0.25);
    // chairs
    const bossChair = grp(G, 0, 0, -2.0); add(bossChair, tbox(0.8, 0.18, 0.7, 1), toon('#7a2e3a'), 0, 0.5, 0); add(bossChair, tbox(0.84, 1.1, 0.2, 1), toon('#7a2e3a'), 0, 1.1, -0.35); add(bossChair, cyl(0.06, 0.06, 0.4, 8), M.steel, 0, 0.25, 0); add(bossChair, cyl(0.35, 0.35, 0.05, 10), M.steel, 0, 0.03, 0);
    for (const x of [-0.8, 0.8]) { const c = grp(G, x, 0, 0.6, Math.PI); add(c, tbox(0.55, 0.1, 0.5, 1), toon('#3f6fb0'), 0, 0.45, 0); add(c, tbox(0.55, 0.6, 0.08, 1), toon('#3f6fb0'), 0, 0.78, -0.24); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(c, cyl(0.025, 0.025, 0.45, 6), toon('#2b2f3a'), sx * 0.22, 0.22, sz * 0.2); }
    // walls: clock, framed photos, PAYDAY sign, AC, cabinets, plant, cooler, safe, door
    const clk = clock(G, -5.0, 2.5, -1.5, 0.32, Math.PI / 2);
    const framePic = (x, y, z, ry, lines, bg) => { sign(G, lines, x, y, z, 0.7, 0.55, { bg, fg: '#fff', border: '#c9a94a', frame: '#c9a94a', depth: 0.05 }, ry); };
    framePic(-5.0, 2.2, 1.2, Math.PI / 2, ['EMPLOYER', 'OF THE YEAR'], '#2f6a3a'); framePic(-5.0, 1.5, 2.2, Math.PI / 2, ['#1 BOSS'], '#7a2e3a');
    sign(G, ['PAYDAY:', 'SOON'], 5.0, 2.0, -1.0, 1.4, 0.9, { bg: '#ffffff', fg: '#c0392b', border: '#c0392b', frame: '#3a2a22' }, -Math.PI / 2);
    const ac = grp(G, 5.0, 2.9, 1.5, -Math.PI / 2); add(ac, tbox(1.4, 0.4, 0.3, 1), toon('#f4f4f2'), 0, 0, 0); const acS = []; for (let j = 0; j < 5; j++) { const sg = grp(ac, -0.5 + j * 0.25, -0.18, 0.16); add(sg, tbox(0.06, 0.45, 0.01, 1), toon(['#2f8c92', '#d2337a', '#f2c14e'][j % 3]), 0, -0.22, 0); acS.push(sg); }
    for (let i = 0; i < 2; i++) { const fc = grp(G, 4.6, 0, -3.3 + i * 0.75); add(fc, tbox(0.7, 1.3, 0.6, 1), toon('#8a96a2'), 0, 0.65, 0); for (let j = 0; j < 3; j++) add(fc, tbox(0.2, 0.04, 0.04, 1), toon('#2b2f3a'), -0.36, 0.3 + j * 0.4, 0, { ry: Math.PI / 2 }); }
    plant(G, -4.4, 0, -3.5, 2.2); plant(G, 4.4, 0, 3.4, 1.6);
    const cooler = grp(G, -4.5, 0, 3.4); add(cooler, tbox(0.4, 1.0, 0.4, 1), toon('#f4f4f2'), 0, 0.5, 0); add(cooler, cyl(0.17, 0.17, 0.5, 16), new THREE.MeshToonMaterial({ gradientMap: undefined, color: '#9fd4ff', transparent: true, opacity: 0.8 }), 0, 1.25, 0);
    const safe = grp(G, -4.5, 0, -2.8); add(safe, tbox(0.8, 0.9, 0.7, 1), toon('#3a3f4a'), 0, 0.45, 0); add(safe, cyl(0.12, 0.12, 0.05, 16), toon('#c9a94a'), 0.41, 0.5, 0, { rz: Math.PI / 2 });
    const door = grp(G, 3, 0, 4.0); add(door, tbox(1.1, 2.3, 0.06, 1), M.woodD, 0, 1.15, 0); add(door, tbox(0.7, 0.5, 0.07, 1), toon('#dfefff'), 0, 1.7, 0); sign(door, 'MANAGER', 0, 1.7, -0.05, 0.6, 0.18, { bg: '#dfefff', fg: '#2b2f3a', border: null, depth: 0.01 }, Math.PI);
    // the VISA chain (links from a tag to the boss's hand), driven by w.chain = { a:[x,y,z], b:[x,y,z], n }
    const links = []; const linkM = toon('#b6bec7'); for (let i = 0; i < 30; i++) links.push(add(G, new THREE.TorusGeometry(0.045, 0.014, 6, 12), linkM, 0, 0, 0, { cast: true }));
    const tag = sign(G, 'VISA', 0, 0, 0, 0.32, 0.18, { bg: '#f2c14e', fg: '#3a2a12', border: null, depth: 0.02 });
    // resignation letter on the desk
    const letter = add(desk, tbox(0.21, 0.004, 0.297, 1), toon('#ffffff', { map: tex(K.signTex(['I QUIT', ':)'], { bg: '#fbf8ef', fg: '#2b2f3a', border: null, w: 256, h: 362 })) }), -0.2, 0.86, 0.15);
    SETS.office.update = (f, w) => {
      drawer.position.z = -0.1 - (w.drawer ?? 0) * 0.62; tickClock(clk, f, 30); acS.forEach((s, i) => (s.rotation.x = -0.6 - 0.3 * Math.sin(f * 0.5 + i)));
      const tp = w.topple ?? 0; stacks.forEach((s, i) => { const k = Math.max(0, Math.min(1, tp * 1.6 - i * 0.07)); s.position.set(-0.95 - k * (0.4 + i * 0.12), 0.88 + i * 0.05 * (1 - k) - k * k * (0.9 - i * 0.02 > 0 ? Math.min(0.88, 0.5 + i * 0.05) : 0), 0.1 + k * (i % 3 - 1) * 0.3); s.rotation.set(k * (i % 2 ? 1.2 : -0.9), k * i * 0.3, k * (1.4 + i * 0.2)); if (k >= 1) s.position.y = 0.03 + i * 0.012; });
      letter.visible = !!w.letter; if (w.letter) { const t = Math.min(1, w.letter); letter.position.set(-0.2, 0.86 + (1 - t) * 0.5, 0.15 + (1 - t) * 0.6); letter.rotation.set((1 - t) * -0.8, 0, 0); }
      const ch = w.chain; links.forEach((l) => (l.visible = !!ch)); tag.visible = !!ch;
      if (ch) { const [a, b] = [ch.a, ch.b], n = ch.n || 24, sag = ch.sag ?? 0.25; for (let i = 0; i < links.length; i++) { const l = links[i]; if (i >= n) { l.visible = false; continue; } const u = i / (n - 1); l.position.set(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - sag * 4 * u * (1 - u) + 0.01 * Math.sin(f * 0.3 + i), a[2] + (b[2] - a[2]) * u); l.rotation.set(0, Math.atan2(b[0] - a[0], b[2] - a[2]) + (i % 2) * Math.PI / 2, 0); l.rotateX(Math.PI / 2); } tag.position.set(a[0], a[1] - 0.12, a[2] + 0.02); tag.rotation.set(0, 0, 0.2 * Math.sin(f * 0.2)); }
    };
  }

  // ======================= YARD: labour camp + dorm + construction site =======================
  { const G = mk('yard', [260, 0, -180], ['desert']);
    add(G, new THREE.PlaneGeometry(140, 160), M.sandPad, 0, 0.02, -10, { rx: -Math.PI / 2, cast: false });
    // chain-link fence (alpha texture, never inked)
    const fM = new THREE.MeshToonMaterial({ gradientMap: undefined, map: tex(K.fence(), 30, 1), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, color: '#c9d0d6' });
    const fenceRun = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), m = add(G, new THREE.PlaneGeometry(L, 2.6), fM, (x0 + x1) / 2, 1.3, (z0 + z1) / 2, { ry: -Math.atan2(z1 - z0, x1 - x0), cast: false }); m.userData.ndSkip = true; for (let i = 0; i <= L; i += 3) add(G, cyl(0.05, 0.05, 2.8, 6), M.steel, x0 + (x1 - x0) * i / L, 1.4, z0 + (z1 - z0) * i / L); };
    fenceRun(-50, 50, -5, 50); fenceRun(5, 50, 70, 50); fenceRun(-50, -80, -50, 50); fenceRun(70, -80, 70, 50); fenceRun(-50, -80, 70, -80);
    // gate (two leaves, swing open via w.gate 0..1) + arch sign + gatehouse
    const gate = []; for (const s of [-1, 1]) { const h = grp(G, s * 5, 0, 50); const leaf = grp(h, 0, 0, 0); add(leaf, tbox(5, 0.1, 0.1, 1), M.steel, -s * 2.5, 2.6, 0); add(leaf, tbox(5, 0.1, 0.1, 1), M.steel, -s * 2.5, 0.2, 0); add(leaf, tbox(0.1, 2.5, 0.1, 1), M.steel, -s * 4.95, 1.4, 0); add(leaf, tbox(5.4, 0.08, 0.08, 1), M.steel, -s * 2.5, 1.4, 0, { rz: s * 0.45 }); const fm = add(leaf, new THREE.PlaneGeometry(5, 2.4), fM, -s * 2.5, 1.4, 0, { cast: false }); fm.userData.ndSkip = true; gate.push(h); add(G, tbox(0.3, 3.4, 0.3, 1), toon('#5a6270'), s * 5.15, 1.7, 50); }
    for (const s of [-1, 1]) add(G, tbox(0.3, 6, 0.3, 1), toon('#3f6fb0'), s * 5.6, 3, 50.4); sign(G, 'SUNRISE WORKERS CAMP', 0, 6.4, 50.4, 11, 1.2, { bg: '#3f6fb0', fg: '#ffffff', border: '#f2c14e' });
    const gh = grp(G, 9, 0, 52); add(gh, tbox(3, 2.8, 3, 2), M.corr, 0, 1.4, 0); add(gh, tbox(3.4, 0.2, 3.4, 1), toon('#5a6270'), 0, 2.9, 0); add(gh, tbox(1.6, 0.9, 0.05, 1), toon('#9fd4ff'), -0.3, 1.6, 1.52);
    // dorm cabin: interior x∈[-28.5,-21.5], z∈[-5.5,5.5], h 3 — interior walls painted, exterior corrugated
    const DX = -25; const dorm = grp(G, DX, 0, 0);
    const inM = texM(K.plaster(33, 170), 2, 1), outM = M.corr;
    const wall = (w, h, d, x, y, z) => { add(dorm, tbox(w, h, d, 2), [outM, outM, outM, outM, outM, outM], x, y, z, { cast: false }); };
    const inner = (geo, x, y, z, o = {}) => add(dorm, geo, inM, x, y, z, { cast: false, ...o });
    wall(0.2, 3.2, 11.4, -3.6, 1.6, 0); wall(0.2, 3.2, 11.4, 3.6, 1.6, 0); wall(7.4, 3.2, 0.2, 0, 1.6, -5.7);
    wall(3, 3.2, 0.2, -2.2, 1.6, 5.7); wall(3, 3.2, 0.2, 2.2, 1.6, 5.7); wall(1.4, 0.8, 0.2, 0, 2.8, 5.7);
    inner(new THREE.PlaneGeometry(11.2, 3.1), -3.48, 1.55, 0, { ry: Math.PI / 2 }); inner(new THREE.PlaneGeometry(11.2, 3.1), 3.48, 1.55, 0, { ry: -Math.PI / 2 }); inner(new THREE.PlaneGeometry(7, 3.1), 0, 1.55, -5.58);
    add(dorm, tbox(7.4, 0.25, 11.6, 2), outM, 0, 3.3, 0, { cast: false }); add(dorm, tbox(7.2, 0.12, 11.2, 2), texM(K.concrete(40, [30, 20, 62]), 2, 3), 0, 0.06, 0);
    const doorLeaf = grp(dorm, -0.7, 0, 5.72); add(doorLeaf, tbox(1.4, 2.4, 0.07, 1), toon('#8a5a3a'), 0.7, 1.2, 0); add(doorLeaf, sph(0.05, 8, 6), toon('#c9a94a'), 1.25, 1.1, 0.06);
    const roomSign = sign(dorm, ['ROOM FOR 2'], 1.1, 2.75, 5.86, 1.3, 0.42, { bg: '#ffffff', fg: '#1d2a3a', border: '#2f8c92', depth: 0.03 });
    for (const s of [-1, 1]) { const wn = grp(dorm, s * 3.62, 2.1, 3.5, s * Math.PI / 2); add(wn, tbox(1.1, 0.8, 0.12, 1), toon('#9fd4ff'), 0, 0, 0); add(wn, tbox(1.2, 0.08, 0.16, 1), toon('#f4f4f2'), 0, 0.42, 0); add(wn, tbox(1.2, 0.08, 0.16, 1), toon('#f4f4f2'), 0, -0.42, 0); add(wn, tbox(0.06, 0.8, 0.16, 1), toon('#f4f4f2'), 0, 0, 0); }
    const bunks = [], blankets = ['#c45a8a', '#3f6fb0', '#8fae5a', '#e07a3a', '#8a5cc2', '#2f8c92', '#d94a4a', '#f2c14e', '#5a9ec4', '#7a2e3a', '#6f93b8', '#c9a94a'];
    const mattress = texM(K.stripes('#eef2f6', '#9cb6d8', 12), 1, 1);
    let bi = 0; for (const x of [-2.75, 2.75]) for (const z of [-3.9, -1.1, 1.7]) { const b = grp(dorm, x, 0, z); for (const sx of [-0.45, 0.45]) for (const sz of [-0.95, 0.95]) add(b, cyl(0.035, 0.035, 2.3, 6), toon('#4a6a8a'), sx, 1.15, sz);
      const beds = []; for (const y of [0.45, 1.7]) { add(b, tbox(0.95, 0.06, 2.0, 1), toon('#4a6a8a'), 0, y, 0); add(b, tbox(0.88, 0.16, 1.92, 1), mattress, 0, y + 0.1, 0); add(b, tbox(0.6, 0.12, 0.32, 1), toon('#f4f1ea'), 0, y + 0.24, -0.75); const bl = add(b, tbox(0.9, 0.08, 1.1, 1), toon(blankets[bi++ % 12]), 0, y + 0.22, 0.38); beds.push(bl); }
      add(b, tbox(0.06, 1.2, 0.06, 1), toon('#4a6a8a'), (x < 0 ? 0.48 : -0.48), 1.2, 0.9); for (let k2 = 0; k2 < 4; k2++) add(b, tbox(0.04, 0.04, 0.3, 1), toon('#4a6a8a'), (x < 0 ? 0.48 : -0.48), 0.7 + k2 * 0.28, 0.9 - 0.15);
      bunks.push({ g: b, beds }); }
    // the empty bunk above the hero (east side, z=1.7): its blanket, pillow, bag can vanish
    const heroBunk = bunks[5]; const bag = suitcase(heroBunk.g, 0.2, 1.88, 0.5, '#3f6fb0', 0.6); bag.rotation.z = Math.PI / 2;
    // lockers, calendar, tally marks, sink, fans, laundry line, clock
    for (let i = 0; i < 5; i++) { const l = grp(dorm, -2.6 + i * 0.7, 0, -5.3); add(l, tbox(0.66, 1.9, 0.45, 1), toon(['#5a9ec4', '#8fae5a', '#e07a3a', '#5a9ec4', '#c45a8a'][i]), 0, 0.95, 0); for (let j = 0; j < 3; j++) add(l, tbox(0.4, 0.03, 0.02, 1), toon('#2b2f3a'), 0, 1.6 + j * 0.06, 0.23); }
    const calT = (m) => K.signTex([`MONTH ${m}`, 'PAYDAY ?'], { bg: '#ffffff', fg: m === 1 ? '#1d2a3a' : '#c0392b', border: '#c0392b', w: 256, h: 300 });
    const calBack = sign(dorm, ['MONTH 2', 'PAYDAY ?'], 3.4, 2.1, -1.0, 0.6, 0.7, { bg: '#ffffff', fg: '#c0392b', border: '#c0392b', depth: 0.02 }, -Math.PI / 2);
    const calPage = grp(dorm, 3.37, 2.45, -1.0, -Math.PI / 2); const cpm = add(calPage, new THREE.PlaneGeometry(0.6, 0.7), toon('#ffffff', { map: tex(calT(1)), side: THREE.DoubleSide }), 0, -0.35, 0.02, { cast: false });
    const tally = add(dorm, new THREE.PlaneGeometry(0.9, 0.5), new THREE.MeshBasicMaterial({ map: tex((() => { const c = document.createElement('canvas'); c.width = 256; c.height = 140; const g = c.getContext('2d'); g.strokeStyle = '#2b2f3a'; g.lineWidth = 5; for (let k3 = 0; k3 < 9; k3++) { const x = 20 + k3 * 24 + Math.floor(k3 / 5) * 14; if (k3 === 4) { g.beginPath(); g.moveTo(10, 40); g.lineTo(130, 100); g.stroke(); continue; } g.beginPath(); g.moveTo(x, 30); g.lineTo(x + 4, 110); g.stroke(); } g.fillStyle = '#2b2f3a'; g.font = '26px Lilita'; g.fillText('YEARS', 150, 130); return c; })()), transparent: true }), 3.46, 2.75, 1.7, { ry: -Math.PI / 2, cast: false });
    const sink = grp(dorm, -3.1, 0, -4.6); add(sink, tbox(0.6, 0.2, 0.45, 1), toon('#f4f4f2'), 0, 0.9, 0); add(sink, cyl(0.03, 0.03, 0.3, 6), M.steel, 0, 1.15, -0.15); add(sink, cyl(0.025, 0.025, 0.14, 6), M.steel, 0, 1.28, -0.08, { rx: Math.PI / 2 });
    const fans = [fanBlades(dorm, 0, 2.95, -2.5, 0.7), fanBlades(dorm, 0, 2.95, 2.5, 0.7)];
    const shirts = []; add(dorm, cyl(0.01, 0.01, 7, 4), toon('#ddd'), 0, 2.45, -0.2, { rz: Math.PI / 2 }); for (let i = 0; i < 6; i++) { const s = grp(dorm, -2.6 + i * 1.0, 2.45, -0.2); add(s, tbox(0.5, 0.6, 0.02, 1), toon(['#e07a3a', '#5a9ec4', '#f4f1ea', '#8fae5a', '#c45a8a', '#f2c14e'][i]), 0, -0.3, 0); shirts.push(s); }
    const dclk = clock(dorm, -3.45, 2.6, -1.0, 0.22, Math.PI / 2); add(dorm, tbox(0.7, 0.5, 0.6, 1), M.wood, 0, 0.25, -1.6); for (let i = 0; i < 5; i++) add(dorm, tbox(0.06, 0.004, 0.09, 1), toon(i % 2 ? '#ffffff' : '#d6403a'), -0.2 + i * 0.1, 0.505, -1.6 + (i % 2) * 0.05, { ry: i * 0.4 }); for (const sx of [-0.6, 0.6]) add(dorm, cyl(0.2, 0.2, 0.45, 12), toon('#3f6fb0'), sx, 0.22, -1.6); add(dorm, cyl(0.15, 0.12, 0.2, 14), M.steel, 0.1, 0.6, -1.55);
    const beamM = new THREE.MeshBasicMaterial({ color: '#fff1c4', transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }); const beamG = new THREE.BoxGeometry(1.0, 3.6, 0.7); beamG.translate(0, -1.8, 0); const beam = add(dorm, beamG, beamM, 3.3, 2.5, 3.5, { cast: false }); beam.rotation.z = -1.0; beam.userData.ndSkip = true; beam.renderOrder = 4;
    const beam2 = add(dorm, beamG, beamM, -3.3, 2.5, 3.5, { cast: false }); beam2.rotation.z = 1.0; beam2.userData.ndSkip = true; beam2.renderOrder = 4;
    add(dorm, tbox(0.8, 0.06, 0.06, 1), basic('#fff6dc'), 0, 3.15, -1.0); add(dorm, tbox(0.8, 0.06, 0.06, 1), basic('#fff6dc'), 0, 3.15, 1.0);
    // other cabins
    for (const [x, z] of [[-25, 22], [-25, -22], [-10, 22], [-10, -22], [-10, 0]]) { const c = grp(G, x, 0, z); add(c, tbox(7.4, 3.2, 11.4, 3), M.corr, 0, 1.6, 0); add(c, tbox(7.6, 0.2, 11.6, 3), toon('#7a8a96'), 0, 3.3, 0); add(c, tbox(1.2, 2.2, 0.08, 1), toon('#8a5a3a'), 0, 1.1, 5.72); for (const s of [-1, 1]) add(c, tbox(0.08, 0.8, 1.1, 1), toon('#9fd4ff'), s * 3.72, 2.1, 2); }
    // laundry lines outside
    const yardShirts = []; for (let i = 0; i < 8; i++) { const s = grp(G, -18 + i * 0.9, 2.2, 12); add(s, tbox(0.5, 0.6, 0.02, 1), toon(['#e07a3a', '#5a9ec4', '#f4f1ea', '#8fae5a', '#c45a8a', '#f2c14e', '#d94a4a', '#2f8c92'][i]), 0, -0.3, 0); yardShirts.push(s); }
    for (const x of [-18.5, -10.8]) add(G, cyl(0.05, 0.05, 2.3, 6), M.steel, x, 1.15, 12); add(G, cyl(0.01, 0.01, 7.7, 4), toon('#ddd'), -14.65, 2.25, 12, { rz: Math.PI / 2 });
    // payroll hut with roll-down shutter + wanted poster spot
    const pay = grp(G, 10, 0, 14, -Math.PI / 2); add(pay, tbox(4, 3, 3, 2), toon('#e9d8b0'), 0, 1.5, 0); add(pay, tbox(4.4, 0.2, 3.4, 2), toon('#7a2e3a'), 0, 3.1, 0); add(pay, tbox(1.6, 1.0, 0.1, 1), toon('#2b2f3a'), 0, 1.6, 1.52); add(pay, tbox(1.9, 0.12, 0.4, 1), M.woodD, 0, 1.05, 1.65);
    sign(pay, 'PAYROLL', 0, 2.55, 1.56, 2.2, 0.5, { bg: '#2f6a3a', fg: '#ffffff', border: '#f2c14e' });
    const shutter = grp(pay, 0, 2.1, 1.6); const shM = add(shutter, tbox(1.7, 1.0, 0.05, 1), texM(K.corrugated('#b8c2cc'), 1, 1), 0, -0.5, 0); shutter.scale.y = 0.05;
    const poster = grp(pay, 1.4, 1.7, 1.56); const wantedC = document.createElement('canvas'); wantedC.width = 300; wantedC.height = 400; const wantedT = tex(wantedC);
    add(poster, new THREE.PlaneGeometry(0.75, 1.0), toon('#ffffff', { map: wantedT }), 0, 0, 0.01, { cast: false }); add(poster, tbox(0.78, 1.03, 0.01, 1), toon('#c9b48a'), 0, 0, 0);
    { const g = wantedC.getContext('2d'); g.fillStyle = '#f1e2b8'; g.fillRect(0, 0, 300, 400); g.fillStyle = '#7a2e1c'; g.font = '62px Lilita'; g.textAlign = 'center'; g.fillText('WANTED', 150, 70); g.font = '30px Lilita'; g.fillText('ABSCONDED', 150, 380);
      g.save(); g.translate(150, 360); g.scale(0.38, 0.38); g.beginPath(); g.rect(-400, -760, 800, 640); g.clip(); T.rick(g, { outfit: 'coverall', top: '#6f93b8', hat: 'part', hair: '#2a1d18', dirt: true }, { expr: 'nervous' }); g.restore(); wantedT.needsUpdate = true; }
    // remittance kiosk
    const rem = grp(G, 18, 0, -4, -Math.PI / 2); add(rem, tbox(2.4, 2.6, 1.6, 2), toon('#f2c14e'), 0, 1.3, 0); add(rem, tbox(2.6, 0.2, 1.9, 2), toon('#d6403a'), 0, 2.7, 0.1); sign(rem, ['SEND MONEY', 'HOME'], 0, 3.25, 0.5, 2.2, 0.7, { bg: '#d6403a', fg: '#fff', border: '#ffffff' });
    add(rem, tbox(0.9, 1.4, 0.3, 1), toon('#3a3f4a'), 0, 1.1, 0.9); const remClk = clock(rem, 0.85, 2.15, 0.86, 0.26); add(rem, new THREE.PlaneGeometry(0.6, 0.4), basic('#6fe0a8'), 0, 1.5, 1.06, { cast: false }); add(rem, tbox(0.5, 0.05, 0.05, 1), toon('#111'), 0, 1.05, 1.06);
    // water tank, generator, chairs
    const wt = grp(G, -40, 0, -30); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(wt, tbox(0.2, 5, 0.2, 1), M.steel, sx * 1.2, 2.5, sz * 1.2); add(wt, cyl(1.6, 1.6, 2.6, 20), toon('#3f6fb0'), 0, 6.3, 0);
    const gen = grp(G, -40, 0, 8); add(gen, tbox(2.2, 1.6, 1.4, 1), toon('#2f6a3a'), 0, 0.8, 0); add(gen, cyl(0.12, 0.12, 1, 8), toon('#333'), 0.6, 2, 0);
    for (let i = 0; i < 5; i++) { const c = grp(G, 2 + i * 1.1, 0, 22 + (i % 2) * 0.6, i); add(c, tbox(0.5, 0.06, 0.5, 1), toon(['#d94a4a', '#3f6fb0', '#f2c14e'][i % 3]), 0, 0.45, 0); add(c, tbox(0.5, 0.5, 0.06, 1), toon(['#d94a4a', '#3f6fb0', '#f2c14e'][i % 3]), 0, 0.72, -0.24); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(c, cyl(0.02, 0.02, 0.45, 5), toon('#ddd'), sx * 0.22, 0.22, sz * 0.22); }
    // construction site (x 10..60, z -20..-75)
    const conc = toon('#c9c3b6'), CS = grp(G, 30, 0, -48);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) for (let fl = 0; fl < 4; fl++) { if (fl === 3 && (i + j) % 2) continue; add(CS, tbox(0.6, 4, 0.6, 2), conc, -12 + i * 6, 2 + fl * 4.2, -9 + j * 6); }
    for (let fl = 1; fl < 4; fl++) add(CS, tbox(fl === 3 ? 14 : 25, 0.35, 19, 4), conc, fl === 3 ? -5.5 : 0, fl * 4.2, 0);
    for (let i = 0; i < 9; i++) for (let fl = 0; fl < 4; fl++) { add(CS, cyl(0.04, 0.04, 4.2, 5), toon('#f2c14e'), -12 + i * 3, 2.1 + fl * 4.2, 10.4); add(CS, cyl(0.04, 0.04, 3, 5), toon('#f2c14e'), -10.5 + i * 3, 4.2 + fl * 4.2, 10.4, { rz: Math.PI / 2 }); add(CS, tbox(3, 0.05, 0.6, 1), M.wood, -10.5 + i * 3, 4.25 + fl * 4.2, 10.7); }
    add(CS, cyl(0.04, 0.04, 30, 5), toon('#f2c14e'), 0, 2.1, 10.9, { rz: Math.PI / 2 });
    const crane = grp(G, 50, 0, -30); const yel = toon('#f2c14e'); for (let y = 0; y < 42; y += 3) { for (const sx of [-0.8, 0.8]) for (const sz of [-0.8, 0.8]) add(crane, tbox(0.15, 3, 0.15, 1), yel, sx, y + 1.5, sz); for (const s of [-1, 1]) { add(crane, tbox(1.6, 0.1, 0.1, 1), yel, 0, y, s * 0.8); add(crane, tbox(0.1, 0.1, 1.6, 1), yel, s * 0.8, y, 0); add(crane, tbox(2.1, 0.08, 0.08, 1), yel, 0, y + 1.5, s * 0.8, { rz: 0.95 }); } }
    const jib = grp(crane, 0, 42, 0); add(jib, tbox(36, 1.0, 1.0, 4), yel, -12, 0.5, 0); add(jib, tbox(8, 1.2, 1.4, 2), yel, 9, 0.5, 0); add(jib, tbox(3, 2, 2, 1), toon('#9aa3ab'), 11, -0.6, 0); add(jib, tbox(2, 2.2, 2, 1), toon('#2b3a52'), 1.6, -1.6, 0); add(jib, new THREE.ConeGeometry(1, 5, 4), yel, 0, 3, 0);
    const hook = grp(jib, -20, 0, 0); const cable = add(hook, cyl(0.04, 0.04, 1, 4), toon('#222'), 0, -0.5, 0); const load = grp(hook, 0, -20, 0); add(load, new THREE.TorusGeometry(0.3, 0.07, 6, 12), toon('#d6403a'), 0, 0.4, 0); add(load, tbox(1.6, 0.15, 1.2, 1), M.wood, 0, -0.6, 0); for (let i = 0; i < 6; i++) add(load, tbox(0.5, 0.25, 0.55, 1), toon('#c45a3a'), -0.5 + (i % 3) * 0.5, -0.4, -0.3 + Math.floor(i / 3) * 0.6);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) add(G, tbox(0.5, 0.25, 0.25, 1), toon('#c45a3a'), 14 + (i % 2) * 0.55 + Math.floor(i / 2) * 3, 0.15 + j * 0.27, -24 + (j % 2) * 0.3);
    for (const [x, z] of [[20, -26], [26, -24], [8, -32]]) { const pal = grp(G, x, 0, z); add(pal, tbox(1.4, 0.15, 1.1, 1), M.wood, 0, 0.08, 0); for (let i = 0; i < 12; i++) add(pal, tbox(0.42, 0.22, 0.5, 1), toon(i % 3 ? '#c45a3a' : '#b04a30'), -0.45 + (i % 3) * 0.45, 0.28 + Math.floor(i / 6) * 0.24, -0.27 + Math.floor((i % 6) / 3) * 0.54); }
    const mix = grp(G, 12, 0, -18); add(mix, tbox(1.6, 0.6, 1.2, 1), toon('#d6403a'), 0, 0.6, 0); const drum = grp(mix, 0, 1.5, 0); add(drum, cyl(0.7, 0.45, 1.6, 16), toon('#f2762e'), 0, 0, 0, { rz: 1.1 }); for (let i = 0; i < 4; i++) add(drum, tbox(0.06, 1.5, 0.08, 1), toon('#b04a20'), 0, 0, 0.7, { rz: 1.1 }).rotation.y = i * 1.57; for (const s of [-1, 1]) add(mix, cyl(0.3, 0.3, 0.15, 12), toon('#22242a'), s * 0.6, 0.3, 0.65, { rx: Math.PI / 2 });
    const wb = grp(G, 18, 0, -20); add(wb, tbox(0.7, 0.3, 1.0, 1), toon('#3f8a4a'), 0, 0.5, 0); add(wb, cyl(0.2, 0.2, 0.08, 12), toon('#222'), 0, 0.2, 0.55, { rz: Math.PI / 2 });
    // police car (drives in for 'absconding') with blinking bar
    const cop = car(G, 0, 70, Math.PI, '#f2f4f7', true);
    const palmsY = []; for (const [x, z] of [[-6, 56], [8, 60], [-14, 58]]) palmsY.push(palm(G, x, z, 7, x * z));
    SETS.yard.update = (f, w) => {
      const go = w.gate ?? 0; gate[0].rotation.y = -go * 1.6 + 0.02 * Math.sin(f * 0.21); gate[1].rotation.y = go * 1.6 - 0.02 * Math.sin(f * 0.19);
      fans.forEach((fn, i) => (fn.userData.rot.rotation.y = f * 0.35 + i)); shirts.forEach((s, i) => (s.rotation.x = 0.12 * Math.sin(f * 0.09 + i))); yardShirts.forEach((s, i) => (s.rotation.x = 0.35 + 0.25 * Math.sin(f * 0.15 + i * 0.8)));
      tickClock(dclk, f, 60); beam.visible = beam2.visible = !!w.beam; doorLeaf.rotation.y = (w.door ?? 0) * 1.7;
      heroBunk.beds[1].visible = !w.emptyBunk; bag.visible = !w.emptyBunk;
      const fl = w.calFlip ?? 0; calPage.visible = fl < 1; calPage.rotation.x = -fl * 2.4; calPage.position.y = 2.45 + Math.max(0, fl - 0.6) * 0.5;
      shutter.scale.y = Math.max(0.05, Math.min(1, w.shutter ?? 0)); poster.scale.setScalar(Math.max(0.001, Math.min(1, w.poster ?? 0))); poster.rotation.z = (1 - Math.min(1, w.poster ?? 0)) * 0.6;
      jib.rotation.y = 0.5 + 0.25 * Math.sin(f * 0.006) + (w.jib ?? 0); const sw = 0.06 * Math.sin(f * 0.07); load.position.set(Math.sin(sw) * 20, -20, 0); cable.scale.y = 20; cable.position.y = -10; cable.rotation.z = -sw;
      drum.rotation.x = f * 0.08; tickClock(remClk, f, w.clockSpeed ?? 30); const cp = w.cop; cop.visible = !!cp; if (cp) { cop.position.set(cp[0], 0, cp[1]); cop.rotation.y = cp[2] ?? Math.PI; const on = Math.floor(f / 4) % 2; cop.userData.lights[0].material.color.set(on ? '#ff3a3a' : '#5a1010'); cop.userData.lights[1].material.color.set(on ? '#10205a' : '#3a7aff'); }
      palmsY.forEach((p) => swayPalm(p, f, 1.4));
    };
    SETS.yard.dorm = [DX, 0, 0];
  }

  // ======================= VILLAGE (back home) =======================
  { const G = mk('village', [5000, 0, 5000]);
    add(G, new THREE.PlaneGeometry(900, 900), M.grass, 0, 0, 0, { rx: -Math.PI / 2, cast: false });
    add(G, new THREE.PlaneGeometry(8, 200), texM(K.dirt(12), 2, 40), 6, 0.02, 0, { rx: -Math.PI / 2, cast: false });
    const r = rng(77);
    for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = 160 + r() * 260; add(G, sph(1, 20, 10), toon(i % 2 ? '#7aa64c' : '#86ad60'), Math.cos(a) * d, -8, Math.sin(a) * d, { cast: false, s: [40 + r() * 50, 22 + r() * 30, 40 + r() * 40] }); }
    // mother's house: 2 storeys, flat roof terrace with parapet
    const house = (x, z, w, d, h, col, shut, ry = 0) => { const g = grp(G, x, 0, z, ry); const m = texM(K.plaster((x * 7 + z) | 0, col), 2, 2); add(g, tbox(w, h, d, 3), m, 0, h / 2, 0); add(g, tbox(w + 0.3, 0.2, d + 0.3, 3), toon('#f4efe6'), 0, h + 0.1, 0);
      for (const s of [-1, 1]) add(g, tbox(w + 0.3, 0.8, 0.15, 2), m, 0, h + 0.5, s * (d / 2 + 0.07)); for (const s of [-1, 1]) add(g, tbox(0.15, 0.8, d + 0.3, 2), m, s * (w / 2 + 0.07), h + 0.5, 0);
      add(g, tbox(1.1, 2.1, 0.1, 1), toon('#2f8c92'), -w * 0.2, 1.05, d / 2 + 0.05); for (const fl of [0, 1]) if (h > 4 || fl === 0) for (const s of [-1, 1]) { const wy = 1.5 + fl * 2.8; add(g, tbox(0.9, 1.0, 0.1, 1), toon('#2b2430'), w * 0.25 * s + (s < 0 ? -0.4 : 0.4), wy, d / 2 + 0.05); for (const t of [-1, 1]) add(g, tbox(0.42, 1.06, 0.06, 1), toon(shut), w * 0.25 * s + (s < 0 ? -0.4 : 0.4) + t * 0.68, wy, d / 2 + 0.1); }
      return g; };
    const home = house(0, 0, 7, 6, 6, 340, '#2f8c92');
    add(home, cyl(0.6, 0.6, 1.2, 16), toon('#2b2f3a'), 2.4, 6.9, -1.8); add(home, sph(0.5, 14, 8), toon('#e6e6e6'), -2.6, 6.8, -2.0, { s: [1, 0.4, 1], rx: -0.6 });
    for (let i = 0; i < 6; i++) add(home, tbox(1.2, 0.2, 0.4, 1), toon('#d8d0c0'), 4.1, 0.1 + i * 0.5, -2.5 + i * 0.4); // outside stairs
    plant(home, 2.6, 6.2, 2.0, 2); plant(home, -2.8, 6.2, 2.2, 1.6, '#6c9a42');
    house(14, -2, 6, 6, 3.4, 50, '#d6403a', 0.1); house(-12, -4, 8, 6, 6, 190, '#8a5cc2', -0.1); house(-4, 16, 6, 6, 3.4, 20, '#3f6fb0', Math.PI); house(16, 14, 7, 6, 6, 280, '#f2c14e', Math.PI + 0.1); house(-18, 14, 6, 5, 3.2, 120, '#e07a3a', Math.PI);
    // recruitment agency shopfront (x 26)
    const ag = grp(G, 24, 0, 6, -Math.PI / 2); add(ag, tbox(6, 3.6, 4, 2), texM(K.plaster(91, 210), 2, 2), 0, 1.8, -2); add(ag, tbox(6.4, 0.12, 1.8, 1), K.texM(K.stripes('#d6403a', '#ffffff', 12), 1, 1), 0, 3.0, 0.8, { rx: 0.3 });
    sign(ag, ['DREAM JOBS ABROAD', 'FAST VISA!'], 0, 3.7, 0.05, 5, 0.9, { bg: '#f2c14e', fg: '#7a2e3a', border: '#d6403a' });
    add(ag, tbox(2.4, 0.9, 1, 1), M.woodD, 0.4, 0.45, -0.4); add(ag, tbox(2.5, 0.06, 1.1, 1), M.wood, 0.4, 0.92, -0.4); const ledger = add(ag, tbox(0.5, 0.06, 0.36, 1), toon('#ffffff', { map: tex(K.signTex(['YOU OWE', '$ $ $ $'], { bg: '#fbf8ef', fg: '#c0392b', border: '#1d2a3a', w: 256, h: 186 })) }), 0.2, 0.98, -0.3);
    const tapeMat = toon('#fbf8ef', { side: THREE.DoubleSide, map: tex((() => { const c = document.createElement('canvas'); c.width = 64; c.height = 512; const g = c.getContext('2d'); g.fillStyle = '#fbf8ef'; g.fillRect(0, 0, 64, 512); g.fillStyle = '#c0392b'; g.font = '20px Lilita'; for (let i = 0; i < 20; i++) g.fillText(i % 3 ? '-$' + (100 + i * 37) : 'FEE', 6, 24 + i * 25); return c; })(), 1, 8) }); const tape = add(ag, new THREE.PlaneGeometry(0.22, 1), tapeMat, 1.0, 0.02, 0.3, { rx: -Math.PI / 2, cast: false }); const hang = add(ag, new THREE.PlaneGeometry(0.22, 0.95), tapeMat, 1.0, 0.48, 0.12, { cast: false }); const tapeTop = add(ag, new THREE.PlaneGeometry(0.22, 0.5), tapeMat, 1.0, 0.955, -0.13, { rx: -Math.PI / 2, cast: false });
    sign(ag, ['WORK IN', 'SHINY CITY'], -2.2, 1.8, -0.01, 1.2, 1.5, { bg: '#1f8f9a', fg: '#fff', border: '#f2c14e' });
    // washing lines, trees, phone mast, kite, animals
    const cloth = []; for (let i = 0; i < 7; i++) { const s = grp(G, -6 + i * 0.9, 2.2, 6); add(s, tbox(0.55, 0.7, 0.02, 1), toon(['#d2337a', '#f2c14e', '#2fa59a', '#ffffff', '#e07a3a', '#3f6fb0', '#8fae5a'][i]), 0, -0.35, 0); cloth.push(s); } for (const x of [-6.6, 0]) add(G, cyl(0.05, 0.05, 2.3, 6), M.wood, x, 1.15, 6);
    for (const [x, z, s] of [[-24, 0, 1.2], [26, -14, 1.4], [-30, 24, 1], [32, 26, 1.3], [-8, -16, 1.1]]) { const t = grp(G, x, 0, z); add(t, cyl(0.3 * s, 0.4 * s, 3 * s, 8), toon('#6a4a32'), 0, 1.5 * s, 0); for (let k2 = 0; k2 < 4; k2++) add(t, sph(1.6 * s, 14, 10), toon(k2 % 2 ? '#4f8a3c' : '#5f9a4a'), Math.cos(k2 * 1.6) * s, 3.4 * s + (k2 % 2) * 0.6 * s, Math.sin(k2 * 1.6) * s); }
    const mast = grp(G, -40, 0, -50); for (let y = 0; y < 30; y += 3) add(mast, tbox(1.2 - y * 0.02, 3, 1.2 - y * 0.02, 1), toon(Math.floor(y / 3) % 2 ? '#d6403a' : '#f4f4f2'), 0, y + 1.5, 0);
    const kite = grp(G, -6, 18, -8); add(kite, new THREE.OctahedronGeometry(0.9, 0), toon('#d2337a'), 0, 0, 0, { s: [0.8, 1.1, 0.12] }); for (let i = 0; i < 6; i++) add(kite, tbox(0.18, 0.12, 0.05, 1), toon(['#f2c14e', '#2fa59a'][i % 2]), 0.1 * i, -1.1 - i * 0.4, 0);
    const chick = [chicken(G, 3, 5.5), chicken(G, 4.2, 6.8, '#c87a3a'), chicken(G, 1.5, 7.5), chicken(G, 8, 3, '#2b2b2b')]; const gt = goat(G, -3, 9);
    SETS.village.update = (f, w) => {
      cloth.forEach((c, i) => (c.rotation.x = 0.3 + 0.25 * Math.sin(f * 0.13 + i))); kite.position.set(-6 + 1.5 * Math.sin(f * 0.02), 18 + 1.2 * Math.sin(f * 0.033), -8); kite.rotation.z = 0.3 * Math.sin(f * 0.05);
      chick.forEach((c, i) => { const p = Math.max(0, Math.sin(f * 0.25 + i * 2)); c.userData.body.rotation.z = -p * 0.6; c.position.x += 0; c.rotation.y = i + 0.4 * Math.sin(f * 0.02 + i); });
      gt.userData.head.rotation.z = 0.25 * Math.sin(f * 0.08); gt.rotation.y = 0.3 * Math.sin(f * 0.01);
      const on = (w.tape ?? 0) > 0.01; tape.visible = hang.visible = tapeTop.visible = on; const L = 0.2 + (w.tape ?? 0) * 19; tape.scale.set(1, L, 1); tape.position.set(1.0, 0.02, 0.12 + L / 2); tape.material.map.repeat.set(1, L / 1.2);
    };
  }

  // ======================= ARCHIVE (the LAW box) =======================
  { const G = mk('archive', [0, 0, -9000]);
    add(G, tbox(10, 0.1, 10, 2), texM(K.wood(55, 25, 38), 4, 4), 0, -0.05, 0); add(G, tbox(10, 0.2, 10, 2), toon('#e9e4da'), 0, 4.1, 0, { cast: false });
    for (const s of [-1, 1]) add(G, tbox(0.2, 4.2, 10, 2), texM(K.wallpaper('#e2d4b8', '#c9b48a'), 4, 2), s * 5, 2.1, 0, { cast: false }); add(G, tbox(10, 4.2, 0.2, 2), texM(K.wallpaper('#e2d4b8', '#c9b48a'), 4, 2), 0, 2.1, -5, { cast: false }); add(G, tbox(10, 4.2, 0.2, 2), texM(K.wallpaper('#e2d4b8', '#c9b48a'), 4, 2), 0, 2.1, 5, { cast: false });
    const spines = ['#7a2e3a', '#1f3f7a', '#2f6a3a', '#c9a94a', '#5a2a6a', '#8a5a3a', '#3a3f4a'];
    for (const [x, z, ry] of [[-4.6, -2, Math.PI / 2], [-4.6, 2, Math.PI / 2], [4.6, -2, -Math.PI / 2], [4.6, 2, -Math.PI / 2], [-2, -4.6, 0], [2, -4.6, 0]]) { const sh = grp(G, x, 0, z, ry); add(sh, tbox(3.4, 3.6, 0.1, 1), M.woodD, 0, 1.8, -0.35); for (let y = 0; y < 5; y++) { add(sh, tbox(3.4, 0.06, 0.7, 1), M.woodD, 0, 0.3 + y * 0.8, 0); for (let i = 0; i < 12; i++) add(sh, tbox(0.22, 0.6, 0.5, 1), toon(spines[(i * 3 + y * 5 + Math.round(x)) % 7]), -1.5 + i * 0.27, 0.62 + y * 0.8, 0); } }
    // pedestal + glass box labelled LAW, with a gavel and a scroll inside
    const ped = grp(G, 0, 0, 0); add(ped, tbox(1.2, 1.0, 1.2, 1), toon('#e6d9c2'), 0, 0.5, 0); add(ped, tbox(1.4, 0.12, 1.4, 1), toon('#c9b998'), 0, 1.06, 0);
    const bxs = 0.9; for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(ped, tbox(0.05, bxs, 0.05, 1), toon('#c9a94a'), sx * bxs / 2, 1.12 + bxs / 2, sz * bxs / 2); for (const y of [1.12, 1.12 + bxs]) for (const s of [-1, 1]) { add(ped, tbox(bxs, 0.05, 0.05, 1), toon('#c9a94a'), 0, y, s * bxs / 2); add(ped, tbox(0.05, 0.05, bxs, 1), toon('#c9a94a'), s * bxs / 2, y, 0); }
    for (const [x, z, ry] of [[0, bxs / 2, 0], [0, -bxs / 2, 0], [bxs / 2, 0, Math.PI / 2], [-bxs / 2, 0, Math.PI / 2]]) glass(ped, new THREE.PlaneGeometry(bxs, bxs), x, 1.12 + bxs / 2, z, { ry, op: 0.2 }); glass(ped, new THREE.PlaneGeometry(bxs, bxs), 0, 1.12 + bxs, 0, { rx: Math.PI / 2, op: 0.2 });
    const gav = grp(ped, 0.1, 1.3, 0.05, 0.5); add(gav, cyl(0.07, 0.07, 0.3, 12), M.woodD, 0, 0, 0, { rz: Math.PI / 2 }); add(gav, cyl(0.02, 0.02, 0.35, 8), M.wood, 0, 0, 0.17, { rx: Math.PI / 2 });
    add(ped, cyl(0.06, 0.06, 0.36, 12), toon('#f2e2b8'), -0.15, 1.2, -0.15, { rz: Math.PI / 2, ry: 0.4 }); add(ped, cyl(0.08, 0.08, 0.03, 12), toon('#c0392b'), -0.15, 1.2, -0.15, { rx: Math.PI / 2 });
    sign(ped, 'LAW', 0, 0.62, 0.62, 0.8, 0.34, { bg: '#c9a94a', fg: '#3a2a12', border: '#3a2a12', frame: '#8a6a2a', depth: 0.03 });
    // cobwebs (thin 3D threads) growing with w.web 0..1
    const web = grp(ped, -bxs / 2, 1.12 + bxs, bxs / 2); const threads = []; for (let i = 0; i < 7; i++) { const a = i / 6 * Math.PI / 2; const t = add(web, cyl(0.004, 0.004, 0.6, 3), toon('#f4f4f4'), Math.cos(a) * 0.3, 0.0, 0, { cast: false }); t.rotation.z = -Math.PI / 2 + a; t.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0); threads.push(t); }
    for (let r_ = 1; r_ <= 4; r_++) { const ring = add(web, new THREE.TorusGeometry(r_ * 0.13, 0.003, 3, 16, Math.PI / 2), toon('#f4f4f4'), 0, 0, 0, { cast: false }); threads.push(ring); }
    web.rotation.y = 0; const web2 = web.clone(); web2.position.set(bxs / 2, 1.12 + bxs, -bxs / 2); web2.rotation.y = Math.PI; ped.add(web2);
    const spider = grp(ped, 0.25, 2.6, 0.2); const sThread = add(spider, cyl(0.003, 0.003, 1, 3), toon('#f4f4f4'), 0, 0.5, 0, { cast: false }); add(spider, sph(0.05, 10, 8), toon('#1d1714'), 0, 0, 0); add(spider, sph(0.035, 8, 6), toon('#1d1714'), 0, 0.05, 0.03); for (let i = 0; i < 8; i++) add(spider, cyl(0.006, 0.006, 0.12, 3), toon('#1d1714'), Math.cos(i * 0.785) * 0.06, -0.01, Math.sin(i * 0.785) * 0.06, { rz: 1.2 * Math.cos(i * 0.785), rx: 1.2 * Math.sin(i * 0.785) });
    const lamp = grp(G, 2.9, 0, -3.4); add(lamp, cyl(0.04, 0.04, 1.8, 8), toon('#2b2f3a'), 0, 0.9, 0); add(lamp, new THREE.ConeGeometry(0.3, 0.3, 16, 1, true), toon('#2f6a3a', { side: THREE.DoubleSide }), 0, 1.85, 0); add(lamp, sph(0.08, 8, 6), basic('#fff3c0'), 0, 1.75, 0);
    const deskA = grp(G, -1.9, 0, -3.0); const chA = grp(G, -1.9, 0, -3.75); add(chA, tbox(0.5, 0.08, 0.5, 1), toon('#3f6fb0'), 0, 0.45, 0); add(chA, tbox(0.5, 0.6, 0.08, 1), toon('#3f6fb0'), 0, 0.78, -0.24); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(chA, cyl(0.025, 0.025, 0.45, 6), toon('#2b2f3a'), sx * 0.2, 0.22, sz * 0.2); add(deskA, tbox(1.6, 0.08, 0.8, 1), M.wood, 0, 0.78, 0); for (const sx of [-1, 1]) add(deskA, tbox(0.08, 0.78, 0.7, 1), M.woodD, sx * 0.74, 0.39, 0); for (let i = 0; i < 5; i++) add(deskA, tbox(0.3, 0.05, 0.4, 1), toon('#fbf8ef'), -0.3, 0.85 + i * 0.05, 0, { ry: i * 0.1 });
    sign(G, ['DEPT. OF', 'ENFORCEMENT'], 0, 3.3, -4.88, 2.8, 0.8, { bg: '#1d2a3a', fg: '#c9a94a', border: '#c9a94a' });
    const closed = sign(G, 'CLOSED', 0, 2.5, -4.84, 1.4, 0.4, { bg: '#c0392b', fg: '#ffffff', border: null }, 0); add(G, cyl(0.01, 0.01, 0.5, 4), toon('#333'), 0, 2.95, -4.84);
    SETS.archive.update = (f, w) => { const wv = Math.max(0.001, w.web ?? 0); web.scale.setScalar(wv); web2.scale.setScalar(wv); const d = w.spider ?? 0; spider.position.y = 2.6 - d * 0.6; sThread.scale.y = 0.5 + d * 0.6; sThread.position.y = 0.25 + d * 0.3; spider.rotation.y = f * 0.02; closed.rotation.z = 0.12 * Math.sin(f * 0.07) + 0.08; };
  }
  return SETS;
}
