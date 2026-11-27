@echo off
cd /d "%~dp0"
rem ==== set these two per video ====
set LAST=2113
set NAME=village_built_for_an_audience_v1
rem =================================
where node >nul 2>nul || (echo Node.js is missing. Install the LTS version from nodejs.org, then run this again. & pause & exit /b)
where ffmpeg >nul 2>nul || (echo ffmpeg is missing. Open Command Prompt and run: winget install ffmpeg   then run this again. & pause & exit /b)
if not exist node_modules\playwright (
  echo Installing the renderer, one time only...
  call npm i playwright@1.49.1
)
echo Rendering frames 0-%LAST% on your GPU...
set RESUME=1
node render_pc.mjs frames 0-%LAST%
if not exist ..\Rendered mkdir ..\Rendered
echo Adding glow, captions and audio...
ffmpeg -y -framerate 30 -i frames\f%%04d.jpg -i mix.wav -filter_complex "[0:v]format=gbrp,split[a][b];[b]curves=all='0/0 0.5/0 1/1',gblur=sigma=20[g];[a][g]blend=all_mode=screen:all_opacity=0.4,format=yuv420p,ass=captions.ass:fontsdir=fonts[v]" -map "[v]" -map 1:a -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart ..\Rendered\%NAME%.mp4
echo.
echo Done: Rendered\%NAME%.mp4
pause
