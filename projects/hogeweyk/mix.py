"""Hogeweyk mix: compressed voice + 2 music cues (~20 dB under) + SFX cue table (~-12 dB peaks) + ambience beds -> mix.wav (-14 LUFS, -2 dBTP).
Usage: python3 mix.py <voice.mp3> <sfx_dir> <music_dir> <out.wav>
SFX: Oculus Audio Pack 01 (CC BY 4.0). Music: "Day in the Park" by SterlingRay, "White Limestone (piano)" by Bobjt (both CC0, OpenGameArt).
"""
import sys, subprocess, json, numpy as np
voice_p, sfx_dir, mus_dir, out = sys.argv[1:5]
SR = 48000; FPS = 30; TOTAL = 2294; N = int(TOTAL / FPS * SR)

def load(p, extra=[]):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, *extra, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def db(x): return 10 ** (x / 20)
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)

# voice: ~3:1 compression, gentle limiter
voice = load(voice_p, ['-af', 'highpass=f=70,acompressor=threshold=-24dB:ratio=3:attack=5:release=90:makeup=4dB,alimiter=limit=0.89'])
V = np.zeros(N, np.float32); V[:min(N, len(voice))] = voice[:N]
vact = V[np.abs(V) > 0.02]; v_rms = rms_db(vact) if len(vact) else -20; v_peak = 20 * np.log10(np.percentile(np.abs(V), 99.9) + 1e-9)
print('voice rms(active) dB', round(v_rms, 1), 'peak99.9', round(v_peak, 1))

mix = V.copy()
def place(buf, x, t0, gain, fade_in=0.005, fade_out=0.02, maxlen=None):
    if maxlen: x = x[:int(maxlen * SR)]
    x = x.copy(); fi = max(1, int(fade_in * SR)); fo = max(1, int(fade_out * SR))
    x[:fi] *= np.linspace(0, 1, fi)[:len(x[:fi])]; x[-fo:] *= np.linspace(1, 0, fo)[-len(x[-fo:]):]
    a = int(t0 * SR); b = min(N, a + len(x))
    if b > a: buf[a:b] += x[:b - a] * gain

# ---- music: cue A playful (0-44 s), cue B tender piano (43.5 s - end) ----
M = np.zeros(N, np.float32)
A = load(f'{mus_dir}/park.mp3'); B = load(f'{mus_dir}/limestone_piano.mp3')
def norm_rms(x, target): return x * db(target - rms_db(x[np.abs(x) > 1e-3]))
music_target = v_rms - 20.5
A = norm_rms(A, music_target); B = norm_rms(B, music_target)
place(M, A[:int(45.0 * SR)], 0.0, 1.0, fade_in=0.05, fade_out=1.6)
place(M, B, 43.4, 1.0, fade_in=1.4, fade_out=0.3)
mix += M

# ---- ambience beds (quiet, real recordings) ----
AMB = np.zeros(N, np.float32)
def bed(name, t0, t1, rel, maxlen=None):
    x = load(f'{sfx_dir}/{name}.ogg'); x = norm_rms(x, v_rms + rel)
    L = int((t1 - t0) * SR); reps = int(np.ceil(L / len(x))) + 1; y = np.tile(x, reps)[:L]
    place(AMB, y, t0, 1.0, fade_in=0.25, fade_out=0.3)
F = lambda f: f / FPS
for a, b in [(0, 200), (450, 590), (655, 720), (848, 1110), (1305, 1597), (1690, 1900), (1987, 2066), (2100, 2294)]:
    bed('AMBUrbn_CityEuroDaytime_LOOP_01', F(a), F(b), -30); bed('WATRFlow_CreekInWoods_LOOP_01', F(a), F(b), -33)
for a, b in [(200, 450), (590, 655), (720, 848), (1110, 1305), (1597, 1690), (2066, 2100)]: bed('AMBHome_RoomTone_LOOP_01', F(a), F(b), -32)
bed('CRWDConv_Restaurant_LOOP_01', F(655), F(720), -28)
bed('WINDVege_WindTreesBirdsFlies_LOOP_01', F(1305), F(1470), -24)
bed('VEHCar_CarEngineHigh_LOOP_01', F(1900), F(1990), -22); bed('AMBUrbn_CityAmerican_LOOP_01', F(1900), F(1990), -22)
bed('MUSCChim_WindChimes_LOOP_01', F(935), F(990), -27)
mix += AMB

