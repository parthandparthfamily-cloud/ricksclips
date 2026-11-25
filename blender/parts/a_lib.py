# Blender stage, part 1: render setup, toon materials, ink outlines, geometry helpers.
# The 3D world is built from simple shapes in three.js Y-up coordinates (under ROOT) so the camera plan from the browser
# drops straight in. Characters stay 2D cards; everything else is real 3D.
# Run (after build.py):  blender -b -P scene.py -- --data data --out frames --frames 0-449 [--engine EEVEE|CYCLES|WORKBENCH] [--scale 1.0] [--samples 16] [--resume]
#              demo:     blender -b -P scene.py -- --demo --out demo        (no browser export needed: renders 3 stills of the example set)
import bpy, bmesh, json, math, os, sys, random
from mathutils import Vector, Quaternion, Matrix

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, d):
    return argv[argv.index(k) + 1] if k in argv else d
DATA = os.path.abspath(arg('--data', 'out')); OUT = os.path.abspath(arg('--out', 'frames'))
ENGINE = arg('--engine', 'EEVEE'); SCALE = float(arg('--scale', '1')); SAMPLES = int(arg('--samples', '16'))
spec = arg('--frames', '0-449'); FR = []
for part in spec.split(','):
    if '-' in part: a, b = map(int, part.split('-')); FR += list(range(a, b + 1))
    else: FR.append(int(part))
RESUME = '--resume' in argv
INKX = float(arg('--ink', '2.6'))
os.makedirs(OUT, exist_ok=True)
DEMO = '--demo' in argv
FRAMES = [] if DEMO else json.load(open(os.path.join(DATA, 'frames.json')))
ASPECT = arg('--aspect', '9:16')   # 9:16 Shorts or 16:9 longform

bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene
S.render.resolution_x, S.render.resolution_y = (int(1080 * SCALE), int(1920 * SCALE)) if ASPECT == '9:16' else (int(1920 * SCALE), int(1080 * SCALE))
S.render.fps = 30
S.render.image_settings.file_format = 'JPEG'; S.render.image_settings.quality = 95
S.view_settings.view_transform = 'Standard'; S.view_settings.look = 'None'; S.view_settings.exposure = 0.45
if ENGINE == 'WORKBENCH':   # fast motion proxy for the QA gate only
    S.render.engine = 'BLENDER_WORKBENCH'; S.display.shading.light = 'STUDIO'; S.display.shading.color_type = 'TEXTURE'
    S.display.render_aa = 'OFF'
elif ENGINE == 'CYCLES':
    S.render.engine = 'CYCLES'; S.cycles.samples = SAMPLES; S.cycles.use_denoising = True
    try:
        pref = bpy.context.preferences.addons['cycles'].preferences; pref.compute_device_type = 'CUDA'; pref.get_devices()
        for d in pref.devices: d.use = True
        S.cycles.device = 'GPU' if any(d.type != 'CPU' for d in pref.devices) else 'CPU'
    except Exception: S.cycles.device = 'CPU'
else:
    S.render.engine = 'BLENDER_EEVEE'
    ee = S.eevee
    for k, v in [('taa_render_samples', SAMPLES), ('use_shadows', True), ('use_raytracing', True), ('shadow_ray_count', 2), ('shadow_step_count', 6), ('use_gtao', True)]:
        try: setattr(ee, k, v)
        except Exception: pass
    try: ee.ray_tracing_options.resolution_scale = '2'
    except Exception: pass

def hexc(h, a=1.0):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (a,)   # sRGB -> linear

# ---------------- world light ----------------
W = bpy.data.worlds.new('W'); S.world = W; W.use_nodes = True
bg = W.node_tree.nodes['Background']; bg.inputs[0].default_value = hexc('#c9b8b0'); bg.inputs[1].default_value = 0.5

# ---------------- materials ----------------
MATS = {}
def mat_toon(col, rough=0.62, spec=0.18, emit=None, emit_s=0.0):
    key = ('t', col, rough, spec, emit, emit_s)
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new('m_' + col); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexc(col); b.inputs['Roughness'].default_value = rough
    try: b.inputs['Specular IOR Level'].default_value = spec
    except Exception: pass
    if emit: b.inputs['Emission Color'].default_value = hexc(emit); b.inputs['Emission Strength'].default_value = emit_s
    MATS[key] = m; return m
