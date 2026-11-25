# Blender stage, part 4: YOUR SETS. One group per set, each at its own X offset so they never overlap.
# This example builds two small sets: a town street (outdoors) and a study (indoors). Replace them with the sets your story needs.
# Rule of thumb: sets are the main attraction. Fill every shot (foreground, mid, background), add moving life (smoke, birds, lamps).
SETS = {}            # name -> group (shown only while a shot uses it)
SET_X = {}           # name -> x offset (must match SET in your story.js)
SET_LOOK = {}        # name -> (sky colour, sky strength, sun energy, sun colour)

# ---------- town street ----------
SET_X['street'] = 0; ST = grp('set_street', (0, 0, 0)); SETS['street'] = ST
SET_LOOK['street'] = ('#bcd3e6', 0.7, 2.4, (1.0, 0.94, 0.85))
obj('road', g_plane(40, 30), mat_toon('#7d746c', 0.9), (0, 0, 0), (-P2, 0, 0), ST, ink=0)
obj('walk', g_box(40, 0.12, 2.2), mat_toon('#c9bfae', 0.85), (0, 0.06, -3.2), parent=ST, ink=0.006)
HOUSE_COLS = ['#d9776a', '#e8c26a', '#7fb3c9', '#a3c97f', '#c99ad9', '#e89a5a']
for i in range(7):
    x = -9 + i * 3.0; h = 2.6 + (i * 37 % 5) * 0.35; w = 2.7; col = HOUSE_COLS[i % len(HOUSE_COLS)]
    hs = grp('house', (x, 0, -6.0), parent=ST)
    obj('wall', g_rbox(w, h, 2.6, 0.04, 2), mat_toon(col), (0, h / 2, 0), parent=hs, ink=0.014)
    obj('roof', g_rbox(w + 0.3, 0.5, 2.9, 0.06, 2, 0.55, 1.0), mat_toon('#7a3b2e'), (0, h + 0.25, 0), parent=hs, ink=0.012)
    obj('door', g_box(0.55, 1.0, 0.06), mat_toon('#5a3420'), (-0.6, 0.5, 1.31), parent=hs, ink=0.006)
    for wx in (0.35, 0.95):
        obj('win', g_box(0.45, 0.5, 0.05), mat_toon('#ffe9a8', 0.3, 0.3, '#ffe9a8', 0.4), (wx, h * 0.62, 1.31), parent=hs, ink=0.006)
    obj('chim', g_box(0.3, 0.6, 0.3), mat_toon('#8a4a3a'), (0.7, h + 0.6, -0.4), parent=hs, ink=0.008)
for i in range(6):
    x = -8 + i * 3.2; lp = grp('lamp', (x, 0, -2.4), parent=ST)
    obj('post', g_cyl(0.05, 0.06, 2.6, 10), mat_toon('#2c2a33'), (0, 1.3, 0), parent=lp, ink=0.006)
    obj('bulb', g_sphere(0.14, 12, 10), mat_emit('#fff1c4', 2.5), (0, 2.7, 0), parent=lp, ink=0.004)
for i in range(5):
    tr_ = grp('tree', (-10 + i * 5.1, 0, -9.5), parent=ST)
    obj('trunk', g_cyl(0.12, 0.16, 1.6, 8), mat_toon('#6a4428'), (0, 0.8, 0), parent=tr_, ink=0.008)
    obj('crown', g_sphere(1.0, 14, 10), mat_toon('#4f9a45'), (0, 2.2, 0), parent=tr_, ink=0.014, smooth=True)
CLOUDS = []
for i in range(6):
    c = grp('cloud', (-14 + i * 6, 9 + (i % 3), -22), parent=ST); CLOUDS.append(c)
    for k in range(3): obj('puff', g_sphere(1.2 - k * 0.2, 12, 8), mat_toon('#ffffff', 0.9), (k * 1.1 - 1.1, 0.2 * (k % 2), 0), parent=c, ink=0.01, smooth=True)
CAR, WHEELS = make_car(ST, loc=(-6, 0, -1.0), ry=P2)

# ---------- study (indoors) ----------
SET_X['study'] = 60; SD = grp('set_study', (60, 0, 0)); SETS['study'] = SD
SET_LOOK['study'] = ('#e8d8c8', 0.9, 1.6, (1.0, 0.88, 0.72))
room(SD, 9, 8, 3.4, mat_toon('#6d4a3a'), mat_toon('#8a5a34', 0.7))
shelf(SD, -3.2, -3.6); shelf(SD, 3.2, -3.6)
desk(SD, 0, -1.6)
lamp(SD, 0, 2.6, -1.0, energy=220); lamp(SD, -3, 2.4, -2.5, energy=120); lamp(SD, 3, 2.4, -2.5, energy=120)
obj('globe', g_sphere(0.22, 18, 12), mat_toon('#3f86c9', 0.4), (0.3, 0.95, -1.6), parent=SD, ink=0.006, smooth=True)

def animate_sets(f, setname):
    """Per-frame life for each set (call every frame). Keep something moving in every shot."""
    if setname == 'street':
        for i, c in enumerate(CLOUDS): c.location = ((-14 + i * 6) + f * 0.01, c.location[1], c.location[2])
        CAR.location = (-6 + f * 0.04, 0, -1.0)
        for w in WHEELS: w.rotation_euler = (f * 0.12, 0, 0)
