import sys, json, glob, os, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=1)
os.makedirs("/root/rstudy/t", exist_ok=True)
for f in sorted(glob.glob("/root/rstudy/v/*.mp4")):
    n = os.path.basename(f)[:-4]; o = f"/root/rstudy/t/{n}.json"
    if os.path.exists(o): continue
    raw = subprocess.run(["ffmpeg","-v","error","-i",f,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
    segs, info = m.transcribe(np.frombuffer(raw,np.float32), word_timestamps=True, vad_filter=False, beam_size=5)
    words = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
    json.dump({"duration": info.duration, "words": words}, open(o, "w"))
    print(n, len(words), flush=True)
