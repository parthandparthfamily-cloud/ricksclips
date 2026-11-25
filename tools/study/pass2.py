"""Second pass: colour/lighting, flashes, shake, depth of field, head count + head size (framing), caption geometry,
ending/loop, opening timing. Per video, sampled every frame at 90x160 (heads/captions every 3rd frame at 270x480)."""
import subprocess, numpy as np, cv2, glob, os, json
VIEWS = {"This_Shape_Saved_Roller_Coasters": 5.1, "The_Pink_Prison_Cell_Experiment": 7.5, "Why_Perfect_Railroads_Don_t_Work": 27,
 "Why_Sailors_Carried_Storm_Oil": 15, "How_a_Mirror_Rigged_a_Horse_Race": 5.3, "The_Town_Built_Around_a_Button": 3.7,
 "Why_the_Second_Draw_Always_Wins": 8.7, "He_Could_Spot_Winning_Tickets_Just_by_Looking": 6.2, "What_the_Grave_Bell_Really_Meant": 12,
 "Why_Cashiers_Keep_Winning_The_Lottery": 8, "The_Job_Nobody_Wants_in_Japan": 17, "The_Burglar_Who_Only_Moved_Furniture": 8.6,
 "The_Ancient_Jar_That_Warned_an_Empire": 32, "Levels_of_Pirate_Cannonballs": 9.2, "An_Unstoppable_Spear_vs_an_Unbreakable_Shield": 9.2,
 "The_Window_That_Breaks_Japans_Gambling_Law": 14, "The_Scientists_Insane_Time_Test": 6.3, "Why_Humans_Cant_Pick_Random_Numbers": 8.9,
 "Your_Brains_Secret_Idea_Zone": 14}
def frames(f, w, h, fps=None):
    vf = f"scale={w}:{h}:flags=area" + (f",fps={fps}" if fps else "")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-vf", vf, "-pix_fmt", "bgr24", "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
