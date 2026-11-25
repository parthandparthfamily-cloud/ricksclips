import numpy as np, soundfile as sf, pyloudnorm as pyln, json, glob, os
from scipy.ndimage import median_filter
T = json.load(open('trans.json')); out = {}
for d in sorted(glob.glob('sep/htdemucs/*')):
    n = os.path.basename(d)
    v, sr = sf.read(f'{d}/vocals.wav'); b, _ = sf.read(f'{d}/no_vocals.wav')
    v = v.mean(1) if v.ndim > 1 else v; b = b.mean(1) if b.ndim > 1 else b
    m = pyln.Meter(sr); Lv = m.integrated_loudness(v); Lb = m.integrated_loudness(b)
    hop = int(0.01 * sr); fr = len(b) // hop
    rb = 20 * np.log10(np.sqrt(np.mean(b[:fr * hop].reshape(fr, hop) ** 2, 1)) + 1e-9)
    rv = 20 * np.log10(np.sqrt(np.mean(v[:fr * hop].reshape(fr, hop) ** 2, 1)) + 1e-9)
    bed = median_filter(rb, size=151)
    # SFX hit = bed track rises >=7 dB over its 1.5 s median, onset within 30 ms
    hits = []
    for i in range(3, fr):
        if rb[i] - bed[i] >= 7 and rb[i] - rb[i - 3] >= 5 and (not hits or i - hits[-1] > 20): hits.append(i)
    hits_t = np.array(hits) / 100
    # how loud are hits vs voice (peak 50ms after onset vs speech-active voice level)
    speech = rv > (np.percentile(rv, 95) - 20)
    vlev = float(np.median(rv[speech]))
    hit_lev = [float(rb[h:h + 5].max()) - vlev for h in hits]
    sc = np.array([e[0] for e in T[n]['events']]) if n in T else np.array([])
    near = float(np.mean([np.min(np.abs(hits_t - t)) < 0.25 for t in sc])) if len(sc) and len(hits_t) else 0
    W = json.load(open(f't/{n}.json'))['words']; gaps = np.array([W[k + 1]['s'] - W[k]['e'] for k in range(len(W) - 1)])
    out[n] = dict(voice_lufs=round(Lv, 1), bed_lufs=round(Lb, 1), bed_under_voice_db=round(Lv - Lb, 1),
                  sfx_hits=len(hits), sfx_per_10s=round(len(hits) / (len(b) / sr) * 10, 1), sfx_rel_voice_db_median=round(float(np.median(hit_lev)), 1) if hits else None,
                  scene_changes_with_sfx_pct=round(100 * near, 0), bed_silent_pct=round(100 * float(np.mean(rb < -50)), 1),
                  gaps_over_300ms=int((gaps > 0.3).sum()), max_gap_s=round(float(gaps.max()), 2), hit_times=hits_t.round(2).tolist())
    o = out[n]; print(n[:32].ljust(32), o['voice_lufs'], o['bed_lufs'], o['bed_under_voice_db'], o['sfx_hits'], o['sfx_per_10s'], o['sfx_rel_voice_db_median'], o['scene_changes_with_sfx_pct'], o['bed_silent_pct'], o['gaps_over_300ms'], o['max_gap_s'])
json.dump(out, open('aud.json', 'w'), indent=1)
