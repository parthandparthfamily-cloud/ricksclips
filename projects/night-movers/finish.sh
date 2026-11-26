#!/bin/bash
# Join frames + face glow (screen 0.4) + captions + mix -> Rendered/<name>.mp4  (same chain as tools/RENDER.bat)
# usage: bash finish.sh <frames_dir> <mix.wav> <name>
set -e; cd "$(dirname "$0")"; mkdir -p Rendered; FR=$1; MIX=$2; NAME=$3
[ -e "Rendered/$NAME.mp4" ] && { echo "Rendered/$NAME.mp4 exists - never overwrite, pick a new name"; exit 1; }
ffmpeg -v error -y -framerate 30 -i "$FR/f%04d.jpg" -i "$MIX" -filter_complex "[0:v]format=gbrp,split[a][b];[b]curves=all='0/0 0.5/0 1/1',gblur=sigma=20[g];[a][g]blend=all_mode=screen:all_opacity=0.4,format=yuv420p,ass=captions.ass:fontsdir=../../tools/fonts[v]" -map "[v]" -map 1:a -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart "Rendered/$NAME.mp4"
echo "Rendered/$NAME.mp4"
