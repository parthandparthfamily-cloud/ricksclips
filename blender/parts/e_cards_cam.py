# Blender stage, part 5: key/fill light, 2D character cards (emission + alpha, billboarded to camera), camera.
# ---------------- character cards ----------------
CM = 2.25
CARD_BM = None
CARDS = []
def card_mat(i):
    m = bpy.data.materials.new(f'card{i}'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); t = nt.nodes.new('ShaderNodeTexImage'); t.name = 'IMG'; t.interpolation = 'Linear'
    e = nt.nodes.new('ShaderNodeEmission'); tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mx = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(t.outputs['Color'], e.inputs[0]); e.inputs[1].default_value = 2 ** -0.45
    nt.links.new(t.outputs['Alpha'], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], o.inputs[0])
    try: m.surface_render_method = 'DITHERED'
    except Exception: pass
    return m
def get_card(i):
    while len(CARDS) <= i:
        k = len(CARDS); bm = g_plane(CM * 0.6, CM); bmesh.ops.translate(bm, vec=(0, CM / 2 - CM * 0.025, 0), verts=bm.verts)
        o = obj(f'card{k}', bm, card_mat(k), parent=ROOT, ink=0); CARDS.append(o)
    return CARDS[i]

# ---------------- camera ----------------
camd = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', camd); S.collection.objects.link(cam); S.camera = cam
camd.sensor_fit = 'VERTICAL'; camd.clip_start = 0.05; camd.clip_end = 400; camd.dof.use_dof = True
def B(p): return Vector((p[0], -p[2], p[1]))

