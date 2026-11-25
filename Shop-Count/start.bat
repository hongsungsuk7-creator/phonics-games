@echo off
cd /d "%~dp0\.."
echo Shop ^& Count prototype - http://127.0.0.1:5194/Shop-Count/
echo (close this window to stop)
start "" http://127.0.0.1:5194/Shop-Count/
echo Tablet/phone on the same Wi-Fi: http://[this PC IP]:5194/Shop-Count/  (microphone works only on this PC or via HTTPS)
python -m http.server 5194 --bind 0.0.0.0
