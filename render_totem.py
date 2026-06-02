"""
AURA · TOTEM V3 — Render fotorrealista (Blender / Cycles)
=========================================================
Reconstrói o totem principal + módulo impressora a partir das medidas da V3 e
renderiza em PNG com iluminação de estúdio, no acabamento branco.

Uso (headless):
    blender -b -P render_totem.py
Saída:
    ./renders/aura_totem_<tema>.png

Observação: este script modela o EXTERIOR visível (base, coluna, cabeça stadium,
tela, câmera embutida, LED, caixa da impressora com porta + slot). A conexão é
direta coluna→cabeça (base de fixação reta interna, sem flanges aparentes). Peças
internas (CE, base de fixação G2, parafusos, Mini PC, hastes) são omitidas aqui.
"""

import bpy, math, os

# ----------------------------------------------------------------------------
# Medidas (mm) — espelham window.PRINCIPAL / window.IMPRESSORA da V3
# ----------------------------------------------------------------------------
MM = 0.001  # mm -> m

PRINC = dict(
    base=dict(lado=400, alt=60),
    coluna=dict(larg=120, prof=130, alt=990, y0=60),
    cabeca=dict(larg=340, alt=600, prof=180, y0=1050, raio=170),
    camera=dict(furo=68, aro=95, cy=1570),
    monitor=dict(mol_l=220, mol_a=360, rec_l=194, rec_a=345, cy=1305, off=6),
)
IMPR = dict(
    base=dict(lado=350, alt=60),
    coluna=dict(larg=120, prof=120, alt=610, y0=60),
    caixa=dict(larg=360, alt=250, prof=420, y0=670, raio=40,
               slot_l=180, slot_a=15, slot_cy=800),
    unit=dict(l=275, p=366, a=170),
)

SEP_X = 520  # afastamento em X de cada módulo a partir do centro (mm)

# Paleta (hex sRGB) — acabamento branco único (espelha COLORS de totem-3d.js)
THEMES = {
    "branca": dict(mdf=0xF4F2EE, edge=0xE2DDD4, wood=0xC4A882, floor=0xECEAE6, world=0x8a8a88),
}

# ----------------------------------------------------------------------------
# Utilidades de cor
# ----------------------------------------------------------------------------
def _srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def hex_lin(h):
    r = ((h >> 16) & 255) / 255.0
    g = ((h >> 8) & 255) / 255.0
    b = (h & 255) / 255.0
    return (_srgb_to_linear(r), _srgb_to_linear(g), _srgb_to_linear(b), 1.0)

