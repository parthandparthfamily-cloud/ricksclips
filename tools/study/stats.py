import numpy as np, json, glob, os
FPS = 30
out = {}
def load(path):
    z = np.load(path); d = z["data"]; c = list(z["cols"]); return {k: d[:, i] for i, k in enumerate(c)}, z["heat"]
for p in sorted(glob.glob("/root/rstudy/m/*.npz")):
    n = os.path.basename(p)[:-4]; D, heat = load(p); N = len(D["diff"])
    diff = D["diff"]; med = np.array([np.median(diff[max(0, i - 15):i + 15]) for i in range(N)])
    cut = (diff > 18) & (diff > 4 * med + 4) & (D["inlier"] < 0.6)
    cut_idx = np.where(cut)[0]
    # merge cuts within 3 frames (flash frames)
    ci = [c for k, c in enumerate(cut_idx) if k == 0 or c - cut_idx[k - 1] > 3]
    ok = ~cut
    for c in ci: ok[max(0, c - 1):c + 3] = False
    gm = D["glob_mag"]; zoom = np.abs(D["scale"] - 1) * 90  # ~ px displacement at edge
    cam = np.maximum(gm, zoom)
    local = D["moving_frac"]
    cam_on = cam > 0.08
    loc_on = local > 0.01
    dead = ok & ~cam_on & ~loc_on
    # longest dead run
    runs, r = [], 0
    for v in dead:
        r = r + 1 if v else 0; runs.append(r)
    # camera constant-velocity linear segments: velocity >0.08 and smooth (low change) for >= 1 s
    vx, vy = D["tx"], D["ty"]
    vel = np.hypot(vx, vy) + zoom
    lin = np.zeros(N, bool)
    for i in range(N - FPS):
        w = slice(i, i + FPS)
        if ok[w].all() and vel[w].min() > 0.08 and vel[w].std() / (vel[w].mean() + 1e-6) < 0.15: lin[w] = True
    # camera direction reversals per min
    sm = np.convolve(vx, np.ones(9) / 9, "same")
    sgn = np.sign(np.where(np.abs(sm) > 0.1, sm, 0)); nz = sgn[sgn != 0]
    rev = int(np.sum(nz[1:] != nz[:-1]))
    # local motion events (bursts): peaks of local motion derivative
    lm = np.convolve(local, np.ones(3) / 3, "same"); d1 = np.diff(lm, prepend=lm[0])
    bursts = np.where((d1 > 0.012) & ok)[0]; bursts = [b for k, b in enumerate(bursts) if k == 0 or b - bursts[k - 1] > 6]
    # zoom direction
    zin = float(np.mean((D["scale"] > 1.0008) & ok)); zout = float(np.mean((D["scale"] < 0.9992) & ok))
    roll = float(np.mean((np.abs(D["rot"]) > 0.03) & ok))
    # words
    tj = f"/root/rstudy/t/{n}.json"; W = json.load(open(tj))["words"] if os.path.exists(tj) else []
    wf = np.array([int(w["s"] * FPS) for w in W]);
    # event-triggered local motion around word onsets
    eta = None
    if len(wf):
        win = range(-8, 16); acc = np.zeros(len(win)); cnt = 0
        for f in wf:
            if 8 <= f < N - 16 and ok[f - 8:f + 16].all(): acc += [local[f + k] for k in win]; cnt += 1
        eta = (acc / max(cnt, 1)).round(4).tolist()
    # cut alignment to word onsets
    cut_off = [int(min(wf - c, key=abs)) for c in ci] if len(wf) else []
    out[n] = dict(
        dur=round(N / FPS, 1), cuts=len(ci), cut_times=[round(c / FPS, 2) for c in ci],
        avg_shot_s=round(N / FPS / (len(ci) + 1), 2),
        cam_moving_pct=round(100 * float(np.mean(cam_on[ok])), 1),
        local_moving_pct=round(100 * float(np.mean(loc_on[ok])), 1),
        anything_moving_pct=round(100 * float(np.mean((cam_on | loc_on)[ok])), 1),
        dead_pct=round(100 * float(np.mean(dead[ok])), 2), longest_dead_s=round(max(runs) / FPS, 2),
        linear_cam_pct=round(100 * float(np.mean(lin)), 1),
        cam_reversals_per_min=round(rev / (N / FPS / 60), 1),
        local_bursts_per_s=round(len(bursts) / (N / FPS), 2),
        mean_moving_area_pct=round(100 * float(local[ok].mean()), 1),
        cam_speed_px_per_s_at1080=round(float(np.median(cam[ok & cam_on])) * 6 * FPS, 0),
        zoom_in_pct=round(100 * zin, 1), zoom_out_pct=round(100 * zout, 1), roll_pct=round(100 * roll, 1),
        region_moving_pct={k: round(100 * float(D[k][ok].mean()), 1) for k in ["top", "mid", "bot", "center", "sides"]},
        words=len(W), wps=round(len(W) / (N / FPS), 2), word_eta=eta, cut_to_word_offset_frames=cut_off,
    )
json.dump(out, open("/root/rstudy/stats.json", "w"), indent=1)
keys = ["dur", "cuts", "avg_shot_s", "cam_moving_pct", "local_moving_pct", "anything_moving_pct", "dead_pct", "longest_dead_s", "linear_cam_pct", "cam_reversals_per_min", "local_bursts_per_s", "mean_moving_area_pct", "cam_speed_px_per_s_at1080", "zoom_in_pct", "zoom_out_pct", "roll_pct", "wps"]
print("video".ljust(28), " ".join(k[:9].rjust(9) for k in keys))
for n, s in out.items(): print(n[:28].ljust(28), " ".join(str(s[k]).rjust(9) for k in keys))
