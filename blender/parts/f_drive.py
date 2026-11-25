# Blender stage, part 6: the per-frame driver. Reads data/frames.json (exported from your story.js in the browser),
# shows the right set, moves the camera, places the character cards, renders, and mixes dissolves. Resumable.
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def show(o, v):
    o.hide_render = not v
    for c in o.children_recursive: c.hide_render = not v
for o_ in FXG.children_recursive: o_.hide_render = True          # FX start hidden; reveal them in animate_sets
NOCEIL = [o for o in S.objects if o.name.startswith('NOCEIL')]   # ceilings stay open so the camera can look in
CS = 1.3
IMG_CACHE = {}
def apply(f, st):
    setname = st.get('set') or st['sid']
    for k_, g_ in SETS.items(): show(g_, k_ == setname)
    for o_ in NOCEIL: o_.hide_render = True
    c_, s_, e_, col_ = SET_LOOK[setname]; bg.inputs[0].default_value = hexc(c_); bg.inputs[1].default_value = s_; sun.data.energy = e_; sun.data.color = col_
    sx = SET_X[setname]; fill.location = (sx, -9, 4); FXG.location = (sx, 0, 0)
    animate_sets(f, setname)
    C = st['cam']; cam.location = B(C['pos']); d = B(C['look']) - B(C['pos'])
    q = d.to_track_quat('-Z', 'Y'); q = q @ Quaternion((0, 0, 1), math.radians(C.get('roll', 0))); cam.rotation_mode = 'QUATERNION'; cam.rotation_quaternion = q
    camd.angle_y = math.radians(C['fov'])
    D = st.get('dof', {'focus': 6, 'cinf': 0}); camd.dof.focus_distance = D['focus']; camd.dof.aperture_fstop = 2.2 if D.get('cinf', 0) > 5 else 4.5
    used = set()
    for i, a in enumerate(st['actors']):
        o = get_card(i); show(o, True); o.location = (a['x'], a['y'], a['z']); o.scale = (a['s'] * CS,) * 3
        o.rotation_euler = (0, math.atan2(C['pos'][0] - a['x'], C['pos'][2] - a['z']), 0)
        path = os.path.join(DATA, 'cards', f"c{a['id']}.webp")
        if path not in IMG_CACHE: IMG_CACHE[path] = bpy.data.images.load(path, check_existing=True)
        o.active_material.node_tree.nodes['IMG'].image = IMG_CACHE[path]; used.add(path)
    for j in range(len(st['actors']), len(CARDS)): show(CARDS[j], False)
    return used
if DEMO:   # no browser export: a slow orbit over each example set, 3 stills each
    FRAMES = []
    for k, (name, x0) in enumerate(SET_X.items()):
        for j, u in enumerate((0.0, 0.5, 1.0)):
            a = math.radians(-25 + 50 * u)
            FRAMES.append({'f': k * 3 + j, 'sid': name, 'set': name, 'actors': [], 'dof': {'focus': 7, 'cinf': 0},
                           'cam': {'pos': [x0 + 7 * math.sin(a), 2.0, 7 * math.cos(a) - 1], 'look': [x0, 1.4, -3], 'fov': 50, 'roll': 0}})
    FR = [fr['f'] for fr in FRAMES]
import time
BYF = {fr['f']: fr for fr in FRAMES}
def render_to(p): S.render.filepath = p; bpy.ops.render.render(write_still=True)
def mix(pa, pb, w, outp):
    import numpy as np
    A = bpy.data.images.load(pa); Bi = bpy.data.images.load(pb); n = A.size[0] * A.size[1] * 4
    a = np.empty(n, np.float32); b = np.empty(n, np.float32); A.pixels.foreach_get(a); Bi.pixels.foreach_get(b)
    A.pixels.foreach_set(a * (1 - w) + b * w); A.save_render(outp, scene=S)
    bpy.data.images.remove(A); bpy.data.images.remove(Bi)
t0 = time.time(); n = 0
for f in FR:
    outp = os.path.join(OUT, f'f{f:04d}.jpg')
    if RESUME and os.path.exists(outp): continue
    fr = BYF[f]; S.frame_set(f)
    used = apply(f, fr)
    if 'blend' in fr:     # moving dissolve between shots: render both states and mix
        ta, tb = os.path.join(OUT, '_a.jpg'), os.path.join(OUT, '_b.jpg')
        render_to(ta); used |= apply(f, fr['blend']); render_to(tb); mix(ta, tb, fr['blend']['w'], outp)
    else: render_to(outp)
    for pth in list(IMG_CACHE):
        if pth not in used: bpy.data.images.remove(IMG_CACHE.pop(pth))
    n += 1
    if n % 25 == 0: print(f'frame {f}  avg {(time.time() - t0) / n:.2f} s/frame', flush=True)
print(f'done {n} frames, {(time.time() - t0) / max(n, 1):.2f} s/frame')
