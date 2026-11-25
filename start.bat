@echo off
cd /d "%~dp0"
echo Word ^& Think games (7) - http://127.0.0.1:5180/
echo (close this window to stop)
start "" http://127.0.0.1:5180/
echo Tablet/phone on the same Wi-Fi: http://[this PC IP]:5180/  (microphone works only on this PC or via HTTPS)
python -m http.server 5180 --bind 0.0.0.0
