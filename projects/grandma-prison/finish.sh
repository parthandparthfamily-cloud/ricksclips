#!/bin/bash
# ./finish.sh <framesdir> <out.mp4>  — glow (screen 0.4), captions (Lilita One), mix.wav. Refuses to overwrite.
set -e; FR=$1; OUT=$2
[ -e "$OUT" ] && { echo "refusing to overwrite $OUT"; exit 1; }
ffmpeg -v error -y -framerate 30 -i "$FR/f%04d.jpg" -i mix.wav -filter_complex "[0:v]scale=1080:1920:flags=lanczos,format=gbrp,split[a][b];[b]curves=all='0/0 0.5/0 1/1',gblur=sigma=20[g];[a][g]blend=all_mode=screen:all_opacity=0.4,format=yuv420p,ass=captions.ass:fontsdir=fonts[v]" -map "[v]" -map 1:a -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
