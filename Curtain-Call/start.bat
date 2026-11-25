@echo off
cd /d "%~dp0"
echo Curtain Call prototype - http://127.0.0.1:5191/
echo (close this window to stop)
start "" http://127.0.0.1:5191/
echo Tablet/phone on the same Wi-Fi: http://[this PC IP]:5191/  (microphone works only on this PC or via HTTPS)
python -m http.server 5191 --bind 0.0.0.0
