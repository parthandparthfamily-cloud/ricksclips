"""Start a new video: python3 tools/new_project.py <slug>
Creates projects/<slug>/ with web/ (engine files + the latest main.js as a template), script.txt, and a cast file stub.
Then: replace the world section in web/main.js (between `// ---------- world ----------` and `// ---------- cards ----------`),
write web/story.js (see kit/example/soldier/story.js for the pattern),
design a NEW cast in <slug>_cast.js (never reuse old characters), run tools/build_toon.py projects/<slug>.
"""
import sys, os, shutil
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug = sys.argv[1]; p = os.path.join(root, "projects", slug); w = os.path.join(p, "web")
os.makedirs(w, exist_ok=False)
for f in os.listdir(os.path.join(root, "engine/web")):
    s = os.path.join(root, "engine/web", f)
    (shutil.copytree if os.path.isdir(s) else shutil.copy)(s, os.path.join(w, f))
shutil.copy(os.path.join(root, "engine/web/main_template.js"), os.path.join(w, "main.js"))
shutil.copy(os.path.join(root, "kit/example/soldier/story.js"), os.path.join(w, "story_reference.js"))
open(os.path.join(p, "script.txt"), "w").write("")
open(os.path.join(p, f"{slug}_cast.js"), "w").write("// New outfits/hats/props for this video's cast go here (OUTFIT.x = ..., HATS.x = ..., PROPS.x = ...)\n\nexport const CAST = {};\n")
print("created", p)
