# THE RICKS CLIPS STYLE RULEBOOK

**Follow 100% of the time, on every video, unless you explicitly decide otherwise for that video.**
Distilled from two frame-by-frame passes over 19 Ricks Clips videos (~33,000 frames, all measured), his channel's view data,
and every correction made along the way. Evidence and numbers: docs/07. If a rule here conflicts with any other doc, this file wins.

Every video must pass the **PRE-DELIVERY CHECKLIST** at the bottom before anything goes to the render PC.

---

## A. IDEA AND TITLE (this decides 4M vs 32M, not the craft)
1. **Never an explainer.** Every video is a STORY: a specific person, a clever trick or loophole, and a twist. ("The Science Behind Slot Machines" got 123K; "Why Cashiers Keep Winning The Lottery" got 8M.)
2. Stay in the money lane where his hits cluster: cons, gambling, lotteries, betting, heists, loopholes, scams, fortunes. Clever-old-tech and psychology stories are fine as long as they have a person and a trick.
3. **Title test**: write 3 titles using a hit pattern and pick the most impossible-sounding one. If it could be a school lesson, rewrite it.
   - "The [specific object/person] That [did something impossible]"
   - "Why [perfect/obvious thing] Doesn't Work"
   - "The [job/place/rule] Nobody [expected]"
   - "Why [group] [did an odd thing]"
   - "The [X] That Breaks [a law/rule]"
4. Before writing, search YouTube for the topic. If copycat videos already exist, find a fresher angle or another story.

## B. SCRIPT
5. **Hook (sentence 1, about 3 s, 8–20 words)** uses one formula: action + absurd detail / paradox / "you" challenge / rule-legend. It must pass the triple hook: context, lean, snapback (docs/03).
6. Skeleton: hook → "You see," context → the hero gets mocked in short quoted joke lines → time-marker escalation → a "Wait, …?" beat → twist → "You see," + one everyday analogy → final physical image that calls back to the hook. **No CTA.**
7. A joke about every 10 s (hyperbolic comparisons). Present tense. Use "you" where possible. Specific numbers everywhere.
8. 145–250 words, about 3.7 words/s, 40–65 s (longer only if the story truly needs it).
9. **Every clause must be actable**: a verb a character can do or a thing the camera can show. Rewrite abstract sentences.
10. Explain how the conflict started. Never let the ending drag.
11. Use v3 audio tags for expressiveness ([excited], [whispers], [amazed], questions). Aim for a lively, ~12-semitone delivery, not a monotone.

## C. VOICE AND AUDIO
12. **ElevenLabs: one take only. State the credit cost first and wait for an OK.**
13. Tighten with silence-only trimming (tools/tighten_voice.py). **Never clip a word.** The video may run longer instead.
14. Compress the voice (~3:1, 5–6 dB loudness range) so every word is equally present.
15. Music: a real downloaded track (new one every video), light/playful, continuous, mood shift at the twist, **~20 dB under the voice**.
16. SFX: real files only, **~8 hits per 10 s, ~12 dB under the voice**. Whooshes on camera moves, chimes/glock on reveals, cartoon foley locked to actions (squeaks, bloops, scrapes, thuds, register dings). About 1 in 3 scene changes gets a hit.
17. Master to -14 LUFS, true peak -2 dBTP. End about 0.3 s after the last word.

## D. CHARACTERS AND CAST
18. Locked style only (characters/rick.js): white round head, thick dark-brown brush outline, pear body, chunky limbs, expressive Ricks faces, brows always visible, hats worn on the crown.
19. **New cast every video.** Show a design sheet and get an OK before building.
20. **Faces stay PURE WHITE in every scene.** Characters are rendered unlit (white base + fixed soft shade). Scene lights, tints and color grades never touch characters.
21. Extras: **3+ characters on screen in ≥ 25% of frames** (crowds, rivals, witnesses). Every shot has someone who can react.
22. Visible-but-slight face glow (screen blend 0.4).
22b. **ONLY the characters are 2D cards. EVERYTHING else is real 3D geometry with the ink outline**: coins, chips, banknotes, paper, smoke, dust puffs,
    sweat drops, sparkles, flies/bugs, lamps, props, signs, "!" marks, energy rings, confetti. No flat 2D stickers/particles, ever.

