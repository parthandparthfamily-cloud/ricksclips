#!/bin/bash
# finish.sh <frames_dir> <mix.wav> <captions.ass> <out.mp4> [scale]  — glow (screen 0.4) + captions + audio, like RENDER.bat
set -e
F=$1; A=$2; C=$3; O=$4; S=${5:-1}
W=$(python3 -c "print(round(1080*$S))"); H=$(python3 -c "print(round(1920*$S))")
ffmpeg -y -v error -framerate 30 -i "$F/f%04d.jpg" -i "$A" -filter_complex "[0:v]scale=1080:1920:flags=lanczos,format=gbrp,split[a][b];[b]curves=all='0/0 0.5/0 1/1',gblur=sigma=20[g];[a][g]blend=all_mode=screen:all_opacity=0.4,format=yuv420p,ass=$C:fontsdir=$(dirname $0)/Claude/fonts[v]" -map "[v]" -map 1:a -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart "$O"
echo "wrote $O"
