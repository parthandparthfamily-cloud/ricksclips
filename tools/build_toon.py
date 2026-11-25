"""Bundle the character code into web/toon.js for a project.

Usage: python3 tools/build_toon.py projects/<name>   (expects projects/<name>/web/ and optional projects/<name>/<name>_cast.js)

toon.js = engine/web/toonbase.js + characters/rick.js + characters/rick_ext.js + the project's cast file
(cut before `export const CAST`, which is only for the design sheet).
Re-run after ANY edit to rick.js / rick_ext.js / the cast file, or the render uses stale characters.
"""
import sys, os, glob

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
proj = os.path.abspath(sys.argv[1])
parts = [open(os.path.join(root, "engine/web/toonbase.js")).read(),
         open(os.path.join(root, "characters/rick.js")).read(),
         open(os.path.join(root, "characters/rick_ext.js")).read()]
for cast in glob.glob(os.path.join(proj, "*_cast.js")):
    c = open(cast).read(); parts.append(c[: c.index("export const CAST")] if "export const CAST" in c else c)
open(os.path.join(proj, "web/toon.js"), "w").write("\n".join(parts))
print("wrote", os.path.join(proj, "web/toon.js"))
