@echo off
cd /d "%~dp0\.."
echo Photo Safari prototype - http://127.0.0.1:5196/Photo-Safari/
echo (close this window to stop)
start "" http://127.0.0.1:5196/Photo-Safari/
echo Tablet/phone on the same Wi-Fi: http://[this PC IP]:5196/Photo-Safari/  (microphone works only on this PC or via HTTPS)
python -m http.server 5196 --bind 0.0.0.0