## E. MOTION: SOMETHING HAPPENS EVERY FRAME
23. Build a **word-by-word action timeline** first: every clause gets (a) a story action and (b) a camera move. No clause without both.
24. Every shot stacks **at least 4 of the 7 layers, always including A or D, plus F and G**:
    - **A. Story action**: the character does exactly what the narrator says, ON that word.
    - **B. Face**: the expression changes every 0.3–0.8 s based on meaning; eyes dart; blinks; mouth flaps on quoted lines.
    - **C. Body**: sway, weight shifts, fidgets, props in hand move.
    - **D. Reactors**: others laugh, lean in, walk in, point, fall over.
    - **E. Props/FX**: sparks, glints, pours, smoke, steam, glow-ups, paper flutter, impacts, money raining.
    - **F. Living environment**: water, weather, flames, clocks, birds/bugs, smoke, twinkles, crowds. Always on.
    - **G. Parallax**: foreground objects close to the lens while the camera glides.
25. Something new starts about every 1 s (a gesture, an entrance, an FX pop, a prop move).
26. **No procedural wiggle as a substitute for acting.** No beat-pulsed nods or hops on syllables (his motion is measured flat around words).
27. Every noun and verb in the narration gets a visual. Abstract ideas become **labelled physical props** (a box labelled "LAW").

## F. CAMERA AND TRANSITIONS
28. **One continuous flight.** The camera moves on ≥ 83% of frames and never parks. A fast eased move (0.3–0.6 s) brings in each composition, then a slow drift with ±1–3° roll. Add subtle handheld noise, plus a real shake on impacts.
29. **New composition every ≤ 2.2 s**, done with camera moves, not cuts. **Hard cuts ≤ 2 per video, on a word onset.**
30. Transition toolkit (rotate them):
    - moving dissolve (6–10 f, both shots moving the same way)
    - pull-back reveal from a macro detail
    - tilt-up reveal (detail → face)
    - follow the object
    - orbit
    - foreground wipe
    - push through a door/window or into an object
    - look-through iris (mirror, porthole)
    - speed whip with motion blur
    - X-ray/cutaway dive
31. Alternate scale: macro → wide → face. Never two medium shots in a row. Typical head size is small (~7% of frame width); save big close-ups for reactions and punchlines.
32. **No body-part-only frames** (feet, legs, torso with no face): every frame shows a face or a named story object in action, with context around it (Ricks never does this).
    No hat-only or cropped-face frames, no over-zoom, no slow straight-line moves, and never an empty set. A no-face frame is allowed only as a macro of a named object doing something, inside a move that returns to a character.
33. White flashes: 0–1 per video, only for literal light (explosion, lightning).

## G. LOOK AND WORLD
34. Bright overall (target brightness ≈ 0.64). Night = saturated readable blue, not dark grey.
35. **≥ 4 distinct hue families per frame** (complementary accents in costumes, props and signs). Never a one-color grade or a heavy orange tint.
36. Dense, detailed, inked 3D sets. Backgrounds readable but softened by depth of field, never empty dark voids.
37. **3–6 in-world signs/labels per video** that carry a joke or a fact.
38. Captions: 1–2 words, Lilita One, white with a black outline, centred at y ≈ 1250–1350 of 1920 (tools/captions.py).

## H. STRUCTURE BEATS ON SCREEN
39. **Hook frame 0 = the hook happening**, the camera already moving fast, and a second visual beat (reveal, impact, glow, follow) by 2.5 s. Never an establishing shot.
40. **"You see," explanations stay physical**: a mechanism tour, the hero demonstrating, metaphor props, a flashback reenactment in a new set, or the camera diving into what's described. Never a talking head.
41. **Ending = the biggest spectacle of the video**, then reaction faces or an ironic sign, then cut ~0.3 s after the last word.