out = {}
files = sorted(glob.glob("/root/rstudy/v/*.mp4"))
for f in files:
    n = os.path.basename(f)[:-4]
    V = frames(f, 90, 160)
    hsv = np.array([cv2.cvtColor(x, cv2.COLOR_BGR2HSV) for x in V]).astype(np.float32)
    sat = hsv[..., 1].mean((1, 2)) / 255; val = hsv[..., 2].mean((1, 2)) / 255
    lum = V.astype(np.float32).mean(3); con = lum.std((1, 2)) / 255
    B, G, R = [V[..., i].astype(np.float32) for i in range(3)]
    rg = R - G; yb = 0.5 * (R + G) - B
    colorful = (np.sqrt(rg.std((1, 2)) ** 2 + yb.std((1, 2)) ** 2) + 0.3 * np.sqrt(rg.mean((1, 2)) ** 2 + yb.mean((1, 2)) ** 2))
    warm = (R.mean((1, 2)) - B.mean((1, 2))) / 255
    # flashes: brightness spike up >0.08 within 2 frames then back down within 6
    fl = [i for i in range(2, len(val) - 6) if val[i] - val[i - 2] > 0.08 and val[i] - val[i + 6] > 0.05]
    fl = [x for k, x in enumerate(fl) if k == 0 or x - fl[k - 1] > 8]
    # lighting shifts: big change in mean brightness/warmth over 1 s without a composition change is hard to isolate; report std over time
    # shake: high-frequency jitter in camera translation (from pass-1 motion data)
    m = f"/root/rstudy/m/{n}.npz"
    z = np.load(m); D = {k: z["data"][:, i] for i, k in enumerate(z["cols"])}
    tx, ty = D["tx"], D["ty"]; sm = lambda a: np.convolve(a, np.ones(7) / 7, "same")
    jit = np.hypot(tx - sm(tx), ty - sm(ty)); shake = jit > 0.6
    shake_ev = [i for i in range(1, len(shake)) if shake[i] and not shake[i - 1]]
    # camera speed profile: share of time in fast moves vs drift
    spd = np.hypot(tx, ty) + np.abs(D["scale"] - 1) * 90
    fast = float(np.mean(spd > 1.0)); drift = float(np.mean((spd > 0.08) & (spd <= 1.0)))
    # heads + DOF + captions at 270x480 every 3rd frame
    W = frames(f, 270, 480, fps=10)
    heads_n, head_sz, sharp_top, sharp_mid, cap_h, cap_y = [], [], [], [], [], []
    for x in W:
        g = cv2.cvtColor(x, cv2.COLOR_BGR2GRAY); h = cv2.cvtColor(x, cv2.COLOR_BGR2HSV)
        sharp_top.append(cv2.Laplacian(g[:120], cv2.CV_32F).var()); sharp_mid.append(cv2.Laplacian(g[160:280], cv2.CV_32F).var())
        white = ((h[..., 1] < 40) & (h[..., 2] > 200)).astype(np.uint8)
        capb = white[264:384]  # caption band ~55-80%
        rows = np.where(capb.mean(1) > 0.02)[0]
        if len(rows): cap_h.append(int(rows.max() - rows.min())); cap_y.append(264 + int((rows.max() + rows.min()) / 2))
        white[264:384] = 0
        k = cv2.morphologyEx(white, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        nlab, lab, st, cen = cv2.connectedComponentsWithStats(k)
        cnt = 0
        for j in range(1, nlab):
            x0, y0, w0, h0, a = st[j]
            if a < 60 or w0 < 8: continue
            asp = w0 / h0; fill = a / (w0 * h0)
            if 0.75 < asp < 1.6 and fill > 0.6:    # round-ish white blob = a head
                cnt += 1; head_sz.append(w0 / 270)
        heads_n.append(cnt)
    heads_n = np.array(heads_n); hs = np.array(head_sz) if head_sz else np.array([0])
    tj = f"/root/rstudy/t/{n}.json"
    first_word = last_gap = None
    if os.path.exists(tj):
        T = json.load(open(tj)); first_word = T["words"][0]["s"]; last_gap = round(len(V) / 30 - T["words"][-1]["e"], 2)
    loop = float(np.abs(V[0].astype(np.float32) - V[-1].astype(np.float32)).mean())
    out[n] = dict(views_M=VIEWS.get(n), sat=round(float(sat.mean()), 3), bright=round(float(val.mean()), 3), contrast=round(float(con.mean()), 3),
                  colorful=round(float(colorful.mean()), 1), warmth=round(float(warm.mean()), 3), bright_var_over_time=round(float(val.std()), 3),
                  flashes=len(fl), flash_times=[round(x / 30, 2) for x in fl], shake_events=len(shake_ev), shake_per_min=round(len(shake_ev) / (len(V) / 1800), 1),
                  fast_move_pct=round(100 * fast, 1), drift_pct=round(100 * drift, 1),
                  heads_mean=round(float(heads_n.mean()), 2), frames_0_heads_pct=round(100 * float(np.mean(heads_n == 0)), 1), frames_3plus_heads_pct=round(100 * float(np.mean(heads_n >= 3)), 1),
                  head_width_median_pct=round(100 * float(np.median(hs)), 1), head_width_p90_pct=round(100 * float(np.percentile(hs, 90)), 1),
                  dof_top_vs_mid=round(float(np.median(np.array(sharp_top) / (np.array(sharp_mid) + 1))), 2),
                  caption_y_px1920=int(np.median(cap_y) * 4) if cap_y else None, caption_h_px1920=int(np.median(cap_h) * 4) if cap_h else None,
                  first_word_s=first_word, end_after_last_word_s=last_gap, loop_first_last_diff=round(loop, 1))
    print(n[:30].ljust(30), {k: out[n][k] for k in ["views_M", "sat", "contrast", "colorful", "flashes", "shake_per_min", "fast_move_pct", "heads_mean", "frames_0_heads_pct", "head_width_median_pct", "dof_top_vs_mid", "end_after_last_word_s"]}, flush=True)
json.dump(out, open("/root/rstudy/pass2.json", "w"), indent=1)
