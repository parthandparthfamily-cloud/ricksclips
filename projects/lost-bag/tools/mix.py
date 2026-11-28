"""Mix for "Your Lost Bag Isn't Lost": voice (untouched timing, light 2:1 glue) + two real music cues (~20 dB under the voice,
switching at the twist "Except it isn't") + real CC0 SFX cue table (~8 hits / 10 s, peaks ~12 dB under the voice) -> -14 LUFS / -2 dBTP.
Usage: python3 tools/mix.py   (writes work/mix.wav)"""
import subprocess, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT); os.makedirs('work', exist_ok=True)
DUR = 1965 / 30
VOICE = 'raw/voiceover.mp3'

def peak(f):
    o = subprocess.run(['ffmpeg', '-nostats', '-i', f, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.search(r'max_volume: ([-\d.]+) dB', o).group(1))
def lufs(f, extra=''):
    o = subprocess.run(['ffmpeg', '-nostats', '-i', f, '-af', (extra + ',' if extra else '') + 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+([-\d.]+) LUFS', o)[-1])

VP = peak(VOICE); VL = lufs(VOICE)
SFX_PEAK = VP - 12.0        # SFX peak target (dBFS) at offset 0
BED_LUFS = VL - 26.0        # ambience beds
MUSIC_LUFS = VL - 20.0      # music bed
# (time s, file, offset dB, max length s)
CUES = [
 (0.00, 'soft-sheet-whoosh', -2, 1.2), (1.15, 'magic-chime-sparkle', 0, 1.6),
 (1.72, 'air-whoosh', -3, 1.2), (2.85, 'sale_coins', -6, 1.5),
 (5.05, 'soft-thud-impact', -1, 0.6), (5.63, 'tin-can-drop', -6, 0.8),
 (5.92, 'whip-whoosh-snap', -2, 0.7), (6.05, 'propeller-plane-pass', -9, 2.6),
 (7.38, 'door-open', -6, 1.2), (8.55, 'big-yawn', -7, 1.2),
 (11.27, 'cartoon-boing-short', -4, 0.8),
 (12.25, 'crickets-awkward-silence', -4, 1.3), (13.75, 'map-paper-rustle', -6, 1.4),
 (15.60, 'nose-sigh', -6, 0.9), (17.0, 'counter-bell-ding', -3, 1.0),
 (17.70, 'idea-ding', -3, 1.0), (19.05, 'pluck-pop', -4, 0.5),
 (20.45, 'boing-jump-short', -3, 0.7), (21.0, 'cartoon-boing', -5, 0.8),
 (21.95, 'coin-drop-clink', -5, 0.8), (22.55, 'toothbrush-suction-pop', -3, 0.5),
 (23.0, 'drop-pop', -3, 0.5), (23.33, 'squeaky-toy-squeeze', -4, 0.7),
 (24.45, 'page-turn', -3, 0.8),
 (26.25, 'book-page-flip', -3, 0.9), (27.55, 'cartoon-boing-short', -4, 0.7),
 (28.20, 'alarm-clock-ringing', -6, 0.6),
 (31.33, 'air-swipe-whoosh', -4, 0.8), (33.20, 'error-buzz', -5, 0.6),
 (34.02, 'wind-chime-sparkle', -2, 1.4), (36.10, 'success-chime', -3, 1.2),
 (37.50, 'book-page-flip', -3, 1.2),
 (39.62, 'message-received-tone', -1, 1.0), (40.28, 'paper-tear', -5, 0.8), (41.28, 'sale_cha-ching', -6, 1.2),
 (42.30, 'whip-whoosh-snap', -3, 0.6), (42.86, 'door-slam', -2, 0.8), (44.05, 'tired-sigh', -5, 1.3),
 (45.68, 'record-scratch-short', 0, 0.8), (45.95, 'mega-swoosh', -3, 1.3), (47.20, 'car-horn-short-beep', -8, 0.6),
 (49.0, 'air-whoosh', -4, 1.4),
 (51.30, 'shop-door-chime', -3, 1.3), (53.95, 'magic-chime-sparkle', -5, 1.0),
 (55.88, 'idea-ding', -3, 0.9),
 (56.78, 'sale_cash-register', -2, 1.3), (59.40, 'cartoon-boing', -6, 0.7),
 (60.30, 'metal-trash-can-lid', -5, 1.0), (61.07, 'error-buzz', -6, 0.5), (61.65, 'whip-whoosh-snap', -3, 0.6),
 (61.97, 'sale_cha-ching', -2, 1.2), (63.30, 'wind-chime-sparkle', -4, 1.2),
 (64.55, 'mega-swoosh', -4, 1.0), (64.85, 'success-chime', -3, 0.8),
 (65.10, 'crowd-cheer-yeah', -6, 0.4),
]
BEDS = [  # (start, end, file, offset dB)
 (1.70, 21.6, 'crowd-chatter-walla', 0), (12.2, 13.4, 'strong-wind', -4), (30.1, 32.6, 'fast-keyboard-typing', 2), (37.3, 45.6, 'strong-wind', -3),
 (46.6, 51.2, 'songbird-chirp', -2), (51.3, 57.6, 'crowd-chatter-walla', 0), (61.7, 65.5, 'crowd-chatter-walla', 0),
]
inputs, filt, labs = ['-i', VOICE], [], []
filt.append(f"[0:a]aresample=48000,aformat=channel_layouts=stereo,acompressor=threshold=-24dB:ratio=2:attack=8:release=90:makeup=1,apad=whole_dur={DUR}[v]")
# music: cue 1 (playful, until the twist), cue 2 (Alabama swing, after the record scratch)
m1, m2 = 'music/sergios-magic-dustbin.mp3', 'music/hillbilly-swing.mp3'
g1 = MUSIC_LUFS - lufs(m1); g2 = MUSIC_LUFS - lufs(m2)
inputs += ['-i', m1, '-i', m2]
filt.append(f"[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:45.75,afade=t=in:d=0.3,afade=t=out:st=45.55:d=0.2,volume={g1:.2f}dB[m1]")
filt.append(f"[2:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{DUR - 46.3 + 0.2:.2f},afade=t=in:d=0.25,afade=t=out:st={DUR - 46.3 - 0.5:.2f}:d=0.5,volume={g2 + 1:.2f}dB,adelay=46300|46300[m2]")
labs += ['[m1]', '[m2]']
n = 3
for i, (t, name, off, ln) in enumerate(CUES):
    f = f'sfx/{name}.mp3'; g = SFX_PEAK + off - peak(f)
    inputs += ['-i', f]; d = int(t * 1000)
    filt.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{ln},afade=t=out:st={max(0, ln - 0.15):.2f}:d=0.15,volume={g:.2f}dB,adelay={d}|{d}[s{i}]"); labs.append(f'[s{i}]'); n += 1
for i, (a, b, name, off) in enumerate(BEDS):
    f = f'sfx/{name}.mp3'; g = BED_LUFS + off - lufs(f)
    inputs += ['-stream_loop', '-1', '-i', f]; d = int(a * 1000)
    filt.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{b - a:.2f},afade=t=in:d=0.3,afade=t=out:st={b - a - 0.4:.2f}:d=0.4,volume={g:.2f}dB,adelay={d}|{d}[b{i}]"); labs.append(f'[b{i}]'); n += 1
filt.append(f"[v]{''.join(labs)}amix=inputs={len(labs) + 1}:normalize=0:duration=first,atrim=0:{DUR}[pre]")
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inputs, '-filter_complex', ';'.join(filt), '-map', '[pre]', '-c:a', 'pcm_s16le', 'work/premix.wav'], check=True)
# two-pass loudnorm to -14 LUFS / -2 dBTP
o = subprocess.run(['ffmpeg', '-nostats', '-i', 'work/premix.wav', '-af', 'loudnorm=I=-14:TP=-2:LRA=7:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
J = json.loads(o[o.rindex('{'):o.rindex('}') + 1])
lf = f"loudnorm=I=-14:TP=-2:LRA=7:measured_I={J['input_i']}:measured_TP={J['input_tp']}:measured_LRA={J['input_lra']}:measured_thresh={J['input_thresh']}:offset={J['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'work/premix.wav', '-af', lf + ',aresample=48000', '-c:a', 'pcm_s16le', 'work/mix.wav'], check=True)
print('voice', VL, 'LUFS peak', VP, '| music gains', round(g1, 1), round(g2, 1), '| cues', len(CUES), f'= {len(CUES) / DUR * 10:.1f} per 10 s')
print(subprocess.run(['ffmpeg', '-nostats', '-i', 'work/mix.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr[-420:])
