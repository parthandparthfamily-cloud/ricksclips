@echo off
cd /d "%~dp0"
echo ===== Blender render: frames on your GPU, then glow + captions + sound =====
set "LAST=449"
set "NAME=my_short"
where ffmpeg >nul 2>nul || (echo ffmpeg is missing. & pause & exit /b)
where python >nul 2>nul || (echo Python is missing. & pause & exit /b)
set "BL="
for /d %%D in ("C:\Program Files\Blender Foundation\*") do if exist "%%~D\blender.exe" set "BL=%%~D\blender.exe"
if exist "C:\Blender\blender.exe" set "BL=C:\Blender\blender.exe"
if not defined BL for /f "delims=" %%B in ('where blender 2^>nul') do set "BL=%%B"
if not defined BL (echo Could not find Blender. & pause & exit /b)
echo Using Blender: "%BL%"
python build.py
if not exist data\frames.json (
  where node >nul 2>nul || (echo Node.js is missing. & pause & exit /b)
  if not exist node_modules\playwright call npm i playwright@1.49.1
  echo Exporting characters and cameras... & node export.mjs data
)
echo Step 1/2: rendering frames 0-%LAST%. Safe to stop and re-run: it resumes where it left off.
"%BL%" -b -P scene.py -- --data data --out frames --frames 0-%LAST% --engine EEVEE --samples 16 --resume
if not exist frames\f%LAST%.jpg (echo. & echo RENDER STOPPED EARLY - screenshot the error above. Re-running this file resumes. & pause & exit /b)
if not exist Rendered mkdir Rendered
set "OUT=Rendered\%NAME%.mp4"
set /a N=1
:find
if not exist "%OUT%" goto go
set /a N+=1
set "OUT=Rendered\%NAME%_v%N%.mp4"
goto find
:go
echo Step 2/2: glow, captions and sound -^> %OUT%
ffmpeg -y -framerate 30 -i frames\f%%04d.jpg -i mix.wav -filter_complex "[0:v]format=gbrp,split[a][b];[b]curves=all='0/0 0.5/0 1/1',gblur=sigma=20[g];[a][g]blend=all_mode=screen:all_opacity=0.4,format=yuv420p,ass=captions.ass:fontsdir=fonts[v]" -map "[v]" -map 1:a -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart "%OUT%"
echo Done: %OUT%
pause