def mat_emit(col, s=3.0):
    key = ('e', col, s)
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new('e_' + col); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission'); e.inputs[0].default_value = hexc(col); e.inputs[1].default_value = s
    nt.links.new(e.outputs[0], o.inputs[0]); MATS[key] = m; return m
IMGS = {}
def img(path):
    if path not in IMGS: IMGS[path] = bpy.data.images.load(path, check_existing=True)
    return IMGS[path]
def mat_tex(name, rep=(1, 1), alpha=False, unlit=False, rough=0.62):
    key = ('x', name, rep, alpha, unlit)
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new('x_' + name); m.use_nodes = True; nt = m.node_tree
    p = os.path.join(DATA, 'tex', name + '.png')
    if not os.path.exists(p): return mat_toon('#d9a32e' if name == 'coin' else '#8fbf6a' if name == 'bill' else '#e9e1d2')
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = img(p)
    if rep != (1, 1):
        tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (rep[0], rep[1], 1)
        nt.links.new(tc.outputs['UV'], mp.inputs[0]); nt.links.new(mp.outputs[0], t.inputs[0])
    b = nt.nodes['Principled BSDF']; nt.links.new(t.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if unlit: nt.links.new(t.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = 0.12
    if alpha:
        nt.links.new(t.outputs['Alpha'], b.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    MATS[key] = m; return m
def mat_fade(col, emit=False):
    m = bpy.data.materials.new('f_' + col); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexc(col); b.inputs['Roughness'].default_value = 0.8
    if emit: b.inputs['Emission Color'].default_value = hexc(col); b.inputs['Emission Strength'].default_value = 1.2
    try: m.surface_render_method = 'BLENDED'
    except Exception: pass
    return m
def set_alpha(m, a): m.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = max(0.0, min(1.0, a))
# ink outline (inverted hull): dark where the hull faces away from us, invisible where it faces us
INK = bpy.data.materials.new('ink'); INK.use_nodes = True; nt = INK.node_tree; nt.nodes.clear()
_o = nt.nodes.new('ShaderNodeOutputMaterial'); _e = nt.nodes.new('ShaderNodeEmission'); _e.inputs[0].default_value = hexc('#1c1410'); _e.inputs[1].default_value = 1.0
_t = nt.nodes.new('ShaderNodeBsdfTransparent'); _g = nt.nodes.new('ShaderNodeNewGeometry'); _mx = nt.nodes.new('ShaderNodeMixShader')
nt.links.new(_g.outputs['Backfacing'], _mx.inputs[0]); nt.links.new(_e.outputs[0], _mx.inputs[1]); nt.links.new(_t.outputs[0], _mx.inputs[2]); nt.links.new(_mx.outputs[0], _o.inputs[0])
try: INK.surface_render_method = 'DITHERED'
except Exception: pass
INK.use_backface_culling = False
try: INK.use_backface_culling_shadow = True
except Exception: pass

# ---------------- geometry (built in three.js Y-up coordinates under a root rotated +90 deg on X) ----------------
ROOT = bpy.data.objects.new('ROOT', None); S.collection.objects.link(ROOT); ROOT.rotation_euler = (math.pi / 2, 0, 0)
def grp(name, loc=(0, 0, 0), rot=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None); S.collection.objects.link(e); e.parent = parent or ROOT; e.rotation_mode = 'ZYX'; e.location = loc; e.rotation_euler = rot; return e
def bm_rotx(bm, ang): bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(ang, 3, 'X'))
def g_box(w, h, d):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0, calc_uvs=True); bmesh.ops.scale(bm, vec=(w, h, d), verts=bm.verts); return bm
def g_cyl(rt, rb, h, seg=20, caps=True):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=caps, cap_tris=False, segments=seg, radius1=rb, radius2=rt, depth=h, calc_uvs=True); bm_rotx(bm, -math.pi / 2); return bm
def g_sphere(r, u=16, v=10):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r, calc_uvs=True); return bm
def g_plane(w, h):
    bm = bmesh.new(); vs = [bm.verts.new(p) for p in [(-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0)]]
    f = bm.faces.new(vs); uv = bm.loops.layers.uv.new()
    for l, c in zip(f.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]): l[uv].uv = c
    return bm