# ----------------------------------------------------------------------------
# Materiais
# ----------------------------------------------------------------------------
def make_material(name, color_hex, rough=0.5, metal=0.0, emit_hex=None, emit_str=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = hex_lin(color_hex)
    b.inputs["Roughness"].default_value = rough
    if "Metallic" in b.inputs:
        b.inputs["Metallic"].default_value = metal
    if emit_hex is not None:
        for n in ("Emission Color", "Emission"):
            if n in b.inputs:
                b.inputs[n].default_value = hex_lin(emit_hex)
                break
        if "Emission Strength" in b.inputs:
            b.inputs["Emission Strength"].default_value = emit_str
    return m

# ----------------------------------------------------------------------------
# Helpers de geometria
# ----------------------------------------------------------------------------
def _new(obj, mat):
    if mat:
        obj.data.materials.append(mat)
    return obj

def add_box(name, w, d, h, loc, mat=None, bevel=0.0, bevel_seg=4):
    """Caixa centrada em loc (mm). w=X, d=Y, h=Z."""
    bpy.ops.mesh.primitive_cube_add(size=2, location=(loc[0]*MM, loc[1]*MM, loc[2]*MM))
    o = bpy.context.active_object
    o.name = name
    o.scale = (w*MM/2, d*MM/2, h*MM/2)
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        bm = o.modifiers.new("bevel", "BEVEL")
        bm.width = bevel * MM
        bm.segments = bevel_seg
        bm.limit_method = "ANGLE"
        bm.angle_limit = math.radians(40)
    return _new(o, mat)

def add_cyl(name, r, depth, loc, axis="Y", mat=None):
    bpy.ops.mesh.primitive_cylinder_add(radius=r*MM, depth=depth*MM,
                                         location=(loc[0]*MM, loc[1]*MM, loc[2]*MM),
                                         vertices=64)
    o = bpy.context.active_object
    o.name = name
    if axis == "Y":
        o.rotation_euler[0] = math.radians(90)
    elif axis == "X":
        o.rotation_euler[1] = math.radians(90)
    bpy.ops.object.transform_apply(rotation=True)
    return _new(o, mat)

def add_stadium(name, w, h, depth, loc, mat=None):
    """Prisma 'stadium' (retângulo + 2 semicírculos) no plano X-Z, profundidade em Y.
    w = largura (X), h = altura (Z), r = w/2. Construído com box central + 2 cilindros."""
    r = w / 2.0
    straight = max(h - 2 * r, 0.0)
    parts = []
    # box central
    if straight > 0:
        parts.append(add_box(name + "_mid", w, depth, straight, loc, None))
    # cilindros topo e base (eixo em Y)
    top = add_cyl(name + "_top", r, depth, (loc[0], loc[1], loc[2] + straight / 2), "Y", None)
    bot = add_cyl(name + "_bot", r, depth, (loc[0], loc[1], loc[2] - straight / 2), "Y", None)
    parts += [top, bot]
    # juntar
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    o = bpy.context.active_object
    o.name = name
    return _new(o, mat)

# ----------------------------------------------------------------------------
# Construção dos módulos
# ----------------------------------------------------------------------------
def build_principal(x0, mats):
    P = PRINC
    b, c, k = P["base"], P["coluna"], P["cabeca"]
    # base
    add_box("P_base", b["lado"], b["lado"], b["alt"], (x0, 0, b["alt"]/2),
            mats["mdf"], bevel=18, bevel_seg=6)
    # coluna
    col_cz = c["y0"] + c["alt"]/2
    add_box("P_col", c["larg"], c["prof"], c["alt"], (x0, 0, col_cz),
            mats["mdf"], bevel=10, bevel_seg=4)
    # lâmina de madeira na frente da coluna (+Y)
    add_box("P_col_wood", c["larg"]-10, 1, c["alt"]-10, (x0, c["prof"]/2+0.5, col_cz),
            mats["wood"], bevel=2, bevel_seg=2)
    # LED vertical da coluna (sulco na lâmina)
    add_box("P_col_led", 8, 1, c["alt"]-60, (x0, c["prof"]/2+1.5, col_cz), mats["led"])
    # cabeça stadium
    cab_cz = k["y0"] + k["alt"]/2
    add_stadium("P_head", k["larg"], k["alt"], k["prof"], (x0, 0, cab_cz), mats["mdf"])
    front_y = k["prof"]/2
    # Camadas empilhadas em Y (cada uma fina, SEM sobreposição → evita z-fighting):
    #   ring LED (atrás) → máscara bege → tela → aro câmera (mais à frente)
    add_stadium("P_head_led",  k["larg"]-36, k["alt"]-36, 1, (x0, front_y+0.5, cab_cz), mats["led"])
    add_stadium("P_head_mask", k["larg"]-60, k["alt"]-60, 1, (x0, front_y+1.5, cab_cz), mats["mdf"])
    # tela (monitor) na frente da máscara
    M = P["monitor"]
    add_box("P_screen", M["rec_l"], 1, M["rec_a"], (x0, front_y+2.5, M["cy"]+M["off"]), mats["screen"])
    # (Câmera removida da frente da cabeça a pedido — sem aro/lente.)

def build_impressora(x0, mats):
    I = IMPR
    b, c, k = I["base"], I["coluna"], I["caixa"]
    add_box("I_base", b["lado"], b["lado"], b["alt"], (x0, 0, b["alt"]/2),
            mats["mdf"], bevel=18, bevel_seg=6)
    col_cz = c["y0"] + c["alt"]/2
    add_box("I_col", c["larg"], c["prof"], c["alt"], (x0, 0, col_cz),
            mats["mdf"], bevel=10, bevel_seg=4)
    add_box("I_col_wood", c["larg"]-10, 1, c["alt"]-10, (x0, c["prof"]/2+0.5, col_cz),
            mats["wood"], bevel=2, bevel_seg=2)
    add_box("I_col_led", 8, 1, c["alt"]-40, (x0, c["prof"]/2+1.5, col_cz), mats["led"])
    # caixa
    cax_cz = k["y0"] + k["alt"]/2
    add_box("I_box", k["larg"], k["prof"], k["alt"], (x0, 0, cax_cz),
            mats["mdf"], bevel=18, bevel_seg=6)
    front_y = k["prof"]/2
    # lâmina frontal (porta) — camadas finas sem sobrepor em Y
    add_box("I_door_wood", k["larg"]-24, 1, k["alt"]-24, (x0, front_y+0.7, cax_cz),
            mats["wood"], bevel=3, bevel_seg=2)
    # slot de saída da foto (à frente da lâmina)
    add_box("I_slot", k["slot_l"], 1, k["slot_a"], (x0, front_y+1.7, k["slot_cy"]), mats["screen"])

# ----------------------------------------------------------------------------
# Cena: limpeza, luzes, câmera, chão, render
# ----------------------------------------------------------------------------
def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
        for blk in list(coll):
            coll.remove(blk)

def add_area_light(name, loc, energy, size, rot=(0, 0, 0)):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy = energy
    ld.size = size * MM
    o = bpy.data.objects.new(name, ld)
    o.location = (loc[0]*MM, loc[1]*MM, loc[2]*MM)
    o.rotation_euler = rot
    bpy.context.scene.collection.objects.link(o)
    return o

def setup_world(world_hex, strength=1.0):
    w = bpy.data.worlds.new("AURA_World")
    w.use_nodes = True
    bg = w.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = hex_lin(world_hex)
    bg.inputs[1].default_value = strength
    bpy.context.scene.world = w

def setup_camera():
    cam_d = bpy.data.cameras.new("Cam")
    cam_d.lens = 55
    cam = bpy.data.objects.new("Cam", cam_d)
    cam.location = (1850*MM, 3450*MM, 1500*MM)
    bpy.context.scene.collection.objects.link(cam)
    # mira (track-to)
    tgt = bpy.data.objects.new("CamTarget", None)
    tgt.location = (0, 0, 820*MM)
    bpy.context.scene.collection.objects.link(tgt)
    con = cam.constraints.new("TRACK_TO")
    con.target = tgt
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    bpy.context.scene.camera = cam

def setup_render():
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 64
    try:
        sc.cycles.use_denoising = True
    except Exception:
        pass
    # GPU se disponível (OPTIX/CUDA/HIP/oneAPI); senão CPU.
    sc.cycles.device = "CPU"
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        for dtype in ("OPTIX", "CUDA", "HIP", "ONEAPI"):
            try:
                prefs.compute_device_type = dtype
            except (TypeError, Exception):
                continue
            prefs.get_devices()
            gpus = [d for d in prefs.devices if d.type != "CPU"]
            if gpus:
                for d in prefs.devices:
                    d.use = (d.type != "CPU")
                sc.cycles.device = "GPU"
                print(f"[render] GPU: {dtype} ({len(gpus)} device)")
                break
    except Exception as e:
        print("[render] GPU indisponivel, usando CPU:", e)
    sc.render.resolution_x = 1600
    sc.render.resolution_y = 1300
    sc.render.film_transparent = False
    # AgX dá rolloff fotográfico nas altas luzes (evita o branco estourado)
    try:
        sc.view_settings.view_transform = "AgX"
        sc.view_settings.look = "AgX - Medium High Contrast"
        sc.view_settings.exposure = -0.8   # evita lavar materiais escuros (cinza)
    except Exception:
        pass

def build_materials(theme):
    t = THEMES[theme]
    return dict(
        mdf=make_material("MDF_" + theme, t["mdf"], rough=0.55, metal=0.0),
        edge=make_material("Edge_" + theme, t["edge"], rough=0.6),
        wood=make_material("Wood", t["wood"], rough=0.4),
        led=make_material("LED", 0xFFE7B0, rough=0.4, emit_hex=0xFFE7B0, emit_str=8.0),
        screen=make_material("Screen", 0x0B1024, rough=0.30, metal=0.0,
                             emit_hex=0x1B3A8A, emit_str=3.5),
        cammetal=make_material("CamMetal", 0x202024, rough=0.35, metal=0.8),
        glass=make_material("Lens", 0x05060c, rough=0.08, metal=0.6),
    )

def build_floor(floor_hex):
    add_box("Floor", 8000, 8000, 10, (0, 0, -5),
            make_material("Floor", floor_hex, rough=0.65))

# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------
def main():
    out_dir = os.path.join(os.path.dirname(bpy.data.filepath) or os.getcwd(), "renders")
    # quando rodado por -P sem .blend salvo, usa o cwd
    if not os.path.isabs(out_dir):
        out_dir = os.path.join(os.getcwd(), "renders")
    os.makedirs(out_dir, exist_ok=True)

    setup_render_done = False
    for theme in ("branca",):
        clear_scene()
        t = THEMES[theme]
        setup_world(t["world"], strength=1.0)
        setup_camera()
        if not setup_render_done:
            setup_render()
            setup_render_done = True
        # luzes de estúdio (key / fill / rim)
        add_area_light("Key",  (2000, 2400, 2900), 1100, 1600, rot=(math.radians(-38), math.radians(22), 0))
        add_area_light("Fill", (-2400, 1900, 1500), 380, 2000, rot=(math.radians(-15), math.radians(-32), 0))
        add_area_light("Rim",  (-900, -2600, 2400), 750, 1300, rot=(math.radians(42), 0, 0))

        mats = build_materials(theme)
        build_floor(t["floor"])
        build_principal(-SEP_X, mats)
        build_impressora(+SEP_X, mats)

        path = os.path.join(out_dir, f"aura_totem_{theme}.png")
        bpy.context.scene.render.filepath = path
        print(f"[render] tema={theme} -> {path}")
        bpy.ops.render.render(write_still=True)

    print("[render] CONCLUIDO. PNGs em:", out_dir)

if __name__ == "__main__":
    main()
