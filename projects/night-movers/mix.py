#!/usr/bin/env python3
"""NIGHT MOVERS sound mix: voice (gently compressed) + 2 music cues (~20 dB under the voice) + real CC0 SFX cue sheet (~12 dB under).
Usage: python3 mix.py <voice.mp3> <sfx_root> <music_dir> <out.wav>
Master: -14 LUFS integrated, -2 dBTP (ffmpeg loudnorm, two-pass). Length = video length (71.33 s), voice never trimmed.
"""
import sys, subprocess, json, numpy as np
VOICE, SFX, MUS, OUT = sys.argv[1:5]
SR, DUR = 48000, 2140 / 30
def load(path, start=0.0, dur=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start), '-i', path] + (['-t', str(dur)] if dur else []) + ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
def lufs(x):
    p = subprocess.run(['ffmpeg', '-v', 'info', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=x.astype(np.float32).tobytes(), capture_output=True)
    for line in p.stderr.decode().splitlines()[::-1]:
        if line.strip().startswith('I:'): return float(line.split()[1])
db = lambda d: 10 ** (d / 20)
N = int(DUR * SR); mix = np.zeros((N, 2), np.float32)
# ---- voice: gentle 3:1 compression, placed at 0 ----
vp = subprocess.run(['ffmpeg', '-v', 'error', '-i', VOICE, '-af', 'acompressor=threshold=-24dB:ratio=3:attack=8:release=120:makeup=1', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
voice = np.frombuffer(vp, np.float32).reshape(-1, 2).copy(); voice = np.vstack([voice, np.zeros((max(0, N - len(voice)), 2), np.float32)])[:N]
vL = lufs(voice); print('voice LUFS', vL)
# ---- music: Sneaky Snitch (0 -> 44.2 s), crossfade into Heartbreaking at the twist ("It's your mother", 43.92 s) ----
def fade(x, fi, fo):
    n = len(x); a = np.ones(n, np.float32)
    if fi: k = int(fi * SR); a[:k] = np.linspace(0, 1, k)
    if fo: k = int(fo * SR); a[-k:] = np.minimum(a[-k:], np.linspace(1, 0, k))
    return x * a[:, None]
m1 = fade(load(f'{MUS}/sneaky.mp3', 0.0, 44.6), 0.05, 1.0)
m2 = fade(load(f'{MUS}/heartbreaking.mp3', 0.0, DUR - 43.6), 0.8, 0.6)
music = np.zeros((N, 2), np.float32); music[:len(m1)] += m1; s2 = int(43.6 * SR); music[s2:s2 + len(m2)] += m2[:N - s2]
mL = lufs(music); g = db((vL - 20.0) - mL); music *= g; print('music LUFS', mL, '-> gain dB', round(20 * np.log10(g), 1))
# ---- SFX cue sheet: (time s, file, gain dB). Every file is a real recording (Kenney CC0 packs, Ninja Adventure CC0, pygame examples). ----
K = SFX + '/jra'; RPG = K + '/kenney-rpg-audio/audio/Audio'; IMP = K + '/kenney-impact-sounds/audio/Audio'; UI = K + '/kenney-interface-sounds/audio/Audio'
WO = K + '/kenney-foley-sounds/audio/Audio/Woosh'; WA = K + '/kenney-foley-sounds/audio/Audio/Water'; CA = K + '/kenney-casino-audio/audio/Audio'; NJ = K + '/ninja-adventure/2D/top-down-rpg/Audio/Sounds'
CUES = [
 (0.00, f'{WO}/woosh1.ogg', -3), (0.95, f'{RPG}/handleCoins.ogg', 0), (1.15, f'{UI}/pluck_001.ogg', -4), (1.74, f'{WO}/woosh3.ogg', -2), (2.22, f'{CA}/card-slide-3.ogg', 0),
 (2.48, f'{RPG}/doorOpen_1.ogg', -2), (2.6, f'{UI}/pluck_002.ogg', -3), (2.95, f'{IMP}/footstep_concrete_000.ogg', -4), (3.3, f'{IMP}/footstep_concrete_001.ogg', -4),
 (3.75, f'{WO}/woosh2.ogg', -4), (4.84, f'{IMP}/impactWood_heavy_000.ogg', 0), (5.0, f'{RPG}/bookPlace1.ogg', -1), (5.15, f'{RPG}/bookPlace2.ogg', -1), (5.3, f'{RPG}/bookPlace3.ogg', -2), (5.05, f'{WA}/drip1.ogg', -6),
 (5.66, f'{IMP}/impactWood_heavy_001.ogg', 0), (5.75, f'{CA}/card-slide-1.ogg', -2), (5.95, f'{CA}/card-slide-5.ogg', -2), (6.16, f'{IMP}/impactWood_heavy_002.ogg', -1), (6.3, f'{CA}/card-slide-7.ogg', -3),
 (6.62, f'{WO}/woosh4.ogg', -5), (6.95, f'{RPG}/bookFlip1.ogg', -3), (7.3, f'{WA}/drip2.ogg', -6), (7.88, f'{WO}/woosh5.ogg', -5), (8.15, f'{IMP}/impactPlate_light_000.ogg', -4), (8.92, f'{WA}/drip3.ogg', -6),
 (9.55, f'{WO}/woosh6.ogg', -5), (10.0, f'{UI}/switch_002.ogg', -3), (10.15, f'{UI}/switch_003.ogg', -3), (10.3, f'{UI}/switch_004.ogg', -3), (10.42, f'{UI}/pluck_001.ogg', -5),
 (11.28, f'{UI}/tick_002.ogg', 0), (11.32, f'{UI}/glass_001.ogg', -3), (11.9, f'{WO}/woosh7.ogg', -5), (12.0, f'{NJ}/Whoosh & Slash/Whoosh2.wav', -4), (13.2, f'{SFX}/pygame/car_door.wav', -2),
 (13.66, f'{RPG}/doorOpen_2.ogg', -2), (13.95, f'{IMP}/footstep_wood_000.ogg', -3), (14.1, f'{IMP}/footstep_wood_001.ogg', -3), (14.42, f'{UI}/maximize_003.ogg', -2),
 (15.0, f'{IMP}/impactSoft_medium_000.ogg', -2), (15.3, f'{RPG}/cloth1.ogg', -3), (15.55, f'{IMP}/impactSoft_medium_001.ogg', -2), (15.85, f'{IMP}/impactSoft_medium_002.ogg', -2), (16.1, f'{RPG}/cloth3.ogg', -3),
 (16.3, f'{UI}/scroll_001.ogg', -1), (16.55, f'{UI}/scroll_002.ogg', -1), (16.8, f'{UI}/scroll_003.ogg', -1), (17.15, f'{UI}/glass_003.ogg', -5),
 (18.2, f'{WO}/woosh8.ogg', -4), (18.6, f'{NJ}/Creature/Bird.wav', -8), (19.4, f'{UI}/question_001.ogg', -2), (20.45, f'{WO}/woosh1.ogg', -6),
 (21.48, f'{RPG}/handleCoins2.ogg', 0), (21.55, f'{UI}/confirmation_001.ogg', -4), (21.98, f'{WO}/woosh2.ogg', -6), (22.35, f'{IMP}/impactMetal_light_000.ogg', -4), (22.95, f'{IMP}/impactMetal_light_001.ogg', -4), (23.45, f'{UI}/question_002.ogg', -2),
 (24.05, f'{WO}/woosh3.ogg', -6), (24.62, f'{IMP}/impactPlate_light_001.ogg', -2), (25.12, f'{RPG}/knifeSlice.ogg', -1), (25.6, f'{UI}/drop_002.ogg', -3), (26.3, f'{IMP}/impactSoft_medium_003.ogg', -3), (26.52, f'{IMP}/impactSoft_heavy_000.ogg', -3),
 (27.43, f'{UI}/pluck_002.ogg', -1), (28.15, f'{UI}/question_003.ogg', -2), (28.95, f'{WO}/woosh4.ogg', -5), (29.3, f'{NJ}/Creature/Bird.wav', -8), (29.86, f'{UI}/maximize_005.ogg', -2),
 (30.75, f'{WO}/woosh5.ogg', -6), (31.9, f'{IMP}/impactWood_heavy_003.ogg', -2), (32.1, f'{IMP}/impactWood_heavy_004.ogg', -2), (32.3, f'{IMP}/impactWood_heavy_000.ogg', -3), (32.5, f'{RPG}/creak1.ogg', -1), (32.6, f'{UI}/question_004.ogg', -3),
 (32.95, f'{WO}/woosh6.ogg', -6), (33.7, f'{UI}/question_001.ogg', -4), (34.0, f'{RPG}/bookFlip2.ogg', -2), (34.6, f'{IMP}/impactSoft_heavy_001.ogg', 0),
 (35.0, f'{WO}/woosh7.ogg', -6), (35.6, f'{RPG}/metalClick.ogg', -4), (36.58, f'{UI}/pluck_001.ogg', -3), (37.26, f'{WO}/woosh8.ogg', -5), (37.55, f'{IMP}/footstep_concrete_002.ogg', -5), (37.9, f'{IMP}/footstep_concrete_003.ogg', -5),
 (38.47, f'{SFX}/pygame/car_door.wav', -2), (38.65, f'{NJ}/Whoosh & Slash/Whoosh.wav', -3), (39.25, f'{WO}/woosh1.ogg', -6), (39.5, f'{UI}/select_002.ogg', -3),
 (40.25, f'{WO}/woosh2.ogg', -5), (41.7, f'{IMP}/impactWood_light_000.ogg', -5), (42.96, f'{UI}/glitch_001.ogg', -3), (43.38, f'{UI}/glitch_003.ogg', -4),
 (44.62, f'{WO}/woosh3.ogg', -7), (46.2, f'{IMP}/footstep_concrete_004.ogg', -7), (48.7, f'{UI}/glass_004.ogg', -6), (49.3, f'{WO}/woosh4.ogg', -7),
 (49.6, f'{UI}/tick_001.ogg', -4), (50.0, f'{UI}/tick_002.ogg', -4), (50.4, f'{UI}/tick_004.ogg', -4), (50.8, f'{UI}/tick_001.ogg', -4), (51.3, f'{WO}/woosh5.ogg', -7),
 (52.42, f'{CA}/chip-lay-1.ogg', -2), (52.76, f'{UI}/switch_006.ogg', -2), (53.25, f'{WA}/drip4.ogg', -6), (53.7, f'{WO}/woosh6.ogg', -7),
 (54.4, f'{CA}/card-slide-2.ogg', -3), (54.75, f'{CA}/card-slide-4.ogg', -3), (55.05, f'{CA}/card-slide-6.ogg', -3), (55.36, f'{IMP}/impactSoft_heavy_002.ogg', -1),
 (55.72, f'{IMP}/impactWood_medium_000.ogg', -2), (55.92, f'{IMP}/impactWood_medium_001.ogg', -2), (56.12, f'{IMP}/impactWood_medium_002.ogg', -2), (56.8, f'{WA}/drip1.ogg', -7), (57.05, f'{WA}/drip3.ogg', -7),
 (58.1, f'{WO}/woosh7.ogg', -8), (58.95, f'{IMP}/impactWood_light_001.ogg', -1), (60.62, f'{WO}/woosh8.ogg', -5),
 (61.9, f'{K}/kenney-foley-sounds/audio/Audio/Swords/swordSlide1.ogg', -6), (62.7, f'{RPG}/metalLatch.ogg', 0), (64.13, f'{IMP}/impactWood_medium_003.ogg', 0), (64.7, f'{K}/kenney-foley-sounds/audio/Audio/Swords/swordSlide2.ogg', -7), (65.6, f'{RPG}/metalClick.ogg', -2),
 (66.15, f'{WO}/woosh1.ogg', -4), (66.5, f'{UI}/tick_001.ogg', -5), (66.9, f'{UI}/tick_002.ogg', -5), (67.3, f'{UI}/tick_004.ogg', -5), (67.7, f'{UI}/tick_001.ogg', -5), (68.1, f'{UI}/tick_002.ogg', -5), (68.6, f'{UI}/confirmation_002.ogg', -4),
 (68.7, f'{CA}/card-fan-1.ogg', -2), (69.2, f'{CA}/card-fan-2.ogg', -2), (69.7, f'{WO}/woosh2.ogg', -4), (70.2, f'{CA}/cards-pack-open-1.ogg', -5),
]
BED = [(40.25, 43.6, f'{NJ}/Ambient/Rain.wav', -18), (68.3, DUR, f'{NJ}/Ambient/Wind.wav', -14)]
# keep the density near Ricks' ~8 hits per 10 s: drop the softest cues (gain <= -5 dB) except the story-critical ones
KEEP = {58.95, 11.32, 25.12, 62.7, 64.13, 42.96, 43.38, 56.8, 48.7}
CUES = [c for c in CUES if c[2] > -5 or c[0] in KEEP]
CUES = [c for c in CUES if not any(k in c[1] for k in ('bookPlace2', 'bookPlace3', 'card-slide-5', 'card-slide-7', 'switch_003', 'footstep_wood_001', 'scroll_002', 'cloth3', 'tick_004', 'card-slide-4', 'impactWood_medium_001', 'impactWood_heavy_000.ogg\', -3', 'question_004'))]
sfx = np.zeros((N, 2), np.float32); hits = 0
for t, path, gdb in CUES:
    x = load(path); pk = np.abs(x).max() or 1; x = x / pk * db(-15 + gdb)  # SFX peaks ~12 dB under the voice peaks
    i = int(t * SR); n = min(len(x), N - i)
    if n > 0: sfx[i:i + n] += x[:n]; hits += 1
for t0, t1, path, gdb in BED:
    x = load(path); reps = int(np.ceil((t1 - t0) * SR / len(x))) + 1; x = np.tile(x, (reps, 1))[: int((t1 - t0) * SR)]; x = fade(x, 0.4, 0.5)
    x = x / (np.sqrt((x ** 2).mean()) or 1) * db(gdb - 12); i = int(t0 * SR); sfx[i:i + len(x)] += x[: N - i]
print('sfx hits', hits, f'= {hits / DUR * 10:.1f} per 10 s')
# duck music + sfx slightly under words (keeps every word equally present)
env = np.abs(voice).max(1); k = int(0.05 * SR); env = np.convolve(env, np.ones(k) / k, 'same'); duck = 1 - 0.25 * np.clip(env / (env.max() * 0.3), 0, 1)
mix = voice + (music + sfx) * duck[:, None]
fin = np.ones(N, np.float32); fo = int(0.25 * SR); fin[-fo:] = np.linspace(1, 0, fo); mix *= fin[:, None]
raw = OUT.replace('.wav', '_raw.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', raw], input=mix.astype(np.float32).tobytes(), check=True)
p = subprocess.run(['ffmpeg', '-v', 'info', '-i', raw, '-af', 'loudnorm=I=-14:TP=-2:LRA=7:print_format=json', '-f', 'null', '-'], capture_output=True).stderr.decode()
js = json.loads(p[p.rindex('{'):p.rindex('}') + 1])
af = f"loudnorm=I=-14:TP=-2:LRA=7:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), OUT], check=True)
print('wrote', OUT)
