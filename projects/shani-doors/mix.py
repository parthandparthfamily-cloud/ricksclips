"""Audio mix for "The Village With No Doors".
voice (compressed ~3:1, timing untouched) + music bed ~20 dB under (mood switch at the twist) + real SFX cue table ~12 dB under.
Usage: python3 mix.py  -> work/mix.wav (48 kHz stereo, -14 LUFS, TP -2)
Music: Kevin MacLeod via FreePD (public domain / CC0): "Bollywood Groove", "Managing Mischief".
SFX: Meta Open Sound "oculus-audio-pack" (CC0), ion.sound (MIT) bell_ring, camera_flashing.
"""
import subprocess, numpy as np, json, os
SR = 48000; END = 73.5; N = int(END * SR)
here = os.path.dirname(os.path.abspath(__file__)); RAW = os.path.join(here, 'Raw'); SFX = os.path.join(RAW, 'sfx')

def load(path, start=0.0, dur=None, filt=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start)] + (['-t', str(dur)] if dur else []) + ['-i', path] + (['-af', filt] if filt else []) + ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
db = lambda x: 10 ** (x / 20)
def lufs(x):
    p = '/tmp/claude-0/_lufs.wav'; import soundfile as sf; sf.write(p, x, SR)
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float([l for l in out.splitlines() if l.strip().startswith('I:')][-1].split()[1])

# ---- voice: gentle 3:1 compression, no trimming, no time-stretch ----
voice = load(os.path.join(RAW, 'voiceover.mp3'), filt='highpass=f=70,acompressor=threshold=-24dB:ratio=3:attack=8:release=120:makeup=6dB,alimiter=limit=0.89')
voice = np.pad(voice, ((0, max(0, N - len(voice))), (0, 0)))[:N]
vL = lufs(voice); voice *= db(-16 - vL); vpk = np.abs(voice).max()
mix = voice.copy()

# ---- music: Bollywood Groove -> (twist at 63.1 s) Managing Mischief ----
TW = 63.1
m1 = load(os.path.join(RAW, 'music', 'bollywood_groove.mp3'), 0, TW + 1.0)
m2 = load(os.path.join(RAW, 'music', 'managing_mischief.mp3'), 2.0, END - TW + 1.0)
bed = np.zeros((N, 2), np.float32)
a = m1[: min(len(m1), N)]; fade = np.ones(len(a)); i0 = int((TW - 0.5) * SR); fade[i0:] = np.linspace(1, 0, len(a) - i0).clip(0); bed[: len(a)] += a * fade[:, None]
s0 = int((TW - 0.4) * SR); b = m2[: N - s0]; fi = np.minimum(1, np.arange(len(b)) / (0.6 * SR)); bed[s0: s0 + len(b)] += b * fi[:, None] * db(4)  # 2nd cue is quieter at source
bed[-int(0.35 * SR):] *= np.linspace(1, 0, int(0.35 * SR))[:, None]
bed *= db(-16 - 20 - lufs(bed[: int(60 * SR)]))
# duck the bed a touch more while the voice talks
env = np.convolve(np.abs(voice[:, 0]), np.ones(4800) / 4800, 'same'); duck = 1 - 0.25 * np.clip(env / (env.max() * 0.3), 0, 1)
mix += bed * duck[:, None]

