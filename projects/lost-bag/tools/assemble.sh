#!/bin/bash
# frames -> face glow (screen 0.4) -> captions -> audio.  usage: tools/assemble.sh <framesdir> <out.mp4> [scale]
set -e; FR=$1; OUT=$2; SC=${3:-1}
W=$(python3 -c "print(round(1080*$SC))"); H=$(python3 -c "print(round(1920*$SC))")
ffmpeg -y -v error -framerate 30 -i "$FR/f%04d.jpg" -i work/mix.wav -filter_complex \
 "[0:v]scale=1080:1920:flags=lanczos,format=gbrp,split[a][b];[b]curves=all='0/0 0.5/0 1/1',gblur=sigma=20[g];[a][g]blend=all_mode=screen:all_opacity=0.4,format=yuv420p,ass=work/captions.ass:fontsdir=work/fonts[v]" \
 -map "[v]" -map 1:a -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
