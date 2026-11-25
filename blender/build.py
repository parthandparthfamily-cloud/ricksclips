# Joins blender/parts/*.py (in name order) into one scene.py that Blender runs.  python build.py [out=scene.py]
import glob, os, sys
here = os.path.dirname(os.path.abspath(__file__)); out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, 'scene.py')
parts = sorted(glob.glob(os.path.join(here, 'parts', '*.py')))
open(out, 'w', encoding='utf-8').write('\n'.join(open(p, encoding='utf-8').read() for p in parts))
print('built', out, 'from', len(parts), 'parts')
