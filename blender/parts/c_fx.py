# Blender stage, part 3: 3D FX pool (coins, bills, smoke puffs, sweat drops, shock rings, sparks, a fly). Hidden until a shot uses them.
FXG = grp('FXG')
COINM = [mat_toon('#d9a32e', 0.3, 0.6), mat_tex('coin', rough=0.3)]
COINS = []
for i in range(64):
    o = obj('coin', g_cyl(0.065, 0.065, 0.014, 22), COINM, parent=FXG, ink=0.004, share='coin')
    COINS.append({'o': o, 'r': [R() for _ in range(5)]})
# put the $ texture on the coin caps only (faces whose normal points along the axis)
me = MESHES['coin']
for p in me.polygons: p.material_index = 1 if abs(p.normal.y) > 0.9 else 0
BILLS = [{'o': obj('bill', g_plane(0.2, 0.094), mat_tex('bill'), parent=FXG, ink=0, share='bill'), 'r': [R() for _ in range(4)]} for i in range(12)]
PUFFS = []
for i in range(26):
    m = mat_fade('#f1eadf'); o = obj('puff', g_sphere(1.0, 14, 10), m, parent=FXG, ink=0.0, smooth=True, shadow=False); PUFFS.append({'o': o, 'm': m, 'r': [R(), R(), R()]})
SMOKE, SLAMP, CRASHP = PUFFS[:6], PUFFS[6:14], PUFFS[14:26]
SW = mat_toon('#8fd4ff', 0.15, 0.7)
SWEAT = []
for i in range(2):
    g = grp('drop', parent=FXG); obj('dr', g_sphere(0.03, 12, 10), SW, parent=g, ink=0.004, smooth=True); obj('dc', g_cone(0.029, 0.06, 12), SW, (0, 0.04, 0), parent=g, ink=0.004); SWEAT.append(g)
RINGS = []
for i in range(4):
    m = mat_fade('#7af0ff', emit=True); RINGS.append({'o': obj('ring', g_torus(1.0, 0.06, 40, 8, math.pi * 0.9), m, parent=FXG, ink=0, shadow=False), 'm': m})
TAG = grp('TAG', parent=FXG)
obj('tagp', g_plane(0.3, 0.13), mat_tex('tag', alpha=True, unlit=True), (-0.15, 0, 0), parent=TAG, ink=0)
obj('tags', g_cyl(0.003, 0.003, 0.12, 4), DARKW, (0.02, 0.05, 0), (0, 0, 1.0), TAG, ink=0)
BANG = grp('BANG', parent=FXG); BM = mat_toon('#ffd84a', 0.4)
obj('bang1', g_cyl(0.07, 0.035, 0.32, 14), BM, (0, 0.2, 0), parent=BANG, ink=0.01); obj('bang2', g_sphere(0.05, 12, 10), BM, (0, -0.04, 0), parent=BANG, ink=0.01, smooth=True)
AMB = [{'o': obj('spark', g_octa(1.0), mat_emit('#fff6c8', 5), parent=FXG, ink=0, share='spark', shadow=False), 'p': ((R() - 0.5) * 5, 1.6 + R() * 3, -4 + R() * 5), 'k': R() * 6} for i in range(14)]
FLY = grp('FLY', parent=FXG); obj('flyb', g_sphere(0.018, 10, 8), mat_toon('#1a1418'), parent=FLY, ink=0.003)
WM = mat_fade('#e8f4ff'); set_alpha(WM, 0.8)
WINGS = [obj('wing', g_plane(0.03, 0.018), WM, (s * 0.016, 0.01, 0), parent=FLY, ink=0, shadow=False) for s in (-1, 1)]

# ---------------- key light ----------------
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); S.collection.objects.link(sun)
sun.data.energy = 2.2; sun.data.color = (1.0, 0.95, 0.88); sun.data.angle = math.radians(12); sun.rotation_euler = (math.radians(38), 0, math.radians(-35))
fill = bpy.data.objects.new('fill', bpy.data.lights.new('fill', 'AREA')); S.collection.objects.link(fill)
fill.data.energy = 350; fill.data.size = 6; fill.data.color = (0.85, 0.9, 1.0); fill.location = (0, -9, 4); fill.rotation_euler = (math.radians(70), 0, 0)