# ---- SFX cue table: (frame, file, dB relative to "voice peak - 12 dB", maxlen s) ----
CUES = [
 (6, 'UIClick_WoodClose_OS_01', 1), (9, 'UIMisc_BelltreeUp_OS_01', -6, 1.4), (30, 'WHSH_WhooshMedium_OS_01', -1), (55, 'WHSH_WhooshMedium_OS_02', -1), (58, 'TOONBoing_BounceCartoony_OS_01', -3),
 (82, 'WHSH_WhooshSmall_OS_01', -2), (86, 'UIClick_MetalClose_OS_01', -4), (95, 'UIClick_MetalBack_OS_01', -5), (106, 'SWSH_Swoosh_OS_01', -2), (110, 'CERMImpt_CeramicSmallImpact_OS_01', -5),
 (138, 'MECHSwtch_SwitchSmallOn_OS_01', -1), (141, 'MUSCStngr_VictoryMallet_OS_01', -4), (162, 'WHSH_WhooshMedium_OS_03', -2), (172, 'CLOTHMvmt_ClothingMovement_OS_01', -6),
 (219, 'TOONBoing_BounceCartoony_OS_02', -3), (264, 'UIClick_CasualPopsConfirm_OS_01', -6), (284, 'UIClick_CasualPopsConfirm_OS_01', -6),
 (300, 'SWSH_Swoosh_OS_01', -4), (306, 'DOORWood_FrontDoorOpen_OS_01', -2), (342, 'UIClick_CasualPopsConfirm_OS_01', -5), (398, 'UIMisc_BelltreeUp_OS_01', -9, 1.5),
 (412, 'CLOTHMvmt_ClothingMovement_OS_02', -2), (418, 'MUSCStngr_AcousticGuitarPositive_OS_01', -6), 
 (452, 'WHSH_WhooshSmall_OS_02', -4), (495, 'WHSH_WhooshMedium_OS_01', -3), (522, 'SWSH_Swoosh_OS_02', -4), (566, 'WHSH_WhooshMedium_OS_02', -4),
 (592, 'MOTRSrvo_Servo_OS_01', -7, 1.2), (612, 'TOONBoing_BounceCartoony_OS_01', -5), (630, 'OBJBook_BookOpen_OS_01', -2), (642, 'UIClick_MetalClose_OS_01', -5), (654, 'UIClick_MetalClose_OS_01', -6),
 (657, 'SWSH_Swoosh_OS_01', -3), (684, 'UIClick_CasualPopsConfirm_OS_01', -5), (690, 'CERMImpt_CeramicSmallImpact_OS_01', -3), (693, 'FOODTware_SpoonDrop_OS_01', -6), (703, 'UIMisc_BelltreeUp_OS_01', -9, 1.2),
 (720, 'WHSH_WhooshSmall_OS_02', -4), (746, 'PLASImpt_PlasticObjDrop_OS_01', -7), (762, 'PLASImpt_PlasticObjDrop_OS_01', -7), 
 (788, 'UIClick_ScifiHightechConfirm_OS_01', -3), (796, 'UIClick_ScifiHightechConfirm_OS_01', -5), (818, 'UIMisc_BelltreeUp_OS_01', -9, 1.3), (826, 'DOORSlid_SlidingDoorOpen_OS_01', -4),
 (854, 'UIClick_CasualPopsConfirm_OS_01', -6), (870, 'MUSCStngr_BanjoHumorous_OS_01', -4), (886, 'UIClick_CasualPopsConfirm_OS_01', -5), (900, 'VEGELeaf_MovementThroughBushes_OS_01', -5, 1.6),
 (936, 'WHSH_WhooshMedium_OS_03', -3), (942, 'UIMisc_BelltreeUp_OS_01', -4, 2.5), (958, 'MUSCStngr_VictoryPiano_OS_01', -7), 
 (1004, 'MUSCStngr_AcousticGuitarNegative_OS_01', -5), (1008, 'WHSH_WhooshSmall_OS_01', -4), (1012, 'CLOCKTick_ClockCreepy_OS_01', -5, 2.0), (1032, 'WHSH_WhooshMedium_OS_01', -4),
 (1060, 'WHSH_WhooshSmall_OS_02', -4), (1086, 'MUSCStngr_LossMallet_OS_01', -4), 
 (1108, 'WHSH_WhooshSmall_OS_01', -4), (1112, 'UIClick_ScifiTraditionalOpen_OS_01', -5), (1138, 'SWSH_Swoosh_OS_01', -4), 
 (1200, 'PAPRHndl_BookPageTurns_OS_01', -1, 1.5), (1220, 'PAPRHndl_BookPageTurns_OS_01', -3, 1.2), (1252, 'UIClick_CasualPopsConfirm_OS_01', -5), (1262, 'MUSCStngr_LossPiano_OS_01', -7), 
 (1303, 'WHSH_WhooshMedium_OS_02', -4), (1334, 'CLOTHMvmt_ClothingMovement_OS_01', -3), (1336, 'VEGELeaf_MovementThroughBushes_OS_01', -8, 1.5), 
 (1390, 'UIAlert_WoodError_OS_01', -3), (1395, 'FGHTImpt_PunchRegular_OS_01', -7), (1403, 'UIAlert_MetalError_OS_01', -7), 
 (1440, 'UIClick_MetalBack_OS_01', -6), (1484, 'OBJBag_CanvasCaseDrop_OS_01', -8), (1503, 'UIMisc_BelltreeUp_OS_01', -6, 2.0), (1525, 'MAGSpel_MagicSpell_OS_01', -5),
 (1563, 'MUSCStngr_AcousticGuitarPositive_OS_01', -7), 
 (1603, 'TOONBoing_BounceCartoony_OS_02', -5), (1625, 'UIClick_CasualPopsConfirm_OS_01', -6), 
 (1664, 'WHSH_WhooshSmall_OS_02', -5), (1668, 'PAPRHndl_BookPageTurns_OS_01', -7, 1.0), (1678, 'UIMisc_BelltreeUp_OS_01', -9, 1.4),
 (1694, 'WHSH_WhooshMedium_OS_01', -2), (1708, 'MUSCStngr_LevelUpOrchestral_OS_01', -3), (1744, 'WHSH_WhooshMedium_OS_02', -4),
 (1794, 'SWSH_Swoosh_OS_01', -3), (1800, 'UIClick_CasualPopsConfirm_OS_01', -4), (1819, 'SWSH_Swoosh_OS_02', -3), (1826, 'UIClick_CasualPopsConfirm_OS_01', -4), (1843, 'SWSH_Swoosh_OS_01', -3), (1850, 'UIClick_CasualPopsConfirm_OS_01', -4),
 (1866, 'WHSH_WhooshMedium_OS_03', -3), (1872, 'MUSCStngr_VictoryMallet_OS_01', -5),
 (1898, 'WHSH_WhooshMedium_OS_01', -3), (1906, 'WHSH_WhooshMedium_OS_02', -4), (1931, 'WHSH_WhooshMedium_OS_01', -4), 
 (1952, 'UIAlert_MetalError_OS_01', -6), (1966, 'UIAlert_WoodError_OS_01', -7),
 (1988, 'WHSH_WhooshMedium_OS_03', -3), (1994, 'AMBForst_ForestBirds_OS_01', -7, 4.0), (2006, 'UIMisc_BelltreeUp_OS_01', -6, 2.0), (2048, 'TOONBoing_BounceCartoony_OS_01', -6),
 (2064, 'WHSH_WhooshSmall_OS_02', -5), (2074, 'UIClick_MetalClose_OS_01', -6), (2084, 'UIMisc_BelltreeUp_OS_01', -8, 1.5),
 (2098, 'SWSH_Swoosh_OS_02', -4), (2125, 'MUSCStngr_AcousticGuitarPositive_OS_01', -7),
 (2143, 'WHSH_WhooshSmall_OS_01', -4), (2150, 'UIClick_CasualPopsConfirm_OS_01', -6), (2178, 'UIClick_WoodClose_OS_01', -9), (2196, 'UIClick_WoodClose_OS_01', -9),
 (2209, 'MAGSpel_MagicSpell_OS_01', -5), (2241, 'UIClick_CasualPopsConfirm_OS_01', -4), (2250, 'UIMisc_BelltreeUp_OS_01', -6, 1.4),
 (2256, 'UIClick_CasualPopsConfirm_OS_01', -5), (2268, 'UIClick_CasualPopsConfirm_OS_01', -5), (2272, 'MUSCStngr_VictoryPiano_OS_01', -8),
]
for f0 in [202, 212, 222, 1598, 1608]: CUES.append((f0, 'UIAlert_Notification_OS_01', -7))  # alarm clock
for f0 in (2216, 2232): CUES.append((f0, 'UIClick_CasualPopsConfirm_OS_01', -12))
CUES = [c for c in CUES if not (c[2] <= -7 and not c[1].startswith(('MUSC', 'MAG', 'UIAlert_Notif', 'PAPR')))]
SX = np.zeros(N, np.float32); cache = {}
sfx_ref = v_peak - 12
for c in CUES:
    f0, name, rel = c[0], c[1], c[2]; ml = c[3] if len(c) > 3 else None
    if name not in cache: x = load(f'{sfx_dir}/{name}.ogg'); cache[name] = x / (np.max(np.abs(x)) + 1e-9)
    place(SX, cache[name], f0 / FPS, db(sfx_ref + rel), fade_out=0.05 if not ml else 0.25, maxlen=ml)
mix += SX
print('cues', len(CUES), 'per 10 s', round(len(CUES) / (TOTAL / FPS) * 10, 1))
# end 0.3 s after last word: short fade on the tail
fo = int(0.12 * SR); mix[-fo:] *= np.linspace(1, 0, fo)
tmp = out + '.pre.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_f32le', tmp], input=mix.astype(np.float32).tobytes(), check=True)
# two-pass loudnorm to -14 LUFS / -2 dBTP, stereo out
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-2:LRA=7:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = f"loudnorm=I=-14:TP=-2:LRA=7:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af + ',aresample=48000', '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
print('wrote', out)
