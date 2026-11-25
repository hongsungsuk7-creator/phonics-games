@echo off
cd /d "%~dp0\.."
echo Little Detective prototype - http://127.0.0.1:5193/Little-Detective/
echo (close this window to stop)
start "" http://127.0.0.1:5193/Little-Detective/
echo Tablet/phone on the same Wi-Fi: http://[this PC IP]:5193/Little-Detective/  (microphone works only on this PC or via HTTPS)
python -m http.server 5193 --bind 0.0.0.0
