# Ricks Clips Style Kit

Made by **@caesarscales** (X). Free and open source.

Everything needed to make YouTube Shorts in the Ricks Clips (@RicksClips3000) style with Claude: 2D bean-head characters
acting inside a detailed, inked 3D world, one continuous camera flight, narrated, captioned and rendered on a home PC.

It's built from a measured, frame-by-frame study of 19 Ricks Clips videos (~33,000 frames) and every lesson learned making
videos with it. Copy the *style*; write your own stories, scripts, characters and shots.

## Read first
| Doc | What |
|---|---|
| **[RULEBOOK.md](RULEBOOK.md)** | **The mandatory rules + pre-delivery checklist.** |
| [CLAUDE.md](CLAUDE.md) | Instructions for Claude sessions working in this repo |
| [docs/01_STYLE_BIBLE.md](docs/01_STYLE_BIBLE.md) | Locked character style, motion rules, camera, sets, glow, captions, audio |
| [docs/02_SCRIPT_WRITING.md](docs/02_SCRIPT_WRITING.md) | The Ricks script formula |
| [docs/03_HOOK_WRITING.md](docs/03_HOOK_WRITING.md) | Triple hook: context, lean, contrarian snapback |
| [docs/04_PIPELINE.md](docs/04_PIPELINE.md) | Script → voice → timing → captions → cast → world → stills → mix → PC render |
| [docs/05_LESSONS_AND_FEEDBACK.md](docs/05_LESSONS_AND_FEEDBACK.md) | Mistakes already made once, so they never happen twice |
| [docs/07_RICKS_DEEP_STUDY.md](docs/07_RICKS_DEEP_STUDY.md) | **Measured frame-by-frame study of 19 Ricks videos**: motion layers, camera, transitions, hooks, scripts, sound, targets |
| [docs/08_SET_QUALITY_CELYXI_STUDY.md](docs/08_SET_QUALITY_CELYXI_STUDY.md) | The set-quality bar: why detailed sets read as expensive |

QA: `python3 tools/study/qa_motion.py preview.mp4` checks a render against Ricks's measured motion targets. Study tools and raw data: `tools/study/`, `reference/ricks-study/data/`.

## Layout
```
characters/   rick.js (LOCKED renderer), rick_ext.js (extra outfits/hats/props), sheets/ (roster + reference sheets)
engine/web/   three.js world, ink/DOF/grade passes, motion helpers, toonbase; main_template.js
tools/        tts.py, tighten_voice.py, timing.py, captions.py, build_toon.py, new_project.py,
              render.mjs (cloud stills), render_pc.mjs + RENDER.bat (PC GPU render), sheet.py, fonts/
tools/study/  the measurement tools (motion, audio, transcripts) + the qa_motion gate
reference/    Ricks style study sheets and data, Celyxi set references, look-match reports, triple-hook transcript
kit/          the original cartoon-short-kit this grew out of
```

## Quick start
```bash
python3 tools/new_project.py my-video        # scaffold
# write projects/my-video/script.txt
python3 tools/tts.py projects/my-video/script.txt voice.mp3 --voice <ELEVENLABS_VOICE_ID>          # shows the credit cost
python3 tools/tts.py projects/my-video/script.txt voice.mp3 --voice <ELEVENLABS_VOICE_ID> --yes    # ONE take
python3 tools/tighten_voice.py voice.mp3 voice_tight.wav            # silence-only trimming
python3 tools/timing.py voice_tight.wav projects/my-video/script.txt --out projects/my-video/work
python3 tools/captions.py projects/my-video/work/words.json projects/my-video/captions.ass
python3 tools/build_toon.py projects/my-video
```
Then the world, story, stills check, mix and the PC render: see docs/04_PIPELINE.md.

Secrets: put `ELEVEN_API_KEY=...` in a local `.env` (git-ignored). Never commit keys.

The study material in `reference/` (frame sheets, transcripts) is for style study only; the videos belong to their creators.
Built on the cartoon-short-kit and github.com/mromidev/claude-animated-shorts (MIT).

## How a video is made
1. **Script**: pick the story and write it (docs/02, docs/03).
2. **Voice**: ElevenLabs via `tools/tts.py` (your own API key), then ffmpeg tightens pauses (`tools/tighten_voice.py`) without clipping words.
3. **Word timing**: Whisper (`tools/timing.py`) records when every word is said; everything is timed to it.
4. **Characters**: drawn with code on an HTML canvas (circles, lines, colours), not an AI image generator. Every pose is a flat cutout card.
5. **Frame plan**: three.js plans the camera path and where each character stands.
6. **3D world**: Python builds every set in Blender from simple shapes with cartoon light and an ink outline (`blender/`).
7. **Render**: EEVEE on your GPU, frame by frame, with the character cards placed in the 3D world.
8. **Sound**: real sound effects from free sites (Mixkit, Pixabay) on the exact frames where things happen.
9. **Captions**: `tools/captions.py` turns the word times into 1-2 word captions.
10. **Finish**: ffmpeg joins the frames, adds a soft glow, burns in captions and mixes the sound.
11. **One click**: the heavy steps run on your PC from a .bat file, not in the cloud.
