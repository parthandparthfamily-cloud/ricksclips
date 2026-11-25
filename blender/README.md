# Blender stage (steps 6-7): real 3D sets, rendered with EEVEE on your GPU

The browser engine plans every frame (camera path, where each character stands, which pose card it shows).
Blender builds the world from simple shapes with toon materials and an ink outline, drops the 2D character cards
into it, and renders frame by frame. Only the characters are 2D; everything else is real 3D.

## Files
- `parts/a_lib.py` render setup (EEVEE/Cycles/Workbench), toon + emission materials, ink outline, shape builders
- `parts/b_props.py` reusable props: rooms, lamps, desks, shelves, books, rounded boxes, a cartoon car
- `parts/c_fx.py` 3D FX pool: coins, bills, smoke puffs, sweat drops, shock rings, sparks, a fly
- `parts/d_sets_example.py` **your sets go here** (example: a town street and a study)
- `parts/e_cards_cam.py` lights, character cards, camera
- `parts/f_drive.py` per-frame driver: reads `data/frames.json`, shows the set, moves the camera, places cards, renders, mixes dissolves. Resumable.
- `build.py` joins `parts/*.py` into `scene.py`
- `export.mjs` + `web/` export your `story.js` from the browser: `frames.json`, character cards (`cards/*.webp`), textures (`tex/*.png`)

## Quick test (no story needed)
```
python build.py
blender -b -P scene.py -- --demo --out demo --aspect 16:9
```
Renders 6 stills of the example sets into `demo/`.

## Real video
1. Put your `story.js` (exports `TOTAL, SHOTS, XF, shotAt, camAt, dofAt, actorsAt`, each shot `{id, a, b, set}`) and the built `toon.js` in `web/`.
2. `node export.mjs data` (needs Node + `npm i playwright`).
3. Build your sets in `parts/d_sets_example.py` with the same `set` names and X offsets as your story.
4. `python build.py`, then run `RENDER_BLENDER.bat` (or `blender -b -P scene.py -- --data data --out frames --frames 0-N --resume`).
5. The .bat finishes with ffmpeg: soft face glow (screen blend 0.4), captions, sound mix.
