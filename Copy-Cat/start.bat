@echo off
cd /d "%~dp0\.."
echo Copy Cat prototype - http://127.0.0.1:5192/Copy-Cat/
echo (close this window to stop)
start "" http://127.0.0.1:5192/Copy-Cat/
echo Tablet/phone on the same Wi-Fi: http://[this PC IP]:5192/Copy-Cat/  (microphone works only on this PC or via HTTPS)
python -m http.server 5192 --bind 0.0.0.0
