"""Mix for 'The Village Built For An Audience': voice (compressed) + music bed ~20 dB under + diegetic loudspeaker music + SFX cue table.
Run: python3 mix.py  -> ../Claude/mix.wav (and mix_report.txt)
Sources: music = Kevin MacLeod "Outfoxing the Fox" (CC BY 4.0, incompetech.com, via MDN webaudio-examples);
SFX = uisfx catalog (CC0-1.0, github.com/romainsimon/uisfx, via npm @wubbleai/community-sfx).
"""
import subprocess, json, numpy as np, os, io, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); PROJ = os.path.dirname(HERE)
SR = 48000; DUR = 2114 / 30
SFXD = '/tmp/claude-0/snd/community-sfx-0.1.0/package/catalog/sounds'

def load(path, af=None, ss=None, t=None):
    cmd = ['ffmpeg', '-v', 'error']
    if ss is not None: cmd += ['-ss', str(ss)]
    if t is not None: cmd += ['-t', str(t)]
    cmd += ['-i', path]
    if af: cmd += ['-af', af]
    cmd += ['-ac', '2', '-ar', str(SR), '-f', 'wav', '-']
    y, _ = sf.read(io.BytesIO(subprocess.run(cmd, capture_output=True, check=True).stdout), dtype='float32'); return y
