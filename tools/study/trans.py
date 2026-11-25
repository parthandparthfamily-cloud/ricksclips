import subprocess, numpy as np, glob, os, json
R = {}
for f in sorted(glob.glob('v/*.mp4')):
    n = os.path.basename(f)[:-4]
    raw = subprocess.run(['ffmpeg','-v','error','-i',f,'-vf','scale=36:64:flags=area','-pix_fmt','rgb24','-f','rawvideo','-'],capture_output=True).stdout
    V = np.frombuffer(raw, np.uint8).reshape(-1, 64, 36, 3).astype(np.float32)
    def hist(x): 
        h = [np.histogram(x[..., c], 16, (0, 256))[0] for c in range(3)]; return np.concatenate(h) / x[..., 0].size
    H = np.array([hist(v) for v in V])
    d1 = np.abs(H[1:] - H[:-1]).sum(1)            # frame-to-frame
    d8 = np.abs(H[8:] - H[:-8]).sum(1)            # over 8 frames
    # scene change = big change over 8 frames; cut if mostly in one frame, dissolve if spread
    ev = []; i = 0
    while i < len(d8):
        if d8[i] > 0.9:
            j = i
            while j < len(d8) and d8[j] > 0.9: j += 1
            seg = d1[i:j + 8]; peak = seg.max() / max(seg.sum(), 1e-6)
            ev.append((round((i + 4) / 30, 2), 'cut' if peak > 0.5 else 'dissolve/whip', j - i + 8)); i = j + 8
        else: i += 1
    # composition change rate: how different is frame t from t-30 (1 s ago) in pixels
    pd = np.abs(V[30:] - V[:-30]).mean((1, 2, 3))
    R[n] = dict(events=ev, n_cut=sum(e[1] == 'cut' for e in ev), n_soft=sum(e[1] != 'cut' for e in ev), comp_change_1s=round(float(np.median(pd)), 1))
    print(n[:34].ljust(34), R[n]['n_cut'], R[n]['n_soft'], R[n]['comp_change_1s'])
json.dump(R, open('trans.json', 'w'), indent=1)
