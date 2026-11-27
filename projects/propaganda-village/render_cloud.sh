#!/bin/bash
# Full-res cloud render (user asked for a cloud render this time): 3 parallel renderers, then glow + captions + mix.
set -e
cd "$(dirname "$0")"
P=$(pwd); OUT=$P/Rendered/frames; mkdir -p $OUT
cd ../../tools
for r in 0-704 705-1409 1410-2113; do RESUME=1 WEB=$P/web node render.mjs $OUT $r 1 0.95 > $P/work/final_$r.log 2>&1 & done
wait
n=$(ls $OUT | wc -l); echo "frames: $n"
cd $P/Claude
NAME=village_built_for_an_audience_v1
ffmpeg -y -v error -framerate 30 -i $OUT/f%04d.jpg -i mix.wav -filter_complex "[0:v]format=gbrp,split[a][b];[b]curves=all='0/0 0.5/0 1/1',gblur=sigma=20[g];[a][g]blend=all_mode=screen:all_opacity=0.4,format=yuv420p,ass=captions.ass:fontsdir=fonts[v]" -map "[v]" -map 1:a -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -shortest $P/Rendered/$NAME.mp4
echo done $P/Rendered/$NAME.mp4
