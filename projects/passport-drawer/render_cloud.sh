#!/bin/bash
# Cloud render (no GPU needed): full 1080x1920 frames from package/web, then glow + captions + mix, like RENDER.bat.
cd "$(dirname "$0")/package"
export RESUME=1 QUAL=0.95
for r in 0-614 615-1229 1230-1844 1845-2457; do node ../../../tools/stills.mjs web frames $r "" > render_$r.log 2>&1 & done
wait
n=$(ls frames/f*.jpg | wc -l); echo "frames: $n"; [ "$n" = 2458 ] || { echo "incomplete, run again to resume"; exit 1; }
mkdir -p ../Rendered; name=passport_drawer_v1; k=2; while [ -e ../Rendered/$name.mp4 ]; do name=passport_drawer_v$k; k=$((k+1)); done
ffmpeg -y -v error -framerate 30 -i frames/f%04d.jpg -i mix.wav -filter_complex "[0:v]format=gbrp,split[a][b];[b]curves=all='0/0 0.5/0 1/1',gblur=sigma=20[g];[a][g]blend=all_mode=screen:all_opacity=0.4,format=yuv420p,ass=captions.ass:fontsdir=fonts[v]" -map "[v]" -map 1:a -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart ../Rendered/$name.mp4
echo "DONE ../Rendered/$name.mp4"
