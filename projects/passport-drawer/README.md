# The Dream Job That Keeps Your Passport

81.9 s, 2458 frames @ 30 fps, 1080x1920. Voice: the provided voiceover (not trimmed; word timing from the provided script.json).
No music or SFX on this one (your call). The mix is the voice alone, compressed ~3:1 and mastered to -14 LUFS / -2 dBTP.

## Render in the cloud (no GPU needed)
Run `bash render_cloud.sh`: 4 headless workers render frames 0–2457 into `package/frames/` (resumable: run it again if it stops),
then it adds the face glow, burns in captions, muxes `mix.wav` and writes `Rendered/passport_drawer_vN.mp4` (never overwrites).
v1 was rendered this way: 1080x1920, 2458 frames, 81.93 s, -14.0 LUFS.

## Render on the PC
1. Copy `package/` to `<Projects>\PassportDrawer\Claude\` (keep `<Projects>\PassportDrawer\Raw` and `Rendered` beside it).
2. Double-click `RENDER.bat`. It installs Playwright once, renders frames 0–2457 on the GPU (Edge, falling back to Brave),
   then adds the face glow (screen 0.4), burns in the captions and muxes `mix.wav`.
3. Output: `Rendered\passport_drawer_v1.mp4`. If that file already exists, it writes `_v2`, `_v3`, … instead of overwriting.
   If the render stops part-way, run `RENDER.bat` again: it resumes from the frames already on disk.

## Files
- `web/`: engine (`main.js`), 3D kit + FX pool (`kit3d.js`), sets (`sets.js`), the shot plan (`story.js`), characters (`toon.js`, built by tools/build_toon.py)
- `work/words.json`: the provided word timestamps; `captions.ass`: one-word captions
- `TIMELINE.md`: the approved action timeline; `sheet/cast_sheet.jpg`: the approved cast
- `make_package.sh`: rebuilds `package/` after any edit to `web/`
- Checks (cloud): `node ../../tools/stills.mjs web stills/x "<frames>" "s=0.5"` renders stills; `?s=0.25` is the QA proxy resolution
