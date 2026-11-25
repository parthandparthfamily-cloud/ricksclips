# Working in this repo (instructions for Claude)

**RULEBOOK.md is mandatory: follow it 100% of the time unless the user explicitly says otherwise, and tick its PRE-DELIVERY CHECKLIST before anything ships.**

Read RULEBOOK.md, then docs/01, docs/05 and docs/07 (the measured 19-video Ricks study) before doing anything.
**Before any full render, run `python3 tools/study/qa_motion.py <preview.mp4>` and fix it until it passes.** Then:

1. **Style is locked.** Every character uses characters/rick.js in the approved Ricks-style look. Compare against
   reference/ricks-study/ before showing anything. Never fall back to the kit's default characters.
2. **New cast for every video.** Never reuse old characters. Show a design sheet before building the video.
3. **Something moves every frame.** Plan a word-by-word action timeline: every clause gets a story action and a camera move. Stack ≥ 4 of the
   7 motion layers per shot (docs/07 §3). Transitions are camera moves, and the composition changes every ≤ 2.2 s.
   No empty shots, no parked or slow straight-line camera, no hat-only or cropped-face frames, no over-zoom, no camera through walls.
4. **Check a still from the middle of every shot** before handing over a render package.
5. **ElevenLabs: one take, state the credit cost first, wait for an OK.**
6. **Render on the user's PC** (RENDER.bat). Cloud rendering is for stills and previews only.
7. **Real music/SFX** from the user's local sound folder, kept quiet under the voice, new music every video. Never clip words when trimming.
8. Visible-but-slight face glow (screen blend 0.4). Captions via tools/captions.py.
9. Keep working files per project in `<Projects>\<Project>\{Raw,Claude,Rendered}`; never overwrite a previous render.
10. Scripts are original. Use the triple hook (docs/03) and the Ricks formula (docs/02). Check the topic isn't already saturated with copycat videos.
11. Never commit API keys.
12. After each upload, add any new corrections to docs/05.