# ---- SFX cue table: (time s, file, gain dB rel. "-12 under voice peak", max dur) ----
C = [
 (0.02, 'WHSH_WhooshMedium_OS_01', 0, None), (0.85, 'FEETHmn_ShoeDirtRun_OS_01', -4, None), (1.40, 'SWSH_Swoosh_OS_01', -2, None), (2.20, 'UIMisc_BelltreeUp_OS_01', -3, None),
 (2.70, 'WHSH_WhooshSmall_OS_01', -2, None), (3.45, 'FEETHmn_ShoeDirtWalk_OS_01', -6, None), (3.92, 'MUSCStngr_BanjoHumorous_OS_01', -2, None), (4.15, 'FEETHmn_ShoeDirtRun_OS_02' if False else 'FEETHmn_ShoeDirtRun_OS_01', -5, None),
 (4.60, 'WHSH_WhooshMedium_OS_02', -1, None), (5.05, 'TOONBoing_BounceCartoony_OS_01', -3, None), (5.50, 'MUSCChim_WindChimes_LOOP_01', -8, 1.8), (6.45, 'WHSH_WhooshMedium_OS_03', -3, None),
 (7.80, 'SWSH_Swoosh_OS_02', -2, None), (8.50, 'UIClick_CasualPopsConfirm_OS_01', -4, None), (9.70, 'DOORKnck_OfficeDoorKnock_OS_01', -3, None), (10.38, 'WHSH_WhooshSmall_OS_02', -3, None),
 (10.95, 'SWSH_Swoosh_OS_03', -3, None), (11.60, 'UIMisc_BelltreeUp_OS_01', -5, None), (12.40, 'FEETHmn_ShoeDirtWalk_OS_02', -6, None), (12.98, 'TOONBoing_BounceCartoony_OS_02', -3, None),
 (13.40, 'OBJKey_KeyDrop_OS_01', -5, None), (15.45, 'VOXLaff_Male01Laugh_OS_01', -9, None), (16.25, 'WHSH_WhooshSmall_OS_03', -3, None), (16.82, 'METLImpt_MetalObjDrop_OS_01', -4, None),
 (17.30, 'WHSH_WhooshMedium_OS_01', -3, None), (17.40, 'AMBForst_Night_LOOP_01', -12, 6.4), (19.05, 'FEETHmn_ShoeDirtWalk_OS_03', -4, None), (19.55, 'FEETHmn_ShoeDirtWalk_OS_01', -4, None),
 (20.00, 'TOONBoing_BounceCartoony_OS_03', -2, None), (20.05, 'MUSCStngr_BanjoHumorous_OS_02', -4, None), (21.30, 'CLOTHMvmt_ClothingMovement_OS_01', -2, None), (21.85, 'TOONBoing_BounceCartoony_OS_04', -8, None),
 (23.25, 'PAPRHndl_PaperCrumple_OS_01', -3, None), (23.60, 'UIClick_WoodConfirm_OS_01', -5, None), (24.05, 'WHSH_WhooshMedium_OS_02', -3, None), (24.30, 'UIData_CasualCountup_OS_01', -9, None),
 (26.22, 'SWSH_Swoosh_OS_04', -3, None), (26.30, 'WINDVege_LightWindTreesBirds_LOOP_01', -14, 5.6), (27.30, 'FEETHmn_ShoeDirtWalk_OS_02', -7, None), (28.15, 'UIClick_CasualPopsConfirm_OS_01', -5, None),
 (29.00, 'WHSH_WhooshSmall_OS_01', -4, None), (29.20, 'TOONBoing_BounceCartoony_OS_01', -3, None), (29.40, 'FEETHmn_ShoeDirtRun_OS_01', -5, None), (30.33, 'UIClick_WoodConfirm_OS_01', -4, None),
 (30.85, 'FEETHmn_ShoeDirtRun_OS_01', -5, None), (31.90, 'WHSH_WhooshMedium_OS_03', -1, None), (32.95, 'DOORWood_FrontDoorOpen_OS_01', -5, None), (33.50, 'OBJCoin_CoinDrop_OS_01', -8, None),
 (34.15, 'WHSH_WhooshMedium_OS_01', -2, None), (35.00, 'MUSCChim_WindChimes_LOOP_01', -9, 2.0), (36.05, 'UIMisc_BelltreeDown_OS_01', -4, None), (37.70, 'UIMisc_BelltreeUp_OS_01', -5, None),
 (38.40, 'SWSH_Swoosh_OS_05', -4, None), (39.65, 'WHSH_WhooshSmall_OS_02', -4, None), (40.80, 'bell_ring', -5, None), (42.30, 'bell_ring', -10, None),
 (43.10, 'WHSH_WhooshMedium_OS_02', -2, None), (43.60, 'FEETHmn_ShoeDirtWalk_OS_03', -6, None), (44.50, 'SWSH_Swoosh_OS_06', -3, None), (45.20, 'UIClick_CasualPopsConfirm_OS_01', -5, None),
 (45.90, 'DSGNImpt_ImpactCreepyReverb_OS_01', -2, None), (46.40, 'DSGNDron_DroneCreepy_OS_01', -10, 2.0), (47.48, 'TOONBoing_BounceCartoony_OS_02', -2, None), (47.55, 'UIMisc_BelltreeDown_OS_01', -7, None),
 (47.80, 'OBJCoin_CoinDrop_OS_01', -3, None), (48.00, 'OBJCoin_CoinsUI_LOOP_01', -8, 1.2), (48.55, 'TOONBoing_BounceCartoony_OS_03', -3, None), (49.30, 'MUSCStngr_LossMallet_OS_01', -4, None),
 (50.00, 'TOONBoing_BounceCartoony_OS_04', -3, None), (50.20, 'WOODImpt_LargeWoodDrop_OS_01', -6, None), (50.90, 'WHSH_WhooshMedium_OS_03', -3, None), (51.50, 'UIClick_WoodConfirm_OS_01', -3, None),
 (53.00, 'UIClick_WoodConfirm_OS_01', -3, None), (53.75, 'WHSH_WhooshSmall_OS_03', -4, None), (54.00, 'AMBForst_Night_LOOP_01', -13, 3.4), (55.90, 'MUSCStngr_VictoryMallet_OS_01', -6, None),
 (57.25, 'WHSH_WhooshMedium_OS_01', -2, None), (57.50, 'CRWDConv_Restaurant_LOOP_01', -12, 5.6), (58.20, 'FEETHmn_ShoeDirtWalk_OS_01', -7, None), (60.25, 'SWSH_Swoosh_OS_01', -4, None),
 (62.20, 'camera_flashing', -4, None), (63.10, 'SWSH_Swoosh_OS_05', -1, None), (63.65, 'PAPRHndl_PaperCrumple_OS_01', -5, None), (64.80, 'MUSCStngr_LossOrchestral_OS_01', -4, None),
 (65.90, 'WHSH_WhooshMedium_OS_02', -3, None), (66.15, 'CLOTHMvmt_ClothingMovement_OS_01', -2, None), (66.40, 'FEETHmn_ShoeDirtRun_OS_01', -4, None), (67.40, 'SWSH_Swoosh_OS_02', -3, None),
 (67.70, 'METLImpt_HammerAnvil_OS_01', -5, None), (68.20, 'WOODImpt_LargeWoodDrop_OS_01', -6, None), (68.72, 'TOONBoing_BounceCartoony_OS_01', -3, None), (69.05, 'UIMisc_BelltreeUp_OS_01', -5, None),
 (69.65, 'FEETHmn_ShoeDirtWalk_OS_02', -6, None), (70.25, 'FEETHmn_ShoeDirtWalk_OS_03', -6, None), (70.70, 'SWSH_Swoosh_OS_03', -4, None), (71.10, 'UIMisc_BelltreeUp_OS_01', -4, None),
 (72.85, 'DOORWood_FrontDoorClose_OS_01', 1, None), (73.02, 'MECHLock_DoorLockKey_OS_01', -2, None),
]
target_pk = vpk * db(-12)
log = []
for t, name, g, dur in C:
    f = os.path.join(SFX, name + ('.mp3' if name in ('bell_ring', 'camera_flashing') else '.ogg'))
    x = load(f, 0, dur)
    if dur: n_f = min(len(x), int(0.25 * SR)); x[-n_f:] *= np.linspace(1, 0, n_f)[:, None]; x[:int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))[:, None]
    pk = np.abs(x).max() or 1; x = x / pk * target_pk * db(g)
    i = int(t * SR); j = min(N, i + len(x));
    if i < N: mix[i:j] += x[: j - i]
    log.append((t, name))
mix[-int(0.12 * SR):] *= np.linspace(1, 0, int(0.12 * SR))[:, None]
import soundfile as sf
tmp = os.path.join(here, 'work', 'mix_pre.wav'); sf.write(tmp, mix, SR, subtype='FLOAT')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-2:LRA=7:linear=true,aresample=48000', '-ar', '48000', os.path.join(here, 'work', 'mix.wav')], check=True)
print(f'voice {vL:.1f} LUFS -> -16 ; {len(C)} SFX cues ({len(C) / END * 10:.1f} per 10 s); bed {lufs(bed[:int(60*SR)]):.1f} LUFS; wrote work/mix.wav')
json.dump(log, open(os.path.join(here, 'work', 'sfx_cues.json'), 'w'))
