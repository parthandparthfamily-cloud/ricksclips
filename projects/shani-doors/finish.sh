#!/bin/bash
# frames -> glow (screen 0.4) -> captions -> mix  => Rendered/<name>.mp4  (never overwrites: _v2, _v3...)
cd "$(dirname "$0")"; NAME=${1:-the_village_with_no_doors}; OUT=Rendered/$NAME.mp4; v=2
while [ -e "$OUT" ]; do OUT=Rendered/${NAME}_v$v.mp4; v=$((v+1)); done
mkdir -p Rendered
ffmpeg -v error -y -framerate 30 -i work/final/f%04d.jpg -i work/mix.wav -filter_complex \
 "[0:v]format=gbrp,split[a][b];[b]curves=all='0/0 0.5/0 1/1',gblur=sigma=20[g];[a][g]blend=all_mode=screen:all_opacity=0.4,format=yuv420p,ass=work/captions.ass:fontsdir=../../tools/fonts[v]" \
 -map "[v]" -map 1:a -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT" && echo "$OUT"