def g_circle(r, seg=48):
    bm = bmesh.new(); uv = bm.loops.layers.uv.new(); c = bm.verts.new((0, 0, 0)); ring = [bm.verts.new((math.cos(a) * r, math.sin(a) * r, 0)) for a in [i / seg * 2 * math.pi for i in range(seg)]]
    for i in range(seg):
        f = bm.faces.new([c, ring[i], ring[(i + 1) % seg]])
        for l in f.loops: x, y, _ = l.vert.co; l[uv].uv = (0.5 + x / (2 * r), 0.5 + y / (2 * r))
    return bm
def g_ring(ri, ro, seg=32):
    bm = bmesh.new(); A = [bm.verts.new((math.cos(i / seg * 2 * math.pi) * ri, math.sin(i / seg * 2 * math.pi) * ri, 0)) for i in range(seg)]
    B = [bm.verts.new((math.cos(i / seg * 2 * math.pi) * ro, math.sin(i / seg * 2 * math.pi) * ro, 0)) for i in range(seg)]
    for i in range(seg): bm.faces.new([A[i], B[i], B[(i + 1) % seg], A[(i + 1) % seg]])
    return bm
def g_torus(R, r, tseg=32, rseg=8, arc=2 * math.pi):
    bm = bmesh.new(); closed = arc >= 2 * math.pi - 1e-6; n = tseg if closed else tseg + 1; rows = []
    for i in range(n):
        a = i / tseg * arc; row = []
        for j in range(rseg):
            b = j / rseg * 2 * math.pi; row.append(bm.verts.new(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b))))
        rows.append(row)
    for i in range(tseg if closed else tseg):
        A, B = rows[i], rows[(i + 1) % n]
        for j in range(rseg): bm.faces.new([A[j], B[j], B[(j + 1) % rseg], A[(j + 1) % rseg]])
    return bm
def g_cone(r, h, seg=12, open_end=False):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=not open_end, cap_tris=True, segments=seg, radius1=r, radius2=0.0, depth=h); bm_rotx(bm, -math.pi / 2); return bm
def g_octa(r):
    bm = bmesh.new(); P = [(r, 0, 0), (-r, 0, 0), (0, r, 0), (0, -r, 0), (0, 0, r), (0, 0, -r)]; v = [bm.verts.new(p) for p in P]
    for a, b, c in [(0, 2, 4), (2, 1, 4), (1, 3, 4), (3, 0, 4), (2, 0, 5), (1, 2, 5), (3, 1, 5), (0, 3, 5)]: bm.faces.new([v[a], v[b], v[c]])
    return bm
def g_tube(pts, r, seg=8):
    bm = bmesh.new(); rings = []
    for i, p in enumerate(pts):
        p = Vector(p); d = (Vector(pts[min(i + 1, len(pts) - 1)]) - Vector(pts[max(i - 1, 0)])).normalized()
        up = Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0)); n1 = d.cross(up).normalized(); n2 = d.cross(n1)
        rings.append([bm.verts.new(p + (n1 * math.cos(j / seg * 6.283) + n2 * math.sin(j / seg * 6.283)) * r) for j in range(seg)])
    for i in range(len(rings) - 1):
        for j in range(seg): bm.faces.new([rings[i][j], rings[i + 1][j], rings[i + 1][(j + 1) % seg], rings[i][(j + 1) % seg]])
    return bm
MESHES = {}
def obj(name, bm, mats, loc=(0, 0, 0), rot=(0, 0, 0), parent=None, ink=0.012, share=None, smooth=False, shadow=True):
    if share and share in MESHES: me = MESHES[share]
    else:
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        if smooth:
            for p in me.polygons: p.use_smooth = True
        for m in (mats if isinstance(mats, list) else [mats]): me.materials.append(m)
        if ink: me.materials.append(INK)
        if share: MESHES[share] = me
    o = bpy.data.objects.new(name, me); S.collection.objects.link(o); o.parent = parent or ROOT; o.rotation_mode = 'ZYX'; o.location = loc; o.rotation_euler = rot
    if ink:
        md = o.modifiers.new('ink', 'SOLIDIFY'); md.thickness = ink * INKX; md.offset = 1.0; md.use_flip_normals = True; md.use_rim = False
        md.material_offset = len(me.materials) - 1
    if not shadow:
        try: o.visible_shadow = False
        except Exception: pass
    return o
def mesh_from(bm, name='tmp'): return bm
R = random.Random(11).random
P2 = math.pi / 2

