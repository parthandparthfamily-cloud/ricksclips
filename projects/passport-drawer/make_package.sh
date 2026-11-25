#!/bin/bash
# Builds package/ = the folder you copy to <Projects>\PassportDrawer\Claude\ on the render PC, then double-click RENDER.bat.
set -e; cd "$(dirname "$0")"
rm -rf package/web package/fonts; mkdir -p package/web/lib package/web/fonts package/fonts
cp web/index.html web/main.js web/kit3d.js web/sets.js web/story.js web/toon.js web/paint.js web/cast_sheet.js package/web/
cp web/lib/three.module.js package/web/lib/; cp web/fonts/LilitaOne.ttf package/web/fonts/; cp ../../tools/fonts/LilitaOne.ttf package/fonts/
sed "s|p.endsWith('.js') ? 'text/javascript' : 'text/html'|p.endsWith('.js') ? 'text/javascript' : p.endsWith('.ttf') ? 'font/ttf' : 'text/html'|" ../../tools/render_pc.mjs > package/render_pc.mjs; cp captions.ass package/
sed -e 's/^set LAST=.*/set LAST=2457/' -e 's/^set NAME=.*/set NAME=passport_drawer_v1/' ../../tools/RENDER.bat > package/RENDER.bat
# never overwrite an older render: bump the name if it already exists
python3 - <<'PY'
p='package/RENDER.bat'; s=open(p).read()
s=s.replace('if not exist ..\\Rendered mkdir ..\\Rendered', 'if not exist ..\\Rendered mkdir ..\\Rendered\nset N=2\n:bump\nif exist ..\\Rendered\\%NAME%.mp4 (set NAME=passport_drawer_v%N%& set /a N+=1& goto bump)')
s=s.replace('node render_pc.mjs frames 0-%LAST%', 'node render_pc.mjs frames 0-%LAST%\nfor /f %%i in (\'dir /b frames\\*.jpg ^| find /c /v ""\') do set COUNT=%%i\nif not "%COUNT%"=="2458" (echo Only %COUNT% of 2458 frames rendered. Run RENDER.bat again to resume. & pause & exit /b)')
open(p,'w').write(s.replace('\n','\r\n'))
PY
[ -f package/mix.wav ] || echo "WARNING: package/mix.wav missing"
echo "package ready: $(du -sh package | cut -f1)"