## I. PROCESS
42. Render on your own PC (RENDER.bat). The cloud is only for checking stills and previews.
43. Before the package goes out: render a still from the middle of EVERY shot, check the contact sheet, and run the QA gate on a preview.
44. Files: `<Projects>\<Project>\{Raw,Claude,Rendered}`, voiceovers also in a `Voiceovers` folder, never overwrite a previous render (name it _v2, _v3).
45. Never take the easy route. If a shot feels flat, add story actions, reactors, FX, environment and parallax, not more camera wiggle.
46. After each upload: log the stats and a diagnosis in docs/06, add corrections to docs/05, and update this rulebook if a rule changes.
47. Private tool: never copy into the public skill. Never commit API keys.

---

## PRE-DELIVERY CHECKLIST (all must be YES)
- [ ] Story with a person, a trick and a twist, not an explainer; the title passes the title test (A1–A4)
- [ ] The hook passes the triple hook and the visual hook rule (B5, H39)
- [ ] Every clause has a story action + camera move on the timeline (E23)
- [ ] Every shot has ≥ 4 motion layers incl. A/D + F + G (E24)
- [ ] New cast approved; faces pure white; extras in ≥ 25% of frames (D19–D21)
- [ ] Only characters are 2D; every particle/prop/FX is real 3D (D22b); no feet/legs/body-only frames (F32)
- [ ] ≥ 4 hue families, bright, 3–6 in-world signs (G34–G37)
- [ ] Mid-shot stills of EVERY shot checked: no empty, cropped, hat-only or over-zoomed frames (I43)
- [ ] `python3 tools/study/qa_motion.py preview.mp4` → **PASS** (≥ 95% moving, ≤ 4.5% dead, longest dead ≤ 0.7 s, moving area ≥ 30%, composition change ≤ 2.2 s, ≤ 2 hard cuts)
- [ ] Audio: one voice take, compressed, music ~20 dB under, ~8 SFX per 10 s at ~-12 dB, -14 LUFS, no clipped words
- [ ] Ending = spectacle + reaction/sign, cut ~0.3 s after the last word
- [ ] Output named so nothing old is overwritten

## 48. Nothing ships without the full gate
Before any RENDER.bat goes to the PC:
- (a) a low-res moving proxy of the WHOLE video passes `qa_motion.py`
- (b) no motion is quantised coarser than 0.02
- (c) every set has had a detail pass and is compared side by side with Ricks frames
- (d) every new voice was auditioned and approved
- (e) the pre-delivery checklist is ticked line by line

"Go" or "run it" does not skip this.

## 49. THE SETS ARE THE MAIN ATTRACTION
Sets must be as detailed as possible. Never slack off on the sets. The bar is docs/08 (Celyxi study). Every set must have:
- real architecture (trim, mullions, siding, porches)
- a textured ground with 3D clutter
- props in every corner
- something alive (animals, birds, people)
- haze and depth of field
- story-driven light or weather

Every "it's like…" analogy is shown as its own designed character and set. Compare stills side by side with `reference/celyxi/` before approving.

## 50. Fresh background music every video
Never reuse a music track from a previous video. Keep a music log (video → track → licence) and check it before every mix.
- Pick a NEW track that fits the story's mood (casino = swing/jazz, heist = sneaky pizzicato, business rise = upbeat funk, etc.).
- If nothing in your folder fits, find 3 free-licence options (Pixabay / Mixkit / Freesound CC), pick one, and add it to the folder.
- Credit CC BY tracks in the description.
- The music can change mood at the twist (two cues) instead of one loop the whole way.

## 51. Every camera key stays inside the set
A camera fitted to "include everyone" can fly backwards through a wall or above a ceiling. Clamp every camera key inside the set's
walls and ceiling, and scan every frame for it before rendering.
