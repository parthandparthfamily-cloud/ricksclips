"""Mix for "Why Grandmas in Japan Want to Go to Prison".
Voice (one take, compressed ~3:1) + real music (2 cues, mood shift at "Prison.") ~20 dB under the voice
+ real CC0 SFX (wyzowl/sfx-kit) locked to on-screen actions, peaks ~12 dB under the voice. Master -14 LUFS, -2 dBTP.
Usage: python3 mix.py <voiceover.mp3> <out.wav>
"""
import sys, subprocess, json, numpy as np, soundfile as sf, pyloudnorm as pyln

SR = 48000; DUR = 1960 / 30; N = int(round(DUR * SR))
SFXDIR = '/home/user/sounds/sfx-kit/'
MUSIC1 = '/home/user/sounds/mcmusic-kevin-macleod/music/sneaky_snitch.mp3'      # Kevin MacLeod, CC BY 3.0
MUSIC2 = '/home/user/sounds/aeris-cc0-music/tracks/old-photos-outlands.mp3'   # AERIS, CC0
meter = pyln.Meter(SR)

def load(path, ch=2, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path] + (['-af', af] if af else []) + ['-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).copy()
    return x.reshape(-1, ch)

def db(x): return 20 * np.log10(max(x, 1e-9))
def place(buf, sig, t0):
    i = int(round(t0 * SR));
    if i < 0: sig = sig[-i:]; i = 0
    j = min(len(buf), i + len(sig));
    if j > i: buf[i:j] += sig[: j - i]

# ---- voice: light high-pass + 3:1 compression, mono -> stereo, padded to the video length ----
voice = load(sys.argv[1], 1, 'highpass=f=70,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=2')[:, 0]
v = np.zeros(N, np.float32); v[:min(N, len(voice))] = voice[:N]
Lv = meter.integrated_loudness(np.stack([v, v], 1)); vpk = db(np.abs(v).max())
print(f'voice {Lv:.1f} LUFS, peak {vpk:.1f} dBFS')

# ---- music: cue 1 (sneaky pizzicato) 0 -> 31.9 s, cue 2 (warm nostalgic lofi) from "Prison." to the end ----
def bed(path, start_in, t0, t1, fade_in, fade_out):
    m = load(path); seg = m[int(start_in * SR): int(start_in * SR) + int((t1 - t0) * SR)].copy(); n = len(seg)
    env = np.ones(n, np.float32); fi, fo = int(fade_in * SR), int(fade_out * SR)
    if fi: env[:fi] = np.linspace(0, 1, fi) ** 2
    if fo: env[-fo:] *= np.linspace(1, 0, fo) ** 2
    out = np.zeros((N, 2), np.float32); i = int(t0 * SR); out[i:i + n] = seg * env[:, None]; return out
m1 = bed(MUSIC1, 0.0, 0.0, 32.25, 0.05, 0.7)
m2 = bed(MUSIC2, 0.0, 31.75, DUR, 1.2, 0.35)
def set_loud(x, target, t0, t1):
    seg = x[int(t0 * SR):int(t1 * SR)]; L = meter.integrated_loudness(seg); return x * 10 ** ((target - L) / 20)
m1 = set_loud(m1, Lv - 19.5, 0, 31.5); m2 = set_loud(m2, Lv - 19.0, 33, DUR - 0.5)
music = m1 + m2
# gentle duck under words (the bed still never goes silent)
env = np.abs(v); k = int(0.08 * SR); env = np.convolve(env, np.ones(k) / k, 'same'); duck = 1 - 0.25 * np.clip(env / (env.max() * 0.2), 0, 1)
music *= duck[:, None]

# ---- SFX cue table: (time the action happens in s, sound id, dB relative to "12 dB under the voice peak") ----
F = lambda fr: fr / 30
CUES = [
    (0.20, 'whoosh-medium-soft', -2), (F(49), 'pop-medium-in', 0), (F(66), 'tone-ding-high', -4),
    (F(89), 'props-shop-bell', -2), (F(104), 'move-spring', -1),
    (F(143), 'appear-poof', -1), (F(150), 'notification-failure-deflate', -5),
    (F(192), 'keyboard-typing-quick-long', -6), (F(249), 'writing-marker-tick', -2), (F(268), 'notification-failure-pluck', -2),
    (F(297), 'money-coin-stack', -1), (F(318), 'money-coin-spin', -2),
    (F(395), 'time-clock', -6),
    (F(442), 'whoosh-fast-medium', -2), (F(478), 'props-doorbell', -1),
    (F(521), 'foley-plastic-slide', -1), (F(542), 'shimmer-short-bright', -3), (F(580), 'money-register', -4),
    (F(592), 'notification-message-out-soft', -3), (F(615), 'pop-small-bubble', -2), (F(640), 'whoosh-fast-hard', -2), (F(655), 'impact-medium-hard', 0), (F(694), 'foley-fabric-slide', -1), (F(727), 'shimmer-short-sparkle', -2),
    (F(748), 'foley-paper-touch', 0), (F(801), 'whoosh-fast-hard', -1), (F(817), 'pop-medium-in', 0), (F(832), 'whoosh-fast-hard', -2), (F(840), 'pop-medium-in', 0), (F(862), 'whoosh-slow-soft', -3), (F(889), 'riser-2s-soft', -4), (F(949), 'cinematic-drum-big', 1), (F(952), 'celebration-confetti', -2),
    (F(1012), 'mechanical-slider-heavy', 0), (F(1026), 'cinematic-metal-big', -2), (F(1032), 'mechanical-lock-heavy', -1),
    (F(1063), 'foley-plastic-slide', 0), (F(1072), 'impact-light-firm', 0), (F(1106), 'notification-success-chime', -2),
    (F(1138), 'move-spring', -4), (F(1151), 'notification-success-pluck', -2),
    (F(1258), 'foley-paper-touch', 0), (F(1300), 'notification-success-sparkle', -2),
    (F(1340), 'appear-poof', -4), (F(1375), 'notification-message-in-soft', -4),
    (F(1405), 'whoosh-fast-medium', -3), (F(1446), 'tone-ding-high', -3),
    (F(1468), 'tone-step-1', -2), (F(1482), 'tone-step-3', -2), (F(1496), 'tone-step-5', -2),
    (F(1546), 'reverse-whoosh-medium-soft', -3), (F(1595), 'notification-failure-minor', -3),
    (F(1700), 'foley-fabric-touch', 0), (F(1715), 'notification-failure-low', -3),
    (F(1733), 'mechanical-latch-heavy', 0), (F(1770), 'mechanical-slider-heavy', -1), (F(1890), 'notification-failure-wobble', -3),
    (F(1913), 'mechanical-latch-light', 0), (F(1919), 'boom-hit-soft', -2), (F(1920), 'appear-burst', -1), (F(1948), 'props-doorbell', -8),
]
meta = {s['id']: s for s in json.load(open(SFXDIR + 'sounds.json'))['sounds']}
sfx = np.zeros((N, 2), np.float32); target_pk = vpk - 13.5
for t, sid, off in CUES:
    s = meta[sid]; x = load(SFXDIR + s['file']); pk = db(np.abs(x).max())
    place(sfx, x * 10 ** ((target_pk + off - pk) / 20), t - s['sync']['at'])
print(len(CUES), 'sfx hits =', round(len(CUES) / DUR * 10, 1), 'per 10 s')

mix = np.stack([v, v], 1) + music + sfx
L = meter.integrated_loudness(mix); mix *= 10 ** ((-14.0 - L) / 20)
fo = int(0.04 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
sf.write('mix_pre.wav', mix, SR, subtype='FLOAT')
# true-peak limit to -2 dBTP, then re-check loudness
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'mix_pre.wav', '-af', 'alimiter=limit=0.75:attack=2:release=60:level=false,aresample=48000', '-c:a', 'pcm_s16le', sys.argv[2]], check=True)
o, _ = sf.read(sys.argv[2]); print(f'master {meter.integrated_loudness(o):.2f} LUFS, sample peak {db(np.abs(o).max()):.2f} dBFS, {len(o)/SR:.2f} s')
bedL = meter.integrated_loudness((music + sfx)); print(f'bed (music+sfx) under voice: {Lv - bedL:.1f} dB; music alone: {Lv - meter.integrated_loudness(music):.1f} dB')
