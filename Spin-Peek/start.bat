@echo off
cd /d "%~dp0"
echo Spin ^& Peek prototype - http://127.0.0.1:5190/
echo (close this window to stop)
start "" http://127.0.0.1:5190/
echo Tablet/phone on the same Wi-Fi: http://[this PC IP]:5190/  (microphone works only on this PC or via HTTPS)
python -m http.server 5190 --bind 0.0.0.0