def lufs(y):
    sf.write('/tmp/claude-0/_m.wav', y, SR)
    o = subprocess.run(['ffmpeg', '-v', 'info', '-i', '/tmp/claude-0/_m.wav', '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True).stderr
    for line in o.splitlines()[::-1]:
        if line.strip().startswith('I:'): return float(line.split()[1])
db = lambda x: 10 ** (x / 20)
N = int(DUR * SR); out = np.zeros((N, 2), np.float32)
def place(y, t, gain=1.0):
    i = int(t * SR); j = min(N, i + len(y))
    if i < N: out[i:j] += y[: j - i] * gain

# 1) voice: compress ~3:1 so every word is equally present
voice = load(os.path.join(PROJ, 'Raw/voiceover.mp3'), af='highpass=f=70,acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=4,alimiter=limit=0.95')
vL = lufs(voice); voice *= db(-17 - vL)
vpk = 20 * np.log10(np.abs(voice).max() + 1e-9)
V = np.zeros((N, 2), np.float32); V[: min(N, len(voice))] = voice[:N]

# 2) music bed: continuous, mood shift (darker, quieter) at "Then you start noticing things", back up for the ending
mus = load(os.path.join(HERE, 'outfoxing.mp3'), ss=0, t=DUR + 1)[:N]
dark = load(os.path.join(HERE, 'outfoxing.mp3'), af='lowpass=f=1500,volume=-3dB', ss=0, t=DUR + 1)[:N]
tt = np.arange(N) / SR
w = np.clip((tt - 26.8) / 0.6, 0, 1) * (1 - np.clip((tt - 63.7) / 0.6, 0, 1))
bed = mus * (1 - w[:, None]) + dark * w[:, None]
mL = lufs(bed); bed *= db(-17 - 20 - mL)          # ~20 dB under the voice
bed *= (1 + 0.25 * np.clip((tt - 63.9) / 1.0, 0, 1))[:, None]   # lift for the final spectacle
fade = np.clip(tt / 0.25, 0, 1) * np.clip((DUR - tt) / 0.35, 0, 1); bed *= fade[:, None]
out += bed

# 3) diegetic loudspeaker music (tinny, echoing across the fields)
def speaker(t0, t1, under):
    y = load(os.path.join(HERE, 'outfoxing.mp3'), af='highpass=f=500,lowpass=f=3200,aecho=0.8:0.6:180|320:0.35|0.2,acrusher=bits=10:mix=0.25', ss=40, t=t1 - t0)
    l = lufs(y); y *= db(-17 - under - l); n = len(y); e = np.ones(n); k = int(0.15 * SR); e[:k] = np.linspace(0, 1, k); e[-int(0.4 * SR):] = np.linspace(1, 0, int(0.4 * SR)); place(y * e[:, None], t0)
speaker(19.62, 21.6, 9); speaker(21.6, 25.3, 15); speaker(65.66, 68.4, 12)

# 4) SFX cue table (time s, file, dB relative to "SFX peak ~12 dB under the voice peak")
S = lambda c, n: f'{SFXD}/{c}/{n}.mp3'
CUES = [
  (0.20, S('mechanical', 'snap'), -3), (0.67, S('mechanical', 'snap'), -3), (1.13, S('mechanical', 'snap'), -3), 
  (0.55, S('cinematic', 'swipe'), -2), (0.98, S('cinematic', 'drop'), 0), (2.10, S('soft', 'swipe'), -6), (3.08, S('glass', 'error'), -1),
  (3.83, S('cinematic', 'swipe'), 0), (6.38, S('soft', 'select'), -3), (7.10, S('organic', 'snap'), -2),
  (8.55, S('rubber', 'press'), -2), (9.25, S('dreamy', 'open') if os.path.exists(S('dreamy', 'open')) else S('dreamy', 'reaction'), -2), 
  (11.30, S('cinematic', 'drop'), -4), 
  (12.85, S('glass', 'success'), -3), (13.50, S('cinematic', 'swipe'), -3), (14.85, S('soft', 'notification'), -4), (15.42, S('soft', 'notification'), -3),
  (16.60, S('mechanical', 'toggle-on'), -5), (17.35, S('mechanical', 'toggle-on'), -5), 
  (19.12, S('cinematic', 'swipe'), -3), (19.62, S('cinematic', 'start'), 0),
  (20.70, S('cinematic', 'swipe'), -2), (21.35, S('rubber', 'error'), -1), 
  (23.80, S('cinematic', 'swipe'), -5), (24.20, S('rubber', 'select'), -3),
  (25.45, S('dreamy', 'reaction'), -3), (27.35, S('soft', 'focus') if os.path.exists(S('soft', 'focus')) else S('soft', 'select'), -4),
  (29.40, S('mechanical', 'press'), -3), (29.70, S('mechanical', 'toggle-on'), 0), 
  (30.70, S('cinematic', 'swipe'), -1), (32.35, S('organic', 'press'), -5),
  (33.05, S('rubber', 'drop'), -3), 
  (35.95, S('organic', 'swipe'), -4), (36.95, S('organic', 'swipe'), -4), (37.80, S('organic', 'press'), -5), 
  (38.70, S('scifi', 'scanning'), -4), (40.05, S('cinematic', 'swipe'), -1), (41.00, S('organic', 'swipe'), -4),
  (42.50, S('organic', 'snap'), -4), (43.20, S('mechanical', 'unlock'), -2), (43.55, S('cinematic', 'swipe'), -4),
  (44.45, S('cinematic', 'swipe'), -3), (45.70, S('dreamy', 'level-up'), -3), 
  (49.30, S('mechanical', 'press'), -3), (49.95, S('glass', 'success'), -2), (50.60, S('soft', 'swipe'), -5),
  (52.95, S('cinematic', 'scanning'), -6), (53.55, S('glass', 'success'), -3),
  (54.40, S('cinematic', 'swipe'), -4), (54.93, S('cinematic', 'drop'), -2), (55.33, S('cinematic', 'drop'), -2), (55.73, S('cinematic', 'drop'), 0),
  (58.00, S('organic', 'snap'), -4),
  (59.60, S('zen', 'reaction') if os.path.exists(S('zen', 'reaction')) else S('soft', 'reaction'), -4),
  (60.75, S('cinematic', 'swipe'), -4), (62.90, S('cinematic', 'swipe'), -3), (63.35, S('mechanical', 'snap'), -1),
  (65.66, S('mechanical', 'toggle-on'), 0), (65.70, S('cinematic', 'achievement'), -1),
  (66.95, S('cinematic', 'swipe'), -3), (68.30, S('cinematic', 'swipe'), -2), (69.20, S('cinematic', 'reward'), -1), (69.65, S('rubber', 'error'), -3),
]
sp = db(vpk - 12)
n_ok = 0
for t, path, rel in CUES:
    if not os.path.exists(path): print('missing', path); continue
    y = load(path); pk = np.abs(y).max() + 1e-9; place(y / pk * sp * db(rel), t); n_ok += 1
out += V
sf.write(os.path.join(HERE, 'premaster.wav'), out, SR)
# 5) master to -14 LUFS, true peak -2 dBTP (two-pass loudnorm)
pre = os.path.join(HERE, 'premaster.wav')
o = subprocess.run(['ffmpeg', '-v', 'info', '-i', pre, '-af', 'loudnorm=I=-14:TP=-2:LRA=7:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(o[o.rindex('{'):o.rindex('}') + 1])
dst = os.path.join(PROJ, 'Claude'); os.makedirs(dst, exist_ok=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', pre, '-af', f"loudnorm=I=-14:TP=-2:LRA=7:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000", '-t', f'{DUR:.3f}', os.path.join(dst, 'mix.wav')], check=True)
rep = f"voice {vL:.1f} -> -17 LUFS; bed {lufs(bed):.1f} LUFS (~{-17 - lufs(bed):.1f} dB under voice); SFX cues {n_ok} ({n_ok / DUR * 10:.1f} per 10 s); final {lufs(load(os.path.join(dst, 'mix.wav'))):.1f} LUFS"
print(rep); open(os.path.join(HERE, 'mix_report.txt'), 'w').write(rep + '\n')
