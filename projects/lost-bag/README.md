# Your Lost Bag Isn't Lost

Voice: the supplied ElevenLabs take (`raw/voiceover.mp3`), timed with the supplied word timestamps (`raw/script.json`, no Whisper).

## Build
```
python3 ../../tools/build_toon.py .                       # characters -> web/toon.js
node tools/render.mjs proxy/all 0-1964 1 0.3334 0.85       # low-res proxy for the QA gate
python3 ../../tools/study/qa_motion.py proxy.mp4
python3 tools/mix.py                                       # work/mix.wav (-14 LUFS, -2 dBTP)
node tools/render.mjs frames 0-1964 1 1                    # full-res frames (cloud swiftshader or PC)
tools/assemble.sh frames rendered/lost_bag_v1.mp4          # glow 0.4 + captions + audio
```

## Files
- `lostbag_cast.js` – new cast (hero, Doreen the desk agent, kiosk seller, 4 call-centre agents, Hank the warehouse guy, Earl the stranger, travellers, shoppers)
- `web/world.js` – six inked 3D sets: airport baggage hall, apartment, call centre, airline warehouse, Alabama town + store exterior, outlet store interior
- `web/story.js` – 58 compositions, word-timed actions, camera keys, transitions
- `tools/mix.py` – SFX cue table + music + mastering

## Credits (put in the description)
Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 —
"Sergio's Magic Dustbin" and "Hillbilly Swing".
Sound effects: CC0 (BigSoundBank / OpenGameArt via the free-sfx-download and free-sale-sounds packs).

## Music log
lost-bag → "Sergio's Magic Dustbin" (to 45.7 s) + "Hillbilly Swing" (from the twist) → CC BY 4.0
