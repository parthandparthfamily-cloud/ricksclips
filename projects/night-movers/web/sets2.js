// Sets 2: NEW CITY (sunrise), TINY ROOM, RAMEN SHOP (night, TV), STATION PLAZA + KOBAN + CITY (hometown, evening -> night)
export function buildSets2(H) {
  const { THREE, X, mt, glow, glowT, C, box, cyl, sph, plane, mesh, signBoard, line3, wire, rng, toon } = H;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const petalsMat = toon({ color: '#ffb7cf', side: THREE.DoubleSide });
  const inst = (parent, geo, mat, n) => { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = false; m.receiveShadow = false; m.frustumCulled = false; parent.add(m); return m; };
  const dummy = new THREE.Object3D();
  const tree = (p, x, z, s = 1, seed = 1, pink = true) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); p.add(g); const r = rng(seed);
    cyl(g, '#6a4a32', 0, 1.2, 0, 0.12, 0.2, 2.4, { seg: 8 }); line3(g, [0, 1.8, 0], [0.7, 2.6, 0.2], 0.07, C('#6a4a32')); line3(g, [0, 1.9, 0], [-0.6, 2.7, -0.2], 0.07, C('#6a4a32'));
    for (let i = 0; i < 9; i++) sph(g, pink ? (i % 3 ? '#ffc2d6' : '#ff9fbf') : (i % 2 ? '#4f8f42' : '#5c9a4a'), (r() - 0.5) * 2.2, 2.6 + r() * 1.1, (r() - 0.5) * 2.2, 0.6 + r() * 0.4, { seg: 10, seg2: 8 }); return g; };
  const crow = (p) => { const g = new THREE.Group(); p.add(g); sph(g, '#22222c', 0, 0, 0, 0.09, { s: [1.6, 0.9, 0.9], seg: 10 }); sph(g, '#22222c', 0.14, 0.06, 0, 0.06, { seg: 8 }); mesh(new THREE.ConeGeometry(0.025, 0.08, 5), C('#3a3a40'), 0.21, 0.06, 0, g, { rz: -Math.PI / 2 });
    const wl = box(g, '#22222c', 0, 0.03, 0.1, 0.16, 0.02, 0.18), wr = box(g, '#22222c', 0, 0.03, -0.1, 0.16, 0.02, 0.18); g.userData.w = [wl, wr]; return g; };

  // ======================================================================================
  // NEW CITY at sunrise. Road along x (z 0..6). North side z<-1: cheap inn (x -6..0) + konbini (x 1..7).
  // South side z>7.5: construction site (x -9..3) + sakura park (x 5..13). Sea + mountains + sun at -x end.
  // ======================================================================================
  {
    const S = H.newSet('city');
    plane(S, mt(X.asphalt(60), 1, 1), 0, 0, 3, 90, 6, { rx: -Math.PI / 2 }).material.map.repeat.set(11, 1);
    box(S, mt(X.tiles(61, '#d9cdb4', '#cbbfa6', 6, '#a89c86'), 30, 1), 0, 0.06, -0.6, 90, 0.12, 2, { t: 1 }); box(S, mt(X.tiles(62, '#d9cdb4', '#cbbfa6', 6, '#a89c86'), 30, 1), 0, 0.06, 6.9, 90, 0.12, 1.8, { t: 1 });
    // cheap inn
    const inn = new THREE.Group(); inn.position.set(-3, 0, -5); S.add(inn); box(inn, mt(X.bricks(63, 20, 30, 58), 2, 3), 0, 4.5, 0, 6, 9, 7.6, { t: 1 });
    for (let fl = 0; fl < 3; fl++) for (let i = 0; i < 4; i++) { const y = 1.8 + fl * 2.7, x = -2.2 + i * 1.45; box(inn, '#3b3f52', x, y + (fl ? 0 : 0.6), 3.81, 0.9, 1.0, 0.04); box(inn, glow(fl === 1 && i === 1 ? '#ffd87a' : '#cfe0f0'), x, y + (fl ? 0 : 0.6), 3.83, 0.8, 0.9, 0.01, { cast: false }); box(inn, '#d9dde3', x, y - 0.55 + (fl ? 0 : 0.6), 3.9, 1.0, 0.06, 0.2);
      if (fl && i % 2) for (let k = 0; k < 3; k++) box(inn, ['#ffffff', '#9fc6e8', '#f2c14e'][k], x - 0.3 + k * 0.3, y - 0.2, 4.0, 0.24, 0.35, 0.02); }
    box(inn, '#5a3b2a', 1.6, 1.1, 3.82, 1.2, 2.2, 0.08); box(inn, '#2b3550', 1.6, 1.15, 3.87, 1.0, 1.9, 0.02); box(inn, '#3b3f52', 1.6, 2.35, 4.2, 1.8, 0.08, 0.8);
    const innSign = signBoard(inn, X.sign(700, 300, [['ROOMS ¥2,000', 80, '#c0392b'], ['CASH ONLY', 60, '#2e211d'], ['NO NAMES ASKED', 52, '#2f6fb5']], '#fff6d8', '#c0392b'), 1.0, 3.25, 3.9, 3.0, 1.25, { d: 0.08, frame: '#5a3b2a' });
    signBoard(inn, X.sign(160, 600, [['I', 70, '#fff'], ['N', 70, '#fff'], ['N', 70, '#fff']], '#c0392b', '#f2c14e'), 3.1, 6.0, 3.0, 0.5, 1.8, { ry: Math.PI / 2, d: 0.1, lit: true });
    for (let k = 0; k < 4; k++) box(inn, '#8a8f99', -3.05, 0.5 + k * 2.2, 3.4, 0.1, 0.1, 0.1); cyl(inn, '#8a8f99', -3.05, 4.5, 3.6, 0.05, 0.05, 9, { seg: 6 });
    box(inn, '#cfd4da', -1.0, 9.3, 0, 1.6, 0.8, 1.2); cyl(inn, '#cfd4da', 1.5, 9.6, -1, 0.5, 0.5, 1.2, { seg: 12 });
    // konbini
    const kb = new THREE.Group(); kb.position.set(4.2, 0, -4.5); S.add(kb); box(kb, '#f4f6f8', 0, 2.0, 0, 6, 4, 6.6);
    for (const [y, c] of [[3.5, '#3f8f6f'], [3.25, '#2f6fb5'], [3.0, '#f2a64a']]) box(kb, c, 0, y, 3.32, 6.02, 0.25, 0.06);
    box(kb, glow('#e8f6ff'), 0, 1.4, 3.31, 5.4, 2.0, 0.02, { cast: false }); for (let i = 0; i < 6; i++) box(kb, '#d9dde3', -2.7 + i * 1.08, 1.4, 3.34, 0.06, 2.0, 0.05);
    for (let i = 0; i < 4; i++) { box(kb, '#9aa7b5', -2 + i * 1.3, 0.7, 2.6, 0.9, 1.4, 0.4); for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) box(kb, ['#c0392b', '#f2c14e', '#3f8f6f', '#e86a9a'][(i + j + k) % 4], -2.3 + i * 1.3 + j * 0.2, 0.4 + k * 0.4, 2.85, 0.14, 0.2, 0.1); }
    signBoard(kb, X.sign(600, 120, [['24H MART', 80, '#fff']], '#3f8f6f', null), 0, 3.85, 3.36, 3.0, 0.5, { d: 0.05, lit: true });
    // construction site (south side)
    const cs = new THREE.Group(); cs.position.set(-4, 0, 11); S.add(cs);
    for (let i = 0; i < 8; i++) box(cs, i % 2 ? '#f2c14e' : '#2e2a30', -6 + i * 1.6, 0.9, -3.4, 1.55, 1.8, 0.05); // fence panels
    const csSign = signBoard(cs, X.sign(700, 260, [['DAY WORK', 80, '#2e211d'], ['CASH PAID DAILY', 54, '#c0392b'], ['NAMES OPTIONAL', 46, '#2f6fb5']], '#f2c14e', '#2e211d'), 1.0, 2.4, -3.45, 2.6, 0.95, { d: 0.05, ry: 0 });
    for (let x = -6; x <= 6; x += 1.8) for (let y = 0; y <= 9; y += 1.8) { if (y > 0) box(cs, '#9aa7b5', x, y, -1.5, 1.8, 0.05, 0.05); cyl(cs, '#9aa7b5', x, y + 0.9, -1.5, 0.03, 0.03, 1.8, { seg: 5 }); cyl(cs, '#9aa7b5', x, y + 0.9, 0.3, 0.03, 0.03, 1.8, { seg: 5 }); if (y > 0) box(cs, '#b07a45', x + 0.9, y, -0.6, 1.8, 0.05, 1.8); }
    box(cs, toon({ color: '#3f8f6f', transparent: true, opacity: 0.7, side: THREE.DoubleSide }), 0, 5.4, 0.5, 12.6, 9.6, 0.02, { cast: false });
    box(cs, '#9a9488', 0, 4.5, 3, 11, 9, 3); // building core
    for (let i = 0; i < 12; i++) cyl(cs, '#8a5a3a', -3 + (i % 6) * 0.15, 0.1 + Math.floor(i / 6) * 0.12, -2.6, 0.05, 0.05, 2.2, { rz: Math.PI / 2, seg: 6 });
    const mixer = new THREE.Group(); mixer.position.set(3.8, 0, -2.3); cs.add(mixer); box(mixer, '#f2a64a', 0, 0.5, 0, 1.6, 0.4, 0.9); const drum = cyl(mixer, '#e0453a', 0, 1.05, 0, 0.35, 0.5, 0.9, { rz: 1.2, seg: 14 }); for (const x of [-0.5, 0.5]) cyl(mixer, '#2e2a30', x, 0.25, 0.46, 0.25, 0.25, 0.1, { rx: Math.PI / 2 });
    const crane = new THREE.Group(); crane.position.set(-5, 9, 1); cs.add(crane); box(crane, '#f2c14e', 0, 4, 0, 0.5, 8, 0.5); const jib = new THREE.Group(); jib.position.y = 8; crane.add(jib); box(jib, '#f2c14e', 3, 0, 0, 9, 0.4, 0.4); box(jib, '#3b3f52', -2, -0.2, 0, 1.4, 0.9, 0.8); const hook = line3(jib, [5.5, 0, 0], [5.5, -6, 0], 0.02, C('#2e2a30')); box(jib, '#c89a5e', 5.5, -6.3, 0, 0.9, 0.5, 0.9);
    // sakura park + bench
    const trees = [tree(S, 8, 10, 1.1, 71), tree(S, 12, 9.5, 1.0, 72), tree(S, 16, 10.5, 1.2, 73), tree(S, 21, 9.8, 1.0, 74), tree(S, -14, 10, 1.0, 75, false)];
    const bench = new THREE.Group(); bench.position.set(10, 0, 8.6); bench.rotation.y = Math.PI; S.add(bench); box(bench, '#b07a45', 0, 0.45, 0, 1.6, 0.06, 0.45); box(bench, '#b07a45', 0, 0.78, -0.2, 1.6, 0.3, 0.05); for (const x of [-0.7, 0.7]) box(bench, '#3b3f52', x, 0.22, 0, 0.06, 0.45, 0.4);
    plane(S, mt(X.grassT(76), 8, 2), 14, 0.13, 10.5, 16, 4.5, { rx: -Math.PI / 2 });
    // sea, mountains, distant town, sun
    plane(S, glowT(X.water(77)), -90, 0.02, 3, 80, 160, { rx: -Math.PI / 2 }).material.map.repeat.set(6, 10);
    for (let i = 0; i < 6; i++) { const m = mesh(new THREE.ConeGeometry(30 + i * 6, 26 + (i % 3) * 8, 6), C(['#8f84b8', '#a08cc0', '#9a8fbd'][i % 3]), -140 - (i % 2) * 30, 8, -80 + i * 32, S, { cast: false }); }
    plane(S, glowT(X.skyline(78, false, 2048, 512, { cols: ['#f0c8a8', '#e8b8a0', '#f4d8b8', '#d8b0b8'] }), { transparent: true }), 50, 8, 3, 140, 18, { ry: -Math.PI / 2 });
    for (let i = 0; i < 10; i++) { const x = -45 + i * 4.5; const h = 5 + (i * 37) % 7; box(S, mt(X.siding(80 + i, ['#e8d0b8', '#d8c0c8', '#f0dcc0', '#c8d4dc'][i % 4]), 2, 3), x, h / 2, -5 - (i % 3), 3.8, h, 5); box(S, mt(X.siding(90 + i, ['#d8c0c8', '#f0dcc0', '#c8d4dc', '#e8d0b8'][i % 4]), 2, 3), x - 1, h / 2, 13 + (i % 2), 3.8, h, 4); }
    for (let i = 0; i < 6; i++) { const x = 18 + i * 5; const h = 6 + (i * 13) % 5; box(S, mt(X.siding(100 + i, ['#e8d0b8', '#c8d4dc'][i % 2]), 2, 3), x, h / 2, -5, 4.6, h, 5); }
    // poles + wires + crows + gulls
    for (const x of [-30, -16, -2, 12, 26]) { cyl(S, '#b8b2a6', x, 4.5, -1.3, 0.13, 0.17, 9, { seg: 10 }); box(S, '#8a8f99', x, 8.2, -1.3, 1.6, 0.1, 0.1); }
    for (let i = 0; i < 4; i++) for (const dx of [-0.7, 0, 0.7]) wire(S, [-30 + i * 14 + dx, 8.25, -1.3], [-16 + i * 14 + dx, 8.25, -1.3], 0.3);
    const crows = []; for (let i = 0; i < 5; i++) { const c = crow(S); c.userData.x0 = -12 + i * 2.6 + (i % 2) * 0.7; crows.push(c); }
    const gulls = []; for (let i = 0; i < 4; i++) { const g = new THREE.Group(); S.add(g); sph(g, '#f4f6f8', 0, 0, 0, 0.12, { s: [1.8, 0.7, 0.7] }); const a = box(g, '#f4f6f8', 0, 0, 0.3, 0.2, 0.02, 0.6), b = box(g, '#f4f6f8', 0, 0, -0.3, 0.2, 0.02, 0.6); g.userData.w = [a, b]; gulls.push(g); }
    const petals = inst(S, new THREE.PlaneGeometry(0.07, 0.05), petalsMat, 260); petals.userData.ndSkip = false;
    // van parked/arriving (white van, same as street)
    const van = new THREE.Group(); S.add(van); box(van, '#f4f6f8', 0, 1.25, 0, 4.6, 1.9, 1.85); box(van, '#f4f6f8', 2.55, 0.95, 0, 0.6, 1.3, 1.8); box(van, glow('#2b3550'), 2.27, 1.75, 0, 0.42, 0.6, 1.6, { cast: false }); box(van, '#2e2a30', 0, 0.3, 0, 4.8, 0.18, 1.86);
    for (const s of [-1, 1]) box(van, '#4a6a9a', 1.8, 1.72, s * 0.93, 0.7, 0.55, 0.02); const vw = []; for (const x of [-1.5, 1.7]) for (const z of [-0.85, 0.85]) vw.push(cyl(van, '#1f1d22', x, 0.36, z, 0.36, 0.36, 0.25, { rx: Math.PI / 2, seg: 16 }));
    [-0.62, 0.62].forEach((z) => box(van, glow('#fffbe0'), 2.97, 0.82, z, 0.04, 0.16, 0.3, { cast: false })); [-0.72, 0.72].forEach((z) => box(van, glow('#ff3b3b'), -2.32, 1.0, z, 0.04, 0.3, 0.14, { cast: false }));
    const exhaust = []; for (let i = 0; i < 5; i++) exhaust.push(sph(S, toon({ color: '#e8e4ee', transparent: true, opacity: 0.7 }), 0, 0, 0, 0.12, { cast: false }));
    H.onUpdate((f, W) => {
      const s = W.city || {};
      van.position.set(s.vanX ?? 40, 0, s.vanZ ?? 3.2); van.rotation.y = s.vanYaw ?? Math.PI; van.visible = s.van !== false; vw.forEach((w) => (w.rotation.y = (s.vanX ?? 0) / 0.36));
      exhaust.forEach((e, i) => { const ph = ((f + i * 6) % 30) / 30; const back = new THREE.Vector3(-2.4 - ph * 1.2, 0.35 + ph * 0.5, 0.6).applyAxisAngle(new THREE.Vector3(0, 1, 0), van.rotation.y); e.position.copy(van.position).add(back); e.scale.setScalar(0.5 + ph * 2.5); e.material.opacity = 0.6 * (1 - ph); e.visible = van.visible && s.exhaust !== false; });
      const r = rng(5); for (let i = 0; i < 260; i++) { const x0 = 4 + r() * 22, z0 = 6 + r() * 8, sp = 0.4 + r() * 0.4, ph = (f / 30 * sp * 0.25 + r()) % 1; dummy.position.set(x0 - ph * 6 + Math.sin(f * 0.05 + i) * 0.3, 4.5 - ph * 4.4, z0 + Math.cos(f * 0.04 + i) * 0.4 - ph * 2); dummy.rotation.set(f * 0.05 + i, f * 0.07 + i * 2, i); dummy.updateMatrix(); petals.setMatrixAt(i, dummy.matrix); }
      petals.instanceMatrix.needsUpdate = true;
      crows.forEach((c, i) => { const hop = Math.max(0, Math.sin(f * 0.07 + i * 2.1)) ** 8; const x = c.userData.x0 + Math.sin(f * 0.01 + i) * 0.3; c.position.set(x, 8.25 - 0.3 * 4 * (((x + 30) % 14) / 14) * (1 - ((x + 30) % 14) / 14) + 0.09 + hop * 0.25, -1.3); c.rotation.y = i % 2 ? Math.PI : 0; c.userData.w.forEach((w, k) => (w.rotation.x = hop * (k ? -1 : 1) * 0.9)); });
      gulls.forEach((g, i) => { const a = f * 0.012 + i * 1.6; g.position.set(-30 + Math.cos(a) * 14 + i * 3, 14 + i * 1.5 + Math.sin(a * 2) * 1, -4 + Math.sin(a) * 8); g.rotation.y = -a; g.userData.w[0].rotation.x = Math.sin(f * 0.3 + i) * 0.5; g.userData.w[1].rotation.x = -Math.sin(f * 0.3 + i) * 0.5; });
      jib.rotation.y = Math.sin(f * 0.008) * 0.5; drum.rotation.y = f * 0.15; trees.forEach((t, i) => (t.rotation.z = Math.sin(f * 0.03 + i) * 0.012));
    });
  }

  // ======================================================================================
  // TINY ROOM (morning sun). x -1.35..1.35, z -1.45..1.45, h 2.3. Window back wall, door right wall (z 0.3..1.1).
  // ======================================================================================
  {
    const R = H.newSet('room');
    plane(R, mt(X.tatami(110), 2.7 / 0.9, 2.9 / 1.8), 0, 0, 0, 2.7, 2.9, { rx: -Math.PI / 2 });
    const wm = mt(X.wallpaper(111, '#d9cfa8', '#c4b685', 'stripes'), 2, 2); box(R, wm, -1.4, 1.15, 0, 0.1, 2.3, 3); box(R, wm, 0, 1.15, 1.5, 2.9, 2.3, 0.1);
    box(R, wm, -0.95, 1.15, -1.5, 0.9, 2.3, 0.1); box(R, wm, 0.95, 1.15, -1.5, 0.9, 2.3, 0.1); box(R, wm, 0, 0.45, -1.5, 1.0, 0.9, 0.1); box(R, wm, 0, 2.05, -1.5, 1.0, 0.5, 0.1);
    box(R, wm, 1.4, 1.15, -0.6, 0.1, 2.3, 1.8); box(R, wm, 1.4, 2.0, 0.85, 0.1, 0.6, 1.2); box(R, wm, 1.4, 1.15, 1.35, 0.1, 2.3, 0.3);
    box(R, '#c9bfa0', 0, 2.33, 0, 2.9, 0.06, 3.1, { cast: false });
    for (const [x, y, w, h] of [[0, 0.9, 1.0, 0.06], [0, 1.8, 1.0, 0.06], [-0.5, 1.35, 0.06, 0.9], [0.5, 1.35, 0.06, 0.9], [0, 1.35, 0.04, 0.9]]) box(R, '#a87444', x, y, -1.45, w, h, 0.08);
    plane(R, glowT(X.skyline(112, false, 2048, 512, { cols: ['#f0c8a8', '#e8b8a0', '#f4d8b8', '#c8d4dc'] }), { transparent: true }), 0, 0.8, -7, 12, 3);
    plane(R, glow('#ffd7a0'), 0, 3, -12, 30, 12); sph(R, glow('#fff4d0'), 1.2, 2.2, -11.5, 0.9, { cast: false });
    // peeling wallpaper strip, bulb, futon, hooks with clothes, fan, box OLD LIFE, low table, cup, cockroach-free charm
    const peel = box(R, '#e8dfc0', -1.33, 1.9, 0.4, 0.02, 0.6, 0.35); peel.rotation.x = 0.25;
    const bulbG = new THREE.Group(); bulbG.position.set(0, 2.3, 0); R.add(bulbG); line3(bulbG, [0, 0, 0], [0, -0.45, 0], 0.008, C('#2e211d')); sph(bulbG, glow('#fff4c0'), 0, -0.52, 0, 0.07, { cast: false }); cyl(bulbG, '#2e2a30', 0, -0.45, 0, 0.03, 0.03, 0.06);
    const fut = new THREE.Group(); fut.position.set(-0.55, 0, 0.35); R.add(fut); box(fut, '#f4f1ea', 0, 0.06, 0, 0.9, 0.12, 1.9); box(fut, '#9fc6e8', 0, 0.15, 0.25, 0.92, 0.08, 1.3); box(fut, '#f2e6c8', 0, 0.16, -0.75, 0.5, 0.12, 0.3);
    for (let i = 0; i < 3; i++) { box(R, '#b8bcc4', -1.33, 1.75, -0.9 + i * 0.35, 0.06, 0.04, 0.04); box(R, ['#3f8f6f', '#2f4f8a', '#c0392b'][i], -1.3, 1.45, -0.9 + i * 0.35, 0.04, 0.55, 0.3); }
    const lt = new THREE.Group(); lt.position.set(0.55, 0, -0.65); R.add(lt); box(lt, '#9a6a3e', 0, 0.3, 0, 0.6, 0.04, 0.45); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(lt, '#7a5434', sx * 0.25, 0.14, sz * 0.18, 0.04, 0.28, 0.04); cyl(lt, '#f4f1ea', 0.15, 0.37, 0, 0.04, 0.035, 0.1); cyl(lt, '#2f6fb5', -0.15, 0.38, 0.05, 0.035, 0.035, 0.12);
    // the OLD LIFE box (lid opens/closes), with phone, bank card, family photo going in
    const ob = new THREE.Group(); ob.position.set(0.55, 0, 0.6); R.add(ob); box(ob, '#c89a5e', 0, 0.17, 0, 0.55, 0.34, 0.42);
    const obl = signBoard(ob, X.sign(300, 120, [['OLD LIFE', 70, '#2e211d']], '#c89a5e', null), 0, 0.2, 0.212, 0.42, 0.17, { d: 0.004, border: 0, frame: '#c89a5e' });
    const lidA = new THREE.Group(); lidA.position.set(0, 0.34, -0.21); ob.add(lidA); box(lidA, '#d9ae74', 0, 0, 0.105, 0.55, 0.01, 0.21);
    const lidB = new THREE.Group(); lidB.position.set(0, 0.34, 0.21); ob.add(lidB); box(lidB, '#d9ae74', 0, 0, -0.105, 0.55, 0.01, 0.21);
    const phone = new THREE.Group(); R.add(phone); box(phone, '#22232b', 0, 0, 0, 0.08, 0.15, 0.012); box(phone, glow('#7cc4ff'), 0, 0, 0.007, 0.065, 0.12, 0.002, { cast: false });
    const card = new THREE.Group(); R.add(card); box(card, '#3d7fd1', 0, 0, 0, 0.14, 0.09, 0.005); box(card, '#e5c158', -0.035, 0.01, 0.004, 0.03, 0.025, 0.002);
    const card2 = new THREE.Group(); R.add(card2); box(card2, '#3d7fd1', 0, 0, 0, 0.07, 0.09, 0.005);
    const fphoto = new THREE.Group(); R.add(fphoto); const fpb = signBoard(fphoto, X.sign(200, 160, [['', 10, '#000']], '#cfe6f5', null, { photo: [50, 20, 100, 130] }), 0, 0, 0, 0.18, 0.14, { frame: '#c9a46a', border: 0.03, d: 0.015 });
    const scissors = new THREE.Group(); R.add(scissors); line3(scissors, [-0.08, 0, 0], [0.08, 0.03, 0], 0.008, C('#b8bcc4')); line3(scissors, [-0.08, 0.03, 0], [0.08, 0, 0], 0.008, C('#b8bcc4')); mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 12), C('#c0392b'), -0.1, 0.0, 0, scissors); mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 12), C('#c0392b'), -0.1, 0.035, 0, scissors);
    const dust = inst(R, new THREE.SphereGeometry(0.008, 4, 3), glow('#fff4d0'), 60); dust.userData.ndSkip = true;
    const beam = mesh(new THREE.BoxGeometry(0.95, 0.01, 2.2), glow('#fff0c0', { transparent: true, opacity: 0.16, depthWrite: false }), 0, 0.015, -0.3, R, { cast: false, noink: true });
    const door = new THREE.Group(); door.position.set(1.4, 0, 0.3); R.add(door); const dl = new THREE.Group(); door.add(dl); box(dl, '#8a6440', 0, 0.85, 0.4, 0.05, 1.7, 0.8); sph(dl, '#d9c27a', -0.04, 0.85, 0.72, 0.025);
    box(R, '#2e2a30', 1.6, 0.85, 0.7, 0.3, 1.7, 0.8); // dark corridor behind
    H.onUpdate((f, W) => {
      const s = W.room || {};
      const lid = s.lid ?? 1; lidA.rotation.x = -lid * 1.9; lidB.rotation.x = lid * 1.9;
      const drop = (obj, t, from, tumble) => { obj.visible = t > -0.5 && t < 1; const k = clamp(t); obj.position.set(from[0] + (0.55 - from[0]) * k, from[1] + (0.25 - from[1]) * k + k * (1 - k) * 0.4, from[2] + (0.6 - from[2]) * k); obj.rotation.set(-Math.PI / 2 * k + tumble * k, tumble * k * 2, 0); };
      drop(phone, s.phone ?? -1, [0.33, 1.0, -0.35], 1.5); drop(fphoto, s.photo ?? -1, [0.3, 1.05, -0.3], 0.7);
      const c = s.card ?? -1; card.visible = card2.visible = c > -0.5 && c < 1; card.position.set(0.23 - (c > 0.4 ? (c - 0.4) * 0.3 : 0), 1.0 - (c > 0.4 ? (c - 0.4) ** 2 * 2 : 0), -0.25); card.rotation.z = c > 0.4 ? (c - 0.4) * 3 : 0;
      card2.position.set(0.35 + (c > 0.4 ? (c - 0.4) * 0.3 : 0), 1.0 - (c > 0.4 ? (c - 0.4) ** 2 * 2.2 : 0), -0.25); card2.rotation.z = c > 0.4 ? -(c - 0.4) * 4 : 0; card.scale.set(c > 0.35 ? 0.5 : 1, 1, 1); card.position.x -= c > 0.35 ? 0.035 : 0;
      scissors.visible = c > 0.1 && c < 0.6; scissors.position.set(0.29, 1.0, -0.23); scissors.rotation.z = Math.sin(f * 0.8) * 0.2;
      const r = rng(9); for (let i = 0; i < 60; i++) { dummy.position.set(-0.45 + r() * 0.9, 0.3 + ((r() + f * 0.0015 * (0.5 + r())) % 1) * 1.6, -1.3 + r() * 2); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); dust.setMatrixAt(i, dummy.matrix); } dust.instanceMatrix.needsUpdate = true;
      dl.rotation.y = (s.door ?? 0) * 1.3; bulbG.rotation.z = Math.sin(f * 0.06) * 0.03;
    });
  }

  // ======================================================================================
  // RAMEN SHOP (night). x -3..3, z -2.2..2, h 2.5. Counter along x at z -0.35 (top y 1.0). Kitchen z<-0.6. TV high at the left corner.
  // ======================================================================================
  {
    const Rm = H.newSet('ramen');
    plane(Rm, mt(X.tiles(120, '#b0453a', '#9a3a30', 10, '#5a2a22'), 4, 3), 0, 0, 0, 6, 4.4, { rx: -Math.PI / 2 });
    const wm = mt(X.woodFloor(121, 34, 72), 3, 2); box(Rm, wm, 0, 1.25, -2.25, 6.2, 2.5, 0.1); box(Rm, wm, -3.05, 1.25, 0, 0.1, 2.5, 4.4); box(Rm, wm, 3.05, 1.25, -0.9, 0.1, 2.5, 2.6);
    box(Rm, wm, 0, 1.25, 2.05, 6.2, 2.5, 0.1); box(Rm, '#8a6a4a', 0, 2.53, 0, 6.2, 0.06, 4.4, { cast: false }); for (let x = -3; x <= 3; x += 0.75) box(Rm, '#5a3b2a', x, 2.48, 0, 0.08, 0.08, 4.4);
    // entrance (right wall z 0.4..2) with noren + window to rainy street
    box(Rm, '#5a3b2a', 3.05, 2.2, 1.2, 0.1, 0.6, 1.6); const nor = []; for (let i = 0; i < 3; i++) { const n = new THREE.Group(); n.position.set(2.98, 2.15, 0.65 + i * 0.5); Rm.add(n); plane(n, mt(X.noren(122, '#26304d', ['EN', 'M', 'RA'][i])), 0, -0.3, 0, 0.48, 0.6, { ry: Math.PI / 2 }).material.side = THREE.DoubleSide; nor.push(n); }
    plane(Rm, glowT(X.skyline(123, true, 2048, 512), { transparent: true }), 9, 1.8, 1.2, 14, 4, { ry: -Math.PI / 2 }); plane(Rm, glow('#24306a'), 14, 3, 1.2, 30, 12, { ry: -Math.PI / 2 });
    const rain = inst(Rm, new THREE.BoxGeometry(0.003, 0.22, 0.003), glow('#bcd8ff'), 140); rain.userData.ndSkip = true;
    // counter + stools
    box(Rm, '#c98a4a', -0.2, 1.0, -0.35, 5.2, 0.07, 0.55); box(Rm, '#8a5a3a', -0.2, 0.5, -0.2, 5.2, 1.0, 0.25); box(Rm, '#6e4a2a', -0.2, 1.2, -0.55, 5.2, 0.35, 0.08);
    for (let i = 0; i < 6; i++) { const x = -2.2 + i * 0.8; cyl(Rm, '#c0392b', x, 0.66, 0.35, 0.18, 0.18, 0.08, { seg: 16 }); cyl(Rm, '#8a8f99', x, 0.33, 0.35, 0.03, 0.03, 0.62, { seg: 6 }); cyl(Rm, '#8a8f99', x, 0.02, 0.35, 0.16, 0.16, 0.03, { seg: 12 }); }
    for (let i = 0; i < 5; i++) { box(Rm, '#f4f1ea', -2.2 + i * 1.0, 1.06, -0.55, 0.12, 0.05, 0.1); cyl(Rm, '#c0392b', -2.1 + i * 1.0, 1.12, -0.5, 0.03, 0.03, 0.18, { seg: 8 }); cyl(Rm, '#f2c14e', -2.0 + i * 1.0, 1.1, -0.5, 0.025, 0.025, 0.14, { seg: 8 }); box(Rm, '#d8a860', -1.85 + i * 1.0, 1.12, -0.52, 0.06, 0.16, 0.06); }
    // the hero's bowl + chopsticks (3D, story-driven)
    const bowl = new THREE.Group(); bowl.position.set(1.0, 1.035, -0.25); Rm.add(bowl); const bw = cyl(bowl, '#c0392b', 0, 0.07, 0, 0.17, 0.1, 0.14, { seg: 20 }); cyl(bowl, '#f2d38a', 0, 0.13, 0, 0.155, 0.155, 0.01, { seg: 20 });
    sph(bowl, '#f4f1ea', 0.05, 0.14, 0.03, 0.04, { s: [1, 0.4, 1] }); sph(bowl, '#f2c14e', 0.05, 0.15, 0.03, 0.02, { s: [1, 0.4, 1] }); box(bowl, '#3f7a3a', -0.06, 0.14, -0.04, 0.08, 0.01, 0.05); sph(bowl, '#e8b8a0', -0.05, 0.14, 0.06, 0.05, { s: [1, 0.3, 1] });
    const chop = new THREE.Group(); Rm.add(chop); for (const dz of [0, 0.035]) { const st = cyl(chop, '#e8b870', 0.15, 0, dz, 0.009, 0.013, 0.3, { seg: 8 }); st.rotation.z = Math.PI / 2; }
    const noodle = []; for (let i = 0; i < 4; i++) noodle.push(cyl(Rm, '#f2d38a', 0, 0, 0, 0.006, 0.006, 0.2, { seg: 5, cast: false }));
    // kitchen: stove + pots + steam, shelves, menu plaques, lanterns
    box(Rm, '#8a8f99', 0.4, 0.45, -1.7, 3.0, 0.9, 0.8); box(Rm, '#b8bcc4', 0.4, 0.92, -1.7, 3.02, 0.04, 0.82);
    const pots = [[-0.6, 0.3], [0.4, 0.35], [1.4, 0.25]].map(([x, r]) => { cyl(Rm, '#b8bcc4', x, 0.94 + r * 0.6, -1.7, r, r * 0.95, r * 1.2, { seg: 20 }); cyl(Rm, '#e9d29a', x, 0.95 + r * 1.2, -1.7, r * 0.92, r * 0.92, 0.01, { seg: 20 }); return [x, 0.95 + r * 1.2, r]; });
    const steam = []; for (let i = 0; i < 12; i++) steam.push(sph(Rm, toon({ color: '#ffffff', transparent: true, opacity: 0.6 }), 0, 0, 0, 0.08, { cast: false, seg: 10, seg2: 8 }));
    for (const y of [1.55, 1.95]) { box(Rm, '#7a5434', 0.4, y, -2.05, 3.4, 0.04, 0.3); for (let i = 0; i < 9; i++) cyl(Rm, i % 3 ? '#f4f1ea' : '#c0392b', -1.1 + i * 0.36, y + 0.07, -2.05, 0.12, 0.07, 0.1, { seg: 12 }); }
    const menu = [['RAMEN', '¥600'], ['GYOZA', '¥300'], ['BEER', '¥500'], ['RICE', '¥150'], ['EGG', '¥100']];
    menu.forEach(([a, b], i) => { const p_ = signBoard(Rm, X.sign(160, 420, [[a, 34, '#2e211d'], ['', 120, '#000'], [b, 40, '#c0392b']], '#f2e2b8', '#5a3b2a'), -2.7 + i * 0.32, 2.15, -2.18, 0.27, 0.7, { d: 0.02, frame: '#5a3b2a' }); p_.rotation.z = (i % 2 ? 1 : -1) * 0.02; });
    const lanterns = []; for (const [x, z] of [[-1.6, 0.6], [0.2, 0.6], [2.0, 0.6]]) { const l = new THREE.Group(); l.position.set(x, 2.5, z); Rm.add(l); line3(l, [0, 0, 0], [0, -0.25, 0], 0.006, C('#2e211d')); sph(l, glow('#ff5a3c'), 0, -0.45, 0, 0.2, { s: [1, 1.3, 1], cast: false, seg: 16 }); cyl(l, '#2e2a30', 0, -0.2, 0, 0.08, 0.08, 0.05); cyl(l, '#2e2a30', 0, -0.71, 0, 0.08, 0.08, 0.05); lanterns.push(l); }
    // TV (screen = live texture of the station view)
    const tv = new THREE.Group(); tv.position.set(-2.35, 2.0, -1.55); tv.rotation.y = 0.55; tv.rotation.x = 0.12; Rm.add(tv); box(tv, '#20232c', 0, 0, -0.06, 0.98, 0.62, 0.1); box(tv, '#8a8f99', 0, 0.4, -0.15, 0.08, 0.3, 0.08);
    const screenM = new THREE.MeshBasicMaterial({ color: '#ffffff' }); const tvScr = mesh(new THREE.PlaneGeometry(0.9, 0.5625), screenM, 0, 0, 0.0, tv, { cast: false });
    const lower = signBoard(tv, X.sign(640, 90, [['MISSING: HAVE YOU SEEN MY SON?', 46, '#fff']], '#c0392b', null), 0, -0.2, 0.02, 0.9, 0.12, { d: 0.005, border: 0, frame: '#c0392b', lit: true });
    const liveBug = signBoard(tv, X.sign(160, 70, [['LIVE', 48, '#fff']], '#e0453a', null), -0.35, 0.22, 0.02, 0.14, 0.06, { d: 0.005, border: 0, lit: true });
    H.tv = { screen: tvScr, liveMat: new THREE.MeshBasicMaterial({ color: '#ffffff' }), offMat: new THREE.MeshBasicMaterial({ color: '#15171c' }), staticMat: new THREE.MeshBasicMaterial({ map: H.tx(X.screen('#6a7a9a', '#c8d4e8', 3)) }) };
    H.tv.liveMat.toneMapped = false; tvScr.userData.ndSkip = false;
    // maneki-neko (waving), pink payphone, napkin box, sake bottles, wall clock, extra sign
    const neko = new THREE.Group(); neko.position.set(1.7, 1.04, -0.42); neko.rotation.y = -0.4; Rm.add(neko); sph(neko, '#f4f1ea', 0, 0.12, 0, 0.11, { s: [1, 1.2, 0.9] }); sph(neko, '#f4f1ea', 0, 0.3, 0, 0.09); for (const s of [-1, 1]) mesh(new THREE.ConeGeometry(0.03, 0.06, 4), C('#f4f1ea'), s * 0.05, 0.39, 0, neko); box(neko, '#e0453a', 0, 0.22, 0.04, 0.12, 0.02, 0.1); sph(neko, '#f2c14e', 0, 0.2, 0.09, 0.02);
    const paw = new THREE.Group(); paw.position.set(0.09, 0.25, 0); neko.add(paw); cyl(paw, '#f4f1ea', 0, 0.07, 0, 0.03, 0.03, 0.14, { seg: 8 }); sph(paw, '#f4f1ea', 0, 0.15, 0, 0.035);
    const pp = new THREE.Group(); pp.position.set(2.3, 1.035, -0.4); pp.rotation.y = -0.5; Rm.add(pp); box(pp, '#e86a9a', 0, 0.14, 0, 0.26, 0.28, 0.2); box(pp, '#2e2a30', 0, 0.2, 0.101, 0.12, 0.04, 0.005); for (let k = 0; k < 9; k++) box(pp, '#f4f1ea', -0.05 + (k % 3) * 0.05, 0.06 + Math.floor(k / 3) * 0.035, 0.101, 0.03, 0.02, 0.005);
    const recv = new THREE.Group(); recv.position.set(0, 0.3, 0.02); pp.add(recv); box(recv, '#e86a9a', 0, 0, 0, 0.26, 0.05, 0.06); sph(recv, '#e86a9a', -0.12, -0.02, 0, 0.04); sph(recv, '#e86a9a', 0.12, -0.02, 0, 0.04);
    const coin = cyl(Rm, '#c9804a', 0, 0, 0, 0.022, 0.022, 0.004, { seg: 16 });
    const rmClock = H.clock(Rm, 1.6, 2.1, -2.18, 0.16);
    signBoard(Rm, X.sign(400, 120, [['NO PHONES AT THE COUNTER', 36, '#2e211d']], '#f4f1ea', '#c0392b'), 2.98, 1.6, -1.3, 0.6, 0.18, { ry: -Math.PI / 2, d: 0.01 });
    for (let i = 0; i < 5; i++) cyl(Rm, ['#3f8f6f', '#f4f1ea', '#3f6fb5', '#8a4f7d', '#c0392b'][i], -2.6 + i * 0.12, 1.75, -2.05, 0.04, 0.05, 0.3, { seg: 8 });
    H.onUpdate((f, W) => {
      const s = W.ramen || {};
      steam.forEach((m, i) => { const pt = pots[i % 3], ph = ((f * 0.8 + i * 13) % 45) / 45; m.position.set(pt[0] + Math.sin(f * 0.08 + i) * 0.08, pt[1] + ph * 0.9, -1.7 + Math.cos(f * 0.06 + i) * 0.05); m.scale.setScalar(0.8 + ph * 2.2); m.material.opacity = 0.55 * (1 - ph); });
      const r = rng(3); for (let i = 0; i < 140; i++) { const x = 3.3 + r() * 1.6, z = -0.2 + r() * 2.6, sp = 0.6 + r() * 0.3; dummy.position.set(x, 2.6 - ((f * 0.06 * sp + r()) % 1) * 2.7, z); dummy.rotation.set(0, 0, 0.15); dummy.updateMatrix(); rain.setMatrixAt(i, dummy.matrix); } rain.instanceMatrix.needsUpdate = true;
      paw.rotation.z = Math.sin(f * 0.25) * 0.5 + 0.2; nor.forEach((n, i) => (n.rotation.x = Math.sin(f * 0.07 + i) * 0.06)); lanterns.forEach((l, i) => (l.rotation.z = Math.sin(f * 0.05 + i) * 0.04));
      // chopsticks: lift noodles / set down on the bowl
      const cd = s.chopDown ?? 0, lift = s.slurp ?? 0; const cx = 0.98, cz = -0.22;
      chop.position.set(cx - 0.12 + cd * 0.05, 1.2 + lift * 0.12 - cd * 0.005 + Math.sin(f * 0.2) * 0.015 * (1 - cd), cz + cd * 0.02); chop.rotation.set(0, 0.3, -0.45 * (1 - cd)); chop.visible = s.chop !== false;
      noodle.forEach((n, i) => { n.visible = lift > 0.1 && cd < 0.5; n.position.set(cx + 0.02 * i - 0.03, 1.12 + lift * 0.12, cz); n.scale.y = 0.3 + lift * 1.2; n.rotation.z = Math.sin(f * 0.2 + i) * 0.1; });
      recv.visible = (s.receiver ?? 0) < 0.05;
      const co = s.coin ?? -1; coin.visible = co >= 0 && co <= 1; coin.position.set(2.0 + co * 0.25, 1.06 + Math.sin(co * Math.PI) * 0.12, -0.2); coin.rotation.x = Math.PI / 2 * (1 - co) + co * 5;
      rmClock.userData.set(21 * 60 + 40 + f / 300, (f / 30) % 60);
    });
  }

  // ======================================================================================
  // STATION PLAZA (hometown, evening -> night). Station facade z=-12 (x -10..10, h 6). Koban at (8,0,-3). Poster board (-6,0,-5).
  // Elevated train viaduct y 8 at z -20. City blocks around for the final pull-back. Flyer storm.
  // ======================================================================================
  {
    const St = H.newSet('station');
    plane(St, mt(X.tiles(130, '#d8d2c6', '#c8c0b2', 8, '#9b968c'), 30, 30), 0, 0, 0, 60, 60, { rx: -Math.PI / 2 });
    plane(St, mt(X.asphalt(131, false), 20, 6), 0, 0.005, 16, 200, 10, { rx: -Math.PI / 2 }).material.map.repeat.set(20, 1);
    // station building
    const sb = new THREE.Group(); sb.position.set(0, 0, -12); St.add(sb); box(sb, mt(X.tiles(132, '#e9e2d0', '#ddd4c0', 6, '#b5ab98'), 10, 3), 0, 3, 0, 20, 6, 6, { t: 1 }); box(sb, '#3d4a66', 0, 6.2, 0, 21, 0.4, 7);
    box(sb, '#3d4a66', 0, 3.6, 3.4, 12, 0.2, 1.2); for (const x of [-5.6, 5.6]) cyl(sb, '#cfd4da', x, 1.8, 3.9, 0.12, 0.12, 3.6, { seg: 10 });
    box(sb, glow('#fff4d8'), 0, 1.5, 3.01, 9, 3.0, 0.02, { cast: false }); for (let i = 0; i < 6; i++) { const g = new THREE.Group(); g.position.set(-3 + i * 1.2, 0, 2.6); sb.add(g); box(g, '#9aa7b5', 0, 0.5, 0, 0.25, 1.0, 1.0); box(g, glow(i % 2 ? '#3fe08a' : '#4fb0ff'), 0.13, 0.9, 0.3, 0.01, 0.1, 0.2, { cast: false }); }
    signBoard(sb, X.sign(800, 160, [['KITAHAMA STATION', 84, '#fff']], '#2f4f8a', '#f2c14e'), 0, 4.7, 3.05, 7, 1.3, { d: 0.12, lit: true });
    const sc = H.clock(sb, 7, 4.5, 3.05, 0.7);
    // missing-reports counter on the facade (rolls up at the end)
    const cntC = document.createElement('canvas'); cntC.width = 768; cntC.height = 256; const cntT = H.tx(cntC); const cntM = new THREE.MeshBasicMaterial({ map: cntT });
    const cntB = new THREE.Group(); cntB.position.set(-6.5, 4.5, 3.06); sb.add(cntB); box(cntB, '#20232c', 0, 0, -0.05, 4.4, 1.5, 0.1); mesh(new THREE.PlaneGeometry(4.2, 1.4), cntM, 0, 0, 0.002, cntB, { cast: false });
    let cntLast = -1; const drawCnt = (n) => { if (n === cntLast) return; cntLast = n; const g = cntC.getContext('2d'); g.fillStyle = '#10131c'; g.fillRect(0, 0, 768, 256); g.fillStyle = '#ffb02e'; g.font = 'bold 44px "DejaVu Sans Mono", monospace'; g.textAlign = 'center'; g.fillText('MISSING PERSON REPORTS', 384, 70); g.fillText('THIS YEAR', 384, 120);
      g.fillStyle = '#ff5a3c'; g.font = 'bold 100px "DejaVu Sans Mono", monospace'; g.fillText(n.toLocaleString('en-US') + (n >= 80000 ? '+' : ''), 384, 225); cntT.needsUpdate = true; };
    drawCnt(0);
    // viaduct + train
    for (let x = -60; x <= 60; x += 10) box(St, mt(X.concrete(133, [210, 6, 64]), 1, 2), x, 3.8, -20, 1.2, 7.6, 2.4);
    box(St, mt(X.concrete(134, [210, 6, 70]), 20, 1), 0, 7.9, -20, 140, 0.6, 3.4, { t: 1 }); for (let x = -70; x < 70; x += 0.5) box(St, '#5c6470', x, 8.25, -20, 0.08, 0.1, 3.0);
    const train = new THREE.Group(); St.add(train); for (let k = 0; k < 6; k++) { const car = new THREE.Group(); car.position.x = k * 20.5; train.add(car); box(car, '#e9eef2', 0, 9.9, -20, 20, 3.0, 2.8); box(car, '#3f8f6f', 0, 9.2, -20, 20.02, 0.35, 2.82); for (let i = 0; i < 8; i++) box(car, glow('#fff0c0'), -8.5 + i * 2.4, 10.3, -18.59, 1.6, 0.9, 0.02, { cast: false }); }
    // koban (police box) with interior
    const kb = new THREE.Group(); kb.position.set(8, 0, -3); St.add(kb); box(kb, mt(X.bricks(135, 18, 40, 52), 2, 2), 0, 1.6, -1.4, 4, 3.2, 0.2); box(kb, mt(X.bricks(136, 18, 40, 52), 2, 2), -1.9, 1.6, 0, 0.2, 3.2, 3); box(kb, mt(X.bricks(137, 18, 40, 52), 2, 2), 1.9, 1.6, 0, 0.2, 3.2, 3);
    box(kb, '#3d4a66', 0, 3.3, 0, 4.4, 0.25, 3.4); const rlamp = sph(kb, glow('#ff2a2a'), 0, 3.6, 1.2, 0.22, { cast: false }); box(kb, '#f4f1ea', 0, 1.6, -1.29, 3.6, 3.0, 0.01, { cast: false });
    signBoard(kb, X.sign(500, 120, [['KOBAN  •  POLICE', 64, '#fff']], '#26304d', null), 0, 2.85, 1.55, 2.6, 0.5, { d: 0.06, lit: true });
    box(kb, '#7a5434', 0, 0.5, 0.6, 2.2, 1.0, 0.6); box(kb, '#9a6a3e', 0, 1.02, 0.6, 2.3, 0.05, 0.7);
    const form = new THREE.Group(); form.position.set(0.1, 1.05, 0.6); kb.add(form); box(form, '#fbf7ea', 0, 0, 0, 0.3, 0.005, 0.4); for (let i = 0; i < 6; i++) box(form, '#8a8a9a', 0, 0.004, -0.15 + i * 0.05, 0.2, 0.002, 0.012, { cast: false });
    const stampMark = signBoard(form, X.sign(400, 200, [['ADULT', 70, '#c0392b'], ['LEFT ON PURPOSE', 40, '#c0392b']], 'rgba(0,0,0,0)', '#c0392b'), 0, 0.006, 0.05, 0.26, 0.13, { rx: -Math.PI / 2, d: 0.001, border: 0, frame: '#fbf7ea' });
    // PRIVACY LAW cabinet with chains + padlock
    const cab = new THREE.Group(); cab.position.set(-1.1, 0, -0.9); kb.add(cab); box(cab, '#9aa7b5', 0, 0.85, 0, 0.9, 1.7, 0.5); for (let k = 0; k < 3; k++) box(cab, '#b8c4d0', 0, 0.35 + k * 0.5, 0.26, 0.8, 0.42, 0.02);
    const law = signBoard(cab, X.sign(400, 150, [['PRIVACY', 70, '#fff'], ['LAW', 60, '#f2c14e']], '#c0392b', '#2e211d'), 0, 1.45, 0.29, 0.62, 0.24, { d: 0.01 });
    const chains = []; for (const s of [-1, 1]) { const ch = new THREE.Group(); ch.position.set(0, 0.9, 0.3); ch.rotation.z = s * 0.7; cab.add(ch); for (let i = 0; i < 9; i++) mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 10), C('#8a8f99'), -0.4 + i * 0.1, 0, 0, ch, { ry: i % 2 ? Math.PI / 2 : 0 }); chains.push(ch); }
    const lock = new THREE.Group(); lock.position.set(0, 0.9, 0.34); cab.add(lock); box(lock, '#f2c14e', 0, 0, 0, 0.16, 0.14, 0.06); const shackle = mesh(new THREE.TorusGeometry(0.055, 0.015, 6, 14, Math.PI), C('#b8bcc4'), 0, 0.07, 0, lock);
    const drawer = new THREE.Group(); drawer.position.set(-1.1, 0.35, -0.64); kb.add(drawer); signBoard(drawer, X.sign(300, 100, [['NOT A CRIME', 50, '#2e211d']], '#f4f1ea', '#2e211d'), 0, 0, 0.012, 0.3, 0.1, { d: 0.005 });
    // poster board with MISSING posters, benches, trees, bus stop, vending machine, bikes
    const pb = new THREE.Group(); pb.position.set(-6, 0, -5); pb.rotation.y = 0.35; St.add(pb); box(pb, '#5a3b2a', 0, 1.35, 0, 3.2, 1.9, 0.1); for (const x of [-1.5, 1.5]) box(pb, '#5a3b2a', x, 0.6, 0, 0.1, 1.2, 0.1);
    const posters = []; for (let i = 0; i < 10; i++) { const p_ = signBoard(pb, X.poster(140 + i, 'MISSING', ['HAVE YOU SEEN MY SON?', 'CALL ANYTIME', 'PLEASE COME HOME', 'REWARD', 'LAST SEEN MARCH'][i % 5]), -1.25 + (i % 5) * 0.62, 1.8 - Math.floor(i / 5) * 0.85, 0.07, 0.5, 0.7, { d: 0.005, border: 0.01, frame: '#fbf7ea' }); p_.rotation.z = Math.sin(i * 2.3) * 0.06; posters.push(p_); }
    for (const [x, z, ry] of [[-2, 3, 0], [2.5, 3.2, 0], [-9, 1, 0.6]]) { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; St.add(b); box(b, '#b07a45', 0, 0.45, 0, 1.8, 0.06, 0.45); box(b, '#b07a45', 0, 0.78, -0.2, 1.8, 0.3, 0.05); for (const xx of [-0.8, 0.8]) box(b, '#3b3f52', xx, 0.22, 0, 0.06, 0.45, 0.4); }
    const sts = [tree(St, -12, 4, 1.1, 141, false), tree(St, 12, 5, 1.0, 142, false), tree(St, -14, -6, 1.2, 143, false), tree(St, 14, -8, 1.0, 144, false)];
    const lights = []; for (const x of [-10, -4, 4, 10]) { cyl(St, '#3b3f52', x, 2, 7, 0.07, 0.09, 4, { seg: 8 }); lights.push(sph(St, glow('#fff1c0'), x, 4.1, 7, 0.25, { cast: false })); }
    const vm = new THREE.Group(); vm.position.set(-9.5, 0, -8); St.add(vm); box(vm, '#c0392b', 0, 0.95, 0, 0.85, 1.9, 0.75); box(vm, glow('#fff4e8'), 0, 1.25, 0.38, 0.7, 0.8, 0.01, { cast: false });
    // imagined: the debt pile and the falling lies (3D)
    const debt = new THREE.Group(); debt.position.set(-1.8, 0, -2.2); St.add(debt); const dItems = []; const dr = rng(99);
    for (let i = 0; i < 40; i++) { const e = box(debt, i % 3 ? '#e0453a' : '#f4e0d8', (dr() - 0.5) * 0.1, 0.02 + i * 0.045, (dr() - 0.5) * 0.1, 0.45, 0.04, 0.3); e.rotation.y = dr() * 0.6 - 0.3; dItems.push(e); }
    const dTag = signBoard(debt, X.debtLetter(), 0, 0.5, 0.2, 0.5, 0.31, { d: 0.01, border: 0.01, frame: '#fbe9e3' });
    const lies = [['I\'M FINE, MOM', '#3f8f6f'], ['GOT PROMOTED!', '#2f6fb5'], ['HOME SOON', '#8a4f7d']].map(([t, c], i) => signBoard(St, X.sign(512, 200, [[t, 70, '#fff']], c, '#2e211d'), -3.6 + i * 1.0, 3, -2.0 - (i % 2) * 0.5, 0.9, 0.35, { d: 0.05 }));
    // surrounding city blocks (instanced boxes) for the pull-back
    const cityM = toon({ map: H.tx(X.skyline(150, true, 1024, 512)) }); const r0 = rng(151);
    for (let i = 0; i < 70; i++) { const a = r0() * Math.PI * 2, d = 28 + r0() * 70; const x = Math.cos(a) * d, z = Math.sin(a) * d - 10; if (z > 8 && Math.abs(x) < 20) continue; const h = 6 + r0() * 22, w = 6 + r0() * 6;
      const b = box(St, toon({ color: ['#3b4a86', '#4a5a96', '#34407a', '#5a4a86'][i % 4] }), x, h / 2, z, w, h, w, { cast: false }); for (let k = 0; k < 6; k++) box(St, glow(r0() < 0.6 ? '#ffd87a' : '#9fe0ff'), x + (r0() - 0.5) * w * 0.8, 2 + r0() * (h - 3), z + w / 2 + 0.02, 0.9, 0.7, 0.02, { cast: false });
      if (r0() < 0.3) box(St, glow(['#ff4f8a', '#4fe3ff', '#ffe14f'][i % 3]), x, h + 0.6, z, w * 0.6, 0.8, 0.2, { cast: false }); }
    // flyer storm (instanced paper with MISSING print)
    const flyM = new THREE.MeshToonMaterial({ gradientMap: H.toon({}).gradientMap, map: H.tx(X.poster(160, 'MISSING', 'PLEASE COME HOME')), side: THREE.DoubleSide });
    const NF = 520; const flyers = inst(St, new THREE.PlaneGeometry(0.8, 1.1), flyM, NF);
    H.onUpdate((f, W) => {
      const s = W.station || {};
      train.position.x = s.trainX ?? -200; train.visible = s.train !== false;
      const dk = s.debt ?? 0; debt.visible = dk > 0; dItems.forEach((e, i) => { e.visible = i < dk * 40; const top = clamp((dk - 0.85) / 0.15); e.position.x = top * (i / 40) ** 2 * 1.2; e.position.y = 0.02 + i * 0.045 - top * (i / 40) ** 2 * 0.8; e.rotation.z = -top * (i / 40) * 1.2; }); dTag.position.y = Math.min(1.8, dk * 40 * 0.045) + 0.1;
      lies.forEach((l, i) => { const k = clamp((s.lies ?? 0) * 1.5 - i * 0.25); l.visible = (s.lies ?? 0) > 0; const b = k < 1 ? 1 - k * k : 0; l.position.y = 0.2 + 3.5 * b + Math.abs(Math.sin(k * 9)) * (1 - k) * 0.2; l.rotation.z = (i - 1) * 0.3 * (1 - k) + (i - 1) * 0.12; l.rotation.x = -0.2; });
      posters.forEach((p, i) => (p.visible = i < (s.posters ?? 10)));
      sc.userData.set(s.clock ?? (19 * 60 + 12 + f / 120), (f / 30) % 60);
      drawCnt(Math.round(s.count ?? 0));
      const lk = s.lock ?? 0; chains.forEach((c, i) => { c.scale.x = Math.max(0.01, clamp(lk * 1.6 - i * 0.3)); }); lock.visible = lk > 0.5; lock.position.y = 0.9 + (1 - clamp((lk - 0.5) * 3)) * 0.5; shackle.position.y = 0.07 - (lk > 0.85 ? 0.02 : 0);
      stampMark.visible = (s.stamp ?? 0) > 0.5; drawer.position.z = -0.64 + (s.drawer ?? 0) * 0.5; form.position.set(0.1 - (s.file ?? 0) * 1.2, 1.05 - (s.file ?? 0) * 0.68, 0.6 - (s.file ?? 0) * 0.9); form.visible = (s.file ?? 0) < 0.98;
      rlamp.material.color.set((f % 40) < 20 ? '#ff2a2a' : '#a01818');
      posters.forEach((p, i) => (p.rotation.x = Math.sin(f * 0.06 + i) * 0.04 * (1 + (s.wind ?? 0) * 4)));
      sts.forEach((t, i) => (t.rotation.z = Math.sin(f * 0.04 + i) * 0.015 * (1 + (s.wind ?? 0) * 3)));
      const st = s.storm ?? 0; flyers.visible = st > 0; if (st > 0) { const r = rng(77); for (let i = 0; i < NF; i++) { const k = clamp(st * 1.3 - r() * 0.3); const a = r() * 6.28 + f * (0.01 + r() * 0.02), rad = 2 + r() * 35 * (0.3 + k), h = 0.5 + k * (2 + r() * 30) + Math.sin(f * 0.05 + i) * 0.6;
        dummy.position.set(-6 + Math.cos(a) * rad, h, -5 + Math.sin(a) * rad); dummy.rotation.set(f * 0.04 * (1 + r()) + i, f * 0.03 + i * 0.7, f * 0.05 * r()); const sc_ = k > 0 ? 1 : 0.001; dummy.scale.setScalar(sc_); dummy.updateMatrix(); flyers.setMatrixAt(i, dummy.matrix); } flyers.instanceMatrix.needsUpdate = true; }
    });
  }
}
